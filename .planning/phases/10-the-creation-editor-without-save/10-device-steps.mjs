// 10-10: the steps of Mark's List row check-creation-editor-ipad, walked in Playwright WebKit at
// 1366 with a coarse pointer (hasTouch) on the final build, so each is proven reachable on its first
// activation before Mark is handed them (the verify-device-check-steps rule).
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-10"
//   npm --prefix app run build -- --outDir "$S/dist-10" --emptyOutDir
//   PROBE_DIST="$S/dist-10" node .planning/phases/10-the-creation-editor-without-save/10-device-steps.mjs
//
// One browser context holds the whole walk, so IndexedDB lives across the closed tab. Each step waits
// for its ready state (the target control attached, visible and enabled, document.fonts.ready, no
// load pending), activates it ONCE, then waits up to 5 s for the step's expected outcome. An outcome
// that does not come after that one activation prints "FAIL <step>: first activation missed" and
// ends the walk: no retry helper exists here, because retrying until the outcome appears would prove
// only that the control is eventually reachable, and a lost first tap is the defect this walk finds.
// Typing is `fill` after the ready state; it is not an activation.
//
// The recipes, versions and batches stores are dumped first and last and must be deep-equal, and the
// drafts store must be empty at the end. The build is read from PROBE_DIST (default app/dist) and
// never written. playwright-core is loaded only through PLAYWRIGHT_CORE (default: the npx cache path
// below); when that file is missing the script prints a FAIL line and exits 1. The app is served on
// an ephemeral 127.0.0.1 port through 08-walk-server.mjs and every request to another host is
// aborted. Everything typed into the app is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const DIST = path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'));

const NAME = 'Vanilla';
const DESCRIPTION = 'Plain and cold.';
const NOTE = 'Chill the mix overnight before churning.';
const MILK = 'Whole milk, 3.5% fat';
const SUGAR = 'Sucrose';
const KEPT_NOTICE = 'Draft kept. Cancel discards it.';
const DISCARDED_NOTICE = 'Draft discarded.';
const IMPORT_NOTICE = 'Cancel the new recipe draft before importing.';
// Philadelphia's bands in the board's order (PAC, POD, Fat, MSNF, Sugar, Solids), low then high.
const PHILADELPHIA_BANDS = ['', '', '14', '18', '10', '18', '8', '12', '', '', '36', '42'];

let passes = 0;
let failures = 0;
const pass = (step, detail = '') => {
  passes += 1;
  console.log(`PASS ${step}${detail ? ` (${detail})` : ''}`);
};
const fail = (step, why) => {
  failures += 1;
  console.log(`FAIL ${step}: ${why}`);
};

// Poll an async predicate for up to 5 s.
async function until(page, predicate, ms = 5000) {
  const stop = Date.now() + ms;
  for (;;) {
    if (await predicate()) return true;
    if (Date.now() > stop) return false;
    await page.waitForTimeout(50);
  }
}

// The step's ready state: attached (one element, strict), visible, enabled, fonts loaded, no load pending.
async function readyFor(page, locator) {
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
  if (!(await until(page, () => locator.isEnabled()))) throw new Error('the control never became enabled');
}

// One activation (a touch tap), then the outcome. A tap that does not bring the outcome is a miss.
async function press(page, locator, outcome) {
  await readyFor(page, locator);
  await locator.tap({ timeout: 5000 });
  if (!(await until(page, outcome))) throw new Error('first activation missed');
}

// Type into a field once it is ready, then confirm the field holds what was typed.
async function type(page, locator, text) {
  await readyFor(page, locator);
  await locator.fill(text);
  if (!(await until(page, async () => (await locator.inputValue()) === text))) throw new Error(`the field did not keep "${text}"`);
}

// One read transaction over the four stores, each list sorted by its key path (10-walk.mjs's method).
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

const notice = (page) => page.evaluate(() => document.querySelector('.page-status')?.textContent.trim() ?? '');
const pathOf = (page) => new URL(page.url()).pathname;

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
let exitCode = 1;
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  // Nothing leaves the machine: abort every request to another host.
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  let page = await context.newPage();
  let chooserOpened = false;
  page.on('filechooser', () => {
    chooserOpened = true;
  });

  // The picker's row is itself the button; its name is matched whole.
  const shelf = (label) =>
    page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) });
  const gramsField = (name) => page.locator(`input[aria-label="${name}, grams"]`);
  const scaleField = (card, label) => page.locator(`.mk-card[aria-label="${card}"] input[aria-label="${label}"]`);
  const NOTE_FIELD = 'textarea[aria-label="beforeYouStart note 1"]';

  // Every step is [name, body]. A throw ends the walk with that step's FAIL line.
  let before;
  const steps = [
    [
      'the Notebook opens and the recipes, versions and batches are read first',
      async () => {
        await page.goto(`${servers.appUrl}/notebook`, { waitUntil: 'networkidle' });
        await page.waitForSelector('.nb__count');
        await page.evaluate(() => document.fonts.ready);
        before = await dumpStores(page);
        if (before.drafts.length !== 0) throw new Error(`the drafts store holds ${before.drafts.length} before the walk`);
        return `${before.recipes.length} recipes, ${before.versions.length} versions, ${before.batches.length} batches`;
      },
    ],
    [
      'New recipe opens the entry',
      async () => {
        await press(page, page.locator('.nb__head .notebook-action'), () => page.locator('.nb__new input').isVisible());
      },
    ],
    [
      `a name, Start, and /notebook/new opens`,
      async () => {
        await type(page, page.locator('.nb__new input'), NAME);
        await press(page, page.locator('.nb__new-actions button', { hasText: /^Start$/ }), async () => pathOf(page) === '/notebook/new');
        await page.waitForSelector('.notebook.mk-page');
      },
    ],
    [
      'a description',
      async () => {
        await type(page, page.locator('textarea[aria-label="Recipe description"]'), DESCRIPTION);
      },
    ],
    [
      'Add note and a note',
      async () => {
        await press(page, page.locator('.before-region .mk-add'), () => page.locator(NOTE_FIELD).isVisible());
        await type(page, page.locator(NOTE_FIELD), NOTE);
      },
    ],
    [
      `Add ingredient, ${MILK}, 600 g`,
      async () => {
        await press(page, page.locator('.ingredient-table-region .mk-add'), () => page.locator('.pick').isVisible());
        await press(page, shelf(MILK), () => gramsField(MILK).isVisible());
        await type(page, gramsField(MILK), '600');
      },
    ],
    [
      `Add ingredient, ${SUGAR}, 150 g`,
      async () => {
        await press(page, page.locator('.ingredient-table-region .mk-add'), () => page.locator('.pick').isVisible());
        await press(page, shelf(SUGAR), () => gramsField(SUGAR).isVisible());
        await type(page, gramsField(SUGAR), '150');
      },
    ],
    [
      'the Style menu, Philadelphia: -14 and the four bands fill in',
      async () => {
        const menu = page.locator('select.mk-menu');
        await readyFor(page, menu);
        await menu.selectOption({ label: 'Philadelphia' });
        const read = () =>
          page.evaluate(() => ({
            temp: document.querySelector('input[aria-label="Serving temperature, degrees Celsius"]')?.value,
            bands: [...document.querySelectorAll('.mk-band input')].map((input) => input.value),
          }));
        const ok = await until(page, async () => {
          const got = await read();
          return got.temp === '-14' && JSON.stringify(got.bands) === JSON.stringify(PHILADELPHIA_BANDS);
        });
        if (!ok) throw new Error(`the Style menu gave ${JSON.stringify(await read())}`);
      },
    ],
    [
      'Add scale: Creaminess, thin, rich, Right in the middle',
      async () => {
        await press(page, page.locator('.mk-region[aria-label="Scales"] .mk-add'), () => page.locator('.mk-card[aria-label="Scale 1"]').isVisible());
        await type(page, scaleField('Scale 1', 'Name'), 'Creaminess');
        await type(page, scaleField('Scale 1', 'Low end'), 'thin');
        await type(page, scaleField('Scale 1', 'High end'), 'rich');
        const kind = page.locator('.mk-card[aria-label="Scale 1"] .segmented__option', { hasText: 'Right in the middle' });
        await press(page, kind, () => kind.locator('input').isChecked());
      },
    ],
    [
      'Add problem: Bitter',
      async () => {
        await press(page, page.locator('.mk-region[aria-label="Problems"] .mk-add'), () => page.locator('.mk-card[aria-label="Problem 1"]').isVisible());
        await type(page, scaleField('Problem 1', 'Name'), 'Bitter');
      },
    ],
    [
      'Import is refused while the creation is kept: no file chooser, a notice says why',
      async () => {
        chooserOpened = false;
        await press(page, page.locator('.shell__tools button', { hasText: 'Import' }), async () => (await notice(page)) === IMPORT_NOTICE);
        await page.waitForTimeout(300);
        if (chooserOpened) throw new Error('a file chooser opened');
      },
    ],
    [
      'past the 250 ms debounce the creation is written, including Bitter, and the tab closes',
      async () => {
        // The draft's own debounce is 250 ms; the Import notice step above already spent time, and this
        // adds a wait past it so the last typed word is in the store before the tab goes.
        await page.waitForTimeout(300);
        const kept = await dumpStores(page);
        const write = kept.drafts[0]?.payload;
        if (kept.drafts.length !== 1 || JSON.stringify(write?.problems) !== JSON.stringify(['Bitter'])) {
          throw new Error(`the drafts store reads ${JSON.stringify(kept.drafts.map((d) => d.payload?.problems))}`);
        }
        await page.close();
        page = await context.newPage();
        chooserOpened = false;
        page.on('filechooser', () => {
          chooserOpened = true;
        });
      },
    ],
    [
      '/notebook opens again: the draft row reads Vanilla with Resume and no New recipe',
      async () => {
        await page.goto(`${servers.appUrl}/notebook`, { waitUntil: 'networkidle' });
        await page.waitForSelector('.nb__count');
        await page.evaluate(() => document.fonts.ready);
        const row = page.locator('.nb__draft');
        await row.waitFor({ state: 'visible', timeout: 5000 });
        const name = (await row.locator('.nb__name').textContent()).trim();
        const buttons = await row.locator('button').allTextContents();
        const entry = await page.locator('.nb__head .notebook-action').count();
        if (name !== NAME || buttons.map((t) => t.trim()).join() !== 'Resume' || entry !== 0) {
          throw new Error(`the draft row reads "${name}" with [${buttons}] and ${entry} New recipe buttons`);
        }
      },
    ],
    [
      'Resume: every field is as left, and the notice reads "Draft kept. Cancel discards it."',
      async () => {
        await press(page, page.locator('.nb__draft button', { hasText: 'Resume' }), async () => pathOf(page) === '/notebook/new');
        await page.waitForSelector('.notebook.mk-page');
        const readAll = () =>
          page.evaluate((field) => {
            const val = (selector) => document.querySelector(selector)?.value;
            const checked = [...document.querySelectorAll('.mk-card[aria-label="Scale 1"] .segmented__option')].find((o) => o.querySelector('input').checked);
            return {
              name: val('input[aria-label="Recipe name"]'),
              description: val('textarea[aria-label="Recipe description"]'),
              note: val(field),
              milk: val('input[aria-label="Whole milk, 3.5% fat, grams"]'),
              sugar: val('input[aria-label="Sucrose, grams"]'),
              style: document.querySelector('select.mk-menu')?.selectedOptions[0]?.textContent.trim(),
              temp: val('input[aria-label="Serving temperature, degrees Celsius"]'),
              bands: [...document.querySelectorAll('.mk-band input')].map((input) => input.value),
              scale: ['Name', 'Low end', 'High end'].map((l) => val(`.mk-card[aria-label="Scale 1"] input[aria-label="${l}"]`)),
              kind: checked?.textContent.trim(),
              problem: val('.mk-card[aria-label="Problem 1"] input[aria-label="Name"]'),
              scales: document.querySelectorAll('.mk-region[aria-label="Scales"] .mk-card').length,
              problems: document.querySelectorAll('.mk-region[aria-label="Problems"] .mk-card').length,
              rows: document.querySelectorAll('.ingredient-table tbody tr').length,
            };
          }, NOTE_FIELD);
        const expected = {
          name: NAME,
          description: DESCRIPTION,
          note: NOTE,
          milk: '600',
          sugar: '150',
          style: 'Philadelphia',
          temp: '-14',
          bands: PHILADELPHIA_BANDS,
          scale: ['Creaminess', 'thin', 'rich'],
          kind: 'Right in the middle',
          problem: 'Bitter',
          scales: 1,
          problems: 1,
          rows: 2,
        };
        const ok = await until(page, async () => isDeepStrictEqual(await readAll(), expected));
        if (!ok) throw new Error(`the fields read ${JSON.stringify(await readAll())}`);
        if (!(await until(page, async () => (await notice(page)) === KEPT_NOTICE))) {
          throw new Error(`the notice reads "${await notice(page)}"`);
        }
      },
    ],
    [
      'Cancel: the Notebook says "Draft discarded.", offers New recipe, and lists no draft row',
      async () => {
        await press(page, page.locator('.notebook-ceremony__actions button', { hasText: /^Cancel$/ }), async () => pathOf(page) === '/notebook');
        await page.waitForSelector('.nb__count');
        if (!(await until(page, async () => (await notice(page)) === DISCARDED_NOTICE))) {
          throw new Error(`the notice reads "${await notice(page)}"`);
        }
        const head = (await page.locator('.nb__head .notebook-action').allTextContents()).map((t) => t.trim());
        const drafts = await page.locator('.nb__draft').count();
        if (head.join() !== 'New recipe' || drafts !== 0) throw new Error(`the head offers [${head}] with ${drafts} draft rows`);
      },
    ],
    [
      'the recipes, versions and batches stores are as before and the drafts store is empty',
      async () => {
        const after = await dumpStores(page);
        for (const name of ['recipes', 'versions', 'batches']) {
          if (!isDeepStrictEqual(before[name], after[name])) throw new Error(`the ${name} store changed (${before[name].length} before, ${after[name].length} after)`);
        }
        if (after.drafts.length !== 0) throw new Error(`the drafts store holds ${after.drafts.length} at the end`);
      },
    ],
  ];

  for (const [name, body] of steps) {
    try {
      const detail = await body();
      pass(name, typeof detail === 'string' ? detail : '');
    } catch (error) {
      const message = String(error.message ?? error).split('\n')[0];
      fail(name, message);
      break;
    }
  }
  await context.close();
  exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
  await servers.close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(exitCode);
