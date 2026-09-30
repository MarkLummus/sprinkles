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

  test("notebook.css carries exactly four named @media steps, in file order — 1366px (the log-column record-pen rules apply only where the log genuinely is a 350px column, 03.5-13 Task 1), then 1365.98px (the log moves below the Sheet and the folds/band rhythm default closed, sketch 011 decisions 16/18, 03.5-15), then 723.98px (the phone forms — the stacked band, the 20px margin and the list-form table go together, sketch 011 decision 16), then (pointer: coarse) (the notebook fields' iOS focus-zoom floor, 260927-758)", () => {
    const mediaConditions = [...new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media))];
    expect(mediaConditions).toEqual([
      '(min-width: 1366px)',
      '(max-width: 1365.98px)',
      '(max-width: 723.98px)',
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

  test("the track's left is the row's padding plus half a mark, its right the padding plus a node's width less half a mark", () => {
    const rule = rules.find((rule) => rule.selector === '.notebook-history__track' && rule.media === undefined);
    expect(rule.declarations).toMatch(/left:\s*calc\(var\(--gap-xs\) \+ var\(--app-notebook-history-mark-size\) \/ 2\)/);
    expect(rule.declarations).toMatch(
      /right:\s*calc\(var\(--gap-xs\) \+ var\(--app-notebook-history-node-w\) - var\(--app-notebook-history-mark-size\) \/ 2\)/,
    );
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
