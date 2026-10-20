import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './Button.jsx';
import { FieldFeedback } from './FieldFeedback.jsx';
import { RecipeSheet } from './RecipeSheet.jsx';
import { sheetView } from './sheetView.js';
import { useDraftWriter, useKeptDraft } from './useKeptDraft.js';
import { NOTEBOOK_PLACE_PATH } from './notebookPaths.js';
import { creationSheetVersion, creationTitle, normalizeCreateDraft } from '../domain/creation.js';

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
  // The editor never holds a payload as it was stored: a stored create draft
  // may hold only recipeId, versionId and name, so the first state and every
  // restore lay the payload over the blank one.
  const [createDraft, setCreateDraft] = useState(() => normalizeCreateDraft(record.payload));
  const penOpenedAtRef = useRef(null);
  const { draftRestoreDone } = useKeptDraft({
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
    onRestoreCreate: (payload) => setCreateDraft(normalizeCreateDraft(payload)),
    onPageStatus: doNothing,
    navigate,
  });

  // The Sheet reads the creation as a version (no baseline: nothing to compare
  // with), rebuilt only when the draft changes.
  const version = useMemo(() => creationSheetVersion(createDraft), [createDraft]);
  const view = useMemo(
    () =>
      sheetView({
        version,
        baseline: null,
        mode: 'creating',
        penDraft: null,
        parentVersion: null,
        showingChanges: false,
        batches: [],
        batchId: undefined,
      }),
    [version],
  );

  // The tab title leads with the recipe name, or Untitled while it is blank
  // (D-08c), the way RecipePage's does.
  const title = creationTitle(createDraft.name);
  useEffect(() => {
    document.title = `${title} · Sprinkles`;
    return () => {
      document.title = 'Sprinkles';
    };
  }, [title]);

  // Nothing is drawn until the kept-draft hook's own restore read has settled,
  // so nothing can be typed into a read still out and no keystroke is lost to a
  // page left before it resolves. The read is one IndexedDB get.
  if (!draftRestoreDone) return null;

  // A functional update: two edits in one React batch both land, and the
  // payload is never rebuilt during render (useKeptDraft's identity rule).
  function setField(field, value) {
    setCreateDraft((prev) => ({ ...prev, [field]: value }));
  }

  // Cancel ends the creation for good, and only once the delete has succeeded
  // (RESEARCH Pitfall 6): the Notebook must not read 'discarded' over a draft
  // still kept. While the delete is out the hook holds every write; when it
  // fails the hook gives persistence back and the page stays where it is, so a
  // failed Cancel loses nothing. There is no dialog and no Undo (D-03).
  async function handleCancel() {
    try {
      await writer.discardDraft({ final: true });
    } catch {
      return;
    }
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
        <div className="notebook-body__sheet">
          <RecipeSheet view={view} version={version} mode="creating" penDraft={null} />
        </div>
        <aside className="notebook-log" aria-label="Setup" />
      </div>
    </div>
  );
}
