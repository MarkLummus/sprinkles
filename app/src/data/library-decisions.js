// Recorded decisions on the reviewed dataset's same-ingredient cases (Phase 9, plan 09-07;
// decision 1, LIB-05). Where the dataset and the app disagree on one ingredient the app's
// value stays and the case is recorded here, so a difference is a decided case and never
// a silent one. Nothing in the 26 existing library entries was replaced by a dataset figure.
//
// One 'same' record per same pair of the approved mapping (app/scripts/ingredient-mapping.json).
// `differs` names the fields whose converted dataset value differs from the app's beyond the
// tolerance (0.0005 for a composition fraction, 0.05 for PAC and POD); [] is a pair whose
// figures all match. The seven conflicts the decision names (dextrose, salt, fructose,
// strawberries, skim milk powder, coconut milk, heavy cream) carry a note. A note quotes the
// app value and the converted value for each differing field exactly as
// app/scripts/ingredient-seed-checks.json writes them, copied from that file by
// the plan's run, never typed from memory. Coconut milk is marked a different product,
// so its record is relation 'different'; its dataset row is added under its own key.
//
// library-seed-db.test.js is the gate: it recomputes each pair's differing fields from
// data/library.js and the converter's figures, and fails when a pair has no record,
// when a record names a field that no longer differs, when one omits a field that does,
// or when a note's quoted figure is missing.

export const libraryDecisions = [
  {
    datasetId: 'allulose',
    libraryId: 'allulose',
    relation: 'same',
    differs: [],
    decision: 'app value kept',
  },
  {
    datasetId: 'cinnamon',
    libraryId: 'cinnamon',
    relation: 'same',
    differs: [],
    decision: 'app value kept',
  },
  {
    datasetId: 'cocoa-powder',
    libraryId: 'cocoaPowder',
    relation: 'same',
    differs: [],
    decision: 'app value kept',
  },
  {
    datasetId: 'coffee-beans',
    libraryId: 'coffeeBeans',
    relation: 'same',
    differs: [],
    decision: 'app value kept',
  },
  {
    datasetId: 'dextrose',
    libraryId: 'dextrose',
    relation: 'same',
    differs: ['pac', 'pod', 'sugar'],
    decision: 'app value kept',
    note: 'PAC 190 kept; the dataset says 174.8; POD 70 kept; the dataset says 74; Sugar 1 kept; the dataset says 0.92',
  },
  {
    datasetId: 'fructose',
    libraryId: 'fructose',
    relation: 'same',
    differs: ['pod'],
    decision: 'app value kept',
    note: 'POD 170 kept; the dataset says 173',
  },
  {
    datasetId: 'guar-gum',
    libraryId: 'guarGum',
    relation: 'same',
    differs: ['stabilizer'],
    decision: 'app value kept',
  },
  {
    datasetId: 'heavy-cream-36',
    libraryId: 'heavyCream',
    relation: 'same',
    differs: ['msnf'],
    decision: 'app value kept',
    note: 'MSNF 0.054 kept; the dataset says 0.056',
  },
  {
    datasetId: 'lambda-carrageenan',
    libraryId: 'carrageenan',
    relation: 'same',
    differs: ['stabilizer'],
    decision: 'app value kept',
  },
  {
    datasetId: 'lecithin',
    libraryId: 'lecithin',
    relation: 'same',
    differs: ['emulsifier'],
    decision: 'app value kept',
  },
  {
    datasetId: 'locust-bean-gum',
    libraryId: 'locustBeanGum',
    relation: 'same',
    differs: ['stabilizer'],
    decision: 'app value kept',
  },
  {
    datasetId: 'pineapple',
    libraryId: 'pineapple',
    relation: 'same',
    differs: [],
    decision: 'app value kept',
  },
  {
    datasetId: 'salt',
    libraryId: 'salt',
    relation: 'same',
    differs: ['pac'],
    decision: 'app value kept',
    note: 'PAC 580 kept; the dataset says 586',
  },
  {
    datasetId: 'skim-milk-powder',
    libraryId: 'skimMilkPowder',
    relation: 'same',
    differs: ['fat', 'msnf'],
    decision: 'app value kept',
    note: 'Fat 0.01 kept; the dataset says 0.007; MSNF 0.97 kept; the dataset says 0.963',
  },
  {
    datasetId: 'stabilizer-mix-4421',
    libraryId: 'stabilizerMix4421',
    relation: 'same',
    differs: ['other', 'stabilizer'],
    decision: 'app value kept',
  },
  {
    datasetId: 'strawberries',
    libraryId: 'strawberries',
    relation: 'same',
    differs: ['other', 'pac', 'pod', 'sugar'],
    decision: 'app value kept',
    note: 'Other 0.0378 kept; the dataset says 0.0334; PAC 8.5 kept; the dataset says 10.06; POD 6.1 kept; the dataset says 9.8; Sugar 0.049 kept; the dataset says 0.0534',
  },
  {
    datasetId: 'sucrose',
    libraryId: 'sucrose',
    relation: 'same',
    differs: ['pac', 'sugar'],
    decision: 'app value kept',
  },
  {
    datasetId: 'vanilla-extract',
    libraryId: 'vanillaExtract',
    relation: 'same',
    differs: [],
    decision: 'app value kept',
  },
  {
    datasetId: 'coconut-milk',
    libraryId: 'coconutMilk',
    relation: 'different',
    differs: [],
    decision: 'different product: the app entry is kept and the dataset row is added under its own key',
    note: "The app's coconutMilk and the dataset's coconut-milk are different products; the app entry is kept and the dataset row is added as coconutMilk208.",
  },
];
