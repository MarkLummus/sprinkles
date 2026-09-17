// The 2 Aug 2026 working case, confirmed by Mark (03.3.1-CONTEXT.md D-07)
// — the sheet's own values transcribed onto the battery. Built through one
// createBatch call, the same function a maker's own save calls, so the
// stored record is indistinguishable from one that was typed. The id and
// recordedAt below are fixed so the seeded batch's URL and recorded-on
// line are stable across installs; every batch the maker records still
// gets a fresh crypto.randomUUID() and new Date() from the one save
// handler that calls createBatch.
import { createBatch } from '../domain/batch.js';
import { oliveOilVersion } from './olive-oil.js';

const BATCH_ID = 'b8cc3566-48a4-4b23-b6e5-749a332afe89';

const churnFields = {
  churnDate: '2026-08-02',
  asMade: {
    'row-01': [120, 263], // whole milk, the sheet's own two lines
    'row-02': [241], // heavy cream
    'row-03': [45], // Graza Drizzle — "Actually 45 g", written during the churn (D-12)
    'row-09': [0], // soy lecithin skipped (D-11): a real 0, distinct from an untouched row
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
  timeToDrawTempMinutes: 20,
  outOfMachineTempC: -6,
  churnDurationMinutes: 30,
  // Neither was a number on the sheet — the overrun "?" was never
  // measured, so both segmented picks stay absent rather than guessed.
  exitConsistency: null,
  airiness: null,
  atTheMachine: 'Soft, not greasy',
  ingredientNotes: 'oil bottle opened 24 Jul',
  nextTimeNote: null,
};

// One tasting, undated, so it reads "date unknown": tasting temperature
// −12 °C, melt test 3 g at 20 min, no note, oil character 4 and sweetness
// 4 marked — hardness, scoopability, smoothness and body left unmarked —
// and bitterness 5 on the sheet has no whole stop on the battery, so it
// becomes the Bitter toggle under "This recipe only" (D-07).
const tastingFields = {
  tastedDate: null,
  temperingMinutes: null,
  tastingTempC: -12,
  marks: { sweetness: 4, oil: 4 },
  note: null,
  defects: null,
  bitterDeclared: true,
  meltTestG: 3,
  meltStyle: null,
};

export const augustSecondBatch = createBatch(oliveOilVersion, churnFields, tastingFields, {
  id: BATCH_ID,
  now: '2026-08-04T00:00:00.000Z',
});
