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
const MAIN_JSX_PATH = path.join(STYLES_DIR, '..', 'main.jsx');

const tokensSource = readFileSync(TOKENS_PATH, 'utf8');
const appCssSource = readFileSync(APP_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');

const tokens = readCustomProperties(tokensSource);
const rules = readAllRules(appCssSource);
const historyRules = readAllRules(readFileSync(path.join(STYLES_DIR, 'history.css'), 'utf8'));

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

  test("Show changes is a square and a word now, not bold-plus-outline: no `.headnote__show-changes[aria-pressed='true']` rule exists, the leading square fills pen blue, and the button itself never fills or bolds (one fill for every on state, 2026-09-16)", () => {
    expect(ruleFor(".headnote__show-changes[aria-pressed='true']")).toBeUndefined();

    const pressedBeforeRule = ruleFor(".text-toggle[aria-pressed='true']::before");
    expect(pressedBeforeRule, "expected a .text-toggle[aria-pressed='true']::before rule").toBeTruthy();
    expect(pressedBeforeRule.declarations).toMatch(/background:\s*var\(--sheet-pen-blue\)/);
    expect(pressedBeforeRule.declarations).toMatch(/border-color:\s*var\(--sheet-pen-blue\)/);

    // css-source.js stores a grouped selector as one normalised string, so
    // the paired underline rule below is keyed as the whole comma-joined
    // pair — an exact-match lookup on the bare selector would return
    // undefined whether or not the rule exists. Filter instead.
    const buttonRules = rules.filter(
      (r) => r.selector.includes(".text-toggle[aria-pressed='true']") && !r.selector.includes('::before'),
    );
    expect(buttonRules).toHaveLength(1);
    expect(buttonRules[0].selector).toBe(
      ".text-toggle[aria-pressed='true'], .text-toggle[aria-pressed='true']:hover",
    );
    expect(buttonRules[0].declarations).toMatch(/text-decoration-thickness:\s*var\(--rule-ink-field\)/);
    expect(buttonRules[0].declarations).not.toMatch(/background/);
    expect(buttonRules[0].declarations).not.toMatch(/font-weight/);
    expect(buttonRules[0].declarations).not.toMatch(/outline/);
  });

  test('`.history-item.is-current` declares its outline at --rule-graduation, not focus weight (D-14)', () => {
    const rule = historyRules.find((r) => r.selector === '.history-item.is-current');
    expect(rule, 'expected the current history-register item rule').toBeTruthy();
    expect(rule.declarations).toMatch(/outline:\s*var\(--rule-graduation\)\s*solid\s*var\(--sheet-ink\)/);
  });

  test('`.ingredient-table tbody tr.is-marked` declares its outline at --rule-graduation, not focus weight (D-14)', () => {
    const rule = ruleFor('.ingredient-table tbody tr.is-marked');
    expect(rule, 'expected the marked-row rule').toBeTruthy();
    expect(rule.declarations).toMatch(/outline:\s*var\(--rule-graduation\)\s*solid\s*var\(--sheet-ink\)/);
  });

  test('`.batch-margin__list li.is-open` declares its outline at --rule-graduation, not focus weight (D-14)', () => {
    const rule = ruleFor('.batch-margin__list li.is-open');
    expect(rule, 'expected the open-batch rule').toBeTruthy();
    expect(rule.declarations).toMatch(/outline:\s*var\(--rule-graduation\)\s*solid\s*var\(--sheet-ink\)/);
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

    expect(rest.declarations).toMatch(/border:\s*var\(--rule-ink-field\)\s*solid\s*var\(--sheet-ink\)/);
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
  test("`input[type='checkbox']` declares appearance: none, drawn as a square, border-box so the border never adds onto the declared 13px, and a shrink guard for the two flex labels that hold it (D-13)", () => {
    const rule = ruleFor("input[type='checkbox']");
    expect(rule, "expected an input[type='checkbox'] rule").toBeTruthy();
    expect(rule.declarations).toMatch(/appearance:\s*none/);
    expect(rule.declarations).toMatch(/border:\s*var\(--rule-graduation\)\s*solid\s*var\(--sheet-ink\)/);
    expect(rule.declarations).toMatch(/box-sizing:\s*border-box/);
    expect(rule.declarations).toMatch(/flex:\s*0 0 auto/);
  });

  test("`input[type='checkbox']:hover` thickens the border to --rule-hover", () => {
    const rule = ruleFor("input[type='checkbox']:hover");
    expect(rule, "expected an input[type='checkbox']:hover rule").toBeTruthy();
    expect(rule.declarations).toMatch(/border-width:\s*var\(--rule-hover\)/);
  });

  test("a checked checkbox fills pen blue with a matching border, not ink (one fill for every on state, 2026-09-16)", () => {
    const rule = ruleFor("input[type='checkbox']:checked");
    expect(rule, "expected an input[type='checkbox']:checked rule").toBeTruthy();
    expect(rule.declarations).toMatch(/background:\s*var\(--sheet-pen-blue\)/);
    expect(rule.declarations).toMatch(/border-color:\s*var\(--sheet-pen-blue\)/);
  });

  test("a checked checkbox repaints in the forced-colors block", () => {
    const forcedRules = rules.filter((r) => r.media === '(forced-colors: active)');
    const fillRule = forcedRules.find((r) => r.selector.includes("input[type='checkbox']:checked"));
    expect(fillRule, 'expected input[type=\'checkbox\']:checked among the forced-colors selectors').toBeTruthy();
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
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-ink\)/);
  });

  test('`:where(a:visited)` reads the same ink colour as unvisited, at zero specificity (gap 4)', () => {
    const rule = ruleFor(':where(a:visited)');
    expect(rule, 'expected a `:where(a:visited)` rule').toBeTruthy();
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-ink\)/);
  });

  // The cascade outcome this rewrite buys — a single-class App rule
  // outranking the visited pseudo-class — cannot be proven under Vitest's
  // `node` environment (no layout engine, no cascade). It is proven
  // instead by construction, from three pins that together establish it:
  // this one (the app's only visited selector carries zero specificity),
  // shell.test.js's per-destination .shell__place--* colour pins, and
  // home.test.js's .home__action / .home__action--secondary colour pins
  // — all single-class selectors, which is what outranks a zero-specificity
  // :where() wrapper regardless of source order.
  test('app.css\'s only visited selector is the zero-specificity one (gap 4)', () => {
    const visitedRules = rules.filter((r) => /:visited\b/.test(r.selector));
    expect(visitedRules.map((r) => r.selector)).toEqual([':where(a:visited)']);
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

  test('the only at-rules in app.css are the seven named top-level @media blocks (260912-ti1; 03.3.1-06 Task 2; 03.3.1.1-01 Task 1; 03.3.1.1-03 Task 1; 260915-x6n; the 009 wide-touch block; 260917-ewf print)', () => {
    // Replaces the old "no at-rule was added" assertion (WR-02): the
    // stylesheet reader (css-source.js) parses one level of @media
    // nesting, and this pins the file to that contract — exactly the
    // six sibling media blocks the responsive ladder and forced colours
    // need (the 1099.98px page-shell stack, D-15; the touch union
    // "(max-width: 759.98px), (pointer: coarse)"; the width-only 759.98px
    // layout block the version row keeps; the 600px block; and
    // forced-colors: active), plus the print layer last — one rule,
    // suppressing only the page notice — never
    // nested inside one another — assertNoAtRules throws on a non-media
    // at-rule and on anything nested inside a media block — and no other
    // at-rule keyword anywhere. Comment-stripped first, matching
    // readAllRules' own internal call: an English comment can
    // legitimately say "@supports" without that being a real at-rule.
    const stripped = stripCssComments(appCssSource);
    expect(stripped.match(/@media\b/g)).toHaveLength(7);
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
      'print',
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
    expect(rule.declarations).toMatch(/background:\s*var\(--sheet-pen-blue\)/);
    expect(rule.declarations).toMatch(/border-color:\s*var\(--sheet-pen-blue\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-ground\)/);
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
    expect(beforeRule.declarations).toMatch(/width:\s*var\(--sheet-size-lead-mark\)/);
    expect(beforeRule.declarations).toMatch(/border:\s*var\(--rule-graduation\)/);
    const pressedBeforeRule = ruleFor(".chip-toggle[aria-pressed='true']::before");
    expect(pressedBeforeRule, "expected a .chip-toggle[aria-pressed='true']::before rule").toBeTruthy();
    expect(pressedBeforeRule.declarations).toMatch(/background:\s*var\(--sheet-pen-blue\)/);
    expect(ruleFor(".chip-toggle[aria-pressed='true']")).toBeUndefined();
  });
});

// The canvas guard (G-03.4-9, commit 4105848): replaces the guard that
// commit deleted alongside the only rule that ever painted the App ground
// at a canvas-propagating level. The elastic-overscroll region paints the
// CSS canvas from the BODY element's own background, never a descendant's
// — see .planning/debug/ios-overscroll-cream-on-app-routes.md for the
// measured variants. This suite cannot render a canvas (no layout engine),
// so it pins the source-level precondition: body carries the App ground,
// the two paper frames hand it back via :has() (the running head, a third
// trigger, retired 03.5-02 Task 3), and no rule anywhere declares a
// background for the root element on its own, which is the one change
// that would stop body's background from reaching the canvas.
describe('the canvas is per context, on body, not a descendant (G-03.4-9, commit 4105848)', () => {
  test('the top-level body rule declares the App ground', () => {
    const rule = rules.find((r) => r.selector === 'body' && r.media === undefined);
    expect(rule, 'expected a top-level body rule').toBeTruthy();
    expect(rule.declarations).toMatch(/background:\s*var\(--app-background\)/);
  });

  test('a top-level rule hands the canvas back to the Sheet cream for both paper frames', () => {
    const rule = rules.find((r) => r.selector.startsWith('body:has(') && r.media === undefined);
    expect(rule, 'expected a top-level body:has(...) rule').toBeTruthy();
    expect(rule.declarations).toMatch(/background:\s*var\(--sheet-ground\)/);
    expect(rule.selector).toMatch(/\.recipe-page/);
    expect(rule.selector).toMatch(/\.not-found/);
    expect(rule.selector).not.toMatch(/\.page-head/);
  });

  test('no rule in app.css declares a background for the root element on its own — that would cancel body\'s propagation to the canvas', () => {
    for (const rule of rules) {
      const parts = rule.selector.split(',').map((s) => s.trim());
      for (const part of parts) {
        expect(part, `expected no selector matching the root element alone, found "${part}"`).not.toMatch(/^html(\b|[.:#[]|$)/);
      }
    }
  });
});

// The boot line (G-03.4-1, .planning/debug/ipad-page-load-seconds.md): the
// one thing painted before the shell exists, on body's own ground, before
// IndexedDB is ever awaited. Pinned beside the canvas guard above so
// neither this rule nor main.jsx's rendering of it can quietly drift
// apart — an orphaned rule with no renderer, or a renderer whose class no
// longer matches any rule, would both silently lose the fix.
describe('the boot line paints before the store opens (G-03.4-1)', () => {
  test('an .app-boot rule exists and every value it declares is a var() read', () => {
    const rule = ruleFor('.app-boot');
    expect(rule, 'expected a top-level .app-boot rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
    expect(rule.declarations).toMatch(/font-size:\s*var\(--app-size-meta\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--app-text-secondary\)/);
    expect(rule.declarations).toMatch(/padding:\s*var\(--gap-page\)/);
  });

  test('main.jsx carries the app-boot class exactly twice — the boot line and the store-open failure message', () => {
    const matches = mainJsxSource.match(/app-boot/g) || [];
    expect(matches).toHaveLength(2);
  });
});
