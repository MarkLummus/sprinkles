// The styles table's seed (LIB-09, D-12): the four ice cream styles with the
// bands and extra fields Mark approved on look-style-bands, decide-style-pac-band
// and decide-style-extra-fields (.planning/notes/2026-10-16-style-bands-draft.md).
// Stored and not read in v2.0 apart from the bands Phase 10 fills in.
//
// A band is [low, high] in the shape a version's targets use (percent of the mix
// by weight). A blank band is an absent key: PAC is blank on all four styles
// (Mark's model computes a PAC target per recipe from its serve temperature) and
// sugar is blank because his model has no sugar-percent range; Sorbet leaves fat
// and milk solids unbanded too. Numbers are Mark's approved values, unrounded
// (Gelato's serve temperature is -12.5).
//
// The extra ranges are { min, max }; French's egg yolk is open above (max null)
// with a typical range. serveTempC is { default, min, max }: a version's
// serveTempC is filled from that default when the maker picks the style (D-19).
// equipmentClass and calibrationFamily are plain ids (D-12): no tables for them
// yet, and nothing reads them in v2.0.
export const STYLE_ROWS = [
  {
    id: 'philadelphia',
    name: 'Philadelphia',
    order: 1,
    bands: { pod: [14, 18], fat: [10, 18], msnf: [8, 12], solids: [36, 42] },
    eggYolkPct: { min: 0, max: 5 },
    overrunPct: { min: 25, max: 100 },
    stabilizerPct: { min: 0.1, max: 0.5 },
    emulsifierPct: { min: 0.1, max: 0.3 },
    serveTempC: { default: -14, min: -16, max: -12 },
    equipmentClass: 'dipping_cabinet',
    calibrationFamily: 'dairy_scooped',
  },
  {
    id: 'french',
    name: 'French',
    order: 2,
    bands: { pod: [14, 18], fat: [10, 14], msnf: [8, 11], solids: [38, 42] },
    eggYolkPct: { min: 1.4, max: null, typicalMin: 2, typicalMax: 4 },
    overrunPct: { min: 20, max: 40 },
    stabilizerPct: { min: 0.1, max: 0.5 },
    emulsifierPct: { min: 0.1, max: 0.3 },
    serveTempC: { default: -14, min: -16, max: -12 },
    equipmentClass: 'dipping_cabinet',
    calibrationFamily: 'dairy_scooped',
  },
  {
    id: 'gelato',
    name: 'Gelato',
    order: 3,
    bands: { pod: [16, 22], fat: [4, 9], msnf: [8, 12], solids: [32, 42] },
    eggYolkPct: { min: 0, max: 3 },
    overrunPct: { min: 20, max: 35 },
    stabilizerPct: { min: 0.1, max: 0.5 },
    emulsifierPct: { min: 0.1, max: 0.3 },
    serveTempC: { default: -12.5, min: -14, max: -11 },
    equipmentClass: 'gelato_cabinet',
    calibrationFamily: 'dairy_scooped',
  },
  {
    id: 'sorbet',
    name: 'Sorbet',
    order: 4,
    bands: { pod: [24, 32], solids: [26, 36] },
    eggYolkPct: { min: 0, max: 0 },
    overrunPct: { min: 0, max: 30 },
    stabilizerPct: { min: 0.1, max: 0.5 },
    emulsifierPct: { min: 0, max: 0 },
    serveTempC: { default: -14, min: -16, max: -12 },
    equipmentClass: 'dipping_cabinet',
    calibrationFamily: 'nondairy_scooped',
  },
];
