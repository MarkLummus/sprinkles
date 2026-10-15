// The domain suite for createRecipe (Phase 7 MAKE-01, D-01 to D-04, D-08).
// Runs under Vitest's default node environment: it imports no store, no
// component and no framework.
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { createRecipe } from './newRecipe.js';
import { oliveOilVersion, VERSION_SCHEMA_VERSION } from '../data/olive-oil.js';

const NOW = '2026-10-14T12:00:00.000Z';
const IDS = { recipeId: 'recipe-new', versionId: 'version-new-1', now: NOW };

// Prebuilt rows, ids row-01 to row-03.
function startingRows() {
  return structuredClone(oliveOilVersion.rows.slice(0, 3));
}

function create(overrides = {}) {
  return createRecipe({ name: 'Plain base', versionLabel: '50 g oil · 800 g', rows: startingRows(), ...overrides }, IDS);
}

describe('createRecipe — the recipe record (D-01)', () => {
  it('returns the recipe and its root version, and nothing else', () => {
    expect(Object.keys(create())).toEqual(['recipe', 'version']);
  });

  it('trims the name and starts with an empty description', () => {
    expect(create({ name: '  Plain base  ' }).recipe).toEqual({
      id: 'recipe-new',
      name: 'Plain base',
      description: '',
    });
  });
});

describe('createRecipe — the root version (D-01 to D-04)', () => {
  it('carries exactly seventeen keys, and no equipment, process, iceEd, targets or coefficientSetName', () => {
    const { version } = create();
    expect(Object.keys(version).sort()).toEqual([
      'authored',
      'citedBatchId',
      'coefficientSetId',
      'createdAt',
      'declaredAxes',
      'declaredFlaws',
      'id',
      'method',
      'parentVersionId',
      'parentVersionLabel',
      'reason',
      'recipeId',
      'rows',
      'schemaVersion',
      'sheetDescription',
      'sheetTitle',
      'versionLabel',
    ]);
    for (const key of ['equipment', 'process', 'iceEd', 'targets', 'coefficientSetName']) {
      expect(Object.hasOwn(version, key)).toBe(false);
    }
  });

  it("has no parent and names its recipe, with the caller's id and clock", () => {
    const { recipe, version } = create();
    expect(version.parentVersionId).toBeNull();
    expect(version.parentVersionLabel).toBeNull();
    expect(version.reason).toBeNull();
    expect(version.citedBatchId).toBeNull();
    expect(version.id).toBe('version-new-1');
    expect(version.recipeId).toBe(recipe.id);
    expect(version.createdAt).toBe(NOW);
  });

  it('starts the Sheet title from the trimmed name, and every other field empty', () => {
    const { version } = create({ name: '  Plain base  ' });
    expect(version.sheetTitle).toBe('Plain base');
    expect(version.sheetDescription).toBe('');
    expect(version.coefficientSetId).toBe('');
    expect(version.method).toEqual([]);
    expect(version.authored).toEqual({ beforeYouStart: [] });
    expect(version.declaredAxes).toEqual([]);
    expect(version.declaredFlaws).toEqual([]);
  });

  it('accepts the same string for recipeId and versionId', () => {
    const { recipe, version } = createRecipe(
      { name: 'Plain base', versionLabel: 'v1', rows: startingRows() },
      { recipeId: 'same-id', versionId: 'same-id', now: NOW },
    );
    expect(recipe.id).toBe('same-id');
    expect(version.id).toBe('same-id');
    expect(version.recipeId).toBe('same-id');
  });

  it('keeps the version label as the maker wrote it', () => {
    expect(create().version.versionLabel).toBe('50 g oil · 800 g');
  });

  it('stamps the current version schema, the one data/olive-oil.js names', () => {
    expect(create().version.schemaVersion).toBe(VERSION_SCHEMA_VERSION);
  });

  it('copies the starting rows: changing them afterwards leaves the version unchanged', () => {
    const rows = startingRows();
    const before = structuredClone(rows);
    const { version } = create({ rows });
    expect(version.rows).toEqual(before);
    expect(version.rows).not.toBe(rows);
    expect(version.rows[0]).not.toBe(rows[0]);

    rows[0].portions[0].grams = 999;
    rows.push(structuredClone(rows[1]));
    expect(version.rows).toEqual(before);
  });
});

describe('createRecipe — refusals (D-03, D-08)', () => {
  it.each([[''], ['   '], [undefined], [7]])('refuses the name %j', (name) => {
    expect(() => create({ name })).toThrow(new TypeError('recipe name must not be blank'));
  });

  it.each([[''], ['   '], [undefined]])('refuses the label %j', (versionLabel) => {
    expect(() => create({ versionLabel })).toThrow(new TypeError('version label must not be blank'));
  });

  it.each([[[]], [undefined], ['rows']])('refuses the rows %j', (rows) => {
    expect(() => create({ rows })).toThrow(new TypeError('a new recipe needs at least one starting row'));
  });

  it('refuses two starting rows with the same id', () => {
    const rows = startingRows();
    rows[1].id = 'row-01';
    expect(() => create({ rows })).toThrow(new TypeError('row id "row-01" appears twice'));
  });

  it.each(['recipeId', 'versionId', 'now'])('refuses a missing, non-string or empty %s', (field) => {
    for (const value of ['', undefined, null, 7]) {
      expect(() => createRecipe({ name: 'Plain base', versionLabel: 'v1', rows: startingRows() }, { ...IDS, [field]: value })).toThrow(
        new TypeError(`${field} must be a non-empty string`),
      );
    }
  });

  it('names recipeId when the second argument is missing altogether', () => {
    expect(() => createRecipe({ name: 'Plain base', versionLabel: 'v1', rows: startingRows() })).toThrow(
      new TypeError('recipeId must be a non-empty string'),
    );
  });

  it.each(['__proto__', 'constructor', 'prototype'])('refuses the reserved row id %s', (name) => {
    const rows = startingRows();
    rows[0].id = name;
    expect(() => create({ rows })).toThrow(new TypeError(`row id "${name}" is reserved`));
  });

  it('throws a TypeError, not another error class', () => {
    expect(() => create({ name: '' })).toThrow(TypeError);
  });
});

describe('newRecipe.js stays pure (criterion 4)', () => {
  it('newRecipe.js imports only sibling domain modules and reads no clock or random source', () => {
    const source = readFileSync(new URL('./newRecipe.js', import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    const specifiers = [...source.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1]);
    for (const specifier of specifiers) expect(specifier).toMatch(/^\.\/[\w.-]+\.js$/);
    expect(source).not.toMatch(/\bimport\s*\(|^\s*import\s+'/m);
    expect(source).not.toMatch(/\bnew Date\b|\bDate\.now\b|\bcrypto\b|\bMath\.random\b/);
  });

  it('its own test file carries no environment docblock on its first line', () => {
    const first = readFileSync(new URL('./newRecipe.test.js', import.meta.url), 'utf8').split('\n')[0];
    expect(first).not.toContain('@vitest-environment');
  });
});
