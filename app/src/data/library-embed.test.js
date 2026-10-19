// The seed's stored shapes (LIB-08, D-13, D-19, D-20): every seeded row names
// the library entry its copy came from, the two strawberry definitions that
// bypass the library are the only null links, every equipment block stores
// maxFillG, and every version stores serveTempC copied from its own Ice Ed
// figure.
import { describe, it, expect } from 'vitest';
import { embedFromLibrary } from './library-embed.js';
import { library } from './library.js';
import { seedRecipeGroups } from './seed-recipes.js';
import { STRAWBERRIES_V1_V2_IER, DRIED_STRAWBERRY_V2_IER } from './strawberry.js';

const versions = seedRecipeGroups.flatMap((group) => group.versions);
const batches = seedRecipeGroups.flatMap((group) => group.batches);
const allRows = [
  ...versions.flatMap((version) => version.rows),
  ...batches.flatMap((batch) => batch.snapshot.rows),
];

// The figures each seeded version's Ice Ed record states, listed here
// independently of the data files so a drift in either place goes red.
const ICE_ED_SERVING_TEMPERATURE_C = {
  'olive-oil-ice-cream-v1': null,
  'mexican-chocolate-v1': -15,
  'mexican-chocolate-v2': -16,
  'mexican-chocolate-v3': -16,
  'mexican-chocolate-v4': -17,
  'pineapple-v1': -14,
  'coconut-v1': -15,
  'coconut-v2': -16,
  'standard-base-v1': -14,
  'standard-base-v2': -15,
  'underbelly-light-base-v1': null,
  'underbelly-light-base-v2': -14,
  'strawberry-v1': -15,
  'strawberry-v2': -15,
  'strawberry-v2-1': -17,
  'mocha-v0': -14,
  'mocha-v1': -14,
  'mocha-v2': -16,
  'mocha-v3': -15,
};

const D20_KEYS = ['titratableAcidity', 'fatStructural', 'ownEmulsifier', 'defaultStage', 'prepNote', 'requiresHeat'];

describe('embedFromLibrary', () => {
  it('copies the entry onto the row with its key, as a clone', () => {
    const row = embedFromLibrary('Whole milk', 'wholeMilk', { portions: [{ step: 1, grams: 5 }], removed: false });
    expect(row.libraryId).toBe('wholeMilk');
    expect(row.ingredientName).toBe('Whole milk');
    expect(row.ingredient).toEqual(library.wholeMilk);
    expect(row.ingredient).not.toBe(library.wholeMilk);
    expect(row.ingredient.composition).not.toBe(library.wholeMilk.composition);
  });

  it.each(['noSuchEntry', '__proto__', 'constructor', 'toString'])('throws a TypeError for the key %s, which the library does not hold', (key) => {
    expect(() => embedFromLibrary('x', key, {})).toThrow(TypeError);
  });
});

describe('the seeded rows keep their library link (LIB-08)', () => {
  it('every version row and every batch snapshot row has an own libraryId', () => {
    expect(versions).toHaveLength(19);
    expect(allRows.length).toBeGreaterThan(0);
    for (const row of allRows) {
      expect(Object.hasOwn(row, 'libraryId'), `${row.id} ${row.ingredientName}`).toBe(true);
    }
  });

  it('a string link names the library entry whose copy the row holds', () => {
    for (const row of allRows) {
      if (typeof row.libraryId === 'string') {
        expect(library[row.libraryId], `${row.id} ${row.libraryId}`).toEqual(row.ingredient);
      }
    }
  });

  it('the distinct ingredients of the null-linked rows are exactly the two strawberry definitions, however many rows repeat them', () => {
    const distinct = [];
    for (const row of allRows) {
      if (row.libraryId === null && !distinct.some((ingredient) => JSON.stringify(ingredient) === JSON.stringify(row.ingredient))) {
        distinct.push(row.ingredient);
      }
    }
    expect(distinct).toHaveLength(2);
    expect(distinct).toContainEqual(STRAWBERRIES_V1_V2_IER);
    expect(distinct).toContainEqual(DRIED_STRAWBERRY_V2_IER);
  });

  it.each([
    ['STRAWBERRIES_V1_V2_IER', STRAWBERRIES_V1_V2_IER],
    ['DRIED_STRAWBERRY_V2_IER', DRIED_STRAWBERRY_V2_IER],
  ])('%s owns the six D-20 keys, every one null, and no titratableAcidity basis or source', (_name, definition) => {
    for (const key of D20_KEYS) {
      expect(Object.hasOwn(definition, key), key).toBe(true);
      expect(definition[key], key).toBeNull();
    }
    expect(Object.hasOwn(definition.basis, 'titratableAcidity')).toBe(false);
    expect(Object.hasOwn(definition.source, 'titratableAcidity')).toBe(false);
  });
});

describe('the seeded versions store maxFillG and serveTempC (D-13, D-19)', () => {
  it('every seeded version equipment stores maxFillG null beside minFillG', () => {
    for (const version of versions) {
      expect(version.equipment.maxFillG, version.id).toBeNull();
      expect(Object.hasOwn(version.equipment, 'minFillG'), version.id).toBe(true);
    }
  });

  it('every one of the 19 versions owns serveTempC, exactly its own iceEd servingTemperatureC: 17 numbers and 2 nulls', () => {
    expect(versions.map((version) => version.id).sort()).toEqual(Object.keys(ICE_ED_SERVING_TEMPERATURE_C).sort());
    for (const version of versions) {
      expect(Object.hasOwn(version, 'serveTempC'), version.id).toBe(true);
      expect(version.serveTempC, version.id).toBe(version.iceEd.servingTemperatureC);
      expect(version.serveTempC, version.id).toBe(ICE_ED_SERVING_TEMPERATURE_C[version.id]);
    }
    expect(versions.filter((version) => Number.isFinite(version.serveTempC))).toHaveLength(17);
    expect(versions.filter((version) => version.serveTempC === null).map((version) => version.id).sort()).toEqual([
      'olive-oil-ice-cream-v1',
      'underbelly-light-base-v1',
    ]);
  });

  it('every serveTempC figure is between -17 and -14 degrees C', () => {
    for (const version of versions) {
      if (version.serveTempC !== null) {
        expect(version.serveTempC, version.id).toBeGreaterThanOrEqual(-17);
        expect(version.serveTempC, version.id).toBeLessThanOrEqual(-14);
      }
    }
  });

  it('the iceEd block keeps its four Ice Ed keys, untouched by the copy', () => {
    for (const version of versions) {
      expect(Object.keys(version.iceEd), version.id).toEqual(['style', 'servingTemperatureC', 'hardness', 'overrunPercent']);
    }
  });
});
