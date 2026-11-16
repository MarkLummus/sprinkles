// 12-06: the stops probe. It drives the BUILT app in WebKit and reports what the record pen shows
// for a Low to high scale (the bug row bug-p11-low-to-high-scale-centre-mark: the base draws
// "right" between a Low to high scale's ends).
//
//   PROBE_DIST=<dist> node 12-stops-probe.mjs report <facet...>
//   facets so far: pen
//
// `report` prints "REPORT <facet> <fact>" lines. The probe reads the build from PROBE_DIST and
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
    for (const wanted of ['Coffee flavour', 'Body']) {
      const s = scales.find((x) => x.name === wanted);
      if (!s) {
        facts.push(`${wanted}: no such scale in the pen (scales: ${scales.map((x) => x.name).join(', ')})`);
        continue;
      }
      facts.push(`${wanted} anchors: ${JSON.stringify(s.anchors)}`);
      facts.push(`${wanted} stop names: ${JSON.stringify(s.names)}`);
    }
    return { facts, scales };
  } finally {
    await context.close();
  }
}

const FACETS = { pen: collectPen };

async function main() {
  const [mode, ...wanted] = process.argv.slice(2);
  if (mode !== 'report' || wanted.length === 0 || wanted.some((f) => !FACETS[f])) {
    console.log(`FAIL usage: PROBE_DIST=<dist> node 12-stops-probe.mjs report <${Object.keys(FACETS).join('|')}...>`);
    process.exit(1);
  }
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  let failed = false;
  try {
    for (const facet of wanted) {
      const { facts } = await FACETS[facet](browser, appUrl);
      for (const fact of facts) console.log(`REPORT ${facet} ${fact}`);
    }
  } catch (error) {
    failed = true;
    console.log(`FAIL ${String(error.message).split('\n')[0]}`);
  } finally {
    await browser.close();
    await close();
  }
  process.exit(failed ? 1 : 0);
}

await main();
