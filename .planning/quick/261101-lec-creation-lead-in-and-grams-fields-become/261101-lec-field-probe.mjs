// Quick 261101-lec probe: bug-p11-ipad-hardware-tab-skips-fields. The creation editor's step lead-in and its
// ingredient row's grams field become one-row textareas (iPadOS 27 Safari drops a hardware Tab from every
// input element, and a textarea takes it). This probe proves, in Playwright WebKit and in Chrome (playwright-core
// chromium, channel 'chrome') on scratch builds of the real app, that the two fields look and focus as they did.
//
// Configs: 1366x1024 fine, 1366x1024 coarse, 1366x1024 coarse at DPR 2 (all gated); 393x852 coarse is recorded
// and printed as INFO only.
//
// Gates (after against base, per engine and gated config):
//   F0  after's lead-in is TEXTAREA rows 1; after's grams is TEXTAREA rows 1 inputmode decimal (base tags INFO)
//   F1  the coarse media query matches the config's hasTouch
//   L1/G1  field box (top, left against the li / tr, width, height) within 0.5 px
//   L2/G2  computed font, colour, text-align, horizontal padding, border widths equal; resize none and no
//          scrollbar on either axis (after)
//   L3/G3  the field text's ink bounding box within 1 device px
//   L4  the step number's box within 0.5 px; (number ink bottom minus field text ink bottom) within 1 device px
//   L5  the instruction field's top and the li height within 0.5 px
//   L6  the empty field's box and its Required line's box within 0.5 px
//   L7  focus outline and :focus-visible equal after a click
//   L8/G6  Enter and Shift+Enter change nothing and keep focus
//   L9/G7  an insertText with a line feed leaves no line feed and no space (the contract; the engines' inputs
//          substitute a space, printed as the base figure)
//   L10/G8  text typed past the field's width stays one line at the same height and scrolls to the caret
//           (WebKit keeps an input's scroll internal, so its base scrollLeft is 0: printed, not compared)
//   G4  the tr height, the " g" text box and the name text's top within 0.5 px
//   G5  a row just picked: the field is focused, has mk-focus, and its outline equals the base's
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S=/private/tmp/sprinkles-261101-lec
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir        # at HEAD, before the change
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   node <this file> check "$S/after.json" --base "$S/base.json" [--field lead-in|grams|all]
// It starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST through
// 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host.
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
  { name: '1366 fine', width: 1366, height: 1024, touch: false, dpr: 1, gated: true },
  { name: '1366 coarse', width: 1366, height: 1024, touch: true, dpr: 1, gated: true },
  { name: '1366 coarse dpr2', width: 1366, height: 1024, touch: true, dpr: 2, gated: true },
  { name: '393 coarse', width: 393, height: 852, touch: true, dpr: 2, gated: false },
];
const LEAD = 'li.mk-step [data-field="lead-in"]';
const GRAMS = 'td.ingredient-table__col-grams .ink-field';

const [, , mode, file, ...rest] = process.argv;
if (mode !== 'record' && mode !== 'check') {
  console.log('FAIL usage: record <out.json> | check <after.json> --base <base.json> [--field lead-in|grams|all]');
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

// Everything the gates read from one field, relative to its container (the li or the tr).
function measureField({ fieldSelector, containerSelector }) {
  const r2 = (v) => Math.round(v * 100) / 100;
  const el = document.querySelector(fieldSelector);
  const box = el.closest(containerSelector);
  const rect = el.getBoundingClientRect();
  const crect = box.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const bw = (side) => parseFloat(cs[`border${side}Width`]);
  return {
    tag: el.tagName,
    rows: el.getAttribute('rows'),
    inputmode: el.getAttribute('inputmode'),
    value: el.value,
    focused: document.activeElement === el,
    hasMkFocus: el.classList.contains('mk-focus'),
    box: { top: r2(rect.top - crect.top), left: r2(rect.left - crect.left), width: r2(rect.width), height: r2(rect.height) },
    containerHeight: r2(crect.height),
    css: {
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      color: cs.color,
      textAlign: cs.textAlign,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
      borderTop: cs.borderTopWidth,
      borderRight: cs.borderRightWidth,
      borderBottom: cs.borderBottomWidth,
      borderLeft: cs.borderLeftWidth,
      resize: cs.resize,
    },
    scrollbarX: r2(el.offsetHeight - el.clientHeight - bw('Top') - bw('Bottom')),
    scrollbarY: r2(el.offsetWidth - el.clientWidth - bw('Left') - bw('Right')),
    scrollLeft: r2(el.scrollLeft),
    focusVisible: el.matches(':focus-visible'),
    outline: { style: cs.outlineStyle, width: cs.outlineWidth, offset: cs.outlineOffset },
    // the field's padding box, relative to the container: the ink clip
    padRect: {
      x: r2(rect.left - crect.left + bw('Left')),
      y: r2(rect.top - crect.top + bw('Top')),
      w: r2(rect.width - bw('Left') - bw('Right')),
      h: r2(rect.height - bw('Top') - bw('Bottom')),
    },
  };
}

// Ink bounding box of a container-relative rectangle, in container-relative CSS px, from a clipped screenshot.
// Ink is a pixel any of whose channels differs from the clip's top-left pixel by more than 48. The PNG is
// decoded inside the page (an Image drawn to a canvas), so no npm package is needed.
async function ink(page, containerSelector, containerIndexSelector, relBox, dpr, inset = 0) {
  // inset keeps a bordered field's own rule out of the clip when an engine rounds the clip outward
  const rel = { x: relBox.x + inset, y: relBox.y + inset, w: relBox.w - 2 * inset, h: relBox.h - 2 * inset };
  const origin = await page.evaluate(
    ({ containerSelector, containerIndexSelector }) => {
      const el = document.querySelector(containerIndexSelector).closest(containerSelector);
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top };
    },
    { containerSelector, containerIndexSelector },
  );
  const clip = { x: origin.x + rel.x, y: origin.y + rel.y, width: rel.w, height: rel.h };
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
    return r < 0 ? null : { l, t, r: r + 1, b: b + 1, w: width, h: height };
  }, png.toString('base64'));
  if (!box) return null;
  const imgScale = dpr; // device px per CSS px
  const r2 = (v) => Math.round(v * 100) / 100;
  return {
    // container-relative CSS px; the device-px figures are kept for the 1-device-px gate
    left: r2(rel.x + box.l / imgScale),
    top: r2(rel.y + box.t / imgScale),
    right: r2(rel.x + box.r / imgScale),
    bottom: r2(rel.y + box.b / imgScale),
  };
}

async function runConfig(browser, base, cfg) {
  const { context, page } = await openPage(browser, cfg);
  await page.goto(`${base}/notebook`, { waitUntil: 'networkidle' });
  await clickUntil(page, () => page.getByRole('button', { name: 'New recipe' }), 'form[aria-label="New recipe"]', 'open New recipe');
  await page.getByLabel('Name', { exact: true }).fill('Probe sorbet');
  await clickUntil(page, () => page.getByRole('button', { name: 'Start' }), '.mk-page', 'Start');
  await clickUntil(
    page,
    () => page.getByRole('button', { name: 'Add step', exact: true }),
    `${LEAD}`,
    'Add step',
  );
  await clickUntil(page, () => page.locator('.ingredient-table-region .mk-head-act').first(), '.pick__row', 'Add ingredient');
  const pickRow = page.locator('.pick__row:not(.pick__row--added)').first();
  const picked = (await pickRow.locator('.pick__name').textContent()).trim();
  await pickRow.click();
  await page.waitForSelector(GRAMS);
  await page.waitForFunction((s) => document.activeElement === document.querySelector(s), GRAMS, { timeout: 5000 });
  await settle(page);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  const out = { coarse, picked };

  // ---- grams: G5 first, while the picked row's field still holds focus
  const gArgs = { fieldSelector: GRAMS, containerSelector: 'tr' };
  out.g5 = await page.evaluate(measureField, gArgs);
  await page.locator(GRAMS).first().fill('150');
  await page.evaluate(() => document.activeElement.blur());
  await settle(page);
  const g = await page.evaluate(measureField, gArgs);
  g.trExtra = await page.evaluate((s) => {
    const r2 = (v) => Math.round(v * 100) / 100;
    const el = document.querySelector(s);
    const tr = el.closest('tr');
    const trTop = tr.getBoundingClientRect().top;
    const range = document.createRange();
    const unit = el.nextSibling;
    range.selectNodeContents(unit);
    const u = range.getBoundingClientRect();
    const nameCell = tr.querySelector('td.ingredient-table__col-name');
    const nameRange = document.createRange();
    nameRange.selectNode(nameCell.firstChild);
    const n = nameRange.getBoundingClientRect();
    return {
      unitText: unit.textContent,
      unit: { top: r2(u.top - trTop), left: r2(u.left - tr.getBoundingClientRect().left), width: r2(u.width), height: r2(u.height) },
      nameTop: r2(n.top - trTop),
    };
  }, GRAMS);
  g.ink = await ink(page, 'tr', GRAMS, g.padRect, cfg.dpr, 2);
  // G6
  await focusByClick(page, GRAMS);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Enter');
  g.enter = await page.evaluate((s) => ({ value: document.querySelector(s).value, focused: document.activeElement === document.querySelector(s) }), GRAMS);
  // G7
  await page.locator(GRAMS).first().fill('');
  await execInsert(page, GRAMS, '15\n0');
  g.insert = await page.evaluate((s) => document.querySelector(s).value, GRAMS);
  await page.locator(GRAMS).first().fill('150');
  // G8
  await page.locator(GRAMS).first().fill('');
  await page.keyboard.type('1234567890123');
  await page.waitForTimeout(200);
  g.long = await page.evaluate(measureField, gArgs);
  await page.locator(GRAMS).first().fill('150');
  await page.evaluate(() => document.activeElement.blur());
  out.g = g;

  // ---- lead-in: still empty, so L6 first
  const lArgs = { fieldSelector: LEAD, containerSelector: 'li.mk-step' };
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  const empty = await page.evaluate(measureField, lArgs);
  empty.required = await page.evaluate((s) => {
    const r2 = (v) => Math.round(v * 100) / 100;
    const el = document.querySelector(s);
    const li = el.closest('li.mk-step').getBoundingClientRect();
    const req = el.closest('label').querySelector('.field-requirement');
    if (!req) return null;
    const r = req.getBoundingClientRect();
    return { top: r2(r.top - li.top), left: r2(r.left - li.left), width: r2(r.width), height: r2(r.height) };
  }, LEAD);
  // L7
  await focusByClick(page, LEAD);
  const clicked = await page.evaluate(measureField, lArgs);
  const l7 = { focusVisible: clicked.focusVisible, outline: clicked.outline };
  // fill, blur, L1 to L5
  await page.locator(LEAD).first().fill('Warm the milk');
  await page.evaluate(() => document.activeElement.blur());
  await settle(page);
  const l = await page.evaluate(measureField, lArgs);
  l.extra = await page.evaluate((s) => {
    const r2 = (v) => Math.round(v * 100) / 100;
    const li = document.querySelector(s).closest('li.mk-step');
    const lr = li.getBoundingClientRect();
    const n = li.querySelector('.method-step__n').getBoundingClientRect();
    const instruction = li.querySelector('[aria-label$=", instruction"]').getBoundingClientRect();
    return {
      number: { top: r2(n.top - lr.top), left: r2(n.left - lr.left), width: r2(n.width), height: r2(n.height) },
      instructionTop: r2(instruction.top - lr.top),
      liHeight: r2(lr.height),
    };
  }, LEAD);
  l.ink = await ink(page, 'li.mk-step', LEAD, l.padRect, cfg.dpr);
  const numberRect = {
    x: l.extra.number.left,
    y: l.extra.number.top,
    w: l.extra.number.width,
    h: l.extra.number.height,
  };
  l.numberInk = await ink(page, 'li.mk-step', LEAD, numberRect, cfg.dpr);
  // L8
  await focusByClick(page, LEAD);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Enter');
  l.enter = await page.evaluate((s) => ({ value: document.querySelector(s).value, focused: document.activeElement === document.querySelector(s) }), LEAD);
  // L9
  await page.locator(LEAD).first().fill('');
  await execInsert(page, LEAD, 'Warm\nthe milk');
  l.insert = await page.evaluate((s) => document.querySelector(s).value, LEAD);
  await page.locator(LEAD).first().fill('Warm the milk');
  // L10
  await page.locator(LEAD).first().fill('');
  await page.keyboard.type(
    'Warm the milk slowly over a low flame, stirring now and then so that nothing catches on the bottom of the heavy pan, until it steams.',
  );
  await page.waitForTimeout(200);
  l.long = await page.evaluate(measureField, lArgs);
  await page.locator(LEAD).first().fill('Warm the milk');
  await page.evaluate(() => document.activeElement.blur());
  out.l = { filled: l, empty, l7 };
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
      console.log(`recorded ${name} ${cfg.name}`);
    }
    await browser.close();
  }
  await servers.close();
  writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`recorded ${Object.keys(out).join(' + ')} to ${file}`);
  process.exit(0);
}

// ---- check
const baseIdx = rest.indexOf('--base');
if (baseIdx < 0 || !rest[baseIdx + 1]) {
  console.log('FAIL check needs --base <base.json>');
  process.exit(1);
}
const fieldIdx = rest.indexOf('--field');
const FIELD = fieldIdx >= 0 ? rest[fieldIdx + 1] : 'all';
if (!['lead-in', 'grams', 'all'].includes(FIELD)) {
  console.log('FAIL --field must be lead-in, grams or all');
  process.exit(1);
}
const doLead = FIELD !== 'grams';
const doGrams = FIELD !== 'lead-in';
const after = JSON.parse(readFileSync(file, 'utf8'));
const base = JSON.parse(readFileSync(rest[baseIdx + 1], 'utf8'));
let pass = 0;
let fail = 0;
const r2 = (v) => Math.round(v * 100) / 100;
const near = (a, b, tol = BOX_TOL) => a !== null && b !== null && Math.abs(a - b) <= tol + 1e-9;
const say = (ok, text) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${text}`);
  if (ok) pass += 1;
  else fail += 1;
};
const boxNear = (a, b) => ['top', 'left', 'width', 'height'].every((k) => near(a[k], b[k]));
const showBox = (b) => `top ${b.top} left ${b.left} w ${b.width} h ${b.height}`;
const sameCss = (a, b) => Object.keys(b).filter((k) => a[k] !== b[k]);
const inkNear = (a, b, dpr) =>
  a !== null && b !== null && ['left', 'top', 'right', 'bottom'].every((k) => Math.abs(a[k] - b[k]) <= 1 / dpr + 1e-9);
const showInk = (i) => (i ? `L${i.left} T${i.top} R${i.right} B${i.bottom}` : 'none');

for (const engine of ['webkit', 'chrome']) {
  if (!after[engine] || !base[engine]) {
    console.log(`INFO ${engine} not recorded in both files; skipped`);
    continue;
  }
  for (const cfg of CONFIGS) {
    const a = after[engine][cfg.name];
    const b = base[engine][cfg.name];
    const tag = `${engine} ${cfg.name}`;
    if (!cfg.gated) {
      // 393 coarse: recorded, reported, never gated
      if (doLead) {
        console.log(`INFO ${tag} lead-in: after ${a.l.filled.tag} ${showBox(a.l.filled.box)} li ${a.l.filled.extra.liHeight}; base ${b.l.filled.tag} ${showBox(b.l.filled.box)} li ${b.l.filled.extra.liHeight}; ink after ${showInk(a.l.filled.ink)} base ${showInk(b.l.filled.ink)}`);
      }
      if (doGrams) {
        console.log(`INFO ${tag} grams: after ${a.g.tag} ${showBox(a.g.box)} tr ${a.g.containerHeight}; base ${b.g.tag} ${showBox(b.g.box)} tr ${b.g.containerHeight}; ink after ${showInk(a.g.ink)} base ${showInk(b.g.ink)}`);
      }
      continue;
    }
    say(a.coarse === cfg.touch, `F1 ${tag}: coarse ${a.coarse} equals hasTouch ${cfg.touch}`);
    say(a.picked === b.picked, `F1 ${tag}: the same ingredient was picked, '${a.picked}' (base '${b.picked}')`);
    if (doLead) {
      const al = a.l.filled;
      const bl = b.l.filled;
      say(al.tag === 'TEXTAREA' && al.rows === '1', `F0 ${tag}: lead-in is ${al.tag} rows ${al.rows} (base ${bl.tag})`);
      say(boxNear(al.box, bl.box), `L1 ${tag}: lead-in box ${showBox(al.box)} (base ${showBox(bl.box)})`);
      const diff = sameCss(al.css, { ...bl.css, resize: al.css.resize });
      say(
        diff.length === 0 && al.css.resize === 'none' && al.scrollbarX === 0 && al.scrollbarY === 0,
        `L2 ${tag}: lead-in computed ${diff.length === 0 ? 'equal' : `differs in ${diff.join(', ')}`} (${al.css.fontSize} ${al.css.fontWeight} ${al.css.lineHeight} pad ${al.css.paddingLeft}/${al.css.paddingRight}); resize ${al.css.resize}, scrollbars ${al.scrollbarX}/${al.scrollbarY} (base resize ${bl.css.resize})`,
      );
      say(inkNear(al.ink, bl.ink, cfg.dpr), `L3 ${tag}: lead-in text ink ${showInk(al.ink)} (base ${showInk(bl.ink)})`);
      const gapA = al.numberInk && al.ink ? r2(al.numberInk.bottom - al.ink.bottom) : null;
      const gapB = bl.numberInk && bl.ink ? r2(bl.numberInk.bottom - bl.ink.bottom) : null;
      say(
        boxNear(al.extra.number, bl.extra.number) && gapA !== null && gapB !== null && Math.abs(gapA - gapB) <= 1 / cfg.dpr + 1e-9,
        `L4 ${tag}: number ${showBox(al.extra.number)} (base ${showBox(bl.extra.number)}); number ink bottom minus text ink bottom ${gapA} (base ${gapB})`,
      );
      say(
        near(al.extra.instructionTop, bl.extra.instructionTop) && near(al.extra.liHeight, bl.extra.liHeight),
        `L5 ${tag}: instruction top ${al.extra.instructionTop} (base ${bl.extra.instructionTop}), li height ${al.extra.liHeight} (base ${bl.extra.liHeight})`,
      );
      const ae = a.l.empty;
      const be = b.l.empty;
      say(
        boxNear(ae.box, be.box) && ae.required && be.required && boxNear(ae.required, be.required),
        `L6 ${tag}: empty field ${showBox(ae.box)} (base ${showBox(be.box)}); Required ${ae.required ? showBox(ae.required) : 'none'} (base ${be.required ? showBox(be.required) : 'none'})`,
      );
      say(
        a.l.l7.focusVisible === b.l.l7.focusVisible && JSON.stringify(a.l.l7.outline) === JSON.stringify(b.l.l7.outline),
        `L7 ${tag}: focus-visible ${a.l.l7.focusVisible} outline ${JSON.stringify(a.l.l7.outline)} (base ${b.l.l7.focusVisible} ${JSON.stringify(b.l.l7.outline)})`,
      );
      say(
        al.enter.value === 'Warm the milk' && bl.enter.value === 'Warm the milk' && al.enter.focused && bl.enter.focused,
        `L8 ${tag}: after Enter and Shift+Enter value '${al.enter.value}' focus ${al.enter.focused} (base '${bl.enter.value}' ${bl.enter.focused})`,
      );
      // The plan expected the input to strip the line feed; both engines' inputs turn it into a space instead.
      // The after build follows the plan's contract (removed, no space); the base figure is printed for the record.
      say(al.insert === 'Warmthe milk', `L9 ${tag}: insertText with a line feed leaves '${al.insert}' (contract 'Warmthe milk'; the base input leaves '${bl.insert}')`);
      const alg = al.long;
      say(
        near(alg.box.height, al.box.height) && alg.scrollLeft > 0 && alg.scrollbarX === 0 && alg.scrollbarY === 0,
        `L10 ${tag}: long text height ${alg.box.height} (filled ${al.box.height}, base long ${bl.long.box.height}), scrollLeft ${alg.scrollLeft} (base ${bl.long.scrollLeft}), scrollbars ${alg.scrollbarX}/${alg.scrollbarY}`,
      );
    }
    if (doGrams) {
      const ag = a.g;
      const bg = b.g;
      say(
        ag.tag === 'TEXTAREA' && ag.rows === '1' && ag.inputmode === 'decimal',
        `F0 ${tag}: grams is ${ag.tag} rows ${ag.rows} inputmode ${ag.inputmode} (base ${bg.tag})`,
      );
      say(boxNear(ag.box, bg.box), `G1 ${tag}: grams box ${showBox(ag.box)} (base ${showBox(bg.box)})`);
      const diff = sameCss(ag.css, { ...bg.css, resize: ag.css.resize });
      say(
        diff.length === 0 && ag.css.resize === 'none' && ag.scrollbarX === 0 && ag.scrollbarY === 0,
        `G2 ${tag}: grams computed ${diff.length === 0 ? 'equal' : `differs in ${diff.join(', ')}`} (${ag.css.fontSize} ${ag.css.fontWeight} ${ag.css.lineHeight} pad ${ag.css.paddingLeft}/${ag.css.paddingRight}); resize ${ag.css.resize}, scrollbars ${ag.scrollbarX}/${ag.scrollbarY} (base resize ${bg.css.resize})`,
      );
      say(inkNear(ag.ink, bg.ink, cfg.dpr), `G3 ${tag}: grams text ink ${showInk(ag.ink)} (base ${showInk(bg.ink)})`);
      say(
        near(ag.containerHeight, bg.containerHeight) &&
          ag.trExtra.unitText === ' g' &&
          boxNear(ag.trExtra.unit, bg.trExtra.unit) &&
          near(ag.trExtra.nameTop, bg.trExtra.nameTop),
        `G4 ${tag}: tr height ${ag.containerHeight} (base ${bg.containerHeight}); ' g' ${showBox(ag.trExtra.unit)} (base ${showBox(bg.trExtra.unit)}); name top ${ag.trExtra.nameTop} (base ${bg.trExtra.nameTop})`,
      );
      say(
        a.g5.focused &&
          a.g5.hasMkFocus &&
          b.g5.focused &&
          JSON.stringify(a.g5.outline) === JSON.stringify(b.g5.outline),
        `G5 ${tag}: picked row focused ${a.g5.focused} (base ${b.g5.focused}), mk-focus ${a.g5.hasMkFocus} (base ${b.g5.hasMkFocus}), outline ${JSON.stringify(a.g5.outline)} (base ${JSON.stringify(b.g5.outline)})`,
      );
      say(
        ag.enter.value === '150' && bg.enter.value === '150' && ag.enter.focused && bg.enter.focused,
        `G6 ${tag}: after Enter and Shift+Enter value '${ag.enter.value}' focus ${ag.enter.focused} (base '${bg.enter.value}' ${bg.enter.focused})`,
      );
      say(ag.insert === '150', `G7 ${tag}: insertText with a line feed leaves '${ag.insert}' (contract '150'; the base input leaves '${bg.insert}')`);
      const agl = ag.long;
      say(
        near(agl.box.height, ag.box.height) && agl.scrollLeft > 0 && agl.scrollbarX === 0 && agl.scrollbarY === 0,
        `G8 ${tag}: 13 digits height ${agl.box.height} (filled ${ag.box.height}, base long ${bg.long.box.height}), scrollLeft ${agl.scrollLeft} (base ${bg.long.scrollLeft}), scrollbars ${agl.scrollbarX}/${agl.scrollbarY}`,
      );
    }
  }
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
