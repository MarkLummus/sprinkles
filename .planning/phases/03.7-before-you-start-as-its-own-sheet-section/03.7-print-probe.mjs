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

const MEXICAN = '/notebook/mexican-chocolate/mexican-chocolate-v3';
const STANDARD = '/notebook/standard-base/standard-base-v2';

// The two seeded notes of Olive Oil v1 are the only notes the app holds, so
// the board constructed the other cases from them (breaks.py more_notes):
// Olive Oil v1's section, its notes repeated `times` times, set above
// another version's Ingredients.
async function mexicanWithNotes(chrome, appUrl, times) {
  const olive = await captureFrom(chrome, appUrl, APP_ROUTE);
  return captureFrom(chrome, appUrl, MEXICAN, { beforeHtml: olive.before, times });
}

// A box's top and bottom from the article's top, in the page's own layout.
async function boxesOf(page, selectors) {
  return page.evaluate((sels) => {
    const top = document.querySelector('article.recipe-page').getBoundingClientRect().top;
    const read = (sel) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      return { top: r.top - top, bottom: r.bottom - top };
    };
    return Object.fromEntries(Object.entries(sels).map(([k, sel]) => [k, read(sel)]));
  }, selectors);
}

// Inserts an empty block above the Ingredients, `height` px tall.
async function insertSpacer(page, height) {
  await page.evaluate((h) => {
    const div = document.createElement('div');
    div.id = 'probe-spacer';
    div.style.height = `${h}px`;
    document.querySelector('.ingredient-table-region').before(div);
  }, height);
}

const CONTENT_FOOT = 968; // 1056 - 48 - 40

// P1-K1 (Mark's answer 1): the Instructions follow the table's tail on the
// same page, whole steps only. Olive Oil v1: page 2 carries the Total and
// steps 1 to 7, page 3 steps 8 to 10, as fp-o-p2k1 draws them.
CASES['P1-K1'] = async ({ chrome, appUrl, board }) => {
  const c = makeChecker('P1-K1');
  const sheet = await captureFrom(chrome, appUrl, APP_ROUTE);
  const { context, page } = await openStatic(chrome, appUrl, sheet);
  const steps = await readSteps(page);
  const pages = await printPages(page, 'P1-K1', LETTER);
  await context.close();
  showPages('P1-K1', pages);
  const onSecond = new Set((await readPanel(board, 'o-p2k1')).steps.map((st) => st.n));
  const tot = indexIn(pages, 1, 'Total');
  const ins = indexIn(pages, 1, 'Instructions');
  c.ok(tot >= 0 && ins > tot, `page 2: the Total (at ${tot}), then INSTRUCTIONS (at ${ins})`);
  c.ok(pages.length === 3, `Olive Oil v1 prints on three pages (got ${pages.length})`);
  c.ok([...onSecond].join() === '1,2,3,4,5,6,7', `fp-o-p2k1 holds steps ${[...onSecond].join(', ')}`);
  // The table's step heads read the same words as the steps' lead-ins, so a step is looked for
  // in the Instructions only: the text after the heading on its page, the whole of later pages.
  const instrFrom = pages.findIndex((t) => norm(t).includes('instructions'));
  const instr = pages.map((t, i) => (i < instrFrom ? '' : i === instrFrom ? norm(t).slice(norm(t).indexOf('instructions')) : norm(t)));
  const instrPage = (words) => instr.findIndex((t) => t.includes(norm(words)));
  for (const st of steps) {
    const want = onSecond.has(st.n) ? 1 : 2;
    const leadPage = instrPage(`${st.n} ${st.lead}`);
    const tailPage = instrPage(st.tail);
    c.ok(leadPage === want && tailPage === want, `step ${st.n}: lead-in and last ten characters both on page ${want + 1} (lead on ${leadPage + 1}, tail on ${tailPage + 1})`);
  }
  const first = steps.find((st) => !onSecond.has(st.n));
  c.ok(first && norm(pages[2] ?? '').startsWith(norm(`${first.n} ${first.lead}`)), `page 3 starts with step ${first?.n}`);
  return c.done();
};

// P2 (Mark's answer 3): a one-step table that does not fit splits between
// rows, the header repeating over the rows that run on. Mexican Chocolate v3
// with Olive Oil v1's two notes three times, as breaks.py constructs it;
// panels fp-e-s1 and fp-e-s2.
CASES.P2 = async ({ chrome, appUrl, board }) => {
  const c = makeChecker('P2');
  const sheet = await mexicanWithNotes(chrome, appUrl, 3);
  const { context, page } = await openStatic(chrome, appUrl, sheet);
  const pages = await printPages(page, 'P2', LETTER);
  await context.close();
  showPages('P2', pages);
  const s1 = await readPanel(board, 'e-s1');
  const s2 = await readPanel(board, 'e-s2');
  const rows1 = s1.rows.filter((r) => r.kind === 'row').map((r) => r.text);
  const rows2 = s2.rows.filter((r) => r.kind === 'row').map((r) => r.text);
  const bys = indexIn(pages, 0, 'Before you start');
  const ingr = norm(pages[0]).indexOf('ingredients', bys);
  const h0 = headerAt(pages, 0);
  const st1 = indexIn(pages, 0, 'Step 1');
  c.ok(bys >= 0 && ingr > bys && h0 > ingr && st1 > h0, `page 1: Before you start, INGREDIENTS, the header, STEP 1, in that order (${bys}, ${ingr}, ${h0}, ${st1})`);
  // The rows' order is read in sequence, so two rows of one name stay distinct.
  const inSequence = (pg, names) => {
    let cursor = Math.max(0, indexIn(pages, pg, 'Step 1'));
    const text = norm(pages[pg] ?? '');
    return names.every((n) => { const at = text.indexOf(norm(n), cursor); cursor = at + 1; return at >= 0; });
  };
  c.ok(inSequence(0, rows1), `page 1 holds exactly fp-e-s1's ${rows1.length} rows, in order (${rows1.join(', ')})`);
  c.ok(pages.length >= 2, `the table runs on to a second page (${pages.length} pages)`);
  const h1 = headerAt(pages, 1);
  c.ok(h1 >= 0 && h1 < 40, `page 2 opens with the repeated header (at ${h1})`);
  c.ok(inSequence(1, rows2), `page 2 holds fp-e-s2's ${rows2.length} rows, in order (${rows2.join(', ')})`);
  c.ok(onPage(pages, 1, 'Total') && countIn(pages, 'Total') === 1, 'Total occurs once, on page 2');
  c.ok(!onPage(pages, 1, 'Step 1 '), 'page 2 carries no step head: the rows that run on sit under the repeated header alone');
  return c.done();
};

// P3 (fp-m-p1): a table that fits prints whole, its header once.
CASES.P3 = async ({ chrome, appUrl, board }) => {
  const c = makeChecker('P3');
  const sheet = await mexicanWithNotes(chrome, appUrl, 1);
  const { context, page } = await openStatic(chrome, appUrl, sheet);
  const pages = await printPages(page, 'P3', LETTER);
  await context.close();
  showPages('P3', pages);
  const panel = await readPanel(board, 'm-p1');
  const names = panel.rows.filter((r) => r.kind === 'row').map((r) => r.text);
  c.ok(onPage(pages, 0, 'Before you start'), 'page 1 holds Before you start');
  c.ok(names.every((n) => onPage(pages, 0, n)), `page 1 holds the whole table (${names.length} rows)`);
  c.ok(pageOf(pages, 'Total') === 0 && countIn(pages, 'Total') === 1, 'Total occurs once, on page 1');
  const all = norm(pages.join(' '));
  c.ok((all.match(/ingredient\s*%\s*of\s*batch/g) ?? []).length === 1, 'the header prints once in the PDF');
  return c.done();
};

// P4: a flat table (Standard Base v2, no step heads, no notes).
CASES.P4 = async ({ chrome, appUrl }) => {
  const c = makeChecker('P4');
  const sheet = await captureFrom(chrome, appUrl, STANDARD);
  const { context, page } = await openStatic(chrome, appUrl, sheet);
  const heads = await page.evaluate(() => document.querySelectorAll('.ingredient-table__step-head').length);
  const bodies = await page.evaluate(() => document.querySelectorAll('.ingredient-table tbody').length);
  const pages = await printPages(page, 'P4', LETTER);
  await context.close();
  showPages('P4', pages);
  const text = norm(pages[0]);
  const h = text.search(HEADER);
  const total = text.indexOf('total', h);
  c.ok(heads === 0 && bodies === 1, `the table is one tbody with no step head (${bodies} tbody, ${heads} heads)`);
  c.ok(h >= 0 && total > h, `the table and its Total are on page 1 (header at ${h}, Total at ${total})`);
  c.ok(!/step \d/.test(text.slice(h, total)), 'no STEP in the table');
  c.ok(countIn(pages, 'Total') === 1, 'Total occurs once');
  return c.done();
};

// P5: the Total at the edge. Olive Oil v1 without its Before you start (the
// formula fits, decision 36's PA panel), a spacer above the Ingredients that
// puts the Total's middle on the page's content foot while Step 8's last row
// stays above it. Expected: the Total goes to page 2 with Step 8, never on
// page 1 alone and never on page 2 without Step 8.
CASES.P5 = async ({ chrome, appUrl }) => {
  const c = makeChecker('P5');
  const sheet = await captureFrom(chrome, appUrl, APP_ROUTE, { noBefore: true });
  const { context, page } = await openStatic(chrome, appUrl, sheet, { viewport: { width: 704, height: 1056 } });
  await page.emulateMedia({ media: 'print' });
  const sels = { total: '.ingredient-table tfoot tr', last: '.ingredient-table tbody:last-of-type tr:last-child', step8: '.ingredient-table tbody:last-of-type tr:first-child' };
  await insertSpacer(page, 0);
  const before = await boxesOf(page, sels);
  const mid = (before.total.top + before.total.bottom) / 2;
  const need = CONTENT_FOOT - mid;
  await page.evaluate((h) => { document.getElementById('probe-spacer').style.height = `${h}px`; }, need);
  const after = await boxesOf(page, sels);
  const midAfter = (after.total.top + after.total.bottom) / 2;
  console.log(`  P5: Total ${after.total.top.toFixed(1)}-${after.total.bottom.toFixed(1)} (middle ${midAfter.toFixed(1)}), Step 8's last row ends ${after.last.bottom.toFixed(1)}, content foot ${CONTENT_FOOT}`);
  c.ok(Math.abs(midAfter - CONTENT_FOOT) < 1 && after.last.bottom < CONTENT_FOOT, 'the constructed edge: the Total straddles the foot, Step 8\'s last row stays above it');
  const pages = await printPages(page, 'P5', LETTER);
  await context.close();
  showPages('P5', pages);
  const totalPage = pageOf(pages, 'Total');
  const step8Page = pageOf(pages, 'Step 8');
  c.ok(countIn(pages, 'Total') === 1, 'Total occurs once');
  c.ok(totalPage === 1 && step8Page === 1, `the Total and Step 8 are together on page 2 (Total on ${totalPage + 1}, Step 8 on ${step8Page + 1})`);
  return c.done();
};

// P7: a region heading never stands alone at a page foot. Olive Oil v1
// without its Before you start, a spacer that leaves the Ingredients heading
// fitting at the foot with nothing of the table after it.
CASES.P7 = async ({ chrome, appUrl }) => {
  const c = makeChecker('P7');
  const sheet = await captureFrom(chrome, appUrl, APP_ROUTE, { noBefore: true });
  const { context, page } = await openStatic(chrome, appUrl, sheet, { viewport: { width: 704, height: 1056 } });
  await page.emulateMedia({ media: 'print' });
  await insertSpacer(page, 0);
  const sels = { heading: '.ingredient-table-region .region-name' };
  const before = await boxesOf(page, sels);
  const need = CONTENT_FOOT - 10 - before.heading.bottom;
  await page.evaluate((h) => { document.getElementById('probe-spacer').style.height = `${h}px`; }, need);
  const after = await boxesOf(page, sels);
  console.log(`  P7: the heading ends ${after.heading.bottom.toFixed(1)} of ${CONTENT_FOOT}`);
  c.ok(after.heading.bottom < CONTENT_FOOT && after.heading.bottom > CONTENT_FOOT - 20, 'the constructed edge: the heading fits at the foot');
  const pages = await printPages(page, 'P7', LETTER);
  await context.close();
  showPages('P7', pages);
  c.ok(!onPage(pages, 0, 'Ingredients') || onPage(pages, 0, 'Step 2'), 'the Ingredients heading is not alone at the foot of page 1');
  c.ok(onPage(pages, 1, 'Ingredients') && indexIn(pages, 1, 'Step 2') > indexIn(pages, 1, 'Ingredients'), 'the heading opens page 2, over the table');
  return c.done();
};

// P6: the route as it prints today, nothing removed or injected, Chrome's
// default margins. Asserts only the rule and writes every page's text out
// for plan 03's record.
CASES.P6 = async ({ chrome, appUrl }) => {
  const c = makeChecker('P6');
  const { context, page } = await openApp(chrome, appUrl, APP_ROUTE, { width: 816 });
  await page.waitForSelector('.ingredient-table');
  const groups = await page.evaluate(() =>
    [...document.querySelectorAll('.ingredient-table tbody')].map((body) => ({
      head: [...(body.querySelector('.ingredient-table__step-head td')?.childNodes ?? [])].map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim(),
      rows: [...body.querySelectorAll('tr:not(.ingredient-table__step-head)')].map((tr) => tr.querySelector('.ingredient-table__col-name').firstChild.textContent.trim()),
    })),
  );
  const pages = await printPages(page, 'P6', { format: 'Letter', margin: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' }, printBackground: true });
  await context.close();
  pages.forEach((t, i) => console.log(`  P6 page ${i + 1}: ${t.replace(/\s+/g, ' ')}`));
  const texts = pages.map((t) => norm(t));
  groups.forEach((g, k) => {
    const headWords = norm(g.head);
    const at = texts.findIndex((t) => t.includes(headWords));
    if (at < 0) { c.ok(false, `${g.head}: found in the PDF`); return; }
    const next = groups[k + 1] ? norm(groups[k + 1].head) : null;
    const nextAt = next ? texts[at].indexOf(next) : -1;
    const start = texts[at].indexOf(headWords);
    const segment = texts[at].slice(start, nextAt > start ? nextAt : undefined);
    let cursor = 0;
    const whole = g.rows.every((n) => { const i = segment.indexOf(norm(n), cursor); cursor = i + 1; return i >= 0; });
    c.ok(whole, `${g.head.slice(0, 30)}: its head and all ${g.rows.length} rows on page ${at + 1}`);
  });
  const firstHead = texts.findIndex((t) => t.includes(norm(groups[0].head)));
  texts.forEach((t, i) => {
    if (i <= firstHead) return;
    const firstGroupHere = Math.min(...groups.map((g) => t.indexOf(norm(g.head))).filter((x) => x >= 0));
    if (!Number.isFinite(firstGroupHere)) return;
    const h = t.search(HEADER);
    c.ok(h >= 0 && h < firstGroupHere, `page ${i + 1} continues the table: the header's words come before its first step head`);
  });
  texts.forEach((t, i) => {
    const last = ['ingredients', 'instructions', 'before you start'].find((h) => t.endsWith(h));
    c.ok(!last, `page ${i + 1} does not end on a region heading${last ? ` (ends on ${last})` : ''}`);
  });
  c.ok(countIn(pages, 'Total') >= 1 && texts.filter((t) => /\btotal\b/.test(t)).length >= 1, 'Total occurs');
  c.ok((pages.join(' ').match(/\b799\.7 g Total\b/g) ?? []).length === 1, 'the table Total prints once');
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
