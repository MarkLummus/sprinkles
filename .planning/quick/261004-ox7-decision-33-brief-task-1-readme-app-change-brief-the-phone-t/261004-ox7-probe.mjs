// Quick task 261004-ox7's probe: below 724, the ingredient table reads plan amount,
// then As made, then the struck old figure last, in Show changes, the Total row and the
// Next version pen (sketch 011 decision 31, D3, amending decisions 24 and 25; phone boards
// approved by Mark 2026-10-03, decision 32; decision 33 brief task 1; spec P3).
// Measures the BUILT app (app/dist) in Playwright's WebKit (coarse pointer for the phone
// contexts) and in system Chrome, beside the five phone boards.
//
//   node 261004-ox7-probe.mjs baseline   (build of the UNCHANGED source; writes the JSON)
//   node 261004-ox7-probe.mjs tracer     (webkit, 393 coarse, mex4 Show changes vs 393-show-changes)
//   node 261004-ox7-probe.mjs boards     (the five boards, both engines)
//   node 261004-ox7-probe.mjs sweep      (320..723, webkit coarse and chrome fine)
//   node 261004-ox7-probe.mjs wide       (724 and 1366 against the baseline)
//   node 261004-ox7-probe.mjs reading    (reading view and untouched pen against the baseline)
//   groups combine with commas; no argument runs every group except baseline.
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never
// requests Mark's :4173 preview, the dev server on :5173 or the sketch server on :8011,
// and starts no Vite process. The removed-row save runs in a throwaway browser context.
// A reading here is evidence about two engines, not about Mark's iPhone or iPad; the
// device is his to check.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-ox7-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
// A scratch collector: counts mismatches without failing the run (the "before" numbers).
function makeCk() {
  const ck = (condition, label) => {
    ck.n += 1;
    if (!condition) ck.fails.push(label);
  };
  ck.n = 0;
  ck.fails = [];
  return ck;
}

const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const MOCHA3 = '/notebook/mocha/mocha-v3';
const STRAW_BATCH = '/notebook/strawberry/strawberry-v2-1/batch/strawberry-v2-1-batch-01';
const TOL = 0.5;

// ---------------------------------------------------------------------------
// In-page reader. Passed to page.evaluate, so the same code reads the app and every
// board. x is relative to the table's left edge; y is relative to the row's top. Under
// P3 the amount's td has no box, so the amount is read through content, current, struck
// and plan, never through cell.
async function readTable(tableIndex) {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelectorAll('.ingredient-table')[tableIndex ?? 0];
  const t = table.getBoundingClientRect();

  const union = (rects) => {
    const live = rects.filter((r) => r.width > 0 || r.height > 0);
    if (live.length === 0) return null;
    return {
      left: Math.min(...live.map((r) => r.left)),
      top: Math.min(...live.map((r) => r.top)),
      right: Math.max(...live.map((r) => r.right)),
      bottom: Math.max(...live.map((r) => r.bottom)),
    };
  };
  // Content rect: text nodes, inputs and buttons only, so overflowing text counts even
  // when its block is no wider than the track.
  const content = (root, skipStruck) => {
    if (!root) return null;
    const rects = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      if (skipStruck && n.parentElement.closest('.struck-value')) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      rects.push(...range.getClientRects());
    }
    for (const el of root.querySelectorAll('input, button')) {
      if (skipStruck && el.closest('.struck-value')) continue;
      rects.push(el.getBoundingClientRect());
    }
    return union(rects);
  };

  const rows = [...table.querySelectorAll('tbody > tr, tfoot > tr')].filter((tr) => !tr.classList.contains('ingredient-table__step-head'));
  const records = rows.map((tr) => {
    const r = tr.getBoundingClientRect();
    const box = (b) => (b ? { x: b.left - t.left, right: b.right - t.left, y: b.top - r.top, bottom: b.bottom - r.top, width: b.right - b.left, height: b.bottom - b.top } : null);
    const cellBox = (td) => {
      if (!td) return null;
      const b = td.getBoundingClientRect();
      return b.width === 0 && b.height === 0 ? null : box(b);
    };
    const amountTd = tr.querySelector(':scope > td.ingredient-table__col-grams');
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    const numerics = [...tr.querySelectorAll(':scope > td.ingredient-table__col-numeric')];
    const shareTd = numerics[numerics.length - 1] ?? null;
    const asMadeTd = numerics.length === 2 ? numerics[0] : null;
    const struckOf = (td) =>
      td
        ? [...td.querySelectorAll('.struck-value')].map((el) => {
            const cs = getComputedStyle(el);
            return { content: box(content(el)), display: cs.display, marginRight: cs.marginRight };
          })
        : [];
    const input = amountTd ? amountTd.querySelector('input') : null;
    const amountCurrent = box(content(amountTd, true));
    return {
      name: (nameTd ? nameTd.textContent : '').trim().slice(0, 40),
      height: r.height,
      removed: nameTd ? nameTd.querySelector('.struck-value') !== null : false,
      amount: {
        cell: cellBox(amountTd),
        content: box(content(amountTd)),
        struck: struckOf(amountTd),
        current: amountCurrent,
        plan: input ? box(input.getBoundingClientRect()) : amountCurrent,
        slotHtml: amountTd ? (amountTd.querySelector('.ingredient-table__plan-grams')?.innerHTML ?? null) : null,
      },
      nameCell: { cell: cellBox(nameTd), content: box(content(nameTd)) },
      share: { cell: cellBox(shareTd), content: box(content(shareTd)), struck: struckOf(shareTd), current: box(content(shareTd, true)) },
      asMade: { cell: cellBox(asMadeTd), content: box(content(asMadeTd)), current: box(content(asMadeTd, true)) },
      field: input ? box(input.getBoundingClientRect()) : null,
      tfoot: tr.parentElement.tagName === 'TFOOT',
    };
  });
  return {
    innerWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    table: { width: t.width, height: t.height },
    rows: records,
  };
}

// ---------------------------------------------------------------------------
// Node-side helpers.
async function openAppPage(browser, appUrl, route, { width, coarse }) {
  const context = await browser.newContext({
    viewport: { width, height: 1100 },
    hasTouch: coarse,
    isMobile: false,
    deviceScaleFactor: coarse ? 3 : 1,
  });
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

async function showChanges(page) {
  await page.getByRole('button', { name: 'Show changes' }).first().click();
  await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
}
async function openPen(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.getByLabel('Whole Milk 3.3%, grams', { exact: true }).waitFor();
}
async function editPen(page) {
  await page.getByLabel('Whole Milk 3.3%, grams', { exact: true }).fill('600');
  await page.getByLabel('Sucrose, grams', { exact: true }).fill('36');
  await page.getByLabel('Cocoa Powder, grams', { exact: true }).fill('45');
  await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'remove' }).click();
  await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'restore' }).waitFor();
}

const STATES = {
  'mex4-reading': { route: MEX4, steps: [] },
  'mex4-show': { route: MEX4, steps: [showChanges] },
  'straw-reading': { route: STRAW_BATCH, steps: [] },
  'straw-show': { route: STRAW_BATCH, steps: [showChanges] },
  'mocha3-show': { route: MOCHA3, steps: [showChanges] },
  'mex4-pen-untouched': { route: MEX4, steps: [openPen] },
  'mex4-pen-edited': { route: MEX4, steps: [openPen, editPen] },
};

async function readState(browser, servers, id, win) {
  const state = STATES[id];
  const { context, page } = await openAppPage(browser, servers.appUrl, state.route, win);
  try {
    for (const step of state.steps) await step(page);
    return await page.evaluate(readTable, 0);
  } finally {
    await context.close();
  }
}

async function readBoard(browser, servers, file, indices = [0], options = {}) {
  const { context, page } = await openBoard(browser, servers.repoUrl, file, options);
  try {
    const out = [];
    for (const i of indices) out.push(await page.evaluate(readTable, i));
    return out;
  } finally {
    await context.close();
  }
}

const near = (a, b, tol = TOL) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;
const r2 = (n) => Math.round(n * 100) / 100;
const hasStruck = (row) => row.amount.struck.length > 0 || row.share.struck.length > 0 || row.removed;

// Compares the app's rows with a board's, row for row (by index) or by name (`byName`).
// Every number within 0.5. `dR` is how much wider the app's table is than the board's.
function compareRows(label, appRows, boardRows, { byName = false, pen = false, dR = 0 } = {}, ck = countedCheck) {
  const pairs = [];
  if (byName) {
    for (const b of boardRows) {
      const a = appRows.find((row) => row.name === b.name);
      ck(a !== undefined, `${label}: app has a row named "${b.name}"`);
      if (a) pairs.push([a, b]);
    }
  } else {
    ck(appRows.length === boardRows.length, `${label}: row count ${appRows.length} vs board ${boardRows.length}`);
    ck(
      appRows.every((row, i) => boardRows[i] && row.name === boardRows[i].name),
      `${label}: names in the same order (app ${JSON.stringify(appRows.map((r) => r.name))} board ${JSON.stringify(boardRows.map((r) => r.name))})`,
    );
    appRows.forEach((a, i) => boardRows[i] && pairs.push([a, boardRows[i]]));
  }
  for (const [a, b] of pairs) {
    const tag = `${label} "${a.name}"`;
    ck(near(a.height, b.height), `${tag}: height ${a.height} vs board ${b.height}`);
    ck(a.nameCell.cell && b.nameCell.cell && near(a.nameCell.cell.x, b.nameCell.cell.x) && near(a.nameCell.cell.width, b.nameCell.cell.width + dR), `${tag}: name cell x/width ${JSON.stringify(a.nameCell.cell)} vs ${JSON.stringify(b.nameCell.cell)} + ${dR}`);
    ck(!!a.amount.current === !!b.amount.current && (!a.amount.current || (near(a.amount.current.right, b.amount.current.right) && near(a.amount.current.y, b.amount.current.y))), `${tag}: plan right/y ${a.amount.current?.right}/${a.amount.current?.y} vs ${b.amount.current?.right}/${b.amount.current?.y}`);
    ck(a.amount.struck.length === b.amount.struck.length, `${tag}: amount struck count ${a.amount.struck.length} vs ${b.amount.struck.length}`);
    a.amount.struck.forEach((s, i) => {
      const bs = b.amount.struck[i];
      if (bs) ck(near(s.content.y, bs.content.y) && near(s.content.right, bs.content.right), `${tag}: amount struck y/right ${s.content.y}/${s.content.right} vs ${bs.content.y}/${bs.content.right}`);
    });
    if (a.asMade.current || b.asMade.current) {
      ck(a.asMade.current && b.asMade.current && near(a.asMade.current.y, b.asMade.current.y) && near(a.asMade.current.right, b.asMade.current.right), `${tag}: as-made y/right ${a.asMade.current?.y}/${a.asMade.current?.right} vs ${b.asMade.current?.y}/${b.asMade.current?.right}`);
    }
    if (a.share.current || b.share.current) {
      ck(a.share.current && b.share.current && near(a.share.current.right, b.share.current.right + dR) && near(a.share.current.y, b.share.current.y), `${tag}: share current right/y ${a.share.current?.right}/${a.share.current?.y} vs ${b.share.current?.right}+${dR}/${b.share.current?.y}`);
    }
    ck(a.share.struck.length === b.share.struck.length, `${tag}: share struck count ${a.share.struck.length} vs ${b.share.struck.length}`);
    a.share.struck.forEach((s, i) => {
      const bs = b.share.struck[i];
      if (bs) ck(near(s.content.y, bs.content.y) && near(s.content.right, bs.content.right + dR), `${tag}: share struck y/right ${s.content.y}/${s.content.right} vs ${bs.content.y}/${bs.content.right}+${dR}`);
    });
    if (pen && (a.field || b.field)) {
      ck(a.field && b.field && near(a.field.width, b.field.width) && near(a.field.height, b.field.height) && near(a.field.x, b.field.x) && near(a.field.y, b.field.y), `${tag}: pen field ${JSON.stringify(a.field)} vs ${JSON.stringify(b.field)}`);
    }
  }
}

// Show changes (or the pen's edit) must move nothing that was already on screen.
// Returns the largest movement and the name-width deltas (reported, not failed).
function checkStatic(label, offRead, onRead, ck = countedCheck) {
  const off = offRead.rows;
  const on = onRead.rows;
  ck(off.length === on.length, `${label}: row count ${off.length} -> ${on.length}`);
  let maxMove = 0;
  const nameDeltas = [];
  const move = (tag, a, b) => {
    const d = Math.abs(a - b);
    maxMove = Math.max(maxMove, d);
    ck(d <= TOL, `${tag}: moved ${r2(d)} (${r2(a)} -> ${r2(b)})`);
  };
  on.forEach((row, i) => {
    const was = off[i];
    if (!was) return;
    const tag = `${label} "${row.name}"`;
    if (was.amount.current && row.amount.current) {
      move(`${tag} plan x`, was.amount.current.x, row.amount.current.x);
      move(`${tag} plan right`, was.amount.current.right, row.amount.current.right);
      move(`${tag} plan y`, was.amount.current.y, row.amount.current.y);
    }
    if (was.asMade.current && row.asMade.current) {
      move(`${tag} as-made right`, was.asMade.current.right, row.asMade.current.right);
      move(`${tag} as-made y`, was.asMade.current.y, row.asMade.current.y);
    }
    if (was.share.current && row.share.current) {
      move(`${tag} share right`, was.share.current.right, row.share.current.right);
      move(`${tag} share y`, was.share.current.y, row.share.current.y);
    }
    if (was.nameCell.cell && row.nameCell.cell) {
      move(`${tag} name x`, was.nameCell.cell.x, row.nameCell.cell.x);
      if (Math.abs(was.nameCell.cell.width - row.nameCell.cell.width) > TOL) nameDeltas.push([row.name, r2(was.nameCell.cell.width), r2(row.nameCell.cell.width)]);
    }
  });
  const narrow = (rows) => Math.min(...rows.map((r) => r.nameCell.cell?.width ?? Infinity));
  const narrowOff = narrow(off);
  const narrowOn = narrow(on);
  ck(near(narrowOff, narrowOn), `${label}: narrowest name track ${r2(narrowOff)} -> ${r2(narrowOn)}`);
  return { maxMove, nameDeltas, narrowOff, narrowOn };
}

// Plan, then As made, then the struck figure last.
function checkOrder(label, rows, ck = countedCheck) {
  const ref = rows.find((r) => !r.tfoot && !hasStruck(r) && r.amount.current);
  const refShare = rows.find((r) => !r.tfoot && r.share.current);
  for (const row of rows) {
    const tag = `${label} "${row.name}"`;
    const a = row.amount;
    if (a.struck.length > 0) {
      const s = a.struck[0].content;
      if (a.current) {
        const lowest = Math.max(a.current.bottom, row.asMade.current ? row.asMade.current.bottom : -Infinity);
        ck(s.y >= lowest - TOL, `${tag}: amount struck top ${r2(s.y)} is at or below the plan/As made bottom ${r2(lowest)}`);
        if (!row.tfoot) ck(near(s.right, a.current.right, row.field ? 1 : TOL), `${tag}: amount struck right ${r2(s.right)} vs plan right ${r2(a.current.right)}`);
      } else {
        // A removed row's lone struck amount stands on the first line.
        ck(ref && near(s.y, ref.amount.current.y), `${tag}: removed row's struck y ${r2(s.y)} vs an unchanged row's plan y ${ref && r2(ref.amount.current.y)}`);
        ck(ref && near(s.right, ref.amount.current.right), `${tag}: removed row's struck right ${r2(s.right)} vs an unchanged row's plan right ${ref && r2(ref.amount.current.right)}`);
      }
    }
    const sh = row.share;
    if (sh.struck.length > 0) {
      const s = sh.struck[0].content;
      if (a.struck.length > 0) {
        ck(near(s.y, a.struck[0].content.y), `${tag}: share struck top ${r2(s.y)} vs amount struck top ${r2(a.struck[0].content.y)} (the same last line)`);
      } else if (sh.current) {
        ck(s.y >= sh.current.bottom - TOL, `${tag}: share struck top ${r2(s.y)} is at or below the current share bottom ${r2(sh.current.bottom)}`);
      }
      const rightRef = sh.current ?? refShare?.share.current;
      ck(rightRef && near(s.right, rightRef.right), `${tag}: share struck right ${r2(s.right)} vs current right ${rightRef && r2(rightRef.right)}`);
    }
  }
}

const overlaps = (a, b) => a && b && Math.min(a.right, b.right) - Math.max(a.x, b.x) > TOL && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > TOL;
function collisionsIn(rows) {
  let n = 0;
  for (const row of rows) {
    for (const part of [row.amount.content, row.share.content, row.asMade.content]) {
      if (overlaps(row.nameCell.content, part)) n += 1;
    }
  }
  return n;
}

// Every number within tol, every other value equal; returns the mismatching paths.
function deepDiff(a, b, tol, p = '', out = []) {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Math.abs(a - b) > tol) out.push(`${p}: ${a} vs ${b}`);
  } else if (a && b && typeof a === 'object' && typeof b === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) deepDiff(a[k], b[k], tol, `${p}.${k}`, out);
  } else if (a !== b) {
    out.push(`${p}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
  }
  return out;
}
const slim = (read) => JSON.parse(JSON.stringify(read, (k, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v)));

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

const winKey = ({ width, coarse }) => `${width}${coarse ? 'c' : 'f'}`;
const rowNamed = (read, prefix) => read.rows.find((r) => r.name.startsWith(prefix));

// ---------------------------------------------------------------------------
// baseline: a build of the unchanged source.
async function baseline(browser, servers, engine, data) {
  data[engine] = {};
  const read = async (win, id) => {
    const out = await readState(browser, servers, id, win);
    (data[engine][winKey(win)] ??= {})[id] = slim(out);
    return out;
  };
  const before = {};
  for (const win of [{ width: 393, coarse: true }, { width: 723, coarse: false }, { width: 723, coarse: true }]) {
    const k = winKey(win);
    const reads = {};
    for (const id of Object.keys(STATES)) reads[id] = await read(win, id);
    // The "before" numbers: the app as built against the boards as they stand.
    const jobs = [];
    if (k === '393c') jobs.push(['393-show-changes.html', 'mex4-show', false], ['393-pen-changes.html', 'mex4-pen-edited', true]);
    else jobs.push(['723-show-changes.html', 'mex4-show', false]);
    if (k === '723f') jobs.push(['723-pen-changes.html', 'mex4-pen-edited', true]);
    for (const [file, id, pen] of jobs) {
      const [board] = await readBoard(browser, servers, file);
      const ck = makeCk();
      compareRows(file, reads[id].rows, board.rows, { pen }, ck);
      ck(near(reads[id].table.height, board.table.height), `${file}: table height ${reads[id].table.height} vs ${board.table.height}`);
      before[`${k} ${file}`] = { mismatches: ck.fails.length, of: ck.n, first: ck.fails.slice(0, 2) };
    }
  }
  for (const width of [724, 1366]) {
    for (const id of ['mex4-show', 'straw-show', 'mex4-pen-edited']) await read({ width, coarse: false }, id);
  }
  console.log(JSON.stringify({ engine, group: 'baseline', beforeMismatches: before }));
  data.before = { ...data.before, [engine]: before };
}

function baselinePrecondition(data) {
  const ck = makeCk();
  const off = data.webkit['393c']['mex4-reading'];
  const on = data.webkit['393c']['mex4-show'];
  const was = rowNamed(off, 'Whole Milk 3.3%');
  const now = rowNamed(on, 'Whole Milk 3.3%');
  ck(was && now, 'precondition: the Whole Milk 3.3% row exists in both states');
  if (was && now) {
    ck(now.amount.struck.length === 1, `precondition: Whole Milk has one amount struck figure (${now.amount.struck.length})`);
    if (now.amount.struck.length === 1) {
      ck(now.amount.struck[0].content.bottom <= now.amount.current.y + TOL, `precondition: struck above the plan (struck bottom ${now.amount.struck[0].content.bottom}, plan top ${now.amount.current.y})`);
    }
    ck(now.amount.current.y - was.amount.current.y >= 17, `precondition: plan drops at least 17px (${was.amount.current.y} -> ${now.amount.current.y})`);
  }
  const mism = data.before.webkit['393c 393-show-changes.html'].mismatches;
  ck(mism >= 1, `precondition: 393-show-changes mismatches the unchanged build (${mism})`);
  return ck;
}

// ---------------------------------------------------------------------------
async function tracer(browser, servers, engine) {
  const label = `${engine} 393 show-changes`;
  const off = await readState(browser, servers, 'mex4-reading', { width: 393, coarse: true });
  const app = await readState(browser, servers, 'mex4-show', { width: 393, coarse: true });
  const [board] = await readBoard(browser, servers, '393-show-changes.html');
  compareRows(label, app.rows, board.rows);
  countedCheck(near(app.table.height, board.table.height), `${label}: table height ${app.table.height} vs board ${board.table.height}`);
  const s = checkStatic(`${label} static`, off, app);
  checkOrder(label, app.rows);
  countedCheck(collisionsIn(app.rows) === 0, `${label}: collisions ${collisionsIn(app.rows)}`);
  countedCheck(app.overflow <= 0, `${label}: overflow ${app.overflow}`);
  const changed = app.rows.filter((r) => hasStruck(r) && !r.tfoot && !r.removed);
  const total = app.rows.find((r) => r.tfoot);
  console.log(JSON.stringify({ engine, group: 'tracer', tableHeight: r2(app.table.height), boardTableHeight: r2(board.table.height), readingTableHeight: r2(off.table.height), changedRowHeights: [...new Set(changed.map((r) => r2(r.height)))], total: total && r2(total.height), nameTrack: [...new Set(app.rows.map((r) => r2(r.nameCell.cell.width)))], planY: [...new Set(app.rows.map((r) => r.amount.current && r2(r.amount.current.y)))], planYOff: [...new Set(off.rows.map((r) => r.amount.current && r2(r.amount.current.y)))], maxStaticMove: r2(s.maxMove), nameDeltas: s.nameDeltas, overflow: app.overflow }));
}

// ---------------------------------------------------------------------------
async function boards(browser, servers, engine) {
  const log = (data) => console.log(JSON.stringify({ engine, group: 'boards', ...data }));

  // (1) Show changes, Mexican Chocolate v4.
  for (const [win, file] of [
    [{ width: 393, coarse: true }, '393-show-changes.html'],
    [{ width: 723, coarse: false }, '723-show-changes.html'],
    [{ width: 723, coarse: true }, '723-show-changes.html'],
  ]) {
    const app = await readState(browser, servers, 'mex4-show', win);
    const [board] = await readBoard(browser, servers, file);
    const label = `${engine} ${file} @${winKey(win)}`;
    compareRows(label, app.rows, board.rows);
    countedCheck(near(app.table.height, board.table.height), `${label}: table height ${app.table.height} vs board ${board.table.height}`);
    checkOrder(label, app.rows);
    countedCheck(app.overflow <= 0, `${label}: overflow ${app.overflow}`);
    const unchanged = app.rows.filter((r) => !hasStruck(r) && !r.tfoot).map((r) => r2(r.height));
    const changed = app.rows.filter((r) => hasStruck(r) && !r.tfoot && !r.removed).map((r) => r2(r.height));
    log({ file, window: winKey(win), tableHeight: r2(app.table.height), boardTableHeight: r2(board.table.height), unchangedRowHeights: [...new Set(unchanged)], changedRowHeights: [...new Set(changed)], total: r2(app.rows.find((r) => r.tfoot).height), nameTrack: [...new Set(app.rows.map((r) => r2(r.nameCell.cell.width)))] });
  }

  // (2) The pen after the edits.
  for (const [win, file] of [
    [{ width: 393, coarse: true }, '393-pen-changes.html'],
    [{ width: 723, coarse: false }, '723-pen-changes.html'],
    [{ width: 723, coarse: true }, null],
  ]) {
    const app = await readState(browser, servers, 'mex4-pen-edited', win);
    const label = `${engine} pen @${winKey(win)}`;
    const fieldRow = rowNamed(app, 'Whole Milk');
    const cin = rowNamed(app, 'Cinnamon');
    const total = app.rows.find((r) => r.tfoot);
    let boardInfo = {};
    if (file) {
      const [board] = await readBoard(browser, servers, file);
      compareRows(`${label} ${file}`, app.rows, board.rows, { pen: true });
      countedCheck(near(app.table.height, board.table.height), `${label}: table height ${app.table.height} vs board ${board.table.height}`);
      const bBy = (name) => board.rows.find((r) => r.name.startsWith(name));
      boardInfo = { file, boardTableHeight: r2(board.table.height), boardChangedRow: r2(bBy('Whole Milk').height), boardShareOnlyRow: r2(bBy('Cream').height), boardTotal: r2(bBy('Total').height), boardField: [r2(bBy('Whole Milk').field.width), r2(bBy('Whole Milk').field.height)] };
    }
    checkOrder(label, app.rows);
    countedCheck(app.overflow <= 0, `${label}: overflow ${app.overflow}`);
    if (win.coarse) {
      countedCheck(near(fieldRow.field.width, 52) && near(fieldRow.field.height, 44), `${label}: field ${fieldRow.field.width} x ${fieldRow.field.height} vs 52 x 44`);
    }
    if (win.width === 393) {
      // The removed Cinnamon row keeps its field first, its struck parent under it; the
      // Total's struck number stands under the current total.
      countedCheck(cin.field && near(cin.field.y, fieldRow.field.y) && cin.amount.struck.length === 1 && cin.amount.struck[0].content.y >= cin.field.bottom - TOL, `${label}: Cinnamon field first (y ${cin.field?.y}) with its struck parent under it (struck y ${cin.amount.struck[0]?.content.y}, field bottom ${cin.field?.bottom})`);
      countedCheck(total.amount.struck.length === 1 && total.amount.struck[0].content.y >= total.amount.current.bottom - TOL, `${label}: Total's struck number under the current total (struck y ${total.amount.struck[0]?.content.y}, current bottom ${total.amount.current.bottom})`);
    }
    log({ window: winKey(win), tableHeight: r2(app.table.height), changedRow: r2(fieldRow.height), shareOnlyRow: r2(rowNamed(app, 'Cream').height), removedRow: r2(cin.height), total: r2(total.height), field: [r2(fieldRow.field.width), r2(fieldRow.field.height)], nameTrack: [...new Set(app.rows.map((r) => r2(r.nameCell.cell.width)))], ...boardInfo });
  }

  // (3) The cases board, 393 coarse. Five panels, one table each.
  const panels = await readBoard(browser, servers, '393-show-changes-cases.html', [0, 1, 2, 3, 4]);
  const win393 = { width: 393, coarse: true };
  {
    const app = await readState(browser, servers, 'straw-show', win393);
    const board = panels[0];
    const label = `${engine} cases panel 1 (strawberry batch)`;
    const dR = app.table.width - board.table.width;
    compareRows(label, app.rows, board.rows, { byName: true, dR });
    checkOrder(label, app.rows);
    countedCheck(app.overflow <= 0 && collisionsIn(app.rows) === 0, `${label}: overflow ${app.overflow}, collisions ${collisionsIn(app.rows)}`);
    const handRows = app.rows.filter((r) => r.asMade.current && r.amount.struck.length > 0 && !r.tfoot);
    countedCheck(handRows.length > 0, `${label}: a changed row with a hand exists`);
    for (const r of handRows) {
      countedCheck(r.asMade.current.y >= r.amount.current.bottom - TOL, `${label} "${r.name}": hand top ${r2(r.asMade.current.y)} at or below plan bottom ${r2(r.amount.current.bottom)}`);
      countedCheck(r.amount.struck[0].content.y >= r.asMade.current.bottom - TOL, `${label} "${r.name}": struck top ${r2(r.amount.struck[0].content.y)} at or below hand bottom ${r2(r.asMade.current.bottom)}`);
      countedCheck(near(r.asMade.current.right, r.amount.current.right) && near(r.amount.struck[0].content.right, r.amount.current.right), `${label} "${r.name}": hand right ${r2(r.asMade.current.right)}, struck right ${r2(r.amount.struck[0].content.right)} vs plan right ${r2(r.amount.current.right)}`);
      if (r.share.struck.length > 0) countedCheck(near(r.share.struck[0].content.y, r.amount.struck[0].content.y), `${label} "${r.name}": share struck on the amount struck's line`);
    }
    const lec = rowNamed(app, 'Lecithin');
    const bLec = board.rows.find((r) => r.name.startsWith('Lecithin'));
    if (lec && bLec) countedCheck(!hasStruck(lec) && near(lec.height, bLec.height), `${label}: Lecithin stays one line (${r2(lec.height)} vs board ${r2(bLec.height)})`);
    log({ case: 'panel 1 strawberry batch', handRows: handRows.map((r) => [r.name, r2(r.height)]), boardRows: board.rows.map((r) => [r.name, r2(r.height)]) });
  }
  {
    const app = await readState(browser, servers, 'mocha3-show', win393);
    const board = panels[1];
    const label = `${engine} cases panel 2 (mocha v3)`;
    compareRows(label, app.rows, board.rows, { byName: true, dR: app.table.width - board.table.width });
    checkOrder(label, app.rows);
    countedCheck(app.overflow <= 0 && collisionsIn(app.rows) === 0, `${label}: overflow ${app.overflow}, collisions ${collisionsIn(app.rows)}`);
    const total = app.rows.find((r) => r.tfoot);
    countedCheck(total.amount.struck.length === 1 && total.amount.struck[0].content.y >= total.amount.current.bottom - TOL, `${label}: Total's struck number stands last`);
    const milk = app.rows.find((r) => r.name.startsWith('Whole Milk') && r.amount.struck.length === 0 && r.share.struck.length === 1);
    countedCheck(!!milk, `${label}: a share-only Whole Milk row`);
    if (milk) {
      const dy = milk.share.struck[0].content.y - milk.share.current.bottom;
      countedCheck(dy >= -TOL && dy <= 2.5, `${label}: share-only struck share directly under the current share (gap ${r2(dy)})`);
    }
    log({ case: 'panel 2 mocha v3', rows: app.rows.map((r) => [r.name, r2(r.height)]), boardRows: board.rows.map((r) => [r.name, r2(r.height)]) });
  }
  {
    // The removed row, live: save the pen as a child, then Show changes.
    const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, win393);
    let app;
    try {
      await openPen(page);
      await editPen(page);
      const urlBefore = page.url();
      await page.getByLabel('Version name').fill('p3 check');
      await page.getByRole('button', { name: 'Save as a new version' }).click();
      await page.waitForFunction((prev) => window.location.href !== prev, urlBefore);
      await page.waitForSelector('h2.notebook-version__identity');
      await showChanges(page);
      app = await page.evaluate(readTable, 0);
    } finally {
      await context.close();
    }
    const board = panels[2];
    const label = `${engine} cases panel 3 (removed row, live)`;
    const cin = rowNamed(app, 'Cinnamon');
    const boardRemoved = board.rows.find((r) => r.removed);
    const oneLine = app.rows.find((r) => !hasStruck(r) && !r.tfoot);
    const dR = app.table.width - board.table.width;
    countedCheck(!!cin && !!boardRemoved && !!oneLine, `${label}: Cinnamon, the board's removed row and an unchanged row exist`);
    if (cin && boardRemoved && oneLine) {
      countedCheck(cin.amount.slotHtml === '<span class="struck-value">2.77 g</span>', `${label}: slot innerHTML ${JSON.stringify(cin.amount.slotHtml)}`);
      countedCheck(near(cin.height, boardRemoved.height) && near(cin.height, oneLine.height), `${label}: height ${cin.height} vs board removed row ${boardRemoved.height} and an unchanged row ${oneLine.height}`);
      const s = cin.amount.struck[0].content;
      const bs = boardRemoved.amount.struck[0].content;
      countedCheck(cin.amount.struck.length === 1 && near(s.y, bs.y) && near(s.right, bs.right), `${label}: struck amount y/right ${s.y}/${s.right} vs board ${bs.y}/${bs.right}`);
      countedCheck(near(s.y, oneLine.amount.current.y), `${label}: struck amount on the first line (y ${r2(s.y)} vs ${r2(oneLine.amount.current.y)})`);
      const ss = cin.share.struck[0].content;
      const bss = boardRemoved.share.struck[0].content;
      countedCheck(cin.share.struck.length === 1 && near(ss.y, bss.y) && near(ss.right, bss.right + dR), `${label}: share struck y/right ${ss.y}/${ss.right} vs board ${bss.y}/${bss.right} + ${dR}`);
      log({ case: 'panel 3 removed row live', removedRow: r2(cin.height), boardRemovedRow: r2(boardRemoved.height), oneLineRow: r2(oneLine.height), slotHtml: cin.amount.slotHtml });
    }
  }
  {
    // Panels 4 and 5: constructed rows no seeded version shows. Report only.
    const mex = await readState(browser, servers, 'mex4-show', win393);
    log({ case: 'panels 4 and 5 (report only)', appShowChangesRows: mex.rows.map((r) => [r.name, r2(r.height), r.amount.current && r2(r.amount.current.y)]), panel4: panels[3].rows.map((r) => [r.name, r2(r.height), r.amount.current && r2(r.amount.current.y)]), panel5: panels[4].rows.map((r) => [r.name, r2(r.height), r.amount.current && r2(r.amount.current.y)]) });
  }
}

// ---------------------------------------------------------------------------
const SWEEP_STATES = [
  { id: 'mex4-show', route: MEX4, prepare: async () => {}, turnOn: showChanges },
  { id: 'straw-show', route: STRAW_BATCH, prepare: async () => {}, turnOn: showChanges },
  { id: 'mocha3-show', route: MOCHA3, prepare: async () => {}, turnOn: showChanges },
  { id: 'mex4-pen', route: MEX4, prepare: openPen, turnOn: editPen, penTrack: true },
];

async function sweep(browser, servers, engine, coarse) {
  const pointer = coarse ? 'coarse' : 'fine';
  for (const state of SWEEP_STATES) {
    const { context, page } = await openAppPage(browser, servers.appUrl, state.route, { width: 393, coarse });
    try {
      await state.prepare(page);
      const read = async (width) => {
        await page.setViewportSize({ width, height: 1100 });
        return page.evaluate(readTable, 0);
      };
      const off = new Map();
      for (let w = 320; w <= 723; w += 1) off.set(w, await read(w));
      await state.turnOn(page);
      const failBefore = failures.length;
      const tally = { widths: 0, collisions: 0, maxOverflow: -Infinity, maxStaticMove: 0, minNameTrack: Infinity, maxNameDelta: 0, maxNameDeltaAt: null };
      const nameRows = new Set();
      for (let w = 320; w <= 723; w += 1) {
        const on = await read(w);
        const tag = `${engine} ${pointer} ${state.id} @${w}`;
        tally.widths += 1;
        countedCheck(on.innerWidth === w, `${tag}: innerWidth ${on.innerWidth}`);
        countedCheck(on.overflow <= 0, `${tag}: overflow ${on.overflow}`);
        tally.maxOverflow = Math.max(tally.maxOverflow, on.overflow);
        const collisions = collisionsIn(on.rows);
        tally.collisions += collisions;
        countedCheck(collisions === 0, `${tag}: ${collisions} collisions`);
        checkOrder(tag, on.rows);
        const s = checkStatic(tag, off.get(w), on);
        tally.maxStaticMove = Math.max(tally.maxStaticMove, s.maxMove);
        tally.minNameTrack = Math.min(tally.minNameTrack, s.narrowOn);
        for (const [name, was, now] of s.nameDeltas) {
          nameRows.add(name);
          if (Math.abs(now - was) > tally.maxNameDelta) {
            tally.maxNameDelta = Math.abs(now - was);
            tally.maxNameDeltaAt = w;
          }
        }
        if (state.penTrack && w === 320) countedCheck(s.narrowOn >= 149.5, `${tag}: narrowest pen name track ${r2(s.narrowOn)} at 320`);
      }
      console.log(JSON.stringify({ engine, group: `sweep-${pointer}`, state: state.id, ...tally, maxStaticMove: r2(tally.maxStaticMove), minNameTrack: r2(tally.minNameTrack), maxNameDelta: r2(tally.maxNameDelta), nameDeltaRows: [...nameRows], failedChecks: failures.length - failBefore }));
    } finally {
      await context.close();
    }
  }
}

// ---------------------------------------------------------------------------
async function loadBaseline() {
  return JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
}

// From 724 up nothing changes: every row, cell and figure within 0.5 of the baseline,
// every struck figure still inline with its 2px margin.
async function wide(browser, servers, engine) {
  const base = await loadBaseline();
  for (const width of [724, 1366]) {
    const k = winKey({ width, coarse: false });
    for (const id of ['mex4-show', 'straw-show', 'mex4-pen-edited']) {
      const now = slim(await readState(browser, servers, id, { width, coarse: false }));
      const was = base[engine][k][id];
      const label = `${engine} @${k} ${id}`;
      const diffs = deepDiff(now, was, TOL);
      countedCheck(diffs.length === 0, `${label}: ${diffs.length} differences from the baseline (${diffs.slice(0, 3).join('; ')})`);
      const struck = now.rows.flatMap((r) => [...r.amount.struck, ...r.share.struck]);
      const bad = struck.filter((s) => s.display !== 'inline' || s.marginRight !== '2px');
      countedCheck(struck.length > 0 || id === 'straw-show', `${label}: struck figures exist`);
      countedCheck(bad.length === 0, `${label}: ${bad.length} of ${struck.length} struck figures not inline/2px`);
      console.log(JSON.stringify({ engine, group: 'wide', window: k, state: id, rows: now.rows.length, struck: struck.length, differences: diffs.length, notInline2px: bad.length, tableHeight: now.table.height }));
    }
  }
}

// The reading view below 724: nothing sideways, no row grows, a row shrinks by at most
// the 2px hair.
async function reading(browser, servers, engine) {
  const base = await loadBaseline();
  for (const win of [{ width: 393, coarse: true }, { width: 723, coarse: false }]) {
    const k = winKey(win);
    for (const id of ['mex4-reading', 'straw-reading', 'mex4-pen-untouched']) {
      const now = await readState(browser, servers, id, win);
      const was = base[engine][k][id];
      const label = `${engine} @${k} ${id}`;
      countedCheck(now.rows.length === was.rows.length, `${label}: row count ${was.rows.length} -> ${now.rows.length}`);
      now.rows.forEach((row, i) => {
        const b = was.rows[i];
        if (!b) return;
        const tag = `${label} "${row.name}"`;
        countedCheck(near(row.nameCell.cell.x, b.nameCell.cell.x), `${tag}: name x ${row.nameCell.cell.x} vs ${b.nameCell.cell.x}`);
        if (row.amount.current && b.amount.current) countedCheck(near(row.amount.current.right, b.amount.current.right) && near(row.amount.current.y, b.amount.current.y), `${tag}: plan right/y ${row.amount.current.right}/${row.amount.current.y} vs ${b.amount.current.right}/${b.amount.current.y}`);
        if (row.share.current && b.share.current) countedCheck(near(row.share.current.right, b.share.current.right), `${tag}: share right ${row.share.current.right} vs ${b.share.current.right}`);
        if (row.asMade.current && b.asMade.current) countedCheck(near(row.asMade.current.right, b.asMade.current.right), `${tag}: as-made right ${row.asMade.current.right} vs ${b.asMade.current.right}`);
        countedCheck(row.height >= b.height - 2.5 && row.height <= b.height + TOL, `${tag}: height ${row.height} vs baseline ${b.height}`);
      });
      console.log(JSON.stringify({ engine, group: 'reading', window: k, state: id, tableHeightBefore: r2(was.table.height), tableHeightAfter: r2(now.table.height), rowHeightsBefore: [...new Set(was.rows.map((r) => r2(r.height)))], rowHeightsAfter: [...new Set(now.rows.map((r) => r2(r.height)))] }));
    }
  }
}

// ---------------------------------------------------------------------------
const requested = process.argv[2] ? process.argv[2].split(',') : ['tracer', 'boards', 'sweep', 'wide', 'reading'];
const servers = await startServers();
const baselineData = {};
try {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      if (requested.includes('baseline')) await baseline(browser, servers, engine, baselineData);
      // The tracer proves one path in WebKit; a full run repeats it in Chrome.
      if (requested.includes('tracer') && (engine === 'webkit' || requested.length > 1)) await tracer(browser, servers, engine);
      if (requested.includes('boards')) await boards(browser, servers, engine);
      if (requested.includes('sweep')) await sweep(browser, servers, engine, engine === 'webkit');
      if (requested.includes('wide')) await wide(browser, servers, engine);
      if (requested.includes('reading')) await reading(browser, servers, engine);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

if (requested.includes('baseline')) {
  const pre = baselinePrecondition(baselineData);
  for (const f of pre.fails) failures.push(`FAIL ${f}`);
  count += pre.n;
  if (pre.fails.length === 0) {
    await writeFile(BASELINE_PATH, JSON.stringify({ webkit: baselineData.webkit, chrome: baselineData.chrome, before: baselineData.before }) + '\n');
    console.log(`baseline written to ${path.basename(BASELINE_PATH)}`);
  } else {
    console.log('baseline NOT written: the precondition failed');
  }
}

const total = failures.length;
// Prints the first 40 failures; PROBE_FAIL_CAP=100000 prints them all.
const cap = Number(process.env.PROBE_FAIL_CAP ?? 40);
if (total > cap) {
  failures.splice(cap);
  failures.push(`FAIL ... ${total - cap} more not shown`);
}
finish(failures, count, `261004-ox7 probe (${total} failed)`);
if (total > 0) process.exitCode = 1;
