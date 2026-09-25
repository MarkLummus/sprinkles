// The stylesheet contract 03-08's greps could not express (G-03-11):
// this suite has no layout engine — it runs under Vitest's default `node`
// environment (vitest.config.js), and `renderToStaticMarkup` in a node
// process computes no boxes. Every assertion below reads the two
// stylesheets and the component AS TEXT and checks the contract they
// state, and the arithmetic that contract implies. It cannot assert a
// rendered pixel; that stays a real-browser human check
// (.planning/debug/remove-column-occludes-values.md, the plan's own
// <verify><human-check> blocks). Do not read a passing run here as proof
// the table renders correctly — it proves the tokens and rules are
// internally consistent with the measured minimums, nothing more.

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

// Measured content minimums, every one attributed to the debug session
// that measured it in a real browser
// (.planning/debug/remove-column-occludes-values.md, phase-3 measurement,
// "Content widths that set the real minimum for each column").
const PERCENT_OF_BATCH_HEADER = 80.61; // the numeric columns' widest content
const WIDEST_INGREDIENT_NAME = 142.83; // "Lambda carrageenan"

// The page arithmetic (route-recipe-version.md's host page, .recipe-page
// in app.css): a 2fr/1fr grid, --gap-page (--gap-xl, 48px) padding on both
// sides, and a --gap-l (32px) gap between the two columns. The ingredient table
// lives in the 2fr column, two thirds of what the grid gap and padding
// leave. From Phase 03.3.1.1 the page stacks to one column below 1100px
// (app.css's 1099.98px block, D-15), so tableWidthAt(1024) below is a
// conservative lower bound — the table has the whole content width at
// that stacked viewport — and the widths at or above 1100 are the ones
// this 2fr arithmetic still describes exactly.
const GAP_XL = 48;
const GAP_L = 32;
function tableWidthAt(viewport) {
  return ((viewport - 2 * GAP_XL - GAP_L) * 2) / 3;
}

const UAT_WIDTHS = [1024, 1152, 1280, 1366, 1440];

// --- Reading helpers -------------------------------------------------
// Both tasks' assertions rest on these: a comment stripper (so a rule can
// never be satisfied by prose about it), a token reader (values from
// tokens.css, one level of var() indirection resolved), and a rule reader
// (declarations for a given selector in app.css) — all read through
// css-source.js so this suite and binder.test.js can never drift apart.

// Returns { numeric: '...', step: '...', ... } mapping each
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
const colNumeric = resolveTokenPx(tokens, '--sheet-col-numeric');

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
    const fixture = `.ingredient-table__col-numeric {\n  width: var(--sheet-col-numeric);\n  text-align: right;\n}`;
    const byColumn = readColumnRules(fixture);
    expect(byColumn.numeric).toContain('var(--sheet-col-numeric)');
  });
});

describe('task 1 — border-box accounting and a corrected derivation', () => {
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

  test('the numeric column rule declares its width through a --col-* token, never a px literal', () => {
    for (const col of ['numeric']) {
      const decl = columnRules[col];
      expect(decl, `expected a rule for .ingredient-table__col-${col}`).toBeTruthy();
      expect(decl).toMatch(/width:\s*var\(--sheet-col-[\w-]+\)/);
      expect(decl).not.toMatch(/width:\s*\d/);
    }
  });

  test('the numeric column token, less its own two paddings, clears the widest thing it prints (the "% of batch" header)', () => {
    expect(colNumeric).toBeTypeOf('number');
    const content = colNumeric - 2 * tableCellPadX;
    expect(content).toBeGreaterThanOrEqual(PERCENT_OF_BATCH_HEADER);
  });

  test('the numeric column sits within a few px of its minimum, not far above it', () => {
    const content = colNumeric - 2 * tableCellPadX;
    expect(content - PERCENT_OF_BATCH_HEADER).toBeLessThanOrEqual(6);
  });

});

// Sketch 011 Task 2: Data and Remove retire outright — every state now
// reads style 6, so the table has only two column identities left: the
// auto-width name column (which now also carries the plan grams and the
// flag chip inline) and the token-sized numeric column (As made,
// % of batch). The old "give Data and Remove their own column" contract
// (03-08/03.3-02) is superseded, not merely narrowed.
describe('task 2 — Data and Remove retire outright; only the name (auto) and numeric (token-sized) columns remain', () => {
  test('the component emits only the two columns this table has now', () => {
    expect(emittedColumns).toEqual(new Set(['name', 'numeric']));
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

  test('exactly one column declares an automatic width, and it is the ingredient name', () => {
    const autoColumns = Object.entries(columnRules)
      .filter(([, decl]) => /width:\s*auto/.test(decl))
      .map(([col]) => col);
    expect(autoColumns).toEqual(['name']);
  });

  test('the remaining numeric column reads its width through a --col-* token that resolves to a px value', () => {
    const decl = columnRules.numeric;
    const match = decl.match(/width:\s*var\((--sheet-col-[\w-]+)\)/);
    expect(match, 'expected numeric to read width from a --col-* token').toBeTruthy();
    expect(resolveTokenPx(tokens, match[1])).toBeTypeOf('number');
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

  describe('the width budget, now just the numeric column: the name column clears the widest seed name plus the plan-grams prefix at every UAT width', () => {
    // The table's widest remaining state: both numeric columns at once
    // (As made + % of batch). No Grams, Data or Remove column of its own
    // any more — the plan grams live inline, inside the auto-width name
    // column itself, alongside the widest ingredient name.
    function sizedColumnsTotal() {
      return 2 * colNumeric;
    }

    test.each(UAT_WIDTHS)('at %ipx, the sized columns never exceed the table width', (viewport) => {
      expect(sizedColumnsTotal()).toBeLessThanOrEqual(tableWidthAt(viewport));
    });

    test.each(UAT_WIDTHS)('at %ipx, the name column clears the widest seed name plus the plan-grams span and its gap — comfortably, now that Grams/Data/Remove no longer compete for the remainder', (viewport) => {
      const remainder = tableWidthAt(viewport) - sizedColumnsTotal();
      const nameContent = remainder - 2 * tableCellPadX;
      const planGramsW = resolveTokenPx(tokens, '--sheet-plan-grams-w');
      const planGramsGap = resolveTokenPx(tokens, '--sheet-plan-grams-gap');
      expect(nameContent).toBeGreaterThanOrEqual(WIDEST_INGREDIENT_NAME + planGramsW + planGramsGap);
    });
  });
});

// Style 6 (sketch 011 decisions 2, 3, Task 1): the reading state no longer
// sizes a Grams or a Data column at all — the plan grams and the
// estimated/unreviewed chip move inline into the name column instead, each
// reading its own literal board token rather than a measured-minimum
// budget (there is nothing to measure a minimum against: these are the
// board's own fixed values, not a shrink-to-content column).
describe("task 1 style 6 — the plan-grams span and the flag gap read the board's own literal tokens (sketch 011 decisions 2, 3)", () => {
  const planGramsW = resolveTokenPx(tokens, '--sheet-plan-grams-w');
  const planGramsGap = resolveTokenPx(tokens, '--sheet-plan-grams-gap');
  const flagGap = resolveTokenPx(tokens, '--sheet-flag-gap');
  const portionIndent = resolveTokenPx(tokens, '--sheet-portion-indent');

  test("the plan-grams span, its own gap, and the flag gap resolve to the board's literal px values (64, 18, 8)", () => {
    expect(planGramsW).toBe(64);
    expect(planGramsGap).toBe(18);
    expect(flagGap).toBe(8);
  });

  test("the split portion note's indent is the plan-grams span plus its own gap, never a second literal (1600-batch.html: padding-left 82px)", () => {
    expect(portionIndent).toBe(planGramsW + planGramsGap);
  });
});
