import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { buildFigures } from '../domain/figures.js';
import { createBatch } from '../domain/batch.js';
import { IngredientTable } from './IngredientTable.jsx';
import { Method } from './Method.jsx';
import { Authored } from './Authored.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';
import { BatchMargin } from './BatchMargin.jsx';

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
    setDraft({ churnDate: '', asMade: {} });
    setMode('recording');
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

  // The two impure calls (a fresh id, the current instant) live here, in
  // the one save handler — every domain function stays deterministic.
  function handleSaveBatch() {
    const asMade = {};
    for (const [rowId, rawValue] of Object.entries(draft.asMade)) {
      asMade[rowId] = Number(rawValue);
    }
    const churnFields = { churnDate: draft.churnDate === '' ? null : draft.churnDate, asMade };
    const record = createBatch(version, churnFields, { id: crypto.randomUUID(), now: new Date().toISOString() });

    repository.saveBatch(record).then(() => {
      setBatches((prev) => [...prev, record]);
      setMode('reading');
      setDraft(null);
      navigate(`/recipe/${id}/batch/${record.id}`);
    });
  }

  return (
    <article className="recipe-page">
      <header className="headnote">
        <p className="region-name">Headnote</p>
        <h1>{version.recipeName}</h1>
        <p className="headnote__version">{version.versionLabel}</p>
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
        <Method steps={version.method} />
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
            openBatch={openBatch}
            mode={mode}
            draft={draft}
            onStartRecording={handleStartRecording}
            onChangeChurnDate={handleChangeChurnDate}
            onSaveBatch={handleSaveBatch}
          />
          <Authored carriedForward={version.authored.carriedForward} beforeYouStart={version.authored.beforeYouStart} />
          <div className="advisory-slot" aria-label="Advisories" />
        </aside>
      </div>
    </article>
  );
}
