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

  test('notebook.css carries exactly three named @media steps, in file order — 1499.98px (the interim desktop rung, plan 12), then 1365.98px (the log moves below the Sheet, sketch 011 decision 16), then 723.98px (the phone forms — the stacked band, the 20px margin and the list-form table go together, sketch 011 decision 16)', () => {
    const mediaConditions = [...new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media))];
    expect(mediaConditions).toEqual(['(max-width: 1499.98px)', '(max-width: 1365.98px)', '(max-width: 723.98px)']);
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

describe('the content cap, centred from a 1770px window (sketch 011 decision 16)', () => {
  test('.notebook declares a max-width over --app-notebook-content-max and --app-notebook-gutter, margin: 0 auto, and a padding reading --app-notebook-gutter', () => {
    const rule = rules.find((rule) => rule.selector === '.notebook' && rule.media === undefined);
    expect(rule, 'expected a top-level .notebook rule').toBeTruthy();
    expect(rule.declarations).toMatch(
      /max-width:\s*calc\(var\(--app-notebook-content-max\)\s*\+\s*2\s*\*\s*var\(--app-notebook-gutter\)\)/,
    );
    expect(rule.declarations).toMatch(/margin:\s*0 auto/);
    expect(rule.declarations).toMatch(/padding:\s*0 var\(--app-notebook-gutter\)/);
  });

  test('.notebook-body declares its gap reading --app-notebook-gutter', () => {
    const rule = rules.find((rule) => rule.selector === '.notebook-body' && rule.media === undefined);
    expect(rule, 'expected a top-level .notebook-body rule').toBeTruthy();
    expect(rule.declarations).toMatch(/gap:\s*var\(--app-notebook-gutter\)/);
  });

  test('.notebook-log declares its flex basis reading --app-notebook-log-w', () => {
    const rule = rules.find((rule) => rule.selector === '.notebook-log' && rule.media === undefined);
    expect(rule, 'expected a top-level .notebook-log rule').toBeTruthy();
    expect(rule.declarations).toMatch(/flex:\s*0 0 var\(--app-notebook-log-w\)/);
  });
});

describe('the History rail — marks paint above the line (03.5-12 Task 1, sketch 011 decision 16 last sentence)', () => {
  test('.notebook-history__nodes declares position: relative, so a later positioned sibling of the (also positioned) track paints above it', () => {
    const rule = rules.find((rule) => rule.selector === '.notebook-history__nodes' && rule.media === undefined);
    expect(rule, 'expected a top-level .notebook-history__nodes rule').toBeTruthy();
    expect(rule.declarations).toMatch(/position:\s*relative/);
  });
});

describe("the log's batch notes (260925-u3r, sketch 011)", () => {
  test('.notebook-log .batch-row__notes is a top-level flex column, the hairline gap, and the log group gap above', () => {
    const notesRule = rules.find((rule) => rule.selector === '.notebook-log .batch-row__notes' && rule.media === undefined);
    expect(notesRule, 'expected a top-level .notebook-log .batch-row__notes rule').toBeTruthy();
    expect(notesRule.declarations).toMatch(/display:\s*flex/);
    expect(notesRule.declarations).toMatch(/flex-direction:\s*column/);
    expect(notesRule.declarations).toMatch(/gap:\s*var\(--app-notebook-gap-hairline\)/);
    expect(notesRule.declarations).toMatch(/margin-top:\s*var\(--app-notebook-log-group-gap\)/);
  });

  test('.notebook-log .batch-row__note resets the paragraph margin so the flex gap alone spaces the notes', () => {
    const noteRule = rules.find((rule) => rule.selector === '.notebook-log .batch-row__note' && rule.media === undefined);
    expect(noteRule, 'expected a top-level .notebook-log .batch-row__note rule').toBeTruthy();
    expect(noteRule.declarations).toMatch(/margin:\s*0/);
  });
});
