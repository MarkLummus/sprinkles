// Quick 261101-mbe probe: bug-p11-bys-note-dot-on-right. The editing note's dot stands in the left margin as an
// aria-hidden box the CSS draws, instead of the engine's list marker (which Safari 27 places inside the note's
// flex row). This probe proves, in Playwright WebKit and in Chrome (playwright-core chromium, channel 'chrome')
// on scratch builds of the real app, that the reading list is untouched, that the editing dot sits where the
// HEAD build's native disc sat, that the note box did not move, that screen readers still meet a list of N
// items, and that forced colours keep the dot.
//
// Configs: 1366x1024 fine, 1366x1024 coarse, 1366x1024 coarse at DPR 2 (all gated); 393x852 coarse at DPR 2 is
// recorded and printed as INFO only. The forced area is recorded at 1366 fine only.
//
// Usage (from the repo root; build to scratch first, never to app/dist):
//   S=/private/tmp/sprinkles-261101-mbe
//   npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir        # at HEAD, before the change
//   PROBE_DIST="$S/base-dist" node <this file> record "$S/base.json"
//   npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir
//   PROBE_DIST="$S/after-dist" node <this file> record "$S/after.json"
//   node <this file> check "$S/after.json" --base "$S/base.json" [--area reading,create,pen,forced|all]
// It starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST through
// 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host.
// Everything typed or printed is English. Prints PASS/FAIL/INFO lines and ends "N PASS, M FAIL" (exit 1 on any FAIL).
//
// Gates (after against base, per engine and gated config; "box" tolerance 0.5 px, "device px" is 1 / DPR):
//   R1 reading ul outerHTML identical      R2 reading li boxes and ul height within 0.5 px
//   R3 reading marker-strip ink within 1 device px, present in both
//   R4 reading li display list-item and list-style-type disc
//   E1 (create, pen; after only) ul role list + editing modifier; li display block; li's first child is the
//      empty aria-hidden span.authored__note-bullet; note-field children are TEXTAREA then BUTTON
//   E2 li, textarea, Remove, note-field boxes and ul height within 0.5 px
//   E3 marker-strip ink (the bullet against the native disc) within 1 CSS px on every edge, present in both
//   E4 (after) bullet span inside the ul's padding strip, clear of the textarea and Remove, ink inside the
//      textarea's first line box
//   E5 the ::before colour equals base's li colour
//   E6 textarea text ink within 1 device px; the gap strip has no ink in either build
//   E7 listitem count equals the note count in both builds; Chrome AX tree: ul is a list with N listitem
//      nodes and the bullet node is ignored (base figures INFO)
//   FC (forced) colours really forced and the bullet ink within 1 CSS px of base's native disc (Chrome gated;
//      WebKit INFO)
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
const AREAS = ['reading', 'create', 'pen', 'forced'];
const READING_URL = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const UL = 'ul.authored__notes';
const NOTE_ONE = 'Chill the mix overnight before churning.';
const NOTE_TWO = 'Keep the cream cold until it goes in.';

const [, , mode, file, ...rest] = process.argv;
if (mode !== 'record' && mode !== 'check') {
  console.log('FAIL usage: record <out.json> | check <after.json> --base <base.json> [--area reading,create,pen,forced|all]');
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

async function openReading(page, base) {
  await page.goto(`${base}${READING_URL}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(`${UL} li`);
}

async function openCreate(page, base) {
  await page.goto(`${base}/notebook`, { waitUntil: 'networkidle' });
  await clickUntil(page, () => page.getByRole('button', { name: 'New recipe' }), 'form[aria-label="New recipe"]', 'open New recipe');
  await page.getByLabel('Name', { exact: true }).fill('Probe sorbet');
  await clickUntil(page, () => page.getByRole('button', { name: 'Start' }), '.mk-page', 'Start');
  await clickUntil(page, () => page.getByRole('button', { name: 'Add note', exact: true }), `${UL} textarea`, 'Add note');
  await page.locator(`${UL} textarea`).nth(0).fill(NOTE_ONE);
  await page.getByRole('button', { name: 'Add note', exact: true }).click();
  await page.waitForFunction((s) => document.querySelectorAll(s).length >= 2, `${UL} textarea`);
  await page.locator(`${UL} textarea`).nth(1).fill(NOTE_TWO);
  await page.evaluate(() => document.activeElement.blur());
  await settle(page);
}

async function openPen(page, base) {
  await openReading(page, base);
  await clickUntil(page, () => page.getByRole('button', { name: 'Next version' }).first(), `${UL} textarea`, 'Next version');
  await page.evaluate(() => document.activeElement.blur());
  await settle(page);
}

// Everything the gates read from the list, boxes relative to the ul. Runs in the page.
function measureList() {
  const r2 = (v) => Math.round(v * 100) / 100;
  const ul = document.querySelector('ul.authored__notes');
  const ur = ul.getBoundingClientRect();
  const rel = (r) => ({ top: r2(r.top - ur.top), left: r2(r.left - ur.left), width: r2(r.width), height: r2(r.height) });
  const lis = [...ul.children].map((li) => {
    const lr = li.getBoundingClientRect();
    const cs = getComputedStyle(li);
    const ta = li.querySelector('textarea');
    const rm = li.querySelector('button');
    const nf = li.querySelector('.authored__note-field');
    const bullet = li.querySelector('.authored__note-bullet');
    const fc = li.firstElementChild;
    const out = {
      box: rel(lr),
      display: cs.display,
      listStyleType: cs.listStyleType,
      color: cs.color,
      lineHeight: cs.lineHeight,
      firstChild: fc ? { tag: fc.tagName, cls: fc.className, ariaHidden: fc.getAttribute('aria-hidden'), text: fc.textContent } : null,
      fieldChildren: nf ? [...nf.children].map((c) => c.tagName) : null,
      field: nf ? rel(nf.getBoundingClientRect()) : null,
      textarea: ta ? rel(ta.getBoundingClientRect()) : null,
      remove: rm ? rel(rm.getBoundingClientRect()) : null,
      bullet: null,
    };
    if (ta) {
      const tcs = getComputedStyle(ta);
      const bw = (side) => parseFloat(tcs[`border${side}Width`]);
      const tr = ta.getBoundingClientRect();
      const lh = parseFloat(tcs.lineHeight);
      out.taPaddingTop = parseFloat(tcs.paddingTop);
      out.taLineHeight = Number.isNaN(lh) ? parseFloat(cs.lineHeight) : lh;
      // the textarea's padding box, relative to the li: the text-ink clip
      out.taPad = {
        x: r2(tr.left - lr.left + bw('Left')),
        y: r2(tr.top - lr.top + bw('Top')),
        w: r2(tr.width - bw('Left') - bw('Right')),
        h: r2(tr.height - bw('Top') - bw('Bottom')),
      };
      // the gap between the textarea and Remove, relative to the li
      if (rm) {
        const rr = rm.getBoundingClientRect();
        out.gap = { x: r2(tr.right - lr.left), y: 0, w: r2(rr.left - tr.right), h: r2(lr.height) };
      }
    }
    if (bullet) {
      const br = bullet.getBoundingClientRect();
      const bs = getComputedStyle(bullet, '::before');
      out.bullet = {
        top: r2(br.top - lr.top),
        left: r2(br.left - lr.left),
        right: r2(br.right - lr.left),
        bottom: r2(br.bottom - lr.top),
        ariaHidden: bullet.getAttribute('aria-hidden'),
        text: bullet.textContent,
        before: { width: bs.width, height: bs.height, backgroundColor: bs.backgroundColor, borderRadius: bs.borderRadius },
      };
    }
    return out;
  });
  return {
    ulRole: ul.getAttribute('role'),
    ulClass: ul.className,
    ulHtml: ul.outerHTML,
    ulHeight: r2(ur.height),
    lis,
  };
}

// Ink bounding box of an li-relative rectangle, in li-relative CSS px, from a clipped screenshot. Ink is a pixel
// any of whose channels differs from the clip's top-left pixel by more than 48. The PNG is decoded inside the
// page (an Image drawn to a canvas), so no npm package is needed.
async function ink(page, liIndex, relBox, dpr, inset = 0) {
  if (relBox.w - 2 * inset <= 0 || relBox.h - 2 * inset <= 0) return null;
  const rel = { x: relBox.x + inset, y: relBox.y + inset, w: relBox.w - 2 * inset, h: relBox.h - 2 * inset };
  await page.evaluate((i) => {
    document.querySelectorAll('ul.authored__notes > li')[i].scrollIntoView({ block: 'center' });
  }, liIndex);
  await page.waitForTimeout(100);
  const origin2 = await page.evaluate((i) => {
    const r = document.querySelectorAll('ul.authored__notes > li')[i].getBoundingClientRect();
    return { x: r.left, y: r.top };
  }, liIndex);
  const clip = { x: origin2.x + rel.x, y: origin2.y + rel.y, width: rel.w, height: rel.h };
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
    left: r2(rel.x + box.l / dpr),
    top: r2(rel.y + box.t / dpr),
    right: r2(rel.x + box.r / dpr),
    bottom: r2(rel.y + box.b / dpr),
  };
}

async function collect(page, cfg, { withText }) {
  const data = await page.evaluate(measureList);
  for (let i = 0; i < data.lis.length; i += 1) {
    const li = data.lis[i];
    const stripW = li.box.left; // the ul's left padding strip, from the ul's left edge to the li's left edge
    // one CSS px short of the li's edge, so the first glyph's edge or the textarea's own edge cannot spill in
    li.strip = await ink(page, i, { x: -stripW, y: 0, w: stripW - 1, h: li.box.height }, cfg.dpr);
    if (withText && li.taPad) {
      li.textInk = await ink(page, i, li.taPad, cfg.dpr, 1);
      li.gapInk = li.gap ? await ink(page, i, li.gap, cfg.dpr, 1) : null;
    }
  }
  data.listitems = await page.locator(UL).first().getByRole('listitem').count();
  return data;
}

// Chrome's own accessibility tree, through CDP.
async function chromeAx(context, page) {
  const cdp = await context.newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
  const backendOf = async (selector) => {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    if (!nodeId) return null;
    const { node } = await cdp.send('DOM.describeNode', { nodeId });
    return node.backendNodeId;
  };
  const ulId = await backendOf(UL);
  const ulTree = await cdp.send('Accessibility.getPartialAXTree', { backendNodeId: ulId, fetchRelatives: false });
  const items = await cdp.send('Accessibility.queryAXTree', { backendNodeId: ulId, role: 'listitem' });
  const bulletId = await backendOf('.authored__note-bullet');
  let bulletIgnored = null;
  if (bulletId) {
    const bt = await cdp.send('Accessibility.getPartialAXTree', { backendNodeId: bulletId, fetchRelatives: false });
    bulletIgnored = bt.nodes[0]?.ignored ?? null;
  }
  const out = { ulRole: ulTree.nodes[0]?.role?.value ?? null, listitems: items.nodes.length, bulletIgnored };
  await cdp.detach();
  return out;
}

async function recordArea(browser, base, cfg, area, engineName) {
  const { context, page } = await openPage(browser, cfg);
  try {
    if (area === 'reading') {
      await openReading(page, base);
      await settle(page);
      return await collect(page, cfg, { withText: false });
    }
    if (area === 'create') await openCreate(page, base);
    else if (area === 'pen') await openPen(page, base);
    else {
      await openCreate(page, base);
      const before = await page.evaluate(() => getComputedStyle(document.querySelector('ul.authored__notes li')).color);
      await page.emulateMedia({ forcedColors: 'active' });
      await settle(page);
      const forced = await page.evaluate(() => {
        const probe = document.createElement('div');
        probe.style.backgroundColor = 'rgb(18, 52, 86)';
        document.body.appendChild(probe);
        const bg = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return {
          matches: matchMedia('(forced-colors: active)').matches,
          probeBg: bg,
          liColor: getComputedStyle(document.querySelector('ul.authored__notes li')).color,
        };
      });
      const data = await collect(page, cfg, { withText: false });
      data.forced = { ...forced, liColorBefore: before, really: forced.probeBg !== 'rgb(18, 52, 86)' || forced.liColor !== before };
      return data;
    }
    const data = await collect(page, cfg, { withText: true });
    if (engineName === 'chrome') data.ax = await chromeAx(context, page);
    return data;
  } finally {
    await context.close();
  }
}

if (mode === 'record') {
  if (!process.env.PROBE_DIST || !existsSync(path.join(process.env.PROBE_DIST, 'index.html'))) {
    console.log('FAIL PROBE_DIST must name a directory holding index.html (a scratch build)');
    process.exit(1);
  }
  const { webkit, chromium } = await import(PLAYWRIGHT_CORE);
  const servers = await startServers({ appRoot: path.resolve(process.env.PROBE_DIST) });
  const out = {};
  let failed = 0;
  const engines = [
    ['webkit', () => webkit.launch()],
    ['chrome', () => chromium.launch({ channel: 'chrome' })],
  ];
  for (const [name, launch] of engines) {
    let browser;
    try {
      browser = await launch();
    } catch (err) {
      console.log(`FAIL ${name} did not launch: ${String(err.message).split('\n')[0]}`);
      failed += 1;
      continue;
    }
    out[name] = {};
    for (const cfg of CONFIGS) {
      out[name][cfg.name] = {};
      for (const area of AREAS) {
        if (area === 'forced' && cfg.name !== '1366 fine') continue;
        try {
          out[name][cfg.name][area] = await recordArea(browser, servers.appUrl, cfg, area, name);
          console.log(`recorded ${name} ${cfg.name} ${area}`);
        } catch (err) {
          const msg = String(err.message).split('\n')[0];
          out[name][cfg.name][area] = { error: msg };
          console.log(`${cfg.gated ? 'FAIL' : 'INFO'} record ${name} ${cfg.name} ${area}: ${msg}`);
          if (cfg.gated) failed += 1;
        }
      }
    }
    await browser.close();
  }
  await servers.close();
  writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`recorded ${Object.keys(out).join(' + ')} to ${file}`);
  process.exit(failed ? 1 : 0);
}

// ---- check
const baseIdx = rest.indexOf('--base');
if (baseIdx < 0 || !rest[baseIdx + 1]) {
  console.log('FAIL check needs --base <base.json>');
  process.exit(1);
}
const areaIdx = rest.indexOf('--area');
const areaArg = areaIdx >= 0 ? rest[areaIdx + 1] : 'all';
const WANT = areaArg === 'all' ? AREAS : areaArg.split(',');
for (const a of WANT) {
  if (!AREAS.includes(a)) {
    console.log(`FAIL --area must be a comma list of ${AREAS.join(', ')} or all`);
    process.exit(1);
  }
}
const after = JSON.parse(readFileSync(file, 'utf8'));
const base = JSON.parse(readFileSync(rest[baseIdx + 1], 'utf8'));
let pass = 0;
let fail = 0;

const f = (v) => JSON.stringify(v);
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol + 1e-9;
const boxNear = (a, b, tol) =>
  !!a && !!b && ['top', 'left', 'width', 'height'].every((k) => near(a[k], b[k], tol));
const inkNear = (a, b, tol) => !!a && !!b && ['left', 'top', 'right', 'bottom'].every((k) => near(a[k], b[k], tol));

function gate(state, ok, id, detail) {
  if (!state.gated) {
    console.log(`INFO ${state.tag} ${id} ${ok ? 'ok' : 'differs'}: ${detail}`);
    return;
  }
  if (ok) pass += 1;
  else fail += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${state.tag} ${id}: ${detail}`);
}
function info(state, id, detail) {
  console.log(`INFO ${state.tag} ${id}: ${detail}`);
}
// One gate over every li: ok when each li passes; the detail prints both figures per li.
function perLi(state, id, a, b, test, pick) {
  const n = Math.max(a.lis.length, b.lis.length);
  let ok = a.lis.length === b.lis.length;
  const parts = [];
  for (let i = 0; i < n; i += 1) {
    const x = a.lis[i];
    const y = b.lis[i];
    if (!x || !y) {
      ok = false;
      parts.push(`li${i} missing`);
      continue;
    }
    if (!test(x, y)) ok = false;
    parts.push(`li${i} after ${f(pick(x))} base ${f(pick(y))}`);
  }
  gate(state, ok, id, parts.join(' | '));
}

for (const engine of ['webkit', 'chrome']) {
  if (!after[engine] || !base[engine]) {
    console.log(`FAIL ${engine} is missing from ${!after[engine] ? 'the after' : 'the base'} record`);
    fail += 1;
    continue;
  }
  for (const cfg of CONFIGS) {
    const tolDev = 1 / cfg.dpr + 0.011;
    for (const area of WANT) {
      if (area === 'forced' && cfg.name !== '1366 fine') continue;
      const state = { tag: `${engine} ${cfg.name} ${area}`, gated: cfg.gated };
      const a = after[engine]?.[cfg.name]?.[area];
      const b = base[engine]?.[cfg.name]?.[area];
      if (!a || !b || a.error || b.error) {
        gate(state, false, 'record', `after ${a?.error ?? (a ? 'ok' : 'missing')}, base ${b?.error ?? (b ? 'ok' : 'missing')}`);
        continue;
      }
      if (area === 'reading') {
        gate(state, a.ulHtml === b.ulHtml, 'R1 markup identical', `ul class ${f(a.ulClass)} role ${f(a.ulRole)}${a.ulHtml === b.ulHtml ? '' : `; after ${a.ulHtml} base ${b.ulHtml}`}`);
        perLi(state, 'R2 li box within 0.5', a, b, (x, y) => boxNear(x.box, y.box, BOX_TOL), (x) => x.box);
        gate(state, near(a.ulHeight, b.ulHeight, BOX_TOL), 'R2 ul height within 0.5', `after ${a.ulHeight} base ${b.ulHeight}`);
        perLi(state, 'R3 marker ink within 1 device px', a, b, (x, y) => inkNear(x.strip, y.strip, tolDev), (x) => x.strip);
        gate(
          state,
          a.lis.every((x) => x.display === 'list-item' && x.listStyleType === 'disc'),
          'R4 list-item and disc',
          a.lis.map((x) => `${x.display}/${x.listStyleType}`).join(' '),
        );
        continue;
      }
      if (area === 'forced') {
        const real = a.forced.matches && a.forced.really;
        const st = { ...state, gated: cfg.gated && engine === 'chrome' };
        info(state, 'FC forced figures', `after ${f(a.forced)} | base ${f(b.forced)}`);
        gate(st, real, 'FC colours really forced', `matches ${a.forced.matches} really ${a.forced.really}`);
        if (engine === 'chrome') {
          perLi(st, 'FC bullet ink within 1 CSS px of the native disc', a, b, (x, y) => inkNear(x.strip, y.strip, 1), (x) => x.strip);
        } else {
          perLi(st, 'FC bullet ink figures', a, b, () => true, (x) => x.strip);
        }
        continue;
      }
      // create and pen
      const n = a.lis.length;
      const wantNotes = area === 'create' ? 2 : b.lis.length;
      gate(state, n === wantNotes && b.lis.length === wantNotes, 'notes', `after ${n} base ${b.lis.length}`);
      gate(
        state,
        a.ulRole === 'list' && a.ulClass.includes('authored__notes--editing'),
        'E1 ul role and modifier',
        `role ${f(a.ulRole)} class ${f(a.ulClass)}`,
      );
      info(state, 'E1 base', `ul role ${f(b.ulRole)}; li display ${b.lis.map((x) => x.display).join(' ')}`);
      gate(
        state,
        a.lis.every(
          (x) =>
            x.display === 'block' &&
            x.firstChild?.tag === 'SPAN' &&
            x.firstChild.cls === 'authored__note-bullet' &&
            x.firstChild.ariaHidden === 'true' &&
            x.firstChild.text === '' &&
            f(x.fieldChildren) === f(['TEXTAREA', 'BUTTON']),
        ),
        'E1 li structure',
        a.lis.map((x) => `${x.display} first ${f(x.firstChild)} field ${f(x.fieldChildren)}`).join(' | '),
      );
      for (const key of ['box', 'textarea', 'remove', 'field']) {
        perLi(state, `E2 ${key} within 0.5`, a, b, (x, y) => boxNear(x[key], y[key], BOX_TOL), (x) => x[key]);
      }
      gate(state, near(a.ulHeight, b.ulHeight, BOX_TOL), 'E2 ul height within 0.5', `after ${a.ulHeight} base ${b.ulHeight}`);
      perLi(state, 'E3 bullet ink within 1 CSS px of the native disc', a, b, (x, y) => inkNear(x.strip, y.strip, 1), (x) => x.strip);
      perLi(
        state,
        'E4 bullet clear of the box, ink on the first line',
        a,
        b,
        (x) => {
          const bu = x.bullet;
          if (!bu || !x.strip) return false;
          const ta = { top: x.textarea.top - x.box.top, left: x.textarea.left - x.box.left, right: x.textarea.left - x.box.left + x.textarea.width, bottom: x.textarea.top - x.box.top + x.textarea.height };
          const rm = { top: x.remove.top - x.box.top, left: x.remove.left - x.box.left, right: x.remove.left - x.box.left + x.remove.width, bottom: x.remove.top - x.box.top + x.remove.height };
          const hit = (r) => bu.left < r.right && bu.right > r.left && bu.top < r.bottom && bu.bottom > r.top;
          const lineTop = ta.top + x.taPaddingTop;
          return (
            bu.right <= 0.01 &&
            bu.left >= -x.box.left - 0.01 &&
            !hit(ta) &&
            !hit(rm) &&
            x.strip.top >= lineTop - 0.01 &&
            x.strip.bottom <= lineTop + x.taLineHeight + 0.01
          );
        },
        (x) => ({ bullet: x.bullet && { top: x.bullet.top, left: x.bullet.left, right: x.bullet.right, bottom: x.bullet.bottom }, liLeft: x.box.left, ink: x.strip, firstLine: [x.taPaddingTop, x.taLineHeight] }),
      );
      perLi(
        state,
        'E5 dot colour equals the native li colour',
        a,
        b,
        (x, y) => !!x.bullet && x.bullet.before.backgroundColor === y.color,
        (x) => x.bullet?.before ?? null,
      );
      perLi(state, 'E6 textarea text ink within 1 device px', a, b, (x, y) => inkNear(x.textInk, y.textInk, tolDev), (x) => x.textInk);
      perLi(state, 'E6 gap strip has no ink', a, b, (x, y) => x.gapInk === null && y.gapInk === null, (x) => x.gapInk);
      gate(state, a.listitems === wantNotes && b.listitems === wantNotes, 'E7 listitem role queries', `after ${a.listitems} base ${b.listitems}`);
      if (engine === 'chrome') {
        gate(
          state,
          a.ax?.ulRole === 'list' && a.ax.listitems === wantNotes && a.ax.bulletIgnored === true,
          'E7 Chrome AX tree',
          `after ${f(a.ax)}`,
        );
        info(state, 'E7 Chrome AX base', f(b.ax));
      }
    }
  }
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
