// Quick 261101-nrk probe: bug-ipad-tab-lost-from-single-line-fields. The three place fields outside the creation
// editor and the pens (Sheet code on the Search place, New recipe Name on the Notebook, the Name filter on the
// Ingredients place) become one-row textareas, because iPadOS 27 Safari drops a hardware Tab from every input element
// and a textarea takes it. Return in Sheet code and New recipe Name still submits their form exactly as an input's
// implicit submission did; Return in the Ingredients filter submits nothing. This probe proves, in Playwright WebKit and
// in Chrome (playwright-core chromium, channel 'chrome') on scratch builds of the real app, that every field looks,
// focuses and submits as it did.
//
// Configs (all gated): 1366x1024 fine, 1366x1024 coarse, 1366x1024 coarse at DPR 2, 393x852 coarse at DPR 3.
// Groups (--field takes a comma list or all): search, notebook, ingredients.
// Flow per config, in one context: /search, then /ingredients, then /notebook last (its last Return starts a recipe).
// Passes per field: E empty, F filled, then K (focus ring), N (Tab), P (paste), L (long text), R (Return checks).
//
// Gates (after against base, per engine, config, field):
//   F0  after is TEXTAREA rows 1, no type attribute; cols 20 on search and absent elsewhere; every other recorded
//       attribute equals base's. Base's tag is INFO.
//   F1  matchMedia('(pointer: coarse)') equals the config's hasTouch
//   E1 / B1  (pass E / pass F) the field's, its parent's, its grandparent's, each sibling's and each named
//       neighbour's box, and the anchor's height, within 0.5 px. A parent whose display differs between builds is
//       compared by left and width only (INFO). A neighbour with display: contents has no box, only that is compared.
//   C1  computed type, colour, horizontal padding, borders, background, radius, min-height, box-sizing equal; on after:
//       resize none, white-space pre, overflow hidden on both axes, no scrollbar on either axis
//   C2  at a fine pointer the vertical padding equals base's; at a coarse pointer after's top and bottom are equal
//       within 0.01 px (both builds' vertical padding is INFO; search's field-sizing is INFO)
//   I1  the field text's ink box within 1 device px (pass F)
//   K1  :focus-visible and the outline after a click equal
//   N1  Tab lands on the same next control (its name is INFO for the device steps)
//   P1  an insertText with a line feed leaves the two parts joined with nothing between them, no submit event;
//       base's value and count are INFO
//   L1  long text stays one line at the filled height and scrolls to the caret, no scrollbar on either axis
//   L2  in pass L every recorded box and the anchor height is within 0.5 px of base's (Find stays beside Sheet code)
//   R1  Enter, Shift+Enter, Control+Enter, Alt+Enter and Meta+Enter: value unchanged with no line break, focus kept,
//       pathname, status or line text and aria-invalid equal base's; for search and notebook the submit count also
//       equals base's; for ingredients after's submit count is 0 for every press (base's is INFO)
//   R2  search: a well-formed unknown code stays on /search with 'No version has this code.' in both builds;
//       notebook: the refused state's boxes are within 0.5 px
//   R3  notebook: Return over a typed name lands on /notebook/new with that Recipe name in both builds
// Long-text ink is never compared.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S=/private/tmp/sprinkles-261101-nrk
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir        # before the change
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   node <this file> check "$S/after.json" --base "$S/base.json" [--field search,notebook,ingredients|all]
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
  { name: '393 coarse dpr3', width: 393, height: 852, touch: true, dpr: 3 },
];
const GROUPS = ['search', 'notebook', 'ingredients'];
const LONG_TEXT = 'The long probe text keeps going past the right edge of this field. '.repeat(4);
const KEYS = ['Enter', 'Shift+Enter', 'Control+Enter', 'Alt+Enter', 'Meta+Enter'];
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
  'placeholder',
  'autocomplete',
  'autocapitalize',
  'spellcheck',
  'enterkeyhint',
];

// Each group: the route, what to wait for, the field, its form, the values typed, and the named neighbours (every
// selector is tag-neutral, so it finds the input at the base and the textarea after). A neighbour with all: true
// records every match; otherwise the first.
const SPECS = {
  search: {
    route: '/search',
    ready: '.search__form button:not([disabled])',
    field: '.search__form .ink-field',
    form: 'form.search__form',
    value: 'K7QM 2X9D',
    paste: ['K7QM', '2X9D'],
    want: 'K7QM2X9D',
    neighbours: [
      { sel: 'form.search__form' },
      { sel: '.search__form .notebook-field' },
      { sel: '.search__form .notebook-caption' },
      { sel: '.search__form button' },
      { sel: '#sheet-code-result' },
    ],
  },
  notebook: {
    route: '/notebook',
    ready: '.nb__head',
    field: 'form.nb__new .ink-field',
    form: 'form.nb__new',
    value: 'Probe sorbet',
    paste: ['Probe', 'sorbet'],
    want: 'Probesorbet',
    neighbours: [
      { sel: 'form.nb__new' },
      { sel: 'form.nb__new .notebook-field' },
      { sel: 'form.nb__new .notebook-caption' },
      { sel: 'form.nb__new .field-error' },
      { sel: '.nb__new-actions' },
      { sel: '.nb__new-actions button', all: true },
      { sel: '.nb__count' },
      { sel: 'li.nb__row' },
    ],
  },
  ingredients: {
    route: '/ingredients',
    ready: 'form.ing__filters',
    field: '.ing__filters .ing__field:not(.ing__field--category) .ink-field',
    form: 'form.ing__filters',
    value: 'Whole milk',
    paste: ['Whole', 'milk'],
    want: 'Wholemilk',
    neighbours: [
      { sel: 'form.ing__filters' },
      { sel: '.ing__filters .ing__field:not(.ing__field--category)' },
      { sel: '.ing__filters .ing__field:not(.ing__field--category) .notebook-caption' },
      { sel: '.ing__field--category' },
      { sel: '.ing__field--category select' },
      { sel: '.ing__status' },
      { sel: 'li.ing__row, .ing__none' },
    ],
  },
};
const ANCHOR = '.list-page.place';

const [, , mode, file, ...rest] = process.argv;
if (mode !== 'record' && mode !== 'check') {
  console.log('FAIL usage: record <out.json> | check <after.json> --base <base.json> [--field search,notebook,ingredients|all]');
  process.exit(1);
}

async function clickUntil(page, clickTarget, doneSelector, label, state = 'visible') {
  for (let i = 0; i < 4; i += 1) {
    await clickTarget().click();
    try {
      await page.waitForSelector(doneSelector, { timeout: 1500, state });
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

// Everything the gates read from the field and its named neighbours. Every box is relative to the anchor.
function measureField({ selector, anchorSelector, neighbours, attrs }) {
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
  // A neighbour with display: contents has no box (its rect is 0x0 at the viewport origin), so only that fact is
  // recorded for it.
  const named = [];
  for (const n of neighbours) {
    const found = n.all ? [...document.querySelectorAll(n.sel)] : [document.querySelector(n.sel)].filter(Boolean);
    named.push({
      sel: n.sel,
      items: found.map((e) => ({
        tag: e.tagName,
        contents: getComputedStyle(e).display === 'contents',
        box: rel(e.getBoundingClientRect()),
      })),
    });
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
    named,
    anchorHeight: r2(ar.height),
    parentDisplay: getComputedStyle(parent).display,
    css: {
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
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
      minHeight: cs.minHeight,
      boxSizing: cs.boxSizing,
      resize: cs.resize,
      whiteSpace: cs.whiteSpace,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      fieldSizing: cs.fieldSizing ?? null,
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

const lightMeasure = (selector) => {
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
};

// What a Return press changed: value, focus, pathname, the group's status or line text, and the submit count since
// the last read (a capturing submit listener on the form).
const readState = ({ group, fieldSel }) => {
  const el = document.querySelector(fieldSel);
  const text = (s) => {
    const e = document.querySelector(s);
    return e ? e.textContent.trim() : null;
  };
  const subs = window.__subs ?? 0;
  window.__subs = 0;
  const out = {
    subs,
    value: el ? el.value : null,
    focused: !!el && document.activeElement === el,
    path: location.pathname,
    line: null,
    invalid: el ? el.getAttribute('aria-invalid') : null,
    first: null,
  };
  if (group === 'search') out.line = text('#sheet-code-result');
  if (group === 'notebook') out.line = text('form.nb__new .field-error');
  if (group === 'ingredients') {
    out.line = text('.ing__count');
    out.first = text('.ing__name');
  }
  return out;
};

async function watchSubmits(page, formSel) {
  await page.evaluate((sel) => {
    window.__subs = 0;
    document.querySelector(sel).addEventListener(
      'submit',
      () => {
        window.__subs += 1;
      },
      true,
    );
  }, formSel);
}

async function pressAll(page, group, fieldSel) {
  const out = [];
  for (const key of KEYS) {
    await page.keyboard.press(key);
    await page.waitForTimeout(150);
    out.push(await page.evaluate(readState, { group, fieldSel }));
  }
  return out;
}

async function recordGroup(page, cfg, group) {
  const spec = SPECS[group];
  const sel = spec.field;
  const args = { selector: sel, anchorSelector: ANCHOR, neighbours: spec.neighbours, attrs: ATTRS };
  const rec = { group, selector: sel, value: spec.value, want: spec.want };
  const blurSettle = async () => {
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await settle(page);
  };
  await watchSubmits(page, spec.form);
  // E, empty
  await blurSettle();
  rec.e = await page.evaluate(measureField, args);
  // F, filled
  await focusByClick(page, sel);
  await page.keyboard.type(spec.value);
  await blurSettle();
  rec.f = await page.evaluate(measureField, args);
  rec.f.ink = await ink(page, sel, cfg.dpr);
  // K
  await focusByClick(page, sel);
  rec.k = await page.evaluate((s) => {
    const el = document.querySelector(s);
    const cs = getComputedStyle(el);
    return { focusVisible: el.matches(':focus-visible'), outline: { style: cs.outlineStyle, width: cs.outlineWidth, offset: cs.outlineOffset } };
  }, sel);
  // N
  await page.keyboard.press('Tab');
  rec.n = await page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return 'the page body';
    const label = a.getAttribute('aria-label');
    if (label) return label;
    const caption = a.closest('label')?.querySelector('.notebook-caption');
    if (caption && caption.textContent.trim()) return caption.textContent.trim();
    const text = (a.textContent ?? '').trim();
    if (text) return text.slice(0, 40);
    return `${a.tagName} ${a.getAttribute('class') ?? ''}`.trim();
  });
  // P
  await page.evaluate(() => {
    window.__subs = 0;
  });
  await page.locator(sel).first().fill('');
  await execInsert(page, sel, spec.paste.join('\n'));
  await page.waitForTimeout(100);
  rec.p = await page.evaluate(readState, { group, fieldSel: sel });
  // L
  await page.locator(sel).first().fill('');
  await focusByClick(page, sel);
  await page.keyboard.type(LONG_TEXT);
  await page.waitForTimeout(200);
  rec.l = await page.evaluate(lightMeasure, sel);
  await blurSettle();
  rec.lm = await page.evaluate(measureField, args);
  // R
  await page.locator(sel).first().fill('');
  await focusByClick(page, sel);
  if (group === 'search') {
    await page.keyboard.type('K7QM2X9');
    rec.typed = 'K7QM2X9';
    rec.r = await pressAll(page, group, sel);
    await page.locator(sel).first().fill('');
    await focusByClick(page, sel);
    await page.keyboard.type('00000000');
    await page.evaluate(() => {
      window.__subs = 0;
    });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    rec.r2 = await page.evaluate(readState, { group, fieldSel: sel });
  } else if (group === 'ingredients') {
    await page.keyboard.type('milk');
    rec.typed = 'milk';
    rec.r = await pressAll(page, group, sel);
  } else {
    rec.typed = '';
    rec.r = await pressAll(page, group, sel);
    rec.refused = await page.evaluate(measureField, args);
    await focusByClick(page, sel);
    await page.keyboard.type('Probe sorbet');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.notebook.mk-page');
    rec.start = await page.evaluate(() => ({
      path: location.pathname,
      name: document.querySelector('.notebook.mk-page [aria-label="Recipe name"]')?.value ?? null,
    }));
  }
  return rec;
}

async function runConfig(browser, base, cfg) {
  const { context, page } = await openPage(browser, cfg);
  const out = { coarse: null, groups: {} };
  for (const group of GROUPS) {
    const spec = SPECS[group];
    await page.goto(`${base}${spec.route}`, { waitUntil: 'networkidle' });
    await page.waitForSelector(spec.ready);
    if (group === 'notebook') {
      await clickUntil(page, () => page.getByRole('button', { name: 'New recipe' }), 'form.nb__new', 'open New recipe');
    }
    await settle(page);
    if (out.coarse === null) out.coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    out.groups[group] = await recordGroup(page, cfg, group);
  }
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

const boxMatches = (a, b) => near(a.left, b.left) && near(a.top, b.top) && near(a.width, b.width) && near(a.height, b.height);

function regionMatches(a, b) {
  const problems = [];
  if (!boxMatches(a.box, b.box)) problems.push(`field ${showBox(a.box)} (base ${showBox(b.box)})`);
  if (a.parentDisplay !== b.parentDisplay) {
    if (!near(a.parentBox.left, b.parentBox.left) || !near(a.parentBox.width, b.parentBox.width)) {
      problems.push(`parent (${b.parentDisplay} to ${a.parentDisplay}) left ${a.parentBox.left} w ${a.parentBox.width} (base left ${b.parentBox.left} w ${b.parentBox.width})`);
    }
  } else if (!boxMatches(a.parentBox, b.parentBox)) problems.push(`parent ${showBox(a.parentBox)} (base ${showBox(b.parentBox)})`);
  if (!boxMatches(a.grandBox, b.grandBox)) problems.push(`grandparent ${showBox(a.grandBox)} (base ${showBox(b.grandBox)})`);
  if (a.siblings.length !== b.siblings.length) problems.push(`${a.siblings.length} siblings (base ${b.siblings.length})`);
  else {
    a.siblings.forEach((s, i) => {
      if (!boxMatches(s.box, b.siblings[i].box)) problems.push(`sibling ${i} ${s.tag} ${showBox(s.box)} (base ${showBox(b.siblings[i].box)})`);
    });
  }
  if (a.named.length !== b.named.length) problems.push(`${a.named.length} named neighbours (base ${b.named.length})`);
  else {
    a.named.forEach((n, i) => {
      const bn = b.named[i];
      if (n.items.length !== bn.items.length) {
        problems.push(`${n.sel}: ${n.items.length} match(es) (base ${bn.items.length})`);
        return;
      }
      n.items.forEach((item, j) => {
        const bi = bn.items[j];
        if (item.contents !== bi.contents) problems.push(`${n.sel}[${j}] display contents ${item.contents} (base ${bi.contents})`);
        else if (!item.contents && !boxMatches(item.box, bi.box)) problems.push(`${n.sel}[${j}] ${showBox(item.box)} (base ${showBox(bi.box)})`);
      });
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
  'letterSpacing',
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
  'minHeight',
  'boxSizing',
];

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
      const af = a.groups[group];
      const bf = b.groups[group];
      const tk = `${tag}|${group}`;
      tallies.set(tk, { pass: 0, fail: 0 });
      const name = `${tag} ${group}`;
      // F0
      {
        const x = af.f;
        const y = bf.f;
        const problems = [];
        if (x.tag !== 'TEXTAREA') problems.push(`tag ${x.tag}`);
        if (x.attributes.rows !== '1') problems.push(`rows ${x.attributes.rows}`);
        if (x.attributes.type !== null) problems.push(`type ${x.attributes.type}`);
        const wantCols = group === 'search' ? '20' : null;
        if (x.attributes.cols !== wantCols) problems.push(`cols ${x.attributes.cols} (want ${wantCols})`);
        for (const attr of ATTRS) {
          if (['rows', 'cols', 'type'].includes(attr)) continue;
          if (x.attributes[attr] !== y.attributes[attr]) problems.push(`${attr} ${x.attributes[attr]} (base ${y.attributes[attr]})`);
        }
        gate(tk, problems.length === 0, `F0 ${name}: ${problems.join('; ')}`);
        if (first && engine === 'webkit') console.log(`INFO F0 ${group}: base tag ${y.tag}`);
      }
      if (first && engine === 'webkit' && af.f.parentDisplay !== bf.f.parentDisplay) {
        console.log(`INFO E1 ${group}: parent display ${bf.f.parentDisplay} in base, ${af.f.parentDisplay} after`);
      }
      // E1, B1
      for (const [pass, label] of [['e', 'E1'], ['f', 'B1']]) {
        const problems = regionMatches(af[pass], bf[pass]);
        gate(tk, problems.length === 0, `${label} ${name}: ${problems.join('; ')}`);
      }
      // C1, C2
      {
        const x = af.f;
        const y = bf.f;
        const diff = CSS_ALWAYS.filter((k) => x.css[k] !== y.css[k]);
        const afterOnly =
          x.css.resize === 'none' &&
          x.css.whiteSpace === 'pre' &&
          x.css.overflowX === 'hidden' &&
          x.css.overflowY === 'hidden' &&
          x.scrollbarX === 0 &&
          x.scrollbarY === 0;
        gate(
          tk,
          diff.length === 0 && afterOnly,
          `C1 ${name}: computed ${diff.length === 0 ? 'equal' : `differs in ${diff.map((k) => `${k} ${x.css[k]} (base ${y.css[k]})`).join(', ')}`}; resize ${x.css.resize}, white-space ${x.css.whiteSpace}, overflow ${x.css.overflowX}/${x.css.overflowY}, scrollbars ${x.scrollbarX}/${x.scrollbarY}`,
        );
        const px = parseFloat(x.css.paddingTop);
        const pb = parseFloat(x.css.paddingBottom);
        if (fine) {
          gate(tk, x.css.paddingTop === y.css.paddingTop && x.css.paddingBottom === y.css.paddingBottom, `C2 ${name}: vertical padding ${x.css.paddingTop}/${x.css.paddingBottom} (base ${y.css.paddingTop}/${y.css.paddingBottom})`);
        } else {
          gate(tk, Math.abs(px - pb) <= 0.01, `C2 ${name}: coarse padding ${x.css.paddingTop}/${x.css.paddingBottom} not equal top and bottom`);
          if (engine === 'webkit' && cfg.dpr === 1) {
            console.log(`INFO C2 ${tag} ${group}: padding-block ${x.css.paddingTop}/${x.css.paddingBottom} (base ${y.css.paddingTop}/${y.css.paddingBottom}), by the coarse centring rule`);
          }
        }
        if (group === 'search' && first) console.log(`INFO C2 ${engine} search: field-sizing ${x.css.fieldSizing} after (base ${y.css.fieldSizing})`);
      }
      // I1
      {
        const x = af.f;
        const y = bf.f;
        gate(tk, inkNear(x.ink, y.ink, cfg.dpr), `I1 ${name}: text ink ${showInk(x.ink)} (base ${showInk(y.ink)})`);
      }
      // K1
      gate(
        tk,
        af.k.focusVisible === bf.k.focusVisible && JSON.stringify(af.k.outline) === JSON.stringify(bf.k.outline),
        `K1 ${name}: focus-visible ${af.k.focusVisible} outline ${JSON.stringify(af.k.outline)} (base ${bf.k.focusVisible} ${JSON.stringify(bf.k.outline)})`,
      );
      // N1
      gate(tk, af.n === bf.n, `N1 ${name}: Tab lands on '${af.n}' (base '${bf.n}')`);
      if (first) console.log(`INFO N1 ${engine} ${group}: Tab lands on '${af.n}'`);
      // P1
      gate(tk, af.p.value === af.want && af.p.subs === 0, `P1 ${name}: insertText with a line feed leaves '${af.p.value}' (contract '${af.want}'), ${af.p.subs} submit(s)`);
      if (first) console.log(`INFO P1 ${engine} ${group}: base input leaves '${bf.p.value}' with ${bf.p.subs} submit(s)`);
      // L1
      gate(
        tk,
        near(af.l.height, af.f.box.height) && af.l.scrollLeft > 0 && af.l.scrollbarX === 0 && af.l.scrollbarY === 0,
        `L1 ${name}: long text height ${af.l.height} (filled ${af.f.box.height}, base long ${bf.l.height}), scrollLeft ${af.l.scrollLeft} (base ${bf.l.scrollLeft}), scrollbars ${af.l.scrollbarX}/${af.l.scrollbarY}`,
      );
      if (first) console.log(`INFO L1 ${engine} ${group}: base scrollLeft ${bf.l.scrollLeft}, after ${af.l.scrollLeft}`);
      // L2
      {
        const problems = regionMatches(af.lm, bf.lm);
        gate(tk, problems.length === 0, `L2 ${name}: ${problems.join('; ')}`);
      }
      // R1
      KEYS.forEach((key, i) => {
        const x = af.r[i];
        const y = bf.r[i];
        const problems = [];
        if (x.value !== af.typed || /[\n\r]/.test(x.value)) problems.push(`value '${x.value}' (typed '${af.typed}')`);
        if (!x.focused || x.focused !== y.focused) problems.push(`focus ${x.focused} (base ${y.focused})`);
        if (x.path !== y.path) problems.push(`path ${x.path} (base ${y.path})`);
        if (x.line !== y.line) problems.push(`line '${x.line}' (base '${y.line}')`);
        if (x.invalid !== y.invalid) problems.push(`aria-invalid ${x.invalid} (base ${y.invalid})`);
        if (x.first !== y.first) problems.push(`first '${x.first}' (base '${y.first}')`);
        if (group === 'ingredients') {
          if (x.subs !== 0) problems.push(`${x.subs} submit(s), want 0`);
          if (first && engine === 'webkit') console.log(`INFO R1 ingredients ${key}: base ${y.subs} submit(s), after ${x.subs}`);
        } else if (x.subs !== y.subs) problems.push(`${x.subs} submit(s) (base ${y.subs})`);
        gate(tk, problems.length === 0, `R1 ${name} ${key}: ${problems.join('; ')}; submits ${x.subs} (base ${y.subs})`);
      });
      if (first && group !== 'ingredients') {
        console.log(`INFO R1 ${engine} ${group}: submit counts after ${af.r.map((r) => r.subs).join(',')} (base ${bf.r.map((r) => r.subs).join(',')})`);
      }
      // R2
      if (group === 'search') {
        const ok = (r) => r.path === '/search' && r.line === 'No version has this code.';
        gate(tk, ok(af.r2) && ok(bf.r2), `R2 ${name}: unknown code leaves ${af.r2.path} '${af.r2.line}' (base ${bf.r2.path} '${bf.r2.line}')`);
      }
      if (group === 'notebook') {
        const problems = regionMatches(af.refused, bf.refused);
        gate(tk, problems.length === 0, `R2 ${name}: refused state ${problems.join('; ')}`);
        // R3
        const ok = (s) => s.path === '/notebook/new' && s.name === 'Probe sorbet';
        gate(tk, ok(af.start) && ok(bf.start), `R3 ${name}: Return lands on ${af.start.path} with '${af.start.name}' (base ${bf.start.path} '${bf.start.name}')`);
      }
      const t = tallies.get(tk);
      console.log(`${t.fail === 0 ? 'PASS' : 'FAIL'} ${tag} ${group}: ${t.pass} PASS, ${t.fail} FAIL`);
    }
    const c = tallies.get(`${tag}|config`);
    if (c.fail > 0) console.log(`FAIL ${tag}: the coarse media query does not equal hasTouch`);
  }
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
