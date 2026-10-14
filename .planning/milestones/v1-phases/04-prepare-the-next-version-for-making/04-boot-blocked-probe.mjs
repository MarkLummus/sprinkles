// Quick 261011-gko (WR-08): a second tab that holds the database open on the
// old version no longer hangs boot without a word. Boot shows what to do and
// goes on to Home by itself once that tab closes. Proved in real WebKit and
// Chrome on the built app.
//
// Usage, from the repo root, after a scratch build (never app/dist, which
// Mark's `vite preview` on :4173 serves):
//   npm --prefix app run build -- --outDir "$SCRATCH/gko-dist" --emptyOutDir
//   PROBE_DIST="$SCRATCH/gko-dist" node .planning/phases/04-prepare-the-next-version-for-making/04-boot-blocked-probe.mjs
//
// (a) Control: with no connection held, the app boots to Home and the boot
//     paragraph is gone, the blocked line never shown.
// (b) Blocked: page A (a same-origin static file that runs no app code) opens
//     the database at version 7 and keeps it open. Page B opens the app, and
//     its boot paragraph reads the blocked line. Page A closes its connection;
//     page B then shows Home's title and no boot paragraph remains.
//
// The expected line is read out of app/src/main.jsx, so the sentence keeps one
// home. Isolation: the 03.5 harness serves the build on an ephemeral
// 127.0.0.1 port; every other host is aborted here. Nothing here contacts
// :4173 or :8077. Chrome and Playwright's WebKit do not prove Mobile Safari:
// the iPad is Mark's device check.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, check, finish, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');

const mainSource = readFileSync(path.join(REPO_ROOT, 'app', 'src', 'main.jsx'), 'utf8');
const LINE = mainSource.match(/const STORE_BLOCKED_LINE = '([^']+)';/)?.[1];
if (!LINE) throw new Error('STORE_BLOCKED_LINE not found in app/src/main.jsx');

// A static file of the build that runs no app code, for the holding page.
const STATIC_FILE = readdirSync(path.join(DIST, 'assets')).find((name) => name.endsWith('.css'));
if (!STATIC_FILE) throw new Error(`no .css file in ${path.join(DIST, 'assets')}`);

const state = { failures: [], count: 0 };
function ok(condition, label) {
  state.count += 1;
  check(state.failures, condition, label);
}

async function newContext(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
  return context;
}

const HOME_TITLE = 'Pick up where you left off';

async function controlCase({ browser, engine, appUrl }) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    await page.goto(`${appUrl}/`, { waitUntil: 'networkidle' });
    await page.locator('h1.home__title', { hasText: HOME_TITLE }).waitFor({ timeout: 15000 });
    ok((await page.locator('p.app-boot').count()) === 0, `${engine}: control: no boot line remains`);
    ok(!(await page.content()).includes(LINE), `${engine}: control: the blocked line was never shown`);
  } finally {
    await context.close();
  }
}

async function blockedCase({ browser, engine, appUrl }) {
  const context = await newContext(browser);
  try {
    const holder = await context.newPage();
    await holder.goto(`${appUrl}/assets/${STATIC_FILE}`, { waitUntil: 'load' });
    await holder.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const request = indexedDB.open('sprinkles', 7);
          request.onupgradeneeded = () => {
            request.result.createObjectStore('versions', { keyPath: 'id' });
          };
          request.onsuccess = () => {
            window.heldConnection = request.result;
            resolve();
          };
          request.onerror = () => reject(request.error);
        }),
    );

    const booting = await context.newPage();
    await booting.goto(`${appUrl}/`, { waitUntil: 'domcontentloaded' });
    await booting.locator('p.app-boot', { hasText: LINE }).waitFor({ timeout: 15000 });
    ok((await booting.locator('p.app-boot').textContent()) === LINE, `${engine}: blocked: the boot line reads "${LINE}"`);
    ok((await booting.locator('h1.home__title').count()) === 0, `${engine}: blocked: Home has not rendered`);

    await holder.evaluate(() => window.heldConnection.close());
    await booting.locator('h1.home__title', { hasText: HOME_TITLE }).waitFor({ timeout: 15000 });
    ok((await booting.locator('p.app-boot').count()) === 0, `${engine}: unblocked: Home renders and no boot line remains`);
  } finally {
    await context.close();
  }
}

async function run() {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browsers = { webkit: await webkit.launch(), chrome: await launch() };
  try {
    for (const [engine, browser] of Object.entries(browsers)) {
      await controlCase({ browser, engine, appUrl });
      await blockedCase({ browser, engine, appUrl });
      console.log(`${engine}: control and blocked cases done`);
    }
  } finally {
    await Promise.all(Object.values(browsers).map((b) => b.close()));
    await close();
  }
  finish(state.failures, state.count, 'boot-blocked-probe');
}

await run();
