import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './Button.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { useDraftWriter, useKeptDraft } from './useKeptDraft.js';
import { NOTEBOOK_PLACE_PATH } from './notebookPaths.js';

function doNothing() {}

// The creation editor (Phase 10, MAKE-05, sketch 013 creation-editor.html
// panel eA1): the band holds Recipe name and Recipe description in Rename's
// open form, and the ceremony form 'New recipe' holds the Version name and
// Cancel. There is no Save here (Phase 11 adds it). The kept draft is the
// create record the Notebook's Start wrote; useKeptDraft keeps it as typed.
// `record` is the stored create draft CreationRoute found.
export function CreationPage({ record }) {
  // Hooks first, in this order, above any early return.
  const navigate = useNavigate();
  const writer = useDraftWriter(record.versionId);
  const [createDraft, setCreateDraft] = useState(record.payload);
  const penOpenedAtRef = useRef(null);
  useKeptDraft({
    writer,
    versionId: record.versionId,
    recipeId: record.payload.recipeId,
    batchId: undefined,
    version: null,
    batches: [],
    catalog: null,
    batchesLoaded: false,
    loadFailed: false,
    mode: 'creating',
    amendingBatchId: null,
    penDraft: null,
    draft: null,
    amendBaseline: null,
    amendOpener: null,
    penOpenedAtRef,
    onRestorePlan: doNothing,
    onRestoreRecord: doNothing,
    creating: true,
    createDraft,
    onRestoreCreate: setCreateDraft,
    onPageStatus: doNothing,
    navigate,
  });

  // A functional update: two edits in one React batch both land, and the
  // payload is never rebuilt during render (useKeptDraft's identity rule).
  function setField(field, value) {
    setCreateDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancel() {
    writer.discardDraft();
    navigate(NOTEBOOK_PLACE_PATH, { replace: true, state: { discarded: true } });
  }

  return (
    <div className="notebook mk-page">
      <header className="notebook-band">
        <div className="notebook-band__grid">
          <section className="notebook-recipe" aria-label="Recipe">
            <div className="notebook-recipe__form">
              <label className="notebook-field">
                <span className="notebook-caption">Recipe name</span>
                <input
                  type="text"
                  className="ink-field"
                  value={createDraft.name}
                  aria-label="Recipe name"
                  onChange={(event) => setField('name', event.target.value)}
                />
              </label>
              <label className="notebook-field">
                <span className="notebook-caption">Recipe description</span>
                <textarea
                  className="prose-field"
                  rows="3"
                  value={createDraft.description}
                  aria-label="Recipe description"
                  onChange={(event) => setField('description', event.target.value)}
                />
              </label>
            </div>
          </section>
          <form className="notebook-ceremony" aria-label="New recipe" onSubmit={(event) => event.preventDefault()}>
            <span className="notebook-caption">New recipe · draft</span>
            <label className="notebook-field">
              <span className="notebook-caption">Version name</span>
              <input
                type="text"
                className="ink-field"
                required
                value={createDraft.versionLabel}
                aria-label="Version name"
                onChange={(event) => setField('versionLabel', event.target.value)}
              />
              <FieldFeedback required />
            </label>
            <div className="notebook-ceremony__actions">
              <Button className="notebook-action--outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </header>
      <div className="notebook-body">
        <div className="notebook-body__sheet" />
        <aside className="notebook-log" aria-label="Setup" />
      </div>
    </div>
  );
}
