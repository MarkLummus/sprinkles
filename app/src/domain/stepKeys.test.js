// Domain suite for the step-key allocator (Phase 7 MAKE-02, D-05, D-05a).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework.
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { nextStepKey } from './stepKeys.js';

function steps(...keys) {
  return keys.map((n) => ({ n, removed: false }));
}

describe('nextStepKey — never reuses a key (criterion 2, D-05)', () => {
  it('returns 1 for an empty method', () => {
    expect(nextStepKey([])).toBe(1);
  });

  it('returns 5 for steps 1 to 4 with step 3 removed, never 3', () => {
    const method = steps(1, 2, 3, 4);
    method[2].removed = true;
    expect(nextStepKey(method)).toBe(5);
  });

  it('returns 5 for steps 1 to 4 with step 4 removed: removing the highest step does not free its key', () => {
    const method = steps(1, 2, 3, 4);
    method[3].removed = true;
    expect(nextStepKey(method)).toBe(5);
  });

  it('returns 5 for steps 1, 2 and 4: the highest key, not the count', () => {
    expect(nextStepKey(steps(1, 2, 4))).toBe(5);
  });

  it('reads the keys in any order', () => {
    expect(nextStepKey(steps(4, 1, 3, 2))).toBe(5);
  });
});

describe('nextStepKey — the supported range is safe integers', () => {
  it('returns Number.MAX_SAFE_INTEGER when the highest key is one below it', () => {
    expect(nextStepKey(steps(1, Number.MAX_SAFE_INTEGER - 1))).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('throws a RangeError when the highest key is Number.MAX_SAFE_INTEGER, since the next key would not be safe', () => {
    const method = steps(1, Number.MAX_SAFE_INTEGER);
    expect(() => nextStepKey(method)).toThrow(RangeError);
    expect(() => nextStepKey(method)).toThrow('no safe step key is left after 9007199254740991');
  });

  it.each([2 ** 53, 2.5, NaN, Infinity, '3', undefined])(
    'throws a RangeError for a step key of %s',
    (bad) => {
      const method = [...steps(1), { n: bad, removed: false }];
      expect(() => nextStepKey(method)).toThrow(RangeError);
      expect(() => nextStepKey(method)).toThrow(/is not a safe integer$/);
    },
  );

  it('returns 1 when every key is 0 or below', () => {
    expect(nextStepKey([{ n: 0 }, { n: -1 }])).toBe(1);
  });

  it('never mutates the method it reads', () => {
    const method = steps(1, 2, 3);
    method[1].removed = true;
    method.forEach((step) => Object.freeze(step));
    Object.freeze(method);
    const before = structuredClone(method);
    expect(nextStepKey(method)).toBe(4);
    expect(method).toEqual(before);
  });
});

describe('stepKeys.js stays pure (criterion 4)', () => {
  it('stepKeys.js imports only sibling domain modules and reads no clock or random source', () => {
    const source = readFileSync(new URL('./stepKeys.js', import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    const specifiers = [...source.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1]);
    for (const specifier of specifiers) {
      expect(specifier).toMatch(/^\.\/[\w.-]+\.js$/);
    }
    expect(source).not.toMatch(/\bimport\s*\(|^\s*import\s+'/m);
    expect(source).not.toMatch(/\bnew Date\b|\bDate\.now\b|\bcrypto\b|\bMath\.random\b/);
  });

  it('its own test file carries no environment docblock on its first line', () => {
    const first = readFileSync(new URL('./stepKeys.test.js', import.meta.url), 'utf8').split('\n')[0];
    expect(first).not.toContain('@vitest-environment');
  });
});
