// 04-06: the print route and its blank log pages, on paper and on screen.
//
// Usage (from the repo root, after `npm --prefix app run build`):
//   node .planning/phases/04-.../04-print-probe.mjs logs [version-id ...]
//       the route printed through WebKit's own print (wkprint, WKP_READY) and
//       Chrome's PDF, for Olive Oil v1 alone in Task 1 and for every seed
//       version from Task 2, checked page by page against sketch 010
//       (CONTRACT §§ 3, 4)
//   node .planning/phases/04-.../04-print-probe.mjs screen
//       the route on screen at 1280 fine and 393 coarse in WebKit and Chrome
//       against screen-print-route-1280.html and -393.html (added in Task 3)
//
// Prints MATCH / DIFF / FAIL lines and exits 1 on any DIFF or FAIL.
//
// The build is read from PROBE_DIST (default app/dist). Pass a scratch
// --outDir build there so Mark's own `vite preview --host` on :4173, which
// serves app/dist, is never disturbed.
//
// Isolation (T-04-17): the app is served on an ephemeral 127.0.0.1 port
// through the 03.5 harness, every request to another host is aborted in every
// browser context this file opens, and every such request is counted and
// FAILs the run. wkprint is a separate WebKit process this file cannot
// listen to; the print route makes no request of its own, and the same page
// is counted in the contexts above. Nothing here contacts :4173 or :8077.
//
// Tooling (T-04-SC): wkprint.swift and pdf-pages.swift are compiled with
// swiftc -O into the OS temp directory, once per run; they run only on URLs
// and PDFs this run produced, with paths as arguments. No package is
// installed.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { writeFile, mkdtemp, mkdir } from 'node:fs/promises';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { seedRecipeGroups } from '../../../app/src/data/seed-recipes.js';
import { sheetCode } from '../../../app/src/domain/sheetCode.js';
import { AXES } from '../../../app/src/domain/axes.js';
import { DEFECTS } from '../../../app/src/domain/battery.js';

const execFileAsync = promisify(execFile);
const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');

// ---------------------------------------------------------------------------
// The seed versions and their print routes.
// ---------------------------------------------------------------------------
const ALL_VERSIONS = seedRecipeGroups.flatMap((group) =>
  group.versions.map((version) => ({
    id: version.id,
    recipeId: version.recipeId,
    sheetTitle: version.sheetTitle,
    code: sheetCode(version),
    declaredAxes: version.declaredAxes ?? [],
    declaredFlaws: version.declaredFlaws ?? [],
    route: `/notebook/${encodeURIComponent(version.recipeId)}/${encodeURIComponent(version.id)}/print`,
  })),
);

// Each printed page, in paper order: its title (the foot's side is its place).
const LOG_PAGES = [{ title: 'Batch log' }, { title: 'Tasting log' }];

// Every problem word any seed version declares, so one version's page can be
// checked for the words it must NOT carry.
const ALL_DECLARED_FLAWS = [...new Set(ALL_VERSIONS.flatMap((v) => v.declaredFlaws))];

// The paper (D20): letter, 0.5 in above and below, 0.75 in at the sides. WebKit
// is printed with the same margins in points: top, bottom, left, right.
const MARGINS_PT = { top: 36, bottom: 36, left: 54, right: 54 };
const PAGE_PT = { width: 612, height: 792 };
const CONTENT_PT = {
  x0: MARGINS_PT.left,
  x1: PAGE_PT.width - MARGINS_PT.right,
  y0: MARGINS_PT.bottom, // PDF origin is the bottom left
  y1: PAGE_PT.height - MARGINS_PT.top,
};
const INK_TOL_PT = 0.5; // pdf-pages ink mode draws at 2 pixels per point
const READY = "!!document.querySelector('[data-print-ready]') && document.fonts.status === 'loaded'";

// ---------------------------------------------------------------------------
// Tools: compiled once into the OS temp directory.
// ---------------------------------------------------------------------------
let workDir = null;
const tools = {};
async function tool(name) {
  if (tools[name]) return tools[name];
  // PROBE_WORK keeps the PDFs in a directory of the caller's choosing, to look at.
  workDir ??= process.env.PROBE_WORK ?? (await mkdtemp(path.join(os.tmpdir(), '04-print-')));
  await mkdir(workDir, { recursive: true });
  const bin = path.join(workDir, name);
  execFileSync('swiftc', ['-O', path.join(REPO_ROOT, '.planning', 'canvas-generators', `${name}.swift`), '-o', bin], { stdio: 'pipe' });
  tools[name] = bin;
  return bin;
}

function pdfText(bin, file) {
  const out = execFileSync(bin, [file, 'all'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  return out.split(/^--- page \d+ : ?/m).slice(1).map((t) => t.replace(/\n$/, ''));
}

// Per page, the box of every non-white pixel (rules and borders included), in
// PDF points with the origin at the bottom left. Visible ink only: text a
// clip hides does not count (the 'bounds' mode counts it).
function pdfInk(bin, file) {
  const out = execFileSync(bin, [file, 'ink'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  return [...out.matchAll(/^--- ink page \d+ : (.*)$/gm)].map((m) => {
    if (m[1] === 'none') return null;
    const [x0, y0, x1, y1] = m[1].split(' ').map(Number);
    return { x0, y0, x1, y1 };
  });
}

// ---------------------------------------------------------------------------
// Results.
// ---------------------------------------------------------------------------
let failures = 0;
function report(kind, label, what) {
  if (kind !== 'MATCH') failures += 1;
  console.log(`${kind} ${label}: ${what}`);
}
function check(cond, label, what, kind = 'DIFF') {
  report(cond ? 'MATCH' : kind, label, what);
  return cond;
}

// Comparable text: the reader's separators and punctuation become single
// spaces, lower case.
const norm = (t) => t.replace(/[|\n]/g, ' ').toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim();
const hasWord = (t, word) => new RegExp(`(^| )${word}( |$)`).test(norm(t));

// ---------------------------------------------------------------------------
// A browser context that counts every request to another host and aborts it.
// ---------------------------------------------------------------------------
const offHost = [];
async function openRoute(browser, appUrl, route, { width = 1280, height = 1100, coarse = false, dpr = coarse ? 3 : 1 } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: coarse,
    isMobile: coarse,
    deviceScaleFactor: dpr,
  });
  context.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== '127.0.0.1' && url.protocol.startsWith('http')) offHost.push(request.url());
  });
  await context.route('**/*', (r) => {
    const url = new URL(r.request().url());
    return url.hostname === '127.0.0.1' ? r.continue() : r.abort();
  });
  const page = await context.newPage();
  await page.goto(`${appUrl}${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-print-ready]');
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

// ---------------------------------------------------------------------------
// logs: the route on paper.
// ---------------------------------------------------------------------------
async function printChrome(browser, appUrl, v) {
  const { context, page } = await openRoute(browser, appUrl, v.route);
  const lineCode = await page.locator('.print-route__code').innerText();
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  await context.close();
  const file = path.join(workDir, `chrome-${v.id}.pdf`);
  await writeFile(file, pdf);
  return { file, lineCode };
}

// Asynchronous on purpose: wkprint loads the page from the static server in
// this same process, which a blocking call would starve until wkprint's own
// 90 s timeout.
async function printWebKit(appUrl, v) {
  const file = path.join(workDir, `webkit-${v.id}.pdf`);
  await execFileAsync(tools.wkprint, [`${appUrl}${v.route}`, file], {
    env: { ...process.env, WKP_READY: READY, WKP_MARGINS: `${MARGINS_PT.top},${MARGINS_PT.bottom},${MARGINS_PT.left},${MARGINS_PT.right}` },
    timeout: 120000,
  });
  return file;
}

// Page 2 names exactly this version's scales and problems (CONTRACT § 2): the
// core ones and its own declared ones, and no other version's. The foot, which
// holds the Sheet title, is cut off first so a title cannot read as a scale.
function checkDeclared(label, v, text) {
  const body = norm(text);
  const cut = body.lastIndexOf(norm(v.sheetTitle));
  const page = cut > 0 ? body.slice(0, cut) : body;
  const inPage = (word) => new RegExp(`(^| )${norm(word)}( |$)`).test(page);
  const coreAxes = AXES.filter((axis) => axis.group === 'core').map((axis) => axis.name);
  const wantAxes = [...coreAxes, ...v.declaredAxes];
  const otherAxes = AXES.map((axis) => axis.name).filter((name) => !wantAxes.includes(name));
  check(wantAxes.every(inPage), label, `names its scales: ${wantAxes.join(', ')}`);
  check(!otherAxes.some(inPage), label, `names no other scale (none of ${otherAxes.join(', ') || 'no others'})`);
  const wantFlaws = [...DEFECTS, ...v.declaredFlaws];
  const otherFlaws = ALL_DECLARED_FLAWS.filter((word) => !v.declaredFlaws.includes(word));
  check(wantFlaws.every(inPage), label, `names its problems: ${wantFlaws.join(' / ')}`);
  check(!otherFlaws.some(inPage), label, `names no other version's declared problem (none of ${otherFlaws.join(', ') || 'no others'})`);
  check(!page.includes('every recipe') && !page.includes('this recipe only'), label, 'prints no "Every recipe" or "This recipe only" cue');
}

function checkPaper(engine, v, file, lineCode) {
  const label = `${engine} ${v.id}`;
  const pages = pdfText(tools['pdf-pages'], file);
  const bounds = pdfInk(tools['pdf-pages'], file);
  check(lineCode === v.code, label, `the route line reads the saved version's code (${lineCode}, expected ${v.code})`);
  check(pages.length === LOG_PAGES.length, label, `prints exactly ${LOG_PAGES.length} page(s) (got ${pages.length})`);
  LOG_PAGES.forEach((expected, i) => {
    const text = pages[i] ?? '';
    const plabel = `${label} page ${i + 1}`;
    check(norm(text).startsWith(norm(expected.title)) || norm(text).includes(norm(expected.title)), plabel, `reads "${expected.title}"`);
    check(norm(text).includes(norm(`${v.code} Side ${i + 1} of 2`)), plabel, `its foot ends "${v.code} · Side ${i + 1} of 2"`);
    check(norm(text).includes(norm(v.sheetTitle)), plabel, `its foot opens with the Sheet title "${v.sheetTitle}"`);
    check(!/page \d+ of \d+/.test(norm(text)), plabel, 'carries no "page n of m"');
    const shellWords = ['search', 'import', 'export'].filter((word) => hasWord(text, word));
    check(shellWords.length === 0 && !norm(text).includes('print sheet'), plabel, `holds none of the shell's words or "Print sheet" (found: ${shellWords.join(', ') || 'none'})`);
    if (i === 1) checkDeclared(plabel, v, text);
    const b = bounds[i];
    if (check(b !== null && b !== undefined, plabel, 'has ink')) {
      check(b.x0 >= CONTENT_PT.x0 - INK_TOL_PT && b.x1 <= CONTENT_PT.x1 + INK_TOL_PT, plabel, `ink stays between the side margins (x ${b.x0.toFixed(1)} to ${b.x1.toFixed(1)}, box ${CONTENT_PT.x0} to ${CONTENT_PT.x1})`);
      check(b.y0 >= CONTENT_PT.y0 - INK_TOL_PT && b.y1 <= CONTENT_PT.y1 + INK_TOL_PT, plabel, `ink ends at or above the content box's bottom and starts under its top (y ${b.y0.toFixed(1)} to ${b.y1.toFixed(1)}, box ${CONTENT_PT.y0} to ${CONTENT_PT.y1})`);
    }
  });
}

async function runLogs(ids) {
  const versions = ids.length ? ALL_VERSIONS.filter((v) => ids.includes(v.id)) : ALL_VERSIONS.filter((v) => LOGS_DEFAULT.includes(v.id));
  if (versions.length === 0) throw new Error(`no version matches ${ids.join(', ')}`);
  await tool('wkprint');
  await tool('pdf-pages');
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const chrome = await launch();
  try {
    for (const v of versions) {
      const { file, lineCode } = await printChrome(chrome, appUrl, v);
      checkPaper('chrome', v, file, lineCode);
      let wk = null;
      try {
        wk = await printWebKit(appUrl, v);
      } catch (error) {
        const said = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim().slice(-300);
        report('FAIL', `webkit ${v.id}`, `wkprint failed (${error.status ?? error.signal ?? 'no status'}): ${said || String(error.message).slice(0, 200)}`);
        continue;
      }
      checkPaper('webkit', v, wk, v.code);
    }
  } finally {
    await chrome.close();
    await close();
  }
}


// ---------------------------------------------------------------------------
// screen: the route on screen, at 1280 fine and 393 coarse, in WebKit and
// Chrome, against screen-print-route-1280.html and -393.html and the log
// pages' own boards.
// ---------------------------------------------------------------------------
const BOARD_DIR = '.planning/sketches/010-bench-sheet';
const OLIVE = ALL_VERSIONS.find((v) => v.id === 'olive-oil-ice-cream-v1');
const WIDTHS = [
  { width: 1280, coarse: false, board: 'screen-print-route-1280.html', head: 66, print: [74.3, 44], picture: [816, 1056] },
  { width: 393, coarse: true, board: 'screen-print-route-393.html', head: 172, print: [353, 44], picture: [353, 457] },
];
const SCREEN_TOL = 2;
const POSITION_TOL = 0.5;

// Runs in the page: the route's own boxes.
function readRoute() {
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, right: r.right };
  };
  const pages = [...document.querySelectorAll('.print-route__picture')].map(rect);
  const page = document.querySelector('.print-page');
  const pageRect = page.getBoundingClientRect();
  const scale = pageRect.width / page.offsetWidth;
  // Every element inside the first page, at its place within the page as the
  // page itself is drawn (divided by the picture's scale).
  const inside = [...page.querySelectorAll('*')].map((el) => {
    const r = el.getBoundingClientRect();
    return [String(el.className), (r.left - pageRect.left) / scale, (r.top - pageRect.top) / scale, r.width / scale, r.height / scale];
  });
  return {
    route: rect(document.querySelector('.print-route')),
    head: rect(document.querySelector('.print-route__head')),
    name: rect(document.querySelector('.print-route__name')),
    version: rect(document.querySelectorAll('.print-route__part')[0]),
    saved: rect(document.querySelectorAll('.print-route__part')[1]),
    print: rect(document.querySelector('.notebook-action')),
    pages,
    scale,
    inside,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    title: document.title,
  };
}

// Runs in a board page: the same boxes by the board's own data-m marks.
function readBoard() {
  const rect = (m) => {
    const el = document.querySelector(`[data-m="${m}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, right: r.right };
  };
  return { head: rect('head'), name: rect('name'), version: rect('version'), saved: rect('saved'), print: rect('print'), log1: rect('log1') };
}

const near = (a, b, tol = SCREEN_TOL) => Math.abs(a - b) <= tol;

async function openBoardPage(browser, repoUrl, file, { width, coarse }) {
  const context = await browser.newContext({ viewport: { width, height: 1100 }, hasTouch: coarse, deviceScaleFactor: coarse ? 3 : 1 });
  context.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== '127.0.0.1' && url.protocol.startsWith('http')) offHost.push(request.url());
  });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(`${repoUrl}/${BOARD_DIR}/${file}`, { waitUntil: 'networkidle' });
  return { context, page };
}

async function runScreen() {
  const { appUrl, repoUrl, close } = await startServers({ appRoot: DIST });
  const engines = [
    ['webkit', await webkit.launch()],
    ['chrome', await launch()],
  ];
  try {
    for (const [engine, browser] of engines) {
      const byWidth = {};
      for (const spec of WIDTHS) {
        const label = `${engine} ${spec.width}${spec.coarse ? ' coarse' : ''}`;
        const { context, page } = await openRoute(browser, appUrl, OLIVE.route, { width: spec.width, coarse: spec.coarse });
        const pointerCoarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
        check(pointerCoarse === spec.coarse, label, `the pointer is ${spec.coarse ? 'coarse' : 'fine'}`, 'FAIL');
        const got = await page.evaluate(readRoute);
        byWidth[spec.width] = got;
        const { context: bc, page: bp } = await openBoardPage(browser, repoUrl, spec.board, spec);
        const board = await bp.evaluate(readBoard);
        await bc.close();

        check(near(got.head.h, spec.head), label, `the head is ${got.head.h.toFixed(1)} px tall (the plan's ${spec.head} \u00b1${SCREEN_TOL}; the board ${board.head?.h?.toFixed(1)})`);
        check(board.head && near(got.head.h, board.head.h), label, 'the head matches the board\'s own head height');
        check(near(got.print.w, spec.print[0]) && near(got.print.h, spec.print[1]), label, `Print is ${got.print.w.toFixed(1)} x ${got.print.h.toFixed(1)} (${spec.print.join(' x ')}; the board ${board.print?.w?.toFixed(1)} x ${board.print?.h?.toFixed(1)})`);
        if (spec.width === 1280) check(near(got.print.right, got.head.right, 1), label, `Print sits at the head's right edge (${got.print.right.toFixed(1)} against ${got.head.right.toFixed(1)})`);
        else check(near(got.print.x, got.head.x, 1) && near(got.print.right, got.head.right, 1), label, 'Print fills the head\'s width');
        if (spec.width === 393) {
          check(got.name.y < got.version.y && got.version.y < got.saved.y, label, 'the line stacks in three: the Sheet title, the version line, then the saved date and the code');
          check(near(got.name.h, 44, 4), label, `the Sheet title link is ${got.name.h.toFixed(1)} px tall (the board's 44 px link)`);
        } else {
          check(near(got.name.y + got.name.h / 2, got.saved.y + got.saved.h / 2, 12), label, 'the line reads on one row');
        }
        check(got.pages.length === LOG_PAGES.length, label, `shows ${LOG_PAGES.length} page pictures (got ${got.pages.length})`);
        got.pages.forEach((box, i) => {
          check(near(box.w, spec.picture[0]) && near(box.h, spec.picture[1]), label, `picture ${i + 1} is ${box.w.toFixed(1)} x ${box.h.toFixed(1)} (${spec.picture.join(' x ')}; the board ${board.log1?.w?.toFixed(1)} x ${board.log1?.h?.toFixed(1)})`);
        });
        if (got.pages.length > 1) {
          const gap = got.pages[1].y - (got.pages[0].y + got.pages[0].h);
          check(near(gap, 20, 1), label, `the pictures are ${gap.toFixed(1)} px apart (20)`);
        }
        check(got.overflowX <= 0, label, `no horizontal overflow (${got.overflowX} px)`);
        check(got.title === 'Olive Oil Ice Cream, circulator \u00b7 Print sheet \u00b7 Sprinkles', label, `the tab title leads with the recipe name (${got.title})`);

        // Tab from the Sheet title link reaches Print next (WebKit's own Tab
        // order is the one that matters; Chrome is read the same way).
        await page.locator('.print-route__name').focus();
        await page.keyboard.press('Tab');
        const next = await page.evaluate(() => document.activeElement?.textContent?.trim());
        check(next === 'Print', label, `Tab from the Sheet title link reaches Print next (${next})`);
        await context.close();
      }

      // The Batch log page's elements sit at the same place within the page at
      // 1280 fine and 393 coarse: the page does not read the window or the
      // pointer. Both are read at one device pixel ratio, because WebKit snaps
      // text metrics to device pixels (a 1x and a 3x screen differ by up to 0.7
      // page px in the same page at the same width, measured below); the ratio
      // is the device's, not anything the page's CSS can read.
      const readAt = async (spec) => {
        const { context, page } = await openRoute(browser, appUrl, OLIVE.route, { width: spec.width, coarse: spec.coarse, dpr: 1 });
        const got = await page.evaluate(readRoute);
        await context.close();
        return got.inside;
      };
      const wide = await readAt(WIDTHS[0]);
      const narrow = await readAt(WIDTHS[1]);
      let moved = 0;
      let worst = 0;
      if (wide.length !== narrow.length) moved = Infinity;
      else {
        wide.forEach((a, i) => {
          const b = narrow[i];
          const d = Math.max(Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]), Math.abs(a[3] - b[3]), Math.abs(a[4] - b[4]));
          worst = Math.max(worst, d);
          if (a[0] !== b[0] || d > POSITION_TOL) {
            moved += 1;
            console.log(`  moved ${a[0] || '(no class)'}: ${[1, 2, 3, 4].map((k) => (b[k] - a[k]).toFixed(2)).join(', ')}`);
          }
        });
      }
      check(moved === 0, `${engine} page 1`, `all ${wide.length} elements sit at the same place within the page at 1280 fine and 393 coarse, both at 1x (worst ${worst.toFixed(2)} px, tolerance ${POSITION_TOL})`);
      const dprWide = byWidth[393].inside;
      let dprWorst = 0;
      dprWide.forEach((a, i) => {
        const b = narrow[i];
        if (b) dprWorst = Math.max(dprWorst, Math.abs(a[2] - b[2]), Math.abs(a[4] - b[4]));
      });
      console.log(`INFO ${engine} page 1: the same page at 393 coarse on a 3x screen differs from 1x by at most ${dprWorst.toFixed(2)} px (text metrics snap to device pixels; not read by any rule)`);

      // Each log page against its own board, element by element (the sketch is
      // the authority): same classes in the same order, same boxes within the page.
      for (const [file, index] of [['page-1-batch-log.html', 0], ['page-2-tasting-log.html', 1]]) {
        const { context: bc, page: bp } = await openBoardPage(browser, repoUrl, file, { width: 1280, coarse: false });
        const board = await bp.evaluate(() => {
          const root = document.querySelector('.lf');
          const r0 = root.getBoundingClientRect();
          return [...root.querySelectorAll('*')].map((el) => {
            const r = el.getBoundingClientRect();
            return [String(el.className), r.left - r0.left, r.top - r0.top, r.width, r.height];
          });
        });
        await bc.close();
        const { context, page } = await openRoute(browser, appUrl, OLIVE.route, { width: 1280 });
        const app = await page.evaluate((i) => {
          const root = document.querySelectorAll('.lf')[i];
          const r0 = root.parentElement.getBoundingClientRect();
          return [...root.querySelectorAll('*')].map((el) => {
            const r = el.getBoundingClientRect();
            return [String(el.className), r.left - r0.left, r.top - r0.top, r.width, r.height];
          });
        }, index);
        await context.close();
        let off = 0;
        let first = '';
        board.forEach((a, i) => {
          const b = app[i];
          if (!b || a[0] !== b[0] || [1, 2, 3, 4].some((k) => Math.abs(a[k] - b[k]) > 0.6)) {
            off += 1;
            first ||= `${a[0]} board ${a.slice(1).map((n) => n.toFixed(1)).join(',')} app ${b ? b.slice(1).map((n) => n.toFixed(1)).join(',') : 'missing'}`;
          }
        });
        check(board.length === app.length && off === 0, `${engine} ${file}`, `all ${board.length} elements match the board's boxes${off ? ` (${off} differ; first ${first})` : ''}`);
      }
    }
  } finally {
    for (const [, browser] of engines) await browser.close();
    await close();
  }
}

// Every seed version, unless ids are named on the command line.
const LOGS_DEFAULT = ALL_VERSIONS.map((v) => v.id);

// ---------------------------------------------------------------------------
const [mode, ...rest] = process.argv.slice(2);
try {
  if (mode === 'logs') await runLogs(rest);
  else if (mode === 'screen') await runScreen();
  else {
    console.log('usage: 04-print-probe.mjs logs [version-id ...] | screen');
    process.exit(2);
  }
} finally {
  report(offHost.length === 0 ? 'MATCH' : 'FAIL', 'isolation', `${offHost.length} request(s) to a host other than 127.0.0.1${offHost.length ? `: ${[...new Set(offHost)].join(', ')}` : ''}`);
}
console.log(failures === 0 ? 'ALL MATCH' : `${failures} DIFF/FAIL`);
process.exit(failures === 0 ? 0 : 1);
