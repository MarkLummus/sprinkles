// Domain suite for the step-key allocator (Phase 7 MAKE-02, D-05, D-05a).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework.
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
