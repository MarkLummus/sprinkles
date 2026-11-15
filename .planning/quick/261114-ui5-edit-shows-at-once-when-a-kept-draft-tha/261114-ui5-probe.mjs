// Quick 261114-ui5 probe: bug-edit-missing-after-misfit-draft-dropped. Proves, in Playwright WebKit and in
// Chrome (playwright-core chromium, channel 'chrome') on scratch builds of the real app at 1366x1024, that on a
// first version with no batch (Olive Oil v1 with its batches removed) a kept draft that no longer fits is dropped
// on open and Edit then shows at once, where the base build shows no Edit until a reload.
//   W0 control: remove the batches, store no draft, load the page; Edit shows.
//   W1 misfit: remove the batches, store a plan draft whose rows fit nothing, reload; record the acts row, whether
//      Edit, Cancel and the stored draft are there; then reload again and read once more.
//   W2 garbage: the same with a draft whose kind names no draft family.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S="${TMPDIR:-/tmp}/sprinkles-ui5"
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   node <this file> check "$S/after.json" --base "$S/base.json"
// It starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST
// through 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host.
// Everything typed or printed is English. Prints PASS/FAIL/INFO lines and ends "N PASS, M FAIL"
// (exit 1 on any FAIL).
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}

const CFG = { width: 1366, height: 1024, touch: false, dpr: 1 };
const PAGE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const VERSION_ID = 'olive-oil-ice-cream-v1';

// Empty rows against the version's seven rows fail draftMatchesVersion.
const MISFIT_PLAN = {
  shapeVersion: 1,
  versionId: VERSION_ID,
  kind: 'plan',
  payload: {
    versionLabel: 'Probe misfit',
    reason: '',
    sheetTitle: '',
    sheetDescription: '',
    citedBatchId: null,
    rows: {},
    method: [],
    authored: { beforeYouStart: [] },
  },
  amendingBatchId: null,
  amendBaseline: null,
  amendOpener: 'correct',
  penOpenedAt: null,
  updatedAt: '2026-11-14T12:00:00.000Z',
};
const GARBAGE = { ...MISFIT_PLAN, kind: 'scribble' };

const [, , mode, file, ...rest] = process.argv;
if (mode !== 'record' && mode !== 'check') {
  console.log('FAIL usage: record <out.json> | check <after.json> --base <base.json>');
  process.exit(1);
}

async function openPage(browser) {
  const context = await browser.newContext({
    viewport: { width: CFG.width, height: CFG.height },
    hasTouch: CFG.touch,
    deviceScaleFactor: CFG.dpr,
  });
  await context.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  return { context, page };
}

async function waitForPage(page) {
  await page.waitForSelector('.notebook-version');
  await page.getByRole('button', { name: 'Next version' }).first().waitFor();
}

// Goes to the page (the app seeds its store), removes the version's batches, stores the draft (or none), and
// reloads onto the new state.
async function seed(page, base, draft) {
  await page.goto(`${base}${PAGE}`, { waitUntil: 'networkidle' });
  await waitForPage(page);
  await page.evaluate(
    ({ draft, versionId }) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open('sprinkles');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction(['batches', 'drafts'], 'readwrite');
          const batches = tx.objectStore('batches');
          const all = batches.getAll();
          all.onsuccess = () => {
            for (const batch of all.result) if (batch.versionId === versionId) batches.delete(batch.id);
            if (draft) tx.objectStore('drafts').put(draft);
          };
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { draft, versionId: VERSION_ID },
  );
  await page.reload({ waitUntil: 'networkidle' });
  await waitForPage(page);
}

// Waits up to 3 s for Edit, then reads the page.
async function read(page) {
  await page
    .waitForFunction(
      () => [...document.querySelectorAll('.notebook-version__acts > *')].some((n) => n.textContent.trim() === 'Edit'),
      null,
      { timeout: 3000 },
    )
    .catch(() => {});
  const seen = await page.evaluate(() => {
    const acts = [...document.querySelectorAll('.notebook-version__acts > *')].map((n) => n.textContent.trim());
    const cancelShown = [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Cancel');
    return { acts, editShown: acts.includes('Edit'), cancelShown };
  });
  const draftStored = await page.evaluate(
    (versionId) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open('sprinkles');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const get = db.transaction('drafts').objectStore('drafts').get(versionId);
          get.onsuccess = () => {
            db.close();
            resolve(get.result !== undefined);
          };
          get.onerror = () => reject(get.error);
        };
      }),
    VERSION_ID,
  );
  return { ...seen, draftStored };
}

async function walk(browser, base, draft, reloadAfter) {
  const { context, page } = await openPage(browser);
  await seed(page, base, draft);
  const result = await read(page);
  if (reloadAfter) {
    await page.reload({ waitUntil: 'networkidle' });
    await waitForPage(page);
    result.reloaded = await read(page);
  }
  await context.close();
  return result;
}

if (mode === 'record') {
  if (!process.env.PROBE_DIST || !existsSync(path.join(process.env.PROBE_DIST, 'index.html'))) {
    console.log('FAIL PROBE_DIST must name a directory holding index.html (a scratch build)');
    process.exit(1);
  }
  const { webkit, chromium } = await import(PLAYWRIGHT_CORE);
  const servers = await startServers({ appRoot: path.resolve(process.env.PROBE_DIST) });
  const out = {};
  const engines = [
    ['webkit', () => webkit.launch()],
    ['chrome', () => chromium.launch({ channel: 'chrome' })],
  ];
  for (const [name, launch] of engines) {
    let browser;
    try {
      browser = await launch();
    } catch (err) {
      console.log(`INFO ${name} did not launch: ${String(err.message).split('\n')[0]}`);
      continue;
    }
    out[name] = {
      w0: await walk(browser, servers.appUrl, null, false),
      w1: await walk(browser, servers.appUrl, MISFIT_PLAN, true),
      w2: await walk(browser, servers.appUrl, GARBAGE, false),
    };
    const r = out[name];
    console.log(
      `INFO ${name}: W0 ${JSON.stringify(r.w0.acts)}; W1 ${JSON.stringify(r.w1.acts)} stored ${r.w1.draftStored} reloaded ${JSON.stringify(r.w1.reloaded.acts)}; W2 ${JSON.stringify(r.w2.acts)} stored ${r.w2.draftStored}`,
    );
    await browser.close();
  }
  await servers.close();
  writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`recorded ${Object.keys(out).join(' + ')} to ${file}`);
  process.exit(0);
}

// check
const baseIdx = rest.indexOf('--base');
if (baseIdx < 0 || !rest[baseIdx + 1]) {
  console.log('FAIL check needs --base <base.json>');
  process.exit(1);
}
const after = JSON.parse(readFileSync(file, 'utf8'));
const base = JSON.parse(readFileSync(rest[baseIdx + 1], 'utf8'));
let pass = 0;
let fail = 0;
const say = (ok, text) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${text}`);
  if (ok) pass += 1;
  else fail += 1;
};
for (const engine of ['webkit', 'chrome']) {
  if (!after[engine] || !base[engine]) {
    if (engine === 'webkit') say(false, `webkit not recorded in both files`);
    else console.log(`INFO ${engine} not recorded in both files; skipped`);
    continue;
  }
  const a = after[engine];
  const b = base[engine];
  say(
    b.w0.editShown && a.w0.editShown,
    `control ${engine}: Edit shows with no draft on a first version with no batch (base ${b.w0.editShown}, after ${a.w0.editShown})`,
  );
  say(
    !b.w1.editShown && !b.w1.draftStored && b.w1.reloaded.editShown,
    `base reproduces the bug ${engine}: misfit draft deleted (stored ${b.w1.draftStored}), Edit ${b.w1.editShown} until reload, then ${b.w1.reloaded.editShown}`,
  );
  say(
    a.w1.editShown &&
      !a.w1.draftStored &&
      !a.w1.cancelShown &&
      JSON.stringify(a.w1.acts) === JSON.stringify(a.w0.acts),
    `W1 ${engine}: after, a misfit draft is dropped and Edit shows at once, acts ${JSON.stringify(a.w1.acts)}, stored ${a.w1.draftStored}, Cancel ${a.w1.cancelShown}`,
  );
  say(a.w1.reloaded.editShown, `W1 ${engine}: after, Edit still shows after a reload`);
  say(
    a.w2.editShown && !a.w2.draftStored,
    `W2 ${engine}: after, a garbage-kind draft is dropped and Edit shows (Edit ${a.w2.editShown}, stored ${a.w2.draftStored})`,
  );
  console.log(`INFO ${engine}: base W2 editShown ${b.w2.editShown} (expected false)`);
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
