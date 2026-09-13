// Domain suite for the derived step position (03-10, G-03-6). Runs under
// Vitest's default node environment — imports no store, no component, and
// no framework.
import { describe, it, expect } from 'vitest';
import { displayNumbers, displayNumberOf } from './stepNumbers.js';

function makeMethod(count) {
  const method = [];
  for (let n = 1; n <= count; n += 1) method.push({ n });
  return method;
}

describe('displayNumbers', () => {
  it('maps every step to its own stored key when none are removed', () => {
    const method = makeMethod(10);
    const map = displayNumbers(method);
    expect(Array.from(map.entries())).toEqual(method.map((step) => [step.n, step.n]));
  });

  it('leaves a removed step out of the map and renumbers the survivors 1 through 9 in order', () => {
    const method = makeMethod(10);
    method[1].removed = true; // step 2
    const map = displayNumbers(method);
    expect(map.has(2)).toBe(false);
    expect(Array.from(map.entries())).toEqual([
      [1, 1],
      [3, 2],
      [4, 3],
      [5, 4],
      [6, 5],
      [7, 6],
      [8, 7],
      [9, 8],
      [10, 9],
    ]);
  });

  it('renumbers the survivors 1 through 8 with no gap or repeat when the second and fifth are removed', () => {
    const method = makeMethod(10);
    method[1].removed = true; // step 2
    method[4].removed = true; // step 5
    const map = displayNumbers(method);
    expect(Array.from(map.values())).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(map.values()).size).toBe(8);
  });

  it('still starts the survivors at one when the first step is removed', () => {
    const method = makeMethod(5);
    method[0].removed = true; // step 1
    const map = displayNumbers(method);
    expect(displayNumberOf(map, 2)).toBe(1);
    expect(Array.from(map.values())).toEqual([1, 2, 3, 4]);
  });

  it('leaves the survivors unaffected when the last step is removed', () => {
    const method = makeMethod(5);
    method[4].removed = true; // step 5
    const map = displayNumbers(method);
    expect(Array.from(map.entries())).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ]);
  });

  it('returns an empty map when every step is removed', () => {
    const method = makeMethod(3).map((step) => ({ ...step, removed: true }));
    expect(displayNumbers(method).size).toBe(0);
  });

  it('returns an empty map for an empty method', () => {
    expect(displayNumbers([]).size).toBe(0);
  });

  it('treats a step with no removed key at all as active', () => {
    const map = displayNumbers([{ n: 1 }, { n: 2 }]);
    expect(displayNumberOf(map, 2)).toBe(2);
  });

  it('never mutates or reorders the array it is given', () => {
    const method = makeMethod(5);
    method[1].removed = true;
    const before = structuredClone(method);
    displayNumbers(method);
    expect(method).toEqual(before);
  });

  it('computes positions, not offsets from the stored key, for keys that are not one-based or contiguous', () => {
    const method = [{ n: 40 }, { n: 10 }, { n: 25 }];
    const map = displayNumbers(method);
    expect(Array.from(map.entries())).toEqual([
      [40, 1],
      [10, 2],
      [25, 3],
    ]);
  });
});

describe('displayNumberOf', () => {
  it('returns the position for a key the map holds', () => {
    const map = displayNumbers(makeMethod(3));
    expect(displayNumberOf(map, 2)).toBe(2);
  });

  it('returns null, not undefined, for a key the map does not hold', () => {
    const map = displayNumbers([{ n: 1, removed: true }]);
    const result = displayNumberOf(map, 1);
    expect(result).toBeNull();
    expect(result).not.toBeUndefined();
  });

  it('returns null for a key of null or undefined', () => {
    const map = displayNumbers(makeMethod(3));
    expect(displayNumberOf(map, null)).toBeNull();
    expect(displayNumberOf(map, undefined)).toBeNull();
  });
});
