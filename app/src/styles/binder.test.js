// The binder's own stylesheet contract (route-recipe.md § 6, § 8; D-13 to
// D-19) — read through the same css-source.js module columns.test.js
// reads, so the two suites can never disagree about what a rule says.
//
// This suite has no layout engine — it runs under Vitest's default `node`
// environment, and nothing here executes a browser's cascade. Every
// assertion below reads app.css and tokens.css AS TEXT and checks the
// contract they state; it proves the tokens and rules are internally
// consistent, never that a pixel rendered. In particular: it cannot prove
// the chevron draws two visible triangles, that the checkbox paints an
// ink square, that hovering a real control produces no visible jump, or
// that the calendar icon is actually hidden in a real Chromium/WebKit
// window — those stay real-browser human checks, deferred to the
// end-of-phase UAT per human_verify_mode: end-of-phase. The one place
// this phase knowingly falls short of the brief across every suite,
// human or automated: Firefox exposes no CSS hook to hide the native
// date input's calendar icon, so the icon stays visible there. The
// WebKit rule below is applied anyway — it costs nothing where Firefox
// simply matches no element — and the gap is accepted and recorded
// (03.1-03-PLAN.md planner decision 1), not silently claimed met.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { stripCssComments, readCustomProperties, resolveTokenPx, readAllRules, assertNoAtRules } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.join(STYLES_DIR, 'tokens.css');
const APP_CSS_PATH = path.join(STYLES_DIR, 'app.css');

const tokensSource = readFileSync(TOKENS_PATH, 'utf8');
const appCssSource = readFileSync(APP_CSS_PATH, 'utf8');

const tokens = readCustomProperties(tokensSource);
const rules = readAllRules(appCssSource);

function ruleFor(selector) {
  return rules.find((r) => r.selector === selector);
}

describe('the outline split — focus reads heavier than state (D-14, 03.3.1.1 tenth round)', () => {
  test('exactly three rules declare outline through --focus-outline-width: the global :focus-visible rule, the landing-focus exception, and the battery\'s focus-on-box rule (D-14, D-07, 03.3-06, G-03.3-1)', () => {
    // `.is-landing-focus:focus` is a documented, self-clearing exception
    // (VersionRow.jsx): the fork's landing .focus() call follows a
    // mouse-driven Save click, so Chrome's :focus-visible heuristic draws
    // no ring for it. The third is the ring drawn on a label-wrapped
    // radio's visible box (D-07, 007 line 24): a stop or a segmented
    // option is a <label>, so the ring reads through :has() on the
    // opacity-0 radio's own :focus-visible, never on the input itself.
    const matches = rules.filter((r) => /outline:\s*var\(--focus-outline-width\)/.test(r.declarations));
    expect(matches.map((r) => r.selector)).toEqual([
      ':focus-visible',
      '.is-landing-focus:focus',
      ".axis-mark__stop:has(input[type='radio']:focus-visible), .segmented__option:has(input[type='radio']:focus-visible)",
    ]);
  });

  test('--focus-outline-width resolves to --rule-hover (2), strictly heavier than --rule-baseline (1.5) and --rule-graduation (1) (D-14, 03.3.1.1 tenth round)', () => {
    const focusWidth = resolveTokenPx(tokens, '--focus-outline-width');
    const hover = resolveTokenPx(tokens, '--rule-hover');
    const baseline = resolveTokenPx(tokens, '--rule-baseline');
    const graduation = resolveTokenPx(tokens, '--rule-graduation');
    expect(focusWidth).toBeTypeOf('number');
    expect(focusWidth).toBe(hover);
    expect(focusWidth).toBeGreaterThan(baseline);
    expect(focusWidth).toBeGreaterThan(graduation);
  });

  test("`.headnote__show-changes[aria-pressed='true']` declares its outline at --rule-graduation, not focus weight (D-14)", () => {
    const rule = ruleFor(".headnote__show-changes[aria-pressed='true']");
    expect(rule, 'expected the pressed show-changes rule').toBeTruthy();
    expect(rule.declarations).toMatch(/outline:\s*var\(--rule-graduation\)\s*solid\s*var\(--ink\)/);
  });

  test('`.version-strip__item.is-current` declares its outline at --rule-graduation, not focus weight (D-14)', () => {
    const rule = ruleFor('.version-strip__item.is-current');
    expect(rule, 'expected the current version-strip item rule').toBeTruthy();
    expect(rule.declarations).toMatch(/outline:\s*var\(--rule-graduation\)\s*solid\s*var\(--ink\)/);
  });

  test('`.ingredient-table tbody tr.is-marked` declares its outline at --rule-graduation, not focus weight (D-14)', () => {
    const rule = ruleFor('.ingredient-table tbody tr.is-marked');
    expect(rule, 'expected the marked-row rule').toBeTruthy();
    expect(rule.declarations).toMatch(/outline:\s*var\(--rule-graduation\)\s*solid\s*var\(--ink\)/);
  });

  test('`.batch-margin__list li.is-open` declares its outline at --rule-graduation, not focus weight (D-14)', () => {
    const rule = ruleFor('.batch-margin__list li.is-open');
    expect(rule, 'expected the open-batch rule').toBeTruthy();
    expect(rule.declarations).toMatch(/outline:\s*var\(--rule-graduation\)\s*solid\s*var\(--ink\)/);
  });

  test('no rule declares outline: none, so the global focus rule can always paint (D-14)', () => {
    for (const rule of rules) {
      expect(rule.declarations).not.toMatch(/outline:\s*none/);
    }
  });
});

describe('buttons and selects — ink hairline, no fill, no radius, dashed when disabled (D-13, D-16)', () => {
  test('the `button, select` rule declares appearance: none, border-radius: 0 and no fill (D-13)', () => {
    const rule = ruleFor('button, select');
    expect(rule, 'expected a `button, select` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/appearance:\s*none/);
    expect(rule.declarations).toMatch(/border-radius:\s*0/);
    expect(rule.declarations).toMatch(/background:\s*none/);
  });

  test('the disabled rule declares a dashed border and no colour but inherit (D-13)', () => {
    const rule = ruleFor('button:disabled, select:disabled');
    expect(rule, 'expected a `button:disabled, select:disabled` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/border-style:\s*dashed/);
    expect(rule.declarations).toMatch(/color:\s*inherit/);
    expect(rule.declarations).not.toMatch(/color:\s*var\(/);
  });

  test("hovering a button or select costs no movement — border-plus-padding is equal at rest and on hover (D-15)", () => {
    const rest = ruleFor('button, select');
    const hover = ruleFor('button:hover, select:hover');
    expect(rest, 'expected the rest-state button, select rule').toBeTruthy();
    expect(hover, 'expected the button:hover, select:hover rule').toBeTruthy();

    expect(rest.declarations).toMatch(/border:\s*var\(--rule-ink-field\)\s*solid\s*var\(--ink\)/);
    expect(rest.declarations).toMatch(
      /padding:\s*calc\(var\(--gap-xs\)\s*\+\s*var\(--rule-hover\)\s*-\s*var\(--rule-ink-field\)\)/,
    );
    expect(hover.declarations).toMatch(/border-width:\s*var\(--rule-hover\)/);
    expect(hover.declarations).toMatch(/padding:\s*var\(--gap-xs\)/);

    const gapXs = resolveTokenPx(tokens, '--gap-xs');
    const ruleHover = resolveTokenPx(tokens, '--rule-hover');
    const ruleInkField = resolveTokenPx(tokens, '--rule-ink-field');
    const restTotal = ruleInkField + (gapXs + ruleHover - ruleInkField);
    const hoverTotal = ruleHover + gapXs;
    expect(restTotal).toBe(hoverTotal);
  });
});

describe('the drawn checkbox (D-13)', () => {
  test("`input[type='checkbox']` declares appearance: none, drawn as an ink square (D-13)", () => {
    const rule = ruleFor("input[type='checkbox']");
    expect(rule, "expected an input[type='checkbox'] rule").toBeTruthy();
    expect(rule.declarations).toMatch(/appearance:\s*none/);
    expect(rule.declarations).toMatch(/border:\s*var\(--rule-graduation\)\s*solid\s*var\(--ink\)/);
  });

  test("`input[type='checkbox']:checked` declares an ink background (D-13)", () => {
    const rule = ruleFor("input[type='checkbox']:checked");
    expect(rule, "expected an input[type='checkbox']:checked rule").toBeTruthy();
    expect(rule.declarations).toMatch(/background:\s*var\(--ink\)/);
  });
});

describe('spinners, the calendar icon, and growing prose fields (D-19, D-13 § 8)', () => {
  test('the webkit spin-button pseudo-elements are hidden (D-19)', () => {
    const rule = rules.find(
      (r) => r.selector.includes("::-webkit-inner-spin-button") && r.selector.includes("::-webkit-outer-spin-button"),
    );
    expect(rule, 'expected the webkit spin-button rule').toBeTruthy();
    expect(rule.declarations).toMatch(/-webkit-appearance:\s*none/);
  });

  test("`input[type='number']` switches Firefox to the textfield appearance (D-19)", () => {
    const rule = ruleFor("input[type='number']");
    expect(rule, "expected an input[type='number'] rule").toBeTruthy();
    expect(rule.declarations).toMatch(/-moz-appearance:\s*textfield/);
  });

  test('the date input hides its calendar-picker indicator in Chromium/WebKit — the accepted Firefox gap (D-13)', () => {
    const rule = ruleFor("input[type='date']::-webkit-calendar-picker-indicator");
    expect(rule, 'expected the calendar-picker-indicator rule').toBeTruthy();
    expect(rule.declarations).toMatch(/display:\s*none/);
  });

  test('SR-6: the date ink-field drops the native control appearance, so the author box model applies on WebKit (260916-0d4)', () => {
    // This assertion exists because the test engine cannot reproduce what it
    // guards. Chromium reports the churn date at 44px/border-box with or
    // without this rule; only WebKit renders the native control and discards
    // the author box model wholesale. Measured on Mark's iPad (iPadOS 18.7,
    // WebKit 605.1.15, 1366 coarse): without it the field read 35px tall,
    // min-height 29px, content-box, 142px wide — 9px shorter than the three
    // text fields beside it. Deleting this rule will not fail anything you
    // can see locally; it will silently restore a defect only the device shows.
    const rule = ruleFor("input[type='date'].ink-field");
    expect(rule, "expected the input[type='date'].ink-field rule").toBeTruthy();
    expect(rule.declarations).toMatch(/-webkit-appearance:\s*none/);
    expect(rule.declarations).toMatch(/(^|[^-])appearance:\s*none/);
  });

  test('`textarea` grows with its text and carries no resize grip (D-13 § 8)', () => {
    const rule = ruleFor('textarea');
    expect(rule, 'expected a `textarea` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/resize:\s*none/);
    expect(rule.declarations).toMatch(/field-sizing:\s*content/);
  });
});

describe('links — a hairline underline everywhere, visited reads the same (D-18)', () => {
  test('the global `a` rule declares an underline in ink (D-18)', () => {
    const rule = ruleFor('a');
    expect(rule, 'expected a global `a` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/text-decoration:\s*underline/);
    expect(rule.declarations).toMatch(/color:\s*var\(--ink\)/);
  });

  test('`a:visited` reads the same ink colour as unvisited (D-18)', () => {
    const rule = ruleFor('a:visited');
    expect(rule, 'expected an `a:visited` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/color:\s*var\(--ink\)/);
  });

  test('no selector other than `a`/`.text-control` declares an underline (D-18, D-04, 03.1 Gap 1 override; 03.3.1.1 tenth round)', () => {
    // A picked control is a fill (D-04): the battery's checked/pressed
    // states no longer carry bold plus underline plus outline — nothing
    // is bold, nothing is underlined, no outline draws on a picked
    // control. Only a link or a text control is underlined now.
    const underlineRules = rules.filter((r) => /text-decoration:\s*underline/.test(r.declarations));
    expect(underlineRules.map((r) => r.selector)).toEqual(['.text-control', 'a']);
  });
});

// The underline-only opt-out from the button/select binder above (sketch
// 003 variant B, 03.1 Gap 1 override): no border, an ink underline
// reading the same token pair the `a` rule already uses for its own.
describe('.text-control — the underline-only opt-out from the binder (03.1 Gap 1 override)', () => {
  test('the `.text-control` rule declares no border and an underline at --rule-ink-field', () => {
    const rule = ruleFor('.text-control');
    expect(rule, 'expected a `.text-control` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/border:\s*none/);
    expect(rule.declarations).toMatch(/text-decoration:\s*underline/);
    expect(rule.declarations).toMatch(/text-decoration-thickness:\s*var\(--rule-ink-field\)/);
  });

  test('`.text-control:hover` thickens its underline to --rule-baseline, mirroring the button/select hover step', () => {
    const rule = ruleFor('.text-control:hover');
    expect(rule, 'expected a `.text-control:hover` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/text-decoration-thickness:\s*var\(--rule-baseline\)/);
  });

  test('`.text-control:disabled` declares a dashed underline and repeats border: none / padding: 0 for specificity', () => {
    const rule = ruleFor('.text-control:disabled');
    expect(rule, 'expected a `.text-control:disabled` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/text-decoration-style:\s*dashed/);
    expect(rule.declarations).toMatch(/border:\s*none/);
    expect(rule.declarations).toMatch(/padding:\s*0/);
  });
});

describe('no visual literal — every value is a var() read (D-13)', () => {
  test('no declaration contains a hex colour', () => {
    expect(appCssSource).not.toMatch(/:[^;{}]*#[0-9a-fA-F]{3,8}/);
  });

  test('no declaration contains a bare px value outside a calc() over tokens', () => {
    for (const rule of rules) {
      expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
    }
  });

  test('the only at-rules in app.css are the six named top-level @media blocks (260912-ti1; 03.3.1-06 Task 2; 03.3.1.1-01 Task 1; 03.3.1.1-03 Task 1; 260915-x6n; the 009 wide-touch block)', () => {
    // Replaces the old "no at-rule was added" assertion (WR-02): the
    // stylesheet reader (css-source.js) parses one level of @media
    // nesting, and this pins the file to that contract — exactly the
    // five sibling media blocks the responsive ladder and forced colours
    // need (the 1099.98px page-shell stack, D-15; the touch union
    // "(max-width: 759.98px), (pointer: coarse)"; the width-only 759.98px
    // layout block the version row keeps; the 600px block; and
    // forced-colors: active, last), never
    // nested inside one another — assertNoAtRules throws on a non-media
    // at-rule and on anything nested inside a media block — and no other
    // at-rule keyword anywhere. Comment-stripped first, matching
    // readAllRules' own internal call: an English comment can
    // legitimately say "@supports" without that being a real at-rule.
    const stripped = stripCssComments(appCssSource);
    expect(stripped.match(/@media\b/g)).toHaveLength(6);
    expect(() => assertNoAtRules(stripped)).not.toThrow();
    const mediaRules = rules.filter((r) => r.media !== undefined);
    expect(mediaRules.length).toBeGreaterThan(0);
    const allowedMedia = [
      '(max-width: 759.98px), (pointer: coarse)',
      '(max-width: 1099.98px)',
      '(max-width: 759.98px)',
      '(max-width: 600px)',
      '(min-width: 760px) and (pointer: coarse)',
      '(forced-colors: active)',
    ];
    for (const rule of mediaRules) {
      expect(allowedMedia).toContain(rule.media);
    }
  });
});

describe('the picked state is a fill (D-04, sketch 007 lines 49 and 83)', () => {
  test('the shared fill selector declares the pen-blue fill, ground text and z-index 1', () => {
    const rule = ruleFor(
      ".axis-mark__stop:has(input[type='radio']:checked), .segmented__option:has(input[type='radio']:checked)",
    );
    expect(rule, 'expected the grouped fill rule').toBeTruthy();
    expect(rule.declarations).toMatch(/background:\s*var\(--pen-blue\)/);
    expect(rule.declarations).toMatch(/border-color:\s*var\(--pen-blue\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--ground\)/);
    expect(rule.declarations).toMatch(/z-index:\s*1/);
  });

  test('no rule declares both bold weight and an underline together', () => {
    for (const rule of rules) {
      const bold = /font-weight:\s*700/.test(rule.declarations);
      const underlined = /text-decoration:\s*underline/.test(rule.declarations);
      expect(bold && underlined).toBe(false);
    }
  });

  test('no selector reads aria-invalid — invalid is a sentence, never a ring', () => {
    for (const rule of rules) {
      expect(rule.selector).not.toMatch(/aria-invalid/);
    }
  });

  test('the forced-colors block keeps a fill and reserves CanvasText for the focus ring', () => {
    const forcedRules = rules.filter((r) => r.media === '(forced-colors: active)');
    expect(forcedRules.length).toBeGreaterThan(0);
    const fillRule = forcedRules.find(
      (r) => /forced-color-adjust:\s*none/.test(r.declarations) && /background:\s*Highlight/.test(r.declarations),
    );
    expect(fillRule, 'expected a forced-colors rule with forced-color-adjust: none and background: Highlight').toBeTruthy();
    const ringRule = forcedRules.find((r) => /outline-color:\s*CanvasText/.test(r.declarations));
    expect(ringRule, 'expected a forced-colors rule with outline-color: CanvasText').toBeTruthy();
  });

  test('a defect is a square and a word: the square fills pen blue when pressed, the button itself never does', () => {
    const beforeRule = ruleFor('.chip-toggle::before');
    expect(beforeRule, 'expected a .chip-toggle::before rule').toBeTruthy();
    expect(beforeRule.declarations).toMatch(/width:\s*var\(--size-lead-mark\)/);
    expect(beforeRule.declarations).toMatch(/border:\s*var\(--rule-graduation\)/);
    const pressedBeforeRule = ruleFor(".chip-toggle[aria-pressed='true']::before");
    expect(pressedBeforeRule, "expected a .chip-toggle[aria-pressed='true']::before rule").toBeTruthy();
    expect(pressedBeforeRule.declarations).toMatch(/background:\s*var\(--pen-blue\)/);
    expect(ruleFor(".chip-toggle[aria-pressed='true']")).toBeUndefined();
  });
});
