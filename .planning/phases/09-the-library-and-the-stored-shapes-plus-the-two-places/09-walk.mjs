// 09-01: the before/after WebKit walk for Phase 9 (D-15), re-recorded at the base commit
// (copied from 08-walk.mjs; the walk body is unchanged).
//
// Plan 09-16 changes only the compare and the mode switch after it (D-15). The
// compare allows a store difference only on ALLOWED_STORE_PATHS, each path
// checking the exact value the phase's seed modules say it must hold, and never
// skips a whole snapshot; then REQUIRED_STORE_FIELDS asserts every addition on
// every after-dump, because a field missing from both files makes no difference
// to compare. Two more modes, neither of which opens a browser:
//   node 09-walk.mjs expected <before.json>            run FIRST: the expected-value functions against the seed
//   node 09-walk.mjs selftest <before.json> <after.json>   doctored after-files the compare must refuse
//
// Usage (from the repo root; the one-command form builds to scratch and compares):
//   sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk-check.sh
// or by hand, after building to a scratch directory:
//   npm --prefix app run build -- --outDir "$TMPDIR/sprinkles-09/dist" --emptyOutDir
//   PROBE_DIST="$TMPDIR/sprinkles-09/dist" node .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs record <out.json>
//   node .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs compare <a.json> <b.json>
//
// Why it exists: the RecipePage tests render static markup and never run
// effects, so the reload-with-draft path, the focus landings and the saved
// records are not covered by the suite (D-11). This walk drives the BUILT app
// in WebKit through the version pen, the record pen, a correction and a
// tasting. After every step it records what the maker sees (status texts, the
// marked fields, the focused element, the open pens with their values and
// buttons, a hash of the page text); after a scenario it records every record
// in the versions, batches, recipes and drafts stores. Phase 8 records the
// same walk after the last code change and compares it with the baseline.
//
// `record` is deterministic: the browser clock is fixed (Date is one instant,
// timers keep running) and crypto.randomUUID is a counter kept in
// localStorage, so two runs against one build compare equal and a later DIFF
// names a real change. It fails loudly: a state the walk expects and does not
// reach prints a FAIL line, exits 1 and writes nothing.
//
// The build is read from PROBE_DIST (default app/dist). Pass a scratch
// --outDir build there so Mark's own `vite preview --host` on :4173, which
// serves app/dist, is never disturbed.
//
// playwright-core is loaded only through PLAYWRIGHT_CORE (default: the npx
// cache path below). When that file is missing the walk prints a FAIL line and
// exits 1 before it does anything else.
//
// Isolation: the app is served on an ephemeral 127.0.0.1 port through
// 08-walk-server.mjs (the 03.5 harness's server code, copied with no
// Playwright import; always with appRoot, never its default). Every request to
// another host is aborted in every context. Each scenario gets a fresh
// Playwright context (no browser profile), so IndexedDB starts from the
// reseed. Nothing here contacts :4173 or :8077. Everything typed into the app
// is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// The compare computes each expected added value from the app's seed modules.
// The walk now runs the data modules' graph in node: seed-recipes.js builds its
// batches with createBatch at load (plan 09-13), so a framework or browser-only
// import reaching that graph would break the walk harness, not only a test.
import { library } from '../../../app/src/data/library.js';
import { CORE_PROBLEM_ROWS } from '../../../app/src/data/core-problems.js';
import { CORE_SCALE_ROWS } from '../../../app/src/data/core-scales.js';
import { seedRecipeGroups } from '../../../app/src/data/seed-recipes.js';
import { SEED_SHEET_CODES } from '../../../app/src/data/seed-sheet-codes.js';
import { coreScaleDefinitions, isScaleDefinition, problemNames, scaleDefinition } from '../../../app/src/domain/catalog.js';
import { codeFromVersionId } from '../../../app/src/domain/sheetCode.js';

// playwright-core: the one place the walk names a Playwright path. Override it
// with PLAYWRIGHT_CORE; refill the default with
// `npx -y playwright-core@1.63.0 --version`.
const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

// .planning/phases/08-split-the-recipe-page-along-its-jobs/ -> phases/ -> .planning/ -> repo root.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// path.resolve drops the doubled slash a TMPDIR with a trailing slash leaves in
// "$TMPDIR/sprinkles-08/dist"; the static server compares paths with startsWith
// and would answer every request with 404 (the walk then times out on .shell).
const DIST = path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'));

const FIXED_ISO = '2026-10-14T12:00:00.000Z';
const WIDTH = 1366;

const RECIPE = 'olive-oil-ice-cream';
const VERSION_ID = 'olive-oil-ice-cream-v1';
const VERSION_ROUTE = `/notebook/${RECIPE}/${VERSION_ID}`;
const BATCH_ID = 'b8cc3566-48a4-4b23-b6e5-749a332afe89';
const BATCH_ROUTE = `${VERSION_ROUTE}/batch/${BATCH_ID}`;

const KEPT = 'Draft kept. Cancel discards it.';
const VERSION_PEN = 'form[aria-label="Next version"]';
const NAME_FIELD = 'input[aria-label="Version name"]';
const MILK_FIELD = 'input[aria-label="Whole milk, grams, portion 1"]';

// ---------------------------------------------------------------------------
// A context per scenario: fixed clock, counted ids, third-party requests off.
// ---------------------------------------------------------------------------
async function newScenarioContext(browser) {
  const context = await browser.newContext({ viewport: { width: WIDTH, height: 1100 } });
  // Date is one instant for the page; timers (the 250 ms draft debounce, the
  // 5 s self-clearing toasts) keep running.
  await context.clock.setFixedTime(new Date(FIXED_ISO));
  // The count lives in localStorage, so a reload continues it and two records
  // never share an id.
  await context.addInitScript(() => {
    const key = 'sprinkles-walk-id-counter';
    crypto.randomUUID = () => {
      const next = Number(localStorage.getItem(key) ?? '0') + 1;
      localStorage.setItem(key, String(next));
      return `00000000-0000-4000-8000-${String(next).padStart(12, '0')}`;
    };
  });
  // Blocks every request whose host is not 127.0.0.1 (the harness's own
  // blockThirdPartyRequests, which it does not export).
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') {
      route.continue();
    } else {
      route.abort();
    }
  });
  return context;
}

// ---------------------------------------------------------------------------
// What the maker sees, and what the stores hold.
// ---------------------------------------------------------------------------
async function snapshot(page) {
  const raw = await page.evaluate(() => {
    const textOf = (el) => (el ? el.textContent : null);
    // A field's name: its aria-label, else its wrapping label's words, else its type.
    const fieldLabel = (el) =>
      el.getAttribute('aria-label') ||
      (el.closest('label')?.textContent ?? '').trim().slice(0, 40) ||
      el.getAttribute('name') ||
      `${el.tagName.toLowerCase()}:${el.type}`;
    const active = document.activeElement;
    const penVersion = document.querySelectorAll('form[aria-label="Next version"]').length;
    const penRecord = document.querySelectorAll('.batch-margin--pen').length;
    // The version pen opens the whole sheet for editing (the grams, the
    // headnote, the notes sit outside its form), and the record pen's as-made
    // column sits in the ingredient table: with any pen open, every field and
    // button on the page is part of the pen.
    const penOpen = penVersion + penRecord > 0;
    const penFields = '.notebook :is(input, textarea, select)';
    const penButtons = penOpen ? '.notebook button, .pen-foot button' : '.notebook-log button';
    const status = (selector) => textOf(document.querySelector(selector));
    return {
      url: location.pathname + location.search,
      pageStatus: status('.page-status'),
      formStatus: [...document.querySelectorAll('.form-status')].map(textOf),
      tastingStatus: status('.tasting-status'),
      recordStatus: status('.save-ceremony__status'),
      invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map(fieldLabel),
      focus: active
        ? {
            tag: active.tagName.toLowerCase(),
            ariaLabel: active.getAttribute('aria-label'),
            name: active.getAttribute('name'),
            id: active.id || null,
            text: (active.textContent ?? '').trim().slice(0, 60),
          }
        : null,
      pens: { version: penVersion, record: penRecord },
      fields: penOpen
        ? [...document.querySelectorAll(penFields)].map((el) => [
            fieldLabel(el),
            el.value,
            el.type === 'checkbox' || el.type === 'radio' ? el.checked : null,
          ])
        : [],
      buttons: [...document.querySelectorAll(penButtons)].map((el) => (el.textContent ?? '').trim()),
      text: document.querySelector('.notebook')?.innerText ?? '',
    };
  });
  const { text, ...rest } = raw;
  return { ...rest, textHash: createHash('sha256').update(text).digest('hex') };
}

// One read transaction over the four stores, each list sorted by its key path.
async function dumpStores(page) {
  return page.evaluate(async () => {
    const keyPaths = { versions: 'id', batches: 'id', recipes: 'id', drafts: 'versionId' };
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
  });
}

// ---------------------------------------------------------------------------
// Driving the built app. A first click after a navigation can miss, so every
// opener is clicked until its pen shows.
// ---------------------------------------------------------------------------
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

async function openNextVersionPen(page) {
  await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), VERSION_PEN, 'open the Next version pen');
}

async function reload(page) {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook');
}

// The restore reads IndexedDB after the page's loads settle, so the notice
// lands a moment after the mount.
async function waitForNotice(page) {
  try {
    await page.waitForFunction((words) => document.querySelector('.page-status')?.textContent === words, KEPT, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// A beat for focus landings and effects before a snapshot. Far inside the 5 s
// self-clear of the toasts.
const settle = (page) => page.waitForTimeout(150);

// ---------------------------------------------------------------------------
// The scenario harness: each scenario gets its own context and page.
// ---------------------------------------------------------------------------
async function runScenario(browser, appUrl, name, body) {
  const context = await newScenarioContext(browser);
  const page = await context.newPage();
  const steps = [];
  const fails = [];
  const walk = {
    page,
    steps,
    expect(condition, what) {
      if (!condition) fails.push(`FAIL ${name}: ${what}`);
    },
    // Open the app at a route, with the clock confirmed.
    async open(route) {
      await page.goto(`${appUrl}${route}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.shell');
      await page.waitForSelector('.notebook');
      const now = await page.evaluate(() => new Date().toISOString());
      walk.expect(now === FIXED_ISO, `the browser clock is fixed (${now})`);
    },
    // Record the snapshot (and the stores, when asked) under a label.
    async step(label, { stores = false } = {}) {
      if (steps.some((existing) => existing.step === label)) throw new Error(`step "${label}" is recorded twice`);
      await settle(page);
      const entry = { step: label, snapshot: await snapshot(page) };
      if (stores) entry.stores = await dumpStores(page);
      steps.push(entry);
      return entry;
    },
    // Past the 250 ms draft debounce.
    async afterDebounce() {
      await page.waitForTimeout(400);
    },
  };
  try {
    await body(walk);
  } catch (error) {
    fails.push(`FAIL ${name}: ${error.message}`);
  } finally {
    await context.close();
  }
  return { scenario: { name, steps }, fails };
}

// ---------------------------------------------------------------------------
// The scenarios.
// ---------------------------------------------------------------------------
const SCENARIOS = [];

SCENARIOS.push([
  'version-pen-kept-draft',
  async (walk) => {
    const { page } = walk;
    await walk.open(VERSION_ROUTE);
    await openNextVersionPen(page);
    await page.fill(NAME_FIELD, 'less milk, more cream');
    await page.fill(MILK_FIELD, '100');
    await walk.step('typed');

    await walk.afterDebounce();
    const kept = await walk.step('after-debounce', { stores: true });
    walk.expect(kept.stores.drafts.length === 1, `the drafts store holds one record after the debounce (${kept.stores.drafts.length})`);

    await reload(page);
    walk.expect(await waitForNotice(page), `the notice reads "${KEPT}" after the reload`);
    const reloaded = await walk.step('reloaded', { stores: true });
    walk.expect(reloaded.snapshot.pens.version === 1, 'the version pen is open after the reload');
    walk.expect(
      reloaded.snapshot.fields.some(([label, value]) => label === 'Version name' && value === 'less milk, more cream'),
      'the Version name field holds the typed value after the reload',
    );
    walk.expect(
      reloaded.snapshot.fields.some(([label, value]) => label === 'Whole milk, grams, portion 1' && value === '100'),
      'the Whole milk field holds the typed grams after the reload',
    );

    await page.locator(VERSION_PEN).getByRole('button', { name: 'Cancel' }).click();
    await page.waitForSelector(VERSION_PEN, { state: 'detached' });
    await walk.afterDebounce();
    const cancelled = await walk.step('cancelled', { stores: true });
    walk.expect(cancelled.stores.drafts.length === 0, `the drafts store is empty after Cancel (${cancelled.stores.drafts.length})`);
  },
]);

// ---------------------------------------------------------------------------
// The scenarios that follow reuse the fields a maker meets by label.
// ---------------------------------------------------------------------------
const VERSION_BLOCKED = 'Check the version. Your changes have been kept.';
const MEASURED_INVALID = 'Check the marked measurements. Your entries have been kept.';
const CHURN_DATE_STATUS = 'Check the churn date. Your entries have been kept.';
const CHURN_DATE_SENTENCE = 'Enter the date you churned.';

const PEN = '.batch-margin--pen';
const CHURN_DATE = `${PEN} .field-row__label--date input`;
const OUT_OF_MACHINE = `${PEN} input[aria-label^="Out of machine"]`;
const CHURN_DURATION = `${PEN} input[aria-label^="Churn duration"]`;
const TEMPERING = `${PEN} input[aria-label^="Tempering"]`;
const TASTING_NOTE = `${PEN} textarea[aria-label="How did it turn out?"]`;
const SUCROSE_FIELD = 'input[aria-label="Sucrose, grams, portion 1"]';
const SHEET_TITLE = 'textarea[aria-label="Sheet title"]';
const WHY_FIELD = 'textarea[aria-label="Why"]';
const BEFORE_NOTE = 'textarea[aria-label="beforeYouStart note 1"]';

// A button is found by the words on it. The first record ceremony in the DOM
// is the pen foot's (Add tasting, Cancel, Save batch); the end-of-record one,
// with the status region and the restore slot, follows inside the pen.
const ceremony = (page) => page.locator('.save-ceremony').first();
const button = (scope, name) => scope.getByRole('button', { name, exact: true }).first();

async function openRecordPen(page) {
  await clickUntil(page, () => page.locator('.batch-row__record').first(), PEN, 'open the record pen');
}

async function openCorrectPen(page) {
  await clickUntil(page, () => page.locator('.batch-row__correct').first(), PEN, 'open the Correct pen');
}

async function addTasting(page) {
  await button(ceremony(page), 'Add tasting').click();
  await page.waitForSelector('.tasting-head');
}

async function markAxis(page, axisName, stop) {
  const axis = page.locator('.axis-mark', { has: page.locator('.axis-mark__name', { hasText: new RegExp(`^${axisName}$`) }) });
  const label = axis.locator('label.axis-mark__stop', { has: page.locator(`input[value="${stop}"]`) });
  for (let i = 0; i < 3; i += 1) {
    await label.click();
    await page.waitForTimeout(100);
    if (await axis.locator(`input[value="${stop}"]`).isChecked()) return;
  }
  throw new Error(`could not mark ${axisName} ${stop}`);
}

async function cancelRecordPen(page) {
  await button(ceremony(page), 'Cancel').click();
  await page.waitForSelector(PEN, { state: 'detached' });
}

async function cancelVersionPen(page) {
  await button(page.locator(VERSION_PEN), 'Cancel').click();
  await page.waitForSelector(VERSION_PEN, { state: 'detached' });
}

const pageHas = (page, words) => page.evaluate((text) => (document.querySelector('.notebook')?.innerText ?? '').includes(text), words);
const hasButton = (snap, words) => snap.buttons.some((text) => text === words);
const fieldValue = (snap, prefix) => snap.fields.find(([name]) => name.startsWith(prefix))?.[1];
const focusedOn = (snap, label) => snap.focus?.ariaLabel === label;

// D-13 (a), (b), (f): a blocked version save, the second block on the same
// field, every kind of pen edit after a block, and Cancel with a block showing.
SCENARIOS.push([
  'version-pen-blocked',
  async (walk) => {
    const { page } = walk;
    const save = () => button(page.locator(VERSION_PEN), 'Save as a new version').click();
    await walk.open(VERSION_ROUTE);
    await openNextVersionPen(page);
    await walk.step('pen-opened');

    await save();
    const blocked = await walk.step('blocked-blank-name');
    walk.expect(await pageHas(page, 'Enter a version.'), 'a blocked save says "Enter a version."');
    walk.expect(blocked.snapshot.formStatus.includes(VERSION_BLOCKED), 'a blocked save puts the version words in the form status');
    walk.expect(blocked.snapshot.invalid.includes('Version name'), 'the blocked Version name is marked');
    walk.expect(focusedOn(blocked.snapshot, 'Version name'), 'the blocked Version name has focus');

    await page.focus(MILK_FIELD);
    await save();
    const again = await walk.step('blocked-again-same-field');
    walk.expect(focusedOn(again.snapshot, 'Version name'), 'a second blocked save moves focus back to Version name');

    await page.fill(MILK_FIELD, '90');
    const grams = await walk.step('grams-edited-after-block');
    walk.expect(grams.snapshot.invalid.length === 0, 'a grams edit clears the mark');
    walk.expect(!(await pageHas(page, 'Enter a version.')), 'a grams edit clears the message');
    walk.expect(grams.snapshot.formStatus.includes(VERSION_BLOCKED), 'a grams edit leaves the form status (D-05)');

    await save();
    await walk.step('blocked-again-after-grams');
    await page.fill(NAME_FIELD, 'less milk');
    const named = await walk.step('version-line-edited-after-block');
    walk.expect(named.snapshot.invalid.length === 0, 'a version line edit clears the mark');
    walk.expect(named.snapshot.formStatus.every((text) => text === ''), 'a version line edit clears the form status');
    walk.expect(named.snapshot.pageStatus === '', 'a version line edit leaves the page status empty');

    // A blocked grams line: the row is marked and takes focus.
    await page.fill(MILK_FIELD, '');
    await save();
    const row = await walk.step('blocked-grams-line');
    walk.expect(row.snapshot.invalid.length > 0, 'a blank grams line is marked');
    walk.expect(focusedOn(row.snapshot, 'Whole milk, grams, portion 1'), 'the blocked grams line has focus');

    await page.fill(MILK_FIELD, '90');
    const rowFixed = await walk.step('blocked-grams-line-fixed');
    walk.expect(rowFixed.snapshot.invalid.length === 0, 'editing the blocked grams line clears its mark');

    // Each kind of pen edit after a block on the version line: which clear the
    // form status (the announcer) and which leave it (D-05).
    const edits = [
      ['why', () => page.fill(WHY_FIELD, 'less milk is cooler')],
      ['sheet-title', () => page.fill(SHEET_TITLE, 'Olive Oil Ice Cream, cooler')],
      ['before-note', () => page.fill(BEFORE_NOTE, 'Chill the base overnight.')],
      ['other-grams', () => page.fill(SUCROSE_FIELD, '70')],
    ];
    for (const [id, edit] of edits) {
      await page.fill(NAME_FIELD, '');
      await save();
      const reblocked = await walk.step(`blocked-before-${id}-edit`);
      walk.expect(reblocked.snapshot.invalid.includes('Version name'), `the version line is blocked before the ${id} edit`);
      await edit();
      const edited = await walk.step(`${id}-edited-after-block`);
      walk.expect(edited.snapshot.invalid.length === 0, `a ${id} edit clears the mark`);
    }

    await page.fill(NAME_FIELD, '');
    await save();
    const last = await walk.step('blocked-before-cancel');
    walk.expect(last.snapshot.invalid.length > 0, 'the pen is blocked before Cancel');
    await cancelVersionPen(page);
    await walk.afterDebounce();
    const cancelled = await walk.step('cancelled', { stores: true });
    walk.expect(cancelled.stores.drafts.length === 0, `Cancel discards the draft (${cancelled.stores.drafts.length})`);
    walk.expect(cancelled.snapshot.pens.version === 0, 'Cancel closes the pen');
  },
]);

// D-13 (b), the page status half: with the kept-draft notice on screen, which
// pen edits clear it and which leave it (D-05). Each edit starts from a fresh
// reload of the kept draft, so the notice is showing.
SCENARIOS.push([
  'version-pen-notice-edits',
  async (walk) => {
    const { page } = walk;
    await walk.open(VERSION_ROUTE);
    await openNextVersionPen(page);
    await page.fill(NAME_FIELD, 'less milk, more cream');
    await page.fill(MILK_FIELD, '100');
    const edits = [
      ['grams', () => page.fill(MILK_FIELD, '80')],
      ['version-line', () => page.fill(NAME_FIELD, 'less milk')],
      ['why', () => page.fill(WHY_FIELD, 'less milk is cooler')],
      ['sheet-title', () => page.fill(SHEET_TITLE, 'Olive Oil Ice Cream, cooler')],
      ['before-note', () => page.fill(BEFORE_NOTE, 'Chill the base overnight.')],
      ['other-grams', () => page.fill(SUCROSE_FIELD, '70')],
    ];
    for (const [id, edit] of edits) {
      await walk.afterDebounce();
      await reload(page);
      walk.expect(await waitForNotice(page), `the notice shows before the ${id} edit`);
      await walk.step(`notice-shown-before-${id}-edit`);
      await edit();
      await walk.step(`${id}-edited-with-notice`);
    }
    await cancelVersionPen(page);
    await walk.afterDebounce();
    const cancelled = await walk.step('cancelled', { stores: true });
    walk.expect(cancelled.stores.drafts.length === 0, `Cancel discards the draft (${cancelled.stores.drafts.length})`);
  },
]);

// The record pen's edit handlers, one after another, each after a blocked
// churn date: which clear the date sentence, the form status and the marks,
// and what the clear controls announce. Fixes the per-handler differences
// the record hook must keep (D-06, WR-03).
SCENARIOS.push([
  'record-pen-edit-handlers',
  async (walk) => {
    const { page } = walk;
    const save = () => button(ceremony(page), 'Save batch').click();
    const option = (group, value) =>
      page.locator('label.segmented__option', { has: page.locator(`input[name="${group}"][value="${value}"]`) }).click();
    await walk.open(VERSION_ROUTE);
    await openRecordPen(page);
    await addTasting(page);
    // The controls a Clear needs something to clear. A mark-one pick (At draw)
    // is offered only while its group holds no other mark (the axes and the
    // churn segments), so those are cleared before it.
    await markAxis(page, 'Hardness', 3);
    await option('segment-exit-consistency', 'Wet, soupy');
    await walk.step('set-up');

    const edits = [
      ['churn-field', () => page.fill(CHURN_DURATION, '30')],
      ['tasting-field', () => page.fill(TASTING_NOTE, 'Soft.')],
      ['segment', () => option('segment-airiness-estimated-', 'Medium, standard')],
      ['axis-mark', () => markAxis(page, 'Sweetness', 3)],
      ['axis-clear', () => page.getByRole('button', { name: 'Clear Hardness', exact: true }).click()],
      ['axis-clear-last', () => page.getByRole('button', { name: 'Clear Sweetness', exact: true }).click()],
      ['segment-clear', () => page.getByRole('button', { name: 'Clear Exit consistency', exact: true }).click()],
      ['segment-clear-last', () => page.getByRole('button', { name: 'Clear Airiness (estimated)', exact: true }).click()],
      ['mark-one', () => option('mo-atdraw', 'Nothing to note')],
      ['mark-one-clear', () => page.getByRole('button', { name: 'Clear At draw', exact: true }).click()],
      ['defect', () => page.locator('.chip-toggle', { hasText: /^Coarse, icy$/ }).click()],
      ['declared-defect', () => page.locator('.chip-toggle', { hasText: /^Bitter$/ }).click()],
      ['step-change', () => page.locator('label.method-step__strike-control', { has: page.locator('input[aria-label="Step 1, skipped"]') }).click()],
      ['as-made', () => page.fill('input[aria-label="Whole milk, as made, grams, portion 1"]', '100')],
    ];
    for (const [id, edit] of edits) {
      await save();
      const blocked = await walk.step(`blocked-before-${id}`);
      walk.expect(await pageHas(page, CHURN_DATE_SENTENCE), `the churn date is blocked before the ${id} edit`);
      walk.expect(blocked.snapshot.formStatus.includes(CHURN_DATE_STATUS), `the form status reads the churn date words before the ${id} edit`);
      await edit();
      await walk.step(`${id}-after-block`);
    }

    await cancelRecordPen(page);
    await walk.afterDebounce();
    const cancelled = await walk.step('cancelled', { stores: true });
    walk.expect(cancelled.stores.drafts.length === 0, `Cancel discards the draft (${cancelled.stores.drafts.length})`);
  },
]);

// A version saved as a new version, then saved over.
SCENARIOS.push([
  'version-pen-save',
  async (walk) => {
    const { page } = walk;
    await walk.open(VERSION_ROUTE);
    const before = await dumpStores(page);
    await openNextVersionPen(page);
    await page.fill(NAME_FIELD, 'walk child');
    await page.fill(MILK_FIELD, '95');
    await button(page.locator(VERSION_PEN), 'Save as a new version').click();
    await page.waitForFunction(() => location.pathname.endsWith('00000000-0000-4000-8000-000000000001'), null, { timeout: 5000 });
    await page.waitForSelector('.notebook');
    const saved = await walk.step('saved-as-new', { stores: true });
    walk.expect(saved.snapshot.pageStatus === 'Version saved.', `the page status reads "Version saved." (${saved.snapshot.pageStatus})`);
    walk.expect(saved.stores.versions.length === before.versions.length + 1, 'the versions store gains one record');
    walk.expect(saved.snapshot.url !== VERSION_ROUTE, 'the URL becomes the child version');
    walk.expect(saved.stores.drafts.length === 0, 'no draft is kept after the save');

    await openNextVersionPen(page);
    await page.fill(NAME_FIELD, 'walk child');
    await page.fill(MILK_FIELD, '92');
    await button(page.locator(VERSION_PEN), 'Save over this version').click();
    await page.waitForSelector(VERSION_PEN, { state: 'detached' });
    const over = await walk.step('saved-over', { stores: true });
    const child = over.stores.versions.find((v) => v.id === '00000000-0000-4000-8000-000000000001');
    walk.expect(Boolean(child) && JSON.stringify(child.rows).includes('"grams":92'), 'the child record carries 92 after the save over');
    walk.expect(over.stores.versions.length === saved.stores.versions.length, 'a save over adds no record');
    walk.expect(over.snapshot.pageStatus === 'Version saved.', `the page status reads "Version saved." after the save over (${over.snapshot.pageStatus})`);
  },
]);

// D-13 (c), (d), (f): the record pen blocked on two measurements, then one
// fixed, then the churn date.
SCENARIOS.push([
  'record-pen-blocked',
  async (walk) => {
    const { page } = walk;
    const save = () => button(ceremony(page), 'Save batch').click();
    await walk.open(VERSION_ROUTE);
    await openRecordPen(page);
    await walk.step('pen-opened');

    await addTasting(page);
    await page.fill(CHURN_DURATION, '-3');
    await page.fill(TEMPERING, '-2');
    await walk.step('measurements-typed');

    await save();
    const blocked = await walk.step('blocked-two-measurements');
    walk.expect(blocked.snapshot.invalid.length === 2, `two measurements are marked (${blocked.snapshot.invalid.length})`);
    walk.expect(blocked.snapshot.formStatus.includes(MEASURED_INVALID), 'the form status reads the marked measurements words');
    walk.expect(
      blocked.snapshot.focus?.ariaLabel === blocked.snapshot.invalid[0],
      `the first marked measurement has focus (${blocked.snapshot.focus?.ariaLabel})`,
    );

    await page.fill(CHURN_DURATION, '30');
    const fixed = await walk.step('one-measurement-fixed');
    walk.expect(fixed.snapshot.invalid.length === 1, `exactly one mark remains (${fixed.snapshot.invalid.length})`);
    walk.expect(fixed.snapshot.invalid[0]?.startsWith('Tempering'), 'the mark that remains is Tempering');

    await page.fill(TEMPERING, '');
    await save();
    const dateBlocked = await walk.step('blocked-churn-date');
    walk.expect(await pageHas(page, CHURN_DATE_SENTENCE), 'a blocked churn date says "Enter the date you churned."');
    walk.expect(dateBlocked.snapshot.formStatus.includes(CHURN_DATE_STATUS), 'the form status reads the churn date words');

    await page.locator(CHURN_DATE).first().fill('2026-10-09');
    await walk.step('churn-date-typed');
    walk.expect(!(await pageHas(page, CHURN_DATE_SENTENCE)), 'typing a date clears the date sentence');

    await cancelRecordPen(page);
    await walk.afterDebounce();
    const cancelled = await walk.step('cancelled', { stores: true });
    walk.expect(cancelled.stores.drafts.length === 0, `Cancel discards the draft (${cancelled.stores.drafts.length})`);
    walk.expect(cancelled.snapshot.pens.record === 0, 'Cancel closes the pen');
  },
]);

// A batch recorded with a tasting.
SCENARIOS.push([
  'record-pen-save',
  async (walk) => {
    const { page } = walk;
    await walk.open(VERSION_ROUTE);
    const before = await dumpStores(page);
    await openRecordPen(page);
    await page.locator(CHURN_DATE).first().fill('2026-10-09');
    await page.fill(OUT_OF_MACHINE, '-6');
    await page.fill(CHURN_DURATION, '30');
    await addTasting(page);
    await markAxis(page, 'Hardness', 3);
    await page.fill(TASTING_NOTE, 'Soft, not greasy.');
    await walk.step('filled');

    await button(ceremony(page), 'Save batch').click();
    await page.waitForFunction(() => location.pathname.endsWith('/batch/00000000-0000-4000-8000-000000000001'), null, { timeout: 5000 });
    await page.waitForSelector('.notebook');
    const saved = await walk.step('saved', { stores: true });
    walk.expect(saved.stores.batches.length === before.batches.length + 1, 'the batches store gains one record');
    walk.expect(saved.stores.drafts.length === 0, 'no draft is kept after the save');
    walk.expect(saved.snapshot.pens.record === 0, 'the pen closes after the save');
  },
]);

// D-13 (f): the record pen's kept draft through a reload, then Cancel.
SCENARIOS.push([
  'record-pen-kept-draft',
  async (walk) => {
    const { page } = walk;
    await walk.open(VERSION_ROUTE);
    await openRecordPen(page);
    await page.locator(CHURN_DATE).first().fill('2026-10-09');
    await page.fill(OUT_OF_MACHINE, '-6');
    await addTasting(page);
    await markAxis(page, 'Hardness', 3);
    await walk.afterDebounce();
    const typed = await walk.step('typed', { stores: true });
    walk.expect(typed.stores.drafts.length === 1, `the drafts store holds one record (${typed.stores.drafts.length})`);

    await reload(page);
    walk.expect(await waitForNotice(page), `the notice reads "${KEPT}" after the reload`);
    const reloaded = await walk.step('reloaded', { stores: true });
    walk.expect(reloaded.snapshot.pens.record === 1, 'the record pen is open after the reload');
    walk.expect(fieldValue(reloaded.snapshot, 'Churn date') === '2026-10-09', 'the churn date is in its field after the reload');
    walk.expect(fieldValue(reloaded.snapshot, 'Out of machine') === '-6', 'Out of machine is in its field after the reload');

    await cancelRecordPen(page);
    await walk.afterDebounce();
    const cancelled = await walk.step('cancelled', { stores: true });
    walk.expect(cancelled.stores.drafts.length === 0, `Cancel discards the draft (${cancelled.stores.drafts.length})`);
    walk.expect(cancelled.snapshot.pens.record === 0, 'Cancel closes the pen');
  },
]);

// A correction of the seeded batch, saved.
SCENARIOS.push([
  'correct-save',
  async (walk) => {
    const { page } = walk;
    await walk.open(BATCH_ROUTE);
    await openCorrectPen(page);
    await walk.step('pen-opened');
    await page.fill(CHURN_DURATION, '31');
    await walk.step('duration-edited');
    await button(ceremony(page), 'Save batch').click();
    await page.waitForSelector(PEN, { state: 'detached' });
    const saved = await walk.step('saved', { stores: true });
    const batch = saved.stores.batches.find((b) => b.id === BATCH_ID);
    walk.expect(Boolean(batch) && batch.churn.churnDurationMinutes === 31, 'the seeded batch carries 31 after the correction');
    walk.expect(Boolean(batch?.changed), 'the corrected batch carries a changed stamp');
    walk.expect((saved.snapshot.pageStatus ?? '').startsWith('changed '), `the page status starts with "changed " (${saved.snapshot.pageStatus})`);
  },
]);

// D-13 (f): the Correct pen's kept draft through a reload, then Cancel.
SCENARIOS.push([
  'correct-kept-draft',
  async (walk) => {
    const { page } = walk;
    await walk.open(BATCH_ROUTE);
    await openCorrectPen(page);
    await page.fill(CHURN_DURATION, '31');
    await walk.afterDebounce();
    const typed = await walk.step('typed', { stores: true });
    walk.expect(typed.stores.drafts.length === 1, `the drafts store holds one record (${typed.stores.drafts.length})`);

    await reload(page);
    walk.expect(await waitForNotice(page), `the notice reads "${KEPT}" after the reload`);
    const reloaded = await walk.step('reloaded', { stores: true });
    walk.expect(reloaded.snapshot.pens.record === 1, 'the Correct pen is open after the reload');
    walk.expect(fieldValue(reloaded.snapshot, 'Churn duration') === '31', 'the edited duration is in its field after the reload');

    await cancelRecordPen(page);
    await walk.afterDebounce();
    const cancelled = await walk.step('cancelled', { stores: true });
    walk.expect(cancelled.stores.drafts.length === 0, `Cancel discards the draft (${cancelled.stores.drafts.length})`);
    walk.expect(cancelled.snapshot.pens.record === 0, 'Cancel closes the pen');
  },
]);

// D-13 (e): removing a tasting, restoring it, and what keeps the restore.
SCENARIOS.push([
  'tasting-remove-restore',
  async (walk) => {
    const { page } = walk;
    await walk.open(BATCH_ROUTE);
    await openCorrectPen(page);
    const opened = await walk.step('pen-opened');
    const seeded = fieldValue(opened.snapshot, 'Tasting temperature');
    walk.expect(Boolean(seeded), `the seeded tasting temperature shows in the pen (${seeded})`);

    await page.locator('.tasting-head__remove').click();
    const removed = await walk.step('tasting-removed');
    walk.expect(removed.snapshot.recordStatus === 'Tasting removed. You can restore it.', `the record status reads the removal words (${removed.snapshot.recordStatus})`);
    walk.expect(hasButton(removed.snapshot, 'Restore tasting'), 'a Restore tasting button is present');

    // Only the end-of-record ceremony carries the restore slot; the foot's does not.
    await button(page, 'Restore tasting').click();
    const restored = await walk.step('tasting-restored');
    walk.expect(restored.snapshot.tastingStatus === 'Tasting restored.', `the tasting status reads the restore words (${restored.snapshot.tastingStatus})`);
    walk.expect(fieldValue(restored.snapshot, 'Tasting temperature') === seeded, 'the tasting temperature holds its seeded value again');

    await page.locator('.tasting-head__remove').click();
    await walk.step('tasting-removed-again');
    await page.fill(CHURN_DURATION, '33');
    const churnEdited = await walk.step('churn-field-edited-after-removal');
    walk.expect(hasButton(churnEdited.snapshot, 'Restore tasting'), 'a churn field edit keeps the Restore tasting button');
    // A tasting-body edit while an undo is pending has no click path: Add
    // tasting is not offered while a restore is pending, and the tasting body
    // is collapsed. The walk records what the maker can see here instead.
    walk.expect(!hasButton(churnEdited.snapshot, 'Add tasting'), 'Add tasting is not offered while a restore is pending');

    await cancelRecordPen(page);
    await walk.afterDebounce();
    const cancelled = await walk.step('cancelled', { stores: true });
    walk.expect(cancelled.stores.drafts.length === 0, `Cancel discards the draft (${cancelled.stores.drafts.length})`);
  },
]);

// A tasting added to a batch recorded without one.
SCENARIOS.push([
  'tasting-save',
  async (walk) => {
    const { page } = walk;
    await walk.open(VERSION_ROUTE);
    await openRecordPen(page);
    await page.locator(CHURN_DATE).first().fill('2026-10-09');
    await button(ceremony(page), 'Save batch').click();
    await page.waitForFunction(() => location.pathname.endsWith('/batch/00000000-0000-4000-8000-000000000001'), null, { timeout: 5000 });
    await page.waitForSelector('.notebook');
    const recorded = await walk.step('recorded', { stores: true });
    const first = recorded.stores.batches.find((b) => b.id === '00000000-0000-4000-8000-000000000001');
    walk.expect(Boolean(first) && !first.tasting, 'the new batch has no tasting');

    await openCorrectPen(page);
    await addTasting(page);
    await markAxis(page, 'Hardness', 3);
    await page.fill(TASTING_NOTE, 'Soft, not greasy.');
    await walk.step('tasting-filled');
    await button(ceremony(page), 'Save batch').click();
    await page.waitForSelector(PEN, { state: 'detached' });
    const saved = await walk.step('saved', { stores: true });
    const batch = saved.stores.batches.find((b) => b.id === '00000000-0000-4000-8000-000000000001');
    walk.expect(Boolean(batch?.tasting), 'the batch carries a tasting after the save');
    walk.expect(JSON.stringify(batch?.tasting ?? {}).includes('Soft, not greasy.'), 'the stored tasting holds the note');
  },
]);

// ---------------------------------------------------------------------------
// record: run every scenario, check every expected fact, then write.
// ---------------------------------------------------------------------------
async function record(outPath) {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  const scenarios = [];
  const fails = [];
  try {
    for (const [name, body] of SCENARIOS) {
      const result = await runScenario(browser, appUrl, name, body);
      scenarios.push(result.scenario);
      fails.push(...result.fails);
    }
  } finally {
    await browser.close();
    await close();
  }
  if (fails.length > 0) {
    for (const line of fails) console.log(line);
    process.exit(1);
  }
  const output = { walk: '05', engine: 'webkit', width: WIDTH, scenarios };
  await writeFile(outPath, `${JSON.stringify(output, null, 2)}\n`);
  const count = scenarios.reduce((sum, scenario) => sum + scenario.steps.length, 0);
  console.log(`RECORDED ${outPath} ${count} snapshots`);
}

// ---------------------------------------------------------------------------
// compare: every leaf that differs, by scenario, step and JSON path (D-15).
//
// A difference under `stores.` is allowed only when it is on ALLOWED_STORE_PATHS
// and its after-value is exactly the one the phase's seed modules say it must
// be; any other difference, and everything outside `stores.`, is a DIFF. The
// allow-list checks only differences, and a field missing from both files makes
// none, so REQUIRED_STORE_FIELDS then asserts every addition on every after-dump.
// ---------------------------------------------------------------------------
function diffLeaves(before, after, where, out) {
  const bothObjects = before && after && typeof before === 'object' && typeof after === 'object';
  if (bothObjects && Array.isArray(before) === Array.isArray(after)) {
    const keys = Array.isArray(before)
      ? Array.from({ length: Math.max(before.length, after.length) }, (_, i) => i)
      : [...new Set([...Object.keys(before), ...Object.keys(after)])];
    for (const key of keys) {
      const next = Array.isArray(before) ? `${where}[${key}]` : where === '' ? key : `${where}.${key}`;
      diffLeaves(before[key], after[key], next, out);
    }
    return;
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) out.push([where, before, after]);
}

// ---------------------------------------------------------------------------
// The expected values. Each is defined ONCE, here: the allow-list, the
// required-additions pass and the `expected` mode all call these functions.
// Nothing below reads an expected value from the after-file, or through a
// row's own dumped libraryId, so a wrong link cannot justify a wrong value.
// ---------------------------------------------------------------------------
const D20_KEYS = ['fatStructural', 'ownEmulsifier', 'titratableAcidity', 'defaultStage', 'prepNote', 'requiresHeat'];

const has = (object, key) => object !== null && typeof object === 'object' && Object.hasOwn(object, key);

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const left = Object.keys(a);
  const right = Object.keys(b);
  return left.length === right.length && left.every((key) => has(b, key) && deepEqual(a[key], b[key]));
}

const SEEDED_VERSIONS = new Map();
const SEEDED_BATCHES = new Map();
for (const group of seedRecipeGroups) {
  for (const version of group.versions) SEEDED_VERSIONS.set(version.id, version);
  for (const batch of group.batches) SEEDED_BATCHES.set(batch.id, batch);
}

// The core words, as a stored batch snapshot carries them (D-03).
const EXPECTED_CORE_SCALES = coreScaleDefinitions(CORE_SCALE_ROWS);
const EXPECTED_CORE_PROBLEMS = problemNames(CORE_PROBLEM_ROWS);

// A declared scale was a name and is now the scales table's definition with
// that name (decisions 3 and 5). undefined when the table has no such name.
function expectedDefinitionForName(name) {
  const row = CORE_SCALE_ROWS.find((candidate) => candidate.name === name);
  return row ? scaleDefinition(row) : undefined;
}
function expectedDefinitionForKey(key) {
  const row = CORE_SCALE_ROWS.find((candidate) => candidate.key === key);
  return row ? scaleDefinition(row) : undefined;
}

// The seeded version a dumped version descends from: itself when its id is a
// seeded id, else through parentVersionId (the walk's children descend from olive
// oil v1). versionsById is the same dump's versions, for the chain.
function seededAncestor(record, versionsById) {
  const seen = new Set();
  let current = record;
  while (current && typeof current === 'object' && !seen.has(current.id)) {
    seen.add(current.id);
    const seeded = SEEDED_VERSIONS.get(current.id);
    if (seeded) return seeded;
    current = versionsById.get(current.parentVersionId);
  }
  return undefined;
}

// The version a dumped batch was recorded on, as a seeded ancestor.
function seededAncestorOfBatch(batch, versionsById) {
  const version = versionsById.get(batch.versionId) ?? SEEDED_VERSIONS.get(batch.versionId);
  return version ? seededAncestor(version, versionsById) : undefined;
}

// A version's code: the stored seed code for a seeded id (D-05), else the code
// derived from the id the dumped record carries (D-04); the id is never a
// counter value assumed here.
function expectedSheetCode(record) {
  if (SEEDED_VERSIONS.has(record.id)) return SEED_SHEET_CODES[record.id];
  return typeof record.id === 'string' && record.id !== '' ? codeFromVersionId(record.id) : undefined;
}

// D-19 as amended: a seeded version's own copied Ice Ed figure; a version the
// walk created has its parent's.
function expectedServeTempC(record, versionsById) {
  const seeded = seededAncestor(record, versionsById);
  return seeded && has(seeded, 'serveTempC') ? seeded.serveTempC : undefined;
}

// D-13: every version's equipment gains maxFillG, null where nothing is known.
const EXPECTED_MAX_FILL_G = null;

// LIB-08: the seeded row's libraryId for a row id: a library id, or null for the
// strawberry recipe's two own definitions; undefined when the seed has no such row.
function expectedLibraryId(seededVersion, rowId) {
  const row = seededVersion?.rows.find((candidate) => candidate.id === rowId);
  return row && has(row, 'libraryId') ? row.libraryId : undefined;
}

// D-20: the library entry's value for one of the six keys; null when the link is
// null; undefined when the link names no entry or the entry lacks the key.
function expectedCoefficient(libraryIdValue, key) {
  if (libraryIdValue === null) return null;
  if (typeof libraryIdValue !== 'string' || !Object.hasOwn(library, libraryIdValue)) return undefined;
  const entry = library[libraryIdValue];
  return has(entry, key) ? entry[key] : undefined;
}

// D-20: the acidity's basis or source word, only the dairy entries hold one;
// undefined means the key must be absent from the stored ingredient.
function expectedAcidityProvenance(libraryIdValue, field) {
  if (typeof libraryIdValue !== 'string' || !Object.hasOwn(library, libraryIdValue)) return undefined;
  const group = library[libraryIdValue][field];
  return has(group, 'titratableAcidity') ? group.titratableAcidity : undefined;
}

// ---------------------------------------------------------------------------
// ALLOWED_STORE_PATHS: one entry per allowed path. `pattern` is a regular
// expression over diffLeaves' `where`; check(was, now, m, context) is true only
// when the before value is absent (a name string for a declared scale) and the
// after value is the expected one. Numbers captured by the pattern are indexes
// into the after-dump's lists.
// ---------------------------------------------------------------------------
const absent = (value) => value === undefined;

const ALLOWED_STORE_PATHS = [
  {
    path: 'versions[i].sheetCode',
    pattern: /^stores\.versions\[(\d+)\]\.sheetCode$/,
    check: (was, now, [i], { stores }) => absent(was) && now !== undefined && deepEqual(now, expectedSheetCode(stores.versions[i])),
  },
  {
    path: 'versions[i].serveTempC',
    pattern: /^stores\.versions\[(\d+)\]\.serveTempC$/,
    check: (was, now, [i], { stores, versionsById }) => {
      const expected = expectedServeTempC(stores.versions[i], versionsById);
      return absent(was) && expected !== undefined && deepEqual(now, expected);
    },
  },
  {
    path: 'versions[i].equipment.maxFillG',
    pattern: /^stores\.versions\[(\d+)\]\.equipment\.maxFillG$/,
    check: (was, now) => absent(was) && now === EXPECTED_MAX_FILL_G,
  },
  {
    path: 'versions[i].declaredAxes[k]',
    pattern: /^stores\.versions\[(\d+)\]\.declaredAxes\[(\d+)\]$/,
    check: (was, now) => typeof was === 'string' && deepEqual(now, expectedDefinitionForName(was)),
  },
  {
    path: 'batches[i].snapshot.declaredAxes[k]',
    pattern: /^stores\.batches\[(\d+)\]\.snapshot\.declaredAxes\[(\d+)\]$/,
    check: (was, now) => typeof was === 'string' && deepEqual(now, expectedDefinitionForName(was)),
  },
  {
    path: 'batches[i].snapshot.coreScales',
    pattern: /^stores\.batches\[(\d+)\]\.snapshot\.coreScales$/,
    check: (was, now) => absent(was) && deepEqual(now, EXPECTED_CORE_SCALES),
  },
  {
    path: 'batches[i].snapshot.coreProblems',
    pattern: /^stores\.batches\[(\d+)\]\.snapshot\.coreProblems$/,
    check: (was, now) => absent(was) && deepEqual(now, EXPECTED_CORE_PROBLEMS),
  },
];

// The row-level paths come in pairs, one under a version's rows and one under a
// batch snapshot's rows. The row's expected libraryId is the seeded counterpart's
// (version or its parent, or the batch's versionId, and the row id); the
// coefficients are the library entry's for that id. No other ingredient path is
// allowed: a changed composition figure, a note, or an existing basis or source
// entry still fails.
const ROW_OWNERS = [
  {
    pattern: String.raw`versions\[(\d+)\]\.rows\[(\d+)\]`,
    row: ({ stores, versionsById }, i, j) => {
      const version = stores.versions[i];
      return { row: version?.rows?.[j], seeded: seededAncestor(version, versionsById) };
    },
  },
  {
    pattern: String.raw`batches\[(\d+)\]\.snapshot\.rows\[(\d+)\]`,
    row: ({ stores, versionsById }, i, j) => {
      const batch = stores.batches[i];
      return { row: batch?.snapshot?.rows?.[j], seeded: seededAncestorOfBatch(batch, versionsById) };
    },
  },
];

const expectedLinkOf = (context, owner, i, j) => {
  const { row, seeded } = owner.row(context, i, j);
  return row ? expectedLibraryId(seeded, row.id) : undefined;
};

for (const owner of ROW_OWNERS) {
  ALLOWED_STORE_PATHS.push({
    path: `${owner.pattern}.libraryId`,
    pattern: new RegExp(`^stores\\.${owner.pattern}\\.libraryId$`),
    check: (was, now, [i, j], context) => {
      const expected = expectedLinkOf(context, owner, i, j);
      return absent(was) && expected !== undefined && now === expected;
    },
  });
  for (const key of D20_KEYS) {
    ALLOWED_STORE_PATHS.push({
      path: `${owner.pattern}.ingredient.${key}`,
      pattern: new RegExp(`^stores\\.${owner.pattern}\\.ingredient\\.${key}$`),
      check: (was, now, [i, j], context) => {
        const expected = expectedCoefficient(expectedLinkOf(context, owner, i, j), key);
        return absent(was) && expected !== undefined && deepEqual(now, expected);
      },
    });
  }
  for (const field of ['basis', 'source']) {
    ALLOWED_STORE_PATHS.push({
      path: `${owner.pattern}.ingredient.${field}.titratableAcidity`,
      pattern: new RegExp(`^stores\\.${owner.pattern}\\.ingredient\\.${field}\\.titratableAcidity$`),
      check: (was, now, [i, j], context) => {
        const expected = expectedAcidityProvenance(expectedLinkOf(context, owner, i, j), field);
        return absent(was) && expected !== undefined && deepEqual(now, expected);
      },
    });
  }
}

// What an after-step's dump lets the checks resolve: its versions by id.
function storeContext(step) {
  const stores = step?.stores;
  if (!stores || !Array.isArray(stores.versions) || !Array.isArray(stores.batches)) return undefined;
  return { stores, versionsById: new Map(stores.versions.map((version) => [version.id, version])) };
}

// ---------------------------------------------------------------------------
// REQUIRED_STORE_FIELDS: over one after-dump, every addition is an own key with
// its expected value. Returns how many were present; each miss is a FAIL line
// with its path, pushed to `fails`.
// ---------------------------------------------------------------------------
function requiredRowFields(row, link, where, fail) {
  let present = 0;
  if (!has(row, 'libraryId')) fail(`${where}.libraryId`, 'missing own libraryId');
  else if (link === undefined) fail(`${where}.libraryId`, 'no seeded counterpart for this row');
  else if (row.libraryId !== link) fail(`${where}.libraryId`, `libraryId ${JSON.stringify(row.libraryId)}, expected ${JSON.stringify(link)}`);
  else present += 1;

  const ingredient = row?.ingredient;
  for (const key of D20_KEYS) {
    const expected = expectedCoefficient(link, key);
    if (!has(ingredient, key)) fail(`${where}.ingredient.${key}`, 'missing own key');
    else if (expected === undefined || !deepEqual(ingredient[key], expected)) {
      fail(`${where}.ingredient.${key}`, `${JSON.stringify(ingredient[key])}, expected ${JSON.stringify(expected)}`);
    } else present += 1;
  }
  for (const field of ['basis', 'source']) {
    const expected = expectedAcidityProvenance(link, field);
    const stored = has(ingredient?.[field], 'titratableAcidity');
    if (expected === undefined) {
      if (stored) fail(`${where}.ingredient.${field}.titratableAcidity`, 'present, expected absent');
    } else if (!stored) fail(`${where}.ingredient.${field}.titratableAcidity`, 'missing own key');
    else if (!deepEqual(ingredient[field].titratableAcidity, expected)) {
      fail(`${where}.ingredient.${field}.titratableAcidity`, `${JSON.stringify(ingredient[field].titratableAcidity)}, expected ${JSON.stringify(expected)}`);
    } else present += 1;
  }
  return present;
}

function requiredDeclared(list, where, fail) {
  let present = 0;
  (Array.isArray(list) ? list : []).forEach((element, k) => {
    const expected = isScaleDefinition(element) ? expectedDefinitionForKey(element.key) : undefined;
    if (expected === undefined || !deepEqual(element, expected)) {
      fail(`${where}[${k}]`, `${JSON.stringify(element)} is not a definition the scales table holds`);
    } else present += 1;
  });
  return present;
}

function requiredStoreFields(context, fail) {
  const { stores, versionsById } = context;
  let present = 0;
  stores.versions.forEach((version, i) => {
    const where = `stores.versions[${i}]`;
    const seeded = seededAncestor(version, versionsById);
    const code = expectedSheetCode(version);
    if (!has(version, 'sheetCode')) fail(`${where}.sheetCode`, 'missing own sheetCode');
    else if (code === undefined || version.sheetCode !== code) fail(`${where}.sheetCode`, `${JSON.stringify(version.sheetCode)}, expected ${JSON.stringify(code)}`);
    else present += 1;

    const serve = expectedServeTempC(version, versionsById);
    if (!has(version, 'serveTempC')) fail(`${where}.serveTempC`, 'missing own serveTempC');
    else if (serve === undefined || !deepEqual(version.serveTempC, serve)) fail(`${where}.serveTempC`, `${JSON.stringify(version.serveTempC)}, expected ${JSON.stringify(serve)}`);
    else present += 1;

    if (version.equipment && typeof version.equipment === 'object') {
      if (!has(version.equipment, 'maxFillG')) fail(`${where}.equipment.maxFillG`, 'missing own maxFillG');
      else if (version.equipment.maxFillG !== EXPECTED_MAX_FILL_G) fail(`${where}.equipment.maxFillG`, `${JSON.stringify(version.equipment.maxFillG)}, expected null`);
      else present += 1;
    }
    present += requiredDeclared(version.declaredAxes, `${where}.declaredAxes`, fail);
    (version.rows ?? []).forEach((row, j) => {
      present += requiredRowFields(row, expectedLibraryId(seeded, row?.id), `${where}.rows[${j}]`, fail);
    });
  });
  stores.batches.forEach((batch, i) => {
    const where = `stores.batches[${i}].snapshot`;
    const snapshot = batch.snapshot ?? {};
    const seeded = seededAncestorOfBatch(batch, versionsById);
    if (!has(snapshot, 'coreScales')) fail(`${where}.coreScales`, 'missing own coreScales');
    else if (!deepEqual(snapshot.coreScales, EXPECTED_CORE_SCALES)) fail(`${where}.coreScales`, 'not the four core definitions');
    else present += 1;
    if (!has(snapshot, 'coreProblems')) fail(`${where}.coreProblems`, 'missing own coreProblems');
    else if (!deepEqual(snapshot.coreProblems, EXPECTED_CORE_PROBLEMS)) fail(`${where}.coreProblems`, 'not the four core words');
    else present += 1;
    present += requiredDeclared(snapshot.declaredAxes, `${where}.declaredAxes`, fail);
    (snapshot.rows ?? []).forEach((row, j) => {
      present += requiredRowFields(row, expectedLibraryId(seeded, row?.id), `${where}.rows[${j}]`, fail);
    });
  });
  return present;
}

// compareResult(before, after): prints nothing. diffs and fails are lines ready
// to print; allowed counts the store differences the allow-list passed; required
// counts the additions found present; count is the snapshots compared.
function compareResult(a, b) {
  const diffs = [];
  const fails = [];
  const show = (value) => (value === undefined ? 'absent' : JSON.stringify(value));
  const emit = (scenario, step, where, before, after) =>
    diffs.push(`DIFF ${scenario} / ${step} / ${where}: before=${show(before)} after=${show(after)}`);

  for (const key of ['walk', 'engine', 'width']) {
    if (a[key] !== b[key]) emit('(file)', key, key, a[key], b[key]);
  }
  const names = [...new Set([...a.scenarios.map((s) => s.name), ...b.scenarios.map((s) => s.name)])];
  let count = 0;
  let allowed = 0;
  let required = 0;
  for (const name of names) {
    const left = a.scenarios.find((s) => s.name === name);
    const right = b.scenarios.find((s) => s.name === name);
    if (!left || !right) {
      emit(name, '(scenario)', '', left, right);
      continue;
    }
    const labels = [...new Set([...left.steps.map((s) => s.step), ...right.steps.map((s) => s.step)])];
    for (const label of labels) {
      const before = left.steps.find((s) => s.step === label);
      const after = right.steps.find((s) => s.step === label);
      if (!before || !after) {
        emit(name, label, '', before, after);
        continue;
      }
      count += 1;
      const context = storeContext(after);
      const found = [];
      diffLeaves(before, after, '', found);
      for (const [where, was, now] of found) {
        let passed = false;
        if (context && where.startsWith('stores.')) {
          for (const entry of ALLOWED_STORE_PATHS) {
            const match = entry.pattern.exec(where);
            if (match && entry.check(was, now, match.slice(1).map(Number), context)) {
              passed = true;
              break;
            }
          }
        }
        if (passed) allowed += 1;
        else emit(name, label, where, was, now);
      }
      if (context) {
        required += requiredStoreFields(context, (where, message) => fails.push(`FAIL ${name} / ${label} / ${where}: ${message}`));
      }
    }
  }
  return { diffs, fails, allowed, required, count };
}

async function readWalk(p) {
  return JSON.parse(await readFile(p, 'utf8'));
}

async function compare(pathA, pathB) {
  const [a, b] = await Promise.all([pathA, pathB].map(readWalk));
  const { diffs, fails, allowed, required, count } = compareResult(a, b);
  if (diffs.length > 0 || fails.length > 0) {
    for (const line of [...diffs, ...fails]) console.log(line);
    process.exit(1);
  }
  console.log(`ALLOWED ${allowed} store differences, each checked`);
  console.log(`REQUIRED ${required} additions present`);
  console.log(`MATCH ${count} snapshots`);
}

// ---------------------------------------------------------------------------
// selftest: doctored copies of the after-file, each of which the compare must
// refuse, with a line that names the path that was doctored; and the real pair,
// which it must pass. Exits 1 on any FAIL.
// ---------------------------------------------------------------------------
function* dumpedSteps(file) {
  for (const scenario of file.scenarios) {
    for (const step of scenario.steps) if (step.stores) yield { scenario: scenario.name, step };
  }
}

function* dumpedRows(file) {
  for (const { scenario, step } of dumpedSteps(file)) {
    for (const [i, version] of step.stores.versions.entries()) {
      for (const [j, row] of (version.rows ?? []).entries()) {
        yield { scenario, step, row, where: `stores.versions[${i}].rows[${j}]`, version };
      }
    }
    for (const [i, batch] of step.stores.batches.entries()) {
      for (const [j, row] of (batch.snapshot?.rows ?? []).entries()) {
        yield { scenario, step, row, where: `stores.batches[${i}].snapshot.rows[${j}]`, batch };
      }
    }
  }
}

// Each doctoring changes `file` in place and returns { scenario, step, where }
// for the path it changed, or undefined when it found nothing to change.
const DOCTORINGS = [
  [
    'name',
    'a recipe name changed (a path outside the allow-list)',
    (file) => {
      for (const { scenario, step } of dumpedSteps(file)) {
        const index = step.stores.recipes.findIndex((recipe) => typeof recipe.name === 'string');
        if (index < 0) continue;
        step.stores.recipes[index].name += ' (doctored)';
        return { scenario, step: step.step, where: `stores.recipes[${index}].name` };
      }
      return undefined;
    },
  ],
  [
    'nulllink',
    'a null libraryId set to strawberries (a wrong value at a permitted path)',
    (file) => {
      for (const found of dumpedRows(file)) {
        if (found.row.libraryId !== null) continue;
        found.row.libraryId = 'strawberries';
        return { scenario: found.scenario, step: found.step.step, where: `${found.where}.libraryId` };
      }
      return undefined;
    },
  ],
  [
    'code',
    'a seeded version\'s sheetCode replaced by another canonical code (a wrong value at a permitted path)',
    (file) => {
      for (const { scenario, step } of dumpedSteps(file)) {
        const index = step.stores.versions.findIndex((version) => SEEDED_VERSIONS.has(version.id) && typeof version.sheetCode === 'string');
        if (index < 0) continue;
        const version = step.stores.versions[index];
        version.sheetCode = version.sheetCode === 'ZZZZ-0000' ? 'ZZZZ-0001' : 'ZZZZ-0000';
        return { scenario, step: step.step, where: `stores.versions[${index}].sheetCode` };
      }
      return undefined;
    },
  ],
  [
    'nocode',
    'a version\'s sheetCode deleted (a missing required addition)',
    (file) => {
      for (const { scenario, step } of dumpedSteps(file)) {
        const index = step.stores.versions.findIndex((version) => has(version, 'sheetCode'));
        if (index < 0) continue;
        delete step.stores.versions[index].sheetCode;
        return { scenario, step: step.step, where: `stores.versions[${index}].sheetCode` };
      }
      return undefined;
    },
  ],
  [
    'servetemp',
    'a seeded version\'s numeric serveTempC moved by one degree (a wrong value at a permitted path, D-19 as amended)',
    (file) => {
      for (const { scenario, step } of dumpedSteps(file)) {
        const index = step.stores.versions.findIndex((version) => SEEDED_VERSIONS.has(version.id) && typeof version.serveTempC === 'number');
        if (index < 0) continue;
        step.stores.versions[index].serveTempC += 1;
        return { scenario, step: step.step, where: `stores.versions[${index}].serveTempC` };
      }
      return undefined;
    },
  ],
  [
    'wrongcoef',
    'a row\'s numeric ingredient.titratableAcidity moved by 0.001 (a wrong coefficient at a permitted path, D-20)',
    (file) => {
      for (const found of dumpedRows(file)) {
        if (typeof found.row.ingredient?.titratableAcidity !== 'number') continue;
        found.row.ingredient.titratableAcidity += 0.001;
        return { scenario: found.scenario, step: found.step.step, where: `${found.where}.ingredient.titratableAcidity` };
      }
      return undefined;
    },
  ],
  [
    'nocoef',
    'a version row\'s ingredient.defaultStage key deleted (a missing coefficient, D-20)',
    (file) => {
      for (const found of dumpedRows(file)) {
        if (!found.version || !has(found.row.ingredient, 'defaultStage')) continue;
        delete found.row.ingredient.defaultStage;
        return { scenario: found.scenario, step: found.step.step, where: `${found.where}.ingredient.defaultStage` };
      }
      return undefined;
    },
  ],
];

async function selftest(pathBefore, pathAfter) {
  const [before, after] = await Promise.all([pathBefore, pathAfter].map(readWalk));
  let failed = 0;
  for (const [name, what, doctor] of DOCTORINGS) {
    const doctored = structuredClone(after);
    const changed = doctor(doctored);
    if (!changed) {
      console.log(`FAIL selftest ${name}: found nothing to change (${what})`);
      failed += 1;
      continue;
    }
    const { diffs, fails } = compareResult(before, doctored);
    const named = `${changed.scenario} / ${changed.step} / ${changed.where}`;
    const refused = [...diffs, ...fails].some((line) => line.startsWith(`DIFF ${named}:`) || line.startsWith(`FAIL ${named}:`));
    if (refused) console.log(`PASS selftest ${name}: refused at ${changed.where} (${what})`);
    else {
      console.log(`FAIL selftest ${name}: not refused at ${named} (${what})`);
      failed += 1;
    }
  }
  const real = compareResult(before, after);
  if (real.diffs.length === 0 && real.fails.length === 0) console.log('PASS selftest real: the real pair passes, null strawberry links and coefficients included');
  else {
    console.log(`FAIL selftest real: the real pair is refused (${real.diffs.length} DIFF, ${real.fails.length} FAIL)`);
    failed += 1;
  }
  if (failed > 0) process.exit(1);
}

// ---------------------------------------------------------------------------
// expected: with no browser and no build, check the expected-value functions
// above against what the seed modules stored and against the before-walk's
// dumps, using the same functions the allow-list uses. When it fails, either an
// expected function misreads the table or the seed and the table disagree: stop
// and report which; never change a function to match a stored value without
// saying why in the summary, and never widen the allow-list.
// ---------------------------------------------------------------------------
async function expectedMode(pathBefore) {
  const before = await readWalk(pathBefore);
  const results = new Map();
  const note = (check, ok, message) => {
    const entry = results.get(check) ?? { checked: 0, failed: 0 };
    entry.checked += 1;
    if (!ok) {
      entry.failed += 1;
      console.log(`FAIL (${check}) ${message}`);
    }
    results.set(check, entry);
  };
  const seededById = new Map(SEEDED_VERSIONS);

  // (a) every seeded declaredAxes element is the expected definition for its name.
  for (const version of SEEDED_VERSIONS.values()) {
    version.declaredAxes.forEach((element, k) => {
      const expected = expectedDefinitionForName(element?.name);
      note('a', expected !== undefined && deepEqual(element, expected), `version ${version.id} declaredAxes[${k}] is ${JSON.stringify(element)}, expected ${JSON.stringify(expected)}`);
    });
  }
  for (const batch of SEEDED_BATCHES.values()) {
    batch.snapshot.declaredAxes.forEach((element, k) => {
      const expected = expectedDefinitionForName(element?.name);
      note('a', expected !== undefined && deepEqual(element, expected), `batch ${batch.id} snapshot.declaredAxes[${k}] is ${JSON.stringify(element)}, expected ${JSON.stringify(expected)}`);
    });
    note('a', deepEqual(batch.snapshot.coreScales, EXPECTED_CORE_SCALES), `batch ${batch.id} snapshot.coreScales is not the four core definitions`);
    note('a', deepEqual(batch.snapshot.coreProblems, EXPECTED_CORE_PROBLEMS), `batch ${batch.id} snapshot.coreProblems is not the four core words`);
  }

  // (b) every declared-scale name in the before-walk's dumps resolves to a definition.
  for (const { scenario, step } of dumpedSteps(before)) {
    const place = (path) => `before-walk ${scenario} / ${step.step} / ${path}`;
    step.stores.versions.forEach((version, i) => {
      (version.declaredAxes ?? []).forEach((name, k) => {
        note('b', typeof name === 'string' && expectedDefinitionForName(name) !== undefined, `${place(`stores.versions[${i}].declaredAxes[${k}]`)} = ${JSON.stringify(name)} names no scale in the scales table`);
      });
    });
    step.stores.batches.forEach((batch, i) => {
      (batch.snapshot?.declaredAxes ?? []).forEach((name, k) => {
        note('b', typeof name === 'string' && expectedDefinitionForName(name) !== undefined, `${place(`stores.batches[${i}].snapshot.declaredAxes[${k}]`)} = ${JSON.stringify(name)} names no scale in the scales table`);
      });
    });
  }

  // (c) codes, serving temperatures and links are defined and equal the seed's own.
  for (const version of SEEDED_VERSIONS.values()) {
    const code = expectedSheetCode(version);
    note('c', code !== undefined && code === version.sheetCode, `version ${version.id} expected sheetCode ${JSON.stringify(code)}, stamped ${JSON.stringify(version.sheetCode)}`);
    const serve = expectedServeTempC(version, seededById);
    const ice = version.iceEd?.servingTemperatureC ?? null;
    note('c', serve !== undefined && serve === version.serveTempC && serve === ice, `version ${version.id} expected serveTempC ${JSON.stringify(serve)}, own ${JSON.stringify(version.serveTempC)}, iceEd.servingTemperatureC ${JSON.stringify(ice)}`);
    for (const row of version.rows) {
      const link = expectedLibraryId(version, row.id);
      note('c', (typeof link === 'string' || link === null) && link === row.libraryId, `version ${version.id} row ${row.id} expected libraryId ${JSON.stringify(link)}, own ${JSON.stringify(row.libraryId)}`);
    }
  }
  for (const batch of SEEDED_BATCHES.values()) {
    const seeded = seededAncestorOfBatch(batch, seededById);
    for (const row of batch.snapshot.rows) {
      const link = expectedLibraryId(seeded, row.id);
      note('c', (typeof link === 'string' || link === null) && link === row.libraryId, `batch ${batch.id} snapshot row ${row.id} expected libraryId ${JSON.stringify(link)}, own ${JSON.stringify(row.libraryId)}`);
    }
  }

  // (d) the six coefficients and the acidity provenance, per seeded row.
  const checkCoefficients = (owner, row, link) => {
    for (const key of D20_KEYS) {
      const expected = expectedCoefficient(link, key);
      note('d', expected !== undefined && has(row.ingredient, key) && deepEqual(row.ingredient[key], expected), `${owner} row ${row.id} expected ${key} ${JSON.stringify(expected)}, own ${JSON.stringify(row.ingredient?.[key])}`);
    }
    for (const field of ['basis', 'source']) {
      const expected = expectedAcidityProvenance(link, field);
      const stored = has(row.ingredient?.[field], 'titratableAcidity');
      const ok = expected === undefined ? !stored : stored && deepEqual(row.ingredient[field].titratableAcidity, expected);
      note('d', ok, `${owner} row ${row.id} expected ${field}.titratableAcidity ${JSON.stringify(expected)}, own ${stored ? JSON.stringify(row.ingredient[field].titratableAcidity) : 'absent'}`);
    }
    if (link === null) {
      note('d', D20_KEYS.every((key) => row.ingredient?.[key] === null), `${owner} row ${row.id} is an own definition and must own the six at null`);
    }
  };
  for (const version of SEEDED_VERSIONS.values()) {
    for (const row of version.rows) checkCoefficients(`version ${version.id}`, row, expectedLibraryId(version, row.id));
  }
  for (const batch of SEEDED_BATCHES.values()) {
    const seeded = seededAncestorOfBatch(batch, seededById);
    for (const row of batch.snapshot.rows) checkCoefficients(`batch ${batch.id}`, row, expectedLibraryId(seeded, row.id));
  }

  let failed = 0;
  const titles = {
    a: 'seeded declared definitions and core words equal the expected ones',
    b: 'every declared-scale name in the before-walk resolves to a definition',
    c: 'expected sheetCode, serveTempC and libraryId are defined and equal the seed\'s own',
    d: 'expected coefficients and acidity provenance are defined and equal the seed rows\' own',
  };
  for (const check of ['a', 'b', 'c', 'd']) {
    const entry = results.get(check) ?? { checked: 0, failed: 0 };
    if (entry.checked === 0) {
      console.log(`FAIL (${check}) nothing was checked: ${titles[check]}`);
      failed += 1;
    } else if (entry.failed > 0) {
      console.log(`FAIL (${check}) ${entry.failed} of ${entry.checked}: ${titles[check]}`);
      failed += 1;
    } else console.log(`PASS (${check}) ${entry.checked} checked: ${titles[check]}`);
  }
  if (failed > 0) process.exit(1);
}

const [, , mode, first, second] = process.argv;
if (mode === 'record' && first) {
  await record(first);
} else if (mode === 'compare' && first && second) {
  await compare(first, second);
} else if (mode === 'selftest' && first && second) {
  await selftest(first, second);
} else if (mode === 'expected' && first) {
  await expectedMode(first);
} else {
  console.error('Usage: node 09-walk.mjs record <out.json> | compare <a.json> <b.json> | selftest <before.json> <after.json> | expected <before.json>');
  process.exit(1);
}
