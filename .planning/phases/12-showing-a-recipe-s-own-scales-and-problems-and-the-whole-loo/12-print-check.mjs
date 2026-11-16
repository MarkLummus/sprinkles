// 12-02: the printed log pages of the BUILT print route, in Playwright WebKit (TASTE-04's printed
// half, LOG-01; 12-CONTEXT D-01 as amended, D-15, D-16, D-17; sketch 015 CONTRACT section 3).
//
//   PROBE_DIST=<dist> node 12-print-check.mjs <facet...>
//   facets: rows   scale rows under print media: a Low to high row has nothing under its ticks,
//                  every row is 36 px, the problems row, no 'Every recipe' / 'This recipe only'
//           drop   the log pages' top padding (144 px on screen; 90 px in print) and the sheet
//                  pages' (48 px; 0 px)
//           lines  13 notes lines on the Batch log and 4 on the Tasting log
//           fit    each log page's need (body, foot gap, foot) at Safari's 630 px and Chrome's
//                  672 px content width, against 810 and 864 px; prints the spare
//           worst  the long-words case: the longest words the creation editor saves (names of 16
//                  characters, end words of 12, problems of 40; Mark's limits, 2026-11-16, quick
//                  261116-80u). It decides PASS or FAIL: the Tasting log fits one page at both
//                  widths, every scale row is 36 px tall (each name on one line), and each own
//                  scale's low word starts at or right of its name column's edge. It also REPORTs
//                  the need, spare, row heights and how far each end word runs past its column
//
// Prints "PASS <facet> <check>", "FAIL <facet> <check>: <values>" or "REPORT <facet> <fact>" and
// exits 1 on any FAIL. Each facet runs in its own new browser context and arrives at its case
// afresh, so no emulated media and no inline style one facet sets can reach another.
//
// The script reads the build from PROBE_DIST and NEVER builds or writes it; it serves that folder
// (never app/dist, which Mark's own `vite preview --host` serves) on an ephemeral 127.0.0.1 port
// through 08-walk-server.mjs, and every request to another host is aborted. Build to a scratch
// folder first, outside this script:
//   npm --prefix app run build -- --outDir "$TMPDIR/sprinkles-12/dist-x" --emptyOutDir
//
// The sketch 015 example recipes, and how the app is brought to them, come from 12-cases.mjs.
// Every query is scoped to `.print-route__pages`, never the hidden `.ps-measure` copy.
//
// DEVICE-UNVERIFIED: this is Playwright WebKit, not the iPad's print. The fit facet measures the
// way .planning/canvas-generators/p12-capture.mjs printFacts does, under SCREEN media (the README's
// Measured figures come from that measure); 12-05's PDF is the print-engine proof, and Mark's paper
// check on the iPad (D-13) the device one. Everything typed is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { arrive } from './12-cases.mjs';
import { existsSync } from 'node:fs';
import path from 'node:path';

// playwright-core: the one place this script names a Playwright path. Override it with
// PLAYWRIGHT_CORE; refill the default with `npx -y playwright-core@1.63.0 --version`.
const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

// No default: this script must never fall back to app/dist.
if (!process.env.PROBE_DIST) {
  console.log('FAIL PROBE_DIST is not set: build to a scratch folder and pass it (this script never serves app/dist)');
  process.exit(1);
}
// path.resolve drops the doubled slash a TMPDIR with a trailing slash leaves; the static server
// compares paths with startsWith and would answer every request with 404.
const DIST = path.resolve(process.env.PROBE_DIST);
if (!existsSync(path.join(DIST, 'index.html'))) {
  console.log(`FAIL no index.html in PROBE_DIST ${DIST}`);
  process.exit(1);
}

const FIXED_TIME = new Date('2026-08-04T12:00:00');
const PAGES = '.print-route__pages';
const LOG = `${PAGES} .print-page--log`;
const SHEET = `${PAGES} .print-page--sheet`;
const ROW_H = 36; // every scale row, px (CONTRACT section 3)
const ROW_TOLERANCE = 0.5;
// The room each engine leaves a log page: its content height less the clipboard drop (D-15, D-17).
const SAFARI = { name: 'safari', width: 630, limit: 810 }; // 900 less 90
const CHROME = { name: 'chrome', width: 672, limit: 864 }; // 960 less 96

// A context per facet: WebKit at 1366 by 1024 with touch, a fixed clock (timers keep running),
// every request not to 127.0.0.1 aborted.
async function newContext(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  await context.clock.setFixedTime(FIXED_TIME);
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
  return context;
}

// A new context at a case's print route, the Sheet's pages laid. Returns { context, page }; the
// caller closes the context in a finally.
async function openPrint(browser, appUrl, caseKey) {
  const context = await newContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const c = await arrive(page, appUrl, caseKey);
  await page.goto(`${appUrl}${c.route}/print`, { waitUntil: 'load' });
  await page.waitForSelector('.print-route[data-print-ready="true"]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return { context, page };
}

const pass = (facet, name) => ({ kind: 'PASS', facet, text: name });
const fail = (facet, name, values) => ({ kind: 'FAIL', facet, text: `${name}: ${values}` });
const report = (facet, text) => ({ kind: 'REPORT', facet, text });
const check = (facet, name, ok, values) => (ok ? pass(facet, name) : fail(facet, name, values));
const same = (facet, name, got, want) =>
  check(facet, name, got.length === want.length && got.every((x, i) => x === want[i]), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

// ---------------------------------------------------------------------------
// Facet rows: the Tasting log's scale rows under print media.
// ---------------------------------------------------------------------------
// Reads the Tasting log's rows: every .lf-srow with its name, height, the text of each word, the
// tick counts and whether it holds an .lf-mid; the problems row's words; both pages' text.
function readRows(log) {
  const pages = [...document.querySelectorAll(log)];
  const tasting = pages.find((p) => p.querySelector('.lf-title')?.textContent === 'Tasting log');
  const textOf = (row, sel) => row.querySelector(sel)?.textContent ?? null;
  return {
    pageTexts: pages.map((p) => p.textContent),
    rows: [...tasting.querySelectorAll('.lf-srow')].map((row) => ({
      name: row.querySelector('.axis-mark__name').textContent,
      h: row.getBoundingClientRect().height,
      lo: textOf(row, '.lf-lo'),
      n1: textOf(row, '.lf-n1'),
      n5: textOf(row, '.lf-n5'),
      hi: textOf(row, '.lf-hi'),
      mid: textOf(row, '.lf-mid'),
      hasMid: row.querySelector('.lf-mid') !== null,
      ticks: row.querySelectorAll('.lf-tick').length,
    })),
    problems: [...tasting.querySelectorAll('.lf-mrow--plain .lf-opt')].map((o) => o.textContent),
  };
}

async function collectRows(browser, appUrl) {
  const out = [];
  const f = 'rows';
  const { context, page } = await openPrint(browser, appUrl, 'two');
  try {
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);
    const r = await page.evaluate(readRows, LOG);
    out.push(
      same(f, 'case two: six scale rows, the four core then Body then Coffee flavour', r.rows.map((x) => x.name).slice(-2), ['Body', 'Coffee flavour']),
      check(f, 'case two: six scale rows', r.rows.length === 6, `got ${r.rows.length}`),
    );
    const coffee = r.rows.find((x) => x.name === 'Coffee flavour');
    const body = r.rows.find((x) => x.name === 'Body');
    if (!coffee || !body) {
      out.push(fail(f, 'case two: Body and Coffee flavour rows exist', `rows: ${r.rows.map((x) => x.name).join(', ')}`));
    } else {
      out.push(
        check(f, 'Coffee flavour (Low to high): no .lf-mid', !coffee.hasMid, `got .lf-mid ${JSON.stringify(coffee.mid)}`),
        check(
          f,
          'Coffee flavour: faint, 1, 5, strong and five ticks',
          coffee.lo === 'faint' && coffee.n1 === '1' && coffee.n5 === '5' && coffee.hi === 'strong' && coffee.ticks === 5,
          JSON.stringify(coffee),
        ),
        check(f, 'Body (Right in the middle): .lf-mid reads right', body.mid === 'right', `got ${JSON.stringify(body.mid)}`),
      );
    }
    const tall = r.rows.filter((x) => Math.abs(x.h - ROW_H) > ROW_TOLERANCE);
    out.push(check(f, `every scale row is ${ROW_H} px tall (within ${ROW_TOLERANCE} px)`, tall.length === 0, tall.map((x) => `${x.name} ${x.h}`).join('; ')));
    const core = r.rows.slice(0, 4);
    out.push(check(f, 'the four core rows each read right under the middle tick', core.every((x) => x.mid === 'right'), core.map((x) => `${x.name} ${JSON.stringify(x.mid)}`).join('; ')));
    out.push(same(f, 'the problems row: the four core problems then Bitter, Burnt taste', r.problems.slice(4), ['Bitter', 'Burnt taste']));
    out.push(check(f, 'the problems row has six options', r.problems.length === 6, `got ${r.problems.length}: ${JSON.stringify(r.problems)}`));
    const cue = r.pageTexts.filter((t) => t.includes('Every recipe') || t.includes('This recipe only'));
    out.push(check(f, "neither log page prints 'Every recipe' or 'This recipe only'", cue.length === 0, `${cue.length} page(s) do`));
  } finally {
    await context.close();
  }
  const none = await openPrint(browser, appUrl, 'none');
  try {
    await none.page.emulateMedia({ media: 'print' });
    await none.page.waitForTimeout(300);
    const r = await none.page.evaluate(readRows, LOG);
    out.push(
      check(f, 'case none: four scale rows', r.rows.length === 4, `got ${r.rows.length}`),
      check(f, 'case none: each row reads right under the middle tick', r.rows.every((x) => x.mid === 'right'), r.rows.map((x) => `${x.name} ${JSON.stringify(x.mid)}`).join('; ')),
    );
  } finally {
    await none.context.close();
  }
  return out;
}

// ---------------------------------------------------------------------------
// Facet drop: the log pages' top padding, on screen and under print media.
// ---------------------------------------------------------------------------
function readPadding([log, sheet]) {
  const top = (sel) => [...document.querySelectorAll(sel)].map((e) => getComputedStyle(e).paddingTop);
  return { log: top(log), sheet: top(sheet), cls: document.querySelector('.print-route').className };
}

async function collectDrop(browser, appUrl) {
  const out = [];
  const f = 'drop';
  const { context, page } = await openPrint(browser, appUrl, 'two');
  try {
    const screen = await page.evaluate(readPadding, [LOG, SHEET]);
    out.push(
      check(f, 'screen: two log pages, each padding-top 144px (48 + 96)', screen.log.length === 2 && screen.log.every((v) => v === '144px'), JSON.stringify(screen.log)),
      check(f, 'screen: the sheet pages each padding-top 48px', screen.sheet.length > 0 && screen.sheet.every((v) => v === '48px'), JSON.stringify(screen.sheet)),
    );
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);
    const print = await page.evaluate(readPadding, [LOG, SHEET]);
    out.push(
      check(f, 'print: the route carries print-pages--webkit', print.cls.split(/\s+/).includes('print-pages--webkit'), `class ${JSON.stringify(print.cls)}`),
      check(f, 'print: each log page padding-top 90px', print.log.length === 2 && print.log.every((v) => v === '90px'), JSON.stringify(print.log)),
      check(f, 'print: the sheet pages each padding-top 0px', print.sheet.length > 0 && print.sheet.every((v) => v === '0px'), JSON.stringify(print.sheet)),
    );
  } finally {
    await context.close();
  }
  return out;
}

// ---------------------------------------------------------------------------
// Facet lines: the notes lines (D-17).
// ---------------------------------------------------------------------------
async function collectLines(browser, appUrl) {
  const f = 'lines';
  const { context, page } = await openPrint(browser, appUrl, 'two');
  try {
    const got = await page.evaluate((log) => {
      const counts = {};
      for (const p of document.querySelectorAll(log)) counts[p.querySelector('.lf-title').textContent] = p.querySelectorAll('.lf-line').length;
      return counts;
    }, LOG);
    return [
      check(f, 'the Batch log has 13 notes lines', got['Batch log'] === 13, `got ${got['Batch log']}`),
      check(f, 'the Tasting log has 4 notes lines', got['Tasting log'] === 4, `got ${got['Tasting log']}`),
    ];
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// The need of a log page (fit and worst): p12-capture.mjs printFacts, under screen media.
// The page's and its .lf's inline style texts are saved first and put back in a finally, so a
// thrown measure leaves no mutated style behind.
// ---------------------------------------------------------------------------
function measureNeed({ log, title, widths, ownFrom }) {
  const r1 = (n) => Math.round(n * 10) / 10;
  const pg = [...document.querySelectorAll(log)].find((p) => p.querySelector('.lf-title').textContent === title);
  if (!pg) throw new Error(`no log page titled ${title}`);
  const lf = pg.querySelector('.lf');
  const body = lf.querySelector('.lf-body');
  const foot = lf.querySelector('.lf-foot');
  const keep = [pg.style.cssText, lf.style.cssText];
  const out = {};
  try {
    pg.style.transform = 'none';
    pg.style.padding = '0';
    pg.style.height = 'auto';
    for (const { name, width } of widths) {
      pg.style.width = `${width}px`;
      pg.style.paddingRight = '2px';
      pg.style.boxSizing = 'border-box';
      lf.style.height = 'auto';
      const b = body.getBoundingClientRect();
      const ft = foot.getBoundingClientRect();
      const rows = [...lf.querySelectorAll('.lf-srow')];
      const got = {
        body: r1(b.height),
        gap: r1(ft.top - b.bottom),
        foot: r1(ft.height),
        srows: rows.map((row) => ({ name: row.querySelector('.axis-mark__name').textContent, h: r1(row.getBoundingClientRect().height) })),
        problemsH: r1(lf.querySelector('.lf-mrow--plain')?.getBoundingClientRect().height ?? 0),
        anchors: [],
        lowEdges: [],
      };
      got.need = r1(got.body + got.gap + got.foot);
      // How far each own row's low and high word runs past its grid column. A nowrap grid item sized
      // to its words is as wide as its words, so its own box never shows the overflow: the column's
      // edges come from the .lf-sc box and the track widths of its computed grid-template-columns
      // (column 1 for .lf-lo, column 9 for .lf-hi).
      for (const row of rows.slice(ownFrom)) {
        // The name column's right edge: the row's left plus the first track of its own grid, and
        // the low word's left edge (its box, which a word wider than its column pushes leftward).
        const nameTrack = parseFloat(getComputedStyle(row).gridTemplateColumns.split(/\s+/)[0]);
        got.lowEdges.push({
          row: row.querySelector('.axis-mark__name').textContent,
          nameEdge: r1(row.getBoundingClientRect().left + nameTrack),
          loLeft: r1(row.querySelector('.lf-lo').getBoundingClientRect().left),
        });
        const sc = row.querySelector('.lf-sc');
        const tracks = getComputedStyle(sc).gridTemplateColumns.split(/\s+/).map(parseFloat);
        const edgeOf = (col) => ({ left: tracks.slice(0, col - 1).reduce((a, w) => a + w, 0), width: tracks[col - 1] });
        for (const [cls, col] of [['.lf-lo', 1], ['.lf-hi', 9]]) {
          const word = row.querySelector(cls);
          const w = word.getBoundingClientRect().width;
          const colW = edgeOf(col).width;
          got.anchors.push({ row: row.querySelector('.axis-mark__name').textContent, cls, text: word.textContent, w: r1(w), colW: r1(colW), over: r1(Math.max(0, w - colW)) });
        }
      }
      out[name] = got;
    }
  } finally {
    pg.style.cssText = keep[0];
    lf.style.cssText = keep[1];
  }
  return out;
}

const WIDTHS = [SAFARI, CHROME].map(({ name, width }) => ({ name, width }));

// ---------------------------------------------------------------------------
// Facet fit: case two, each log page one page (D-15, D-17).
// ---------------------------------------------------------------------------
async function collectFit(browser, appUrl) {
  const out = [];
  const f = 'fit';
  const { context, page } = await openPrint(browser, appUrl, 'two');
  try {
    for (const title of ['Batch log', 'Tasting log']) {
      const m = await page.evaluate(measureNeed, { log: LOG, title, widths: WIDTHS, ownFrom: 0 });
      for (const eng of [SAFARI, CHROME]) {
        const got = m[eng.name];
        const spare = Math.round((eng.limit - got.need) * 10) / 10;
        out.push(
          check(
            f,
            `${title} at ${eng.name}'s ${eng.width} px fits one page: need ${got.need} (body ${got.body}, gap ${got.gap}, foot ${got.foot}) of ${eng.limit}, spare ${spare}`,
            got.need <= eng.limit,
            `need ${got.need} exceeds ${eng.limit} by ${-spare}`,
          ),
        );
      }
    }
  } finally {
    await context.close();
  }
  return out;
}

// ---------------------------------------------------------------------------
// Facet worst: the longest words the creation editor saves (12-cases.mjs, case worst). Checked,
// not only reported: the limits are Mark's (2026-11-16), so a FAIL here is reported with both
// sides' values and no limit, word or CSS is changed to make it pass.
// ---------------------------------------------------------------------------
async function collectWorst(browser, appUrl) {
  const out = [];
  const f = 'worst';
  const { context, page } = await openPrint(browser, appUrl, 'worst');
  try {
    const m = await page.evaluate(measureNeed, { log: LOG, title: 'Tasting log', widths: WIDTHS, ownFrom: 4 });
    for (const eng of [SAFARI, CHROME]) {
      const got = m[eng.name];
      const spare = Math.round((eng.limit - got.need) * 10) / 10;
      out.push(report(f, `${eng.name} ${eng.width} px: need ${got.need} (body ${got.body}, gap ${got.gap}, foot ${got.foot}) of ${eng.limit}, spare ${spare}${spare < 0 ? ' (SPILLS onto a second sheet)' : ''}`));
      out.push(report(f, `${eng.name} row heights: ${got.srows.map((r) => `${r.name} ${r.h}`).join('; ')}; problems row ${got.problemsH}`));
      for (const a of got.anchors) {
        out.push(report(f, `${eng.name} ${a.row} ${a.cls === '.lf-lo' ? 'low' : 'high'} word ${JSON.stringify(a.text)}: ${a.w} px wide, its column ${a.colW} px, runs past by ${a.over} px`));
      }
      out.push(
        check(
          f,
          `longest allowed words: the Tasting log at ${eng.name}'s ${eng.width} px fits one page: need ${got.need} of ${eng.limit}, spare ${spare}`,
          got.need <= eng.limit,
          `need ${got.need} exceeds ${eng.limit} by ${-spare}`,
        ),
      );
      const tall = got.srows.filter((r) => Math.abs(r.h - ROW_H) > ROW_TOLERANCE);
      out.push(
        check(
          f,
          `longest allowed words: at ${eng.name} every scale row is ${ROW_H} px tall (within ${ROW_TOLERANCE} px), each name on one line`,
          tall.length === 0,
          tall.map((r) => `${r.name} ${r.h}`).join('; '),
        ),
      );
      const crowded = got.lowEdges.filter((e) => e.loLeft < e.nameEdge);
      out.push(
        check(
          f,
          `longest allowed words: at ${eng.name} each own scale's low word starts at or right of its name column's edge (${got.lowEdges.map((e) => `${e.row}: word ${e.loLeft}, edge ${e.nameEdge}`).join('; ')})`,
          got.lowEdges.length > 0 && crowded.length === 0,
          crowded.length === 0 ? 'no own scale rows read' : crowded.map((e) => `${e.row}: word ${e.loLeft} left of edge ${e.nameEdge}`).join('; '),
        ),
      );
    }
  } finally {
    await context.close();
  }
  return out;
}

const FACETS = { rows: collectRows, drop: collectDrop, lines: collectLines, fit: collectFit, worst: collectWorst };

async function main() {
  const wanted = process.argv.slice(2);
  if (wanted.length === 0 || wanted.some((f) => !FACETS[f])) {
    console.log(`FAIL usage: PROBE_DIST=<dist> node 12-print-check.mjs <${Object.keys(FACETS).join('|')}...>`);
    process.exit(1);
  }
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  let failed = false;
  try {
    for (const facet of wanted) {
      let lines;
      try {
        lines = await FACETS[facet](browser, appUrl);
      } catch (error) {
        failed = true;
        console.log(`FAIL ${facet} could not read the build: ${String(error.message).split('\n')[0]}`);
        continue;
      }
      for (const line of lines) {
        if (line.kind === 'FAIL') failed = true;
        console.log(`${line.kind} ${line.facet} ${line.text}`);
      }
    }
  } finally {
    await browser.close();
    await close();
  }
  process.exit(failed ? 1 : 0);
}

await main();
