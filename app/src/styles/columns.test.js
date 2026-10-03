// The stylesheet contract 03-08's greps could not express (G-03-11),
// extended by decision 15 (sketch 011, 03.5-11): this suite has no layout
// engine — it runs under Vitest's default `node` environment
// (vitest.config.js), and `renderToStaticMarkup` in a node process
// computes no boxes. Every assertion below reads the two stylesheets and
// the component AS TEXT and checks the contract they state, and the
// arithmetic that contract implies. It cannot assert a rendered pixel;
// that stays a real-browser measurement
// (.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-table-probe.mjs,
// the plan's own <verify> block). Do not read a passing run here as proof
// the table renders correctly — it proves the tokens and rules are
// internally consistent, nothing more.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { stripCssComments, readCustomProperties, resolveTokenPx, readAllRules } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.join(STYLES_DIR, 'tokens.css');
const APP_CSS_PATH = path.join(STYLES_DIR, 'app.css');
const INGREDIENT_TABLE_JSX_PATH = path.join(STYLES_DIR, '..', 'ui', 'IngredientTable.jsx');

const tokensSource = readFileSync(TOKENS_PATH, 'utf8');
const appCssSource = readFileSync(APP_CSS_PATH, 'utf8');
const ingredientTableSource = readFileSync(INGREDIENT_TABLE_JSX_PATH, 'utf8');

// --- Reading helpers -------------------------------------------------
// Both tasks' assertions rest on these: a comment stripper (so a rule can
// never be satisfied by prose about it), a token reader (values from
// tokens.css, one level of var() indirection resolved), and a rule reader
// (declarations for a given selector in app.css) — all read through
// css-source.js so this suite and binder.test.js can never drift apart.

// Returns { numeric: '...', grams: '...', ... } mapping each
// ingredient-table__col-* class to its declarations text, for rules whose
// selector is exactly that one column class (this file's existing shape —
// one selector, one column).
function readColumnRules(css) {
  const rules = readAllRules(css);
  const byColumn = {};
  for (const { selector, declarations } of rules) {
    const match = selector.match(/^\.ingredient-table__col-([\w-]+)$/);
    if (match) byColumn[match[1]] = declarations;
  }
  return byColumn;
}

function emittedColumnClasses(jsx) {
  const re = /ingredient-table__col-([\w-]+)/g;
  const set = new Set();
  let match;
  while ((match = re.exec(jsx))) set.add(match[1]);
  return set;
}

const tokens = readCustomProperties(tokensSource);
const columnRules = readColumnRules(appCssSource);
const emittedColumns = emittedColumnClasses(ingredientTableSource);

const tableCellPadX = resolveTokenPx(tokens, '--sheet-table-cell-pad-x');

describe('reading helpers', () => {
  test('stripCssComments removes a comment block without touching the rule beside it', () => {
    const fixture = `.a { width: 1px; } /* a comment naming .b { width: 999px; } */ .b { width: 2px; }`;
    const stripped = stripCssComments(fixture);
    expect(stripped).not.toContain('999px');
    expect(stripped).toContain('.a { width: 1px; }');
    expect(stripped).toContain('.b { width: 2px; }');
  });

  test('readCustomProperties reads a declared token and resolves one level of var() indirection', () => {
    const fixture = `:root {\n  --base: 6px;\n  --derived: var(--base);\n  --literal: 40%;\n}`;
    const props = readCustomProperties(fixture);
    expect(resolveTokenPx(props, '--base')).toBe(6);
    expect(resolveTokenPx(props, '--derived')).toBe(6);
    // A non-px token (e.g. a retired percentage) resolves to undefined,
    // never a false px number.
    expect(resolveTokenPx(props, '--literal')).toBeUndefined();
  });

  test('readColumnRules reads the declarations for a single-selector column rule', () => {
    const fixture = `.ingredient-table__col-numeric {\n  width: 1%;\n  text-align: right;\n}`;
    const byColumn = readColumnRules(fixture);
    expect(byColumn.numeric).toContain('1%');
  });
});

describe('task 1 — border-box accounting (G-03-11, unchanged by decision 15)', () => {
  test('the shared th/td rule declares border-box sizing', () => {
    const rules = readAllRules(appCssSource);
    const cellRule = rules.find((r) => /\.ingredient-table th,\s*\.ingredient-table td/.test(r.selector));
    expect(cellRule, 'expected a .ingredient-table th, .ingredient-table td rule').toBeTruthy();
    expect(cellRule.declarations).toMatch(/box-sizing:\s*border-box/);
  });

  test("the cell rule's horizontal padding reads through this table's own token, not --gap-s", () => {
    const rules = readAllRules(appCssSource);
    const cellRule = rules.find((r) => /\.ingredient-table th,\s*\.ingredient-table td/.test(r.selector));
    const paddingDecl = cellRule.declarations.match(/padding:\s*([^;]+);/);
    expect(paddingDecl, 'expected a padding declaration on the cell rule').toBeTruthy();
    expect(paddingDecl[1]).not.toMatch(/var\(--gap-s\)/);
    expect(paddingDecl[1]).toMatch(/var\(--sheet-table-cell-pad-x\)/);
  });

  test('the horizontal padding token is declared, is a px value, and is tighter than the old 12px gap-s padding', () => {
    expect(tableCellPadX).toBeTypeOf('number');
    expect(tableCellPadX).toBeLessThan(12);
  });
});

// Decision 15 (sketch 011, 03.5-11 Task 1): the table now has three column
// identities — the content-sized amount column (new, holding the plan
// grams), the auto-width name column, and the content-sized numeric column
// (As made, % of batch). A content-sized column has no measured-minimum
// budget to assert against — `width: 1%` under table-layout: auto takes
// exactly the content's own width, so there is nothing to shrink-wrap
// toward. The Data and Remove columns stay retired outright (03.5-06
// Task 2) — this gap only ever moves the amount out of the name column,
// never reintroduces a column style 6 already dropped.
describe('task 1 style 6 (decision 15) — three column identities: content-sized grams, auto name, content-sized numeric', () => {
  test('the component emits exactly the three columns this table has now', () => {
    expect(emittedColumns).toEqual(new Set(['grams', 'name', 'numeric']));
  });

  test('app.css no longer styles a Data or a Remove column', () => {
    expect(columnRules.data).toBeUndefined();
    expect(columnRules.remove).toBeUndefined();
  });

  test('every emitted column class is matched by a width rule in app.css — the gate a grep on one file could not express', () => {
    for (const col of emittedColumns) {
      expect(columnRules[col], `expected app.css to style .ingredient-table__col-${col}`).toBeTruthy();
    }
  });

  test('.ingredient-table declares table-layout auto, sized to its own content', () => {
    const rules = readAllRules(appCssSource);
    const tableRule = rules.find((r) => r.selector === '.ingredient-table' && r.media === undefined);
    expect(tableRule, 'expected the top-level .ingredient-table rule').toBeTruthy();
    expect(tableRule.declarations).toMatch(/table-layout:\s*auto/);
  });

  test('exactly one column declares an automatic width, and it is the ingredient name', () => {
    const autoColumns = Object.entries(columnRules)
      .filter(([, decl]) => /width:\s*auto/.test(decl))
      .map(([col]) => col);
    expect(autoColumns).toEqual(['name']);
  });

  test('the grams and numeric columns both declare width: 1% — content-sized, never a --col-* token', () => {
    for (const col of ['grams', 'numeric']) {
      expect(columnRules[col]).toMatch(/width:\s*1%/);
      expect(columnRules[col]).not.toMatch(/width:\s*var\(/);
    }
  });

  test('the grams column right-aligns and never wraps, with a right padding reading --sheet-plan-grams-gap', () => {
    const decl = columnRules.grams;
    expect(decl).toMatch(/white-space:\s*nowrap/);
    expect(decl).toMatch(/text-align:\s*right/);
    expect(decl).toMatch(/padding-right:\s*var\(--sheet-plan-grams-gap\)/);
  });

  test('td.ingredient-table__col-numeric never wraps, but the heads keep wrapping', () => {
    const rules = readAllRules(appCssSource);
    const tdNumeric = rules.find(
      (r) => r.selector === '.ingredient-table td.ingredient-table__col-numeric' && r.media === undefined,
    );
    expect(tdNumeric, 'expected a td-scoped nowrap rule for the numeric column').toBeTruthy();
    expect(tdNumeric.declarations).toMatch(/white-space:\s*nowrap/);
    const thForcesNowrap = rules.some(
      (r) => /\bth\.ingredient-table__col-numeric\b/.test(r.selector) && /white-space:\s*nowrap/.test(r.declarations),
    );
    expect(thForcesNowrap).toBe(false);
  });

  test('no ingredient-table rule declares a clipping or a stacking property', () => {
    const rules = readAllRules(appCssSource);
    const ingredientTableRules = rules.filter((r) => r.selector.includes('ingredient-table'));
    expect(ingredientTableRules.length).toBeGreaterThan(0);
    for (const rule of ingredientTableRules) {
      expect(rule.declarations).not.toMatch(/overflow\s*:/);
      expect(rule.declarations).not.toMatch(/clip(-path)?\s*:/);
      expect(rule.declarations).not.toMatch(/z-index\s*:/);
      expect(rule.declarations).not.toMatch(/position\s*:\s*(absolute|fixed|sticky)/);
      expect(rule.declarations).not.toMatch(/text-overflow\s*:/);
    }
  });

  test('tokens.css declares neither --sheet-col-numeric nor --sheet-portion-indent — decision 15 has no width budget to derive them from', () => {
    expect(tokens['--sheet-col-numeric']).toBeUndefined();
    expect(tokens['--sheet-portion-indent']).toBeUndefined();
  });
});

// Style 6 (sketch 011 decisions 2, 3; decision 15, 03.5-11 Task 1): every
// value here is the board's own literal (1600-batch.html, 393-batch.html),
// not a measured-minimum budget — there is nothing to measure a minimum
// against, since these are the board's own fixed values.
describe("decision 15's own literal tokens (sketch 011) — the amount span, its gap, and the flag gap read the board's own literal values", () => {
  test("the plan-grams span width, its own gap, and the flag gap and the remove gap resolve to the board's literal px values (64, 18, 8, 10)", () => {
    expect(resolveTokenPx(tokens, '--sheet-plan-grams-w')).toBe(64);
    expect(resolveTokenPx(tokens, '--sheet-plan-grams-gap')).toBe(18);
    expect(resolveTokenPx(tokens, '--sheet-flag-gap')).toBe(8);
    expect(resolveTokenPx(tokens, '--sheet-remove-gap')).toBe(10);
  });
});
