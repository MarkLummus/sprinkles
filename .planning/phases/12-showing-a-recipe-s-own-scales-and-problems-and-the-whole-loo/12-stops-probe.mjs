// 12-06: the stops probe. It drives the BUILT app in WebKit and reports what the record pen shows
// for a Low to high scale (the bug row bug-p11-low-to-high-scale-centre-mark: the base draws
// "right" between a Low to high scale's ends).
//
//   PROBE_DIST=<dist> node 12-stops-probe.mjs report <facet...>
//   PROBE_DIST=<dist> node 12-stops-probe.mjs check <facet...>
//   facets: pen (the record pen's anchors and stop names), reading (the tasting reading's cells),
//           editor (the creation editor's stops line and stray "right" words)
//
// `report` prints "REPORT <facet> <fact>" lines and exits 0. `check` prints "PASS <facet> <check>"
// or "FAIL <facet> <check>: <values>" and exits 1 on any FAIL; the checks hold the forms D-01 and
// D-02 decide (sketch 015 CONTRACT sections 1, 2 and 4). On a build of the base commit every
// facet fails, which is how the probe is shown to be able to fail.
// The probe reads the build from PROBE_DIST and
// NEVER builds or writes it; it serves that folder (never app/dist, which Mark's own
// `vite preview --host` serves) on an ephemeral 127.0.0.1 port through 08-walk-server.mjs, and
// every request to another host is aborted. Build to a scratch folder first:
//   npm --prefix app run build -- --outDir "$TMPDIR/sprinkles-12/dist-x" --emptyOutDir
//
// The sketch 015 example recipes, and how the app is brought to them, come from 12-cases.mjs.
// Each scale is read INSIDE its own .axis-mark, never page-wide: every scale has a stop of each
// value, and after 12-01 a bare "2" is also the first part of Body's "2: leaning thin"
// (RESEARCH Pitfall 5). Everything typed is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { arrive } from './12-cases.mjs';
import { existsSync } from 'node:fs';
import path from 'node:path';

// playwright-core: the one place the probe names a Playwright path. Override it with
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

// No default: the probe must never fall back to app/dist.
if (!process.env.PROBE_DIST) {
  console.log('FAIL PROBE_DIST is not set: build to a scratch folder and pass it (the probe never serves app/dist)');
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

// The creation editor's stops line for Coffee flavour, faint to strong, Low to high (12-01's A1
// form). One constant: a veto of A1 is a one-line edit here (12-01, "If Mark vetoes A1", item 4).
const EDITOR_STOPS = 'faint · 2 · 3 · 4 · strong';

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

// A first click after a navigation can miss, so every opener is clicked until its target shows.
async function clickUntil(page, clickTarget, doneSelector, label) {
  for (let i = 0; i < 4; i += 1) {
    await clickTarget().click();
    try {
      await page.waitForSelector(doneSelector, { timeout: 1500 });
      return;
    } catch {
      // try again
    }
  }
  throw new Error(`${label}: ${doneSelector} never appeared`);
}

// ---------------------------------------------------------------------------
// Facet pen: case two, the record pen with the tasting open.
// A facet's collect() returns { facts: [text...], checks: [{ name, ok, values }...] }.
// ---------------------------------------------------------------------------
async function collectPen(browser, appUrl) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    await arrive(page, appUrl, 'two');
    const log = page.locator('.notebook-log');
    // The words BatchRow.jsx renders: "Record another" (808), "Record batch" on a version with none (1337).
    await clickUntil(page, () => log.getByRole('button', { name: /^Record (batch|another)$/ }).first(), 'button:has-text("Add tasting")', 'open the record pen');
    await clickUntil(page, () => log.getByRole('button', { name: /add tasting/i }).first(), '.notebook-log .axis-mark', 'press Add tasting');
    await page.waitForTimeout(300);
    // Each scale read inside its own .axis-mark.
    const scales = await page.evaluate(() =>
      [...document.querySelectorAll('.notebook-log .axis-mark')].map((a) => ({
        name: a.querySelector('.axis-mark__name').textContent,
        anchors: [...a.querySelectorAll('.axis-mark__anchors span')].map((s) => s.textContent),
        names: [...a.querySelectorAll('input[type="radio"]')].map((i) => i.getAttribute('aria-label')),
      })),
    );
    const facts = [];
    const checks = [];
    // Coffee flavour is Low to high (two ends, no middle word); Body is Right in the middle.
    const EXPECT = {
      'Coffee flavour': { anchors: ['faint', 'strong'], names: ['1: faint', '2', '3', '4', '5: strong'] },
      Body: { anchors: ['thin', 'right', 'heavy'], names: ['1: thin', '2: leaning thin', '3: right', '4: leaning heavy', '5: heavy'] },
    };
    for (const [wanted, expect] of Object.entries(EXPECT)) {
      const s = scales.find((x) => x.name === wanted);
      if (!s) {
        facts.push(`${wanted}: no such scale in the pen (scales: ${scales.map((x) => x.name).join(', ')})`);
        checks.push({ name: `${wanted} is in the pen`, ok: false, values: `scales: ${scales.map((x) => x.name).join(', ')}` });
        continue;
      }
      facts.push(`${wanted} anchors: ${JSON.stringify(s.anchors)}`);
      facts.push(`${wanted} stop names: ${JSON.stringify(s.names)}`);
      checks.push(sameList(`${wanted} anchors`, s.anchors, expect.anchors));
      checks.push(sameList(`${wanted} stop names`, s.names, expect.names));
    }
    return { facts, checks };
  } finally {
    await context.close();
  }
}

// A check of one list against the list it must equal.
function sameList(name, got, want) {
  const ok = got.length === want.length && got.every((x, i) => x === want[i]);
  return { name, ok, values: `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}` };
}

// ---------------------------------------------------------------------------
// Facet reading: the tasting reading of the seeded batch, the Tasting fold open.
// Case two, then case one, each in a context of its own (a fresh IndexedDB).
// ---------------------------------------------------------------------------
async function readCells(browser, appUrl, caseKey) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    await arrive(page, appUrl, caseKey);
    const fold = page.locator('.notebook-log [aria-expanded="false"]').filter({ hasText: /^Tasting/ }).first();
    const firstCell = page.locator('.tasting-reading .batch-row__cell').first();
    for (let i = 0; i < 4; i += 1) {
      if ((await firstCell.count()) > 0 && (await firstCell.isVisible())) break;
      if ((await fold.count()) > 0) await fold.click();
      await page.waitForTimeout(500);
    }
    await firstCell.waitFor({ state: 'visible' });
    return await page.evaluate(() =>
      [...document.querySelectorAll('.tasting-reading .batch-row__cell')].map((c) => ({
        label: c.querySelector('.batch-row__cell-label')?.textContent ?? '',
        value: c.querySelector('.batch-row__cell-value')?.textContent ?? '',
      })),
    );
  } finally {
    await context.close();
  }
}

async function collectReading(browser, appUrl) {
  const facts = [];
  const checks = [];
  const WANT = { two: { 'Coffee flavour': '2 of 5', Body: 'heavy (4)' }, one: { Mint: 'strong (5)' } };
  for (const [caseKey, want] of Object.entries(WANT)) {
    const cells = await readCells(browser, appUrl, caseKey);
    for (const c of cells) facts.push(`case ${caseKey} cell ${c.label}: ${c.value}`);
    for (const [label, value] of Object.entries(want)) {
      const cell = cells.find((c) => c.label === label);
      checks.push({
        name: `case ${caseKey} ${label} reads ${value}`,
        ok: cell?.value === value,
        values: cell ? `got ${JSON.stringify(cell.value)}` : `no cell labelled ${label} (cells: ${cells.map((c) => c.label).join(', ')})`,
      });
    }
  }
  return { facts, checks };
}

// ---------------------------------------------------------------------------
// Facet editor: the creation editor's Scales region with one Low to high scale.
// ---------------------------------------------------------------------------
async function collectEditor(browser, appUrl) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    await page.goto(`${appUrl}/notebook`, { waitUntil: 'load' });
    await page.waitForSelector('.nb__head .notebook-action');
    await clickUntil(page, () => page.locator('.nb__head .notebook-action'), '.nb__new textarea', 'open the New recipe entry');
    await page.fill('.nb__new textarea', 'Coffee');
    await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click();
    await page.waitForFunction(() => location.pathname === '/notebook/new');
    await page.waitForSelector('.notebook.mk-page');
    const scales = page.locator('section[aria-label="Scales"]');
    await clickUntil(page, () => scales.getByRole('button', { name: 'Add scale' }), '[aria-label="Scale 1"]', 'press Add scale');
    const card = scales.locator('[aria-label="Scale 1"]');
    await card.getByLabel('Name', { exact: true }).fill('Coffee flavour');
    await card.getByLabel('Low end', { exact: true }).fill('faint');
    await card.getByLabel('High end', { exact: true }).fill('strong');
    const kind = card.getByRole('radio', { name: 'Low to high' });
    for (let i = 0; i < 4 && !(await kind.isChecked()); i += 1) {
      await card.locator('.segmented__option', { hasText: /^Low to high$/ }).click();
      await page.waitForTimeout(400);
    }
    await card.locator('.mk-stops').waitFor({ state: 'visible' });
    await page.waitForTimeout(300);
    const stops = (await card.locator('.mk-stops').textContent()).trim();
    // Every text node of the Scales section that holds the word right (whole word, any case), with
    // the class of the nearest classed element at or above its parent, and whether it sits inside a
    // Kind option's label: that option's words sit in an unclassed span (Segmented.jsx:79).
    const rights = await page.evaluate(() => {
      const root = document.querySelector('section[aria-label="Scales"]');
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const found = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (/\bright\b/i.test(node.textContent)) {
          found.push({
            text: node.textContent.trim(),
            cls: node.parentElement?.closest('[class]')?.className ?? '',
            inKindOption: !!node.parentElement?.closest('.segmented__option'),
          });
        }
      }
      return found;
    });
    const facts = [`.mk-stops: ${JSON.stringify(stops)}`];
    for (const r of rights) facts.push(`word right in ${JSON.stringify(r.text)} (class ${JSON.stringify(r.cls)}, inside a Kind option: ${r.inKindOption})`);
    if (rights.length === 0) facts.push('word right: no text node in the Scales section holds it');
    const stray = rights.filter((r) => !r.inKindOption);
    const checks = [
      { name: `.mk-stops reads ${JSON.stringify(EDITOR_STOPS)}`, ok: stops === EDITOR_STOPS, values: `got ${JSON.stringify(stops)}` },
      { name: 'no word right outside a Kind option label', ok: stray.length === 0, values: stray.map((r) => `${JSON.stringify(r.text)} (class ${JSON.stringify(r.cls)})`).join('; ') },
    ];
    return { facts, checks };
  } finally {
    await context.close();
  }
}

const FACETS = { pen: collectPen, reading: collectReading, editor: collectEditor };

async function main() {
  const [mode, ...wanted] = process.argv.slice(2);
  if (!['report', 'check'].includes(mode) || wanted.length === 0 || wanted.some((f) => !FACETS[f])) {
    console.log(`FAIL usage: PROBE_DIST=<dist> node 12-stops-probe.mjs <report|check> <${Object.keys(FACETS).join('|')}...>`);
    process.exit(1);
  }
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  let failed = false;
  try {
    for (const facet of wanted) {
      let result;
      try {
        result = await FACETS[facet](browser, appUrl);
      } catch (error) {
        failed = true;
        console.log(`FAIL ${facet} could not read the build: ${String(error.message).split('\n')[0]}`);
        continue;
      }
      if (mode === 'report') {
        for (const fact of result.facts) console.log(`REPORT ${facet} ${fact}`);
      } else {
        for (const check of result.checks) {
          if (check.ok) console.log(`PASS ${facet} ${check.name}`);
          else {
            failed = true;
            console.log(`FAIL ${facet} ${check.name}: ${check.values}`);
          }
        }
      }
    }
  } finally {
    await browser.close();
    await close();
  }
  process.exit(failed ? 1 : 0);
}

await main();
