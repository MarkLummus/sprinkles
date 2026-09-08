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

const tokensSource = readFileSync(TOKENS_PATH, 'utf8');
const appCssSource = readFileSync(APP_CSS_PATH, 'utf8');

// Measured content minimums, every one attributed to the debug session
// that measured it in a real browser
// (.planning/debug/remove-column-occludes-values.md, phase-3 measurement,
// "Content widths that set the real minimum for each column").
const PERCENT_OF_BATCH_HEADER = 80.61; // the numeric columns' widest content
// The content share --col-step held before this plan (03-08), under the
// old content-box accounting where the declared width WAS the content
// width (padding was added on top, unmeasured by the token itself).
const STEP_CONTENT_SHARE_03_08 = 66;

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

const tokens = readCustomProperties(tokensSource);
const columnRules = readColumnRules(appCssSource);

const tableCellPadX = resolveTokenPx(tokens, '--table-cell-pad-x');
const colNumeric = resolveTokenPx(tokens, '--col-numeric');
const colStep = resolveTokenPx(tokens, '--col-step');

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
