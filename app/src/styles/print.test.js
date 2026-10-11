// The print stylesheet's contract (Phase 4, plan 04-06; D-03, D-07, CLAUDE.md
// "every visual value reads a token"). Reads print.css AS TEXT under Vitest's
// node environment with a reader of its own: css-source.js's readAllRules
// throws on @page, and this file is the one place @page lives. It asserts
// no rendered pixel; the print probe (04-print-probe.mjs) measures paper.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readAllRules, stripCssComments } from './css-source.js';
import { BatchLogPage, TastingLogPage } from '../ui/PrintLogPages.jsx';
import { seedRecipeGroups } from '../data/seed-recipes.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const PRINT_SRC = readFileSync(path.join(STYLES_DIR, 'print.css'), 'utf8');

// Every rule of a stylesheet, flattened: { selector, declarations, media,
// page }. `media` is the condition of the @media block the rule sits in (or
// undefined at the top level); `page` is true for an @page rule. One level
// of @media nesting, which is all print.css has; an at-rule other than
// @media and @page throws, so adding one is forced to address this reader.
function readRules(css) {
  const src = stripCssComments(css);
  const rules = [];
  const walk = (text, media) => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open === -1) break;
      const prelude = text.slice(i, open).trim().replace(/\s+/g, ' ');
      let depth = 1;
      let j = open + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === '{') depth += 1;
        else if (text[j] === '}') depth -= 1;
        j += 1;
      }
      const body = text.slice(open + 1, j - 1);
      if (prelude.startsWith('@media')) {
        walk(body, prelude.slice('@media'.length).trim());
      } else if (prelude.startsWith('@page')) {
        rules.push({ selector: prelude, declarations: body, media, page: true });
      } else if (prelude.startsWith('@')) {
        throw new Error(`print.test.js's reader does not know ${prelude.split(' ')[0]}; teach it before adding one to print.css`);
      } else {
        rules.push({ selector: prelude, declarations: body, media, page: false });
      }
      i = j;
    }
  };
  walk(src, undefined);
  return rules;
}

function declarationsOf(rule) {
  return rule.declarations
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const colon = entry.indexOf(':');
      return { property: entry.slice(0, colon).trim(), value: entry.slice(colon + 1).trim().replace(/\s+/g, ' ') };
    });
}

const rules = readRules(PRINT_SRC);
const sansVars = (value) => value.replace(/var\([^)]*\)/g, ' ');

describe('print.css — paper (D-07, sketch 010 D16, D20)', () => {
  test('exactly one @page rule, naming letter and the margins 0.5in 0.75in', () => {
    const pages = rules.filter((rule) => rule.page);
    expect(pages).toHaveLength(1);
    const declarations = declarationsOf(pages[0]);
    expect(declarations).toContainEqual({ property: 'size', value: 'letter' });
    expect(declarations).toContainEqual({ property: 'margin', value: '0.5in 0.75in' });
  });

  test('the print block hides the route head and the shell header and rail, only while the route is present', () => {
    const printRules = rules.filter((rule) => rule.media === 'print');
    const hiding = printRules.filter((rule) => declarationsOf(rule).some((d) => d.property === 'display' && d.value === 'none'));
    const hidden = hiding.flatMap((rule) => rule.selector.split(',').map((part) => part.trim()));
    expect(hidden).toContain('.print-route__head');
    expect(hidden).toContain('.shell:has(.print-route) .shell__head');
    expect(hidden).toContain('.shell:has(.print-route) .shell__rail');
    expect(hidden).toContain('.shell:has(.print-route) .shell__tabs');
    for (const selector of hidden) {
      expect(selector === '.print-route__head' || selector.includes(':has(.print-route)'), `${selector} would hide chrome on every route`).toBe(true);
    }
  });
});

describe('print.css — every visual value reads a token (D-03; CLAUDE.md)', () => {
  const LENGTH = /(^|[^\w.-])-?\d*\.?\d+(px|pt|in|cm|mm|em|rem|vh|vw)\b/;
  const COLOUR = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;
  const offences = [];
  for (const rule of rules.filter((entry) => !entry.page)) {
    for (const { property, value } of declarationsOf(rule)) {
      const bare = sansVars(value);
      const at = `${rule.media ? `@media ${rule.media} ` : ''}${rule.selector} { ${property}: ${value} }`;
      if (LENGTH.test(bare)) offences.push(`length literal: ${at}`);
      if (COLOUR.test(bare)) offences.push(`colour literal: ${at}`);
      if (property === 'font-family' && !/^var\(--[\w-]+\)$/.test(value) && value !== 'inherit') offences.push(`font-family literal: ${at}`);
      if (property === 'font' ) offences.push(`font shorthand: ${at}`);
      if (property === 'font-weight' && /\b\d{3}\b/.test(bare)) offences.push(`numeric font-weight: ${at}`);
      if (property === 'line-height' && /^-?\d*\.?\d+$/.test(bare.trim())) offences.push(`numeric line-height: ${at}`);
    }
  }

  test('outside @page no declaration carries a unit length, a colour, a font-family name, a numeric weight or a numeric leading', () => {
    expect(offences).toEqual([]);
  });

  test('the reader finds the rules it should (a guard against a parse that returns nothing)', () => {
    expect(rules.filter((rule) => !rule.page).length).toBeGreaterThan(40);
    expect(rules.some((rule) => rule.selector === '.lf-foot')).toBe(true);
  });

  test('the check bites: a literal fed to the same patterns is flagged', () => {
    expect(LENGTH.test(sansVars('12px'))).toBe(true);
    expect(LENGTH.test(sansVars('calc(var(--gap-l) + 2px)'))).toBe(true);
    expect(LENGTH.test(sansVars('calc(-1 * var(--app-rule-row))'))).toBe(false);
    expect(LENGTH.test(sansVars('25%'))).toBe(false);
    expect(COLOUR.test('#ffffff')).toBe(true);
    expect(COLOUR.test(sansVars('var(--app-background)'))).toBe(false);
  });
});

// CONTRACT § 1: the printed page does not read the window's width or pointer.
// A selector inside a non-print @media block of the app's other stylesheets
// that can match inside .print-page would let the window change a page, so
// none may exist. Only a selector that names a class the page pictures render
// (PAGE_CLASSES) AND requires nothing the print route never renders can match
// there; one that requires such a class cannot, and is reported as exempt.
describe('the pages read no width and no pointer (CONTRACT § 1)', () => {
  const SRC_DIR = path.join(STYLES_DIR, '..', 'ui');
  const VERSIONS = seedRecipeGroups.flatMap((group) => group.versions);

  const classesIn = (markup) => [...markup.matchAll(/class="([^"]*)"/g)].flatMap((match) => match[1].split(/\s+/)).filter(Boolean);

  // What a page picture renders: the page boxes and every class the two log
  // pages render for every seed version.
  const PAGE_CLASSES = new Set([
    'print-page',
    'print-page--log',
    ...VERSIONS.flatMap((version) => [
      ...classesIn(renderToStaticMarkup(createElement(BatchLogPage, { footText: 'foot' }))),
      ...classesIn(renderToStaticMarkup(createElement(TastingLogPage, { version, footText: 'foot' }))),
    ]),
  ]);

  // Every class the route renders at or above a page: PAGE_CLASSES plus every
  // class named in PrintSheet.jsx and Shell.jsx (the route renders inside the
  // Shell). Reading whole sources only widens the set, which errs toward
  // flagging.
  function classesNamedIn(src) {
    const found = new Set();
    for (const match of src.matchAll(/className=(?:"([^"]*)"|\{([^}]*)\})/g)) {
      const text = match[1] ?? (match[2].match(/(['"`])((?:(?!\1).)*)\1/g) ?? []).join(' ');
      for (const word of text.replace(/['"`]/g, ' ').split(/\s+/)) if (/^[a-z][\w-]*$/i.test(word)) found.add(word);
    }
    for (const match of src.matchAll(/[a-z][a-z0-9]*(?:__|--|-)[a-z0-9_-]+/g)) found.add(match[0]);
    return found;
  }
  const ROUTE_CLASSES = new Set([
    ...PAGE_CLASSES,
    ...classesNamedIn(readFileSync(path.join(SRC_DIR, 'PrintSheet.jsx'), 'utf8')),
    ...classesNamedIn(readFileSync(path.join(SRC_DIR, 'Shell.jsx'), 'utf8')),
  ]);

  // Split a selector list on its top-level commas.
  function splitSelectors(list) {
    const parts = [];
    let depth = 0;
    let current = '';
    for (const char of list) {
      if (char === '(') depth += 1;
      if (char === ')') depth -= 1;
      if (char === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else current += char;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  // The classes a selector requires: those it names outside :not(), :is(),
  // :where() and :has() (counting fewer as required errs toward flagging).
  function requiredClasses(selector) {
    let out = selector;
    for (;;) {
      const next = out.replace(/:(?:not|is|where|has)\([^()]*\)/g, '');
      if (next === out) break;
      out = next;
    }
    return [...out.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]);
  }

  // The check: { offenders, exempt } for one stylesheet's non-print media rules.
  function judge(label, css) {
    const offenders = [];
    const exempt = [];
    for (const rule of readAllRules(css)) {
      if (rule.media === undefined || /\bprint\b/.test(rule.media)) continue;
      for (const selector of splitSelectors(rule.selector)) {
        const required = requiredClasses(selector);
        if (!required.some((name) => PAGE_CLASSES.has(name))) continue;
        const outside = required.find((name) => !ROUTE_CLASSES.has(name));
        if (outside === undefined) offenders.push(`${label}: ${rule.media} \u2192 ${selector}`);
        else exempt.push({ selector: `${label}: ${rule.media} \u2192 ${selector}`, outside });
      }
    }
    return { offenders, exempt };
  }

  const sheets = ['app.css', 'notebook.css', 'shell.css', 'home.css'].map((name) => ({
    name,
    css: readFileSync(path.join(STYLES_DIR, name), 'utf8'),
  }));

  test('no selector in a non-print @media block of app.css, notebook.css, shell.css or home.css can match inside a page', () => {
    const results = sheets.map(({ name, css }) => judge(name, css));
    for (const { exempt } of results) {
      for (const { selector, outside } of exempt) console.info(`exempt: ${selector} (the print route never renders .${outside})`);
    }
    expect(results.flatMap((result) => result.offenders)).toEqual([]);
  });

  test('the set the gate reads is real: the pages render the classes the gate names, and the route its own', () => {
    for (const name of ['lf', 'lf-foot', 'region-name', 'pen-caption', 'axis-mark__name', 'pen-helper']) expect(PAGE_CLASSES.has(name), name).toBe(true);
    for (const name of ['notebook', 'print-route', 'shell', 'shell__main']) expect(ROUTE_CLASSES.has(name), name).toBe(true);
    expect(ROUTE_CLASSES.has('notebook-log')).toBe(false);
    expect(ROUTE_CLASSES.has('batch-row__head')).toBe(false);
  });

  test('the gate bites: a rule the route could match is an offender, one it cannot is exempt', () => {
    const bites = judge('inline', '@media (max-width: 723.98px) { .notebook .region-name { margin: 0 } }');
    expect(bites.offenders).toEqual(['inline: (max-width: 723.98px) \u2192 .notebook .region-name']);
    const cannot = judge('inline', '@media (max-width: 723.98px) { .notebook-log .region-name { margin: 0 } }');
    expect(cannot.offenders).toEqual([]);
    expect(cannot.exempt).toEqual([{ selector: 'inline: (max-width: 723.98px) \u2192 .notebook-log .region-name', outside: 'notebook-log' }]);
    const pointer = judge('inline', '@media (pointer: coarse) { .shell .lf-line { height: 0 } }');
    expect(pointer.offenders).toHaveLength(1);
    const printOnly = judge('inline', '@media print { .notebook .region-name { margin: 0 } }');
    expect(printOnly.offenders).toEqual([]);
  });
});
