// shell.css's own token-discipline contract, mirroring home.test.js
// (03.4-03 Task 1). binder.test.js, cross-cutting.test.js and home.test.js
// never read this file — it is the shell's own stylesheet, with its own
// contract suite, so a rename or an addition elsewhere can never silently
// widen what shell.css is allowed to do.
//
// Same no-layout-engine caveat as every other style-contract suite: this
// runs under Vitest's default `node` environment and reads the source AS
// TEXT. It cannot prove a pixel rendered; that stays a real-browser human
// check.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { readAllRules, readCustomProperties } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const SHELL_CSS_PATH = path.join(STYLES_DIR, 'shell.css');
const MAIN_JSX_PATH = path.join(STYLES_DIR, '..', 'main.jsx');
const PLACEHOLDER_JSX_PATH = path.join(STYLES_DIR, '..', 'ui', 'Placeholder.jsx');
const TOKENS_CSS_PATH = path.join(STYLES_DIR, 'tokens.css');
const APP_CSS_PATH = path.join(STYLES_DIR, 'app.css');

const shellCssSource = readFileSync(SHELL_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');
const placeholderJsxSource = readFileSync(PLACEHOLDER_JSX_PATH, 'utf8');
const tokens = readCustomProperties(readFileSync(TOKENS_CSS_PATH, 'utf8'));
const appRules = readAllRules(readFileSync(APP_CSS_PATH, 'utf8'));

// readAllRules runs assertNoAtRules for us: a non-media at-rule, or an
// at-rule nested inside the one top-level @media block, throws here at
// import time rather than being silently mis-parsed.
const rules = readAllRules(shellCssSource);

// Three states, two literals (sketch 011 decision 33, quick 261004-ly8): below
// 724 the tab row and the scrolling header; from 724 to 1589 the sticky bar and
// the fly-out; from 1590 the rail (224 + 3 x 32 + 350 + 920 = 1590).
const FLYOUT_MEDIA = '(max-width: 1589.98px)';
const PHONE_MEDIA = '(max-width: 723.98px)';

describe('shell.css — no visual literal, every value a var() read', () => {
  test('no declaration contains a hex colour', () => {
    expect(shellCssSource).not.toMatch(/:[^;{}]*#[0-9a-fA-F]{3,8}/);
  });

  test('no declaration contains a bare px value', () => {
    for (const rule of rules) {
      expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
    }
  });

  // Two documented roots: .shell (the shell's own chrome — head, rail,
  // routed-page column) and .place (the unbuilt-place page Placeholder.jsx
  // renders inside .shell__main). Every selector in this file starts with
  // one or the other, bar the one root rule (html, scroll-padding-top only;
  // pinned below).
  test('every rule is scoped under the .shell or .place root', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(
        rule.selector.startsWith('.shell') || rule.selector.startsWith('.place') || rule.selector === 'html',
        `expected "${rule.selector}" to be scoped under .shell or .place`,
      ).toBe(true);
    }
  });

  test('.shell paints the App ground for every route it wraps (gap 3, route.md § 1)', () => {
    const rule = rules.find((r) => r.selector === '.shell' && r.media === undefined);
    expect(rule, 'expected a top-level .shell rule').toBeTruthy();
    expect(rule.declarations).toMatch(/background:\s*var\(--app-background\)/);
  });

  // The two allowed conditions, the rail's cut (1589.98, derived) and the
  // phone cut (723.98, a rung the ladder already has).
  test('the only @media conditions allowed in shell.css are the fly-out cut and the phone cut', () => {
    const mediaConditions = new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media));
    expect([...mediaConditions].sort()).toEqual([FLYOUT_MEDIA, PHONE_MEDIA].sort());
  });
});

describe('the rail reads board 170\'s own edge (G-03.4-7, board 170 line 30)', () => {
  test('.shell__rail declares the hairline right border reading --app-rule-row and --app-divider', () => {
    const rule = rules.find((r) => r.selector === '.shell__rail' && r.media === undefined);
    expect(rule, 'expected a top-level .shell__rail rule').toBeTruthy();
    expect(rule.declarations).toMatch(/border-right:\s*var\(--app-rule-row\)\s+solid\s+var\(--app-divider\)/);
  });

  test('.shell__rail declares a padding whose every value is a --gap- read', () => {
    const rule = rules.find((r) => r.selector === '.shell__rail' && r.media === undefined);
    expect(rule, 'expected a top-level .shell__rail rule').toBeTruthy();
    const paddingMatch = rule.declarations.match(/padding:\s*([^;]+);/);
    expect(paddingMatch, 'expected a padding declaration').toBeTruthy();
    const values = paddingMatch[1].trim().split(/\s+/);
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(value).toMatch(/^var\(--gap-/);
    }
  });

  test('.shell__rail declares box-sizing: border-box, so its padding and border cannot grow its 224px basis', () => {
    const rule = rules.find((r) => r.selector === '.shell__rail' && r.media === undefined);
    expect(rule, 'expected a top-level .shell__rail rule').toBeTruthy();
    expect(rule.declarations).toMatch(/box-sizing:\s*border-box/);
  });
});

describe('the bottom tab row (D-16, 03.4-03 Task 3)', () => {
  test('shell.css carries exactly two @media blocks, the fly-out before the phone, so the narrower wins later', () => {
    expect(shellCssSource.match(/@media/g)).toHaveLength(2);
    const flyoutAt = shellCssSource.indexOf(`@media ${FLYOUT_MEDIA}`);
    const phoneAt = shellCssSource.indexOf(`@media ${PHONE_MEDIA}`);
    expect(flyoutAt).toBeGreaterThan(-1);
    expect(phoneAt).toBeGreaterThan(flyoutAt);
  });

  test('the fly-out block holds only the rail\'s hiding rule and the open panel', () => {
    const flyoutRules = rules.filter((r) => r.media === FLYOUT_MEDIA);
    expect(flyoutRules.map((r) => r.selector).sort()).toEqual(['.shell__rail', '.shell__rail--open']);
    expect(flyoutRules.find((r) => r.selector === '.shell__rail').declarations).toMatch(/display:\s*none/);
    const open = flyoutRules.find((r) => r.selector === '.shell__rail--open').declarations;
    expect(open).toMatch(/display:\s*flex/);
    expect(open).toMatch(/position:\s*fixed/);
    expect(open).toMatch(/inset-block-start:\s*var\(--app-size-header-h\)/);
    expect(open).toMatch(/inset-block-end:\s*0/);
    expect(open).toMatch(/inset-inline-start:\s*0/);
    expect(open).toMatch(/z-index:\s*var\(--app-z-flyout\)/);
    expect(open).toMatch(/background:\s*var\(--app-background\)/);
    expect(open).toMatch(/box-shadow:\s*var\(--app-shadow-flyout\)/);
    expect(open).toMatch(/overflow-y:\s*auto/);
  });

  test('the media block holds only the tab row\'s own rules, the rail\'s hiding rule and the folded tools row', () => {
    const mediaRules = rules.filter((r) => r.media === PHONE_MEDIA);
    expect(mediaRules.length).toBeGreaterThan(0);
    for (const rule of mediaRules) {
      const selectors = rule.selector.split(',').map((s) => s.trim());
      for (const selector of selectors) {
        expect(
          selector === '.shell__rail' ||
            selector.startsWith('.shell__tabs') ||
            selector.startsWith('.shell__more') ||
            selector.startsWith('.shell__tools') ||
            selector === '.shell__main' ||
            selector === '.shell__head' ||
            selector === 'html',
          `expected "${selector}" to be the rail's hiding rule, the folded tools row, the scrolling header, the root's scroll padding or a tab-row rule`,
        ).toBe(true);
      }
    }
  });

  test('three states: the tab row is hidden by default, the fly-out block hides the rail, the phone block hides the rail and shows the tab row fixed to the bottom edge', () => {
    const defaultTabsRule = rules.find((r) => r.selector === '.shell__tabs' && r.media === undefined);
    expect(defaultTabsRule, 'expected a top-level .shell__tabs rule hiding it by default').toBeTruthy();
    expect(defaultTabsRule.declarations).toMatch(/display:\s*none/);

    const flyoutRailRule = rules.find((r) => r.selector === '.shell__rail' && r.media === FLYOUT_MEDIA);
    expect(flyoutRailRule, 'expected .shell__rail to hide inside the fly-out block').toBeTruthy();
    expect(flyoutRailRule.declarations).toMatch(/display:\s*none/);
    expect(rules.find((r) => r.selector === '.shell__tabs' && r.media === FLYOUT_MEDIA)).toBeUndefined();

    const mediaRailRule = rules.find((r) => r.selector === '.shell__rail' && r.media === PHONE_MEDIA);
    expect(mediaRailRule, 'expected .shell__rail to hide inside the phone block').toBeTruthy();
    expect(mediaRailRule.declarations).toMatch(/display:\s*none/);

    const mediaTabsRule = rules.find((r) => r.selector === '.shell__tabs' && r.media === PHONE_MEDIA);
    expect(mediaTabsRule, 'expected .shell__tabs to show, fixed, inside the media block').toBeTruthy();
    expect(mediaTabsRule.declarations).toMatch(/display:\s*flex/);
    expect(mediaTabsRule.declarations).toMatch(/position:\s*fixed/);
  });

  test('.shell__main carries a bottom padding matching the tab-row height token, so the fixed row never covers the end of a page', () => {
    const rule = rules.find((r) => r.selector === '.shell__main' && r.media === PHONE_MEDIA);
    expect(rule, 'expected a media-scoped .shell__main rule').toBeTruthy();
    expect(rule.declarations).toMatch(/padding-bottom:\s*var\(--app-size-tab-h\)/);
  });

  test('every tab and every item in the More list reads the touch minimum height inside the media block', () => {
    const rule = rules.find(
      (r) =>
        r.media === PHONE_MEDIA &&
        r.selector.includes('.shell__tabs .shell__place') &&
        r.selector.includes('.shell__more li'),
    );
    expect(rule, 'expected a media-scoped touch-target rule for the tabs and the More list').toBeTruthy();
    expect(rule.declarations).toMatch(/min-height:\s*var\(--touch-min\)/);
  });

  test('the tab row\'s five flex children — the four links and the More disclosure — each take an equal share of the bar (gap 1, 03.4-UI-REVIEW.md finding 1)', () => {
    const rule = rules.find(
      (r) =>
        r.media === PHONE_MEDIA &&
        r.selector.includes('.shell__tabs > .shell__place') &&
        r.selector.includes('.shell__tabs > .shell__more'),
    );
    expect(rule, 'expected a media-scoped per-item flex rule naming both child kinds').toBeTruthy();
    expect(rule.declarations).toMatch(/flex:\s*1 1 0/);
    expect(rule.declarations).toMatch(/min-width:\s*0/);
  });

  test('each tab reads icon over label, not beside it (board 171, Mark 2026-09-22)', () => {
    const rule = rules.find((r) => r.media === PHONE_MEDIA && r.selector === '.shell__tabs .shell__place');
    expect(rule, 'expected a media-scoped .shell__tabs .shell__place rule').toBeTruthy();
    expect(rule.declarations).toMatch(/flex-direction:\s*column/);
    expect(rule.declarations).toMatch(/font-size:\s*var\(--app-size-label\)/);
    expect(rule.declarations).toMatch(/box-sizing:\s*border-box/);
  });

  test('the bar is pinned to the tab-height token with border-box sizing (gap 1)', () => {
    const rule = rules.find((r) => r.media === PHONE_MEDIA && r.selector === '.shell__tabs');
    expect(rule, 'expected a media-scoped .shell__tabs rule').toBeTruthy();
    expect(rule.declarations).toMatch(/height:\s*var\(--app-size-tab-h\)/);
    expect(rule.declarations).toMatch(/box-sizing:\s*border-box/);
    expect(rule.declarations).toMatch(/position:\s*fixed/);
    expect(rule.declarations).toMatch(/display:\s*flex/);
  });

  test('More opens as a panel above the bar, not inline in the fixed row (D-16, gap 1)', () => {
    const rule = rules.find((r) => r.media === PHONE_MEDIA && r.selector === '.shell__more[open] > ul');
    expect(rule, 'expected a media-scoped rule for More\'s open list').toBeTruthy();
    expect(rule.declarations).toMatch(/position:\s*absolute/);
    expect(rule.declarations).toMatch(/inset-block-end:\s*100%/);
  });

  test('the header\'s Search/Import/Export controls fold away below the side-nav cut, and the tools row, the file input and the errors list keep no media-scoped hiding rule of their own (decision 3)', () => {
    const rule = rules.find((r) => r.media === PHONE_MEDIA && r.selector === '.shell__tools > .shell__place');
    expect(rule, 'expected a media-scoped .shell__tools > .shell__place rule').toBeTruthy();
    expect(rule.declarations).toMatch(/display:\s*none/);

    const mediaSelectors = rules.filter((r) => r.media === PHONE_MEDIA).map((r) => r.selector);
    expect(mediaSelectors).not.toContain('.shell__tools');
    expect(mediaSelectors).not.toContain('.shell__file-input');
    expect(mediaSelectors).not.toContain('.shell__import-errors');
  });
});

describe('the shell layout never becomes a containing block for .page-status (03.4-03 Task 1)', () => {
  // The recipe route's page-scoped notice (app.css's .page-status) anchors
  // to .page-status-anchor by position alone. Nesting RecipePageForRoute
  // one level deeper under the shell's Outlet must not interpose a new
  // containing block between them — any of these five properties on
  // .shell, .shell__body or .shell__main would do exactly that.
  //
  // overflow joins the list (sketch 011 decision 33, brief (a)): an overflow
  // other than visible on any ancestor of the sticky bar stops it sticking.
  test('.shell, .shell__body and .shell__main declare none of transform, filter, perspective, will-change, contain, overflow', () => {
    const forbidden = ['transform', 'filter', 'perspective', 'will-change', 'contain', 'overflow', 'overflow-x', 'overflow-y'];
    for (const selector of ['.shell', '.shell__body', '.shell__main']) {
      const rule = rules.find((r) => r.selector === selector);
      expect(rule, `expected a top-level ${selector} rule`).toBeTruthy();
      for (const prop of forbidden) {
        expect(rule.declarations).not.toMatch(new RegExp(`(^|[\\s;{])${prop}\\s*:`));
      }
    }
  });
});

describe('the five destinations plus Home each carry their own accent and companion (D-09, D-19, 03.4-03 Task 2)', () => {
  // { slug, wordToken, iconToken } — the text companion colours the word,
  // the destination's own accent colours the icon; Kitchen has no
  // companion, so both read the same indigo token (D-09).
  const expected = [
    { slug: 'home', wordToken: '--app-blue-text', iconToken: '--app-blue' },
    { slug: 'notebook', wordToken: '--app-notebook-text', iconToken: '--app-notebook' },
    { slug: 'recipe-book', wordToken: '--app-recipe-book-text', iconToken: '--app-recipe-book' },
    { slug: 'idea-log', wordToken: '--app-idea-log-text', iconToken: '--app-idea-log' },
    { slug: 'ingredients', wordToken: '--app-ingredients-text', iconToken: '--app-ingredients' },
    { slug: 'kitchen', wordToken: '--app-kitchen', iconToken: '--app-kitchen' },
  ];

  test.each(expected)('$slug: the word reads $wordToken, the icon reads $iconToken', ({ slug, wordToken, iconToken }) => {
    const wordRule = rules.find((r) => r.selector === `.shell__place--${slug}`);
    expect(wordRule, `expected a .shell__place--${slug} rule`).toBeTruthy();
    expect(wordRule.declarations).toMatch(new RegExp(`color:\\s*var\\(${wordToken}\\)`));

    const iconRule = rules.find((r) => r.selector === `.shell__place--${slug} svg`);
    expect(iconRule, `expected a .shell__place--${slug} svg rule`).toBeTruthy();
    expect(iconRule.declarations).toMatch(new RegExp(`stroke:\\s*var\\(${iconToken}\\)`));
  });
});

describe('the unbuilt place reads in the App\'s own voice (D-10, gap 2, CR-01)', () => {
  test('.place declares the App text colour and the grotesk face', () => {
    const rule = rules.find((r) => r.selector === '.place');
    expect(rule, 'expected a .place rule').toBeTruthy();
    expect(rule.declarations).toMatch(/color:\s*var\(--app-text\)/);
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
  });

  test('.place__title mirrors .home__title\'s role: the App title size and the grotesk face', () => {
    const rule = rules.find((r) => r.selector === '.place__title');
    expect(rule, 'expected a .place__title rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-size:\s*var\(--app-size-title\)/);
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
  });

  test('.place__note reads the App meta size in the secondary text colour', () => {
    const rule = rules.find((r) => r.selector === '.place__note');
    expect(rule, 'expected a .place__note rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-size:\s*var\(--app-size-meta\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--app-text-secondary\)/);
  });

  test('Placeholder.jsx renders each of the three classes exactly once, so none of the three rules can become an orphan again', () => {
    const rootMatches = placeholderJsxSource.match(/className="list-page place"/g) ?? [];
    const titleMatches = placeholderJsxSource.match(/\bplace__title\b/g) ?? [];
    const noteMatches = placeholderJsxSource.match(/\bplace__note\b/g) ?? [];
    expect(rootMatches).toHaveLength(1);
    expect(titleMatches).toHaveLength(1);
    expect(noteMatches).toHaveLength(1);
  });
});

describe('a focus ring that paints where :focus-visible never fires (G-03.4-4, .planning/debug/ipad-keyboard-no-focus-ring.md)', () => {
  test('exactly one rule in shell.css has a selector containing :focus, and it is .shell__place:focus, top-level', () => {
    const focusRules = rules.filter((r) => r.selector.includes(':focus'));
    expect(focusRules).toHaveLength(1);
    expect(focusRules[0].selector).toBe('.shell__place:focus');
    expect(focusRules[0].media).toBeUndefined();
  });

  test('.shell__place:focus declares both focus tokens', () => {
    const rule = rules.find((r) => r.selector === '.shell__place:focus' && r.media === undefined);
    expect(rule, 'expected a top-level .shell__place:focus rule').toBeTruthy();
    expect(rule.declarations).toMatch(/outline:\s*var\(--focus-outline-width\)/);
    expect(rule.declarations).toMatch(/outline-offset:\s*var\(--focus-outline-offset\)/);
  });

  test('no rule in shell.css declares outline: none, so the ring can always paint', () => {
    for (const rule of rules) {
      expect(rule.declarations).not.toMatch(/outline:\s*none/);
    }
  });
});

describe('one App radius on every place, the active rail place in weight 600 (sketch 011 decision 38 B, Mark 2026-10-04; quick 261004-ly7)', () => {
  test('the .shell__place base rule declares the App control radius, so the rail, the tab row, More and the tools all read it and a focus ring follows it', () => {
    const rule = rules.find((r) => r.selector === '.shell__place' && r.media === undefined);
    expect(rule, 'expected a top-level .shell__place rule').toBeTruthy();
    expect(rule.declarations).toMatch(/border-radius:\s*var\(--app-radius-control\)/);
  });

  test("the active rail place takes weight 600 (Mark's answer 2), scoped to .shell__rail as the board's own rule is", () => {
    const rule = rules.find((r) => r.selector === ".shell__rail .shell__place[aria-current='page']" && r.media === undefined);
    expect(rule, 'expected a top-level rail-scoped active-place rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-weight:\s*600/);
  });

  test("the active place keeps the subtle surface and carries no weight of its own, so the tab row keeps its shipped weight (Mark's answer 3)", () => {
    const rule = rules.find((r) => r.selector === ".shell__place[aria-current='page']" && r.media === undefined);
    expect(rule, 'expected a top-level active-place rule').toBeTruthy();
    expect(rule.declarations).toMatch(/background:\s*var\(--app-surface-subtle\)/);
    expect(rule.declarations).not.toMatch(/font-weight/);
  });

  test('only .shell__sprinkle and .shell__place declare a border-radius, and nothing in the media block declares a radius or a weight, so the tab row inherits the base radius at its shipped weight', () => {
    const radiused = rules.filter((r) => /(^|[\s;])border-radius\s*:/.test(r.declarations));
    expect(radiused.map((r) => r.selector).sort()).toEqual(['.shell__place', '.shell__sprinkle']);
    expect(radiused.find((r) => r.selector === '.shell__sprinkle').declarations).toMatch(/border-radius:\s*var\(--app-radius-sprinkle\)/);
    expect(radiused.find((r) => r.selector === '.shell__place').declarations).toMatch(/border-radius:\s*var\(--app-radius-control\)/);
    for (const rule of rules.filter((r) => r.media === PHONE_MEDIA)) {
      expect(rule.declarations).not.toMatch(/(^|[\s;])border-radius\s*:/);
      expect(rule.declarations).not.toMatch(/(^|[\s;])font-weight\s*:/);
    }
  });
});

describe('shell.css is wired in (main.jsx, home.test.js precedent)', () => {
  test('main.jsx imports shell.css after app.css', () => {
    const appCssIndex = mainJsxSource.indexOf('./styles/app.css');
    const shellCssIndex = mainJsxSource.indexOf('./styles/shell.css');
    expect(appCssIndex).toBeGreaterThan(-1);
    expect(shellCssIndex).toBeGreaterThan(-1);
    expect(appCssIndex).toBeLessThan(shellCssIndex);
  });
});

// The sticky header (sketch 011 decision 33, brief task 5; Mark, 2026-10-03:
// "so that the search, import and export stay on screen").
describe('the sticky App header and the wordmark link (decision 33, brief task 5; quick 261004-ly8)', () => {
  test('the top-level .shell__head is the sticky bar: opaque ground, hairline foot, one row', () => {
    const rule = rules.find((r) => r.selector === '.shell__head' && r.media === undefined);
    expect(rule, 'expected a top-level .shell__head rule').toBeTruthy();
    expect(rule.declarations).toMatch(/position:\s*sticky/);
    expect(rule.declarations).toMatch(/(^|[\s;])top:\s*0\s*;/);
    expect(rule.declarations).toMatch(/z-index:\s*var\(--app-z-header\)/);
    expect(rule.declarations).toMatch(/background:\s*var\(--app-background\)/);
    expect(rule.declarations).toMatch(/border-bottom:\s*var\(--app-rule-row\)\s+solid\s+var\(--app-divider\)/);
    expect(rule.declarations).toMatch(/padding:\s*var\(--gap-xs\)\s+var\(--gap-page\)/);
    expect(rule.declarations).toMatch(/flex-wrap:\s*nowrap/);
  });

  test('the phone block restores the scrolling header and zeroes the root scroll padding', () => {
    const head = rules.find((r) => r.selector === '.shell__head' && r.media === PHONE_MEDIA);
    expect(head, 'expected a media-scoped .shell__head rule').toBeTruthy();
    expect(head.declarations).toMatch(/position:\s*static/);
    expect(head.declarations).toMatch(/flex-wrap:\s*wrap/);
    expect(head.declarations).toMatch(/padding:\s*var\(--gap-s\)\s+var\(--gap-page\)/);
    expect(head.declarations).toMatch(/border-bottom:\s*none/);
    const root = rules.find((r) => r.selector === 'html' && r.media === PHONE_MEDIA);
    expect(root, 'expected a media-scoped html rule').toBeTruthy();
    expect(root.declarations).toMatch(/scroll-padding-top:\s*0/);
  });

  // The canvas guard of app.css (G-03.4-9), extended to this file: the one
  // html rule here takes scroll-padding-top and nothing else, so the root
  // element never gets a background and body's still reaches the canvas.
  test('exactly one top-level html rule exists, declaring scroll-padding-top alone and no background', () => {
    const htmlRules = rules.filter((r) => r.selector === 'html' && r.media === undefined);
    expect(htmlRules).toHaveLength(1);
    const declarations = htmlRules[0].declarations.split(';').map((d) => d.trim()).filter(Boolean);
    expect(declarations).toEqual(['scroll-padding-top: var(--app-size-header-h)']);
    for (const rule of rules.filter((r) => r.selector === 'html')) {
      expect(rule.declarations).not.toMatch(/background/);
    }
  });

  test('the header height is the 44px controls, 6px above and below and the 1px hairline, written once', () => {
    expect(tokens['--app-size-header-h']).toBe('calc(var(--touch-min) + 2 * var(--gap-xs) + var(--app-rule-row))');
  });

  test('the bar paints above the page notice, which reads a token', () => {
    expect(tokens['--app-z-notice']).toBe('10');
    const status = appRules.find((r) => r.selector === '.page-status');
    expect(status, 'expected app.css to carry .page-status').toBeTruthy();
    expect(status.declarations).toMatch(/z-index:\s*var\(--app-z-notice\)/);
    expect(Number(tokens['--app-z-header'])).toBeGreaterThan(Number(tokens['--app-z-notice']));
  });

  test('the wordmark link takes the App text colour and no underline, over the global link rules', () => {
    const rule = rules.find((r) => r.selector === '.shell__brand a' && r.media === undefined);
    expect(rule, 'expected a top-level .shell__brand a rule').toBeTruthy();
    expect(rule.declarations).toMatch(/color:\s*inherit/);
    expect(rule.declarations).toMatch(/text-decoration:\s*none/);
  });
});

// The fly-out's own rules (decision 33, brief task 6; nav-candidates.css G and
// GO): the menu button beside the wordmark, the scrim, and the z order.
describe('the menu button, the scrim and the z order (decision 33, quick 261004-ly8)', () => {
  const top = (selector) => rules.find((r) => r.selector === selector && r.media === undefined);

  test('.shell__lead holds the menu button and the wordmark on one line', () => {
    const rule = top('.shell__lead');
    expect(rule, 'expected a top-level .shell__lead rule').toBeTruthy();
    expect(rule.declarations).toMatch(/display:\s*flex/);
    expect(rule.declarations).toMatch(/align-items:\s*center/);
    expect(rule.declarations).toMatch(/gap:\s*var\(--gap-xs\)/);
  });

  test('.shell__menu is a 44px target pulled left by the bar\'s own 6px, with the App text colour', () => {
    const rule = top('.shell__menu');
    expect(rule, 'expected a top-level .shell__menu rule').toBeTruthy();
    expect(rule.declarations).toMatch(/(^|[\s;])width:\s*var\(--touch-min\)/);
    expect(rule.declarations).toMatch(/(^|[\s;])height:\s*var\(--touch-min\)/);
    expect(rule.declarations).toMatch(/padding:\s*0/);
    expect(rule.declarations).toMatch(/margin-inline-start:\s*calc\(-1 \* var\(--gap-xs\)\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--app-text\)/);
    expect(rule.declarations).toMatch(/border:\s*none/);
    expect(rule.declarations).toMatch(/background:\s*none/);
  });

  test('its dots stand upright: the icon size and the menu tilt token', () => {
    const rule = top('.shell__menu svg');
    expect(rule, 'expected a top-level .shell__menu svg rule').toBeTruthy();
    expect(rule.declarations).toMatch(/width:\s*var\(--app-size-icon\)/);
    expect(rule.declarations).toMatch(/height:\s*var\(--app-size-icon\)/);
    expect(rule.declarations).toMatch(/transform:\s*rotate\(var\(--app-tilt-menu\)\)/);
  });

  test('.shell__scrim runs from the bar\'s foot to the window\'s foot and dims the page', () => {
    const rule = top('.shell__scrim');
    expect(rule, 'expected a top-level .shell__scrim rule').toBeTruthy();
    expect(rule.declarations).toMatch(/position:\s*fixed/);
    expect(rule.declarations).toMatch(/inset-block-start:\s*var\(--app-size-header-h\)/);
    expect(rule.declarations).toMatch(/inset-block-end:\s*0/);
    expect(rule.declarations).toMatch(/inset-inline:\s*0/);
    expect(rule.declarations).toMatch(/z-index:\s*var\(--app-z-scrim\)/);
    expect(rule.declarations).toMatch(/background:\s*var\(--app-scrim\)/);
  });

  test('the z order: every literal z-index in app.css < scrim < fly-out < notice < bar', () => {
    const literals = [];
    for (const rule of appRules) {
      const match = rule.declarations.match(/z-index:\s*(-?\d+)\s*;/);
      if (match) literals.push(Number(match[1]));
    }
    expect(literals.length).toBeGreaterThan(0);
    expect(Math.max(...literals)).toBeLessThan(Number(tokens['--app-z-scrim']));
    expect(Number(tokens['--app-z-scrim'])).toBeLessThan(Number(tokens['--app-z-flyout']));
    expect(Number(tokens['--app-z-flyout'])).toBeLessThan(Number(tokens['--app-z-notice']));
    expect(Number(tokens['--app-z-notice'])).toBeLessThan(Number(tokens['--app-z-header']));
  });
});

// The rail from 1590, pinned under the bar (decision 33, brief task 6, "The
// rail"; the acceptance board is 1600-sticky-rail).
describe('the rail is pinned under the sticky bar from 1590 (decision 33; quick 261004-ly8)', () => {
  test('the top-level .shell__rail keeps its edge and adds the pin: sticky under the bar, the window less the bar tall, scrolling itself', () => {
    const rule = rules.find((r) => r.selector === '.shell__rail' && r.media === undefined);
    expect(rule, 'expected a top-level .shell__rail rule').toBeTruthy();
    expect(rule.declarations).toMatch(/border-right:\s*var\(--app-rule-row\)\s+solid\s+var\(--app-divider\)/);
    expect(rule.declarations).toMatch(/box-sizing:\s*border-box/);
    expect(rule.declarations).toMatch(/flex:\s*0 0 var\(--app-size-nav-w\)/);
    expect(rule.declarations).toMatch(/position:\s*sticky/);
    expect(rule.declarations).toMatch(/(^|[\s;])top:\s*var\(--app-size-header-h\)/);
    expect(rule.declarations).toMatch(/align-self:\s*flex-start/);
    expect(rule.declarations).toMatch(/(^|[\s;])height:\s*calc\(100vh - var\(--app-size-header-h\)\)/);
    expect(rule.declarations).toMatch(/overflow-y:\s*auto/);
  });

  test('the open fly-out panel runs between its two insets, not at the pinned rail\'s height', () => {
    const open = rules.find((r) => r.selector === '.shell__rail--open' && r.media === FLYOUT_MEDIA);
    expect(open, 'expected the open panel rule in the fly-out block').toBeTruthy();
    expect(open.declarations).toMatch(/(^|[\s;])height:\s*auto/);
  });
});
