// 03.7.1: the record pen and the reading, measured on the built app before
// and after "Time to draw temp." leaves every screen (D-01, D-05, D-08).
//
// Usage (from the repo root, after `npm --prefix app run build`):
//   node .planning/phases/03.7.1-.../03.7.1-pen-probe.mjs baseline   write 03.7.1-baseline.json
//   node .planning/phases/03.7.1-.../03.7.1-pen-probe.mjs check      measure again, compare with that file
//   node .planning/phases/03.7.1-.../03.7.1-pen-probe.mjs board [cases] [widths] [engines]
//       the built app against sketch 010's boards (plan 02, D-05, D-08), both coarse:
//         cases:   comma list of pen,reading,authority,second,numbers (default all five)
//         widths:  comma list of 1366,393 (default both; numbers also reads 1366 fine and 1024)
//         engines: comma list of webkit,chrome (default both)
//       pen:       the record pen and the amend pen's churn row against pen-whole fp-fullblank and
//                  pen-states fp-draw-blank (350 wide at 1366, 393 at the phone)
//       reading:   the reading's first two churn cells against pen-reading fp-r4
//       authority: every panel of the four boards holds no field, no plan line, and every pen
//                  panel's first field row reads Churn date, Out of machine, Churn duration
//       second:    Mexican Chocolate v3's reading and pen hold no field; its pen's captions equal
//                  declared-pen-reading's pen panels'
//       numbers:   pen and reading heights before (03.7.1-baseline.json) and after, with D17's
//                  expectation (pen 0, reading -73) judged at 1366 coarse and 393 coarse
//       The boards also draw D6 to D14 (Phase 4), so only the churn row and the churn cells
//       are compared, never a whole panel's height. Prints MATCH, DIFF and MEASURE lines; a
//       DIFF fails the exit status.
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
import { startServers, launch, openApp, openBoard, check, finish, APP_ROUTE, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
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
    tracks: getComputedStyle(grid).gridTemplateColumns,
    cellBoxes: [...grid.querySelectorAll('.batch-row__cell')].map((cell) => {
      const b = cell.getBoundingClientRect();
      return { x: b.left - g.left, y: b.top - g.top, width: b.width, height: b.height };
    }),
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
// Board mode (plan 02): the app against sketch 010's panels.
// ---------------------------------------------------------------------------
const BOARD_DIR = '../010-bench-sheet/';
const PEN_CAPTIONS = ['Churn date', 'Out of machine', 'Churn duration'];
const SECOND_RECIPE_ROUTE = '/notebook/mexican-chocolate/mexican-chocolate-v3';
const ALL_CASES = ['pen', 'reading', 'authority', 'second', 'numbers'];

// A panel (or the app's own block) is found by { sel, withFieldRow, index }; the in-page
// readers below are serialized into the page, so each carries its own copy of that lookup.

function penFacts(at) {
  const all = [...document.querySelectorAll(at.sel)];
  const root = (at.withFieldRow ? all.filter((p) => p.querySelector('.field-row')) : all)[at.index ?? 0];
  const fieldRow = root.querySelector('.field-row');
  const f = fieldRow.getBoundingClientRect();
  const labels = [...fieldRow.querySelectorAll(':scope > .field-row__label')].map((label) => {
    const b = label.getBoundingClientRect();
    return { caption: label.querySelector('.pen-caption')?.textContent ?? '', x: b.left - f.left, y: b.top - f.top, width: b.width, height: b.height };
  });
  return {
    rowWidth: f.width,
    rowHeight: f.height,
    labels,
    ownLine: labels.length === 3 && labels[2].y > labels[0].y + 1,
    fieldText: (root.textContent.toLowerCase().match(/time to draw temp/g) ?? []).length,
    planText: (root.textContent.toLowerCase().match(/plan 10/g) ?? []).length,
    planEls: root.querySelectorAll('.batch-row__plan').length,
  };
}

function readingFacts(at) {
  const all = [...document.querySelectorAll(at.sel)];
  const root = (at.withFieldRow ? all.filter((p) => p.querySelector('.field-row')) : all)[at.index ?? 0];
  const grid = root.querySelector('.batch-row__cells');
  const g = grid.getBoundingClientRect();
  const norm = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const cells = [...grid.querySelectorAll('.batch-row__cell')].map((cell) => {
    const b = cell.getBoundingClientRect();
    return {
      label: norm(cell.querySelector('.batch-row__cell-label')),
      value: norm(cell.querySelector('.batch-row__cell-value')),
      x: b.left - g.left,
      y: b.top - g.top,
      width: b.width,
      height: b.height,
    };
  });
  const firstTop = cells[0].y;
  return {
    cells,
    gridWidth: g.width,
    firstRowHeight: Math.max(...cells.filter((c) => Math.abs(c.y - firstTop) <= 1).map((c) => c.height)),
    fieldText: (root.textContent.toLowerCase().match(/time to draw temp/g) ?? []).length,
    planText: (root.textContent.toLowerCase().match(/plan 10/g) ?? []).length,
    planEls: root.querySelectorAll('.batch-row__plan').length,
  };
}

function boardAuthority() {
  return [...document.querySelectorAll('.fp-win')].map((p, i) => {
    const fr = p.querySelector('.field-row');
    return {
      name: `${p.className.replace('fp-win ', '')}#${i}`,
      caps: fr ? [...fr.querySelectorAll(':scope > .field-row__label .pen-caption')].map((e) => e.textContent) : null,
      fieldText: (p.textContent.toLowerCase().match(/time to draw temp/g) ?? []).length,
      planText: (p.textContent.toLowerCase().match(/plan 10/g) ?? []).length,
      planEls: p.querySelectorAll('.batch-row__plan').length,
    };
  });
}

async function openReading(browser, appUrl, route, opts) {
  const { context, page } = await openApp(browser, appUrl, route, opts);
  await page.waitForSelector('.batch-row');
  const hidden = await page.evaluate(() => document.getElementById('fold-batch')?.hidden === true);
  if (hidden) {
    await page.click('button[aria-controls="fold-batch"]');
    await page.waitForTimeout(150);
  }
  await page.waitForSelector('#fold-batch .batch-row__cells');
  return { context, page };
}

const APP_PEN = { sel: '.batch-margin--pen' };
const APP_READING = { sel: '.batch-row' };

async function runBoard() {
  const [, , , casesArg, widthsArg, enginesArg] = process.argv;
  const cases = casesArg ? casesArg.split(',') : ALL_CASES;
  const widths = widthsArg ? widthsArg.split(',').map(Number) : [1366, 393];
  const engines = enginesArg ? enginesArg.split(',') : ['webkit', 'chrome'];
  for (const c of cases) if (!ALL_CASES.includes(c)) throw new Error(`board: unknown case ${c} (${ALL_CASES.join(', ')})`);

  const failures = [];
  let count = 0;
  let matches = 0;
  let diffs = 0;
  // One comparison: a MATCH or a DIFF line, and a failure for the exit status on a DIFF.
  const cmp = (ok, label, app, board) => {
    count += 1;
    const shown = board === undefined ? `${app}` : `app ${app}, board ${board}`;
    if (ok) {
      matches += 1;
      console.log(`MATCH ${label}: ${shown}`);
    } else {
      diffs += 1;
      console.log(`DIFF ${label}: ${shown}`);
      check(failures, false, label);
    }
  };
  const within = (a, b, tol = 1) => Math.abs(a - b) <= tol;
  const r = (n) => Math.round(n * 10) / 10;
  const box = (l) => `[${r(l.x)},${r(l.y)} ${r(l.width)}x${r(l.height)}]`;

  const { appUrl, repoUrl, close } = await startServers({ appRoot: DIST });
  const browsers = { webkit: await webkit.launch(), chrome: await launch() };
  try {
    for (const engine of engines) {
      const browser = browsers[engine];
      const openB = (file) => openBoard(browser, repoUrl, `${BOARD_DIR}${file}`, { coarse: true });

      for (const width of widths) {
        const opts = { width, height: 1100, coarse: true };

        if (cases.includes('reading')) {
          const label = `reading ${engine} ${width}c`;
          const { context, page } = await openReading(browser, appUrl, APP_ROUTE, opts);
          const app = await page.evaluate(readingFacts, APP_READING);
          await context.close();
          const { context: bc, page: bp } = await openB('pen-reading.html');
          const board = await bp.evaluate(readingFacts, { sel: `.fp-win.fp-r4-${width}` });
          await bc.close();
          for (let i = 0; i < 2; i += 1) {
            const a = app.cells[i];
            const b = board.cells[i];
            cmp(a.label === b.label, `${label} cell ${i} label`, JSON.stringify(a.label), JSON.stringify(b.label));
            cmp(a.value === b.value, `${label} cell ${i} value`, JSON.stringify(a.value), JSON.stringify(b.value));
            cmp(
              within(a.x, b.x) && within(a.y, b.y) && within(a.width, b.width) && within(a.height, b.height),
              `${label} cell ${i} box in its grid`,
              box(a),
              box(b),
            );
          }
          cmp(within(app.firstRowHeight, board.firstRowHeight), `${label} first grid row height`, r(app.firstRowHeight), r(board.firstRowHeight));
          cmp(app.fieldText === 0 && app.planText === 0 && app.planEls === 0, `${label} no Time to draw temp., no plan 10-12 min, no plan sub-line`, `${app.fieldText}/${app.planText}/${app.planEls}`, `${board.fieldText}/${board.planText}/${board.planEls}`);
        }

        if (cases.includes('pen')) {
          const boardPanels = [
            ['pen-whole.html', `fp-fullblank-${width}`],
            ['pen-states.html', `fp-draw-blank-${width}`],
          ];
          const boardFacts = {};
          for (const [file, cls] of boardPanels) {
            const { context, page } = await openB(file);
            boardFacts[cls] = await page.evaluate(penFacts, { sel: `.fp-win.${cls}` });
            await context.close();
          }
          for (const [state, selector] of [['record', '.batch-row__record'], ['amend', '.batch-row__correct']]) {
            const { context, page } = await openApp(browser, appUrl, APP_ROUTE, opts);
            await openPen(page, selector);
            const app = await page.evaluate(penFacts, APP_PEN);
            await context.close();
            for (const [cls, board] of Object.entries(boardFacts)) {
              const label = `pen ${state} ${engine} ${width}c vs ${cls}`;
              cmp(JSON.stringify(app.labels.map((l) => l.caption)) === JSON.stringify(board.labels.map((l) => l.caption)), `${label} captions in order`, app.labels.map((l) => l.caption).join(' | '), board.labels.map((l) => l.caption).join(' | '));
              app.labels.forEach((a, i) => {
                const b = board.labels[i];
                if (!b) return;
                cmp(within(a.x, b.x) && within(a.y, b.y) && within(a.width, b.width) && within(a.height, b.height), `${label} "${a.caption}" box in the field row`, box(a), box(b));
              });
              cmp(within(app.rowWidth, board.rowWidth) && within(app.rowHeight, board.rowHeight), `${label} field row size`, `${r(app.rowWidth)}x${r(app.rowHeight)}`, `${r(board.rowWidth)}x${r(board.rowHeight)}`);
              cmp(app.ownLine && board.ownLine, `${label} Churn duration on its own line under Churn date`, `${app.ownLine} (y ${r(app.labels[2]?.y ?? NaN)} > ${r(app.labels[0]?.y ?? NaN)})`, `${board.ownLine} (y ${r(board.labels[2]?.y ?? NaN)} > ${r(board.labels[0]?.y ?? NaN)})`);
              cmp(app.fieldText === 0 && app.planText === 0, `${label} no Time to draw temp.`, `${app.fieldText}/${app.planText}`, `${board.fieldText}/${board.planText}`);
            }
          }
        }
      }

      if (cases.includes('authority')) {
        for (const file of ['pen-reading.html', 'pen-whole.html', 'pen-states.html', 'declared-pen-reading.html']) {
          const { context, page } = await openB(file);
          const panels = await page.evaluate(boardAuthority);
          await context.close();
          const dirty = panels.filter((p) => p.fieldText || p.planText || p.planEls).map((p) => p.name);
          const penPanels = panels.filter((p) => p.caps);
          const wrong = penPanels.filter((p) => JSON.stringify(p.caps) !== JSON.stringify(PEN_CAPTIONS)).map((p) => p.name);
          cmp(dirty.length === 0, `authority ${engine} ${file} no panel holds the field or a plan line (${panels.length} panels)`, dirty.length ? dirty.join(', ') : 'none');
          cmp(penPanels.length > 0 && wrong.length === 0, `authority ${engine} ${file} every pen panel's first field row reads ${PEN_CAPTIONS.join(', ')} (${penPanels.length} pen panels)`, wrong.length ? wrong.join(', ') : 'all');
        }
      }

      if (cases.includes('second')) {
        for (const width of widths) {
          const label = `second ${engine} ${width}c`;
          const opts = { width, height: 1100, coarse: true };
          const { context: bc, page: bp } = await openB('declared-pen-reading.html');
          const declared = await bp.evaluate(penFacts, { sel: `.fp-win.fpw-${width}`, withFieldRow: true, index: 0 });
          await bc.close();
          const { context, page } = await openReading(browser, appUrl, SECOND_RECIPE_ROUTE, opts);
          const reading = await page.evaluate(readingFacts, APP_READING);
          await context.close();
          cmp(reading.fieldText === 0 && reading.planText === 0 && reading.planEls === 0, `${label} Mexican Chocolate v3 reading holds no Time to draw temp. or plan line`, `${reading.fieldText}/${reading.planText}/${reading.planEls}`);
          const pen = await openApp(browser, appUrl, SECOND_RECIPE_ROUTE, opts);
          await openPen(pen.page, '.batch-row__record');
          const penFactsNow = await pen.page.evaluate(penFacts, APP_PEN);
          await pen.context.close();
          cmp(penFactsNow.fieldText === 0, `${label} Mexican Chocolate v3 pen holds no Time to draw temp.`, penFactsNow.fieldText);
          cmp(JSON.stringify(penFactsNow.labels.map((l) => l.caption)) === JSON.stringify(declared.labels.map((l) => l.caption)), `${label} Mexican Chocolate v3 pen captions equal declared-pen-reading's pen panel`, penFactsNow.labels.map((l) => l.caption).join(' | '), declared.labels.map((l) => l.caption).join(' | '));
        }
      }

      if (cases.includes('numbers')) {
        const baseline = JSON.parse(await readFile(BASELINE, 'utf8'));
        const vps = VIEWPORTS.filter((vp) => widths.includes(vp.width) || vp.width === 1024);
        const now = await readAll(browser, engine, appUrl);
        for (const vp of vps) {
          const prefix = `${engine}|${viewportKey(vp)}`;
          const vk = viewportKey(vp);
          const reading = [baseline[`${prefix}|reading`], now[`${prefix}|reading`]];
          const record = [baseline[`${prefix}|record`], now[`${prefix}|record`]];
          const amend = [baseline[`${prefix}|amend`], now[`${prefix}|amend`]];
          const d = (pair, key) => r(pair[1][key] - pair[0][key]);
          console.log(
            `MEASURE ${engine} ${vk}: pen record ${r(record[0].blockHeight)} -> ${r(record[1].blockHeight)} (${d(record, 'blockHeight')}), ` +
              `pen amend ${r(amend[0].blockHeight)} -> ${r(amend[1].blockHeight)} (${d(amend, 'blockHeight')}), ` +
              `reading ${r(reading[0].blockHeight)} -> ${r(reading[1].blockHeight)} (${d(reading, 'blockHeight')}), ` +
              `cells grid ${r(reading[0].gridHeight)} -> ${r(reading[1].gridHeight)} (${d(reading, 'gridHeight')})`,
          );
          const judged = vp.coarse && (vp.width === 1366 || vp.width === 393);
          if (judged) {
            cmp(within(record[1].blockHeight, record[0].blockHeight, 1), `numbers ${engine} ${vk} pen record height unchanged (D17: 0)`, `${d(record, 'blockHeight')}`, '0');
            cmp(within(amend[1].blockHeight, amend[0].blockHeight, 1), `numbers ${engine} ${vk} pen amend height unchanged (D17: 0)`, `${d(amend, 'blockHeight')}`, '0');
            cmp(within(reading[1].blockHeight - reading[0].blockHeight, -73, 2), `numbers ${engine} ${vk} reading 73 px shorter (D17: -73, within 2)`, `${d(reading, 'blockHeight')}`, '-73');
          }
          const rd = reading[1];
          const tracks = rd.tracks.split(' ').length;
          console.log(
            `MEASURE ${engine} ${vk} reading grid: ${tracks} tracks [${rd.tracks}], ${rd.cellBoxes.length} cells ${rd.cellBoxes.map(box).join(' ')}, scrollWidth ${rd.scrollWidth} in ${rd.windowWidth}`,
          );
          if (vp.width === 393 || vp.width === 1024) {
            cmp(rd.scrollWidth <= rd.windowWidth, `numbers ${engine} ${vk} reading no sideways overflow`, rd.scrollWidth, rd.windowWidth);
            cmp(record[1].scrollWidth <= record[1].windowWidth, `numbers ${engine} ${vk} record pen no sideways overflow`, record[1].scrollWidth, record[1].windowWidth);
            cmp(amend[1].scrollWidth <= amend[1].windowWidth, `numbers ${engine} ${vk} amend pen no sideways overflow`, amend[1].scrollWidth, amend[1].windowWidth);
          }
          if (vp.width === 1024) {
            const px = rd.tracks.split(' ').map(parseFloat);
            const fifthStart = px.slice(0, 4).reduce((a, b) => a + b, 0);
            const fifthEmpty = px.length === 5 && rd.cellBoxes.every((c) => c.x < fifthStart - 1);
            cmp(px.length === 5 && rd.cellBoxes.length === 4 && fifthEmpty, `numbers ${engine} ${vk} four cells in five tracks, the fifth empty`, `${px.length} tracks, ${rd.cellBoxes.length} cells, fifth track from x ${r(fifthStart)}, cells end at ${r(Math.max(...rd.cellBoxes.map((c) => c.x + c.width)))}`);
          }
        }
      }
    }
  } finally {
    await Promise.all(Object.values(browsers).map((b) => b.close()));
    await close();
  }
  console.log(`board: ${matches} MATCH, ${diffs} DIFF`);
  finish(failures, count, '03.7.1 pen probe board');
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
} else if (mode === 'board') {
  await runBoard();
} else {
  console.error('Usage: node 03.7.1-pen-probe.mjs baseline | check | board [cases] [widths] [engines]');
  process.exit(1);
}
