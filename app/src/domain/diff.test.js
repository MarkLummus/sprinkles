// Domain suite for the one comparison of two versions (RESEARCH.md, D-03).
// Runs under Vitest's default node environment — imports no store, no
// component, and no framework. Every fixture is a structuredClone of the
// seeded olive oil version, edited per test.
import { describe, it, expect } from 'vitest';
import { buildDiff } from './diff.js';
import { buildFigures } from './figures.js';
import { activeRows, activeSteps } from './rows.js';
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

    expect(diff.rows.every((row) => !row.gramsChanged && !row.shareChanged && !row.stepsChanged && !row.removedChanged)).toBe(true);
    expect(diff.steps.every((step) => !step.textChanged && !step.usesChanged && !step.removedChanged)).toBe(true);
    expect(diff.steps.every((step) => step.targets.every((target) => !target.changed))).toBe(true);
    expect(diff.figures.every((figure) => !figure.changed)).toBe(true);
    expect(diff.total.changed).toBe(false);
    expect(diff.versionLabelChanged).toBe(false);
    expect(diff.sheetTitleChanged).toBe(false);
    expect(diff.sheetDescriptionChanged).toBe(false);
    expect(diff.targetsChanged).toBe(false);
  });
});

describe('buildDiff — sheetTitleChanged and sheetDescriptionChanged (D-09, D-11)', () => {
  it('reports each field independently: a changed title with an unchanged description reports true and false', () => {
    const baseline = clone();
    const current = clone();
    current.sheetTitle = 'A new Sheet title';

    const diff = buildDiff(current, baseline);
    expect(diff.sheetTitleChanged).toBe(true);
    expect(diff.sheetDescriptionChanged).toBe(false);
  });

  it('reports a changed description with an unchanged title as false and true', () => {
    const baseline = clone();
    const current = clone();
    current.sheetDescription = 'A new Sheet description';

    const diff = buildDiff(current, baseline);
    expect(diff.sheetTitleChanged).toBe(false);
    expect(diff.sheetDescriptionChanged).toBe(true);
  });
});

describe('buildDiff — grams', () => {
  it('reports gramsFrom/gramsTo/gramsChanged for the one row that moved, and false for every other row', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-03').portions[0].grams = 48; // Graza Drizzle, oil: 40 -> 48

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

describe('buildDiff — steps (portions, D-02)', () => {
  it('reports stepsFrom/stepsTo/stepsChanged for a row reallocated between its two steps, with gramsChanged staying false', () => {
    const baseline = clone();
    const current = clone();
    // Whole milk's total (370.4) is unchanged; only its split between step
    // 2 and step 3 moves.
    findRow(current, 'row-01').portions = [
      { step: 2, grams: 100 },
      { step: 3, grams: 270.4 },
    ];

    const diff = buildDiff(current, baseline);
    const wholeMilkDiff = diff.rows.find((row) => row.id === 'row-01');
    expect(wholeMilkDiff.stepsFrom).toEqual([2, 3]);
    expect(wholeMilkDiff.stepsTo).toEqual([2, 3]);
    expect(wholeMilkDiff.gramsChanged).toBe(false);
    expect(wholeMilkDiff.stepsChanged).toBe(false);
  });

  it('reports stepsChanged true for a row whose portions reorder to different steps, even though the array members are the same set', () => {
    const baseline = clone();
    const current = clone();
    // Reverse the two steps a portion is attached to — same two step
    // numbers, different order, so an order-insensitive comparison (like
    // uses' sameSet) would wrongly report no change.
    findRow(current, 'row-01').portions = [
      { step: 3, grams: 120 },
      { step: 2, grams: 250.4 },
    ];

    const diff = buildDiff(current, baseline);
    const wholeMilkDiff = diff.rows.find((row) => row.id === 'row-01');
    expect(wholeMilkDiff.stepsChanged).toBe(true);
  });
});

describe('buildDiff — share follows grams even where grams did not move', () => {
  it("whole milk's gramsChanged is false while its shareChanged is true, 46.3% against 45.9%", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-03').portions[0].grams = 48; // total mass 799.68 -> 807.68

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
    findRow(current, 'row-08').portions[0].grams = 3.2001; // fine sea salt, a tenth-of-a-milligram edit

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
    findRow(current, 'row-03').portions[0].grams = 48;

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
    findRow(current, 'row-11').portions[0].grams = 0.4801;

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
    findRow(current, 'row-03').portions[0].grams = 48;

    const diff = buildDiff(current, baseline);
    expect(diff.total.from).toBe('799.7 g');
    expect(diff.total.to).toBe('807.7 g');
    expect(diff.total.changed).toBe(true);
  });

  // The bare-number pair (critique P2 #2): the total row's own struck
  // value reads fromValue rather than composing a second unit onto
  // `from`, which already carries one.
  it('carries fromValue/toValue as the bare numbers from/to already print with a unit', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-03').portions[0].grams = 48;

    const diff = buildDiff(current, baseline);
    expect(diff.total.fromValue).toBe('799.7');
    expect(diff.total.toValue).toBe('807.7');
    expect(diff.total.from).toBe(`${diff.total.fromValue} g`);
    expect(diff.total.to).toBe(`${diff.total.toValue} g`);
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
    findRow(current, 'row-03').portions[0].grams = 48;
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
    expect(diff.total).toEqual({ from: '0.0 g', to: '0.0 g', fromValue: '0.0', toValue: '0.0', changed: false });
  });
});

describe('buildDiff — removal through a line (03.6, decision 51)', () => {
  it('reports a one-line row with its line out in current and not in baseline as removed and changed', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-09').portions[0].removed = true;

    const lecithinDiff = buildDiff(current, baseline).rows.find((row) => row.id === 'row-09');
    expect(lecithinDiff.removed).toBe(true);
    expect(lecithinDiff.removedChanged).toBe(true);
  });

  it('reports it as removed and not changed when its line is out on both sides', () => {
    const baseline = clone();
    findRow(baseline, 'row-09').portions[0].removed = true;
    const current = clone();
    findRow(current, 'row-09').portions[0].removed = true;

    const lecithinDiff = buildDiff(current, baseline).rows.find((row) => row.id === 'row-09');
    expect(lecithinDiff.removed).toBe(true);
    expect(lecithinDiff.removedChanged).toBe(false);
  });

  it('still reports the older row flag the same way', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-09').removed = true;

    const lecithinDiff = buildDiff(current, baseline).rows.find((row) => row.id === 'row-09');
    expect(lecithinDiff.removed).toBe(true);
    expect(lecithinDiff.removedChanged).toBe(true);
  });

  it("does not report a split row with only its Step 2 line out as removed, and takes that line out of the total and the figures", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-01').portions[0].removed = true;

    const diff = buildDiff(current, baseline);
    const milkDiff = diff.rows.find((row) => row.id === 'row-01');
    expect(milkDiff.removed).toBe(false);
    expect(diff.total.from).toBe('799.7 g');
    expect(diff.total.to).toBe('679.7 g');

    const lines = { ...current, rows: activeRows(current), method: activeSteps(current) };
    const expected = buildFigures(lines);
    expect(diff.figures.map((figure) => figure.to)).toEqual(expected.map((figure) => figure.value));
  });
});

describe('buildDiff — per-line descriptors (03.6, decision 51 brief item d)', () => {
  it("compares each line of a split row on its own: Whole milk's Step 2 amount 120 to 100", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-01').portions[0].grams = 100;

    const diff = buildDiff(current, baseline);
    const milk = diff.rows.find((row) => row.id === 'row-01');
    expect(milk.lines).toHaveLength(2);
    expect(milk.lines[0]).toMatchObject({
      index: 0,
      step: 2,
      gramsFrom: 120,
      gramsTo: 100,
      gramsChanged: true,
      shareFrom: '15.0%',
      shareTo: '12.8%',
      shareChanged: true,
      removed: false,
      removedChanged: false,
    });
    expect(milk.lines[1]).toMatchObject({
      index: 1,
      step: 3,
      gramsFrom: 250.4,
      gramsTo: 250.4,
      gramsChanged: false,
      shareFrom: '31.3%',
      shareTo: '32.1%',
      shareChanged: true,
      removed: false,
    });

    const sucrose = diff.rows.find((row) => row.id === 'row-05');
    expect(sucrose.lines[0]).toMatchObject({ shareFrom: '1.5%', shareTo: '1.5%', shareChanged: false });
    expect(sucrose.lines[1]).toMatchObject({ shareFrom: '8.0%', shareTo: '8.2%', shareChanged: true });
  });

  it("leaves the row-level fields as they were beside the lines", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-01').portions[0].grams = 100;

    const milk = buildDiff(current, baseline).rows.find((row) => row.id === 'row-01');
    expect(milk.gramsFrom).toBe(370.4);
    expect(milk.gramsTo).toBe(350.4);
    expect(milk.gramsChanged).toBe(true);
    expect(milk.stepsFrom).toEqual([2, 3]);
    expect(milk.stepsTo).toEqual([2, 3]);
    expect(milk.stepsChanged).toBe(false);
  });

  it("gives a one-line row one line whose figures equal its row's", () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-02').portions[0].grams = 260;

    const cream = buildDiff(current, baseline).rows.find((row) => row.id === 'row-02');
    expect(cream.lines).toHaveLength(1);
    expect(cream.lines[0].gramsFrom).toBe(cream.gramsFrom);
    expect(cream.lines[0].gramsTo).toBe(cream.gramsTo);
    expect(cream.lines[0].gramsChanged).toBe(cream.gramsChanged);
    expect(cream.lines[0].shareFrom).toBe(cream.shareFrom);
    expect(cream.lines[0].shareTo).toBe(cream.shareTo);
    expect(cream.lines[0].shareChanged).toBe(cream.shareChanged);
    expect(cream.lines[0].removed).toBe(cream.removed);
    expect(cream.lines[0].removedChanged).toBe(cream.removedChanged);
  });

  it('reports a line that is out as removed and changed, with the parent figures still in the from side', () => {
    const baseline = clone();
    const current = clone();
    findRow(current, 'row-01').portions[0].removed = true;

    const milk = buildDiff(current, baseline).rows.find((row) => row.id === 'row-01');
    expect(milk.lines[0]).toMatchObject({ removed: true, removedChanged: true, gramsFrom: 120, shareFrom: '15.0%' });
    expect(milk.lines[1]).toMatchObject({ removed: false, removedChanged: false, shareFrom: '31.3%', shareTo: '36.8%' });
  });

  it('gives a current line with no baseline line null from-values and changed true, and does not throw', () => {
    const baseline = clone();
    const current = clone();
    findRow(baseline, 'row-01').portions.pop();

    const diff = buildDiff(current, baseline);
    const milk = diff.rows.find((row) => row.id === 'row-01');
    expect(milk.lines[1]).toMatchObject({
      gramsFrom: null,
      gramsTo: 250.4,
      gramsChanged: true,
      shareFrom: null,
      shareChanged: true,
      removedChanged: true,
    });
    expect(milk.lines[0].gramsFrom).toBe(120);
  });

  it('gives every line of a row absent from the baseline the null-from shape', () => {
    const baseline = clone();
    const current = clone();
    baseline.rows = baseline.rows.filter((row) => row.id !== 'row-01');

    const milk = buildDiff(current, baseline).rows.find((row) => row.id === 'row-01');
    expect(milk.lines).toHaveLength(2);
    for (const line of milk.lines) {
      expect(line.gramsFrom).toBeNull();
      expect(line.shareFrom).toBeNull();
      expect(line.gramsChanged).toBe(true);
      expect(line.shareChanged).toBe(true);
      expect(line.removedChanged).toBe(true);
    }
  });
});

describe('buildDiff — a removed step takes its lines with it (03.6, decision 51 answer 2)', () => {
  it("reads the gums as removed rows and Whole milk's Step 2 line, but not its row, as removed", () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 2).removed = true;

    const diff = buildDiff(current, baseline);
    const gum = diff.rows.find((row) => row.id === 'row-10');
    expect(gum.removed).toBe(true);
    expect(gum.removedChanged).toBe(true);
    expect(gum.lines[0].removed).toBe(true);
    expect(gum.lines[0].removedChanged).toBe(true);
    for (const id of ['row-11', 'row-12']) {
      expect(diff.rows.find((row) => row.id === id).removed).toBe(true);
    }

    const milk = diff.rows.find((row) => row.id === 'row-01');
    expect(milk.removed).toBe(false);
    expect(milk.lines[0].removed).toBe(true);
    expect(milk.lines[0].removedChanged).toBe(true);
    expect(milk.lines[1].removed).toBe(false);
    expect(milk.lines[1].removedChanged).toBe(false);
    const sucrose = diff.rows.find((row) => row.id === 'row-05');
    expect(sucrose.removed).toBe(false);
    expect(sucrose.lines.map((line) => line.removed)).toEqual([true, false]);

    expect(diff.total.from).toBe('799.7 g');
    expect(diff.total.to).toBe('666.0 g');
  });

  it('reports removedChanged false on every row and line when the step is removed on both sides', () => {
    const baseline = clone();
    findStep(baseline, 2).removed = true;
    const current = clone();
    findStep(current, 2).removed = true;

    const diff = buildDiff(current, baseline);
    expect(diff.rows.find((row) => row.id === 'row-10').removed).toBe(true);
    for (const row of diff.rows) {
      expect(row.removedChanged).toBe(false);
      for (const line of row.lines) expect(line.removedChanged).toBe(false);
    }
  });

  it('reads a step flag that is not exactly true as nothing removed', () => {
    const baseline = clone();
    const current = clone();
    findStep(current, 2).removed = 'true';

    const diff = buildDiff(current, baseline);
    expect(diff.rows.some((row) => row.removed)).toBe(false);
    expect(diff.total.to).toBe('799.7 g');
  });

  it('reads each side through its own method: a step removed only in the baseline restores the lines', () => {
    const baseline = clone();
    findStep(baseline, 2).removed = true;
    const current = clone();

    const diff = buildDiff(current, baseline);
    const gum = diff.rows.find((row) => row.id === 'row-10');
    expect(gum.removed).toBe(false);
    expect(gum.removedChanged).toBe(true);
    expect(gum.lines[0].removedChanged).toBe(true);
  });
});
