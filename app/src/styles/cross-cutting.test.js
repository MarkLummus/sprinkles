// The cross-cutting type, spacing, and feedback contract
// (.claude/skills/sketch-findings-sprinkles/references/
// cross-cutting-type-spacing-feedback.md, applied by quick task
// 260912-ti1) — read through the same css-source.js module binder.test.js
// and columns.test.js read, so the three suites can never disagree about
// what a rule says.
//
// This suite has no layout engine — it runs under Vitest's default `node`
// environment, and nothing here executes a browser's cascade. Every
// assertion below reads app.css and tokens.css AS TEXT and checks the
// contract they state; it proves the tokens and rules are internally
// consistent, never that a pixel rendered. In particular it cannot prove
// the finding's own acceptance bar — zero horizontal overflow at 393px,
// 44px-class targets below 760px, 6px caption-to-content gaps measured in
// the DOM — that stays a real-browser measurement (plan task 3, recorded
// for end-of-phase UAT per human_verify_mode: end-of-phase). Rem-valued
// tokens are asserted by their value string, never resolveTokenPx, which
// parses px literals only.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import {
  readCustomProperties,
  resolveTokenPx,
  readAllRules,
  assertNoAtRules,
  stripCssComments,
} from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.join(STYLES_DIR, 'tokens.css');
const APP_CSS_PATH = path.join(STYLES_DIR, 'app.css');
const MAIN_JSX_PATH = path.join(STYLES_DIR, '..', 'main.jsx');
const RECIPE_LIST_JSX_PATH = path.join(STYLES_DIR, '..', 'ui', 'RecipeList.jsx');

const tokensSource = readFileSync(TOKENS_PATH, 'utf8');
const appCssSource = readFileSync(APP_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');
const recipeListJsxSource = readFileSync(RECIPE_LIST_JSX_PATH, 'utf8');

const tokens = readCustomProperties(tokensSource);
const rules = readAllRules(appCssSource);

// The shorthand alone is the danger: (?:^|[\s;]) plus the literal colon
// match `margin:` or `padding:` only, never `margin-block`, `margin-inline`
// or any `-start`/`-end` longhand. Only the four-value form is reported —
// three values or fewer set left and right to the same value and are
// therefore already direction-symmetric. This exists because the fourth
// value of the shorthand IS the physical left edge, so a regex looking for
// the physical longhand reads a direction-locked rule as clean.
function fourValueShorthands(declarations) {
  return [...declarations.matchAll(/(?:^|[\s;])(margin|padding):\s*([^;]+);/g)]
    .filter((m) => m[2].trim().split(/\s+/).length === 4)
    .map((m) => `${m[1]}: ${m[2].trim()}`);
}

function ruleFor(selector) {
  return rules.find((r) => r.selector === selector && r.media === undefined);
}

function mediaRuleFor(selector) {
  return rules.find((r) => r.media !== undefined && r.selector === selector);
}

describe('touch targets under a coarse pointer — 44px, stops 44x44 (sketch findings; 03.3.1-06 Task 2; 03.3.1.1 tenth round; 03.5-13 retires the width arm)', () => {
  test('the touch tokens resolve through resolveTokenPx to 44 and 44, and the stop-height alias rides --touch-min', () => {
    expect(resolveTokenPx(tokens, '--touch-min')).toBe(44);
    expect(resolveTokenPx(tokens, '--touch-stop-width')).toBe(44);
    expect(resolveTokenPx(tokens, '--sheet-touch-stop-height')).toBe(44);
  });

  test("inside the media block, `button, select, .ink-field, .prose-field, .segmented__option, .batch-margin .chip-toggle` declares min-height reading --touch-min (the defect rides the same 44px target as the segment option, sketch 007 line 179; .prose-field joined in 260916-vv1, critique issue 4, the four record prose fields at 560 x 19 on a coarse pointer)", () => {
    const rule = mediaRuleFor('button, select, .ink-field, .prose-field, .segmented__option, .batch-margin .chip-toggle');
    expect(rule, 'expected the media-block control rule').toBeTruthy();
    expect(rule.media).toBe('(pointer: coarse)');
    expect(rule.declarations).toMatch(/min-height:\s*var\(--touch-min\)/);
    expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
  });

  test('inside the media block, the axis-mark stop box declares the joined 44x44 cell, with a flex-basis so the joined row grows too (03.3.1-06 Task 1 moved the box from the input to the label; 03.3.1.1 tenth round)', () => {
    // Resolved on media, not by mediaRuleFor's first match: since 260915-x6n
    // the touch union carries an .axis-mark__stop rule too (decision C's
    // height-only growth), and it comes first in source order.
    const rule = rules.find((r) => r.selector === '.axis-mark__stop' && r.media === '(max-width: 723.98px)');
    expect(rule, 'expected the width-only axis-mark__stop rule').toBeTruthy();
    expect(rule.declarations).toMatch(/width:\s*var\(--touch-stop-width\)/);
    expect(rule.declarations).toMatch(/height:\s*var\(--sheet-touch-stop-height\)/);
    expect(rule.declarations).toMatch(/flex-basis:\s*var\(--touch-stop-width\)/);
    expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
  });

  test('inside the media block, the stops and anchors tracks both widen to the 216px --sheet-track-stop-narrow', () => {
    const rule = mediaRuleFor('.axis-mark__stops, .axis-mark__anchors');
    expect(rule, 'expected the media-block track-width rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 723.98px)');
    expect(rule.declarations).toMatch(/width:\s*var\(--sheet-track-stop-narrow\)/);
  });

  test('the touch union carries the seven sizing rules, and the width-only block keeps the axis-mark track geometry (Mark, 2026-09-15: touch is a mode, track geometry is a width decision; .recipe-band__row-version moved to notebook.css, 03.5-04 Task 1)', () => {
    const touchRules = rules.filter((r) => r.media === '(pointer: coarse)');
    expect(touchRules.map((r) => r.selector)).toEqual([
      // .prose-field joined this rule in 260916-vv1 — it takes the shared
      // floor rather than a private rule.
      'button, select, .ink-field, .prose-field, .segmented__option, .batch-margin .chip-toggle',
      '.text-control',
      // Sketch 008 line 260 grows the checkbox LABEL, not the square — the
      // two flex labels holding the Skipped and Uses checkboxes.
      '.method-step__uses-item, .method-step__strike-control',
      // The NARROW drawing (007 line 180, 008 line 167): Clear is 44px here,
      // so the caption line reserves 44px marked or not. Sketch 009 replaces
      // this at a wide touch viewport, in its own block — it cannot live here,
      // because the union matches every coarse pointer, phones included.
      '.axis-mark__head, .segmented-field__head',
      // Clear's word at the bottom of its 44px box (sketch 011 decision 40 finding 1; quick 261004-ox4).
      '.axis-mark__head .text-control, .segmented-field__head .text-control',
      // Sketch 008 line 166, approved 2026-09-15.
      '.ink-field, .prose-field',
      // Decision C: HEIGHT only. The width and the track stay width-keyed below.
      '.axis-mark__stop',
    ]);
    // Track GEOMETRY stays width-only: wide touch keeps the desktop
    // composition, while a narrow viewport reduces the stop's own width.
    // The narrow ingredient-table list moved out of this block entirely
    // (decision 15, sketch 011, 03.5-11 Task 1) — it now lives in the
    // phone-forms (max-width: 723.98px) block below, sharing that cut with
    // the band and the page margin (sketch 011 decision 16), so this block
    // keeps only the two axis-mark rules it was drawn for.
    // Since sketch 011 decision 28 this block shares the phone forms'
    // condition, so it is told apart by selector.
    const widthOnly = rules.filter((r) => r.media === '(max-width: 723.98px)' && r.selector.startsWith('.axis-mark'));
    expect(widthOnly.map((r) => r.selector)).toEqual([
      '.axis-mark__stops, .axis-mark__anchors',
      '.axis-mark__stop',
    ]);
  });

  test("Clear's word sits at the bottom of its 44px box, level with the axis name, at a coarse pointer (sketch 011 decision 40 finding 1; quick 261004-ox4)", () => {
    const rule = rules.find((r) => r.selector === '.axis-mark__head .text-control, .segmented-field__head .text-control' && r.media === '(pointer: coarse)');
    expect(rule, 'expected the touch-union Clear rule').toBeTruthy();
    expect(rule.declarations).toMatch(/display:\s*inline-flex/);
    expect(rule.declarations).toMatch(/align-items:\s*flex-end/);
    // The 44px target and the head's 44px reserve stand: no size, spacing or height here.
    expect(rule.declarations).not.toMatch(/(?:^|[\s;])(?:min-height|height|padding|margin)/);
  });

  test("decision C: the touch union grows the stop's HEIGHT only — the width and the track stay width-keyed (sketch 009, Mark 2026-09-15)", () => {
    // The whole point of C. A 44px stop WIDTH makes a 216px track, and at a
    // wide touch viewport the axes grid gives each axis 213.3px — so the track
    // overflowed into its neighbour (measured on Mark's iPad, 1366 coarse).
    // Growing only the height gives a 38x44 target on the unchanged 186px
    // track. If a width or flex-basis ever appears here, that regression is
    // back.
    const rule = rules.find((r) => r.selector === '.axis-mark__stop' && r.media === '(pointer: coarse)');
    expect(rule, 'expected the touch-union axis-mark__stop rule').toBeTruthy();
    expect(rule.declarations).toMatch(/height:\s*var\(--sheet-touch-stop-height\)/);
    expect(rule.declarations).not.toMatch(/(^|[^-])width:/);
    expect(rule.declarations).not.toMatch(/flex-basis/);
  });

  test('M4: Clear in a caption line takes its touch target as an overflowing hit area, not as line height (sketch 009, Mark 2026-09-15)', () => {
    const box = rules.find((r) => r.selector === '.axis-mark__head .text-control, .segmented-field__head .text-control' && r.media === '(min-width: 724px) and (pointer: coarse)');
    expect(box, 'expected the caption-line text-control rule').toBeTruthy();
    // It must UNDO the blanket .text-control min-height above it, or the line
    // grows and the melt row goes 15.2px out again.
    expect(box.declarations).toMatch(/min-height:\s*0/);
    expect(box.declarations).toMatch(/position:\s*relative/);

    const hit = rules.find((r) => r.selector === '.axis-mark__head .text-control::after, .segmented-field__head .text-control::after' && r.media === '(min-width: 724px) and (pointer: coarse)');
    expect(hit, 'expected the hit-area pseudo-element rule').toBeTruthy();
    expect(hit.declarations).toMatch(/position:\s*absolute/);
    expect(hit.declarations).toMatch(/height:\s*var\(--touch-min\)/);
  });

  test('M4 is scoped to the WIDE touch viewport; the narrow drawing keeps its 44px caption line (sketches 007/008 vs 009)', () => {
    // The re-measure caught this: applying M4 across the whole touch union
    // overwrote 007/008's narrow drawing at 680, 580, 480 and 393, where the
    // head read 28.8px against the sketch's 44px. Each drawing governs the
    // case it was drawn for, and this test fails if they are merged again.
    const wide = rules.find((r) => r.selector === '.axis-mark__head, .segmented-field__head' && r.media === '(min-width: 724px) and (pointer: coarse)');
    expect(wide, 'expected the wide-touch caption-line rule').toBeTruthy();
    expect(wide.declarations).toMatch(/min-height:\s*var\(--sheet-caption-two-lines-abs\)/);

    const narrow = rules.find((r) => r.selector === '.axis-mark__head, .segmented-field__head' && r.media === '(pointer: coarse)');
    expect(narrow, 'expected the narrow caption-line rule').toBeTruthy();
    expect(narrow.declarations).toMatch(/min-height:\s*var\(--sheet-caption-line-h-touch\)/);
  });

  test("sketch 008's touch font bump survives the phone-forms step (260915-x6n)", () => {
    const bump = rules.find((r) => r.selector === '.ink-field, .prose-field' && r.media === '(pointer: coarse)');
    expect(bump, 'expected the touch-union font rule').toBeTruthy();
    expect(bump.declarations).toMatch(/font-size:\s*var\(--sheet-type-note\)/);

    // The phone-forms step used to pull .ink-field back down to
    // --sheet-type-control, which is the pre-declared 13px departure 008
    // line 166 retires — and below 724 is exactly where a phone's
    // auto-zoom bites. The step now names only the margin's own prose
    // field.
    const step = rules.find((r) => r.media === '(max-width: 723.98px)' && /font-size/.test(r.declarations) && r.selector.includes('batch-margin__field'));
    expect(step, 'expected the phone-forms font-size rule').toBeTruthy();
    expect(step.selector).not.toMatch(/\.ink-field/);
  });

  test('the touch union gives .text-control its own min-height (sketch 003 line 178, 007 line 180; settled 2026-09-14)', () => {
    // Superseded: .text-control controls are <button>s, inline-block, and
    // do take a minimum height — 24px at desktop (the bare rule), 44px
    // here, matching every other control in the block.
    const rule = mediaRuleFor('.text-control');
    expect(rule, 'expected a media-scoped .text-control rule').toBeTruthy();
    expect(rule.media).toBe('(pointer: coarse)');
    expect(rule.declarations).toMatch(/min-height:\s*var\(--touch-min\)/);
  });

  test('.text-toggle sits before the touch union in source order, so .text-control wins min-height at a coarse pointer (one fill for every on state, 2026-09-16)', () => {
    // readAllRules returns rules in source order (css-source.js walks the
    // file linearly). .text-toggle must come after .text-control's own
    // rules (desktop 32px over 24px) and before the touch union (so
    // .text-control's later 44px min-height wins there) — reordering these
    // two rules would silently change the touch target.
    const toggleIndex = rules.findIndex((r) => r.selector === '.text-toggle' && r.media === undefined);
    const touchTextControlIndex = rules.findIndex(
      (r) => r.selector === '.text-control' && r.media === '(pointer: coarse)',
    );
    expect(toggleIndex).toBeGreaterThanOrEqual(0);
    expect(touchTextControlIndex).toBeGreaterThanOrEqual(0);
    expect(toggleIndex).toBeLessThan(touchTextControlIndex);

    // No .text-toggle rule exists inside any media block — the 44px can
    // only come from .text-control winning by source order.
    const mediaScopedToggle = rules.filter((r) => r.selector === '.text-toggle' && r.media !== undefined);
    expect(mediaScopedToggle).toHaveLength(0);
  });
});

describe('the 723.98px block — the phone forms (sketch 011 decision 16)', () => {
  test('the page gutter steps down through the shared property, not a per-element .recipe-page override (260917-gjo)', () => {
    // mediaRuleFor is first-match by selector across all media blocks
    // (PATTERNS.md caveat); resolving by r.media directly is this file's
    // own precedent, kept here even though .recipe-page no longer has a
    // rule of its own in this block to disambiguate from the 983.98px
    // one (03.3.1.1-01 Task 1).
    const rootStep = rules.find((r) => r.selector === ':root' && r.media === '(max-width: 723.98px)');
    expect(rootStep, 'expected a media-scoped :root step-down rule').toBeTruthy();
    expect(rootStep.declarations).toMatch(/--gap-page:\s*var\(--gap-m\)/);

    // The rule this replaced is gone: the step now arrives through
    // --gap-page alone, so restating it per-element here would be the
    // exact double-declaration this task exists to remove.
    const recipePage600 = rules.find((r) => r.selector === '.recipe-page' && r.media === '(max-width: 723.98px)');
    expect(recipePage600, '.recipe-page should have no rule left in the phone-forms block').toBeUndefined();
  });

  test("the margin's prose field drops to the control role in the phone-forms block — and .ink-field no longer goes with it (260915-x6n)", () => {
    // .ink-field used to ride this rule. Sketch 008 line 166 retires that 13px
    // as a pre-declared departure, and below 724 is exactly where a phone's
    // auto-zoom bites, so the touch union's 16px must survive the step. The
    // margin's own prose field is not what 008 speaks for, and keeps the
    // smaller size.
    const rule = mediaRuleFor('.batch-margin__field');
    expect(rule, 'expected a media-scoped field-text rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 723.98px)');
    expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-control\)/);
    expect(rule.selector).not.toMatch(/\.ink-field/);
  });

  test('both save ceremonies wrap through one rule (D-01)', () => {
    const rule = mediaRuleFor('.save-ceremony, .pen-foot__controls');
    expect(rule, 'expected a media-scoped save-ceremony/pen-foot wrap rule').toBeTruthy();
    expect(rule.media).toBe('(max-width: 723.98px)');
    expect(rule.declarations).toMatch(/flex-wrap:\s*wrap/);
  });

  test('the ingredient table region scrolls inside itself at 723.98px and below (RESEARCH Pitfall 7, D-15)', () => {
    const rule = rules.find(
      (r) => r.selector === '.ingredient-table-region' && r.media === '(max-width: 723.98px)',
    );
    expect(rule, 'expected a media-scoped .ingredient-table-region rule').toBeTruthy();
    expect(rule.declarations).toMatch(/overflow-x:\s*auto/);
  });

  // Decision 15 (sketch 011, 03.5-11 Task 1): below 724 the table reads as
  // the drawn list — no head row, one grid row per portion — moved here
  // from the width-only (max-width: 759.98px) block wholesale, in the
  // board's own rule order (723-batch.html), appended after this block's
  // pre-existing content.
  test('the phone-forms block appends the list-form rules, in the board\'s own order, after its pre-existing content (decision 15, sketch 011, 03.5-11)', () => {
    // The record pen's own width-only block shares this condition (decision
    // 28) and is pinned above.
    const phoneFormsRules = rules.filter((r) => r.media === '(max-width: 723.98px)' && !r.selector.startsWith('.axis-mark'));
    expect(phoneFormsRules.map((r) => r.selector)).toEqual([
      ':root',
      '.field-row__label',
      '.batch-margin__field',
      '.save-ceremony, .pen-foot__controls',
      '.ingredient-table-region',
      '.ingredient-table thead',
      '.ingredient-table, .ingredient-table tbody, .ingredient-table tfoot',
      '.ingredient-table tr',
      '.ingredient-table tr.ingredient-table__step-head',
      '.ingredient-table td',
      '.ingredient-table td.ingredient-table__col-grams, .ingredient-table td.ingredient-table__col-name, .ingredient-table td.ingredient-table__col-numeric',
      '.ingredient-table td.ingredient-table__col-grams',
      '.ingredient-table td.ingredient-table__col-name',
      '.ingredient-table td.ingredient-table__col-numeric:nth-last-child(2)',
      '.ingredient-table td.ingredient-table__col-numeric:last-child',
      '.ingredient-table td.ingredient-table__col-numeric:empty',
      '.ingredient-table tr:not(.ingredient-table__step-head)',
      '.ingredient-table__plan-grams:has(> .struck-value)',
      '.ingredient-table td.ingredient-table__col-grams .struck-value',
      '.ingredient-table tr:has(.ingredient-table__col-name > .struck-value) .ingredient-table__plan-grams > .struck-value',
      '.ingredient-table td.ingredient-table__col-numeric:last-child:has(> .struck-value)',
      '.ingredient-table tr:has(.ingredient-table__col-grams .struck-value) td.ingredient-table__col-numeric:last-child:has(> .struck-value)',
      '.ingredient-table td.ingredient-table__col-numeric:last-child > .struck-value',
    ]);
  });

  test('below 724 the phone reads plan / As made / struck: the amount gives up its box and the struck figure takes the last line, in the amount, the share, the Total and the pen (sketch 011 decision 31, D3, phone boards approved 2026-10-03 under decision 32; decision 33 brief task 1; supersedes decisions 24 and 25)', () => {
    const phone = (selector) => rules.find((r) => r.selector === selector && r.media === '(max-width: 723.98px)');
    const declarationsOf = (selector) => {
      const rule = phone(selector);
      expect(rule, `expected a media-scoped rule for ${selector}`).toBeTruthy();
      return rule.declarations;
    };

    // The amount's cell, and its slot when the slot holds a struck figure, give up
    // their boxes: the slot's contents and the pen's struck parent become the row
    // grid's items.
    expect(declarationsOf('.ingredient-table td.ingredient-table__col-grams')).toMatch(/display:\s*contents/);
    expect(declarationsOf('.ingredient-table__plan-grams:has(> .struck-value)')).toMatch(/display:\s*contents/);
    // An anonymous box takes its alignment from the row, not from the cell.
    expect(declarationsOf('.ingredient-table tr:not(.ingredient-table__step-head)')).toMatch(/text-align:\s*right/);

    // The name spans the three lines, left-aligned; As made carries its own hair.
    const name = declarationsOf('.ingredient-table td.ingredient-table__col-name');
    expect(name).toMatch(/grid-row:\s*1 \/ 4/);
    expect(name).toMatch(/text-align:\s*left/);
    expect(declarationsOf('.ingredient-table td.ingredient-table__col-numeric:nth-last-child(2)')).toMatch(/margin-top:\s*var\(--gap-hair\)/);

    // The struck amount: the grid's third line, one hair under As made, right-aligned.
    const struck = declarationsOf('.ingredient-table td.ingredient-table__col-grams .struck-value');
    expect(struck).toMatch(/display:\s*block/);
    expect(struck).toMatch(/grid-column:\s*1\s*;/);
    expect(struck).toMatch(/grid-row:\s*3\s*;/);
    expect(struck).toMatch(/margin:\s*var\(--gap-hair\) 0 0/);
    expect(struck).toMatch(/text-align:\s*right/);

    // A removed row's lone struck amount stands on the first line.
    const removed = declarationsOf('.ingredient-table tr:has(.ingredient-table__col-name > .struck-value) .ingredient-table__plan-grams > .struck-value');
    expect(removed).toMatch(/grid-row:\s*1\s*;/);
    expect(removed).toMatch(/margin-top:\s*0/);

    // The share is a reversed flex column; it spans the three lines when the amount
    // has a struck figure, so the two struck figures share the last line.
    const share = declarationsOf('.ingredient-table td.ingredient-table__col-numeric:last-child:has(> .struck-value)');
    expect(share).toMatch(/display:\s*flex/);
    expect(share).toMatch(/flex-direction:\s*column-reverse/);
    expect(share).toMatch(/align-items:\s*flex-end/);
    const shareSpan = declarationsOf('.ingredient-table tr:has(.ingredient-table__col-grams .struck-value) td.ingredient-table__col-numeric:last-child:has(> .struck-value)');
    expect(shareSpan).toMatch(/grid-row:\s*1 \/ 4/);
    expect(shareSpan).toMatch(/justify-content:\s*space-between/);
    expect(declarationsOf('.ingredient-table td.ingredient-table__col-numeric:last-child > .struck-value')).toMatch(/margin:\s*0/);

    // The three stacking rules decision 31 retires have no rule left in the block.
    for (const selector of [
      '.ingredient-table__plan-grams > .struck-value',
      '.ingredient-table td.ingredient-table__col-numeric > .struck-value',
      '.ingredient-table td.ingredient-table__col-grams > .struck-value',
    ]) {
      expect(phone(selector), `${selector} should have no rule in the phone-forms block`).toBeUndefined();
    }
  });

  test("the list row's grid reads --sheet-plan-grams-w for its first track, and no list-form rule carries !important (the boards need !important only to beat their own inlined stale stylesheet; app.css has no such conflict to out-rank)", () => {
    const trRule = rules.find((r) => r.selector === '.ingredient-table tr' && r.media === '(max-width: 723.98px)');
    expect(trRule, 'expected the media-scoped list-row grid rule').toBeTruthy();
    expect(trRule.declarations).toMatch(
      /grid-template-columns:\s*var\(--sheet-plan-grams-w\) minmax\(0,\s*1fr\) max-content/,
    );
    expect(trRule.declarations).toMatch(/column-gap:\s*var\(--sheet-narrow-name-gap\)/);
    expect(trRule.declarations).toMatch(/row-gap:\s*0\b/);
    expect(trRule.declarations).toMatch(/padding:\s*var\(--sheet-narrow-row-pad-y\)\s+0/);
    expect(trRule.declarations).toMatch(/border-bottom:\s*var\(--rule-graduation\)\s+solid\s+var\(--sheet-ink\)/);

    const listRules = rules.filter((r) => r.media === '(max-width: 723.98px)' && r.selector.includes('ingredient-table'));
    expect(listRules.length).toBeGreaterThan(0);
    for (const rule of listRules) {
      expect(rule.declarations).not.toMatch(/!important/);
    }
  });

  test('app.css carries exactly eight top-level @media blocks, at seven named conditions, the record pen\'s width-only block sharing the phone forms\' 723.98px since sketch 011 decision 28 (03.3.1.1-01 Task 1; 03.3.1.1-03 Task 1; touch union 2026-09-15, pointer-only since 03.5-13; 260915-x6n touch font; 260917-ewf print; 261004-ox8 the screen-only D3 table grid)', () => {
    const mediaConditions = [...new Set(rules.filter((r) => r.media !== undefined).map((r) => r.media))];
    expect(mediaConditions.sort()).toEqual([
      '(forced-colors: active)',
      '(max-width: 723.98px)',
      '(max-width: 983.98px)',
      '(min-width: 724px) and (pointer: coarse)',
      '(pointer: coarse)',
      'print',
      'screen and (min-width: 724px)',
    ]);
  });
});

describe('the 983.98px block — the side nav and the Sheet\'s second column go together (sketch 011 decision 16)', () => {
  const stackRules = rules.filter((r) => r.media === '(max-width: 983.98px)');

  // G-03.5-8b (03.5-22): the foot band is one column at every width, so the
  // block's two foot rules were redundant and are gone. The foot mirrored the
  // Sheet's two columns only to seat the ceremony beneath the second one, which
  // is 189px at 984 against the ceremony's 245px.
  // 261003-9bz adds .recipe-page--no-method: an Instructions-less Sheet drops the empty method row.
  test('carries exactly .recipe-page and .recipe-page--no-method (the foot band is one column at every width, so it needs no rule here)', () => {
    expect(stackRules.map((r) => r.selector)).toEqual(['.recipe-page', '.recipe-page--no-method']);
  });

  test('261003-9bz: the narrow .recipe-page--no-method rule declares the four areas without method, after the narrow .recipe-page rule', () => {
    const rule = stackRules.find((r) => r.selector === '.recipe-page--no-method');
    expect(rule, 'expected the media-scoped .recipe-page--no-method rule').toBeTruthy();
    expect(rule.declarations).toMatch(/grid-template-areas:\s*'band'\s*'ingredients'\s*'side'\s*'foot'\s*;?\s*$/);
    expect(rule.declarations).not.toMatch(/method/);
    expect(rules.indexOf(rule)).toBeGreaterThan(rules.indexOf(stackRules.find((r) => r.selector === '.recipe-page')));
  });

  test('261003-9bz: the base .recipe-page--no-method rule declares only the three two-column areas, after the base .recipe-page rule', () => {
    const rule = ruleFor('.recipe-page--no-method');
    expect(rule, 'expected the top-level .recipe-page--no-method rule').toBeTruthy();
    expect(rule.declarations).toMatch(/grid-template-areas:\s*'band band'\s*'ingredients side'\s*'foot foot'\s*;?\s*$/);
    expect(rule.declarations).not.toMatch(/grid-template-columns|gap|padding/);
    expect(rules.indexOf(rule)).toBeGreaterThan(rules.indexOf(ruleFor('.recipe-page')));
  });

  test('.recipe-page stacks to one column in the band/ingredients/side/method/foot order, with no padding declaration', () => {
    const rule = stackRules.find((r) => r.selector === '.recipe-page');
    expect(rule, 'expected the media-scoped .recipe-page rule').toBeTruthy();
    expect(rule.declarations).toMatch(/grid-template-columns:\s*1fr/);
    expect(rule.declarations).toMatch(/'band'\s*'ingredients'\s*'side'\s*'method'\s*'foot'/);
    expect(rule.declarations).not.toMatch(/padding/);
  });

});

describe('the foot band and its ceremony — one column, labels never broken (G-03.5-8b, 03.5-22)', () => {
  test('the base .pen-foot declares one track, and the controls span it', () => {
    const foot = ruleFor('.pen-foot');
    expect(foot, 'expected the base .pen-foot rule').toBeTruthy();
    expect(foot.declarations).toMatch(/grid-template-columns:\s*1fr\s*;/);
    expect(foot.declarations).not.toMatch(/2fr/);
    const controls = ruleFor('.pen-foot__controls');
    expect(controls, 'expected the base .pen-foot__controls rule').toBeTruthy();
    expect(controls.declarations).toMatch(/grid-column:\s*1\s*\/\s*-1/);
  });

  test('a base rule keeps every ceremony button whole: no shrinking below its label, no line break in it', () => {
    const rule = ruleFor('.save-ceremony button');
    expect(rule, 'expected the base ceremony-button rule').toBeTruthy();
    expect(rule.declarations).toMatch(/white-space:\s*nowrap/);
    expect(rule.declarations).toMatch(/flex:\s*none/);
  });
});

describe('the stylesheet reader sees a media block (parser round-trip, css-source.js)', () => {
  test('readAllRules tags a media block\'s inner rules with its condition and its top-level neighbours with media undefined', () => {
    const fixture = [
      '.before { color: one; }',
      '@media (max-width: 500px) {',
      '  .inside { color: two; }',
      '}',
      '.after { color: three; }',
    ].join('\n');
    const parsed = readAllRules(fixture);
    expect(parsed.map((r) => [r.selector, r.media])).toEqual([
      ['.before', undefined],
      ['.inside', '(max-width: 500px)'],
      ['.after', undefined],
    ]);
  });

  test('assertNoAtRules still throws on a non-media at-rule and on an at-rule nested inside the media block', () => {
    expect(() => assertNoAtRules('@supports (x: y) { .a { color: red; } }')).toThrow();
    expect(() =>
      assertNoAtRules('@media (max-width: 500px) { @supports (x: y) { .a { color: red; } } }'),
    ).toThrow();
    expect(() => assertNoAtRules('@media (max-width: 500px) { .a { color: red; } }')).not.toThrow();
  });
});

describe('type roles — the four validated sizes mapped onto tokens', () => {
  test('the role tokens carry the sketch\'s values, by value string (resolveTokenPx is px-only)', () => {
    expect(tokens['--sheet-type-section']).toBe('0.875rem');
    expect(tokens['--sheet-leading-section']).toBe('1.35');
    expect(tokens['--sheet-type-label']).toBe('0.75rem');
    expect(tokens['--sheet-type-control']).toBe('0.8125rem');
    expect(tokens['--sheet-type-note']).toBe('1rem');
    expect(tokens['--sheet-leading-note']).toBe('1.5');
  });

  test('the three section-heading rules read the section role at weight 600 and leading 1.35', () => {
    // .derived-advisories__legend retired at decision 18 (03.5-16): Watch
    // for now wears the shared .region-name heading instead of its own
    // legend paragraph, so that role is already covered by .region-name.
    for (const selector of ['.region-name', '.batch-margin__legend', '.authored__legend']) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the section role`).toBeTruthy();
      expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-section\)/);
      expect(rule.declarations).toMatch(/font-weight:\s*600/);
      expect(rule.declarations).toMatch(/line-height:\s*var\(--sheet-leading-section\)/);
    }
  });

  test('.region-name keeps its ratified surface traits — bookcloth colour and the uppercase/letter-spacing transform', () => {
    const rule = ruleFor('.region-name');
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-bookcloth\)/);
    expect(rule.declarations).toMatch(/text-transform:\s*uppercase/);
    expect(rule.declarations).toMatch(/letter-spacing:\s*0\.04em/);
  });

  // 03.5-04 Task 3: .headnote__version-field and .headnote__citation
  // retired (the version pen's own ceremony moved whole into
  // VersionRow.jsx's .notebook-ceremony) — seven caption rules remain.
  test('the seven caption rules read --sheet-type-label at weight 500', () => {
    for (const selector of [
      '.versions__ceremony-field span',
      '.batch-row__cell-label',
      '.method-step__uses legend',
      '.method-step__skipped-label',
      '.versions__lineage-label',
      '.pen-caption',
      '.axis-mark__name',
    ]) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the caption role`).toBeTruthy();
      expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-label\)/);
      expect(rule.declarations).toMatch(/font-weight:\s*500/);
    }
  });

  test('.pen-caption carries the sketch\'s own uppercase/tracking/gap declarations (sketch 007 @ 2a212be lines 36 + 156, D-10)', () => {
    const rule = ruleFor('.pen-caption');
    expect(rule, 'expected a .pen-caption rule').toBeTruthy();
    expect(rule.declarations).toMatch(/margin:\s*0 0 var\(--gap-xs\)/);
    expect(rule.declarations).toMatch(/text-transform:\s*uppercase/);
    expect(rule.declarations).toMatch(/letter-spacing:\s*0\.04em/);
  });

  // Three helper/status rules that nothing rendered were retired in quick task
  // 260917-e5k (the last renderer, VersionRow's "Links return after you save or
  // cancel." paragraph, was removed in 1333a7e). The live set below was established
  // by grepping every className a component actually renders
  // (`grep -rnoE "className=..." app/src`), not guessed: .page-status (router.jsx),
  // .form-status (BatchRow.jsx / VersionRow.jsx), .save-ceremony__hint and .pen-helper
  // (PenFoot.jsx). .save-ceremony__status and .tasting-status are live class names too,
  // but carry no type rule of their own — their face and size arrive through
  // .pen-helper on the same element — so they are not in this list.
  const HELPER_STATUS_SELECTORS = ['.page-status', '.form-status', '.save-ceremony__hint', '.pen-helper'];

  test('the four helper and status sentences read the control role (13px)', () => {
    for (const selector of HELPER_STATUS_SELECTORS) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to read the helper/status role`).toBeTruthy();
      expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-control\)/);
    }
  });

  test('helper and status text keeps one grotesk face, sentence case — no transform, so no state-change face flip', () => {
    for (const selector of HELPER_STATUS_SELECTORS) {
      const rule = ruleFor(selector);
      expect(rule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
      // .pen-helper states the guarantee positively (text-transform: none;
      // font-style: normal) rather than by omission, so asserting absence would
      // go red on the very rule that carries the guarantee most widely. Collect
      // every declared value for each property and require sentence case (none)
      // and upright (normal) wherever the property is declared at all.
      const transforms = [...rule.declarations.matchAll(/text-transform:\s*([^;]+);/g)].map((m) => m[1].trim());
      for (const value of transforms) {
        expect(value).toBe('none');
      }
      const styles = [...rule.declarations.matchAll(/font-style:\s*([^;]+);/g)].map((m) => m[1].trim());
      for (const value of styles) {
        expect(value).toBe('normal');
      }
    }
  });

  test('.authored__notes reads the note role and the note leading', () => {
    const rule = ruleFor('.authored__notes');
    expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-note\)/);
    expect(rule.declarations).toMatch(/line-height:\s*var\(--sheet-leading-note\)/);
  });

  test('.prose-text reads the note leading and keeps its deliberate size inherit (no font-size of its own)', () => {
    const rule = ruleFor('.prose-text');
    expect(rule.declarations).toMatch(/line-height:\s*var\(--sheet-leading-note\)/);
    expect(rule.declarations).not.toMatch(/font-size:/);
  });

  test('.prose-field inherits its contextual size but keeps a readable one-line base extent', () => {
    const rule = ruleFor('.prose-field');
    expect(rule.declarations).toMatch(/font-size:\s*inherit/);
    expect(rule.declarations).toMatch(/line-height:\s*var\(--sheet-leading-note\)/);
    expect(rule.declarations).toMatch(/padding:\s*var\(--gap-hair\) 0/);
    expect(rule.declarations).toMatch(/min-height:\s*calc\(var\(--sheet-leading-note\) \* 1em\)/);
  });

  test('the recorded figure reads the note size at the prose weight, in pen blue (sketch 003 line 88, D-15)', () => {
    const rule = ruleFor('.batch-row__cell-value');
    expect(rule, 'expected a .batch-row__cell-value rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-note\)/);
    expect(rule.declarations).toMatch(/font-weight:\s*400/);
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-pen-blue\)/);
    const absentRule = ruleFor('.batch-row__unit--absent');
    expect(absentRule, 'expected a .batch-row__unit--absent rule').toBeTruthy();
    expect(absentRule.declarations).toMatch(/color:\s*var\(--sheet-ink\)/);
  });

  test('.text-control reads the control role at a 24px minimum height (sketch 003 line 32, 007 line 131, D-15)', () => {
    const rule = ruleFor('.text-control');
    expect(rule, 'expected a .text-control rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-control\)/);
    expect(rule.declarations).toMatch(/min-height:\s*var\(--sheet-text-control-min\)/);
    expect(tokens['--sheet-text-control-min']).toBe('24px');
  });
});

describe("the sketch's field row (007 @ 2a212be lines 37-44, D-13)", () => {
  test('field blocks top-align so helper and error height cannot move sibling controls', () => {
    const rule = ruleFor('.field-row');
    expect(rule, 'expected a .field-row rule').toBeTruthy();
    expect(rule.declarations).toMatch(/align-items:\s*flex-start/);
  });

  test('.field-unit .ink-field reads the 56px figure width', () => {
    const rule = ruleFor('.field-unit .ink-field');
    expect(rule, 'expected a .field-unit .ink-field rule').toBeTruthy();
    expect(rule.declarations).toMatch(/width:\s*var\(--sheet-field-w-figure\)/);
    expect(resolveTokenPx(tokens, '--sheet-field-w-figure')).toBe(56);
  });

  test('.field-row__label--date reads the 128px date width', () => {
    const rule = ruleFor('.field-row__label--date');
    expect(rule, 'expected a .field-row__label--date rule').toBeTruthy();
    expect(rule.declarations).toMatch(/width:\s*var\(--sheet-field-w-date\)/);
    expect(resolveTokenPx(tokens, '--sheet-field-w-date')).toBe(128);
  });

  test('.method-step__on-demand sits at its own content width, not stretched by the column flex wrapper', () => {
    const rule = ruleFor('.method-step__on-demand');
    expect(rule, 'expected a .method-step__on-demand rule').toBeTruthy();
    expect(rule.declarations).toMatch(/align-self:\s*flex-start/);
  });

  test('.field-row .pen-caption reserves the two-line caption height, excluding a segmented head sharing the row (Melt style; sketch 007 line 180)', () => {
    const rule = ruleFor('.field-row .pen-caption:not(.segmented-field__caption)');
    expect(rule, 'expected a .field-row .pen-caption rule').toBeTruthy();
    // The em token, deliberately: this element IS a caption, so 2.4em resolves
    // against its own 12px. The -abs companion exists for the caption LINE,
    // which holds a caption without being one. Both must reach 28.8px.
    expect(rule.declarations).toMatch(/min-height:\s*var\(--sheet-caption-two-lines\)/);
  });
});

describe('placeholders italic, entered prose roman pen-blue', () => {
  test('::placeholder declares font-style: italic', () => {
    const rule = ruleFor('::placeholder');
    expect(rule.declarations).toMatch(/font-style:\s*italic/);
  });

  test('entered prose carries no italic of its own — .prose-field and .prose-text stay roman pen-blue', () => {
    expect(ruleFor('.prose-field').declarations).toMatch(/color:\s*var\(--sheet-pen-blue\)/);
    expect(ruleFor('.prose-field').declarations).not.toMatch(/font-style/);
    expect(ruleFor('.prose-text').declarations).toMatch(/color:\s*var\(--sheet-pen-blue\)/);
    expect(ruleFor('.prose-text').declarations).not.toMatch(/font-style/);
  });

  test('the purpose/aside display italic stays its own separate ratified register (text face, italic, untouched here)', () => {
    const rule = ruleFor('.method-step__purpose, .method-step__aside');
    expect(rule.declarations).toMatch(/font-style:\s*italic/);
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-text\)/);
  });
});

describe('the 6px caption-to-content gap — var(--gap-xs) everywhere a caption and its content share one label', () => {
  // 03.5-04 Task 3: .headnote__version-field and .headnote__citation
  // retired — five existing sites remain (down from seven).
  test('the five existing sites read their caption-to-content distance through var(--gap-xs)', () => {
    for (const selector of [
      '.versions__ceremony-field span',
      '.method-step__uses legend',
    ]) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the 6px caption gap`).toBeTruthy();
      expect(rule.declarations).toMatch(/margin-bottom:\s*var\(--gap-xs\)/);
    }
    for (const selector of ['.batch-margin__field', '.batch-row__cell', '.method-step__line-control']) {
      const rule = ruleFor(selector);
      expect(rule, `expected ${selector} to carry the 6px caption gap`).toBeTruthy();
      expect(rule.declarations).toMatch(/gap:\s*var\(--gap-xs\)/);
    }
  });

  test('the axis/segmented head row picks up the same 6px caption-to-content gap, ahead of the stops, and reserves Clear\'s own height (03.3.1-06 Task 1; 03.3.1.1 tenth round)', () => {
    // The rebuilt axis-mark stacks three rows (head, stops, anchors)
    // rather than the retired .axis-mark__legend's single caption-above-
    // content shape, so the 6px gap now belongs to the head row as a
    // whole (name + inline state + Clear), not the name span alone. The
    // tenth round grouped this rule with .segmented-field__head (Plan
    // 04's markup) and gave it a reserved min-height so picking moves
    // nothing (007 line 75).
    const rule = ruleFor('.axis-mark__head, .segmented-field__head');
    expect(rule, 'expected the grouped .axis-mark__head, .segmented-field__head rule').toBeTruthy();
    expect(rule.declarations).toMatch(/margin-bottom:\s*var\(--gap-xs\)/);
    expect(rule.declarations).toMatch(/min-height:\s*var\(--sheet-caption-line-h\)/);
    // M4 (sketch 009, Mark 2026-09-15): bottom-aligned, not centred, so the
    // caption's baseline lands where the field-row caption beside it lands.
    expect(rule.declarations).toMatch(/align-items:\s*flex-end/);
    // The head must NOT carry a font-size. An earlier M4 draft set one so the
    // em-based reserve would resolve against 12px, which fixed the arithmetic
    // but made the head's computed size differ from the sketch's for no
    // rendered reason — nothing inside inherits it, every child sets its own.
    // The multiplication moved into --sheet-caption-two-lines-abs instead.
    expect(rule.declarations).not.toMatch(/font-size:/);
  });
});

describe('joined stops (007 @ 2a212be lines 80-81, 124)', () => {
  test('.axis-mark__stops carries no gap — the cells share hairlines through a negative margin', () => {
    const rule = ruleFor('.axis-mark__stops');
    expect(rule, 'expected a .axis-mark__stops rule').toBeTruthy();
    expect(rule.declarations).not.toMatch(/gap:/);
  });

  test('.axis-mark__stop reads a 38px flex-basis and a one-hairline negative right margin, reset on :last-child', () => {
    const rule = ruleFor('.axis-mark__stop');
    expect(rule, 'expected a .axis-mark__stop rule').toBeTruthy();
    expect(rule.declarations).toMatch(/flex:\s*0 0 var\(--sheet-stop-w\)/);
    expect(rule.declarations).toMatch(/margin-right:\s*calc\(-1 \* var\(--rule-ink-field\)\)/);
    const lastChildRule = ruleFor('.axis-mark__stop:last-child');
    expect(lastChildRule, 'expected a .axis-mark__stop:last-child rule').toBeTruthy();
    expect(lastChildRule.declarations).toMatch(/margin-right:\s*0/);
  });

  test('--sheet-stop-w resolves to 38 and --stop-gap is retired; the caption-line tokens resolve to 24 and 44', () => {
    expect(resolveTokenPx(tokens, '--sheet-stop-w')).toBe(38);
    expect(tokens['--stop-gap']).toBeUndefined();
    expect(resolveTokenPx(tokens, '--sheet-caption-line-h')).toBe(24);
    expect(resolveTokenPx(tokens, '--sheet-caption-line-h-touch')).toBe(44);
  });

  test('the axes grid reads column-gap: 0 — clearance now carried by padding on the flanking columns', () => {
    const rule = ruleFor('.axes-grid');
    expect(rule, 'expected a .axes-grid rule').toBeTruthy();
    expect(rule.declarations).toMatch(/column-gap:\s*0/);
  });
});

describe('exclusion guards — registers the finding deliberately leaves in place', () => {
  test("the ingredient table's internal type keeps its measured register (columns.test.js's browser-measured column minimums depend on these sizes)", () => {
    expect(ruleFor('.ingredient-table th').declarations).toMatch(/font-size:\s*var\(--sheet-size-running-head\)/);
    expect(ruleFor('.table-small-print').declarations).toMatch(/font-size:\s*var\(--sheet-size-small-print\)/);
    expect(ruleFor('.ingredient-table__flag').declarations).toMatch(/font-size:\s*var\(--sheet-size-cross-flag\)/);
    // the pen's remove/restore link stands 14px clear of the name (sketch 011 decision 26)
    expect(ruleFor('.ingredient-table__remove-gap').declarations).toMatch(/word-spacing:\s*var\(--sheet-remove-gap\)/);
    // a --sheet-size-cross-flag consumer outside the table stays there too
    expect(ruleFor('.method-step__uses-line').declarations).toMatch(/font-size:\s*var\(--sheet-size-cross-flag\)/);
  });

  test("the batch row's measured-cell small print keeps its ratified registers", () => {
    expect(ruleFor('.batch-row__plan').declarations).toMatch(/font-size:\s*var\(--sheet-size-small-print\)/);
    expect(ruleFor('.batch-row__unit').declarations).toMatch(/font-size:\s*var\(--sheet-size-deviation-words\)/);
  });
});

describe('the page notice anchors above the keyed page, out of flow (260917-ewf; re-anchored 03.5-02 Task 3)', () => {
  test('.page-status is absolutely positioned, with no fixed-corner declarations left', () => {
    const rule = ruleFor('.page-status');
    expect(rule, 'expected a top-level .page-status rule').toBeTruthy();
    expect(rule.declarations).toMatch(/position:\s*absolute/);
    expect(rule.declarations).not.toMatch(/position:\s*fixed/);
    expect(rule.declarations).not.toMatch(/inset-block-end/);
    expect(rule.declarations).not.toMatch(/inset-inline-end/);
  });

  test('.page-status-anchor is the containing block (position: relative), and .page-status anchors flush to its own top edge', () => {
    const anchorRule = ruleFor('.page-status-anchor');
    expect(anchorRule, 'expected a top-level .page-status-anchor rule').toBeTruthy();
    expect(anchorRule.declarations).toMatch(/position:\s*relative/);
    expect(ruleFor('.page-status').declarations).toMatch(/inset-block-start:\s*0/);
  });

  test('four boxes, one gutter — the notice, the page, the "no recipe found" page, and the list route\'s page body all read the shared --gap-page, so none can drift alone (260917-gjo; the fifth box, the running head, retired 03.5-02 Task 3)', () => {
    expect(ruleFor('.page-status').declarations).toMatch(/inset-inline-start:\s*var\(--gap-page\)/);
    expect(ruleFor('.not-found').declarations).toMatch(/padding:\s*var\(--gap-m\)\s+var\(--gap-page\)/);
    expect(ruleFor('.recipe-page').declarations).toMatch(/padding:\s*var\(--gap-page\)/);
    expect(ruleFor('.list-page').declarations).toMatch(/padding:\s*var\(--gap-page\)/);
  });

  test('every other visual declaration on .page-status survives (margin-block-start added, 260917-ewf Task 4), and .page-status:empty still collapses', () => {
    const rule = ruleFor('.page-status');
    // Reads --app-z-notice (10), so the sticky bar's --app-z-header can sit above it; shell.test.js pins the 10.
    expect(rule.declarations).toMatch(/z-index:\s*var\(--app-z-notice\)/);
    expect(rule.declarations).toMatch(/max-width:\s*min\(var\(--measure-prose\), calc\(100vw - var\(--gap-page\) - var\(--gap-m\)\)\)/);
    expect(rule.declarations).toMatch(/margin:\s*0/);
    expect(rule.declarations).toMatch(/margin-block-start:\s*var\(--gap-xs\)/);
    expect(rule.declarations).toMatch(/padding:\s*var\(--gap-xs\) var\(--gap-s\)/);
    expect(rule.declarations).toMatch(/border:\s*var\(--rule-baseline\) solid var\(--sheet-ink\)/);
    expect(rule.declarations).toMatch(/background:\s*var\(--sheet-ground\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-ink\)/);
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
    expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-control\)/);

    const emptyRule = ruleFor('.page-status:empty');
    expect(emptyRule, 'expected .page-status:empty to survive').toBeTruthy();
    expect(emptyRule.declarations).toMatch(/padding:\s*0/);
    expect(emptyRule.declarations).toMatch(/border:\s*0/);
  });

  test('no transition was added — the notice appears and disappears with no motion', () => {
    expect(appCssSource).not.toMatch(/transition/);
  });
});

describe('the print layer suppresses the page notice and falls the hand back to the text face (260917-ewf Task 3; 03.4-02 Task 2, D-17)', () => {
  test('the print block carries exactly four rules: .page-status goes display: none, .app-hand falls back to the text face in italic, so does .sheet-hand (sketch 011 Task 1), and the Ingredients-row Show changes goes display: none (261002-wn1)', () => {
    // Resolved explicitly on r.media === 'print', never through
    // mediaRuleFor, which returns the first match across ALL media
    // blocks (the file's own precedent at ~206). The print block's
    // cardinality pin is deliberately widened here, in the same change
    // that adds the hand's fallback rule (RESEARCH.md Pitfall 2) — not
    // discovered later as a surprise red test.
    const printRules = rules.filter((r) => r.media === 'print');
    expect(printRules).toHaveLength(4);

    const pageStatusRule = printRules.find((r) => r.selector === '.page-status');
    expect(pageStatusRule, 'expected .page-status among the print rules').toBeTruthy();
    expect(pageStatusRule.declarations).toMatch(/display:\s*none/);

    const handRule = printRules.find((r) => r.selector === '.app-hand');
    expect(handRule, 'expected .app-hand among the print rules').toBeTruthy();
    expect(handRule.declarations).toMatch(/font-family:\s*var\(--face-text\)/);
    expect(handRule.declarations).toMatch(/font-style:\s*italic/);

    const sheetHandRule = printRules.find((r) => r.selector === '.sheet-hand');
    expect(sheetHandRule, 'expected .sheet-hand among the print rules').toBeTruthy();
    expect(sheetHandRule.declarations).toMatch(/font-family:\s*var\(--face-text\)/);
    expect(sheetHandRule.declarations).toMatch(/font-style:\s*italic/);

    // 261002-wn1 (decision 30 addendum, "Print must hide the control"): the
    // control sits on the Sheet below 724 and is screen-only.
    const headControlRule = printRules.find((r) => r.selector === '.ingredient-table-region__head .text-control');
    expect(headControlRule, 'expected the Ingredients-row Show changes among the print rules').toBeTruthy();
    expect(headControlRule.declarations).toMatch(/display:\s*none/);
  });
});

describe('one shared page gutter (260917-gjo) — --gap-page defined once, stepped once, read by five boxes (260917-h83 added the fifth)', () => {
  test('tokens.css defines --gap-page once, reading --gap-xl, and resolves to the desktop gutter', () => {
    expect(tokens['--gap-page']).toBe('var(--gap-xl)');
    expect(resolveTokenPx(tokens, '--gap-page')).toBe(48);
  });

  test('tokens.css still opens no at-rule — the breakpoint step-down lives only in app.css', () => {
    // Comment-stripped, since tokens.css's own two @media mentions are
    // prose about app.css's convention, not an at-rule of its own.
    const stripped = stripCssComments(tokensSource);
    expect(stripped).not.toMatch(/@media/);
  });

  test("main.jsx imports tokens.css before app.css — the cascade the shared gutter's step-down rests on", () => {
    // Both --gap-page declarations sit on :root at equal specificity, and
    // a media query adds none, so which one wins below the phone-forms
    // cut is decided purely by source order. That makes this import order a real
    // contract the mechanism depends on, not incidental sequencing — if
    // it ever flipped, the step-down would silently stop applying.
    const tokensImportIndex = mainJsxSource.indexOf('./styles/tokens.css');
    const appCssImportIndex = mainJsxSource.indexOf('./styles/app.css');
    expect(tokensImportIndex).toBeGreaterThan(-1);
    expect(appCssImportIndex).toBeGreaterThan(-1);
    expect(tokensImportIndex).toBeLessThan(appCssImportIndex);
  });

  test('the gutter rule has a renderer — RecipeList.jsx renders .list-page exactly once, so the rule is never an orphan (260915-vvh CR-02 was a shipped rule nothing rendered)', () => {
    expect(RECIPE_LIST_JSX_PATH).toBeTruthy();
    const matches = recipeListJsxSource.match(/className="list-page"/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  test('no media-scoped rule re-states an inline gutter for any of the five boxes — the step is declared once, on :root alone', () => {
    const guardedSelectors = ['.recipe-page', '.not-found', '.page-status', '.list-page'];
    const offenders = rules.filter(
      (r) =>
        r.media !== undefined &&
        guardedSelectors.includes(r.selector) &&
        /(^|\s)(padding|padding-inline|padding-left|inset-inline-start|inset-left):/.test(r.declarations),
    );
    expect(offenders).toEqual([]);
  });

  test('no app.css rule reads var(--gap-xl) any more — every one of the four consumers reads the shared --gap-page instead', () => {
    const offenders = rules.filter((r) => /var\(--gap-xl\)/.test(r.declarations));
    expect(offenders).toEqual([]);
  });
});

describe('the hand (D-17, D-18, DESIGN.md Typography > Hand role)', () => {
  test('.app-hand is a top-level rule reading the hand face, the pen blue, and both hand size tokens in one declaration, with no weight and no transform', () => {
    const rule = ruleFor('.app-hand');
    expect(rule, 'expected a top-level .app-hand rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-hand\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-pen-blue\)/);
    expect(rule.declarations).toMatch(/font-size:\s*max\(var\(--size-hand\),\s*var\(--size-hand-min\)\)/);
    expect(rule.declarations).not.toMatch(/font-weight/);
    expect(rule.declarations).not.toMatch(/text-transform/);
  });

  test('a forced-colours rule falls .app-hand back to the text face, in italic (D-17)', () => {
    // binder.test.js's existing shape for asserting a selector's presence
    // inside the forced-colors block: .find over the block, not a length
    // assertion (that block carries no exact-count pin, unlike print).
    const forcedRules = rules.filter((r) => r.media === '(forced-colors: active)');
    const handRule = forcedRules.find((r) => r.selector === '.app-hand');
    expect(handRule, 'expected .app-hand among the forced-colors selectors').toBeTruthy();
    expect(handRule.declarations).toMatch(/font-family:\s*var\(--face-text\)/);
    expect(handRule.declarations).toMatch(/font-style:\s*italic/);
  });

  // The Sheet's own hand (sketch 011 decisions_recorded 1, Task 1): a
  // SEPARATE rule from .app-hand, not a reuse — the boards draw the
  // Sheet's hand at a flat 20px with a line-height of 1, where the App's
  // .app-hand is max(22, 20)px at 1.25. Same face and colour tokens,
  // mirroring .app-hand's own forced-colors/print fallbacks exactly.
  test('.sheet-hand is a top-level rule reading the hand face, the Sheet\'s own 20px floor and a leading of 1, and the pen blue — never .app-hand\'s max() or 1.25 leading', () => {
    const rule = ruleFor('.sheet-hand');
    expect(rule, 'expected a top-level .sheet-hand rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-hand\)/);
    expect(rule.declarations).toMatch(/font-size:\s*var\(--size-hand-min\)/);
    expect(rule.declarations).toMatch(/line-height:\s*var\(--sheet-leading-hand\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-pen-blue\)/);
    expect(rule.declarations).not.toMatch(/max\(/);
  });

  test('a forced-colours rule falls .sheet-hand back to the text face, in italic, mirroring .app-hand', () => {
    const forcedRules = rules.filter((r) => r.media === '(forced-colors: active)');
    const handRule = forcedRules.find((r) => r.selector === '.sheet-hand');
    expect(handRule, 'expected .sheet-hand among the forced-colors selectors').toBeTruthy();
    expect(handRule.declarations).toMatch(/font-family:\s*var\(--face-text\)/);
    expect(handRule.declarations).toMatch(/font-style:\s*italic/);
  });
});

// Sketch 011 decision 37, option B (Mark, 2026-10-04; quick 261004-ly6): the
// Why value sits on its own line flush with its label, and a saved Why reads
// in the hand (the .app-hand role, decision 17). The rule resets the user
// agent's start margin on a dd and carries no size, leading, face or colour
// of its own, so the hand role's size and leading reach a saved Why. The
// rendered numbers are the probe's, against why-row.html's B panels.
describe('the Why row (sketch 011 decision 37 B, Mark 2026-10-04; quick 261004-ly6)', () => {
  test('.version-row__reason resets the start margin and keeps a long word wrapping, with no physical or shorthand margin, and no rule on it sets font-size, line-height, font-family or color', () => {
    const rule = ruleFor('.version-row__reason');
    expect(rule, 'expected a top-level .version-row__reason rule').toBeTruthy();
    expect(rule.declarations).toMatch(/margin-inline-start:\s*0\s*;/);
    expect(rule.declarations).toMatch(/overflow-wrap:\s*anywhere/);
    expect(rule.declarations).not.toMatch(/(?:^|[\s;])margin:/);
    expect(rule.declarations).not.toMatch(/margin-left/);

    const own = rules.filter((r) =>
      r.selector.split(',').some((s) => s.trim().split(/(?=\.)/).includes('.version-row__reason')));
    expect(own.length).toBeGreaterThan(0);
    for (const r of own) {
      expect(r.declarations, r.selector).not.toMatch(/(?:^|[\s;])(font-size|line-height|font-family|color):/);
    }
  });
});

describe('the WHY label tucked to its words (sketch 011 decision 39 B, Mark 2026-10-04; quick 261004-ox3)', () => {
  test('.version-row__reason-label has no top margin and a bottom margin of a negative 4px token, and no rule on it sets margin-top', () => {
    const rule = ruleFor('.version-row__reason-label');
    expect(rule, 'expected a top-level .version-row__reason-label rule').toBeTruthy();
    expect(rule.declarations).toMatch(/margin-bottom:\s*calc\(-1 \* var\(--app-notebook-gap-hairline\)\)/);
    expect(rule.declarations).not.toMatch(/margin-top/);
    expect(rule.declarations).not.toMatch(/(?:^|[\s;])margin:/);

    const own = rules.filter((r) =>
      r.selector.split(',').some((s) => s.trim().split(/(?=\.)/).includes('.version-row__reason-label')));
    expect(own.length).toBeGreaterThan(0);
    for (const r of own) {
      expect(r.declarations, r.selector).not.toMatch(/margin-top/);
    }
  });
});

// Quick task 261001-doi (Mark's iPad, 2026-10-01: the Every recipe cue sat
// 3px under the tasting note). Sketch 007 draws the space below the note
// twice: line 96's `margin-bottom: var(--gap-m)` on .note-block, outside
// the block, and line 34's `label { margin: 0 0 var(--gap-s) }`, which the
// board's note field inherits as a label and the app's paragraph eyebrow
// and textarea lost. The app carries the second inside the block as
// padding. Read as text: the rendered distances are the batches probe's
// notegap group, measured against the board in a browser.
describe('the space below the tasting note (sketch 007 lines 34 and 96; quick task 261001-doi)', () => {
  test('.note-block carries margin-bottom var(--gap-m) and padding-bottom var(--gap-s), nothing else, and no px literal', () => {
    const rule = ruleFor('.note-block');
    expect(rule, 'expected a top-level .note-block rule').toBeTruthy();
    const declarations = rule.declarations
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean);
    expect(declarations).toEqual(['padding-bottom: var(--gap-s)', 'margin-bottom: var(--gap-m)']);
    expect(rule.declarations).not.toMatch(/\d+px/);
  });

  test('--gap-m resolves to 20 and --gap-s to 12, so the board\'s space is token arithmetic', () => {
    expect(resolveTokenPx(tokens, '--gap-m')).toBe(20);
    expect(resolveTokenPx(tokens, '--gap-s')).toBe(12);
  });
});

describe('the Ingredients heading row that carries Show changes below 724 (261002-wn1; boards 393-show-changes-head.html and 723-show-changes-head.html)', () => {
  test('the board\'s three head rules sit at the top level, and no non-print media block names the head', () => {
    const head = ruleFor('.ingredient-table-region__head');
    expect(head, 'expected a top-level .ingredient-table-region__head rule').toBeTruthy();
    expect(head.declarations).toMatch(/display:\s*flex/);
    expect(head.declarations).toMatch(/align-items:\s*center/);
    expect(head.declarations).toMatch(/justify-content:\s*space-between/);
    expect(head.declarations).toMatch(/gap:\s*var\(--gap-s\)/);
    expect(head.declarations).toMatch(/margin:\s*0 0 var\(--gap-xs\)/);

    const name = ruleFor('.ingredient-table-region__head .region-name');
    expect(name, 'expected the head\'s .region-name rule').toBeTruthy();
    expect(name.declarations).toMatch(/margin:\s*0\s*;/);

    const control = ruleFor('.ingredient-table-region__head .text-control');
    expect(control, 'expected the head\'s .text-control rule').toBeTruthy();
    expect(control.declarations).toMatch(/flex:\s*none/);
    expect(control.declarations).toMatch(/font-weight:\s*400/);

    const inMedia = rules.filter((r) => r.media !== undefined && r.media !== 'print' && r.selector.includes('ingredient-table-region__head'));
    expect(inMedia).toEqual([]);
  });
});

// Sketch 011 decision 35 A (Mark, 2026-10-04; brief task 10; quick 261004-igr):
// in the pen the Sheet title is one field set as the Sheet heading, no box at
// rest, grown with its lines. Row A of sheet-title-pen.html.
describe('the Sheet title field in the pen (sketch 011 decision 35 A; quick 261004-igr)', () => {
  test('the field wears the heading face, size and weight, a 1.15 leading through a token, and never scrolls or resizes', () => {
    const rule = ruleFor('.headnote__sheet-title-field .prose-field');
    expect(rule, 'expected a .headnote__sheet-title-field .prose-field rule').toBeTruthy();
    const d = rule.declarations;
    expect(d).toMatch(/display:\s*block/);
    expect(d).toMatch(/font-family:\s*var\(--face-text\)/);
    expect(d).toMatch(/font-size:\s*var\(--sheet-size-recipe-name\)/);
    expect(d).toMatch(/font-weight:\s*700/);
    expect(d).toMatch(/line-height:\s*var\(--sheet-leading-title\)/);
    expect(d).toMatch(/resize:\s*none/);
    expect(d).toMatch(/overflow:\s*hidden/);
  });

  test('the old input rule is gone and the label no longer carries a top margin', () => {
    expect(rules.some((r) => r.selector === '.headnote__sheet-title-field .ink-field')).toBe(false);
    const label = ruleFor('.headnote__sheet-title-field');
    expect(label, 'expected the .headnote__sheet-title-field rule').toBeTruthy();
    expect(label.declarations).not.toMatch(/margin-top/);
  });

  test('--sheet-leading-title is 1.15', () => {
    expect(tokensSource).toMatch(/--sheet-leading-title:\s*1\.15\s*;/);
  });
});
