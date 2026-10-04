// The Sheet block (route-recipe.md § 3 "The imprint", revised 2026-09-17;
// 03.5-CONTEXT.md D-09, D-11): the Sheet's own title and intro prose —
// the recipe's own name and description now live off the version, in the
// recipe record, and render in the App-context recipe band instead
// (RecipeBand.jsx). Developing a successor transforms this block into the
// child's Sheet identity instead of leaving the parent's above a second
// version form. sheetTitle in 2rem is the block's own head — it wears no
// running head of its own (D-02). In the pen the title field replaces the
// heading (sketch 011 decision 35 A, Mark 2026-10-04, sheet-title-pen.html
// row A): one field set as the heading, so the title shows once; the h1
// stays in the reading view and in print. D-03: the churned date reaches the
// reader through the batch list in Versions, and the recording-state
// churn-date field lives in that pen's own ceremony there too. The
// authored version line itself now reads on the version row's own
// heading, not here (route-recipe.md § 6 "One version identity, wherever
// a version is named", 2026-09-18) — and, since 03.5-04 Task 3, its own
// pen ceremony lives whole in VersionRow.jsx too (1600-pen.html draws no
// Version field on the Sheet): this component carries no version-line
// field, no blocked-attempt focus effect, and no versionLineError prop.
export function Headnote({ version, mode, penDraft, onChangePenField, isSaving = false }) {
  const descriptionIsEmpty = mode === 'developing' && penDraft.sheetDescription === '';
  const parentHasDescription = version.sheetDescription !== '';

  return (
    <header className="headnote">
      {/* Sheet title and Sheet description (route-recipe-version.md § 3;
          03.5-CONTEXT.md D-09; restyled to 1600-pen.html's Sheet inline
          styles, Task 3): two text fields in developing mode, each with
          the baseline's own text struck beneath it once it differs — the
          same treatment a step's text gets — followed by the helper line
          naming what the fields do. The title field is a one-row textarea
          that grows with its lines (the heading itself, sketch 011
          decision 35 A): Enter is kept out of it and a pasted line break
          becomes a space, so the title stays one paragraph. */}
      {mode === 'developing' ? (
        <>
          <label className="headnote__sheet-title-field">
            <span className="pen-caption">Sheet title</span>
            <textarea
              className="prose-field"
              rows="1"
              disabled={isSaving}
              value={penDraft.sheetTitle}
              aria-label="Sheet title"
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
              onChange={(event) => onChangePenField('sheetTitle', event.target.value.replace(/[\r\n]+/g, ' '))}
            />
          </label>
          {penDraft.sheetTitle !== version.sheetTitle && (
            <p className="prose-struck-beneath">{version.sheetTitle}</p>
          )}
          <label className="headnote__prose-field">
            <span className="pen-caption">Sheet description</span>
            <textarea
              className={descriptionIsEmpty ? 'prose-field prose-field--empty' : 'prose-field'}
              rows="3"
              disabled={isSaving}
              placeholder={parentHasDescription ? undefined : 'e.g. what this version changes'}
              value={penDraft.sheetDescription}
              aria-label="Sheet description"
              onChange={(event) => onChangePenField('sheetDescription', event.target.value)}
            />
          </label>
          {penDraft.sheetDescription !== version.sheetDescription && parentHasDescription && (
            <p className="prose-struck-beneath">{version.sheetDescription}</p>
          )}
          <p className="headnote__field-helper">What the sheet is served under. Prints as the title. Copies into the next version.</p>
        </>
      ) : (
        <>
          <h1>{version.sheetTitle}</h1>
          <p className="headnote__prose">{version.sheetDescription}</p>
        </>
      )}
    </header>
  );
}
