// Quick task 261004-ly6's probe: the Why value in the version details sits on its own
// line flush with its WHY label, and a saved Why is written in the hand (sketch 011
// decision 37, Mark's answers 2026-10-04: option B, and the hand per decision 17).
// Measures the BUILT app (app/dist) in Playwright's WebKit and system Chrome, against
// the `built` (premise) and `B` (after) panels of why-row.html read in the same engine.
//
//   node 261004-ly6-probe.mjs premise   (build of the unchanged source: the cause)
//   node 261004-ly6-probe.mjs after     (build of the changed source: vs the B panels)
//
// The board's Caveat: its Google Fonts link is blocked by the harness, so the probe
// declares the app's own caveat-regular.woff2 on the board page (see the comment below).
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never
// requests Mark's :4173 preview, the dev server on :5173 or the sketch server on :8011,
// and starts no Vite process. The stress check rewrites a dd's text only in a throwaway
// page; nothing is saved. A reading here is evidence about two engines, not about
// Mark's iPad or iPhone; the device is his to check.
//
// The board's panels are `.fp-win.fp-{state}-{variant}-{W}` (the board file carries no
// data-pid; the canvas wrapper is gone), each holding `[data-m="dl|whyl|whyv|wr"]`.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;

const ROUTES = {
  saved: '/notebook/mexican-chocolate/mexican-chocolate-v3',
  none: '/notebook/mexican-chocolate/mexican-chocolate-v2',
  first: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1',
};
const WIDTHS = [1600, 1366, 393];
const STATES = Object.keys(ROUTES);

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). One reader for the app and the board:
// `spec` is { app: true } or { pid }. Positions are relative to the list's own box.
async function read(spec) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  let dl; let whyl; let whyv; let wr;
  if (spec.app) {
    dl = document.querySelector('.notebook-version__details');
    whyl = document.querySelector('.version-row__reason-label');
    whyv = document.querySelector('.version-row__reason');
    wr = document.querySelector('.version-row__written');
  } else {
    const root = document.querySelector(`.fp-win.fp-${spec.pid}`);
    if (!root) throw new Error(`no panel ${spec.pid}`);
    dl = root.querySelector('[data-m="dl"]');
    whyl = root.querySelector('[data-m="whyl"]');
    whyv = root.querySelector('[data-m="whyv"]');
    wr = root.querySelector('[data-m="wr"]');
  }
  if (!(dl && whyl && whyv && wr)) throw new Error(`missing marker(s) for ${JSON.stringify(spec)}`);
  const d = dl.getBoundingClientRect();
  const rel = (el) => {
    const b = el.getBoundingClientRect();
    return { x: b.left - d.left, y: b.top - d.top, w: b.width, h: b.height, bottom: b.bottom - d.top };
  };
  const l = rel(whyl);
  const v = rel(whyv);
  const w = rel(wr);
  const cs = getComputedStyle(whyv);
  return {
    dlW: d.width,
    label: { x: l.x, y: l.y },
    why: { x: v.x, y: v.y, w: v.w, h: v.h },
    written: { x: w.x, y: w.y },
    flush: v.x - l.x,
    gap: v.y - l.bottom,
    className: whyv.className,
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    lineHeight: cs.lineHeight,
    fontWeight: cs.fontWeight,
    fontStyle: cs.fontStyle,
    color: cs.color,
    overflowWrap: cs.overflowWrap,
    overflow: spec.app ? document.documentElement.scrollWidth - window.innerWidth : null,
  };
}

async function openAppPage(browser, appUrl, route, { width, coarse }) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  await page.goto(`${appUrl}${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook-version__details', { state: 'attached' });
  if (!(await page.locator('.notebook-version__details').isVisible())) {
    await page.getByRole('button', { name: /Show details/ }).first().click();
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openAppPage: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

// 200 unbroken characters in the saved Why, in the throwaway page only.
async function stress(page) {
  await page.evaluate(() => {
    document.querySelector('.version-row__reason').textContent = 'x'.repeat(200);
  });
  await page.waitForTimeout(100);
  return page.evaluate(() => {
    const dl = document.querySelector('.notebook-version__details').getBoundingClientRect();
    const dd = document.querySelector('.version-row__reason').getBoundingClientRect();
    return { overflow: document.documentElement.scrollWidth - window.innerWidth, ddRight: dd.right, dlRight: dl.right };
  });
}

const engines = [
  // [name, launcher, coarse at widths <= 1366 (Sid's capture convention)]
  ['webkit', () => webkit.launch(), (W) => W <= 1366],
  ['chrome', () => launch(), () => false],
];

const num = (s) => parseFloat(s);
const keys = ['fontFamily', 'fontSize', 'lineHeight', 'fontWeight', 'fontStyle', 'color'];

async function run(group) {
  const servers = await startServers();
  try {
    for (const [engine, make, coarseAt] of engines) {
      const browser = await make();
      try {
        // The board, once per engine, every panel the probe compares against.
        const { context: bctx, page: bpage } = await openBoard(browser, servers.repoUrl, 'why-row.html');
        // The board reaches Caveat through a Google Fonts link, which the harness blocks
        // (every non-127.0.0.1 request), so unaided the board's hand falls back to Georgia
        // and wraps wider than Sid's readings (110 tall at 393, not 137.5). Give the board the
        // same Caveat file the app serves, declared the way the app's fonts.css declares it.
        await bpage.addStyleTag({
          content: `@font-face{font-family:'Caveat';src:url('${servers.repoUrl}/app/public/fonts/caveat-regular.woff2') format('woff2');font-weight:400;font-style:normal}`,
        });
        await bpage.evaluate(() => document.fonts.load("22px 'Caveat'"));
        await bpage.waitForTimeout(500);
        countedCheck(await bpage.evaluate(() => [...document.fonts].some((f) => f.family.includes('Caveat') && f.status === 'loaded')), `${engine} board: Caveat loaded`);
        const board = {};
        try {
          for (const W of WIDTHS) {
            for (const s of STATES) {
              for (const variant of ['built', 'B']) {
                const pid = `${s}-${variant}-${W}`;
                board[pid] = await bpage.evaluate(read, { pid });
              }
            }
          }
        } finally {
          await bctx.close();
        }
        for (const W of WIDTHS) {
          for (const s of STATES) {
            countedCheck(near(board[`${s}-built-${W}`].flush, 40, 0.5), `${engine} board ${s}-built-${W}: flush reads 40 (got ${board[`${s}-built-${W}`].flush})`);
            countedCheck(near(board[`${s}-B-${W}`].flush, 0, 0.5), `${engine} board ${s}-B-${W}: flush reads 0 (got ${board[`${s}-B-${W}`].flush})`);
          }
        }

        for (const W of WIDTHS) {
          const coarse = coarseAt(W);
          for (const s of STATES) {
            const cell = `${engine} ${coarse ? 'coarse' : 'fine'} ${W} ${s}`;
            const { context, page } = await openAppPage(browser, servers.appUrl, ROUTES[s], { width: W, coarse });
            try {
              const app = await page.evaluate(read, { app: true });
              const built = board[`${s}-built-${W}`];
              const B = board[`${s}-B-${W}`];
              const panel = group === 'premise' ? built : B;
              const widthMatch = near(app.dlW, B.dlW, 1);
              const lh = num(app.lineHeight);
              const lines = app.why.h / lh;
              console.log(JSON.stringify({
                group, engine, pointer: coarse ? 'coarse' : 'fine', width: W, state: s,
                flush: app.flush, boardBuiltFlush: built.flush, boardBFlush: B.flush,
                writtenX: app.written.x, writtenY: app.written.y, boardWrittenX: panel.written.x, boardWrittenY: panel.written.y,
                labelX: app.label.x, labelY: app.label.y, boardLabelX: panel.label.x, boardLabelY: panel.label.y,
                gap: app.gap, boardGap: panel.gap,
                whyH: app.why.h, boardWhyH: B.why.h, lines, dlW: app.dlW, boardDlW: B.dlW,
                className: app.className, fontFamily: app.fontFamily, fontSize: app.fontSize, lineHeight: app.lineHeight, color: app.color,
                boardFontSize: B.fontSize, boardLineHeight: B.lineHeight, overflowWrap: app.overflowWrap, overflow: app.overflow,
              }));

              // Common: nothing else moves (against the same-group panel), no sideways scroll.
              countedCheck(near(app.label.x, panel.label.x, 0.5), `${cell}: label x ${app.label.x} vs ${panel.label.x}`);
              countedCheck(near(app.label.y, panel.label.y, 0.5), `${cell}: label y ${app.label.y} vs ${panel.label.y}`);
              countedCheck(near(app.written.x, panel.written.x, 0.5), `${cell}: Written x ${app.written.x} vs ${panel.written.x}`);
              countedCheck(near(app.written.y, panel.written.y, 0.5), `${cell}: Written y ${app.written.y} vs ${panel.written.y}`);
              countedCheck(near(app.gap, panel.gap, 0.5), `${cell}: gap ${app.gap} vs ${panel.gap}`);
              countedCheck(app.overflow <= 0, `${cell}: page overflow ${app.overflow}`);

              if (group === 'premise') {
                countedCheck(near(app.flush, 40, 0.5), `${cell}: premise flush reads 40 (got ${app.flush})`);
                if (s === 'saved') {
                  countedCheck(app.className === 'version-row__reason prose-text', `${cell}: premise class '${app.className}'`);
                  countedCheck(app.fontSize === '16px', `${cell}: premise font-size ${app.fontSize}`);
                } else {
                  countedCheck(app.className === 'version-row__reason version-row__reason--empty', `${cell}: empty class '${app.className}'`);
                }
              } else {
                countedCheck(near(app.flush, 0, 0.5), `${cell}: flush reads 0 (got ${app.flush})`);
                if (s === 'saved') {
                  countedCheck(app.className === 'version-row__reason app-hand', `${cell}: saved class '${app.className}'`);
                  for (const k of keys) countedCheck(app[k] === B[k], `${cell}: saved ${k} '${app[k]}' vs board '${B[k]}'`);
                  countedCheck(app.fontSize === '22px', `${cell}: saved font-size ${app.fontSize}`);
                  countedCheck(app.lineHeight === '27.5px', `${cell}: saved line-height ${app.lineHeight}`);
                  countedCheck(app.overflowWrap === 'anywhere', `${cell}: saved overflow-wrap ${app.overflowWrap}`);
                } else {
                  countedCheck(app.className === 'version-row__reason version-row__reason--empty', `${cell}: empty class '${app.className}'`);
                  for (const k of ['fontFamily', 'fontSize', 'lineHeight']) countedCheck(app[k] === B[k], `${cell}: empty ${k} '${app[k]}' vs board '${B[k]}'`);
                }
                if (widthMatch) {
                  countedCheck(near(app.why.h, B.why.h, 0.5), `${cell}: value h ${app.why.h} vs board ${B.why.h} (list widths ${app.dlW} / ${B.dlW})`);
                } else {
                  console.log(`  ${cell}: list widths differ (app ${app.dlW}, board ${B.dlW}); value h app ${app.why.h} vs board ${B.why.h}; app lines ${lines}`);
                  countedCheck(near(lines, Math.round(lines), 0.05), `${cell}: value h ${app.why.h} is not whole lines of ${lh} (${lines})`);
                }
              }

              if (W === 393 && s === 'saved') {
                const st = await stress(page);
                console.log(JSON.stringify({ group, engine, stress: true, ...st }));
                countedCheck(st.overflow <= 0, `${cell}: stress page overflow ${st.overflow}`);
                countedCheck(st.ddRight <= st.dlRight + 0.5, `${cell}: stress dd right ${st.ddRight} vs list right ${st.dlRight}`);
              }
            } finally {
              await context.close();
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
}

const group = process.argv[2];
if (group !== 'premise' && group !== 'after') {
  console.log('usage: node 261004-ly6-probe.mjs premise|after');
  process.exit(2);
}
await run(group);
finish(failures, count, `261004-ly6 ${group}`);
