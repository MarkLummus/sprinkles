// The five whole stops, the stop words, the mark readers and the axis lists
// read from a batch's own snapshot or from a catalog (03.3.1-CONTEXT.md D-07,
// the structural contract's "Axes spec"). The six seeded scales are rows of
// SEED_CATALOG here, not a constant in axes.js (09-15, D-01); the words in
// those rows are pinned in store/seedTables.test.js. Runs under Vitest's
// default node environment — imports no store, no component, and no framework.
import { describe, it, expect } from 'vitest';
import { STOPS, stopWordsFor, axesForBatch, axesForVersion, markKeyFor, setMark, readMarkWord } from './axes.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { createBatch } from './batch.js';
import { CORE_SCALE_COUNT, scaleDefinition } from './catalog.js';

// The six seeded scales as definitions, in the table's order.
const SEEDED_AXES = SEED_CATALOG.scales.map(scaleDefinition);

// A batch built the way the app builds one, so its snapshot carries the core
// scales; no case here hand-builds a snapshot.
function makeBatch(version, catalog = SEED_CATALOG) {
  return createBatch(version, { churnDate: '2026-08-02', asMade: {} }, null, { id: 'b-axes', now: 'x', catalog });
}

describe('STOPS', () => {
  it('is exactly the five whole stops from 1 to 5', () => {
    expect(STOPS).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('stopWordsFor', () => {
  it('returns the five words in order for Hardness: soft, leaning soft, right, leaning hard, hard', () => {
    expect(stopWordsFor(SEEDED_AXES[0])).toEqual(['soft', 'leaning soft', 'right', 'leaning hard', 'hard']);
  });

  it('returns the five words in order for Oil: faint, leaning faint, right, leaning strong, strong', () => {
    expect(stopWordsFor(SEEDED_AXES[5])).toEqual(['faint', 'leaning faint', 'right', 'leaning strong', 'strong']);
  });

  it('the middle word is always the fixed word "right"', () => {
    for (const axis of SEEDED_AXES) {
      expect(stopWordsFor(axis)[2]).toBe('right');
    }
  });
});

describe('axesForBatch', () => {
  it('returns six entries for a batch snapshotting the seeded version: four core, then the two declared', () => {
    const axes = axesForBatch(augustSecondBatch);
    expect(axes).toHaveLength(6);
    expect(axes.map((axis) => axis.name)).toEqual([
      'Hardness',
      'Scoopability',
      'Smoothness',
      'Sweetness',
      'Body',
      'Oil',
    ]);
  });

  it('reads declaredAxes only from batch.snapshot: a later edit to a live version record does not change the result', () => {
    const version = structuredClone(oliveOilVersion);
    const batch = makeBatch(version);
    version.declaredAxes = [];
    const axes = axesForBatch(batch);
    expect(axes).toHaveLength(6);
  });

  it('returns the snapshot\'s declared definitions as stored after the four core axes', () => {
    const mine = { key: 'scale-mine', name: 'Mystery', low: 'a', high: 'b', kind: 'magnitude', group: 'declared' };
    const axes = axesForBatch(makeBatch({ ...oliveOilVersion, declaredAxes: [mine] }));
    expect(axes).toHaveLength(5);
    expect(axes[4]).toEqual(mine);
  });

  it('returns exactly the four core axes when the snapshot declares no axes', () => {
    const axes = axesForBatch(makeBatch({ ...oliveOilVersion, declaredAxes: [] }));
    expect(axes).toHaveLength(4);
    expect(axes.map((axis) => axis.key)).toEqual(['hardness', 'scoopability', 'smoothness', 'sweetness']);
  });

  it('reads the core scales from snapshot.coreScales, as stored, and not from the catalog or a constant (D-03)', () => {
    const catalog = structuredClone(SEED_CATALOG);
    catalog.scales[0].low = 'mushy';
    const axes = axesForBatch(makeBatch(oliveOilVersion, catalog));
    expect(axes[0].low).toBe('mushy');
    expect(axesForBatch(augustSecondBatch)[0].low).toBe('soft');
  });
});

// The version-side twin: the blank Tasting log prints before any batch exists.
describe('axesForVersion', () => {
  it('returns Olive Oil v1\'s six: the four core, then Body and Oil in the version\'s order', () => {
    expect(axesForVersion(oliveOilVersion, SEED_CATALOG).map((axis) => axis.name)).toEqual([
      'Hardness',
      'Scoopability',
      'Smoothness',
      'Sweetness',
      'Body',
      'Oil',
    ]);
  });

  it('returns the four core axes for a version that declares none', () => {
    const axes = axesForVersion({ ...oliveOilVersion, declaredAxes: [] }, SEED_CATALOG);
    expect(axes.map((axis) => axis.key)).toEqual(['hardness', 'scoopability', 'smoothness', 'sweetness']);
    expect(axes).toHaveLength(CORE_SCALE_COUNT);
  });

  it('returns the declared definitions as given, in the version\'s own order, resolving no name', () => {
    const [body, oil] = oliveOilVersion.declaredAxes;
    const mine = { key: 'scale-mine', name: 'Mystery', low: 'a', high: 'b', kind: 'magnitude', group: 'declared' };
    const axes = axesForVersion({ declaredAxes: [oil, mine, body] }, SEED_CATALOG);
    expect(axes.slice(CORE_SCALE_COUNT)).toEqual([oil, mine, body]);
  });

  it('agrees with axesForBatch for a batch snapshotting the same version, on the words and the order', () => {
    const words = ({ key, name, low, high, group }) => ({ key, name, low, high, group });
    expect(axesForVersion(oliveOilVersion, SEED_CATALOG).map(words)).toEqual(axesForBatch(augustSecondBatch).map(words));
  });

  it('reads a version with no declaredAxes field as declaring none', () => {
    expect(axesForVersion({}, SEED_CATALOG)).toHaveLength(CORE_SCALE_COUNT);
  });

  it('keeps the order it is handed and sorts nothing: a reversed scales list gives the core scales reversed', () => {
    const reversed = { ...SEED_CATALOG, scales: [...SEED_CATALOG.scales].reverse() };
    expect(axesForVersion({}, reversed).map((axis) => axis.key)).toEqual(['sweetness', 'smoothness', 'scoopability', 'hardness']);
  });

  it('reads its core scales from the catalog it is given, not from a constant', () => {
    const renamed = { ...SEED_CATALOG, scales: SEED_CATALOG.scales.map((row) => (row.key === 'hardness' ? { ...row, low: 'mushy' } : row)) };
    expect(axesForVersion({}, renamed)[0].low).toBe('mushy');
  });
});

// The read view's own "Soft (2)" rule (brief § 3, RESEARCH.md Assumption A2).
describe('readMarkWord', () => {
  it('maps stop 1 or 2 of Hardness to the low anchor "soft"', () => {
    expect(readMarkWord(SEEDED_AXES[0], 1)).toBe('soft');
    expect(readMarkWord(SEEDED_AXES[0], 2)).toBe('soft');
  });

  it('maps stop 3 of any axis to the fixed middle word "right"', () => {
    for (const axis of SEEDED_AXES) {
      expect(readMarkWord(axis, 3)).toBe('right');
    }
  });

  it('maps stop 4 or 5 of Hardness to the high anchor "hard"', () => {
    expect(readMarkWord(SEEDED_AXES[0], 4)).toBe('hard');
    expect(readMarkWord(SEEDED_AXES[0], 5)).toBe('hard');
  });

  it("reproduces the working case's own tokens: Sweetness at 4 reads \"more\", Oil at 4 reads \"strong\"", () => {
    const sweetness = SEEDED_AXES.find((axis) => axis.key === 'sweetness');
    const oil = SEEDED_AXES.find((axis) => axis.key === 'oil');
    expect(readMarkWord(sweetness, 4)).toBe('more');
    expect(readMarkWord(oil, 4)).toBe('strong');
  });
});

describe('markKeyFor', () => {
  it('returns the axis\'s fixed key for every one of the six axes', () => {
    for (const axis of SEEDED_AXES) {
      expect(markKeyFor(axis)).toBe(axis.key);
    }
  });
});

// setMark is the one rule for writing AND clearing a mark on a marks
// object (G-02-6): a mark placed by mistake must be removable.
describe('setMark', () => {
  it('sets on an empty object: the only own key is the axis, holding the given stop', () => {
    const result = setMark({}, 'sweetness', 4);
    expect(Object.keys(result)).toEqual(['sweetness']);
    expect(result.sweetness).toBe(4);
  });

  it('replaces an existing mark, still one key', () => {
    const result = setMark({ sweetness: 4 }, 'sweetness', 5);
    expect(Object.keys(result)).toEqual(['sweetness']);
    expect(result.sweetness).toBe(5);
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
    setMark(original, 'sweetness', 5);
    setMark(original, 'sweetness', null);
    setMark(original, 'scoopability', 2);
    expect(Object.keys(original)).toEqual(originalKeys);
    expect(original).toEqual(originalSnapshot);
  });

  // T-02-32 (Phase 2, closed here in Phase 3.3.1): a hand-edited version
  // could in principle name an axis '__proto__'. setMark's write path is
  // `next[axisKey] = stop`, a plain bracket assignment rather than an
  // own-property-only write — but every stop this app ever passes is a
  // number (STOPS), and JavaScript's own __proto__ accessor setter on
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

// Guard 1 (phase Done-when, D-07): the six tasting axes each take a mark
// independently, asserted against the real seeded version and the real
// 2 Aug batch — a regression guard on behaviour that already works, not
// new work.
describe('the six-axes independence guard (phase Done-when, D-07)', () => {
  it('returns exactly six axes for the real seeded batch, each carrying a non-empty name and non-empty low/high anchors', () => {
    const axes = axesForBatch(augustSecondBatch);
    expect(axes).toHaveLength(6);
    for (const axis of axes) {
      expect(typeof axis.name).toBe('string');
      expect(axis.name.length).toBeGreaterThan(0);
      expect(typeof axis.low).toBe('string');
      expect(axis.low.length).toBeGreaterThan(0);
      expect(typeof axis.high).toBe('string');
      expect(axis.high.length).toBeGreaterThan(0);
    }
  });

  it('the six mark keys are six distinct values', () => {
    const axes = axesForBatch(augustSecondBatch);
    const keys = axes.map(markKeyFor);
    expect(new Set(keys).size).toBe(6);
  });

  it('marking each of the six axes in turn holds exactly that one key, and all six independently without displacing one another', () => {
    const axes = axesForBatch(augustSecondBatch);
    const keys = axes.map(markKeyFor);

    for (const key of keys) {
      const marks = setMark({}, key, 4);
      expect(Object.keys(marks)).toEqual([key]);
    }

    let allSix = {};
    for (const key of keys) {
      allSix = setMark(allSix, key, 3);
    }
    expect(Object.keys(allSix).sort()).toEqual([...keys].sort());
    for (const key of keys) {
      expect(allSix[key]).toBe(3);
    }
  });
});
