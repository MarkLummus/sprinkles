// Quick task 261004-ox3's probe: in the Version details, Written, From version and Why sit
// one 8px row gap apart and the WHY label sits 4px above its words (sketch 011 decision 39,
// option B, Mark's answers 2026-10-04). Measures the BUILT app (app/dist) in Playwright's
// WebKit and system Chrome, against the `built` (premise) and `B` (after) panels of
// version-details-rhythm.html read in the same engine.
//
//   node 261004-ox3-probe.mjs premise   (build of the unchanged source: the cause; writes the baseline)
//   node 261004-ox3-probe.mjs after     (build of the changed source: vs the B panels and the baseline)
//
// The board's Caveat: its Google Fonts link is blocked by the harness, so the probe declares
// the app's own caveat-regular.woff2 on the board page, as 261004-ly6-probe.mjs does.
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never requests
// Mark's :4173 preview, the dev server on :5173 or the sketch servers on :8011/:8077, and
// starts no Vite process. The constructed From batch row exists only in a throwaway page's
// DOM (createElement + textContent); nothing is saved. A reading here is evidence about two
// engines, not about Mark's iPad or iPhone; the device is his to check.
//
// The board's panels are `.fp-win.fp-{state}-{variant}-{W}` (no data-pid), each holding
// `[data-m="dl"]` (the details list) and `[data-m="ver"]` (the Version section).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(HERE, '261004-ox3-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const sameArr = (a, b) => a.length === b.length && a.every((v, i) => near(v, b[i], 0.5));

const ROUTES = {
  mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3',
  mex2: '/notebook/mexican-chocolate/mexican-chocolate-v2',
  olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1',
};
const WIDTHS = [1600, 1366, 393];
const STATES = Object.keys(ROUTES);
const LITERAL = {
  premise: { mex3: [4, 16, 4], mex2: [4, 16, 4], olive1: [16, 4] },
  after: { mex3: [8, 8, 4], mex2: [8, 8, 4], olive1: [8, 4] },
};

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). One reader for the app and the board:
// `spec` is { app: true } or { pid }. Positions are relative to the list's own box.
// Sid's line rule (rhythm-measure.mjs): a dt followed by a dd whose top is within 3.5px of
// the dt's is one line (smaller top to larger bottom); the Why label and the Why value are
// each their own line. The box gap is the next line's top minus this line's bottom.
async function read(spec) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  let dl; let ver;
  if (spec.app) {
    dl = document.querySelector('.notebook-version__details');
    ver = document.querySelector('.notebook-version');
  } else {
    const root = document.querySelector(`.fp-win.fp-${spec.pid}`);
    if (!root) throw new Error(`no panel ${spec.pid}`);
    dl = root.querySelector('[data-m="dl"]');
    ver = root.querySelector('[data-m="ver"]');
  }
  const label = dl && dl.querySelector('.version-row__reason-label');
  const value = dl && dl.querySelector('.version-row__reason');
  if (!(dl && ver && label && value)) throw new Error(`missing element(s) for ${JSON.stringify(spec)}`);
  const d = dl.getBoundingClientRect();
  const kids = [...dl.children].map((e) => {
    const b = e.getBoundingClientRect();
    return { tag: e.tagName, top: b.top - d.top, bottom: b.bottom - d.top };
  });
  const lines = [];
  for (let i = 0; i < kids.length; i++) {
    const k = kids[i];
    const n = kids[i + 1];
    if (k.tag === 'DT' && n && n.tag === 'DD' && Math.abs(n.top - k.top) < 3.5) {
      lines.push({ top: Math.min(k.top, n.top), bottom: Math.max(k.bottom, n.bottom) });
      i++;
    } else lines.push({ top: k.top, bottom: k.bottom });
  }
  const gaps = [];
  for (let i = 0; i + 1 < lines.length; i++) gaps.push(+(lines[i + 1].top - lines[i].bottom).toFixed(2));
  const l = label.getBoundingClientRect();
  const v = value.getBoundingClientRect();
  const ls = getComputedStyle(label);
  return {
    dlW: d.width,
    dlH: d.height,
    verH: ver.getBoundingClientRect().height,
    tops: lines.map((x) => +x.top.toFixed(2)),
    gaps,
    valueH: v.height,
    flush: v.left - l.left,
    rowGap: getComputedStyle(dl).rowGap,
    marginTop: ls.marginTop,
    marginBottom: ls.marginBottom,
    className: value.className,
    overflow: spec.app ? document.documentElement.scrollWidth - window.innerWidth : null,
  };
}

// Append a From batch row matching the board's batch panel, in the throwaway page only.
async function addBatchRow() {
  const dl = document.querySelector('.notebook-version__details');
  const dt = document.createElement('dt');
  dt.className = 'versions__lineage-label';
  dt.textContent = 'From batch';
  const dd = document.createElement('dd');
  dd.className = 'versions__lineage version-row__batch-provenance';
  const a = document.createElement('a');
  a.setAttribute('tabindex', '0');
  a.textContent = '2 Jan 2026';
  dd.appendChild(a);
  dl.appendChild(dt);
  dl.appendChild(dd);
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

const engines = [
  // [name, launcher, coarse at widths <= 1366 (Sid's capture convention; 1366 coarse is Mark's iPad)]
  ['webkit', () => webkit.launch(), (W) => W <= 1366],
  ['chrome', () => launch(), () => false],
];

async function run(group) {
  let baseline = {};
  if (group === 'after') {
    try {
      baseline = JSON.parse(await readFile(BASELINE, 'utf8'));
    } catch {
      throw new Error('261004-ox3-baseline.json is missing: run the premise group on the unchanged build first');
    }
  }
  const written = {};
  const servers = await startServers();
  try {
    for (const [engine, make, coarseAt] of engines) {
      const browser = await make();
      try {
        // The board, once per engine.
        const { context: bctx, page: bpage } = await openBoard(browser, servers.repoUrl, 'version-details-rhythm.html');
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
          for (const variant of ['built', 'B']) {
            const pid = `batch-${variant}-1366`;
            board[pid] = await bpage.evaluate(read, { pid });
          }
        } finally {
          await bctx.close();
        }

        // The board itself must be the board the README describes.
        for (const W of WIDTHS) {
          for (const s of STATES) {
            const b = board[`${s}-built-${W}`];
            const B = board[`${s}-B-${W}`];
            countedCheck(sameArr(b.gaps, LITERAL.premise[s]), `${engine} board ${s}-built-${W}: gaps ${JSON.stringify(b.gaps)}`);
            countedCheck(sameArr(B.gaps, LITERAL.after[s]), `${engine} board ${s}-B-${W}: gaps ${JSON.stringify(B.gaps)}`);
            countedCheck(B.marginTop === '0px' && B.marginBottom === '-4px' && B.rowGap === '8px', `${engine} board ${s}-B-${W}: label margins ${B.marginTop} / ${B.marginBottom}, row-gap ${B.rowGap}`);
          }
        }
        countedCheck(sameArr(board['batch-built-1366'].gaps, [4, 16, 4, 4]), `${engine} board batch-built-1366: gaps ${JSON.stringify(board['batch-built-1366'].gaps)}`);
        countedCheck(sameArr(board['batch-B-1366'].gaps, [8, 8, 4, 8]), `${engine} board batch-B-1366: gaps ${JSON.stringify(board['batch-B-1366'].gaps)}`);

        for (const W of WIDTHS) {
          const coarse = coarseAt(W);
          for (const s of STATES) {
            const cell = `${engine} ${coarse ? 'coarse' : 'fine'} ${W} ${s}`;
            const key = `${engine}|${W}|${s}`;
            const { context, page } = await openAppPage(browser, servers.appUrl, ROUTES[s], { width: W, coarse });
            try {
              const app = await page.evaluate(read, { app: true });
              const built = board[`${s}-built-${W}`];
              const B = board[`${s}-B-${W}`];
              const panel = group === 'premise' ? built : B;
              const base = baseline[key];
              console.log(JSON.stringify({
                group, engine, pointer: coarse ? 'coarse' : 'fine', width: W, state: s,
                gaps: app.gaps, boardBuiltGaps: built.gaps, boardBGaps: B.gaps,
                marginTop: app.marginTop, marginBottom: app.marginBottom, rowGap: app.rowGap,
                boardBMarginTop: B.marginTop, boardBMarginBottom: B.marginBottom, boardBRowGap: B.rowGap,
                dlH: app.dlH, boardBuiltDlH: built.dlH, boardBDlH: B.dlH, boardDlDelta: +(B.dlH - built.dlH).toFixed(2),
                verH: app.verH, boardBuiltVerH: built.verH, boardBVerH: B.verH, boardVerDelta: +(B.verH - built.verH).toFixed(2),
                baselineDlH: base ? base.dlH : null, baselineVerH: base ? base.verH : null,
                valueH: app.valueH, flush: app.flush, overflow: app.overflow, className: app.className,
                dlW: app.dlW, boardDlW: B.dlW,
              }));

              // Common: the panel's lines, the list minus the value, no flush drift, no sideways scroll.
              countedCheck(sameArr(app.gaps, LITERAL[group][s]), `${cell}: gaps ${JSON.stringify(app.gaps)} vs literal ${JSON.stringify(LITERAL[group][s])}`);
              countedCheck(sameArr(app.gaps, panel.gaps), `${cell}: gaps ${JSON.stringify(app.gaps)} vs panel ${JSON.stringify(panel.gaps)}`);
              countedCheck(sameArr(app.tops, panel.tops), `${cell}: line tops ${JSON.stringify(app.tops)} vs panel ${JSON.stringify(panel.tops)}`);
              countedCheck(near(app.dlH - app.valueH, panel.dlH - panel.valueH, 0.5), `${cell}: list minus value ${app.dlH - app.valueH} vs panel ${panel.dlH - panel.valueH}`);
              countedCheck(near(app.flush, 0, 0.5), `${cell}: flush ${app.flush}`);
              countedCheck(app.overflow <= 0, `${cell}: page overflow ${app.overflow}`);

              if (group === 'premise') {
                countedCheck(app.marginTop === '12px', `${cell}: premise label marginTop ${app.marginTop}`);
                countedCheck(app.rowGap === '4px', `${cell}: premise rowGap ${app.rowGap}`);
                written[key] = { dlH: app.dlH, verH: app.verH, valueH: app.valueH, gaps: app.gaps };
              } else {
                countedCheck(app.marginTop === B.marginTop && app.marginTop === '0px', `${cell}: label marginTop ${app.marginTop} vs panel ${B.marginTop}`);
                countedCheck(app.marginBottom === B.marginBottom && app.marginBottom === '-4px', `${cell}: label marginBottom ${app.marginBottom} vs panel ${B.marginBottom}`);
                countedCheck(app.rowGap === B.rowGap && app.rowGap === '8px', `${cell}: rowGap ${app.rowGap} vs panel ${B.rowGap}`);
                if (!base) {
                  countedCheck(false, `${cell}: no baseline reading`);
                } else {
                  countedCheck(near(app.valueH, base.valueH, 0.5), `${cell}: value height ${app.valueH} vs baseline ${base.valueH}`);
                  countedCheck(near(app.dlH - base.dlH, B.dlH - built.dlH, 0.5), `${cell}: list delta ${app.dlH - base.dlH} vs board ${B.dlH - built.dlH}`);
                  countedCheck(near(app.verH - base.verH, B.verH - built.verH, 0.5), `${cell}: section delta ${app.verH - base.verH} vs board ${B.verH - built.verH}`);
                }
                const premiseClass = s === 'mex3' ? 'version-row__reason app-hand' : 'version-row__reason version-row__reason--empty';
                countedCheck(app.className === premiseClass, `${cell}: value class '${app.className}'`);
              }

              if (W === 1366 && s === 'mex3') {
                await page.evaluate(addBatchRow);
                await page.waitForTimeout(100);
                const withBatch = await page.evaluate(read, { app: true });
                const want = group === 'premise' ? [4, 16, 4, 4] : [8, 8, 4, 8];
                const boardPid = group === 'premise' ? 'batch-built-1366' : 'batch-B-1366';
                console.log(JSON.stringify({ group, engine, constructedFromBatch: true, gaps: withBatch.gaps, boardGaps: board[boardPid].gaps }));
                countedCheck(sameArr(withBatch.gaps, want), `${cell}: constructed From batch gaps ${JSON.stringify(withBatch.gaps)} vs ${JSON.stringify(want)}`);
                countedCheck(sameArr(withBatch.gaps, board[boardPid].gaps), `${cell}: constructed From batch gaps ${JSON.stringify(withBatch.gaps)} vs ${boardPid} ${JSON.stringify(board[boardPid].gaps)}`);
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
  if (group === 'premise' && failures.length === 0) {
    await writeFile(BASELINE, `${JSON.stringify(written, null, 2)}\n`);
    console.log(`wrote ${BASELINE}`);
  }
}

const group = process.argv[2];
if (group !== 'premise' && group !== 'after') {
  console.log('usage: node 261004-ox3-probe.mjs premise|after');
  process.exit(2);
}
await run(group);
finish(failures, count, `261004-ox3 ${group}`);
