// 261003-by3 probe: iPhone date inputs in the record and amend pen.
// Usage: node 261003-by3-probe.mjs <paths|reset> <before|after>
//
// Playwright WebKit, iPhone 14 descriptor pinned to 393x852 (coarse, touch),
// taps not clicks, against app/dist served on ephemeral 127.0.0.1 ports by
// the 03.5 harness. Starts no Vite, never requests :4173, :5173 or :8011,
// aborts every request that is not to 127.0.0.1, and saves nothing.
//
// `before` expects the defect (run against a build of the unchanged source),
// `after` expects the fix. Exit code is non-zero on any failed check.
//
// Native calendar presentation cannot be observed in desktop WebKit, so the
// readings are focus() calls per tap and the value / value attribute pair
// after each step. See .planning/debug/ios-tasting-date-picker.md.
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import {
  startServers,
  APP_ROUTE,
  check,
  finish,
} from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const [group, phase] = process.argv.slice(2);
if (!['paths', 'reset'].includes(group) || !['before', 'after'].includes(phase)) {
  console.error('usage: node 261003-by3-probe.mjs <paths|reset> <before|after>');
  process.exit(2);
}
const AFTER = phase === 'after';

const COCONUT = '/notebook/coconut/coconut-v2';
const TASTED = 'label:has(.pen-caption:text-is("Tasted")) input[type="date"]';
const CHURN = 'label:has(.pen-caption:text-is("Churn date")) input[type="date"]';

// Installed before any app script. Logs every focus() on a date input with
// its caption, and a task-end marker scheduled from a capture-phase click so
// each focus can be placed before or after the tap's own task ends.
const INIT = () => {
  window.__dateFocuses = [];
  const origFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (...args) {
    if (this.type === 'date') {
      const caption = this.closest('label')?.querySelector('.pen-caption')?.textContent ?? '?';
      window.__dateFocuses.push({ caption, inTapTask: !window.__taskEnded });
    }
    return origFocus.apply(this, args);
  };
  document.addEventListener(
    'click',
    () => {
      window.__taskEnded = false;
      setTimeout(() => {
        window.__taskEnded = true;
      }, 0);
    },
    true,
  );
};

async function openPage(browser, appUrl, route) {
  const context = await browser.newContext({
    ...devices['iPhone 14'],
    viewport: { width: 393, height: 852 },
    screen: { width: 393, height: 852 },
  });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  await context.addInitScript(INIT);
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('h2.notebook-version__identity');
  await settle(page);
  return { context, page };
}

async function settle(page, ms = 400) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(ms);
}

const clearLog = (page) => page.evaluate(() => window.__dateFocuses.splice(0));
const readLog = (page) => page.evaluate(() => window.__dateFocuses.splice(0));

async function activeCaption(page) {
  return page.evaluate(
    () => document.activeElement?.closest?.('label')?.querySelector('.pen-caption')?.textContent ?? null,
  );
}

async function tapAndRead(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await clearLog(page);
  await locator.tap();
  await page.waitForSelector('.batch-margin--pen');
  await settle(page);
  const log = await readLog(page);
  return { captions: log.map((e) => e.caption), inTapTask: log.map((e) => e.inTapTask), active: await activeCaption(page) };
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function runPaths(browser, appUrl, failures) {
  let count = 0;
  const counted = (cond, label) => {
    count += 1;
    check(failures, cond, label);
  };
  const expectP1 = AFTER ? ['Tasted'] : ['Churn date', 'Tasted'];

  // P1: the band's Record a tasting.
  {
    const { context, page } = await openPage(browser, appUrl, COCONUT);
    const r = await tapAndRead(page, page.locator('.notebook-band').getByRole('button', { name: 'Record a tasting', exact: true }));
    console.log(JSON.stringify({ case: 'P1 Record a tasting', ...r }));
    counted(same(r.captions, expectP1), `P1 date focuses ${JSON.stringify(r.captions)} expected ${JSON.stringify(expectP1)}`);
    counted(r.active === expectP1[expectP1.length - 1], `P1 active ${r.active}`);
    await context.close();
  }

  // P2a and P2b: Correct, then Add tasting in the same context.
  {
    const { context, page } = await openPage(browser, appUrl, COCONUT);
    const a = await tapAndRead(page, page.getByRole('button', { name: 'Correct', exact: true }));
    console.log(JSON.stringify({ case: 'P2a Correct', ...a }));
    counted(same(a.captions, ['Churn date']), `P2a date focuses ${JSON.stringify(a.captions)}`);
    counted(a.active === 'Churn date', `P2a active ${a.active}`);
    const b = await tapAndRead(page, page.locator('.save-ceremony__add-tasting').first());
    console.log(JSON.stringify({ case: 'P2b Add tasting', ...b }));
    counted(same(b.captions, ['Tasted']), `P2b date focuses ${JSON.stringify(b.captions)}`);
    counted(b.active === 'Tasted', `P2b active ${b.active}`);
    await context.close();
  }

  // P3: Record another.
  {
    const { context, page } = await openPage(browser, appUrl, COCONUT);
    const r = await tapAndRead(page, page.locator('.batch-row__record').first());
    console.log(JSON.stringify({ case: 'P3 Record another', ...r }));
    counted(same(r.captions, ['Churn date']), `P3 date focuses ${JSON.stringify(r.captions)}`);
    counted(r.active === 'Churn date', `P3 active ${r.active}`);
    await context.close();
  }
  return count;
}

// pick: the calendar writing a date. reset: WebKit's setValue(null), emulated
// by a form reset, then input and change. rerender: an unrelated draft edit,
// so React state shows through .value.
const read = (page, selector) =>
  page.locator(selector).evaluate((el) => ({ value: el.value, attr: el.getAttribute('value') }));

const pick = (page, selector, v) =>
  page.locator(selector).evaluate((el, date) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, date);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, v);

const reset = (page, selector) =>
  page.locator(selector).evaluate((el) => {
    const form = document.createElement('form');
    form.id = '__probe_form';
    document.body.appendChild(form);
    el.setAttribute('form', '__probe_form');
    form.reset();
    const immediate = el.value;
    el.removeAttribute('form');
    form.remove();
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return immediate;
  });

async function rerender(page, text) {
  await page.locator('.batch-margin--pen').getByLabel('At the machine', { exact: true }).fill(text);
  await page.waitForTimeout(100);
}

async function runReset(browser, appUrl, failures) {
  let count = 0;
  const counted = (cond, label) => {
    count += 1;
    check(failures, cond, label);
  };
  const out = (step, r, extra = {}) => console.log(JSON.stringify({ step, ...r, ...extra }));

  // `before` expects the defect: the attribute follows the pick, Reset puts
  // the picked date back. `after` expects the attribute gone and Reset empty.
  const afterPick = (step, r, date) => {
    counted(r.value === date, `${step}: value ${r.value} expected ${date}`);
    counted(AFTER ? r.attr === null : r.attr === date, `${step}: attr ${r.attr}`);
  };
  const afterReset = (step, immediate, r, stillDate) => {
    if (AFTER) {
      counted(immediate === '', `${step}: value right after reset ${JSON.stringify(immediate)} expected ''`);
      counted(r.value === '', `${step}: value after rerender ${JSON.stringify(r.value)} expected ''`);
      counted(r.attr === null, `${step}: attr ${r.attr} expected null`);
    } else {
      counted(r.value === stillDate, `${step}: value after rerender ${JSON.stringify(r.value)} expected ${stillDate} (defect)`);
    }
  };

  // R1: Coconut v2 after the band's Record a tasting.
  {
    const { context, page } = await openPage(browser, appUrl, COCONUT);
    const opener = page.locator('.notebook-band').getByRole('button', { name: 'Record a tasting', exact: true });
    await opener.scrollIntoViewIfNeeded();
    await opener.tap();
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);

    await pick(page, TASTED, '2026-10-01');
    await page.waitForTimeout(100);
    let r = await read(page, TASTED);
    out('R1 tasted pick 2026-10-01', r);
    afterPick('R1 tasted pick 1', r, '2026-10-01');
    let imm = await reset(page, TASTED);
    await rerender(page, '1');
    r = await read(page, TASTED);
    out('R1 tasted reset then rerender', r, { immediate: imm });
    afterReset('R1 tasted reset 1', imm, r, '2026-10-01');

    await pick(page, TASTED, '2026-09-30');
    await rerender(page, '2');
    r = await read(page, TASTED);
    out('R1 tasted pick 2026-09-30 then rerender', r);
    afterPick('R1 tasted pick 2', r, '2026-09-30');
    imm = await reset(page, TASTED);
    await rerender(page, '3');
    r = await read(page, TASTED);
    out('R1 tasted second reset then rerender', r, { immediate: imm });
    afterReset('R1 tasted reset 2', imm, r, '2026-09-30');

    await pick(page, CHURN, '2026-09-29');
    await page.waitForTimeout(100);
    r = await read(page, CHURN);
    out('R1 churn pick 2026-09-29', r);
    afterPick('R1 churn pick', r, '2026-09-29');
    imm = await reset(page, CHURN);
    await rerender(page, '4');
    r = await read(page, CHURN);
    out('R1 churn reset then rerender', r, { immediate: imm });
    afterReset('R1 churn reset', imm, r, '2026-09-29');
    await context.close();
  }

  // R2: a stored date after Correct; Reset with no pick first.
  {
    const { context, page } = await openPage(browser, appUrl, APP_ROUTE);
    const opener = page.getByRole('button', { name: 'Correct', exact: true });
    await opener.scrollIntoViewIfNeeded();
    await opener.tap();
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);
    let r = await read(page, CHURN);
    out('R2 churn at open', r);
    counted(r.value === '2026-08-02', `R2 value at open ${r.value}`);
    counted(AFTER ? r.attr === null : r.attr === '2026-08-02', `R2 attr at open ${r.attr}`);
    const imm = await reset(page, CHURN);
    await rerender(page, '5');
    r = await read(page, CHURN);
    out('R2 churn reset then rerender', r, { immediate: imm });
    afterReset('R2 churn reset', imm, r, '2026-08-02');
    await context.close();
  }
  return count;
}

const servers = await startServers();
const browser = await webkit.launch();
const failures = [];
let count = 0;
try {
  count = group === 'paths' ? await runPaths(browser, servers.appUrl, failures) : await runReset(browser, servers.appUrl, failures);
} finally {
  await browser.close();
  await servers.close();
}
finish(failures, count, `261003-by3 ${group} ${phase}`);
