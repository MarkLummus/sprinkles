// 03.7.1: the record pen and the reading, measured on the built app before
// and after "Time to draw temp." leaves every screen (D-01, D-05, D-08).
//
// Usage (from the repo root, after `npm --prefix app run build`):
//   node .planning/phases/03.7.1-.../03.7.1-pen-probe.mjs baseline   write 03.7.1-baseline.json
//   node .planning/phases/03.7.1-.../03.7.1-pen-probe.mjs check      measure again, compare with that file
//
// check prints one FAIL line for any after-state that still carries the
// field (text, input or plan line) and for any baseline state that never
// carried it (a blind baseline), then one MEASURE line per engine, viewport
// and state (reading, record, amend) with before, after and delta.
//
// The build is read from PROBE_DIST (default app/dist).
//
// Isolation (T-03.7.1-04): the app is served on an ephemeral 127.0.0.1 port
// through the 03.5 harness, and every request to another host is aborted in
// every context this file opens. Nothing here contacts Mark's
// `vite preview --host` on :4173, the sketch server on :8077, his browser
// profile or any third-party host.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, check, finish, APP_ROUTE, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(HERE, '03.7.1-baseline.json');
const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');

const FIELD = 'Time to draw temp';
const PLAN_LINE = 'plan 10–12 min';
const VIEWPORTS = [
  { width: 1366, coarse: true },
  { width: 1366, coarse: false },
  { width: 1024, coarse: true },
  { width: 393, coarse: true },
];
const viewportKey = ({ width, coarse }) => `${width}${coarse ? 'c' : 'f'}`;

// ---------------------------------------------------------------------------
// In-page readers.
// ---------------------------------------------------------------------------
function readReading() {
  const row = document.querySelector('.batch-row');
  const block = document.querySelector('#fold-batch .batch-margin');
  const grid = row.querySelector('.batch-row__cells');
  const g = grid.getBoundingClientRect();
  return {
    blockHeight: block.getBoundingClientRect().height,
    gridHeight: g.height,
    gridWidth: g.width,
    labels: [...grid.querySelectorAll('.batch-row__cell-label')].map((el) => el.textContent),
    planLines: row.querySelectorAll('.batch-row__plan').length,
    fieldText: (row.textContent.match(/Time to draw temp/g) ?? []).length,
    scrollWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
  };
}

function readPen() {
  const pen = document.querySelector('.batch-margin--pen');
  const fieldRow = pen.querySelector('.field-row');
  const f = fieldRow.getBoundingClientRect();
  return {
    blockHeight: pen.getBoundingClientRect().height,
    blockWidth: pen.getBoundingClientRect().width,
    fieldRowHeight: f.height,
    fieldRowWidth: f.width,
    labels: [...fieldRow.querySelectorAll(':scope > .field-row__label')].map((label) => {
      const b = label.getBoundingClientRect();
      return {
        caption: label.querySelector('.pen-caption')?.textContent ?? '',
        x: b.left - f.left,
        y: b.top - f.top,
        width: b.width,
        height: b.height,
      };
    }),
    fieldText: (pen.textContent.match(/Time to draw temp/g) ?? []).length,
    fieldInputs: [...pen.querySelectorAll('input')].filter((i) => (i.getAttribute('aria-label') ?? '').startsWith('Time to draw temp')).length,
    scrollWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
  };
}

// ---------------------------------------------------------------------------
// The states.
// ---------------------------------------------------------------------------
async function openPen(page, buttonSelector) {
  await page.waitForSelector('.batch-row');
  await page.waitForSelector(buttonSelector);
  await page.click(buttonSelector);
  try {
    await page.waitForSelector('.batch-margin--pen', { timeout: 3000 });
  } catch {
    // A first click after navigation can miss: click once more.
    await page.click(buttonSelector);
    await page.waitForSelector('.batch-margin--pen', { timeout: 5000 });
  }
  await page.waitForTimeout(150);
}

async function readAll(browser, engine, appUrl) {
  const out = {};
  for (const vp of VIEWPORTS) {
    const prefix = `${engine}|${viewportKey(vp)}`;
    const opts = { width: vp.width, height: 1100, coarse: vp.coarse };

    {
      const { context, page } = await openApp(browser, appUrl, APP_ROUTE, opts);
      await page.waitForSelector('.batch-row');
      const hidden = await page.evaluate(() => document.getElementById('fold-batch')?.hidden === true);
      if (hidden) {
        await page.click('button[aria-controls="fold-batch"]');
        await page.waitForTimeout(150);
      }
      await page.waitForSelector('#fold-batch .batch-row__cells');
      out[`${prefix}|reading`] = await page.evaluate(readReading);
      await context.close();
    }

    {
      const { context, page } = await openApp(browser, appUrl, APP_ROUTE, opts);
      await page.waitForSelector('.batch-row');
      await page.emulateMedia({ media: 'print' });
      out[`${prefix}|print`] = await page.evaluate(
        ([field, plan]) => {
          // innerText applies text-transform: uppercase, so compare lowercased.
          const text = document.body.innerText.toLowerCase();
          return { fieldText: text.split(field.toLowerCase()).length - 1, planText: text.split(plan.toLowerCase()).length - 1 };
        },
        [FIELD, PLAN_LINE],
      );
      await context.close();
    }

    for (const [state, selector] of [['record', '.batch-row__record'], ['amend', '.batch-row__correct']]) {
      const { context, page } = await openApp(browser, appUrl, APP_ROUTE, opts);
      await openPen(page, selector);
      out[`${prefix}|${state}`] = await page.evaluate(readPen);
      await context.close();
    }

    {
      const { context, page } = await openApp(browser, appUrl, '/', opts);
      out[`${prefix}|home`] = await page.evaluate((field) => ({ fieldText: document.body.innerText.toLowerCase().split(field.toLowerCase()).length - 1 }), FIELD);
      await context.close();
    }
  }
  return out;
}

async function readEverything() {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const out = {};
  try {
    const chrome = await launch();
    const safari = await webkit.launch();
    try {
      for (const [engine, browser] of [['webkit', safari], ['chrome', chrome]]) {
        Object.assign(out, await readAll(browser, engine, appUrl));
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

// ---------------------------------------------------------------------------
// Compare.
// ---------------------------------------------------------------------------
const r1 = (n) => Math.round(n * 10) / 10;
const delta = (a, b) => `${r1(b - a) >= 0 ? '+' : ''}${r1(b - a)}`;
const captions = (s) => (s.labels ?? []).map((l) => (typeof l === 'string' ? l : l.caption));

function compare(base, now) {
  const failures = [];
  let count = 0;
  const counted = (cond, label) => {
    count += 1;
    check(failures, cond, label);
  };

  for (const key of Object.keys(base)) {
    const [, , state] = key.split('|');
    const before = base[key];
    const after = now[key];
    if (!after) {
      counted(false, `${key}: not read`);
      continue;
    }
    if (['reading', 'print', 'record', 'amend'].includes(state)) {
      counted(before.fieldText >= 1, `${key}: the baseline carries the field (blind baseline otherwise)`);
    }
    counted(after.fieldText === 0, `${key}: the field's text is gone (found ${after.fieldText})`);
    if (state === 'reading') counted(after.planLines === 0, `${key}: no plan sub-line element (found ${after.planLines})`);
    if (state === 'print') counted(after.planText === 0, `${key}: no "${PLAN_LINE}" in the print text (found ${after.planText})`);
    if (state === 'record' || state === 'amend') {
      counted(after.fieldInputs === 0, `${key}: no input named for the field (found ${after.fieldInputs})`);
    }
    if (state === 'reading' || state === 'record' || state === 'amend') {
      counted(after.scrollWidth <= after.windowWidth, `${key}: no horizontal overflow (${after.scrollWidth} > ${after.windowWidth})`);
    }
  }

  for (const key of Object.keys(base)) {
    const [engine, vp, state] = key.split('|');
    if (!['reading', 'record', 'amend'].includes(state) || !now[key]) continue;
    const b = base[key];
    const a = now[key];
    const rowH = state === 'reading' ? ['cells grid', b.gridHeight, a.gridHeight] : ['field row', b.fieldRowHeight, a.fieldRowHeight];
    console.log(
      `MEASURE ${engine} ${vp} ${state}: block height ${r1(b.blockHeight)} -> ${r1(a.blockHeight)} (${delta(b.blockHeight, a.blockHeight)}); ` +
        `${rowH[0]} height ${r1(rowH[1])} -> ${r1(rowH[2])} (${delta(rowH[1], rowH[2])}); ` +
        `labels [${captions(b).join(', ')}] -> [${captions(a).join(', ')}]`,
    );
  }
  return { failures, count };
}

// ---------------------------------------------------------------------------
const mode = process.argv[2];
if (mode === 'baseline') {
  const out = await readEverything();
  await writeFile(BASELINE, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`baseline: ${Object.keys(out).length} readings written to ${path.relative(REPO_ROOT, BASELINE)}`);
} else if (mode === 'check') {
  const base = JSON.parse(await readFile(BASELINE, 'utf8'));
  const { failures, count } = compare(base, await readEverything());
  finish(failures, count, '03.7.1 pen probe');
} else {
  console.error('Usage: node 03.7.1-pen-probe.mjs baseline | check');
  process.exit(1);
}
