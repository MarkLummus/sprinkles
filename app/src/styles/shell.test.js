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

const shellCssSource = readFileSync(SHELL_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');

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

  // shell.css does not yet carry a media block (Task 3 adds the one
  // allowed condition, the touch step-down); this guard is written now so
  // any condition this file ever gains must be that exact string.
  test('the only @media condition allowed in shell.css is the named touch step-down', () => {
    const mediaConditions = new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media));
    for (const condition of mediaConditions) {
      expect(condition).toBe('(max-width: 759.98px)');
    }
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

describe('shell.css is wired in (main.jsx, home.test.js precedent)', () => {
  test('main.jsx imports shell.css after app.css', () => {
    const appCssIndex = mainJsxSource.indexOf('./styles/app.css');
    const shellCssIndex = mainJsxSource.indexOf('./styles/shell.css');
    expect(appCssIndex).toBeGreaterThan(-1);
    expect(shellCssIndex).toBeGreaterThan(-1);
    expect(appCssIndex).toBeLessThan(shellCssIndex);
  });
});
