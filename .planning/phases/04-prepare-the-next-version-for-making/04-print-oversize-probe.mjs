// Quick 261011-dz2 (decide-print-oversized-text-policy = visible state): the
// print route turns Print off with one short line when a block is too tall for
// one printed page, proved in real WebKit and Chrome on the built app.
//
// Usage, from the repo root, after a scratch build (never app/dist, which
// Mark's `vite preview` on :4173 serves):
//   npm --prefix app run build -- --outDir "$SCRATCH/dz2-dist" --emptyOutDir
//   PROBE_DIST="$SCRATCH/dz2-dist" node .planning/phases/04-prepare-the-next-version-for-making/04-print-oversize-probe.mjs
//
// (a) Every seed version: its print route is ready (data-print-ready), Print is
//     on, no line shows, and the Sheet code equals sheetCode(version). Olive
//     Oil v1 reads 64JH-G408.
// (b) The oversize case: Olive Oil v1's saved record gets a Before you start
//     note of one sentence repeated 150 times (the review's reproduction), the
//     route reloads, and Print is off, the line shows, no Sheet page picture is
//     drawn, and both log pictures still are.
//
// The expected line is read out of app/src/ui/PrintSheet.jsx, so the sentence
// keeps one home. Isolation: the 03.5 harness serves the build on an ephemeral
// 127.0.0.1 port and aborts every other host. Nothing here contacts :4173 or
// :8077. Chrome and Playwright's WebKit do not prove Mobile Safari: the iPad is
// Mark's device check.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, check, finish, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { seedRecipeGroups } from '../../../app/src/data/seed-recipes.js';
import { sheetCode } from '../../../app/src/domain/sheetCode.js';

const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');

const printSheetSource = readFileSync(path.join(REPO_ROOT, 'app', 'src', 'ui', 'PrintSheet.jsx'), 'utf8');
const LINE = printSheetSource.match(/export const PRINT_TOO_LONG_LINE = '([^']+)';/)?.[1];
if (!LINE) throw new Error('PRINT_TOO_LONG_LINE not found in app/src/ui/PrintSheet.jsx');

const OLIVE_VERSION_ID = 'olive-oil-ice-cream-v1';
const OLIVE_CODE = '64JH-G408';
const SENTENCE = 'Before starting, check the ingredients and equipment. ';

const ALL_VERSIONS = seedRecipeGroups.flatMap((group) =>
  group.versions.map((version) => ({
    id: version.id,
    code: sheetCode(version),
    route: `/notebook/${encodeURIComponent(version.recipeId)}/${encodeURIComponent(version.id)}/print`,
  })),
);
const OLIVE = ALL_VERSIONS.find((version) => version.id === OLIVE_VERSION_ID);

const state = { failures: [], count: 0 };
function ok(condition, label) {
  state.count += 1;
  check(state.failures, condition, label);
}

const printButton = (page) => page.getByRole('button', { name: 'Print', exact: true });
const lineLocator = (page) => page.locator('p.print-route__line', { hasText: LINE });

async function seedSweep({ browser, engine, appUrl }) {
  const { context, page } = await openApp(browser, appUrl, OLIVE.route, { width: 1280 });
  try {
    for (const version of ALL_VERSIONS) {
      await page.goto(`${appUrl}${version.route}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.print-route[data-print-ready="true"]', { timeout: 15000 });
      ok(await printButton(page).isEnabled(), `${engine}: ${version.id} Print is enabled`);
      ok((await lineLocator(page).count()) === 0, `${engine}: ${version.id} shows no too-long line`);
      const code = (await page.locator('.print-route__code').first().textContent())?.trim();
      ok(code === version.code, `${engine}: ${version.id} Sheet code ${code} equals ${version.code}`);
      if (version.id === OLIVE_VERSION_ID) ok(code === OLIVE_CODE, `${engine}: Olive Oil v1 reads ${OLIVE_CODE}`);
    }
    console.log(`${engine}: swept ${ALL_VERSIONS.length} seed versions`);
  } finally {
    await context.close();
  }
}

async function oversizeCase({ browser, engine, appUrl }) {
  const { context, page } = await openApp(browser, appUrl, OLIVE.route, { width: 1280 });
  try {
    await page.waitForSelector('.print-route[data-print-ready="true"]', { timeout: 15000 });
    // Rewrite the stored record in the page's own database. No version argument,
    // so no upgrade runs; the seed runs only on an empty database, so the edit stands.
    await page.evaluate(
      ({ id, text }) =>
        new Promise((resolve, reject) => {
          const open = indexedDB.open('sprinkles');
          open.onerror = () => reject(open.error);
          open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction('versions', 'readwrite');
            const versions = tx.objectStore('versions');
            const get = versions.get(id);
            get.onsuccess = () => {
              const record = get.result;
              record.authored.beforeYouStart = [{ text, inheritedFrom: null }];
              versions.put(record);
            };
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => reject(tx.error);
          };
        }),
      { id: OLIVE_VERSION_ID, text: SENTENCE.repeat(150) },
    );
    await page.reload({ waitUntil: 'networkidle' });
    await lineLocator(page).first().waitFor({ timeout: 15000 });

    ok((await lineLocator(page).count()) === 1, `${engine}: oversize: the line shows once`);
    ok(await printButton(page).isDisabled(), `${engine}: oversize: Print is disabled`);
    ok((await page.locator('.print-route[data-print-ready]').count()) === 0, `${engine}: oversize: data-print-ready is absent`);
    ok((await page.getByRole('img', { name: 'Sheet, page 1' }).count()) === 0, `${engine}: oversize: no Sheet page picture`);
    ok((await page.getByRole('img', { name: 'Batch log' }).count()) === 1, `${engine}: oversize: the Batch log picture is drawn`);
    ok((await page.getByRole('img', { name: 'Tasting log' }).count()) === 1, `${engine}: oversize: the Tasting log picture is drawn`);

    const measured = JSON.parse(await page.locator('.ps-measure').getAttribute('data-ps-measure'));
    ok(measured.measure.before > measured.height, `${engine}: oversize: the notes (${measured.measure.before}) are taller than the box (${measured.height})`);
    console.log(`${engine}: oversize before=${measured.measure.before} box height=${measured.height}`);
  } finally {
    await context.close();
  }
}

async function run() {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browsers = { webkit: await webkit.launch(), chrome: await launch() };
  try {
    for (const [engine, browser] of Object.entries(browsers)) {
      await seedSweep({ browser, engine, appUrl });
      await oversizeCase({ browser, engine, appUrl });
    }
  } finally {
    await Promise.all(Object.values(browsers).map((b) => b.close()));
    await close();
  }
  finish(state.failures, state.count, 'print-oversize-probe');
}

await run();
