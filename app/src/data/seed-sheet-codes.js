// The Sheet code each seeded version prints, keyed by version id.
//
// Computed once with the legacy sheetCode() (SHEET_CODE_DERIVATION
// 'sprinkles-sheet-code:1', domain/sheetCode.js) so every sheet already printed
// still finds its version (Phase 9 D-05). Never recomputed at run time:
// data/seed-recipes.js stamps these onto the seed versions, and
// seed-recipes.test.js fails if one differs from sheetCode() over the seed.
export const SEED_SHEET_CODES = Object.freeze({
  'olive-oil-ice-cream-v1': '64JH-G408',
  'mexican-chocolate-v1': '4144-RCQJ',
  'mexican-chocolate-v2': 'GQ9X-TDYQ',
  'mexican-chocolate-v3': 'TR42-P6KM',
  'mexican-chocolate-v4': 'N2MS-PP5E',
  'pineapple-v1': 'SE1M-QSAC',
  'coconut-v1': '9A0Q-SMSK',
  'coconut-v2': '1F87-0MQK',
  'strawberry-v1': 'N95Q-H35G',
  'strawberry-v2': 'VXY7-T54A',
  'strawberry-v2-1': '5XKG-WTQG',
  'standard-base-v1': 'PSJV-GZT0',
  'standard-base-v2': 'XGFN-DNT0',
  'underbelly-light-base-v1': 'CPXD-3J6G',
  'underbelly-light-base-v2': 'H8KH-C5DQ',
  'mocha-v0': 'ZDE7-P3JQ',
  'mocha-v1': 'K54H-XTPZ',
  'mocha-v2': 'CWFA-F70F',
  'mocha-v3': 'W1DE-AB2R',});
