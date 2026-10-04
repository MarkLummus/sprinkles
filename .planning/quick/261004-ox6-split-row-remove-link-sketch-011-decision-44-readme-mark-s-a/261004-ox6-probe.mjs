// Quick task 261004-ox6's probe: every line of a split ingredient has its own remove (or
// restore) link in the Next version pen, each removing the whole ingredient (sketch 011
// decision 44, option B, Mark 2026-10-04), and a removed split ingredient's portion lines
// read its share of the batch the pen opened on (46.3%, not 86.3%; finding 1, Mark's answer 2).
// Measures the BUILT app (app/dist) in Playwright's WebKit, coarse pointer and fine, at 393,
// 1366 and 1600, before and after the change, and against the B panels of
// .planning/sketches/011-recipe-route-c/split-remove-link.html.
//
//   node 261004-ox6-probe.mjs baseline   (build of the unchanged source; asserts the precondition, writes the JSON)
//   node 261004-ox6-probe.mjs tracer     (webkit, coarse, 1600, olive-v1 pen vs the baseline)
//   node 261004-ox6-probe.mjs removed    (webkit, coarse, 1600, olive-v1 removed vs the baseline, plus the restore round trip)
//   node 261004-ox6-probe.mjs matrix     (every cell vs the baseline)
//   node 261004-ox6-probe.mjs board      (the B panels of split-remove-link.html vs the app, every width and pointer)
//   groups combine with commas: matrix,board
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never
// requests Mark's :4173 preview, the dev server on :5173 or the sketch server on :8011,
// and starts no Vite process. The pen, the remove click and the restore click run in
// throwaway browser contexts and nothing is saved. A reading here is evidence about
// Playwright's WebKit on a Mac, not about Mark's iPhone or iPad; the device is his to check.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, openBoard, APP_ROUTE, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-ox6-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const WIDTHS = [393, 1366, 1600];
const BOARD_FILE = 'split-remove-link.html';

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). `spec` picks the table: the app's pen
// table, or the nth table.ingredient-table of a board.
async function readPen(spec) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelectorAll(spec.selector)[spec.index];
  if (!table) throw new Error(`no table for ${JSON.stringify(spec)}`);
  const t = table.getBoundingClientRect();
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const isGap = (n) => n.nodeType === 1 && n.classList.contains('ingredient-table__remove-gap');
  const isLinkButton = (n) => n.tagName === 'BUTTON' && /^(remove|restore)$/.test(n.textContent.trim());

  const allTrs = [...table.querySelectorAll('tbody > tr')];
  // The step each body row sits under, read off the step head above it.
  const stepOf = new Map();
  let step = null;
  for (const tr of allTrs) {
    if (tr.classList.contains('ingredient-table__step-head')) {
      const text = norm(tr.textContent);
      const m = text.match(/^Step (\d+)/);
      step = m ? Number(m[1]) : text.startsWith('Unallocated') ? 'Unallocated' : null;
    } else {
      stepOf.set(tr, step);
    }
  }
  const trs = allTrs.filter((tr) => !tr.classList.contains('ingredient-table__step-head'));
  const noteTextOf = (td) => {
    const el = td ? td.querySelector('.ingredient-table__portion-note') : null;
    return el ? norm(el.textContent) : null;
  };
  const rows = trs.map((tr) => {
    const r = tr.getBoundingClientRect();
    const clone = tr.cloneNode(true);
    const cloneName = clone.querySelector(':scope > td.ingredient-table__col-name');
    if (cloneName) {
      for (const n of [...cloneName.children]) {
        if (isGap(n) || isLinkButton(n)) n.remove();
      }
    }
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    const first = nameTd ? nameTd.firstChild : null;
    return {
      text: norm(tr.textContent),
      textNoLink: norm(clone.textContent),
      height: r.height,
      name: first ? first.textContent.trim() : '',
      struck: !!(first && first.nodeType === 1 && first.classList.contains('struck-value')),
      hasLink: !!(nameTd && [...nameTd.children].some(isLinkButton)),
      noteText: noteTextOf(nameTd),
      step: stepOf.get(tr) ?? null,
      cells: [...tr.children].map((td) => {
        const b = td.getBoundingClientRect();
        return { x: b.left - t.left, y: b.top - r.top, width: b.width, height: b.height };
      }),
    };
  });

  const links = [];
  for (const tr of trs) {
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    if (!nameTd) continue;
    const button = [...nameTd.children].find(isLinkButton);
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
      ariaLabel: button.getAttribute('aria-label'),
      step: stepOf.get(tr) ?? null,
      gap: last === null ? null : b.left - last,
      off: b.left - nc.left,
      btn: { width: b.width, height: b.height },
      btnTop: b.top - nc.top,
      btnBottom: b.bottom - nc.top,
      note: nr ? { top: nr.top - nc.top, bottom: nr.bottom - nc.top, left: nr.left - nc.left } : null,
      noteText: noteTextOf(nameTd),
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

// Each table.ingredient-table on a board, mapped to the first panel element after it in
// document order whose id is batch-fp-{A|B|C}-{rest|removed}-{width}.
function readPanelMap() {
  const re = /^batch-fp-([ABC])-(rest|removed)-(393|1366|1600)$/;
  const tables = [...document.querySelectorAll('table.ingredient-table')];
  const panels = [...document.querySelectorAll('[id]')].filter((e) => re.test(e.id));
  const map = {};
  tables.forEach((table, index) => {
    const panel = panels.find((e) => !table.contains(e) && !!(table.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
    if (panel) (map[panel.id] ??= []).push(index);
  });
  return { tables: tables.length, map };
}

const APP_SPEC = { selector: '.ingredient-table.is-developing', index: 0 };

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

const wholeMilkRows = (page) => page.locator('.ingredient-table.is-developing tbody tr', { hasText: 'Whole milk' });
const noWholeMilkButton = (word) => (w) =>
  ![...document.querySelectorAll('.ingredient-table.is-developing tbody tr')].some(
    (tr) => tr.textContent.includes('Whole milk') && [...tr.querySelectorAll('button')].some((b) => b.textContent.trim() === w),
  ) && w;

// Click the LAST remove link in a Whole milk row: before the change the Step 2 line's
// (the only one), after it the Step 3 line's.
async function removeWholeMilkFromLastLine(page) {
  await wholeMilkRows(page).getByRole('button', { name: /^remove/ }).last().click();
  await page.waitForFunction(noWholeMilkButton('remove'), 'remove');
}

// Click the FIRST restore link (the Step 2 line's) and wait until both lines read remove.
async function restoreFromFirstLine(page) {
  await wholeMilkRows(page).getByRole('button', { name: /^restore/ }).first().click();
  await page.waitForFunction(noWholeMilkButton('restore'), 'restore');
}

const CASES = [
  { id: 'olive-v1 pen', route: APP_ROUTE, olive: true, prepare: openPen },
  {
    id: 'olive-v1 removed',
    route: APP_ROUTE,
    olive: true,
    removed: true,
    prepare: async (page) => {
      await openPen(page);
      await removeWholeMilkFromLastLine(page);
    },
  },
  { id: 'mex4 pen', route: MEX4, olive: false, prepare: openPen },
];
const CASE = Object.fromEntries(CASES.map((c) => [c.id, c]));

const POINTERS = [
  [true, 'coarse'],
  [false, 'fine'],
];
const cellKey = (pointer, width, id) => `webkit|${pointer}|${width}|${id}`;

// Reads the pen; for the removed case, with `trip`, also presses restore on the Step 2 line
// and re-reads, so a restore on either line is shown to bring both back.
async function measure(browser, servers, width, coarse, c, { trip = false } = {}) {
  const { context, page } = await openAppPage(browser, servers.appUrl, c.route, { width, coarse });
  try {
    await c.prepare(page);
    const read = await page.evaluate(readPen, APP_SPEC);
    let roundTrip = null;
    if (trip && c.removed) {
      await restoreFromFirstLine(page);
      roundTrip = await page.evaluate(readPen, APP_SPEC);
    }
    return { read, roundTrip };
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const nearOrBothNull = (a, b, tol = 0.5) => (a === null && b === null) || near(a, b, tol);
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const SPLIT_NAMES = ['Whole milk', 'Sucrose'];
const rowsNamed = (read, name) => read.rows.filter((r) => r.name === name);

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
function preconditionOlive(label, read, { removed }) {
  countedCheck(read.notes === 4, `${label}: baseline has 4 portion notes (read ${read.notes})`);
  countedCheck(read.links.length === 12, `${label}: baseline has 12 links (read ${read.links.length})`);
  for (const name of SPLIT_NAMES) {
    const rows = rowsNamed(read, name);
    countedCheck(rows.length === 2 && rows.filter((r) => r.hasLink).length === 1, `${label}: ${name} has two rows and a link on one only (rows ${rows.length}, with link ${rows.filter((r) => r.hasLink).length})`);
  }
  const split = read.links.filter((l) => l.note !== null);
  countedCheck(split.length === 2 && split[0].name === 'Whole milk' && split[1].name === 'Sucrose', `${label}: the links with a note are Whole milk and Sucrose (read ${JSON.stringify(split.map((l) => l.name))})`);
  for (const l of split) {
    countedCheck(near(l.gap, 14), `${label}: ${l.name} link gap ${l.gap} is 14`);
    countedCheck(l.noteAfterButton === true, `${label}: ${l.name} portion line follows its link`);
    countedCheck(l.ariaLabel === null, `${label}: ${l.name} link has no aria-label (read ${l.ariaLabel})`);
  }
  const milk = rowsNamed(read, 'Whole milk');
  if (!removed) {
    countedCheck(milk.every((r) => r.noteText && r.noteText.endsWith('46.3% in all')), `${label}: Whole milk's two notes end 46.3% in all (read ${JSON.stringify(milk.map((r) => r.noteText))})`);
  } else {
    const milkLink = read.links.find((l) => l.name === 'Whole milk');
    countedCheck(milkLink && milkLink.label === 'restore', `${label}: Whole milk's one link reads restore (read ${milkLink?.label})`);
    countedCheck(milk.length === 2 && milk.every((r) => r.struck), `${label}: both Whole milk rows are struck`);
    countedCheck(milk.every((r) => r.noteText && r.noteText.endsWith('86.3% in all')), `${label}: Whole milk's two notes end 86.3% in all, the defect (read ${JSON.stringify(milk.map((r) => r.noteText))})`);
  }
}

function preconditionMex(label, read) {
  countedCheck(read.notes === 0, `${label}: baseline has 0 portion notes (read ${read.notes})`);
  countedCheck(read.links.length >= 1, `${label}: baseline has links (read ${read.links.length})`);
}

function compareOlive(label, after, before, { removed }) {
  const beforeLinkAt = new Map(before.links.map((l) => [l.rowIndex, l]));
  const splitFirst = {};
  for (const l of before.links) if (l.note) splitFirst[l.name] = l;
  const isSecondLine = (i) => splitFirst[before.rows[i].name] !== undefined && !beforeLinkAt.has(i);

  // 14 links: the baseline's, plus one at each split ingredient's second line carrying
  // that ingredient's first-line label.
  const expectedSeq = before.rows
    .map((r, i) => (beforeLinkAt.has(i) ? [beforeLinkAt.get(i).name, beforeLinkAt.get(i).label] : isSecondLine(i) ? [r.name, splitFirst[r.name].label] : null))
    .filter(Boolean);
  countedCheck(after.links.length === 14, `${label}: 14 links (read ${after.links.length})`);
  countedCheck(after.notes === before.notes, `${label}: notes ${after.notes} vs ${before.notes}`);
  countedCheck(
    JSON.stringify(after.links.map((l) => [l.name, l.label])) === JSON.stringify(expectedSeq),
    `${label}: link name+label sequence ${JSON.stringify(after.links.map((l) => [l.name, l.label]))} vs ${JSON.stringify(expectedSeq)}`,
  );

  const splitA = after.links.filter((l) => l.note !== null);
  countedCheck(splitA.length === 4, `${label}: four split links (read ${splitA.length})`);
  for (const name of SPLIT_NAMES) {
    countedCheck(
      JSON.stringify(splitA.filter((l) => l.name === name).map((l) => l.step)) === JSON.stringify([2, 3]),
      `${label}: ${name} has a link under Step 2 and one under Step 3 (read ${JSON.stringify(splitA.filter((l) => l.name === name).map((l) => l.step))})`,
    );
  }
  for (const a of splitA) {
    const b = splitFirst[a.name];
    if (!b) continue;
    const who = `${a.name} Step ${a.step}`;
    countedCheck(a.gap !== null && near(a.gap, 14), `${label}: ${who} gap ${a.gap} is 14`);
    countedCheck(a.gapSpan === true, `${label}: ${who} gap span precedes the link`);
    countedCheck(a.noteAfterButton === true, `${label}: ${who} portion line follows the link`);
    countedCheck(a.note && a.note.top >= a.btnBottom - 0.5, `${label}: ${who} note top ${a.note?.top} >= btn bottom ${a.btnBottom}`);
    countedCheck(near(a.btn.width, b.btn.width) && near(a.btn.height, b.btn.height), `${label}: ${who} button ${JSON.stringify(a.btn)} vs baseline first line ${JSON.stringify(b.btn)}`);
    countedCheck(a.ariaLabel === `${a.label} ${a.name}, Step ${a.step}`, `${label}: ${who} aria-label "${a.ariaLabel}"`);
  }
  after.links
    .filter((l) => l.note === null)
    .forEach((a) => {
      const b = beforeLinkAt.get(a.rowIndex);
      countedCheck(a.ariaLabel === null, `${label}: ${a.name} (non-split) has no aria-label (read ${a.ariaLabel})`);
      if (!b) return;
      countedCheck(nearOrBothNull(a.gap, b.gap), `${label}: ${a.name} gap ${a.gap} vs ${b.gap}`);
      countedCheck(near(a.off, b.off), `${label}: ${a.name} off ${a.off} vs ${b.off}`);
      countedCheck(near(a.btn.width, b.btn.width) && near(a.btn.height, b.btn.height), `${label}: ${a.name} button ${JSON.stringify(a.btn)} vs ${JSON.stringify(b.btn)}`);
      countedCheck(near(a.rowHeight, b.rowHeight), `${label}: ${a.name} rowHeight ${a.rowHeight} vs ${b.rowHeight}`);
    });

  countedCheck(after.rows.length === before.rows.length, `${label}: row count ${after.rows.length} vs ${before.rows.length}`);
  const growth = [];
  after.rows.forEach((row, i) => {
    const b = before.rows[i];
    if (!b) return;
    const rl = `${label} row ${i} "${row.textNoLink.slice(0, 24)}"`;
    const wantText = removed && b.name === 'Whole milk' ? b.textNoLink.replace('86.3% in all', '46.3% in all') : b.textNoLink;
    countedCheck(row.textNoLink === wantText, `${rl}: text "${row.textNoLink}" vs "${wantText}"`);
    if (isSecondLine(i)) {
      growth.push(row.height - b.height);
      countedCheck(row.height > b.height, `${rl}: second line is taller than its baseline (${row.height} vs ${b.height})`);
      if (!removed) {
        const firstIdx = before.rows.findIndex((r, j) => r.name === b.name && beforeLinkAt.has(j));
        const first = after.rows[firstIdx];
        countedCheck(first && near(row.height, first.height), `${rl}: Step 3 line ${row.height} as tall as its Step 2 line ${first?.height}`);
      }
      cellsSame(rl, row, b, { skipY: true });
    } else {
      countedCheck(near(row.height, b.height), `${rl}: height ${row.height} vs ${b.height}`);
      cellsSame(rl, row, b, { skipY: false });
    }
  });
  countedCheck(near(after.table.width, before.table.width), `${label}: table width ${after.table.width} vs ${before.table.width}`);
  countedCheck(near(after.table.height, before.table.height + sum(growth), 1), `${label}: table height ${after.table.height} vs ${before.table.height} + ${round(sum(growth))}`);
  countedCheck(near(after.overflow, before.overflow), `${label}: overflow ${after.overflow} vs ${before.overflow}`);
  if (removed) {
    const milk = rowsNamed(after, 'Whole milk');
    countedCheck(milk.length === 2 && milk.every((r) => r.noteText && r.noteText.endsWith('46.3% in all')), `${label}: Whole milk's two notes end 46.3% in all (read ${JSON.stringify(milk.map((r) => r.noteText))})`);
    countedCheck(milk.every((r) => r.struck), `${label}: both Whole milk rows are struck`);
    countedCheck(after.links.filter((l) => l.name === 'Whole milk').every((l) => l.label === 'restore'), `${label}: both Whole milk lines read restore`);
  }
}

function checkRoundTrip(label, roundTrip) {
  const milkLinks = roundTrip.links.filter((l) => l.name === 'Whole milk');
  const milk = rowsNamed(roundTrip, 'Whole milk');
  countedCheck(milkLinks.length === 2 && milkLinks.every((l) => l.label === 'remove'), `${label} round trip: both Whole milk lines read remove again (read ${JSON.stringify(milkLinks.map((l) => l.label))})`);
  countedCheck(milk.length === 2 && milk.every((r) => !r.struck), `${label} round trip: both Whole milk rows unstruck`);
  countedCheck(milk.every((r) => r.noteText && r.noteText.endsWith('46.3% in all')), `${label} round trip: both notes end 46.3% in all (read ${JSON.stringify(milk.map((r) => r.noteText))})`);
}

function compareMex(label, after, before) {
  countedCheck(after.notes === 0, `${label}: 0 portion notes (read ${after.notes})`);
  countedCheck(after.links.length === before.links.length, `${label}: link count ${after.links.length} vs ${before.links.length}`);
  after.links.forEach((a, i) => {
    const b = before.links[i];
    if (!b) return;
    countedCheck(a.name === b.name && a.label === b.label, `${label}: link ${i} ${a.name}/${a.label} vs ${b.name}/${b.label}`);
    countedCheck(a.ariaLabel === null, `${label}: ${a.name} has no aria-label (read ${a.ariaLabel})`);
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
  const splitRows = (read) => (read ? read.rows.filter((r) => SPLIT_NAMES.includes(r.name)) : []);
  const sb = splitRows(before);
  const sa = splitRows(after);
  const links = after.links.filter((l) => l.note !== null);
  return JSON.stringify({
    cell: key,
    splitRowHeights: c.olive ? sa.map((r, i) => [`${r.name} Step ${r.step}`, round(sb[i]?.height), round(r.height)]) : undefined,
    gaps: c.olive ? links.map((l) => round(l.gap)) : undefined,
    noteTopMinusBtnBottom: c.olive ? links.map((l) => round(l.note.top - l.btnBottom)) : undefined,
    ariaLabels: c.olive ? links.map((l) => l.ariaLabel) : undefined,
    wholeMilkNotes: c.olive ? rowsNamed(after, 'Whole milk').map((r) => r.noteText) : undefined,
    tableHeight: [before ? round(before.table.height) : null, round(after.table.height)],
    overflow: [before ? before.overflow : null, after.overflow],
  });
}

async function runApp(group, browser, servers) {
  const baseline = group === 'baseline' ? null : JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
  const results = {};
  for (const [coarse, pointer] of POINTERS) {
    if ((group === 'tracer' || group === 'removed') && !coarse) continue;
    for (const width of WIDTHS) {
      if ((group === 'tracer' || group === 'removed') && width !== 1600) continue;
      for (const c of CASES) {
        if (group === 'tracer' && c.id !== 'olive-v1 pen') continue;
        if (group === 'removed' && c.id !== 'olive-v1 removed') continue;
        const key = cellKey(pointer, width, c.id);
        const { read, roundTrip } = await measure(browser, servers, width, coarse, c, { trip: group !== 'baseline' });
        results[key] = read;
        if (group === 'baseline') {
          if (c.olive) preconditionOlive(key, read, { removed: !!c.removed });
          else preconditionMex(key, read);
          console.log(summaryLine(key, c, null, read));
          continue;
        }
        const before = baseline[key];
        countedCheck(before !== undefined, `${key}: baseline cell exists`);
        if (!before) continue;
        if (c.olive) compareOlive(key, read, before, { removed: !!c.removed });
        else compareMex(key, read, before);
        if (roundTrip) checkRoundTrip(key, roundTrip);
        console.log(summaryLine(key, c, before, read));
      }
    }
  }
  if (group === 'baseline' && failures.length === 0) await writeFile(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
}

async function runBoard(browser, servers) {
  for (const [coarse, pointer] of POINTERS) {
    const { context: bctx, page: bpage } = await openBoard(browser, servers.repoUrl, BOARD_FILE, { coarse });
    const boardReads = {};
    try {
      const { tables, map } = await bpage.evaluate(readPanelMap);
      console.log(JSON.stringify({ board: BOARD_FILE, pointer, tables, panels: Object.fromEntries(Object.entries(map).filter(([id]) => id.startsWith('batch-fp-B-'))) }));
      for (const width of WIDTHS) {
        for (const state of ['rest', 'removed']) {
          const id = `batch-fp-B-${state}-${width}`;
          const idx = map[id];
          if (!idx || idx.length !== 1) throw new Error(`board: panel ${id} maps to ${JSON.stringify(idx)}, not exactly one table`);
          boardReads[`${width}|${state}`] = await bpage.evaluate(readPen, { selector: 'table.ingredient-table', index: idx[0] });
        }
      }
    } finally {
      await bctx.close();
    }
    for (const width of WIDTHS) {
      for (const [state, caseId] of [['rest', 'olive-v1 pen'], ['removed', 'olive-v1 removed']]) {
        const key = `webkit|${pointer}|${width}|board B-${state}`;
        const board = boardReads[`${width}|${state}`];
        const { read: app } = await measure(browser, servers, width, coarse, CASE[caseId]);
        countedCheck(board.links.length === 14 && app.links.length === 14, `${key}: 14 links on both (board ${board.links.length}, app ${app.links.length})`);
        const bs = board.links.filter((l) => l.note !== null);
        const as = app.links.filter((l) => l.note !== null);
        countedCheck(bs.length === 4 && as.length === 4, `${key}: all four split lines carry a link on both (board ${bs.length}, app ${as.length})`);
        const lines = [];
        as.forEach((a, i) => {
          const b = bs[i];
          if (!b) return;
          const who = `${a.name} Step ${a.step}`;
          countedCheck(a.name === b.name && a.step === b.step, `${key}: link ${i} is ${a.name} Step ${a.step} on the app, ${b.name} Step ${b.step} on the board`);
          countedCheck(a.gap !== null && b.gap !== null && near(a.gap, b.gap), `${key}: ${who} gap app ${a.gap} vs board ${b.gap}`);
          countedCheck(a.noteAfterButton === true && b.noteAfterButton === true, `${key}: ${who} portion line follows the link on both`);
          countedCheck(a.note.top >= a.btnBottom - 0.5 && b.note.top >= b.btnBottom - 0.5, `${key}: ${who} note top >= btn bottom on both`);
          if (state === 'removed' && a.name === 'Whole milk') {
            countedCheck(a.label === 'restore' && b.label === 'restore', `${key}: ${who} reads restore on both (app ${a.label}, board ${b.label})`);
          }
          const buttonsAgree = near(a.btn.height, b.btn.height);
          if (buttonsAgree) countedCheck(near(a.rowHeight, b.rowHeight, 1), `${key}: ${who} row height app ${a.rowHeight} vs board ${b.rowHeight} (buttons agree at ${a.btn.height})`);
          lines.push({ line: who, gap: [round(a.gap), round(b.gap)], rowHeight: [round(a.rowHeight), round(b.rowHeight)], btnHeight: [round(a.btn.height), round(b.btn.height)], rowHeightCompared: buttonsAgree });
        });
        console.log(
          JSON.stringify({
            cell: key,
            appVsBoard: lines,
            wholeMilkNotes: state === 'removed' ? { app: rowsNamed(app, 'Whole milk').map((r) => r.noteText), board: rowsNamed(board, 'Whole milk').map((r) => r.noteText) } : undefined,
          }),
        );
      }
    }
  }
}

const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
const known = ['baseline', 'tracer', 'removed', 'matrix', 'board'];
if (groups.length === 0 || groups.some((g) => !known.includes(g))) {
  console.log('usage: node 261004-ox6-probe.mjs baseline|tracer|removed|matrix|board[,...]');
  process.exit(2);
}
const servers = await startServers();
const browser = await webkit.launch();
try {
  for (const g of groups) {
    if (g === 'board') await runBoard(browser, servers);
    else await runApp(g, browser, servers);
  }
} finally {
  await browser.close();
  await servers.close();
}
finish(failures, count, `261004-ox6 probe (${groups.join(',')})`);
