// Seed-content contract for the churned olive oil version: the ten method
// steps in the sheet's order, their typed targets, and the five authored
// notes, transcribed verbatim from the printed sheet (see plan 01-02).
import { describe, it, expect } from 'vitest';
import { oliveOilVersion, SEED_USES } from './olive-oil.js';
import { rowGrams } from '../domain/rows.js';

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

describe('oliveOilVersion.authored (D-06, D-10: Carried forward is gone, not moved)', () => {
  it('has exactly one key, beforeYouStart, holding the two existing notes', () => {
    expect(Object.keys(oliveOilVersion.authored)).toEqual(['beforeYouStart']);
    expect(oliveOilVersion.authored.beforeYouStart).toHaveLength(2);
  });

  it('mentions neither ultra-pasteurised mass nor machine minimum fill — both are derived, not authored', () => {
    const allNotes = oliveOilVersion.authored.beforeYouStart
      .map((note) => note.text)
      .join(' ')
      .toLowerCase();
    expect(allNotes).not.toMatch(/ultra-pasteuris/);
    expect(allNotes).not.toMatch(/minimum fill/);
  });

  it('is two before-you-start note objects, each with a text string and inheritedFrom null', () => {
    for (const note of oliveOilVersion.authored.beforeYouStart) {
      expect(typeof note.text).toBe('string');
      expect(note.inheritedFrom).toBeNull();
    }
  });

  it('carries the exact authored wording for the Graza-tasting note', () => {
    const beforeYouStartTexts = oliveOilVersion.authored.beforeYouStart.map((note) => note.text);
    expect(beforeYouStartTexts).toContain(
      'Taste the Graza straight. Polyphenols degrade with light and oxygen, and the squeeze bottle offers less protection than dark glass. An old bottle at 40 g will disappear entirely.',
    );
  });

  it('the carried-forward words are dropped entirely, not moved into beforeYouStart (decisions_recorded 10)', () => {
    const beforeYouStartTexts = oliveOilVersion.authored.beforeYouStart.map((note) => note.text).join(' ');
    expect(beforeYouStartTexts).not.toContain('low anchor');
    expect(beforeYouStartTexts).not.toContain('Gellan in the cream');
    expect(beforeYouStartTexts).not.toContain('glucose syrup');
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

describe('oliveOilVersion.declaredAxes and declaredFlaw (03.3.1-CONTEXT.md D-07)', () => {
  it('declares the battery\'s Body and Oil pair by name', () => {
    expect(oliveOilVersion.declaredAxes).toEqual(['Body', 'Oil']);
  });

  it('declares Bitter as the recipe\'s declared flaw', () => {
    expect(oliveOilVersion.declaredFlaw).toBe('Bitter');
  });

  it('carries VERSION_SCHEMA_VERSION 5', () => {
    expect(oliveOilVersion.schemaVersion).toBe(5);
  });
});

describe('oliveOilVersion.sheetTitle and sheetDescription (D-09, D-11)', () => {
  it('sheetTitle is "Olive Oil Ice Cream", exactly as sketch 011\'s 1600-batch.html headnote h1', () => {
    expect(oliveOilVersion.sheetTitle).toBe('Olive Oil Ice Cream');
  });

  it("sheetDescription is the exact headnote__prose paragraph from sketch 011's 1600-batch.html", () => {
    expect(oliveOilVersion.sheetDescription).toBe(
      'Silky and quietly savoury. Fresh olive oil adds a gentle fruitiness without overwhelming the cream, and a little more salt than you would think carries it. Serve it soft, with flaky salt.',
    );
  });

  it('carries no recipeName or headnote key — the recipe record carries the name and description now (D-11)', () => {
    expect(oliveOilVersion.recipeName).toBeUndefined();
    expect(oliveOilVersion.headnote).toBeUndefined();
  });
});

describe('oliveOilVersion.rows.portions (D-01, D-09)', () => {
  const rowById = (id) => oliveOilVersion.rows.find((row) => row.id === id);

  it('the two split rows carry their portions in step order, deriving their existing totals exactly', () => {
    const wholeMilk = rowById('row-01');
    const sucrose = rowById('row-05');
    expect(wholeMilk.portions).toEqual([
      { step: 2, grams: 120 },
      { step: 3, grams: 250.4 },
    ]);
    expect(sucrose.portions).toEqual([
      { step: 2, grams: 12 },
      { step: 3, grams: 64 },
    ]);
    expect(rowGrams(wholeMilk)).toBe(370.4);
    expect(rowGrams(sucrose)).toBe(76);
  });

  it('no row carries a stored total or a step reference outside its portions (D-01, D-02)', () => {
    for (const row of oliveOilVersion.rows) {
      expect(row.grams).toBeUndefined();
      expect(row.step).toBeUndefined();
    }
  });
});

describe('the split-step prose carries no amounts (D-03)', () => {
  it("step 2's and step 3's instructions state no digit-plus-g amount for the milk or the sucrose", () => {
    const step2 = oliveOilVersion.method[1];
    const step3 = oliveOilVersion.method[2];
    // The gum blend (step 2's own unsplit amount, 1.68 g) and the SMP,
    // dextrose, salt and cream amounts (step 3's unsplit amounts) are
    // deliberately still present — the sentence stays an instruction. Only
    // the milk's and the sucrose's own grams (12 g / 120 g at step 2,
    // ~64 g / ~250 g at step 3) are checked absent, since the portion now
    // says them.
    expect(step2.instruction).toBe(
      'Toss 1.68 g of the gum blend with the sucrose. Whisk into the milk in a small saucepan. Heat, whisking constantly, then pull off.',
    );
    expect(step3.instruction).toBe(
      'Whisk the remaining sucrose, plus 22.4 g SMP, 12 g dextrose and 3.2 g salt, into the remaining milk and all 252.8 g of cream. Add the hot gum slurry. Immersion blend.',
    );
    expect(step2.instruction).not.toMatch(/~?12\s*g|~?120\s*g/);
    expect(step3.instruction).not.toMatch(/~?64\s*g\)?|~?250\s*g\)?/);
  });
});
