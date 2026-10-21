// Quick 261021-07s: where the page notice stands, measured in Playwright WebKit on a scratch build
// (decide-creation-notice-place; sketch 013 decision 23: under the bar, beside Import, kept on screen).
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-07s"
//   npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir
//   PROBE_DIST="$S/dist" node .planning/quick/261021-07s-move-the-page-notice-on-the-notebook-and/261021-07s-notice-probe.mjs
//
// It starts no Vite server and never reads or writes app/dist unless PROBE_DIST points there. The build
// is served on an ephemeral 127.0.0.1 port through 08-walk-server.mjs, and every request to a host other
// than 127.0.0.1 is aborted. playwright-core is loaded only through PLAYWRIGHT_CORE (default: the npx
// cache path below). Each viewport gets a fresh WebKit context with hasTouch. Every notice clears itself
// after 5 s, so each scenario measures within about 3 s of the press. Prints PASS or FAIL per gate, INFO
// lines with every measured box (not counted), and ends "N PASS, M FAIL" (exit 1 when M is above 0).
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync } from 'node:fs';
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
const { webkit } = await import(PLAYWRIGHT_CORE);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const DIST = path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'));

const NAME = 'Vanilla';
const KEPT_NOTICE = 'Draft kept. Cancel discards it.';
const IMPORT_NOTICE = 'Cancel the new recipe draft before importing.';

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

const notice = (page) => page.evaluate(() => document.querySelector('.page-status')?.textContent.trim() ?? '');
const pathOf = (page) => new URL(page.url()).pathname;

const r1 = (n) => Math.round(n * 10) / 10;
const box = (rect) => (rect ? `[${r1(rect.x)},${r1(rect.y)},${r1(rect.width)},${r1(rect.height)}]` : 'none');

// From 724 up Import sits in the bar's tools; below 724 it is inside More, in the bottom tab row.
async function pressImport(page, width) {
  if (width >= 724) {
    await press(page, page.locator('.shell__tools button', { hasText: 'Import' }), async () => (await notice(page)) === IMPORT_NOTICE);
    return;
  }
  const more = page.locator('.shell__more > summary');
  await readyFor(page, more);
  await more.tap({ timeout: 5000 });
  const importButton = page.locator('.shell__more button', { hasText: 'Import' });
  await importButton.waitFor({ state: 'visible', timeout: 5000 });
  await press(page, importButton, async () => (await notice(page)) === IMPORT_NOTICE);
}

async function measure(page) {
  return page.evaluate(() => {
    const rectOf = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const status = document.querySelector('.page-status');
    const head = document.querySelector('.shell__head');
    const caption = [...document.querySelectorAll('span.notebook-caption')].find(
      (el) => el.textContent.trim().toLowerCase() === 'recipe name',
    );
    let captionText = null;
    if (caption) {
      const range = document.createRange();
      range.selectNodeContents(caption);
      const r = range.getBoundingClientRect();
      captionText = { x: r.x, y: r.y, width: r.width, height: r.height };
    }
    return {
      scrollY: Math.round(window.scrollY),
      clientWidth: document.documentElement.clientWidth,
      innerHeight: window.innerHeight,
      status: rectOf(status),
      text: status?.textContent.trim() ?? '',
      marginTop: status ? parseFloat(getComputedStyle(status).marginTop) : 0,
      head: rectOf(head),
      headPaddingRight: head ? parseFloat(getComputedStyle(head).paddingRight) : 0,
      caption: rectOf(caption),
      captionText,
    };
  });
}

const overlap = (a, b) => {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

function gates(label, m, expectText, captionGate) {
  const n = m.status;
  const where = `${box(n)} at scrollY ${m.scrollY}`;
  if (m.text === expectText) pass(`${label} text: "${m.text}" ${where}`);
  else fail(`${label} text: "${m.text}" is not "${expectText}" ${where}`);
  if (!n) {
    fail(`${label} in view: no notice`);
    return;
  }
  const tol = 0.5;
  const inView =
    n.width > 0 && n.height > 0 && n.x >= -tol && n.y >= -tol && n.x + n.width <= m.clientWidth + tol && n.y + n.height <= m.innerHeight + tol;
  (inView ? pass : fail)(`${label} in view: ${where} in 0..${m.clientWidth} by 0..${m.innerHeight}`);
  const barBottom = Math.max(0, m.head ? m.head.y + m.head.height : 0);
  const wantTop = barBottom + m.marginTop;
  (Math.abs(n.y - wantTop) <= 1 ? pass : fail)(`${label} under the bar: top ${r1(n.y)}, want ${r1(wantTop)} ${where}`);
  const gutter = m.clientWidth - (n.x + n.width) - m.headPaddingRight;
  (Math.abs(gutter) <= 1 ? pass : fail)(`${label} at the gutter: right edge ${r1(n.x + n.width)} of ${m.clientWidth}, head padding ${m.headPaddingRight} ${where}`);
  if (captionGate) {
    if (!m.caption) fail(`${label} clear of Recipe name: no caption ${where}`);
    else (overlap(n, m.caption) === 0 ? pass : fail)(`${label} clear of Recipe name: caption ${box(m.caption)} ${where}`);
  }
}

const scrollEnd = (page) => page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
const scrollTop = (page) => page.evaluate(() => window.scrollTo(0, 0));
const settle = (page) => page.waitForTimeout(100);

// Scenario A: the creation editor, a draft started and a problem added.
async function scenarioEditor(page, servers, width) {
  await page.goto(`${servers.appUrl}/notebook`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.nb__count');
  await page.evaluate(() => document.fonts.ready);
  await press(page, page.locator('.nb__head .notebook-action'), () => page.locator('.nb__new input').isVisible());
  await type(page, page.locator('.nb__new input'), NAME);
  await press(page, page.locator('.nb__new-actions button', { hasText: /^Start$/ }), async () => pathOf(page) === '/notebook/new');
  await page.waitForSelector('.notebook.mk-page');
  await press(page, page.locator('.mk-region[aria-label="Problems"] .mk-add'), () => page.locator('.mk-card[aria-label="Problem 1"]').isVisible());
  await type(page, page.locator('.mk-card[aria-label="Problem 1"] input[aria-label="Name"]'), 'Bitter');
  await page.waitForTimeout(400);
  await page.locator('.mk-region[aria-label="Problems"]').scrollIntoViewIfNeeded();
  await settle(page);
  if (!((await page.evaluate(() => window.scrollY)) > 0)) {
    fail('editor did not scroll');
    return;
  }
  await pressImport(page, width);
  let m = await measure(page);
  gates('editor at Problems', m, IMPORT_NOTICE, true);
  await scrollEnd(page);
  await settle(page);
  m = await measure(page);
  gates('editor at page end', m, IMPORT_NOTICE, true);
  await scrollTop(page);
  await settle(page);
  m = await measure(page);
  if (width >= 1366) gates('editor at page top', m, IMPORT_NOTICE, true);
  else {
    gates('editor at page top', m, IMPORT_NOTICE, false);
    info(`editor at page top, residual: notice ${box(m.status)}, caption ${box(m.caption)}, caption text ${box(m.captionText)}`);
  }
}

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
let exitCode = 1;
try {
  for (const [width, height] of [
    [1366, 744],
    [393, 852],
  ]) {
    info(`viewport ${width}x${height}`);
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true });
    await context.route('**/*', (request) =>
      new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
    );
    const page = await context.newPage();
    const scenarios = [['editor', scenarioEditor]];
    for (const [name, run] of scenarios) {
      try {
        await run(page, servers, width);
      } catch (error) {
        fail(`${width} ${name}: ${error.message}`);
      }
    }
    await context.close();
  }
  console.log(`${passes} PASS, ${failures} FAIL`);
  exitCode = failures > 0 ? 1 : 0;
} finally {
  await browser.close();
  await servers.close();
}
process.exit(exitCode);
