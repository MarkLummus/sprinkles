// One field-owned feedback line for every pen. An actionable error replaces
// quiet required guidance in the same location, so validation never adds a
// second message or changes the field's accessible name.
export function FieldFeedback({ error = null, errorId, required = false }) {
  if (error) {
    return (
      <span id={errorId} className="field-error">
        {error}
      </span>
    );
  }

  if (required) {
    return <span className="field-requirement" aria-hidden="true">Required</span>;
  }

  return null;
}
