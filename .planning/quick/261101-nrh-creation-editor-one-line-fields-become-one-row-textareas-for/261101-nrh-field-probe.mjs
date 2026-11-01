// Quick 261101-nrh probe: bug-ipad-tab-lost-from-single-line-fields. The creation editor's remaining one-line
// fields (Recipe name, Version name, a step's target label and value, Serving temperature, the twelve style target
// ends, a scale's Name, Low end and High end, a problem's Name, the picker's Name) become one-row textareas, because
// iPadOS 27 Safari drops a hardware Tab from every input element and a textarea takes it. This probe proves, in
// Playwright WebKit and in Chrome (playwright-core chromium, channel 'chrome') on scratch builds of the real app, that
// every switched field looks and focuses as it did.
//
// Configs (all gated): 1366x1024 fine, 1366x1024 coarse, 1366x1024 coarse at DPR 2.
// Groups (--field takes a comma list or all): band, targets, style, cards, picker.
//
// Gates (after against base, per engine, config, field):
//   F0  after is TEXTAREA rows 1 with no type attribute; inputmode decimal on the twelve ends and Serving
//       temperature, absent elsewhere; cols 20 on the two target fields; every other recorded attribute equals
//       base's (Serving temperature's class gains mk-signed-field). Base's tag is printed as INFO.
//   F1  matchMedia('(pointer: coarse)') equals the config's hasTouch
//   E1  (empty pass) / B1 (filled pass): the field's, its parent's, its grandparent's and each sibling's box, and
//       the anchor's height, within 0.5 px (every box is relative to the group's anchor element)
//   C1  computed type, colour, padding, borders, background, radius equal (vertical padding only at a fine pointer:
//       the coarse centring rule is written on the textarea's padding-block, so there it is printed, not compared);
//       on after: resize none, white-space pre, no scrollbar on either axis
//   I1  the field text's ink bounding box within 1 device px
//   K1  :focus-visible and the outline after a click equal
//   N1  Tab lands on the same next control (its name printed as INFO for the device steps)
//   R1  Enter and Shift+Enter change nothing and keep focus, in both builds
//   P1  an insertText with a line feed leaves the two parts joined with nothing between them (after); base printed
//   L1  text typed past the field's width stays one line at the same height and scrolls to the caret
//       (WebKit keeps an input's scroll internal, so its base scrollLeft is 0: printed, not compared)
// The one ruled exception (spec section 3, duty 4, as re-ruled by Mark on 2026-11-01 in
// .impeccable/proposals/2026-11-01-one-line-fields.md, "Mark's ruling on the target widths"): the two target fields
// are narrower than the input by at most 1.5 px in WebKit and 7.5 px in Chrome. The difference is printed as INFO, and the chip's later boxes are compared
// after that shift.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S=/private/tmp/sprinkles-261101-nrh
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir        # at HEAD, before the change
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   node <this file> check "$S/after.json" --base "$S/base.json" [--field band,targets,style,cards,picker|all]
// It starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST through
// 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host. It pins no width and
// restyles nothing: it compares two real builds.
// Everything typed or printed is English. Prints PASS/FAIL/INFO lines and ends "N PASS, M FAIL" (exit 1 on any FAIL).
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

const BOX_TOL = 0.5;
const CONFIGS = [
  { name: '1366 fine', width: 1366, height: 1024, touch: false, dpr: 1 },
  { name: '1366 coarse', width: 1366, height: 1024, touch: true, dpr: 1 },
  { name: '1366 coarse dpr2', width: 1366, height: 1024, touch: true, dpr: 2 },
];
const GROUPS = ['band', 'targets', 'style', 'cards', 'picker'];
// long enough to pass the right edge of the widest field here (the band's 600 px) as well as the narrow ones
const LONG_TEXT = 'The long probe text keeps going past the right edge of this field. '.repeat(4);
const LONG_DIGITS = '1234567890123456';
const ATTRS = [
  'rows',
  'cols',
  'type',
  'inputmode',
  'class',
  'aria-label',
  'aria-describedby',
  'aria-invalid',
  'required',
  'disabled',
  'autocomplete',
  'spellcheck',
  'enterkeyhint',
];

const [, , mode, file, ...rest] = process.argv;
if (mode !== 'record' && mode !== 'check') {
  console.log('FAIL usage: record <out.json> | check <after.json> --base <base.json> [--field band,targets,style,cards,picker|all]');
  process.exit(1);
}

async function clickUntil(page, clickTarget, doneSelector, label) {
  for (let i = 0; i < 4; i += 1) {
    await clickTarget().click();
    try {
      await page.waitForSelector(doneSelector, { timeout: 1500 });
      return;
    } catch {
      // try again: Chrome's first click after a navigation often misses
    }
  }
  throw new Error(`${label}: ${doneSelector} never appeared`);
}

async function focusByClick(page, selector) {
  for (let i = 0; i < 4; i += 1) {
    await page.locator(selector).first().click();
    try {
      await page.waitForFunction((s) => document.activeElement === document.querySelector(s), selector, { timeout: 1500 });
      return;
    } catch {
      // try again
    }
  }
  throw new Error(`could not focus ${selector}`);
}

// A paste-like edit: document.execCommand('insertText') puts the text, line break included, where the caret is.
// (Playwright's keyboard.insertText turns a line feed into an Enter press in WebKit, which is not a paste.)
async function execInsert(page, selector, text) {
  await page.evaluate(
    ({ selector, text }) => {
      const el = document.querySelector(selector);
      el.focus();
      document.execCommand('insertText', false, text);
    },
    { selector, text },
  );
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
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

// Everything the gates read from one field. Every box is relative to the group's anchor element.
function measureField({ selector, anchorSelector, attrs }) {
  const r2 = (v) => Math.round(v * 100) / 100;
  const el = document.querySelector(selector);
  const anchor = document.querySelector(anchorSelector);
  const ar = anchor.getBoundingClientRect();
  const rel = (rect) => ({ left: r2(rect.left - ar.left), top: r2(rect.top - ar.top), width: r2(rect.width), height: r2(rect.height) });
  const parent = el.parentElement;
  const grand = parent.parentElement;
  const siblings = [];
  for (const node of parent.childNodes) {
    if (node === el) continue;
    if (node.nodeType === 1) {
      siblings.push({ kind: 'el', tag: node.tagName, box: rel(node.getBoundingClientRect()) });
    } else if (node.nodeType === 3 && node.textContent.trim() !== '') {
      const range = document.createRange();
      range.selectNodeContents(node);
      siblings.push({ kind: 'text', tag: '#text', box: rel(range.getBoundingClientRect()) });
    }
  }
  const cs = getComputedStyle(el);
  const bw = (side) => parseFloat(cs[`border${side}Width`]);
  const attributes = {};
  for (const name of attrs) attributes[name] = el.getAttribute(name);
  return {
    tag: el.tagName,
    attributes,
    value: el.value,
    box: rel(el.getBoundingClientRect()),
    parentBox: rel(parent.getBoundingClientRect()),
    grandBox: rel(grand.getBoundingClientRect()),
    siblings,
    anchorHeight: r2(ar.height),
    css: {
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      color: cs.color,
      textAlign: cs.textAlign,
      paddingTop: cs.paddingTop,
      paddingRight: cs.paddingRight,
      paddingBottom: cs.paddingBottom,
      paddingLeft: cs.paddingLeft,
      borderTopWidth: cs.borderTopWidth,
      borderRightWidth: cs.borderRightWidth,
      borderBottomWidth: cs.borderBottomWidth,
      borderLeftWidth: cs.borderLeftWidth,
      borderTopColor: cs.borderTopColor,
      backgroundColor: cs.backgroundColor,
      borderRadius: cs.borderRadius,
      resize: cs.resize,
      whiteSpace: cs.whiteSpace,
    },
    scrollbarX: r2(el.offsetHeight - el.clientHeight - bw('Top') - bw('Bottom')),
    scrollbarY: r2(el.offsetWidth - el.clientWidth - bw('Left') - bw('Right')),
  };
}

// The field's text ink within its padding box (inset 2 px so an engine's outward clip rounding never takes in the
// rule), in CSS px from the padding box's top-left. Ink is a pixel any of whose channels differs from the clip's
// top-left pixel by more than 48. The PNG is decoded inside the page, so no npm package is needed.
async function ink(page, selector, dpr) {
  const inset = 2;
  const clip = await page.evaluate(
    ({ selector, inset }) => {
      const el = document.querySelector(selector);
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const bl = parseFloat(cs.borderLeftWidth);
      const br = parseFloat(cs.borderRightWidth);
      const bt = parseFloat(cs.borderTopWidth);
      const bb = parseFloat(cs.borderBottomWidth);
      return {
        x: r.left + bl + inset,
        y: r.top + bt + inset,
        width: r.width - bl - br - 2 * inset,
        height: r.height - bt - bb - 2 * inset,
      };
    },
    { selector, inset },
  );
  const png = await page.screenshot({ clip });
  const box = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
    const bg = [data[0], data[1], data[2]];
    let l = width;
    let t = height;
    let r = -1;
    let b = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        if (
          Math.abs(data[i] - bg[0]) > 48 ||
          Math.abs(data[i + 1] - bg[1]) > 48 ||
          Math.abs(data[i + 2] - bg[2]) > 48
        ) {
          if (x < l) l = x;
          if (x > r) r = x;
          if (y < t) t = y;
          if (y > b) b = y;
        }
      }
    }
    return r < 0 ? null : { l, t, r: r + 1, b: b + 1 };
  }, png.toString('base64'));
  if (!box) return null;
  const r2 = (v) => Math.round(v * 100) / 100;
  return {
    left: r2(inset + box.l / dpr),
    top: r2(inset + box.t / dpr),
    right: r2(inset + box.r / dpr),
    bottom: r2(inset + box.b / dpr),
  };
}

const lightMeasure = (selector) =>
  document.querySelector(selector) &&
  (() => {
    const r2 = (v) => Math.round(v * 100) / 100;
    const el = document.querySelector(selector);
    const cs = getComputedStyle(el);
    const bw = (side) => parseFloat(cs[`border${side}Width`]);
    return {
      value: el.value,
      focused: document.activeElement === el,
      height: r2(el.getBoundingClientRect().height),
      scrollLeft: r2(el.scrollLeft),
      scrollbarX: r2(el.offsetHeight - el.clientHeight - bw('Top') - bw('Bottom')),
      scrollbarY: r2(el.offsetWidth - el.clientWidth - bw('Left') - bw('Right')),
    };
  })();

// The behaviour checks K, N, R, P and L on one field. The field is left holding its filled value, blurred.
async function behave(page, field, filledValue) {
  const sel = field.selector;
  const out = {};
  // K
  await focusByClick(page, sel);
  out.k = await page.evaluate((s) => {
    const el = document.querySelector(s);
    const cs = getComputedStyle(el);
    return { focusVisible: el.matches(':focus-visible'), outline: { style: cs.outlineStyle, width: cs.outlineWidth, offset: cs.outlineOffset } };
  }, sel);
  // N
  await page.keyboard.press('Tab');
  out.n = await page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return 'the page body';
    const label = a.getAttribute('aria-label');
    if (label) return label;
    const text = (a.textContent ?? '').trim();
    if (text) return text.slice(0, 40);
    return `${a.tagName} ${a.getAttribute('class') ?? ''}`.trim();
  });
  // R
  await focusByClick(page, sel);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Enter');
  out.r = await page.evaluate(lightMeasure, sel);
  // P
  await page.locator(sel).first().fill('');
  await execInsert(page, sel, field.decimal ? '1\n2' : 'Probe\ntext');
  out.p = await page.evaluate((s) => document.querySelector(s).value, sel);
  // L
  await page.locator(sel).first().fill('');
  await page.locator(sel).first().focus();
  await page.keyboard.type(field.decimal ? LONG_DIGITS : LONG_TEXT);
  await page.waitForTimeout(200);
  out.l = await page.evaluate(lightMeasure, sel);
  await page.locator(sel).first().fill(filledValue);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  return out;
}

const filledFor = (field) => (field.signed ? '-12.5' : field.decimal ? '12.5' : '12 Wq');

async function recordGroup(page, cfg, fields) {
  const rec = {};
  for (const f of fields) rec[f.key] = { ...f };
  // pass 1, empty: as the flow leaves it
  for (const f of fields) {
    rec[f.key].pass1 = await page.evaluate(measureField, { selector: f.selector, anchorSelector: f.anchor, attrs: ATTRS });
  }
  for (const f of fields) await page.locator(f.selector).first().fill(filledFor(f));
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await settle(page);
  // pass 2, filled
  for (const f of fields) {
    rec[f.key].pass2 = await page.evaluate(measureField, { selector: f.selector, anchorSelector: f.anchor, attrs: ATTRS });
  }
  for (const f of fields) rec[f.key].pass2.ink = await ink(page, f.selector, cfg.dpr);
  for (const f of fields) rec[f.key].behave = await behave(page, f, filledFor(f));
  return rec;
}

async function runConfig(browser, base, cfg) {
  const { context, page } = await openPage(browser, cfg);
  await page.goto(`${base}/notebook`, { waitUntil: 'networkidle' });
  await clickUntil(page, () => page.getByRole('button', { name: 'New recipe' }), 'form[aria-label="New recipe"]', 'open New recipe');
  await page.getByLabel('Name', { exact: true }).fill('Probe sorbet');
  await clickUntil(page, () => page.getByRole('button', { name: 'Start' }), '.mk-page', 'Start');
  await clickUntil(page, () => page.getByRole('button', { name: 'Add step', exact: true }), 'li.mk-step', 'Add step');
  await clickUntil(page, () => page.locator('[aria-label="Step 1, Add target"]'), '[aria-label="Step 1, target label"]', 'Add target');
  await clickUntil(page, () => page.getByRole('button', { name: 'Add scale', exact: true }), '.mk-card[aria-label="Scale 1"]', 'Add scale');
  await clickUntil(page, () => page.getByRole('button', { name: 'Add problem', exact: true }), '.mk-card[aria-label="Problem 1"]', 'Add problem');
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await settle(page);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  const endLabels = await page.evaluate(() =>
    [...document.querySelectorAll('section[aria-label="Style"] .mk-band__ends .ink-field')].map((e) => e.getAttribute('aria-label')),
  );
  if (endLabels.length !== 12) throw new Error(`expected 12 style ends, found ${endLabels.length}`);
  const out = { coarse, groups: {} };

  const mk = (group, name, selector, anchor, extra = {}) => ({ key: `${group}:${name}`, group, name, selector, anchor, ...extra });
  const BAND = 'header.notebook-band';
  const STYLE = 'section[aria-label="Style"]';
  const SCALE = 'section[aria-label="Scales"] .mk-card[aria-label="Scale 1"]';
  const PROBLEM = 'section[aria-label="Problems"] .mk-card[aria-label="Problem 1"]';
  const defs = {
    band: [
      mk('band', 'Recipe name', '.notebook.mk-page [aria-label="Recipe name"]', BAND),
      mk('band', 'Version name', '.notebook.mk-page [aria-label="Version name"]', BAND),
    ],
    targets: [
      mk('targets', 'label', '[aria-label="Step 1, target label"]', 'li.mk-step', { target: 'label' }),
      mk('targets', 'value', '[aria-label="Step 1, target value"]', 'li.mk-step', { target: 'value' }),
    ],
    style: [
      mk('style', 'Serving temperature', '[aria-label="Serving temperature, degrees Celsius"]', STYLE, { decimal: true, signed: true }),
      ...endLabels.map((label) => mk('style', label, `${STYLE} [aria-label=${JSON.stringify(label)}]`, STYLE, { decimal: true })),
    ],
    cards: [
      mk('cards', 'Scale 1 Name', `${SCALE} [aria-label="Name"]`, 'section[aria-label="Scales"]'),
      mk('cards', 'Scale 1 Low end', `${SCALE} [aria-label="Low end"]`, 'section[aria-label="Scales"]'),
      mk('cards', 'Scale 1 High end', `${SCALE} [aria-label="High end"]`, 'section[aria-label="Scales"]'),
      mk('cards', 'Problem 1 Name', `${PROBLEM} [aria-label="Name"]`, 'section[aria-label="Problems"]'),
    ],
  };
  for (const group of ['band', 'targets', 'style', 'cards']) {
    out.groups[group] = await recordGroup(page, cfg, defs[group]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page);
  }
  // the picker last: it opens in the place of Add ingredient
  await clickUntil(page, () => page.locator('.ingredient-table-region .mk-head-act').first(), '.ingredient-table-region .pick', 'Add ingredient');
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await settle(page);
  const picker = [
    mk('picker', 'Name', '.ingredient-table-region .pick .ing__field:not(.ing__field--category) .ink-field', '.pick'),
  ];
  out.groups.picker = await recordGroup(page, cfg, picker);
  await context.close();
  return out;
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
  let launchFailed = false;
  for (const [name, launch] of engines) {
    let browser;
    try {
      browser = await launch();
    } catch (err) {
      console.log(`FAIL ${name} did not launch: ${String(err.message).split('\n')[0]}`);
      launchFailed = true;
      continue;
    }
    out[name] = {};
    for (const cfg of CONFIGS) {
      out[name][cfg.name] = await runConfig(browser, servers.appUrl, cfg);
      console.log(`recorded ${name} ${cfg.name}`);
    }
    await browser.close();
  }
  await servers.close();
  writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`recorded ${Object.keys(out).join(' + ')} to ${file}`);
  process.exit(launchFailed ? 1 : 0);
}

// ---- check
const baseIdx = rest.indexOf('--base');
if (baseIdx < 0 || !rest[baseIdx + 1]) {
  console.log('FAIL check needs --base <base.json>');
  process.exit(1);
}
const fieldIdx = rest.indexOf('--field');
const FIELD_ARG = fieldIdx >= 0 ? rest[fieldIdx + 1] : 'all';
const WANTED = FIELD_ARG === 'all' ? GROUPS : FIELD_ARG.split(',');
if (WANTED.some((g) => !GROUPS.includes(g))) {
  console.log(`FAIL --field must be a comma list of ${GROUPS.join(', ')}, or all`);
  process.exit(1);
}
const after = JSON.parse(readFileSync(file, 'utf8'));
const base = JSON.parse(readFileSync(rest[baseIdx + 1], 'utf8'));
let pass = 0;
let fail = 0;
const near = (a, b, tol = BOX_TOL) => a !== null && b !== null && Math.abs(a - b) <= tol + 1e-9;
const showBox = (b) => `top ${b.top} left ${b.left} w ${b.width} h ${b.height}`;
const showInk = (i) => (i ? `L${i.left} T${i.top} R${i.right} B${i.bottom}` : 'none');
const inkNear = (a, b, dpr) =>
  a !== null && b !== null && ['left', 'top', 'right', 'bottom'].every((k) => Math.abs(a[k] - b[k]) <= 1 / dpr + 1e-9);

// Per (engine, config, group): gate tallies, so the output is one line per group, plus a FAIL line per failed gate.
const tallies = new Map();
const gate = (tallyKey, ok, text) => {
  const t = tallies.get(tallyKey) ?? { pass: 0, fail: 0 };
  tallies.set(tallyKey, t);
  if (ok) {
    t.pass += 1;
    pass += 1;
  } else {
    t.fail += 1;
    fail += 1;
    console.log(`FAIL ${text}`);
  }
};

// A box in after matches its base box, or its base box moved by the ruled target-width difference: boxes right of a
// narrowed target field move left by its difference, and boxes holding it are as much narrower.
function boxMatches(a, b, shifts) {
  const leftShift = shifts.filter((f) => b.left >= f.right - 0.01).reduce((s, f) => s + f.d, 0);
  const shrink = shifts.filter((f) => b.left <= f.left + 0.01 && b.left + b.width >= f.right - 0.01).reduce((s, f) => s + f.d, 0);
  const lefts = [b.left, b.left - leftShift];
  const widths = [b.width, b.width - shrink];
  return lefts.some((x) => near(a.left, x)) && near(a.top, b.top) && widths.some((x) => near(a.width, x)) && near(a.height, b.height);
}

function regionMatches(a, b, shifts) {
  const problems = [];
  if (!boxMatches(a.box, b.box, shifts)) problems.push(`field ${showBox(a.box)} (base ${showBox(b.box)})`);
  if (!boxMatches(a.parentBox, b.parentBox, shifts)) problems.push(`parent ${showBox(a.parentBox)} (base ${showBox(b.parentBox)})`);
  if (!boxMatches(a.grandBox, b.grandBox, shifts)) problems.push(`grandparent ${showBox(a.grandBox)} (base ${showBox(b.grandBox)})`);
  if (a.siblings.length !== b.siblings.length) problems.push(`${a.siblings.length} siblings (base ${b.siblings.length})`);
  else {
    a.siblings.forEach((s, i) => {
      if (!boxMatches(s.box, b.siblings[i].box, shifts)) problems.push(`sibling ${i} ${s.tag} ${showBox(s.box)} (base ${showBox(b.siblings[i].box)})`);
    });
  }
  if (!near(a.anchorHeight, b.anchorHeight)) problems.push(`anchor height ${a.anchorHeight} (base ${b.anchorHeight})`);
  return problems;
}

const CSS_ALWAYS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'color',
  'textAlign',
  'paddingLeft',
  'paddingRight',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopColor',
  'backgroundColor',
  'borderRadius',
];
const CSS_VERTICAL = ['paddingTop', 'paddingBottom'];

for (const engine of ['webkit', 'chrome']) {
  if (!after[engine] || !base[engine]) {
    console.log(`FAIL ${engine} not recorded in both files`);
    fail += 1;
    continue;
  }
  for (const cfg of CONFIGS) {
    const a = after[engine][cfg.name];
    const b = base[engine][cfg.name];
    const tag = `${engine} ${cfg.name}`;
    const fine = !cfg.touch;
    const first = cfg.name === '1366 fine';
    tallies.set(`${tag}|config`, { pass: 0, fail: 0 });
    gate(`${tag}|config`, a.coarse === cfg.touch, `F1 ${tag}: coarse ${a.coarse} should equal hasTouch ${cfg.touch}`);
    for (const group of GROUPS) {
      if (!WANTED.includes(group)) continue;
      const afterGroup = a.groups[group];
      const baseGroup = b.groups[group];
      const tk = `${tag}|${group}`;
      tallies.set(tk, { pass: 0, fail: 0 });
      for (const key of Object.keys(afterGroup)) {
        const af = afterGroup[key];
        const bf = baseGroup[key];
        const name = `${tag} ${group} ${af.name}`;
        // F0
        {
          const x = af.pass2;
          const y = bf.pass2;
          const problems = [];
          if (x.tag !== 'TEXTAREA') problems.push(`tag ${x.tag}`);
          if (x.attributes.rows !== '1') problems.push(`rows ${x.attributes.rows}`);
          if (x.attributes.type !== null) problems.push(`type ${x.attributes.type}`);
          const wantMode = af.decimal ? 'decimal' : null;
          if (x.attributes.inputmode !== wantMode) problems.push(`inputmode ${x.attributes.inputmode} (want ${wantMode})`);
          const wantCols = af.target ? '20' : null;
          if (x.attributes.cols !== wantCols) problems.push(`cols ${x.attributes.cols} (want ${wantCols})`);
          for (const attr of ATTRS) {
            if (['rows', 'cols', 'type', 'inputmode', 'class'].includes(attr)) continue;
            if (x.attributes[attr] !== y.attributes[attr]) problems.push(`${attr} ${x.attributes[attr]} (base ${y.attributes[attr]})`);
          }
          const wantClass = af.signed ? `${y.attributes.class} mk-signed-field` : y.attributes.class;
          if (x.attributes.class !== wantClass) problems.push(`class '${x.attributes.class}' (want '${wantClass}')`);
          gate(tk, problems.length === 0, `F0 ${name}: ${problems.join('; ')}`);
          if (first && engine === 'webkit') console.log(`INFO F0 ${af.group} ${af.name}: base tag ${y.tag}`);
        }
        // the ruled exception: the target fields' width
        let shifts = [];
        const ownShift = [];
        if (group === 'targets') {
          const lo = -0.01;
          const hi = engine === 'webkit' ? 1.51 : 7.51; // Mark's ruling 2026-11-01: WebKit <= 1.5 px, Chrome <= 7.5 px
          for (const pass of ['pass1', 'pass2']) {
            const label = { f: afterGroup['targets:label'][pass].box, g: baseGroup['targets:label'][pass].box };
            const value = { f: afterGroup['targets:value'][pass].box, g: baseGroup['targets:value'][pass].box };
            ownShift.push(
              [pass, [label, value].map((x) => ({ left: x.g.left, right: x.g.left + x.g.width, d: Math.round((x.g.width - x.f.width) * 100) / 100 }))],
            );
          }
          const own = ownShift.find(([pass]) => pass === 'pass2')[1];
          const mine = own[af.target === 'label' ? 0 : 1];
          gate(tk, mine.d >= lo && mine.d <= hi, `W1 ${name}: target width differs by ${mine.d} px (ruled 0 to ${engine === 'webkit' ? 1.5 : 7.5})`);
          if (first) console.log(`INFO W1 ${tag} ${af.name} target field: ${mine.d} px narrower than the input (base w ${baseGroup[key].pass2.box.width}, after w ${af.pass2.box.width})`);
        }
        for (const pass of ['pass1', 'pass2']) {
          if (group === 'targets') shifts = ownShift.find(([p]) => p === pass)[1];
          const problems = regionMatches(af[pass], bf[pass], shifts);
          gate(tk, problems.length === 0, `${pass === 'pass1' ? 'E1' : 'B1'} ${name}: ${problems.join('; ')}`);
        }
        // C1
        {
          const x = af.pass2;
          const y = bf.pass2;
          const keys = fine ? [...CSS_ALWAYS, ...CSS_VERTICAL] : CSS_ALWAYS;
          const diff = keys.filter((k) => x.css[k] !== y.css[k]);
          const afterOnly = x.css.resize === 'none' && x.css.whiteSpace === 'pre' && x.scrollbarX === 0 && x.scrollbarY === 0;
          gate(
            tk,
            diff.length === 0 && afterOnly,
            `C1 ${name}: computed ${diff.length === 0 ? 'equal' : `differs in ${diff.map((k) => `${k} ${x.css[k]} (base ${y.css[k]})`).join(', ')}`}; resize ${x.css.resize}, white-space ${x.css.whiteSpace}, scrollbars ${x.scrollbarX}/${x.scrollbarY}`,
          );
          if (!fine && (x.css.paddingTop !== y.css.paddingTop || x.css.paddingBottom !== y.css.paddingBottom) && engine === 'webkit' && cfg.dpr === 1) {
            console.log(`INFO C1 ${tag} ${af.group} ${af.name}: padding-block ${x.css.paddingTop}/${x.css.paddingBottom} (base ${y.css.paddingTop}/${y.css.paddingBottom}), by the coarse centring rule`);
          }
        }
        // I1
        gate(
          tk,
          inkNear(af.pass2.ink, bf.pass2.ink, cfg.dpr),
          `I1 ${name}: text ink ${showInk(af.pass2.ink)} (base ${showInk(bf.pass2.ink)})`,
        );
        // K1
        gate(
          tk,
          af.behave.k.focusVisible === bf.behave.k.focusVisible && JSON.stringify(af.behave.k.outline) === JSON.stringify(bf.behave.k.outline),
          `K1 ${name}: focus-visible ${af.behave.k.focusVisible} outline ${JSON.stringify(af.behave.k.outline)} (base ${bf.behave.k.focusVisible} ${JSON.stringify(bf.behave.k.outline)})`,
        );
        // N1
        gate(tk, af.behave.n === bf.behave.n, `N1 ${name}: Tab lands on '${af.behave.n}' (base '${bf.behave.n}')`);
        if (first) console.log(`INFO N1 ${tag} ${af.group} ${af.name}: Tab lands on '${af.behave.n}'`);
        // R1
        {
          const fv = filledFor(af);
          const x = af.behave.r;
          const y = bf.behave.r;
          gate(
            tk,
            x.value === fv && y.value === fv && x.focused && y.focused,
            `R1 ${name}: after Enter and Shift+Enter value '${x.value}' focus ${x.focused} (base '${y.value}' ${y.focused})`,
          );
        }
        // P1
        {
          const want = af.decimal ? '12' : 'Probetext';
          gate(tk, af.behave.p === want, `P1 ${name}: insertText with a line feed leaves '${af.behave.p}' (contract '${want}')`);
          if (first) console.log(`INFO P1 ${tag} ${af.group} ${af.name}: base input leaves '${bf.behave.p}'`);
        }
        // L1
        {
          const x = af.behave.l;
          gate(
            tk,
            near(x.height, af.pass2.box.height) && x.scrollLeft > 0 && x.scrollbarX === 0 && x.scrollbarY === 0,
            `L1 ${name}: long text height ${x.height} (filled ${af.pass2.box.height}, base long ${bf.behave.l.height}), scrollLeft ${x.scrollLeft} (base ${bf.behave.l.scrollLeft}), scrollbars ${x.scrollbarX}/${x.scrollbarY}`,
          );
        }
      }
      const t = tallies.get(tk);
      console.log(`${t.fail === 0 ? 'PASS' : 'FAIL'} ${tag} ${group}: ${t.pass} PASS, ${t.fail} FAIL over ${Object.keys(afterGroup).length} field(s)`);
    }
    const c = tallies.get(`${tag}|config`);
    if (c.fail > 0) console.log(`FAIL ${tag}: the coarse media query does not equal hasTouch`);
  }
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
