// The two blank log pages (04-06; sketch 010 CONTRACT §§ 2 to 4). Rendered to
// static markup under Vitest's node environment: no DOM, no layout. The
// pages' fit on paper is the print probe's job (04-print-probe.mjs); this
// file proves what each page holds, version by version.
//
// Parameterised by recipe (CONTRACT § 2, rule 4): every test iterates the
// seeded versions and takes the declared lists from the version under test.
// The names Olive Oil v1 declares are literals only in the Olive Oil v1 case.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BatchLogPage, TastingLogPage, logFootText } from './PrintLogPages.jsx';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { sheetCode } from '../domain/sheetCode.js';
import { PRINTED_MARK_ONE_OPTIONS, SEGMENT_OPTIONS } from '../domain/battery.js';
import { coreScaleDefinitions, problemNames } from '../domain/catalog.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';

const VERSIONS = seedRecipeGroups.flatMap((group) => group.versions);
const CORE_AXIS_NAMES = coreScaleDefinitions(SEED_CATALOG.scales).map((axis) => axis.name);
const CORE_PROBLEM_WORDS = problemNames(SEED_CATALOG.problems);
// How many core scales the tables hold (the log prints the catalog's, D-01).
const CORE_COUNT = coreScaleDefinitions(SEED_CATALOG.scales).length;

const count = (markup, needle) => markup.split(needle).length - 1;
const classCount = (markup, name) => (markup.match(new RegExp(`class="[^"]*\\b${name}\\b[^"]*"`, 'g')) ?? []).length;

function footFor(version, side) {
  return logFootText({ sheetTitle: version.sheetTitle, identity: 'Version 1 · test', code: sheetCode(version), side });
}
const page1 = (version) => renderToStaticMarkup(<BatchLogPage footText={footFor(version, 1)} />);
const page2 = (version, catalog = SEED_CATALOG) => renderToStaticMarkup(<TastingLogPage version={version} catalog={catalog} footText={footFor(version, 2)} />);

// The markup of the problems row alone: from its opening div to the page's
// next group (Notes).
function problemsRow(markup) {
  const start = markup.indexOf('lf-mrow lf-mrow--plain');
  return markup.slice(start, markup.indexOf('lf-notes'));
}

describe('logFootText — the foot (D7, D28; decide-foot-sheet-code-word)', () => {
  it('joins the Sheet title, the version line, the bare code and the side', () => {
    expect(logFootText({ sheetTitle: 'Olive Oil Ice Cream', identity: 'Version 1 · 50 g oil · 800 g', code: '64JH-G408', side: 2 })).toBe(
      'Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · 64JH-G408 · Side 2 of 2',
    );
  });

  it('carries no "Sheet code" word and no page n of m', () => {
    const text = logFootText({ sheetTitle: 'T', identity: 'Version 1', code: 'AAAA-BBBB', side: 1 });
    expect(text).not.toMatch(/sheet code/i);
    expect(text).not.toMatch(/page \d+ of/i);
  });
});

describe('the Batch log (side 1; CONTRACT § 3)', () => {
  const baseline = page1(oliveOilVersion);

  it('holds its fields and words, from the built pens', () => {
    expect(baseline).toContain('Churn date');
    expect(baseline).toMatch(/<h2 class="region-name lf-title">Batch log<\/h2>/);
    expect(baseline).toContain('Out of machine');
    expect(baseline).toContain('Churn duration');
    expect(baseline).toContain('At draw');
    expect(baseline).toContain('mark one');
    for (const word of [...PRINTED_MARK_ONE_OPTIONS, ...SEGMENT_OPTIONS.exitConsistency, ...SEGMENT_OPTIONS.airiness]) {
      expect(baseline, word).toContain(word);
    }
    expect(baseline).toContain('Exit consistency');
    expect(baseline).toContain('Airiness');
    expect(baseline).not.toContain('(estimated)');
    expect(baseline).not.toContain('Time to draw temp');
    expect(baseline).toContain('At the machine · Ingredient notes · Next time');
  });

  it('draws 8 option boxes: three marks, three exit words, three airiness words, less the shared three', () => {
    expect(classCount(baseline, 'lf-box')).toBe(PRINTED_MARK_ONE_OPTIONS.length + SEGMENT_OPTIONS.exitConsistency.length + SEGMENT_OPTIONS.airiness.length);
  });

  it.each(VERSIONS.map((version) => [version.id, version]))('%s: 14 writing lines and a page identical to every other but its foot', (_id, version) => {
    const markup = page1(version);
    expect(classCount(markup, 'lf-line')).toBe(14);
    const sansFoot = (m) => m.replace(/<div class="lf-foot">[^<]*<\/div>/, '<div class="lf-foot"></div>');
    expect(sansFoot(markup)).toBe(sansFoot(baseline));
    expect(markup).toContain(`<div class="lf-foot">${footFor(version, 1).replace(/&/g, '&amp;')}</div>`);
    expect(markup.endsWith('</div></div>')).toBe(true);
    expect(markup.lastIndexOf('lf-foot')).toBeGreaterThan(markup.lastIndexOf('lf-notes'));
  });
});

describe('the Tasting log (side 2; CONTRACT §§ 2, 4), per recipe', () => {
  it.each(VERSIONS.map((version) => [version.id, version]))('%s: its own declared scales and problems and nothing else', (_id, version) => {
    const markup = page2(version);
    const declaredAxes = version.declaredAxes ?? [];
    const declaredFlaws = version.declaredFlaws ?? [];
    expect(classCount(markup, 'lf-srow')).toBe(CORE_COUNT + declaredAxes.length);
    expect(classCount(markup, 'lf-opt')).toBe(PRINTED_MARK_ONE_OPTIONS.length + SEGMENT_OPTIONS.meltStyle.length + CORE_PROBLEM_WORDS.length + declaredFlaws.length);
    expect(classCount(problemsRow(markup), 'lf-opt')).toBe(CORE_PROBLEM_WORDS.length + declaredFlaws.length);
    expect(classCount(markup, 'lf-mrow--plain')).toBe(1);
    expect(classCount(markup, 'lf-line')).toBe(5);
    expect(markup).not.toContain('Every recipe');
    expect(markup).not.toContain('This recipe only');
    // Core words, for every recipe.
    for (const word of [...CORE_AXIS_NAMES, ...CORE_PROBLEM_WORDS]) expect(markup, word).toContain(word);
    // Declared words, from this version's own list.
    for (const scale of declaredAxes) expect(markup, scale.name).toContain(scale.name);
    for (const word of declaredFlaws) expect(problemsRow(markup), word).toContain(word);
    // Every scale row has its five ticks, the ends tall.
    expect(classCount(markup, 'lf-tick')).toBe(5 * (CORE_COUNT + declaredAxes.length));
    expect(classCount(markup, 'lf-tick--end')).toBe(2 * (CORE_COUNT + declaredAxes.length));
  });

  it.each(VERSIONS.map((version) => [version.id, version]))('%s: the page holds its fields, the foot says Side 2 of 2 with this version\'s code', (_id, version) => {
    const markup = page2(version);
    expect(markup).toMatch(/<h2 class="region-name lf-title">Tasting log<\/h2>/);
    for (const word of ['Tasted', 'Tempering', 'Tasting temperature', 'Melt test', 'g lost at 20 min', 'Melt style', 'From freezer', 'Any problems?', 'select all that apply', 'How did it turn out?']) {
      expect(markup, word).toContain(word);
    }
    for (const word of [...PRINTED_MARK_ONE_OPTIONS, ...SEGMENT_OPTIONS.meltStyle]) expect(markup, word).toContain(word);
    expect(markup).toContain(`${sheetCode(version)} · Side 2 of 2</div>`);
    expect(markup).not.toContain('Time to draw temp');
    // Melt test's unit stands under its line (CONTRACT § 4).
    expect(markup).toContain('lf-field lf-field--under');
    expect(classCount(markup, 'lf-field--under')).toBe(1);
  });

  it('Olive Oil v1: Body and Oil after the four core, thin / heavy and faint / strong, and Bitter after the four core problems', () => {
    const markup = page2(oliveOilVersion);
    const names = [...markup.matchAll(/<span class="axis-mark__name">([^<]*)<\/span>/g)].map((m) => m[1]);
    expect(names).toEqual([...CORE_AXIS_NAMES, 'Body', 'Oil']);
    expect(markup).toContain('thin');
    expect(markup).toContain('heavy');
    expect(markup).toContain('faint');
    expect(markup).toContain('strong');
    const words = [...problemsRow(markup).matchAll(/<\/span>([^<]+)<\/span>/g)].map((m) => m[1]);
    expect(words).toEqual([...CORE_PROBLEM_WORDS, 'Bitter']);
  });

  it('a version that declares nothing prints no declared scale and no declared problem: four rows, four boxes', () => {
    const none = { ...oliveOilVersion, declaredAxes: [], declaredFlaws: [] };
    const markup = page2(none);
    expect(classCount(markup, 'lf-srow')).toBe(CORE_COUNT);
    expect(classCount(problemsRow(markup), 'lf-opt')).toBe(CORE_PROBLEM_WORDS.length);
  });

  it('a version with two declared problems (built from Olive Oil v1, not seed data) puts all six boxes in the one row', () => {
    const two = { ...oliveOilVersion, declaredFlaws: [...oliveOilVersion.declaredFlaws, 'Waxy'] };
    const markup = page2(two);
    expect(classCount(markup, 'lf-mrow--plain')).toBe(1);
    const row = problemsRow(markup);
    expect(classCount(row, 'lf-opt')).toBe(6);
    expect(classCount(row, 'lf-mark')).toBe(1);
    expect(row).toContain('Waxy');
    expect(classCount(markup, 'lf-srow')).toBe(CORE_COUNT + 2);
  });
});

describe('stored words render as text, never as markup (T-04-18)', () => {
  it('escapes a Sheet title and a declared problem that hold markup', () => {
    const hostile = { ...oliveOilVersion, sheetTitle: '<img src=x onerror=alert(1)>', declaredFlaws: ['<b>strong</b>'] };
    const markup = page2(hostile).concat(renderToStaticMarkup(<BatchLogPage footText={footFor(hostile, 1)} />));
    expect(markup).not.toContain('<img');
    expect(markup).not.toContain('<b>');
    expect(markup).toContain('&lt;img');
    expect(markup).toContain('&lt;b&gt;strong&lt;/b&gt;');
  });
});

describe('the pages import no literal list of scales or problems', () => {
  it('PrintLogPages.jsx reads them from the catalog and the version', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const src = readFileSync(fileURLToPath(new URL('./PrintLogPages.jsx', import.meta.url)), 'utf8').replace(/\/\/.*$/gm, '');
    // The names come from the tables and the version themselves, so no literal is repeated here.
    const names = [
      ...coreScaleDefinitions(SEED_CATALOG.scales).map((axis) => axis.name),
      ...oliveOilVersion.declaredAxes.map((axis) => axis.name),
      ...problemNames(SEED_CATALOG.problems),
      ...oliveOilVersion.declaredFlaws,
    ];
    for (const word of names) expect(src, word).not.toContain(word);
    expect(src).toContain('axesForVersion(version, catalog)');
    expect(src).toContain('problemNames(catalog.problems)');
    expect(src).not.toContain('DEFECTS');
  });

  it('prints the scales and problems of the catalog it is given', () => {
    const catalog = {
      ...SEED_CATALOG,
      scales: SEED_CATALOG.scales.map((row) => (row.key === 'hardness' ? { ...row, name: 'Firmness', low: 'mushy' } : row)),
      problems: SEED_CATALOG.problems.map((row) => (row.id === 'greasy-film' ? { ...row, name: 'Slick' } : row)),
    };
    const markup = page2(oliveOilVersion, catalog);
    expect(markup).toContain('Firmness');
    expect(markup).toContain('mushy');
    expect(problemsRow(markup)).toContain('Slick');
    expect(problemsRow(markup)).not.toContain('Greasy film');
  });
});
