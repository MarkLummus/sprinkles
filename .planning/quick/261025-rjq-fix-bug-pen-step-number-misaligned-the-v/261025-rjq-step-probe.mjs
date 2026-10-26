// Quick 261025-rjq probe: bug-pen-step-number-misaligned. Proves, in Playwright WebKit and in Chrome
// (playwright-core chromium, channel 'chrome') on a scratch build of the real app, at 1366x1024 fine,
// 1366x1024 coarse, 984x1024 fine and 984x1024 coarse, on Olive Oil v1 after Next version and then
// "Step 1, edit this step", that the open step's margin number and its lead-in field share one top.
//   G1 open step 1: lead-in top minus number top is 0 (the base build shows 6.0);
//   G2 open step 1: the gap from the lead-in bottom to the instruction top equals the base's;
//   G3 reading page (no pen): every step's number and lead tops equal the base's;
//   G4 pen with every step closed: the same;
//   G5 pen with step 1 open: each later step's number top equals the base's minus the base's G1 drop
//      (skipped when the checked file is the base file itself);
//   G6 the coarse media query matches the config's hasTouch.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S="${TMPDIR:-/tmp}/sprinkles-rjq/$(basename "$(git rev-parse --show-toplevel)")"
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   PROBE_DIST="$S/after-dist" node <this file> check "$S/after.json" --base "$S/base.json"
// It starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST
// through 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host.
// Everything typed or printed is English. Prints PASS/FAIL/INFO lines and ends "N PASS, M FAIL"
// (exit 1 on any FAIL). Tolerance 0.1px.
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

const TOL = 0.1;
const CONFIGS = [
  { name: '1366 fine', width: 1366, height: 1024, touch: false },
  { name: '1366 coarse', width: 1366, height: 1024, touch: true },
  { name: '984 fine', width: 984, height: 1024, touch: false },
  { name: '984 coarse', width: 984, height: 1024, touch: true },
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

async function measure(page) {
  return page.evaluate(() => {
    const top = (el) => (el ? Math.round((el.getBoundingClientRect().top + window.scrollY) * 100) / 100 : null);
    const bottom = (el) => (el ? Math.round((el.getBoundingClientRect().bottom + window.scrollY) * 100) / 100 : null);
    const steps = [...document.querySelectorAll('li.method-step')].map((li) => ({
      n: top(li.querySelector('.method-step__n')),
      lead: top(li.querySelector('.method-step__lead')),
    }));
    const open = document.querySelector('.method-step__open-fields');
    let fields = null;
    if (open) {
      const leadIn = open.querySelector('.prose-field--lead-in');
      const instruction = open.querySelector('textarea.prose-field');
      fields = { leadInTop: top(leadIn), leadInBottom: bottom(leadIn), instructionTop: top(instruction) };
    }
    return { steps, fields, coarse: matchMedia('(pointer: coarse)').matches };
  });
}

async function runConfig(browser, base, cfg) {
  const context = await browser.newContext({
    viewport: { width: cfg.width, height: cfg.height },
    hasTouch: cfg.touch,
    deviceScaleFactor: 1,
  });
  await context.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(`${base}${PAGE}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.method-step');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const reading = await measure(page);
  await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), VERSION_PEN, 'open the Next version pen');
  await page.waitForTimeout(300);
  const closed = await measure(page);
  await clickUntil(
    page,
    () => page.getByRole('button', { name: 'Step 1, edit this step' }).first(),
    '.method-step__open-fields',
    'open step 1',
  );
  await page.waitForTimeout(300);
  const open = await measure(page);
  await context.close();
  return { coarse: reading.coarse, reading, closed, open };
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
    for (const cfg of CONFIGS) out[name][cfg.name] = await runConfig(browser, servers.appUrl, cfg);
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
const baseFile = rest[baseIdx + 1];
const after = JSON.parse(readFileSync(file, 'utf8'));
const base = JSON.parse(readFileSync(baseFile, 'utf8'));
const sameFile = path.resolve(file) === path.resolve(baseFile);
let pass = 0;
let fail = 0;
const near = (a, b) => a !== null && b !== null && Math.abs(a - b) <= TOL;
const say = (ok, text) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${text}`);
  if (ok) pass += 1;
  else fail += 1;
};
for (const engine of ['webkit', 'chrome']) {
  if (!after[engine] || !base[engine]) {
    console.log(`INFO ${engine} not recorded in both files; skipped`);
    continue;
  }
  for (const cfg of CONFIGS) {
    const a = after[engine][cfg.name];
    const b = base[engine][cfg.name];
    const tag = `${engine} ${cfg.name}`;
    const aS = a.open.steps[0];
    const bS = b.open.steps[0];
    const drop = Math.round((a.open.fields.leadInTop - aS.n) * 100) / 100;
    const baseDrop = Math.round((b.open.fields.leadInTop - bS.n) * 100) / 100;
    say(near(drop, 0), `G1 ${tag}: lead-in top minus number top is ${drop} (base ${baseDrop})`);
    const gap = Math.round((a.open.fields.instructionTop - a.open.fields.leadInBottom) * 100) / 100;
    const baseGap = Math.round((b.open.fields.instructionTop - b.open.fields.leadInBottom) * 100) / 100;
    say(near(gap, baseGap), `G2 ${tag}: lead-in bottom to instruction top ${gap} (base ${baseGap}); number ${aS.n}, lead-in ${a.open.fields.leadInTop}`);
    for (const [gate, key] of [['G3', 'reading'], ['G4', 'closed']]) {
      const bad = a[key].steps.length !== b[key].steps.length
        ? ['step count']
        : a[key].steps.flatMap((s, i) => [
            near(s.n, b[key].steps[i].n) ? null : `step ${i + 1} number ${s.n} vs ${b[key].steps[i].n}`,
            near(s.lead, b[key].steps[i].lead) ? null : `step ${i + 1} lead ${s.lead} vs ${b[key].steps[i].lead}`,
          ]).filter(Boolean);
      say(bad.length === 0, `${gate} ${tag}: ${key} tops equal the base${bad.length ? ` (${bad.join('; ')})` : ''}`);
    }
    if (sameFile) {
      console.log(`INFO G5 ${tag}: skipped, the checked file is the base file`);
    } else {
      const bad = a.open.steps.length !== b.open.steps.length
        ? ['step count']
        : a.open.steps.slice(1).flatMap((s, i) =>
            near(s.n, b.open.steps[i + 1].n - baseDrop) ? [] : [`step ${i + 2} number ${s.n} vs ${Math.round((b.open.steps[i + 1].n - baseDrop) * 100) / 100}`],
          );
      say(bad.length === 0, `G5 ${tag}: later steps sit ${baseDrop} higher than base${bad.length ? ` (${bad.join('; ')})` : ''}`);
    }
    say(a.coarse === cfg.touch, `G6 ${tag}: coarse ${a.coarse} equals hasTouch ${cfg.touch}`);
  }
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
