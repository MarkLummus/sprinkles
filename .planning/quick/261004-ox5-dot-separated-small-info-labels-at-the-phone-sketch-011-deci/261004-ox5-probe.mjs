// Quick task 261004-ox5's probe: sketch 011 decisions 41 and 42 (Mark, 2026-10-04).
// Measures the BUILT app (app/dist) in Playwright's WebKit (coarse pointer) and system
// Chrome (fine pointer) at 393, 723, 744, 1366 and 1600, before and after, and against
// the boards info-labels-phone.html (A panels at 393 and 723) and
// info-labels-batch-head.html (A2 panels at 744 and 1366).
//
//   node 261004-ox5-probe.mjs baseline       (build of the unchanged source; asserts the plan's precondition, writes the JSON)
//   node 261004-ox5-probe.mjs board-before   (baseline JSON vs the AS-BUILT panels; run on the unchanged build)
//   node 261004-ox5-probe.mjs labels         (every cell of the current build vs the baseline)
//   node 261004-ox5-probe.mjs board          (current build vs the TARGET panels; baseline vs the as-built panels again)
//   groups combine with commas: baseline,board-before   or   labels,board
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never
// requests Mark's :4173 preview, the dev server on :5173 or the sketch server on :8011,
// and starts no Vite process. recordAnotherBatch runs in a throwaway browser context;
// nothing reaches Mark's IndexedDB. A reading here is evidence about two engines, not
// about Mark's iPhone or iPad.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, APP_ROUTE, recordAnotherBatch, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(HERE, '261004-ox5-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];
// The plan's cells: WebKit with a coarse pointer at every width, Chrome with a fine one.
const coarseFor = (engine) => engine === 'webkit';

const WIDTHS = [393, 723, 744, 1366, 1600];
const ROUTES = [
  { id: 'mex3', route: MEX3 },
  { id: 'olive1', route: APP_ROUTE },
  { id: 'olive1-two', route: APP_ROUTE, widths: [393, 723, 1366], afterOpen: async (page) => {
      await recordAnotherBatch(page, '2026-09-01');
      // the route changes before the notebook has re-rendered: wait for the Batches row (two batches) so no read lands mid-transition
      await page.waitForSelector('.notebook .fold-row[aria-label^="Batches,"]');
      await page.waitForSelector('.notebook .batch-row__head');
    } },
];

async function openApp(browser, appUrl, route, { width, coarse }, ready = '.notebook') {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector(ready);
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openApp: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

// In-page reader. spec.root: a selector for a board panel's inner div, or null for the app
// (document). spec.marked: read only the [data-m="row"] element inside the root (a board
// panel yields exactly one fold row, jump or head). Runs in the page.
async function readLabels(spec) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const root = spec.root ? document.querySelector(spec.root) : document;
  if (!root) throw new Error(`no root for ${JSON.stringify(spec)}`);
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const rr = (e) => {
    const b = e.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  };
  const textRect = (e) => {
    const g = document.createRange();
    g.selectNodeContents(e);
    const rs = [...g.getClientRects()].filter((k) => k.width > 0);
    return { left: Math.min(...rs.map((k) => k.left)), right: Math.max(...rs.map((k) => k.right)) };
  };
  const before = (e) => {
    const cs = getComputedStyle(e, '::before');
    return { content: cs.content, marginRight: cs.marginRight };
  };

  const readFold = (f) => {
    const control = f.querySelector('.fold-row__control');
    const countEl = f.querySelector('.fold-row__count');
    const head = f.querySelector('.fold-row__head');
    const label = norm(head.textContent.replace(control.textContent, ''));
    return {
      kind: 'fold',
      label,
      aria: f.getAttribute('aria-label'),
      rect: rr(f),
      justifyContent: getComputedStyle(f).justifyContent,
      hasCount: !!countEl,
      gap: countEl ? textRect(countEl).left - textRect(control).right : null,
      before: countEl ? before(countEl) : null,
      inLog: !!f.closest('.notebook-log'),
    };
  };

  const readJump = (jumpEl) => {
    const cs = getComputedStyle(jumpEl);
    const shown = cs.display !== 'none';
    const status = jumpEl.querySelector('.notebook-jump__status');
    return {
      kind: 'jump',
      display: cs.display,
      justifyContent: cs.justifyContent,
      aria: jumpEl.getAttribute('aria-label'),
      before: before(status),
      rect: shown ? rr(jumpEl) : null,
      gap: shown ? textRect(status).left - textRect(jumpEl.querySelector('.notebook-jump__control')).right : null,
    };
  };

  const readHead = (h) => {
    const lead = h.querySelector('.batch-row__head-lead');
    const acts = h.querySelector('.batch-row__head-acts');
    const cs = getComputedStyle(h);
    const lr = lead.getBoundingClientRect();
    const ar = acts.getBoundingClientRect();
    const wrapped = ar.top >= lr.bottom - 0.5;
    const last = lead.lastElementChild;
    return {
      kind: 'head',
      rect: rr(h),
      wrapped,
      hgap: wrapped ? null : textRect(acts).left - textRect(last).right,
      vgap: wrapped ? ar.top - lr.bottom : null,
      rowGap: cs.rowGap,
      columnGap: cs.columnGap,
      justifyContent: cs.justifyContent,
      actsLeftMinusLeadLeft: ar.left - lr.left,
      actsChildH: acts.firstElementChild ? acts.firstElementChild.getBoundingClientRect().height : null,
    };
  };

  if (spec.marked) {
    const el = root.querySelector('[data-m="row"]');
    if (!el) throw new Error(`no [data-m="row"] in ${spec.root}`);
    if (el.classList.contains('fold-row')) return readFold(el);
    if (el.classList.contains('notebook-jump')) return readJump(el);
    if (el.classList.contains('batch-row__head')) return readHead(el);
    throw new Error(`unknown marked element in ${spec.root}`);
  }

  const foldEls = [...root.querySelectorAll('.fold-row')];
  const folds = foldEls.map(readFold);
  const jumpEl = root.querySelector('.notebook-jump');
  const jump = jumpEl ? readJump(jumpEl) : null;
  const heads = [...root.querySelectorAll('.batch-row__head')].map(readHead);

  const inHead = (e) => !!e.closest('.batch-row__head');
  const tops = (sel) => [...root.querySelectorAll(sel)].filter((e) => !inHead(e) && e.getBoundingClientRect().height > 0).map((e) => ({ id: `${e.tagName}.${e.className}`, y: e.getBoundingClientRect().top }));
  const band = tops('.notebook-band *');
  const log = tops('.notebook-log *');

  // Hit test, after every rect has been read: a point 4px inside the row's right end,
  // vertically centred, must land on the row itself.
  const hitsRow = (el) => {
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect();
    if (b.height === 0) return null;
    const t = document.elementFromPoint(b.right - 4, b.top + b.height / 2);
    return !!t && t.closest('.fold-row, .notebook-jump') === el;
  };
  foldEls.forEach((el, i) => {
    folds[i].hit = folds[i].hasCount ? hitsRow(el) : null;
  });
  if (jump && jump.rect) jump.hit = hitsRow(jumpEl);
  window.scrollTo(0, 0);

  return {
    innerWidth: window.innerWidth,
    coarse: matchMedia('(pointer: coarse)').matches,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    folds,
    jump,
    heads,
    band,
    log,
  };
}

async function measureCell(browser, servers, width, coarse, r) {
  const { context, page } = await openApp(browser, servers.appUrl, r.route, { width, coarse });
  try {
    if (r.afterOpen) await r.afterOpen(page);
    return await page.evaluate(readLabels, { root: null });
  } finally {
    await context.close();
  }
}

function cells() {
  const out = [];
  for (const [engine] of engines) {
    for (const width of WIDTHS) {
      for (const r of ROUTES) {
        if (r.widths && !r.widths.includes(width)) continue;
        out.push({ engine, width, coarse: coarseFor(engine), r, key: `${engine}|${width}|${r.id}` });
      }
    }
  }
  return out;
}

const gapOf = (x) => (x.kind === 'head' ? (x.wrapped ? x.vgap : x.hgap) : x.gap);

function summary(c, before, after) {
  const g = (read) => Object.fromEntries(read.folds.filter((f) => f.hasCount).map((f) => [f.label, round(f.gap)]));
  const hd = (read) => read.heads.map((h) => ({ wrapped: h.wrapped, hgap: round(h.hgap), vgap: round(h.vgap), h: round(h.rect.h), rowGap: h.rowGap, columnGap: h.columnGap }));
  const j = (read) => (read.jump ? { display: read.jump.display, gap: round(read.jump.gap), h: read.jump.rect ? round(read.jump.rect.h) : null } : null);
  return JSON.stringify({ cell: c.key, gaps: [before ? g(before) : null, g(after)], jump: [before ? j(before) : null, j(after)], heads: [before ? hd(before) : null, hd(after)], overflow: [before ? before.overflow : null, after.overflow] });
}

// ---------------------------------------------------------------------------
// The plan's assumptions about the unchanged build.
function precondition(c, read) {
  const k = c.key;
  const phone = c.width < 724;
  for (const f of read.folds) {
    countedCheck(f.rect.h >= 44 - 0.5, `${k}: baseline ${f.label} row height ${round(f.rect.h)} is at least 44`);
    if (!f.hasCount) continue;
    countedCheck(f.hit === true, `${k}: baseline ${f.label} row hit-tests to itself near its right end`);
    if (phone) {
      countedCheck(f.gap > 100, `${k}: baseline ${f.label} gap ${round(f.gap)} exceeds 100 (the far end)`);
      countedCheck(f.before.content === 'none' || f.before.content === 'normal', `${k}: baseline ${f.label} count has no ::before (read ${f.before.content})`);
    } else {
      countedCheck(Math.abs(f.gap - 32) <= 1, `${k}: baseline ${f.label} gap ${round(f.gap)} within 1 of 32`);
      countedCheck(f.before.content === '"·"', `${k}: baseline ${f.label} carries the dot (read ${f.before.content})`);
    }
  }
  if (c.r.id === 'mex3') countedCheck(read.folds.some((f) => f.label === 'History' && f.hasCount), `${k}: History row with a count exists`);
  if (c.r.id === 'olive1') countedCheck(read.folds.some((f) => f.label === 'Tasting' && f.hasCount), `${k}: Tasting row with a count exists`);
  if (c.r.id === 'olive1-two') countedCheck(read.folds.some((f) => f.label === 'Batches' && f.hasCount), `${k}: Batches row with a count exists`);
  countedCheck(read.jump !== null, `${k}: Go to batch row exists`);
  if (read.jump) {
    if (phone) {
      countedCheck(read.jump.display !== 'none', `${k}: baseline jump is displayed (read ${read.jump.display})`);
      countedCheck(read.jump.justifyContent === 'space-between', `${k}: baseline jump computes space-between (read ${read.jump.justifyContent})`);
      countedCheck(read.jump.gap > 100, `${k}: baseline jump gap ${round(read.jump.gap)} exceeds 100`);
      countedCheck(read.jump.before.content === 'none' || read.jump.before.content === 'normal', `${k}: baseline jump status has no ::before (read ${read.jump.before.content})`);
      countedCheck(read.jump.rect.h >= 44 - 0.5, `${k}: baseline jump height ${round(read.jump.rect.h)} is at least 44`);
      countedCheck(read.jump.hit === true, `${k}: baseline jump hit-tests to itself near its right end`);
    } else {
      countedCheck(read.jump.display === 'none', `${k}: baseline jump display none from 724 (read ${read.jump.display})`);
    }
  }
  if (c.r.id === 'olive1') {
    const h = read.heads[0];
    countedCheck(!!h, `${k}: a batch head exists`);
    if (h) {
      if (c.width === 393) {
        countedCheck(h.wrapped && near(h.vgap, 16), `${k}: baseline head wrapped=${h.wrapped} vgap ${round(h.vgap)} (expected wrapped, 16)`);
      } else if (c.width === 723) {
        countedCheck(!h.wrapped && h.hgap > 100, `${k}: baseline head wrapped=${h.wrapped} hgap ${round(h.hgap)} (expected one line, over 100)`);
      } else if (c.width === 744) {
        countedCheck(!h.wrapped && near(h.hgap, 32), `${k}: baseline head wrapped=${h.wrapped} hgap ${round(h.hgap)} (expected one line, 32)`);
      } else {
        countedCheck(h.wrapped && near(h.vgap, 32), `${k}: baseline head wrapped=${h.wrapped} vgap ${round(h.vgap)} (expected wrapped, 32)`);
      }
      if (c.width >= 744) countedCheck(h.rowGap === '32px' && h.columnGap === '32px', `${k}: baseline head gaps ${h.rowGap}/${h.columnGap} (expected 32px/32px)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Every cell of the current build against the baseline.
function labelCompare(c, a, b) {
  const k = c.key;
  const phone = c.width < 724;
  countedCheck(near(a.overflow, b.overflow), `${k}: overflow ${a.overflow} vs ${b.overflow}`);
  countedCheck(a.folds.length === b.folds.length, `${k}: fold count ${a.folds.length} vs ${b.folds.length}`);
  a.folds.forEach((f, i) => {
    const o = b.folds[i];
    if (!o) return;
    const fl = `${k} fold ${f.label}`;
    countedCheck(f.label === o.label, `${fl}: label ${f.label} vs ${o.label}`);
    countedCheck(f.aria === o.aria, `${fl}: aria-label "${f.aria}" vs "${o.aria}"`);
    countedCheck(near(f.rect.x, o.rect.x) && near(f.rect.w, o.rect.w) && near(f.rect.h, o.rect.h), `${fl}: x/w/h ${round(f.rect.x)}/${round(f.rect.w)}/${round(f.rect.h)} vs ${round(o.rect.x)}/${round(o.rect.w)}/${round(o.rect.h)}`);
    countedCheck(f.rect.h >= 44 - 0.5, `${fl}: height ${round(f.rect.h)} is at least 44`);
    if (phone || !f.inLog) countedCheck(near(f.rect.y, o.rect.y), `${fl}: y ${round(f.rect.y)} vs ${round(o.rect.y)}`);
    if (!f.hasCount) return;
    countedCheck(f.hit === true, `${fl}: hit-tests to itself near its right end`);
    countedCheck(f.justifyContent === 'flex-start', `${fl}: justify ${f.justifyContent}`);
    countedCheck(f.before.content === '"·"' && f.before.marginRight === '14px', `${fl}: before ${JSON.stringify(f.before)}`);
    countedCheck(Math.abs(f.gap - 32) <= 1, `${fl}: gap ${round(f.gap)} within 1 of 32`);
    if (!phone) countedCheck(near(f.gap, o.gap), `${fl}: gap ${round(f.gap)} vs the baseline's ${round(o.gap)}`);
  });
  if (a.jump && b.jump) {
    const j = a.jump;
    countedCheck(j.display === b.jump.display, `${k}: jump display ${j.display} vs ${b.jump.display}`);
    countedCheck(j.aria === b.jump.aria, `${k}: jump aria-label "${j.aria}" vs "${b.jump.aria}"`);
    countedCheck(j.justifyContent === 'flex-start', `${k}: jump justify ${j.justifyContent}`);
    countedCheck(j.before.content === '"·"' && j.before.marginRight === '14px', `${k}: jump status before ${JSON.stringify(j.before)}`);
    if (phone) {
      const o = b.jump;
      countedCheck(near(j.rect.x, o.rect.x) && near(j.rect.y, o.rect.y) && near(j.rect.w, o.rect.w) && near(j.rect.h, o.rect.h), `${k}: jump rect ${JSON.stringify(j.rect)} vs ${JSON.stringify(o.rect)}`);
      countedCheck(j.rect.h >= 44 - 0.5, `${k}: jump height ${round(j.rect.h)} is at least 44`);
      countedCheck(Math.abs(j.gap - 32) <= 1, `${k}: jump gap ${round(j.gap)} within 1 of 32`);
      countedCheck(j.hit === true, `${k}: jump hit-tests to itself near its right end`);
    }
  }
  countedCheck(a.heads.length === b.heads.length, `${k}: head count ${a.heads.length} vs ${b.heads.length}`);
  const deltas = a.heads.map((h, i) => (b.heads[i] ? h.rect.h - b.heads[i].rect.h : 0));
  a.heads.forEach((h, i) => {
    const o = b.heads[i];
    if (!o) return;
    const hl = `${k} head ${i}`;
    countedCheck(h.justifyContent === 'flex-start' && h.columnGap === '32px' && h.rowGap === '16px', `${hl}: justify ${h.justifyContent} gaps row ${h.rowGap} / column ${h.columnGap}`);
    countedCheck(h.wrapped === o.wrapped, `${hl}: wrapped ${h.wrapped} vs ${o.wrapped}`);
    if (!h.wrapped) {
      countedCheck(near(h.hgap, 32), `${hl}: hgap ${round(h.hgap)} is 32`);
      countedCheck(near(h.rect.h, o.rect.h), `${hl}: one-line height ${round(h.rect.h)} vs ${round(o.rect.h)}`);
    } else {
      countedCheck(near(h.vgap, 16), `${hl}: vgap ${round(h.vgap)} is 16`);
      if (phone) countedCheck(near(h.rect.h, o.rect.h), `${hl}: wrapped height ${round(h.rect.h)} vs ${round(o.rect.h)}`);
      else countedCheck(near(h.rect.h, o.rect.h - 16), `${hl}: wrapped height ${round(h.rect.h)} vs ${round(o.rect.h)} minus 16`);
      if (!phone) countedCheck(near(h.actsLeftMinusLeadLeft, 0), `${hl}: acts left minus lead left ${round(h.actsLeftMinusLeadLeft)}`);
    }
  });
  countedCheck(a.band.length === b.band.length && a.band.every((e, i) => near(e.y, b.band[i].y)), `${k}: every band element's y equals the baseline`);
  countedCheck(a.log.length === b.log.length, `${k}: log element count ${a.log.length} vs ${b.log.length}`);
  const expectedShift = (y) => b.heads.reduce((s, h, i) => s + (h.rect.y + h.rect.h <= y + 0.5 ? deltas[i] || 0 : 0), 0);
  let badShift = 0;
  a.log.forEach((e, i) => {
    const o = b.log[i];
    if (o && !near(e.y, o.y + expectedShift(o.y))) badShift += 1;
  });
  countedCheck(badShift === 0, `${k}: ${badShift} log elements off by more than the heads' height change`);
}

// ---------------------------------------------------------------------------
// Boards.
const KINDS = ['history', 'jump', 'jump2', 'tasting', 'tasting2', 'batches', 'head'];
async function readBoards(browser, servers, coarse) {
  const out = {};
  {
    const { context, page } = await openBoard(browser, servers.repoUrl, 'info-labels-phone.html', { coarse });
    try {
      for (const kind of KINDS) {
        for (const o of ['built', 'A']) {
          for (const w of [393, 723]) out[`${kind}-${o}-${w}`] = await page.evaluate(readLabels, { root: `.fp-${kind}-${o}-${w} > div`, marked: true });
        }
      }
    } finally {
      await context.close();
    }
  }
  {
    const { context, page } = await openBoard(browser, servers.repoUrl, 'info-labels-batch-head.html', { coarse });
    try {
      for (const o of ['before', 'A', 'A2']) {
        for (const w of [744, 1366]) out[`headrow-${o}-${w}`] = await page.evaluate(readLabels, { root: `.fp-headrow-${o}-${w} > div`, marked: true });
      }
    } finally {
      await context.close();
    }
  }
  return out;
}

// The app readings that stand against a panel, with the panels' names.
//   asBuilt / target: the panel pids. gapOnly: only the gap and the row's w and h are compared.
function mappings(engine, appCells) {
  const m = [];
  const cell = (w, id) => appCells[`${engine}|${w}|${id}`];
  for (const w of [393, 723]) {
    const mex = cell(w, 'mex3');
    const olive = cell(w, 'olive1');
    const two = cell(w, 'olive1-two');
    m.push({ name: `History ${w}`, w, app: mex.folds.find((f) => f.label === 'History' && f.hasCount), asBuilt: `history-built-${w}`, target: `history-A-${w}` });
    m.push({ name: `Go to batch awaiting ${w}`, w, app: mex.jump, asBuilt: `jump-built-${w}`, target: `jump-A-${w}` });
    m.push({ name: `Go to batch tasted ${w}`, w, app: olive.jump, asBuilt: `jump2-built-${w}`, target: `jump2-A-${w}` });
    m.push({ name: `Tasting ${w}`, w, app: olive.folds.find((f) => f.label === 'Tasting' && f.hasCount), asBuilt: `tasting-built-${w}`, target: `tasting-A-${w}` });
    m.push({ name: `Batches ${w}`, w, app: two.folds.find((f) => f.label === 'Batches' && f.hasCount), asBuilt: `batches-built-${w}`, target: `batches-A-${w}`, gapOnly: true });
    m.push({ name: `head ${w}`, w, app: olive.heads[0], asBuilt: `head-built-${w}`, target: `head-A-${w}` });
  }
  for (const [w, p] of [[744, 744], [1366, 1366], [1600, 1366]]) {
    m.push({ name: `head ${w}`, w, app: cell(w, 'olive1').heads[0], asBuilt: `headrow-A-${p}`, target: `headrow-A2-${p}`, headWide: true });
  }
  return m;
}

// Compare an app reading with one panel's reading.
function panelCompare(label, app, panel, opts = {}) {
  countedCheck(near(gapOf(app), gapOf(panel)), `${label}: gap app ${round(gapOf(app))} vs panel ${round(gapOf(panel))}`);
  if (app.kind !== 'head') {
    countedCheck(near(app.rect.w, panel.rect.w) && near(app.rect.h, panel.rect.h), `${label}: row app ${round(app.rect.w)}x${round(app.rect.h)} vs panel ${round(panel.rect.w)}x${round(panel.rect.h)}`);
  } else {
    countedCheck(app.wrapped === panel.wrapped, `${label}: wrapped app ${app.wrapped} vs panel ${panel.wrapped}`);
    countedCheck(near(app.rect.w, panel.rect.w), `${label}: head width app ${round(app.rect.w)} vs panel ${round(panel.rect.w)}`);
  }
  if (opts.gapOnly) return;
  countedCheck(app.justifyContent === panel.justifyContent, `${label}: justify app ${app.justifyContent} vs panel ${panel.justifyContent}`);
  if (app.kind === 'head') {
    countedCheck(app.rowGap === panel.rowGap && app.columnGap === panel.columnGap, `${label}: gaps app ${app.rowGap}/${app.columnGap} vs panel ${panel.rowGap}/${panel.columnGap}`);
  } else {
    countedCheck(app.before.content === panel.before.content && app.before.marginRight === panel.before.marginRight, `${label}: before app ${JSON.stringify(app.before)} vs panel ${JSON.stringify(panel.before)}`);
  }
}

// The board's head buttons are 44 at every pointer; the app's follow the pointer (24 in Chrome with a mouse). Compare the head's height
// outright only where the buttons agree; the change each side makes is compared separately.
function headHeightOutright(label, app, panel) {
  if (near(app.actsChildH, panel.actsChildH)) countedCheck(near(app.rect.h, panel.rect.h), `${label}: head height app ${round(app.rect.h)} vs panel ${round(panel.rect.h)}`);
}

async function runBoards(group) {
  const servers = await startServers();
  const baseline = JSON.parse(await readFile(BASELINE, 'utf8'));
  try {
    for (const [engine, make] of engines) {
      const browser = await make();
      try {
        const coarse = coarseFor(engine);
        const boards = await readBoards(browser, servers, coarse);
        // The as-built panels against the baseline (board-before, and again in board).
        const baseMap = mappings(engine, baseline);
        for (const m of baseMap) {
          const key = `${engine}|${m.name}`;
          const panel = boards[m.asBuilt];
          panelCompare(`${key} baseline vs ${m.asBuilt}`, m.app, panel, m);
          if (m.app.kind === 'head') headHeightOutright(`${key} baseline vs ${m.asBuilt}`, m.app, panel);
          console.log(JSON.stringify({ group: 'board-before', cell: key, panel: m.asBuilt, gap: [round(gapOf(m.app)), round(gapOf(panel))], row: m.app.kind === 'head' ? [round(m.app.rect.h), round(panel.rect.h)] : [`${round(m.app.rect.w)}x${round(m.app.rect.h)}`, `${round(panel.rect.w)}x${round(panel.rect.h)}`] }));
        }
        if (group === 'board-before') continue;
        // The current build against the target panels.
        const cur = {};
        for (const c of cells().filter((x) => x.engine === engine)) cur[c.key] = await measureCell(browser, servers, c.width, c.coarse, c.r);
        const curMap = mappings(engine, cur);
        curMap.forEach((m, i) => {
          const key = `${engine}|${m.name}`;
          const panel = boards[m.target];
          const asBuilt = boards[m.asBuilt];
          const base = baseMap[i].app;
          panelCompare(`${key} now vs ${m.target}`, m.app, panel, m);
          const out = { group: 'board', cell: key, panel: m.target, gap: [round(gapOf(base)), round(gapOf(m.app)), round(gapOf(panel))], row: [`${round(m.app.rect.w)}x${round(m.app.rect.h)}`, `${round(panel.rect.w)}x${round(panel.rect.h)}`] };
          if (m.app.kind === 'head') {
            headHeightOutright(`${key} now vs ${m.target}`, m.app, panel);
            const appChange = m.app.rect.h - base.rect.h;
            const panelChange = panel.rect.h - asBuilt.rect.h;
            countedCheck(near(appChange, panelChange), `${key}: head height change app ${round(appChange)} vs panel ${round(panelChange)}`);
            out.head = { height: [round(base.rect.h), round(m.app.rect.h), round(panel.rect.h)], change: [round(appChange), round(panelChange)], actsChildH: [m.app.actsChildH, panel.actsChildH], rowColumnGap: [`${m.app.rowGap}/${m.app.columnGap}`, `${panel.rowGap}/${panel.columnGap}`] };
          }
          console.log(JSON.stringify(out));
        });
        // The dated Tasting row has no app cell (the seed has no dated tasting): board reading only.
        for (const w of [393, 723]) {
          const t = boards[`tasting2-A-${w}`];
          console.log(JSON.stringify({ group: 'board', cell: `${engine}|Tasting dated ${w} (board only)`, panel: `tasting2-A-${w}`, gap: round(t.gap), row: `${round(t.rect.w)}x${round(t.rect.h)}` }));
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
}

async function runApp(group) {
  const servers = await startServers();
  const results = {};
  try {
    const baseline = group === 'baseline' ? null : JSON.parse(await readFile(BASELINE, 'utf8'));
    for (const [engine, make] of engines) {
      const browser = await make();
      try {
        for (const c of cells().filter((x) => x.engine === engine)) {
          const read = await measureCell(browser, servers, c.width, c.coarse, c.r);
          results[c.key] = read;
          if (group === 'baseline') {
            precondition(c, read);
            console.log(summary(c, null, read));
          } else {
            const before = baseline[c.key];
            countedCheck(before !== undefined, `${c.key}: baseline cell exists`);
            if (!before) continue;
            labelCompare(c, read, before);
            console.log(summary(c, before, read));
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
  if (group === 'baseline') {
    if (failures.length === 0) await writeFile(BASELINE, JSON.stringify(results, null, 2) + '\n');
    else console.log('baseline NOT written: the build is not what the plan assumes');
  }
}

// ===========================================================================
const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
const known = ['baseline', 'board-before', 'labels', 'board'];
if (groups.length === 0 || groups.some((g) => !known.includes(g))) {
  console.log(`usage: node 261004-ox5-probe.mjs ${known.join('|')}[,...]`);
  process.exit(2);
}
for (const g of groups) {
  if (g === 'board' || g === 'board-before') await runBoards(g);
  else await runApp(g);
}
finish(failures, count, `261004-ox5 probe (${groups.join(',')})`);
