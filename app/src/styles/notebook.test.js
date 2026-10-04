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
import { readAllRules, readCustomProperties, resolveTokenPx } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const NOTEBOOK_CSS_PATH = path.join(STYLES_DIR, 'notebook.css');
const MAIN_JSX_PATH = path.join(STYLES_DIR, '..', 'main.jsx');
const TOKENS_CSS_PATH = path.join(STYLES_DIR, 'tokens.css');

const notebookCssSource = readFileSync(NOTEBOOK_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');
const tokens = readCustomProperties(readFileSync(TOKENS_CSS_PATH, 'utf8'));

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

  test("notebook.css carries exactly five named @media steps, in file order — 1366px (the log-column record-pen rules apply only where the log genuinely is a 350px column, 03.5-13 Task 1), then 1365.98px (the log moves below the Sheet and the folds/band rhythm default closed, sketch 011 decisions 16/18, 03.5-15), then 723.98px (the phone forms — the stacked band, the 20px margin and the list-form table go together, sketch 011 decision 16), then 724px (the small info labels start-aligned, sketch 011 decision 34), then (pointer: coarse) (the notebook fields' iOS focus-zoom floor, 260927-758)", () => {
    const mediaConditions = [...new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media))];
    expect(mediaConditions).toEqual([
      '(min-width: 1366px)',
      '(max-width: 1365.98px)',
      '(max-width: 723.98px)',
      '(min-width: 724px)',
      '(pointer: coarse)',
    ]);
  });
});

// The band's rhythm moves with the folds (sketch 011 decision 18, Mark,
// 2026-09-27: "Move with the folds"; 03.5-15 Task 2): the interim
// 1499.98px rung (plan 12) is gone, and its four rhythm declarations now
// sit as the first rules under (max-width: 1365.98px) — the same cut
// where the log moves below the Sheet and the folds default closed.
describe("the band's rhythm at 1366 (sketch 011 decision 18, 03.5-15 Task 2)", () => {
  test('the 1499.98px interim rung no longer exists', () => {
    expect(rules.some((rule) => rule.media === '(max-width: 1499.98px)')).toBe(false);
  });

  test('.notebook, .notebook-band and .notebook-band__grid carry their rhythm declarations under (max-width: 1365.98px)', () => {
    const narrow = rules.filter((rule) => rule.media === '(max-width: 1365.98px)');
    const notebookRule = narrow.find((rule) => rule.selector === '.notebook');
    const bandRule = narrow.find((rule) => rule.selector === '.notebook-band');
    const gridRule = narrow.find((rule) => rule.selector === '.notebook-band__grid');
    expect(notebookRule).toBeDefined();
    expect(bandRule).toBeDefined();
    expect(gridRule).toBeDefined();
    expect(notebookRule.declarations).toContain('gap: var(--app-notebook-band-rhythm)');
    expect(bandRule.declarations).toContain('gap: var(--gap-m)');
    expect(bandRule.declarations).toContain('padding: var(--app-notebook-band-pad-t-narrow) 0 var(--gap-m)');
    expect(gridRule.declarations).toContain('gap: var(--gap-l)');
  });
});

describe("the notebook fields' iOS focus-zoom floor under a coarse pointer (260927-758)", () => {
  const appCssPath = path.join(STYLES_DIR, 'app.css');
  const appCssSource = readFileSync(appCssPath, 'utf8');
  const appRules = readAllRules(appCssSource);

  test('a rule under (pointer: coarse) has the base field rule\'s exact selectors, reads --sheet-type-note for font-size, and sets no font-family', () => {
    const rule = rules.find(
      (rule) => rule.selector === '.notebook-field .ink-field, .notebook-field input, .notebook-field textarea' && rule.media === '(pointer: coarse)',
    );
    expect(rule, 'expected a (pointer: coarse) rule with the base field selectors').toBeTruthy();
    expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-note\)/);
    expect(rule.declarations).not.toMatch(/font-family/);
  });

  test('the coarse rule reads the same font-size token as app.css\'s own (pointer: coarse) .ink-field, .prose-field floor', () => {
    const appFloorRule = appRules.find((rule) => rule.selector === '.ink-field, .prose-field' && rule.media === '(pointer: coarse)');
    expect(appFloorRule, 'expected app.css\'s (pointer: coarse) .ink-field, .prose-field rule').toBeTruthy();
    expect(appFloorRule.declarations).toMatch(/font-size:\s*var\(--sheet-type-note\)/);
  });

  test('the top-level base field rule still reads --app-notebook-size-body', () => {
    const rule = rules.find(
      (rule) => rule.selector === '.notebook-field .ink-field, .notebook-field input, .notebook-field textarea' && rule.media === undefined,
    );
    expect(rule, 'expected the top-level base field rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-size:\s*var\(--app-notebook-size-body\)/);
  });

  test('the coarse rule sits after the base rule in file order, so source order alone decides', () => {
    const baseIndex = rules.findIndex(
      (rule) => rule.selector === '.notebook-field .ink-field, .notebook-field input, .notebook-field textarea' && rule.media === undefined,
    );
    const coarseIndex = rules.findIndex(
      (rule) => rule.selector === '.notebook-field .ink-field, .notebook-field input, .notebook-field textarea' && rule.media === '(pointer: coarse)',
    );
    expect(baseIndex).toBeGreaterThan(-1);
    expect(coarseIndex).toBeGreaterThan(baseIndex);
  });
});

describe('the Why is typed in the prose-field role (sketch 011 decision 17)', () => {
  test('a top-level rule scopes the Why to .notebook-field .notebook-ceremony__why in the text face, note size and leading, pen blue, and no rule anywhere carries the bare .notebook-ceremony__why selector', () => {
    const rule = rules.find((rule) => rule.selector === '.notebook-field .notebook-ceremony__why' && rule.media === undefined);
    expect(rule, 'expected a top-level .notebook-field .notebook-ceremony__why rule').toBeTruthy();
    expect(rule.declarations).toMatch(/font-family:\s*var\(--face-text\)/);
    expect(rule.declarations).toMatch(/font-size:\s*var\(--sheet-type-note\)/);
    expect(rule.declarations).toMatch(/line-height:\s*var\(--sheet-leading-note\)/);
    expect(rule.declarations).toMatch(/color:\s*var\(--sheet-pen-blue\)/);
    expect(rule.declarations).not.toMatch(/--face-hand|--size-hand|--leading-hand/);

    const bareRule = rules.find((rule) => rule.selector === '.notebook-ceremony__why');
    expect(bareRule, 'expected no rule with the bare .notebook-ceremony__why selector').toBeUndefined();
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

describe("the upright rail's line connects marks only (03.5-24 Task 1, G-03.5-5, upright-393.html's measured geometry)", () => {
  const uprightRules = () => rules.filter((rule) => rule.selector.startsWith('.notebook-upright'));

  test("the connector is the row's ::before, drawn ahead of the positioned link, and no ::after remains", () => {
    const connector = rules.find((rule) => rule.selector === '.notebook-upright__row:not(:last-child)::before' && rule.media === undefined);
    expect(connector, 'expected a top-level .notebook-upright__row:not(:last-child)::before rule').toBeTruthy();
    expect(connector.declarations).toMatch(/position:\s*absolute/);
    expect(rules.some((rule) => rule.selector.includes('.notebook-upright__row') && rule.selector.includes('::after'))).toBe(false);
  });

  test('the connector runs from just below the mark to the next row, every offset composed from existing tokens', () => {
    const connector = rules.find((rule) => rule.selector === '.notebook-upright__row:not(:last-child)::before');
    const top = connector.declarations.match(/top:\s*calc\(([^;]*)\);/)?.[1] ?? '';
    expect(top).toContain('var(--app-notebook-history-name-line-h)');
    expect(top).toContain('var(--app-notebook-history-mark-size)');
    expect(top).toContain('var(--gap-hair)');
    expect(connector.declarations).toMatch(/bottom:\s*calc\(-1 \* var\(--gap-s\)\)/);
    expect(connector.declarations).toMatch(/left:\s*calc\(var\(--app-notebook-history-mark-size\) \/ 2 - var\(--app-rule-row\) \/ 2\)/);
  });

  test("the link's grid aligns its items to the start, so the mark box and the title share the row's top", () => {
    const link = rules.find((rule) => rule.selector === '.notebook-upright__link' && rule.media === undefined);
    expect(link.declarations).toMatch(/align-items:\s*start/);
    expect(link.declarations).toMatch(/min-height:\s*var\(--touch-min\)/);
  });

  test('the mark box is as tall as the title line, with its mark centred in it', () => {
    const box = rules.find((rule) => rule.selector === '.notebook-upright__mark-box' && rule.media === undefined);
    expect(box, 'expected a top-level .notebook-upright__mark-box rule').toBeTruthy();
    expect(box.declarations).toMatch(/display:\s*flex/);
    expect(box.declarations).toMatch(/align-items:\s*center/);
    expect(box.declarations).toMatch(/height:\s*var\(--app-notebook-history-name-line-h\)/);
  });

  test('no z-index in any upright rule: paint order comes from tree order and positioning', () => {
    for (const rule of uprightRules()) expect(rule.declarations).not.toMatch(/z-index/);
  });
});

describe("the History rail's line runs first node to last (03.5-24 Task 3, G-03.5-5)", () => {
  test('the strip is positioned and as wide as its content, so the track and the node list share one box', () => {
    const rule = rules.find((rule) => rule.selector === '.notebook-history__strip' && rule.media === undefined);
    expect(rule, 'expected a top-level .notebook-history__strip rule').toBeTruthy();
    expect(rule.declarations).toMatch(/position:\s*relative/);
    expect(rule.declarations).toMatch(/width:\s*max-content/);
  });

  test("the track's left is the row's padding plus half a mark, its width one node width plus one node gap per join from the entry count, and it has no right edge (261001-den)", () => {
    const rule = rules.find((rule) => rule.selector === '.notebook-history__track' && rule.media === undefined);
    expect(rule.declarations).toMatch(/left:\s*calc\(var\(--gap-xs\) \+ var\(--app-notebook-history-mark-size\) \/ 2\)/);
    expect(rule.declarations).toMatch(
      /width:\s*calc\(\(var\(--app-notebook-history-count\) - 1\) \* \(var\(--app-notebook-history-node-w\) \+ var\(--app-notebook-history-node-gap\)\)\)/,
    );
    expect(rule.declarations).not.toMatch(/(^|[\s;])right\s*:/);
  });

  test('the node list keeps the same padding the track offsets read, and no history rule carries a z-index', () => {
    const nodes = rules.find((rule) => rule.selector === '.notebook-history__nodes' && rule.media === undefined);
    expect(nodes.declarations).toMatch(/padding:\s*0 var\(--gap-xs\)/);
    for (const rule of rules.filter((rule) => rule.selector.startsWith('.notebook-history'))) {
      expect(rule.declarations).not.toMatch(/z-index/);
    }
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

describe('the record pen\'s own frame, scoped to where the log genuinely is a column (03.5-13 Task 1, decisions_recorded 1)', () => {
  const logColumnSelectors = [
    '.notebook-log .batch-margin--pen',
    '.notebook-log .axis-mark__stops, .notebook-log .axis-mark__anchors',
    '.notebook-log .axis-mark__stop',
    '.notebook-log .field-row__label',
  ];

  test('each of the four log-column pen rules is found under (min-width: 1366px), and nowhere else', () => {
    for (const selector of logColumnSelectors) {
      const scoped = rules.find((rule) => rule.selector === selector && rule.media === '(min-width: 1366px)');
      expect(scoped, `expected "${selector}" under (min-width: 1366px)`).toBeTruthy();

      const topLevel = rules.find((rule) => rule.selector === selector && rule.media === undefined);
      expect(topLevel, `expected no top-level "${selector}" rule`).toBeUndefined();

      const handBack = rules.find((rule) => rule.selector === selector && rule.media === '(max-width: 1365.98px)');
      expect(handBack, `expected no (max-width: 1365.98px) "${selector}" rule`).toBeUndefined();
    }
  });

  test('the (min-width: 1366px) block declares the same narrow values as before — 216px track, the joined touch cell, and a full-width label', () => {
    const trackRule = rules.find(
      (rule) => rule.selector === '.notebook-log .axis-mark__stops, .notebook-log .axis-mark__anchors' && rule.media === '(min-width: 1366px)',
    );
    expect(trackRule.declarations).toMatch(/width:\s*var\(--sheet-track-stop-narrow\)/);

    const stopRule = rules.find((rule) => rule.selector === '.notebook-log .axis-mark__stop' && rule.media === '(min-width: 1366px)');
    expect(stopRule.declarations).toMatch(/width:\s*var\(--touch-stop-width\)/);
    expect(stopRule.declarations).toMatch(/height:\s*var\(--sheet-touch-stop-height\)/);
    expect(stopRule.declarations).toMatch(/flex-basis:\s*var\(--touch-stop-width\)/);

    const labelRule = rules.find((rule) => rule.selector === '.notebook-log .field-row__label' && rule.media === '(min-width: 1366px)');
    expect(labelRule.declarations).toMatch(/max-width:\s*100%/);

    const penRule = rules.find((rule) => rule.selector === '.notebook-log .batch-margin--pen' && rule.media === '(min-width: 1366px)');
    expect(penRule.declarations).toMatch(/max-width:\s*none/);
  });

  test('the ceremony wrap rule stays unconditional, at top level', () => {
    const rule = rules.find(
      (rule) => rule.selector === '.notebook-log .save-ceremony, .notebook-log .pen-foot__controls' && rule.media === undefined,
    );
    expect(rule, 'expected the ceremony wrap rule to stay top-level').toBeTruthy();
    expect(rule.declarations).toMatch(/flex-wrap:\s*wrap/);
  });
});

// G-03.5-6 (03.5-25): the log's churn cells stand in the boards' equal
// columns. notebook.css used to override only the cells' gap, so the grid
// kept the Sheet's content-sized track list and packed the measurements to
// the left. The cascade carries the counts: 2 from 1366 (the base rule),
// 5 from 724 to 1365.98, 2 at 723.98 and below.
describe("the log's churn cells take the boards' track list (G-03.5-6, 03.5-25)", () => {
  const cellsRule = (media) =>
    rules.find((rule) => rule.selector === '.notebook-log .batch-row__cells' && rule.media === media);

  test('the base rule, which applies from 1366, declares two equal columns', () => {
    expect(cellsRule(undefined), 'expected a top-level .notebook-log .batch-row__cells rule').toBeTruthy();
    expect(cellsRule(undefined).declarations).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  });

  test('the 1365.98px block declares five equal columns', () => {
    expect(cellsRule('(max-width: 1365.98px)'), 'expected a .notebook-log .batch-row__cells rule under (max-width: 1365.98px)').toBeTruthy();
    expect(cellsRule('(max-width: 1365.98px)').declarations).toMatch(/grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\)/);
  });

  test('the 723.98px block declares two equal columns again', () => {
    expect(cellsRule('(max-width: 723.98px)'), 'expected a .notebook-log .batch-row__cells rule under (max-width: 723.98px)').toBeTruthy();
    expect(cellsRule('(max-width: 723.98px)').declarations).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  });
});

// G-03.5-6 (03.5-25): the log's vertical rhythm reads the boards' values in
// the log scope only (Sheet-context rules in app.css are untouched), the
// grid gap between sections is 18, and the tasting grids take their own
// column count.
describe("the log's vertical rhythm and the tasting grids (G-03.5-6, 03.5-25)", () => {
  const topLevel = (selector) => rules.find((rule) => rule.selector === selector && rule.media === undefined);

  test('the log section gap is the log group gap, which puts 18 between the head and the cells', () => {
    expect(topLevel('.notebook-log .batch-row').declarations).toMatch(/gap:\s*var\(--app-notebook-log-group-gap\)/);
  });

  test("the cell's label-to-value gap is the hairline, the value line is normal leading, and the plan line has no top margin", () => {
    expect(topLevel('.notebook-log .batch-row__cell'), 'expected a top-level .notebook-log .batch-row__cell rule').toBeTruthy();
    expect(topLevel('.notebook-log .batch-row__cell').declarations).toMatch(/gap:\s*var\(--gap-hair\)/);
    expect(topLevel('.notebook-log .batch-row__cell-value').declarations).toMatch(/line-height:\s*normal/);
    expect(topLevel('.notebook-log .batch-row__plan').declarations).toMatch(/margin-top:\s*0/);
  });

  test("the churn cells' own grid, a direct child of .batch-margin, has no top margin; the tasting grids keep the Sheet's", () => {
    const churn = topLevel('.notebook-log .batch-margin > .batch-row__cells');
    expect(churn, 'expected a top-level .notebook-log .batch-margin > .batch-row__cells rule').toBeTruthy();
    expect(churn.declarations).toMatch(/margin-top:\s*0/);
  });

  test('the tasting grids take four columns from 724 to 1365.98 and two at 723.98 and below, with no base rule of their own', () => {
    const selector = '.notebook-log .tasting-reading .batch-row__cells';
    const mid = rules.find((rule) => rule.selector === selector && rule.media === '(max-width: 1365.98px)');
    const narrow = rules.find((rule) => rule.selector === selector && rule.media === '(max-width: 723.98px)');
    expect(mid, `expected "${selector}" under (max-width: 1365.98px)`).toBeTruthy();
    expect(mid.declarations).toMatch(/grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
    expect(narrow, `expected "${selector}" under (max-width: 723.98px)`).toBeTruthy();
    expect(narrow.declarations).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
    expect(topLevel(selector)).toBeUndefined();
  });
});

// G-03.5-R2-4 (03.5-28): plan 23 made the phone band's grid align-items:
// stretch so the Version fold head fills its row (G-03.5-4), which also
// stretched the Rename and Next version forms to the full row. The grid goes
// back to the base rule's align-items, and only the Version section, the one
// grid child holding a fold head, stretches.
describe("the phone band's forms keep their content width, the Version fold head the row (G-03.5-R2-4, 03.5-28)", () => {
  const narrowRule = (selector) =>
    rules.find((rule) => rule.selector === selector && rule.media === '(max-width: 723.98px)');

  test('the 723.98px band grid is a flex column and declares no align-items, so the base rule applies', () => {
    const grid = narrowRule('.notebook-band__grid');
    expect(grid, 'expected a .notebook-band__grid rule under (max-width: 723.98px)').toBeTruthy();
    expect(grid.declarations).toMatch(/display:\s*flex/);
    expect(grid.declarations).toMatch(/flex-direction:\s*column/);
    expect(grid.declarations).not.toMatch(/align-items/);
  });

  test('the 723.98px block stretches the Version section alone', () => {
    const version = narrowRule('.notebook-version');
    expect(version, 'expected a .notebook-version rule under (max-width: 723.98px)').toBeTruthy();
    expect(version.declarations).toMatch(/align-self:\s*stretch/);
  });
});

// Quick 261002-wmy: the band's Go to batch row (sketch 011 decision 30,
// 393-phone-log.html and 723-phone-log.html) shows below 724 only. The base
// rule hides it; the existing 723.98px block gives it the board's row box; its
// two spans ride the fold-row control and count typography.
describe('the Go to batch row shows below 724 only (quick 261002-wmy)', () => {
  const jumpRules = rules.filter((rule) => rule.selector === '.notebook-jump');
  const jumpRule = (media) => jumpRules.find((rule) => rule.media === media);

  test('a top-level .notebook-jump rule hides the row', () => {
    const base = jumpRule(undefined);
    expect(base, 'expected a top-level .notebook-jump rule').toBeTruthy();
    expect(base.declarations).toMatch(/display:\s*none/);
  });

  test("the 723.98px block gives it the board's row box, every value a token or keyword", () => {
    const narrow = jumpRule('(max-width: 723.98px)');
    expect(narrow, 'expected a .notebook-jump rule under (max-width: 723.98px)').toBeTruthy();
    const d = narrow.declarations;
    expect(d).toMatch(/display:\s*flex/);
    expect(d).toMatch(/width:\s*100%/);
    expect(d).toMatch(/min-height:\s*var\(--touch-min\)/);
    expect(d).toMatch(/align-items:\s*center/);
    expect(d).toMatch(/justify-content:\s*space-between/);
    expect(d).toMatch(/gap:\s*var\(--app-notebook-recipe-rail-gap\)/);
    expect(d).toMatch(/text-decoration:\s*none/);
    expect(d).toMatch(/color:\s*inherit/);
  });

  test('no .notebook-jump rule sits under the desktop or the 1365.98px steps', () => {
    expect(jumpRule('(min-width: 1366px)')).toBeUndefined();
    expect(jumpRule('(max-width: 1365.98px)')).toBeUndefined();
  });

  test('its control word and status ride the fold-row control and count rules', () => {
    const control = rules.find((rule) => rule.selector.includes('.notebook .fold-row__control'));
    const count = rules.find((rule) => rule.selector.includes('.notebook .fold-row__count'));
    expect(control.selector).toContain('.notebook .notebook-jump__control');
    expect(count.selector).toContain('.notebook .notebook-jump__status');
  });
});

// Sketch 011 decision 34 A (Mark, 2026-10-04; brief task 9; quick 261004-igr):
// from 724 up the small info labels read from the left. Row A of the boards
// info-labels-bands.html and info-labels-log.html, declaration for
// declaration. Below 724 nothing changes.
describe('small info labels start-aligned from 724 (sketch 011 decision 34 A, Mark 2026-10-04; quick 261004-igr)', () => {
  const wide = rules.filter((rule) => rule.media === '(min-width: 724px)');
  const wideRule = (selector) => wide.find((rule) => rule.selector === selector);

  test('the fold row starts its content at the left; the top-level rule keeps space-between', () => {
    const rule = wideRule('.notebook .fold-row');
    expect(rule, 'expected .notebook .fold-row under (min-width: 724px)').toBeTruthy();
    expect(rule.declarations).toMatch(/justify-content:\s*flex-start/);
    const base = rules.find((r) => r.selector === '.notebook .fold-row' && r.media === undefined);
    expect(base.declarations).toMatch(/justify-content:\s*space-between/);
  });

  test('the count and the jump status carry the dot, in CSS so the accessible names stay as they are', () => {
    const rule = wideRule('.notebook .fold-row__count::before, .notebook .notebook-jump__status::before');
    expect(rule, 'expected the shared ::before rule under (min-width: 724px)').toBeTruthy();
    expect(rule.declarations).toMatch(/content:\s*"\\00b7"/);
    expect(rule.declarations).toMatch(/margin-right:\s*var\(--app-notebook-recipe-rail-gap\)/);
    const others = rules.filter((r) => r !== rule && /::before/.test(r.selector) && /fold-row__count|notebook-jump__status/.test(r.selector));
    expect(others).toEqual([]);
  });

  test('the Go to batch row starts at the left too, and is not shown here (brief task 3 shows it)', () => {
    const rule = wideRule('.notebook-jump');
    expect(rule, 'expected .notebook-jump under (min-width: 724px)').toBeTruthy();
    expect(rule.declarations).toMatch(/justify-content:\s*flex-start/);
    expect(rule.declarations).not.toMatch(/display/);
  });

  test("the batch head runs the date then the actions, 32px apart; the top-level rule keeps space-between and its 16px", () => {
    const rule = wideRule('.notebook-log .batch-row__head');
    expect(rule, 'expected .notebook-log .batch-row__head under (min-width: 724px)').toBeTruthy();
    expect(rule.declarations).toMatch(/justify-content:\s*flex-start/);
    expect(rule.declarations).toMatch(/gap:\s*var\(--gap-l\)/);
    const base = rules.find((r) => r.selector === '.notebook-log .batch-row__head' && r.media === undefined);
    expect(base.declarations).toMatch(/justify-content:\s*space-between/);
    expect(base.declarations).toMatch(/gap:\s*var\(--app-notebook-log-head-outer-gap\)/);
  });
});

// Mark, 2026-09-27: Rename, Next version and the buttons beside them get narrower
// when hovered or clicked. Measured on the build (quick 261004-ly5): app.css's
// `button:hover, select:hover` (0,1,1) outranks these single-class rest rules
// (0,1,0) and sets border-width 2px and padding 6px on every classed App button,
// so a filled or outline action lost 26px of width on hover and while pressed
// (chrome 2 x (1 + 20) = 42 down to 2 x (2 + 6) = 16), and a link gained 12.
// The two-class hover rules below take the box back (the way .text-control:hover
// does), keeping DESIGN.md's Hover-Is-Weight Rule: the border goes to a whole
// 2px and the padding loses exactly that much.
describe('band buttons keep their resting box on hover and press (quick 261004-ly5; Mark 2026-09-27)', () => {
  const top = (selector) => rules.find((rule) => rule.selector === selector && rule.media === undefined);
  const ACTION_HOVER = '.notebook-action:hover, .notebook-action--outline:hover';
  const LINK_HOVER = '.notebook-link:hover';
  const CALC = /^calc\(var\((--[\w-]+)\) \+ var\((--[\w-]+)\) - var\((--[\w-]+)\)\)$/;
  const declared = (rule, property) => {
    const match = rule.declarations.match(new RegExp(`(?:^|;|\\s)${property}\\s*:\\s*([^;]+);`));
    return match ? match[1].trim().replace(/\s+/g, ' ') : undefined;
  };

  test('the filled and outline actions keep their box on hover: border-plus-padding at rest equals hover, per axis', () => {
    const hover = top(ACTION_HOVER);
    expect(hover, `expected a top-level ${ACTION_HOVER} rule`).toBeTruthy();
    expect(declared(hover, 'border-width')).toBe('var(--rule-hover)');

    const hoverPadding = declared(hover, 'padding');
    expect(hoverPadding, 'expected a padding declaration on the hover rule').toBeTruthy();
    const [hoverV, hoverH] = hoverPadding.match(/calc\(.+?\)\)/g);
    const hoverVMatch = hoverV.match(CALC);
    const hoverHMatch = hoverH.match(CALC);
    expect(hoverVMatch, `expected "${hoverV}" to be calc(a + b - c)`).toBeTruthy();
    expect(hoverHMatch, `expected "${hoverH}" to be calc(a + b - c)`).toBeTruthy();

    for (const selector of ['.notebook-action', '.notebook-action--outline']) {
      const rest = top(selector);
      expect(rest, `expected a top-level ${selector} rule`).toBeTruthy();
      expect(declared(rest, 'padding')).toBe('var(--gap-s) var(--gap-m)');
      expect(declared(rest, 'border')).toMatch(/^var\(--app-rule-row\) solid /);
    }

    const px = (name) => resolveTokenPx(tokens, name);
    const restBorder = px('--app-rule-row');
    const hoverBorder = px('--rule-hover');
    const calcPx = (m) => px(m[1]) + px(m[2]) - px(m[3]);
    // vertical: 1 + 12 = 2 + 11; horizontal: 1 + 20 = 2 + 19
    expect(restBorder + px('--gap-s')).toBe(hoverBorder + calcPx(hoverVMatch));
    expect(restBorder + px('--gap-m')).toBe(hoverBorder + calcPx(hoverHMatch));
    expect([hoverVMatch[1], hoverVMatch[2], hoverVMatch[3]]).toEqual(['--gap-s', '--app-rule-row', '--rule-hover']);
    expect([hoverHMatch[1], hoverHMatch[2], hoverHMatch[3]]).toEqual(['--gap-m', '--app-rule-row', '--rule-hover']);
  });

  test('the link keeps padding 0 on hover and gets no new hover look', () => {
    const hover = top(LINK_HOVER);
    expect(hover, `expected a top-level ${LINK_HOVER} rule`).toBeTruthy();
    expect(declared(hover, 'padding')).toBe('0');
    expect(hover.declarations).not.toMatch(/border|text-decoration|font-weight|color|background/);
  });

  test('both hover rules are top-level, two simple selectors each (0,2,0, above app.css button:hover at 0,1,1), and carry no !important', () => {
    for (const selector of [ACTION_HOVER, LINK_HOVER]) {
      const rule = top(selector);
      expect(rule, `expected a top-level ${selector} rule (not inside a media block)`).toBeTruthy();
      for (const part of selector.split(', ')) {
        expect(part).toMatch(/^\.notebook-[\w-]+:hover$/);
      }
      expect(rule.declarations).not.toMatch(/!important/);
    }
    expect(rules.filter((rule) => rule.media !== undefined && /:hover/.test(rule.selector) && /notebook-(action|link)/.test(rule.selector))).toEqual([]);
  });
});

describe('the ceremony fields and actions share the App control radius (sketch 011 decision 38 B; quick 261004-ly7)', () => {
  const FIELD_SELECTOR = '.notebook-field .ink-field, .notebook-field input, .notebook-field textarea';

  test.each([FIELD_SELECTOR, '.notebook-action', '.notebook-action--outline'])('the top-level "%s" rule declares border-radius: var(--app-radius-control)', (selector) => {
    const rule = rules.find((r) => r.selector === selector && r.media === undefined);
    expect(rule, `expected a top-level ${selector} rule`).toBeTruthy();
    expect(rule.declarations).toMatch(/border-radius:\s*var\(--app-radius-control\)/);
  });
});
