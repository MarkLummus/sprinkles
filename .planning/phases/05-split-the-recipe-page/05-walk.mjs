// 05-01: the before/after WebKit walk for the recipe page split (D-11, D-13).
//
// Usage (from the repo root, after building to a scratch directory):
//   npm --prefix app run build -- --outDir "$TMPDIR/sprinkles-05-dist" --emptyOutDir
//   PROBE_DIST="$TMPDIR/sprinkles-05-dist" node .planning/phases/05-split-the-recipe-page/05-walk.mjs record <out.json>
//   node .planning/phases/05-split-the-recipe-page/05-walk.mjs compare <a.json> <b.json>
//
// Why it exists: the RecipePage tests render static markup and never run
// effects, so the reload-with-draft path, the focus landings and the saved
// records are not covered by the suite (D-11). This walk drives the BUILT app
// in WebKit through the version pen, the record pen, a correction and a
// tasting. After every step it records what the maker sees (status texts, the
// marked fields, the focused element, the open pens with their values and
// buttons, a hash of the page text); after a scenario it records every record
// in the versions, batches, recipes and drafts stores. Plan 06 records the
// same walk after the last code change and compares the two files.
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
// Isolation: the app is served on an ephemeral 127.0.0.1 port through the 03.5
// harness (always with appRoot, never its default: its REPO_ROOT resolves to
// .planning from the archived location). Every request to another host is
// aborted in every context. Each scenario gets a fresh Playwright context (no
// browser profile), so IndexedDB starts from the reseed. Nothing here contacts
// :4173 or :8077. Everything typed into the app is English.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../../milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// .planning/phases/05-split-the-recipe-page/ -> phases/ -> .planning/ -> repo root.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');

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
    const labelOf = (el) =>
      el.getAttribute('aria-label') ||
      el.id ||
      el.getAttribute('name') ||
      `${el.tagName.toLowerCase()}:${(el.textContent ?? '').trim().slice(0, 40)}`;
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
      invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map(labelOf),
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
// compare: every leaf that differs, by scenario, step and JSON path.
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

async function compare(pathA, pathB) {
  const [a, b] = await Promise.all([pathA, pathB].map(async (p) => JSON.parse(await readFile(p, 'utf8'))));
  const lines = [];
  const show = (value) => (value === undefined ? 'absent' : JSON.stringify(value));
  const emit = (scenario, step, where, before, after) =>
    lines.push(`DIFF ${scenario} / ${step} / ${where}: before=${show(before)} after=${show(after)}`);

  for (const key of ['walk', 'engine', 'width']) {
    if (a[key] !== b[key]) emit('(file)', key, key, a[key], b[key]);
  }
  const names = [...new Set([...a.scenarios.map((s) => s.name), ...b.scenarios.map((s) => s.name)])];
  let count = 0;
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
      const found = [];
      diffLeaves(before, after, '', found);
      for (const [where, was, now] of found) emit(name, label, where, was, now);
    }
  }
  if (lines.length > 0) {
    for (const line of lines) console.log(line);
    process.exit(1);
  }
  console.log(`MATCH ${count} snapshots`);
}

const [, , mode, first, second] = process.argv;
if (mode === 'record' && first) {
  await record(first);
} else if (mode === 'compare' && first && second) {
  await compare(first, second);
} else {
  console.error('Usage: node 05-walk.mjs record <out.json> | compare <a.json> <b.json>');
  process.exit(1);
}
