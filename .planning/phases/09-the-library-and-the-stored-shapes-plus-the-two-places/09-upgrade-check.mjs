// 09-17: the stored-9-to-10 reset and reopen, in WebKit, on the final build
// (LIB-06, decisions 2 and 5, threat T-09-39). fake-indexeddb does not establish
// browser persistence, and the upgrade must be seen on the build that reaches a
// device, so a profile stored by the base commit's build (DB_VERSION 9) is opened
// by the final build at the same origin.
//
// Usage (from the repo root; 09-upgrade-check.sh builds both and runs this):
//   BASE_DIST=<base build> PROBE_DIST=<final build> node .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-upgrade-check.mjs
//
// One WebKit context answers every request to http://sprinkles-upgrade.test from
// the active build directory (the file at the path, or index.html for a path with
// no extension) and aborts any other host, so both builds share one origin and one
// IndexedDB. It prints PASS or FAIL per check and exits 1 on any FAIL. Every raw
// indexedDB.open this script makes inside page.evaluate closes its connection in a
// finally block, so no raw connection blocks the next build's upgrade. Nothing
// here writes app/dist or contacts :4173. Everything typed into the app is English.
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { library } from '../../../app/src/data/library.js';
import { librarySeedDb } from '../../../app/src/data/library-seed-db.js';
import { mexicanChocolateV1 } from '../../../app/src/data/mexican-chocolate.js';

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

if (!process.env.BASE_DIST || !process.env.PROBE_DIST) {
  console.log('FAIL BASE_DIST and PROBE_DIST must both be set (09-upgrade-check.sh sets them)');
  process.exit(1);
}
const BASE_DIST = path.resolve(process.env.BASE_DIST);
const PROBE_DIST = path.resolve(process.env.PROBE_DIST);
for (const dir of [BASE_DIST, PROBE_DIST]) {
  if (!existsSync(path.join(dir, 'index.html'))) {
    console.log(`FAIL no build at ${dir}`);
    process.exit(1);
  }
}

const ORIGIN = 'http://sprinkles-upgrade.test';
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

let failures = 0;
let passes = 0;
function report(ok, label, detail) {
  if (ok) passes += 1;
  else failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` (${detail})` : ''}`);
}

const SEEDED_LIBRARY_COUNT = Object.keys({ ...librarySeedDb, ...library }).length;
const ORIGINAL_LIBRARY_COUNT = Object.keys(library).length;
const MEXICAN_FIGURE = mexicanChocolateV1.iceEd.servingTemperatureC;

let active = BASE_DIST;
const browser = await webkit.launch();

try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) {
      await route.abort();
      return;
    }
    let filePath = path.join(active, decodeURIComponent(url.pathname));
    const isFile = (candidate) => existsSync(candidate) && statSync(candidate).isFile();
    if (path.extname(url.pathname) === '' && !isFile(filePath)) filePath = path.join(active, 'index.html');
    if (!filePath.startsWith(active) || !isFile(filePath)) {
      await route.fulfill({ status: 404, body: 'Not found' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream',
      body: await readFile(filePath),
    });
  });

  // The database as it stands: its version and every store's records. The
  // connection is closed in a finally block.
  const readDatabase = (page) =>
    page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('sprinkles');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        const out = { version: db.version, stores: {} };
        const names = [...db.objectStoreNames];
        const tx = db.transaction(names, 'readonly');
        await Promise.all(
          names.map(
            (name) =>
              new Promise((resolve, reject) => {
                const request = tx.objectStore(name).getAll();
                request.onsuccess = () => {
                  out.stores[name] = request.result;
                  resolve();
                };
                request.onerror = () => reject(request.error);
              }),
          ),
        );
        return out;
      } finally {
        db.close();
      }
    });

  const putRecord = (page, storeName, record) =>
    page.evaluate(
      async ([name, value]) => {
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open('sprinkles');
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        try {
          await new Promise((resolve, reject) => {
            const tx = db.transaction(name, 'readwrite');
            tx.objectStore(name).put(value);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
          });
        } finally {
          db.close();
        }
      },
      [storeName, record],
    );

  // Polls the stored database until `ready(snapshot)` holds (the app seeds after
  // it opens, so the first read can come before the rows are in).
  async function waitForDatabase(page, ready, label) {
    let last;
    for (let i = 0; i < 60; i += 1) {
      try {
        last = await readDatabase(page);
        if (ready(last)) return last;
      } catch {
        // the app has not opened the database yet
      }
      await page.waitForTimeout(250);
    }
    report(false, `${label}: the database reached the expected state`, last ? `version ${last.version}, library ${last.stores.library?.length}` : 'never opened');
    return last;
  }

  async function openApp(route = '/') {
    const page = await context.newPage();
    await page.goto(ORIGIN + route, { waitUntil: 'networkidle' });
    await page.waitForSelector('.shell');
    return page;
  }

  // ---- The base build writes a version-9 profile. -------------------------
  active = BASE_DIST;
  const basePage = await openApp('/');
  const stored9 = await waitForDatabase(basePage, (snap) => snap.version === 9 && snap.stores.library?.length === ORIGINAL_LIBRARY_COUNT, 'base build');
  report(
    stored9?.version === 9 && stored9.stores.library?.length === ORIGINAL_LIBRARY_COUNT,
    'the base build stored a version-9 profile with the original library',
    `version ${stored9?.version}, library ${stored9?.stores.library?.length}, expected ${ORIGINAL_LIBRARY_COUNT}`,
  );
  report(
    (stored9?.stores.versions?.length ?? 0) > 0 && !('machines' in (stored9?.stores ?? {})),
    'the version-9 profile holds seeded versions and none of the four seed tables',
    `versions ${stored9?.stores.versions?.length}, stores ${Object.keys(stored9?.stores ?? {}).sort().join(', ')}`,
  );
  // A record an import wrote into the library.
  await putRecord(basePage, 'library', { id: 'importedThing', entry: { name: 'Imported thing', composition: {} } });
  const withImport = await readDatabase(basePage);
  report(
    withImport.stores.library.some((record) => record.id === 'importedThing'),
    'an import-written library record is in the version-9 profile',
    `library ${withImport.stores.library.length}`,
  );
  await basePage.close();

  // ---- The final build opens the same profile. ----------------------------
  active = PROBE_DIST;
  const page = await openApp('/');
  const reset = await waitForDatabase(
    page,
    (snap) => snap.version === 10 && snap.stores.library?.length === SEEDED_LIBRARY_COUNT && snap.stores.machines?.length > 0 && snap.stores.versions?.length > 0,
    'final build',
  );
  report(reset?.version === 10, 'the final build opened the profile at version 10', `version ${reset?.version}`);
  report(
    !reset.stores.library.some((record) => record.id === 'importedThing'),
    'the import-written library record is gone after the reset',
  );
  report(
    reset.stores.library.length === SEEDED_LIBRARY_COUNT && SEEDED_LIBRARY_COUNT > ORIGINAL_LIBRARY_COUNT,
    "the library holds the larger seed's count",
    `${reset.stores.library.length}, seed ${SEEDED_LIBRARY_COUNT}, original ${ORIGINAL_LIBRARY_COUNT}`,
  );
  const tables = ['machines', 'styles', 'scales', 'problems'].map((name) => reset.stores[name]?.length);
  report(
    tables.join(',') === '1,4,6,4',
    'machines, styles, scales and problems are seeded with 1, 4, 6 and 4 rows',
    tables.join(', '),
  );

  const versionById = (snap, id) => snap.stores.versions.find((version) => version.id === id);
  const oliveOil = versionById(reset, 'olive-oil-ice-cream-v1');
  report(oliveOil?.sheetCode === '64JH-G408', "olive oil v1 stores the sheet code 64JH-G408", `${oliveOil?.sheetCode}`);
  report(
    oliveOil !== undefined && Object.hasOwn(oliveOil, 'serveTempC') && oliveOil.serveTempC === null && oliveOil.iceEd?.servingTemperatureC === null,
    "olive oil v1 owns serveTempC null (its Ice Ed figure is null, D-19)",
    `${JSON.stringify(oliveOil?.serveTempC)}`,
  );
  report(
    oliveOil?.rows?.length > 0 && oliveOil.rows.every((row) => typeof row.libraryId === 'string'),
    "olive oil v1's rows carry libraryId",
    `${oliveOil?.rows?.length} rows`,
  );
  const mexican = versionById(reset, 'mexican-chocolate-v1');
  report(
    mexican !== undefined && mexican.serveTempC === MEXICAN_FIGURE && mexican.serveTempC === -15,
    "mexican-chocolate-v1 owns serveTempC -15, its copied Ice Ed figure (D-19 as amended)",
    `stored ${JSON.stringify(mexican?.serveTempC)}, data file ${MEXICAN_FIGURE}`,
  );

  // Both places render on the reset profile.
  for (const [route, selector] of [['/notebook', '.nb__row'], ['/ingredients', '.ing__row']]) {
    const placePage = await openApp(route);
    let rows = 0;
    try {
      await placePage.waitForSelector(selector, { timeout: 8000 });
      rows = await placePage.locator(selector).count();
    } catch {
      rows = 0;
    }
    report(rows > 0, `${route} renders on the reset profile`, `${rows} rows`);
    await placePage.close();
  }
  await page.close();

  // ---- Reopen: nothing resets twice, a kept draft survives. ---------------
  const draftPage = await openApp('/notebook');
  const draft = { versionId: 'olive-oil-ice-cream-v1', note: 'kept after the upgrade' };
  await putRecord(draftPage, 'drafts', draft);
  const beforeReopen = await readDatabase(draftPage);
  await draftPage.reload({ waitUntil: 'networkidle' });
  await draftPage.waitForSelector('.shell');
  // Give the app's boot time to open and seed (it must write nothing).
  await draftPage.waitForTimeout(1500);
  const reopened = await readDatabase(draftPage);
  const counts = (snap) => Object.fromEntries(Object.entries(snap.stores).map(([name, rows]) => [name, rows.length]));
  report(reopened.version === 10, 'the reopened profile is still at version 10', `version ${reopened.version}`);
  const countsBefore = counts(beforeReopen);
  const countsAfter = counts(reopened);
  report(
    JSON.stringify(countsBefore) === JSON.stringify(countsAfter),
    'the reopen left every store count unchanged (no second reset)',
    Object.entries(countsAfter).map(([name, n]) => `${name} ${n}`).join(', '),
  );
  report(
    reopened.stores.drafts.length === 1 && JSON.stringify(reopened.stores.drafts[0]) === JSON.stringify(draft),
    'the draft written after the upgrade is still there after the reopen',
    `${reopened.stores.drafts.length} drafts`,
  );
  report(
    reopened.stores.library.length === SEEDED_LIBRARY_COUNT && !reopened.stores.library.some((record) => record.id === 'importedThing'),
    'the library is unchanged by the reopen',
    `${reopened.stores.library.length}`,
  );
  await draftPage.close();
  await context.close();
} finally {
  await browser.close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 || passes === 0 ? 1 : 0);
