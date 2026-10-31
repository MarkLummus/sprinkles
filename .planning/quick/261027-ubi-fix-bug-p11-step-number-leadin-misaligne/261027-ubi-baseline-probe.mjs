// Quick 261027-ubi probe: bug-p11-step-number-leadin-misaligned. Proves, in Playwright WebKit and in Chrome
// (playwright-core chromium, channel 'chrome') on a scratch build of the real app, at 1366x1024 with a fine
// pointer, a coarse pointer, and a coarse pointer at DPR 2, that the creation editor's open step 1 has its
// number (.method-step__n) and its lead-in input on the same text baseline.
//   U1 open creation step: lead-in baseline minus number baseline is within 1.0 px (the base build shows
//      about +8.5 WebKit and +8.0 Chrome under a coarse pointer);
//   U2 reading step (Olive Oil v1 step 1), re-based by quick 261031-fdd on sketch 014 decision 10: the number
//      top equals the base's, the lead top moves down by the base's old offset (minus the base's diff), and
//      the baseline difference is 0;
//   U3 Preview step inside the open step, re-based the same way: (lead top minus number top) equals the
//      base's minus the base's diff, and the baseline difference is 0;
//   U4 open step lead-in field top: coarse equals the base's; fine is 0 to 1.0 lower than the base's;
//   U5 instruction top minus lead-in bottom equals the base's (field rhythm unchanged);
//   U6 the coarse media query matches the config's hasTouch;
//   U7 the version pen's open step (quick 261031-fdd): number and lead-in field baselines coincide, and the
//      lead-in field top, after minus base, is 0 under a coarse pointer and 0 to 1.0 lower under a fine one.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S="${TMPDIR:-/tmp}/sprinkles-ubi"
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   node <this file> check "$S/after.json" --base "$S/base.json"
// It starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST
// through 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host.
// Everything typed or printed is English. Prints PASS/FAIL/INFO lines and ends "N PASS, M FAIL"
// (exit 1 on any FAIL). Tolerance 0.1px unless a gate says otherwise.
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
  { name: '1366 fine', width: 1366, height: 1024, touch: false, dpr: 1 },
  { name: '1366 coarse', width: 1366, height: 1024, touch: true, dpr: 1 },
  { name: '1366 coarse dpr2', width: 1366, height: 1024, touch: true, dpr: 2 },
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

// Measures one li.method-step (found by a selector run in the page): its number, and the element named
// by leadSelector. Baselines come from a zero-size inline-block probe span, inserted and removed at once.
async function measurePair(page, liSelector, leadSelector) {
  return page.evaluate(
    ({ liSelector, leadSelector }) => {
      const r2 = (v) => Math.round(v * 100) / 100;
      const li = document.querySelector(liSelector);
      if (!li) return null;
      const number = li.querySelector('.method-step__n');
      const lead = li.querySelector(leadSelector);
      const makeSpan = () => {
        const s = document.createElement('span');
        s.style.cssText =
          'display:inline-block;width:0;height:0;vertical-align:baseline;margin:0;padding:0;border:0';
        return s;
      };
      const baseline = (place) => {
        const s = makeSpan();
        place(s);
        const b = r2(s.getBoundingClientRect().bottom + window.scrollY);
        s.remove();
        return b;
      };
      const describe = (el, place) => {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          top: r2(rect.top + window.scrollY),
          bottom: r2(rect.bottom + window.scrollY),
          height: r2(rect.height),
          baseline: baseline(place),
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          family: cs.fontFamily.split(',')[0].trim(),
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          borderTop: cs.borderTopWidth,
          borderBottom: cs.borderBottomWidth,
          minHeight: cs.minHeight,
        };
      };
      const place = lead.tagName === 'INPUT' ? (s) => lead.insertAdjacentElement('afterend', s) : (s) => lead.prepend(s);
      const n = describe(number, (s) => number.append(s));
      const l = describe(lead, place);
      return { number: n, lead: l, diff: r2(l.baseline - n.baseline) };
    },
    { liSelector, leadSelector },
  );
}

async function openPage(browser, base, cfg) {
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

// One fresh context per area, so an open pen or draft never reaches the next area (no unload prompt).
async function runConfig(browser, base, cfg) {
  // (a) reading step, then (d) the pen, information only
  let ctx = await openPage(browser, base, cfg);
  let page = ctx.page;
  await page.goto(`${base}${PAGE}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('li.method-step');
  await settle(page);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  const reading = await measurePair(page, 'li.method-step', '.method-step__lead');
  await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), VERSION_PEN, 'open the Next version pen');
  await page.waitForTimeout(300);
  await clickUntil(
    page,
    () => page.getByRole('button', { name: 'Step 1, edit this step' }).first(),
    '.method-step__open-fields',
    'open pen step 1',
  );
  await settle(page);
  const pen = await measurePair(page, 'li.method-step:has(.method-step__open-fields)', '.prose-field--lead-in');
  await ctx.context.close();

  // (b) open creation step, then (c) its Preview
  ctx = await openPage(browser, base, cfg);
  page = ctx.page;
  await page.goto(`${base}/notebook`, { waitUntil: 'networkidle' });
  await clickUntil(page, () => page.getByRole('button', { name: 'New recipe' }), 'form[aria-label="New recipe"]', 'open New recipe');
  await page.getByLabel('Name', { exact: true }).fill('Probe sorbet');
  await clickUntil(page, () => page.getByRole('button', { name: 'Start' }), '.mk-page', 'Start');
  await clickUntil(
    page,
    () => page.getByRole('button', { name: 'Add step', exact: true }),
    'li.mk-step input[data-field="lead-in"]',
    'Add step',
  );
  await page.locator('li.mk-step input[data-field="lead-in"]').first().fill('Warm the milk');
  await settle(page);
  const open = await measurePair(page, 'li.mk-step', 'input[data-field="lead-in"]');
  const instructionTop = await page.evaluate(() => {
    const el = document.querySelector('li.mk-step textarea.prose-field');
    return Math.round((el.getBoundingClientRect().top + window.scrollY) * 100) / 100;
  });
  await clickUntil(
    page,
    () => page.getByRole('button', { name: 'Step 1, preview the step' }),
    '.mk-preview li.method-step',
    'preview step 1',
  );
  await settle(page);
  const preview = await measurePair(page, '.mk-preview li.method-step', '.method-step__lead');
  await ctx.context.close();
  return { coarse, reading, pen, open, instructionTop, preview };
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
const after = JSON.parse(readFileSync(file, 'utf8'));
const base = JSON.parse(readFileSync(rest[baseIdx + 1], 'utf8'));
let pass = 0;
let fail = 0;
const r2 = (v) => Math.round(v * 100) / 100;
const near = (a, b, tol = TOL) => a !== null && b !== null && Math.abs(a - b) <= tol + 1e-9;
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
    const o = a.open;
    say(
      Math.abs(o.diff) <= 1.0,
      `U1 ${tag}: open step lead-in baseline minus number baseline is ${o.diff} (base ${b.open.diff}); number top ${o.number.top} baseline ${o.number.baseline} ${o.number.fontSize}/${o.number.lineHeight} ${o.number.family}, lead-in top ${o.lead.top} h ${o.lead.height} baseline ${o.lead.baseline} ${o.lead.fontSize}/${o.lead.lineHeight} pad ${o.lead.paddingTop}/${o.lead.paddingBottom} min-h ${o.lead.minHeight}`,
    );
    say(
      near(a.reading.number.top, b.reading.number.top) &&
        near(a.reading.lead.top - b.reading.lead.top, -b.reading.diff) &&
        near(a.reading.diff, 0),
      `U2 ${tag}: reading step number top ${a.reading.number.top}, lead top ${a.reading.lead.top}, diff ${a.reading.diff} (base ${b.reading.number.top}, ${b.reading.lead.top}, ${b.reading.diff})`,
    );
    const aOff = r2(a.preview.lead.top - a.preview.number.top);
    const bOff = r2(b.preview.lead.top - b.preview.number.top);
    say(
      near(aOff, r2(bOff - b.preview.diff)) && near(a.preview.diff, 0),
      `U3 ${tag}: preview lead top minus number top ${aOff} (base ${bOff}), diff ${a.preview.diff} (base ${b.preview.diff})`,
    );
    const move = r2(o.lead.top - b.open.lead.top);
    say(
      cfg.touch ? near(move, 0) : move >= -TOL && move <= 1.0 + 1e-9,
      `U4 ${tag}: lead-in field top ${o.lead.top} (base ${b.open.lead.top}), moved ${move}`,
    );
    const gap = r2(a.instructionTop - o.lead.bottom);
    const bGap = r2(b.instructionTop - b.open.lead.bottom);
    say(near(gap, bGap), `U5 ${tag}: lead-in bottom to instruction top ${gap} (base ${bGap})`);
    say(a.coarse === cfg.touch, `U6 ${tag}: coarse ${a.coarse} equals hasTouch ${cfg.touch}`);
    const penMove = r2(a.pen.lead.top - b.pen.lead.top);
    say(
      near(a.pen.diff, 0) && (cfg.touch ? near(penMove, 0) : penMove >= -TOL && penMove <= 1.0 + 1e-9),
      `U7 ${tag}: pen open step number top ${a.pen.number.top} baseline ${a.pen.number.baseline}, lead-in top ${a.pen.lead.top} baseline ${a.pen.lead.baseline}, diff ${a.pen.diff} (base ${b.pen.diff}), field moved ${penMove}`,
    );
  }
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
