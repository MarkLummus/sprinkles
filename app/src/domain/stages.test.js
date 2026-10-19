import { describe, expect, it } from 'vitest';
import { STAGE_IDS } from './stages.js';

describe('STAGE_IDS', () => {
  it('holds the twelve fixed stage ids in process order', () => {
    expect([...STAGE_IDS]).toEqual([
      'prep',
      'dry_blend',
      'hydrate',
      'combine',
      'heat',
      'after_heat',
      'cool',
      'age',
      'before_churn',
      'during_churn',
      'pack',
      'harden',
    ]);
  });

  it('is frozen, so no module can add a stage', () => {
    expect(Object.isFrozen(STAGE_IDS)).toBe(true);
    expect(() => STAGE_IDS.push('simmer')).toThrow(TypeError);
  });
});
