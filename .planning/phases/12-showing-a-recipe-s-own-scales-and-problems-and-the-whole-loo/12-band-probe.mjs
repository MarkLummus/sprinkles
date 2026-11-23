// 12-10 (PHONE-01; sketch 016 CONTRACT sections 2, 9 bullet 5 and 11 numbers 5a and 5b; Mark's B on
// decide-p12-record-with-draft-held): a kept Next version draft below 724, walked in Playwright WebKit with a
// coarse pointer and a phone screen (hasTouch, isMobile at 393) on a built app.
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-10" --emptyOutDir
//   PROBE_DIST="$S/dist-10" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-band-probe.mjs held widen
//
// One browser context so IndexedDB lives across routes. Setup at 1366: two recipes are made and saved through the
// built editor. "Vanilla" has no batch; "Mocha" has one batch awaiting its tasting. Each gets a Next version
// pen with a typed version name, kept for 1.3 s, so a plan draft is stored on each; the drafts store is dumped.
//
// Mode `held` (393, no isMobile: the viewport is what the width hooks read):
//   Vanilla  no Next version pen opens on load, the batch log holds no Record batch, pressing the band's record
//            act (drawn until 12-16 takes it out) and the band's Next version opens no pen, and the drafts
//            dump is identical after load and after 2 s.
//   Mocha    the same, with Record another and Correct absent from the log and the band's Record tasting
//            opening nothing. Then Home at 393 (quick 261123-ghj, Mark's answer to decide-p12-home-row-sentence):
//            the lead and both rows read their "Draft: ... Finish it in a wider window." sentence, the lead and the
//            two rows hold no actions span, no link on Home opens either recipe's record act, and the drafts dump is
//            byte-identical after load and after 2 s.
// Mode `widen` (the held state of Vanilla loaded at 393):
//   setViewportSize 1366 opens the Next version pen holding the typed version name, the plan record still stored;
//   narrowing to 393 with the pen open leaves the pen open.
//
// Every result is Playwright WebKit on a Mac, not an iPad: every line is device-unverified. The build is read
// from PROBE_DIST (required) and never written; a PROBE_DIST that resolves to an app/dist folder is refused
// first (Mark's own `vite preview --host` serves that one). playwright-core is loaded only through
// PLAYWRIGHT_CORE (default: the npx cache path below); a missing file prints a FAIL and exits 1. The app is
// served on an ephemeral 127.0.0.1 port and every request to another host is aborted. No Vite process is
// started. Everything typed into the app is English and is not a recipe Mark keeps. PASS and FAIL lines;
// exit 1 on any FAIL.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const modes = process.argv.slice(2);
if (modes.length === 0 || modes.some((name) => name !== 'held' && name !== 'widen')) {
  console.log('FAIL usage: PROBE_DIST=<scratch build> node 12-band-probe.mjs held [widen]');
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
const NAME_FIELD = 'textarea[aria-label="Version name"]';
const NEXT_PEN = 'form[aria-label="Next version"]';
const ANY_PEN = `${NEXT_PEN}, .batch-margin--pen`;
const KEEP_MS = 1300;
const PHONE = { width: 393, height: 852 };
const DESK = { width: 1366, height: 1024 };

console.log('NOTE device-unverified: Playwright WebKit with a coarse pointer on a Mac; no line here is an iPad result');

let failures = 0;
let currentMode = 'setup';
const pass = (what, detail = '') => console.log(`PASS ${currentMode} ${what}${detail ? ` (${detail})` : ''}`);
const fail = (what, why) => {
  failures += 1;
  console.log(`FAIL ${currentMode} ${what}: ${why}`);
};
// One check: a thrown Error is the FAIL's reason; a returned string is the PASS's detail.
async function check(what, body) {
  try {
    pass(what, (await body()) ?? '');
    return true;
  } catch (error) {
    fail(what, String(error.message).slice(0, 400));
    return false;
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

// The drafts store, read once, sorted by its key path (12-phone-probe.mjs's method).
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
const dumpText = async (page) => JSON.stringify(await dumpDrafts(page));

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
try {
  const context = await browser.newContext({ viewport: DESK, hasTouch: true });
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
  // A first version made and saved through the built editor; returns the version's own address.
  const makeRecipe = async (name) => {
    await startRecipe(name);
    await addIngredient(MILK, '600');
    await addIngredient(SUGAR, '150');
    await clickUntil(() => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]');
    await page.fill('[aria-label="Step 1, lead-in"]', 'Warm');
    await page.fill('[aria-label="Step 1, instruction"]', 'Heat the milk with the sugar.');
    await page.locator(SAVE_BUTTON).click();
    await page.waitForSelector('.notebook-version');
    if (!/^\/notebook\/[^/]+\/[^/]+$/.test(pathOf())) throw new Error(`the page after Save is ${pathOf()}`);
    await settle();
    return pathOf();
  };
  // A batch with no tasting: the version then awaits its tasting.
  const recordBatch = async (versionPath) => {
    await visit(versionPath, '.notebook-version__identity');
    const PEN = '.batch-margin--pen';
    await clickUntil(() => page.getByRole('button', { name: /^Record (batch|another)$/ }), PEN);
    await page.locator(`${PEN} .field-row__label--date :is(input, textarea)`).first().fill('2026-10-09');
    await page.fill(`${PEN} [aria-label^="Out of machine"]`, '-6');
    await page.fill(`${PEN} [aria-label^="Duration"]`, '30');
    await page.locator('.save-ceremony').first().getByRole('button', { name: 'Save batch', exact: true }).first().click();
    await page.waitForFunction(() => location.pathname.includes('/batch/'));
    await page.waitForSelector(PEN, { state: 'detached' });
    await settle();
  };
  // A kept Next version draft on the version: the pen opened at the desk, a version name typed, the debounce passed.
  const keepNextVersion = async (versionPath, label) => {
    await visit(versionPath, '.notebook-version__identity');
    await clickUntil(() => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), NEXT_PEN);
    await page.fill(NAME_FIELD, label);
    await page.waitForTimeout(KEEP_MS);
  };
  const openPens = () => page.locator(ANY_PEN).count();
  const logButtons = () =>
    page.evaluate(() => [...document.querySelectorAll('.notebook-log button')].map((node) => node.textContent.trim()));
  const bandActs = () =>
    page.evaluate(() => [...document.querySelectorAll('.notebook-version__acts .notebook-action')].map((node) => node.textContent.trim()));

  // ---- setup at 1366 ----
  let vanilla = '';
  let mocha = '';
  const planOn = async (versionPath) => {
    const versionId = versionPath.split('/')[3];
    return (await dumpDrafts(page)).find((record) => record.versionId === versionId && record.kind === 'plan') ?? null;
  };
  const setupOk = await check('setup: two recipes are made at 1366, each holding a kept Next version draft', async () => {
    vanilla = await makeRecipe('Vanilla');
    await keepNextVersion(vanilla, 'less cream');
    mocha = await makeRecipe('Mocha');
    await recordBatch(mocha);
    await keepNextVersion(mocha, 'more cocoa');
    const first = await planOn(vanilla);
    const second = await planOn(mocha);
    if (!first || first.payload.versionLabel !== 'less cream') throw new Error('the Vanilla plan draft is not stored');
    if (!second || second.payload.versionLabel !== 'more cocoa') throw new Error('the Mocha plan draft is not stored');
    return `drafts ${(await dumpDrafts(page)).map((record) => record.kind).join()}`;
  });

  // The phone: a coarse touch window of 393.
  const toPhone = () => page.setViewportSize(PHONE);

  if (setupOk && modes.includes('held')) {
    currentMode = 'held';
    await toPhone();

    for (const [name, address, hasBatch] of [
      ['Vanilla', vanilla, false],
      ['Mocha', mocha, true],
    ]) {
      await check(`${name} at 393 opens with the pen shut, no record act in the log, the drafts dump identical after load and after 2 s`, async () => {
        const before = await dumpText(page);
        await visit(address, '.notebook-version__identity');
        await page.waitForTimeout(600);
        if ((await openPens()) !== 0) throw new Error('a pen is open');
        if ((await page.locator('.notebook-ceremony').count()) !== 0) throw new Error('a ceremony is drawn');
        const buttons = await logButtons();
        const banned = buttons.filter((text) => ['Record batch', 'Record another', 'Correct'].includes(text));
        if (banned.length > 0) throw new Error(`the log draws ${banned.join(', ')}`);
        if ((await dumpText(page)) !== before) throw new Error('the drafts dump changed after load');
        await page.waitForTimeout(2000);
        if ((await dumpText(page)) !== before) throw new Error('the drafts dump changed after 2 s');
        return `${hasBatch ? 'one batch' : 'no batch'}; log buttons ${JSON.stringify(buttons)}; drafts dump identical after load and after 2 s`;
      });

      await check(`${name} at 393: the band's record act and Next version open no pen, the plan draft unchanged`, async () => {
        const before = await dumpText(page);
        const acts = await bandActs();
        if (acts.length > 0) {
          await page.locator('.notebook-version__acts .notebook-action').first().click();
          await page.waitForTimeout(500);
        }
        const next = page.locator('.notebook-version__acts button', { hasText: /^Next version$/ });
        if ((await next.count()) > 0) {
          await next.first().click();
          await page.waitForTimeout(500);
        }
        if ((await openPens()) !== 0) throw new Error('a pen opened');
        await page.waitForTimeout(1000);
        if ((await dumpText(page)) !== before) throw new Error('the drafts dump changed');
        return `band acts ${JSON.stringify(acts)}; drafts dump identical`;
      });
    }

    // Quick 261123-ghj (Mark's answer to decide-p12-home-row-sentence, 2026-11-23): below 724 Home no longer
    // draws a record act on a version holding a kept Next version draft, so there is no link to press (the
    // earlier check pressed Home's Record tasting here). Home says where the draft is finished instead, in the
    // lead and on the row, and reads the drafts without writing them.
    await check('Home at 393 offers no record act on a version holding a plan draft, says where it is finished in the lead and on the row, and writes nothing', async () => {
      const before = await dumpText(page);
      await visit('/', '.home__list');
      await page.waitForTimeout(600);
      const read = await page.evaluate(
        ([mochaAddress, vanillaAddress]) => {
          const rowFor = (address) =>
            [...document.querySelectorAll('li.home__row')].find((row) => row.querySelector('.home__name a')?.getAttribute('href') === address);
          const describe = (row) =>
            row === undefined
              ? null
              : { actions: row.querySelectorAll('.home__actions').length, line: row.querySelector('p.home__row-draft')?.textContent ?? null };
          const lead = document.querySelector('.home__lead');
          return {
            leadActions: lead.querySelectorAll('.home__actions').length,
            leadLine: lead.querySelector('p.home__lead-draft')?.textContent ?? null,
            leadLinks: lead.querySelectorAll('p.home__lead-draft a').length,
            mocha: describe(rowFor(mochaAddress)),
            vanilla: describe(rowFor(vanillaAddress)),
            actHrefs: [...document.querySelectorAll('a.home__action')].map((link) => link.getAttribute('href')),
          };
        },
        [mocha, vanilla],
      );
      const mochaWords = 'Draft: Version 2 · more cocoa. Finish it in a wider window.';
      const vanillaWords = 'Draft: Version 2 · less cream. Finish it in a wider window.';
      if (read.leadActions !== 0) throw new Error(`the lead holds ${read.leadActions} actions span`);
      if (read.leadLinks !== 0) throw new Error('the lead line holds a link');
      if (read.leadLine !== mochaWords) throw new Error(`the lead reads ${JSON.stringify(read.leadLine)}`);
      if (!read.mocha) throw new Error('the probe\'s Mocha row is not on Home');
      if (read.mocha.actions !== 0 || read.mocha.line !== mochaWords) throw new Error(`the Mocha row reads ${JSON.stringify(read.mocha)}`);
      if (!read.vanilla) throw new Error('the probe\'s Vanilla row is not on Home');
      if (read.vanilla.actions !== 0 || read.vanilla.line !== vanillaWords) throw new Error(`the Vanilla row reads ${JSON.stringify(read.vanilla)}`);
      const offered = read.actHrefs.filter((href) => href && (href.startsWith(mocha) || href.startsWith(vanilla)));
      if (offered.length > 0) throw new Error(`Home links ${offered.join(', ')}`);
      if ((await dumpText(page)) !== before) throw new Error('the drafts dump changed after load');
      await page.waitForTimeout(2000);
      if ((await dumpText(page)) !== before) throw new Error('the drafts dump changed after 2 s');
      return `lead and both rows read the sentence, no actions span in the lead or either row, no record link to either version; drafts dump identical after load and after 2 s`;
    });
  }

  if (setupOk && modes.includes('widen')) {
    currentMode = 'widen';
    await toPhone();
    await check('Vanilla held at 393, widened to 1366: the Next version pen opens with the typed name, the plan record still stored', async () => {
      await visit(vanilla, '.notebook-version__identity');
      await page.waitForTimeout(600);
      if ((await openPens()) !== 0) throw new Error('a pen is open at 393');
      // A restored pen is dirty, so the page writes its record again after the debounce, as at any fresh
      // desk load: the record is the same plan draft with a fresh updatedAt, nothing else.
      const content = async () => JSON.stringify((await dumpDrafts(page)).map(({ updatedAt, ...rest }) => rest));
      const before = await content();
      await page.setViewportSize(DESK);
      await page.waitForSelector(NEXT_PEN);
      const value = await page.inputValue(NAME_FIELD);
      if (value !== 'less cream') throw new Error(`the version name reads ${JSON.stringify(value)}`);
      await page.waitForTimeout(800);
      if ((await content()) !== before) throw new Error('the drafts dump changed');
      return 'pen open with "less cream"; drafts dump identical apart from updatedAt';
    });
    await check('narrowed to 393 with the pen open: the pen stays open', async () => {
      await toPhone();
      await page.waitForTimeout(600);
      if ((await page.locator(NEXT_PEN).count()) !== 1) throw new Error('the pen closed');
      const value = await page.inputValue(NAME_FIELD);
      if (value !== 'less cream') throw new Error(`the version name reads ${JSON.stringify(value)}`);
      return 'pen still open with "less cream"';
    });
  }
  await context.close();
} catch (error) {
  failures += 1;
  console.log(`FAIL ${currentMode} probe stopped: ${String(error.message).slice(0, 400)}`);
} finally {
  await browser.close();
  await servers.close();
}
console.log(failures === 0 ? `PASS ${modes.join(' ')} all checks (device-unverified)` : `FAIL ${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
