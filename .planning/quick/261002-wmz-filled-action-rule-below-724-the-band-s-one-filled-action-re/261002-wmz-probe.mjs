// Quick task 261002-wmz's probe: below 724 the recipe band's acts row leads with
// one filled record action, and Next version is a text control (sketch 011
// decision 30; 393-phone-log.html and 723-phone-log.html). Measures the BUILT app
// (app/dist) in Playwright's WebKit and system Chrome, against a pre-change
// baseline and against both boards.
//
//   node 261002-wmz-probe.mjs baseline            (build of the post-wmy, pre-wmz source; writes the JSON)
//   node 261002-wmz-probe.mjs tracer              (webkit, 393 coarse, Olive Oil v1: the record act, the pen, Cancel)
//   node 261002-wmz-probe.mjs matrix              (6 cases x every width x 2 engines)
//   node 261002-wmz-probe.mjs behaviour           (B1 to B5, both engines, 393 coarse and 723 fine)
//   node 261002-wmz-probe.mjs boards              (both phone-log boards against the app)
//   node 261002-wmz-probe.mjs                     (every group except baseline)
//
// Serves the build and the repo through the 03.5 harness's own ephemeral
// 127.0.0.1 servers; never requests Mark's :4173 preview, the dev server or the
// sketch server on :8011, and starts no Vite process. Every non-127.0.0.1
// request is aborted. The one save (the awaiting-first case) lands in a
// throwaway context's own IndexedDB. A reading here is evidence about two
// engines, not about Mark's iPhone or iPad; the device is his to check.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import {
  startServers,
  launch,
  openBoard,
  recordAnotherBatch,
  check,
  finish,
} from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261002-wmz-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const near = (a, b, tol) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;
const round = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);

// Six cases. awaiting-first has no seeded batch; the probe records one in the
// throwaway context (see openCase).
const CASES = [
  { id: 'tasted-first', route: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', parent: false, standing: 'tasted', label: 'Record another', board: 0 },
  { id: 'tasted-parent', route: '/notebook/strawberry/strawberry-v2-1', parent: true, standing: 'tasted', label: 'Record another' },
  { id: 'awaiting-first', route: '/notebook/standard-base/standard-base-v1', parent: false, standing: 'awaiting', label: 'Record a tasting', record: '2026-10-02', board: 1 },
  { id: 'awaiting-parent', route: '/notebook/coconut/coconut-v2', parent: true, standing: 'awaiting', label: 'Record a tasting' },
  { id: 'none-first', route: '/notebook/standard-base/standard-base-v1', parent: false, standing: 'none', label: 'Record a batch', board: 2 },
  { id: 'none-parent', route: '/notebook/mexican-chocolate/mexican-chocolate-v4', parent: true, standing: 'none', label: 'Record a batch', board: 3 },
];
const caseById = Object.fromEntries(CASES.map((c) => [c.id, c]));
const NO_BATCH_PROSE = 'Not yet churned.';

const BELOW = [
  { width: 320, height: 568, coarse: true },
  { width: 375, height: 667, coarse: true },
  { width: 393, height: 852, coarse: true },
  { width: 428, height: 926, coarse: true },
  { width: 723, height: 1024, coarse: false },
  { width: 723, height: 1024, coarse: true },
];
const FROM = [
  { width: 724, height: 1024, coarse: false },
  { width: 724, height: 1024, coarse: true },
  { width: 1366, height: 1024, coarse: false },
];
const W393 = BELOW[2];
const W723F = BELOW[4];
const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

const wkey = (w) => `${w.width}${w.coarse ? 'c' : 'f'}`;
const cellKey = (engine, w, c) => `${engine}|${wkey(w)}|${c.id}`;

// ---------------------------------------------------------------------------
// Node-side helpers.
async function openAppPage(browser, appUrl, route, { width, height, coarse }) {
  const options = coarse
    ? { ...devices['iPhone 14'], viewport: { width, height }, screen: { width, height } }
    : { viewport: { width, height } };
  const context = await browser.newContext(options);
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook');
  await page.waitForSelector('h2.notebook-version__identity');
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openAppPage: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.waitForTimeout(300);
}

// Opens a case, makes awaiting-first (a saved batch with no tasting), waits
// until the log has settled for the case, scrolls to the top.
async function openCase(browser, servers, c, w) {
  const { context, page } = await openAppPage(browser, servers.appUrl, c.route, w);
  try {
    if (c.record) await recordAnotherBatch(page, c.record);
    if (c.standing === 'none') {
      await page.waitForFunction(
        (prose) => [...document.querySelectorAll('.notebook-log p')].some((p) => p.textContent.trim().startsWith(prose)),
        NO_BATCH_PROSE,
        { timeout: 8000 },
      );
    } else {
      await page.waitForSelector('.notebook-log .batch-row__date', { timeout: 8000 });
    }
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    return { context, page };
  } catch (error) {
    await context.close();
    throw error;
  }
}

async function waitStable(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = -1;
        let same = 0;
        const tick = () => {
          const y = window.scrollY;
          same = y === last ? same + 1 : 0;
          last = y;
          if (same >= 4) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );
}

async function press(page, locator, coarse) {
  if (coarse) await locator.tap();
  else await locator.click();
}

// ---------------------------------------------------------------------------
// In-page readers (passed to page.evaluate).

// Reads the acts row. kind 'app' reads .notebook-band .notebook-version__acts;
// kind 'board' reads the parent of the panel-th "Next version" button on a
// board. x is measured from the row's own .shell on both.
function readActs({ kind, panel }) {
  let row;
  if (kind === 'app') {
    const rows = document.querySelectorAll('.notebook-band .notebook-version__acts');
    if (rows.length !== 1) return { error: `acts rows: ${rows.length}` };
    row = rows[0];
  } else {
    const next = [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Next version')[panel];
    if (!next) return { error: `no Next version button on panel ${panel}` };
    row = next.parentElement;
  }
  const shell = row.closest('.shell');
  const origin = shell.getBoundingClientRect().left;
  const rr = row.getBoundingClientRect();
  const children = [...row.children].map((el) => {
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      text: el.textContent.trim(),
      className: el.className,
      tabindex: el.getAttribute('tabindex'),
      left: b.left - origin,
      right: b.right - origin,
      top: b.top - rr.top,
      width: b.width,
      height: b.height,
      bg: cs.backgroundColor,
      color: cs.color,
      decoration: cs.textDecorationLine,
    };
  });
  // Rows: a child starts a new row when it begins below the bottom of the
  // previous row's tallest member (a 17-tall child centred in a 41-tall row
  // is still one row).
  const sorted = [...children].sort((a, b) => a.top - b.top || a.left - b.left);
  let rows = 0;
  let rowBottom = -Infinity;
  for (const c of sorted) {
    if (c.top >= rowBottom - 0.5) {
      rows += 1;
      rowBottom = c.top + c.height;
    } else {
      rowBottom = Math.max(rowBottom, c.top + c.height);
    }
  }
  // Go to batch: a.notebook-jump on the app; the first "Go to batch" link on
  // the board's frame (null when absent or not displayed).
  let jump = null;
  if (kind === 'app') {
    const a = document.querySelector('.notebook-band a.notebook-jump');
    if (a && getComputedStyle(a).display !== 'none') jump = a;
  } else {
    jump = [...shell.querySelectorAll('a')].find((a) => a.textContent.trim().startsWith('Go to batch')) ?? null;
  }
  const band = row.closest('.notebook-band') ?? row.closest('header');
  const countRecordBatch = (root) =>
    root
      ? [...root.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Record a batch' && b.classList.contains('notebook-action')).length
      : null;
  return {
    width: rr.width,
    height: rr.height,
    rows,
    children,
    bandHeight: band ? band.getBoundingClientRect().height : null,
    jumpGap: jump ? jump.getBoundingClientRect().top - rr.bottom : null,
    recordBatchBand: countRecordBatch(band),
    recordBatchLog: kind === 'app' ? countRecordBatch(document.querySelector('.notebook-log')) : null,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
}

function readFocus() {
  const el = document.activeElement;
  if (!el || el === document.body) return { tag: 'BODY' };
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName,
    className: typeof el.className === 'string' ? el.className : '',
    id: el.id,
    text: el.textContent.trim().slice(0, 40),
    label: el.getAttribute('aria-label'),
    value: 'value' in el ? el.value : null,
    inLog: !!el.closest('.notebook-log'),
    inBand: !!el.closest('.notebook-band'),
    top: r.top,
    bottom: r.bottom,
    inView: r.top >= 0 && r.bottom <= window.innerHeight && r.height > 0,
    innerHeight: window.innerHeight,
  };
}

const scrollY = (page) => page.evaluate(() => Math.round(window.scrollY));

// ---------------------------------------------------------------------------
// Baseline.
async function runBaseline(servers) {
  const results = {};
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      for (const w of [...BELOW, ...FROM]) {
        for (const c of CASES) {
          const key = cellKey(engine, w, c);
          const { context, page } = await openCase(browser, servers, c, w);
          try {
            const read = await page.evaluate(readActs, { kind: 'app' });
            countedCheck(!read.error, `${key}: acts row read (${read.error ?? 'ok'})`);
            if (read.error) continue;
            countedCheck(!read.children.some((x) => /^Record/.test(x.text)), `${key}: precondition, no record control in the acts row (${read.children.map((x) => x.text)})`);
            const next = read.children.find((x) => x.text === 'Next version');
            countedCheck(next?.className === 'notebook-action', `${key}: precondition, Next version is notebook-action (${next?.className})`);
            results[key] = read;
            console.log(JSON.stringify({ cell: key, labels: read.children.map((x) => x.text), band: round(read.bandHeight), acts: [round(read.width), round(read.height)], rows: read.rows, overflow: read.overflow }));
          } finally {
            await context.close();
          }
        }
      }
    } finally {
      await browser.close();
    }
  }
  if (failures.length === 0) await writeFile(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Tracer and behaviour sequences.
async function bandButton(page, name) {
  return page.locator('.notebook-band .notebook-version__acts').getByRole('button', { name, exact: true });
}

// The record sequence: band click, pen opens, Churn date focused and in view
// and empty, acts row gone, Cancel in the log, focus on `returnSelector`, the
// band's filled button back.
async function recordSequence(page, label, w, filledLabel, returnSelector) {
  const y0 = await scrollY(page);
  await press(page, await bandButton(page, filledLabel), w.coarse);
  await page.waitForSelector('.batch-margin--pen', { timeout: 5000 });
  await waitStable(page);
  const y1 = await scrollY(page);
  const churn = await page.getByLabel('Churn date').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { focused: el === document.activeElement, top: r.top, bottom: r.bottom, innerHeight: window.innerHeight, value: el.value };
  });
  countedCheck(churn.focused, `${label}: Churn date focused after the band's ${filledLabel}`);
  countedCheck(churn.top >= 0 && churn.bottom <= churn.innerHeight, `${label}: Churn date in view (${round(churn.top)} to ${round(churn.bottom)} of ${churn.innerHeight})`);
  countedCheck(churn.value === '', `${label}: Churn date empty (${churn.value})`);
  const actsGone = await page.locator('.notebook-band .notebook-version__acts').count();
  countedCheck(actsGone === 0, `${label}: band acts row gone while the pen is open (${actsGone})`);
  await press(page, page.locator('.notebook-log').getByRole('button', { name: 'Cancel' }).first(), w.coarse);
  await page.waitForFunction((sel) => document.activeElement?.matches(sel), returnSelector, { timeout: 5000 }).catch(() => {});
  await waitStable(page);
  const y2 = await scrollY(page);
  const focus = await page.evaluate(readFocus);
  countedCheck(await page.evaluate((sel) => document.activeElement?.matches(sel), returnSelector), `${label}: Cancel returns focus to ${returnSelector} (${JSON.stringify({ tag: focus.tag, className: focus.className, text: focus.text })})`);
  const back = await page.evaluate(readActs, { kind: 'app' });
  countedCheck(!back.error && back.children[0]?.text === filledLabel && /notebook-action/.test(back.children[0].className), `${label}: band's filled ${filledLabel} is back (${back.error ?? back.children[0]?.text})`);
  console.log(JSON.stringify({ seq: label, scrollY: { click: y0, open: y1, cancel: y2 } }));
}

async function runTracer(browser, servers, engine) {
  const w = W393;
  const c = caseById['tasted-first'];
  const label = `${engine} tracer ${wkey(w)} ${c.id}`;
  const { context, page } = await openCase(browser, servers, c, w);
  try {
    const acts = await page.evaluate(readActs, { kind: 'app' });
    countedCheck(!acts.error, `${label}: acts row read (${acts.error ?? 'ok'})`);
    if (acts.error) return;
    countedCheck(JSON.stringify(acts.children.map((x) => x.text)) === JSON.stringify(['Record another', 'Next version']), `${label}: acts row reads ${acts.children.map((x) => x.text)}`);
    countedCheck(acts.children[0].className === 'notebook-action', `${label}: first is notebook-action (${acts.children[0].className})`);
    countedCheck(acts.children[1].className === 'notebook-link', `${label}: second is notebook-link (${acts.children[1].className})`);
    await recordSequence(page, label, w, 'Record another', '.notebook-log .batch-row__record');
  } finally {
    await context.close();
  }
}

async function runBehaviour(browser, servers, engine) {
  for (const w of [W393, W723F]) {
    const tag = `${engine} ${wkey(w)}`;

    // B1, tasted-first.
    {
      const { context, page } = await openCase(browser, servers, caseById['tasted-first'], w);
      try {
        await recordSequence(page, `${tag} B1 tasted-first`, w, 'Record another', '.notebook-log .batch-row__record');
      } finally {
        await context.close();
      }
    }

    // B2, none-first.
    {
      const label = `${tag} B2 none-first`;
      const { context, page } = await openCase(browser, servers, caseById['none-first'], w);
      try {
        const before = await page.evaluate(readActs, { kind: 'app' });
        countedCheck(before.recordBatchBand === 1 && before.recordBatchLog === 1, `${label}: Record a batch buttons band ${before.recordBatchBand}, log ${before.recordBatchLog} (want 1 and 1)`);
        await recordSequence(page, label, w, 'Record a batch', '.notebook-log .notebook-action');
      } finally {
        await context.close();
      }
    }

    // B3, awaiting-parent: the seam's behaviour today.
    {
      const label = `${tag} B3 awaiting-parent`;
      const { context, page } = await openCase(browser, servers, caseById['awaiting-parent'], w);
      try {
        const y0 = await scrollY(page);
        await press(page, await bandButton(page, 'Record a tasting'), w.coarse);
        await page.waitForSelector('.batch-margin--pen', { timeout: 5000 });
        await waitStable(page);
        const y1 = await scrollY(page);
        const churn = await page.getByLabel('Churn date').evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { focused: el === document.activeElement, top: r.top, bottom: r.bottom, innerHeight: window.innerHeight };
        });
        countedCheck(churn.focused, `${label}: Churn date focused`);
        countedCheck(churn.top >= 0 && churn.bottom <= churn.innerHeight, `${label}: Churn date in view (${round(churn.top)} to ${round(churn.bottom)} of ${churn.innerHeight})`);
        const counts = await page.evaluate(() => ({
          date: document.querySelectorAll('.batch-row__date').length,
          add: document.querySelectorAll('.batch-margin--pen button.save-ceremony__add-tasting').length,
          stops: document.querySelectorAll('.batch-margin--pen .axis-mark__stops').length,
        }));
        countedCheck(counts.date >= 1, `${label}: .batch-row__date present, the amend pen (${counts.date})`);
        countedCheck(counts.add === 1, `${label}: exactly one Add tasting in the pen (${counts.add})`);
        countedCheck(counts.stops === 0, `${label}: tasting not yet open (${counts.stops} stops)`);
        await press(page, page.locator('.notebook-log').getByRole('button', { name: 'Cancel' }).first(), w.coarse);
        await page.waitForFunction(() => document.activeElement?.matches('.notebook-log .batch-row__correct'), null, { timeout: 5000 }).catch(() => {});
        await waitStable(page);
        const y2 = await scrollY(page);
        const onCorrect = await page.evaluate(() => document.activeElement?.matches('.notebook-log .batch-row__correct'));
        countedCheck(onCorrect, `${label}: Cancel returns focus to the log's Correct`);
        console.log(JSON.stringify({ seq: label, scrollY: { click: y0, open: y1, cancel: y2 } }));
      } finally {
        await context.close();
      }
    }

    // B4, tasted-first: Next version and its focus return.
    {
      const label = `${tag} B4 tasted-first`;
      const { context, page } = await openCase(browser, servers, caseById['tasted-first'], w);
      try {
        await press(page, await bandButton(page, 'Next version'), w.coarse);
        await page.waitForSelector('form[aria-label="Next version"]', { timeout: 5000 });
        await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Version name', null, { timeout: 5000 }).catch(() => {});
        const onField = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
        countedCheck(onField === 'Version name', `${label}: Next version focuses Version name (${onField})`);
        await press(page, page.locator('form[aria-label="Next version"]').getByRole('button', { name: 'Cancel' }), w.coarse);
        await page.waitForFunction(() => document.activeElement?.closest('.notebook-band') && document.activeElement.textContent.trim() === 'Next version', null, { timeout: 5000 }).catch(() => {});
        const focus = await page.evaluate(readFocus);
        countedCheck(focus.inBand && focus.text === 'Next version', `${label}: Cancel returns focus to the band's Next version (${JSON.stringify({ tag: focus.tag, text: focus.text, inBand: focus.inBand })})`);
        const expectClass = w.width < 724 || w === W723F ? 'notebook-link' : 'notebook-action';
        countedCheck(new RegExp(expectClass).test(focus.className), `${label}: focused Next version is ${expectClass} (${focus.className})`);
      } finally {
        await context.close();
      }
    }

    // B5, awaiting-first: the setup save made through the band's Record a batch.
    {
      const label = `${tag} B5 awaiting-first`;
      const { context, page } = await openAppPage(browser, servers.appUrl, caseById['awaiting-first'].route, w);
      try {
        const urlBefore = page.url();
        await settle(page);
        await press(page, await bandButton(page, 'Record a batch'), w.coarse);
        await page.getByLabel('Churn date').fill('2026-10-02');
        await press(page, page.getByRole('button', { name: 'Save batch' }).first(), w.coarse);
        await page.waitForFunction((prev) => window.location.href !== prev, urlBefore, { timeout: 8000 });
        await page.waitForSelector('h2.region-name:has-text("Batch")');
        await page.waitForFunction(() => document.activeElement?.matches('h2.region-name'), null, { timeout: 5000 }).catch(() => {});
        await waitStable(page);
        const focus = await page.evaluate(readFocus);
        const url = page.url();
        countedCheck(/\/batch\//.test(url), `${label}: saved batch route (${url})`);
        countedCheck(focus.tag === 'H2' && /region-name/.test(focus.className) && focus.text === 'Batch', `${label}: focus on the log's Batch heading (${JSON.stringify({ tag: focus.tag, className: focus.className, text: focus.text })})`);
        console.log(JSON.stringify({ seq: label, scrollY: await scrollY(page), headingInView: focus.inView }));
      } finally {
        await context.close();
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Matrix.
function expectLabels(c) {
  return [c.label, 'Next version', ...(c.parent ? ['Show changes'] : [])];
}

function belowChecks(label, c, read, base) {
  countedCheck(!read.error, `${label}: acts row read (${read.error ?? 'ok'})`);
  if (read.error) return;
  const kids = read.children;
  countedCheck(JSON.stringify(kids.map((x) => x.text)) === JSON.stringify(expectLabels(c)), `${label}: labels ${kids.map((x) => x.text)} (want ${expectLabels(c)})`);
  countedCheck(kids[0]?.className === 'notebook-action' && kids.slice(1).every((x) => x.className === 'notebook-link'), `${label}: classes ${kids.map((x) => x.className)}`);
  countedCheck(kids.filter((x) => /notebook-action/.test(x.className)).length === 1, `${label}: exactly one notebook-action`);
  countedCheck(kids.every((x) => x.tabindex === '0'), `${label}: every child has tabindex 0`);
  countedCheck(near(kids[0]?.left, 20, 0.5), `${label}: filled left ${round(kids[0]?.left)} (want 20)`);
  countedCheck(near(kids[0]?.height, 44, 0.5), `${label}: filled height ${round(kids[0]?.height)} (want 44)`);
  countedCheck(near(kids[1]?.left, kids[0].right + 10, 0.5), `${label}: Next version left ${round(kids[1]?.left)} vs filled right + 10 = ${round(kids[0].right + 10)}`);
  if (kids[1] && near(kids[1].top, kids[0].top, 0.5)) {
    countedCheck(near(kids[1].height, kids[0].height, 0.5), `${label}: Next version height ${round(kids[1].height)} vs filled ${round(kids[0].height)}`);
  }
  const fits = kids.reduce((s, x) => s + x.width, 0) + 10 * (kids.length - 1);
  const wide = [428, 723].includes(c.__width);
  if (!c.parent || wide) countedCheck(read.rows === 1, `${label}: ${read.rows} rows (want 1)`);
  const rb = c.standing === 'none' ? [1, 1] : [0, 0];
  countedCheck(read.recordBatchBand === rb[0] && read.recordBatchLog === rb[1], `${label}: Record a batch buttons band ${read.recordBatchBand} log ${read.recordBatchLog} (want ${rb})`);
  countedCheck(read.overflow <= 0.5, `${label}: overflow ${read.overflow}`);
  countedCheck(base !== undefined, `${label}: baseline cell exists`);
  if (!base) return;
  const dBand = read.bandHeight - base.bandHeight;
  const dActs = read.height - base.height;
  countedCheck(near(dBand, dActs, 0.5), `${label}: band height delta ${round(dBand)} equals acts row delta ${round(dActs)}`);
  return { fits, dBand, dActs };
}

function fromChecks(label, c, read, base) {
  countedCheck(!read.error, `${label}: acts row read (${read.error ?? 'ok'})`);
  if (read.error) return;
  countedCheck(base !== undefined, `${label}: baseline cell exists`);
  if (!base) return;
  countedCheck(!read.children.some((x) => /^Record/.test(x.text)), `${label}: no record control in the acts row`);
  countedCheck(JSON.stringify(read.children.map((x) => [x.text, x.className])) === JSON.stringify(base.children.map((x) => [x.text, x.className])), `${label}: labels and classes equal the baseline (${read.children.map((x) => `${x.text}/${x.className}`)})`);
  countedCheck(read.rows === base.rows, `${label}: rows ${read.rows} vs ${base.rows}`);
  countedCheck(near(read.bandHeight, base.bandHeight, 0.5), `${label}: band height ${round(read.bandHeight)} vs ${round(base.bandHeight)}`);
  countedCheck(near(read.width, base.width, 0.5) && near(read.height, base.height, 0.5), `${label}: acts row ${round(read.width)}x${round(read.height)} vs ${round(base.width)}x${round(base.height)}`);
  read.children.forEach((x, i) => {
    const b = base.children[i];
    if (!b) return;
    for (const k of ['left', 'top', 'width', 'height']) {
      countedCheck(near(x[k], b[k], 0.5), `${label}: ${x.text} ${k} ${round(x[k])} vs ${round(b[k])}`);
    }
  });
  const rb = c.standing === 'none' ? 1 : 0;
  countedCheck(read.recordBatchLog === rb, `${label}: log's Record a batch count ${read.recordBatchLog} (want ${rb})`);
  countedCheck(read.recordBatchBand === 0, `${label}: band's Record a batch count ${read.recordBatchBand} (want 0)`);
}

async function runMatrix(browser, servers, engine, baseline) {
  for (const w of [...BELOW, ...FROM]) {
    const below = BELOW.includes(w);
    for (const c of CASES) {
      const key = cellKey(engine, w, c);
      const { context, page } = await openCase(browser, servers, c, w);
      try {
        const read = await page.evaluate(readActs, { kind: 'app' });
        if (below) {
          const out = belowChecks(key, { ...c, __width: w.width }, read, baseline[key]);
          if (!read.error) {
            const k = read.children;
            console.log(JSON.stringify({
              cell: key,
              labels: k.map((x) => x.text),
              filled: [round(k[0].width), round(k[0].height)],
              next: [round(k[1].left), round(k[1].width), round(k[1].height)],
              show: k[2] ? round(k[2].left) : null,
              rows: read.rows,
              fit: out ? [round(out.fits), round(read.width), round(read.width - out.fits)] : null,
              band: [round(baseline[key]?.bandHeight), round(read.bandHeight)],
              goGap: round(read.jumpGap),
              overflow: read.overflow,
            }));
          }
        } else {
          fromChecks(key, c, read, baseline[key]);
          if (!read.error) console.log(JSON.stringify({ cell: key, labels: read.children.map((x) => x.text), band: [round(baseline[key]?.bandHeight), round(read.bandHeight)], rows: read.rows }));
        }
      } finally {
        await context.close();
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Boards.
function compareToBoard(label, app, board, w) {
  countedCheck(!app.error && !board.error, `${label}: both rows read (${app.error ?? board.error ?? 'ok'})`);
  if (app.error || board.error) return;
  const a = app.children;
  const b = board.children;
  countedCheck(JSON.stringify(a.map((x) => x.text)) === JSON.stringify(b.map((x) => x.text)), `${label}: labels ${a.map((x) => x.text)} vs ${b.map((x) => x.text)}`);
  const filled = (list) => list.filter((x) => x.bg !== 'rgba(0, 0, 0, 0)');
  countedCheck(filled(a).length === 1 && a[0].bg !== 'rgba(0, 0, 0, 0)', `${label}: app has exactly one filled control, the first`);
  countedCheck(filled(b).length === 1 && b[0].bg !== 'rgba(0, 0, 0, 0)', `${label}: board has exactly one filled control, the first`);
  countedCheck(a[0].bg === b[0].bg && a[0].color === b[0].color, `${label}: filled colours ${a[0].bg}/${a[0].color} vs ${b[0].bg}/${b[0].color}`);
  for (let i = 1; i < a.length; i += 1) {
    countedCheck(a[i].bg === 'rgba(0, 0, 0, 0)' && /underline/.test(a[i].decoration) && a[i].color === b[i].color, `${label}: ${a[i].text} transparent, underlined, colour ${a[i].color} vs ${b[i].color}`);
    countedCheck(near(a[i].width, b[i].width, 1), `${label}: ${a[i].text} width ${round(a[i].width)} vs ${round(b[i].width)}`);
  }
  countedCheck(near(a[0].left, 20, 0.5) && near(b[0].left, 20, 0.5), `${label}: filled left ${round(a[0].left)} vs ${round(b[0].left)} (want 20)`);
  const dw = a[0].width - b[0].width;
  countedCheck(dw >= -0.01 && dw <= 4.5, `${label}: filled width ${round(a[0].width)} vs ${round(b[0].width)} (app wider by ${round(dw)}, want 0 to 4.5)`);
  countedCheck(near(a[1].left, a[0].right + 10, 0.5) && near(b[1].left, b[0].right + 10, 0.5), `${label}: 10px gap after the filled control, app ${round(a[1].left - a[0].right)} board ${round(b[1].left - b[0].right)}`);
  if (a[2] && b[2]) {
    countedCheck(near(a[2].left, a[1].right + 10, 0.5) && near(b[2].left, b[1].right + 10, 0.5), `${label}: 10px gap before Show changes, app ${round(a[2].left - a[1].right)} board ${round(b[2].left - b[1].right)}`);
  }
  countedCheck(app.rows === board.rows, `${label}: rows ${app.rows} vs ${board.rows}`);
  if (w.width === 393) {
    countedCheck(a.every((x) => near(x.height, 44, 0.5)) && b.every((x) => near(x.height, 44, 0.5)), `${label}: every height 44 (app ${a.map((x) => round(x.height))}, board ${b.map((x) => round(x.height))})`);
  } else {
    console.log(JSON.stringify({ note: `${label}: heights recorded, not asserted (decision 30: app 44 against board 41 and 17)`, app: a.map((x) => round(x.height)), board: b.map((x) => [round(x.top), round(x.height)]) }));
  }
  countedCheck(app.overflow <= 0.5, `${label}: overflow ${app.overflow}`);
  console.log(JSON.stringify({ board: label, appFilledW: round(a[0].width), boardFilledW: round(b[0].width), appGoGap: round(app.jumpGap), boardGoGap: round(board.jumpGap), rows: [app.rows, board.rows] }));
}

async function runBoards(browser, servers, engine) {
  for (const [file, w] of [['393-phone-log.html', W393], ['723-phone-log.html', W723F]]) {
    const apps = {};
    for (const id of ['tasted-first', 'awaiting-first', 'none-first', 'none-parent']) {
      const { context, page } = await openCase(browser, servers, caseById[id], w);
      try {
        apps[id] = await page.evaluate(readActs, { kind: 'app' });
      } finally {
        await context.close();
      }
    }
    const { context, page } = await openBoard(browser, servers.repoUrl, file);
    try {
      await page.evaluate(async () => document.fonts.ready);
      await page.waitForTimeout(300);
      const panels = { 'tasted-first': 0, 'awaiting-first': 1, 'none-first': 2, 'none-parent': 3 };
      for (const [id, panel] of Object.entries(panels)) {
        const board = await page.evaluate(readActs, { kind: 'board', panel });
        compareToBoard(`${engine} ${file} p${panel} (${id})`, apps[id], board, w);
      }
    } finally {
      await context.close();
    }
  }
}

// ---------------------------------------------------------------------------
const ALL = ['tracer', 'matrix', 'behaviour', 'boards'];
const requested = (process.argv[2] ?? '').split(',').filter(Boolean);
const groups = new Set(requested.length === 0 ? ALL : requested);
if ([...groups].some((g) => ![...ALL, 'baseline'].includes(g))) {
  console.log('usage: node 261002-wmz-probe.mjs [baseline | tracer,matrix,behaviour,boards]');
  process.exit(2);
}
const servers = await startServers();
try {
  if (groups.has('baseline')) {
    await runBaseline(servers);
  } else {
    const baseline = groups.has('matrix') ? JSON.parse(await readFile(BASELINE_PATH, 'utf8')) : null;
    for (const [engine, make] of engines) {
      const everything = groups.has('matrix') || groups.has('behaviour') || groups.has('boards');
      if (!everything && engine !== 'webkit') continue;
      const browser = await make();
      try {
        if (groups.has('tracer') && engine === 'webkit') await runTracer(browser, servers, engine);
        if (groups.has('matrix')) await runMatrix(browser, servers, engine, baseline);
        if (groups.has('behaviour')) await runBehaviour(browser, servers, engine);
        if (groups.has('boards')) await runBoards(browser, servers, engine);
      } finally {
        await browser.close();
      }
    }
  }
} finally {
  await servers.close();
}
finish(failures, count, `261002-wmz probe (${[...groups].join(',')})`);
