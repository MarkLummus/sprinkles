// 03.5-14: the ladder conformance runner. Runs 03.5-conformance-probe.js
// (the one reader, extended for the ladder, decision 15's cells and the
// rail's paint order) against a sketch 011 board and the built app at the
// matching width, writing paired JSON readings under
// 03.5-conformance-readings/ladder/ and printing every field whose board
// and app values differ (numbers beyond ±1). Imports the plan-10 harness
// unchanged (decisions_recorded — prohibitions).
//
// Usage: node 03.5-conformance-run.mjs <names>
//   names: comma list, e.g. 984,1366,1920,1600-pen,1600-long-history,counts
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  startServers,
  launch,
  openApp,
  openBoard,
  APP_ROUTE,
  saveNextVersion,
  recordAnotherBatch,
} from './03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const READINGS_DIR = path.join(HERE, '03.5-conformance-readings', 'ladder');

// Each name maps to a board file under sketch 011 and to a numeric
// viewport width for the app (openApp, decisions_recorded 2) — coarse only
// at 393 (the 393 board carries the touch floor unconditionally). 1600-pen
// and 1600-long-history share the 1600 viewport with 1600-batch's own
// board comparisons (03.5-08).
const BOARD_FILE = {
  1920: '1920-batch.html',
  '1600-pen': '1600-pen.html',
  '1600-long-history': '1600-long-history.html',
  1366: '1366-batch.html',
  1024: '1024-batch.html',
  984: '984-batch.html',
  983: '983-batch.html',
  723: '723-batch.html',
  393: '393-batch.html',
};

function widthFor(name) {
  if (name === '1600-pen' || name === '1600-long-history') return 1600;
  return Number(name);
}

function coarseFor(name) {
  return name === '393';
}

async function readPageWith(page, probeSource) {
  await page.addScriptTag({ content: probeSource });
  const json = await page.evaluate(() => JSON.stringify(readPage()));
  return JSON.parse(json);
}

// 1600-pen.html depicts the pen open from Next version, edit this step on
// the third step (decisions_recorded — Task 1's own action text): activate
// the reading view's own "Next version" opener, then the third step's own
// "edit this step" control (index 2 — one per method step, in document
// order).
async function openPenAtThirdStep(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.getByRole('button', { name: /edit this step/ }).nth(2).click();
  // The click above scrolls the third step's own reveal into view — every
  // `top` this run reads afterward would otherwise be offset by that
  // scroll (page top negative), which is not a rendering difference.
  // Reset to the top so `top` readings stay comparable to every other
  // name's un-scrolled page.
  await page.evaluate(() => window.scrollTo(0, 0));
}

// The count boards under .planning/sketches/011-options-counts/ each hold
// several panels on one page, distinguished by a caption <p> naming the
// panel (decisions_recorded 5). openBoard's own relative-path resolution
// (a plain URL string) handles the `../011-options-counts/<file>` climb
// with no server change — the URL's own dot-segment collapse does the
// work. readCountPanel finds the caption by SUBSTRING match, then reads
// the element that follows it (the caption's own bordered wrapper's next
// sibling) — generic across every panel shape this run reads, per this
// plan's own action text ("the reader reads the element that follows it").
const COUNT_BOARD_DIR = '../011-options-counts/';
const COUNT_PANELS = [
  { name: 'counts-versions-picked', file: `${COUNT_BOARD_DIR}versions-1-vs-many.html`, caption: 'option B: History as one line' },
  { name: 'counts-upright-history-closed', file: `${COUNT_BOARD_DIR}upright-393.html`, caption: 'History upright, closed' },
  { name: 'counts-upright-history-open', file: `${COUNT_BOARD_DIR}upright-393.html`, caption: 'History upright, open' },
  { name: 'counts-upright-batches-closed', file: `${COUNT_BOARD_DIR}upright-393.html`, caption: 'Batches upright, closed' },
  { name: 'counts-upright-batches-open', file: `${COUNT_BOARD_DIR}upright-393.html`, caption: 'Batches upright, open' },
  { name: 'counts-batches-picked', file: `${COUNT_BOARD_DIR}batches-0-and-1.html`, caption: 'option: no Batches control' },
  { name: 'counts-batches-many-d', file: `${COUNT_BOARD_DIR}batches-many.html`, caption: 'D: the rail upright in the side column' },
];

async function readCountPanel(page, captionSubstring) {
  return page.evaluate((substr) => {
    var ps = document.querySelectorAll('p');
    var captionP = null;
    for (var i = 0; i < ps.length; i++) {
      if (ps[i].textContent.indexOf(substr) !== -1) {
        captionP = ps[i];
        break;
      }
    }
    if (!captionP) return { found: false };
    var captionBlock = captionP.parentElement;
    var panel = captionBlock ? captionBlock.nextElementSibling : null;
    var foldBtn = panel ? panel.querySelector('button[aria-controls^="fold-"]') : null;
    var onlyLine = panel ? panel.querySelector('p') : null;
    return {
      found: true,
      captionText: captionP.textContent.trim(),
      foldAriaControls: foldBtn ? foldBtn.getAttribute('aria-controls') : null,
      foldAriaExpanded: foldBtn ? foldBtn.getAttribute('aria-expanded') : null,
      foldText: foldBtn ? foldBtn.textContent.trim() : null,
      onlyLineText: !foldBtn && onlyLine ? onlyLine.textContent.trim() : null,
    };
  }, captionSubstring);
}

// Builds the app's own two-version, multi-batch state through the app
// itself (decisions_recorded 5 — never IndexedDB directly), reading it
// with the shared readPage() so the same folds/historyText fields the
// ladder run above already reads cover the count boards too. Returns the
// closed reading, then toggles fold-history and fold-batches open in turn
// (reading again after each) so all four upright-393.html panels have a
// real counterpart.
async function buildCountsAppState(browser, appUrl, probeSource) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width: 393, coarse: true });
  await saveNextVersion(page, 'Version 2 for counts');
  // Back to Version 1's own route (still the seeded batch) to record two
  // MORE batches against it — 1 (seeded) + 2 = 3, matching batches-
  // many.html's own "3 batches" scenario, while the fork above already
  // satisfies History's own 2-version threshold.
  await page.goto(`${appUrl}${APP_ROUTE}`, { waitUntil: 'networkidle' });
  await recordAnotherBatch(page, '2026-08-10');
  await recordAnotherBatch(page, '2026-08-20');

  const closed = await readPageWith(page, probeSource);

  async function toggleAndRead(ariaControls) {
    await page.locator(`button[aria-controls="${ariaControls}"]`).click();
    const reading = await readPageWith(page, probeSource);
    await page.locator(`button[aria-controls="${ariaControls}"]`).click();
    return reading;
  }

  const historyOpen = await toggleAndRead('fold-history');
  const batchesOpen = await toggleAndRead('fold-batches');

  // A separate, wider context for batches-many.html's own "D: the rail
  // upright in the side column" panel — read at 1366 (fine pointer), the
  // width where the log/batch-list column genuinely exists.
  await context.close();
  const wideCtx = await openApp(browser, appUrl, APP_ROUTE, { width: 1366, coarse: false });
  await wideCtx.page.goto(`${appUrl}${APP_ROUTE}`, { waitUntil: 'networkidle' });
  await recordAnotherBatch(wideCtx.page, '2026-08-10');
  await recordAnotherBatch(wideCtx.page, '2026-08-20');
  const wideOpen = await readPageWith(wideCtx.page, probeSource);
  await wideCtx.context.close();

  return { closed, historyOpen, batchesOpen, wideOpen };
}

async function runCounts(browser, appUrl, repoUrl, probeSource) {
  const boardReadings = {};
  for (const panel of COUNT_PANELS) {
    // A count board opens at its page width; the panel inside carries its own fixed width.
    const { context, page } = await openBoard(browser, repoUrl, panel.file);
    boardReadings[panel.name] = await readCountPanel(page, panel.caption);
    await context.close();
  }
  const appState = await buildCountsAppState(browser, appUrl, probeSource);

  await writeFile(path.join(READINGS_DIR, 'board-counts.json'), JSON.stringify(boardReadings, null, 2));
  await writeFile(path.join(READINGS_DIR, 'app-counts.json'), JSON.stringify(appState, null, 2));

  console.log('--- counts: board panel readings ---');
  console.log(JSON.stringify(boardReadings, null, 2));
  console.log('--- counts: app state readings (closed / history-open / batches-open / wide-1366-open) ---');
  console.log(
    JSON.stringify(
      {
        closedFolds: appState.closed.ladder.folds,
        closedHistoryText: appState.closed.ladder.historyText,
        historyOpenFolds: appState.historyOpen.ladder.folds,
        batchesOpenFolds: appState.batchesOpen.ladder.folds,
        wideOpenFolds: appState.wideOpen.ladder.folds,
      },
      null,
      2,
    ),
  );
}

function diffValues(pathStr, a, b, out) {
  if (a === b) return;
  if (a == null || b == null) {
    out.push(`${pathStr}: board=${JSON.stringify(a)} app=${JSON.stringify(b)}`);
    return;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    if (Math.abs(a - b) > 1) out.push(`${pathStr}: board=${a} app=${b}`);
    return;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    const aArr = Array.isArray(a) ? a : [];
    const bArr = Array.isArray(b) ? b : [];
    const len = Math.max(aArr.length, bArr.length);
    for (let i = 0; i < len; i++) diffValues(`${pathStr}[${i}]`, aArr[i], bArr[i], out);
    return;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) diffValues(`${pathStr}.${k}`, a[k], b[k], out);
    return;
  }
  if (a !== b) out.push(`${pathStr}: board=${JSON.stringify(a)} app=${JSON.stringify(b)}`);
}

async function main() {
  const [, , namesArg] = process.argv;
  if (!namesArg) {
    console.error('Usage: node 03.5-conformance-run.mjs <names>');
    process.exit(1);
  }
  const names = namesArg.split(',');
  const probeSource = await readFile(path.join(HERE, '03.5-conformance-probe.js'), 'utf8');

  await mkdir(READINGS_DIR, { recursive: true });

  const { appUrl, repoUrl, close } = await startServers();
  const browser = await launch();

  let anyDiff = false;

  try {
    for (const name of names) {
      if (name === 'counts') {
        await runCounts(browser, appUrl, repoUrl, probeSource);
        continue;
      }
      const boardFile = BOARD_FILE[name];
      if (!boardFile) {
        console.error(`Unknown ladder name: ${name}`);
        process.exitCode = 1;
        continue;
      }
      const width = widthFor(name);
      const coarse = coarseFor(name);

      // openBoard opens the board at its own drawn width and pointer (G-03.5-8c).
      const boardCtx = await openBoard(browser, repoUrl, boardFile);
      const boardReading = await readPageWith(boardCtx.page, probeSource);
      await boardCtx.context.close();

      const appCtx = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
      if (name === '1600-pen') {
        await openPenAtThirdStep(appCtx.page);
      }
      const appReading = await readPageWith(appCtx.page, probeSource);
      await appCtx.context.close();

      await writeFile(path.join(READINGS_DIR, `board-${name}.json`), JSON.stringify(boardReading, null, 2));
      await writeFile(path.join(READINGS_DIR, `app-${name}.json`), JSON.stringify(appReading, null, 2));

      const diffs = [];
      diffValues(name, boardReading, appReading, diffs);
      if (diffs.length > 0) {
        anyDiff = true;
        console.log(`--- ${name}: ${diffs.length} field(s) differ ---`);
        for (const d of diffs) console.log(d);
      } else {
        console.log(`--- ${name}: board and app readings identical ---`);
      }
    }
  } finally {
    await browser.close();
    await close();
  }

  if (anyDiff) {
    console.log('conformance run: differences found (see above; not necessarily drift — some are expected scenario differences)');
  } else {
    console.log('conformance run: no differences');
  }
}

await main();
