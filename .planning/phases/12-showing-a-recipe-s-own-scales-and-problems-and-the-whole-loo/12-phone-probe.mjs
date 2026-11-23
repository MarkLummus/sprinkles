// 12-09 (PHONE-01; sketch 016 CONTRACT sections 1, 4 and 11 number 5c): the one-line page at the two
// editor addresses below 724, walked in Playwright WebKit with a coarse pointer (hasTouch) on a built app.
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-09" --emptyOutDir
//   PROBE_DIST="$S/dist-09" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs page
//
// Mode `page` (the only mode so far), one browser context so IndexedDB lives across routes:
//   1366  make and save a first version through the built editor, open its Edit and type a change so an
//         edit is kept, then start a second recipe so a create draft is kept; dump the drafts store.
//   393   /notebook/new and the saved version's /edit each show .list-page.place with its title and the
//         kept work's own sentence (CONTRACT section 12, quick 261123-brl): "Draft: Chocolate. Finish it in a
//         wider window." and "Edit kept. Finish it in a wider window."; no control in the page, except the
//         Edit page's one link in p.place__for ("Vanilla · Version 1", to the version's own address); and the
//         drafts dump is unchanged, which is this probe's proof that the page writes nothing.
//   724 and 1366  both addresses show the editor.
//   crossing  at 1366 type, and before the 250 ms debounce passes narrow to 393: the page shows, the
//         stored draft holds what was typed (awaited), and at 1366 again the field holds it. For the
//         create address (Recipe name) and for the edit address (Recipe description).
//   393 and 723  no sideways overflow on both addresses.
//
// Every result is Playwright WebKit on a Mac, not an iPad: every line is device-unverified. The build is
// read from PROBE_DIST (required) and never written; a PROBE_DIST that resolves to an app/dist folder is
// refused first (Mark's own `vite preview --host` serves that one). playwright-core is loaded only
// through PLAYWRIGHT_CORE (default: the npx cache path below); a missing file prints a FAIL and exits 1.
// The app is served on an ephemeral 127.0.0.1 port and every request to another host is aborted. No Vite
// process is started. Everything typed into the app is English and is not a recipe Mark keeps. PASS and
// FAIL lines; exit 1 on any FAIL.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
if (mode !== 'page') {
  console.log('FAIL usage: PROBE_DIST=<scratch build> node 12-phone-probe.mjs page');
  process.exit(1);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
if (!process.env.PROBE_DIST) {
  console.log('FAIL PROBE_DIST is not set: build to a scratch folder and pass it (this probe never serves app/dist)');
  process.exit(1);
}
const DIST = path.resolve(process.env.PROBE_DIST);
const realOf = (candidate) => {
  try {
    return realpathSync(candidate);
  } catch {
    return candidate;
  }
};
if (
  realOf(DIST) === realOf(path.join(REPO_ROOT, 'app', 'dist')) ||
  DIST.endsWith(`${path.sep}app${path.sep}dist`) ||
  realOf(DIST).endsWith(`${path.sep}app${path.sep}dist`)
) {
  console.log(`FAIL PROBE_DIST resolves to app/dist (${DIST}): build to a scratch folder instead`);
  process.exit(1);
}
if (!existsSync(path.join(DIST, 'index.html'))) {
  console.log(`FAIL no index.html in PROBE_DIST ${DIST}`);
  process.exit(1);
}

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

const MILK = 'Whole milk, 3.5% fat';
const SUGAR = 'Sucrose';
const SAVE_BUTTON = '.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)';
const DEBOUNCE_MS = 250;

console.log('NOTE device-unverified: Playwright WebKit with a coarse pointer on a Mac; no line here is an iPad result');

let failures = 0;
const pass = (what, detail = '') => console.log(`PASS page ${what}${detail ? ` (${detail})` : ''}`);
const fail = (what, why) => {
  failures += 1;
  console.log(`FAIL page ${what}: ${why}`);
};
// One check: a thrown Error is the FAIL's reason; a returned string is the PASS's detail.
async function check(what, body) {
  try {
    pass(what, (await body()) ?? '');
  } catch (error) {
    fail(what, String(error.message).slice(0, 400));
  }
}

async function until(predicate, ms = 5000) {
  const stop = Date.now() + ms;
  for (;;) {
    if (await predicate()) return true;
    if (Date.now() > stop) return false;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// The drafts store, read once, sorted by its key path (11-device-steps.mjs's method, drafts only).
async function dumpDrafts(page) {
  return page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('sprinkles');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const rows = await new Promise((resolve, reject) => {
        const request = db.transaction(['drafts'], 'readonly').objectStore('drafts').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return rows.sort((a, b) => (String(a.versionId) < String(b.versionId) ? -1 : 1));
    } finally {
      db.close();
    }
  });
}

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  // Nothing leaves the machine: abort every request to another host.
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  const page = await context.newPage();
  page.setDefaultTimeout(8000);

  const pathOf = () => new URL(page.url()).pathname;
  const settle = async () => {
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
  };
  // A first click on a fresh route can miss (chrome-first-click-after-navigate): click until the outcome shows.
  const clickUntil = async (locator, selector) => {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await locator().first().click();
      try {
        await page.waitForSelector(selector, { timeout: 1500 });
        return;
      } catch {
        /* the click missed; click again */
      }
    }
    throw new Error(`never appeared: ${selector}`);
  };
  const visit = async (route, selector) => {
    await page.goto(servers.appUrl + route, { waitUntil: 'load' });
    await page.waitForSelector(selector);
    await settle();
  };
  const pickRow = (name) =>
    page.locator('.pick__row', {
      has: page.locator('.pick__name', { hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }),
    });
  const addIngredient = async (name, grams) => {
    await clickUntil(() => page.locator('.ingredient-table-region .mk-head-act'), '.pick');
    await pickRow(name).click();
    await page.waitForSelector('.pick', { state: 'detached' });
    await page.fill(`[aria-label="${name}, grams"]`, grams);
  };
  const startRecipe = async (name) => {
    await visit('/notebook', '.nb__head');
    await clickUntil(() => page.locator('.nb__head .notebook-action'), '.nb__new textarea');
    await page.fill('.nb__new textarea', name);
    await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click();
    await page.waitForSelector('.ingredient-table-region');
  };

  // ---- setup at 1366: a saved first version, a kept edit on it, a kept create draft on a second recipe ----
  let editAddress = '';
  let setupOk = true;
  await check('setup: a first version is saved through the built editor, its edit and a second recipe are kept', async () => {
    await startRecipe('Vanilla');
    await addIngredient(MILK, '600');
    await addIngredient(SUGAR, '150');
    await clickUntil(() => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]');
    await page.fill('[aria-label="Step 1, lead-in"]', 'Warm');
    await page.fill('[aria-label="Step 1, instruction"]', 'Heat the milk with the sugar.');
    await page.locator(SAVE_BUTTON).click();
    await page.waitForSelector('.notebook-version');
    if (!/^\/notebook\/[^/]+\/[^/]+$/.test(pathOf())) throw new Error(`the page after Save is ${pathOf()}`);
    editAddress = `${pathOf()}/edit`;
    await settle();
    await clickUntil(() => page.locator('.notebook-version__acts button', { hasText: /^Edit$/ }), '.ingredient-table-region');
    await page.fill('textarea[aria-label="Recipe description"]', 'Plain and cold.');
    await page.waitForTimeout(DEBOUNCE_MS + 1000);
    await startRecipe('Chocolate');
    await page.waitForTimeout(DEBOUNCE_MS + 1000);
    const drafts = await dumpDrafts(page);
    const kinds = drafts.map((record) => record.kind).sort().join();
    if (kinds !== 'create,edit') throw new Error(`the drafts store holds ${JSON.stringify(kinds)}`);
    return `edit address ${editAddress}; drafts ${kinds}`;
  }).catch(() => {});
  if (failures > 0) setupOk = false;

  if (setupOk) {
    const MAIN = '.shell__main';
    const addresses = [
      ['/notebook/new', 'New recipe'],
      [editAddress, 'Edit'],
    ];
    // What each address shows at 393 (the setup kept a create draft named Chocolate and an edit on Vanilla's
    // version): its note, and the one link the Edit page holds.
    const expected = {
      '/notebook/new': { note: 'Draft: Chocolate. Finish it in a wider window.', link: null },
      [editAddress]: {
        note: 'Edit kept. Finish it in a wider window.',
        link: { text: 'Vanilla · Version 1', href: editAddress.replace(/\/edit$/, '') },
      },
    };

    // ---- 393: the one-line page, no control but the Edit page's link, the drafts store unchanged ----
    await page.setViewportSize({ width: 393, height: 852 });
    for (const [address, title] of addresses) {
      const want = expected[address];
      await check(`${address} at 393 shows "${title}" and "${want.note}", ${want.link ? 'one link line' : 'no control'}, drafts unchanged`, async () => {
        const before = JSON.stringify(await dumpDrafts(page));
        await page.goto(servers.appUrl + address, { waitUntil: 'load' });
        await page.waitForSelector('p.place__note');
        await settle();
        await page.waitForTimeout(600);
        const seen = await page.evaluate(
          ([main]) => {
            const place = document.querySelector('.list-page.place');
            const root = document.querySelector(main);
            return {
              title: place?.querySelector('h1.place__title')?.textContent ?? null,
              note: place?.querySelector('p.place__note')?.textContent ?? null,
              controls: root ? [...root.querySelectorAll('button, textarea, input, select, a')].map((node) => node.tagName.toLowerCase()) : ['no main'],
              links: [...document.querySelectorAll('.list-page.place a')].map((node) => ({
                text: node.textContent,
                href: new URL(node.href).pathname,
                inFor: node.parentElement?.matches('p.place__for') ?? false,
              })),
              editor: document.querySelectorAll('.ingredient-table-region, form[aria-label="Edit version"]').length,
            };
          },
          [MAIN],
        );
        if (seen.title !== title) throw new Error(`the title reads ${JSON.stringify(seen.title)}`);
        if (seen.note !== want.note) throw new Error(`the line reads ${JSON.stringify(seen.note)}`);
        if (want.link === null) {
          if (seen.controls.length > 0) throw new Error(`the page holds controls: ${seen.controls.join(', ')}`);
        } else {
          if (seen.controls.length !== 1 || seen.controls[0] !== 'a') throw new Error(`the page holds ${JSON.stringify(seen.controls)}, not one link`);
          const [link] = seen.links;
          if (!link || !link.inFor) throw new Error('the one link is not inside p.place__for');
          if (link.text !== want.link.text) throw new Error(`the link reads ${JSON.stringify(link.text)}`);
          if (link.href !== want.link.href) throw new Error(`the link goes to ${link.href}, not ${want.link.href}`);
        }
        if (seen.editor !== 0) throw new Error('an editor is mounted');
        const after = JSON.stringify(await dumpDrafts(page));
        if (after !== before) throw new Error('the drafts store changed');
        return 'title, line, controls as drawn, drafts dump identical';
      });
    }

    // ---- 724 and 1366: the editor ----
    for (const width of [724, 1366]) {
      await page.setViewportSize({ width, height: 1024 });
      for (const [address, title] of addresses) {
        await check(`${address} at ${width} shows the editor, not the desk page`, async () => {
          await page.goto(servers.appUrl + address, { waitUntil: 'load' });
          await page.waitForSelector('.ingredient-table-region');
          await settle();
          if ((await page.locator('.list-page.place').count()) !== 0) throw new Error(`the "${title}" desk page is showing`);
        });
      }
    }

    // ---- the crossing: typed text survives an editor that is narrowed inside the debounce ----
    const crossing = async (address, selector, label, kind, field) => {
      await check(`the ${label} crossing at ${address}: typed text is in the store once 393 shows, and back in the field at 1366`, async () => {
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          const word = `Crossed${attempt}${Date.now() % 100000}`;
          await page.setViewportSize({ width: 1366, height: 1024 });
          await page.goto(servers.appUrl + address, { waitUntil: 'load' });
          await page.waitForSelector('.ingredient-table-region');
          await settle();
          await page.waitForTimeout(700);
          const started = Date.now();
          await page.fill(selector, word);
          await page.setViewportSize({ width: 393, height: 852 });
          const elapsed = Date.now() - started;
          if (elapsed >= DEBOUNCE_MS) {
            // The narrowing came after the debounce already wrote: not the case under test. Try again.
            continue;
          }
          await page.waitForSelector('.list-page.place');
          const stored = await until(async () => {
            const records = await dumpDrafts(page);
            const record = records.find((candidate) => candidate.kind === kind);
            return record?.payload?.[field] === word;
          });
          if (!stored) throw new Error(`the stored ${kind} draft does not hold "${word}" (narrowed ${elapsed} ms after typing)`);
          await page.setViewportSize({ width: 1366, height: 1024 });
          await page.waitForSelector(selector);
          const back = await until(async () => (await page.inputValue(selector)) === word);
          if (!back) throw new Error(`the field reads ${JSON.stringify(await page.inputValue(selector))}, not "${word}"`);
          return `typed, narrowed ${elapsed} ms later, stored "${word}", back in the field`;
        }
        throw new Error(`could not narrow within ${DEBOUNCE_MS} ms of typing in 3 tries`);
      });
    };
    await crossing('/notebook/new', 'textarea[aria-label="Recipe name"]', 'New recipe', 'create', 'name');
    await crossing(editAddress, 'textarea[aria-label="Recipe description"]', 'Edit', 'edit', 'description');

    // ---- no sideways overflow at 393 and 723 on both addresses ----
    for (const width of [393, 723]) {
      await page.setViewportSize({ width, height: 900 });
      for (const [address] of addresses) {
        await check(`${address} at ${width} has no sideways overflow`, async () => {
          await page.goto(servers.appUrl + address, { waitUntil: 'load' });
          await page.waitForSelector('p.place__note');
          await settle();
          const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth }));
          if (sizes.scroll > sizes.inner) throw new Error(`scrollWidth ${sizes.scroll} is above innerWidth ${sizes.inner}`);
          return `scrollWidth ${sizes.scroll}, innerWidth ${sizes.inner}`;
        });
      }
    }
  }
  await context.close();
} catch (error) {
  failures += 1;
  console.log(`FAIL page probe stopped: ${String(error.message).slice(0, 400)}`);
} finally {
  await browser.close();
  await servers.close();
}
console.log(failures === 0 ? 'PASS page all checks (device-unverified)' : `FAIL page ${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
