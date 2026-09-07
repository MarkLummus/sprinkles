import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { repository } from '../store/repository.js';
import { buildFigures } from '../domain/figures.js';
import { createBatch, addTasting, recordAmendment, sortedBatches } from '../domain/batch.js';
import { setMark } from '../domain/axes.js';
import { activeRows, activeSteps } from '../domain/rows.js';
import { createChildVersion, saveOverVersion, versionsForRecipe, blockedSaveMessage } from '../domain/lineage.js';
import { buildDiff } from '../domain/diff.js';
import { stepsWithStaleAmounts } from '../domain/uses.js';
import { IngredientTable } from './IngredientTable.jsx';
import { Method } from './Method.jsx';
import { Authored } from './Authored.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';
import { BatchMargin } from './BatchMargin.jsx';
import { Headnote } from './Headnote.jsx';
import { VersionStrip } from './VersionStrip.jsx';
import { DerivedAdvisories } from './DerivedAdvisories.jsx';

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

// The pen's own dirty check (route-recipe-version.md § 6, D-24's
// "unsaved ink" principle carried to the plan's pen): every field tested
// against '' / null / the version's own values, never truthiness, so a
// grams field typed back to the version's own value counts as clean again.
// A row's draft entry is { grams, step, removed } (03-02) — dirty if any
// of the three differs from the row the pen opened on.
function isPenDraftDirty(mode, penDraft, version) {
  if (mode !== 'developing' || !penDraft || !version) return false;
  if (penDraft.versionLabel !== '') return true;
  if (penDraft.reason !== '') return true;
  if (penDraft.citedBatchId !== null) return true;
  return version.rows.some((row) => {
    const draftRow = penDraft.rows[row.id];
    return (
      draftRow.grams !== String(row.grams) || draftRow.step !== row.step || draftRow.removed !== (row.removed ?? false)
    );
  });
}

// "A pen is open" used to live in two unrelated states — `mode`
// ('reading'|'recording'|'developing') and `tastingDraft` (null|object) —
// and every disabled condition in Headnote and BatchMargin hand-rolled its
// own subset of those two. Neither could see the tasting pen at all, since
// `tastingDraft` was never folded into `mode` or threaded to Headnote
// (D-UAT-1). This is the one derivation: `openPen` names which of the four
// pens — `plan`, `record`, `amend`, `tasting` — currently holds the page,
// or is `null` when none does; `reason` is the words-form counterpart D-10
// requires beside every control that pen disables ("never just visually
// implied"). An if-chain, not a lookup table (T-02-32's discipline against
// a bare bracket read against a key), so the four reason strings stay
// visible at the site that decides them.
export function derivePenState({ mode, amendingBatchId, tastingDraft }) {
  if (mode === 'developing') {
    return { openPen: 'plan', reason: 'the plan is being developed' };
  }
  if (mode === 'recording') {
    if (amendingBatchId) {
      return { openPen: 'amend', reason: 'a batch is being amended' };
    }
    return { openPen: 'record', reason: 'a batch is being recorded' };
  }
  if (tastingDraft) {
    return { openPen: 'tasting', reason: 'a tasting is being written' };
  }
  return { openPen: null, reason: null };
}

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. The margin's derived-advisories block (FORM2-02)
// renders nothing visible when the version has none — no placeholder text.
export function RecipePage() {
  const { id, batchId } = useParams();
  const navigate = useNavigate();
  // The show-changes state (D-02): on when the `changes` key is present in
  // the URL's search parameters at all — its value is never consulted, so
  // presence is the whole signal. Composes with both /recipe/:id and
  // /recipe/:id/batch/:batchId with no new route, since both already
  // resolve to this component. setSearchParams's default history behaviour
  // (a push, not a replace) is left alone: that is what makes the browser's
  // own back button return to the clean reading, with no extra code.
  const [searchParams, setSearchParams] = useSearchParams();
  const showingChanges = searchParams.has('changes');
  const [version, setVersion] = useState(undefined);
  const [versions, setVersions] = useState([]);
  const [batches, setBatches] = useState([]);
  // The signature trace (route-recipe.md § 3, § 5): focusing a balance
  // figure marks the ingredient rows it rests on. This page is the shared
  // parent of the figures and the table, so it is the one place the
  // focused figure's key can live.
  const [focusedFigureKey, setFocusedFigureKey] = useState(null);
  // The pen layer's state (route-recipe-batch.md § 3): a mode, one of
  // 'reading' | 'recording' | 'developing', and the draft form state it is
  // recorded into. mode is never derived from the URL — only the margin's
  // own control, and now the headnote's, ask for it (D-19).
  const [mode, setMode] = useState('reading');
  const [draft, setDraft] = useState(null);
  // The in-progress tasting's own draft state, alongside the churn draft
  // above (task 1). A tasting is added to an already-saved batch, so
  // setting it never touches `mode`/`draft`, the churn recording state —
  // but it is no longer treated as separate from them: derivePenState
  // above folds all three into the one "a pen is open" fact (D-UAT-1).
  const [tastingDraft, setTastingDraft] = useState(null);
  // Non-null while `mode === 'recording'` means the pen layer is amending
  // this existing batch's churn fields, rather than recording a new one
  // (task 3, D-06). Amending pre-fills the fields from the batch, never
  // from the version, and saving calls recordAmendment, never createBatch.
  const [amendingBatchId, setAmendingBatchId] = useState(null);
  // The plan's own pen draft (03-CONTEXT.md D-01 to D-10): version line,
  // reason, citation and headnote start blank/null — never defaulted from
  // the parent — while rows is a map keyed by row id holding the raw
  // string the maker typed for grams, the draft.asMade precedent (never
  // Number() on keystroke, so a value typed finer than the display
  // survives, RESEARCH.md Pitfall 5).
  const [penDraft, setPenDraft] = useState(null);
  const [blockedMessage, setBlockedMessage] = useState(null);

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

  // Every stored version, loaded once beside the two effects above — the
  // strip (03-03) and the version-line uniqueness check (D-04) both read
  // this list.
  useEffect(() => {
    let cancelled = false;
    repository.listVersions().then((result) => {
      if (!cancelled) setVersions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // The cited batch this version's lineage line names (route-recipe-version.md
  // § 3): citedBatchId is an id only — the batch itself lives on the
  // parent, never copied onto the child — so its churn date is read once
  // per version here, purely to render the lineage line's date-linked
  // clause.
  const [citedBatch, setCitedBatch] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.citedBatchId) {
      setCitedBatch(null);
      return undefined;
    }
    repository.getBatch(version.citedBatchId).then((result) => {
      if (!cancelled) setCitedBatch(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The live parent read (T-03-23, T-03-24): show-changes reads the parent
  // record through the repository at render time, never a copy stored on
  // the child, so a parent saved over afterwards is reflected rather than
  // frozen. Held as null when the version has no parent, or when the read
  // comes back with nothing — either way the toggle is absent and the
  // lineage line still names the parent from the child's own
  // parentVersionLabel snapshot (D-10).
  const [parentVersion, setParentVersion] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.parentVersionId) {
      setParentVersion(null);
      return undefined;
    }
    repository.getVersion(version.parentVersionId).then((result) => {
      if (!cancelled) setParentVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The version ids that have at least one batch, for the strip's
  // "churned" word (route-recipe-version.md § 3, 03-03) — one
  // repository.getAllBatches() read, not a query per version, since the
  // realistic range is 1–6 versions per recipe this milestone.
  const [versionIdsWithBatches, setVersionIdsWithBatches] = useState(new Set());
  useEffect(() => {
    let cancelled = false;
    repository.getAllBatches().then((allBatches) => {
      if (!cancelled) setVersionIdsWithBatches(new Set(allBatches.map((batch) => batch.versionId)));
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // D-24: leaving the page with unsaved ink uses the browser's own leave
  // warning only, registered while recording, tasting, or the plan's pen
  // holds a dirty draft, and removed as soon as none does — no invented
  // dialog, no draft persistence across a reload (that is UX1-02, Phase 4).
  useEffect(() => {
    if (!isDraftDirty(mode, draft) && !isTastingDraftDirty(tastingDraft) && !isPenDraftDirty(mode, penDraft, version)) {
      return undefined;
    }
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [mode, draft, tastingDraft, penDraft, version]);

  if (version === undefined) return null;
  // The running head is the way home in every state, including this one
  // (route-recipe-version.md § 4): it identifies the book, never carries
  // status, and never changes with state. A mistyped or since-removed
  // version id is no longer a dead end.
  if (version === null) {
    return (
      <>
        <p className="running-head">
          <Link to="/">Sprinkles</Link>
        </p>
        <div className="not-found">
          <p>No recipe found for this version.</p>
          <Link to="/">Back to the recipe list</Link>
        </div>
      </>
    );
  }

  // The one call site (D-UAT-1): every control that disables while a pen
  // is open reads openPen/penReason from here, never mode or tastingDraft
  // directly.
  const { openPen, reason: penReason } = derivePenState({ mode, amendingBatchId, tastingDraft });

  const hasRows = version.rows.length > 0;
  // The clean reading: every reader that is not the pen's own table takes
  // this, with every removed row and step already absent (RESEARCH.md
  // Pattern 2) — a removed row must never reach buildFigures/computeBalance.
  const readingVersion = { ...version, rows: activeRows(version), method: activeSteps(version) };

  // The draft version (route-recipe-version.md § 3, 03-02): built once,
  // from the version the pen opened on with the draft's values applied, so
  // the pen's own table, the cross-flags (uses.js) and buildDiff all read
  // the same object rather than each reassembling it. A draft grams string
  // that fails to parse, or is blank mid-keystroke, keeps the row's own
  // grams rather than becoming 0 or NaN. Unfiltered — a removed row or
  // step still appears here, struck, for the pen's own table; readers that
  // want the clean figures filter through activeRows/activeSteps first.
  const draftVersion =
    mode === 'developing' && penDraft
      ? {
          ...version,
          rows: version.rows.map((row) => {
            const draftRow = penDraft.rows[row.id];
            const parsed = Number(draftRow.grams);
            return {
              ...row,
              grams: draftRow.grams !== '' && Number.isFinite(parsed) ? parsed : row.grams,
              step: draftRow.step,
              removed: draftRow.removed,
            };
          }),
          method: penDraft.method,
          headnote: penDraft.headnote,
          authored: penDraft.authored,
        }
      : null;

  // While developing, the six rules and the basis note answer live against
  // the maker's typed grams and removed rows (route-recipe-version.md § 3).
  const liveVersion =
    mode === 'developing' && draftVersion
      ? { ...draftVersion, rows: activeRows(draftVersion), method: activeSteps(draftVersion) }
      : readingVersion;

  const figures = buildFigures(liveVersion);
  const focusedFigure = figures.find((figure) => figure.key === focusedFigureKey) ?? null;
  const markedRowIds = focusedFigure?.contributorRowIds ?? [];
  const markedFigureLabel = focusedFigure?.label ?? '';

  // The show-changes diff (route-recipe-version.md § 3, § 6; D-02, T-03-23):
  // one buildDiff of the version against its live parent — the same
  // function the pen uses against its own baseline — computed once here and
  // threaded into every region (the table, the six rules, the method).
  // Absent whenever the toggle itself would be absent: no parent, the
  // parent record unread, or the parameter not present.
  const changeDiff =
    showingChanges && version.parentVersionId && parentVersion ? buildDiff(version, parentVersion) : null;
  const changeStaleSteps = changeDiff ? stepsWithStaleAmounts(version, parentVersion) : [];

  // The batch this page shows: the one the URL names, or — with no batch
  // named in the URL — the version's most recent batch by churn date,
  // undated last, or null when the version has no batch yet.
  let openBatch = null;
  if (batchId) {
    openBatch = batches.find((batch) => batch.id === batchId) ?? null;
  } else if (batches.length > 0) {
    openBatch = sortedBatches(batches)[0];
  }

  // Clearing the amend target here is load-bearing, not redundant: without
  // it, a maker who amends and then starts a fresh recording would leave
  // amendingBatchId set from the earlier amendment, so handleSaveBatch
  // would take the amend path — overwriting the amended batch's churn and
  // stamping a false amendment date on it, while the new batch is never
  // created (T-02-24).
  function handleStartRecording() {
    setAmendingBatchId(null);
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

  // The deliberate, in-app abandonment path (A-1): returns to reading,
  // drops the draft, and clears the amend target, writing nothing. This is
  // distinct from D-24's beforeunload warning, which only guards
  // accidental loss on document unload — the brief conflated the two, but
  // they are different requirements (see pen-layer-no-cancel-save-hard-to-find.md).
  // Nothing needs to navigate: the batch on screen is derived from the URL
  // and the loaded batch list, never from the draft, so the page already
  // shows the right thing once mode returns to reading.
  function handleCancelRecording() {
    setMode('reading');
    setDraft(null);
    setAmendingBatchId(null);
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

  // Discards silently, exactly as the churn Cancel does (handleCancelRecording
  // above): the brief forbids a dialog of the app's own for leaving with
  // unsaved ink (route-recipe-batch.md § 6). The beforeunload guard needs no
  // change here — isTastingDraftDirty(null) is already false, so the effect
  // above removes the listener on its own once tastingDraft goes null.
  function handleCancelTasting() {
    setTastingDraft(null);
  }

  function handleChangeTastingField(field, value) {
    setTastingDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Clearing is a first-class move on this control (G-02-6), not an
  // omission: setMark writes the draft's marks through the one rule that
  // handles both the set and the clear, so this handler gains a delete
  // path without gaining a branch. A marks object holds a key only for a
  // marked axis, so clearing the last mark is what returns the save gate
  // (isTastingSaveable) and its hint to their pre-mark state.
  function handleChangeTastingMark(axisKey, stop) {
    setTastingDraft((prev) => ({ ...prev, marks: setMark(prev.marks, axisKey, stop) }));
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

  // Seeds penDraft from the version the pen opened on — grams as strings
  // (Pitfall 5), everything else the maker's own to write, never defaulted
  // from the parent (D-10: no default reason, citation, or version line).
  // Never touches draft or amendingBatchId — mode alone still decides
  // which of developing/recording is live; derivePenState above is what
  // now decides availability everywhere else (RESEARCH.md Pattern 4).
  function handleStartDeveloping() {
    const rows = {};
    for (const row of version.rows) {
      rows[row.id] = { grams: String(row.grams), step: row.step, removed: row.removed ?? false };
    }
    setPenDraft({
      versionLabel: '',
      reason: '',
      citedBatchId: null,
      headnote: version.headnote,
      rows,
      method: structuredClone(version.method),
      authored: structuredClone(version.authored),
    });
    setBlockedMessage(null);
    setMode('developing');
  }

  // The show-changes toggle (D-02): adds or deletes the `changes` key,
  // building a new URLSearchParams from the previous one rather than
  // mutating it, and leaving setSearchParams's default push behaviour
  // alone so the browser's own back button returns to the clean reading.
  function handleToggleShowChanges() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (next.has('changes')) next.delete('changes');
      else next.set('changes', '');
      return next;
    });
  }

  // Discards with no dialog of the app's own (D-10) — mirrors
  // handleCancelRecording exactly.
  function handleCancelDeveloping() {
    setMode('reading');
    setPenDraft(null);
    setBlockedMessage(null);
  }

  function handleChangePenField(field, value) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleChangePenGrams(rowId, value) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({ ...prev, rows: { ...prev.rows, [rowId]: { ...prev.rows[rowId], grams: value } } }));
  }

  // A row's step allocation (the sheet's step column) is a choice among
  // the version's own steps (route-recipe-version.md § 3) — a different
  // fact from a step's `uses` list, and both are kept.
  function handleChangePenRowStep(rowId, stepNumber) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({ ...prev, rows: { ...prev.rows, [rowId]: { ...prev.rows[rowId], step: stepNumber } } }));
  }

  // Removing sets only the draft row's removed flag — it does not clear
  // the grams and does not touch any step (route-recipe-version.md § 3).
  // The same handler restores: removal never cascades, so this is always
  // the maker's own tap, whether flipping a row's own control or the
  // orphaned-row flag's "remove this row" control.
  function handleTogglePenRowRemoved(rowId) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({
      ...prev,
      rows: { ...prev.rows, [rowId]: { ...prev.rows[rowId], removed: !prev.rows[rowId].removed } },
    }));
  }

  // A step field setter for leadIn/instruction/purpose/aside (03-02):
  // `field` is always one of these four literal strings supplied by this
  // file's own call sites, never a maker-influenced key, so a computed
  // property name here carries no T-02-32 risk.
  function handleChangePenStepField(stepN, field, value) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => (step.n === stepN ? { ...step, [field]: value } : step)),
    }));
  }

  // A target chip's label or value, matched by its index within the
  // step's own targets array rather than by label — a label can itself be
  // mid-edit, so matching by index avoids two chips momentarily colliding
  // on the same label while the maker types.
  function handleChangePenStepTarget(stepN, targetIndex, field, value) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => {
        if (step.n !== stepN) return step;
        const targets = step.targets.map((target, index) => (index === targetIndex ? { ...target, [field]: value } : target));
        return { ...step, targets };
      }),
    }));
  }

  // The step's uses list, written through a filter and a concat
  // (route-recipe-version.md § 3), never a bare bracket write — a
  // different fact from the row's own step allocation, and both are kept.
  function handleTogglePenStepUses(stepN, rowId) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => {
        if (step.n !== stepN) return step;
        const uses = step.uses ?? [];
        const nextUses = uses.includes(rowId) ? uses.filter((id) => id !== rowId) : uses.concat(rowId);
        return { ...step, uses: nextUses };
      }),
    }));
  }

  // Removing sets only the draft step's removed flag — removal never
  // cascades, so this is always the maker's own tap, whether flipping a
  // step's own control or the removed-row cross-flag's "remove this step"
  // control.
  function handleTogglePenStepRemoved(stepN) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({
      ...prev,
      method: prev.method.map((step) => (step.n === stepN ? { ...step, removed: !step.removed } : step)),
    }));
  }

  // An authored note's text, and the inherited-from marker it carries
  // (route-recipe-version.md, "Inherited notes"): the marker persists when
  // the edited text still equals the text this version inherited it with,
  // and clears the instant it differs — computed once, here, so every
  // reader (Authored.jsx included) can read `note.inheritedFrom` directly
  // rather than re-deriving it.
  function handleChangePenNoteText(listKey, index, value) {
    setBlockedMessage(null);
    setPenDraft((prev) => {
      const originalNote = version.authored[listKey][index];
      const notes = prev.authored[listKey].map((note, i) =>
        i === index
          ? { ...note, text: value, inheritedFrom: value === originalNote.text ? originalNote.inheritedFrom : null }
          : note,
      );
      return { ...prev, authored: { ...prev.authored, [listKey]: notes } };
    });
  }

  // A note can be removed per note (route-recipe-version.md § 3) — an
  // outright removal from the list, not a struck-in-place flag: an
  // authored note carries no cross-flag concern the way a row or step does.
  function handleRemovePenNote(listKey, index) {
    setBlockedMessage(null);
    setPenDraft((prev) => ({
      ...prev,
      authored: { ...prev.authored, [listKey]: prev.authored[listKey].filter((_, i) => i !== index) },
    }));
  }

  // Shared by both save paths: the one message that blocks the save is
  // computed by the tested domain function (D-04) — the same sentence can
  // never drift between the two save controls. `excludeId` scopes the
  // uniqueness check: null for a fresh child (compared against every
  // version of the recipe, including the one the pen opened on), the
  // current version's own id for a save-over (so keeping its own line
  // never reads as a collision with itself). Returns null when blocked, or
  // the pen's fields coerced for the domain constructor (rows' grams
  // strings are Number()'d here, at save time, never on keystroke —
  // Pitfall 5). A reason of nothing but whitespace is treated as blank and
  // stored as null, exactly as an empty reason already was.
  function buildPenFields(excludeId) {
    const scopedVersions = versionsForRecipe(versions, version.recipeId).filter((v) => v.id !== excludeId);
    const message = blockedSaveMessage(penDraft, version, scopedVersions);
    if (message) {
      setBlockedMessage(message);
      return null;
    }
    const rows = version.rows.map((row) => {
      const draftRow = penDraft.rows[row.id];
      const parsed = Number(draftRow.grams);
      return {
        ...row,
        grams: Number.isFinite(parsed) ? parsed : row.grams,
        step: draftRow.step,
        removed: draftRow.removed,
      };
    });
    return {
      versionLabel: penDraft.versionLabel,
      reason: penDraft.reason.trim() === '' ? null : penDraft.reason,
      citedBatchId: penDraft.citedBatchId,
      rows,
      method: penDraft.method,
      headnote: penDraft.headnote,
      authored: penDraft.authored,
    };
  }

  // The two impure calls (a fresh id, the current instant) live here, in
  // the one save handler — createChildVersion stays deterministic. The
  // parent is never passed to repository.saveVersion (D04, T-03-03).
  function handleSaveAsNewVersion() {
    const penFields = buildPenFields(null);
    if (!penFields) return;
    const child = createChildVersion(version, penFields, { id: crypto.randomUUID(), now: new Date().toISOString() });
    repository.saveVersion(child).then(() => {
      setVersions((prev) => [...prev, child]);
      setMode('reading');
      setPenDraft(null);
      setBlockedMessage(null);
      navigate(`/recipe/${child.id}`);
    });
  }

  // Available only on a version with zero batches (D-01). The control's
  // absence from the headnote is the design; this re-check is the
  // guarantee — a churned version's own record is never written to (D04)
  // even if this handler were somehow reached with the control hidden.
  function handleSaveOverVersion() {
    if (batches.length > 0) return;
    const penFields = buildPenFields(version.id);
    if (!penFields) return;
    const updated = saveOverVersion(version, penFields, { now: new Date().toISOString() });
    repository.saveVersion(updated).then(() => {
      setVersion(updated);
      setVersions((prev) => prev.map((existing) => (existing.id === updated.id ? updated : existing)));
      setMode('reading');
      setPenDraft(null);
      setBlockedMessage(null);
    });
  }

  return (
    <>
      {/* The running head (route-recipe-version.md § 4): the way home in
          every state, identifying the book, never the recipe's name and
          never changing with state. */}
      <p className="running-head">
        <Link to="/">Sprinkles</Link>
      </p>
      <article className="recipe-page">
        <Headnote
          version={version}
          mode={mode}
          draft={draft}
          penDraft={penDraft}
          openBatch={openBatch}
          batches={batches}
          citedBatch={citedBatch}
          parentVersion={parentVersion}
          showingChanges={showingChanges}
          blockedMessage={blockedMessage}
          openPen={openPen}
          penReason={penReason}
          onChangeChurnDate={handleChangeChurnDate}
          onStartDeveloping={handleStartDeveloping}
          onCancelDeveloping={handleCancelDeveloping}
          onChangePenField={handleChangePenField}
          onSaveAsNewVersion={handleSaveAsNewVersion}
          onSaveOverVersion={handleSaveOverVersion}
          onToggleShowChanges={handleToggleShowChanges}
        />

        <VersionStrip
          versions={versions}
          recipeId={version.recipeId}
          currentId={version.id}
          versionIdsWithBatches={versionIdsWithBatches}
          openPen={openPen}
          penReason={penReason}
        />

        <section className="ingredient-table-region" aria-label="Ingredient table">
          <h2 className="region-name">Ingredient table</h2>
          {hasRows ? (
            <IngredientTable
              rows={mode === 'developing' || showingChanges ? version.rows : readingVersion.rows}
              draftVersion={draftVersion}
              diff={changeDiff}
              showingChanges={showingChanges}
              markedRowIds={markedRowIds}
              markedFigureLabel={markedFigureLabel}
              mode={mode}
              draft={draft}
              penDraft={penDraft}
              openBatch={openBatch}
              onChangeAsMade={handleChangeAsMade}
              onChangePenGrams={handleChangePenGrams}
              onChangePenRowStep={handleChangePenRowStep}
              onTogglePenRowRemoved={handleTogglePenRowRemoved}
            />
          ) : (
            <p>This version has no ingredient rows.</p>
          )}
        </section>

        <section className="method-region" aria-label="Method">
          <Method
            steps={mode === 'developing' || showingChanges ? version.method : readingVersion.method}
            stepChanges={mode === 'recording' ? draft.stepChanges : openBatch ? openBatch.churn.stepChanges : {}}
            mode={mode}
            onChangeStepChange={handleChangeStepChange}
            rows={version.rows}
            draftVersion={draftVersion}
            baselineVersion={version}
            showingChanges={showingChanges}
            changeDiff={changeDiff}
            staleSteps={changeStaleSteps}
            staleFlagVisible={mode === 'developing' || showingChanges}
            onChangePenStepField={handleChangePenStepField}
            onChangePenStepTarget={handleChangePenStepTarget}
            onTogglePenStepUses={handleTogglePenStepUses}
            onTogglePenStepRemoved={handleTogglePenStepRemoved}
          />
        </section>

        {/* Column two, what the sheet does not print: the formulation note
            beside the table, then the margin beneath it. One flow, so the
            method's height never separates the two. */}
        <div className="side-region">
          <section className="formulation-note-region" aria-label="Formulation note">
            <FormulationNote
              version={liveVersion}
              mode={mode}
              diff={changeDiff}
              onFocusFigure={setFocusedFigureKey}
              onBlurFigure={() => setFocusedFigureKey(null)}
            />
            <BasisNote version={liveVersion} />
          </section>

          <aside className="margin-region" aria-label="Margin">
            <p className="region-name">Margin</p>
            <BatchMargin
              version={version}
              batches={batches}
              openBatch={openBatch}
              mode={mode}
              draft={draft}
              openPen={openPen}
              penReason={penReason}
              onStartRecording={handleStartRecording}
              onStartAmending={handleStartAmending}
              onChangeChurnField={handleChangeChurnField}
              onSaveBatch={handleSaveBatch}
              onCancelRecording={handleCancelRecording}
              tastingDraft={tastingDraft}
              onStartTasting={handleStartTasting}
              onChangeTastingField={handleChangeTastingField}
              onChangeTastingMark={handleChangeTastingMark}
              onUseAsExpectedShortcut={handleUseAsExpectedShortcut}
              onSaveTasting={handleSaveTasting}
              onCancelTasting={handleCancelTasting}
            />
            <DerivedAdvisories version={liveVersion} />
            <Authored
              carriedForward={mode === 'developing' && penDraft ? penDraft.authored.carriedForward : version.authored.carriedForward}
              beforeYouStart={mode === 'developing' && penDraft ? penDraft.authored.beforeYouStart : version.authored.beforeYouStart}
              mode={mode}
              onChangeNoteText={handleChangePenNoteText}
              onRemoveNote={handleRemovePenNote}
            />
          </aside>
        </div>
      </article>
    </>
  );
}
