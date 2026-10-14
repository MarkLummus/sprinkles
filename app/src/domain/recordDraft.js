// Pure. No framework, no DOM, no store import.
// The record pen's draft (recording, correcting and tasting a batch), read and
// checked by pure functions, which RecipePage drives through useRecordDraft
// (Phase 5, D-01).
import { BATTERY_FIELDS, parseMeasuredDraft } from './battery.js';

// The record pen's blocked-date sentence (D-05) — one constant, read from
// both handleSaveBatch (via validateRecordDraft) and the ceremony's own
// hint prop, so the "one state, two renderings" grep (03.3.1-02 Task 2
// acceptance) can never find it typed out a second time.
export const CHURN_DATE_BLOCKED_MESSAGE = 'Enter the date you churned.';

// parseAllMeasuredFields(draft) -> { fieldErrors, hasErrors, parsed }.
// Pure: walks BATTERY_FIELDS, parsing each field through
// parseMeasuredDraft. A malformed value's own contract sentence
// (BATTERY_FIELDS' own `error` string, verbatim) lands in fieldErrors;
// `parsed` is every field's own { ok, value }, reused by the save
// assembly below so a field is never parsed twice. 03.3.1-02 Task 1's own
// scope: "if any field is malformed, record per-field errors and abort —
// storing the errors and aborting is enough." The full field-level UI
// wiring (aria-invalid/describedby, the field-error line, focus-on-first-
// invalid) and the churn-date press-to-block (D-05) are Task 2's build.
export function parseAllMeasuredFields(draft) {
  const fieldErrors = {};
  const parsed = {};
  let hasErrors = false;
  for (const field of BATTERY_FIELDS) {
    const result = parseMeasuredDraft(draft[field.key], { signed: field.signed });
    parsed[field.key] = result;
    if (!result.ok) {
      fieldErrors[field.key] = field.error;
      hasErrors = true;
    }
  }
  return { fieldErrors, hasErrors, parsed };
}

// validateRecordDraft(draft) -> { fieldErrors, invalidFieldKey,
// blockedDateMessage, parsed }. Pure (03.3.1-02 Task 2): the record pen's
// one save gate. Every measurement validates first (RESEARCH.md Open
// Question 3), via parseAllMeasuredFields above; only once every
// measurement is clean does the churn date get its own press-to-block
// check (D-05) — the two blocks never fire together, so a sentence and
// its target can never disagree (one traversal). invalidFieldKey names
// the first invalid field in BATTERY_FIELDS order — Object.keys on a
// plain object preserves string-key insertion order, and fieldErrors is
// built by iterating BATTERY_FIELDS in that same order, so the first key
// is the first field the traversal found invalid.
export function validateRecordDraft(draft) {
  const { fieldErrors, hasErrors, parsed } = parseAllMeasuredFields(draft);
  if (hasErrors) {
    return { fieldErrors, invalidFieldKey: Object.keys(fieldErrors)[0], blockedDateMessage: null, parsed };
  }
  const blockedDateMessage = draft.churnDate === '' ? CHURN_DATE_BLOCKED_MESSAGE : null;
  return { fieldErrors: {}, invalidFieldKey: null, blockedDateMessage, parsed };
}
