// Quick task 261003-9bz's probe: the Instructions section is left out when it
// would show nothing (Mark, 2026-10-03, option 1). Measures the BUILT app
// (app/dist) in Playwright's WebKit and system Chrome at 393 coarse, 723 fine,
// 1366 coarse (Mark's iPad reports 1366 with pointer coarse) and 1920 fine,
// before and after the change.
//
//   node 261003-9bz-probe.mjs baseline   (build of the unchanged source; writes the JSON)
//   node 261003-9bz-probe.mjs tracer     (webkit, 393, s21-reading: content checks)
//   node 261003-9bz-probe.mjs gap        (that cell: content + gap checks)
//   node 261003-9bz-probe.mjs matrix     (every cell: content + gap checks)
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers;
// never requests Mark's :4173 preview, the dev server or the sketch server on
// :8011, and starts no Vite process. The pen and the record pen open in
// throwaway browser contexts and nothing is saved. A reading here is evidence
// about two engines, not about Mark's iPhone or iPad; the device is his to
// check. The print cells emulate print media at the screen viewport; they do
// not paginate.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261003-9bz-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const S21 = '/notebook/strawberry/strawberry-v2-1';
const S21_BATCH = '/notebook/strawberry/strawberry-v2-1/batch/strawberry-v2-1-batch-01';
const S1 = '/notebook/strawberry/strawberry-v1';
const S1_BATCH = '/notebook/strawberry/strawberry-v1/batch/strawberry-v1-batch-01';
const C2 = '/notebook/coconut/coconut-v2';
const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). textContent, not innerText:
// headings are uppercased by CSS. Absolute boxes are rect + scroll.
async function readSheet() {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  const px = (v) => parseFloat(v) || 0;
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
  };
  const page = document.querySelector('.recipe-page');
  const pageRect = page.getBoundingClientRect();
  const pageStyle = getComputedStyle(page);
  const childBottom = (el) => {
    let max = -Infinity;
    for (const kid of el.children) {
      const b = kid.getBoundingClientRect().bottom + px(getComputedStyle(kid).marginBottom);
      if (b > max) max = b;
    }
    return max;
  };
  const trailing =
    pageRect.bottom - px(pageStyle.paddingBottom) - px(pageStyle.borderBottomWidth) - childBottom(page);
  // The content extent of a region: its last child's bottom edge (with margin)
  // measured from the region's own top, plus the region's own bottom padding
  // and border.
  const extent = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return childBottom(el) - r.top + px(s.paddingBottom) + px(s.borderBottomWidth);
  };
  const ingredientsH2 = [...document.querySelectorAll('h2.region-name')].find((h) => h.textContent.trim() === 'Ingredients');
  const methodRegion = document.querySelector('section.method-region');
  const sideRegion = document.querySelector('.side-region');
  const ingredientRegion = document.querySelector('.ingredient-table-region');
  return {
    innerWidth: window.innerWidth,
    presence: {
      methodRegion: methodRegion !== null,
      instructionsSection: document.querySelector('section[aria-label="Instructions"]') !== null,
      instructionsH2: [...document.querySelectorAll('h2')].some((h) => h.textContent.trim() === 'Instructions'),
      beforeYouStart: page.textContent.includes('Before you start'),
      steps: document.querySelectorAll('li.method-step').length,
      notes: document.querySelectorAll('.method-region .authored__notes li').length,
      penFoot: document.querySelector('.pen-foot') !== null,
    },
    landmarks: [...document.querySelectorAll('section[aria-label], aside[aria-label], nav[aria-label]')].map(
      (el) => `${el.tagName}:${el.getAttribute('aria-label')}`,
    ),
    article: {
      box: box(page),
      className: page.className,
      gridTemplateColumns: pageStyle.gridTemplateColumns,
      gridTemplateAreas: pageStyle.gridTemplateAreas,
      gridTemplateRows: pageStyle.gridTemplateRows,
      rowGap: pageStyle.rowGap,
      paddingBottom: pageStyle.paddingBottom,
      borderBottomWidth: pageStyle.borderBottomWidth,
      trailing,
    },
    boxes: {
      band: box(document.querySelector('.notebook-band')),
      recipeBand: box(document.querySelector('.recipe-band')),
      ingredientsH2: box(ingredientsH2),
      table: box(document.querySelector('.ingredient-table')),
      side: box(sideRegion),
      formulation: box(document.querySelector('.formulation-note-region')),
      margin: box(document.querySelector('.margin-region')),
      method: box(methodRegion),
      penFoot: box(document.querySelector('.pen-foot')),
      log: box(document.querySelector('.notebook-log')),
    },
    extents: { I: extent(ingredientRegion), S: extent(sideRegion), M: extent(methodRegion) },
    docHeight: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
}

// ---------------------------------------------------------------------------
// Node-side helpers.
async function clickFirst(page, role, name) {
  await page.getByRole(role, { name }).first().click();
}

async function showChanges(page) {
  await clickFirst(page, 'button', 'Show changes');
  await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
}

async function openPen(page) {
  await clickFirst(page, 'button', 'Next version');
  await page.getByLabel('Version name').waitFor();
}

async function openRecording(page) {
  await clickFirst(page, 'button', /^Record (another|a batch)$/);
  await page.waitForSelector('.pen-foot');
}

async function emulatePrint(page) {
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
}

// kind: 'hidden' (the section leaves) or 'kept' (measures as the baseline).
const CASES = [
  { id: 's21-reading', route: S21, kind: 'hidden' },
  { id: 's21-show-changes', route: S21, kind: 'hidden', prepare: showChanges },
  { id: 's21-recording', route: S21_BATCH, kind: 'hidden', prepare: openRecording, recording: true },
  { id: 's21-print', route: S21, kind: 'hidden', prepare: emulatePrint },
  { id: 'c2-reading', route: C2, kind: 'hidden' },
  { id: 'c2-show-changes', route: C2, kind: 'hidden', prepare: showChanges },
  { id: 's21-pen', route: S21, kind: 'kept', prepare: openPen, emptyKept: true },
  { id: 's1-reading', route: S1, kind: 'kept', steps: true },
  { id: 's1-recording', route: S1_BATCH, kind: 'kept', steps: true, prepare: openRecording, recording: true },
  { id: 's1-print', route: S1, kind: 'kept', steps: true, prepare: emulatePrint },
  { id: 'mex4-reading', route: MEX4, kind: 'kept', steps: true },
  { id: 'mex4-show-changes', route: MEX4, kind: 'kept', steps: true, prepare: showChanges },
];
const WIDTHS = [
  { width: 393, coarse: true },
  { width: 723, coarse: false },
  { width: 1366, coarse: true },
  { width: 1920, coarse: false },
];
const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

const cellKey = (engine, width, id) => `${engine}|${width}|${id}`;

async function measure(browser, servers, { width, coarse }, c) {
  const { context, page } = await openApp(browser, servers.appUrl, c.route, { width, height: 1100, coarse });
  try {
    await page.waitForSelector('.recipe-page');
    await page.waitForSelector('h2.notebook-version__identity');
    if (c.prepare) await c.prepare(page);
    return await page.evaluate(readSheet);
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const near = (a, b, tol) => a != null && b != null && Math.abs(a - b) <= tol;
const round = (n) => (n == null ? null : Math.round(n * 100) / 100);
const sameBox = (label, a, b, tol = 0.5, keys = ['top', 'left', 'width', 'height']) => {
  if (a === null || b === null) {
    countedCheck(a === b, `${label}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
    return;
  }
  for (const k of keys) countedCheck(near(a[k], b[k], tol), `${label}.${k}: ${round(a[k])} vs ${round(b[k])}`);
};

function contentChecks(label, c, after, before) {
  const p = after.presence;
  if (c.kind === 'hidden') {
    countedCheck(!p.methodRegion, `${label}: section.method-region still present`);
    countedCheck(!p.instructionsSection, `${label}: Instructions landmark still present`);
    countedCheck(!p.instructionsH2, `${label}: Instructions h2 still present`);
    countedCheck(!p.beforeYouStart, `${label}: 'Before you start' still present`);
    countedCheck(
      JSON.stringify(after.landmarks) === JSON.stringify(before.landmarks.filter((l) => l !== 'SECTION:Instructions')),
      `${label}: landmarks ${JSON.stringify(after.landmarks)} vs baseline less Instructions ${JSON.stringify(before.landmarks)}`,
    );
  } else {
    countedCheck(JSON.stringify(p) === JSON.stringify(before.presence), `${label}: presence ${JSON.stringify(p)} vs ${JSON.stringify(before.presence)}`);
    countedCheck(JSON.stringify(after.landmarks) === JSON.stringify(before.landmarks), `${label}: landmarks differ`);
    if (c.emptyKept) countedCheck(p.instructionsH2 && p.methodRegion, `${label}: the pen lost its Instructions heading`);
  }
  for (const key of ['band', 'recipeBand', 'ingredientsH2', 'table', 'formulation', 'margin']) {
    sameBox(`${label} ${key}`, after.boxes[key], before.boxes[key]);
  }
  // The side region's height may restretch at two columns; its top, left and
  // width may not move.
  sameBox(`${label} side`, after.boxes.side, before.boxes.side, 0.5, ['top', 'left', 'width']);
  countedCheck(near(after.overflow, before.overflow, 0.5), `${label}: overflow ${after.overflow} vs ${before.overflow}`);
}

function expectedDelta(before) {
  const g = parseFloat(before.article.rowGap);
  const oneColumn = before.article.gridTemplateColumns.trim().split(/\s+/).length === 1;
  const { I, S, M } = before.extents;
  if (oneColumn) return before.boxes.method.height + g;
  return Math.max(I + g + M, S) - Math.max(I, S);
}

function gapChecks(label, c, after, before) {
  if (c.kind === 'kept') {
    countedCheck(near(after.article.box.height, before.article.box.height, 0.5), `${label}: article height ${round(after.article.box.height)} vs ${round(before.article.box.height)}`);
    countedCheck(after.article.className === before.article.className, `${label}: className ${after.article.className} vs ${before.article.className}`);
    sameBox(`${label} method`, after.boxes.method, before.boxes.method);
    countedCheck(near(after.docHeight, before.docHeight, 0.5), `${label}: doc height ${after.docHeight} vs ${before.docHeight}`);
    sameBox(`${label} log`, after.boxes.log, before.boxes.log);
    sameBox(`${label} penFoot`, after.boxes.penFoot, before.boxes.penFoot);
    return null;
  }
  const expected = expectedDelta(before);
  const actual = before.article.box.height - after.article.box.height;
  countedCheck(near(actual, expected, 1), `${label}: article height delta ${round(actual)} vs expected ${round(expected)}`);
  countedCheck(near(after.article.trailing, before.article.trailing, 0.5), `${label}: trailing ${round(after.article.trailing)} vs ${round(before.article.trailing)}`);
  countedCheck(after.article.className.includes('recipe-page--no-method'), `${label}: className ${after.article.className} lacks recipe-page--no-method`);
  countedCheck(!after.article.gridTemplateAreas.includes('method'), `${label}: gridTemplateAreas still names method: ${after.article.gridTemplateAreas}`);
  const methodBottom = before.boxes.method.top + before.boxes.method.height;
  for (const key of ['penFoot', 'log']) {
    const b = before.boxes[key];
    const a = after.boxes[key];
    if (!b) {
      countedCheck(a === null, `${label} ${key}: appeared`);
      continue;
    }
    const below = b.top >= methodBottom - 0.5;
    countedCheck(near(a.top, b.top - (below ? actual : 0), 1), `${label} ${key}: top ${round(a.top)} vs baseline ${round(b.top)} ${below ? `- ${round(actual)}` : '(unmoved)'}`);
    countedCheck(near(a.width, b.width, 0.5) && near(a.height, b.height, 0.5), `${label} ${key}: size changed`);
  }
  const docDrop = before.docHeight - after.docHeight;
  countedCheck(docDrop >= -0.5 && docDrop <= actual + 1, `${label}: doc height drop ${round(docDrop)} outside 0..${round(actual + 1)}`);
  return { expected, actual };
}

async function run(group) {
  const servers = await startServers();
  const results = {};
  try {
    const baseline = group === 'baseline' ? null : JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
    for (const [engine, make] of engines) {
      if ((group === 'tracer' || group === 'gap') && engine !== 'webkit') continue;
      const browser = await make();
      try {
        for (const w of WIDTHS) {
          for (const c of CASES) {
            if ((group === 'tracer' || group === 'gap') && !(w.width === 393 && c.id === 's21-reading')) continue;
            const key = cellKey(engine, w.width, c.id);
            const read = await measure(browser, servers, w, c);
            results[key] = read;
            const label = `${engine} ${w.width} ${c.id}`;
            if (group === 'baseline') {
              const p = read.presence;
              if (c.kind === 'hidden' || c.emptyKept) {
                countedCheck(
                  p.methodRegion && p.instructionsH2 && p.steps === 0 && p.notes === 0,
                  `${label}: baseline should show an empty Instructions section (read ${JSON.stringify(p)})`,
                );
              } else {
                countedCheck(p.steps >= 1, `${label}: baseline should have steps (read ${JSON.stringify(p)})`);
              }
              if (c.recording) countedCheck(p.penFoot, `${label}: baseline recording has no .pen-foot`);
              console.log(
                JSON.stringify({
                  cell: key,
                  cols: read.article.gridTemplateColumns.trim().split(/\s+/).length,
                  rowGap: read.article.rowGap,
                  articleHeight: round(read.article.box.height),
                  methodHeight: round(read.boxes.method?.height),
                  extents: { I: round(read.extents.I), S: round(read.extents.S), M: round(read.extents.M) },
                  trailing: round(read.article.trailing),
                  docHeight: read.docHeight,
                  steps: p.steps,
                  notes: p.notes,
                }),
              );
              continue;
            }
            const before = baseline[key];
            countedCheck(before !== undefined, `${label}: baseline cell exists`);
            if (!before) continue;
            contentChecks(label, c, read, before);
            let delta = null;
            if (group === 'gap' || group === 'matrix') delta = gapChecks(label, c, read, before);
            console.log(
              JSON.stringify({
                cell: key,
                kind: c.kind,
                articleHeight: [round(before.article.box.height), round(read.article.box.height)],
                delta: delta ? { expected: round(delta.expected), actual: round(delta.actual) } : null,
                trailing: [round(before.article.trailing), round(read.article.trailing)],
                docHeight: [before.docHeight, read.docHeight],
                gridRows: [before.article.gridTemplateRows, read.article.gridTemplateRows],
              }),
            );
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
  if (group === 'baseline' && failures.length === 0) {
    await writeFile(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
  }
}

const group = process.argv[2];
if (!['baseline', 'tracer', 'gap', 'matrix'].includes(group)) {
  console.log('usage: node 261003-9bz-probe.mjs baseline|tracer|gap|matrix');
  process.exit(2);
}
await run(group);
finish(failures, count, `261003-9bz probe (${group})`);
