// The twelve fixed process stage ids, in process order (D-20; the process-stages
// note, .planning/notes/2026-10-18-process-stages.md, section 2).
//
// The app defines this list and a maker cannot add to it. In v2.0 only the
// library converter (app/scripts/convert-ingredient-seed.mjs) and the library
// validator (plan 09-09) read it, to check an ingredient's defaultStage. The
// stage model itself is a Phase 11 discussion (decide-process-stage-model).
//
// Pure. Framework-free. Imports nothing.

export const STAGE_IDS = Object.freeze([
  'prep',
  'dry_blend',
  'hydrate',
  'combine',
  'heat',
  'after_heat',
  'cool',
  'age',
  'before_churn',
  'during_churn',
  'pack',
  'harden',
]);
