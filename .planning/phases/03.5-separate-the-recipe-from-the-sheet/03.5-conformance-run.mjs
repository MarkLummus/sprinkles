// 03.5-14: the ladder conformance runner. Runs 03.5-conformance-probe.js
// (the one reader, extended for the ladder, decision 15's cells and the
// rail's paint order) against a sketch 011 board and the built app at the
// matching width, writing paired JSON readings under
// 03.5-conformance-readings/ladder/ and printing every field whose board
// and app values differ (numbers beyond ±1). Imports the plan-10 harness
// unchanged (decisions_recorded — prohibitions).
//
// Usage: node 03.5-conformance-run.mjs <names>
//   names: comma list, e.g. 984,1366,1920,1600-pen,1600-long-history
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServers, launch, openApp, openBoard, APP_ROUTE } from './03.5-probe-harness.mjs';

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
      const boardFile = BOARD_FILE[name];
      if (!boardFile) {
        console.error(`Unknown ladder name: ${name}`);
        process.exitCode = 1;
        continue;
      }
      const width = widthFor(name);
      const coarse = coarseFor(name);

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
