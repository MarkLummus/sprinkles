// Quick task 261004-oxa's probe: Balance and Watch for open by default from 984
// (sketch 011 decision 33, brief (b) and task 4). Measures the BUILT app (app/dist)
// in Playwright's WebKit and system Chrome, and the four acceptance boards
// (744-, 983-, 984- and 1024-batch). A reading here is evidence about two
// engines, not about Mark's iPad; the device is his to check.
//
//   node 261004-oxa-probe.mjs before   (build of the unchanged source: asserts the plan-time
//                                       facts, prints the board-against-app mismatches, writes the baseline JSON)
//   node 261004-oxa-probe.mjs after    (gates a to e, plus ungated deltas)
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers;
// never requests :4173, :5173 or :8011, and starts no Vite process. Everything
// runs in throwaway browser contexts and nothing is saved.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-oxa-baseline.json');

const ROUTES = {
  mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01',
  olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89',
};
const WIDTHS = [744, 983, 984, 1024, 1366];
const BOARD_WIDTHS = [744, 983, 984, 1024];

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;

// In-page reader, run by page.evaluate with { scopeSelector, suffix }. A board
// panel is a scope (.fp-win.fp-STATE-W) whose ids carry -fp-STATE-W; the app's
// scope is the document. Boxes are { x, y, w, h } in the scope's own
// coordinates (document for the app, the panel's top-left for a board),
// rounded to 0.01.
function readScope({ scopeSelector }) {
  const r = (n) => Math.round(n * 100) / 100;
  const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
  if (!scope) return null;
  const origin = scopeSelector
    ? scope.getBoundingClientRect()
    : { left: -window.scrollX, top: -window.scrollY };
  const box = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: r(b.left - origin.left), y: r(b.top - origin.top), w: r(b.width), h: r(b.height) };
  };
  const strip = (id) => id.replace(/-fp-[a-z0-9]+-\d+$/, '');
  const folds = {};
  for (const button of scope.querySelectorAll('.fold-row')) {
    const controls = button.getAttribute('aria-controls');
    const panel = controls ? scope.querySelector(`[id="${controls}"]`) : null;
    folds[strip(controls)] = { expanded: button.getAttribute('aria-expanded') === 'true', panelOpen: !!panel && !panel.hidden };
  }
  const byPrefix = (prefix) => scope.querySelector(`[id^="${prefix}"]`);
  const out = {
    folds,
    ingredients: box(scope.querySelector('.ingredient-table-region')),
    side: box(scope.querySelector('.side-region')),
    balance: box(byPrefix('fold-balance')),
    check: box(byPrefix('fold-check')),
    method: box(scope.querySelector('.method-region')),
  };
  if (!scopeSelector) {
    out.scrollHeight = document.documentElement.scrollHeight;
    out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  }
  return out;
}

async function openRecipe(browser, servers, recipe, width, coarse) {
  const { context, page } = await openApp(browser, servers.appUrl, ROUTES[recipe], { width, height: 1000, coarse });
  if (recipe === 'mex3') {
    await page.getByRole('button', { name: 'Show changes' }).first().click();
    await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
  }
  await page.waitForSelector('.fold-row');
  await page.waitForTimeout(150);
  return { context, page };
}

async function readApp(browser, servers, recipe, width, coarse = true) {
  const { context, page } = await openRecipe(browser, servers, recipe, width, coarse);
  try {
    return await page.evaluate(readScope, { scopeSelector: null });
  } finally {
    await context.close();
  }
}

async function readBoards(browser, servers, width) {
  const { context, page } = await openBoard(browser, servers.repoUrl, `${width}-batch.html`, { coarse: true });
  try {
    const out = {};
    for (const recipe of ['mex3', 'olive1']) {
      out[recipe] = await page.evaluate(readScope, { scopeSelector: `.fp-win.fp-${recipe}-${width}` });
    }
    return out;
  } finally {
    await context.close();
  }
}

const openIds = (folds) => Object.fromEntries(Object.entries(folds).map(([id, f]) => [id, f.expanded && f.panelOpen]));
const foldSummary = (folds) => Object.entries(folds).map(([id, f]) => `${id}:${f.expanded ? 'open' : 'shut'}${f.expanded === f.panelOpen ? '' : '!'}`).join(' ');

const isOpen = (reading, id) => !!reading.folds[id] && reading.folds[id].expanded && reading.folds[id].panelOpen;
const isShut = (reading, id) => !reading.folds[id] || (!reading.folds[id].expanded && !reading.folds[id].panelOpen);

async function readEverything(servers) {
  const wk = await webkit.launch();
  try {
    const app = {};
    for (const width of WIDTHS) for (const recipe of Object.keys(ROUTES)) app[`${recipe}-${width}`] = await readApp(wk, servers, recipe, width);
    const board = {};
    for (const width of BOARD_WIDTHS) {
      const panels = await readBoards(wk, servers, width);
      for (const recipe of Object.keys(panels)) board[`${recipe}-${width}`] = panels[recipe];
    }
    return { app, board };
  } finally {
    await wk.close();
  }
}

// ---------------------------------------------------------------------------
async function runBefore(servers) {
  const { app, board } = await readEverything(servers);
  const mismatches = [];
  for (const recipe of Object.keys(ROUTES)) {
    for (const width of BOARD_WIDTHS) {
      const key = `${recipe}-${width}`;
      const a = app[key];
      const b = board[key];
      countedCheck(a !== null && b !== null, `${key}: both the app and the board read`);
      // Plan-time facts.
      const balanceOpenOnApp = isOpen(a, 'fold-balance') && isOpen(a, 'fold-check');
      countedCheck(!balanceOpenOnApp && isShut(a, 'fold-balance') && isShut(a, 'fold-check'), `${key}: app Balance and Watch for closed before the change (${foldSummary(a.folds)})`);
      const wantBoardOpen = width >= 984;
      countedCheck(
        wantBoardOpen ? isOpen(b, 'fold-balance') && isOpen(b, 'fold-check') : isShut(b, 'fold-balance') && isShut(b, 'fold-check'),
        `${key}: board Balance and Watch for ${wantBoardOpen ? 'open' : 'closed'} (${foldSummary(b.folds)})`,
      );
      for (const id of ['fold-version', 'fold-history', 'fold-tasting']) countedCheck(isShut(b, id), `${key}: board ${id} closed`);
      for (const id of ['fold-balance', 'fold-check']) {
        if (isOpen(b, id) !== isOpen(a, id)) mismatches.push(`${key} ${id}: app ${isOpen(a, id) ? 'open' : 'closed'}, board ${isOpen(b, id) ? 'open' : 'closed'}`);
      }
    }
    countedCheck(isOpen(app[`${recipe}-1366`], 'fold-balance') && isOpen(app[`${recipe}-1366`], 'fold-check'), `${recipe}-1366: app Balance and Watch for open before the change`);
  }
  console.log(`board-against-app fold mismatches before the change: ${mismatches.length}`);
  for (const line of mismatches) console.log(`  ${line}`);
  countedCheck(mismatches.length === 8, `eight Balance/Watch-for mismatches expected at 984 and 1024 on both panels (got ${mismatches.length})`);
  await writeFile(BASELINE_PATH, JSON.stringify({ app, board }, null, 1));
  console.log(`wrote ${path.basename(BASELINE_PATH)}`);
}

// ---------------------------------------------------------------------------
const deltaStr = (a, b) => (a && b ? `dx ${(a.x - b.x).toFixed(2)} dy ${(a.y - b.y).toFixed(2)} dw ${(a.w - b.w).toFixed(2)} dh ${(a.h - b.h).toFixed(2)}` : 'n/a');
const boxEq = (a, b) => !!a && !!b && near(a.x, b.x) && near(a.y, b.y) && near(a.w, b.w) && near(a.h, b.h);

async function foldRead(page) {
  return (await page.evaluate(readScope, { scopeSelector: null })).folds;
}

async function runAfter(servers) {
  const baseline = JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
  const { app, board } = await readEverything(servers);

  for (const recipe of Object.keys(ROUTES)) {
    for (const width of BOARD_WIDTHS) {
      const key = `${recipe}-${width}`;
      const a = app[key];
      const b = board[key];
      // (a) fold states equal the board's, id for id.
      const ids = [...new Set([...Object.keys(a.folds), ...Object.keys(b.folds)])].sort();
      const same = ids.every((id) => !!a.folds[id] && !!b.folds[id] && isOpen(a, id) === isOpen(b, id));
      countedCheck(same, `(a) ${key}: fold states equal the board (app ${foldSummary(a.folds)} | board ${foldSummary(b.folds)})`);
      // (b) the side column.
      if (width >= 984) {
        countedCheck(a.side.x >= a.ingredients.x + a.ingredients.w - 0.01 && a.side.y < a.ingredients.y + a.ingredients.h, `(b) ${key}: side column beside the ingredients (side ${JSON.stringify(a.side)}, ingredients ${JSON.stringify(a.ingredients)})`);
        countedCheck(near(a.side.x, b.side.x) && near(a.side.w, b.side.w), `(b) ${key}: side x and width within 0.5 of the board's (${a.side.x}, ${a.side.w} against ${b.side.x}, ${b.side.w})`);
      } else {
        countedCheck(a.side.y >= a.ingredients.y + a.ingredients.h - 0.01, `(b) ${key}: side column below the ingredients (side top ${a.side.y}, ingredients bottom ${a.ingredients.y + a.ingredients.h})`);
      }
    }
    // (c) no change where none was asked.
    for (const width of WIDTHS) {
      const key = `${recipe}-${width}`;
      const a = app[key];
      const was = baseline.app[key];
      if (width === 744 || width === 983 || width === 1366) {
        const foldsSame = JSON.stringify(a.folds) === JSON.stringify(was.folds);
        countedCheck(foldsSame, `(c) ${key}: folds exactly the baseline's (${foldSummary(a.folds)} | was ${foldSummary(was.folds)})`);
        for (const name of ['ingredients', 'side', 'balance', 'check', 'method']) countedCheck(was[name] === null ? a[name] === null : boxEq(a[name], was[name]), `(c) ${key}: ${name} box equals the baseline (${JSON.stringify(a[name])} | was ${JSON.stringify(was[name])})`);
        countedCheck(near(a.scrollHeight, was.scrollHeight) && a.overflow === was.overflow, `(c) ${key}: scrollHeight ${a.scrollHeight} (was ${was.scrollHeight}) and overflow ${a.overflow} (was ${was.overflow})`);
      } else {
        for (const id of ['fold-version', 'fold-history', 'fold-tasting', 'fold-batches']) {
          countedCheck(JSON.stringify(a.folds[id] ?? null) === JSON.stringify(was.folds[id] ?? null), `(c) ${key}: ${id} equals the baseline (${JSON.stringify(a.folds[id] ?? null)} | was ${JSON.stringify(was.folds[id] ?? null)})`);
        }
        countedCheck(boxEq(a.ingredients, was.ingredients), `(c) ${key}: ingredients box equals the baseline`);
        countedCheck(near(a.side.x, was.side.x) && near(a.side.w, was.side.w), `(c) ${key}: side x and width equal the baseline`);
      }
    }
  }

  // Ungated: the open panels against the boards, and the scrollHeight change.
  for (const recipe of Object.keys(ROUTES)) {
    for (const width of [984, 1024]) {
      const key = `${recipe}-${width}`;
      console.log(`ungated ${key}: #fold-balance ${deltaStr(app[key].balance, board[key].balance)} | #fold-check ${deltaStr(app[key].check, board[key].check)} | scrollHeight ${baseline.app[key].scrollHeight} -> ${app[key].scrollHeight} (${app[key].scrollHeight - baseline.app[key].scrollHeight >= 0 ? '+' : ''}${app[key].scrollHeight - baseline.app[key].scrollHeight}) | overflow ${app[key].overflow}`);
    }
  }
  for (const recipe of Object.keys(ROUTES)) {
    for (const width of WIDTHS) {
      const key = `${recipe}-${width}`;
      console.log(`reading ${key}: folds ${foldSummary(app[key].folds)} | side ${JSON.stringify(app[key].side)} (board ${JSON.stringify(board[key]?.side ?? null)}) | scrollHeight ${baseline.app[key].scrollHeight} -> ${app[key].scrollHeight}`);
    }
  }

  // (d) crossings, WebKit, fine pointer, olive1.
  const wk = await webkit.launch();
  try {
    {
      const { context, page } = await openRecipe(wk, servers, 'olive1', 983, false);
      try {
        const folds983 = await foldRead(page);
        countedCheck(!folds983['fold-balance'].expanded && !folds983['fold-check'].expanded, `(d) fine 983 start: Balance and Watch for closed (${foldSummary(folds983)})`);
        await page.setViewportSize({ width: 984, height: 1000 });
        await page.waitForTimeout(250);
        const at984 = await page.evaluate(readScope, { scopeSelector: null });
        countedCheck(isOpen(at984, 'fold-balance') && isOpen(at984, 'fold-check') && isShut(at984, 'fold-version') && isShut(at984, 'fold-tasting'), `(d) 983 to 984: Balance and Watch for open, Version details and Tasting closed (${foldSummary(at984.folds)})`);
        await page.setViewportSize({ width: 983, height: 1000 });
        await page.waitForTimeout(250);
        const back = await page.evaluate(readScope, { scopeSelector: null });
        countedCheck(isShut(back, 'fold-balance') && isShut(back, 'fold-check'), `(d) back to 983: Balance and Watch for closed (${foldSummary(back.folds)})`);
      } finally {
        await context.close();
      }
    }
    {
      const { context, page } = await openRecipe(wk, servers, 'olive1', 1024, false);
      try {
        await page.locator('.fold-row[aria-controls="fold-balance"]').click();
        await page.waitForTimeout(150);
        const hidden = await page.evaluate(readScope, { scopeSelector: null });
        countedCheck(isShut(hidden, 'fold-balance') && isOpen(hidden, 'fold-check'), `(d) 1024 after Hide on Balance: Balance closed, Watch for open (${foldSummary(hidden.folds)})`);
        await page.setViewportSize({ width: 1366, height: 1000 });
        await page.waitForTimeout(250);
        const at1366 = await page.evaluate(readScope, { scopeSelector: null });
        countedCheck(isShut(at1366, 'fold-balance') && isOpen(at1366, 'fold-check') && isOpen(at1366, 'fold-version'), `(d) 1024 to 1366: Balance stays closed, Watch for and Version details open (${foldSummary(at1366.folds)})`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await wk.close();
  }

  // (e) system Chrome, fine pointer, olive1, 983 and 984.
  const chrome = await launch();
  try {
    for (const width of [983, 984]) {
      const c = await readApp(chrome, servers, 'olive1', width, false);
      const w = app[`olive1-${width}`];
      countedCheck(JSON.stringify(openIds(c.folds)) === JSON.stringify(openIds(w.folds)), `(e) Chrome fine olive1 ${width}: fold states equal WebKit's (${foldSummary(c.folds)} | WebKit ${foldSummary(w.folds)})`);
    }
  } finally {
    await chrome.close();
  }
}

// ---------------------------------------------------------------------------
const mode = process.argv[2];
if (mode !== 'before' && mode !== 'after') {
  console.error('usage: node 261004-oxa-probe.mjs before|after');
  process.exit(2);
}
const servers = await startServers();
try {
  if (mode === 'before') await runBefore(servers);
  else await runAfter(servers);
} finally {
  await servers.close();
}
finish(failures, count, `261004-oxa-probe ${mode}`);
