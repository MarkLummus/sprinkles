// 03.7-02: the ingredient table's screen baseline and its print cases, for
// sketch 011 decision 45 (the table breaks by step groups, the header
// repeats, the Total goes with the last group; Mark's answers 2026-10-05).
//
// Usage (from the repo root):
//   node .planning/phases/03.7-.../03.7-print-probe.mjs baseline   write 03.7-table-baseline.json
//   node .planning/phases/03.7-.../03.7-print-probe.mjs screen     compare the screen with that file (DIFF lines, exit 1)
//   node .planning/phases/03.7-.../03.7-print-probe.mjs print [P1 P2 ...]
//
// The build is read from PROBE_DIST (default app/dist). Pass a scratch
// --outDir build there so Mark's own `vite preview --host` on :4173, which
// serves app/dist, is never disturbed.
//
// Isolation (T-03.7-03): the app and the sketch boards are served on
// ephemeral 127.0.0.1 ports through the 03.5 harness, and every request to
// another host is aborted in every context this file opens, the static print
// page included. Nothing here contacts :4173 or the sketch server on :8077.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, APP_ROUTE, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(HERE, '03.7-table-baseline.json');
const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');

const WIDTHS = [393, 723, 724, 1024, 1366];
const ROUTES = {
  'olive-oil-v1': APP_ROUTE,
  'mexican-chocolate-v3': '/notebook/mexican-chocolate/mexican-chocolate-v3',
  'standard-base-v2': '/notebook/standard-base/standard-base-v2',
};

// ---------------------------------------------------------------------------
// The screen: every tr of the table, as boxes.
// ---------------------------------------------------------------------------
function readTableBoxes() {
  const table = document.querySelector('.ingredient-table');
  if (!table) return null;
  const t = table.getBoundingClientRect();
  return {
    tableHeight: t.height,
    rows: [...table.querySelectorAll('tr')].map((tr) => {
      const r = tr.getBoundingClientRect();
      const cs = getComputedStyle(tr);
      return {
        height: r.height,
        top: r.top - t.top,
        borderWidth: cs.borderBottomWidth,
        borderStyle: cs.borderBottomStyle,
      };
    }),
  };
}

async function readScreen() {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const out = {};
  try {
    const chrome = await launch();
    const safari = await webkit.launch();
    try {
      for (const [engine, browser] of [['webkit', safari], ['chrome', chrome]]) {
        for (const [name, route] of Object.entries(ROUTES)) {
          for (const width of WIDTHS) {
            const { context, page } = await openApp(browser, appUrl, route, { width, coarse: true });
            await page.waitForSelector('.ingredient-table');
            out[`${engine}|${name}|${width}`] = await page.evaluate(readTableBoxes);
            await context.close();
          }
        }
      }
    } finally {
      await chrome.close();
      await safari.close();
    }
  } finally {
    await close();
  }
  return out;
}

function compareScreen(base, now) {
  const diffs = [];
  for (const key of Object.keys(base)) {
    const a = base[key];
    const b = now[key];
    if (!b) { diffs.push(`DIFF ${key}: not read`); continue; }
    if (a.rows.length !== b.rows.length) { diffs.push(`DIFF ${key}: ${a.rows.length} rows before, ${b.rows.length} after`); continue; }
    if (Math.abs(a.tableHeight - b.tableHeight) > 0.5) diffs.push(`DIFF ${key}: table height ${a.tableHeight} -> ${b.tableHeight}`);
    a.rows.forEach((row, i) => {
      const n = b.rows[i];
      if (Math.abs(row.height - n.height) > 0.5) diffs.push(`DIFF ${key} row ${i}: height ${row.height} -> ${n.height}`);
      if (Math.abs(row.top - n.top) > 0.5) diffs.push(`DIFF ${key} row ${i}: top ${row.top} -> ${n.top}`);
      if (row.borderWidth !== n.borderWidth) diffs.push(`DIFF ${key} row ${i}: border width ${row.borderWidth} -> ${n.borderWidth}`);
      if (row.borderStyle !== n.borderStyle) diffs.push(`DIFF ${key} row ${i}: border style ${row.borderStyle} -> ${n.borderStyle}`);
    });
  }
  return diffs;
}

// ---------------------------------------------------------------------------
const mode = process.argv[2];
if (mode === 'baseline') {
  const out = await readScreen();
  await writeFile(BASELINE, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`baseline: ${Object.keys(out).length} readings written to ${path.relative(REPO_ROOT, BASELINE)}`);
} else if (mode === 'screen') {
  const base = JSON.parse(await readFile(BASELINE, 'utf8'));
  const diffs = compareScreen(base, await readScreen());
  for (const d of diffs) console.log(d);
  if (diffs.length > 0) {
    console.log(`screen: ${diffs.length} differences`);
    process.exitCode = 1;
  } else {
    console.log(`screen: ${Object.keys(base).length} readings equal to the baseline`);
  }
} else {
  console.error('Usage: node 03.7-print-probe.mjs baseline | screen | print [cases]');
  process.exit(1);
}
