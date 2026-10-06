// 03.7-02: the ingredient table's screen baseline and its print cases, for
// sketch 011 decision 45 (the table breaks by step groups, the header
// repeats, the Total goes with the last group; Mark's answers 2026-10-05).
//
// Usage (from the repo root):
//   node .planning/phases/03.7-.../03.7-print-probe.mjs baseline   write 03.7-table-baseline.json
//   node .planning/phases/03.7-.../03.7-print-probe.mjs screen     compare the screen with that file (DIFF lines, exit 1)
//   node .planning/phases/03.7-.../03.7-print-probe.mjs print [P1 P2 ...]
//
// The build is read from PROBE_DIST (default app/dist). Pass a scratch
// --outDir build there so Mark's own `vite preview --host` on :4173, which
// serves app/dist, is never disturbed.
//
// Isolation (T-03.7-03): the app and the sketch boards are served on
// ephemeral 127.0.0.1 ports through the 03.5 harness, and every request to
// another host is aborted in every context this file opens, the static print
// page included. Nothing here contacts :4173 or the sketch server on :8077.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, APP_ROUTE, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE = path.join(HERE, '03.7-table-baseline.json');
const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');

const WIDTHS = [393, 723, 724, 1024, 1366];
const ROUTES = {
  'olive-oil-v1': APP_ROUTE,
  'mexican-chocolate-v3': '/notebook/mexican-chocolate/mexican-chocolate-v3',
  'standard-base-v2': '/notebook/standard-base/standard-base-v2',
};

// ---------------------------------------------------------------------------
// The screen: every tr of the table, as boxes.
// ---------------------------------------------------------------------------
function readTableBoxes() {
  const table = document.querySelector('.ingredient-table');
  if (!table) return null;
  const t = table.getBoundingClientRect();
  return {
    tableHeight: t.height,
    rows: [...table.querySelectorAll('tr')].map((tr) => {
      const r = tr.getBoundingClientRect();
      const cs = getComputedStyle(tr);
      return {
        height: r.height,
        top: r.top - t.top,
        borderWidth: cs.borderBottomWidth,
        borderStyle: cs.borderBottomStyle,
      };
    }),
  };
}

async function readScreen() {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const out = {};
  try {
    const chrome = await launch();
    const safari = await webkit.launch();
    try {
      for (const [engine, browser] of [['webkit', safari], ['chrome', chrome]]) {
        for (const [name, route] of Object.entries(ROUTES)) {
          for (const width of WIDTHS) {
            const { context, page } = await openApp(browser, appUrl, route, { width, coarse: true });
            await page.waitForSelector('.ingredient-table');
            out[`${engine}|${name}|${width}`] = await page.evaluate(readTableBoxes);
            await context.close();
          }
        }
      }
    } finally {
      await chrome.close();
      await safari.close();
    }
  } finally {
    await close();
  }
  return out;
}

function compareScreen(base, now) {
  const diffs = [];
  for (const key of Object.keys(base)) {
    const a = base[key];
    const b = now[key];
    if (!b) { diffs.push(`DIFF ${key}: not read`); continue; }
    if (a.rows.length !== b.rows.length) { diffs.push(`DIFF ${key}: ${a.rows.length} rows before, ${b.rows.length} after`); continue; }
    if (Math.abs(a.tableHeight - b.tableHeight) > 0.5) diffs.push(`DIFF ${key}: table height ${a.tableHeight} -> ${b.tableHeight}`);
    a.rows.forEach((row, i) => {
      const n = b.rows[i];
      if (Math.abs(row.height - n.height) > 0.5) diffs.push(`DIFF ${key} row ${i}: height ${row.height} -> ${n.height}`);
      if (Math.abs(row.top - n.top) > 0.5) diffs.push(`DIFF ${key} row ${i}: top ${row.top} -> ${n.top}`);
      if (row.borderWidth !== n.borderWidth) diffs.push(`DIFF ${key} row ${i}: border width ${row.borderWidth} -> ${n.borderWidth}`);
      if (row.borderStyle !== n.borderStyle) diffs.push(`DIFF ${key} row ${i}: border style ${row.borderStyle} -> ${n.borderStyle}`);
    });
  }
  return diffs;
}

// ---------------------------------------------------------------------------
// Print. The board's conditions (before-you-start-print-break.html; its
// generator .planning/canvas-generators/breaks.py `parts`, with bys.py
// PRINT_CSS) are reproduced here, not edited: the live Sheet's markup is
// captured from the build, what the board removed is removed (the batch
// layer, the side column, the pen foot), and the result is printed by Chrome
// on a letter page (816 x 1056, margins 48 / 56 / 40) with the build's own
// stylesheets. The app's own print rules are never injected: they come from
// the build. WebKit cannot print to PDF, so print is Chrome only.
// ---------------------------------------------------------------------------
const LETTER = { width: '816px', height: '1056px', margin: { top: '48px', right: '56px', bottom: '40px', left: '56px' }, printBackground: true };

// What bys.py PRINT_CSS draws around the page (the article a flex column with
// --gap-l, no padding, controls hidden, the acts hidden, the notes' measure),
// unscoped and without the .pp page box, which page.pdf's margins replace.
const DRAWING_CSS = `
html, body { margin: 0; background: #fff; }
body { color: var(--sheet-ink); --sheet-ground: #fff; --sheet-bookcloth: var(--sheet-ink); }
article.recipe-page { display: flex; flex-direction: column; gap: var(--gap-l); padding: 0; background: transparent; margin: 0; }
.text-control, button, .history-disclosure, .table-small-print { display: none; }
.method-step__acts { display: none; }
.before-region { max-width: var(--measure-prose); }
`;

// Runs in the live page. breaks.py `parts`: no As made header cell or cell,
// colspan 4 -> 3, no hand, no skipped label, no struck prose; plus what the
// board's article never held (the side column, the pen foot).
function captureSheet({ beforeHtml, times, noBefore }) {
  const article = document.querySelector('article.recipe-page').cloneNode(true);
  article.querySelectorAll('.side-region, .pen-foot').forEach((e) => e.remove());
  [...article.querySelectorAll('thead th')].filter((th) => th.textContent.trim() === 'As made').forEach((th) => th.remove());
  article.querySelectorAll('tr').forEach((tr) => {
    const tds = [...tr.children].filter((c) => c.tagName === 'TD');
    if (tds.length === 4) tds[2].remove();
  });
  article.querySelectorAll('td[colspan="4"]').forEach((td) => td.setAttribute('colspan', '3'));
  article.querySelectorAll('.sheet-hand, .method-step__skipped-label').forEach((e) => e.remove());
  article.querySelectorAll('.method-step__prose--struck').forEach((e) => e.classList.replace('method-step__prose--struck', 'method-step__prose'));
  article.querySelectorAll('li.method-step').forEach((li) => li.setAttribute('data-s', li.id.replace('method-step-', '')));
  if (noBefore || beforeHtml) article.querySelectorAll('.before-region').forEach((e) => e.remove());
  if (beforeHtml) {
    const holder = document.createElement('div');
    holder.innerHTML = beforeHtml;
    const section = holder.firstElementChild;
    const ul = section.querySelector('ul');
    ul.innerHTML = ul.innerHTML.repeat(times ?? 1);
    article.insertBefore(section, article.querySelector('.ingredient-table-region'));
  }
  return {
    article: article.outerHTML,
    before: article.querySelector('.before-region')?.outerHTML ?? null,
    head: [...document.head.querySelectorAll('link[rel="stylesheet"], style')].map((e) => e.outerHTML).join('\n'),
  };
}

async function captureFrom(browser, appUrl, route, opts = {}) {
  const { context, page } = await openApp(browser, appUrl, route, { width: 816 });
  await page.waitForSelector('article.recipe-page .ingredient-table');
  const out = await page.evaluate(captureSheet, opts);
  await context.close();
  return out;
}

// A context for the static page: every request to another host is aborted
// (T-03.7-03); /__print.html is the captured Sheet; the rest is the build.
async function openStatic(browser, appUrl, { article, head }, { extraCss = '', viewport } = {}) {
  const context = await browser.newContext(viewport ? { viewport } : {});
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (url.pathname === '/__print.html') {
      return route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>print</title>${head}<style>${DRAWING_CSS}${extraCss}</style></head><body>${article}</body></html>`,
      });
    }
    return route.continue();
  });
  const page = await context.newPage();
  await page.goto(`${appUrl}/__print.html`, { waitUntil: 'networkidle' });
  return { context, page };
}

// T-03.7-04: compile only the tracked pdf-pages.swift into the OS temp dir,
// once per run; run it only on PDFs this run wrote; paths as arguments.
let readerBin = null;
let workDir = null;
async function pdfReader() {
  if (readerBin) return readerBin;
  workDir = await mkdtemp(path.join(os.tmpdir(), '03.7-print-'));
  readerBin = path.join(workDir, 'pdf-pages');
  execFileSync('swiftc', ['-O', path.join(REPO_ROOT, '.planning', 'canvas-generators', 'pdf-pages.swift'), '-o', readerBin], { stdio: 'pipe' });
  return readerBin;
}

async function printPages(page, name, pdfOptions) {
  const bin = await pdfReader();
  const file = path.join(workDir, `${name}.pdf`);
  await writeFile(file, await page.pdf(pdfOptions));
  const out = execFileSync(bin, [file, 'all'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  return out.split(/^--- page \d+ : ?/m).slice(1).map((t) => t.replace(/\n$/, ''));
}

// Comparable text: pipes (the reader's line breaks) and punctuation to
// single spaces, lower case.
const norm = (t) => t.replace(/[|\n]/g, ' ').toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim();

// What a board panel holds: ingredient names and step heads in order, and
// the Instructions' steps.
async function readPanel(page, pid) {
  return page.evaluate((id) => {
    const panel = document.querySelector(`[data-pid="${id}"]`);
    if (!panel) return null;
    const rows = [...panel.querySelectorAll('tr[data-r]')].map((tr) => {
      if (tr.classList.contains('ingredient-table__step-head')) return { kind: 'head', text: tr.textContent.trim().match(/^Step \d+/)?.[0] ?? tr.textContent.trim() };
      if (tr.getAttribute('data-r') === 'total') return { kind: 'total' };
      return { kind: 'row', text: tr.querySelector('.ingredient-table__col-name').firstChild.textContent.trim() };
    });
    const steps = [...panel.querySelectorAll('li[data-s]')].map((li) => ({ n: Number(li.getAttribute('data-s')) }));
    return { rows, steps, hasHeader: Boolean(panel.querySelector('thead')), heading: panel.querySelector('.ingredient-table-region .region-name')?.textContent ?? null };
  }, pid);
}

// Per step of the captured Sheet: its lead-in and the last ten characters of
// its instruction, to find on one page.
async function readSteps(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('li[data-s]')].map((li) => {
      const lead = li.querySelector('.method-step__lead');
      const text = lead.textContent.trim();
      return { n: Number(li.getAttribute('data-s')), lead: lead.querySelector('b')?.textContent ?? text.slice(0, 20), tail: text.slice(-10) };
    }),
  );
}

function makeChecker(label) {
  const failures = [];
  let passed = 0;
  return {
    ok(cond, what) {
      if (cond) { passed += 1; console.log(`PASS ${label}: ${what}`); } else { failures.push(what); console.log(`FAIL ${label}: ${what}`); }
    },
    done() { return failures.length; },
  };
}

function showPages(label, pages) {
  pages.forEach((t, i) => {
    const flat = t.replace(/\s+/g, ' ');
    console.log(`  ${label} page ${i + 1}: first 120 [${flat.slice(0, 120)}] last 120 [${flat.slice(-120)}]`);
  });
}

const indexIn = (pages, i, words) => norm(pages[i] ?? '').indexOf(norm(words));
const onPage = (pages, i, words) => indexIn(pages, i, words) >= 0;
const pageOf = (pages, words) => pages.findIndex((_, i) => onPage(pages, i, words));
const countIn = (pages, words) => pages.reduce((n, _, i) => n + (norm(pages[i]).split(norm(words)).length - 1), 0);
const HEADER = /ingredient\s*%\s*of\s*batch/;
const headerAt = (pages, i) => norm(pages[i] ?? '').search(HEADER);

const CASES = {};

// P1: Olive Oil v1 under the board's conditions: Before you start opens the
// formula page above the table; page 1 ends after Step 6 (Allulose); page 2
// opens with the repeated header, then Step 8 whole and the Total (panels
// fp-o-p1 and fp-o-p2k1; decision 45, Mark's answer 2: the header alone).
CASES.P1 = async ({ chrome, appUrl, board }) => {
  const c = makeChecker('P1');
  const sheet = await captureFrom(chrome, appUrl, APP_ROUTE);
  const { context, page } = await openStatic(chrome, appUrl, sheet);
  const pages = await printPages(page, 'P1', LETTER);
  await context.close();
  showPages('P1', pages);
  const p1 = await readPanel(board, 'o-p1');
  const p2 = await readPanel(board, 'o-p2k1');
  const names1 = p1.rows.filter((r) => r.kind === 'row').map((r) => r.text);
  const names2 = p2.rows.filter((r) => r.kind === 'row').map((r) => r.text);
  c.ok(pages.length >= 2, `the Sheet prints on at least two pages (got ${pages.length})`);
  const bys = indexIn(pages, 0, 'Before you start');
  const note1 = indexIn(pages, 0, 'Taste the Graza straight. Polyphenols');
  const note2 = indexIn(pages, 0, 'Check the cream s actual butterfat');
  const ingr = norm(pages[0]).indexOf('ingredients', Math.max(bys, note2));
  c.ok(bys >= 0 && note1 > bys && note2 > note1 && ingr > note2, `page 1: BEFORE YOU START, both notes, then INGREDIENTS (at ${bys}, ${note1}, ${note2}, ${ingr})`);
  c.ok(names1.every((n) => onPage(pages, 0, n)), `page 1 holds fp-o-p1's rows (${names1.join(', ')})`);
  c.ok(['Step 2', 'Step 3', 'Step 6'].every((s) => onPage(pages, 0, s)), 'page 1 holds Steps 2, 3 and 6');
  c.ok(!onPage(pages, 0, 'Step 8'), 'page 1 does not hold Step 8');
  c.ok(names1.at(-1) === 'Allulose', `fp-o-p1 ends with Allulose (reads ${names1.at(-1)})`);
  const h = headerAt(pages, 1);
  const s8 = indexIn(pages, 1, 'Step 8');
  c.ok(h >= 0 && s8 > h, `page 2 opens with the repeated header, then Step 8 (header at ${h}, Step 8 at ${s8})`);
  c.ok(h >= 0 && h < 40, `the header is the first thing on page 2 (at ${h})`);
  c.ok(names2.every((n) => onPage(pages, 1, n)), `page 2 holds fp-o-p2k1's rows (${names2.join(', ')})`);
  c.ok(!onPage(pages, 1, 'Ingredients continued'), 'page 2 carries no "Ingredients, continued"');
  c.ok(countIn(pages, 'Total') === 1 && pageOf(pages, 'Total') === 1, `Total occurs once in the PDF, on page 2 (once: ${countIn(pages, 'Total')}, on page ${pageOf(pages, 'Total') + 1})`);
  return c.done();
};

// ---------------------------------------------------------------------------
async function runPrint(cases) {
  const { appUrl, repoUrl, close } = await startServers({ appRoot: DIST });
  const chrome = await launch();
  let failed = 0;
  try {
    const { context: boardContext, page: board } = await openBoard(chrome, repoUrl, 'before-you-start-print-break.html');
    for (const name of cases) {
      if (!CASES[name]) { console.log(`FAIL ${name}: no such case`); failed += 1; continue; }
      failed += await CASES[name]({ chrome, appUrl, board });
    }
    await boardContext.close();
  } finally {
    await chrome.close();
    await close();
  }
  console.log(failed === 0 ? `print: ${cases.join(', ')} passed` : `print: ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
const mode = process.argv[2];
if (mode === 'baseline') {
  const out = await readScreen();
  await writeFile(BASELINE, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`baseline: ${Object.keys(out).length} readings written to ${path.relative(REPO_ROOT, BASELINE)}`);
} else if (mode === 'screen') {
  const base = JSON.parse(await readFile(BASELINE, 'utf8'));
  const diffs = compareScreen(base, await readScreen());
  for (const d of diffs) console.log(d);
  if (diffs.length > 0) {
    console.log(`screen: ${diffs.length} differences`);
    process.exitCode = 1;
  } else {
    console.log(`screen: ${Object.keys(base).length} readings equal to the baseline`);
  }
} else if (mode === 'print') {
  const asked = process.argv.slice(3);
  await runPrint(asked.length > 0 ? asked : Object.keys(CASES));
} else {
  console.error('Usage: node 03.7-print-probe.mjs baseline | screen | print [cases]');
  process.exit(1);
}
