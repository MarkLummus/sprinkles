// The shared validators for the library and the four seed tables (LIB-09, D-17,
// D-20), the collection check every later gate shares (catalogConflicts,
// mergeById, CatalogConflictError), and the seed rows themselves. Pure: no
// store, no DOM.
import { describe, it, expect } from 'vitest';
import {
  validateLibraryRecord,
  validateMachineRow,
  validateStyleRow,
  validateScaleRow,
  validateProblemRow,
  SEED_TABLES,
  catalogConflicts,
  mergeById,
  CatalogConflictError,
  firstDamagedTable,
  bootDamagedLine,
} from './seedTables.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { STYLE_ROWS } from '../data/styles.js';
import { CORE_SCALE_ROWS } from '../data/core-scales.js';
import { CORE_PROBLEM_ROWS } from '../data/core-problems.js';
import { MACHINE_ROWS } from '../data/machines.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { library } from '../data/library.js';

function errorsOf(validate, row) {
  const errors = [];
  validate(row, '$.row', errors);
  return errors;
}

const [whynter] = MACHINE_ROWS;
const [philadelphia, french, gelato, sorbet] = STYLE_ROWS;
const allVersions = seedRecipeGroups.flatMap((group) => group.versions);

describe('every seed row passes its validator', () => {
  it('the machines, styles, scales and problems rows are valid', () => {
    for (const row of MACHINE_ROWS) expect(errorsOf(validateMachineRow, row), row.id).toEqual([]);
    for (const row of STYLE_ROWS) expect(errorsOf(validateStyleRow, row), row.id).toEqual([]);
    for (const row of CORE_SCALE_ROWS) expect(errorsOf(validateScaleRow, row), row.id).toEqual([]);
    for (const row of CORE_PROBLEM_ROWS) expect(errorsOf(validateProblemRow, row), row.id).toEqual([]);
  });

  it('SEED_TABLES maps the five tables to a validator and the plain word a maker reads', () => {
    expect(Object.keys(SEED_TABLES).sort()).toEqual(['library', 'machines', 'problems', 'scales', 'styles']);
    expect(SEED_TABLES.library.validate).toBe(validateLibraryRecord);
    expect(SEED_TABLES.machines.validate).toBe(validateMachineRow);
    expect(SEED_TABLES.styles.validate).toBe(validateStyleRow);
    expect(SEED_TABLES.scales.validate).toBe(validateScaleRow);
    expect(SEED_TABLES.problems.validate).toBe(validateProblemRow);
    expect(Object.values(SEED_TABLES).map((table) => table.word)).toEqual([
      'ingredients',
      'machines',
      'ice cream styles',
      'scales',
      'problems',
    ]);
  });

  it('SEED_CATALOG gathers the four tables', () => {
    expect(SEED_CATALOG).toEqual({ scales: CORE_SCALE_ROWS, problems: CORE_PROBLEM_ROWS, machines: MACHINE_ROWS, styles: STYLE_ROWS });
  });
});

// The words are pinned as literals here, in the battery's order: the domain
// holds no list of its own (plan 09-15, D-01), so a change to a seed word is a
// change to this test as well.
describe('the seed rows carry the battery’s scales and problems', () => {
  it('the scale rows are the battery’s six goldilocks scales, the first four core', () => {
    expect(CORE_SCALE_ROWS.map(({ key, name, low, high, group }) => ({ key, name, low, high, group }))).toEqual([
      { key: 'hardness', name: 'Hardness', low: 'soft', high: 'hard', group: 'core' },
      { key: 'scoopability', name: 'Scoopability', low: 'crumbly', high: 'gummy', group: 'core' },
      { key: 'smoothness', name: 'Smoothness', low: 'grainy', high: 'smooth', group: 'core' },
      { key: 'sweetness', name: 'Sweetness', low: 'less', high: 'more', group: 'core' },
      { key: 'body', name: 'Body', low: 'thin', high: 'heavy', group: 'declared' },
      { key: 'oil', name: 'Oil', low: 'faint', high: 'strong', group: 'declared' },
    ]);
    expect(CORE_SCALE_ROWS.map((row) => row.kind)).toEqual(Array(6).fill('goldilocks'));
  });

  it('the problem rows are the battery’s four core problems, comma-worded, in order', () => {
    expect(CORE_PROBLEM_ROWS.map((row) => row.name)).toEqual(['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film']);
  });
});

describe('the styles seed holds Mark’s approved numbers', () => {
  it('has the four styles in order, with no pac or sugar band on any', () => {
    expect(STYLE_ROWS.map((row) => row.id)).toEqual(['philadelphia', 'french', 'gelato', 'sorbet']);
    expect(STYLE_ROWS.map((row) => row.name)).toEqual(['Philadelphia', 'French', 'Gelato', 'Sorbet']);
    for (const row of STYLE_ROWS) {
      expect(Object.hasOwn(row.bands, 'pac'), row.id).toBe(false);
      expect(Object.hasOwn(row.bands, 'sugar'), row.id).toBe(false);
    }
  });

  it('keeps the bands, ranges and serve temperatures unrounded', () => {
    expect(philadelphia.bands).toEqual({ pod: [14, 18], fat: [10, 18], msnf: [8, 12], solids: [36, 42] });
    expect(french.bands).toEqual({ pod: [14, 18], fat: [10, 14], msnf: [8, 11], solids: [38, 42] });
    expect(gelato.bands).toEqual({ pod: [16, 22], fat: [4, 9], msnf: [8, 12], solids: [32, 42] });
    expect(sorbet.bands).toEqual({ pod: [24, 32], solids: [26, 36] });
    expect(french.eggYolkPct).toEqual({ min: 1.4, max: null, typicalMin: 2, typicalMax: 4 });
    expect(sorbet.eggYolkPct).toEqual({ min: 0, max: 0 });
    expect(sorbet.emulsifierPct).toEqual({ min: 0, max: 0 });
    expect(gelato.serveTempC).toEqual({ default: -12.5, min: -14, max: -11 });
    for (const row of [philadelphia, french, sorbet]) expect(row.serveTempC).toEqual({ default: -14, min: -16, max: -12 });
    expect(STYLE_ROWS.map((row) => [row.equipmentClass, row.calibrationFamily])).toEqual([
      ['dipping_cabinet', 'dairy_scooped'],
      ['dipping_cabinet', 'dairy_scooped'],
      ['gelato_cabinet', 'dairy_scooped'],
      ['dipping_cabinet', 'nondairy_scooped'],
    ]);
  });

  it('seeds the Whynter with a 700 g minimum fill and no maximum', () => {
    expect(whynter).toEqual({ id: 'whynter', name: 'Whynter', minFillG: 700, maxFillG: null, order: 1 });
  });
});

describe('validateMachineRow', () => {
  it('refuses an unsafe id, a string minFillG and a maxFillG below minFillG, each at its path', () => {
    expect(errorsOf(validateMachineRow, { ...whynter, id: '__proto__' })).toEqual([
      expect.stringContaining('$.row.id'),
    ]);
    expect(errorsOf(validateMachineRow, { ...whynter, minFillG: '700' })).toEqual([expect.stringContaining('$.row.minFillG')]);
    expect(errorsOf(validateMachineRow, { ...whynter, maxFillG: 600 })).toEqual([expect.stringContaining('$.row.maxFillG')]);
  });

  it('accepts a maxFillG that is null or at least minFillG', () => {
    expect(errorsOf(validateMachineRow, { ...whynter, maxFillG: 700 })).toEqual([]);
    expect(errorsOf(validateMachineRow, { ...whynter, maxFillG: 1000 })).toEqual([]);
    expect(errorsOf(validateMachineRow, { ...whynter, maxFillG: null })).toEqual([]);
  });

  it('names a row that is not an object, and never throws on junk', () => {
    expect(errorsOf(validateMachineRow, null)).toEqual(['$.row: expected an object']);
    expect(errorsOf(validateMachineRow, 'x')).toEqual(['$.row: expected an object']);
  });
});

describe('validateStyleRow', () => {
  it('refuses a band [18, 14], at the band’s path', () => {
    const errors = errorsOf(validateStyleRow, { ...philadelphia, bands: { ...philadelphia.bands, pod: [18, 14] } });
    expect(errors).toEqual([expect.stringContaining('$.row.bands.pod')]);
  });

  it('refuses a band key outside pac, pod, fat, msnf, sugar and solids', () => {
    const errors = errorsOf(validateStyleRow, { ...philadelphia, bands: { ...philadelphia.bands, protein: [1, 2] } });
    expect(errors).toEqual([expect.stringContaining('$.row.bands.protein')]);
  });

  it('accepts a pac or sugar band when one is given, since a blank band is only an absent key', () => {
    expect(errorsOf(validateStyleRow, { ...philadelphia, bands: { ...philadelphia.bands, pac: [20, 24], sugar: [12, 16] } })).toEqual([]);
  });

  it('refuses a missing calibrationFamily', () => {
    const { calibrationFamily, ...without } = philadelphia;
    expect(errorsOf(validateStyleRow, without)).toEqual([expect.stringContaining('$.row.calibrationFamily')]);
  });

  it('refuses a serveTempC whose default is a string, or lies outside its range', () => {
    expect(errorsOf(validateStyleRow, { ...philadelphia, serveTempC: { default: '-14', min: -16, max: -12 } })).toEqual([
      expect.stringContaining('$.row.serveTempC.default'),
    ]);
    expect(errorsOf(validateStyleRow, { ...philadelphia, serveTempC: { default: -10, min: -16, max: -12 } })).toEqual([
      expect.stringContaining('$.row.serveTempC.default'),
    ]);
    expect(errorsOf(validateStyleRow, { ...philadelphia, serveTempC: { default: -14, min: -10, max: -12 } }).length).toBeGreaterThan(0);
  });

  it('refuses an unsafe id', () => {
    expect(errorsOf(validateStyleRow, { ...philadelphia, id: 'constructor' })).toEqual([expect.stringContaining('$.row.id')]);
  });

  it('refuses a range whose max is below its min, and accepts an open max', () => {
    expect(errorsOf(validateStyleRow, { ...philadelphia, overrunPct: { min: 50, max: 20 } })).toEqual([
      expect.stringContaining('$.row.overrunPct.max'),
    ]);
    expect(errorsOf(validateStyleRow, french)).toEqual([]);
  });
});

describe('validateScaleRow', () => {
  const [hardness] = CORE_SCALE_ROWS;

  it('refuses a row whose id differs from its key', () => {
    expect(errorsOf(validateScaleRow, { ...hardness, id: 'other' })).toEqual([expect.stringContaining('$.row.id')]);
  });

  it('refuses kind "stars" and group "other"', () => {
    expect(errorsOf(validateScaleRow, { ...hardness, kind: 'stars' })).toEqual([expect.stringContaining('$.row.kind')]);
    expect(errorsOf(validateScaleRow, { ...hardness, group: 'other' })).toEqual([expect.stringContaining('$.row.group')]);
  });

  it('refuses an unsafe id and key', () => {
    expect(errorsOf(validateScaleRow, { ...hardness, id: '__proto__', key: '__proto__' }).length).toBeGreaterThan(0);
  });
});

describe('validateProblemRow', () => {
  const [coarse] = CORE_PROBLEM_ROWS;

  it('refuses an empty name and an unsafe id', () => {
    expect(errorsOf(validateProblemRow, { ...coarse, name: '' })).toEqual([expect.stringContaining('$.row.name')]);
    expect(errorsOf(validateProblemRow, { ...coarse, id: 'prototype' })).toEqual([expect.stringContaining('$.row.id')]);
  });
});

describe('validateLibraryRecord, the six D-20 coefficient keys', () => {
  const COEFFICIENTS = ['fatStructural', 'ownEmulsifier', 'titratableAcidity', 'defaultStage', 'prepNote', 'requiresHeat'];
  const allNull = Object.fromEntries(COEFFICIENTS.map((key) => [key, null]));
  const allSet = {
    fatStructural: true,
    ownEmulsifier: false,
    titratableAcidity: 0.0015,
    defaultStage: 'dry_blend',
    prepNote: 'add as 50% solution',
    requiresHeat: true,
  };
  const recordWith = (coefficients) => ({ id: 'thing', entry: { name: 'Thing', composition: { fat: 1 }, ...coefficients } });

  it('accepts an entry with all six null, and one with all six set', () => {
    expect(errorsOf(validateLibraryRecord, recordWith(allNull))).toEqual([]);
    expect(errorsOf(validateLibraryRecord, recordWith(allSet))).toEqual([]);
  });

  it('accepts every entry of data/library.js', () => {
    for (const [id, entry] of Object.entries(library)) {
      expect(errorsOf(validateLibraryRecord, { id, entry }), id).toEqual([]);
    }
  });

  it('refuses a missing fatStructural, at the key’s path', () => {
    const { fatStructural, ...without } = allNull;
    expect(errorsOf(validateLibraryRecord, recordWith(without))).toEqual([
      '$.row.entry.fatStructural: expected an own key, null when unknown',
    ]);
  });

  it('refuses each of the six keys when missing', () => {
    for (const key of COEFFICIENTS) {
      const { [key]: _gone, ...without } = allNull;
      expect(errorsOf(validateLibraryRecord, recordWith(without)), key).toEqual([
        `$.row.entry.${key}: expected an own key, null when unknown`,
      ]);
    }
  });

  it('refuses fatStructural "yes", defaultStage "simmer", titratableAcidity "0.1" and -0.1, each at its path', () => {
    expect(errorsOf(validateLibraryRecord, recordWith({ ...allNull, fatStructural: 'yes' }))).toEqual([
      expect.stringContaining('$.row.entry.fatStructural'),
    ]);
    expect(errorsOf(validateLibraryRecord, recordWith({ ...allNull, defaultStage: 'simmer' }))).toEqual([
      expect.stringContaining('$.row.entry.defaultStage'),
    ]);
    expect(errorsOf(validateLibraryRecord, recordWith({ ...allNull, titratableAcidity: '0.1' }))).toEqual([
      expect.stringContaining('$.row.entry.titratableAcidity'),
    ]);
    expect(errorsOf(validateLibraryRecord, recordWith({ ...allNull, titratableAcidity: -0.1 }))).toEqual([
      expect.stringContaining('$.row.entry.titratableAcidity'),
    ]);
    expect(errorsOf(validateLibraryRecord, recordWith({ ...allNull, prepNote: 4 }))).toEqual([
      expect.stringContaining('$.row.entry.prepNote'),
    ]);
  });

  it('keeps its earlier checks: a record without a name or a composition is still refused', () => {
    expect(errorsOf(validateLibraryRecord, { id: 'x', entry: null })).toEqual(['$.row.entry: expected an object']);
    expect(errorsOf(validateLibraryRecord, { id: '__proto__', entry: { name: 'N', composition: {}, ...allNull } })).toEqual([
      expect.stringContaining('$.row.id'),
    ]);
  });
});

describe('catalogConflicts', () => {
  const seedLists = { scales: SEED_CATALOG.scales, problems: SEED_CATALOG.problems };

  it('returns [] for the seed’s own lists and every seeded version', () => {
    expect(catalogConflicts({ ...seedLists, versions: allVersions })).toEqual([]);
  });

  it('reports a core count other than four', () => {
    const scales = SEED_CATALOG.scales.map((row) => (row.key === 'sweetness' ? { ...row, group: 'declared' } : row));
    expect(catalogConflicts({ scales, problems: SEED_CATALOG.problems })).toEqual([{ kind: 'core-count', count: 3 }]);
  });

  it('reports a version declaring a scale whose key is a core row’s key', () => {
    const scales = SEED_CATALOG.scales.map((row) => {
      if (row.key === 'sweetness') return { ...row, group: 'declared' };
      if (row.key === 'oil') return { ...row, group: 'core' };
      return row;
    });
    const oliveOil = allVersions.filter((version) => version.id === 'olive-oil-ice-cream-v1');
    expect(catalogConflicts({ scales, problems: SEED_CATALOG.problems, versions: oliveOil })).toEqual([
      { kind: 'declared-core-key', versionId: 'olive-oil-ice-cream-v1', key: 'oil' },
    ]);
  });

  it('reports a problem name held by two rows', () => {
    const problems = [...SEED_CATALOG.problems, { id: 'icy', name: 'Coarse, icy', order: 5 }];
    expect(catalogConflicts({ scales: SEED_CATALOG.scales, problems })).toEqual([
      { kind: 'problem-name', name: 'Coarse, icy', ids: ['coarse-icy', 'icy'] },
    ]);
  });

  it('lists the conflicts in order: core-count, then declared-core-key, then problem-name', () => {
    const scales = SEED_CATALOG.scales.map((row) => (row.key === 'body' ? { ...row, group: 'core' } : row));
    const oliveOil = allVersions.filter((version) => version.id === 'olive-oil-ice-cream-v1');
    const problems = [...SEED_CATALOG.problems, { id: 'icy', name: 'Coarse, icy', order: 5 }];
    expect(catalogConflicts({ scales, problems, versions: oliveOil }).map((conflict) => conflict.kind)).toEqual([
      'core-count',
      'declared-core-key',
      'problem-name',
    ]);
  });

  it('never throws on a malformed list', () => {
    expect(() => catalogConflicts({ scales: 'x', problems: [null, 7], versions: [{ id: 'v', declaredAxes: 'x' }] })).not.toThrow();
    expect(() => catalogConflicts({})).not.toThrow();
    expect(() => catalogConflicts()).not.toThrow();
    expect(() => catalogConflicts({ scales: [null, { key: 3 }], problems: [{ name: 4 }], versions: [null, { declaredAxes: [null] }] })).not.toThrow();
  });
});

describe('mergeById', () => {
  it('replaces a stored row of the same id, keeps stored rows the incoming list lacks, and puts stored order first', () => {
    expect(mergeById([{ id: 'a', n: 1 }, { id: 'b', n: 1 }], [{ id: 'b', n: 2 }, { id: 'c', n: 1 }])).toEqual([
      { id: 'a', n: 1 },
      { id: 'b', n: 2 },
      { id: 'c', n: 1 },
    ]);
  });
});

describe('CatalogConflictError', () => {
  it('is an Error named CatalogConflictError carrying the conflicts it was given', () => {
    const conflicts = [{ kind: 'core-count', count: 5 }];
    const error = new CatalogConflictError(conflicts);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CatalogConflictError');
    expect(error.conflicts).toBe(conflicts);
  });
});

// The boot check (D-17): every row of the library and the four tables passes the
// store file's own validator, and the scales and problems hold together.
describe('firstDamagedTable, the boot check (D-17)', () => {
  const libraryRecords = Object.entries(library).map(([id, entry]) => ({ id, entry }));
  const lists = (over = {}) => ({
    library: libraryRecords,
    machines: structuredClone(MACHINE_ROWS),
    styles: structuredClone(STYLE_ROWS),
    scales: structuredClone(CORE_SCALE_ROWS),
    problems: structuredClone(CORE_PROBLEM_ROWS),
    ...over,
  });
  // The shape plan 09-03's shownFields renders: no basis, no source, its
  // cosmetic fields malformed, and the six D-20 keys the validator requires.
  const odd = {
    id: 'odd',
    entry: {
      name: 'Odd',
      category: { x: 1 },
      note: 42,
      densityGPerMl: 'heavy',
      composition: { fat: 0.1 },
      fatStructural: null,
      ownEmulsifier: null,
      titratableAcidity: null,
      defaultStage: null,
      prepNote: null,
      requiresHeat: null,
    },
  };

  it('returns null for the seed’s own lists', () => {
    expect(firstDamagedTable(lists())).toBeNull();
  });

  it('returns null when the library, machines, styles or problems list is empty', () => {
    for (const table of ['library', 'machines', 'styles', 'problems']) {
      expect(firstDamagedTable(lists({ [table]: [] })), table).toBeNull();
    }
  });

  it('reports an empty scales list as the scales table, by the core-count rule', () => {
    expect(firstDamagedTable(lists({ scales: [] }))).toEqual({
      table: 'scales',
      word: 'scales',
      errors: ['scales: expected exactly 4 core scales, found 0'],
    });
  });

  it('reports one bad scale row with that row’s path-named errors', () => {
    const scales = structuredClone(CORE_SCALE_ROWS);
    scales[1].kind = 'stars';
    const damaged = firstDamagedTable(lists({ scales }));
    expect(damaged.table).toBe('scales');
    expect(damaged.word).toBe('scales');
    expect(damaged.errors).toHaveLength(1);
    expect(damaged.errors[0]).toContain('scales[1].kind');
  });

  it('checks the tables in the order library, machines, styles, scales, problems', () => {
    const badMachine = [{ ...structuredClone(MACHINE_ROWS[0]), minFillG: 'x' }];
    const badScales = structuredClone(CORE_SCALE_ROWS).slice(0, 2);
    const badLibrary = [{ id: 'bad', entry: { name: '' } }];
    expect(firstDamagedTable(lists({ machines: badMachine, scales: badScales })).table).toBe('machines');
    expect(firstDamagedTable(lists({ library: badLibrary, machines: badMachine })).table).toBe('library');
    expect(firstDamagedTable(lists({ library: badLibrary })).word).toBe('ingredients');
    expect(firstDamagedTable(lists({ styles: [{ id: 'x' }], scales: badScales })).table).toBe('styles');
    expect(firstDamagedTable(lists({ styles: [{ id: 'x' }], scales: badScales })).word).toBe('ice cream styles');
    expect(firstDamagedTable(lists({ scales: badScales, problems: [{ id: 'p' }] })).table).toBe('scales');
  });

  it('names a scales table with none, three or five core rows, and accepts exactly four', () => {
    const withCore = (count) =>
      CORE_SCALE_ROWS.map((row, index) => ({ ...row, group: index < count ? 'core' : 'declared' }));
    for (const count of [0, 3, 5, 6]) {
      expect(firstDamagedTable(lists({ scales: withCore(count) })), String(count)).toEqual({
        table: 'scales',
        word: 'scales',
        errors: [`scales: expected exactly 4 core scales, found ${count}`],
      });
    }
    expect(firstDamagedTable(lists({ scales: withCore(4) }))).toBeNull();
  });

  it('reports a problem name on two rows as the problems table', () => {
    const problems = [...structuredClone(CORE_PROBLEM_ROWS), { id: 'icy', name: 'Coarse, icy', order: 5 }];
    expect(firstDamagedTable(lists({ problems }))).toEqual({
      table: 'problems',
      word: 'problems',
      errors: ['problems: "Coarse, icy" names more than one problem (coarse-icy, icy)'],
    });
  });

  it('boots a library entry with odd display fields, since the store file’s own validator accepts it', () => {
    expect(firstDamagedTable(lists({ library: [odd] }))).toBeNull();
  });

  it('refuses a library entry whose composition holds a string, naming that field only', () => {
    const bad = structuredClone(odd);
    bad.entry.composition = { fat: 'lots' };
    const damaged = firstDamagedTable(lists({ library: [bad] }));
    expect(damaged.table).toBe('library');
    expect(damaged.word).toBe('ingredients');
    expect(damaged.errors).toHaveLength(1);
    expect(damaged.errors[0]).toContain('library[0].entry.composition.fat');
  });

  it('refuses a library entry without its defaultStage key', () => {
    const bad = structuredClone(odd);
    delete bad.entry.defaultStage;
    const damaged = firstDamagedTable(lists({ library: [bad] }));
    expect(damaged.table).toBe('library');
    expect(damaged.word).toBe('ingredients');
    expect(damaged.errors.join('\n')).toContain('library[0].entry.defaultStage');
  });
});

describe('bootDamagedLine', () => {
  it('names the table in the app’s own voice, with a curly apostrophe', () => {
    expect(bootDamagedLine('ice cream styles')).toBe('Sprinkles can’t open: its list of ice cream styles has a damaged entry.');
  });
});
