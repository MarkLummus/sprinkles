// The strike must reach the step's prose only, never the "Skipped" label
// beside it (G-02-3): per CSS Text Decoration L3 a decoration on a block
// propagates to every in-flow inline descendant and cannot be switched off
// by them, so the label must sit OUTSIDE the decorated element, not merely
// carry no decoration of its own. Renders through renderToStaticMarkup
// (react-dom/server) in the existing node Vitest environment — Method
// renders no links, so no router context is needed.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Method } from './Method.jsx';
import { buildDiff } from '../domain/diff.js';
import { displayNumbers } from '../domain/stepNumbers.js';

const struckStep = { n: 1, leadIn: 'Steep', instruction: 'Warm the milk and steep the zest.' };
const unstruckStep = { n: 2, leadIn: 'Chill', instruction: 'Cool the base overnight.' };
const changedLineStep = { n: 3, leadIn: 'Churn', instruction: 'Churn until soft-set.' };

describe('Method — a struck step', () => {
  it('closes the struck element before the Skipped label opens — the label is outside what was struck', () => {
    const markup = renderToStaticMarkup(<Method steps={[struckStep]} stepChanges={{ 1: { struck: true, line: null } }} />);
    const struckIndex = markup.indexOf('method-step__prose--struck');
    const labelIndex = markup.indexOf('method-step__skipped-label');
    expect(struckIndex).toBeGreaterThan(-1);
    expect(labelIndex).toBeGreaterThan(-1);
    // This is the invariant the old string-presence gate could not make: a
    // decoration propagated from an ancestor cannot be cancelled by a
    // descendant, so the ONLY way for the label to read legible is for it to
    // be a sibling of the decorated element, not a descendant of it — proved
    // here by the decorated element's own closing </span> appearing before
    // the label's opening tag.
    const closingSpanIndex = markup.indexOf('</span>', struckIndex);
    expect(closingSpanIndex).toBeGreaterThan(-1);
    expect(closingSpanIndex).toBeLessThan(labelIndex);
    expect(markup).toContain('Skipped');
  });

  it('keeps the step\'s prose inside the decorated element — the strike is scoped, not removed', () => {
    const markup = renderToStaticMarkup(<Method steps={[struckStep]} stepChanges={{ 1: { struck: true, line: null } }} />);
    const struckIndex = markup.indexOf('method-step__prose--struck');
    const closingSpanIndex = markup.indexOf('</span>', struckIndex);
    const decorated = markup.slice(struckIndex, closingSpanIndex);
    expect(decorated).toContain('Steep');
    expect(decorated).toContain('Warm the milk and steep the zest.');
  });
});

describe('Method — an unstruck step', () => {
  it('renders neither the struck modifier class nor the Skipped label', () => {
    const markup = renderToStaticMarkup(<Method steps={[unstruckStep]} stepChanges={{}} />);
    expect(markup).not.toContain('method-step__prose--struck');
    expect(markup).not.toContain('method-step__skipped-label');
  });
});

describe('Method — a step carrying a changed line, in the reading state', () => {
  it('still renders the line (regression guard on the neighbouring branch)', () => {
    const markup = renderToStaticMarkup(
      <Method steps={[changedLineStep]} stepChanges={{ 3: { struck: false, line: 'Used vanilla instead' } }} mode="reading" />,
    );
    expect(markup).toContain('method-step__changed');
    expect(markup).toContain('Used vanilla instead');
  });
});

// Developing-mode fixtures (03-02): minimal version-shaped objects — a row
// needs only what computeBalance/buildFigures touch (grams, an ingredient
// with a composition block), since these tests assert markup, not figures.
function makeRow(id, name, grams, removed = false) {
  return { id, ingredientName: name, grams, removed, ingredient: { composition: {} } };
}

function makeBaselineVersion() {
  return {
    versionLabel: 'v1',
    headnote: 'Baseline headnote.',
    targets: {},
    rows: [makeRow('row-a', 'Row A', 10), makeRow('row-b', 'Row B', 20)],
    method: [
      {
        n: 1,
        leadIn: 'Lead one',
        instruction: 'Do one thing.',
        targets: [{ label: 'temp', value: '10 C' }],
        removed: false,
        uses: ['row-a'],
      },
    ],
  };
}

// A baseline whose one step already carries purpose and aside — needed to
// test each field's own struck-beneath line independently (03-09), since
// makeBaselineVersion's step has neither.
function makeBaselineVersionWithProse() {
  const version = makeBaselineVersion();
  version.method[0].purpose = 'Original purpose.';
  version.method[0].aside = 'Original aside.';
  return version;
}

describe('Method — developing mode', () => {
  it("renders the baseline's text struck beneath the field for a changed step", () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].instruction = 'Do a different thing.';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).toContain('prose-struck-beneath');
    expect(markup).toContain('Do one thing.');
    expect(markup).toContain('Do a different thing.');
  });

  it('renders the old chip struck before a changed target chip', () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].targets[0].value = '20 C';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).toContain('struck-value');
    expect(markup).toContain('temp 10 C');
    expect(markup).toContain('value="20 C"');
  });

  it('renders no struck-beneath paragraph at all for a step removed with none of its text touched, and renders the removed label (S1, T-03-52)', () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].removed = true;

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).not.toContain('prose-struck-beneath');
    expect(markup).toContain('method-step__skipped-label');
    expect(markup).toContain('removed');
    // The fields stay present and editable — removing does not take them away.
    expect(markup).toContain('value="Lead one"');
    expect(markup).toContain('Do one thing.');
  });

  it("renders one struck-beneath paragraph for a step whose lead-in alone changed", () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].leadIn = 'A rewritten lead-in';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup.split('prose-struck-beneath').length - 1).toBe(1);
    expect(markup).toContain('Lead one');
  });

  it("renders one struck-beneath paragraph for a step whose instruction alone changed", () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].instruction = 'Do a different thing.';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup.split('prose-struck-beneath').length - 1).toBe(1);
    expect(markup).toContain('Do one thing.');
  });

  it("strikes the parent's purpose beneath the purpose field for a purpose-only edit, and renders no lead-in/instruction struck-beneath paragraph (S1's second route)", () => {
    const baselineVersion = makeBaselineVersionWithProse();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].purpose = 'A rewritten purpose.';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup.split('prose-struck-beneath').length - 1).toBe(1);
    expect(markup).toContain('Original purpose.');
    // The lead-in/instruction pair did not change — its struck-beneath
    // paragraph must not render, and "Do one thing." (the instruction)
    // appears only in the live field, not struck a second time.
    expect(markup).not.toContain('<b>Lead one.</b>');
  });

  it('strikes the parent\'s aside beneath the aside field for an aside-only edit, and renders no lead-in/instruction struck-beneath paragraph', () => {
    const baselineVersion = makeBaselineVersionWithProse();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].aside = 'A rewritten aside.';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup.split('prose-struck-beneath').length - 1).toBe(1);
    expect(markup).toContain('Original aside.');
    expect(markup).not.toContain('<b>Lead one.</b>');
  });

  it('renders no struck purpose line for a purpose that was absent in the record and now carries text — there is nothing to strike', () => {
    const baselineVersion = makeBaselineVersion(); // step 1 has no purpose key
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].purpose = 'A brand new purpose.';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).not.toContain('prose-struck-beneath');
  });

  it('renders exactly one struck-beneath paragraph, not two, for a step both removed and text-changed, and still renders the removed label', () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].removed = true;
    draftVersion.method[0].leadIn = 'A rewritten lead-in';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup.split('prose-struck-beneath').length - 1).toBe(1);
    expect(markup).toContain('method-step__skipped-label');
    expect(markup).toContain('removed');
  });

  it("renders the removed-row cross-flag with its 'remove this step' control", () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.rows[0].removed = true; // row-a, used by step 1

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).toContain('method-step__flag');
    expect(markup).toContain('Row A');
    expect(markup).toContain('remove this step');
  });

  it('renders a coverage cue naming the covered rows and the covering step, and no cross-flag or remove-this-step control, for a removed step whose rows are all still used elsewhere (D-UAT-3)', () => {
    const baselineVersion = makeBaselineVersion();
    baselineVersion.method.push({
      n: 2,
      leadIn: 'Lead two',
      instruction: 'Do two things.',
      removed: false,
      uses: ['row-a'], // shares row-a with step 1
    });
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].removed = true; // step 1, uses row-a; step 2 still uses it

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(baselineVersion.method)}
      />,
    );

    expect(markup).toContain('method-step__flag');
    expect(markup).toContain('Row A');
    // Step 2 is the covering step's stored key, but once step 1 is removed
    // it is the only active step left — its displayed position is 1
    // (03-10), not its stored key.
    expect(markup).toContain('still used by step 1');
    expect(markup).not.toContain('remove this step');
  });

  it('renders no coverage cue for a removed step whose rows are covered by nothing — the table already carries that answer', () => {
    const baselineVersion = makeBaselineVersion(); // one step, row-a used only by step 1
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].removed = true;

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).not.toContain('method-step__flag');
  });

  it('renders exactly one control on a removed step, reading restore', () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].removed = true;

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    const buttonMatches = markup.match(/<button[^>]*>[^<]*<\/button>/g) ?? [];
    expect(buttonMatches).toHaveLength(1);
    expect(buttonMatches[0]).toContain('restore');
  });

  it("renders the removed-row cross-flag exactly as before on an active step that uses a removed row, unaffected by the coverage cue", () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.rows[0].removed = true; // row-a, used by active step 1

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).toContain('uses Row A, which is removed');
    expect(markup).toContain('remove this step');
  });

  it("renders the stale-amount flag's 'amounts changed:' clause only when visibility is on", () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.rows[0].grams = 12; // row-a, used by step 1, step 1's own text untouched

    const visible = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        staleFlagVisible
      />,
    );
    expect(visible).toContain('amounts changed:');
    expect(visible).toContain('Row A');

    const hidden = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        staleFlagVisible={false}
      />,
    );
    expect(hidden).not.toContain('amounts changed:');
  });

  it('renders read-only, in ink, driven by the precomputed changeDiff — the show-changes state', () => {
    const baselineVersion = makeBaselineVersion();
    const currentVersion = structuredClone(baselineVersion);
    currentVersion.method[0].instruction = 'Do a different thing.';
    currentVersion.method[0].removed = false;
    const changeDiff = buildDiff(currentVersion, baselineVersion);
    const staleSteps = [];

    const markup = renderToStaticMarkup(
      <Method
        steps={currentVersion.method}
        mode="reading"
        showingChanges
        changeDiff={changeDiff}
        staleSteps={staleSteps}
        staleFlagVisible
        rows={currentVersion.rows}
      />,
    );

    expect(markup).toContain('prose-struck-beneath');
    expect(markup).toContain('Do one thing.');
    expect(markup).toContain('Do a different thing.');
    expect(markup).not.toContain('ink-field');
    expect(markup).not.toContain('<input');
    expect(markup).not.toContain('<textarea');
  });

  it('renders a removed step\'s prose struck in place, carries the removed label, and renders no struck-beneath paragraph, in show-changes (S1, T-03-52)', () => {
    const baselineVersion = makeBaselineVersion();
    const currentVersion = structuredClone(baselineVersion);
    currentVersion.method[0].removed = true;
    const changeDiff = buildDiff(currentVersion, baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={currentVersion.method}
        mode="reading"
        showingChanges
        changeDiff={changeDiff}
        staleSteps={[]}
        rows={currentVersion.rows}
      />,
    );

    expect(markup).not.toContain('prose-struck-beneath');
    const struckIndex = markup.indexOf('method-step__prose--struck');
    const labelIndex = markup.indexOf('method-step__skipped-label');
    expect(struckIndex).toBeGreaterThan(-1);
    expect(labelIndex).toBeGreaterThan(-1);
    const closingSpanIndex = markup.indexOf('</span>', struckIndex);
    expect(closingSpanIndex).toBeGreaterThan(-1);
    expect(closingSpanIndex).toBeLessThan(labelIndex);
    expect(markup).toContain('removed');
  });

  it('renders one struck-beneath paragraph and does not strike its own prose in place for an instruction-only edit in show-changes — the two treatments never both apply', () => {
    const baselineVersion = makeBaselineVersion();
    const currentVersion = structuredClone(baselineVersion);
    currentVersion.method[0].instruction = 'Do a different thing.';
    const changeDiff = buildDiff(currentVersion, baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={currentVersion.method}
        mode="reading"
        showingChanges
        changeDiff={changeDiff}
        staleSteps={[]}
        rows={currentVersion.rows}
      />,
    );

    expect(markup).toContain('prose-struck-beneath');
    expect(markup).not.toContain('method-step__prose--struck');
  });

  it('strikes the parent\'s purpose beneath the purpose field for a purpose-only edit in show-changes, identically to the pen', () => {
    const baselineVersion = makeBaselineVersionWithProse();
    const currentVersion = structuredClone(baselineVersion);
    currentVersion.method[0].purpose = 'A rewritten purpose.';
    const changeDiff = buildDiff(currentVersion, baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={currentVersion.method}
        mode="reading"
        showingChanges
        changeDiff={changeDiff}
        staleSteps={[]}
        rows={currentVersion.rows}
      />,
    );

    expect(markup.split('prose-struck-beneath').length - 1).toBe(1);
    expect(markup).toContain('Original purpose.');
    expect(markup).not.toContain('method-step__prose--struck');
  });

  it('the clean reading renders no strike, no stale flag and no removed-step markup, even if a changeDiff happens to be supplied', () => {
    const baselineVersion = makeBaselineVersion();
    const currentVersion = structuredClone(baselineVersion);
    currentVersion.method[0].instruction = 'Do a different thing.';
    const changeDiff = buildDiff(currentVersion, baselineVersion);

    // showingChanges is false — the gate itself, not the presence of a
    // diff, is what decides the clean reading.
    const markup = renderToStaticMarkup(
      <Method
        steps={currentVersion.method}
        mode="reading"
        showingChanges={false}
        changeDiff={changeDiff}
        staleSteps={[{ n: 1, changes: [{ rowId: 'row-a', ingredientName: 'Row A', from: 10, to: 12 }] }]}
        staleFlagVisible
        rows={currentVersion.rows}
      />,
    );

    expect(markup).not.toContain('prose-struck-beneath');
    expect(markup).not.toContain('struck-value');
    expect(markup).not.toContain('method-step__stale-flag');
    expect(markup).not.toContain('method-step__skipped-label');
  });

  it('renders no stale-amount flag for a step whose own text was edited', () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.rows[0].grams = 12;
    draftVersion.method[0].instruction = 'A rewritten instruction.';

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        staleFlagVisible
      />,
    );
    expect(markup).not.toContain('amounts changed:');
  });
});

// The derived step position (03-10, G-03-6, D-UAT-4): a ten-step method,
// none removed unless a test marks one, so a stored key and its baseline
// position coincide except where a test deliberately shifts them.
function makeTenStepMethod() {
  const method = [];
  for (let n = 1; n <= 10; n += 1) {
    method.push({ n, leadIn: `Lead ${n}`, instruction: `Do thing ${n}.` });
  }
  return method;
}

// One entry per rendered <li>, in document order: the step's own stored
// key (from the anchor id, never renumbered), its margin number (null
// when the margin renders nothing), and whether it carries the removed
// label — read from the markup rather than re-deriving it, so these tests
// assert what actually rendered.
function extractStepEntries(markup) {
  const entries = [];
  const liRegex = /<li id="method-step-(\d+)" class="method-step">([\s\S]*?)<\/li>/g;
  let match;
  while ((match = liRegex.exec(markup))) {
    const stepKey = Number(match[1]);
    const body = match[2];
    const numberMatch = /method-step__n" aria-hidden="true">(\d*)</.exec(body);
    const marginNumber = numberMatch && numberMatch[1] !== '' ? Number(numberMatch[1]) : null;
    entries.push({ stepKey, marginNumber, removed: body.includes('method-step__skipped-label') });
  }
  return entries;
}

describe('Method — step display numbers (03-10, G-03-6, D-UAT-4)', () => {
  it('renders the margin numbers 1 through 9 with no gap in the reading state when the second step is removed', () => {
    const method = makeTenStepMethod();
    method[1].removed = true; // step 2
    const activeMethod = method.filter((step) => !step.removed);

    const markup = renderToStaticMarkup(
      <Method steps={activeMethod} mode="reading" rows={[]} currentStepNumbers={displayNumbers(method)} />,
    );

    const numbers = extractStepEntries(markup).map((entry) => entry.marginNumber);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('renders the margin numbers 1 through 8 with no gap in the reading state when the second and fifth steps are removed', () => {
    const method = makeTenStepMethod();
    method[1].removed = true; // step 2
    method[4].removed = true; // step 5
    const activeMethod = method.filter((step) => !step.removed);

    const markup = renderToStaticMarkup(
      <Method steps={activeMethod} mode="reading" rows={[]} currentStepNumbers={displayNumbers(method)} />,
    );

    const numbers = extractStepEntries(markup).map((entry) => entry.marginNumber);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("prints the pen's live steps 1 through 9 with no gap, and the removed step's pre-removal number beside its removed label, when the second step is removed", () => {
    const baselineVersion = { rows: [], method: makeTenStepMethod() };
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[1].removed = true; // step 2

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(baselineVersion.method)}
      />,
    );

    const entries = extractStepEntries(markup);
    const liveNumbers = entries.filter((entry) => !entry.removed).map((entry) => entry.marginNumber);
    expect(liveNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const removedEntry = entries.find((entry) => entry.removed);
    expect(removedEntry.stepKey).toBe(2);
    expect(removedEntry.marginNumber).toBe(2); // the number it had before removal
  });

  it('prints no margin number for a step already removed in the record the pen opened on and still removed in the draft', () => {
    const baselineVersion = { rows: [], method: makeTenStepMethod() };
    baselineVersion.method[1].removed = true; // already removed at baseline
    const draftVersion = structuredClone(baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(baselineVersion.method)}
      />,
    );

    const entries = extractStepEntries(markup);
    const removedEntry = entries.find((entry) => entry.stepKey === 2);
    expect(removedEntry.removed).toBe(true);
    expect(removedEntry.marginNumber).toBeNull();
  });

  it("names a live step's field by the same number the margin prints, not the stored key, once a removal has shifted its position", () => {
    const baselineVersion = { rows: [], method: makeTenStepMethod() };
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[1].removed = true; // step 2 removed; step 3 is now position 2

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(baselineVersion.method)}
      />,
    );

    // Step 3 (the survivor now sitting at position 2) names its lead-in
    // field "Step 2" — the position, not its own stored key — and its own
    // value proves which field this is, since another step legitimately
    // reads "Step 3" at its own (different) position.
    expect(markup).toContain('aria-label="Step 2, lead-in" value="Lead 3"');
    expect(markup).not.toContain('aria-label="Step 3, lead-in" value="Lead 3"');
  });

  it('does not claim a live position on a removed step\'s field labels', () => {
    const baselineVersion = { rows: [], method: makeTenStepMethod() };
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[1].removed = true; // step 2

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(baselineVersion.method)}
      />,
    );

    // Step 2's own value ("Lead 2") proves which field this is — it names
    // itself as removed, never as claiming the position ("Step 2") a
    // survivor might legitimately hold.
    expect(markup).toContain('aria-label="Removed step, lead-in" value="Lead 2"');
    expect(markup).not.toContain('aria-label="Step 2, lead-in" value="Lead 2"');
  });

  it('names the coverage cue\'s covering step by its displayed position, not its stored key', () => {
    const baselineVersion = {
      rows: [makeRow('row-a', 'Row A', 10)],
      method: [
        { n: 1, leadIn: 'Lead one', instruction: 'Do one.', uses: ['row-a'] },
        { n: 2, leadIn: 'Lead two', instruction: 'Do two.', uses: [] },
        { n: 3, leadIn: 'Lead three', instruction: 'Do three.', uses: ['row-a'] },
      ],
    };
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].removed = true; // step 1 removed; step 3 (now position 2) still covers row-a

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(baselineVersion.method)}
      />,
    );

    expect(markup).toContain('still used by step 2');
    expect(markup).not.toContain('still used by step 3');
  });

  it('in show-changes, prints the live steps 1 through 9 and the struck step at the number it had in the parent (D-UAT-4)', () => {
    const parentVersion = { rows: [], method: makeTenStepMethod() };
    const currentVersion = structuredClone(parentVersion);
    currentVersion.method[1].removed = true; // step 2, removed in this child

    const changeDiff = buildDiff(currentVersion, parentVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={currentVersion.method}
        mode="reading"
        showingChanges
        changeDiff={changeDiff}
        staleSteps={[]}
        rows={currentVersion.rows}
        currentStepNumbers={displayNumbers(currentVersion.method)}
        baselineStepNumbers={displayNumbers(parentVersion.method)}
      />,
    );

    const entries = extractStepEntries(markup);
    const liveNumbers = entries.filter((entry) => !entry.removed).map((entry) => entry.marginNumber);
    expect(liveNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const struckEntry = entries.find((entry) => entry.removed);
    expect(struckEntry.stepKey).toBe(2);
    expect(struckEntry.marginNumber).toBe(2);
  });

  it('in show-changes, prints no number for a step with no position in either version — the parent had already removed it too', () => {
    const parentVersion = { rows: [], method: makeTenStepMethod() };
    parentVersion.method[1].removed = true; // already removed in the parent
    const currentVersion = structuredClone(parentVersion); // the grandchild inherits the removal

    const changeDiff = buildDiff(currentVersion, parentVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={currentVersion.method}
        mode="reading"
        showingChanges
        changeDiff={changeDiff}
        staleSteps={[]}
        rows={currentVersion.rows}
        currentStepNumbers={displayNumbers(currentVersion.method)}
        baselineStepNumbers={displayNumbers(parentVersion.method)}
      />,
    );

    const entries = extractStepEntries(markup);
    const removedEntry = entries.find((entry) => entry.stepKey === 2);
    expect(removedEntry.removed).toBe(true);
    expect(removedEntry.marginNumber).toBeNull();
  });

  it('leaves the anchor id on the stored key regardless of position', () => {
    const method = makeTenStepMethod();
    method[1].removed = true;
    const activeMethod = method.filter((step) => !step.removed);

    const markup = renderToStaticMarkup(
      <Method steps={activeMethod} mode="reading" rows={[]} currentStepNumbers={displayNumbers(method)} />,
    );

    // The survivor that now sits at position 2 (stored key 3) still anchors
    // on its own key, never on the position the margin prints beside it.
    expect(markup).toContain('id="method-step-3"');
    expect(markup).not.toContain('id="method-step-2"');
  });
});
