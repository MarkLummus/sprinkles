// Quick task 261004-igr's probe: sketch 011 brief tasks 9 and 10 (decisions 34 A and
// 35 A, Mark 2026-10-04). Measures the BUILT app (app/dist) in Playwright's WebKit
// and system Chrome, before and after, and against row A of the boards
// info-labels-bands.html, info-labels-log.html and sheet-title-pen.html.
//
//   node 261004-igr-probe.mjs labels-baseline   (build of the unchanged source; writes the JSON)
//   node 261004-igr-probe.mjs labels            (every cell vs the baseline)
//   node 261004-igr-probe.mjs labels-board      (app vs row A of the two info-label boards)
//   node 261004-igr-probe.mjs title-baseline    (build before the pen change; writes the JSON)
//   node 261004-igr-probe.mjs title             (every cell vs the baseline)
//   node 261004-igr-probe.mjs title-board       (app vs row A of sheet-title-pen.html)
//   groups combine with commas: labels,labels-board
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers;
// never requests Mark's :4173 preview, the dev server on :5173 or the sketch
// server on :8011, and starts no Vite process. Pens and saves run in throwaway
// browser contexts; nothing reaches Mark's IndexedDB. A reading here is evidence
// about two engines, not about Mark's iPhone or iPad.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, APP_ROUTE, recordAnotherBatch, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LABELS_BASELINE = path.join(HERE, '261004-igr-labels-baseline.json');
const TITLE_BASELINE = path.join(HERE, '261004-igr-title-baseline.json');

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
// Sid's convention: WebKit is coarse up to 1366 and fine above; Chrome is always fine.
const coarseFor = (engine, width) => engine === 'webkit' && width <= 1366;

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

// ===========================================================================
// Task 9: the small info labels.
// In-page reader. spec.root is a selector for the board panel's inner div, or
// null for the app (document). Runs in the page.
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

  const folds = [...root.querySelectorAll('.fold-row')].map((f) => {
    const control = f.querySelector('.fold-row__control');
    const countEl = f.querySelector('.fold-row__count');
    const head = f.querySelector('.fold-row__head');
    const label = norm(head.textContent.replace(control.textContent, ''));
    return {
      label,
      rect: rr(f),
      justifyContent: getComputedStyle(f).justifyContent,
      hasCount: !!countEl,
      gap: countEl ? textRect(countEl).left - textRect(control).right : null,
      before: countEl ? before(countEl) : null,
      inLog: !!f.closest('.notebook-log'),
    };
  });

  const jumpEl = root.querySelector('.notebook-jump');
  let jump = null;
  if (jumpEl) {
    const cs = getComputedStyle(jumpEl);
    const shown = cs.display !== 'none';
    const status = jumpEl.querySelector('.notebook-jump__status');
    jump = {
      display: cs.display,
      justifyContent: cs.justifyContent,
      before: before(status),
      rect: shown ? rr(jumpEl) : null,
      gap: shown ? textRect(status).left - textRect(jumpEl.querySelector('.notebook-jump__control')).right : null,
    };
  }

  const heads = [...root.querySelectorAll('.batch-row__head')].map((h) => {
    const lead = h.querySelector('.batch-row__head-lead');
    const acts = h.querySelector('.batch-row__head-acts');
    const cs = getComputedStyle(h);
    const hr = h.getBoundingClientRect();
    const lr = lead.getBoundingClientRect();
    const ar = acts.getBoundingClientRect();
    const wrapped = ar.top >= lr.bottom - 0.5;
    const last = lead.lastElementChild;
    return {
      rect: rr(h),
      wrapped,
      hgap: wrapped ? null : textRect(acts).left - textRect(last).right,
      vgap: wrapped ? ar.top - lr.bottom : null,
      rowGap: cs.rowGap,
      columnGap: cs.columnGap,
      justifyContent: cs.justifyContent,
      actsLeftMinusLeadLeft: ar.left - lr.left,
      actsChildH: acts.firstElementChild ? acts.firstElementChild.getBoundingClientRect().height : null,
      bottom: hr.bottom,
    };
  });

  const inHead = (e) => !!e.closest('.batch-row__head');
  const tops = (sel) => [...root.querySelectorAll(sel)].filter((e) => !inHead(e) && e.getBoundingClientRect().height > 0).map((e) => ({ id: `${e.tagName}.${e.className}`, y: e.getBoundingClientRect().top }));
  const band = tops('.notebook-band *');
  const log = tops('.notebook-log *');
  const logHeading = [...root.querySelectorAll('.notebook-log h2, .notebook-log h3')].map((e) => ({ text: norm(e.textContent).slice(0, 24), y: e.getBoundingClientRect().top }));

  return {
    innerWidth: window.innerWidth,
    coarse: matchMedia('(pointer: coarse)').matches,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    folds,
    jump,
    heads,
    band,
    log,
    logHeading,
  };
}

const LABEL_WIDTHS = [393, 723, 744, 1024, 1366, 1600, 1920];
const LABEL_ROUTES = [
  { id: 'mex3', route: MEX3 },
  { id: 'olive1', route: APP_ROUTE },
  { id: 'olive1-two', route: APP_ROUTE, widths: [393, 1024], engine: 'webkit', afterOpen: (page) => recordAnotherBatch(page, '2026-09-01') },
];

async function measureLabels(browser, servers, width, coarse, r) {
  const { context, page } = await openApp(browser, servers.appUrl, r.route, { width, coarse });
  try {
    if (r.afterOpen) await r.afterOpen(page);
    return await page.evaluate(readLabels, { root: null });
  } finally {
    await context.close();
  }
}

function labelCells() {
  const cells = [];
  for (const [engine] of engines) {
    for (const width of LABEL_WIDTHS) {
      for (const r of LABEL_ROUTES) {
        if (r.widths && !r.widths.includes(width)) continue;
        if (r.engine && r.engine !== engine) continue;
        cells.push({ engine, width, coarse: coarseFor(engine, width), r, key: `${engine}|${width}|${r.id}` });
      }
    }
  }
  return cells;
}

async function runLabels(group) {
  const servers = await startServers();
  const results = {};
  try {
    const baseline = group === 'labels-baseline' ? null : JSON.parse(await readFile(LABELS_BASELINE, 'utf8'));
    for (const [engine, make] of engines) {
      const browser = await make();
      try {
        for (const c of labelCells().filter((x) => x.engine === engine)) {
          const read = await measureLabels(browser, servers, c.width, c.coarse, c.r);
          results[c.key] = read;
          if (group === 'labels-baseline') {
            labelPrecondition(c, read);
            console.log(labelSummary(c, null, read));
          } else {
            const before = baseline[c.key];
            countedCheck(before !== undefined, `${c.key}: baseline cell exists`);
            if (!before) continue;
            labelCompare(c, read, before);
            console.log(labelSummary(c, before, read));
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
  if (group === 'labels-baseline' && failures.length === 0) await writeFile(LABELS_BASELINE, JSON.stringify(results, null, 2) + '\n');
}

// The plan's assumptions about the unchanged build.
function labelPrecondition(c, read) {
  const k = c.key;
  const wide = c.width >= 724;
  for (const f of read.folds) {
    if (f.hasCount) countedCheck(f.before.content === 'none' || f.before.content === 'normal', `${k}: ${f.label} count has no ::before (read ${f.before.content})`);
    if (wide && f.hasCount) countedCheck(f.gap > 100, `${k}: baseline ${f.label} gap ${round(f.gap)} exceeds 100 (the far end)`);
  }
  if (c.r.id === 'mex3') countedCheck(read.folds.some((f) => f.label === 'History' && f.hasCount), `${k}: History row with a count exists`);
  if (c.r.id === 'olive1') countedCheck(read.folds.some((f) => f.label === 'Tasting' && f.hasCount), `${k}: Tasting row with a count exists`);
  if (c.r.id === 'olive1-two') countedCheck(read.folds.some((f) => f.label === 'Batches' && f.hasCount), `${k}: Batches row with a count exists`);
  countedCheck(read.jump !== null, `${k}: Go to batch row exists`);
  if (read.jump) {
    countedCheck(wide ? read.jump.display === 'none' : read.jump.display !== 'none', `${k}: jump display ${read.jump.display} (shows below 724 only)`);
  }
  if (c.r.id === 'olive1') {
    countedCheck(read.heads.length >= 1, `${k}: a batch head exists`);
    const h = read.heads[0];
    if (h && wide) {
      const expectWrapped = c.width >= 1366;
      countedCheck(h.wrapped === expectWrapped, `${k}: head wrapped=${h.wrapped}, expected ${expectWrapped}`);
    }
  }
}

function labelSummary(c, before, after) {
  const g = (read) => Object.fromEntries(read.folds.filter((f) => f.hasCount).map((f) => [f.label, round(f.gap)]));
  const hd = (read) => read.heads.map((h) => ({ wrapped: h.wrapped, hgap: round(h.hgap), vgap: round(h.vgap), h: round(h.rect.h) }));
  return JSON.stringify({ cell: c.key, gaps: [before ? g(before) : null, g(after)], heads: [before ? hd(before) : null, hd(after)], overflow: [before ? before.overflow : null, after.overflow] });
}

function labelCompare(c, a, b) {
  const k = c.key;
  const wide = c.width >= 724;
  countedCheck(near(a.overflow, b.overflow), `${k}: overflow ${a.overflow} vs ${b.overflow}`);
  countedCheck(a.folds.length === b.folds.length, `${k}: fold count ${a.folds.length} vs ${b.folds.length}`);
  a.folds.forEach((f, i) => {
    const o = b.folds[i];
    if (!o) return;
    const fl = `${k} fold ${f.label}`;
    countedCheck(f.label === o.label, `${fl}: label ${o.label}`);
    if (!wide) {
      countedCheck(near(f.rect.x, o.rect.x) && near(f.rect.y, o.rect.y) && near(f.rect.w, o.rect.w) && near(f.rect.h, o.rect.h), `${fl}: rect ${JSON.stringify(f.rect)} vs ${JSON.stringify(o.rect)}`);
      countedCheck(f.justifyContent === o.justifyContent, `${fl}: justify ${f.justifyContent} vs ${o.justifyContent}`);
      if (f.hasCount) countedCheck(near(f.gap, o.gap), `${fl}: gap ${f.gap} vs ${o.gap}`);
      return;
    }
    countedCheck(f.rect.h >= 44 - 0.5, `${fl}: height ${f.rect.h} >= 44`);
    countedCheck(near(f.rect.x, o.rect.x) && near(f.rect.w, o.rect.w), `${fl}: x/width ${f.rect.x}/${f.rect.w} vs ${o.rect.x}/${o.rect.w}`);
    if (!f.inLog) countedCheck(near(f.rect.y, o.rect.y), `${fl}: band y ${f.rect.y} vs ${o.rect.y}`);
    countedCheck(near(f.rect.h, o.rect.h), `${fl}: h ${f.rect.h} vs ${o.rect.h}`);
    if (f.hasCount) {
      countedCheck(f.justifyContent === 'flex-start', `${fl}: justify ${f.justifyContent}`);
      countedCheck(f.before.content === '"·"' && f.before.marginRight === '14px', `${fl}: before ${JSON.stringify(f.before)}`);
      countedCheck(Math.abs(f.gap - 32) <= 1, `${fl}: gap ${round(f.gap)} within 1 of 32`);
    }
  });
  if (a.jump && b.jump) {
    if (!wide) {
      countedCheck(JSON.stringify(a.jump) === JSON.stringify(b.jump) || (a.jump.display === b.jump.display && a.jump.justifyContent === b.jump.justifyContent && near(a.jump.rect.w, b.jump.rect.w) && near(a.jump.rect.h, b.jump.rect.h) && near(a.jump.rect.y, b.jump.rect.y) && near(a.jump.gap, b.jump.gap)), `${k}: jump ${JSON.stringify(a.jump)} vs ${JSON.stringify(b.jump)}`);
    } else {
      countedCheck(a.jump.display === b.jump.display, `${k}: jump display ${a.jump.display} vs ${b.jump.display}`);
      countedCheck(a.jump.justifyContent === 'flex-start', `${k}: jump justify ${a.jump.justifyContent}`);
      countedCheck(a.jump.before.content === '"·"' && a.jump.before.marginRight === '14px', `${k}: jump status before ${JSON.stringify(a.jump.before)}`);
      if (a.jump.gap !== null) countedCheck(Math.abs(a.jump.gap - 32) <= 1, `${k}: jump gap ${a.jump.gap}`);
    }
  }
  countedCheck(a.heads.length === b.heads.length, `${k}: head count ${a.heads.length} vs ${b.heads.length}`);
  const deltas = a.heads.map((h, i) => (b.heads[i] ? h.rect.h - b.heads[i].rect.h : 0));
  a.heads.forEach((h, i) => {
    const o = b.heads[i];
    if (!o) return;
    const hl = `${k} head ${i}`;
    if (!wide) {
      countedCheck(near(h.rect.h, o.rect.h) && near(h.rect.w, o.rect.w) && near(h.rect.y, o.rect.y) && h.wrapped === o.wrapped, `${hl}: rect ${JSON.stringify(h.rect)} wrapped ${h.wrapped} vs ${JSON.stringify(o.rect)} ${o.wrapped}`);
      countedCheck(h.justifyContent === o.justifyContent && h.rowGap === o.rowGap && h.columnGap === o.columnGap, `${hl}: justify/gaps unchanged`);
      return;
    }
    countedCheck(h.justifyContent === 'flex-start' && h.rowGap === '32px' && h.columnGap === '32px', `${hl}: justify ${h.justifyContent} gaps ${h.rowGap}/${h.columnGap}`);
    countedCheck(h.wrapped === o.wrapped, `${hl}: wrapped ${h.wrapped} vs ${o.wrapped}`);
    if (!h.wrapped) {
      countedCheck(near(h.hgap, 32), `${hl}: hgap ${round(h.hgap)} is 32`);
      countedCheck(near(h.rect.h, o.rect.h), `${hl}: one-line height ${h.rect.h} vs ${o.rect.h}`);
    } else {
      countedCheck(near(h.vgap, 32), `${hl}: vgap ${round(h.vgap)} is 32`);
      countedCheck(near(h.rect.h, o.rect.h + 16), `${hl}: wrapped height ${h.rect.h} vs ${o.rect.h} + 16`);
      countedCheck(near(h.actsLeftMinusLeadLeft, 0), `${hl}: acts left minus lead left ${h.actsLeftMinusLeadLeft}`);
    }
  });
  // Shifts: band unchanged; log elements move by the heads above them.
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

async function runLabelsBoard() {
  const servers = await startServers();
  const baseline = JSON.parse(await readFile(LABELS_BASELINE, 'utf8'));
  try {
    for (const [engine, make] of engines) {
      const browser = await make();
      try {
        const pointers = engine === 'webkit' ? [true, false] : [false];
        const boards = {};
        for (const coarse of pointers) {
          for (const [file, prefix, widths] of [
            ['info-labels-bands.html', 'R35C_InfoBands', [744, 1024, 1366, 1600, 1920]],
            ['info-labels-log.html', 'R35C_InfoLog', [744, 1024, 1366]],
          ]) {
            const { context, page } = await openBoard(browser, servers.repoUrl, file, { coarse });
            try {
              for (let i = 0; i < widths.length; i += 1) {
                boards[`${coarse}|${prefix}|${widths[i]}`] = await page.evaluate(readLabels, { root: `.fp-info-${prefix}-A-${i} > div` });
                boards[`${coarse}|${prefix}|${widths[i]}|today`] = await page.evaluate(readLabels, { root: `.fp-info-${prefix}-today-${i} > div` });
              }
            } finally {
              await context.close();
            }
          }
        }
        for (const width of LABEL_WIDTHS) {
          if (width < 744) continue;
          const coarse = coarseFor(engine, width);
          for (const r of LABEL_ROUTES.filter((x) => !x.afterOpen)) {
            const app = await measureLabels(browser, servers, width, coarse, r);
            const key = `${engine}|${coarse ? 'coarse' : 'fine'}|${width}|${r.id}`;
            const out = { cell: key };
            // Bands board is Mexican Chocolate v3; log board is Olive Oil v1.
            const panel = boards[`${coarse}|${r.id === 'mex3' ? 'R35C_InfoBands' : 'R35C_InfoLog'}|${width}`];
            if (!panel) continue;
            for (const bf of panel.folds.filter((f) => f.hasCount)) {
              const af = app.folds.find((f) => f.label === bf.label && f.hasCount);
              if (!af) continue;
              countedCheck(near(af.gap, bf.gap), `${key}: ${bf.label} gap app ${round(af.gap)} vs board ${round(bf.gap)}`);
              countedCheck(af.justifyContent === bf.justifyContent, `${key}: ${bf.label} justify app ${af.justifyContent} vs board ${bf.justifyContent}`);
              countedCheck(af.before.content === bf.before.content && af.before.marginRight === bf.before.marginRight, `${key}: ${bf.label} before app ${JSON.stringify(af.before)} vs board ${JSON.stringify(bf.before)}`);
              countedCheck(near(af.rect.h, bf.rect.h), `${key}: ${bf.label} row height app ${af.rect.h} vs board ${bf.rect.h}`);
              out[bf.label] = [round(af.gap), round(bf.gap)];
            }
            if (app.jump && panel.jump) {
              countedCheck(app.jump.justifyContent === panel.jump.justifyContent, `${key}: jump justify app ${app.jump.justifyContent} vs board ${panel.jump.justifyContent}`);
              countedCheck(app.jump.before.content === panel.jump.before.content && app.jump.before.marginRight === panel.jump.before.marginRight, `${key}: jump before app ${JSON.stringify(app.jump.before)} vs board ${JSON.stringify(panel.jump.before)}`);
            }
            if (r.id === 'olive1' && panel.heads.length) {
              const ah = app.heads[0];
              const bh = panel.heads[0];
              countedCheck(ah.wrapped === bh.wrapped, `${key}: head wrapped app ${ah.wrapped} vs board ${bh.wrapped}`);
              countedCheck(near(ah.wrapped ? ah.vgap : ah.hgap, bh.wrapped ? bh.vgap : bh.hgap), `${key}: head gap app ${round(ah.wrapped ? ah.vgap : ah.hgap)} vs board ${round(bh.wrapped ? bh.vgap : bh.hgap)}`);
              // The board's head buttons are 44 at every pointer; the app's follow the pointer (24 in Chrome with a mouse). Compare the
              // height outright where the buttons agree; otherwise compare what option A changes (A minus as-drawn) on each side.
              const today = boards[`${coarse}|${r.id === 'mex3' ? 'R35C_InfoBands' : 'R35C_InfoLog'}|${width}|today`].heads[0];
              const base = baseline[`${engine}|${width}|${r.id}`].heads[0];
              if (near(ah.actsChildH, bh.actsChildH)) countedCheck(near(ah.rect.h, bh.rect.h), `${key}: head height app ${round(ah.rect.h)} vs board ${round(bh.rect.h)}`);
              countedCheck(near(ah.rect.h - base.rect.h, bh.rect.h - today.rect.h), `${key}: head height change app ${round(ah.rect.h - base.rect.h)} vs board ${round(bh.rect.h - today.rect.h)}`);
              countedCheck(ah.justifyContent === bh.justifyContent && ah.rowGap === bh.rowGap && ah.columnGap === bh.columnGap, `${key}: head justify/gaps`);
              out.head = { gap: [round(ah.wrapped ? ah.vgap : ah.hgap), round(bh.wrapped ? bh.vgap : bh.hgap)], height: [round(ah.rect.h), round(bh.rect.h)], change: [round(ah.rect.h - base.rect.h), round(bh.rect.h - today.rect.h)], actsChildH: [ah.actsChildH, bh.actsChildH] };
            }
            console.log(JSON.stringify(out));
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
}

// ===========================================================================
// Task 10: the Sheet title in the Next version pen (decision 35 A).
const SHORT = 'Olive Oil Ice Cream, lighter';
const LONG = 'Olive Oil Ice Cream with a much longer title that goes on and on';
const TITLE_STATES = ['same', 'short', 'long'];
const TITLE_CELLS = [
  ['webkit', 393, true],
  ['webkit', 1366, true],
  ['webkit', 1600, false],
  ['chrome', 393, false],
  ['chrome', 1366, false],
  ['chrome', 1600, false],
];

// In-page reader of the pen's Sheet front matter. spec.root: selector of a board
// panel (the app passes null and reads the document).
async function readTitle(spec) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const root = spec.root ? document.querySelector(spec.root) : document;
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const rr = (e) => {
    const b = e.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  };
  const headnote = root.querySelector('.headnote');
  const field = root.querySelector('.headnote__sheet-title-field input, .headnote__sheet-title-field textarea');
  const desc = root.querySelector('.headnote__prose-field textarea');
  const caption = root.querySelector('.headnote__sheet-title-field .pen-caption');
  const out = {
    innerWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    headnote: rr(headnote),
    h1Count: headnote.querySelectorAll('h1').length,
    struck: [...headnote.querySelectorAll('.prose-struck-beneath')].map((e) => norm(e.textContent)),
    field: null,
  };
  if (field) {
    const cs = getComputedStyle(field);
    const lh = parseFloat(cs.lineHeight);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    out.field = {
      tag: field.tagName,
      className: field.className,
      value: field.value,
      rect: rr(field),
      clientHeight: field.clientHeight,
      scrollHeight: field.scrollHeight,
      clientWidth: field.clientWidth,
      scrollWidth: field.scrollWidth,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      borderTop: cs.borderTopWidth,
      borderBottom: cs.borderBottomWidth,
      color: cs.color,
      descColor: desc ? getComputedStyle(desc).color : null,
      captionRect: caption ? rr(caption) : null,
      lines: Number.isNaN(lh) ? null : Math.round((field.clientHeight - pad) / lh),
    };
  }
  return out;
}

async function readReadingH1(page) {
  return page.evaluate(() => {
    const h1 = document.querySelector('.headnote h1');
    if (!h1) return null;
    const b = h1.getBoundingClientRect();
    return { text: h1.textContent, x: b.left, y: b.top, w: b.width, h: b.height, headnoteH: document.querySelector('.headnote').getBoundingClientRect().height };
  });
}

async function measureTitle(browser, servers, width, coarse, state, { extras }) {
  const { context, page } = await openApp(browser, servers.appUrl, APP_ROUTE, { width, coarse });
  page.on('dialog', (d) => d.accept());
  try {
    const reading = await readReadingH1(page);
    await page.getByRole('button', { name: 'Next version' }).first().click();
    const field = page.getByLabel('Sheet title', { exact: true });
    await field.waitFor();
    if (state !== 'same') {
      await field.fill(state === 'short' ? SHORT : LONG);
      await page.waitForTimeout(150);
    }
    const pen = await page.evaluate(readTitle, { root: null });
    const out = { reading, pen };
    if (extras) {
      const h0 = pen.headnote.h;
      await field.click();
      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);
      const afterEnter = await page.evaluate(readTitle, { root: null });
      await field.fill('Line one\nLine two');
      await page.waitForTimeout(100);
      const afterPaste = await page.evaluate(readTitle, { root: null });
      out.enter = { value: afterEnter.field.value, headnoteH: afterEnter.headnote.h, headnoteH0: h0 };
      out.paste = { value: afterPaste.field.value };
      await page.getByRole('button', { name: 'Cancel', exact: true }).first().click();
      await page.waitForSelector('.headnote h1');
      out.afterCancel = await readReadingH1(page);
      await page.emulateMedia({ media: 'print' });
      out.print = await page.evaluate(() => {
        const h1 = document.querySelector('.headnote h1');
        return { display: getComputedStyle(h1).display, h: h1.getBoundingClientRect().height };
      });
      await page.emulateMedia({ media: 'screen' });
    }
    return out;
  } finally {
    await context.close();
  }
}

async function runTitle(group) {
  const servers = await startServers();
  const results = {};
  try {
    const baseline = group === 'title-baseline' ? null : JSON.parse(await readFile(TITLE_BASELINE, 'utf8'));
    for (const [engine, make] of engines) {
      const browser = await make();
      try {
        for (const [e, width, coarse] of TITLE_CELLS.filter((c) => c[0] === engine)) {
          for (const state of TITLE_STATES) {
            const key = `${e}|${width}|${state}`;
            const read = await measureTitle(browser, servers, width, coarse, state, { extras: state === 'same' });
            results[key] = read;
            if (group === 'title-baseline') {
              titlePrecondition(key, state, read);
              console.log(titleSummary(key, null, read));
            } else {
              const before = baseline[key];
              countedCheck(before !== undefined, `${key}: baseline cell exists`);
              if (!before) continue;
              titleCompare(key, state, read, before);
              console.log(titleSummary(key, before, read));
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
  if (group === 'title-baseline' && failures.length === 0) await writeFile(TITLE_BASELINE, JSON.stringify(results, null, 2) + '\n');
}

function titlePrecondition(key, state, read) {
  countedCheck(read.pen.h1Count === 1, `${key}: the pen shows 1 h1 (read ${read.pen.h1Count})`);
  countedCheck(read.pen.field && read.pen.field.tag === 'INPUT', `${key}: the Sheet title field is an INPUT (read ${read.pen.field?.tag})`);
  if (state === 'long') countedCheck(read.pen.field.scrollWidth > read.pen.field.clientWidth, `${key}: the long title overflows its input (scrollWidth ${read.pen.field.scrollWidth} > ${read.pen.field.clientWidth})`);
}

function titleSummary(key, before, after) {
  const f = after.pen.field;
  return JSON.stringify({
    cell: key,
    headnoteH: [before ? round(before.pen.headnote.h) : null, round(after.pen.headnote.h), before ? round(after.pen.headnote.h - before.pen.headnote.h) : null],
    field: f ? { tag: f.tag, h: round(f.rect.h), lines: f.lines, scrollMinusClient: f.scrollHeight - f.clientHeight, fontSize: f.fontSize } : null,
    h1: after.pen.h1Count,
    enter: after.enter ? { value: after.enter.value === after.pen.field.value ? 'unchanged' : after.enter.value, dh: round(after.enter.headnoteH - after.enter.headnoteH0) } : undefined,
    paste: after.paste?.value,
    print: after.print,
  });
}

function titleCompare(key, state, a, b) {
  const f = a.pen.field;
  countedCheck(a.pen.h1Count === 0, `${key}: 0 h1 in the pen (read ${a.pen.h1Count})`);
  countedCheck(f && f.tag === 'TEXTAREA' && /\bprose-field\b/.test(f.className), `${key}: a TEXTAREA with class prose-field (read ${f?.tag} ${f?.className})`);
  if (!f) return;
  countedCheck(f.fontSize === '32px' && f.fontWeight === '700', `${key}: font ${f.fontSize}/${f.fontWeight}`);
  countedCheck(f.borderTop === '0px' && f.borderBottom === '0px', `${key}: no box at rest (borders ${f.borderTop}/${f.borderBottom})`);
  countedCheck(f.color === f.descColor, `${key}: pen blue ${f.color} equals the description's ${f.descColor}`);
  countedCheck(f.captionRect && f.captionRect.y + f.captionRect.h <= f.rect.y + 0.5, `${key}: the caption sits above the field`);
  countedCheck(f.rect.h >= 44 - 0.5, `${key}: field height ${round(f.rect.h)} is at least 44`);
  countedCheck(f.scrollHeight <= f.clientHeight + 1, `${key}: never clipped (scrollHeight ${f.scrollHeight} vs clientHeight ${f.clientHeight})`);
  const strikesOld = a.pen.struck.includes(a.reading.text);
  countedCheck(strikesOld === (state !== 'same'), `${key}: old title struck beneath exactly when it differs (struck ${JSON.stringify(a.pen.struck)})`);
  countedCheck(near(a.pen.overflow, b.pen.overflow), `${key}: overflow ${a.pen.overflow} vs ${b.pen.overflow}`);
  countedCheck(a.reading && b.reading && near(a.reading.x, b.reading.x) && near(a.reading.y, b.reading.y) && near(a.reading.w, b.reading.w) && near(a.reading.h, b.reading.h), `${key}: reading h1 rect equals the baseline's`);
  if (state === 'same') {
    countedCheck(a.enter.value === f.value && near(a.enter.headnoteH, a.enter.headnoteH0), `${key}: Enter adds no line (value "${a.enter.value}", height ${a.enter.headnoteH} vs ${a.enter.headnoteH0})`);
    countedCheck(a.paste.value === 'Line one Line two', `${key}: a pasted newline becomes a space (read "${a.paste.value}")`);
    countedCheck(a.afterCancel && b.afterCancel && near(a.afterCancel.x, b.afterCancel.x) && near(a.afterCancel.y, b.afterCancel.y) && near(a.afterCancel.w, b.afterCancel.w) && near(a.afterCancel.h, b.afterCancel.h), `${key}: the h1 is back after Cancel at the baseline rect`);
    countedCheck(a.print.display !== 'none' && a.print.h > 0, `${key}: print shows the h1 (${JSON.stringify(a.print)})`);
  }
}

async function runTitleBoard() {
  const servers = await startServers();
  try {
    for (const [engine, make] of engines) {
      const browser = await make();
      try {
        const pointers = engine === 'webkit' ? [true, false] : [false];
        const board = {};
        for (const coarse of pointers) {
          const { context, page } = await openBoard(browser, servers.repoUrl, 'sheet-title-pen.html', { coarse });
          try {
            for (let i = 0; i < 7; i += 1) {
              board[`${coarse}|${i}`] = await page.evaluate(readTitle, { root: `.fp-tt-a-${i}` });
            }
          } finally {
            await context.close();
          }
        }
        // Panel order: 393 same, 393 short, 393 long, 1366 same, 1366 short, 1600 same, 1600 short.
        const panels = { '393|same': 0, '393|short': 1, '393|long': 2, '1366|same': 3, '1366|short': 4, '1600|same': 5, '1600|short': 6 };
        for (const [e, width, coarse] of TITLE_CELLS.filter((c) => c[0] === engine)) {
          for (const state of TITLE_STATES) {
            const key = `${e}|${width}|${state}`;
            const read = await measureTitle(browser, servers, width, coarse, state, { extras: false });
            const idx = panels[`${width}|${state}`];
            if (idx === undefined) {
              console.log(JSON.stringify({ cell: `${key}|board`, note: 'no panel; only the clipping check applies' }));
              continue;
            }
            const bp = board[`${coarse}|${idx}`];
            // The board draws the touch floor (min-height 44) at every pointer; the app's .prose-field floor is 1.5em (48 at 32px) under a
            // mouse. So compare the headnote outright where the title fields agree, and otherwise everything but the field.
            const fieldsAgree = near(read.pen.field.rect.h, bp.field.rect.h, 1);
            if (fieldsAgree) countedCheck(near(read.pen.headnote.h, bp.headnote.h, 1), `${key}: headnote height app ${round(read.pen.headnote.h)} vs board ${round(bp.headnote.h)}`);
            countedCheck(near(read.pen.headnote.h - read.pen.field.rect.h, bp.headnote.h - bp.field.rect.h, 1), `${key}: headnote height without the title field, app ${round(read.pen.headnote.h - read.pen.field.rect.h)} vs board ${round(bp.headnote.h - bp.field.rect.h)}`);
            if (state === 'long' && width === 393) countedCheck(read.pen.field.lines === bp.field.lines, `${key}: lines app ${read.pen.field.lines} vs board ${bp.field.lines}`);
            console.log(JSON.stringify({ cell: `${key}|board`, headnoteH: [round(read.pen.headnote.h), round(bp.headnote.h)], lines: [read.pen.field.lines, bp.field.lines], fieldsAgree, fieldH: [round(read.pen.field.rect.h), round(bp.field.rect.h)] }));
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
}

// ===========================================================================
const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
const known = ['labels-baseline', 'labels', 'labels-board', 'title-baseline', 'title', 'title-board'];
if (groups.length === 0 || groups.some((g) => !known.includes(g))) {
  console.log(`usage: node 261004-igr-probe.mjs ${known.join('|')}[,...]`);
  process.exit(2);
}
for (const g of groups) {
  if (g === 'labels-board') await runLabelsBoard();
  else if (g.startsWith('labels')) await runLabels(g);
  else if (g === 'title-board') await runTitleBoard();
  else await runTitle(g);
}
finish(failures, count, `261004-igr probe (${groups.join(',')})`);
