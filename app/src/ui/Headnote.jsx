import { useEffect, useRef, useState } from 'react';
import { FieldFeedback } from './FieldFeedback.jsx';

// The recipe block (route-recipe.md § 3 "The imprint", revised
// 2026-09-17): the recipe's name, current/draft version line and intro.
// Developing a successor transforms this block into the child's identity
// instead of leaving the parent's identity above a second version form.
// The recipe name in 2rem is the block's own head — it wears no running
// head of its own (D-02). D-03: the version line reads just the version
// line — the churned date now reaches the reader through the batch list
// in Versions, and the recording-state churn-date field lives in that
// pen's own ceremony there too.
export function Headnote({
  version,
  mode,
  penDraft,
  onChangePenField,
  versionLineBlockedAttempt = null,
  versionLineError = null,
  isSaving = false,
  focusVersionOnMount = false,
}) {
  const versionLineFieldRef = useRef(null);
  const versionIdentityRef = useRef(null);
  const [landingFocusVisible, setLandingFocusVisible] = useState(false);
  const descriptionIsEmpty = mode === 'developing' && penDraft.headnote === '';
  const parentHasDescription = version.headnote !== '';

  useEffect(() => {
    if (versionLineBlockedAttempt != null) versionLineFieldRef.current?.focus();
  }, [versionLineBlockedAttempt]);

  // After a child is created, land on the identity that was just saved.
  // The temporary class keeps the programmatic landing visible even when
  // the save began with a pointer; blur returns the line to ordinary ink.
  useEffect(() => {
    if (focusVersionOnMount && mode === 'reading') {
      versionIdentityRef.current?.focus();
      setLandingFocusVisible(true);
    }
  }, [focusVersionOnMount, mode]);

  return (
    <header className="headnote">
      <h1>{version.recipeName}</h1>
      {mode === 'developing' ? (
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
      ) : (
        <p
          ref={versionIdentityRef}
          className={`headnote__version${landingFocusVisible ? ' is-landing-focus' : ''}`}
          tabIndex={focusVersionOnMount ? -1 : undefined}
          aria-label={focusVersionOnMount ? `Version ${version.versionLabel}` : undefined}
          onBlur={() => setLandingFocusVisible(false)}
        >
          {version.versionLabel}
        </p>
      )}
      {/* The intro paragraph (route-recipe-version.md § 3): a text field
          in developing mode, with the baseline's prose struck beneath it
          once it differs — the same treatment a step's text gets. */}
      {mode === 'developing' ? (
        <>
          <label className="headnote__prose-field">
            <textarea
              className={descriptionIsEmpty ? 'prose-field prose-field--empty' : 'prose-field'}
              rows="3"
              disabled={isSaving}
              placeholder={parentHasDescription ? undefined : 'e.g. what this version changes'}
              value={penDraft.headnote}
              aria-label="Description"
              onChange={(event) => onChangePenField('headnote', event.target.value)}
            />
          </label>
          {penDraft.headnote !== version.headnote && parentHasDescription && (
            <p className="prose-struck-beneath">{version.headnote}</p>
          )}
        </>
      ) : (
        <p className="headnote__prose">{version.headnote}</p>
      )}
    </header>
  );
}
