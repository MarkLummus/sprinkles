// Quick task 261004-uo6's probe: (pen) the record pen's declared defect hairline reads the
// divider; (ring) the phone tab row's focus ring draws inside each stop. Measures the EXISTING
// build (app/dist, read only) in Playwright's WebKit and system Chrome, plus exactly the rules
// read from the edited app/src/styles/notebook.css and shell.css, added to the page with
// addStyleTag. No build, no Vite, never :4173, :5173 or :8011; the harness serves app/dist on
// ephemeral 127.0.0.1 ports. The pen is opened in a throwaway context and never saved.
//
//   node 261004-uo6-probe.mjs pen   (WebKit and Chrome, coarse, 393 / 1024 / 1366: base and +fix)
//   node 261004-uo6-probe.mjs ring  (WebKit and Chrome, coarse, 393 / 723: base and +fix)
//   node 261004-uo6-probe.mjs all   (pen then ring, one server)
//
// A reading here is evidence about two engines, not Mark's iPhone or iPad.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readAllRules } from '../../../app/src/styles/css-source.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STYLES = path.resolve(HERE, '..', '..', '..', 'app', 'src', 'styles');
const MODE = process.argv[2];
if (!['pen', 'ring', 'all'].includes(MODE)) {
  console.error('usage: node 261004-uo6-probe.mjs pen|ring|all');
  process.exit(2);
}
const DO_PEN = MODE === 'pen' || MODE === 'all';
const DO_RING = MODE === 'ring' || MODE === 'all';

const failures = [];
let count = 0;
const ck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;

// ---------------------------------------------------------------------------
// The CSS the probe adds, read from the edited source's own text.
const PEN_SELECTOR = '.notebook-log .axes-grid--stacked > .defect-group--declared';
const RING_SELECTOR = '.shell__tabs > .shell__place:focus, .shell__tabs > .shell__more > .shell__place:focus';
const PHONE_MEDIA = '(max-width: 723.98px)';

let HAIRLINE = '';
let RING = '';
if (DO_PEN) {
  const rules = readAllRules(await readFile(path.join(STYLES, 'notebook.css'), 'utf8'));
  const found = rules.find((r) => r.selector === PEN_SELECTOR && !r.media);
  if (!found) throw new Error(`261004-uo6 probe: top-level rule missing from notebook.css: ${PEN_SELECTOR}`);
  HAIRLINE = `${found.selector} { ${found.declarations.trim()} }`;
}
if (DO_RING) {
  const rules = readAllRules(await readFile(path.join(STYLES, 'shell.css'), 'utf8'));
  const found = rules.find((r) => r.selector === RING_SELECTOR && r.media === PHONE_MEDIA);
  if (!found) throw new Error(`261004-uo6 probe: phone-block rule missing from shell.css: ${RING_SELECTOR}`);
  RING = `@media ${PHONE_MEDIA} {\n${found.selector} { ${found.declarations.trim()} }\n}`;
}

const raf2 = (page) => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
async function addTag(page, css) {
  const handle = await page.addStyleTag({ content: css });
  await raf2(page);
  return handle;
}

// ---------------------------------------------------------------------------
// PEN
const PEN_ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const PEN_SIZES = [
  [393, 852],
  [1024, 1000],
  [1366, 1000],
];

// In-page reader: resolves the two colours, then every border side of every rendered element
// in .notebook-log (the log itself and its descendants), in document order.
function readPen() {
  const resolve = (name) => {
    const d = document.createElement('div');
    d.style.color = `var(${name})`;
    document.body.appendChild(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  };
  const log = document.querySelector('.notebook-log');
  if (!log) throw new Error('no .notebook-log');
  const els = [log, ...log.querySelectorAll('*')].filter((el) => el.getClientRects().length > 0);
  const sides = ['top', 'right', 'bottom', 'left'];
  return {
    ink: resolve('--sheet-ink'),
    divider: resolve('--app-divider'),
    logHeight: log.getBoundingClientRect().height,
    els: els.map((el) => {
      const cs = getComputedStyle(el);
      const b = {};
      for (const s of sides) b[s] = { w: cs.getPropertyValue(`border-${s}-width`), style: cs.getPropertyValue(`border-${s}-style`), color: cs.getPropertyValue(`border-${s}-color`) };
      return { id: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.textContent || '').trim().slice(0, 30)}"`, cls: [...el.classList], b };
    }),
  };
}

async function readPenPage(browser, servers, width, height) {
  const { context, page } = await openApp(browser, servers.appUrl, PEN_ROUTE, { width, height, coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await page.getByRole('button', { name: /record another/i }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /add tasting/i }).first().click();
    await page.waitForTimeout(300);
    await page.waitForSelector('.notebook-log .defect-group--declared');
    const base = await page.evaluate(readPen);
    await addTag(page, HAIRLINE);
    const fix = await page.evaluate(readPen);
    return { base, fix };
  } finally {
    await context.close();
  }
}

const SIDES = ['top', 'right', 'bottom', 'left'];
const drawn = (side) => parseFloat(side.w) > 0 && side.style !== 'none';
const sideStr = (s) => `${s.w} ${s.style} ${s.color}`;

function gatePen(engine, data) {
  const E = engine;
  for (const [width] of PEN_SIZES) {
    const { base, fix } = data[width];
    console.log(`  ${E}@${width} ink=${base.ink} divider=${base.divider} elements=${base.els.length} logHeight base=${base.logHeight} fix=${fix.logHeight}`);
    const inkBase = [];
    for (const el of base.els) for (const s of SIDES) if (drawn(el.b[s]) && el.b[s].color === base.ink) inkBase.push(`${el.id} border-${s} ${sideStr(el.b[s])}`);
    console.log(`  ${E}@${width} base sheet-ink borders in the log: ${inkBase.length === 0 ? 'none' : ''}`);
    for (const line of inkBase) console.log(`      ${line}`);

    const baseDef = base.els.find((e) => e.cls.includes('defect-group--declared'));
    const fixDef = fix.els.find((e) => e.cls.includes('defect-group--declared'));
    const baseAx = base.els.find((e) => e.cls.includes('axes-grid__group--declared'));
    const fixAx = fix.els.find((e) => e.cls.includes('axes-grid__group--declared'));
    console.log(`  ${E}@${width} defect-group--declared top: base ${baseDef ? sideStr(baseDef.b.top) : 'absent'} | +fix ${fixDef ? sideStr(fixDef.b.top) : 'absent'}`);
    console.log(`  ${E}@${width} axes-grid__group--declared top: base ${baseAx ? sideStr(baseAx.b.top) : 'absent'} | +fix ${fixAx ? sideStr(fixAx.b.top) : 'absent'}`);

    // The element-by-element comparison.
    const diffs = [];
    ck(base.els.length === fix.els.length, `G-pen surgical ${E}@${width} same element count (base ${base.els.length}, +fix ${fix.els.length})`);
    base.els.forEach((el, i) => {
      const other = fix.els[i];
      if (!other || other.id !== el.id) {
        diffs.push(`element ${i} differs: ${el.id} vs ${other && other.id}`);
        return;
      }
      for (const s of SIDES) if (sideStr(el.b[s]) !== sideStr(other.b[s])) diffs.push(`${el.id} border-${s}: ${sideStr(el.b[s])} -> ${sideStr(other.b[s])}`);
    });
    console.log(`  ${E}@${width} border differences base -> +fix: ${diffs.length}`);
    for (const d of diffs) console.log(`      ${d}`);

    if (width === 393 || width === 1366) {
      // G0: does the build show the defect?
      ck(!!baseDef && baseDef.b.top.w === '1px' && baseDef.b.top.style === 'solid' && baseDef.b.top.color === base.ink, `G0 ${E}@${width} base .defect-group--declared top is 1px solid --sheet-ink (read ${baseDef ? sideStr(baseDef.b.top) : 'absent'}; ink ${base.ink})`);
      ck(!!baseAx && baseAx.b.top.color === base.divider, `G0 ${E}@${width} base .axes-grid__group--declared top is --app-divider (read ${baseAx ? sideStr(baseAx.b.top) : 'absent'}; divider ${base.divider})`);
      ck(!!fixDef && fixDef.b.top.w === '1px' && fixDef.b.top.style === 'solid' && fixDef.b.top.color === fix.divider, `G-pen ${E}@${width} +fix .defect-group--declared top is 1px solid --app-divider (read ${fixDef ? sideStr(fixDef.b.top) : 'absent'}; divider ${fix.divider})`);
      ck(diffs.length === 1 && baseDef && /defect-group--declared/.test(diffs[0] || '') && / border-top:/.test(diffs[0] || ''), `G-pen surgical ${E}@${width} exactly one border side differs, that group's top (read ${diffs.length})`);
    } else {
      ck(diffs.length === 0, `G-pen surgical ${E}@${width} no border differs at the wide grid (read ${diffs.length})`);
    }
    const stillInk = [];
    for (const el of fix.els) for (const s of SIDES) if (drawn(el.b[s]) && el.b[s].color === fix.ink) stillInk.push(`${el.id} border-${s}`);
    ck(stillInk.length === 0, `G-pen ${E}@${width} +fix no element has a border side in --sheet-ink (read ${stillInk.length}: ${stillInk.join('; ')})`);
    ck(near(base.logHeight, fix.logHeight, 0.01), `G-pen surgical ${E}@${width} log height equal (base ${base.logHeight}, +fix ${fix.logHeight})`);
  }
}

// ---------------------------------------------------------------------------
// RING
const RING_SIZES = [
  [393, 852],
  [723, 1000],
];

function readRing() {
  const r = (n) => Math.round(n * 100) / 100;
  const px = (prop, value) => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:0;top:0;${prop}:${value};border-style:solid`;
    document.body.appendChild(d);
    const cs = getComputedStyle(d);
    const v = parseFloat(prop === 'outline-width' ? cs.outlineWidth : cs.borderTopLeftRadius);
    d.remove();
    return v;
  };
  const stops = [...document.querySelectorAll('.shell__tabs > .shell__place'), ...document.querySelectorAll('.shell__tabs > .shell__more > .shell__place')];
  const out = {
    innerWidth,
    innerHeight,
    widthTok: px('outline-width', 'var(--focus-outline-width)'),
    radiusTok: px('border-radius', 'var(--app-radius-control)'),
    row: null,
    stops: [],
  };
  const rb = document.querySelector('.shell__tabs').getBoundingClientRect();
  out.row = { top: r(rb.top), bottom: r(rb.bottom), left: r(rb.left), right: r(rb.right) };
  for (const el of stops) {
    el.focus();
    const cs = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    const off = parseFloat(cs.outlineOffset);
    const ow = parseFloat(cs.outlineWidth);
    const grow = off + ow;
    out.stops.push({
      name: el.textContent.trim(),
      focused: document.activeElement === el,
      style: cs.outlineStyle,
      width: ow,
      offset: off,
      radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(parseFloat),
      box: { left: r(b.left), top: r(b.top), right: r(b.right), bottom: r(b.bottom) },
      ring: { left: r(b.left - grow), top: r(b.top - grow), right: r(b.right + grow), bottom: r(b.bottom + grow) },
    });
    el.blur();
  }
  return out;
}

async function readListOffset(page) {
  await page.locator('.shell__more > summary').click();
  await page.waitForSelector('.shell__more[open]');
  const off = await page.evaluate(() => {
    const el = document.querySelector('.shell__more li .shell__place');
    el.focus();
    const v = parseFloat(getComputedStyle(el).outlineOffset);
    el.blur();
    return v;
  });
  await page.locator('.shell__more > summary').click();
  await page.waitForFunction(() => !document.querySelector('.shell__more[open]'));
  return off;
}

async function cropMore(page, engine, state) {
  await page.evaluate(() => document.querySelector('.shell__tabs > .shell__more > .shell__place').focus());
  await raf2(page);
  const file = path.join(os.tmpdir(), `uo6-more-${engine}-${state}.png`);
  const h = page.viewportSize().height;
  await page.screenshot({ path: file, clip: { x: 0, y: h - 72, width: page.viewportSize().width, height: 72 } });
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  return file;
}

async function readRingPage(browser, servers, engine, width, height) {
  const { context, page } = await openApp(browser, servers.appUrl, '/', { width, height, coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await page.waitForSelector('.shell__tabs .shell__more');
    await page.waitForTimeout(150);
    const out = { shots: {} };
    out.base = await page.evaluate(readRing);
    out.baseList = await readListOffset(page);
    if (width === 393) out.shots.base = await cropMore(page, engine, 'base');
    await addTag(page, RING);
    out.fix = await page.evaluate(readRing);
    out.fixList = await readListOffset(page);
    if (width === 393) out.shots.fix = await cropMore(page, engine, 'fix');
    return out;
  } finally {
    await context.close();
  }
}

const bx = (b) => `[${b.left},${b.top} - ${b.right},${b.bottom}]`;

function gateRing(engine, data) {
  const E = engine;
  for (const [width] of RING_SIZES) {
    const d = data[width];
    console.log(`  ${E}@${width} window ${d.base.innerWidth}x${d.base.innerHeight}, tab row ${bx(d.base.row)}, --focus-outline-width ${d.base.widthTok}px, --app-radius-control ${d.base.radiusTok}px`);
    for (const state of ['base', 'fix']) {
      for (const s of d[state].stops) {
        console.log(`    ${E}@${width} ${state === 'fix' ? '+fix' : 'base'} ${s.name.padEnd(12)} focused=${s.focused} ${s.style} w=${s.width} off=${s.offset} radii=${s.radii.join('/')} box=${bx(s.box)} ring=${bx(s.ring)}`);
      }
    }
    console.log(`  ${E}@${width} More list item outline-offset base ${d.baseList} +fix ${d.fixList}`);
    if (d.shots.base) console.log(`  ${E}@${width} screenshot crops: ${d.shots.base} | ${d.shots.fix}`);

    if (width === 393) {
      const more = d.base.stops[d.base.stops.length - 1];
      ck(more.ring.right > d.base.innerWidth || more.ring.bottom > d.base.innerHeight, `G0 ${E}@393 base More's ring box passes the window (ring ${bx(more.ring)}, window ${d.base.innerWidth}x${d.base.innerHeight})`);
    }
    d.fix.stops.forEach((s, i) => {
      const b = d.base.stops[i];
      const tag = `G-ring ${E}@${width} +fix ${s.name}`;
      ck(s.focused, `${tag} is focused`);
      ck(s.style === 'solid', `${tag} outline is solid (read ${s.style})`);
      ck(near(s.width, d.fix.widthTok, 0.01), `${tag} outline-width equals --focus-outline-width (read ${s.width}, token ${d.fix.widthTok})`);
      ck(near(s.offset + s.width, 0, 0.01), `${tag} outline-offset plus width is 0 (offset ${s.offset}, width ${s.width})`);
      ck(s.radii.every((x) => near(x, d.fix.radiusTok, 0.01)), `${tag} four corner radii equal --app-radius-control (read ${s.radii.join('/')}, token ${d.fix.radiusTok})`);
      ck(s.ring.left >= -0.01 && s.ring.right <= d.fix.innerWidth + 0.01, `${tag} ring lies across the window (ring ${s.ring.left} to ${s.ring.right}, window ${d.fix.innerWidth})`);
      ck(s.ring.top >= d.fix.row.top - 0.01 && s.ring.bottom <= d.fix.innerHeight + 0.01, `${tag} ring lies inside the tab row and window down (ring ${s.ring.top} to ${s.ring.bottom}, row top ${d.fix.row.top}, window ${d.fix.innerHeight})`);
      ck(['left', 'top', 'right', 'bottom'].every((k) => near(s.box[k], b.box[k], 0.01)), `${tag} box equals base (base ${bx(b.box)}, +fix ${bx(s.box)})`);
    });
    ck(near(d.fixList, d.baseList, 0.01), `G-list ${E}@${width} More list item outline-offset equals base (base ${d.baseList}, +fix ${d.fixList})`);
  }
}

// ---------------------------------------------------------------------------
async function runEngine(engine, browser, servers) {
  if (DO_PEN) {
    const data = {};
    for (const [w, h] of PEN_SIZES) data[w] = await readPenPage(browser, servers, w, h);
    gatePen(engine, data);
  }
  if (DO_RING) {
    const data = {};
    for (const [w, h] of RING_SIZES) data[w] = await readRingPage(browser, servers, engine, w, h);
    gateRing(engine, data);
  }
}

const servers = await startServers();
try {
  const wk = await webkit.launch();
  try {
    console.log('--- WebKit (coarse) ---');
    await runEngine('webkit', wk, servers);
  } finally {
    await wk.close();
  }
  const ch = await launch();
  try {
    console.log('--- Chrome (coarse) ---');
    await runEngine('chrome', ch, servers);
  } finally {
    await ch.close();
  }
} finally {
  await servers.close();
}
finish(failures, count, `261004-uo6 probe (${MODE})`);
