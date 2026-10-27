// 11-13: the steps of Mark's List row check-p11-ipad-create-steps-save-print-edit (D-20), walked in
// Playwright WebKit at 1366 with a coarse pointer (hasTouch) on the final build, so each is proven
// reachable on its first activation before Mark is handed them (the verify-device-check-steps rule).
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-13" --emptyOutDir
//   PROBE_DIST="$S/dist-13" node .planning/phases/11-steps-structure-save-and-print/11-device-steps.mjs
//
// One browser context holds the whole walk, so IndexedDB lives across routes. Each step waits for its
// ready state (the target control attached, visible and enabled, document.fonts.ready, no load
// pending), activates it ONCE, then waits up to 5 s for the step's expected outcome. An outcome that
// does not come after that one activation prints "FAIL <step>: first activation missed" and ends the
// walk: no retry helper exists here, because retrying until the outcome appears would prove only that
// the control is eventually reachable, and a lost first tap is the defect this walk finds. Typing is
// `fill` after the ready state; it is not an activation. A keyboard step focuses a field once, then
// presses Tab (at most 40 times) until focus stands on the named control, then presses Enter once.
//
// The build is read from PROBE_DIST (default app/dist) and never written. playwright-core is loaded
// only through PLAYWRIGHT_CORE (default: the npx cache path below); when that file is missing the
// script prints a FAIL line and exits 1. The app is served on an ephemeral 127.0.0.1 port through
// 08-walk-server.mjs and every request to another host is aborted. Everything typed into the app is
// English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync } from 'node:fs';
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
const MILK = 'Whole milk, 3.5% fat';
const SUGAR = 'Sucrose';
const EXTRACT = 'Vanilla extract';
const SALT = 'Fine sea salt';
const SAVE_BUTTON = '.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)';
// The row's Move controls name their step after the row ("Move Sucrose up in step 2"), so they are matched by prefix.
const MOVE_SUCROSE_UP = 'Move Sucrose up';
const MOVE_SUCROSE_DOWN = 'Move Sucrose down';
const PORTION = (n) => `${MILK}, grams, portion ${n}`;

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

// Poll an async predicate for up to 5 s (or `ms`).
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

// The keyboard route to a control: focus a field once it is ready, press Tab until focus stands on the
// control (at most 40 presses, else a FAIL naming it), then one Enter and the outcome.
const focusLabel = (page) => page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
async function tabTo(page, start, wanted) {
  await readyFor(page, start);
  await start.focus();
  for (let presses = 0; presses <= 40; presses += 1) {
    if (wanted(await focusLabel(page))) return;
    if (presses === 40) break;
    await page.keyboard.press('Tab');
  }
  throw new Error(`Tab did not reach the control in 40 presses (focus is on "${await focusLabel(page)}")`);
}
async function enter(page, outcome) {
  await page.keyboard.press('Enter');
  if (!(await until(page, outcome))) throw new Error('first activation missed');
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
  const page = await context.newPage();

  const labelled = (label) => page.locator(`[aria-label="${label}"]`);
  const startsWith = (label) => page.locator(`[aria-label^="${label}"]`);
  // The picker's row is itself the button; its name is matched whole.
  const shelf = (label) =>
    page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) });
  const gramsField = (name) => page.locator(`input[aria-label="${name}, grams"]`);
  const field = (label) => page.locator(`input[aria-label="${label}"], textarea[aria-label="${label}"]`);
  const leadIns = () => page.evaluate(() => [...document.querySelectorAll('input[aria-label$=", lead-in"]')].map((input) => input.value));
  const portions = () =>
    page.evaluate(
      (prefix) => [...document.querySelectorAll(`input[aria-label^="${prefix}"]`)].map((input) => input.value),
      `${MILK}, grams, portion`,
    );
  // The table's groups: each tbody's head text and the names of its rows, by their remove controls.
  const tableGroups = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('.ingredient-table tbody')].map((body) => ({
        head: body.querySelector('.ingredient-table__step-head')?.textContent.trim() ?? '',
        rows: [...body.querySelectorAll('[data-act="remove"]')].map((node) => (node.getAttribute('aria-label') ?? '').replace(/^remove /, '')),
      })),
    );
  const total = () => page.evaluate(() => document.querySelector('.ingredient-table tfoot .ingredient-table__plan-grams')?.textContent.trim() ?? '');
  const groupOf = (groups, n) => groups.find((group) => group.head.startsWith(`Step ${n}`));
  const addIngredient = async (name, grams) => {
    await press(page, page.locator('.ingredient-table-region .mk-head-act'), () => page.locator('.pick').isVisible());
    await press(page, shelf(name), () => gramsField(name).isVisible());
    await type(page, gramsField(name), grams);
  };

  let before;
  let made;
  let totalBeforeRemoval;
  const steps = [
    [
      'the Notebook opens and the recipes, versions, batches and drafts stores are read first',
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
      'a name, Start, and /notebook/new opens',
      async () => {
        await type(page, page.locator('.nb__new input'), NAME);
        await press(page, page.locator('.nb__new-actions button', { hasText: /^Start$/ }), async () => pathOf(page) === '/notebook/new');
        await page.waitForSelector('.notebook.mk-page');
      },
    ],
    [`Add ingredient, ${MILK}, 600 g`, () => addIngredient(MILK, '600')],
    [`Add ingredient, ${SUGAR}, 150 g`, () => addIngredient(SUGAR, '150')],
    [`Add ingredient, ${EXTRACT}, 5 g`, () => addIngredient(EXTRACT, '5')],
    [`Add ingredient, ${SALT}, 1 g`, () => addIngredient(SALT, '1')],
    [
      'Add step on the Instructions heading: Warm and its instruction',
      async () => {
        await press(page, page.locator('.method-region .mk-head-act'), () => field('Step 1, lead-in').isVisible());
        await type(page, field('Step 1, lead-in'), 'Warm');
        await type(page, field('Step 1, instruction'), 'Heat the milk with the sugar.');
      },
    ],
    [
      'Step 1, add a step after it: Chill and its instruction',
      async () => {
        await press(page, labelled('Step 1, add a step after it'), () => field('Step 2, lead-in').isVisible());
        await type(page, field('Step 2, lead-in'), 'Chill');
        await type(page, field('Step 2, instruction'), 'Chill overnight.');
      },
    ],
    [
      `Add to step: ${MILK} in step 1`,
      async () => {
        await press(page, labelled(`Add ${MILK} to a step`), () => labelled(`Add ${MILK} to step 1`).isVisible());
        await press(page, labelled(`Add ${MILK} to step 1`), async () => (await labelled(`Add ${MILK} to a step`).count()) === 0);
      },
    ],
    [
      `Add to step: ${SUGAR} in step 2`,
      async () => {
        await press(page, labelled(`Add ${SUGAR} to a step`), () => labelled(`Add ${SUGAR} to step 2`).isVisible());
        await press(page, labelled(`Add ${SUGAR} to step 2`), async () => (await labelled(`Add ${SUGAR} to a step`).count()) === 0);
        const groups = await tableGroups();
        if (groupOf(groups, 1)?.rows.join() !== MILK || groupOf(groups, 2)?.rows.join() !== SUGAR) {
          throw new Error(`the groups read ${JSON.stringify(groups)}`);
        }
      },
    ],
    [
      `Step 2, change the ingredients: tick ${MILK}, done, and the row is split into two lines`,
      async () => {
        await press(page, labelled('Step 2, change the ingredients'), () => page.locator('fieldset[aria-label="Step 2, uses"]').isVisible());
        const item = page.locator('fieldset[aria-label="Step 2, uses"] label.method-step__uses-item', { hasText: MILK });
        await press(page, item, () => item.locator('input').isChecked());
        await press(page, labelled('Step 2, done'), async () => (await page.locator('fieldset[aria-label="Step 2, uses"]').count()) === 0);
        if (!(await until(page, async () => (await portions()).length === 2))) throw new Error(`the row has ${(await portions()).length} lines`);
      },
    ],
    [
      `the split row: 400 in "${PORTION(1)}" and 200 in "${PORTION(2)}"`,
      async () => {
        await type(page, field(PORTION(1)), '400');
        await type(page, field(PORTION(2)), '200');
      },
    ],
    [
      'Step 2, add a step after it: Rest and its instruction',
      async () => {
        await press(page, labelled('Step 2, add a step after it'), () => field('Step 3, lead-in').isVisible());
        await type(page, field('Step 3, lead-in'), 'Rest');
        await type(page, field('Step 3, instruction'), 'Rest it.');
      },
    ],
    [
      `Step 3, change the ingredients: tick ${MILK}, done, and 100 in "${PORTION(3)}"`,
      async () => {
        await press(page, labelled('Step 3, change the ingredients'), () => page.locator('fieldset[aria-label="Step 3, uses"]').isVisible());
        const item = page.locator('fieldset[aria-label="Step 3, uses"] label.method-step__uses-item', { hasText: MILK });
        await press(page, item, () => item.locator('input').isChecked());
        await press(page, labelled('Step 3, done'), async () => (await page.locator('fieldset[aria-label="Step 3, uses"]').count()) === 0);
        await type(page, field(PORTION(3)), '100');
        const read = await portions();
        totalBeforeRemoval = await total();
        if (read.join() !== '400,200,100') throw new Error(`the lines read ${read}`);
        return `lines ${read.join(', ')}; Total ${totalBeforeRemoval}`;
      },
    ],
    [
      'by tap Step 3, remove: the step goes, the row is back to two lines reading 500 and 200, and the Total stands',
      async () => {
        await press(page, labelled('Step 3, remove'), async () => (await field('Step 3, lead-in').count()) === 0);
        if (!(await until(page, async () => (await portions()).join() === '500,200'))) {
          throw new Error(`the lines read ${await portions()}`);
        }
        const after = await total();
        if (after !== totalBeforeRemoval) throw new Error(`the Total read ${totalBeforeRemoval} before and ${after} after`);
        return `lines ${(await portions()).join(', ')}; Total ${after}`;
      },
    ],
    [
      'by tap Step 1, move down: the steps swap and the numbers follow',
      async () => {
        await press(page, labelled('Step 1, move down'), async () => (await leadIns()).join() === 'Chill,Warm');
      },
    ],
    [
      'by keyboard: Tab to Step 2, move up from Chill, Enter: the steps swap back, focus on the moved step',
      async () => {
        await tabTo(page, field('Step 1, lead-in'), (label) => label === 'Step 2, move up');
        // Warm moves up to the first place: its Move up turns off, so focus lands on its Move down (D-16).
        await enter(page, async () => (await leadIns()).join() === 'Warm,Chill');
        if (!(await until(page, async () => (await focusLabel(page)) === 'Step 1, move down'))) {
          throw new Error(`focus is on "${await focusLabel(page)}", not "Step 1, move down"`);
        }
      },
    ],
    [
      `step 2's group reads ${SUGAR}, then ${MILK}'s line; step 1's group reads ${MILK}`,
      async () => {
        const groups = await tableGroups();
        const one = groupOf(groups, 1)?.rows.join();
        const two = groupOf(groups, 2)?.rows.join();
        if (one !== MILK || two !== `${SUGAR},${MILK}`) throw new Error(`the groups read ${JSON.stringify(groups)}`);
      },
    ],
    [
      `by keyboard: Tab to "Move ${SUGAR} down", Enter: ${SUGAR} goes below ${MILK}'s line, focus on its Move up, step 1's group as it was`,
      async () => {
        await tabTo(page, gramsField(SUGAR), (label) => label.startsWith(MOVE_SUCROSE_DOWN));
        await enter(page, async () => groupOf(await tableGroups(), 2)?.rows.join() === `${MILK},${SUGAR}`);
        // Its Move down turns off at the foot of the group, so focus lands on its Move up (D-16).
        if (!(await until(page, async () => (await focusLabel(page)).startsWith(MOVE_SUCROSE_UP)))) {
          throw new Error(`focus is on "${await focusLabel(page)}", not "${MOVE_SUCROSE_UP}"`);
        }
        const groups = await tableGroups();
        if (groupOf(groups, 1)?.rows.join() !== MILK) throw new Error(`step 1's group reads ${JSON.stringify(groupOf(groups, 1))}`);
      },
    ],
    [
      `by tap Move ${SUGAR} up: ${SUGAR} is back above ${MILK}'s line`,
      async () => {
        await press(page, startsWith(MOVE_SUCROSE_UP), async () => groupOf(await tableGroups(), 2)?.rows.join() === `${SUGAR},${MILK}`);
      },
    ],
    [
      `by tap remove ${EXTRACT}: the row goes and focus stands on a neighbouring remove`,
      async () => {
        await press(page, labelled(`remove ${EXTRACT}`), async () => (await labelled(`remove ${EXTRACT}`).count()) === 0);
        if (!(await until(page, async () => (await focusLabel(page)).startsWith('remove ')))) {
          throw new Error(`focus is on "${await focusLabel(page)}", not a remove control`);
        }
        return `focus on "${await focusLabel(page)}"`;
      },
    ],
    [
      `by keyboard: Tab to "remove ${SALT}", Enter: the row goes and focus stands on a neighbouring remove or Add ingredient`,
      async () => {
        await tabTo(page, gramsField(SALT), (label) => label === `remove ${SALT}`);
        await enter(page, async () => (await labelled(`remove ${SALT}`).count()) === 0);
        const landed = await page.evaluate(() => {
          const node = document.activeElement;
          return { label: node?.getAttribute('aria-label') ?? '', text: node?.textContent?.trim() ?? '' };
        });
        const ok = landed.label.startsWith('remove ') || /^Add ingredient/.test(landed.text) || /^Add ingredient/.test(landed.label);
        if (!ok) throw new Error(`focus is on ${JSON.stringify(landed)}`);
        return `focus on ${JSON.stringify(landed.label || landed.text)}`;
      },
    ],
    [
      'Save: the recipe page opens with "Recipe saved."',
      async () => {
        await press(page, page.locator(SAVE_BUTTON), async () => /^\/notebook\/[^/]+\/[^/]+$/.test(pathOf(page)) && (await notice(page)) === 'Recipe saved.');
        await page.waitForSelector('.notebook-version__identity');
      },
    ],
    [
      'the stores hold one recipe more, one version with a stored Sheet code, the two steps and the two rows, and no draft',
      async () => {
        const after = await dumpStores(page);
        const known = new Set(before.recipes.map((recipe) => recipe.id));
        const recipes = after.recipes.filter((recipe) => !known.has(recipe.id));
        if (recipes.length !== 1 || recipes[0].name !== NAME) throw new Error(`the new recipes read ${JSON.stringify(recipes.map((r) => r.name))}`);
        const versions = after.versions.filter((version) => version.recipeId === recipes[0].id);
        if (versions.length !== 1) throw new Error(`the recipe holds ${versions.length} versions`);
        const version = versions[0];
        if (typeof version.sheetCode !== 'string' || version.sheetCode === '') throw new Error('the version has no Sheet code');
        const order = version.method.map((step) => step.leadIn).join();
        if (order !== 'Warm,Chill') throw new Error(`the method reads ${order}`);
        const names = version.rows.map((row) => row.ingredientName).sort().join(' | ');
        if (names !== [MILK, SUGAR].sort().join(' | ')) throw new Error(`the rows read ${names}`);
        const milk = version.rows.find((row) => row.ingredientName === MILK);
        const grams = milk.portions.map((portion) => portion.grams).join();
        if (grams !== '500,200') throw new Error(`${MILK} holds portions ${grams}`);
        if (after.drafts.length !== 0) throw new Error(`the drafts store holds ${after.drafts.length}`);
        made = { recipeId: recipes[0].id, versionId: version.id, sheetCode: version.sheetCode, recipes: after.recipes.length };
        return `Sheet code ${version.sheetCode}`;
      },
    ],
    [
      'Print sheet opens the print route',
      async () => {
        await press(page, page.getByRole('link', { name: 'Print sheet' }), async () => pathOf(page).endsWith('/print'));
      },
    ],
    [
      'the print route is laid and its foot carries the stored Sheet code',
      async () => {
        await page.waitForSelector('.print-route[data-print-ready="true"]', { timeout: 15000 });
        const foot = (await page.locator('.print-route__pages .print-page--sheet .mp-foot').last().textContent()).trim();
        const code = foot.split(' · ').pop();
        if (code !== made.sheetCode) throw new Error(`the foot reads "${foot}", the stored code is ${made.sheetCode}`);
        return `foot "${foot}"`;
      },
    ],
    [
      'Search opens, the code is typed, Find lands on that version',
      async () => {
        await press(page, page.locator('.shell__tools a[href="/search"]'), async () => pathOf(page) === '/search');
        await type(page, page.locator('.search__form input'), made.sheetCode);
        await press(page, page.locator('.search__form button[type="submit"]'), async () => pathOf(page) === `/notebook/${made.recipeId}/${made.versionId}`);
        await page.waitForSelector('.notebook-version__identity');
      },
    ],
    [
      'Edit opens the editor reading "Version 1 · editing"',
      async () => {
        await press(page, page.locator('.notebook-version__acts button', { hasText: /^Edit$/ }), async () => pathOf(page).endsWith('/edit'));
        await page.waitForSelector('form[aria-label="Edit version"]');
        const caption = ((await page.locator('.notebook-ceremony .notebook-caption').first().textContent()) ?? '').trim();
        if (caption !== 'Version 1 · editing') throw new Error(`the caption reads "${caption}"`);
      },
    ],
    [
      'by tap Step 1, move down, then Save: the page reads "Changes saved."',
      async () => {
        await press(page, labelled('Step 1, move down'), async () => (await leadIns()).join() === 'Chill,Warm');
        await press(page, page.locator(SAVE_BUTTON), async () => pathOf(page) === `/notebook/${made.recipeId}/${made.versionId}` && (await notice(page)) === 'Changes saved.');
      },
    ],
    [
      'Search again, the same code, Find lands on the same version id',
      async () => {
        await press(page, page.locator('.shell__tools a[href="/search"]'), async () => pathOf(page) === '/search');
        await type(page, page.locator('.search__form input'), made.sheetCode);
        await press(page, page.locator('.search__form button[type="submit"]'), async () => pathOf(page) === `/notebook/${made.recipeId}/${made.versionId}`);
      },
    ],
    [
      "the stores end with one recipe more than at the start, the version's id and Sheet code unchanged by the edit, the steps swapped, and no draft",
      async () => {
        const after = await dumpStores(page);
        if (after.recipes.length !== before.recipes.length + 1) throw new Error(`${after.recipes.length} recipes against ${before.recipes.length} at the start`);
        const version = after.versions.find((candidate) => candidate.id === made.versionId);
        if (!version) throw new Error('the version is gone');
        if (version.sheetCode !== made.sheetCode) throw new Error(`the Sheet code went from ${made.sheetCode} to ${version.sheetCode}`);
        const order = version.method.map((step) => step.leadIn).join();
        if (order !== 'Chill,Warm') throw new Error(`the method reads ${order}`);
        if (after.versions.filter((candidate) => candidate.recipeId === made.recipeId).length !== 1) throw new Error('the edit made a second version');
        if (after.drafts.length !== 0) throw new Error(`the drafts store holds ${after.drafts.length}`);
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
