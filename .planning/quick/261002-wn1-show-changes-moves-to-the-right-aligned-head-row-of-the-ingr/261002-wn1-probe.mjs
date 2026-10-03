// Quick task 261002-wn1's probe: below 724 the recipe's Show changes moves from
// the band to the right-aligned head row of the Ingredients region (sketch 011
// decision 30, addendum option 3, Mark 2026-10-02; boards
// 393-show-changes-head.html and 723-show-changes-head.html). Measures the BUILT
// app (app/dist) in Playwright's WebKit and system Chrome, before and after.
//
//   node 261002-wn1-probe.mjs baseline        (build of the unchanged source; writes the JSON)
//   node 261002-wn1-probe.mjs tracer          (webkit, 393 coarse, coconut-v2)
//   node 261002-wn1-probe.mjs matrix          (every cell vs the baseline, boards, keyboard, crossing, print)
//   node 261002-wn1-probe.mjs tracer,matrix
//
// Serves the build and the repo through the 03.5 harness's own ephemeral
// 127.0.0.1 servers; never requests Mark's :4173 preview, :5173 or the sketch
// server on :8011, and starts no Vite process. Every non-127.0.0.1 request is
// aborted, every pen is opened in a throwaway context and nothing is saved. A
// reading here is evidence about two engines, not about Mark's iPhone or iPad.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261002-wn1-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const COCONUT_V1 = '/notebook/coconut/coconut-v1';
const COCONUT_V2 = '/notebook/coconut/coconut-v2';
const COCONUT_V2_BATCH = '/notebook/coconut/coconut-v2/batch/coconut-v2-batch-01';

const CHANGES_RE = /^(Show|Hide) changes$/;

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). Rects are relative to the
// Ingredients region's top-left unless named otherwise. A display:none element
// reports a 0x0 rect at the origin, so only laid-out elements get a rect.
async function readPage() {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const region = document.querySelector('section.ingredient-table-region');
  const rg = region.getBoundingClientRect();
  const laidOut = (el) => getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
  const rel = (el) => {
    if (!laidOut(el)) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left - rg.left, y: r.top - rg.top, width: r.width, height: r.height, right: r.right - rg.left, bottom: r.bottom - rg.top };
  };
  const band = document.querySelector('header.notebook-band');
  const buttons = [...document.querySelectorAll('button')];

  const controls = buttons
    .filter((b) => /^(Show|Hide) changes$/.test(b.textContent.trim()))
    .map((b) => {
      const cs = getComputedStyle(b);
      return {
        label: b.textContent.trim(),
        where: band && band.contains(b) ? 'band' : b.closest('.ingredient-table-region__head') ? 'head' : 'other',
        display: cs.display,
        rect: rel(b),
        tabindex: b.getAttribute('tabindex'),
        ariaPressed: b.getAttribute('aria-pressed'),
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        textDecorationLine: cs.textDecorationLine,
      };
    });

  const nextVersion = band ? [...band.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Next version') : null;
  let acts = null;
  if (nextVersion) {
    const el = nextVersion.parentElement;
    const children = [...el.children].filter(laidOut).map((c) => ({ label: c.textContent.trim(), rect: rel(c) }));
    const tops = children.map((c) => c.rect.y);
    acts = {
      height: el.getBoundingClientRect().height,
      children,
      oneLine: tops.every((t) => Math.abs(t - tops[0]) <= 0.5),
    };
  }

  const heading = [...document.querySelectorAll('h2.region-name')].find((h) => h.textContent.trim() === 'Ingredients');
  const headEl = document.querySelector('.ingredient-table-region__head');
  const table = document.querySelector('.ingredient-table');
  const tableTop = table.getBoundingClientRect().top - rg.top;
  const headOrHeading = headEl || heading;
  return {
    innerWidth: window.innerWidth,
    pointerCoarse: matchMedia('(pointer: coarse)').matches,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    controls,
    acts,
    region: { width: rg.width, height: rg.height, overflowX: getComputedStyle(region).overflowX },
    heading: heading ? rel(heading) : null,
    head: headEl ? rel(headEl) : null,
    tableTop,
    tableDocTop: table.getBoundingClientRect().top + window.scrollY,
    gapToTable: headOrHeading ? tableTop - (headOrHeading.getBoundingClientRect().bottom - rg.top) : null,
    struck: table.querySelectorAll('.struck-value').length,
    hasChangesParam: new URLSearchParams(location.search).has('changes'),
    bandHasJump: band ? band.querySelector('a.notebook-jump') !== null : false,
    bandButtons: band ? [...band.querySelectorAll('button')].map((b) => b.textContent.trim()) : [],
  };
}

// ---------------------------------------------------------------------------
// Node-side helpers (openAppPage, openPen and openRecording follow
// 261002-wdn-probe.mjs).
async function openAppPage(browser, appUrl, route, { width, coarse }) {
  const options = coarse
    ? { ...devices['iPhone 14'], viewport: { width, height: 1100 }, screen: { width, height: 1100 } }
    : { viewport: { width, height: 1100 } };
  const context = await browser.newContext(options);
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ingredient-table');
  await page.waitForSelector('h2.notebook-version__identity');
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openAppPage: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

const changesButton = (page) => page.getByRole('button', { name: CHANGES_RE });
const roleCount = (page) => changesButton(page).count();

async function openPen(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.getByLabel('Salt, grams', { exact: true }).waitFor();
}

async function openRecording(page) {
  await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click();
  await page.waitForSelector('.ingredient-table__as-made-field');
}

async function openTasting(page) {
  await page.locator('header.notebook-band').getByRole('button', { name: 'Record a tasting', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).first().waitFor({ state: 'visible' });
}

// Activates the one Show changes button, wherever it is, and reads the page;
// then activates Hide changes and records what is left.
async function showThenHide(page) {
  await page.getByRole('button', { name: 'Show changes', exact: true }).click();
  await page.getByRole('button', { name: 'Hide changes', exact: true }).waitFor();
  const read = await page.evaluate(readPage);
  read.roleCount = await roleCount(page);
  await page.getByRole('button', { name: 'Hide changes', exact: true }).click();
  await page.getByRole('button', { name: 'Show changes', exact: true }).waitFor();
  const after = await page.evaluate(readPage);
  read.struckAfterHide = after.struck;
  read.labelAfterHide = after.controls.map((c) => c.label);
  read.hasChangesParamAfterHide = after.hasChangesParam;
  return read;
}

const CASES = [
  { id: 'v2-reading', route: COCONUT_V2 },
  { id: 'v2-show-changes', route: COCONUT_V2, run: showThenHide },
  { id: 'v1-reading', route: COCONUT_V1 },
  { id: 'v2-pen', route: COCONUT_V2, prepare: openPen },
  { id: 'v2-record', route: COCONUT_V2_BATCH, prepare: openRecording },
  { id: 'v2-tasting', route: COCONUT_V2, prepare: openTasting, belowOnly: true },
];
const WIDTHS = [
  { width: 320, coarse: true },
  { width: 375, coarse: true },
  { width: 393, coarse: true },
  { width: 723, coarse: false },
  { width: 723, coarse: true },
  { width: 724, coarse: false },
  { width: 724, coarse: true },
  { width: 1366, coarse: false },
  { width: 1366, coarse: true },
];
const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

const pointer = (w) => (w.coarse ? 'coarse' : 'fine');
const cellKey = (engine, w, id) => `${engine}|${w.width}|${pointer(w)}|${id}`;
const round = (n) => (n === null || n === undefined ? n : Math.round(n * 100) / 100);

async function measure(browser, servers, w, c) {
  const { context, page } = await openAppPage(browser, servers.appUrl, c.route, w);
  try {
    if (c.prepare) await c.prepare(page);
    if (c.run) return await c.run(page);
    const read = await page.evaluate(readPage);
    read.roleCount = await roleCount(page);
    return read;
  } finally {
    await context.close();
  }
}

const near = (a, b, tol = 0.5) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;

// ---------------------------------------------------------------------------
async function runBaseline(servers) {
  const results = {};
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      for (const w of WIDTHS) {
        for (const c of CASES) {
          if (c.belowOnly && w.width >= 724) continue;
          const key = cellKey(engine, w, c.id);
          const read = await measure(browser, servers, w, c);
          results[key] = read;
          const label = key;
          // Blocking precondition: the band is what this plan assumes.
          if (c.id === 'v2-reading' && w.width === 393) {
            countedCheck(read.controls.length === 1 && read.controls[0].where === 'band', `${label}: exactly one Show changes, in the band (${JSON.stringify(read.controls.map((x) => x.where))})`);
            countedCheck(read.bandButtons.includes('Record a tasting'), `${label}: band holds Record a tasting (wmz landed): ${JSON.stringify(read.bandButtons)}`);
            countedCheck(read.bandHasJump, `${label}: band holds Go to batch (wmy landed)`);
          }
          if (c.id === 'v1-reading' || c.id === 'v2-pen' || c.id === 'v2-record' || c.id === 'v2-tasting') {
            countedCheck(read.controls.length === 0, `${label}: no Show/Hide changes control (read ${read.controls.length})`);
          }
          if (c.id === 'v2-show-changes') {
            countedCheck(read.struck > 0 && read.struckAfterHide === 0, `${label}: struck ${read.struck} above 0, after Hide ${read.struckAfterHide}`);
          }
          countedCheck(read.roleCount === read.controls.length, `${label}: role count ${read.roleCount} equals DOM count ${read.controls.length}`);
          if (c.id === 'v2-reading' && w.width <= 393) {
            // Decision 30 measured a wrap here; log, do not assert.
            console.log(JSON.stringify({ cell: key, actsOneLine: read.acts?.oneLine, actsHeight: round(read.acts?.height) }));
          }
        }
      }
    } finally {
      await browser.close();
    }
  }
  if (failures.length === 0) await writeFile(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
}

async function runTracer(servers, baseline) {
  const browser = await webkit.launch();
  const w = { width: 393, coarse: true };
  const { context, page } = await openAppPage(browser, servers.appUrl, COCONUT_V2, w);
  try {
    const read = await page.evaluate(readPage);
    const rc = await roleCount(page);
    countedCheck(read.controls.length === 1 && read.controls[0].where === 'head', `tracer: one control, in the head (${JSON.stringify(read.controls.map((x) => x.where))})`);
    countedCheck(rc === 1, `tracer: role count ${rc} is 1`);
    countedCheck(read.head !== null && read.controls[0]?.rect && near(read.controls[0].rect.right, read.head.right), `tracer: control right ${read.controls[0]?.rect?.right} on head right ${read.head?.right}`);
    countedCheck(read.acts?.oneLine === true, `tracer: the band's acts sit on one line (height ${round(read.acts?.height)})`);
    const expected = baseline['webkit|393|coarse|v2-show-changes'].struck;
    await changesButton(page).click();
    await page.getByRole('button', { name: 'Hide changes', exact: true }).waitFor();
    const shown = await page.evaluate(readPage);
    countedCheck(shown.controls.length === 1 && shown.controls[0].label === 'Hide changes' && shown.controls[0].where === 'head', `tracer: Hide changes, still in the head`);
    countedCheck(shown.struck === expected && expected > 0, `tracer: struck ${shown.struck} equals baseline ${expected}`);
    await changesButton(page).click();
    await page.getByRole('button', { name: 'Show changes', exact: true }).waitFor();
    const hidden = await page.evaluate(readPage);
    countedCheck(hidden.controls[0]?.label === 'Show changes' && hidden.struck === 0, `tracer: Show changes again, struck ${hidden.struck}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// matrix: every cell against the baseline, then the boards, keyboard, crossing
// and print.
const rectNear = (a, b, tol = 0.5) =>
  (a === null && b === null) ||
  (a !== null && b !== null && ['x', 'y', 'width', 'height', 'right', 'bottom'].every((k) => near(a[k], b[k], tol)));

function sameAsBaseline(label, read, base) {
  countedCheck(read.controls.length === base.controls.length, `${label}: controls ${read.controls.length} vs ${base.controls.length}`);
  read.controls.forEach((c, i) => {
    const b = base.controls[i];
    if (!b) return;
    countedCheck(c.label === b.label && c.where === b.where && c.tabindex === b.tabindex && rectNear(c.rect, b.rect), `${label}: control ${i} ${JSON.stringify([c.label, c.where, c.rect])} vs ${JSON.stringify([b.label, b.where, b.rect])}`);
  });
  countedCheck((read.acts === null) === (base.acts === null), `${label}: acts presence`);
  if (read.acts && base.acts) {
    countedCheck(near(read.acts.height, base.acts.height), `${label}: acts height ${read.acts.height} vs ${base.acts.height}`);
    countedCheck(read.acts.children.length === base.acts.children.length, `${label}: acts children`);
    read.acts.children.forEach((c, i) => {
      const b = base.acts.children[i];
      if (b) countedCheck(c.label === b.label && rectNear(c.rect, b.rect), `${label}: acts child ${i} ${c.label}`);
    });
  }
  countedCheck(rectNear(read.heading, base.heading), `${label}: heading ${JSON.stringify(read.heading)} vs ${JSON.stringify(base.heading)}`);
  countedCheck(near(read.tableTop, base.tableTop), `${label}: tableTop ${read.tableTop} vs ${base.tableTop}`);
  countedCheck(near(read.overflow, base.overflow), `${label}: overflow ${read.overflow} vs ${base.overflow}`);
  countedCheck(read.head === null, `${label}: no head row`);
  countedCheck(read.struck === base.struck, `${label}: struck ${read.struck} vs ${base.struck}`);
}

function belowReading(label, read, base, w) {
  const c = read.controls[0];
  countedCheck(read.controls.length === 1 && c.where === 'head' && read.roleCount === 1 && c.tabindex === '0', `${label}: one control, in the head, role count ${read.roleCount}, tabindex ${c?.tabindex}`);
  countedCheck(c.ariaPressed === null, `${label}: no aria-pressed`);
  countedCheck(read.acts?.oneLine === true, `${label}: acts on one line`);
  countedCheck(read.acts && read.acts.height <= base.acts.height + 0.5, `${label}: acts height ${round(read.acts?.height)} at most ${round(base.acts.height)}`);
  const want = w.coarse ? 44 : 24;
  countedCheck(near(c.rect.height, want) && read.head && near(read.head.height, c.rect.height), `${label}: control ${round(c.rect.height)} and head ${round(read.head?.height)} are ${want}`);
  countedCheck(read.head && near(c.rect.right, read.head.right), `${label}: control right ${round(c.rect.right)} on head right ${round(read.head?.right)}`);
  countedCheck(read.heading && near(read.heading.x, 0), `${label}: heading left ${read.heading?.x}`);
  countedCheck(c.textDecorationLine.includes('underline') && c.fontWeight === '400', `${label}: underlined ${c.textDecorationLine}, weight ${c.fontWeight}`);
  countedCheck(near(read.overflow, 0), `${label}: overflow ${read.overflow}`);
}

function belowShowChanges(label, read, base) {
  const c = read.controls[0];
  countedCheck(read.controls.length === 1 && c.where === 'head' && c.label === 'Hide changes' && read.roleCount === 1, `${label}: Hide changes, in the head, role count ${read.roleCount}`);
  countedCheck(read.struck === base.struck && read.struck > 0, `${label}: struck ${read.struck} vs baseline ${base.struck}`);
  countedCheck(read.struckAfterHide === 0, `${label}: struck after Hide ${read.struckAfterHide}`);
  countedCheck(read.labelAfterHide.length === 1 && read.labelAfterHide[0] === 'Show changes', `${label}: after Hide ${JSON.stringify(read.labelAfterHide)}`);
  countedCheck(read.hasChangesParam === true && read.hasChangesParamAfterHide === false, `${label}: changes param ${read.hasChangesParam} then ${read.hasChangesParamAfterHide}`);
}

async function runCells(servers, baseline, cellsOut) {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      for (const w of WIDTHS) {
        for (const c of CASES) {
          if (c.belowOnly && w.width >= 724) continue;
          const key = cellKey(engine, w, c.id);
          const base = baseline[key];
          countedCheck(base !== undefined, `${key}: baseline cell exists`);
          if (!base) continue;
          const read = await measure(browser, servers, w, c);
          countedCheck(read.roleCount === read.controls.length, `${key}: role count ${read.roleCount} equals DOM count ${read.controls.length}`);
          const below = w.width < 724;
          if (below && c.id === 'v2-reading') belowReading(key, read, base, w);
          else if (below && c.id === 'v2-show-changes') belowShowChanges(key, read, base);
          else sameAsBaseline(key, read, base);
          if (below && (c.id === 'v1-reading' || c.id === 'v2-pen' || c.id === 'v2-record' || c.id === 'v2-tasting')) {
            countedCheck(read.controls.length === 0 && read.head === null, `${key}: no control, no head`);
          }
          const cell = {
            cell: key,
            controls: read.controls.map((x) => `${x.where}:${x.label}`),
            headHeight: round(read.head?.height ?? null),
            controlWH: read.controls[0]?.rect ? [round(read.controls[0].rect.width), round(read.controls[0].rect.height)] : null,
            actsHeight: [round(base.acts?.height ?? null), round(read.acts?.height ?? null)],
            oneLine: read.acts ? read.acts.oneLine : null,
            tableDocTop: [round(base.tableDocTop), round(read.tableDocTop)],
            struck: read.struck,
            overflow: round(read.overflow),
          };
          cellsOut.push(cell);
          console.log(JSON.stringify(cell));
        }
      }
    } finally {
      await browser.close();
    }
  }
}

// In-page board reader: the idx-th region, relative to its own top-left.
async function readBoardRegion(idx) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const region = document.querySelectorAll('section.ingredient-table-region')[idx];
  const rg = region.getBoundingClientRect();
  const rel = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - rg.left, y: r.top - rg.top, width: r.width, height: r.height, right: r.right - rg.left, bottom: r.bottom - rg.top };
  };
  const headEl = region.querySelector('.ingredient-table-region__head');
  const heading = region.querySelector('h2.region-name');
  const button = [...region.querySelectorAll('button')].find((b) => /^(Show|Hide) changes$/.test(b.textContent.trim()));
  const table = region.querySelector('.ingredient-table');
  const tableTop = table.getBoundingClientRect().top - rg.top;
  const cs = button ? getComputedStyle(button) : null;
  const above = headEl || heading;
  return {
    head: headEl ? rel(headEl) : null,
    heading: rel(heading),
    control: button ? { label: button.textContent.trim(), rect: rel(button), color: cs.color, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, textDecorationLine: cs.textDecorationLine } : null,
    tableTop,
    gapToTable: tableTop - (above.getBoundingClientRect().bottom - rg.top),
    struck: table.querySelectorAll('.struck-value').length,
  };
}

async function readBoardActs(page) {
  return page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Record a tasting');
    const el = button.parentElement;
    const kids = [...el.children].map((c) => {
      const r = c.getBoundingClientRect();
      return { label: c.textContent.trim(), top: r.top, mid: r.top + r.height / 2 };
    });
    // The 723 board draws its text controls shorter than the filled one and centres them
    // (decision 30), so tops differ there; one line means the vertical centres agree.
    return { height: el.getBoundingClientRect().height, labels: kids.map((k) => k.label), oneLine: kids.every((k) => Math.abs(k.mid - kids[0].mid) <= 1), topsEqual: kids.every((k) => Math.abs(k.top - kids[0].top) <= 0.5) };
  });
}

async function runBoards(servers, baseline) {
  const pairs = [
    { file: '393-show-changes-head.html', w: { width: 393, coarse: true } },
    { file: '723-show-changes-head.html', w: { width: 723, coarse: false } },
  ];
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      for (const { file, w } of pairs) {
        const label = `${engine} ${file}`;
        const app1 = await measure(browser, servers, w, CASES[0]);
        const app2 = await measure(browser, servers, w, CASES[1]);
        const app3 = await measure(browser, servers, w, CASES[2]);
        const { context, page } = await openBoard(browser, servers.repoUrl, file);
        try {
          const count3 = await page.locator('section.ingredient-table-region').count();
          countedCheck(count3 === 3, `${label}: the board holds ${count3} regions (want 3)`);
          if (count3 !== 3) continue;
          const [b1, b2, b3] = [await page.evaluate(readBoardRegion, 0), await page.evaluate(readBoardRegion, 1), await page.evaluate(readBoardRegion, 2)];
          const ac = app1.controls[0];
          const bc = b1.control;
          // Panel 1 against Coconut v2 with changes hidden.
          countedCheck(near(app1.head.height, b1.head.height), `${label} p1: head height app ${round(app1.head.height)} board ${round(b1.head.height)}`);
          countedCheck(rectNear(app1.heading, b1.heading), `${label} p1: heading app ${JSON.stringify(app1.heading)} board ${JSON.stringify(b1.heading)}`);
          countedCheck(['x', 'y', 'width', 'height'].every((k) => near(ac.rect[k], bc.rect[k])), `${label} p1: control rect app ${JSON.stringify(ac.rect)} board ${JSON.stringify(bc.rect)}`);
          for (const k of ['color', 'fontFamily', 'fontSize', 'fontWeight', 'textDecorationLine']) {
            countedCheck(ac[k] === bc[k], `${label} p1: control ${k} app "${ac[k]}" board "${bc[k]}"`);
          }
          countedCheck(near(app1.gapToTable, b1.gapToTable), `${label} p1: gapToTable app ${round(app1.gapToTable)} board ${round(b1.gapToTable)}`);
          countedCheck(near(app1.tableTop, b1.tableTop), `${label} p1: tableTop app ${round(app1.tableTop)} board ${round(b1.tableTop)}`);
          // Panel 2 against Coconut v2 with changes shown (the reading taken before Hide).
          const a2 = app2.controls[0];
          const c2 = b2.control;
          countedCheck(a2.label === c2.label, `${label} p2: label app ${a2.label} board ${c2.label}`);
          countedCheck(near(a2.rect.width, c2.rect.width) && near(a2.rect.height, c2.rect.height), `${label} p2: control app ${round(a2.rect.width)}x${round(a2.rect.height)} board ${round(c2.rect.width)}x${round(c2.rect.height)}`);
          countedCheck(near(app2.head.height, b2.head.height), `${label} p2: head height app ${round(app2.head.height)} board ${round(b2.head.height)}`);
          // Panel 3 against Coconut v1.
          countedCheck(app3.head === null && b3.head === null && b3.control === null, `${label} p3: no head, no control`);
          countedCheck(rectNear(app3.heading, b3.heading), `${label} p3: heading app ${JSON.stringify(app3.heading)} board ${JSON.stringify(b3.heading)}`);
          countedCheck(near(app3.gapToTable, b3.gapToTable), `${label} p3: gapToTable app ${round(app3.gapToTable)} board ${round(b3.gapToTable)}`);
          // The band's acts (panel 1). Widths are not compared (decision 30).
          const acts = await readBoardActs(page);
          const appLabels = app1.acts.children.map((x) => x.label);
          countedCheck(JSON.stringify(acts.labels) === JSON.stringify(appLabels), `${label} band: labels app ${JSON.stringify(appLabels)} board ${JSON.stringify(acts.labels)}`);
          countedCheck(acts.oneLine && app1.acts.oneLine, `${label} band: one line (board by centres), app ${app1.acts.oneLine} board ${acts.oneLine}`);
          // Decision 30 records the 723 fine boards drawing the filled primitive 41 tall against the app's 44.
          const heightOk = near(app1.acts.height, acts.height);
          if (w.coarse) countedCheck(heightOk, `${label} band: acts height app ${round(app1.acts.height)} board ${round(acts.height)}`);
          console.log(JSON.stringify({ board: label, actsHeight: { app: round(app1.acts.height), board: round(acts.height), within05: heightOk, boardTopsEqual: acts.topsEqual }, p1: { app: { head: round(app1.head.height), control: ac.rect, gap: round(app1.gapToTable) }, board: { head: round(b1.head.height), control: bc.rect, gap: round(b1.gapToTable) } }, p3: { appGap: round(app3.gapToTable), boardGap: round(b3.gapToTable) } }));
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
}

async function runKeyboard(servers) {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      for (const w of [{ width: 393, coarse: true }, { width: 723, coarse: false }]) {
        const label = `${engine} keyboard ${w.width} ${pointer(w)}`;
        const { context, page } = await openAppPage(browser, servers.appUrl, COCONUT_V2, w);
        try {
          const control = changesButton(page);
          const handle = await control.elementHandle();
          await control.focus();
          await page.keyboard.press('Enter');
          await page.getByRole('button', { name: 'Hide changes', exact: true }).waitFor();
          const afterEnter = await page.evaluate(readPage);
          const sameAfterEnter = await page.evaluate((h) => document.activeElement === h, handle);
          countedCheck(afterEnter.controls[0].label === 'Hide changes' && sameAfterEnter && afterEnter.struck > 0, `${label}: Enter -> Hide changes, focus kept ${sameAfterEnter}, struck ${afterEnter.struck}`);
          await page.keyboard.press('Space');
          await page.getByRole('button', { name: 'Show changes', exact: true }).waitFor();
          const afterSpace = await page.evaluate(readPage);
          const sameAfterSpace = await page.evaluate((h) => document.activeElement === h, handle);
          countedCheck(afterSpace.controls[0].label === 'Show changes' && sameAfterSpace && afterSpace.struck === 0, `${label}: Space -> Show changes, focus kept ${sameAfterSpace}, struck ${afterSpace.struck}`);
          // Focus-ring clearance: reach the control by keyboard (Shift+Tab, Tab) so :focus-visible applies.
          await page.keyboard.press('Shift+Tab');
          await page.keyboard.press('Tab');
          const ring = await page.evaluate((h) => {
            const cs = getComputedStyle(h);
            const region = h.closest('section.ingredient-table-region');
            const rr = region.getBoundingClientRect();
            const hr = h.getBoundingClientRect();
            return {
              focused: document.activeElement === h,
              clearance: rr.right - hr.right,
              outlineStyle: cs.outlineStyle,
              outlineWidth: cs.outlineWidth,
              outlineOffset: cs.outlineOffset,
              boxShadow: cs.boxShadow,
              regionOverflowX: getComputedStyle(region).overflowX,
            };
          }, handle);
          countedCheck(ring.focused, `${label}: reached the control by keyboard`);
          console.log(JSON.stringify({ focusRing: label, ...ring }));
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
}

async function runCrossing(servers) {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      const label = `${engine} crossing`;
      const { context, page } = await openAppPage(browser, servers.appUrl, COCONUT_V2, { width: 724, coarse: false });
      try {
        await page.getByRole('button', { name: 'Show changes', exact: true }).click();
        await page.getByRole('button', { name: 'Hide changes', exact: true }).waitFor();
        await page.setViewportSize({ width: 723, height: 1100 });
        await page.locator('.ingredient-table-region__head').getByRole('button', { name: 'Hide changes', exact: true }).waitFor();
        const at723 = await page.evaluate(readPage);
        countedCheck(at723.controls.length === 1 && at723.controls[0].where === 'head' && at723.controls[0].label === 'Hide changes' && at723.struck > 0, `${label}: at 723 the head reads Hide changes, struck ${at723.struck}`);
        await page.locator('.ingredient-table-region__head').getByRole('button', { name: 'Hide changes', exact: true }).click();
        await page.getByRole('button', { name: 'Show changes', exact: true }).waitFor();
        const hidden = await page.evaluate(readPage);
        countedCheck(hidden.struck === 0, `${label}: Hide at 723 gives struck ${hidden.struck}`);
        await page.setViewportSize({ width: 724, height: 1100 });
        await page.locator('header.notebook-band').getByRole('button', { name: 'Show changes', exact: true }).waitFor();
        const at724 = await page.evaluate(readPage);
        countedCheck(at724.controls.length === 1 && at724.controls[0].where === 'band' && at724.controls[0].label === 'Show changes' && at724.head === null, `${label}: at 724 the band reads Show changes, head ${JSON.stringify(at724.head)}`);
      } finally {
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
}

async function runPrint(servers) {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      const label = `${engine} print`;
      const { context, page } = await openAppPage(browser, servers.appUrl, COCONUT_V2, { width: 393, coarse: true });
      try {
        const display = () =>
          page.evaluate(() => ({
            control: getComputedStyle(document.querySelector('.ingredient-table-region__head .text-control')).display,
            heading: getComputedStyle([...document.querySelectorAll('h2.region-name')].find((h) => h.textContent.trim() === 'Ingredients')).display,
          }));
        await page.emulateMedia({ media: 'print' });
        const printed = await display();
        countedCheck(printed.control === 'none' && printed.heading !== 'none', `${label}: control ${printed.control}, heading ${printed.heading}`);
        await page.emulateMedia({ media: 'screen' });
        const screen = await display();
        countedCheck(screen.control !== 'none', `${label}: on screen the control computes ${screen.control}`);
      } finally {
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
}

async function runMatrix(servers, baseline) {
  const cells = [];
  await runCells(servers, baseline, cells);
  await runBoards(servers, baseline);
  await runKeyboard(servers);
  await runCrossing(servers);
  await runPrint(servers);
}

// ---------------------------------------------------------------------------
const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
if (groups.length === 0 || !groups.every((g) => ['baseline', 'tracer', 'matrix'].includes(g))) {
  console.log('usage: node 261002-wn1-probe.mjs baseline|tracer|matrix[,...]');
  process.exit(2);
}
const servers = await startServers();
try {
  const baseline = groups.includes('baseline') ? null : JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
  for (const group of groups) {
    if (group === 'baseline') await runBaseline(servers);
    if (group === 'tracer') await runTracer(servers, baseline);
    if (group === 'matrix') await runMatrix(servers, baseline);
  }
} finally {
  await servers.close();
}
finish(failures, count, `261002-wn1 probe (${groups.join(',')})`);
