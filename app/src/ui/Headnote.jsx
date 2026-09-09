// The recipe block (route-recipe.md § 3 "The imprint", revised
// 2026-09-08; D-02, D-03): the recipe's own name, version line and intro
// paragraph — nothing else. Every control, the lineage line, the churned
// date, and the plan's own save ceremony live in Versions.jsx (D-04 to
// D-06); this component renders no button and needs none of that state.
// The recipe name in 2rem is the block's own head — it wears no running
// head of its own (D-02). D-03: the version line reads just the version
// line — the churned date now reaches the reader through the batch list
// in Versions, and the recording-state churn-date field lives in that
// pen's own ceremony there too.
export function Headnote({ version, mode, penDraft, onChangePenField }) {
  return (
    <header className="headnote">
      <h1>{version.recipeName}</h1>
      <p className="headnote__version">{version.versionLabel}</p>
      {/* The intro paragraph (route-recipe-version.md § 3): a text field
          in developing mode, with the baseline's prose struck beneath it
          once it differs — the same treatment a step's text gets. */}
      {mode === 'developing' ? (
        <>
          <label className="headnote__prose-field">
            <span>Headnote prose</span>
            <textarea
              className="ink-field"
              rows="3"
              value={penDraft.headnote}
              aria-label="Headnote prose"
              onChange={(event) => onChangePenField('headnote', event.target.value)}
            />
          </label>
          {penDraft.headnote !== version.headnote && <p className="prose-struck-beneath">{version.headnote}</p>}
        </>
      ) : (
        <p className="headnote__prose">{version.headnote}</p>
      )}
    </header>
  );
}
