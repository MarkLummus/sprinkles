// Quick task 261004-eoi's probe: a split row's remove (or restore) link sits on the
// name's line in the Next version pen, before the portion line (sketch 011
// decision 26; decision 33 addendum "The split row's remove link", Mark 2026-10-04).
// Measures the BUILT app (app/dist) in Playwright's WebKit (coarse pointer) and
// system Chrome (mouse), before and after the change, and against the proposed
// panel of the 1600-remove-link board.
//
//   node 261004-eoi-probe.mjs baseline   (build of the unchanged source; writes the JSON)
//   node 261004-eoi-probe.mjs tracer     (webkit, coarse, 1600, olive-v1 pen vs the baseline)
//   node 261004-eoi-probe.mjs matrix     (every cell vs the baseline)
//   node 261004-eoi-probe.mjs board      (1600: app vs the board's proposed panel, both engines)
//   groups combine with commas: matrix,board
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers;
// never requests Mark's :4173 preview, the dev server on :5173 or the sketch
// server on :8011, and starts no Vite process. The pen and the remove click run in
// throwaway browser contexts and nothing is saved. A reading here is evidence
// about two engines, not about Mark's iPhone or iPad; the device is his to check.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, APP_ROUTE, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-eoi-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const WIDTHS = [393, 723, 744, 984, 1024, 1366, 1600];

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). `spec` picks the table: the app's
// pen table, or the board's proposed panel (the second table.ingredient-table).
async function readPen(spec) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelectorAll(spec.selector)[spec.index];
  if (!table) throw new Error(`no table for ${JSON.stringify(spec)}`);
  const t = table.getBoundingClientRect();
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const isGap = (n) => n.nodeType === 1 && n.classList.contains('ingredient-table__remove-gap');

  const allTrs = [...table.querySelectorAll('tbody > tr')];
  const trs = allTrs.filter((tr) => !tr.classList.contains('ingredient-table__step-head'));
  const rows = trs.map((tr) => {
    const r = tr.getBoundingClientRect();
    const clone = tr.cloneNode(true);
    const cloneName = clone.querySelector(':scope > td.ingredient-table__col-name');
    if (cloneName) {
      for (const n of [...cloneName.children]) {
        if (isGap(n) || (n.tagName === 'BUTTON' && /^(remove|restore)$/.test(n.textContent.trim()))) n.remove();
      }
    }
    return {
      text: norm(tr.textContent),
      textNoLink: norm(clone.textContent),
      height: r.height,
      cells: [...tr.children].map((td) => {
        const b = td.getBoundingClientRect();
        return { x: b.left - t.left, y: b.top - r.top, width: b.width, height: b.height };
      }),
    };
  });

  const links = [];
  for (const tr of allTrs) {
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    if (!nameTd) continue;
    const button = [...nameTd.children].find((e) => e.tagName === 'BUTTON' && /^(remove|restore)$/.test(e.textContent.trim()));
    if (!button) continue;
    const b = button.getBoundingClientRect();
    const cy = b.top + b.height / 2;
    const nc = nameTd.getBoundingClientRect();
    const marks = [];
    const textRects = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      marks.push(...range.getClientRects());
    };
    for (const n of nameTd.childNodes) {
      if (n === button || isGap(n)) continue;
      if (n.nodeType === 3) {
        if (n.nodeValue.trim()) textRects(n);
      } else if (n.nodeType === 1) {
        marks.push(...n.getClientRects());
        if (n.tagName === 'SPAN' && !n.classList.contains('target-chip')) {
          for (const c of n.childNodes) if (c.nodeType === 3 && c.nodeValue.trim()) textRects(c);
        }
      }
    }
    const onLine = marks.filter((k) => k.width > 0 && k.top <= cy && k.bottom >= cy && k.right <= b.left + 0.5);
    const last = onLine.length ? Math.max(...onLine.map((k) => k.right)) : null;
    const prev = button.previousSibling;
    const noteEl = nameTd.querySelector('.ingredient-table__portion-note');
    const nr = noteEl ? noteEl.getBoundingClientRect() : null;
    links.push({
      rowIndex: trs.indexOf(tr),
      name: (nameTd.firstChild ? nameTd.firstChild.textContent : '').trim(),
      label: button.textContent.trim(),
      gap: last === null ? null : b.left - last,
      off: b.left - nc.left,
      btn: { width: b.width, height: b.height },
      btnTop: b.top - nc.top,
      btnBottom: b.bottom - nc.top,
      note: nr ? { top: nr.top - nc.top, bottom: nr.bottom - nc.top, left: nr.left - nc.left } : null,
      noteAfterButton: noteEl ? !!(button.compareDocumentPosition(noteEl) & Node.DOCUMENT_POSITION_FOLLOWING) : null,
      rowHeight: tr.getBoundingClientRect().height,
      gapSpan: prev !== null && prev.nodeType === 1 && prev.tagName === 'SPAN' && prev.classList.contains('ingredient-table__remove-gap') && prev.textContent === ' ',
    });
  }

  return {
    innerWidth: window.innerWidth,
    coarse: matchMedia('(pointer: coarse)').matches,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    table: { width: t.width, height: t.height },
    notes: table.querySelectorAll('.ingredient-table__portion-note').length,
    links,
    rows,
  };
}

const APP_SPEC = { selector: '.ingredient-table.is-developing', index: 0 };
const BOARD_SPEC = { selector: 'table.ingredient-table', index: 1 };

// ---------------------------------------------------------------------------
// Node-side helpers.
async function openAppPage(browser, appUrl, route, { width, coarse }) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ingredient-table');
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openAppPage: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

// Olive Oil v1 has no Salt row, so the wait is on a remove link, not on a field.
async function openPen(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.waitForSelector('.ingredient-table.is-developing');
  await page.locator('td.ingredient-table__col-name > button.text-control').first().waitFor();
}

async function removeWholeMilk(page) {
  await page.locator('tbody tr', { hasText: 'Whole milk' }).getByRole('button', { name: 'remove' }).first().click();
  await page.locator('tbody tr', { hasText: 'Whole milk' }).getByRole('button', { name: 'restore' }).first().waitFor();
}

const CASES = [
  { id: 'olive-v1 pen', route: APP_ROUTE, olive: true, prepare: openPen },
  { id: 'mex4 pen', route: MEX4, olive: false, prepare: openPen },
  {
    id: 'olive-v1 restore',
    route: APP_ROUTE,
    olive: true,
    widths: [393, 1600],
    prepare: async (page) => {
      await openPen(page);
      await removeWholeMilk(page);
    },
  },
];

const engines = [
  ['webkit', () => webkit.launch(), true],
  ['chrome', () => launch(), false],
];

const cellKey = (engine, width, id) => `${engine}|${width}|${id}`;

async function measure(browser, servers, width, coarse, c) {
  const { context, page } = await openAppPage(browser, servers.appUrl, c.route, { width, coarse });
  try {
    await c.prepare(page);
    return await page.evaluate(readPen, APP_SPEC);
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const nearOrBothNull = (a, b, tol = 0.5) => (a === null && b === null) || near(a, b, tol);
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

function cellsSame(label, a, b, { skipY }) {
  countedCheck(a.cells.length === b.cells.length, `${label}: cell count ${a.cells.length} vs ${b.cells.length}`);
  a.cells.forEach((cell, i) => {
    const bc = b.cells[i];
    if (!bc) return;
    const hidden = bc.width === 0 && bc.height === 0;
    countedCheck(near(cell.x, bc.x) && near(cell.width, bc.width), `${label} cell ${i} x/width: ${JSON.stringify(cell)} vs ${JSON.stringify(bc)}`);
    if (!skipY) {
      countedCheck((hidden || near(cell.y, bc.y)) && near(cell.height, bc.height), `${label} cell ${i} y/height: ${JSON.stringify(cell)} vs ${JSON.stringify(bc)}`);
    }
  });
}

// Precondition for the baseline: the plan's cause is what the build shows.
function preconditionOlive(label, read) {
  countedCheck(read.notes === 4, `${label}: baseline has 4 portion notes (read ${read.notes})`);
  countedCheck(read.links.length === 12, `${label}: baseline has 12 links (read ${read.links.length})`);
  const split = read.links.filter((l) => l.note !== null);
  countedCheck(split.length === 2 && split[0].name === 'Whole milk' && split[1].name === 'Sucrose', `${label}: the links with a note are Whole milk and Sucrose (read ${JSON.stringify(split.map((l) => l.name))})`);
  for (const l of split) {
    countedCheck(l.gap === null, `${label}: ${l.name} link has no mark on its line (gap ${l.gap})`);
    countedCheck(l.noteAfterButton === false, `${label}: ${l.name} portion line comes before its link`);
    countedCheck(l.note.bottom <= l.btnTop + 0.5, `${label}: ${l.name} link sits under its portion line (note bottom ${l.note.bottom}, btn top ${l.btnTop})`);
  }
}

function preconditionMex(label, read) {
  countedCheck(read.notes === 0, `${label}: baseline has 0 portion notes (read ${read.notes})`);
  countedCheck(read.links.length >= 1, `${label}: baseline has links (read ${read.links.length})`);
}

// `restoreFloor` is true for the restore cells at 393. There a removed row stacks
// the struck old value above the live one in the amount and share cells, which
// sets a height floor: the untouched second-portion row of the same ingredient
// already stands at it in the baseline (81 in WebKit, 63.25 in Chrome). The
// moved link cannot take the first portion row below that floor, so the 15..25
// drop and the equal-height checks are replaced for the removed row (the
// coordinator's decision, 2026-10-04) by: at or above the floor, same
// placement checks as every other cell.
function compareOlive(label, after, before, { restoreFloor = false } = {}) {
  countedCheck(after.links.length === before.links.length, `${label}: link count ${after.links.length} vs ${before.links.length}`);
  countedCheck(after.notes === before.notes, `${label}: notes ${after.notes} vs ${before.notes}`);
  countedCheck(
    JSON.stringify(after.links.map((l) => [l.name, l.label])) === JSON.stringify(before.links.map((l) => [l.name, l.label])),
    `${label}: link name+label sequence`,
  );
  const splitRowIdx = new Set();
  const drops = [];
  after.links.forEach((a, i) => {
    const b = before.links[i];
    if (!b) return;
    if (b.note) {
      splitRowIdx.add(b.rowIndex);
      countedCheck(a.gap !== null && near(a.gap, 14), `${label}: ${a.name} gap ${a.gap} is 14 (decision 26)`);
      countedCheck(a.gapSpan === true, `${label}: ${a.name} gap span precedes the link`);
      countedCheck(a.noteAfterButton === true, `${label}: ${a.name} portion line follows the link`);
      countedCheck(a.note && a.note.top >= a.btnBottom - 0.5, `${label}: ${a.name} note top ${a.note?.top} >= btn bottom ${a.btnBottom}`);
      countedCheck(a.note && near(a.note.left, b.note.left), `${label}: ${a.name} note left ${a.note?.left} vs ${b.note.left}`);
      countedCheck(near(a.btn.width, b.btn.width) && near(a.btn.height, b.btn.height), `${label}: ${a.name} button ${JSON.stringify(a.btn)} vs ${JSON.stringify(b.btn)}`);
      const drop = b.rowHeight - a.rowHeight;
      drops.push(drop);
      if (restoreFloor && a.label === 'restore') {
        const sibling = before.rows.find((r, j) => j !== b.rowIndex && r.textNoLink.includes(a.name));
        countedCheck(sibling !== undefined, `${label}: ${a.name} has a second-portion row in the baseline`);
        if (sibling) countedCheck(a.rowHeight >= sibling.height - 0.5, `${label}: ${a.name} row height ${a.rowHeight} is at or above the floor ${sibling.height} (the second-portion row's baseline height)`);
      } else {
        countedCheck(drop >= 15 && drop <= 25, `${label}: ${a.name} row height ${a.rowHeight} vs ${b.rowHeight} (drop ${round(drop)} not in 15..25)`);
      }
    } else {
      countedCheck(nearOrBothNull(a.gap, b.gap), `${label}: ${a.name} gap ${a.gap} vs ${b.gap}`);
      countedCheck(near(a.off, b.off), `${label}: ${a.name} off ${a.off} vs ${b.off}`);
      countedCheck(near(a.btn.width, b.btn.width) && near(a.btn.height, b.btn.height), `${label}: ${a.name} button ${JSON.stringify(a.btn)} vs ${JSON.stringify(b.btn)}`);
      countedCheck(near(a.rowHeight, b.rowHeight), `${label}: ${a.name} rowHeight ${a.rowHeight} vs ${b.rowHeight}`);
    }
  });
  const splitA = after.links.filter((l) => l.note !== null);
  if (splitA.length === 2 && !restoreFloor) countedCheck(near(splitA[0].rowHeight, splitA[1].rowHeight), `${label}: split rows equal in height (${splitA[0].rowHeight}, ${splitA[1].rowHeight})`);

  countedCheck(after.rows.length === before.rows.length, `${label}: row count ${after.rows.length} vs ${before.rows.length}`);
  after.rows.forEach((row, i) => {
    const b = before.rows[i];
    if (!b) return;
    const rl = `${label} row ${i} "${row.textNoLink.slice(0, 24)}"`;
    countedCheck(row.textNoLink === b.textNoLink, `${rl}: text "${row.textNoLink}" vs "${b.textNoLink}"`);
    const isSplitFirst = splitRowIdx.has(i);
    if (!isSplitFirst) countedCheck(near(row.height, b.height), `${rl}: height ${row.height} vs ${b.height}`);
    cellsSame(rl, row, b, { skipY: isSplitFirst });
  });
  countedCheck(near(after.table.width, before.table.width), `${label}: table width ${after.table.width} vs ${before.table.width}`);
  countedCheck(near(after.table.height, before.table.height - sum(drops), 1), `${label}: table height ${after.table.height} vs ${before.table.height} - ${round(sum(drops))}`);
  countedCheck(near(after.overflow, before.overflow), `${label}: overflow ${after.overflow} vs ${before.overflow}`);
}

function compareMex(label, after, before) {
  countedCheck(after.notes === 0, `${label}: 0 portion notes (read ${after.notes})`);
  countedCheck(after.links.length === before.links.length, `${label}: link count ${after.links.length} vs ${before.links.length}`);
  after.links.forEach((a, i) => {
    const b = before.links[i];
    if (!b) return;
    countedCheck(a.name === b.name && a.label === b.label, `${label}: link ${i} ${a.name}/${a.label} vs ${b.name}/${b.label}`);
    countedCheck(nearOrBothNull(a.gap, b.gap), `${label}: ${a.name} gap ${a.gap} vs ${b.gap}`);
    countedCheck(near(a.off, b.off), `${label}: ${a.name} off ${a.off} vs ${b.off}`);
    countedCheck(near(a.btn.width, b.btn.width) && near(a.btn.height, b.btn.height), `${label}: ${a.name} button`);
    countedCheck(near(a.rowHeight, b.rowHeight), `${label}: ${a.name} rowHeight ${a.rowHeight} vs ${b.rowHeight}`);
  });
  countedCheck(after.rows.length === before.rows.length, `${label}: row count ${after.rows.length} vs ${before.rows.length}`);
  after.rows.forEach((row, i) => {
    const b = before.rows[i];
    if (!b) return;
    const rl = `${label} row ${i} "${row.text.slice(0, 24)}"`;
    countedCheck(row.text === b.text, `${rl}: text "${row.text}" vs "${b.text}"`);
    countedCheck(near(row.height, b.height), `${rl}: height ${row.height} vs ${b.height}`);
    cellsSame(rl, row, b, { skipY: false });
  });
  countedCheck(near(after.table.width, before.table.width), `${label}: table width ${after.table.width} vs ${before.table.width}`);
  countedCheck(near(after.table.height, before.table.height), `${label}: table height ${after.table.height} vs ${before.table.height}`);
  countedCheck(near(after.overflow, before.overflow), `${label}: overflow ${after.overflow} vs ${before.overflow}`);
}

function summaryLine(key, c, before, after) {
  const split = (read) => read.links.filter((l) => l.note !== null);
  const sb = before ? split(before) : [];
  const sa = split(after);
  return JSON.stringify({
    cell: key,
    splitRowHeights: c.olive ? sa.map((l, i) => [l.name, round(sb[i]?.rowHeight), round(l.rowHeight)]) : undefined,
    gaps: c.olive ? sa.map((l) => round(l.gap)) : undefined,
    noteTopMinusBtnBottom: c.olive ? sa.map((l) => (l.note ? round(l.note.top - l.btnBottom) : null)) : undefined,
    tableHeight: [before ? round(before.table.height) : null, round(after.table.height)],
    overflow: [before ? before.overflow : null, after.overflow],
  });
}

async function runApp(group) {
  const servers = await startServers();
  const results = {};
  try {
    const baseline = group === 'baseline' ? null : JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
    for (const [engine, make, coarse] of engines) {
      if (group === 'tracer' && engine !== 'webkit') continue;
      const browser = await make();
      try {
        for (const width of WIDTHS) {
          for (const c of CASES) {
            if (c.widths && !c.widths.includes(width)) continue;
            if (group === 'tracer' && !(width === 1600 && c.id === 'olive-v1 pen')) continue;
            const key = cellKey(engine, width, c.id);
            const read = await measure(browser, servers, width, coarse, c);
            results[key] = read;
            if (group === 'baseline') {
              if (c.olive) preconditionOlive(key, read);
              else preconditionMex(key, read);
              console.log(summaryLine(key, c, null, read));
            } else {
              const before = baseline[key];
              countedCheck(before !== undefined, `${key}: baseline cell exists`);
              if (!before) continue;
              if (c.olive) compareOlive(key, read, before, { restoreFloor: c.id === 'olive-v1 restore' && width === 393 });
              else compareMex(key, read, before);
              console.log(summaryLine(key, c, before, read));
            }
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
  if (group === 'baseline' && failures.length === 0) await writeFile(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
}

async function runBoard() {
  const servers = await startServers();
  try {
    for (const [engine, make, coarse] of engines) {
      const browser = await make();
      try {
        const { context: bctx, page: bpage } = await openBoard(browser, servers.repoUrl, '1600-remove-link.html', { width: 1600, coarse });
        let board;
        try {
          board = await bpage.evaluate(readPen, BOARD_SPEC);
        } finally {
          await bctx.close();
        }
        const app = await measure(browser, servers, 1600, coarse, CASES[0]);
        const key = `${engine}|1600|board`;
        const bs = board.links.filter((l) => l.note !== null);
        const as = app.links.filter((l) => l.note !== null);
        countedCheck(bs.length === 2 && as.length === 2, `${key}: two split links on both (board ${bs.length}, app ${as.length})`);
        const lines = [];
        as.forEach((a, i) => {
          const b = bs[i];
          if (!b) return;
          countedCheck(a.name === b.name, `${key}: link ${i} ${a.name} vs ${b.name}`);
          countedCheck(a.gap !== null && b.gap !== null && near(a.gap, b.gap), `${key}: ${a.name} gap app ${a.gap} vs board ${b.gap}`);
          countedCheck(a.noteAfterButton === true && b.noteAfterButton === true, `${key}: ${a.name} portion line follows the link on both`);
          countedCheck(a.note.top >= a.btnBottom - 0.5 && b.note.top >= b.btnBottom - 0.5, `${key}: ${a.name} note top >= btn bottom on both`);
          const buttonsAgree = near(a.btn.height, b.btn.height);
          if (buttonsAgree) countedCheck(near(a.rowHeight, b.rowHeight, 1), `${key}: ${a.name} row height app ${a.rowHeight} vs board ${b.rowHeight} (buttons agree at ${a.btn.height})`);
          lines.push({ name: a.name, gap: [round(a.gap), round(b.gap)], rowHeight: [round(a.rowHeight), round(b.rowHeight)], btnHeight: [a.btn.height, b.btn.height], rowHeightCompared: buttonsAgree });
        });
        console.log(JSON.stringify({ cell: key, appVsBoard: lines }));
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
}

const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
const known = ['baseline', 'tracer', 'matrix', 'board'];
if (groups.length === 0 || groups.some((g) => !known.includes(g))) {
  console.log('usage: node 261004-eoi-probe.mjs baseline|tracer|matrix|board[,...]');
  process.exit(2);
}
for (const g of groups) {
  if (g === 'board') await runBoard();
  else await runApp(g);
}
finish(failures, count, `261004-eoi probe (${groups.join(',')})`);
