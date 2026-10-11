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
//   node .planning/phases/04-.../04-print-probe.mjs measure
//       (04-07) Olive Oil v1's Sheet blocks as the route measures them, in CSS
//       px, at Safari's 630 x 900 content box and at 672 x 960, in WebKit and
//       Chrome: the inputs sheetPages.fixtures.js holds
//   node .planning/phases/04-.../04-print-probe.mjs sheet
//       (04-07) Olive Oil v1's formula pages through WebKit's print and Chrome's
//       PDF, and on screen against sheet-page-1-formula.html and
//       sheet-page-2-table-tail.html
//   node .planning/phases/04-.../04-print-probe.mjs sweep
//       (04-07) every seed version's formula pages in both engines; (04-08) and
//       its Instructions and closing foot
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
import { pathToFileURL } from 'node:url';
import { sheetCode } from '../../../app/src/domain/sheetCode.js';
import { AXES } from '../../../app/src/domain/axes.js';
import { DEFECTS } from '../../../app/src/domain/battery.js';

// The seed the app was built with. PROBE_SEED names another seed module (a
// scratch copy of the app whose seed also holds stress versions, built into
// PROBE_DIST) for a run that needs a table longer than any real recipe's.
const { seedRecipeGroups } = await import(
  process.env.PROBE_SEED ? pathToFileURL(process.env.PROBE_SEED).href : new URL('../../../app/src/data/seed-recipes.js', import.meta.url).href
);

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
// NFKC first: Chrome's PDF text carries the f-ligatures (U+FB00, U+FB03) as single characters.
const norm = (t) => t.normalize('NFKC').replace(/[|\n]/g, ' ').toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim();
const hasWord = (t, word) => new RegExp(`(^| )${word}( |$)`).test(norm(t));

// ---------------------------------------------------------------------------
// A browser context that counts every request to another host and aborts it.
// ---------------------------------------------------------------------------
const offHost = [];
async function openRoute(browser, appUrl, route, { width = 1280, height = 1100, coarse = false, dpr = coarse ? 3 : 1, box = null } = {}) {
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
  // `box` sets the content box the Sheet is laid in, whatever the engine, by
  // appending the four tokens to the built stylesheet (the engine would choose
  // 630 x 900 in WebKit and 672 x 960 elsewhere on its own).
  if (box) {
    await context.route('**/*.css', async (r) => {
      const response = await r.fetch();
      const css = await response.text();
      const tokens = `:root{--sheet-print-content-w-webkit:${box.w}px !important;--sheet-print-content-h-webkit:${box.h}px !important;--sheet-print-content-w:${box.w}px !important;--sheet-print-content-h:${box.h}px !important}`;
      await r.fulfill({ response, body: `${css}\n${tokens}` });
    });
  }
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
  // The two log pages come first, front and back of one sheet; the Sheet's own
  // pages follow them (04-07) and are checked by the sheet and sweep modes.
  check(pages.length >= LOG_PAGES.length, label, `prints the ${LOG_PAGES.length} log pages first (got ${pages.length} page(s) in all)`);
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
        // The two log pictures, then the Sheet's (04-07): every picture is a letter page.
        check(got.pages.length >= LOG_PAGES.length, label, `shows the ${LOG_PAGES.length} log page pictures first (got ${got.pages.length} pictures in all)`);
        got.pages.forEach((box, i) => {
          check(near(box.w, spec.picture[0]) && near(box.h, spec.picture[1]), label, `picture ${i + 1} is ${box.w.toFixed(1)} x ${box.h.toFixed(1)} (${spec.picture.join(' x ')}; the board ${board.log1?.w?.toFixed(1)} x ${board.log1?.h?.toFixed(1)})`);
        });
        got.pages.slice(1).forEach((box, i) => {
          const gap = box.y - (got.pages[i].y + got.pages[i].h);
          check(near(gap, 20, 1), label, `pictures ${i + 1} and ${i + 2} are ${gap.toFixed(1)} px apart (20)`);
        });
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
// sheet (04-07): the Sheet's formula pages on paper.
// ---------------------------------------------------------------------------
// The Sheet pages follow the two log pages. How many there are is the plan's
// to say: the route leaves the laid pages in the DOM, one picture each.
async function readLaidSheet(page) {
  return page.evaluate(() => {
    const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
    // A step group: its head (the step and its lead-in, apart), its lines.
    const group = (tbody) => {
      const head = tbody.querySelector('.ps-step-head');
      return {
        head: head ? text(head) : null,
        label: head ? head.querySelector('td').firstChild.textContent : null,
        lead: head && head.querySelector('.ps-step-lead') ? head.querySelector('.ps-step-lead').textContent : '',
        lines: [...tbody.querySelectorAll('tr:not(.ps-step-head)')].map((tr) => text(tr.querySelector('.ps-col-grams')) + ' ' + text(tr.querySelector('.ps-col-name').firstChild)),
      };
    };
    // A step: its number, its lead-in and instruction, its tags (label and value
    // apart), the why sentence and the aside, as the page draws them.
    const step = (li) => ({
      n: text(li.querySelector('.mp-n')),
      lead: text(li.querySelector('.mp-lead b')),
      instruction: text(li.querySelector('.mp-lead')).slice(text(li.querySelector('.mp-lead b')).length).trim(),
      tags: [...li.querySelectorAll('.mp-tag')].map((tag) => ({ label: text(tag.querySelector('.mp-tag__label')), value: text(tag.querySelector('.mp-tag__value')) })),
      why: li.querySelector('.mp-why') ? text(li.querySelector('.mp-why .mp-why__label').nextSibling ?? li.querySelector('.mp-why')).replace(/^— ?/, '') : null,
      aside: li.querySelector('.mp-aside') ? text(li.querySelector('.mp-aside')) : null,
    });
    const pages = [...document.querySelectorAll('.print-page--sheet')].map((pageEl) => ({
      band: Boolean(pageEl.querySelector('.ps-band')),
      before: Boolean(pageEl.querySelector('.ps-before')),
      heading: [...pageEl.querySelectorAll('.region-name')].map(text),
      header: Boolean(pageEl.querySelector('thead')),
      total: Boolean(pageEl.querySelector('tfoot')),
      gauges: [...pageEl.querySelectorAll('.formulation-note__rule')].map((rule) => ({
        word: text(rule.querySelector('.graduated-rule__label-word')),
        head: text(rule.querySelector('.graduated-rule__label')) + ' ' + text(rule.querySelector('.graduated-rule__value')),
      })),
      basis: Boolean(pageEl.querySelector('.basis-note')),
      buttons: pageEl.querySelectorAll('button').length,
      groups: [...pageEl.querySelectorAll('.ps-group')].map(group),
      instructions: {
        heading: Boolean(pageEl.querySelector('.ps-instructions > .region-name')),
        steps: [...pageEl.querySelectorAll('.mp-step')].map(step),
      },
      foot: pageEl.querySelector('.mp-foot') ? text(pageEl.querySelector('.mp-foot')) : null,
    }));
    const whole = [...document.querySelectorAll('.ps-box .ps-group')].map(group);
    const wholeGauges = [...document.querySelectorAll('.ps-box .formulation-note__rule')].map((rule) => ({
      word: text(rule.querySelector('.graduated-rule__label-word')),
      head: text(rule.querySelector('.graduated-rule__label')) + ' ' + text(rule.querySelector('.graduated-rule__value')),
    }));
    const wholeSteps = [...document.querySelectorAll('.ps-box .mp-step')].map(step);
    const wholeFoot = document.querySelector('.ps-box .mp-foot');
    return {
      pages,
      whole,
      wholeGauges,
      wholeSteps,
      wholeFoot: wholeFoot ? text(wholeFoot) : null,
      lineCode: document.querySelector('.print-route__code') ? text(document.querySelector('.print-route__code')) : null,
      total: text(document.querySelector('.ps-box tfoot .ps-col-grams')),
      hasNotes: Boolean(document.querySelector('.ps-box .ps-before')),
    };
  });
}

// ---------------------------------------------------------------------------
// measure (04-07): the Sheet's blocks as the route reads them. The route leaves
// its measurement on the hidden box as data-ps-measure, so this reads what
// layPages was given, not a second reading of the same page. Each content box
// is forced in each engine, so the fixtures hold all four.
// ---------------------------------------------------------------------------
const SHEET_BOXES = [
  { w: 630, h: 900 },
  { w: 672, h: 960 },
];
const round1 = (n) => Math.round(n * 10) / 10;

async function readSheetMeasure(page) {
  const raw = await page.getAttribute('[data-ps-measure]', 'data-ps-measure');
  return JSON.parse(raw);
}

async function runMeasure() {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const engines = [
    ['webkit', await webkit.launch()],
    ['chrome', await launch()],
  ];
  try {
    for (const [engine, browser] of engines) {
      for (const box of SHEET_BOXES) {
        const label = `${engine} ${box.w}x${box.h}`;
        const { context, page } = await openRoute(browser, appUrl, OLIVE.route, { box });
        const got = await readSheetMeasure(page);
        const m = got.measure;
        check(near(got.height, box.h, 0.5), label, `the measuring box is ${got.height} px tall (${box.h})`);
        // The table's blocks add up to the table as the page lays it.
        const tableHeight = await page.evaluate(() => document.querySelector('.ps-box .ps-table').getBoundingClientRect().height);
        const summed = m.header + m.groups.reduce((t, g) => t + g.head + g.rows.reduce((a, b) => a + b, 0), 0) + m.total;
        check(near(summed, tableHeight, 0.5), label, `header, groups and Total add up to the table (${summed.toFixed(2)} against ${tableHeight.toFixed(2)})`);
        console.log(`MEASURE ${label} ${JSON.stringify({ measure: m, height: got.height, columns: got.columns, fit: got.fit }, (k, v) => (typeof v === 'number' && k !== 'fit' ? round1(v) : v))}`);
        await context.close();
      }
    }
  } finally {
    for (const [, browser] of engines) await browser.close();
    await close();
  }
}

// Where sketch 010 D29 breaks Olive Oil v1's table: by the step numbers each
// Sheet page holds. Safari (630 x 900) puts Steps 2 and 3 on the formula page;
// Chrome (672 x 960) also takes Step 6.
const OLIVE_SHEET_BREAKS = {
  webkit: [[2, 3], [6, 8]],
  chrome: [[2, 3, 6], [8]],
};

// And Balance's gauges beside it (D29; decide-balance-break = continue): Safari
// takes four with the table and carries Sugar, Solids and the basis note over;
// Chrome takes five.
const OLIVE_GAUGE_BREAKS = {
  webkit: [['Freezing', 'Sweetness', 'Fat', 'Milk solids'], ['Sugar', 'Solids']],
  chrome: [['Freezing', 'Sweetness', 'Fat', 'Milk solids', 'Sugar'], ['Solids']],
};

// And the Instructions under the table's tail (D29): Safari puts steps 1 to 4 on
// the page that holds the tail and 5 to 10 with the closing foot on the next;
// Chrome puts 1 to 5, then 6 to 10. The formula page holds none.
const OLIVE_INSTRUCTION_BREAKS = {
  webkit: [[], [1, 2, 3, 4], [5, 6, 7, 8, 9, 10]],
  chrome: [[], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10]],
};

const stepOf = (group) => Number(group.head.match(/^Step (\d+)/)[1]);

// The laid pages the route drew (the DOM), against D29.
function checkLaid(engine, v, laid) {
  const label = `${engine} ${v.id} laid`;
  const breaks = OLIVE_SHEET_BREAKS[engine];
  const instructionBreaks = OLIVE_INSTRUCTION_BREAKS[engine];
  check(laid.pages.length === instructionBreaks.length, label, `the route lays ${laid.pages.length} Sheet page(s) (D29: ${instructionBreaks.length})`);
  // The pages after the table's last hold the Instructions alone.
  laid.pages.slice(breaks.length).forEach((p, k) => {
    const i = breaks.length + k;
    check(!p.header && !p.total && p.groups.length === 0 && p.gauges.length === 0 && !p.basis, label, `Sheet page ${i + 1} holds no table and no Balance`);
  });
  laid.pages.forEach((p, i) => {
    const steps = p.instructions.steps.map((entry) => Number(entry.n));
    check(JSON.stringify(steps) === JSON.stringify(instructionBreaks[i]), label, `Sheet page ${i + 1} holds Instructions ${steps.join(', ') || 'none'} (D29: ${instructionBreaks[i].join(', ') || 'none'})`);
    check(p.instructions.heading === (i === 1), label, `Sheet page ${i + 1} ${p.instructions.heading ? 'carries' : 'does not carry'} the Instructions heading (once, on page 2)`);
    check((p.foot !== null) === (i === laid.pages.length - 1), label, `Sheet page ${i + 1} ${p.foot !== null ? 'holds' : 'does not hold'} the closing foot`);
    check(p.buttons === 0, label, `Sheet page ${i + 1} has no button on it (${p.buttons})`);
    if (i >= breaks.length) return;
    const got = p.groups.map(stepOf);
    check(JSON.stringify(got) === JSON.stringify(breaks[i]), label, `Sheet page ${i + 1} holds Steps ${got.join(', ')} (D29: ${breaks[i].join(', ')})`);
    check(p.header, label, `Sheet page ${i + 1} opens with the header row`);
    check(i === 0 ? p.heading.includes('Ingredients') : !p.heading.includes('Ingredients'), label, `Sheet page ${i + 1} ${i === 0 ? 'carries' : 'does not carry'} the Ingredients heading`);
    check(p.total === (i === breaks.length - 1), label, `Sheet page ${i + 1} ${p.total ? 'holds' : 'does not hold'} the Total`);
    const words = p.gauges.map((g) => g.word);
    check(JSON.stringify(words) === JSON.stringify(OLIVE_GAUGE_BREAKS[engine][i]), label, `Sheet page ${i + 1} holds the gauges ${words.join(', ')} (D29: ${OLIVE_GAUGE_BREAKS[engine][i].join(', ')})`);
    check(p.heading.includes('Balance') === (i === 0), label, `Sheet page ${i + 1} ${i === 0 ? 'carries' : 'does not carry'} the Balance heading`);
    check(p.basis === (i === breaks.length - 1), label, `Sheet page ${i + 1} ${p.basis ? 'holds' : 'does not hold'} the basis note`);
  });
  const gaugeWords = laid.pages.flatMap((p) => p.gauges.map((g) => g.word));
  check(JSON.stringify(gaugeWords) === JSON.stringify(laid.wholeGauges.map((g) => g.word)), label, `every gauge stands once, in order (${gaugeWords.join(', ')})`);
  const lines = laid.pages.flatMap((p) => p.groups.flatMap((g) => g.lines));
  const expected = laid.whole.flatMap((g) => g.lines);
  check(JSON.stringify(lines) === JSON.stringify(expected), label, `every line stands once, in order (${lines.length} of ${expected.length})`);
  const laidSteps = laid.pages.flatMap((p) => p.instructions.steps);
  check(JSON.stringify(laidSteps) === JSON.stringify(laid.wholeSteps), label, `every step stands once, in order (${laidSteps.length} of ${laid.wholeSteps.length})`);
}

// The Instructions and the closing foot, as printed, against what the route laid
// (04-08; PRINT-02, PRINT-04; T-04-21). `bodies` are the Sheet pages' comparable
// text in paper order; `logs` the two log pages'. Returns the problems found.
function instructionProblems(v, laid, bodies, logs) {
  const problems = [];
  const ok = (cond, what) => {
    if (!cond) problems.push(what);
  };
  const at = (run) => bodies.map((body) => countIn(body, norm(run)));
  laid.pages.forEach((p, i) => {
    const texts = [];
    for (const st of p.instructions.steps) {
      // Each part of a step stands on its page, and on no other: a step is never split.
      const parts = [
        ['its lead-in and instruction', `${st.lead} ${st.instruction}`],
        ...st.tags.flatMap((tag) => [[`target label "${tag.label}"`, tag.label], [`target value "${tag.value}"`, tag.value]]),
        ...(st.why ? [['its why sentence', st.why]] : []),
        ...(st.aside ? [['its aside', st.aside]] : []),
      ];
      for (const [what, run] of parts) {
        texts.push(run);
        const found = at(run);
        const elsewhere = found.reduce((sum, n, j) => sum + (j === i ? 0 : n), 0);
        // A target's label or value may repeat in another step on another page; the
        // prose parts may not.
        const prose = !what.startsWith('target');
        ok(found[i] >= 1, `Step ${st.n}: ${what} is not on page ${i + 1} (found on [${found}])`);
        if (prose) ok(elsewhere === 0, `Step ${st.n}: ${what} is also printed on another page ([${found}])`);
      }
    }
    // The heading: the word once on the page that carries it, apart from the steps' own words.
    const own = countIn(norm(texts.join(' ')), 'instructions');
    ok(countIn(bodies[i], 'instructions') === (p.instructions.heading ? 1 : 0) + own, `page ${i + 1}: the word "instructions" is printed ${countIn(bodies[i], 'instructions')} times, laid ${p.instructions.heading ? 1 : 0} + ${own} in the steps`);
  });
  // The closing foot: once, last, after the last step, carrying the code the route's line and the log feet carry.
  const foot = laid.wholeFoot;
  const last = bodies.length - 1;
  const footAt = at(foot);
  ok(footAt.reduce((a, b) => a + b, 0) === 1 && footAt[last] === 1, `the closing foot "${foot}" is printed on pages [${footAt}] (once, on the last)`);
  ok(bodies[last].endsWith(norm(foot)), 'the closing foot is not the last thing on the last page');
  const lastStep = laid.wholeSteps[laid.wholeSteps.length - 1];
  if (lastStep) ok(bodies[last].lastIndexOf(norm(lastStep.lead)) < bodies[last].lastIndexOf(norm(foot)), 'the closing foot stands before the last step');
  ok(foot.endsWith(` \u00b7 ${v.code}`) && foot.startsWith(`${v.sheetTitle} \u00b7 `), `the closing foot reads "${foot}", expected the Sheet title, the version line and ${v.code}`);
  ok(laid.lineCode === v.code, `the route's line reads ${laid.lineCode}, expected ${v.code}`);
  logs.forEach((body, i) => ok(body.includes(norm(v.code)), `log page ${i + 1}'s foot lacks ${v.code}`));
  ok(!/side \d of \d/.test(norm(foot)) && !/page \d+ of \d+/.test(bodies.join(' ')), 'a Sheet page carries a side label or "page n of m"');
  return problems;
}

// A printed PDF against the plan: pages, text, ink.
function checkSheetPaper(engine, v, file, laid) {
  const label = `${engine} ${v.id}`;
  const pages = pdfText(tools['pdf-pages'], file);
  const ink = pdfInk(tools['pdf-pages'], file);
  const breaks = OLIVE_SHEET_BREAKS[engine];
  const sheetPages = OLIVE_INSTRUCTION_BREAKS[engine].length;
  check(pages.length === LOG_PAGES.length + sheetPages, label, `prints ${LOG_PAGES.length + sheetPages} pages, the two logs then ${sheetPages} of the Sheet (got ${pages.length})`);
  breaks.forEach((steps, i) => {
    const index = LOG_PAGES.length + i;
    const text = pages[index] ?? '';
    const plabel = `${label} page ${index + 1}`;
    const body = norm(text);
    if (i === 0) {
      check(body.startsWith(norm(v.sheetTitle)), plabel, 'opens with the Sheet title');
      check(body.includes('before you start'), plabel, 'holds Before you start');
      check(body.includes('ingredients as made ingredient') || /ingredients as made ingredient/.test(body), plabel, 'holds the Ingredients heading over the header row');
    } else {
      check(body.startsWith('as made ingredient'), plabel, 'opens with the header row, As made then Ingredient');
      check(!/(^| )ingredients( |$)/.test(body), plabel, 'carries no Ingredients heading again');
      check(!body.includes('before you start'), plabel, 'does not print Before you start again');
    }
    check(!body.includes('continued'), plabel, 'carries no "continued"');
    for (const group of laid.whole) {
      const n = stepOf(group);
      const here = steps.includes(n);
      const head = new RegExp(`(^| )step ${n}( |$)`).test(body);
      check(head === here, plabel, `Step ${n}'s head is ${here ? '' : 'not '}on this page`);
      if (here) {
        const missing = group.lines.filter((line) => !body.includes(norm(line)));
        check(missing.length === 0, plabel, `Step ${n}'s ${group.lines.length} lines are all here${missing.length ? ` (missing ${missing.join('; ')})` : ''}`);
      }
    }
    const totals = (body.match(/(^| )total( |$)/g) ?? []).length;
    const last = i === breaks.length - 1;
    check(totals === (last ? 1 : 0), plabel, `the Total is printed ${totals} time(s) here (${last ? 1 : 0})`);
    // Balance: the heading on the first page only, each gauge on the page D29
    // names and no other, the basis note last.
    check(/(^| )balance( |$)/.test(body) === (i === 0), plabel, `the word Balance is ${i === 0 ? '' : 'not '}on this page`);
    for (const gauge of laid.wholeGauges) {
      const here = OLIVE_GAUGE_BREAKS[engine][i].includes(gauge.word);
      check(body.includes(norm(gauge.head)) === here, plabel, `the ${gauge.word} gauge (${gauge.head}) is ${here ? '' : 'not '}on this page`);
    }
    check(body.includes('computed from') === last, plabel, `the basis note is ${last ? '' : 'not '}on this page`);
    const b = ink[index];
    if (check(b !== null && b !== undefined, plabel, 'has ink')) {
      check(b.x0 >= CONTENT_PT.x0 - INK_TOL_PT && b.x1 <= CONTENT_PT.x1 + INK_TOL_PT, plabel, `ink stays between the side margins (x ${b.x0.toFixed(1)} to ${b.x1.toFixed(1)}, box ${CONTENT_PT.x0} to ${CONTENT_PT.x1})`);
      check(b.y0 >= CONTENT_PT.y0 - INK_TOL_PT && b.y1 <= CONTENT_PT.y1 + INK_TOL_PT, plabel, `ink stays inside the content box's height (y ${b.y0.toFixed(1)} to ${b.y1.toFixed(1)}, box ${CONTENT_PT.y0} to ${CONTENT_PT.y1})`);
    }
  });
  // The pages after the table's last hold the Instructions alone (and the foot).
  for (let i = breaks.length; i < sheetPages; i += 1) {
    const b = ink[LOG_PAGES.length + i];
    const plabel = `${label} page ${LOG_PAGES.length + i + 1}`;
    if (check(b !== null && b !== undefined, plabel, 'has ink')) {
      check(b.x0 >= CONTENT_PT.x0 - INK_TOL_PT && b.x1 <= CONTENT_PT.x1 + INK_TOL_PT, plabel, `ink stays between the side margins (x ${b.x0.toFixed(1)} to ${b.x1.toFixed(1)}, box ${CONTENT_PT.x0} to ${CONTENT_PT.x1})`);
      check(b.y0 >= CONTENT_PT.y0 - INK_TOL_PT && b.y1 <= CONTENT_PT.y1 + INK_TOL_PT, plabel, `ink stays inside the content box's height (y ${b.y0.toFixed(1)} to ${b.y1.toFixed(1)}, box ${CONTENT_PT.y0} to ${CONTENT_PT.y1})`);
    }
  }
  const sheetBodies = pages.slice(LOG_PAGES.length).map(norm);
  const found = instructionProblems(v, laid, sheetBodies, pages.slice(0, LOG_PAGES.length).map(norm));
  check(found.length === 0, label, `the Instructions and the closing foot print as laid: ${laid.wholeSteps.length} steps, each whole on its page, the heading once, the foot once and last with ${v.code}`);
  for (const problem of found) report('DIFF', label, problem);
}

// On screen in WebKit at 1280 (fine pointer): the Sheet page pictures' boxes
// against sheet-page-1-formula.html and sheet-page-2-table-tail.html. The
// boards lay the Sheet in Safari's 630 x 900 and enlarge it 16/15; so does the
// route in WebKit, and both are compared in the Sheet's own coordinates, within
// SCREEN_TOL px. The formula part and the Instructions are compared apart (04-08):
// the 'formula' scope leaves out whatever sits inside .method-region (the board)
// or .ps-instructions (the route), the 'method' scope takes only that.
const SHEET_BOARDS = [
  { file: 'sheet-page-1-formula.html', scopes: ['formula'] },
  { file: 'sheet-page-2-table-tail.html', scopes: ['formula', 'method'] },
  { file: 'sheet-page-3-instructions-end.html', scopes: ['method'] },
];
const METHOD_BOX_SELECTORS = {
  app: { 'Instructions heading': '.ps-instructions > .region-name', steps: '.mp-step', numbers: '.mp-n', leads: '.mp-lead', 'tag rows': '.mp-tags', tags: '.mp-tag', 'tag labels': '.mp-tag__label', 'tag values': '.mp-tag__value', why: '.mp-why', asides: '.mp-aside', 'closing foot': '.mp-foot' },
  board: { 'Instructions heading': '.method-region > .region-name', steps: '.mp-step', numbers: '.mp-n', leads: '.mp-lead', 'tag rows': '.mp-tags', tags: '.mp-tag', 'tag labels': '.mp-tag__label', 'tag values': '.mp-tag__value', why: '.mp-why', asides: '.mp-aside', 'closing foot': '.mp-foot' },
};
const SHEET_BOX_SELECTORS = {
  app: { band: '.ps-band', title: '.headnote h1', prose: '.headnote__prose', before: '.ps-before', notes: '.authored__notes', headings: '.region-name', 'header row': 'thead tr', 'table rows': 'tbody tr', 'Total row': 'tfoot tr', gauges: '.formulation-note__rule', 'basis note': '.basis-note' },
  board: { band: '.recipe-band', title: '.headnote h1', prose: '.headnote__prose', before: '.before-region', notes: '.authored__notes', headings: '.region-name', 'header row': 'thead tr', 'table rows': 'tbody tr', 'Total row': 'tfoot tr', gauges: '.formulation-note__rule', 'basis note': '.basis-note' },
};

function readFitBoxes({ side, index, selectors, scope }) {
  const root = side === 'app' ? document.querySelectorAll('.print-page--sheet .ps-fit')[index] : document.querySelector('.sp-fit');
  const r0 = root.getBoundingClientRect();
  const k = r0.width / root.offsetWidth;
  const out = {};
  for (const [key, selector] of Object.entries(selectors)) {
    out[key] = [...root.querySelectorAll(selector)]
      .filter((el) => Boolean(el.closest('.method-region, .ps-instructions')) === (scope === 'method'))
      .map((el) => {
        const r = el.getBoundingClientRect();
        return [(r.left - r0.left) / k, (r.top - r0.top) / k, r.width / k, r.height / k];
      });
  }
  return out;
}

async function compareSheetToBoards(browser, appUrl, repoUrl) {
  const label = 'webkit 1280 screen';
  const { context, page } = await openRoute(browser, appUrl, OLIVE.route, { width: 1280 });
  for (let index = 0; index < SHEET_BOARDS.length; index += 1) {
    const { file, scopes } = SHEET_BOARDS[index];
    const { context: bc, page: bp } = await openBoardPage(browser, repoUrl, file, { width: 1280, coarse: false });
    for (const scope of scopes) {
      const selectors = scope === 'method' ? METHOD_BOX_SELECTORS : SHEET_BOX_SELECTORS;
      const board = await bp.evaluate(readFitBoxes, { side: 'board', index: 0, selectors: selectors.board, scope });
      const app = await page.evaluate(readFitBoxes, { side: 'app', index, selectors: selectors.app, scope });
      for (const key of Object.keys(selectors.app)) {
        const a = app[key];
        const b = board[key];
        let worst = 0;
        let first = '';
        if (a.length === b.length) {
          a.forEach((box, i) => {
            const d = Math.max(...box.map((n, k) => Math.abs(n - b[i][k])));
            worst = Math.max(worst, d);
            if (d > SCREEN_TOL && !first) first = `#${i} app ${box.map((n) => n.toFixed(1)).join(',')} board ${b[i].map((n) => n.toFixed(1)).join(',')}`;
          });
        }
        check(a.length === b.length && worst <= SCREEN_TOL, `${label} ${file}`, `${key}: ${a.length} box(es) against the board's ${b.length}, worst ${worst.toFixed(2)} px (\u00b1${SCREEN_TOL})${first ? `; first off ${first}` : ''}`);
      }
    }
    await bc.close();
  }
  await context.close();
}

async function runSheet() {
  await tool('wkprint');
  await tool('pdf-pages');
  const { appUrl, repoUrl, close } = await startServers({ appRoot: DIST });
  const engines = [
    ['webkit', await webkit.launch()],
    ['chrome', await launch()],
  ];
  try {
    const v = OLIVE;
    for (const [engine, browser] of engines) {
      // The browser's own engine lays the pages; the DOM says where.
      const { context, page } = await openRoute(browser, appUrl, v.route);
      const laid = await readLaidSheet(page);
      checkLaid(engine, v, laid);
      if (engine === 'chrome') {
        const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
        const file = path.join(workDir, `chrome-sheet-${v.id}.pdf`);
        await writeFile(file, pdf);
        if (process.env.PROBE_DUMP) pdfText(tools['pdf-pages'], file).forEach((t, i) => console.log(`--- chrome page ${i + 1}\n${t}`));
        checkSheetPaper('chrome', v, file, laid);
      }
      await context.close();
      if (engine === 'webkit') {
        await compareSheetToBoards(browser, appUrl, repoUrl);
        // WebKit's own print is the one that matters for Safari.
        const file = await printWebKit(appUrl, v);
        if (process.env.PROBE_DUMP) pdfText(tools['pdf-pages'], file).forEach((t, i) => console.log(`--- webkit page ${i + 1}\n${t}`));
        checkSheetPaper('webkit', v, file, laid);
      }
    }
  } finally {
    for (const [, browser] of engines) await browser.close();
    await close();
  }
}

// ---------------------------------------------------------------------------
// sweep (04-07 Task 3): every seed version's formula pages, in both engines.
// One line per version and engine: the route lays the pages, the engine prints
// them, and what the engine printed is checked against what was laid.
// ---------------------------------------------------------------------------
// How many times a word run stands in a page's comparable text.
const countIn = (body, run) => {
  if (!run) return 0;
  const escaped = run.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (body.match(new RegExp(`(?<= |^)${escaped}(?= |$)`, 'g')) ?? []).length;
};

// The printed PDF against the laid pages. Returns a list of problems, empty
// when the paper is the plan.
function sweepProblems(v, file, laid) {
  const problems = [];
  const ok = (cond, what) => {
    if (!cond) problems.push(what);
  };
  const pdf = pdfText(tools['pdf-pages'], file);
  const ink = pdfInk(tools['pdf-pages'], file);
  const count = laid.pages.length;
  ok(pdf.length === LOG_PAGES.length + count, `prints ${pdf.length} pages, the plan lays ${LOG_PAGES.length} + ${count}`);
  const bodies = laid.pages.map((_, i) => norm(pdf[LOG_PAGES.length + i] ?? ''));

  // Before you start: on the formula page, and only when the version has notes.
  ok(laid.hasNotes === laid.pages[0].before, `Before you start is laid ${laid.pages[0].before} but the version has notes ${laid.hasNotes}`);
  bodies.forEach((body, i) => ok(body.includes('before you start') === (i === 0 && laid.hasNotes), `page ${i + 1} ${body.includes('before you start') ? 'prints' : 'lacks'} Before you start (formula page with notes only)`));

  // The Total: once, on the page that holds it.
  const total = norm(`${laid.total} Total`);
  const totals = bodies.map((body) => countIn(body, total));
  ok(totals.reduce((a, b) => a + b, 0) === 1, `the Total is printed ${totals.reduce((a, b) => a + b, 0)} times (${totals.join(', ')})`);
  laid.pages.forEach((p, i) => ok(totals[i] === (p.total ? 1 : 0), `page ${i + 1}: Total printed ${totals[i]} times, laid ${p.total ? 1 : 0}`));

  // The gauges: each once, on its page.
  for (const gauge of laid.wholeGauges) {
    const at = bodies.map((body) => countIn(body, norm(gauge.head)));
    const laidAt = laid.pages.map((p) => p.gauges.filter((g) => g.head === gauge.head).length);
    ok(JSON.stringify(at) === JSON.stringify(laidAt), `gauge "${gauge.head}" printed on pages [${at}] but laid on [${laidAt}]`);
  }
  laid.pages.forEach((p, i) => ok(countIn(bodies[i], 'computed from') === (p.basis ? 1 : 0), `page ${i + 1}: basis note printed ${countIn(bodies[i], 'computed from')} times, laid ${p.basis ? 1 : 0}`));

  // The step groups: a group the plan did not split keeps its head and every
  // line on its page; one it split keeps the head with its first line.
  const wholeByHead = new Map(laid.whole.filter((g) => g.head).map((g) => [g.head, g]));
  laid.pages.forEach((p, i) => {
    const wanted = new Map();
    for (const g of p.groups) for (const line of g.lines) wanted.set(line, (wanted.get(line) ?? 0) + 1);
    // A line is its grams then its name. A name that wraps beside a centred amount
    // is read out of the PDF the other way round, or with the amount far from it
    // (the text extractor orders by baseline), so the order is not asked of a line
    // that did not come out adjacent: then the amount and the name must each stand
    // on the page as often as the laid lines on it call for.
    const printed = (body, line, n) => {
      const cut = line.indexOf(' g ') + 2;
      const grams = line.slice(0, cut);
      const name = line.slice(cut + 1);
      const adjacent = countIn(body, norm(line)) + countIn(body, norm(`${name} ${grams}`));
      if (adjacent > 0) return adjacent;
      const sameGrams = p.groups.flatMap((g) => g.lines).filter((other) => other.startsWith(`${grams} `)).length;
      const sameName = p.groups.flatMap((g) => g.lines).filter((other) => other.endsWith(` ${name}`)).length;
      return countIn(body, norm(grams)) >= sameGrams && countIn(body, norm(name)) >= sameName ? n : 0;
    };
    for (const [line, n] of wanted) ok(printed(bodies[i], line, n) >= n, `page ${i + 1}: line "${line}" printed ${printed(bodies[i], line, n)} times, laid ${n}`);
    for (const g of p.groups) {
      if (!g.head) continue;
      const whole = wholeByHead.get(g.head);
      // The step and its lead-in are two runs of text the extractor may read apart
      // (two heads on neighbouring baselines come out interleaved), so each is
      // asked for on its own: the step once on its page and nowhere else, the
      // lead-in on its page.
      const here = countIn(bodies[i], norm(g.label));
      const elsewhere = bodies.reduce((sum, body, j) => sum + (j === i ? 0 : countIn(body, norm(g.label))), 0);
      ok(here === 1 && elsewhere === 0, `${g.label}'s head printed ${here} times here and ${elsewhere} elsewhere`);
      ok(countIn(bodies[i], norm(g.lead)) >= 1, `${g.label}'s lead-in "${g.lead}" is not on its page`);
      ok(g.lines.length > 0, `${g.label}'s head stands with no line (${g.lines.length} of ${whole.lines.length})`);
    }
    // The header row opens every table page; the Ingredients heading only the
    // first one (the formula page, or the next when Before you start leaves the
    // table no room), and no page says "continued".
    const firstTable = laid.pages.findIndex((q) => q.header);
    if (p.header) {
      const opens = i === firstTable ? bodies[i].includes('ingredients as made ingredient') : bodies[i].startsWith('as made ingredient');
      ok(opens, `page ${i + 1}: the ${i === firstTable ? 'Ingredients heading and ' : ''}header row does not open the table`);
      ok((i === firstTable) === p.heading.includes('Ingredients'), `page ${i + 1}: the Ingredients heading is laid ${p.heading.includes('Ingredients')}, the first table page is ${firstTable + 1}`);
    }
    ok(!bodies[i].includes('continued'), `page ${i + 1} carries the word "continued"`);
  });

  // The Instructions and the closing foot (04-08).
  problems.push(...instructionProblems(v, laid, bodies, pdf.slice(0, LOG_PAGES.length).map(norm)));

  // No ink past the content box.
  laid.pages.forEach((_, i) => {
    const b = ink[LOG_PAGES.length + i];
    if (!b) return problems.push(`page ${i + 1} has no ink`);
    ok(b.x0 >= CONTENT_PT.x0 - INK_TOL_PT && b.x1 <= CONTENT_PT.x1 + INK_TOL_PT, `page ${i + 1}: ink x ${b.x0.toFixed(1)} to ${b.x1.toFixed(1)} leaves the box ${CONTENT_PT.x0} to ${CONTENT_PT.x1}`);
    ok(b.y0 >= CONTENT_PT.y0 - INK_TOL_PT && b.y1 <= CONTENT_PT.y1 + INK_TOL_PT, `page ${i + 1}: ink y ${b.y0.toFixed(1)} to ${b.y1.toFixed(1)} leaves the box ${CONTENT_PT.y0} to ${CONTENT_PT.y1}`);
  });
  return problems;
}

// Runs in the page: the Sheet pictures' content boxes and every element's box
// within its fit box, as the Sheet is drawn (divided by the picture's scale).
function readSheetInside() {
  return [...document.querySelectorAll('.print-page--sheet .ps-fit')].map((fit) => {
    const r0 = fit.getBoundingClientRect();
    const k = r0.width / fit.offsetWidth;
    return {
      box: [fit.offsetWidth, fit.offsetHeight],
      // A pattern's definition is not drawn: it has no box to compare.
      inside: [...fit.querySelectorAll('*')].filter((el) => !el.closest('defs')).map((el) => {
        const r = el.getBoundingClientRect();
        return [String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className), (r.left - r0.left) / k, (r.top - r0.top) / k, r.width / k, r.height / k];
      }),
    };
  });
}

// The pages do not read the window: the same pages, the same boxes, at 1280
// with a fine pointer and 393 with a coarse one (both at 1x, because WebKit
// snaps text metrics to device pixels; see the screen mode).
async function widthProblems(browser, appUrl, v) {
  const problems = [];
  const read = async (spec) => {
    const { context, page } = await openRoute(browser, appUrl, v.route, { width: spec.width, coarse: spec.coarse, dpr: 1 });
    const pages = await page.evaluate(readSheetInside);
    await context.close();
    return pages;
  };
  const wide = await read(WIDTHS[0]);
  const narrow = await read(WIDTHS[1]);
  if (wide.length !== narrow.length) return [`${wide.length} Sheet page(s) at 1280 fine, ${narrow.length} at 393 coarse`];
  wide.forEach((a, i) => {
    const b = narrow[i];
    if (a.box[0] !== b.box[0] || a.box[1] !== b.box[1]) problems.push(`page ${i + 1}: the content box is ${a.box.join(' x ')} at 1280 and ${b.box.join(' x ')} at 393`);
    if (a.inside.length !== b.inside.length) return problems.push(`page ${i + 1}: ${a.inside.length} elements at 1280, ${b.inside.length} at 393`);
    let worst = 0;
    a.inside.forEach((x, j) => {
      const y = b.inside[j];
      if (x[0] !== y[0]) return problems.push(`page ${i + 1}: element ${j} is ${x[0]} at 1280 and ${y[0]} at 393`);
      worst = Math.max(worst, ...[1, 2, 3, 4].map((k) => Math.abs(x[k] - y[k])));
    });
    if (worst > POSITION_TOL) problems.push(`page ${i + 1}: an element moves ${worst.toFixed(2)} px between 1280 fine and 393 coarse (\u00b1${POSITION_TOL})`);
  });
  return problems;
}

async function runSweep(ids) {
  const versions = ids.length ? ALL_VERSIONS.filter((v) => ids.includes(v.id)) : ALL_VERSIONS;
  if (versions.length === 0) throw new Error(`no version matches ${ids.join(', ')}`);
  await tool('wkprint');
  await tool('pdf-pages');
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const engines = [
    ['chrome', await launch()],
    ['webkit', await webkit.launch()],
  ];
  try {
    for (const v of versions) {
      for (const [engine, browser] of engines) {
        const { context, page } = await openRoute(browser, appUrl, v.route);
        const laid = await readLaidSheet(page);
        let file;
        if (engine === 'chrome') {
          file = path.join(workDir, `chrome-sweep-${v.id}.pdf`);
          await writeFile(file, await page.pdf({ preferCSSPageSize: true, printBackground: true }));
        }
        await context.close();
        if (engine === 'webkit') file = await printWebKit(appUrl, v);
        const problems = [...sweepProblems(v, file, laid), ...(await widthProblems(browser, appUrl, v))];
        const gauges = laid.wholeGauges.length;
        const lines = laid.whole.reduce((n, g) => n + g.lines.length, 0);
        if (problems.length === 0) {
          // Where the Instructions begin: under the row's tail, or (both columns ended on
          // the formula page, D-06b) on a page of their own.
          const first = laid.pages.findIndex((p) => p.instructions.steps.length > 0);
          const own = first >= 0 && laid.pages[first].groups.length === 0 && laid.pages[first].gauges.length === 0 && !laid.pages[first].basis;
          const where = first < 0 ? 'no steps' : own ? `their own page ${first + 1} (the table fits)` : `page ${first + 1} under the row`;
          report('MATCH', `${engine} ${v.id}`, `${laid.pages.length} Sheet page(s) print as laid: ${laid.whole.length} step group(s), ${lines} line(s), ${gauges} gauge(s), the Total once, ${laid.hasNotes ? 'Before you start on the formula page' : 'no Before you start'}, ${laid.wholeSteps.length} step(s) whole with the Instructions on ${where}, the closing foot once and last, the same at 1280 and 393`);
        } else for (const problem of problems) report('DIFF', `${engine} ${v.id}`, problem);
      }
    }
  } finally {
    for (const [, browser] of engines) await browser.close();
    await close();
  }
}

// ---------------------------------------------------------------------------
const [mode, ...rest] = process.argv.slice(2);
try {
  if (mode === 'logs') await runLogs(rest);
  else if (mode === 'screen') await runScreen();
  else if (mode === 'measure') await runMeasure();
  else if (mode === 'sheet') await runSheet();
  else if (mode === 'sweep') await runSweep(rest);
  else {
    console.log('usage: 04-print-probe.mjs logs [version-id ...] | screen | measure | sheet | sweep');
    process.exit(2);
  }
} finally {
  report(offHost.length === 0 ? 'MATCH' : 'FAIL', 'isolation', `${offHost.length} request(s) to a host other than 127.0.0.1${offHost.length ? `: ${[...new Set(offHost)].join(', ')}` : ''}`);
}
console.log(failures === 0 ? 'ALL MATCH' : `${failures} DIFF/FAIL`);
process.exit(failures === 0 ? 0 : 1);
