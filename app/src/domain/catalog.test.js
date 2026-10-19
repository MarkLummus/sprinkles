// Phase 9 plan 04 (decision 3, D-03b, TASTE-03): the scale definition
// contract. catalog.js is pure, so this runs under Vitest's node environment.
import { describe, it, expect } from 'vitest';
import {
  SCALE_KINDS,
  SCALE_GROUPS,
  MAX_RECIPE_SCALES,
  MAX_RECIPE_PROBLEMS,
  CORE_SCALE_COUNT,
  isScaleDefinition,
  scaleDefinition,
  mintScaleKey,
  coreScaleDefinitions,
  problemNames,
} from './catalog.js';
import { AXES } from './axes.js';
import { freshId } from './id.js';

const SEEDED_KEYS = ['hardness', 'scoopability', 'smoothness', 'sweetness', 'body', 'oil'];

const bodyRow = {
  id: 'body',
  key: 'body',
  name: 'Body',
  low: 'thin',
  high: 'heavy',
  kind: 'goldilocks',
  group: 'declared',
  order: 5,
};

describe('the contract’s constants', () => {
  it('fixes the kinds, the groups, the per-recipe limits and the four core places', () => {
    expect(SCALE_KINDS).toEqual(['goldilocks', 'magnitude']);
    expect(SCALE_GROUPS).toEqual(['core', 'declared']);
    expect(MAX_RECIPE_SCALES).toBe(2);
    expect(MAX_RECIPE_PROBLEMS).toBe(2);
    expect(CORE_SCALE_COUNT).toBe(4);
  });

  it('names the six seeded keys the axes module holds', () => {
    expect(AXES.map((axis) => axis.key).sort()).toEqual([...SEEDED_KEYS].sort());
  });
});

describe('scaleDefinition', () => {
  it('copies exactly key, name, low, high, kind and group into a new object', () => {
    const definition = scaleDefinition(bodyRow);
    expect(definition).toEqual({ key: 'body', name: 'Body', low: 'thin', high: 'heavy', kind: 'goldilocks', group: 'declared' });
    expect(definition).not.toBe(bodyRow);
  });

  it('makes a definition isScaleDefinition accepts, which the table row itself is not', () => {
    expect(isScaleDefinition(scaleDefinition(bodyRow))).toBe(true);
    expect(isScaleDefinition(bodyRow)).toBe(false);
  });
});

describe('isScaleDefinition', () => {
  const good = { key: 'body', name: 'Body', low: 'thin', high: 'heavy', kind: 'goldilocks', group: 'declared' };

  it('refuses a missing key, a blank word, a kind or group outside the sets, and a non-object', () => {
    const { low: _low, ...withoutLow } = good;
    expect(isScaleDefinition(withoutLow)).toBe(false);
    expect(isScaleDefinition({ ...good, name: '' })).toBe(false);
    expect(isScaleDefinition({ ...good, kind: '' })).toBe(false);
    expect(isScaleDefinition({ ...good, kind: 'stars' })).toBe(false);
    expect(isScaleDefinition({ ...good, group: 'mine' })).toBe(false);
    expect(isScaleDefinition({ ...good, high: 5 })).toBe(false);
    expect(isScaleDefinition(null)).toBe(false);
    expect(isScaleDefinition([])).toBe(false);
    expect(isScaleDefinition('body')).toBe(false);
  });

  it('refuses an unsafe key (T-09-08), since a mark is later written under it', () => {
    for (const key of ['__proto__', 'constructor', 'prototype']) {
      expect(isScaleDefinition({ ...good, key })).toBe(false);
    }
  });

  it('accepts both kinds and both groups', () => {
    expect(isScaleDefinition({ ...good, kind: 'magnitude', group: 'core' })).toBe(true);
  });
});

describe('mintScaleKey (D-03b)', () => {
  it('returns scale- plus the id', () => {
    expect(mintScaleKey('abc')).toBe('scale-abc');
  });

  it('never equals a seeded key or an unsafe name, for any fresh id', () => {
    for (let i = 0; i < 50; i += 1) {
      const key = mintScaleKey(freshId());
      expect(SEEDED_KEYS).not.toContain(key);
      expect(['__proto__', 'constructor', 'prototype']).not.toContain(key);
    }
    for (const seeded of SEEDED_KEYS) {
      expect(SEEDED_KEYS).not.toContain(mintScaleKey(seeded));
    }
  });

  it('throws a TypeError for anything but a non-empty string', () => {
    expect(() => mintScaleKey('')).toThrow(TypeError);
    expect(() => mintScaleKey(undefined)).toThrow(TypeError);
    expect(() => mintScaleKey(7)).toThrow(TypeError);
  });
});

describe('coreScaleDefinitions and problemNames (D-01)', () => {
  const rows = [
    { id: 'sweetness', key: 'sweetness', name: 'Sweetness', low: 'less', high: 'more', kind: 'goldilocks', group: 'core', order: 4 },
    bodyRow,
    { id: 'hardness', key: 'hardness', name: 'Hardness', low: 'soft', high: 'hard', kind: 'goldilocks', group: 'core', order: 1 },
  ];

  it('returns the bare definition of each core row, in the order given, and leaves the declared rows out', () => {
    expect(coreScaleDefinitions(rows)).toEqual([
      { key: 'sweetness', name: 'Sweetness', low: 'less', high: 'more', kind: 'goldilocks', group: 'core' },
      { key: 'hardness', name: 'Hardness', low: 'soft', high: 'hard', kind: 'goldilocks', group: 'core' },
    ]);
  });

  it('sorts nothing: a reversed list comes back reversed', () => {
    expect(coreScaleDefinitions([...rows].reverse()).map((definition) => definition.key)).toEqual(['hardness', 'sweetness']);
  });

  it('names each problem in the order given', () => {
    expect(
      problemNames([
        { id: 'b', name: 'Second', order: 2 },
        { id: 'a', name: 'First', order: 1 },
      ]),
    ).toEqual(['Second', 'First']);
    expect(problemNames([])).toEqual([]);
  });
});
