// The churned olive oil version — transcribed verbatim from the printed sheet
// (olive-oil-ice-cream-800g_1.md) via the old-sprinkles slice's olive-oil.js
// (read, not imported). Method and authored notes are added by plan 01-02;
// this shape does not change when they arrive.
import { library } from './library.js';
import { SEED_CREATED_AT, VERSION_SCHEMA_VERSION } from '../store/versionLift.js';

// Deep-copy the ingredient record onto the row so a stored version is
// self-contained (D-05): a later edit to the shared `library` must never
// move a figure already computed from a version's own rows.
function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}

export const oliveOilVersion = {
  schemaVersion: VERSION_SCHEMA_VERSION,
  id: 'olive-oil-ice-cream-v1',
  recipeId: 'olive-oil-ice-cream',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  createdAt: SEED_CREATED_AT,
  recipeName: 'Olive Oil Ice Cream',
  versionLabel: '50 g oil · 800 g',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  headnote:
    'Scaled 0.8× from the 1 kg formula. All ratios unchanged — PAC, POD, fat, MSNF and total solids are identical to the full batch. Sized to two 16 oz Ball jars in a circulator bath.',
  rows: [
    { id: 'row-01', ...embed('Whole milk', library.wholeMilk, { grams: 370.4, step: 2, splitStep: 3, removed: false }) },
    { id: 'row-02', ...embed('Heavy cream', library.heavyCream, { grams: 252.8, step: 3, removed: false }) },
    { id: 'row-03', ...embed('Graza Drizzle', library.oliveOil, { grams: 40, step: 8, removed: false }) },
    { id: 'row-04', ...embed('Skim milk powder', library.skimMilkPowder, { grams: 22.4, step: 3, removed: false }) },
    { id: 'row-05', ...embed('Sucrose', library.sucrose, { grams: 76, step: 2, splitStep: 3, removed: false }) },
    { id: 'row-06', ...embed('Allulose', library.allulose, { grams: 20, step: 6, removed: false }) },
    { id: 'row-07', ...embed('Dextrose', library.dextrose, { grams: 12, step: 3, removed: false }) },
    { id: 'row-08', ...embed('Fine sea salt', library.salt, { grams: 3.2, step: 3, removed: false }) },
    { id: 'row-09', ...embed('Soy lecithin', library.lecithin, { grams: 1.2, step: 8, removed: false }) },
    { id: 'row-10', ...embed('Locust bean gum', library.locustBeanGum, { grams: 1.04, step: 2, removed: false }) },
    { id: 'row-11', ...embed('Guar gum', library.guarGum, { grams: 0.48, step: 2, removed: false }) },
    { id: 'row-12', ...embed('Lambda carrageenan', library.carrageenan, { grams: 0.16, step: 2, removed: false }) },
  ],
  // No `sugar` key: the sheet authored no band for sugar solids (D-10).
  targets: {
    pac: [22, 26],
    pod: [12, 16],
    fat: [16, 20],
    msnf: [7.5, 10],
    solids: [38, 42],
  },
  equipment: {
    scale: 'Kitchen scale',
    scaleResolutionG: 1,
    precisionScaleResolutionG: 0.01,
    batchesAhead: 4,
    machine: 'Whynter',
    minFillG: 700,
  },
  process: { pasteuriseC: 69, holdMinutes: 40 },
  // D-08: every Ice Ed export field has a home. The sheet states serve and
  // overrun as ranges (method targets); these scalar slots stay null rather
  // than being filled with an invented midpoint.
  iceEd: { style: null, servingTemperatureC: null, hardness: null, overrunPercent: null },
  // The axes this recipe declares for itself, each carrying its own
  // behavioural anchor words authored on the version (D-15), so a tasting's
  // marks always have something to read against. 02-03 renders them;
  // nothing here changes when it does.
  declaredAxes: [
    { name: 'Olive oil character', low: "can't find it", high: 'tastes of oil first' },
    { name: 'Bitterness', low: 'none', high: 'catches the throat' },
  ],
  // Prose instruction with typed targets beside it. Purpose is why the step
  // exists — diagnostic input. Aside is what to watch while doing it. They
  // are different fields, omitted (not blank) when the sheet has neither.
  method: [
    {
      n: 1,
      leadIn: 'Lecithin into the oil',
      instruction: 'Whisk 1.2 g soy lecithin into the 40 g of Drizzle. Cover, leave at room temperature.',
      targets: [{ label: 'temp', value: 'room' }],
      purpose: "It's lipophilic — it disperses poorly if added to the water phase.",
      removed: false,
      // D-08, confirmed by Mark: soy lecithin, Graza Drizzle.
      uses: ['row-09', 'row-03'],
    },
    {
      n: 2,
      leadIn: 'Gum slurry — the only high-heat step',
      instruction:
        'Toss 1.68 g of the gum blend with ~12 g of the sucrose. Whisk into 120 g of the milk in a small saucepan. Heat, whisking constantly, then pull off.',
      targets: [
        { label: 'temp', value: '85 °C' },
        { label: 'hold', value: '2 min' },
      ],
      aside:
        'At 120 g this is a thin layer in the pan. It scorches and evaporates faster than a larger volume would — keep whisking and don’t walk away.',
      removed: false,
      // D-08: locust bean gum, guar gum, lambda carrageenan, sucrose, whole milk.
      uses: ['row-10', 'row-11', 'row-12', 'row-05', 'row-01'],
    },
    {
      n: 3,
      leadIn: 'Build the base',
      instruction:
        'Whisk the remaining sucrose (~64 g), plus 22.4 g SMP, 12 g dextrose and 3.2 g salt, into the remaining milk (~250 g) and all 252.8 g of cream. Add the hot gum slurry. Immersion blend.',
      targets: [{ label: 'blend', value: '60 s' }],
      removed: false,
      // D-08: sucrose, skim milk powder, dextrose, fine sea salt, whole milk, heavy cream.
      uses: ['row-05', 'row-04', 'row-07', 'row-08', 'row-01', 'row-02'],
    },
    {
      n: 4,
      leadIn: 'Divide',
      instruction: 'Tare, pour, check.',
      targets: [{ label: 'per jar', value: '379 g' }],
      purpose:
        'Mismatched jars hit core temperature at different times and you would be timing off the wrong one.',
      aside:
        'Two-piece lids finger-tight only — the headspace air expands and needs to vent rather than build pressure.',
      removed: false,
      uses: [],
    },
    {
      n: 5,
      leadIn: 'Pasteurise in the circulator',
      instruction: 'Start the clock when the jar core reaches temperature.',
      targets: [
        { label: 'temp', value: '69 °C' },
        { label: 'hold', value: '40 min' },
        { label: 'come-up', value: '10–12 min' },
      ],
      purpose:
        'With 379 g in a squat wide-mouth jar the come-up is much faster than a single large vessel.',
      aside: 'Probe the core rather than trusting the estimate. Invert each jar once or twice partway through.',
      removed: false,
      uses: [],
    },
    {
      n: 6,
      leadIn: 'Allulose in, then crash-cool',
      instruction:
        'Combine both jars, stir in the 20 g allulose off the heat until dissolved, then straight into an ice bath.',
      targets: [{ label: 'to', value: 'below 5 °C' }],
      aside: 'Allulose skips the hold — it browns readily with milk proteins.',
      removed: false,
      // D-08: allulose.
      uses: ['row-06'],
    },
    {
      n: 7,
      leadIn: 'Age',
      instruction: 'Hold covered in the fridge.',
      targets: [
        { label: 'temp', value: '4 °C' },
        { label: 'time', value: '12–24 h' },
      ],
      removed: false,
      uses: [],
    },
    {
      n: 8,
      leadIn: 'Emulsify the oil, cold',
      instruction:
        'Mix still at 4 °C. Pour the lecithin-oil blend in a thin stream under a running immersion blender.',
      targets: [
        { label: 'temp', value: '4 °C' },
        { label: 'blend', value: '45 s' },
      ],
      aside: 'Never heat this oil.',
      removed: false,
      // D-08: Graza Drizzle, soy lecithin.
      uses: ['row-03', 'row-09'],
    },
    {
      n: 9,
      leadIn: 'Churn',
      instruction: 'Freeze immediately.',
      targets: [{ label: 'overrun', value: '25–30%' }],
      removed: false,
      uses: [],
    },
    {
      n: 10,
      leadIn: 'Harden, and serve warm',
      instruction: 'Harden, then temper before serving.',
      targets: [
        { label: 'harden', value: '−20 °C, 4+ h' },
        { label: 'serve', value: '−11 to −12 °C' },
      ],
      removed: false,
      uses: [],
    },
  ],
  // Authored, not derived — judgement the app cannot reach. The sheet also
  // prints an ultra-pasteurised-dairy note under "Carried forward" and a
  // machine-minimum-fill note under "Before you start"; both are *derived*
  // structural advisories Phase 3 computes (FORM2-02) and are deliberately
  // held here — restating a derived figure as authored judgement is exactly
  // the mixing the brief separates. Each note is { text, inheritedFrom }:
  // inheritedFrom is null on a version's own authored notes, and carries a
  // parent's version line on a note a child inherited unedited (D-10).
  authored: {
    carriedForward: [
      {
        text: 'Gellan in the cream — roughly 0.03–0.09 g at this cream weight, an estimate with no published spec. Below anything you would taste, against 1.68 g of deliberate stabiliser.',
        inheritedFrom: null,
      },
      {
        text: 'No glucose syrup — less costly at 13% milkfat than it would be at 8%, since the milkfat is carrying structure the DE42 would have provided.',
        inheritedFrom: null,
      },
      {
        text: 'This is the low anchor, not the oil-forward target. Oil is 28% of total fat. Expect a textural contribution and background flavour, not a dominant one.',
        inheritedFrom: null,
      },
    ],
    beforeYouStart: [
      {
        text: 'Taste the Graza straight. Polyphenols degrade with light and oxygen, and the squeeze bottle offers less protection than dark glass. An old bottle at 40 g will disappear entirely.',
        inheritedFrom: null,
      },
      {
        text: 'Check the cream’s actual butterfat. The carton states a 36% minimum, which is a floor.',
        inheritedFrom: null,
      },
    ],
  },
};
