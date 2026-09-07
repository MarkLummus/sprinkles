// Domain suite for the one comparison of two versions (RESEARCH.md, D-03).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework. Every fixture is a structuredClone of the
// seeded olive oil version, edited per test.
import { describe, it, expect } from 'vitest';
import { buildDiff } from './diff.js';
import { oliveOilVersion } from '../data/olive-oil.js';

function clone() {
  return structuredClone(oliveOilVersion);
}

function findRow(version, id) {
  return version.rows.find((row) => row.id === id);
}

function findStep(version, n) {
  return version.method.find((step) => step.n === n);
}

describe('buildDiff — identity', () => {
  it('reports changed false on every row, step, target, figure and the total when compared with itself', () => {
    const version = clone();
    const diff = buildDiff(version, version);

    expect(diff.rows.every((row) => !row.gramsChanged && !row.shareChanged && !row.stepChanged && !row.removedChanged)).toBe(true);
    expect(diff.steps.every((step) => !step.textChanged && !step.usesChanged && !step.removedChanged)).toBe(true);
    expect(diff.steps.every((step) => step.targets.every((target) => !target.changed))).toBe(true);
    expect(diff.figures.every((figure) => !figure.changed)).toBe(true);
    expect(diff.total.changed).toBe(false);
    expect(diff.versionLabelChanged).toBe(false);
    expect(diff.headnoteChanged).toBe(false);
    expect(diff.targetsChanged).toBe(false);
  });
});

describe('buildDiff — grams', () => {
  it('reports gramsFrom/gramsTo/gramsChanged for the one row that moved, and false for every other row', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-03').grams = 48; // Graza Drizzle, oil: 40 -> 48

    const diff = buildDiff(current, baseline);
    const oilDiff = diff.rows.find((row) => row.id === 'row-03');
    expect(oilDiff.gramsFrom).toBe(40);
    expect(oilDiff.gramsTo).toBe(48);
    expect(oilDiff.gramsChanged).toBe(true);

    for (const row of diff.rows) {
      if (row.id === 'row-03') continue;
      expect(row.gramsChanged).toBe(false);
    }
  });
});

describe('buildDiff — share follows grams even where grams did not move', () => {
  it("whole milk's gramsChanged is false while its shareChanged is true, 46.3% against 45.9%", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-03').grams = 48; // total mass 799.68 -> 807.68

    const diff = buildDiff(current, baseline);
    const wholeMilkDiff = diff.rows.find((row) => row.id === 'row-01');
    expect(wholeMilkDiff.gramsChanged).toBe(false);
    expect(wholeMilkDiff.shareChanged).toBe(true);
    expect(wholeMilkDiff.shareFrom).toBe('46.3%');
    expect(wholeMilkDiff.shareTo).toBe('45.9%');
  });
});

describe('buildDiff — share compared at display precision', () => {
  it('reports shareChanged false for a grams change too small to move the one-decimal share', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-08').grams = 3.2001; // fine sea salt, a tenth-of-a-milligram edit

    const diff = buildDiff(current, baseline);
    const saltDiff = diff.rows.find((row) => row.id === 'row-08');
    expect(saltDiff.gramsChanged).toBe(true);
    expect(saltDiff.shareChanged).toBe(false);
    expect(saltDiff.shareFrom).toBe(saltDiff.shareTo);
  });
});

describe('buildDiff — figures compared at display precision', () => {
  it('reports total fat from 18.0 to 18.8, changed true, for the oil row moved 40 -> 48', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-03').grams = 48;

    const diff = buildDiff(current, baseline);
    const fatDiff = diff.figures.find((figure) => figure.key === 'fat');
    expect(fatDiff.from.toFixed(1)).toBe('18.0');
    expect(fatDiff.to.toFixed(1)).toBe('18.8');
    expect(fatDiff.changed).toBe(true);
  });

  it('reports changed false for a figure whose underlying value moved by less than half of the last printed decimal', () => {
    const baseline = clone();
    const current = clone();
    // Guar gum has no fat contribution; a hundredth-of-a-gram edit moves
    // total mass (the fat percentage's denominator) by an amount far below
    // half of fat's own printed decimal (0.05 percentage points).
    findRow(current, 'row-11').grams = 0.4801;

    const diff = buildDiff(current, baseline);
    const fatDiff = diff.figures.find((figure) => figure.key === 'fat');
    expect(fatDiff.from).not.toBe(fatDiff.to);
    expect(fatDiff.changed).toBe(false);
  });

  it('zips figures by key, in FIGURE_SPECS order, with the six keys pac, pod, fat, msnf, sugar, solids', () => {
    const version = clone();
    const diff = buildDiff(version, version);
    expect(diff.figures.map((figure) => figure.key)).toEqual(['pac', 'pod', 'fat', 'msnf', 'sugar', 'solids']);
  });
});

describe('buildDiff — removed rows and steps excluded from figure and total math', () => {
  it('excludes a removed row from the total on the side that removed it', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-09').removed = true; // soy lecithin, 1.2 g

    const diff = buildDiff(current, baseline);
    expect(diff.total.from).toBe('799.7 g');
    expect(diff.total.to).toBe('798.5 g');
    expect(diff.total.changed).toBe(true);
  });
});

describe('buildDiff — the total', () => {
  it("reads 'from' 799.7 g, 'to' 807.7 g, changed true with the oil row at 48", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-03').grams = 48;

    const diff = buildDiff(current, baseline);
    expect(diff.total.from).toBe('799.7 g');
    expect(diff.total.to).toBe('807.7 g');
    expect(diff.total.changed).toBe(true);
  });
});

describe('buildDiff — steps, text', () => {
  it("reports textChanged true for the one step whose instruction changed, false elsewhere", () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 3).instruction = 'A rewritten instruction.';

    const diff = buildDiff(current, baseline);
    for (const step of diff.steps) {
      expect(step.textChanged).toBe(step.n === 3);
    }
  });

  it('reports textChanged true for a purpose-only edit', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 4).purpose = 'A rewritten purpose.';

    const diff = buildDiff(current, baseline);
    expect(diff.steps.find((step) => step.n === 4).textChanged).toBe(true);
  });

  it('reports textChanged true for an aside-only edit', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 2).aside = 'A rewritten aside.';

    const diff = buildDiff(current, baseline);
    expect(diff.steps.find((step) => step.n === 2).textChanged).toBe(true);
  });

  it("carries the baseline's four text fields on textFrom", () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 3).instruction = 'A rewritten instruction.';

    const diff = buildDiff(current, baseline);
    const step3Diff = diff.steps.find((step) => step.n === 3);
    expect(step3Diff.textFrom.instruction).toBe(findStep(baseline, 3).instruction);
    expect(step3Diff.textFrom.leadIn).toBe(findStep(baseline, 3).leadIn);
  });
});

describe('buildDiff — steps, per-field change flags (03-09)', () => {
  it('reports only leadInChanged for a step whose lead-in changed', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 3).leadIn = 'A rewritten lead-in.';

    const diff = buildDiff(current, baseline);
    const step3Diff = diff.steps.find((step) => step.n === 3);
    expect(step3Diff.leadInChanged).toBe(true);
    expect(step3Diff.instructionChanged).toBe(false);
    expect(step3Diff.purposeChanged).toBe(false);
    expect(step3Diff.asideChanged).toBe(false);
  });

  it('reports only instructionChanged for a step whose instruction changed', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 3).instruction = 'A rewritten instruction.';

    const diff = buildDiff(current, baseline);
    const step3Diff = diff.steps.find((step) => step.n === 3);
    expect(step3Diff.leadInChanged).toBe(false);
    expect(step3Diff.instructionChanged).toBe(true);
    expect(step3Diff.purposeChanged).toBe(false);
    expect(step3Diff.asideChanged).toBe(false);
  });

  it('reports only purposeChanged for a step whose purpose changed', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 1).purpose = 'A rewritten purpose.'; // step 1 has no aside

    const diff = buildDiff(current, baseline);
    const step1Diff = diff.steps.find((step) => step.n === 1);
    expect(step1Diff.leadInChanged).toBe(false);
    expect(step1Diff.instructionChanged).toBe(false);
    expect(step1Diff.purposeChanged).toBe(true);
    expect(step1Diff.asideChanged).toBe(false);
  });

  it('reports only asideChanged for a step whose aside changed', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 2).aside = 'A rewritten aside.'; // step 2 has no purpose

    const diff = buildDiff(current, baseline);
    const step2Diff = diff.steps.find((step) => step.n === 2);
    expect(step2Diff.leadInChanged).toBe(false);
    expect(step2Diff.instructionChanged).toBe(false);
    expect(step2Diff.purposeChanged).toBe(false);
    expect(step2Diff.asideChanged).toBe(true);
  });

  it('reports all four flags true for a step with all four fields changed', () => {
    const baseline = clone();
    const current = clone();
    const step4 = findStep(current, 4); // step 4 has both purpose and aside
    step4.leadIn = 'A rewritten lead-in.';
    step4.instruction = 'A rewritten instruction.';
    step4.purpose = 'A rewritten purpose.';
    step4.aside = 'A rewritten aside.';

    const diff = buildDiff(current, baseline);
    const step4Diff = diff.steps.find((step) => step.n === 4);
    expect(step4Diff.leadInChanged).toBe(true);
    expect(step4Diff.instructionChanged).toBe(true);
    expect(step4Diff.purposeChanged).toBe(true);
    expect(step4Diff.asideChanged).toBe(true);
    expect(step4Diff.textChanged).toBe(true);
  });

  it('textChanged is the disjunction of the four flags — true for any one, false for none', () => {
    const baseline = clone();
    const identity = buildDiff(baseline, baseline);
    expect(identity.steps.every((step) => !step.textChanged)).toBe(true);

    const current = clone();
    findStep(current, 3).leadIn = 'A rewritten lead-in.';
    const diff = buildDiff(current, baseline);
    const step3Diff = diff.steps.find((step) => step.n === 3);
    expect(step3Diff.textChanged).toBe(step3Diff.leadInChanged || step3Diff.instructionChanged || step3Diff.purposeChanged || step3Diff.asideChanged);
  });

  it('reports purposeChanged false for an absent baseline purpose against a current empty-string purpose', () => {
    const baseline = clone(); // step 2 has no purpose key
    const current = clone();
    findStep(current, 2).purpose = '';

    const diff = buildDiff(current, baseline);
    expect(diff.steps.find((step) => step.n === 2).purposeChanged).toBe(false);
  });

  it('reports purposeChanged false for an empty-string baseline purpose against a current absent purpose', () => {
    const baseline = clone();
    findStep(baseline, 2).purpose = '';
    const current = clone(); // step 2 has no purpose key

    const diff = buildDiff(current, baseline);
    expect(diff.steps.find((step) => step.n === 2).purposeChanged).toBe(false);
  });

  it('reports asideChanged false for an absent baseline aside against a current empty-string aside', () => {
    const baseline = clone(); // step 1 has no aside key
    const current = clone();
    findStep(current, 1).aside = '';

    const diff = buildDiff(current, baseline);
    expect(diff.steps.find((step) => step.n === 1).asideChanged).toBe(false);
  });

  it('reports asideChanged false for an empty-string baseline aside against a current absent aside', () => {
    const baseline = clone();
    findStep(baseline, 1).aside = '';
    const current = clone(); // step 1 has no aside key

    const diff = buildDiff(current, baseline);
    expect(diff.steps.find((step) => step.n === 1).asideChanged).toBe(false);
  });

  it('reports purposeChanged true for an absent baseline purpose against real current text', () => {
    const baseline = clone(); // step 2 has no purpose key
    const current = clone();
    findStep(current, 2).purpose = 'A real purpose, freshly written.';

    const diff = buildDiff(current, baseline);
    expect(diff.steps.find((step) => step.n === 2).purposeChanged).toBe(true);
  });

  it('reports all four flags true and textFrom null for a step present in current but absent from baseline', () => {
    const baseline = clone();
    const current = clone();
    current.method.push({
      n: 99,
      leadIn: 'New step',
      instruction: 'A brand new instruction.',
      purpose: 'A brand new purpose.',
      aside: 'A brand new aside.',
      removed: false,
      uses: [],
    });

    const diff = buildDiff(current, baseline);
    const newStepDiff = diff.steps.find((step) => step.n === 99);
    expect(newStepDiff.leadInChanged).toBe(true);
    expect(newStepDiff.instructionChanged).toBe(true);
    expect(newStepDiff.purposeChanged).toBe(true);
    expect(newStepDiff.asideChanged).toBe(true);
    expect(newStepDiff.textFrom).toBe(null);
  });
});

describe('buildDiff — targets', () => {
  it("reports step 8's blend chip from '45 s' to '60 s', changed true, and the other chip unchanged", () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 8).targets.find((target) => target.label === 'blend').value = '60 s';

    const diff = buildDiff(current, baseline);
    const step8Diff = diff.steps.find((step) => step.n === 8);
    const blendDiff = step8Diff.targets.find((target) => target.label === 'blend');
    const tempDiff = step8Diff.targets.find((target) => target.label === 'temp');
    expect(blendDiff).toEqual({ label: 'blend', from: '45 s', to: '60 s', changed: true });
    expect(tempDiff.changed).toBe(false);
  });

  it('reports changed true with the absent side null for a chip present on only one side', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 8).targets = findStep(current, 8).targets.filter((target) => target.label !== 'temp');

    const diff = buildDiff(current, baseline);
    const step8Diff = diff.steps.find((step) => step.n === 8);
    const tempDiff = step8Diff.targets.find((target) => target.label === 'temp');
    expect(tempDiff).toEqual({ label: 'temp', from: '4 °C', to: null, changed: true });
  });
});

describe('buildDiff — uses', () => {
  it("reports usesChanged true for the one step whose uses gained a row, false elsewhere", () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 2).uses = [...findStep(current, 2).uses, 'row-06'];

    const diff = buildDiff(current, baseline);
    for (const step of diff.steps) {
      expect(step.usesChanged).toBe(step.n === 2);
    }
  });

  it('reports usesChanged false for a reordering of the same members', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 2).uses = [...findStep(current, 2).uses].reverse();

    const diff = buildDiff(current, baseline);
    expect(diff.steps.find((step) => step.n === 2).usesChanged).toBe(false);
  });
});

describe('buildDiff — removal', () => {
  it('reports removed true for a row removed in current and not in baseline', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-09').removed = true;

    const diff = buildDiff(current, baseline);
    const lecithinDiff = diff.rows.find((row) => row.id === 'row-09');
    expect(lecithinDiff.removed).toBe(true);
    expect(lecithinDiff.removedChanged).toBe(true);
  });

  it('reports removed true and gramsChanged false for a row removed on both sides', () => {
    const baseline = clone();
    findRow(baseline, 'row-09').removed = true;
    const current = clone();
    findRow(current, 'row-09').removed = true;

    const diff = buildDiff(current, baseline);
    const lecithinDiff = diff.rows.find((row) => row.id === 'row-09');
    expect(lecithinDiff.removed).toBe(true);
    expect(lecithinDiff.removedChanged).toBe(false);
    expect(lecithinDiff.gramsChanged).toBe(false);
  });
});

describe('buildDiff — never mutates, never reorders', () => {
  it('leaves both arguments deep-equal a structuredClone taken before the call', () => {
    const current = clone();
    findRow(current, 'row-03').grams = 48;
    const baseline = clone();
    const currentBefore = structuredClone(current);
    const baselineBefore = structuredClone(baseline);

    buildDiff(current, baseline);

    expect(current).toEqual(currentBefore);
    expect(baseline).toEqual(baselineBefore);
  });

  it("keeps row descriptors in current.rows order and step descriptors in ascending n", () => {
    const current = clone();
    const baseline = clone();
    const diff = buildDiff(current, baseline);

    expect(diff.rows.map((row) => row.id)).toEqual(current.rows.map((row) => row.id));
    expect(diff.steps.map((step) => step.n)).toEqual(current.method.map((step) => step.n));
    expect(diff.steps.every((step, index, all) => index === 0 || all[index - 1].n < step.n)).toBe(true);
  });
});

describe('buildDiff — empty', () => {
  it('returns an empty rows array, an empty figures array, and a total of 0.0 g on both sides for a version with no rows', () => {
    const current = { ...clone(), rows: [], method: [] };
    const baseline = { ...clone(), rows: [], method: [] };

    const diff = buildDiff(current, baseline);
    expect(diff.rows).toEqual([]);
    expect(diff.figures).toEqual([]);
    expect(diff.total).toEqual({ from: '0.0 g', to: '0.0 g', changed: false });
  });
});
