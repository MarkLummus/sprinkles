// notebook.css's own token-discipline contract (03.5-04 Task 1,
// decisions_recorded 1): every App-context rule of the recipe route lives
// here, scoped under .notebook, with exactly three named @media steps
// (decisions_recorded 2). Same no-layout-engine caveat as home.test.js:
// this suite runs under Vitest's default `node` environment and reads the
// source AS TEXT.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { readAllRules } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const NOTEBOOK_CSS_PATH = path.join(STYLES_DIR, 'notebook.css');
const MAIN_JSX_PATH = path.join(STYLES_DIR, '..', 'main.jsx');

const notebookCssSource = readFileSync(NOTEBOOK_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');

const rules = readAllRules(notebookCssSource);

describe('notebook.css — no visual literal, every value a var() read (GUARD-05)', () => {
  test('no declaration contains a hex colour', () => {
    expect(notebookCssSource).not.toMatch(/:[^;{}]*#[0-9a-fA-F]{3,8}/);
  });

  test('no declaration contains a bare px value', () => {
    for (const rule of rules) {
      expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
    }
  });

  test('every rule is scoped under the .notebook root class, with no exception', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule.selector.startsWith('.notebook'), `expected "${rule.selector}" to be scoped under .notebook`).toBe(true);
    }
  });

  test('notebook.css carries exactly three named @media steps, in file order — 1499.98px (the desktop/iPad-landscape rung), then 1099.98px (the Sheet/log column stack), then 759.98px (the phone edge-to-edge step)', () => {
    const mediaConditions = [...new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media))];
    expect(mediaConditions).toEqual(['(max-width: 1499.98px)', '(max-width: 1099.98px)', '(max-width: 759.98px)']);
  });
});

describe('notebook.css is wired in (main.jsx, home.css precedent)', () => {
  test('main.jsx imports notebook.css after home.css', () => {
    const homeCssIndex = mainJsxSource.indexOf('./styles/home.css');
    const notebookCssIndex = mainJsxSource.indexOf('./styles/notebook.css');
    expect(homeCssIndex).toBeGreaterThan(-1);
    expect(notebookCssIndex).toBeGreaterThan(-1);
    expect(homeCssIndex).toBeLessThan(notebookCssIndex);
  });
});
