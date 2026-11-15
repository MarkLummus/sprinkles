// Quick 261115-htp probe: WR-02 (11-REVIEW.md), a kept edit draft reopened after another tab saved over the
// version overwrote that save. Proves, in Playwright WebKit (required) and Chrome (playwright-core chromium,
// channel 'chrome') on scratch builds of the real app at 1366x1024, that the base build overwrites the other
// tab's save and the fixed build refuses it, keeps the saved content and ends on Cancel.
//   W0 control, one tab: edit, type, reload, resume, Save writes over the version.
//   W1 the WR-02 sequence: page A types (draft kept), page B resumes and saves a description, page A types
//      again (the draft is written back), page C resumes the written-back draft and presses Save.
//   W2 an old draft: a kept edit whose baseFingerprint key is removed from the store is opened and saved.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S="${TMPDIR:-/tmp}/sprinkles-htp"
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir   (at BASE, before the fix)
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   node <this file> check "$S/after.json" --base "$S/base.json"
// Two tabs are two pages in ONE browser context, so they share IndexedDB; each walk uses its own context.
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
const EDIT = `${PAGE}/edit`;
const VERSION_ID = 'olive-oil-ice-cream-v1';
const RECIPE_ID = 'olive-oil-ice-cream';
const CHANGED = 'This version changed in another tab. Cancel, then open it again.';

const [, , mode, file, ...rest] = process.argv;
if (mode !== 'record' && mode !== 'check') {
  console.log('FAIL usage: record <out.json> | check <after.json> --base <base.json>');
  process.exit(1);
}

async function openContext(browser) {
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

async function newTab(context) {
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  return page;
}

// Goes to the version page (the app seeds its store), removes the version's batches so it is an editable first
// version, and stores no draft.
async function seed(page, base) {
  await page.goto(`${base}${PAGE}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook-version');
  await page.evaluate(
    (versionId) =>
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
            tx.objectStore('drafts').delete(versionId);
          };
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    VERSION_ID,
  );
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook-version');
}

function dbGet(page, store, key) {
  return page.evaluate(
    ({ store, key }) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open('sprinkles');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const get = db.transaction(store).objectStore(store).get(key);
          get.onsuccess = () => {
            db.close();
            resolve(get.result ?? null);
          };
          get.onerror = () => reject(get.error);
        };
      }),
    { store, key },
  );
}

// An old draft: the stored edit record without its baseFingerprint key.
function dbStripBase(page) {
  return page.evaluate(
    (versionId) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open('sprinkles');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction('drafts', 'readwrite');
          const store = tx.objectStore('drafts');
          const get = store.get(versionId);
          get.onsuccess = () => {
            if (get.result) {
              const record = { ...get.result };
              delete record.baseFingerprint;
              store.put(record);
            }
          };
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    VERSION_ID,
  );
}

async function openEdit(page, base) {
  await page.goto(`${base}${EDIT}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('textarea[aria-label="Recipe name"]');
}

async function waitDraftName(page, name) {
  const until = Date.now() + 3000;
  while (Date.now() < until) {
    const draft = await dbGet(page, 'drafts', VERSION_ID);
    if (draft && draft.payload && draft.payload.name === name) return true;
    await page.waitForTimeout(100);
  }
  return false;
}

async function waitName(page, name) {
  await page
    .waitForFunction(
      (name) => document.querySelector('textarea[aria-label="Recipe name"]')?.value === name,
      name,
      { timeout: 5000 },
    )
    .catch(() => {});
}

const underSave = (page) =>
  page.evaluate(() => document.querySelector('.notebook-ceremony p.field-error')?.textContent ?? null);

async function pressSave(page) {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .waitForFunction(
      (pageUrl) => location.pathname.endsWith(pageUrl) || document.querySelector('.notebook-ceremony p.field-error'),
      PAGE.split('/').pop(),
      { timeout: 3000 },
    )
    .catch(() => {});
  await page.waitForTimeout(300);
}

const pathOf = (page) => new URL(page.url()).pathname;

async function reads(page) {
  const version = await dbGet(page, 'versions', VERSION_ID);
  const recipe = await dbGet(page, 'recipes', RECIPE_ID);
  const draft = await dbGet(page, 'drafts', VERSION_ID);
  return {
    sheetTitle: version?.sheetTitle ?? null,
    sheetDescription: version?.sheetDescription ?? null,
    recipeDescription: recipe?.description ?? null,
    draftKind: draft?.kind ?? null,
    draftStored: draft !== null,
  };
}

async function w0(browser, base) {
  const { context, page } = await openContext(browser);
  await seed(page, base);
  await openEdit(page, base);
  const titleBefore = (await reads(page)).sheetTitle;
  await page.getByLabel('Recipe name', { exact: true }).fill('Probe single');
  await waitDraftName(page, 'Probe single');
  const keptBaseType = typeof (await dbGet(page, 'drafts', VERSION_ID))?.baseFingerprint;
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('textarea[aria-label="Recipe name"]');
  await waitName(page, 'Probe single');
  const lineAtOpen = await underSave(page);
  await pressSave(page);
  const after = await reads(page);
  const result = { titleBefore, keptBaseType, lineAtOpen, path: pathOf(page), ...after };
  await context.close();
  return result;
}

async function w1(browser, base) {
  const { context, page: a } = await openContext(browser);
  await seed(a, base);
  await openEdit(a, base);
  await a.getByLabel('Recipe name', { exact: true }).fill('Probe A');
  await waitDraftName(a, 'Probe A');

  const b = await newTab(context);
  await openEdit(b, base);
  await waitName(b, 'Probe A');
  await b.getByLabel('Recipe description', { exact: true }).fill('Saved by B.');
  await pressSave(b);
  const bPath = pathOf(b);
  const afterB = await reads(b);

  await a.getByLabel('Recipe name', { exact: true }).fill('Probe A2');
  const writtenBack = await waitDraftName(a, 'Probe A2');
  await a.close();

  const c = await newTab(context);
  await openEdit(c, base);
  await waitName(c, 'Probe A2');
  const cLineAtOpen = await underSave(c);
  await pressSave(c);
  const cPath = pathOf(c);
  const cLine = await underSave(c);
  const afterC = await reads(c);

  let cancel = null;
  if (cPath.endsWith('/edit')) {
    await c.getByRole('button', { name: 'Cancel', exact: true }).click();
    await c.waitForURL((url) => !url.pathname.endsWith('/edit'), { timeout: 3000 }).catch(() => {});
    await c.waitForTimeout(300);
    cancel = { cancelPath: pathOf(c), ...(await reads(c)) };
  }
  await context.close();
  return { bPath, afterB, writtenBack, cLineAtOpen, cPath, cLine, afterC, cancel };
}

async function w2(browser, base) {
  const { context, page } = await openContext(browser);
  await seed(page, base);
  await openEdit(page, base);
  const titleBefore = (await reads(page)).sheetTitle;
  await page.getByLabel('Recipe name', { exact: true }).fill('Probe legacy');
  await waitDraftName(page, 'Probe legacy');
  await dbStripBase(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('textarea[aria-label="Recipe name"]');
  await waitName(page, 'Probe legacy');
  const lineAtOpen = await underSave(page);
  await pressSave(page);
  const after = await reads(page);
  const result = { titleBefore, lineAtOpen, path: pathOf(page), sheetTitle: after.sheetTitle };
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
      w0: await w0(browser, servers.appUrl),
      w1: await w1(browser, servers.appUrl),
      w2: await w2(browser, servers.appUrl),
    };
    const r = out[name];
    console.log(
      `INFO ${name}: W0 line ${JSON.stringify(r.w0.lineAtOpen)} path ${r.w0.path} title ${JSON.stringify(r.w0.sheetTitle)} base ${r.w0.keptBaseType}; ` +
        `W1 cLineAtOpen ${JSON.stringify(r.w1.cLineAtOpen)} cPath ${r.w1.cPath} desc ${JSON.stringify(r.w1.afterC.sheetDescription)}; ` +
        `W2 line ${JSON.stringify(r.w2.lineAtOpen)} path ${r.w2.path} title ${JSON.stringify(r.w2.sheetTitle)}`,
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
const isPage = (p) => typeof p === 'string' && p === PAGE;
const isEdit = (p) => typeof p === 'string' && p === EDIT;
for (const engine of ['webkit', 'chrome']) {
  if (!after[engine] || !base[engine]) {
    if (engine === 'webkit') say(false, 'webkit not recorded in both files');
    else console.log(`INFO ${engine} not recorded in both files; skipped`);
    continue;
  }
  const a = after[engine];
  const b = base[engine];
  for (const [label, r] of [['base', b], ['after', a]]) {
    say(
      r.w0.lineAtOpen === null && isPage(r.w0.path) && r.w0.sheetTitle === 'Probe single' && !r.w0.draftStored,
      `control ${engine} ${label}: a kept edit reopens with no line and Save writes over the version (line ${JSON.stringify(r.w0.lineAtOpen)}, path ${r.w0.path}, title ${JSON.stringify(r.w0.sheetTitle)}, draft ${r.w0.draftStored})`,
    );
    say(
      isPage(r.w1.bPath) &&
        r.w1.afterB.sheetDescription === 'Saved by B.' &&
        r.w1.afterB.recipeDescription === 'Saved by B.' &&
        !r.w1.afterB.draftStored &&
        r.w1.writtenBack,
      `W1 setup ${engine} ${label}: B saved over the version, its draft is gone, and A wrote the edit draft back (bPath ${r.w1.bPath}, written back ${r.w1.writtenBack})`,
    );
  }
  say(
    a.w0.keptBaseType === 'string',
    `W0 ${engine} after: the kept edit record carries a baseFingerprint string (${a.w0.keptBaseType})`,
  );
  console.log(`INFO ${engine}: base W0 keptBaseType ${b.w0.keptBaseType} (expected undefined)`);
  say(
    b.w1.cLineAtOpen === null && isPage(b.w1.cPath) && b.w1.afterC.sheetDescription !== 'Saved by B.',
    `base reproduces WR-02 ${engine}: C opens with no line (${JSON.stringify(b.w1.cLineAtOpen)}), Save lands on ${b.w1.cPath}, description now ${JSON.stringify(b.w1.afterC.sheetDescription)}`,
  );
  say(
    a.w1.cLineAtOpen === CHANGED &&
      isEdit(a.w1.cPath) &&
      a.w1.cLine === CHANGED &&
      a.w1.afterC.sheetDescription === 'Saved by B.' &&
      a.w1.afterC.recipeDescription === 'Saved by B.' &&
      a.w1.afterC.draftKind === 'edit',
    `W1 ${engine} after: C opens refused, Save stays on the edit address, B's content stays, the draft stays (path ${a.w1.cPath}, line ${JSON.stringify(a.w1.cLine)}, description ${JSON.stringify(a.w1.afterC.sheetDescription)}, draft ${a.w1.afterC.draftKind})`,
  );
  say(
    a.w1.cancel !== null &&
      isPage(a.w1.cancel.cancelPath) &&
      !a.w1.cancel.draftStored &&
      a.w1.cancel.sheetDescription === 'Saved by B.',
    `W1 ${engine} after: Cancel lands on the version page, the draft is gone and B's content is intact (${JSON.stringify(a.w1.cancel)})`,
  );
  say(
    a.w2.lineAtOpen === CHANGED && isEdit(a.w2.path) && a.w2.sheetTitle === a.w2.titleBefore,
    `W2 ${engine} after: an old draft opens refused and Save writes nothing (line ${JSON.stringify(a.w2.lineAtOpen)}, path ${a.w2.path}, title ${JSON.stringify(a.w2.sheetTitle)} against ${JSON.stringify(a.w2.titleBefore)})`,
  );
  console.log(`INFO ${engine}: base W2 path ${b.w2.path}, title ${JSON.stringify(b.w2.sheetTitle)} (expected saved)`);
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
