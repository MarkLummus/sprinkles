// The tasting's axes: four fixed core axes plus the version's declared
// axes, read from the batch's own snapshot (02-03 task 2, D-14, D-15,
// D-16). Runs under Vitest's default node environment — imports no store,
// no component, and no framework.
import { describe, it, expect } from 'vitest';
import { CORE_AXES, MARK_STOPS, axesForBatch, markKeyFor, setMark } from './axes.js';
import { createBatch, isTastingSaveable } from './batch.js';
import { oliveOilVersion } from '../data/olive-oil.js';

describe('CORE_AXES', () => {
  it('has exactly four entries in fixed order: hardness, scoopability, smoothness, sweetness', () => {
    expect(CORE_AXES).toHaveLength(4);
    expect(CORE_AXES.map((axis) => axis.key)).toEqual(['hardness', 'scoopability', 'smoothness', 'sweetness']);
  });

  it('every entry carries key, label, low, and high', () => {
    for (const axis of CORE_AXES) {
      expect(axis).toHaveProperty('key');
      expect(axis).toHaveProperty('label');
      expect(axis).toHaveProperty('low');
      expect(axis).toHaveProperty('high');
    }
  });

  it('the anchors are the earlier attempt\'s, verbatim', () => {
    const byKey = Object.fromEntries(CORE_AXES.map((axis) => [axis.key, axis]));
    expect(byKey.hardness.low).toBe('spoon sinks');
    expect(byKey.hardness.high).toBe("spoon won't enter");
    expect(byKey.scoopability.low).toBe('crumbles');
    expect(byKey.scoopability.high).toBe('rolls clean');
    expect(byKey.smoothness.low).toBe('grainy');
    expect(byKey.smoothness.high).toBe('no crystal felt');
    expect(byKey.sweetness.low).toBe('flat');
    expect(byKey.sweetness.high).toBe('dominant');
  });
});

describe('MARK_STOPS', () => {
  it('is exactly the nine stops from 1 to 5 by halves, including 4.5', () => {
    expect(MARK_STOPS).toEqual([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
  });
});

describe('axesForBatch', () => {
  const batchWithDeclared = createBatch(
    oliveOilVersion,
    { churnDate: '2026-08-02', asMade: {} },
    { id: 'b-1', now: '2026-08-04T09:00:00.000Z' },
  );

  it('returns six entries for a batch snapshotting the seeded version: four core, then the two declared', () => {
    const axes = axesForBatch(batchWithDeclared);
    expect(axes).toHaveLength(6);
    expect(axes.slice(0, 4).map((axis) => axis.key)).toEqual(['hardness', 'scoopability', 'smoothness', 'sweetness']);
    expect(axes[4].label).toBe('Olive oil character');
    expect(axes[5].label).toBe('Bitterness');
    expect(axes[4]).toHaveProperty('low');
    expect(axes[4]).toHaveProperty('high');
  });

  it('reads declaredAxes only from batch.snapshot: a later edit to a live version record does not change the result', () => {
    const version = structuredClone(oliveOilVersion);
    const batch = createBatch(version, { churnDate: '2026-08-02', asMade: {} }, { id: 'b-1', now: '2026-08-04T09:00:00.000Z' });
    version.declaredAxes = [];
    const axes = axesForBatch(batch);
    expect(axes).toHaveLength(6);
  });

  it('returns exactly the four core axes when the snapshot declares no axes', () => {
    const batch = {
      snapshot: { declaredAxes: [] },
    };
    const axes = axesForBatch(batch);
    expect(axes).toHaveLength(4);
    expect(axes.map((axis) => axis.key)).toEqual(['hardness', 'scoopability', 'smoothness', 'sweetness']);
  });
});

describe('markKeyFor', () => {
  it('gives a core axis its fixed lowercase key', () => {
    expect(markKeyFor(CORE_AXES[0])).toBe('hardness');
  });

  it('gives a declared axis its name verbatim', () => {
    expect(markKeyFor({ name: 'Olive oil character', low: 'x', high: 'y' })).toBe('Olive oil character');
  });

  it('a declared axis named like a core axis produces a distinct key from the core one', () => {
    const declaredHardness = { name: 'Hardness', low: 'x', high: 'y' };
    expect(markKeyFor(declaredHardness)).toBe('Hardness');
    expect(markKeyFor(declaredHardness)).not.toBe(markKeyFor(CORE_AXES[0]));
  });
});

// setMark is the one rule for writing AND clearing a mark on a marks
// object (G-02-6): a mark placed by mistake must be removable, and clearing
// the last one must return isTastingSaveable to false — the state the
// clear control exists to reach.
describe('setMark', () => {
  it('sets on an empty object: the only own key is the axis, holding the given stop', () => {
    const result = setMark({}, 'sweetness', 4);
    expect(Object.keys(result)).toEqual(['sweetness']);
    expect(result.sweetness).toBe(4);
  });

  it('replaces an existing mark, still one key', () => {
    const result = setMark({ sweetness: 4 }, 'sweetness', 4.5);
    expect(Object.keys(result)).toEqual(['sweetness']);
    expect(result.sweetness).toBe(4.5);
  });

  it('clears a mark: the axis has no own key, and the object has zero own keys', () => {
    const result = setMark({ sweetness: 4 }, 'sweetness', null);
    expect(Object.prototype.hasOwnProperty.call(result, 'sweetness')).toBe(false);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('clears one of several, leaving exactly the other untouched', () => {
    const result = setMark({ sweetness: 4, hardness: 3 }, 'sweetness', null);
    expect(Object.keys(result)).toEqual(['hardness']);
    expect(result.hardness).toBe(3);
  });

  it('clearing an axis that was never marked returns the other axis and creates no key for the cleared one', () => {
    const result = setMark({ hardness: 3 }, 'sweetness', null);
    expect(Object.keys(result)).toEqual(['hardness']);
    expect(result.hardness).toBe(3);
    expect(Object.prototype.hasOwnProperty.call(result, 'sweetness')).toBe(false);
  });

  it('never mutates the object it is given', () => {
    const original = { sweetness: 4, hardness: 3 };
    const originalKeys = Object.keys(original);
    const originalSnapshot = { ...original };
    setMark(original, 'sweetness', 4.5);
    setMark(original, 'sweetness', null);
    setMark(original, 'scoopability', 2);
    expect(Object.keys(original)).toEqual(originalKeys);
    expect(original).toEqual(originalSnapshot);
  });

  it('clearing the last mark returns isTastingSaveable to false, asserted across the two pure modules', () => {
    expect(isTastingSaveable({ marks: { sweetness: 4 } })).toBe(true);
    expect(isTastingSaveable({ marks: setMark({ sweetness: 4 }, 'sweetness', null) })).toBe(false);
  });

  // T-02-32 (Phase 2, closed here in Phase 3): a hand-edited version could
  // in principle name an axis '__proto__'. setMark's write path is
  // `next[axisKey] = stop`, a plain bracket assignment rather than an
  // own-property-only write — but every stop this app ever passes is a
  // number (MARK_STOPS), and JavaScript's own __proto__ accessor setter on
  // Object.prototype silently ignores a non-object assignment, so the
  // result is safe by the numeric-stops rationale rather than by the
  // write's own shape. This regression case pins that: the mark is
  // dropped, the result's own prototype is untouched, and nothing leaks
  // onto Object.prototype.
  it("dropping a '__proto__' axis mark neither changes the result's prototype nor pollutes Object.prototype", () => {
    const result = setMark({}, '__proto__', 4);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
    expect({}.polluted).toBeUndefined();
  });
});
