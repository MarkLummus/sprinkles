// Quick 261115-hto probe: WR-01 (11-REVIEW.md), a create draft written back after another tab saved the creation.
// Proves, in Playwright WebKit and in Chrome (playwright-core chromium, channel 'chrome') on scratch builds of the
// real app at 1366x1024, that with two pages (tabs) of one browser context sharing one IndexedDB, the base build
// leaves a ghost create draft (generic failure line, no Edit, a Notebook draft row) and the fixed build does not.
//   W0 control, one page: seed a create draft, open the editor, Save; lands on the recipe with Edit, no draft.
//   W1 typed after: pages A and B hold the editor, A saves, B types a description, B saves, a third page C reads
//      the recipe page and the Notebook.
//   W2 saved after: as W1 without the typing.
//   W3 ghost from an older build: A saves, the create draft is put back by hand, a new page B opens the editor
//      and saves.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S="${TMPDIR:-/tmp}/sprinkles-hto"
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
const RECIPE_ID = 'r-probe-wr01';
const VERSION_ID = 'v-probe-wr01';
const PAGE = `/notebook/${RECIPE_ID}/${VERSION_ID}`;
const GENERIC_LINE = 'Couldn’t save the recipe. Try again.';
const TYPED = 'Typed in B after A saved.';

const DRAFT = {
  shapeVersion: 1,
  versionId: VERSION_ID,
  kind: 'create',
  payload: {
    recipeId: RECIPE_ID,
    versionId: VERSION_ID,
    name: 'Probe vanilla',
    description: '',
    versionLabel: 'Version 1',
    beforeYouStart: [],
    rows: [{ id: 'row-a', libraryId: 'sucrose', portions: [{ step: 1, grams: '150' }] }],
    method: [],
    scales: [],
    problems: [],
    style: null,
    targets: {},
    serveTempC: '',
  },
  amendingBatchId: null,
  amendBaseline: null,
  amendOpener: 'correct',
  penOpenedAt: null,
  updatedAt: '2026-11-15T10:00:00.000Z',
};

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
  return context;
}

async function newTab(context) {
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  return page;
}

// Puts the record in the drafts store; resolves true on the transaction's complete event.
function idbPut(page, record) {
  return page.evaluate(
    (record) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open('sprinkles');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction('drafts', 'readwrite');
          tx.objectStore('drafts').put(record);
          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    record,
  );
}

// The stored draft's kind, or null.
function idbKind(page, id) {
  return page.evaluate(
    (id) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open('sprinkles');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction('drafts');
          const get = tx.objectStore('drafts').get(id);
          tx.oncomplete = () => {
            db.close();
            resolve(get.result ? get.result.kind : null);
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    id,
  );
}

// The app seeds its store on the Notebook; then the create draft goes in.
async function seed(page, base) {
  await page.goto(`${base}/notebook`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'New recipe' }).first().waitFor();
  await idbPut(page, DRAFT);
}

async function openEditor(page, base) {
  await page.goto(`${base}/notebook/new`, { waitUntil: 'networkidle' });
  await page.waitForSelector('textarea[aria-label="Recipe name"]');
}

async function save(page) {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

async function waitForPage(page) {
  await page.waitForFunction((target) => location.pathname === target, PAGE, { timeout: 5000 });
}

// Waits up to 3 s for Edit, then reads the pathname, the line under Save, the status and the acts.
async function readLanding(page) {
  await page
    .waitForFunction(
      () => [...document.querySelectorAll('.notebook-version__acts > *')].some((n) => n.textContent.trim() === 'Edit'),
      null,
      { timeout: 3000 },
    )
    .catch(() => {});
  return page.evaluate(() => ({
    pathname: location.pathname,
    line: [...document.querySelectorAll('.notebook-ceremony p.field-error')].map((n) => n.textContent).join(' '),
    status: document.querySelector('.page-status')?.textContent ?? '',
    acts: [...document.querySelectorAll('.notebook-version__acts > *')].map((n) => n.textContent.trim()),
  }));
}

async function readNotebook(page, base) {
  await page.goto(`${base}/notebook`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  return page.evaluate(() => document.querySelectorAll('.nb__draft').length);
}

async function leaveEditor(page) {
  await page.waitForFunction(() => location.pathname !== '/notebook/new', null, { timeout: 5000 }).catch(() => {});
}

async function walk0(browser, base) {
  const context = await openContext(browser);
  const a = await newTab(context);
  await seed(a, base);
  await openEditor(a, base);
  await save(a);
  await leaveEditor(a);
  const landing = await readLanding(a);
  const kind = await idbKind(a, VERSION_ID);
  await context.close();
  return { ...landing, kind };
}

async function twoTabs(browser, base, typing) {
  const context = await openContext(browser);
  const a = await newTab(context);
  const b = await newTab(context);
  await seed(a, base);
  await openEditor(a, base);
  await openEditor(b, base);
  await save(a);
  await waitForPage(a);
  const result = {};
  if (typing) {
    await b.fill('textarea[aria-label="Recipe description"]', TYPED);
    await b.waitForTimeout(800);
    result.afterType = await idbKind(b, VERSION_ID);
  }
  await save(b);
  await b.waitForTimeout(1500);
  result.b = await readLanding(b);
  result.kind = await idbKind(b, VERSION_ID);
  if (typing) {
    const c = await newTab(context);
    await c.goto(`${base}${PAGE}`, { waitUntil: 'networkidle' });
    result.c = await readLanding(c);
    result.draftRow = await readNotebook(c, base);
  }
  await context.close();
  return result;
}

async function walk3(browser, base) {
  const context = await openContext(browser);
  const a = await newTab(context);
  await seed(a, base);
  await openEditor(a, base);
  await save(a);
  await waitForPage(a);
  // The ghost an older build could leave.
  await idbPut(a, DRAFT);
  const b = await newTab(context);
  await b.goto(`${base}/notebook/new`, { waitUntil: 'networkidle' });
  const editorOpens = await b
    .waitForSelector('textarea[aria-label="Recipe name"]', { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  let result = { editorOpens };
  if (editorOpens) {
    await save(b);
    await b.waitForTimeout(1500);
    result = { ...result, b: await readLanding(b), kind: await idbKind(b, VERSION_ID) };
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
      w0: await walk0(browser, servers.appUrl),
      w1: await twoTabs(browser, servers.appUrl, true),
      w2: await twoTabs(browser, servers.appUrl, false),
      w3: await walk3(browser, servers.appUrl),
    };
    const r = out[name];
    console.log(
      `INFO ${name}: W0 ${r.w0.pathname} acts ${JSON.stringify(r.w0.acts)} kind ${r.w0.kind}; W1 afterType ${r.w1.afterType} B ${r.w1.b.pathname} line "${r.w1.b.line}" kind ${r.w1.kind} C acts ${JSON.stringify(r.w1.c.acts)} draftRow ${r.w1.draftRow}; W2 B ${r.w2.b.pathname} line "${r.w2.b.line}" kind ${r.w2.kind}; W3 editor ${r.w3.editorOpens} B ${r.w3.b?.pathname} line "${r.w3.b?.line}" kind ${r.w3.kind}`,
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
const control = (w) => w.pathname === PAGE && w.status === 'Recipe saved.' && w.kind === null && w.acts.includes('Edit');
for (const engine of ['webkit', 'chrome']) {
  if (!after[engine] || !base[engine]) {
    if (engine === 'webkit') say(false, `webkit not recorded in both files`);
    else console.log(`INFO ${engine} not recorded in both files; skipped`);
    continue;
  }
  const a = after[engine];
  const b = base[engine];
  say(control(b.w0), `control ${engine}, base: one tab saves, lands on the recipe with Recipe saved., no draft, Edit ${JSON.stringify(b.w0.acts)}`);
  say(control(a.w0), `control ${engine}, after: one tab saves, lands on the recipe with Recipe saved., no draft, Edit ${JSON.stringify(a.w0.acts)}`);

  // The base build reproduces.
  say(
    b.w1.afterType === 'create' &&
      b.w1.b.pathname === '/notebook/new' &&
      b.w1.b.line === GENERIC_LINE &&
      b.w1.kind === 'create' &&
      !b.w1.c.acts.includes('Edit') &&
      b.w1.draftRow === 1,
    `base reproduces W1 ${engine}: afterType ${b.w1.afterType}, B at ${b.w1.b.pathname} "${b.w1.b.line}", kind ${b.w1.kind}, C acts ${JSON.stringify(b.w1.c.acts)}, draftRow ${b.w1.draftRow}`,
  );
  // With nothing typed in B, the writer holds no record to put back, so the base build leaves no ghost here
  // (kind null); the stuck page and the generic line are the base's reading.
  say(
    b.w2.b.pathname === '/notebook/new' && b.w2.b.line === GENERIC_LINE,
    `base reproduces W2 ${engine}: B at ${b.w2.b.pathname} "${b.w2.b.line}" (kind ${b.w2.kind}, no ghost when nothing was typed)`,
  );
  say(
    b.w3.editorOpens && b.w3.b.pathname === '/notebook/new' && b.w3.b.line === GENERIC_LINE && b.w3.kind === 'create',
    `base reproduces W3 ${engine}: editor ${b.w3.editorOpens}, B at ${b.w3.b?.pathname} "${b.w3.b?.line}", kind ${b.w3.kind}`,
  );

  // The fixed build.
  say(
    a.w1.afterType === null &&
      a.w1.b.pathname === PAGE &&
      a.w1.b.line === '' &&
      a.w1.kind === null &&
      a.w1.c.acts.includes('Edit') &&
      JSON.stringify(a.w1.c.acts) === JSON.stringify(a.w0.acts) &&
      a.w1.draftRow === 0,
    `W1 ${engine}, after: afterType ${a.w1.afterType}, B at ${a.w1.b.pathname} "${a.w1.b.line}", kind ${a.w1.kind}, C acts ${JSON.stringify(a.w1.c.acts)}, draftRow ${a.w1.draftRow}`,
  );
  say(
    a.w2.b.pathname === PAGE && a.w2.b.line === '' && a.w2.kind === null && a.w2.b.status === '',
    `W2 ${engine}, after: B at ${a.w2.b.pathname} "${a.w2.b.line}", kind ${a.w2.kind}, status "${a.w2.b.status}"`,
  );
  say(
    a.w3.editorOpens && a.w3.b.pathname === PAGE && a.w3.kind === null && a.w3.b.acts.includes('Edit'),
    `W3 ${engine}, after: editor ${a.w3.editorOpens}, B at ${a.w3.b?.pathname}, kind ${a.w3.kind}, acts ${JSON.stringify(a.w3.b?.acts)}`,
  );
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
