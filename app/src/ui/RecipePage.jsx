import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { buildFigures } from '../domain/figures.js';
import { createBatch, addTasting, recordAmendment, latestChurnDate, formatRecordDate } from '../domain/batch.js';
import { IngredientTable } from './IngredientTable.jsx';
import { Method } from './Method.jsx';
import { Authored } from './Authored.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';
import { BatchMargin } from './BatchMargin.jsx';

// D-24's dirty check: true only while recording holds ink the maker has
// actually typed. Every field is tested against '' / {} rather than
// truthiness, so a written 0 (draft.overrunPercent === '0') still counts as
// dirty — matching the presence-over-truthiness discipline domain/batch.js
// already applies to the stored record.
function isDraftDirty(mode, draft) {
  if (mode !== 'recording' || !draft) return false;
  return (
    draft.churnDate !== '' ||
    Object.keys(draft.asMade).length > 0 ||
    Object.keys(draft.stepChanges).length > 0 ||
    draft.comeUpMinutes !== '' ||
    draft.drawTempC !== '' ||
    draft.overrunPercent !== '' ||
    draft.drawNotes !== '' ||
    draft.ingredientNotes !== '' ||
    draft.nextTimeNote !== ''
  );
}

// The same presence-over-truthiness dirty check, extended to an
// in-progress tasting (D-24's "unsaved ink" applies to a tasting draft
// exactly as it does to the churn draft above).
function isTastingDraftDirty(tastingDraft) {
  if (!tastingDraft) return false;
  return (
    tastingDraft.date !== '' ||
    Object.keys(tastingDraft.marks).length > 0 ||
    tastingDraft.tastingTempC !== '' ||
    tastingDraft.meltdownLossG !== '' ||
    tastingDraft.words !== '' ||
    tastingDraft.nextTimeNote !== ''
  );
}

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. The advisory slot in the margin renders nothing
// visible until the plan that fills it lands — no placeholder text.
export function RecipePage() {
  const { id, batchId } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState(undefined);
  const [batches, setBatches] = useState([]);
  // The signature trace (route-recipe.md § 3, § 5): focusing a balance
  // figure marks the ingredient rows it rests on. This page is the shared
  // parent of the figures and the table, so it is the one place the
  // focused figure's key can live.
  const [focusedFigureKey, setFocusedFigureKey] = useState(null);
  // The pen layer's state (route-recipe-batch.md § 3): a mode, either
  // 'reading' or 'recording', and the draft form state it is recorded
  // into. mode is never derived from the URL — only the margin's own
  // control asks for it (D-19).
  const [mode, setMode] = useState('reading');
  const [draft, setDraft] = useState(null);
  // The in-progress tasting's own draft state, alongside the churn draft
  // above (task 1). A tasting is added to an already-saved batch, so this
  // is independent of `mode`/`draft`, which are the churn recording state.
  const [tastingDraft, setTastingDraft] = useState(null);
  // Non-null while `mode === 'recording'` means the pen layer is amending
  // this existing batch's churn fields, rather than recording a new one
  // (task 3, D-06). Amending pre-fills the fields from the batch, never
  // from the version, and saving calls recordAmendment, never createBatch.
  const [amendingBatchId, setAmendingBatchId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    repository.getVersion(id).then((result) => {
      if (!cancelled) setVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    repository.listBatchesForVersion(id).then((result) => {
      if (!cancelled) setBatches(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // D-24: leaving the page with unsaved ink uses the browser's own leave
  // warning only, registered while recording holds a dirty draft and
  // removed as soon as it does not — no invented dialog, no draft
  // persistence across a reload (that is UX1-02, Phase 4).
  useEffect(() => {
    if (!isDraftDirty(mode, draft) && !isTastingDraftDirty(tastingDraft)) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mode, draft, tastingDraft]);

  if (version === undefined) return null;
  if (version === null) return <p>No recipe found for this version.</p>;

  const hasRows = version.rows.length > 0;
  const figures = buildFigures(version);
  const focusedFigure = figures.find((figure) => figure.key === focusedFigureKey) ?? null;
  const markedRowIds = focusedFigure?.contributorRowIds ?? [];
  const markedFigureLabel = focusedFigure?.label ?? '';

  // The batch this page shows: the one the URL names, or — with no batch
  // named in the URL — the version's most recent batch by churn date,
  // undated last, or null when the version has no batch yet.
  let openBatch = null;
  if (batchId) {
    openBatch = batches.find((batch) => batch.id === batchId) ?? null;
  } else if (batches.length > 0) {
    const sorted = [...batches].sort((a, b) => {
      const aDate = a.churn.churnDate;
      const bDate = b.churn.churnDate;
      if (aDate === bDate) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      return aDate < bDate ? 1 : -1;
    });
    openBatch = sorted[0];
  }

  function handleStartRecording() {
    setDraft({
      churnDate: '',
      asMade: {},
      stepChanges: {},
      comeUpMinutes: '',
      drawTempC: '',
      overrunPercent: '',
      drawNotes: '',
      ingredientNotes: '',
      nextTimeNote: '',
    });
    setMode('recording');
  }

  // A generic setter for the churn section's remaining fields (D-17, D-18):
  // each stores the raw string the maker typed while recording, exactly as
  // the as-made column already does, so the maker's typed precision is
  // never lost to an early Number() coercion — the conversion (and the
  // '' -> null discipline) happens once, at save time.
  function handleChangeChurnField(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Clearing both the strike and the line for a step removes that step's
  // key from the draft entirely (D-13/BATCH1-01): an untouched step must
  // never rest at { struck: false, line: null }, which would be
  // indistinguishable from a step the maker deliberately marked as
  // unchanged — a fact this record never states.
  function handleChangeStepChange(stepNumber, patch) {
    setDraft((prev) => {
      const stepChanges = { ...prev.stepChanges };
      const key = String(stepNumber);
      if (!patch.struck && !patch.line) {
        delete stepChanges[key];
      } else {
        stepChanges[key] = { struck: patch.struck, line: patch.line };
      }
      return { ...prev, stepChanges };
    });
  }

  function handleChangeChurnDate(value) {
    setDraft((prev) => ({ ...prev, churnDate: value }));
  }

  function handleChangeAsMade(rowId, rawValue) {
    setDraft((prev) => {
      const asMade = { ...prev.asMade };
      if (rawValue === '') {
        delete asMade[rowId];
      } else {
        asMade[rowId] = rawValue;
      }
      return { ...prev, asMade };
    });
  }

  // "Amend" reopens the pen layer with the record's own values in the
  // fields — the as-made column, the step strikes and lines, and the
  // churn section, all pre-filled from the batch, never from the version
  // (task 3). Every draft field is the string form the recording inputs
  // already expect, matching handleStartRecording's shape.
  function handleStartAmending(batch) {
    const asMade = {};
    for (const [rowId, value] of Object.entries(batch.churn.asMade)) {
      asMade[rowId] = String(value);
    }
    const toDraftString = (value) => (value == null ? '' : String(value));
    setDraft({
      churnDate: batch.churn.churnDate ?? '',
      asMade,
      stepChanges: structuredClone(batch.churn.stepChanges),
      comeUpMinutes: toDraftString(batch.churn.comeUpMinutes),
      drawTempC: toDraftString(batch.churn.drawTempC),
      overrunPercent: toDraftString(batch.churn.overrunPercent),
      drawNotes: batch.churn.drawNotes ?? '',
      ingredientNotes: batch.churn.ingredientNotes ?? '',
      nextTimeNote: batch.churn.nextTimeNote ?? '',
    });
    setAmendingBatchId(batch.id);
    setMode('recording');
  }

  // The two impure calls (a fresh id, the current instant) live here, in
  // the one save handler — every domain function stays deterministic.
  // Amending (amendingBatchId set) calls recordAmendment on the batch
  // being amended instead of createBatch — a correction is never a new
  // event and never retakes the snapshot (D-06).
  function handleSaveBatch() {
    // Non-numeric ink (a stray letter, a lone space) is dropped rather than
    // persisted — a row that fails to parse is treated the same as a row
    // the maker never touched, never as a stored NaN (D-11, D-18).
    const asMade = {};
    for (const [rowId, rawValue] of Object.entries(draft.asMade)) {
      const parsed = Number(rawValue);
      if (Number.isFinite(parsed)) asMade[rowId] = parsed;
    }
    const toNumberOrNull = (raw) => (raw === '' ? null : Number(raw));
    const toTextOrNull = (raw) => (raw === '' ? null : raw);
    const churnFields = {
      churnDate: draft.churnDate === '' ? null : draft.churnDate,
      asMade,
      stepChanges: draft.stepChanges,
      comeUpMinutes: toNumberOrNull(draft.comeUpMinutes),
      drawTempC: toNumberOrNull(draft.drawTempC),
      overrunPercent: toNumberOrNull(draft.overrunPercent),
      drawNotes: toTextOrNull(draft.drawNotes),
      ingredientNotes: toTextOrNull(draft.ingredientNotes),
      nextTimeNote: toTextOrNull(draft.nextTimeNote),
    };

    if (amendingBatchId) {
      const batchBeingAmended = batches.find((batch) => batch.id === amendingBatchId);
      const amendedAt = new Date().toISOString().slice(0, 10);
      const record = recordAmendment(batchBeingAmended, churnFields, amendedAt);
      repository.saveBatch(record).then(() => {
        setBatches((prev) => prev.map((batch) => (batch.id === record.id ? record : batch)));
        setMode('reading');
        setDraft(null);
        setAmendingBatchId(null);
      });
      return;
    }

    const record = createBatch(version, churnFields, { id: crypto.randomUUID(), now: new Date().toISOString() });

    repository.saveBatch(record).then(() => {
      setBatches((prev) => [...prev, record]);
      setMode('reading');
      setDraft(null);
      navigate(`/recipe/${id}/batch/${record.id}`);
    });
  }

  function handleStartTasting() {
    setTastingDraft({
      date: '',
      tastingTempC: '',
      marks: {},
      meltdownLossG: '',
      words: '',
      nextTimeNote: '',
    });
  }

  function handleChangeTastingField(field, value) {
    setTastingDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Marking an axis writes the stop's numeric value under its mark key
  // (D-16); there is no control to clear a mark once set, matching native
  // grouped radios' own behavior — an axis simply stays unmarked until
  // the maker clicks a stop.
  function handleChangeTastingMark(axisKey, stop) {
    setTastingDraft((prev) => ({ ...prev, marks: { ...prev.marks, [axisKey]: stop } }));
  }

  // D-05's shortcut: writes exactly those words into the tasting's words
  // field and sets nothing else.
  function handleUseAsExpectedShortcut() {
    setTastingDraft((prev) => ({ ...prev, words: 'As expected, nothing to note' }));
  }

  // The two impure calls live here, in the one save handler — addTasting
  // itself stays deterministic. Reloads the version's batch list after the
  // write so the margin re-reads what is stored.
  function handleSaveTasting() {
    const toNumberOrNull = (raw) => (raw === '' ? null : Number(raw));
    const toTextOrNull = (raw) => (raw === '' ? null : raw);
    const tastingFields = {
      date: tastingDraft.date === '' ? null : tastingDraft.date,
      tastingTempC: toNumberOrNull(tastingDraft.tastingTempC),
      marks: tastingDraft.marks,
      meltdownLossG: toNumberOrNull(tastingDraft.meltdownLossG),
      words: toTextOrNull(tastingDraft.words),
      nextTimeNote: toTextOrNull(tastingDraft.nextTimeNote),
    };
    const updated = addTasting(openBatch, tastingFields, { id: crypto.randomUUID() });

    repository.saveBatch(updated).then(() => repository.listBatchesForVersion(id)).then((reloaded) => {
      setBatches(reloaded);
      setTastingDraft(null);
    });
  }

  // The version line under the recipe name carries the latest batch's
  // churn date only — never a count and never the print date (D-21).
  const latestChurn = latestChurnDate(batches);

  return (
    <article className="recipe-page">
      <header className="headnote">
        <p className="region-name">Headnote</p>
        <h1>{version.recipeName}</h1>
        <p className="headnote__version">
          {version.versionLabel}
          {latestChurn && ` · churned ${formatRecordDate(latestChurn)}`}
        </p>
        <p className="headnote__prose">{version.headnote}</p>
      </header>

      <section className="ingredient-table-region" aria-label="Ingredient table">
        <h2 className="region-name">Ingredient table</h2>
        {hasRows ? (
          <IngredientTable
            rows={version.rows}
            markedRowIds={markedRowIds}
            markedFigureLabel={markedFigureLabel}
            mode={mode}
            draft={draft}
            openBatch={openBatch}
            onChangeAsMade={handleChangeAsMade}
          />
        ) : (
          <p>This version has no ingredient rows.</p>
        )}
      </section>

      <section className="method-region" aria-label="Method">
        <Method
          steps={version.method}
          stepChanges={mode === 'recording' ? draft.stepChanges : openBatch ? openBatch.churn.stepChanges : {}}
          mode={mode}
          onChangeStepChange={handleChangeStepChange}
        />
      </section>

      {/* Column two, what the sheet does not print: the formulation note
          beside the table, then the margin beneath it. One flow, so the
          method's height never separates the two. */}
      <div className="side-region">
        <section className="formulation-note-region" aria-label="Formulation note">
          <FormulationNote
            version={version}
            onFocusFigure={setFocusedFigureKey}
            onBlurFigure={() => setFocusedFigureKey(null)}
          />
          <BasisNote version={version} />
        </section>

        <aside className="margin-region" aria-label="Margin">
          <p className="region-name">Margin</p>
          <BatchMargin
            version={version}
            batches={batches}
            openBatch={openBatch}
            mode={mode}
            draft={draft}
            onStartRecording={handleStartRecording}
            onStartAmending={handleStartAmending}
            onChangeChurnDate={handleChangeChurnDate}
            onChangeChurnField={handleChangeChurnField}
            onSaveBatch={handleSaveBatch}
            tastingDraft={tastingDraft}
            onStartTasting={handleStartTasting}
            onChangeTastingField={handleChangeTastingField}
            onChangeTastingMark={handleChangeTastingMark}
            onUseAsExpectedShortcut={handleUseAsExpectedShortcut}
            onSaveTasting={handleSaveTasting}
          />
          <Authored carriedForward={version.authored.carriedForward} beforeYouStart={version.authored.beforeYouStart} />
          <div className="advisory-slot" aria-label="Advisories" />
        </aside>
      </div>
    </article>
  );
}
