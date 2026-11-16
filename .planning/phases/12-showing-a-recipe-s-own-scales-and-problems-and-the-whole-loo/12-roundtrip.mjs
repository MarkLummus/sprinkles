// 12-03: the round trip, PROOF-01 (D-10). A recipe is made in the BUILT app through its own
// creation editor, with a scale of each kind and a problem; it is saved, exported through the
// shell's Export button, imported into a second, empty profile through the shell's Import file
// input, and the records are compared field by field. Mark runs no batch, export or import by
// hand: this walk is the proof, and nothing else is.
//
//   PROBE_DIST=<scratch build> node 12-roundtrip.mjs [--out <file>]
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-03" --emptyOutDir
//   PROBE_DIST="$S/dist-03" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-roundtrip.mjs
// or in one command: sh .../12-roundtrip-check.sh
//
// It prints "PASS <step> <check>" or "FAIL <step> <check>: <values>" for each assertion and exits
// 1 on any FAIL (a thrown error prints FAIL with its message and exits 1).
//
// Steps, in profile A: create (the editor, a scale of each kind, a problem, Save), print (the
// made version's print route under print media), batch (the record pen marks the Low to high
// scale "Coffee flavour" at 2 and the Right in the middle scale "Body" at 5, ticks Bitter),
// reading (the tasting reads "2 of 5" and "heavy (5)"), export. Then in profile B, a profile
// that has never held the recipe: import, compare (all eight exported stores both ways, record by
// record), seed (B's seed before the import equals A's seed before creation), drafts (apart: they
// never travel, repository.js:61), figures (buildFigures over both stored versions, strict
// deep equality, and the Balance figures' text as strings), then reading, print and a Sheet code
// search again in B.
//
// What it never does: call the store module's export or import functions, or write the made
// recipe as a fixture. Only the built app's own controls count: the editor, Save, the Export
// button (a download event) and the Import file input. It reads the build from PROBE_DIST and
// never builds, never writes app/dist (Mark's own `vite preview --host` serves it), and never
// contacts a host other than 127.0.0.1: every profile is a fresh Playwright context with its own
// IndexedDB, and every request to another host is aborted. `--out` writes only under the scratch
// folder. It drives creation through the heading controls only (Add ingredient, Add step, Add
// scale, Add problem) and each unplaced row's "Add {name} to a step" chooser; it presses no Move
// button, no other per-row control, and never opens More's panel, so a later round that reorders
// those controls does not break it. It runs at 1366 by 1024 (D-06: round two reruns it unchanged).
//
// Deterministic: Date is one instant (context.clock.setFixedTime, copied from 11-walk.mjs, so the
// exported file's exportedAt is the same in every run; timers keep running) and crypto.randomUUID
// is a counter, so two runs write identical made-record dumps. Device-unverified: this is
// Playwright WebKit on a Mac, not the iPad. Everything typed is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { buildFigures } from '../../../app/src/domain/figures.js';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';

// playwright-core: the one place the walk names a Playwright path. Override it with
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

// .planning/phases/12-.../ -> phases/ -> .planning/ -> repo root.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// No default: the walk must never fall back to app/dist. path.resolve drops the doubled slash a
// TMPDIR with a trailing slash leaves; the static server compares paths with startsWith and
// would answer every request with 404.
if (!process.env.PROBE_DIST) {
  console.log('FAIL PROBE_DIST is not set: build to a scratch folder and pass it (the walk never serves app/dist)');
  process.exit(1);
}
const DIST = path.resolve(process.env.PROBE_DIST);
if (!existsSync(path.join(DIST, 'index.html'))) {
  console.log(`FAIL no index.html in PROBE_DIST ${DIST}`);
  process.exit(1);
}

const FIXED_ISO = '2026-10-14T12:00:00.000Z';
const WIDTH = 1366;
const HEIGHT = 1024;

// `--out <file>`: only under the scratch folder.
const outIndex = process.argv.indexOf('--out');
const OUT = outIndex === -1 ? null : path.resolve(process.argv[outIndex + 1] ?? '');
const SCRATCH = path.resolve(process.env.TMPDIR || '/tmp');
if (OUT !== null && !OUT.startsWith(`${SCRATCH}${path.sep}`)) {
  console.log(`FAIL --out ${OUT} is not under the scratch folder ${SCRATCH}`);
  process.exit(1);
}

// The eight stores the export carries (transfer.js exportStore), and the ninth, drafts, which
// stays on the device (repository.js:61). Every store but drafts is keyed by id (db.js:47-77).
const EXPORTED = ['recipes', 'versions', 'batches', 'library', 'machines', 'styles', 'scales', 'problems'];
const KEY_PATHS = {
  versions: 'id',
  batches: 'id',
  recipes: 'id',
  drafts: 'versionId',
  library: 'id',
  machines: 'id',
  styles: 'id',
  scales: 'id',
  problems: 'id',
};

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
let failures = 0;
const pass = (step, check) => console.log(`PASS ${step} ${check}`);
const fail = (step, check, values) => {
  failures += 1;
  console.log(`FAIL ${step} ${check}${values === undefined ? '' : `: ${values}`}`);
};
const expect = (step, check, ok, values) => (ok ? pass(step, check) : fail(step, check, values));
const report = (step, fact) => console.log(`REPORT ${step} ${fact}`);

// A stable stringify: object keys sorted, arrays in order.
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'undefined';
}
const same = (left, right) => stable(left) === stable(right);
const clip = (value, size = 400) => {
  const text = typeof value === 'string' ? value : stable(value);
  return text.length > size ? `${text.slice(0, size)}...` : text;
};

// ---------------------------------------------------------------------------
// A context per profile: fixed clock, counted ids, third-party requests off. Copied from
// 11-walk.mjs (newScenarioContext), as nothing there is exported.
// ---------------------------------------------------------------------------
async function newProfile(browser) {
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, hasTouch: true });
  // Date is one instant for the page; timers (the 250 ms draft debounce, the 5 s self-clearing
  // toasts) keep running. Never the clock's install call, whose time keeps running.
  await context.clock.setFixedTime(new Date(FIXED_ISO));
  // The count lives in localStorage, so a reload continues it and two records never share an id.
  await context.addInitScript(() => {
    const key = 'sprinkles-walk-id-counter';
    crypto.randomUUID = () => {
      const next = Number(localStorage.getItem(key) ?? '0') + 1;
      localStorage.setItem(key, String(next));
      return `00000000-0000-4000-8000-${String(next).padStart(12, '0')}`;
    };
  });
  // Blocks every request whose host is not 127.0.0.1.
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  return { context, page };
}

// One read transaction over all nine stores, each list sorted by its key path (11-walk.mjs
// reads four; the export carries eight, so this walk reads them all).
async function dumpStores(page) {
  return page.evaluate(async (keyPaths) => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('sprinkles');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const names = Object.keys(keyPaths);
      const tx = db.transaction(names, 'readonly');
      const out = {};
      await Promise.all(
        names.map(
          (name) =>
            new Promise((resolve, reject) => {
              const request = tx.objectStore(name).getAll();
              request.onsuccess = () => {
                out[name] = request.result.sort((a, b) => {
                  const left = String(a[keyPaths[name]]);
                  const right = String(b[keyPaths[name]]);
                  return left < right ? -1 : left > right ? 1 : 0;
                });
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
  }, KEY_PATHS);
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

// A wait that names itself when it times out.
const until = (page, condition, label, arg) =>
  page.waitForFunction(condition, arg, { timeout: 8000 }).catch((error) => {
    throw new Error(`${label}: ${String(error.message).split('\n')[0]}`);
  });

// The store is seeded when the seeded tables hold records and a second read a moment later is the
// same (the seed is written once, on an empty database).
async function waitSeeded(page) {
  let last = '';
  for (let i = 0; i < 40; i += 1) {
    await page.waitForTimeout(250);
    let dump;
    try {
      dump = await dumpStores(page);
    } catch {
      continue; // the database does not exist yet
    }
    const now = stable(dump);
    if (dump.versions.length > 0 && dump.library.length > 0 && now === last) return dump;
    last = now;
  }
  throw new Error('the store never finished seeding');
}

// ---------------------------------------------------------------------------
// Profile A: make the recipe in the creation editor and save it.
// ---------------------------------------------------------------------------
const MILK_NAME = 'Whole milk, 3.5% fat';
const SUGAR_NAME = 'Sucrose';
const SCALES = [
  { name: 'Body', low: 'thin', high: 'heavy', kindWord: 'Right in the middle', kind: 'goldilocks' },
  { name: 'Coffee flavour', low: 'faint', high: 'strong', kindWord: 'Low to high', kind: 'magnitude' },
];
const PROBLEM = 'Bitter';

async function createRecipe(page, appUrl) {
  const pickRow = (name) =>
    page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) });
  const labelled = (label) => page.locator(`[aria-label="${label}"]`);
  const addIngredient = async (name, grams) => {
    await clickUntil(page, () => page.locator('.ingredient-table-region .mk-head-act'), '.pick', `open the picker for ${name}`);
    await clickUntil(page, () => pickRow(name), `[aria-label="${name}, grams"]`, `pick ${name}`);
    await page.fill(`[aria-label="${name}, grams"]`, grams);
  };

  await page.goto(`${appUrl}/notebook`, { waitUntil: 'load' });
  await page.waitForSelector('.nb__head .notebook-action');
  const seed = await waitSeeded(page);

  // The New recipe entry's name field is a textarea (12-06).
  await clickUntil(page, () => page.locator('.nb__head .notebook-action'), '.nb__new textarea', 'open the New recipe entry');
  await page.fill('.nb__new textarea', 'Coffee');
  await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click();
  await until(page, () => location.pathname === '/notebook/new', 'Start opens /notebook/new');
  await page.waitForSelector('.notebook.mk-page');
  await page.fill('textarea[aria-label="Recipe description"]', 'Strong and cold.');

  await addIngredient(MILK_NAME, '600');
  await addIngredient(SUGAR_NAME, '150');

  // One step, from the Instructions heading's Add step.
  await clickUntil(page, () => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]', 'Add step');
  await page.fill('[aria-label="Step 1, lead-in"]', 'Churn');
  await page.fill('[aria-label="Step 1, instruction"]', 'Churn, then harden.');

  // Place each row in step 1 from Not in a step yet: the row's Add to step opens a chooser, one
  // control per step, named by the step's number and lead-in (IngredientTable.jsx RowActs).
  for (const name of [MILK_NAME, SUGAR_NAME]) {
    await clickUntil(page, () => labelled(`Add to step, ${name}`), `[aria-label="Step 1, Churn: add ${name}"]`, `open the chooser for ${name}`);
    await labelled(`Step 1, Churn: add ${name}`).click();
    await page.waitForSelector(`[aria-label="Add to step, ${name}"]`, { state: 'detached' });
  }

  // Two scales, one of each kind.
  const scales = page.locator('section[aria-label="Scales"]');
  for (const [index, scale] of SCALES.entries()) {
    await clickUntil(page, () => scales.getByRole('button', { name: 'Add scale' }), `[aria-label="Scale ${index + 1}"]`, `press Add scale (${index + 1})`);
    const card = scales.locator(`[aria-label="Scale ${index + 1}"]`);
    await card.getByLabel('Name', { exact: true }).fill(scale.name);
    await card.getByLabel('Low end', { exact: true }).fill(scale.low);
    await card.getByLabel('High end', { exact: true }).fill(scale.high);
    const kind = card.getByRole('radio', { name: scale.kindWord });
    for (let i = 0; i < 4 && !(await kind.isChecked()); i += 1) {
      await card.locator('.segmented__option', { hasText: new RegExp(`^${scale.kindWord}$`) }).click();
      await page.waitForTimeout(300);
    }
    if (!(await kind.isChecked())) throw new Error(`Scale ${index + 1}: the Kind ${scale.kindWord} never took`);
  }

  // One problem.
  const problems = page.locator('section[aria-label="Problems"]');
  await clickUntil(page, () => problems.getByRole('button', { name: 'Add problem' }), '[aria-label="Problem 1"]', 'press Add problem');
  await problems.locator('[aria-label="Problem 1"]').getByLabel('Name', { exact: true }).fill(PROBLEM);

  await page.waitForTimeout(500); // the draft debounce
  await page.click('.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)');
  await until(page, () => location.pathname !== '/notebook/new' && location.pathname.split('/').length === 4, 'Save lands on the new version');
  await page.waitForSelector('.notebook-version__identity');
  await until(page, () => document.querySelector('.page-status')?.textContent === 'Recipe saved.', 'the notice reads Recipe saved.');
  return { seed };
}

// ---------------------------------------------------------------------------
// Export through the shell's Export button; import through the shell's file input.
// ---------------------------------------------------------------------------
async function exportThroughButton(page, appUrl) {
  // A quiet page: Import and Export are refused while a pen or a creation is open.
  await page.goto(`${appUrl}/notebook`, { waitUntil: 'load' });
  await page.waitForSelector('.nb__head .notebook-action');
  const before = await dumpStores(page);
  const exportButton = page.getByRole('button', { name: 'Export', exact: true }).first();
  await exportButton.waitFor({ state: 'visible' });
  const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);
  const file = await download.path();
  const buffer = await readFile(file);
  return { before, buffer, name: download.suggestedFilename() };
}

async function importThroughInput(page, appUrl, buffer, madeRecipeId) {
  await page.goto(`${appUrl}/`, { waitUntil: 'load' });
  await page.waitForSelector('.shell');
  const seed = await waitSeeded(page);
  await page.setInputFiles('.shell__file-input', { name: 'sprinkles-store.json', mimeType: 'application/json', buffer });
  let imported = false;
  for (let i = 0; i < 40 && !imported; i += 1) {
    await page.waitForTimeout(250);
    imported = (await dumpStores(page)).recipes.some((recipe) => recipe.id === madeRecipeId);
  }
  return { seed, imported, errorPanels: await page.locator('.shell__import-errors').count() };
}

// ---------------------------------------------------------------------------
// Compare
// ---------------------------------------------------------------------------
// Two sorted lists of one store: the id sets must match both ways and every record be deep-equal.
function compareList(name, keyPath, left, right) {
  const key = (record) => String(record[keyPath]);
  const leftBy = new Map(left.map((record) => [key(record), record]));
  const rightBy = new Map(right.map((record) => [key(record), record]));
  const onlyLeft = [...leftBy.keys()].filter((id) => !rightBy.has(id));
  const onlyRight = [...rightBy.keys()].filter((id) => !leftBy.has(id));
  const changed = [...leftBy.keys()].filter((id) => rightBy.has(id) && !same(leftBy.get(id), rightBy.get(id)));
  const ok = onlyLeft.length === 0 && onlyRight.length === 0 && changed.length === 0 && left.length === right.length;
  return {
    ok,
    values: `${name}: ${left.length} against ${right.length}; only in first: ${clip(onlyLeft)}; only in second: ${clip(onlyRight)}; changed: ${clip(changed)}`,
  };
}

const record = (dump, store, id) => dump[store].find((candidate) => candidate.id === id);


// ---------------------------------------------------------------------------
// Print, batch, reading, Balance figures and Sheet code search: each is run in A and, after the
// import, again in B.
// ---------------------------------------------------------------------------
const versionPath = (made) => `/notebook/${made.recipeId}/${made.versionId}`;
const normalise = (text) => (text ?? '').replace(/\s+/g, ' ').trim();

// The made version's print route under print media: the two log pages, the Tasting log's scales
// and problems row, and the Sheet code in every foot. It asserts what 12-01 builds; the printed
// row's form and the notes lines are 12-02's (12-print-check.mjs).
async function checkPrint(page, appUrl, made, who) {
  await page.goto(`${appUrl}${versionPath(made)}/print`, { waitUntil: 'load' });
  await page.waitForSelector('.print-route[data-print-ready="true"]', { timeout: 15000 });
  await page.emulateMedia({ media: 'print' });
  try {
    const laid = await page.evaluate(() => {
      const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
      const root = document.querySelector('.print-route__pages');
      const logs = [...root.querySelectorAll('.print-page--log')];
      return {
        logCount: logs.length,
        scaleNames: logs[1] ? [...logs[1].querySelectorAll('.lf-srow .axis-mark__name')].map(text) : [],
        problems: logs[1] ? text(logs[1].querySelector('.lf-mrow--plain')) : '',
        logFeet: logs.map((log) => text(log.querySelector('.lf-foot'))),
        sheetFeet: [...root.querySelectorAll('.print-page--sheet .mp-foot')].map(text),
      };
    });
    const code = made.sheetCode;
    expect('print', `${who}: two log pages`, laid.logCount === 2, `${laid.logCount} log page(s)`);
    expect(
      'print',
      `${who}: the Tasting log's last two scales are Body then Coffee flavour, after the four core scales`,
      laid.scaleNames.length === 6 && same(laid.scaleNames.slice(-2), ['Body', 'Coffee flavour']),
      clip(laid.scaleNames),
    );
    expect('print', `${who}: the problems row ends with ${PROBLEM}`, laid.problems.endsWith(PROBLEM), clip(laid.problems));
    expect('print', `${who}: each log foot carries the Sheet code ${code}`, laid.logFeet.length === 2 && laid.logFeet.every((foot) => foot.includes(code)), clip(laid.logFeet));
    expect(
      'print',
      `${who}: the last sheet page's foot ends with the Sheet code`,
      laid.sheetFeet.length > 0 && laid.sheetFeet[laid.sheetFeet.length - 1].endsWith(code),
      clip(laid.sheetFeet),
    );
  } finally {
    await page.emulateMedia({ media: 'screen' });
  }
}

// Mark one stop of one scale: click that stop's label inside that scale's own .axis-mark (every
// scale has a stop of each value, so a stop is never selected page-wide).
async function markAxis(page, axisName, stop) {
  const axis = page.locator('.batch-margin--pen .axis-mark', { has: page.locator('.axis-mark__name', { hasText: new RegExp(`^${axisName}$`) }) });
  const label = axis.locator('label.axis-mark__stop', { has: page.locator(`input[value="${stop}"]`) });
  for (let i = 0; i < 3; i += 1) {
    await label.click();
    await page.waitForTimeout(100);
    if (await axis.locator(`input[value="${stop}"]`).isChecked()) return;
  }
  throw new Error(`could not mark ${axisName} ${stop}`);
}

// Record a batch on the made version through the record pen and mark its Low to high scale at 2
// and its Right in the middle scale at 5, with the declared problem ticked.
async function recordBatch(page, appUrl, made) {
  await page.goto(`${appUrl}${versionPath(made)}`, { waitUntil: 'load' });
  await page.waitForSelector('.notebook-version__identity');
  const PEN = '.batch-margin--pen';
  // The made version has no batch yet, so its opener is "Record batch" (BatchRow.jsx:1335-1338);
  // a version with one reads "Record another". Found by role and name, not by a class.
  await clickUntil(page, () => page.getByRole('button', { name: /^Record (batch|another)$/ }).first(), PEN, 'open the record pen');
  await page.locator(`${PEN} .field-row__label--date :is(input, textarea)`).first().fill('2026-10-09');
  await page.fill(`${PEN} [aria-label^="Out of machine"]`, '-6');
  await page.fill(`${PEN} [aria-label^="Duration"]`, '30');
  const ceremony = page.locator('.save-ceremony').first();
  await ceremony.getByRole('button', { name: 'Add tasting', exact: true }).first().click();
  await page.waitForSelector(`${PEN} .batch-row__head--tasting`);
  await markAxis(page, 'Coffee flavour', 2);
  await markAxis(page, 'Body', 5);
  const chip = page.locator(`${PEN} .defect-group--declared button`, { hasText: new RegExp(`^${PROBLEM}$`) });
  for (let i = 0; i < 3 && (await chip.getAttribute('aria-pressed')) !== 'true'; i += 1) {
    await chip.click();
    await page.waitForTimeout(150);
  }
  await page.fill(`${PEN} [aria-label="How did it turn out?"]`, 'Strong, a little bitter.');
  await ceremony.getByRole('button', { name: 'Save batch', exact: true }).first().click();
  await until(page, () => location.pathname.includes('/batch/'), 'Save batch lands on the batch');
  await page.waitForSelector('.notebook');
  await page.waitForSelector(PEN, { state: 'detached' });
}

// The batch's tasting reading: the Tasting fold opened if it is closed, then each cell.
async function readTasting(page, appUrl, made, batchId) {
  await page.goto(`${appUrl}${versionPath(made)}/batch/${batchId}`, { waitUntil: 'load' });
  await page.waitForSelector('.notebook');
  const fold = page.locator('[aria-expanded="false"]').filter({ hasText: /^Tasting/ }).first();
  const firstCell = page.locator('.tasting-reading .batch-row__cell').first();
  for (let i = 0; i < 4; i += 1) {
    if ((await firstCell.count()) > 0 && (await firstCell.isVisible())) break;
    if ((await fold.count()) > 0) await fold.click();
    await page.waitForTimeout(500);
  }
  await firstCell.waitFor({ state: 'visible' });
  return page.evaluate(() =>
    [...document.querySelectorAll('.tasting-reading .batch-row__cell')].map((cell) => ({
      label: cell.querySelector('.batch-row__cell-label')?.textContent ?? '',
      value: cell.querySelector('.batch-row__cell-value')?.textContent ?? '',
    })),
  );
}

function checkReading(cells, who) {
  const want = { 'Coffee flavour': '2 of 5', Body: 'heavy (5)' };
  for (const [label, value] of Object.entries(want)) {
    const cell = cells.find((candidate) => candidate.label === label);
    expect('reading', `${who}: ${label} reads ${value}`, cell?.value === value, cell ? `got ${JSON.stringify(cell.value)}` : `no cell labelled ${label} (cells: ${cells.map((c) => c.label).join(', ')})`);
  }
}

// The Balance figures' text on the made version's page.
async function balanceText(page, appUrl, made) {
  await page.goto(`${appUrl}${versionPath(made)}`, { waitUntil: 'load' });
  await page.waitForSelector('.notebook-version__identity');
  await page.waitForFunction(() => (document.querySelector('.formulation-note-region')?.textContent ?? '').trim().length > 20);
  return page.evaluate(() => (document.querySelector('.formulation-note-region')?.textContent ?? '').replace(/\s+/g, ' ').trim());
}

// The Sheet code search finds the made version by A's code. Find stays disabled until the page's
// versions have loaded (SheetCodeSearch.jsx:112), so a click before then does nothing.
async function searchByCode(page, appUrl, made) {
  await page.goto(`${appUrl}/search`, { waitUntil: 'load' });
  await page.waitForSelector('.search__form button[type="submit"]:not([disabled])');
  await page.fill('.search__form textarea', made.sheetCode);
  await page.click('.search__form button[type="submit"]');
  await until(page, (path) => location.pathname === path, 'the search opens the made version', versionPath(made));
}

async function main() {
  const servers = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  const made = {};
  try {
    // ---- Profile A: create, print, batch, reading, export ------------------
    const a = await newProfile(browser);
    const exportedFile = {};
    try {
      const { seed } = await createRecipe(a.page, servers.appUrl);
      made.seedA = seed;
      const afterSave = await dumpStores(a.page);
      const newRecipes = afterSave.recipes.filter((recipe) => !seed.recipes.some((seeded) => seeded.id === recipe.id));
      expect('create', 'one new recipe named Coffee', newRecipes.length === 1 && newRecipes[0].name === 'Coffee', `got ${clip(newRecipes.map((r) => r.name))}`);
      const recipe = newRecipes[0];
      const version = afterSave.versions.find((candidate) => candidate.recipeId === recipe?.id);
      expect('create', 'one new version', afterSave.versions.length === seed.versions.length + 1 && Boolean(version), `${afterSave.versions.length} against ${seed.versions.length} seeded`);
      const axes = version?.declaredAxes ?? [];
      expect(
        'create',
        'declaredAxes are two declared definitions, goldilocks then magnitude, Body then Coffee flavour',
        axes.length === 2 &&
          axes.every((axis) => axis.group === 'declared') &&
          same(axes.map((axis) => axis.kind), SCALES.map((scale) => scale.kind)) &&
          same(axes.map((axis) => axis.name), SCALES.map((scale) => scale.name)),
        clip(axes),
      );
      expect('create', 'declaredFlaws is Bitter', same(version?.declaredFlaws, [PROBLEM]), clip(version?.declaredFlaws));
      expect('create', 'sheetCode is a non-empty string', typeof version?.sheetCode === 'string' && version.sheetCode !== '', clip(version?.sheetCode));
      made.recipeId = recipe?.id;
      made.versionId = version?.id;
      made.sheetCode = version?.sheetCode;
      if (!recipe || !version) throw new Error('the made recipe or version is missing; the rest cannot run');

      await checkPrint(a.page, servers.appUrl, made, 'A');

      await recordBatch(a.page, servers.appUrl, made);
      const afterBatch = await dumpStores(a.page);
      const batches = afterBatch.batches.filter((candidate) => candidate.versionId === version.id);
      expect('batch', 'one batch on the made version', batches.length === 1, `${batches.length} batch(es)`);
      const batch = batches[0];
      made.batchId = batch?.id;
      const keyOf = (name) => axes.find((axis) => axis.name === name)?.key;
      expect('batch', 'the marks hold 2 under Coffee flavour and 5 under Body', batch?.tasting?.marks?.[keyOf('Coffee flavour')] === 2 && batch?.tasting?.marks?.[keyOf('Body')] === 5, clip(batch?.tasting?.marks));
      expect('batch', 'declaredDefects is Bitter', same(batch?.tasting?.declaredDefects, [PROBLEM]), clip(batch?.tasting?.declaredDefects));
      expect(
        'batch',
        "the batch's snapshot carries kinds goldilocks then magnitude",
        same((batch?.snapshot?.declaredAxes ?? []).map((axis) => axis.kind), ['goldilocks', 'magnitude']),
        clip(batch?.snapshot?.declaredAxes),
      );
      if (!batch) throw new Error('the made batch is missing; the rest cannot run');

      checkReading(await readTasting(a.page, servers.appUrl, made, batch.id), 'A');
      made.balanceA = await balanceText(a.page, servers.appUrl, made);
      report('balance', `A: ${clip(made.balanceA, 200)}`);

      // ---- Export --------------------------------------------------------
      const exported = await exportThroughButton(a.page, servers.appUrl);
      made.dumpA = exported.before;
      let file;
      try {
        file = JSON.parse(exported.buffer.toString('utf8'));
      } catch (error) {
        throw new Error(`the downloaded file is not JSON: ${error.message}`);
      }
      Object.assign(exportedFile, file);
      expect('export', 'the download is sprinkles-store.json', exported.name === 'sprinkles-store.json', exported.name);
      expect('export', 'the file is a sprinkles store', file.app === 'sprinkles', clip(file.app));
      expect('export', 'the file holds the made version', Array.isArray(file.versions) && file.versions.some((v) => v.id === version.id), `versions: ${clip((file.versions ?? []).map((v) => v.id))}`);
      expect('export', 'the file holds the made batch', Array.isArray(file.batches) && file.batches.some((v) => v.id === batch.id), `batches: ${clip((file.batches ?? []).map((v) => v.id))}`);
      report('drafts', `A held ${exported.before.drafts.length} draft(s) at export (drafts never travel)`);
      made.buffer = exported.buffer;
    } finally {
      await a.context.close();
    }

    // ---- Profile B: a profile that has never held the recipe ----------------
    const b = await newProfile(browser);
    try {
      const { seed, imported, errorPanels } = await importThroughInput(b.page, servers.appUrl, made.buffer, made.recipeId);
      expect('import', 'no import-errors panel is showing', errorPanels === 0, `${errorPanels} panel(s)`);
      expect('import', 'B holds the made recipe after the import', imported, 'the recipe never reached the second profile');
      const dumpB = await dumpStores(b.page);

      // ---- Compare: records ----------------------------------------------
      for (const name of EXPORTED) {
        const fromFile = [...(exportedFile[name] ?? [])].sort((x, y) => (String(x.id) < String(y.id) ? -1 : 1));
        const file = compareList(name, 'id', fromFile, made.dumpA[name]);
        expect('compare', `the file's ${name} equal A's ${name} at export`, file.ok, file.values);
        const result = compareList(name, 'id', made.dumpA[name], dumpB[name]);
        expect('compare', `B's ${name} after the import equal A's ${name} at export`, result.ok, result.values);
      }
      const recipeA = record(made.dumpA, 'recipes', made.recipeId);
      const recipeB = record(dumpB, 'recipes', made.recipeId);
      expect('compare', 'the made recipe record equals in B', recipeA !== undefined && same(recipeA, recipeB), `${clip(recipeA)} against ${clip(recipeB)}`);
      const versionA = record(made.dumpA, 'versions', made.versionId);
      const versionB = record(dumpB, 'versions', made.versionId);
      expect('compare', 'the made version record equals in B', versionA !== undefined && same(versionA, versionB), `${clip(versionA)} against ${clip(versionB)}`);
      for (const field of ['rows', 'method', 'declaredAxes', 'declaredFlaws', 'sheetCode']) {
        expect('compare', `the made version's ${field} equal in B`, same(versionA?.[field], versionB?.[field]), `${clip(versionA?.[field])} against ${clip(versionB?.[field])}`);
      }
      const batchA = record(made.dumpA, 'batches', made.batchId);
      const batchB = record(dumpB, 'batches', made.batchId);
      expect('compare', 'the made batch record equals in B', batchA !== undefined && same(batchA, batchB), `${clip(batchA)} against ${clip(batchB)}`);
      for (const field of ['tasting', 'snapshot']) {
        expect('compare', `the made batch's ${field} equal in B`, same(batchA?.[field], batchB?.[field]), `${clip(batchA?.[field])} against ${clip(batchB?.[field])}`);
      }

      // ---- Seed kept; drafts apart ---------------------------------------
      // Both are fresh profiles seeded by the same build at the same frozen instant, so a
      // difference is a finding, not noise.
      for (const name of EXPORTED) {
        const result = compareList(name, 'id', made.seedA[name], seed[name]);
        expect('seed', `B's ${name} before the import equal A's ${name} before creation`, result.ok, result.values);
      }
      expect('seed', "B's drafts before the import equal A's before creation", same(seed.drafts, made.seedA.drafts), `${clip(seed.drafts)} against ${clip(made.seedA.drafts)}`);
      expect('drafts', 'B holds no draft after the import (drafts never travel)', dumpB.drafts.length === 0, `${dumpB.drafts.length} draft(s)`);

      // ---- Figures: exact, no rounding, no tolerance ----------------------
      const figuresA = buildFigures(versionA);
      const figuresB = buildFigures(versionB);
      expect('figures', 'buildFigures over the stored version is strictly deep-equal in A and B', figuresA.length > 0 && isDeepStrictEqual(figuresA, figuresB), `${clip(figuresA)} against ${clip(figuresB)}`);
      const balanceB = await balanceText(b.page, servers.appUrl, made);
      expect('figures', "the Balance figures' text on the version page is the same string in A and B", made.balanceA === balanceB, `${clip(made.balanceA)} against ${clip(balanceB)}`);

      // ---- Marks, print and the Sheet code in B ---------------------------
      checkReading(await readTasting(b.page, servers.appUrl, made, made.batchId), 'B');
      await checkPrint(b.page, servers.appUrl, made, 'B');
      await searchByCode(b.page, servers.appUrl, made);
      pass('search', `B: the Sheet code ${made.sheetCode} finds the made version`);
    } finally {
      await b.context.close();
    }
  } finally {
    await browser.close();
    await servers.close();
  }
  if (OUT !== null) {
    await writeFile(
      OUT,
      stable({
        recipe: record(made.dumpA, 'recipes', made.recipeId),
        version: record(made.dumpA, 'versions', made.versionId),
        batch: record(made.dumpA, 'batches', made.batchId),
        file: JSON.parse(made.buffer.toString('utf8')),
      }),
    );
    report('out', `wrote ${OUT}`);
  }
}

try {
  await main();
} catch (error) {
  fail('walk', 'ran to the end', error.stack ? String(error.stack).split('\n').slice(0, 3).join(' | ') : String(error));
}
if (failures > 0) {
  console.log(`ROUNDTRIP FAIL ${failures}`);
  process.exit(1);
}
