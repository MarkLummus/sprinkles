// Quick task 261004-ox9's probe: sketch 011 decision 33 brief task 3 and decision 43
// (the band's Go to batch row from 724 to 1365, in the band grid's second column
// under the Version section). Measures the BUILT app (app/dist) in Playwright's
// WebKit and system Chrome, before and after, and against the as-built panels of
// the board 724-1365-go-to-batch.html (mex3 744, mex3 1024, olive1 1194).
//
//   node 261004-ox9-probe.mjs baseline   (build of the unchanged source; writes the JSON)
//   node 261004-ox9-probe.mjs after      (every app cell vs the baseline)
//   node 261004-ox9-probe.mjs board      (app vs the board's three as-built panels)
//   groups combine with commas: after,board
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers;
// never requests Mark's :4173 preview, the dev server on :5173 or the sketch
// server on :8011, and starts no Vite process. Clicks run in throwaway browser
// contexts; nothing reaches Mark's IndexedDB. A reading here is evidence about
// two engines, not about Mark's iPhone or iPad.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, APP_ROUTE, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(HERE, '261004-ox9-baseline.json');
const BOARD = '724-1365-go-to-batch.html';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const ROUTES = { mex3: MEX3, olive1: APP_ROUTE };
const WIDTHS = [393, 723, 724, 744, 1024, 1194, 1365, 1366];
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];
const coarseFor = (engine, width) => engine === 'webkit' && width <= 1366;

async function openApp(browser, appUrl, route, { width, coarse }) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook');
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openApp: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

// In-page reader at scroll 0. spec.root is a selector for a board panel, or null for the app.
async function readJump(spec) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const root = spec.root ? document.querySelector(spec.root) : document;
  if (!root) throw new Error(`no root for ${JSON.stringify(spec)}`);
  const rr = (e) => {
    const b = e.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  };
  const textRect = (e) => {
    const g = document.createRange();
    g.selectNodeContents(e);
    const rs = [...g.getClientRects()].filter((k) => k.width > 0);
    return { left: Math.min(...rs.map((k) => k.left)), right: Math.max(...rs.map((k) => k.right)), lines: new Set(rs.map((k) => Math.round(k.top))).size };
  };
  const jumps = [...root.querySelectorAll('.notebook-jump')];
  const jumpEl = jumps[0];
  const grid = jumpEl.parentElement;
  const kids = [...grid.children];
  const cs = getComputedStyle(jumpEl);
  const shown = cs.display !== 'none';
  const status = jumpEl.querySelector('.notebook-jump__status');
  const control = jumpEl.querySelector('.notebook-jump__control');
  const bcs = getComputedStyle(status, '::before');
  const gcs = getComputedStyle(grid);
  const version = kids[1];
  const r = shown ? rr(jumpEl) : null;
  const v = rr(version);
  const jump = {
    count: jumps.length,
    thirdChild: kids.indexOf(jumpEl) === 2,
    display: cs.display,
    justifyContent: cs.justifyContent,
    gridColumnStart: cs.gridColumnStart,
    status: status.textContent,
    aria: jumpEl.getAttribute('aria-label'),
    before: { content: bcs.content, marginRight: bcs.marginRight },
    cols: gcs.gridTemplateColumns.split(' ').length,
    rowGap: gcs.rowGap,
    rect: r,
    height: r ? r.h : null,
    dx: r ? r.x - v.x : null,
    dw: r ? r.w - v.w : null,
    gapAbove: r ? r.y - Math.max(...kids.slice(0, 2).map((k) => k.getBoundingClientRect().bottom)) : null,
    gap: shown ? textRect(status).left - textRect(control).right : null,
    oneLine: shown ? textRect(status).lines === 1 && textRect(control).lines === 1 : null,
  };
  const rowOne = kids.slice(0, 2).map(rr);
  const docY = (sel) => {
    const e = document.querySelector(sel);
    return e ? e.getBoundingClientRect().top + scrollY : null;
  };
  const headEl = document.querySelector('.shell__head');
  const head = headEl && getComputedStyle(headEl).position === 'sticky' ? headEl.getBoundingClientRect().bottom : 0;
  const out = { jump, rowOne, head, overflow: document.documentElement.scrollWidth - innerWidth };
  if (!spec.root) {
    out.anchors = { history: docY('.notebook-history'), body: docY('.notebook-body'), batch: docY('#batch'), page: document.documentElement.scrollHeight };
  }
  return out;
}

// App only: five-point hit test and the focus landing.
async function readInteraction(page) {
  const hits = await page.evaluate(() => {
    const el = document.querySelector('.notebook-jump');
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect();
    const pts = [
      [b.left + 2, b.top + b.height / 2],
      [b.left + b.width / 2, b.top + b.height / 2],
      [b.right - 2, b.top + b.height / 2],
      [b.left + b.width / 2, b.top + 2],
      [b.left + b.width / 2, b.bottom - 2],
    ];
    return pts.map(([x, y]) => document.elementFromPoint(x, y)?.closest('.notebook-jump') === el);
  });
  await page.click('.notebook-jump');
  await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'batch', null, { timeout: 3000 });
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = scrollY;
        let still = 0;
        const tick = () => {
          still = scrollY === last ? still + 1 : 0;
          last = scrollY;
          if (still >= 2) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
  const focus = await page.evaluate(() => {
    const a = document.activeElement;
    const b = a.getBoundingClientRect();
    const h = document.querySelector('.shell__head');
    const head = h && getComputedStyle(h).position === 'sticky' ? h.getBoundingClientRect().bottom : 0;
    return { id: a.id, inLog: !!a.closest('.notebook-log'), top: b.top, bottom: b.bottom, headBottom: head, innerHeight };
  });
  return { hits, focus };
}

const BOARD_PANELS = [
  ['mex3', 744, '.fp-win.fp-mex3-744-x'],
  ['mex3', 1024, '.fp-win.fp-mex3-1024-x'],
  ['olive1', 1194, '.fp-win.fp-olive1-1194-x'],
];

async function readApp(browser, appUrl, route, width, coarse) {
  const { context, page } = await openApp(browser, appUrl, ROUTES[route], { width, coarse });
  try {
    const base = await page.evaluate(readJump, { root: null });
    if (base.jump.display !== 'none') Object.assign(base, await readInteraction(page));
    return base;
  } finally {
    await context.close();
  }
}

async function readPanel(browser, repoUrl, selector, coarse) {
  const { context, page } = await openBoard(browser, repoUrl, BOARD, { coarse });
  try {
    return await page.evaluate(readJump, { root: selector });
  } finally {
    await context.close();
  }
}

function boardShapeChecks(j, label, route) {
  countedCheck(j.count === 1 && j.thirdChild, `${label}: one .notebook-jump, the grid's third child`);
  countedCheck(j.display === 'flex' && j.justifyContent === 'flex-start' && j.gridColumnStart === '2', `${label}: flex, flex-start, grid-column 2 (${j.display}, ${j.justifyContent}, ${j.gridColumnStart})`);
  countedCheck(j.before.content === '"·"' && j.before.marginRight === '14px', `${label}: dot ${j.before.content} margin ${j.before.marginRight}`);
  countedCheck(near(j.height, 44) && near(j.dx, 0) && near(j.dw, 0), `${label}: height ${round(j.height)}, dx ${round(j.dx)}, dw ${round(j.dw)}`);
  countedCheck(near(j.gap, 32, 1) && j.oneLine, `${label}: gap ${round(j.gap)}, one line ${j.oneLine}`);
  countedCheck(near(j.gapAbove, parseFloat(j.rowGap)), `${label}: gap above ${round(j.gapAbove)} vs row gap ${j.rowGap}`);
  countedCheck(j.status === (route === 'mex3' ? 'Awaiting tasting' : 'Tasted'), `${label}: status "${j.status}"`);
}

async function main() {
  const groups = new Set((process.argv[2] || 'after,board').split(','));
  const servers = await startServers();
  const cells = {};
  try {
    for (const [engine, launcher] of engines) {
      const browser = await launcher();
      try {
        for (const route of Object.keys(ROUTES)) {
          for (const width of WIDTHS) {
            if (groups.has('baseline') || groups.has('after')) {
              const r = await readApp(browser, servers.appUrl, route, width, coarseFor(engine, width));
              cells[`${engine}|${route}|${width}`] = r;
              console.log(JSON.stringify({ cell: `${engine} ${route} ${width}`, display: r.jump.display, h: round(r.jump.height), dx: round(r.jump.dx), dw: round(r.jump.dw), gapAbove: round(r.jump.gapAbove), gap: round(r.jump.gap), hits: r.hits, focus: r.focus && { id: r.focus.id, top: round(r.focus.top), headBottom: round(r.focus.headBottom) }, anchors: r.anchors, overflow: r.overflow }));
            }
          }
        }
        if (groups.has('baseline') || groups.has('board')) {
          for (const [route, width, selector] of BOARD_PANELS) {
            const coarse = engine === 'webkit';
            const panel = await readPanel(browser, servers.repoUrl, selector, coarse);
            const label = `board ${engine} ${selector}`;
            console.log(JSON.stringify({ cell: label, ...panel.jump, rect: undefined }));
            if (groups.has('baseline')) boardShapeChecks(panel.jump, label, route);
            if (groups.has('board')) {
              const app = await readApp(browser, servers.appUrl, route, width, coarseFor(engine, width));
              const a = app.jump;
              const b = panel.jump;
              const L = `${engine} ${route} ${width} app vs board`;
              for (const k of ['gap', 'height', 'dx', 'dw', 'gapAbove']) countedCheck(near(a[k], b[k]), `${L}: ${k} ${round(a[k])} vs ${round(b[k])}`);
              for (const k of ['display', 'justifyContent', 'gridColumnStart', 'status']) countedCheck(a[k] === b[k], `${L}: ${k} ${a[k]} vs ${b[k]}`);
              countedCheck(a.before.content === b.before.content && a.before.marginRight === b.before.marginRight, `${L}: dot ${JSON.stringify(a.before)} vs ${JSON.stringify(b.before)}`);
            }
          }
        }
      } finally {
        await browser.close();
      }
    }

    if (groups.has('baseline')) {
      for (const [key, r] of Object.entries(cells)) {
        const [, , w] = key.split('|');
        const width = Number(w);
        const j = r.jump;
        countedCheck(j.count === 1 && j.thirdChild && r.anchors.batch !== null, `${key}: one jump, third child, #batch exists`);
        countedCheck(j.before.content === '"·"' && j.before.marginRight === '14px', `${key}: dot`);
        if (width < 724) {
          countedCheck(j.display !== 'none' && j.justifyContent === 'flex-start' && near(j.gap, 32, 1), `${key}: phone row shown, flex-start, gap ${round(j.gap)}`);
          countedCheck(r.hits.every(Boolean) && r.focus.id === 'batch', `${key}: hits and focus`);
        } else {
          countedCheck(j.display === 'none', `${key}: hidden (${j.display})`);
          if (width < 1366) countedCheck(j.cols === 2 && r.head > 0, `${key}: two tracks (${j.cols}), sticky head ${r.head}`);
        }
      }
      if (failures.length === 0) await writeFile(BASELINE, JSON.stringify(cells, null, 1) + '\n');
      else console.log('baseline NOT written');
    }

    if (groups.has('after')) {
      const base = JSON.parse(await readFile(BASELINE, 'utf8'));
      const same = (a, b) => {
        if (typeof a === 'number' && typeof b === 'number') return near(a, b);
        if (a && b && typeof a === 'object' && typeof b === 'object') {
          const ka = Object.keys(a);
          return ka.length === Object.keys(b).length && ka.every((k) => same(a[k], b[k]));
        }
        return a === b;
      };
      for (const [key, r] of Object.entries(cells)) {
        const b = base[key];
        const width = Number(key.split('|')[2]);
        const j = r.jump;
        if (width < 724) {
          // grid-column: 2 is inert in the phone's flex-column band, but the computed
          // value reports it: "auto" before, "2" after. Every rendered reading must
          // still equal the baseline, and the computed value is pinned on its own.
          const { gridColumnStart: gAfter, ...jumpAfter } = j;
          const { gridColumnStart: gBefore, ...jumpBefore } = b.jump;
          countedCheck(gBefore === 'auto' && gAfter === '2', `${key}: computed grid-column-start ${gBefore} -> ${gAfter} (inert in the flex band)`);
          countedCheck(same({ ...r, jump: jumpAfter }, { ...b, jump: jumpBefore }), `${key}: phone equals the baseline, every reading but the inert grid-column-start`);
        } else if (width === 1366) {
          countedCheck(j.display === 'none', `${key}: hidden`);
          countedCheck(same(r.rowOne, b.rowOne) && same(r.anchors, b.anchors) && r.overflow === b.overflow, `${key}: rowOne, anchors, overflow equal the baseline`);
        } else {
          countedCheck(j.display === 'flex' && j.gridColumnStart === '2' && j.count === 1 && j.thirdChild, `${key}: flex, grid-column 2, third child (${j.display}, ${j.gridColumnStart})`);
          countedCheck(j.aria === b.jump.aria && j.status === b.jump.status, `${key}: aria and status equal the baseline`);
          countedCheck(near(j.height, 44) && near(j.dx, 0) && near(j.dw, 0), `${key}: height ${round(j.height)}, dx ${round(j.dx)}, dw ${round(j.dw)}`);
          countedCheck(j.rowGap === '32px' && near(j.gapAbove, 32), `${key}: row gap ${j.rowGap}, gap above ${round(j.gapAbove)}`);
          countedCheck(j.justifyContent === 'flex-start' && j.before.content === '"·"' && j.before.marginRight === '14px' && near(j.gap, 32, 1) && j.oneLine, `${key}: flex-start, dot, gap ${round(j.gap)}, one line`);
          countedCheck(r.hits.every(Boolean), `${key}: five hits ${r.hits}`);
          const f = r.focus;
          countedCheck(f.id === 'batch' && f.inLog && f.top >= f.headBottom - 0.5 && f.bottom <= f.innerHeight + 0.5, `${key}: focus on #batch, top ${round(f.top)} vs head ${round(f.headBottom)}, bottom ${round(f.bottom)} vs ${f.innerHeight}`);
          countedCheck(same(r.rowOne, b.rowOne), `${key}: first row unmoved`);
          const shift = j.height + parseFloat(j.rowGap);
          countedCheck(near(shift, 76), `${key}: shift ${shift}`);
          for (const k of Object.keys(r.anchors)) countedCheck(near(r.anchors[k] - b.anchors[k], shift), `${key}: ${k} moved ${round(r.anchors[k] - b.anchors[k])}`);
          countedCheck(r.overflow === b.overflow, `${key}: overflow ${r.overflow} vs ${b.overflow}`);
        }
      }
    }
  } finally {
    await servers.close();
  }
  finish(failures, count, '261004-ox9-probe');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
