import { useEffect, useRef } from 'react';
import { FieldFeedback } from './FieldFeedback.jsx';

// The Sheet block (route-recipe.md § 3 "The imprint", revised 2026-09-17;
// 03.5-CONTEXT.md D-09, D-11): the Sheet's own title and intro prose —
// the recipe's own name and description now live off the version, in the
// recipe record, and render in the App-context recipe band instead
// (RecipeList.jsx's HomeLead today; a dedicated RecipeBand.jsx lands
// later in 03.5). Developing a successor transforms this block into the
// child's Sheet identity instead of leaving the parent's above a second
// version form. sheetTitle in 2rem is the block's own head — it wears no
// running head of its own (D-02). D-03: the churned date reaches the
// reader through the batch list in Versions, and the recording-state
// churn-date field lives in that pen's own ceremony there too. The
// authored version line itself now reads on the version row's own
// heading, not here (route-recipe.md § 6 "One version identity, wherever
// a version is named", 2026-09-18).
export function Headnote({
  version,
  mode,
  penDraft,
  onChangePenField,
  versionLineBlockedAttempt = null,
  versionLineError = null,
  isSaving = false,
}) {
  const versionLineFieldRef = useRef(null);
  const descriptionIsEmpty = mode === 'developing' && penDraft.sheetDescription === '';
  const parentHasDescription = version.sheetDescription !== '';

  useEffect(() => {
    if (versionLineBlockedAttempt != null) versionLineFieldRef.current?.focus();
  }, [versionLineBlockedAttempt]);

  return (
    <header className="headnote">
      <h1>{version.sheetTitle}</h1>
      {mode === 'developing' && (
        <label className="headnote__version-field">
          <span className="pen-caption">Version</span>
          <input
            ref={versionLineFieldRef}
            type="text"
            className="ink-field"
            required
            autoFocus
            disabled={isSaving}
            placeholder="e.g. 55 g oil · 800 g"
            value={penDraft.versionLabel}
            aria-label="Version"
            aria-invalid={versionLineError ? 'true' : undefined}
            aria-describedby={versionLineError ? 'version-field-error' : undefined}
            onChange={(event) => onChangePenField('versionLabel', event.target.value)}
          />
          <FieldFeedback
            error={versionLineError}
            errorId="version-field-error"
            required
          />
        </label>
      )}
      {/* Sheet title and Sheet description (route-recipe-version.md § 3;
          03.5-CONTEXT.md D-09): two text fields in developing mode, each
          with the baseline's own text struck beneath it once it differs —
          the same treatment a step's text gets. */}
      {mode === 'developing' ? (
        <>
          <label className="headnote__sheet-title-field">
            <span className="pen-caption">Sheet title</span>
            <input
              type="text"
              className="ink-field"
              disabled={isSaving}
              value={penDraft.sheetTitle}
              aria-label="Sheet title"
              onChange={(event) => onChangePenField('sheetTitle', event.target.value)}
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
        </>
      ) : (
        <p className="headnote__prose">{version.sheetDescription}</p>
      )}
    </header>
  );
}
