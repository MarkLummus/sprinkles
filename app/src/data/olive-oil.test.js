// Seed-content contract for the churned olive oil version: the ten method
// steps in the sheet's order, their typed targets, and the five authored
// notes, transcribed verbatim from the printed sheet (see plan 01-02).
import { describe, it, expect } from 'vitest';
import { oliveOilVersion } from './olive-oil.js';
import { SEED_USES } from '../store/versionLift.js';

function targetValue(step, label) {
  return step.targets?.find((t) => t.label === label)?.value;
}

describe('oliveOilVersion.method', () => {
  it('has ten entries whose n values read 1 through 10 in order', () => {
    expect(oliveOilVersion.method.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('every entry has a non-empty leadIn and a non-empty instruction', () => {
    for (const step of oliveOilVersion.method) {
      expect(step.leadIn).toBeTruthy();
      expect(step.instruction).toBeTruthy();
    }
  });

  it('step 2 targets temp 85 °C and hold 2 min', () => {
    const step = oliveOilVersion.method[1];
    expect(targetValue(step, 'temp')).toBe('85 °C');
    expect(targetValue(step, 'hold')).toBe('2 min');
  });

  it('step 5 targets temp 69 °C, hold 40 min, come-up 10–12 min', () => {
    const step = oliveOilVersion.method[4];
    expect(targetValue(step, 'temp')).toBe('69 °C');
    expect(targetValue(step, 'hold')).toBe('40 min');
    expect(targetValue(step, 'come-up')).toBe('10–12 min');
  });

  it('step 7 targets temp 4 °C and time 12–24 h', () => {
    const step = oliveOilVersion.method[6];
    expect(targetValue(step, 'temp')).toBe('4 °C');
    expect(targetValue(step, 'time')).toBe('12–24 h');
  });

  it('step 9 targets overrun 25–30%', () => {
    const step = oliveOilVersion.method[8];
    expect(targetValue(step, 'overrun')).toBe('25–30%');
  });

  it('step 10 targets serve −11 to −12 °C', () => {
    const step = oliveOilVersion.method[9];
    expect(targetValue(step, 'serve')).toBe('−11 to −12 °C');
  });
});

describe('oliveOilVersion.authored', () => {
  it('has exactly three carried-forward notes and two before-you-start notes', () => {
    expect(oliveOilVersion.authored.carriedForward).toHaveLength(3);
    expect(oliveOilVersion.authored.beforeYouStart).toHaveLength(2);
  });

  it('mentions neither ultra-pasteurised mass nor machine minimum fill — both are derived, not authored', () => {
    const allNotes = [...oliveOilVersion.authored.carriedForward, ...oliveOilVersion.authored.beforeYouStart]
      .map((note) => note.text)
      .join(' ')
      .toLowerCase();
    expect(allNotes).not.toMatch(/ultra-pasteuris/);
    expect(allNotes).not.toMatch(/minimum fill/);
  });

  it('is three carried-forward and two before-you-start note objects, each with a text string and inheritedFrom null', () => {
    for (const note of [...oliveOilVersion.authored.carriedForward, ...oliveOilVersion.authored.beforeYouStart]) {
      expect(typeof note.text).toBe('string');
      expect(note.inheritedFrom).toBeNull();
    }
  });

  it('carries the exact authored wording for the low-anchor and Graza-tasting notes', () => {
    const carriedForwardTexts = oliveOilVersion.authored.carriedForward.map((note) => note.text);
    const beforeYouStartTexts = oliveOilVersion.authored.beforeYouStart.map((note) => note.text);
    expect(carriedForwardTexts).toContain('This is the low anchor, not the oil-forward target. Oil is 28% of total fat. Expect a textural contribution and background flavour, not a dominant one.');
    expect(beforeYouStartTexts).toContain(
      'Taste the Graza straight. Polyphenols degrade with light and oxygen, and the squeeze bottle offers less protection than dark glass. An old bottle at 40 g will disappear entirely.',
    );
  });
});

describe('oliveOilVersion.method uses (D-08)', () => {
  it('every one of the ten steps has a uses array', () => {
    for (const step of oliveOilVersion.method) {
      expect(Array.isArray(step.uses)).toBe(true);
    }
  });

  it('the six non-empty uses lists match SEED_USES exactly, by step n', () => {
    for (const step of oliveOilVersion.method) {
      expect(step.uses).toEqual(SEED_USES[step.n]);
    }
  });

  it('every row id named in any step\'s uses exists in oliveOilVersion.rows', () => {
    const rowIds = new Set(oliveOilVersion.rows.map((row) => row.id));
    for (const step of oliveOilVersion.method) {
      for (const rowId of step.uses) {
        expect(rowIds.has(rowId)).toBe(true);
      }
    }
  });

  it('every step carries removed: false', () => {
    for (const step of oliveOilVersion.method) {
      expect(step.removed).toBe(false);
    }
  });
});

describe('oliveOilVersion.declaredAxes', () => {
  it('is two entries, each carrying its own name, low and high anchor words (D-15)', () => {
    expect(oliveOilVersion.declaredAxes).toEqual([
      { name: 'Olive oil character', low: "can't find it", high: 'tastes of oil first' },
      { name: 'Bitterness', low: 'none', high: 'catches the throat' },
    ]);
  });
});
