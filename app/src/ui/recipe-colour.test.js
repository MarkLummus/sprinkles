// A recipe's colour, dealt not stored (route.md § 3, § 5): every version
// of one recipe resolves to the same hue token, two recipes never share a
// hue while the shelf holds RECIPE_HUE_COUNT or fewer, and the result
// never depends on input order or on stored state. See recipe-colour.js's
// own comment for why a deal, not a hash, is the rule.
import { describe, it, expect } from 'vitest';
import { recipeHueByRecipeId, RECIPE_HUE_COUNT } from './recipe-colour.js';

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'r1',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('recipeHueByRecipeId — a colour dealt in order, never stored', () => {
  it('resolves every version of one recipe to the same hue token', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const hues = recipeHueByRecipeId(versions);
    expect(hues.get('r1')).toBeTruthy();
    // Both versions share recipeId r1 — one entry in the map covers both.
    expect(hues.size).toBe(1);
  });

  it('never gives two recipes the same hue while the shelf holds RECIPE_HUE_COUNT or fewer', () => {
    const versions = Array.from({ length: RECIPE_HUE_COUNT }, (_, i) =>
      makeVersion({ id: `v${i}`, recipeId: `r${i}`, createdAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }),
    );
    const hues = recipeHueByRecipeId(versions);
    const values = [...hues.values()];
    expect(new Set(values).size).toBe(values.length);
  });

  it('two recipes produce two different hue tokens', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r2', createdAt: '2026-01-02T00:00:00.000Z' }),
    ];
    const hues = recipeHueByRecipeId(versions);
    expect(hues.get('r1')).not.toBe(hues.get('r2'));
  });

  it('does not depend on the order of the input array', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r2', createdAt: '2026-01-05T00:00:00.000Z' }),
      makeVersion({ id: 'c', recipeId: 'r3', createdAt: '2026-01-10T00:00:00.000Z' }),
    ];
    const forward = recipeHueByRecipeId(versions);
    const shuffled = [versions[2], versions[0], versions[1]];
    const backward = recipeHueByRecipeId(shuffled);
    expect(backward.get('r1')).toBe(forward.get('r1'));
    expect(backward.get('r2')).toBe(forward.get('r2'));
    expect(backward.get('r3')).toBe(forward.get('r3'));
  });

  it('a recipe created later does not move an earlier recipe\'s hue', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r2', createdAt: '2026-01-05T00:00:00.000Z' }),
    ];
    const before = recipeHueByRecipeId(versions);
    const later = [...versions, makeVersion({ id: 'c', recipeId: 'r3', createdAt: '2026-01-10T00:00:00.000Z' })];
    const after = recipeHueByRecipeId(later);
    expect(after.get('r1')).toBe(before.get('r1'));
    expect(after.get('r2')).toBe(before.get('r2'));
  });

  it('a version with a null createdAt sorts last, the same way sortedVersions already puts it, and takes a hue without throwing', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', createdAt: null }),
      makeVersion({ id: 'b', recipeId: 'r2', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    expect(() => recipeHueByRecipeId(versions)).not.toThrow();
    const hues = recipeHueByRecipeId(versions);
    expect(hues.get('r1')).toBeTruthy();
    expect(hues.get('r2')).toBeTruthy();
    expect(hues.get('r1')).not.toBe(hues.get('r2'));
  });

  it('returns an empty map for an empty version list', () => {
    const hues = recipeHueByRecipeId([]);
    expect(hues.size).toBe(0);
  });
});
