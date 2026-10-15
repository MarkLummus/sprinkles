// Domain suite for the row-from-library builder (Phase 7 MAKE-03, D-06, D-07).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework.
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { rowFromLibraryRecord } from './versionRow.js';
import { buildFigures } from './figures.js';
import { library } from '../data/library.js';
import { oliveOilVersion } from '../data/olive-oil.js';

// A copy of the entry, so no test can change the shared library object.
function oliveOilRecord() {
  return { id: 'oliveOil', entry: structuredClone(library.oliveOil) };
}

const SEEDED = { id: 'row-03', grams: 40, step: 8, ingredientName: 'Graza Drizzle' };

describe('rowFromLibraryRecord — the seeded olive oil row (criterion 3, D-06)', () => {
  it('builds a row equal to the seeded row-03 from the olive oil library record', () => {
    expect(rowFromLibraryRecord(oliveOilRecord(), SEEDED)).toEqual(oliveOilVersion.rows[2]);
  });

  it('gives the same six figures as the seeded row, alone and inside the olive oil version', () => {
    const row = rowFromLibraryRecord(oliveOilRecord(), SEEDED);
    const alone = buildFigures({ rows: [row] });
    expect(alone).toHaveLength(6);
    expect(alone).toEqual(buildFigures({ rows: [oliveOilVersion.rows[2]] }));

    const swapped = structuredClone(oliveOilVersion);
    swapped.rows[2] = row;
    expect(buildFigures(swapped)).toEqual(buildFigures(oliveOilVersion));
  });

  it('embeds a copy: changing the library entry afterwards leaves the row and its figures unchanged', () => {
    const record = oliveOilRecord();
    const row = rowFromLibraryRecord(record, SEEDED);
    const before = buildFigures({ rows: [row] });

    record.entry.composition.fat = 0.5;
    record.entry.basis.fat = 'estimated';

    expect(row.ingredient.composition.fat).toBe(1);
    expect(row.ingredient.basis.fat).toBe('stated');
    expect(buildFigures({ rows: [row] })).toEqual(before);
    expect(row.ingredient).not.toBe(record.entry);
    expect(row.ingredient.composition).not.toBe(record.entry.composition);
  });

  it('leaves the library record unchanged and keeps its id out of the embedded ingredient', () => {
    const record = oliveOilRecord();
    const snapshot = structuredClone(record);
    const row = rowFromLibraryRecord(record, SEEDED);
    expect(record).toEqual(snapshot);
    expect(Object.hasOwn(row.ingredient, 'id')).toBe(false);
  });
});

describe('rowFromLibraryRecord — defaults (D-07, D-08)', () => {
  it('names the row after the library entry when no name is given', () => {
    const row = rowFromLibraryRecord(oliveOilRecord(), { id: 'row-a', grams: 120 });
    expect(row.ingredientName).toBe('Graza Drizzle extra virgin olive oil');
  });

  it('puts the amount at step 1 when no step is given', () => {
    const row = rowFromLibraryRecord(oliveOilRecord(), { id: 'row-a', grams: 120 });
    expect(row.portions).toEqual([{ step: 1, grams: 120 }]);
  });

  it('builds exactly the seeded row keys, with a portion that has no removed key', () => {
    const row = rowFromLibraryRecord(oliveOilRecord(), { id: 'row-a', grams: 120 });
    expect(Object.keys(row)).toEqual(['id', 'ingredientName', 'ingredient', 'portions', 'removed']);
    expect(Object.keys(row.portions[0])).toEqual(['step', 'grams']);
    expect(row.removed).toBe(false);
  });

  it('accepts 0 g', () => {
    const row = rowFromLibraryRecord(oliveOilRecord(), { id: 'row-a', grams: 0 });
    expect(row.portions).toEqual([{ step: 1, grams: 0 }]);
  });
});

describe('rowFromLibraryRecord — refusals (D-07)', () => {
  const ID_MESSAGE = 'row id must be a non-empty string';
  const GRAMS_MESSAGE = 'row grams must be a finite number of at least zero';
  const STEP_MESSAGE = 'row step must be a finite number';

  function refuses(args, message) {
    let thrown;
    try {
      rowFromLibraryRecord(oliveOilRecord(), args);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(TypeError);
    expect(thrown.message).toBe(message);
  }

  it.each(['', undefined, null, 7])('refuses the row id %j', (id) => {
    refuses({ id, grams: 10 }, ID_MESSAGE);
  });

  it.each(['__proto__', 'constructor', 'prototype'])('refuses the reserved row id %s', (name) => {
    refuses({ id: name, grams: 10 }, `row id "${name}" is reserved`);
  });

  it.each(['__proto__x', 'my-constructor', 'prototype-2'])('still accepts the row id %s, which only contains a reserved name', (id) => {
    expect(rowFromLibraryRecord(oliveOilRecord(), { id, grams: 10 }).id).toBe(id);
  });

  it.each([-1, NaN, Infinity, -Infinity, '40', undefined, null])('refuses the amount %j', (grams) => {
    refuses({ id: 'row-a', grams }, GRAMS_MESSAGE);
  });

  it.each([NaN, Infinity, '2', null])('refuses the step %j', (step) => {
    refuses({ id: 'row-a', grams: 10, step }, STEP_MESSAGE);
  });
});

describe('versionRow.js stays pure (criterion 4)', () => {
  it('versionRow.js imports only sibling domain modules and reads no clock or random source', () => {
    const source = readFileSync(new URL('./versionRow.js', import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    const specifiers = [...source.matchAll(/\bfrom\s+'([^']+)'/g)].map((match) => match[1]);
    for (const specifier of specifiers) {
      expect(specifier).toMatch(/^\.\/[\w.-]+\.js$/);
    }
    expect(source).not.toMatch(/\bimport\s*\(|^\s*import\s+'/m);
    expect(source).not.toMatch(/\bnew Date\b|\bDate\.now\b|\bcrypto\b|\bMath\.random\b/);
  });

  it('its own test file carries no environment docblock on its first line', () => {
    const first = readFileSync(new URL('./versionRow.test.js', import.meta.url), 'utf8').split('\n')[0];
    expect(first).not.toContain('@vitest-environment');
  });
});
