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

// The batch pen's per-step line, on demand (D-25): the Skipped checkbox is
// always present; the "done differently" line sits behind its own opener,
// following the same collapse-on-blur shape task 2 wrote for purpose and
// aside. Amend's own baseline (a stepChanges entry that already holds a
// line) is what opens the field with no click at all.
describe('Method — the batch pen\'s per-step line, on demand (D-25)', () => {
  it('renders the opener and no line field when the step\'s entry holds no line', () => {
    const markup = renderToStaticMarkup(
      <Method steps={[unstruckStep]} stepChanges={{}} mode="recording" onChangeStepChange={() => {}} />,
    );
    expect(markup).toMatch(/<button[^>]*>done differently<\/button>/);
    expect(markup).not.toMatch(/<input[^>]*aria-label="Step [^"]*, done differently"/);
  });

  it('renders the line field, not the opener, when the step\'s entry already holds a line (what Amend opens)', () => {
    const markup = renderToStaticMarkup(
      <Method
        steps={[unstruckStep]}
        stepChanges={{ 2: { struck: false, line: 'Used vanilla instead' } }}
        mode="recording"
        onChangeStepChange={() => {}}
      />,
    );
    expect(markup).toMatch(/<input[^>]*aria-label="Step [^"]*, done differently"[^>]*value="Used vanilla instead"/);
    expect(markup).toContain('<span>Done differently</span>');
    expect(markup).not.toMatch(/<button[^>]*>done differently<\/button>/);
  });

  it("names the Skipped checkbox's accessible name by the step's own number", () => {
    const markup = renderToStaticMarkup(
      <Method steps={[unstruckStep]} stepChanges={{}} mode="recording" onChangeStepChange={() => {}} />,
    );
    expect(markup).toMatch(/<input type="checkbox"[^>]*aria-label="Step [^"]*, skipped"/);
  });

  it('renders no visible "What did you do differently?" wording (D-11)', () => {
    const markup = renderToStaticMarkup(
      <Method steps={[unstruckStep]} stepChanges={{}} mode="recording" onChangeStepChange={() => {}} />,
    );
    expect(markup).not.toContain('What did you do differently?');
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

describe('Method — the lead-in and instruction fields read as printed prose (03.1-04, D-13 § 8)', () => {
  it('renders no visible "Lead-in"/"Instruction" label word, and carries the prose-field treatment instead of ink-field', () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).not.toContain('<span>Lead-in</span>');
    expect(markup).not.toContain('<span>Instruction</span>');
    expect(markup).toMatch(/<input[^>]*class="prose-field prose-field--lead-in"[^>]*aria-label="Step [^"]*, lead-in"/);
    expect(markup).toMatch(/<textarea[^>]*class="prose-field"[^>]*aria-label="Step [^"]*, instruction"/);
  });
});

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

  // Was "renders exactly one control on a removed step" before 03.1-04:
  // the step body now also carries the on-demand openers (add purpose,
  // add aside) and the uses line's own control, closed by default — the
  // remove/restore control is still the step's own last button, reading
  // restore, but it is no longer the step's only one (D-23, D-24).
  it('renders remove/restore as restore on a removed step, alongside the on-demand openers', () => {
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
    expect(buttonMatches[buttonMatches.length - 1]).toContain('restore');
    expect(markup).not.toContain('>remove</button>');
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

describe('Method — purpose and aside on demand (D-23)', () => {
  it('renders no purpose or aside field and renders both openers when the draft carries neither', () => {
    const baselineVersion = makeBaselineVersion(); // no purpose/aside
    const draftVersion = structuredClone(baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).toMatch(/<button[^>]*>add purpose<\/button>/);
    expect(markup).toMatch(/<button[^>]*>add aside<\/button>/);
    expect(markup).not.toMatch(/aria-label="Step [^"]*, purpose"/);
    expect(markup).not.toMatch(/aria-label="Step [^"]*, aside"/);
  });

  it('renders the purpose and aside fields, and no opener, when the draft already carries text', () => {
    const baselineVersion = makeBaselineVersionWithProse();
    const draftVersion = structuredClone(baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).toMatch(/<textarea[^>]*aria-label="Step [^"]*, purpose"/);
    expect(markup).toMatch(/<textarea[^>]*aria-label="Step [^"]*, aside"/);
    expect(markup).not.toMatch(/<button[^>]*>add purpose<\/button>/);
    expect(markup).not.toMatch(/<button[^>]*>add aside<\/button>/);
  });
});

describe('Method — the uses line, closed by default (D-24)', () => {
  it('renders the row names as text and no checkbox, with no fieldset for uses in the default pen markup', () => {
    const baselineVersion = makeBaselineVersion(); // step 1 uses row-a
    const draftVersion = structuredClone(baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).toContain('uses Row A');
    expect(markup).toMatch(/<button[^>]*>change<\/button>/);
    expect(markup).not.toContain('<fieldset');
    expect(markup).not.toContain('type="checkbox"');
  });

  it('reads "uses nothing yet" for a step with an empty uses list', () => {
    const baselineVersion = makeBaselineVersion();
    baselineVersion.method[0].uses = [];
    const draftVersion = structuredClone(baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
      />,
    );

    expect(markup).toContain('uses nothing yet');
  });
});

// The uses fieldset itself only renders once the maker presses "change"
// (D-24) — a state transition renderToStaticMarkup cannot execute
// (RESEARCH.md Pitfall 4), so its own "Step 3, uses" accessible name is a
// UAT item (listed in this plan's SUMMARY), not asserted here as if
// covered. What this test infrastructure CAN prove: the closed line's own
// "change" control and the "add purpose"/"add aside" openers already
// carry the step in their accessible names in the default (unopened) pen
// markup.
describe('Method — accessible names carry the step (D-28)', () => {
  it('names the on-demand controls by the step\'s own position in the default pen markup', () => {
    const baselineVersion = makeBaselineVersion();
    const draftVersion = structuredClone(baselineVersion);

    const markup = renderToStaticMarkup(
      <Method
        steps={baselineVersion.method}
        mode="developing"
        draftVersion={draftVersion}
        baselineVersion={baselineVersion}
        rows={baselineVersion.rows}
        currentStepNumbers={displayNumbers(draftVersion.method)}
      />,
    );

    expect(markup).toContain('aria-label="Step 1, add purpose"');
    expect(markup).toContain('aria-label="Step 1, change"');
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
// when the margin renders nothing), whether that number carries the
// struck modifier, and whether it carries the removed label — read from
// the markup rather than re-deriving it, so these tests assert what
// actually rendered. The class-capturing regex (G-03-14) reads the WHOLE
// class attribute rather than assuming it ends at the base class — a
// modifier appended after `method-step__n` (the struck form) made every
// margin read as absent under the old anchored pattern.
function extractStepEntries(markup) {
  const entries = [];
  const liRegex = /<li id="method-step-(\d+)" class="method-step">([\s\S]*?)<\/li>/g;
  let match;
  while ((match = liRegex.exec(markup))) {
    const stepKey = Number(match[1]);
    const body = match[2];
    const numberMatch = /<span class="([^"]*method-step__n[^"]*)" aria-hidden="true">(\d*)</.exec(body);
    const marginNumber = numberMatch && numberMatch[2] !== '' ? Number(numberMatch[2]) : null;
    const marked = Boolean(numberMatch) && numberMatch[1].includes('method-step__n--struck');
    entries.push({ stepKey, marginNumber, marked, removed: body.includes('method-step__skipped-label') });
  }
  return entries;
}

// The union assertion (G-03-14, D-UAT-5): a render's every margin, live
// and removed together, as a pair of (numeral, mark). Two entries with an
// identical pair are byte-identical spans on the page — the collision
// this plan closes. A null numeral (nothing printed) is never a
// collision with anything, including another null.
function assertNoDuplicateMargins(entries) {
  const seen = new Set();
  for (const entry of entries) {
    if (entry.marginNumber == null) continue;
    const key = `${entry.marginNumber}:${entry.marked}`;
    expect(seen.has(key)).toBe(false);
    seen.add(key);
  }
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

  it("prints the pen's live steps 1 through 9 with no gap, and NO margin numeral at all for the step removed this session, when the second step is removed (D-UAT-5, G-03-14)", () => {
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
    // The pen suppresses a removed step's number rather than marking it
    // (D-UAT-5) — no numeral at all, not the pre-removal number unmarked,
    // which is the byte-identical-to-a-live-step collision this closes.
    expect(removedEntry.marginNumber).toBeNull();
    expect(removedEntry.marked).toBe(false);
    // The union of every margin the pen renders, live and removed
    // together, holds no duplicate pair of numeral and mark.
    assertNoDuplicateMargins(entries);
  });

  it('prints no margin number for a step already removed in the record the pen opened on and still removed in the draft — the same empty margin the removed-this-session case now renders (D-UAT-5, G-03-14)', () => {
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
    expect(removedEntry.marked).toBe(false);
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

  it("names the number a removed step's field labels held before removal, closing the ink-versus-announcement disagreement 03-10 closed for live steps and left open for removed ones (G-03-14)", () => {
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
    // itself as removed AND by the number it had (2), never as claiming a
    // live position ("Step 2") a survivor might legitimately hold.
    expect(markup).toContain('aria-label="Removed step 2, lead-in" value="Lead 2"');
    expect(markup).not.toContain('aria-label="Removed step, lead-in" value="Lead 2"');
    expect(markup).not.toContain('aria-label="Step 2, lead-in" value="Lead 2"');
  });

  it('invents no number on a removed step\'s field labels when it has no position in either version', () => {
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

    // Neither map holds a position for this step, so its labels say only
    // that it is removed — nothing invented.
    expect(markup).toContain('aria-label="Removed step, lead-in" value="Lead 2"');
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
    // The cue's correctness is only useful if its referent is unique
    // (G-03-14): the numeral it names must appear exactly once, unmarked,
    // on the page.
    const entries = extractStepEntries(markup);
    const unmarkedTwos = entries.filter((entry) => entry.marginNumber === 2 && !entry.marked);
    expect(unmarkedTwos.length).toBe(1);
    assertNoDuplicateMargins(entries);
  });

  it('in show-changes, prints the live steps 1 through 9 unmarked and the struck step at the number it had in the parent carrying the struck modifier (D-UAT-4, D-UAT-5, G-03-14)', () => {
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
    const liveEntries = entries.filter((entry) => !entry.removed);
    expect(liveEntries.map((entry) => entry.marginNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(liveEntries.every((entry) => !entry.marked)).toBe(true);
    const struckEntry = entries.find((entry) => entry.removed);
    expect(struckEntry.stepKey).toBe(2);
    expect(struckEntry.marginNumber).toBe(2);
    expect(struckEntry.marked).toBe(true);
    // The mark on the number is added to the step's own struck prose and
    // its removed label, never instead of them (03-09).
    expect(markup).toContain('method-step__prose--struck');
    expect(markup).toContain('method-step__skipped-label');
    // The union of every margin show-changes renders, live and removed
    // together, holds no duplicate pair of numeral and mark.
    assertNoDuplicateMargins(entries);
  });

  it('in show-changes, prints no number and no mark for a step with no position in either version — the parent had already removed it too', () => {
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
    expect(removedEntry.marked).toBe(false);
  });

  it('holds no duplicate margin pair in the pen for a non-adjacent double removal (steps 1 and 5), the case the diagnosis showed as genuinely unresolvable', () => {
    const baselineVersion = { rows: [], method: makeTenStepMethod() };
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[0].removed = true; // step 1
    draftVersion.method[4].removed = true; // step 5

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
    const removedEntries = entries.filter((entry) => entry.removed);
    expect(removedEntries.map((entry) => entry.stepKey)).toEqual([1, 5]);
    expect(removedEntries.every((entry) => entry.marginNumber === null)).toBe(true);
    assertNoDuplicateMargins(entries);
  });

  it('holds no duplicate margin pair in the pen when the removed step is the last one, the one case that never collided', () => {
    const baselineVersion = { rows: [], method: makeTenStepMethod() };
    const draftVersion = structuredClone(baselineVersion);
    draftVersion.method[9].removed = true; // step 10, the last one

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
    const removedEntry = entries.find((entry) => entry.removed);
    expect(removedEntry.stepKey).toBe(10);
    expect(removedEntry.marginNumber).toBeNull();
    assertNoDuplicateMargins(entries);
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
