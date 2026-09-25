import { useEffect, useRef, useState } from 'react';
import { FieldFeedback } from './FieldFeedback.jsx';
import { recipeNameMessage, renamedRecipe, RECIPE_SAVE_ERROR } from '../domain/recipe.js';

// RecipeBand (03.5-04 Task 1, D-12): the band's recipe column — the recipe
// record's own name and description, and Rename edited inline, Cancel
// first then Save. Save writes the recipe record through the seam at
// once: no version, no Why, no fork, and no saved Sheet is touched —
// Rename works whether or not the pen is open, so this component owns its
// own open/error/saving state entirely rather than reading any of it from
// RecipePage. No destination caption (decisions_recorded 8).
//
// initiallyRenaming/initialError are test-only seams (RecipeBand.test.jsx)
// for driving the open/blocked states through renderToStaticMarkup, which
// runs no effects and no interaction.
export function RecipeBand({ recipe, onSave, initiallyRenaming = false, initialError = null }) {
  const [renaming, setRenaming] = useState(initiallyRenaming);
  const [fields, setFields] = useState({ name: recipe.name, description: recipe.description });
  const [error, setError] = useState(initialError);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const nameFieldRef = useRef(null);
  const renameButtonRef = useRef(null);

  // A blocked Save (a blank name) refocuses the name field — mirrors the
  // versionLineBlockedAttempt precedent (Headnote.jsx/VersionRow.jsx),
  // simplified: this component owns its own error state directly, so the
  // error value itself is the re-focus signal rather than an attempt
  // counter threaded from a parent.
  useEffect(() => {
    if (error) nameFieldRef.current?.focus();
  }, [error]);

  function handleOpen() {
    setFields({ name: recipe.name, description: recipe.description });
    setError(null);
    setStatus('');
    setRenaming(true);
  }

  function handleCancel() {
    setRenaming(false);
    setError(null);
    setStatus('');
    renameButtonRef.current?.focus();
  }

  function handleSave() {
    const message = recipeNameMessage(fields.name);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setStatus('');
    setSaving(true);
    Promise.resolve(onSave(renamedRecipe(recipe, fields)))
      .then(() => {
        setSaving(false);
        setRenaming(false);
        renameButtonRef.current?.focus();
      })
      .catch(() => {
        setSaving(false);
        setStatus(RECIPE_SAVE_ERROR);
      });
  }

  return (
    <section className="notebook-recipe" aria-label="Recipe">
      {renaming ? (
        <div className="notebook-recipe__form">
          <label className="notebook-field">
            <span className="notebook-caption">Recipe name</span>
            <input
              ref={nameFieldRef}
              type="text"
              className="ink-field"
              autoFocus
              disabled={saving}
              value={fields.name}
              aria-label="Recipe name"
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'recipe-name-field-error' : undefined}
              onChange={(event) => setFields((prev) => ({ ...prev, name: event.target.value }))}
            />
            <FieldFeedback error={error} errorId="recipe-name-field-error" />
          </label>
          <label className="notebook-field">
            <span className="notebook-caption">Recipe description</span>
            <textarea
              className="prose-field"
              rows="3"
              disabled={saving}
              value={fields.description}
              aria-label="Recipe description"
              onChange={(event) => setFields((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
          <p className="form-status" role="status" aria-live="polite">
            {status}
          </p>
          <div className="notebook-recipe__form-actions">
            <button type="button" className="notebook-action--outline" disabled={saving} onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="notebook-action" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="notebook-recipe__identity">
            <span aria-hidden="true" className="notebook-recipe__rail" />
            <h1 className="notebook-recipe__name">{recipe.name}</h1>
          </div>
          {recipe.description !== '' && <p className="notebook-recipe__description">{recipe.description}</p>}
          <button type="button" ref={renameButtonRef} className="notebook-link" onClick={handleOpen}>
            Rename
          </button>
        </>
      )}
    </section>
  );
}
