// Quick 261025-elq: the page notice as a card from the bottom edge in the App's skin, measured in Playwright
// WebKit on a scratch build (decide-page-notice-shape BS; look-page-notice-card-page-styling, "Approve BS").
// Proves the built card's box, font, padding, colours, border, radius and shadow equal the board's BS record
// in .planning/canvas-generators/noticeshape-measure.json (BS_1366, BS_393), after Save batch on two recipes
// and after an Import refusal, at 1366x1024 and 393x852; that it is centred, clear of the bar, the tab row,
// the recipe name and the focused element; and that an empty notice draws nothing.
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-elq"
//   npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir
//   PROBE_DIST="$S/dist" node .planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-notice-probe.mjs
//
// It starts no Vite server, never contacts 4173 or 8077, and never reads or writes app/dist unless PROBE_DIST
// points there. The build is served on an ephemeral 127.0.0.1 port through 08-walk-server.mjs, and every
// request to a host other than 127.0.0.1 is aborted. playwright-core is loaded only through PLAYWRIGHT_CORE
// (default: the npx cache path below). Each scenario gets a fresh WebKit context { hasTouch, isMobile below
// 724, deviceScaleFactor 1 }, the same as the board's measurement, so the boxes compare. Every notice clears
// itself after 5 s, so each scenario measures within about 3 s of the trigger. Prints PASS or FAIL per gate,
// INFO lines with every measured box (not counted), and ends "N PASS, M FAIL" (exit 1 when M is above 0).
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
if (!process.env.PROBE_DIST || !existsSync(path.join(process.env.PROBE_DIST, 'index.html'))) {
  console.log('FAIL PROBE_DIST must name a directory holding index.html (a scratch build)');
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);
const DIST = path.resolve(process.env.PROBE_DIST);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BOARD = JSON.parse(readFileSync(path.join(HERE, '..', '..', 'canvas-generators', 'noticeshape-measure.json'), 'utf8'));
const EXPECTED = { 1366: BOARD.BS_1366, 393: BOARD.BS_393 };

const MC = '/notebook/mexican-chocolate/mexican-chocolate-v1';
const OO = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const PEN = '.batch-margin--pen';
const PEN_NOTICE = 'Close the open pen before importing.';
const DRAFT_NOTICE = 'Cancel the new recipe draft before importing.';
const SAVED = /^recorded \d{1,2} [A-Z][a-z]{2} \d{4}$/;
const CONFIGS = [
  [1366, 1024],
  [393, 852],
];

let passes = 0;
let failures = 0;
const pass = (line) => {
  passes += 1;
  console.log(`PASS ${line}`);
};
const fail = (line) => {
  failures += 1;
  console.log(`FAIL ${line}`);
};
const gate = (ok, line) => (ok ? pass : fail)(line);
const info = (line) => console.log(`INFO ${line}`);

async function until(page, predicate, ms = 5000) {
  const stop = Date.now() + ms;
  for (;;) {
    if (await predicate()) return true;
    if (Date.now() > stop) return false;
    await page.waitForTimeout(50);
  }
}

async function readyFor(page, locator) {
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
  if (!(await until(page, () => locator.isEnabled()))) throw new Error('the control never became enabled');
}

async function press(page, locator, outcome) {
  await readyFor(page, locator);
  await locator.tap({ timeout: 5000 });
  if (!(await until(page, outcome))) throw new Error('first activation missed');
}

async function type(page, locator, text) {
  await readyFor(page, locator);
  await locator.fill(text);
  if (!(await until(page, async () => (await locator.inputValue()) === text))) throw new Error(`the field did not keep "${text}"`);
}

async function clickUntil(page, target, doneSelector, label) {
  for (let i = 0; i < 4; i += 1) {
    await target().click();
    try {
      await page.waitForSelector(doneSelector, { timeout: 1500 });
      return;
    } catch {
      // a first click after a navigation often misses; try again
    }
  }
  throw new Error(`${label}: ${doneSelector} never appeared`);
}

const notice = (page) => page.evaluate(() => document.querySelector('.page-status')?.textContent.trim() ?? '');
const pathOf = (page) => new URL(page.url()).pathname;

// From 724 up Import sits in the bar's tools; below 724 it is inside More, in the bottom tab row.
async function pressImport(page, width, words) {
  if (width >= 724) {
    await press(page, page.locator('.shell__tools button', { hasText: 'Import' }), async () => (await notice(page)) === words);
    return;
  }
  const more = page.locator('.shell__more > summary');
  await readyFor(page, more);
  await more.tap({ timeout: 5000 });
  const importButton = page.locator('.shell__more button', { hasText: 'Import' });
  await importButton.waitFor({ state: 'visible', timeout: 5000 });
  await press(page, importButton, async () => (await notice(page)) === words);
}

// Runs in the page. The same shape as noticeshape-measure.mjs (box, font, lh, pad, colours, covers), plus the
// anchor, the window and the four overlaps.
function measureInPage() {
  const R = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
  };
  const n = document.querySelector('.page-status');
  const nb = n.getBoundingClientRect();
  const cs = getComputedStyle(n);
  const ov = (q) => {
    const r = q.getBoundingClientRect();
    const x = Math.max(nb.x, r.x);
    const y = Math.max(nb.y, r.y);
    const x2 = Math.min(nb.right, r.right);
    const y2 = Math.min(nb.bottom, r.bottom);
    return x2 > x && y2 > y ? { w: +(x2 - x).toFixed(1), h: +(y2 - y).toFixed(1) } : null;
  };
  const leaf = (e) => [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) || /^(INPUT|BUTTON|A)$/.test(e.tagName);
  const covers = [...document.querySelectorAll('.shell__main *')]
    .filter((e) => e !== n && !n.contains(e) && !e.closest('.page-status') && leaf(e) && ov(e))
    .map((e) => ({
      tag: e.tagName,
      cls: typeof e.className === 'string' ? e.className.split(' ')[0] : '',
      text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40),
      ov: ov(e),
    }));
  const anchor = n.parentElement;
  const acs = getComputedStyle(anchor);
  const head = document.querySelector('.shell__head');
  const tabs = document.querySelector('.shell__tabs');
  const tabsShown = tabs && getComputedStyle(tabs).display !== 'none';
  const name = document.querySelector('.notebook-recipe__name');
  const f = document.activeElement;
  const focusShown = f && f !== document.body;
  return {
    text: n.textContent.trim(),
    notice: R(n),
    font: cs.fontSize,
    lh: cs.lineHeight,
    pad: cs.padding,
    colours: {
      background: cs.backgroundColor,
      color: cs.color,
      border: cs.borderTopWidth + ' ' + cs.borderTopColor,
      radius: cs.borderTopLeftRadius,
      shadow: cs.boxShadow,
    },
    borderTopWidth: cs.borderTopWidth,
    anchor: { position: acs.position, box: R(anchor), height: anchor.getBoundingClientRect().height },
    covers,
    scrollY: Math.round(window.scrollY),
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    overlaps: {
      head: head ? ov(head) : null,
      tabs: tabsShown ? ov(tabs) : null,
      name: name ? ov(name) : null,
      focus: focusShown ? ov(f) : null,
    },
    focused: focusShown ? f.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) : '(body)',
    focusedBox: focusShown ? R(f) : null,
  };
}

const measure = (page) => page.evaluate(measureInPage);
const seq = (list) => list.map((c) => `${c.tag}.${c.cls}`).join(' | ');
const brief = (m) => (m.notice ? `[${m.notice.x}, ${m.notice.y}, ${m.notice.w} x ${m.notice.h}]` : 'none');
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// The shown card, gated against the board's BS record for this width.
function shownGates(label, m, want, words, { exactX }) {
  const where = `${brief(m)} scrollY ${m.scrollY}`;
  gate(words instanceof RegExp ? words.test(m.text) : m.text === words, `${label} words: "${m.text}" ${where}`);
  gate(m.font === want.font && m.lh === want.lh && m.pad === want.pad, `${label} type and padding: ${m.font} on ${m.lh}, ${m.pad} (want ${want.font} on ${want.lh}, ${want.pad})`);
  for (const key of ['background', 'color', 'border', 'radius', 'shadow']) {
    gate(m.colours[key] === want.colours[key], `${label} ${key}: ${m.colours[key]} (want ${want.colours[key]})`);
  }
  gate(m.notice !== null && near(m.notice.y, want.notice.y, 0.5) && near(m.notice.h, want.notice.h, 0.5), `${label} y and height: ${brief(m)} (want y ${want.notice.y}, h ${want.notice.h})`);
  gate(m.notice !== null && near(m.notice.x + m.notice.w / 2, m.innerWidth / 2, 0.5), `${label} centred: centre ${m.notice ? r1(m.notice.x + m.notice.w / 2) : 'none'} of ${m.innerWidth / 2}`);
  if (exactX) gate(near(m.notice.x, want.notice.x, 1.5) && near(m.notice.w, want.notice.w, 1.5), `${label} x and width: ${brief(m)} (want x ${want.notice.x}, w ${want.notice.w})`);
  gate(m.anchor.position === 'fixed' && m.anchor.height === 0, `${label} anchor: ${m.anchor.position}, height ${m.anchor.height}`);
  overlapGates(label, m);
}

function overlapGates(label, m) {
  for (const key of ['head', 'tabs', 'name', 'focus']) {
    gate(m.overlaps[key] === null, `${label} clear of ${key}: ${JSON.stringify(m.overlaps[key])}`);
  }
}

const r1 = (n) => Math.round(n * 10) / 10;

function logCovers(label, m) {
  info(`${label} box ${brief(m)} scrollY ${m.scrollY} focused "${m.focused}" ${JSON.stringify(m.focusedBox)}`);
  for (const c of m.covers) info(`${label} covers ${c.tag}.${c.cls} "${c.text}" ${c.ov.w} x ${c.ov.h}`);
  if (m.covers.length === 0) info(`${label} covers nothing`);
}

function emptyGates(label, m, width, height) {
  gate(m.text === '', `${label} empty words: "${m.text}"`);
  gate(m.notice !== null && m.notice.w === 0 && m.notice.h === 0, `${label} empty box: ${brief(m)}`);
  gate(m.borderTopWidth === '0px', `${label} empty border-top-width: ${m.borderTopWidth}`);
  gate(m.colours.shadow === 'none', `${label} empty box-shadow: ${m.colours.shadow}`);
  gate(m.anchor.position === 'fixed' && m.anchor.height === 0, `${label} anchor: ${m.anchor.position}, height ${m.anchor.height}`);
  const a = m.anchor.box;
  gate(a !== null && a.x === 0 && a.w === width && near(a.y, height, 0.5) && m.innerHeight === height, `${label} anchor box: ${JSON.stringify(a)} (want [0, ${height}, ${width}, 0])`);
}

const newContext = async (browser, width, height) => {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: width < 724, deviceScaleFactor: 1 });
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  return context;
};

async function openRoute(page, servers, route, ready) {
  await page.goto(`${servers.appUrl}${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(ready);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.fonts.ready);
}

async function openPen(page, servers, route) {
  await openRoute(page, servers, route, '.notebook-log');
  await clickUntil(page, () => page.locator('.batch-row__record').first(), PEN, 'open the record pen');
  await page.waitForSelector('.ingredient-table__as-made-field');
}

// The shown state at the scroll the trigger left, then with the page at the top.
async function shownAndTop(page, label, want, words, opts) {
  const landed = await measure(page);
  shownGates(`${label} landing`, landed, want, words, opts);
  logCovers(`${label} landing`, landed);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  const top = await measure(page);
  gate(top.notice !== null && near(top.notice.y, want.notice.y, 0.5) && near(top.notice.x + top.notice.w / 2, top.innerWidth / 2, 0.5), `${label} top y and centre: ${brief(top)} scrollY ${top.scrollY}`);
  overlapGates(`${label} top`, top);
  logCovers(`${label} top`, top);
  return { landed, top };
}

// Save batch, the board's flow: Record, Churn date, Save batch, wait for the Batch heading.
async function scenarioSave(browser, servers, width, height, route, id) {
  const label = `${width} ${id}`;
  const context = await newContext(browser, width, height);
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await openPen(page, servers, route);
    const empty = await measure(page);
    emptyGates(`${label} E`, empty, width, height);
    await page.getByLabel('Churn date').fill('2026-10-22');
    await page.waitForTimeout(200);
    const save = page.locator('.pen-foot .save-ceremony button', { hasText: 'Save batch' }).first();
    await save.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const url0 = page.url();
    await save.click();
    await page.waitForFunction((u) => window.location.href !== u, url0);
    await page.waitForSelector('h2.region-name:has-text("Batch")');
    await page.waitForTimeout(400);
    await page.evaluate(() => document.fonts.ready);
    const want = EXPECTED[width];
    const landed = await measure(page);
    const exactX = landed.text.length === 20;
    const { landed: l, top } = await shownAndTop(page, label, want, SAVED, { exactX });
    if (id === 'S-oo') {
      gate(l.scrollY === want.scrollY, `${label} scrollY: ${l.scrollY} (want ${want.scrollY})`);
      gate(seq(l.covers) === seq(want.covers), `${label} landing covers equal the board: ${seq(l.covers)} (want ${seq(want.covers)})`);
      gate(seq(top.covers) === seq(want.atTop.covers), `${label} top covers equal the board: ${seq(top.covers)} (want ${seq(want.atTop.covers)})`);
    }
    const cleared = await until(page, async () => (await notice(page)) === '', 6500);
    gate(cleared, `${label} the notice clears itself`);
    emptyGates(`${label} cleared`, await measure(page), width, height);
  } finally {
    await context.close();
  }
}

// Import refused with the record pen open on Mexican Chocolate v1.
async function scenarioRefusePen(browser, servers, width, height) {
  const label = `${width} R-mc`;
  const context = await newContext(browser, width, height);
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await openPen(page, servers, MC);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await pressImport(page, width, PEN_NOTICE);
    await shownAndTop(page, label, EXPECTED[width], PEN_NOTICE, { exactX: false });
  } finally {
    await context.close();
  }
}

// Import refused in the creation editor (1366 only: no recipe is created on a phone).
async function scenarioRefuseDraft(browser, servers, width, height) {
  const label = `${width} R-new`;
  const context = await newContext(browser, width, height);
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await page.goto(`${servers.appUrl}/notebook`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.nb__count');
    await page.evaluate(() => document.fonts.ready);
    await press(page, page.locator('.nb__head .notebook-action'), () => page.locator('.nb__new input').isVisible());
    await type(page, page.locator('.nb__new input'), 'Probe notice');
    await press(page, page.locator('.nb__new-actions button', { hasText: /^Start$/ }), async () => pathOf(page) === '/notebook/new');
    await page.waitForSelector('.notebook.mk-page');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await pressImport(page, width, DRAFT_NOTICE);
    await shownAndTop(page, label, EXPECTED[width], DRAFT_NOTICE, { exactX: false });
  } finally {
    await context.close();
  }
}

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
let exitCode = 1;
try {
  for (const [width, height] of CONFIGS) {
    info(`viewport ${width}x${height}`);
    const scenarios = [
      ['S-mc', () => scenarioSave(browser, servers, width, height, MC, 'S-mc')],
      ['S-oo', () => scenarioSave(browser, servers, width, height, OO, 'S-oo')],
      ['R-mc', () => scenarioRefusePen(browser, servers, width, height)],
    ];
    if (width >= 1366) scenarios.push(['R-new', () => scenarioRefuseDraft(browser, servers, width, height)]);
    for (const [name, run] of scenarios) {
      try {
        await run();
      } catch (error) {
        fail(`${width} ${name}: ${error.message}`);
      }
    }
  }
  console.log(`${passes} PASS, ${failures} FAIL`);
  exitCode = failures > 0 ? 1 : 0;
} finally {
  await browser.close();
  await servers.close();
}
process.exit(exitCode);
