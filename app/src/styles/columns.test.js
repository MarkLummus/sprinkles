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
const DATA_FLAG_ESTIMATED = 66.14; // "estimated" — the shorter of the two flag words
// "unreviewed" is one letter longer than "estimated" and no seed row
// currently carries it, so it was never measured. Reasoned rather than
// guessed: "estimated" averages 66.14 / 9 = 7.35px per letter; scaled to
// "unreviewed"'s 10 letters, that is ~73.5px — used as the Data column's
// real minimum since it is the longer word the app can produce.
const DATA_FLAG_UNREVIEWED_REASONED = 73.5;
const REMOVE_BUTTON = 60.45; // the native remove/restore <button>, RemoveRowControl
const WIDEST_INGREDIENT_NAME = 142.83; // "Lambda carrageenan"
// The content share --col-step held before this plan (03-08), under the
// old content-box accounting where the declared width WAS the content
// width (padding was added on top, unmeasured by the token itself).
const STEP_CONTENT_SHARE_03_08 = 66;

// The page arithmetic (route-recipe-version.md's host page, .recipe-page
// in app.css): a 2fr/1fr grid, --gap-xl (48px) padding on both sides, and
// a --gap-l (32px) gap between the two columns. The ingredient table
// lives in the 2fr column, two thirds of what the grid gap and padding
// leave.
const GAP_XL = 48;
const GAP_L = 32;
function tableWidthAt(viewport) {
  return ((viewport - 2 * GAP_XL - GAP_L) * 2) / 3;
}

const UAT_WIDTHS = [1024, 1152, 1280, 1366, 1440];

// --- Reading helpers -------------------------------------------------
// Both tasks' assertions rest on these three: a comment stripper (so a
// rule can never be satisfied by prose about it), a token reader (values
// from tokens.css, one level of var() indirection resolved), and a rule
// reader (declarations for a given selector in app.css).

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function readCustomProperties(css) {
  const stripped = stripCssComments(css);
  const props = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(stripped))) {
    props[match[1]] = match[2].trim();
  }
  return props;
}

function parsePxLiteral(value) {
  const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : undefined;
}

// Resolves a custom property's value to a px number, following at most
// one level of var(--other) indirection — enough for every token this
// table's columns use, since none of them chains a var of a var.
function resolveTokenPx(props, name) {
  const raw = props[name];
  if (raw == null) return undefined;
  const varMatch = raw.match(/^var\((--[\w-]+)\)$/);
  if (varMatch) {
    return parsePxLiteral(props[varMatch[1]]);
  }
  return parsePxLiteral(raw);
}

// Returns [{ selector, declarations }] for every top-level rule in the
// comment-stripped source — used both for the per-column rule reader and
// the broader ingredient-table rule scan task 2 adds.
function readAllRules(css) {
  const stripped = stripCssComments(css);
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(stripped))) {
    rules.push({ selector: match[1].trim().replace(/\s+/g, ' '), declarations: match[2] });
  }
  return rules;
}

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

const tableCellPadX = resolveTokenPx(tokens, '--table-cell-pad-x');
const colNumeric = resolveTokenPx(tokens, '--col-numeric');
const colStep = resolveTokenPx(tokens, '--col-step');
const colData = resolveTokenPx(tokens, '--col-data');
const colRemove = resolveTokenPx(tokens, '--col-remove');

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
    const fixture = `.ingredient-table__col-numeric {\n  width: var(--col-numeric);\n  text-align: right;\n}`;
    const byColumn = readColumnRules(fixture);
    expect(byColumn.numeric).toContain('var(--col-numeric)');
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
    expect(paddingDecl[1]).toMatch(/var\(--table-cell-pad-x\)/);
  });

  test('the horizontal padding token is declared, is a px value, and is tighter than the old 12px gap-s padding', () => {
    expect(tableCellPadX).toBeTypeOf('number');
    expect(tableCellPadX).toBeLessThan(12);
  });

  test('the numeric and step column rules declare their width through a --col-* token, never a px literal', () => {
    for (const col of ['numeric', 'step']) {
      const decl = columnRules[col];
      expect(decl, `expected a rule for .ingredient-table__col-${col}`).toBeTruthy();
      expect(decl).toMatch(/width:\s*var\(--col-[\w-]+\)/);
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

  test('the step column token, less its own two paddings, still expresses the same content share 03-08 derived', () => {
    expect(colStep).toBeTypeOf('number');
    const content = colStep - 2 * tableCellPadX;
    expect(content).toBeGreaterThanOrEqual(STEP_CONTENT_SHARE_03_08);
    // Restated, not re-grown: the same content share, not a new one.
    expect(content).toBeLessThanOrEqual(STEP_CONTENT_SHARE_03_08 + 2);
  });
});

describe('task 2 — Data and Remove get columns of their own; the name column absorbs the remainder', () => {
  test('the component emits exactly the five columns this table has', () => {
    expect(emittedColumns).toEqual(new Set(['name', 'numeric', 'step', 'data', 'remove']));
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

  test('every other column reads its width through a --col-* token that resolves to a px value', () => {
    for (const col of ['numeric', 'step', 'data', 'remove']) {
      const decl = columnRules[col];
      const match = decl.match(/width:\s*var\((--col-[\w-]+)\)/);
      expect(match, `expected ${col} to read width from a --col-* token`).toBeTruthy();
      expect(resolveTokenPx(tokens, match[1])).toBeTypeOf('number');
    }
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

  test('each of the two new tokens, less the two paddings, clears its own measured minimum', () => {
    expect(colData - 2 * tableCellPadX).toBeGreaterThanOrEqual(DATA_FLAG_UNREVIEWED_REASONED);
    expect(colData - 2 * tableCellPadX).toBeGreaterThanOrEqual(DATA_FLAG_ESTIMATED);
    expect(colRemove - 2 * tableCellPadX).toBeGreaterThanOrEqual(REMOVE_BUTTON);
  });

  describe('the width budget, computed from the tokens themselves at every width the UAT names', () => {
    // The table's widest state: a churned version open in the pen, all
    // three numeric columns plus Step, Data and Remove at once.
    function sizedColumnsTotalWidestState() {
      return 3 * colNumeric + colStep + colData + colRemove;
    }

    test.each(UAT_WIDTHS)('at %ipx, the sized columns never exceed the table width — no column is ever squeezed to nothing', (viewport) => {
      expect(sizedColumnsTotalWidestState()).toBeLessThanOrEqual(tableWidthAt(viewport));
    });

    test.each([1280, 1366, 1440])('at %ipx and above, the name column clears the widest seed name (D-UAT-6: unwrapped at 1280+)', (viewport) => {
      const remainder = tableWidthAt(viewport) - sizedColumnsTotalWidestState();
      const nameContent = remainder - 2 * tableCellPadX;
      expect(nameContent).toBeGreaterThanOrEqual(WIDEST_INGREDIENT_NAME);
    });

    test('at 1152px, the name column still clears the widest seed name', () => {
      const remainder = tableWidthAt(1152) - sizedColumnsTotalWidestState();
      const nameContent = remainder - 2 * tableCellPadX;
      expect(nameContent).toBeGreaterThanOrEqual(WIDEST_INGREDIENT_NAME);
    });

    test('at 1024px, the name column stays positive — the accepted yield (D-UAT-6), not an oversight', () => {
      const remainder = tableWidthAt(1024) - sizedColumnsTotalWidestState();
      const nameContent = remainder - 2 * tableCellPadX;
      expect(nameContent).toBeGreaterThan(0);
      // And it is genuinely narrower than the widest name — this is the
      // width at which D-UAT-6 accepts a wrap, not a second clearance.
      expect(nameContent).toBeLessThan(WIDEST_INGREDIENT_NAME);
    });

    test("the reading state's widest shape (no Remove column) still fits at 1280px — the unreported second instance", () => {
      const readingStateTotal = 3 * colNumeric + colStep + colData;
      expect(readingStateTotal).toBeLessThanOrEqual(tableWidthAt(1280));
      // The Data column gets its whole declared width — nothing steals
      // from it because the total including it still fits.
      expect(readingStateTotal).toBeGreaterThanOrEqual(colData);
    });
  });
});
