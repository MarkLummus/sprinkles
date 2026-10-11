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
async function openRoute(browser, appUrl, route, { width = 1280, height = 1100, coarse = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: coarse,
    isMobile: coarse,
    deviceScaleFactor: coarse ? 3 : 1,
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

// Every seed version, unless ids are named on the command line.
const LOGS_DEFAULT = ALL_VERSIONS.map((v) => v.id);

// ---------------------------------------------------------------------------
const [mode, ...rest] = process.argv.slice(2);
try {
  if (mode === 'logs') await runLogs(rest);
  else {
    console.log('usage: 04-print-probe.mjs logs [version-id ...]');
    process.exit(2);
  }
} finally {
  report(offHost.length === 0 ? 'MATCH' : 'FAIL', 'isolation', `${offHost.length} request(s) to a host other than 127.0.0.1${offHost.length ? `: ${[...new Set(offHost)].join(', ')}` : ''}`);
}
console.log(failures === 0 ? 'ALL MATCH' : `${failures} DIFF/FAIL`);
process.exit(failures === 0 ? 0 : 1);
