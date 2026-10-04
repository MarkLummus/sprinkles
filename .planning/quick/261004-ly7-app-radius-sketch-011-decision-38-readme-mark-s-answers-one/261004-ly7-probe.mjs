// Quick task 261004-ly7's probe: sketch 011 decision 38 B (Mark 2026-10-04), one 10px
// App radius, the active rail place in weight 600, the phone tab row with the radius.
// Measures the BUILT app (app/dist) in Playwright's WebKit and system Chrome, against a
// pre-change baseline and against row B, the weight panels and the focus panels of the
// board app-radius.html.
//
//   node 261004-ly7-probe.mjs baseline   (build of the unchanged source; writes the JSON)
//   node 261004-ly7-probe.mjs rail       (every cell vs the baseline: places, weight, focus ring, boxes)
//   node 261004-ly7-probe.mjs controls   (rail's checks plus the pen's fields, the actions and the lead block)
//   node 261004-ly7-probe.mjs board      (the 1600 cells vs row B / wt / focus panels of app-radius.html)
//   groups combine with commas: rail,controls,board
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never
// requests Mark's :4173 preview, the dev server on :5173 or the sketch server on :8011,
// and starts no Vite process. The pen opens in a throwaway browser context and nothing is
// saved, so nothing reaches Mark's IndexedDB. A reading here is evidence about two
// engines, not about Mark's iPhone or iPad.
import { readFile, writeFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-ly7-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const rectNear = (a, b) => !!a && !!b && near(a.x, b.x) && near(a.y, b.y) && near(a.w, b.w) && near(a.h, b.h);
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);
const all = (radii, value) => Array.isArray(radii) && radii.length === 4 && radii.every((r) => r === value);

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];
const WIDTHS = [393, 744, 1024, 1366, 1600];
const RAIL_WIDTHS = [1024, 1366, 1600];
// Sid's convention: WebKit is coarse up to 1366 and fine above; Chrome is always fine.
const coarseFor = (engine, width) => engine === 'webkit' && width <= 1366;
const ROUTES = {
  home: { path: '/', ready: '.home__lead' },
  mex3: { path: '/notebook/mexican-chocolate/mexican-chocolate-v3', ready: '.notebook' },
};

async function openApp(browser, appUrl, route, { width, coarse }) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route.path, { waitUntil: 'networkidle' });
  await page.waitForSelector(route.ready);
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openApp: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route.path}`);
  }
  return { context, page };
}

// ===========================================================================
// In-page reader. spec.root is a selector for a board panel's inner div, or null for the
// app (document). Runs in the page; self-contained.
async function readShell(spec) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const root = spec.root ? document.querySelector(spec.root) : document;
  if (!root) throw new Error(`no root for ${JSON.stringify(spec)}`);
  const shown = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  const rr = (e) => {
    const b = e.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  };
  const radii = (e) => {
    const cs = getComputedStyle(e);
    return [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius];
  };
  const place = (e) => {
    const cs = getComputedStyle(e);
    const slugClass = [...e.classList].find((c) => c.startsWith('shell__place--'));
    return {
      slug: slugClass ? slugClass.replace('shell__place--', '') : e.tagName === 'SUMMARY' ? 'more' : e.textContent.replace(/\s+/g, ' ').trim().toLowerCase(),
      text: e.textContent.replace(/\s+/g, ' ').trim(),
      rect: rr(e),
      radii: radii(e),
      fontWeight: cs.fontWeight,
      background: cs.backgroundColor,
      current: e.getAttribute('aria-current'),
    };
  };
  const box = (e) => ({ rect: rr(e), radii: radii(e) });
  const list = (selector, fn) => [...root.querySelectorAll(selector)].filter(shown).map(fn);

  const out = {
    rail: list('.shell__rail .shell__place', place),
    tabs: list('.shell__tabs > .shell__place, .shell__tabs .shell__more > summary', place),
    tools: list('.shell__tools > .shell__place', place),
    actions: [...root.querySelectorAll('.notebook-action, .notebook-action--outline')].filter((e) => shown(e) && !e.closest('.notebook-ceremony')).map(box),
    lead: null,
    leadActions: list('.home__lead .home__action', box),
    homeActions: list('.home__action', box),
    ceremony: null,
  };
  const lead = root.querySelector('.home__lead');
  if (lead && shown(lead)) out.lead = box(lead);
  const cer = root.querySelector('.notebook-ceremony');
  if (cer) {
    out.ceremony = {
      fields: [...cer.querySelectorAll('.notebook-field .ink-field, .notebook-field input, .notebook-field textarea')].filter(shown).map((e) => ({ tag: e.tagName.toLowerCase(), ...box(e) })),
      acts: [...cer.querySelectorAll('.notebook-action, .notebook-action--outline')].filter(shown).map(box),
    };
  }
  if (!spec.root) out.overflow = document.documentElement.scrollWidth - window.innerWidth;
  return out;
}

// One-pixel read of the focus ring's outer top-left corner. The ring is a 2px outline drawn
// 2px outside the box, so the pixel at (left - 3, top - 3) is inside a square ring and
// outside a ring that follows a 10px radius. clip is in document coordinates with fullPage.
async function focusPixel(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const geo = await locator.evaluate((e) => {
    const b = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return { left: b.left + scrollX, top: b.top + scrollY, outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineOffset: cs.outlineOffset };
  });
  const png = await page.screenshot({ type: 'png', fullPage: true, clip: { x: Math.floor(geo.left) - 3, y: Math.floor(geo.top) - 3, width: 1, height: 1 } });
  return { ...geo, pixel: classify(decodeOnePixel(png)) };
}
function decodeOnePixel(png) {
  let off = 8;
  const idat = [];
  let colorType = 6;
  while (off < png.length) {
    const len = png.readUInt32BE(off);
    const type = png.toString('latin1', off + 4, off + 8);
    if (type === 'IHDR') colorType = png[off + 8 + 9];
    if (type === 'IDAT') idat.push(png.subarray(off + 8, off + 8 + len));
    off += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const px = [...raw.subarray(1, 1 + bpp)];
  return px.length >= 3 ? px.slice(0, 3) : [px[0], px[0], px[0]];
}
function classify([r, g, b]) {
  const mean = (r + g + b) / 3;
  return { rgb: [r, g, b], class: mean < 90 ? 'ring' : mean > 180 ? 'ground' : 'mixed' };
}

// Measures one app cell: the page reading, the focus ring at rail widths on mex3, then
// (mex3) the pen's reading. Returns the merged reading.
async function measureCell(browser, servers, width, coarse, routeName) {
  const { context, page } = await openApp(browser, servers.appUrl, ROUTES[routeName], { width, coarse });
  try {
    const reading = await page.evaluate(readShell, { root: null });
    reading.focus = null;
    if (routeName === 'mex3' && RAIL_WIDTHS.includes(width)) {
      const target = page.locator('.shell__rail .shell__place--recipe-book');
      await target.focus();
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      reading.focus = await focusPixel(page, target);
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
    }
    if (routeName === 'mex3') {
      await page.getByRole('button', { name: 'Next version' }).first().click();
      await page.waitForSelector('form.notebook-ceremony');
      const pen = await page.evaluate(readShell, { root: null });
      reading.ceremony = pen.ceremony;
    }
    return reading;
  } finally {
    await context.close();
  }
}

const keyOf = (engine, width, routeName) => `${engine}|${width}|${routeName}`;

async function measureAll(servers) {
  const readings = {};
  for (const [engine, start] of engines) {
    const browser = await start();
    try {
      for (const width of WIDTHS) {
        for (const routeName of Object.keys(ROUTES)) {
          readings[keyOf(engine, width, routeName)] = await measureCell(browser, servers, width, coarseFor(engine, width), routeName);
        }
      }
    } finally {
      await browser.close();
    }
  }
  return readings;
}

const parseKey = (key) => {
  const [engine, width, routeName] = key.split('|');
  return { engine, width: Number(width), routeName };
};

// ===========================================================================
// Baseline: the as-shipped precondition.
function baselineChecks(key, r) {
  const radiiOf = (list) => list.every((p) => all(p.radii, '0px'));
  countedCheck(radiiOf(r.rail) && radiiOf(r.tabs) && radiiOf(r.tools), `${key}: as shipped, every rail, tab and tools place is square`);
  countedCheck(r.rail.every((p) => p.fontWeight === '400'), `${key}: as shipped, every rail place is weight 400 (${r.rail.map((p) => p.fontWeight).join(',')})`);
  if (r.ceremony) countedCheck(r.ceremony.fields.length > 0 && r.ceremony.fields.every((f) => all(f.radii, '8px')), `${key}: as shipped, every ceremony field is 8px (${r.ceremony.fields.map((f) => f.radii[0]).join(',')})`);
  const tens = [...r.actions, ...(r.lead ? [r.lead] : []), ...r.homeActions, ...(r.ceremony ? r.ceremony.acts : [])];
  countedCheck(tens.every((b) => all(b.radii, '10px')), `${key}: as shipped, every action and the lead block is 10px`);
  if (r.focus) countedCheck(r.focus.pixel.class === 'ring', `${key}: as shipped, the focus pixel reads the ring (${r.focus.pixel.class} ${r.focus.pixel.rgb})`);
}

// ===========================================================================
// rail: every cell against the baseline.
function railChecks(key, base, cur) {
  for (const kind of ['rail', 'tabs', 'tools']) {
    countedCheck(cur[kind].length === base[kind].length, `${key}: ${kind} place count ${cur[kind].length} vs baseline ${base[kind].length}`);
    cur[kind].forEach((p, i) => {
      const b = base[kind][i];
      if (!b) return;
      countedCheck(p.slug === b.slug, `${key}: ${kind}[${i}] slug ${p.slug} vs ${b.slug}`);
      countedCheck(all(p.radii, '10px'), `${key}: ${kind} ${p.slug} radii ${p.radii.join(' ')}`);
      countedCheck(rectNear(p.rect, b.rect), `${key}: ${kind} ${p.slug} box ${JSON.stringify(p.rect)} vs baseline ${JSON.stringify(b.rect)}`);
      countedCheck(p.background === b.background, `${key}: ${kind} ${p.slug} background ${p.background} vs baseline ${b.background}`);
      if (kind === 'rail') countedCheck(p.fontWeight === (p.current === 'page' ? '600' : '400'), `${key}: rail ${p.slug} weight ${p.fontWeight} (current ${p.current})`);
      else countedCheck(p.fontWeight === b.fontWeight, `${key}: ${kind} ${p.slug} weight ${p.fontWeight} vs baseline ${b.fontWeight}`);
    });
  }
  if (cur.rail.length) countedCheck(cur.rail.filter((p) => p.current === 'page').length === 1, `${key}: exactly one active rail place`);
  if (base.focus) {
    countedCheck(!!cur.focus && cur.focus.pixel.class === 'ground', `${key}: focus pixel ${cur.focus && cur.focus.pixel.class} ${cur.focus && cur.focus.pixel.rgb}, wanted ground`);
    if (cur.focus) {
      for (const k of ['outlineStyle', 'outlineWidth', 'outlineOffset']) countedCheck(cur.focus[k] === base.focus[k], `${key}: focus ${k} ${cur.focus[k]} vs baseline ${base.focus[k]}`);
    }
  }
  countedCheck(cur.overflow === base.overflow, `${key}: overflow ${cur.overflow} vs baseline ${base.overflow}`);
  boxChecks(key, base, cur);
}

// Every action, lead, home action and pen reading keeps its box.
function boxChecks(key, base, cur) {
  const pairs = (name, a, b) => {
    countedCheck(a.length === b.length, `${key}: ${name} count ${a.length} vs baseline ${b.length}`);
    a.forEach((x, i) => b[i] && countedCheck(rectNear(x.rect, b[i].rect), `${key}: ${name}[${i}] box ${JSON.stringify(x.rect)} vs baseline ${JSON.stringify(b[i].rect)}`));
  };
  pairs('actions', cur.actions, base.actions);
  pairs('lead actions', cur.leadActions, base.leadActions);
  pairs('home actions', cur.homeActions, base.homeActions);
  if (base.lead) countedCheck(rectNear(cur.lead && cur.lead.rect, base.lead.rect), `${key}: lead box`);
  if (base.ceremony) {
    countedCheck(!!cur.ceremony, `${key}: ceremony present`);
    if (cur.ceremony) {
      pairs('ceremony fields', cur.ceremony.fields, base.ceremony.fields);
      pairs('ceremony actions', cur.ceremony.acts, base.ceremony.acts);
    }
  }
}

// controls: the new radii on the pen, the actions and the lead block, plus the rail checks.
function controlsChecks(key, base, cur) {
  railChecks(key, base, cur);
  const tens = (name, list) => countedCheck(list.every((b) => all(b.radii, '10px')), `${key}: ${name} radii ${list.map((b) => b.radii[0]).join(',')}`);
  tens('actions', cur.actions);
  tens('lead actions', cur.leadActions);
  tens('home actions', cur.homeActions);
  if (cur.lead) tens('lead', [cur.lead]);
  if (base.ceremony && cur.ceremony) {
    cur.ceremony.fields.forEach((f, i) => {
      const was = base.ceremony.fields[i].radii;
      countedCheck(all(was, '8px') ? all(f.radii, '10px') : JSON.stringify(f.radii) === JSON.stringify(was), `${key}: ceremony field[${i}] ${f.tag} radii ${f.radii.join(' ')} (was ${was.join(' ')})`);
    });
    tens('ceremony actions', cur.ceremony.acts);
  }
}

function summarize(key, base, cur) {
  const active = cur.rail.find((p) => p.current === 'page');
  const baseActive = base && base.rail.find((p) => p.current === 'page');
  const activeTab = cur.tabs.find((p) => p.current === 'page');
  const baseActiveTab = base && base.tabs.find((p) => p.current === 'page');
  const first = (list) => (list.length ? list[0].radii[0] : null);
  return {
    cell: key,
    rail: cur.rail.length ? { radius: first(cur.rail), activeWeight: active && active.fontWeight, otherWeights: [...new Set(cur.rail.filter((p) => p.current !== 'page').map((p) => p.fontWeight))], before: baseActive ? { radius: first(base.rail), activeWeight: baseActive.fontWeight } : null } : null,
    tabs: cur.tabs.length ? { radius: first(cur.tabs), activeBg: activeTab && activeTab.background, activeWeight: activeTab && activeTab.fontWeight, before: baseActiveTab ? { radius: first(base.tabs), activeBg: baseActiveTab.background, activeWeight: baseActiveTab.fontWeight } : null } : null,
    tools: cur.tools.length ? first(cur.tools) : null,
    field: cur.ceremony && cur.ceremony.fields.length ? [...new Set(cur.ceremony.fields.map((f) => f.radii[0]))] : null,
    fieldBefore: base && base.ceremony ? [...new Set(base.ceremony.fields.map((f) => f.radii[0]))] : null,
    actions: [...new Set([...cur.actions, ...(cur.ceremony ? cur.ceremony.acts : [])].map((b) => b.radii[0]))],
    lead: cur.lead ? cur.lead.radii[0] : null,
    homeActions: cur.homeActions.length ? [...new Set(cur.homeActions.map((b) => b.radii[0]))] : null,
    focus: cur.focus ? { pixel: cur.focus.pixel.class, rgb: cur.focus.pixel.rgb, before: base && base.focus ? base.focus.pixel.class : null } : null,
    overflow: cur.overflow,
  };
}

// ===========================================================================
async function runBaseline(servers) {
  const readings = await measureAll(servers);
  for (const [key, r] of Object.entries(readings)) baselineChecks(key, r);
  if (failures.length > 0) {
    console.log('baseline NOT written: the as-shipped precondition failed');
    return;
  }
  await writeFile(BASELINE_PATH, JSON.stringify(readings, null, 1) + '\n');
  console.log(`baseline written: ${Object.keys(readings).length} cells`);
}

async function loadBaseline() {
  return JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
}

async function runCompare(servers, group, readingsCache) {
  const baseline = await loadBaseline();
  const readings = readingsCache.all ?? (readingsCache.all = await measureAll(servers));
  for (const [key, cur] of Object.entries(readings)) {
    const base = baseline[key];
    countedCheck(!!base, `${key}: baseline present`);
    if (!base) continue;
    (group === 'rail' ? railChecks : controlsChecks)(key, base, cur);
    if (group === 'controls') console.log(JSON.stringify(summarize(key, base, cur)));
  }
}

// ===========================================================================
// board: the 1600 cells vs row B, the weight panels and the focus panels of app-radius.html.
const PANEL = (cls) => `.${cls} > div`;

async function boardReadings(browser, servers) {
  const { context, page } = await openBoard(browser, servers.repoUrl, 'app-radius.html');
  try {
    const out = {};
    for (const name of ['fp-B-pen-rail', 'fp-B-home-rail', 'fp-wt-pen-rail', 'fp-wt-home-rail', 'fp-B-pen-cer', 'fp-B-home-lead']) {
      out[name] = await page.evaluate(readShell, { root: PANEL(name) });
    }
    for (const name of ['fp-focus-all-pen-rail', 'fp-focus-one-pen-rail']) {
      const target = page.locator(`.${name} .shell__rail .shell__place--recipe-book`);
      out[name] = await focusPixel(page, target);
    }
    return out;
  } finally {
    await context.close();
  }
}

// Radii always; sizes only for the rail places, where the plan names width and height. A
// ceremony field or the lead block is a different height on the board (the board draws the
// touch floor and its own captured content), so its size is printed, not checked.
function sameRadiiAndSize(label, app, panel, { sizes = false } = {}) {
  countedCheck(app.length === panel.length, `${label}: count app ${app.length} vs board ${panel.length}`);
  app.forEach((a, i) => {
    const p = panel[i];
    if (!p) return;
    countedCheck(JSON.stringify(a.radii) === JSON.stringify(p.radii), `${label}[${i}]: radii app ${a.radii.join(' ')} vs board ${p.radii.join(' ')}`);
    if (a.rect && p.rect && sizes) countedCheck(near(a.rect.w, p.rect.w) && near(a.rect.h, p.rect.h), `${label}[${i}]: size app ${round(a.rect.w)}x${round(a.rect.h)} vs board ${round(p.rect.w)}x${round(p.rect.h)}`);
  });
}

async function runBoard(servers) {
  for (const [engine, start] of engines) {
    const browser = await start();
    try {
      const board = await boardReadings(browser, servers);
      const pen = await measureCell(browser, servers, 1600, coarseFor(engine, 1600), 'mex3');
      const home = await measureCell(browser, servers, 1600, coarseFor(engine, 1600), 'home');
      const key = `${engine}|1600`;
      // Controls: the board draws the ring statically; focus-one is square, focus-all follows the radius.
      countedCheck(board['fp-focus-one-pen-rail'].pixel.class === 'ring', `${key}: board focus-one pixel ${board['fp-focus-one-pen-rail'].pixel.class} ${board['fp-focus-one-pen-rail'].pixel.rgb}, wanted ring (control)`);
      countedCheck(board['fp-focus-all-pen-rail'].pixel.class === 'ground', `${key}: board focus-all pixel ${board['fp-focus-all-pen-rail'].pixel.class} ${board['fp-focus-all-pen-rail'].pixel.rgb}, wanted ground (control)`);
      countedCheck(!!pen.focus && pen.focus.pixel.class === board['fp-focus-all-pen-rail'].pixel.class, `${key}: app focus pixel ${pen.focus && pen.focus.pixel.class} vs board focus-all ${board['fp-focus-all-pen-rail'].pixel.class}`);
      // Rail places.
      sameRadiiAndSize(`${key}: rail (Notebook active) vs B`, pen.rail, board['fp-B-pen-rail'].rail, { sizes: true });
      sameRadiiAndSize(`${key}: rail (Home active) vs B`, home.rail, board['fp-B-home-rail'].rail, { sizes: true });
      // Weights, from the weight panels.
      for (const [label, app, panel] of [['Notebook active', pen.rail, board['fp-wt-pen-rail'].rail], ['Home active', home.rail, board['fp-wt-home-rail'].rail]]) {
        countedCheck(app.length === panel.length, `${key}: weight panel ${label} place count`);
        app.forEach((a, i) => panel[i] && countedCheck(a.fontWeight === panel[i].fontWeight, `${key}: weight ${label} ${a.slug} app ${a.fontWeight} vs board ${panel[i].fontWeight}`));
      }
      // The ceremony and the lead block.
      sameRadiiAndSize(`${key}: ceremony fields vs B`, pen.ceremony.fields, board['fp-B-pen-cer'].ceremony.fields);
      sameRadiiAndSize(`${key}: ceremony actions vs B`, pen.ceremony.acts, board['fp-B-pen-cer'].ceremony.acts);
      sameRadiiAndSize(`${key}: lead vs B`, [home.lead], [board['fp-B-home-lead'].lead]);
      sameRadiiAndSize(`${key}: lead actions vs B`, home.leadActions, board['fp-B-home-lead'].leadActions);
      console.log(JSON.stringify({
        cell: `${key}|board`,
        appRail: pen.rail.map((p) => [p.slug, p.radii[0], `${round(p.rect.w)}x${round(p.rect.h)}`, p.fontWeight]),
        boardRail: board['fp-B-pen-rail'].rail.map((p) => [p.slug, p.radii[0], `${round(p.rect.w)}x${round(p.rect.h)}`, p.fontWeight]),
        boardWeightActive: [board['fp-wt-pen-rail'].rail.find((p) => p.current === 'page')?.fontWeight, board['fp-wt-home-rail'].rail.find((p) => p.current === 'page')?.fontWeight],
        boardFocus: { all: board['fp-focus-all-pen-rail'].pixel, one: board['fp-focus-one-pen-rail'].pixel },
        appFocus: pen.focus && pen.focus.pixel,
        boardCeremony: [...new Set(board['fp-B-pen-cer'].ceremony.fields.map((f) => f.radii[0]))],
        boardActions: [...new Set(board['fp-B-pen-cer'].ceremony.acts.map((f) => f.radii[0]))],
        boardLead: board['fp-B-home-lead'].lead && board['fp-B-home-lead'].lead.radii[0],
        sizesNotChecked: { appField: pen.ceremony.fields[0].rect, boardField: board['fp-B-pen-cer'].ceremony.fields[0].rect, appLead: home.lead.rect, boardLead: board['fp-B-home-lead'].lead.rect },
      }));
    } finally {
      await browser.close();
    }
  }
  console.log('tab row: the board draws no tab row; the radius there rests on Mark\'s answer 3 (the shipped surface block, with the radius)');
}

// ===========================================================================
const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
const known = ['baseline', 'rail', 'controls', 'board'];
if (groups.length === 0 || groups.some((g) => !known.includes(g))) {
  console.log(`usage: node 261004-ly7-probe.mjs ${known.join('|')}[,...]`);
  process.exit(2);
}
const servers = await startServers();
try {
  const cache = {};
  for (const g of groups) {
    if (g === 'baseline') await runBaseline(servers);
    else if (g === 'board') await runBoard(servers);
    else await runCompare(servers, g, cache);
  }
} finally {
  await servers.close();
}
finish(failures, count, `261004-ly7 probe (${groups.join(',')})`);
