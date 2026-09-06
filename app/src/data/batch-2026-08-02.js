// The 2 Aug 2026 working case, confirmed by Mark in the Phase 2 discussion
// (02-CONTEXT.md D-10 to D-13). Built through createBatch and addTasting —
// the same functions a maker's own save calls — so the stored record is
// indistinguishable from one that was typed. The id and recordedAt below
// are fixed so the seeded batch's URL and recorded-on line are stable
// across installs; every batch the maker records still gets a fresh
// crypto.randomUUID() and new Date() from the one save handler that calls
// these functions.
import { createBatch, addTasting } from '../domain/batch.js';
import { oliveOilVersion } from './olive-oil.js';

const BATCH_ID = 'b8cc3566-48a4-4b23-b6e5-749a332afe89';
const TASTING_ID = 'f2f6f9c1-6c9f-4b8a-9c1e-2a1f7e6d9a02';

const churnFields = {
  churnDate: '2026-08-02',
  asMade: {
    'row-01': 383, // whole milk, the sheet's 120 g + 263 g
    'row-02': 241, // heavy cream
    'row-03': 45, // Graza Drizzle — "Actually 45 g", written during the churn (D-12)
    'row-09': 0, // soy lecithin skipped (D-11): a real 0, distinct from an untouched row
  },
  // Sucrose and the gums matched the plan, so nothing was written beside
  // them and nothing is written for them here.
  stepChanges: {
    // Skipped, drizzled instead — the strike alone, no line (D-10).
    '1': { struck: true, line: null },
    '8': { struck: false, line: 'blend 60 s' },
    // Step 9's annotation reads a change of machine speed at 20 minutes,
    // not a setting named "Speed A" (D-10's correction).
    '9': {
      struck: false,
      line: 'Fast, Soft, Prechill 15 min. Speed Δ @ 20 min, really thick @ 24, full churn 30',
    },
    // Step 3 carries nothing: its amounts changed only because the table
    // did, and the as-made column already says so (D-13).
  },
  comeUpMinutes: 20,
  drawTempC: -6,
  // The sheet wrote a question mark: unmeasured, stored absent, never 0.
  overrunPercent: null,
  drawNotes: 'Soft, not greasy',
  ingredientNotes: 'Oil bottle open date 24 Jul 2026',
  nextTimeNote: null,
};

const batchBeforeTasting = createBatch(oliveOilVersion, churnFields, {
  id: BATCH_ID,
  now: '2026-08-04T00:00:00.000Z',
});

// One tasting, undated, so it reads "date unknown": tasting temperature
// −12 °C, meltdown loss 3 g at 20 min, no words, and marks of olive oil
// character 4.5, bitterness 5, sweetness 4 — hardness, scoopability and
// smoothness left unmarked.
export const augustSecondBatch = addTasting(
  batchBeforeTasting,
  {
    date: null,
    tastingTempC: -12,
    marks: {
      'Olive oil character': 4.5,
      Bitterness: 5,
      sweetness: 4,
    },
    meltdownLossG: 3,
    words: null,
    nextTimeNote: null,
  },
  { id: TASTING_ID },
);
