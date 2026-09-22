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
import { readAllRules } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const SHELL_CSS_PATH = path.join(STYLES_DIR, 'shell.css');
const MAIN_JSX_PATH = path.join(STYLES_DIR, '..', 'main.jsx');
const PLACEHOLDER_JSX_PATH = path.join(STYLES_DIR, '..', 'ui', 'Placeholder.jsx');

const shellCssSource = readFileSync(SHELL_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');
const placeholderJsxSource = readFileSync(PLACEHOLDER_JSX_PATH, 'utf8');

// readAllRules runs assertNoAtRules for us: a non-media at-rule, or an
// at-rule nested inside the one top-level @media block, throws here at
// import time rather than being silently mis-parsed.
const rules = readAllRules(shellCssSource);

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
  // one or the other.
  test('every rule is scoped under the .shell or .place root', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(
        rule.selector.startsWith('.shell') || rule.selector.startsWith('.place'),
        `expected "${rule.selector}" to be scoped under .shell or .place`,
      ).toBe(true);
    }
  });

  test('.shell paints the App ground for every route it wraps (gap 3, route.md § 1)', () => {
    const rule = rules.find((r) => r.selector === '.shell' && r.media === undefined);
    expect(rule, 'expected a top-level .shell rule').toBeTruthy();
    expect(rule.declarations).toMatch(/background:\s*var\(--app-background\)/);
  });

  // The one allowed condition, the touch step-down (D-16) — any condition
  // this file ever carries must be exactly this string.
  test('the only @media condition allowed in shell.css is the named touch step-down', () => {
    const mediaConditions = new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media));
    for (const condition of mediaConditions) {
      expect(condition).toBe('(max-width: 759.98px)');
    }
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
  test('shell.css carries exactly one @media block', () => {
    expect(shellCssSource.match(/@media/g)).toHaveLength(1);
  });

  test('the media block holds only the tab row\'s own rules, the rail\'s hiding rule and the folded tools row', () => {
    const mediaRules = rules.filter((r) => r.media === '(max-width: 759.98px)');
    expect(mediaRules.length).toBeGreaterThan(0);
    for (const rule of mediaRules) {
      const selectors = rule.selector.split(',').map((s) => s.trim());
      for (const selector of selectors) {
        expect(
          selector === '.shell__rail' ||
            selector.startsWith('.shell__tabs') ||
            selector.startsWith('.shell__more') ||
            selector.startsWith('.shell__tools') ||
            selector === '.shell__main',
          `expected "${selector}" to be the rail's hiding rule, the folded tools row, or a tab-row rule`,
        ).toBe(true);
      }
    }
  });

  test('above the step the tab row is hidden, below it the rail is hidden and the tab row shows, fixed to the bottom edge', () => {
    const defaultTabsRule = rules.find((r) => r.selector === '.shell__tabs' && r.media === undefined);
    expect(defaultTabsRule, 'expected a top-level .shell__tabs rule hiding it by default').toBeTruthy();
    expect(defaultTabsRule.declarations).toMatch(/display:\s*none/);

    const mediaRailRule = rules.find((r) => r.selector === '.shell__rail' && r.media === '(max-width: 759.98px)');
    expect(mediaRailRule, 'expected .shell__rail to hide inside the media block').toBeTruthy();
    expect(mediaRailRule.declarations).toMatch(/display:\s*none/);

    const mediaTabsRule = rules.find((r) => r.selector === '.shell__tabs' && r.media === '(max-width: 759.98px)');
    expect(mediaTabsRule, 'expected .shell__tabs to show, fixed, inside the media block').toBeTruthy();
    expect(mediaTabsRule.declarations).toMatch(/display:\s*flex/);
    expect(mediaTabsRule.declarations).toMatch(/position:\s*fixed/);
  });

  test('.shell__main carries a bottom padding matching the tab-row height token, so the fixed row never covers the end of a page', () => {
    const rule = rules.find((r) => r.selector === '.shell__main' && r.media === '(max-width: 759.98px)');
    expect(rule, 'expected a media-scoped .shell__main rule').toBeTruthy();
    expect(rule.declarations).toMatch(/padding-bottom:\s*var\(--app-size-tab-h\)/);
  });

  test('every tab and every item in the More list reads the touch minimum height inside the media block', () => {
    const rule = rules.find(
      (r) =>
        r.media === '(max-width: 759.98px)' &&
        r.selector.includes('.shell__tabs .shell__place') &&
        r.selector.includes('.shell__more li'),
    );
    expect(rule, 'expected a media-scoped touch-target rule for the tabs and the More list').toBeTruthy();
    expect(rule.declarations).toMatch(/min-height:\s*var\(--touch-min\)/);
  });

  test('the tab row\'s five flex children — the four links and the More disclosure — each take an equal share of the bar (gap 1, 03.4-UI-REVIEW.md finding 1)', () => {
    const rule = rules.find(
      (r) =>
        r.media === '(max-width: 759.98px)' &&
        r.selector.includes('.shell__tabs > .shell__place') &&
        r.selector.includes('.shell__tabs > .shell__more'),
    );
    expect(rule, 'expected a media-scoped per-item flex rule naming both child kinds').toBeTruthy();
    expect(rule.declarations).toMatch(/flex:\s*1 1 0/);
    expect(rule.declarations).toMatch(/min-width:\s*0/);
  });

  test('each tab reads icon over label, not beside it (board 171, Mark 2026-09-22)', () => {
    const rule = rules.find((r) => r.media === '(max-width: 759.98px)' && r.selector === '.shell__tabs .shell__place');
    expect(rule, 'expected a media-scoped .shell__tabs .shell__place rule').toBeTruthy();
    expect(rule.declarations).toMatch(/flex-direction:\s*column/);
    expect(rule.declarations).toMatch(/font-size:\s*var\(--app-size-label\)/);
    expect(rule.declarations).toMatch(/box-sizing:\s*border-box/);
  });

  test('the bar is pinned to the tab-height token with border-box sizing (gap 1)', () => {
    const rule = rules.find((r) => r.media === '(max-width: 759.98px)' && r.selector === '.shell__tabs');
    expect(rule, 'expected a media-scoped .shell__tabs rule').toBeTruthy();
    expect(rule.declarations).toMatch(/height:\s*var\(--app-size-tab-h\)/);
    expect(rule.declarations).toMatch(/box-sizing:\s*border-box/);
    expect(rule.declarations).toMatch(/position:\s*fixed/);
    expect(rule.declarations).toMatch(/display:\s*flex/);
  });

  test('More opens as a panel above the bar, not inline in the fixed row (D-16, gap 1)', () => {
    const rule = rules.find((r) => r.media === '(max-width: 759.98px)' && r.selector === '.shell__more[open] > ul');
    expect(rule, 'expected a media-scoped rule for More\'s open list').toBeTruthy();
    expect(rule.declarations).toMatch(/position:\s*absolute/);
    expect(rule.declarations).toMatch(/inset-block-end:\s*100%/);
  });

  test('the header\'s Search/Import/Export controls fold away below the phone step, and the tools row, the file input and the errors list keep no media-scoped hiding rule of their own (decision 3)', () => {
    const rule = rules.find((r) => r.media === '(max-width: 759.98px)' && r.selector === '.shell__tools > .shell__place');
    expect(rule, 'expected a media-scoped .shell__tools > .shell__place rule').toBeTruthy();
    expect(rule.declarations).toMatch(/display:\s*none/);

    const mediaSelectors = rules.filter((r) => r.media === '(max-width: 759.98px)').map((r) => r.selector);
    expect(mediaSelectors).not.toContain('.shell__tools');
    expect(mediaSelectors).not.toContain('.shell__file-input');
    expect(mediaSelectors).not.toContain('.shell__import-errors');
  });
});

describe('the shell layout never becomes a containing block for .page-status (03.4-03 Task 1)', () => {
  // The recipe route's page-scoped notice (app.css's .page-status) anchors
  // to .page-head by position alone. Nesting RecipePageForRoute one level
  // deeper under the shell's Outlet must not interpose a new containing
  // block between them — any of these five properties on .shell,
  // .shell__body or .shell__main would do exactly that.
  test('.shell, .shell__body and .shell__main declare none of transform, filter, perspective, will-change, contain', () => {
    const forbidden = ['transform', 'filter', 'perspective', 'will-change', 'contain'];
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

describe('shell.css is wired in (main.jsx, home.test.js precedent)', () => {
  test('main.jsx imports shell.css after app.css', () => {
    const appCssIndex = mainJsxSource.indexOf('./styles/app.css');
    const shellCssIndex = mainJsxSource.indexOf('./styles/shell.css');
    expect(appCssIndex).toBeGreaterThan(-1);
    expect(shellCssIndex).toBeGreaterThan(-1);
    expect(appCssIndex).toBeLessThan(shellCssIndex);
  });
});
