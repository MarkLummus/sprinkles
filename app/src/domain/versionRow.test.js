// Domain suite for the row-from-library builder (Phase 7 MAKE-03, D-06, D-07).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework.
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
