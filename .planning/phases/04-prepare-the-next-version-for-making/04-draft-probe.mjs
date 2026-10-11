// 04-09: kept drafts, proved by real reloads on the built app (UX1-02).
//
// Usage (from the repo root, after `npm --prefix app run build`):
//   node .planning/phases/04-.../04-draft-probe.mjs plan     the Next version pen
//   node .planning/phases/04-.../04-draft-probe.mjs record   the record pen, its tasting section included
//   node .planning/phases/04-.../04-draft-probe.mjs amend    the Correct pen, also from the version's bare address
//   node .planning/phases/04-.../04-draft-probe.mjs home     Home's draft line and the version band's draft line
//   node .planning/phases/04-.../04-draft-probe.mjs check    every mode
//
// Every mode runs in WebKit and Chrome. Each opens a pen on the built app,
// types, waits past the 250 ms debounce, RELOADS the page (the same browser
// context, so IndexedDB survives as it does for a maker), and reads what the
// page does with the stored draft. Playwright contexts are fresh per run, so
// every mode starts from the reseeded store. Prints FAIL lines and exits 1
// on any. Chrome and Playwright's WebKit do not prove Mobile Safari: the
// iPad is Mark's device check.
//
// The build is read from PROBE_DIST (default app/dist). Pass a scratch
// --outDir build there so Mark's own `vite preview --host` on :4173, which
// serves app/dist, is never disturbed.
//
// Isolation: the app is served on an ephemeral 127.0.0.1 port through the
// 03.5 harness and every request to another host is aborted in every context
// openApp makes. Nothing here contacts :4173, :8077, a browser profile or a
// third-party host. Everything typed into the app is English.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, check, finish, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import path from 'node:path';

const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');
const MODES = ['plan', 'record', 'amend', 'home'];

const RECIPE = 'olive-oil-ice-cream';
const VERSION_ID = 'olive-oil-ice-cream-v1';
const VERSION_ROUTE = `/notebook/${RECIPE}/${VERSION_ID}`;
const BATCH_ID = 'b8cc3566-48a4-4b23-b6e5-749a332afe89';
const BATCH_ROUTE = `${VERSION_ROUTE}/batch/${BATCH_ID}`;

const KEPT = 'Draft kept. Cancel discards it.';
const PLAN_NAME = 'less milk, more cream';
const MILK_FIELD = 'input[aria-label="Whole milk, grams, portion 1"]';
const NAME_FIELD = 'input[aria-label="Version name"]';

const state = { failures: [], count: 0 };
function ok(condition, label) {
  state.count += 1;
  check(state.failures, condition, label);
}

// ---------------------------------------------------------------------------
// Driving the built app. A first click after a navigation can miss (WebKit
// and Chrome alike), so every opener is clicked until its pen shows.
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
  await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), 'form[aria-label="Next version"]', 'open the Next version pen');
}

// Reload the page in place. The context (and its IndexedDB) is the same one,
// so this is what a reload is to a maker. Waits for the app to mount.
async function reload(page, selector = '.notebook') {
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector(selector);
}

async function noticeText(page) {
  return page.evaluate(() => document.querySelector('.page-status')?.textContent ?? null);
}

// Waits for the notice to carry the kept words; the restore reads IndexedDB
// after the page's loads settle, so it lands a moment after the mount.
async function waitForNotice(page) {
  try {
    await page.waitForFunction((words) => document.querySelector('.page-status')?.textContent === words, KEPT, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function penIsOpen(page) {
  return (await page.locator('form[aria-label="Next version"]').count()) > 0;
}

// ---------------------------------------------------------------------------
// Mode plan: the Next version pen.
// ---------------------------------------------------------------------------
async function planMode({ browser, engine, appUrl }) {
  const label = (what) => `plan ${engine} ${what}`;
  const { context, page } = await openApp(browser, appUrl, VERSION_ROUTE, { width: 1366 });
  try {
    await openNextVersionPen(page);
    await page.fill(NAME_FIELD, PLAN_NAME);
    await page.fill(MILK_FIELD, '100');
    const inkBefore = await page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).color, NAME_FIELD);
    await page.waitForTimeout(400);

    await reload(page);
    const noticeShown = await waitForNotice(page);
    ok(await penIsOpen(page), label('the pen is open after a reload'));
    ok((await page.inputValue(NAME_FIELD)) === PLAN_NAME, label('the version name is in its field'));
    ok((await page.inputValue(MILK_FIELD)) === '100', label('Whole milk’s first line is in its field'));
    ok(noticeShown, label(`the notice reads exactly "${KEPT}"`));
    ok((await page.locator('.page-status').count()) === 1, label('the notice is the one page status'));
    const inkAfter = await page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).color, NAME_FIELD);
    ok(inkAfter === inkBefore, label(`the restored ink is the pen\u2019s own ink (${inkBefore})`));

    await page.waitForTimeout(6000);
    ok((await noticeText(page)) === '', label('the notice is gone after 6 s'));
    ok(await penIsOpen(page), label('the pen stays open when the notice clears'));

    // Cancel discards it, with no dialog: a reload reads the page with no pen.
    let dialogSeen = false;
    page.on('dialog', (dialog) => {
      dialogSeen = true;
      dialog.dismiss();
    });
    await page.getByRole('button', { name: 'Cancel' }).first().click();
    await page.waitForSelector('form[aria-label="Next version"]', { state: 'detached' });
    ok(!dialogSeen, label('Cancel asked nothing'));
    await page.waitForTimeout(400);
    await reload(page);
    await page.waitForTimeout(800);
    ok(!(await penIsOpen(page)), label('after Cancel and a reload the page reads, with no pen'));
    ok((await noticeText(page)) === '', label('after Cancel and a reload there is no notice'));
  } finally {
    await context.close();
  }
}


// ---------------------------------------------------------------------------
// The batch pens. Fields are found the way a maker meets them: by label.
// ---------------------------------------------------------------------------
const PEN = '.batch-margin--pen';
const CHURN_DATE = `${PEN} .field-row__label--date input`;
const OUT_OF_MACHINE = `${PEN} input[aria-label^="Out of machine"]`;
const CHURN_DURATION = `${PEN} input[aria-label^="Churn duration"]`;

async function penCount(page) {
  return page.locator(PEN).count();
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

async function markedStop(page, axisName) {
  return page.evaluate((name) => {
    const axis = [...document.querySelectorAll(`${'.batch-margin--pen'} .axis-mark`)].find(
      (node) => node.querySelector('.axis-mark__name')?.textContent === name,
    );
    return axis?.querySelector('input[type="radio"]:checked')?.value ?? null;
  }, axisName);
}

// Cancel with a dialog listener on: the page must ask nothing.
async function cancelPen(page, label) {
  let dialogSeen = false;
  const onDialog = (dialog) => {
    dialogSeen = true;
    dialog.dismiss();
  };
  page.on('dialog', onDialog);
  await page.locator('.save-ceremony').getByRole('button', { name: 'Cancel' }).first().click();
  await page.waitForSelector(PEN, { state: 'detached' });
  page.off('dialog', onDialog);
  ok(!dialogSeen, label('Cancel asked nothing'));
}

// ---------------------------------------------------------------------------
// Mode record: a new batch's record pen, its tasting section included.
// ---------------------------------------------------------------------------
async function recordMode({ browser, engine, appUrl }) {
  const label = (what) => `record ${engine} ${what}`;
  const { context, page } = await openApp(browser, appUrl, VERSION_ROUTE, { width: 1366 });
  try {
    await clickUntil(page, () => page.locator('.batch-row__record').first(), PEN, 'open the record pen');
    await page.fill(CHURN_DATE, '2026-10-09');
    await page.fill(OUT_OF_MACHINE, '-6');
    await page.locator('.save-ceremony button', { hasText: 'Add tasting' }).first().click();
    await page.waitForSelector('.tasting-head');
    await markAxis(page, 'Hardness', 3);
    await page.waitForTimeout(400);

    await reload(page);
    const noticeShown = await waitForNotice(page);
    ok((await penCount(page)) === 1, label('the record pen is open after a reload'));
    ok((await page.inputValue(CHURN_DATE)) === '2026-10-09', label('the churn date is in its field'));
    ok((await page.inputValue(OUT_OF_MACHINE)) === '-6', label('Out of machine is in its field'));
    ok((await page.locator('.tasting-head').count()) === 1, label('the Tasting section is open'));
    ok((await markedStop(page, 'Hardness')) === '3', label('Hardness is marked 3'));
    ok(noticeShown, label(`the notice reads exactly "${KEPT}"`));
    ok(page.url().endsWith(VERSION_ROUTE), label('the record pen opens on the address it was kept on'));

    await page.waitForTimeout(6000);
    ok((await noticeText(page)) === '', label('the notice is gone after 6 s'));
    ok((await penCount(page)) === 1, label('the pen stays open when the notice clears'));

    await cancelPen(page, label);
    await page.waitForTimeout(400);
    await reload(page);
    await page.waitForTimeout(800);
    ok((await penCount(page)) === 0, label('after Cancel and a reload the page reads, with no pen'));
    ok((await noticeText(page)) === '', label('after Cancel and a reload there is no notice'));
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Mode amend: the Correct pen on the 2 Aug batch, also from the version's bare
// address, where the address is replaced with the batch's.
// ---------------------------------------------------------------------------
async function amendMode({ browser, engine, appUrl }) {
  const label = (what) => `amend ${engine} ${what}`;
  const { context, page } = await openApp(browser, appUrl, BATCH_ROUTE, { width: 1366 });
  try {
    const origin = new URL(page.url()).origin;
    await clickUntil(page, () => page.locator('.batch-row__correct').first(), PEN, 'open the Correct pen');
    const durationBefore = await page.inputValue(CHURN_DURATION);
    await page.fill(CHURN_DURATION, '31');
    await page.waitForTimeout(400);

    await reload(page);
    const noticeShown = await waitForNotice(page);
    ok((await penCount(page)) === 1, label('the Correct pen is open after a reload'));
    ok((await page.inputValue(CHURN_DURATION)) === '31', label('the edited duration is in its field'));
    ok((await page.inputValue(CHURN_DATE)) === '2026-08-02', label('the batch’s own churn date is in its field'));
    ok(noticeShown, label(`the notice reads exactly "${KEPT}"`));
    ok(page.url().endsWith(BATCH_ROUTE), label('the Correct pen stays on its batch’s address'));

    // The same draft, met on the version's bare address: the address is
    // replaced with the batch's and the pen opens there with its ink.
    await page.goto(`${origin}${VERSION_ROUTE}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.notebook');
    const noticeAgain = await waitForNotice(page);
    ok(page.url().endsWith(BATCH_ROUTE), label('the bare address is replaced with the batch’s'));
    ok((await penCount(page)) === 1, label('the Correct pen is open after arriving on the bare address'));
    ok((await page.inputValue(CHURN_DURATION)) === '31', label('the edited duration is in its field after the replace'));
    ok(noticeAgain, label('the notice is shown once the pen has reopened beside its batch'));
    await page.goto(`${origin}${BATCH_ROUTE}`, { waitUntil: 'networkidle' });
    await page.waitForSelector(PEN);

    await cancelPen(page, label);
    await page.waitForTimeout(400);
    await reload(page);
    await page.waitForTimeout(800);
    ok((await penCount(page)) === 0, label('after Cancel and a reload the page reads, with no pen'));
    // An untouched Correct pen holds no ink: opened and closed it leaves none.
    await clickUntil(page, () => page.locator('.batch-row__correct').first(), PEN, 'reopen the Correct pen');
    ok((await page.inputValue(CHURN_DURATION)) === durationBefore, label('a fresh Correct pen starts from the stored batch, not the cancelled ink'));
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const RUNNERS = { plan: planMode, record: recordMode, amend: amendMode };

async function run(modes) {
  const { appUrl, close } = await startServers({ appRoot: DIST });
  const browsers = { webkit: await webkit.launch(), chrome: await launch() };
  try {
    for (const [engine, browser] of Object.entries(browsers)) {
      for (const mode of modes) {
        await RUNNERS[mode]({ browser, engine, appUrl });
      }
    }
  } finally {
    await Promise.all(Object.values(browsers).map((b) => b.close()));
    await close();
  }
  finish(state.failures, state.count, `04 draft probe ${modes.join(',')}`);
}

const [, , mode] = process.argv;
if (MODES.includes(mode) && RUNNERS[mode]) {
  await run([mode]);
} else if (mode === 'check') {
  await run(MODES.filter((m) => RUNNERS[m]));
} else {
  console.error(`Usage: node 04-draft-probe.mjs <${MODES.join('|')}|check>`);
  process.exit(1);
}
