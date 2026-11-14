// Quick 261114-gxe probe: bug-edit-this-step-focus-on-cancel. Proves, in Playwright WebKit and in Chrome
// (playwright-core chromium, channel 'chrome') on a scratch build of the real app, at 1366x1024 with a fine
// pointer and a coarse pointer, that on the version pen (Next version on Olive Oil v1) pressing "Step N, edit
// this step" lands focus in "Step N, lead-in" and not on the step's own Cancel, and that Cancel and Done land
// where they landed at the base build.
//   W1 pointer: press Step 1's edit this step with a click (a tap under a coarse pointer); record the active
//      element and scrollY.
//   W2 keyboard: focus Step 2's edit this step by script and press Enter; record the active element and the
//      lead-in value; press Enter again; record the active element, whether the lead-in still exists, and its value.
//   W3 Cancel and Done: open Step 1 by keyboard, type " probe" at the end of its lead-in, focus that step's own
//      Cancel and press Enter; record the active element and the closed lead text. Then open Step 2 by keyboard,
//      focus its Done and press Enter; record the active element.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S="${TMPDIR:-/tmp}/sprinkles-gxe"
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   node <this file> check "$S/after.json" --base "$S/base.json"
// It starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST
// through 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host.
// Everything typed or printed is English. Prints PASS/FAIL/INFO lines and ends "N PASS, M FAIL"
// (exit 1 on any FAIL).
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}

const CONFIGS = [
  { name: '1366 fine', width: 1366, height: 1024, touch: false, dpr: 1 },
  { name: '1366 coarse', width: 1366, height: 1024, touch: true, dpr: 1 },
];
const PAGE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const VERSION_PEN = 'form[aria-label="Next version"]';

const [, , mode, file, ...rest] = process.argv;
if (mode !== 'record' && mode !== 'check') {
  console.log('FAIL usage: record <out.json> | check <after.json> --base <base.json>');
  process.exit(1);
}

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

async function openPage(browser, cfg) {
  const context = await browser.newContext({
    viewport: { width: cfg.width, height: cfg.height },
    hasTouch: cfg.touch,
    deviceScaleFactor: cfg.dpr,
  });
  await context.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  return { context, page };
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

// A fresh context per walk (a fresh store that seeds itself), on the version pen.
async function openPen(browser, base, cfg) {
  const ctx = await openPage(browser, cfg);
  const { page } = ctx;
  await page.goto(`${base}${PAGE}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('li.method-step');
  await settle(page);
  await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), VERSION_PEN, 'open the Next version pen');
  await page.waitForTimeout(300);
  return ctx;
}

const active = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el.tagName,
      label: el.getAttribute('aria-label'),
      text: (el.textContent ?? '').trim().slice(0, 40),
    };
  });

const fieldState = (page, label) =>
  page.evaluate((label) => {
    const el = document.querySelector(`textarea[aria-label="${label}"]`);
    return el ? { exists: true, value: el.value } : { exists: false, value: null };
  }, label);

const focusByLabel = (page, label) =>
  page.evaluate((label) => {
    document.querySelector(`button[aria-label="${label}"]`).focus();
  }, label);

// Opens a step by keyboard: focus its edit button by script, press Enter.
async function openByKeyboard(page, n) {
  await focusByLabel(page, `Step ${n}, edit this step`);
  await page.keyboard.press('Enter');
  await page.waitForSelector(`textarea[aria-label="Step ${n}, lead-in"]`);
  await page.waitForTimeout(150);
}

// Focuses the named button inside the li.method-step that holds the lead-in textarea of step n.
const focusInStep = (page, n, text) =>
  page.evaluate(
    ({ n, text }) => {
      const li = document.querySelector(`textarea[aria-label="Step ${n}, lead-in"]`).closest('li');
      const button = [...li.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
      button.focus();
    },
    { n, text },
  );

async function runConfig(browser, base, cfg) {
  // W1, pointer
  let ctx = await openPen(browser, base, cfg);
  let page = ctx.page;
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const edit1 = page.getByRole('button', { name: 'Step 1, edit this step' }).first();
  if (cfg.touch) await edit1.tap();
  else await edit1.click();
  await page.waitForSelector('textarea[aria-label="Step 1, lead-in"]', { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(200);
  const w1 = { active: await active(page), scrollBefore, scrollAfter: await page.evaluate(() => window.scrollY) };
  await ctx.context.close();

  // W2, keyboard
  ctx = await openPen(browser, base, cfg);
  page = ctx.page;
  await openByKeyboard(page, 2);
  const w2 = { open: await active(page), openField: await fieldState(page, 'Step 2, lead-in') };
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  w2.again = await active(page);
  w2.againField = await fieldState(page, 'Step 2, lead-in');
  await ctx.context.close();

  // W3, Cancel and Done
  ctx = await openPen(browser, base, cfg);
  page = ctx.page;
  await openByKeyboard(page, 1);
  await page.getByLabel('Step 1, lead-in', { exact: true }).click();
  await page.keyboard.press('End');
  await page.keyboard.type(' probe');
  await focusInStep(page, 1, 'Cancel');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const w3 = {
    cancel: await active(page),
    fieldGone: !(await fieldState(page, 'Step 1, lead-in')).exists,
    closedLead: await page.evaluate(() => {
      const li = document.querySelector('button[aria-label="Step 1, edit this step"]').closest('li');
      return li.querySelector('p.method-step__lead')?.textContent ?? null;
    }),
  };
  await openByKeyboard(page, 2);
  await focusInStep(page, 2, 'Done');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  w3.done = await active(page);
  await ctx.context.close();

  return { coarse, w1, w2, w3 };
}

if (mode === 'record') {
  if (!process.env.PROBE_DIST || !existsSync(path.join(process.env.PROBE_DIST, 'index.html'))) {
    console.log('FAIL PROBE_DIST must name a directory holding index.html (a scratch build)');
    process.exit(1);
  }
  const { webkit, chromium } = await import(PLAYWRIGHT_CORE);
  const servers = await startServers({ appRoot: path.resolve(process.env.PROBE_DIST) });
  const out = {};
  const engines = [
    ['webkit', () => webkit.launch()],
    ['chrome', () => chromium.launch({ channel: 'chrome' })],
  ];
  for (const [name, launch] of engines) {
    let browser;
    try {
      browser = await launch();
    } catch (err) {
      console.log(`INFO ${name} did not launch: ${String(err.message).split('\n')[0]}`);
      continue;
    }
    out[name] = {};
    for (const cfg of CONFIGS) {
      out[name][cfg.name] = await runConfig(browser, servers.appUrl, cfg);
      const r = out[name][cfg.name];
      console.log(
        `INFO ${name} ${cfg.name}: W1 ${JSON.stringify(r.w1.active)}; W2 open ${JSON.stringify(r.w2.open)} again ${JSON.stringify(r.w2.again)} field ${JSON.stringify(r.w2.againField)}; W3 cancel ${JSON.stringify(r.w3.cancel)} lead "${r.w3.closedLead}" done ${JSON.stringify(r.w3.done)}`,
      );
    }
    await browser.close();
  }
  await servers.close();
  writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`recorded ${Object.keys(out).join(' + ')} to ${file}`);
  process.exit(0);
}

// check
const baseIdx = rest.indexOf('--base');
if (baseIdx < 0 || !rest[baseIdx + 1]) {
  console.log('FAIL check needs --base <base.json>');
  process.exit(1);
}
const after = JSON.parse(readFileSync(file, 'utf8'));
const base = JSON.parse(readFileSync(rest[baseIdx + 1], 'utf8'));
let pass = 0;
let fail = 0;
const say = (ok, text) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${text}`);
  if (ok) pass += 1;
  else fail += 1;
};
const same = (a, b) => a.tag === b.tag && a.label === b.label && a.text === b.text;
const show = (a) => `${a.tag} label=${a.label} text=${a.text}`;
for (const engine of ['webkit', 'chrome']) {
  if (!after[engine] || !base[engine]) {
    console.log(`INFO ${engine} not recorded in both files; skipped`);
    continue;
  }
  for (const cfg of CONFIGS) {
    const a = after[engine][cfg.name];
    const b = base[engine][cfg.name];
    const tag = `${engine} ${cfg.name}`;
    say(
      b.w2.open.tag === 'BUTTON' && b.w2.open.text === 'Cancel',
      `base reproduces the bug ${tag}: W2 open active is ${show(b.w2.open)}`,
    );
    say(
      a.w1.active.tag === 'TEXTAREA' && a.w1.active.label === 'Step 1, lead-in',
      `W1 ${tag}: pointer open lands on ${show(a.w1.active)} (base ${show(b.w1.active)})`,
    );
    say(
      a.w2.open.tag === 'TEXTAREA' && a.w2.open.label === 'Step 2, lead-in',
      `W2 ${tag}: keyboard open lands on ${show(a.w2.open)} (base ${show(b.w2.open)})`,
    );
    say(
      a.w2.againField.exists &&
        a.w2.againField.value === a.w2.openField.value &&
        a.w2.again.tag === 'TEXTAREA' &&
        a.w2.again.label === 'Step 2, lead-in',
      `W2 ${tag}: second Enter keeps the step open (field exists ${a.w2.againField.exists}, value unchanged ${a.w2.againField.value === a.w2.openField.value}, active ${show(a.w2.again)}; base active ${show(b.w2.again)}, field exists ${b.w2.againField.exists})`,
    );
    say(same(a.w3.cancel, b.w3.cancel), `W3 ${tag}: Cancel lands on ${show(a.w3.cancel)} (base ${show(b.w3.cancel)})`);
    say(
      a.w3.closedLead === b.w3.closedLead && a.w3.fieldGone,
      `W3 ${tag}: Cancel restores the closed lead "${a.w3.closedLead}" (base "${b.w3.closedLead}"), field gone ${a.w3.fieldGone}`,
    );
    say(same(a.w3.done, b.w3.done), `W3 ${tag}: Done lands on ${show(a.w3.done)} (base ${show(b.w3.done)})`);
    console.log(`INFO ${tag}: W1 scrollY before ${a.w1.scrollBefore} after ${a.w1.scrollAfter} (base ${b.w1.scrollBefore} -> ${b.w1.scrollAfter}); coarse ${a.coarse}`);
  }
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
