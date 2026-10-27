// 11-01: the strict before/after WebKit walk for Phase 11 (D-19), re-recorded at the
// base commit cf64aa70 (copied from 10-walk.mjs; the twelve scenario bodies are unchanged).
//
// The compare allows no difference at all in an existing scenario: every leaf of every
// snapshot and of every store dump must be equal, and every difference, under `stores.`
// or outside it, is a DIFF line that names the scenario, the step and the path. The one
// allowance is a WHOLE new scenario named in ALLOWED_NEW_SCENARIOS (the five that later
// Phase 11 plans add below the marker line): it is not compared, it is reported on the
// MATCH line as "NEW <name> <steps>", and it proves the records it did not make are
// untouched through walk.seed() and walk.expectSeedKept() (seedKeptProblems). A changed
// leaf in an existing scenario, a scenario missing after, a new scenario not in the list
// and a repeated name are each a DIFF line. There is no allowed-path table, no
// required-additions pass and no expected-value function.
//
// Every snapshot carries two hashes. textHash is the page root's innerText with the
// .method-region's own innerText cut out; methodHash is the .method-region's textContent
// after two normalisations only: every .method-step__purpose-label is removed with the
// ' - ' after it, and every .target-chip is read as one canonical text, JSON of
// [label, old value, new value] (canonicalTargetText), whatever its markup order. So the
// printed method treatment of decision 014 2 (the label read once and first, the word
// why) changes neither hash, while a changed old or new target value, a swapped pair, a
// removed-target tag, a changed lead-in or any other changed step word changes methodHash
// (D-19, RESEARCH G-4).
//
// The walk is the proof of page semantics and stores (text, fields, focus, statuses,
// the stores' contents), not of geometry. Where Phase 11 draws, layout is proven side
// by side by the board engine (11-board-check.mjs).
//
// Modes (none of compare, selftest and seedtest opens a browser):
//   node 11-walk.mjs record <out.json>                 (needs PROBE_DIST)
//   node 11-walk.mjs compare <a.json> <b.json>         prints MATCH <n> snapshots[; NEW <name> <k>] or every DIFF, exit 1
//   node 11-walk.mjs selftest <before.json>            doctored copies the compare must refuse
//   node 11-walk.mjs seedtest <before.json>            the seed rule a new scenario is held to
//   PROBE_DIST=<dist> node 11-walk.mjs normtest        the method hash against the built page (WebKit)
//
// Usage (from the repo root; the one-command form builds to scratch and compares):
//   sh .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh
// or by hand, after building to a scratch directory:
//   npm --prefix app run build -- --outDir "$TMPDIR/sprinkles-11/dist" --emptyOutDir
//   PROBE_DIST="$TMPDIR/sprinkles-11/dist" node .planning/phases/11-steps-structure-save-and-print/11-walk.mjs record <out.json>
//   node .planning/phases/11-steps-structure-save-and-print/11-walk.mjs compare <a.json> <b.json>
//
// Why it exists: the RecipePage tests render static markup and never run
// effects, so the reload-with-draft path, the focus landings and the saved
// records are not covered by the suite (D-11). This walk drives the BUILT app
// in WebKit through the version pen, the record pen, a correction and a
// tasting. After every step it records what the maker sees (status texts, the
// marked fields, the focused element, the open pens with their values and
// buttons, a hash of the page text and a hash of the method); after a scenario
// it records every record in the versions, batches, recipes and drafts stores.
// Phase 11 records the same walk after every plan and compares it with the baseline.
//
// `record` is deterministic: the browser clock is fixed (Date is one instant,
// timers keep running) and crypto.randomUUID is a counter kept in
// localStorage, so two runs against one build compare equal and a later DIFF
// names a real change. It fails loudly: a state the walk expects and does not
// reach prints a FAIL line, exits 1 and writes nothing.
//
// The build is read from PROBE_DIST (default app/dist). Pass a scratch
// --outDir build there so Mark's own `vite preview --host` on :4173, which
// serves app/dist, is never disturbed. No script here writes app/dist or starts Vite.
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

// .planning/phases/11-steps-structure-save-and-print/ -> phases/ -> .planning/ -> repo root.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// path.resolve drops the doubled slash a TMPDIR with a trailing slash leaves in
// "$TMPDIR/sprinkles-08/dist"; the static server compares paths with startsWith
// and would answer every request with 404 (the walk then times out on .shell).
const DIST = path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'));

const FIXED_ISO = '2026-10-14T12:00:00.000Z';
const WIDTH = 1366;

// The whole new scenarios later Phase 11 plans add below the marker line (D-19). The compare
// admits a scenario present in the after file alone only when its name is listed here.
const ALLOWED_NEW_SCENARIOS = ['create-recipe', 'create-save-refused', 'edit-first-version', 'edit-stale', 'edit-kept'];

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

// One target chip as one canonical text: JSON of [label, old value, new value], whatever
// the order of the chip's spans in the markup (D-19; review L36@45089779). The base build
// draws the struck `${label} ${from}` BEFORE the label and the value (Method.jsx:400-405),
// plan 11-04 draws the label, then the struck `from` alone, then the value; both read here
// as the same triple, with the old and the new value kept apart and in order. `label`,
// `struck` and `value` are the chip's trimmed span texts (null for a span the chip does
// not hold). A removed target's lone struck tag reads [null, '<label> <from>', null].
// Self-contained on purpose: its source is handed to page.evaluate (snapshot and normtest).
function canonicalTargetText(label, struck, value) {
  const old = label !== null && struck !== null && struck.startsWith(`${label} `) ? struck.slice(label.length + 1) : struck;
  return JSON.stringify([label, old, value]);
}

// The method region's text after the two normalisations and nothing else. Self-contained
// like canonicalTargetText: the page gets the source of both. `canon` is canonicalTargetText.
function readMethodText(region, canon) {
  const clone = region.cloneNode(true);
  // (a) every why label, with the em dash that follows it.
  for (const label of clone.querySelectorAll('.method-step__purpose-label')) {
    const next = label.nextSibling;
    if (next && next.nodeType === 3) next.textContent = next.textContent.replace(/^\s*—\s*/, '');
    label.remove();
  }
  // (b) every target chip as one canonical text node.
  const textOf = (el) => (el ? el.textContent.trim() : null);
  for (const chip of clone.querySelectorAll('.target-chip')) {
    const text = canon(
      textOf(chip.querySelector('.target-chip__label')),
      textOf(chip.querySelector('.struck-value')),
      textOf(chip.querySelector('.target-chip__value')),
    );
    chip.replaceChildren(document.createTextNode(text));
  }
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

// Set by `record <out> --keep-text`; read by takeSnapshot.
let keepText = false;

// The two sources, rebuilt inside a page.
const IN_PAGE ={ canon: canonicalTargetText.toString(), readMethod: readMethodText.toString() };

// -> { snapshot, methodCut }: methodCut says the method region's innerText was found in the
// page root's, so the cut that makes textHash is a real cut (a FAIL in step(), never a
// silent hash).
async function takeSnapshot(page) {
  const raw = await page.evaluate((sources) => {
    const canon = new Function(`return ${sources.canon}`)();
    const readMethod = new Function(`return ${sources.readMethod}`)();
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
    const base = {
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
    };
    // Read after focus, so nothing here can move it. The page root is `.notebook`, or `.nb`
    // where the page holds none (the Notebook place). The method region's own innerText is
    // cut out of the root's; its text is hashed apart after the two normalisations.
    const root = document.querySelector('.notebook') ?? document.querySelector('.nb');
    const full = root ? root.innerText : '';
    const region = root ? root.querySelector('.method-region') : null;
    const methodInner = region ? region.innerText : '';
    return {
      ...base,
      text: methodInner === '' ? full : full.replace(methodInner, ''),
      methodText: region ? readMethod(region, canon) : '',
      methodCut: methodInner === '' || full.includes(methodInner),
    };
  }, IN_PAGE);
  const { text, methodText, methodCut, ...rest } = raw;
  return {
    snapshot: {
      ...rest,
      textHash: createHash('sha256').update(text).digest('hex'),
      methodHash: createHash('sha256').update(methodText).digest('hex'),
      // record --keep-text (D-19): the strings the two hashes are made of, so ordercheck can
      // tell a reordered page from a changed one. Without the flag the snapshot is as before.
      ...(keepText ? { text, methodText } : {}),
    },
    methodCut,
  };
}

async function snapshot(page) {
  return (await takeSnapshot(page)).snapshot;
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
    // Open the app at a route, with the clock confirmed. The Notebook place (/notebook)
    // draws `div.list-page.place.nb` and no `.notebook`, so the wait takes either.
    async open(route) {
      await page.goto(`${appUrl}${route}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.shell');
      await page.waitForSelector('.notebook, .nb');
      const now = await page.evaluate(() => new Date().toISOString());
      walk.expect(now === FIXED_ISO, `the browser clock is fixed (${now})`);
    },
    // Record the snapshot (and the stores, when asked) under a label.
    async step(label, { stores = false } = {}) {
      if (steps.some((existing) => existing.step === label)) throw new Error(`step "${label}" is recorded twice`);
      await settle(page);
      const taken = await takeSnapshot(page);
      walk.expect(taken.methodCut, `the method region's text is found once in the page text (step ${label})`);
      const entry = { step: label, snapshot: taken.snapshot };
      if (stores) entry.stores = await dumpStores(page);
      steps.push(entry);
      return entry;
    },
    // The new scenarios' seed rule (D-19): dump the four stores right after the scenario's
    // first open, and hold every later stores dump to it with expectSeedKept.
    async seed() {
      walk.seedDump = await dumpStores(page);
      return walk.seedDump;
    },
    expectSeedKept(entry, recipeId) {
      if (!walk.seedDump) {
        walk.expect(false, 'expectSeedKept needs walk.seed() right after the first open');
        return;
      }
      if (!entry.stores) {
        walk.expect(false, `expectSeedKept needs a step recorded with stores (${entry.step})`);
        return;
      }
      for (const problem of seedKeptProblems(walk.seedDump, entry.stores, recipeId)) {
        fails.push(`FAIL ${name}: ${problem}`);
      }
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
const CHURN_DURATION = `${PEN} input[aria-label^="Duration"]`;
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
  await page.waitForSelector('.batch-margin--pen .batch-row__head--tasting');
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
    walk.expect(fieldValue(reloaded.snapshot, 'Churned') === '2026-10-09', 'the churn date is in its field after the reload');
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
    // "Batch saved." on both save paths since f58c861b (decide-notice-copy, Mark 2026-10-25).
    walk.expect(saved.snapshot.pageStatus === 'Batch saved.', `the page status is "Batch saved." (${saved.snapshot.pageStatus})`);
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
    walk.expect(fieldValue(reloaded.snapshot, 'Duration') === '31', 'the edited duration is in its field after the reload');

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
    const seeded = fieldValue(opened.snapshot, 'Temperature');
    walk.expect(Boolean(seeded), `the seeded tasting temperature shows in the pen (${seeded})`);

    await button(page, 'Remove tasting').click();
    const removed = await walk.step('tasting-removed');
    walk.expect(removed.snapshot.recordStatus === 'Tasting removed. You can restore it.', `the record status reads the removal words (${removed.snapshot.recordStatus})`);
    walk.expect(hasButton(removed.snapshot, 'Restore tasting'), 'a Restore tasting button is present');

    // Only the end-of-record ceremony carries the restore slot; the foot's does not.
    await button(page, 'Restore tasting').click();
    const restored = await walk.step('tasting-restored');
    walk.expect(restored.snapshot.tastingStatus === 'Tasting restored.', `the tasting status reads the restore words (${restored.snapshot.tastingStatus})`);
    walk.expect(fieldValue(restored.snapshot, 'Temperature') === seeded, 'the tasting temperature holds its seeded value again');

    await button(page, 'Remove tasting').click();
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
// ---- Phase 11 scenarios (ALLOWED_NEW_SCENARIOS) ----
// Later Phase 11 plans push their scenarios here, each named in ALLOWED_NEW_SCENARIOS, each
// calling walk.seed() right after its first walk.open and walk.expectSeedKept(entry, recipeId)
// on every step recorded with stores. The twelve above are the baseline and stay as they are.

async function record(outPath, withText = false) {
  keepText = withText;
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
// compare: every leaf that differs, by scenario, step and JSON path (D-11).
// Nothing is allowed in an existing scenario: a store leaf, a snapshot leaf, an added or
// removed key and a repeated name are all DIFF lines. The one allowance is a whole
// scenario present in the after file alone whose name is in ALLOWED_NEW_SCENARIOS (D-19).
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

async function readWalk(p) {
  return JSON.parse(await readFile(p, 'utf8'));
}

// compareResult(a, b): prints nothing. diffs are lines ready to print; count is
// the snapshots compared; added lists { name, steps } for each allowed new scenario.
function compareResult(a, b) {
  const diffs = [];
  const added = [];
  const show = (value) => (value === undefined ? 'absent' : JSON.stringify(value));
  const emit = (scenario, step, where, before, after) =>
    diffs.push(`DIFF ${scenario} / ${step} / ${where}: before=${show(before)} after=${show(after)}`);

  for (const key of ['walk', 'engine', 'width']) {
    if (a[key] !== b[key]) emit('(file)', key, key, a[key], b[key]);
  }

  // A repeated name is refused before anything is matched by name: find() would
  // otherwise compare the first of two same-named steps and let the second pass.
  const repeats = (file, side) => {
    const seen = new Set();
    for (const scenario of file.scenarios) {
      if (seen.has(scenario.name)) emit(scenario.name, '(duplicate)', `${side}: scenario ${scenario.name}`, undefined, undefined);
      seen.add(scenario.name);
      const steps = new Set();
      for (const step of scenario.steps) {
        if (steps.has(step.step)) emit(scenario.name, '(duplicate)', `${side}: step ${step.step}`, undefined, undefined);
        steps.add(step.step);
      }
    }
  };
  repeats(a, 'before');
  repeats(b, 'after');

  const names = [...new Set([...a.scenarios.map((s) => s.name), ...b.scenarios.map((s) => s.name)])];
  let count = 0;
  for (const name of names) {
    const left = a.scenarios.find((s) => s.name === name);
    const right = b.scenarios.find((s) => s.name === name);
    if (!left && right && ALLOWED_NEW_SCENARIOS.includes(name)) {
      added.push({ name, steps: right.steps.length });
      continue;
    }
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
      const found = [];
      diffLeaves(before, after, '', found);
      for (const [where, was, now] of found) emit(name, label, where, was, now);
    }
  }
  return { diffs, count, added };
}

async function compare(pathA, pathB) {
  const [a, b] = await Promise.all([pathA, pathB].map(readWalk));
  const { diffs, count, added } = compareResult(a, b);
  if (diffs.length > 0) {
    for (const line of diffs) console.log(line);
    process.exit(1);
  }
  console.log(`MATCH ${count} snapshots${added.map((one) => `; NEW ${one.name} ${one.steps}`).join('')}`);
}

// ---------------------------------------------------------------------------
// The seed rule for a new scenario (D-19; review L297@d52488be, L350@d52488be). A new
// scenario is not compared with the baseline, so it must prove the records it did not make
// are untouched: seedKeptProblems(seedDump, afterDump, recipeId) -> string[]. Every record in
// the seed dump must be in the after dump with every leaf equal, and every record in the
// after dump that is not in the seed dump must be the scenario's own: the recipe with
// recipeId, a version whose recipeId is it, a batch whose versionId is one of those
// versions' ids, a draft whose versionId is one of those ids or whose payload.recipeId is it.
// ---------------------------------------------------------------------------
const STORE_KEYS = { recipes: 'id', versions: 'id', batches: 'id', drafts: 'versionId' };

function seedKeptProblems(seedDump, afterDump, recipeId) {
  const problems = [];
  const records = (dump, store) => {
    const byKey = new Map();
    for (const record of dump?.[store] ?? []) byKey.set(String(record[STORE_KEYS[store]]), record);
    return byKey;
  };
  const afterVersions = records(afterDump, 'versions');
  const seededVersions = records(seedDump, 'versions');
  const ownVersionIds = new Set(
    [...afterVersions.entries()].filter(([key, version]) => !seededVersions.has(key) && version.recipeId === recipeId).map(([key]) => key),
  );
  const isOwn = (store, record) => {
    if (store === 'recipes') return record.id === recipeId;
    if (store === 'versions') return record.recipeId === recipeId;
    if (store === 'batches') return ownVersionIds.has(String(record.versionId));
    return ownVersionIds.has(String(record.versionId)) || record.payload?.recipeId === recipeId;
  };
  for (const store of Object.keys(STORE_KEYS)) {
    const seeded = records(seedDump, store);
    const after = records(afterDump, store);
    for (const [key, was] of seeded) {
      const now = after.get(key);
      if (!now) {
        problems.push(`seeded ${store} ${key} missing`);
        continue;
      }
      const found = [];
      diffLeaves(was, now, '', found);
      if (found.length > 0) problems.push(`seeded ${store} ${key} changed`);
    }
    for (const [key, now] of after) {
      if (!seeded.has(key) && !isOwn(store, now)) problems.push(`stranger ${store} ${key}`);
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// selftest: doctored copies of the before-file, each of which the compare must
// refuse with a DIFF that names the doctored path; the real pair (the file against a
// clone of itself), which it must pass; and one allowed new scenario, which it must admit.
// Exits 1 on any FAIL.
// ---------------------------------------------------------------------------
function firstDumpedStep(file) {
  for (const scenario of file.scenarios) {
    for (const step of scenario.steps) if (step.stores) return { scenario: scenario.name, step };
  }
  return undefined;
}

// Each doctoring changes `file` in place and returns { scenario, step, where, label? } for the
// path it changed, or undefined when it found nothing to change. `label` is what the PASS line
// prints in place of `where` when the path is a whole scenario.
const DOCTORINGS = [
  [
    'store leaf',
    'a recipe name in a store dump changed',
    (file) => {
      const found = firstDumpedStep(file);
      if (!found || !found.step.stores.recipes?.[0]) return undefined;
      found.step.stores.recipes[0].name = 'Doctored recipe name';
      return { scenario: found.scenario, step: found.step.step, where: 'stores.recipes[0].name' };
    },
  ],
  [
    'snapshot leaf',
    "the first step's pageStatus changed",
    (file) => {
      const scenario = file.scenarios[0];
      const step = scenario?.steps[0];
      if (!step) return undefined;
      step.snapshot.pageStatus = 'Doctored status.';
      return { scenario: scenario.name, step: step.step, where: 'snapshot.pageStatus' };
    },
  ],
  [
    'added key',
    'a store key present after and absent before',
    (file) => {
      const found = firstDumpedStep(file);
      if (!found || !found.step.stores.versions?.[0]) return undefined;
      found.step.stores.versions[0].doctoredField = 'extra';
      return { scenario: found.scenario, step: found.step.step, where: 'stores.versions[0].doctoredField' };
    },
  ],
  [
    'repeated step',
    'the first step appended again under the same name with a changed leaf',
    (file) => {
      const scenario = file.scenarios[0];
      const step = scenario?.steps[0];
      if (!step) return undefined;
      const again = structuredClone(step);
      again.snapshot.pageStatus = 'Doctored status.';
      scenario.steps.push(again);
      return { scenario: scenario.name, step: '(duplicate)', where: `after: step ${step.step}` };
    },
  ],
  [
    'method hash',
    "the first step's methodHash changed",
    (file) => {
      const scenario = file.scenarios[0];
      const step = scenario?.steps[0];
      if (!step) return undefined;
      step.snapshot.methodHash = 'doctored';
      return { scenario: scenario.name, step: step.step, where: 'snapshot.methodHash' };
    },
  ],
  [
    'text hash',
    "the first step's textHash changed",
    (file) => {
      const scenario = file.scenarios[0];
      const step = scenario?.steps[0];
      if (!step) return undefined;
      step.snapshot.textHash = 'doctored';
      return { scenario: scenario.name, step: step.step, where: 'snapshot.textHash' };
    },
  ],
  [
    'scenario missing after',
    'the last scenario removed from the after copy',
    (file) => {
      const scenario = file.scenarios.pop();
      if (!scenario) return undefined;
      return { scenario: scenario.name, step: '(scenario)', where: '', label: 'scenario missing after' };
    },
  ],
  [
    'unnamed new scenario',
    "a copy of the first scenario appended under the name 'not-allowed'",
    (file) => {
      const scenario = file.scenarios[0];
      if (!scenario) return undefined;
      const copy = structuredClone(scenario);
      copy.name = 'not-allowed';
      file.scenarios.push(copy);
      return { scenario: 'not-allowed', step: '(scenario)', where: '', label: 'new scenario not in the allow-list' };
    },
  ],
];

async function selftest(pathBefore) {
  const before = await readWalk(pathBefore);
  let failed = 0;
  const real = compareResult(before, structuredClone(before));
  if (real.diffs.length === 0 && real.added.length === 0 && real.count > 0) console.log('PASS selftest real: the file against a clone of itself passes');
  else {
    console.log(`FAIL selftest real: the real pair is refused (${real.diffs.length} DIFF, ${real.count} compared, ${real.added.length} NEW)`);
    failed += 1;
  }
  for (const [name, what, doctor] of DOCTORINGS) {
    const doctored = structuredClone(before);
    const changed = doctor(doctored);
    if (!changed) {
      console.log(`FAIL selftest ${name}: found nothing to change (${what})`);
      failed += 1;
      continue;
    }
    const { diffs } = compareResult(before, doctored);
    const named = `${changed.scenario} / ${changed.step} / ${changed.where}`;
    if (diffs.some((line) => line.startsWith(`DIFF ${named}:`))) {
      const at = changed.label ?? (changed.step === '(duplicate)' ? `${changed.step} ${changed.where}` : changed.where);
      console.log(`PASS selftest ${name}: refused at ${at} (${what})`);
    } else {
      console.log(`FAIL selftest ${name}: not refused at ${named} (${what})`);
      failed += 1;
    }
  }
  // The one allowance: a whole new scenario whose name is in ALLOWED_NEW_SCENARIOS.
  const allowed = structuredClone(before);
  const copy = structuredClone(allowed.scenarios[0]);
  copy.name = 'create-recipe';
  allowed.scenarios.push(copy);
  const result = compareResult(before, allowed);
  if (result.diffs.length === 0 && result.added.length === 1 && result.added[0].name === 'create-recipe') {
    console.log('PASS selftest allowed: NEW create-recipe');
  } else {
    console.log(`FAIL selftest allowed: ${result.diffs.length} DIFF, added ${JSON.stringify(result.added)}`);
    failed += 1;
  }
  if (failed > 0) process.exit(1);
}

// ---------------------------------------------------------------------------
// seedtest: the seed rule a new scenario is held to (seedKeptProblems), against the first
// stores dump in the before-file taken as the seed. No browser. Exits 1 on any FAIL.
// ---------------------------------------------------------------------------
async function seedtest(pathBefore) {
  const before = await readWalk(pathBefore);
  const found = firstDumpedStep(before);
  if (!found) {
    console.log('FAIL seedtest: the file holds no stores dump');
    process.exit(1);
  }
  const seed = found.step.stores;
  let failed = 0;
  const check = (name, problems, expected) => {
    const ok = expected === null ? problems.length === 0 : problems.length === 1 && problems[0].includes(expected);
    if (ok) console.log(`PASS seedtest ${name}`);
    else {
      console.log(`FAIL seedtest ${name}: ${JSON.stringify(problems)}`);
      failed += 1;
    }
  };

  check('same', seedKeptProblems(seed, structuredClone(seed), 'none'), null);

  const changed = structuredClone(seed);
  changed.recipes[0].name = 'Doctored recipe name';
  check('changed', seedKeptProblems(seed, changed, 'none'), ' changed');

  const missing = structuredClone(seed);
  missing.versions.splice(0, 1);
  check('missing', seedKeptProblems(seed, missing, 'none'), ' missing');

  const stranger = structuredClone(seed);
  stranger.recipes.push({ id: 'stranger', name: 'Stranger' });
  check('stranger', seedKeptProblems(seed, stranger, 'own'), 'stranger recipes stranger');

  const own = structuredClone(seed);
  own.recipes.push({ id: 'own', name: 'Own' });
  own.versions.push({ id: 'own-v1', recipeId: 'own' });
  own.batches.push({ id: 'own-b1', versionId: 'own-v1' });
  own.drafts.push({ versionId: 'own-v1', payload: { recipeId: 'own' } });
  check('own', seedKeptProblems(seed, own, 'own'), null);

  if (failed > 0) process.exit(1);
}

// ---------------------------------------------------------------------------
// normtest: the method hash against the built page, in WebKit (reads PROBE_DIST). It proves
// the two normalisations absorb exactly the printed method treatment and nothing else.
// Plan 11-04 runs it on its own build: the same literal chips prove its label-first markup
// canonicalises as BASE's struck-first markup does.
// ---------------------------------------------------------------------------
async function normtest() {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  let failed = 0;
  const verdict = (ok, name, detail) => {
    if (ok) console.log(`PASS normtest ${name}`);
    else {
      console.log(`FAIL normtest ${name}: ${detail}`);
      failed += 1;
    }
  };
  try {
    const context = await newScenarioContext(browser);
    const open = async (route, waitFor) => {
      const page = await context.newPage();
      await page.goto(`${appUrl}${route}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.shell');
      await page.waitForSelector('.notebook, .nb');
      if (waitFor) await page.waitForSelector(waitFor);
      return page;
    };
    const hashes = (snap) => `text ${snap.textHash.slice(0, 12)} method ${snap.methodHash.slice(0, 12)}`;

    // Olive Oil v1's reading page: A, then B with uppercase target labels and a why label.
    const page = await open('/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', '.method-region');
    const A = await snapshot(page);
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '.target-chip__label { text-transform: uppercase; }';
      document.head.append(style);
      for (const purpose of document.querySelectorAll('p.method-step__purpose')) {
        const label = document.createElement('span');
        label.className = 'method-step__purpose-label';
        label.textContent = 'why';
        purpose.prepend(label, document.createTextNode(' — '));
      }
    });
    const B = await snapshot(page);
    verdict(A.textHash === B.textHash && A.methodHash === B.methodHash, 'unchanged', `A ${hashes(A)} B ${hashes(B)}`);

    // The first target chip rebuilt as the two markups that draw a changed target.
    // base: Method.jsx:400-405 (the struck `${label} ${from}` first). new: plan 11-04 (the label,
    // then the struck `from` alone, then the value).
    const rebuild = (order, from) =>
      page.evaluate(
        ([order, from]) => {
          const chip = document.querySelector('.method-region .target-chip');
          const label = chip.querySelector('.target-chip__label').textContent;
          const value = chip.querySelector('.target-chip__value').textContent;
          const span = (className, text) => {
            const el = document.createElement('span');
            el.className = className;
            el.textContent = text;
            return el;
          };
          const struck = span('struck-value', order === 'base' ? `${label} ${from}` : from);
          chip.replaceChildren(
            ...(order === 'base'
              ? [struck, span('target-chip__label', label), span('target-chip__value', value)]
              : [span('target-chip__label', label), struck, span('target-chip__value', value)]),
          );
        },
        [order, from],
      );
    await rebuild('base', '80 °C');
    const C = await snapshot(page);
    await rebuild('new', '80 °C');
    const D = await snapshot(page);
    verdict(C.methodHash === D.methodHash && D.methodHash !== B.methodHash, 'struck-form', `B ${hashes(B)} C ${hashes(C)} D ${hashes(D)}`);

    await rebuild('new', '81 °C');
    const E = await snapshot(page);
    verdict(E.methodHash !== D.methodHash, 'struck-value', `D ${hashes(D)} E ${hashes(E)}`);

    await rebuild('new', '80 °C');
    await page.evaluate(() => {
      const chip = document.querySelector('.method-region .target-chip');
      const struck = chip.querySelector('.struck-value');
      const value = chip.querySelector('.target-chip__value');
      [struck.textContent, value.textContent] = [value.textContent, struck.textContent];
    });
    const S = await snapshot(page);
    verdict(S.methodHash !== D.methodHash, 'struck-swap', `D ${hashes(D)} S ${hashes(S)}`);

    // The real changed target: Mexican Chocolate v2 (hold 45 min in v1, 60 min in v2).
    const mexican = await open('/notebook/mexican-chocolate/mexican-chocolate-v2', '.method-region');
    await clickUntil(mexican, () => mexican.getByRole('button', { name: 'Show changes' }).first(), '.method-region .target-chip .struck-value', 'Show changes');
    const R = await snapshot(mexican);
    const chips = await mexican.evaluate((sources) => {
      const canon = new Function(`return ${sources.canon}`)();
      const textOf = (el) => (el ? el.textContent.trim() : null);
      return [...document.querySelectorAll('.method-region .target-chip')].map((chip) =>
        canon(
          textOf(chip.querySelector('.target-chip__label')),
          textOf(chip.querySelector('.struck-value')),
          textOf(chip.querySelector('.target-chip__value')),
        ),
      );
    }, IN_PAGE);
    const wanted = [JSON.stringify(['temp', null, '75 °C']), JSON.stringify(['hold', '45 min', '60 min'])];
    verdict(JSON.stringify(chips) === JSON.stringify(wanted), 'struck-real', JSON.stringify(chips));
    const touched = await mexican.evaluate(() => {
      const struck = document.querySelector('.method-region .target-chip .struck-value');
      if (!struck || !struck.textContent.includes('45 min')) return false;
      struck.textContent = struck.textContent.replace('45 min', '46 min');
      return true;
    });
    const R2 = await snapshot(mexican);
    verdict(touched && R2.methodHash !== R.methodHash, 'struck-real-value', `touched ${touched} R ${hashes(R)} R2 ${hashes(R2)}`);

    // Back on Olive Oil v1 (as S left it): a changed lead-in moves methodHash alone; a changed
    // headnote moves textHash.
    await page.evaluate(() => {
      document.querySelector('.method-region .method-step__lead b').textContent = 'Changed';
    });
    const F = await snapshot(page);
    verdict(F.methodHash !== S.methodHash && F.textHash === S.textHash, 'sensitive', `S ${hashes(S)} F ${hashes(F)}`);
    await page.evaluate(() => {
      document.querySelector('.headnote h1').textContent = 'Changed';
    });
    const G = await snapshot(page);
    verdict(G.textHash !== F.textHash, 'outside', `F ${hashes(F)} G ${hashes(G)}`);

    // The Notebook place holds `.nb` and no `.notebook`: the snapshot reads it.
    const place = await open('/notebook');
    const H = await snapshot(place);
    verdict(H.textHash !== createHash('sha256').update('').digest('hex'), 'notebook-place', `textHash ${H.textHash}`);
    await context.close();
  } finally {
    await browser.close();
    await close();
  }
  if (failed > 0) process.exit(1);
}

// ---------------------------------------------------------------------------
// ordercheck: two recordings made with --keep-text, one plain and one ordered, may differ in
// the order of each page's text lines, fields, buttons and marked fields, and in nothing else
// (D-19; Mark, 2026-10-26, decide-p11-row-order-across-steps). orderProblems(plain, ordered)
// -> { problems, reordered, compared }: problems are "<scenario> / <step>: <what>" lines;
// reordered counts the snapshots whose text, fields, buttons or invalid differ in order alone.
// Every stores leaf and every snapshot leaf but textHash, text, fields, buttons and invalid is
// compared by diffLeaves, methodHash and methodText included: the walked pens open no step, so
// the method region does not move.
// ---------------------------------------------------------------------------
const ORDER_FREE = ['textHash', 'text', 'fields', 'buttons', 'invalid'];

function orderProblems(plain, ordered) {
  const problems = [];
  let reordered = 0;
  let compared = 0;
  for (const key of ['walk', 'engine', 'width']) {
    if (plain[key] !== ordered[key]) problems.push(`(file) / ${key}: before=${JSON.stringify(plain[key])} after=${JSON.stringify(ordered[key])}`);
  }
  const names = (file) => file.scenarios.map((scenario) => scenario.name);
  if (JSON.stringify(names(plain)) !== JSON.stringify(names(ordered))) {
    problems.push(`(file) / scenarios: the scenario names differ (${names(plain).join(', ')} / ${names(ordered).join(', ')})`);
    return { problems, reordered, compared };
  }
  // A list as a multiset: its items' JSON, sorted.
  const asSet = (list) => list.map((item) => JSON.stringify(item)).sort();
  const sameSet = (a, b) => JSON.stringify(asSet(a)) === JSON.stringify(asSet(b));
  for (let s = 0; s < plain.scenarios.length; s += 1) {
    const left = plain.scenarios[s];
    const right = ordered.scenarios[s];
    const labels = (scenario) => scenario.steps.map((step) => step.step);
    if (JSON.stringify(labels(left)) !== JSON.stringify(labels(right))) {
      problems.push(`${left.name} / (steps): the step labels differ (${labels(left).join(', ')} / ${labels(right).join(', ')})`);
      continue;
    }
    for (let i = 0; i < left.steps.length; i += 1) {
      const a = left.steps[i];
      const b = right.steps[i];
      const where = `${left.name} / ${a.step}`;
      compared += 1;
      if (typeof a.snapshot.text !== 'string' || typeof b.snapshot.text !== 'string') {
        problems.push(`${where}: recorded without --keep-text`);
        continue;
      }
      const stores = [];
      diffLeaves(a.stores, b.stores, 'stores', stores);
      for (const [path, was, now] of stores) problems.push(`${where}: ${path} changed, before=${JSON.stringify(was)} after=${JSON.stringify(now)}`);
      const rest = (snap) => Object.fromEntries(Object.entries(snap).filter(([key]) => !ORDER_FREE.includes(key)));
      const others = [];
      diffLeaves(rest(a.snapshot), rest(b.snapshot), '', others);
      for (const [path, was, now] of others) problems.push(`${where}: ${path} changed, before=${JSON.stringify(was)} after=${JSON.stringify(now)}`);
      let moved = false;
      if (!sameSet(a.snapshot.text.split('\n'), b.snapshot.text.split('\n'))) problems.push(`${where}: the text lines are not the same lines`);
      else if (a.snapshot.text !== b.snapshot.text) moved = true;
      for (const key of ['fields', 'buttons', 'invalid']) {
        if (!sameSet(a.snapshot[key], b.snapshot[key])) problems.push(`${where}: ${key} are not the same ${key}`);
        else if (JSON.stringify(a.snapshot[key]) !== JSON.stringify(b.snapshot[key])) moved = true;
      }
      if (moved) reordered += 1;
    }
  }
  return { problems, reordered, compared };
}

async function ordercheck(pathPlain, pathOrdered) {
  const [plain, ordered] = await Promise.all([pathPlain, pathOrdered].map(readWalk));
  const { problems, reordered, compared } = orderProblems(plain, ordered);
  if (problems.length > 0) {
    for (const line of problems) console.log(`FAIL ordercheck ${line}`);
    process.exit(1);
  }
  if (reordered === 0) {
    console.log('FAIL ordercheck: no snapshot reordered');
    process.exit(1);
  }
  console.log(`PASS ordercheck ${reordered} of ${compared} snapshots reordered; stores, method and every other leaf equal`);
}

// ordertest: orderProblems against in-memory copies of a plain recording made with
// --keep-text. Exits 1 on any FAIL.
async function ordertest(pathPlain) {
  const plain = await readWalk(pathPlain);
  let failed = 0;
  const verdict = (name, ok, detail) => {
    if (ok) console.log(`PASS ordertest ${name}`);
    else {
      console.log(`FAIL ordertest ${name}: ${detail}`);
      failed += 1;
    }
  };
  const steps = plain.scenarios.flatMap((scenario) => scenario.steps.map((entry) => ({ scenario: scenario.name, entry })));
  const hasText = steps.length > 0 && steps.every(({ entry }) => typeof entry.snapshot.text === 'string');
  if (!hasText) {
    console.log('FAIL ordertest: the file was recorded without --keep-text');
    process.exit(1);
  }
  // The same step in a clone: [scenarioName, stepLabel] -> the clone's entry.
  const inClone = (clone, found) => clone.scenarios.find((s) => s.name === found.scenario).steps.find((e) => e.step === found.entry.step);
  const refusedAt = (result, found) => result.problems.some((line) => line.startsWith(`${found.scenario} / ${found.entry.step}:`));

  const same = orderProblems(plain, structuredClone(plain));
  verdict('same', same.problems.length === 0 && same.reordered === 0, `${same.problems.length} problems, reordered ${same.reordered}`);

  const withLines = steps.find(({ entry }) => new Set(entry.snapshot.text.split('\n')).size >= 2);
  if (!withLines) {
    for (const name of ['reorder', 'changed-line']) verdict(name, false, 'no step has two different text lines');
  } else {
    const swapped = structuredClone(plain);
    const lines = inClone(swapped, withLines).snapshot.text.split('\n');
    const first = 0;
    const other = lines.findIndex((line) => line !== lines[first]);
    [lines[first], lines[other]] = [lines[other], lines[first]];
    inClone(swapped, withLines).snapshot.text = lines.join('\n');
    const result = orderProblems(plain, swapped);
    verdict('reorder', result.problems.length === 0 && result.reordered === 1, `${result.problems.length} problems, reordered ${result.reordered}`);

    const changed = structuredClone(plain);
    const changedEntry = inClone(changed, withLines);
    changedEntry.snapshot.text = `${changedEntry.snapshot.text}\nA line the walk never drew`;
    const refused = orderProblems(plain, changed);
    verdict('changed-line', refusedAt(refused, withLines), `not refused at ${withLines.scenario} / ${withLines.entry.step}`);
  }

  const withStores = steps.find(({ entry }) => entry.stores?.recipes?.[0]);
  if (!withStores) verdict('store', false, 'no step holds a stores dump with a recipe');
  else {
    const doctored = structuredClone(plain);
    inClone(doctored, withStores).stores.recipes[0].name = 'Doctored recipe name';
    verdict('store', refusedAt(orderProblems(plain, doctored), withStores), `not refused at ${withStores.scenario} / ${withStores.entry.step}`);
  }

  const firstStep = steps[0];
  const doctoredMethod = structuredClone(plain);
  inClone(doctoredMethod, firstStep).snapshot.methodHash = 'doctored';
  verdict('method', refusedAt(orderProblems(plain, doctoredMethod), firstStep), `not refused at ${firstStep.scenario} / ${firstStep.entry.step}`);

  const withField = steps.find(({ entry }) => entry.snapshot.fields.length > 0);
  if (!withField) verdict('field', false, 'no snapshot holds a field');
  else {
    const doctored = structuredClone(plain);
    const field = inClone(doctored, withField).snapshot.fields[0];
    field[1] = `${field[1]}x`;
    verdict('field', refusedAt(orderProblems(plain, doctored), withField), `not refused at ${withField.scenario} / ${withField.entry.step}`);
  }
  if (failed > 0) process.exit(1);
}

const [, , mode, first, second] = process.argv;
if (mode === 'record' && first && (second === undefined || second === '--keep-text')) {
  await record(first, second === '--keep-text');
} else if (mode === 'ordercheck' && first && second) {
  await ordercheck(first, second);
} else if (mode === 'ordertest' && first) {
  await ordertest(first);
} else if (mode === 'compare' && first && second) {
  await compare(first, second);
} else if (mode === 'selftest' && first) {
  await selftest(first);
} else if (mode === 'seedtest' && first) {
  await seedtest(first);
} else if (mode === 'normtest') {
  await normtest();
} else {
  console.error(
    'Usage: node 11-walk.mjs record <out.json> [--keep-text] | compare <a.json> <b.json> | selftest <before.json> | seedtest <before.json> | normtest | ordercheck <plain.json> <ordered.json> | ordertest <plain.json> (PROBE_DIST=<dist>)',
  );
  process.exit(1);
}
