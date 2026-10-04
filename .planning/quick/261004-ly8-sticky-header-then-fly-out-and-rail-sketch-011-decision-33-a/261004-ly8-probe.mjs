// Quick task 261004-ly8's probe: the sticky App header, the fly-out (724 to 1589)
// and the pinned rail (from 1590), sketch 011 decision 33 (brief tasks 5 and 6).
// Measures the BUILT app (app/dist) in Playwright's WebKit and system Chrome and,
// in the `board` group, against the sketch 011 boards. A reading here is evidence
// about two engines, not about Mark's iPad or iPhone; the device is his to check.
//
//   node 261004-ly8-probe.mjs baseline   (build of the unchanged source; writes the JSON)
//   node 261004-ly8-probe.mjs header     (the bar, the wordmark link, scroll checks)
//   groups combine with commas: header,flyout,rail,board
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers;
// never requests Mark's :4173 preview, the dev server on :5173 or the sketch
// server on :8011, and starts no Vite process. Everything runs in throwaway
// browser contexts and nothing is saved.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, APP_ROUTE, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-ly8-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;

const DIVIDER = 'rgb(214, 218, 215)';
const WHITE = 'rgb(255, 255, 255)';
const INK = 'rgb(20, 20, 20)';

// ---------------------------------------------------------------------------
// The cells. One fresh context per cell.
function cellKey(c) {
  return `${c.engine}-${c.coarse ? 'coarse' : 'fine'}-${c.width}${c.height && c.height !== 900 ? `x${c.height}` : ''}-${c.route === '/' ? 'home' : 'batch'}`;
}
function cells() {
  const out = [];
  for (const w of [393, 723, 744, 834, 983, 984, 1024, 1366]) out.push({ engine: 'webkit', coarse: true, width: w, route: APP_ROUTE });
  for (const w of [1366, 1589, 1590, 1600, 1920]) out.push({ engine: 'webkit', coarse: false, width: w, route: APP_ROUTE });
  for (const w of [393, 744, 984, 1366, 1600, 1920]) out.push({ engine: 'chrome', coarse: false, width: w, route: APP_ROUTE });
  out.push({ engine: 'webkit', coarse: true, width: 393, route: '/' });
  out.push({ engine: 'webkit', coarse: true, width: 1024, route: '/' });
  out.push({ engine: 'webkit', coarse: false, width: 1600, route: '/' });
  return out.map((c) => ({ ...c, height: c.height ?? 900, key: cellKey({ ...c, height: c.height ?? 900 }) }));
}

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). Every box is { x, y, w, h },
// relative to the viewport, rounded to 0.01.
function readApp() {
  const r = (n) => Math.round(n * 100) / 100;
  const box = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: r(b.x), y: r(b.y), w: r(b.width), h: r(b.height) };
  };
  const css = (el) => getComputedStyle(el);
  const head = document.querySelector('.shell__head');
  const brandP = document.querySelector('.shell__brand');
  const brandA = brandP.querySelector('a');
  let brandBox;
  if (brandA) brandBox = box(brandA);
  else {
    const range = document.createRange();
    range.selectNodeContents(brandP);
    const b = range.getBoundingClientRect();
    brandBox = { x: r(b.x), y: r(b.y), w: r(b.width), h: r(b.height) };
  }
  const hs = css(head);
  const rail = document.querySelector('.shell__rail');
  const rs = rail ? css(rail) : null;
  const tabs = document.querySelector('.shell__tabs');
  const menu = document.querySelector('.shell__menu');
  const scrim = document.querySelector('.shell__scrim');
  const main = document.querySelector('.shell__main');
  const sheet = document.querySelector('.recipe-page');
  const status = document.querySelector('.page-status');
  const blockedBy = [];
  for (let el = head.parentElement; el; el = el.parentElement) {
    const s = css(el);
    const bad = [];
    if (s.overflowX !== 'visible' || s.overflowY !== 'visible') bad.push(`overflow ${s.overflowX}/${s.overflowY}`);
    if (!['none', 'auto', 'normal'].includes(s.contain)) bad.push(`contain ${s.contain}`);
    if (s.transform !== 'none') bad.push(`transform ${s.transform}`);
    if (s.filter !== 'none') bad.push(`filter ${s.filter}`);
    if (s.perspective !== 'none') bad.push(`perspective ${s.perspective}`);
    if (s.willChange !== 'auto') bad.push(`willChange ${s.willChange}`);
    if (bad.length) blockedBy.push({ el: el.tagName + (el.className ? `.${el.className}` : ''), bad });
  }
  return {
    head: {
      box: box(head),
      position: hs.position,
      padding: `${hs.paddingTop} ${hs.paddingRight} ${hs.paddingBottom} ${hs.paddingLeft}`,
      borderBottomWidth: hs.borderBottomWidth,
      borderBottomColor: hs.borderBottomColor,
      zIndex: hs.zIndex,
      flexWrap: hs.flexWrap,
      backgroundColor: hs.backgroundColor,
    },
    brand: {
      box: brandBox,
      pBox: box(brandP),
      hasLink: Boolean(brandA),
      href: brandA ? brandA.getAttribute('href') : null,
      tabindex: brandA ? brandA.getAttribute('tabindex') : null,
      classList: brandA ? brandA.className : null,
      color: brandA ? css(brandA).color : null,
      textDecorationLine: brandA ? css(brandA).textDecorationLine : null,
    },
    sprinkles: box(document.querySelector('.shell__sprinkles')),
    menu: menu
      ? {
          box: box(menu),
          ariaLabel: menu.getAttribute('aria-label'),
          ariaExpanded: menu.getAttribute('aria-expanded'),
          ariaControls: menu.getAttribute('aria-controls'),
          tabindex: menu.getAttribute('tabindex'),
          svgBox: box(menu.querySelector('svg')),
          svgTransform: css(menu.querySelector('svg')).transform,
        }
      : null,
    tools: [...document.querySelectorAll('.shell__tools > .shell__place')].map((el) => ({
      text: el.textContent.trim(),
      box: box(el),
      display: css(el).display,
    })),
    rail: rail
      ? {
          box: box(rail),
          display: rs.display,
          position: rs.position,
          top: rs.top,
          height: rs.height,
          overflowY: rs.overflowY,
          boxShadow: rs.boxShadow,
          zIndex: rs.zIndex,
          borderRight: `${rs.borderRightWidth} ${rs.borderRightStyle} ${rs.borderRightColor}`,
          padding: `${rs.paddingTop} ${rs.paddingRight} ${rs.paddingBottom} ${rs.paddingLeft}`,
          backgroundColor: rs.backgroundColor,
          open: rail.classList.contains('shell__rail--open'),
          id: rail.id,
          clientHeight: rail.clientHeight,
          scrollHeight: rail.scrollHeight,
          places: [...rail.querySelectorAll('.shell__place')].map((el) => box(el)),
        }
      : null,
    tabs: tabs ? { box: box(tabs), display: css(tabs).display } : null,
    scrim: scrim ? { box: box(scrim), zIndex: css(scrim).zIndex, backgroundColor: css(scrim).backgroundColor } : null,
    main: { box: box(main), paddingBottom: css(main).paddingBottom, inert: main.hasAttribute('inert') },
    sheet: box(sheet),
    docH: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    scrollY: window.scrollY,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    scrollPadding: css(document.documentElement).scrollPaddingTop,
    blockedBy,
    pageStatusZ: status ? css(status).zIndex : null,
    pathname: location.pathname,
  };
}

// The shared scroll checks, run after the reader.
async function scrollChecks(page) {
  const s1 = await page.evaluate(() => {
    window.scrollTo(0, 1500);
    return Math.round(document.querySelector('.shell__head').getBoundingClientRect().top * 100) / 100;
  });
  // s2: scrollIntoView({block:'start'}) on #batch. A window can only scroll as far as the document's foot,
  // so at 900 tall #batch is out of reach where it sits in the document's last screen (its top then
  // reads the clamp, not the scroll padding): s2reachable says whether 900 can show the padding at all,
  // and s2short repeats the scroll in a 450-tall window, where #batch is reachable at every width.
  const s2 = await page.evaluate(() => {
    window.scrollTo(0, 0);
    const target = document.querySelector('#batch');
    if (!target) return null;
    const docTop = target.getBoundingClientRect().top + window.scrollY;
    const reachable = docTop <= document.documentElement.scrollHeight - window.innerHeight + 57;
    target.scrollIntoView({ block: 'start' });
    return { top: Math.round(target.getBoundingClientRect().top * 100) / 100, reachable };
  });
  const s3 = await page.evaluate(() => {
    const status = document.querySelector('.page-status');
    if (!status) return null;
    status.textContent = 'Saved';
    window.scrollTo(0, 0);
    const head = document.querySelector('.shell__head');
    const headFoot = head.getBoundingClientRect().bottom;
    const docTop = status.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, docTop - (headFoot - 20)));
    const sb = status.getBoundingClientRect();
    const hb = head.getBoundingClientRect();
    const y = (Math.max(sb.top, 0) + Math.min(sb.bottom, hb.bottom)) / 2;
    const x = sb.left + 4;
    const overlap = sb.top < hb.bottom && sb.bottom > hb.top && y < hb.bottom;
    const hit = document.elementFromPoint(x, y);
    const result = { overlap, hitInHead: Boolean(hit && head.contains(hit)), scrollY: window.scrollY };
    status.textContent = '';
    window.scrollTo(0, 0);
    return result;
  });
  const height = page.viewportSize().height;
  await page.setViewportSize({ width: page.viewportSize().width, height: 450 });
  const s2short = await page.evaluate(() => {
    window.scrollTo(0, 0);
    const target = document.querySelector('#batch');
    if (!target) return null;
    target.scrollIntoView({ block: 'start' });
    return Math.round(target.getBoundingClientRect().top * 100) / 100;
  });
  await page.setViewportSize({ width: page.viewportSize().width, height });
  return { s1, s2: s2 ? s2.top : null, s2reachable: s2 ? s2.reachable : null, s2short, s3 };
}

async function newContext(browser, c) {
  const context = await browser.newContext({
    viewport: { width: c.width, height: c.height ?? 900 },
    hasTouch: c.coarse,
    isMobile: false,
    deviceScaleFactor: 1,
  });
  await context.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
  return context;
}

async function openCell(browser, servers, c) {
  const context = await newContext(browser, c);
  const page = await context.newPage();
  await page.goto(`${servers.appUrl}${c.route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.shell');
  if (c.route.startsWith('/notebook')) await page.waitForSelector('.recipe-page');
  const state = await page.evaluate(() => ({ coarse: window.matchMedia('(pointer: coarse)').matches, w: window.innerWidth }));
  if (state.coarse !== c.coarse || state.w !== c.width) {
    await context.close();
    throw new Error(`${c.key}: expected coarse ${c.coarse} at ${c.width}, got coarse ${state.coarse} at ${state.w}`);
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  });
  return { context, page };
}

async function readCell(browser, servers, c) {
  const { context, page } = await openCell(browser, servers, c);
  try {
    const app = await page.evaluate(readApp);
    const scroll = await scrollChecks(page);
    return { ...app, ...scroll };
  } finally {
    await context.close();
  }
}

async function withBrowsers(servers, fn) {
  const browsers = { webkit: await webkit.launch(), chrome: await launch() };
  try {
    return await fn(browsers);
  } finally {
    await browsers.webkit.close();
    await browsers.chrome.close();
  }
}

async function readAllCells(servers, list) {
  const readings = {};
  await withBrowsers(servers, async (browsers) => {
    for (const c of list) readings[c.key] = await readCell(browsers[c.engine], servers, c);
  });
  return readings;
}

// ---------------------------------------------------------------------------
// baseline: the as-built facts the plan states, asserted before any edit.
async function runBaseline(servers) {
  const list = cells();
  const readings = await readAllCells(servers, list);
  for (const c of list) {
    const m = readings[c.key];
    const k = c.key;
    const wide = c.width >= 984;
    // 62 below the rail is WebKit's reading (the plan's); Chrome's wordmark line is 26 tall and the header 63.
    const phoneH = c.engine === 'webkit' ? 62 : 63;
    countedCheck(near(m.head.box.h, wide ? 68 : phoneH), `${k}: as-built header is ${wide ? 68 : phoneH} (got ${m.head.box.h})`);
    countedCheck(m.head.position === 'static', `${k}: header is static (got ${m.head.position})`);
    countedCheck(m.blockedBy.length === 0, `${k}: no ancestor of the header blocks sticky (${JSON.stringify(m.blockedBy)})`);
    if (c.route === APP_ROUTE) countedCheck(m.pageStatusZ === '10', `${k}: .page-status z-index is 10 (got ${m.pageStatusZ})`);
    if (wide) {
      countedCheck(m.rail.display === 'flex' && near(m.rail.box.x, 0) && near(m.rail.box.w, 224), `${k}: rail in flow at x 0, 224 wide`);
      countedCheck(m.tabs.display === 'none', `${k}: tab row hidden`);
    } else {
      countedCheck(m.rail.display === 'none', `${k}: rail hidden`);
      countedCheck(m.tabs.display === 'flex', `${k}: tab row shown`);
    }
    console.log(JSON.stringify({ cell: k, head: m.head.box, brand: m.brand.box, rail: m.rail.display, tabs: m.tabs.display, sheet: m.sheet, s2: m.s2 }));
  }
  if (failures.length === 0) {
    await writeFile(BASELINE_PATH, `${JSON.stringify({ capturedAt: new Date().toISOString(), cells: readings }, null, 2)}\n`);
    console.log(`baseline written: ${path.basename(BASELINE_PATH)}`);
  } else {
    console.log('baseline NOT written: a plan-time fact differs');
  }
}

async function loadBaseline() {
  return JSON.parse(await readFile(BASELINE_PATH, 'utf8')).cells;
}

// ---------------------------------------------------------------------------
// The three shell states by width (sketch 011 decision 33): the phone below
// 724, the sticky bar with the fly-out from 724 to 1589, the bar with the rail
// from 1590. stateOf is the one place that says which a width is in.
function stateOf(width) {
  if (width < 724) return 'phone';
  return width < 1590 ? 'flyout' : 'rail';
}

// The Sheet's width in the fly-out state, per window (the plan's boards): the
// window less 64 down to 920 at 984, 960 at 1024, 920 at 1366 where the log
// moves beside it, then the Sheet's 1100 maximum.
const FLYOUT_SHEET_W = { 744: 680, 834: 770, 983: 919, 984: 920, 1024: 960, 1366: 920, 1589: 1100 };

// Fields that must equal the baseline below the bar (the phone arrangement).
function phoneEqualsBaseline(k, m, b) {
  countedCheck(near(m.head.box.h, b.head.box.h) && near(m.head.box.y, b.head.box.y), `${k}: header box equals baseline (${JSON.stringify(m.head.box)} vs ${JSON.stringify(b.head.box)})`);
  countedCheck(m.head.position === b.head.position && m.head.padding === b.head.padding && m.head.flexWrap === b.head.flexWrap, `${k}: header position, padding and wrap equal baseline`);
  countedCheck(m.head.borderBottomWidth === b.head.borderBottomWidth, `${k}: header border equals baseline`);
  for (const f of ['x', 'y', 'w', 'h']) countedCheck(near(m.brand.box[f], b.brand.box[f]), `${k}: wordmark ${f} equals baseline (${m.brand.box[f]} vs ${b.brand.box[f]})`);
  countedCheck(JSON.stringify(m.sprinkles) === JSON.stringify(b.sprinkles), `${k}: sprinkles equal baseline`);
  countedCheck(m.tools.length === b.tools.length && m.tools.every((t, i) => t.display === b.tools[i].display && JSON.stringify(t.box) === JSON.stringify(b.tools[i].box)), `${k}: tools equal baseline`);
  countedCheck(m.rail.display === b.rail.display, `${k}: rail display equals baseline`);
  countedCheck(m.tabs.display === b.tabs.display && JSON.stringify(m.tabs.box) === JSON.stringify(b.tabs.box), `${k}: tab row equals baseline`);
  countedCheck(JSON.stringify(m.main.box) === JSON.stringify(b.main.box) && m.main.paddingBottom === b.main.paddingBottom, `${k}: main equals baseline`);
  countedCheck(JSON.stringify(m.sheet) === JSON.stringify(b.sheet), `${k}: sheet equals baseline`);
  countedCheck(near(m.docH, b.docH) && m.overflow === b.overflow, `${k}: document height and overflow equal baseline`);
  countedCheck(near(m.s1, b.s1) && (m.s2 === b.s2 || near(m.s2, b.s2)), `${k}: scroll readings equal baseline (s1 ${m.s1}/${b.s1}, s2 ${m.s2}/${b.s2})`);
  if (m.s2short !== null) countedCheck(near(m.s2short, 0), `${k}: #batch scrolls to ${m.s2short} in a 450-tall window, want 0 (no scroll padding)`);
  countedCheck(m.scrim === null && m.menu === null, `${k}: no scrim and no menu button`);
}

// The sticky bar, common to every width from the bar's first.
function barChecks(k, m, b, c, base) {
  countedCheck(near(m.head.box.h, 57) && near(m.head.box.y, 0) && near(m.head.box.x, 0) && near(m.head.box.w, c.width), `${k}: bar is 57 tall at 0,0 and the window wide (${JSON.stringify(m.head.box)})`);
  countedCheck(m.head.position === 'sticky', `${k}: bar is sticky (${m.head.position})`);
  countedCheck(m.head.padding === '6px 48px 6px 48px', `${k}: bar padding 6px 48px (${m.head.padding})`);
  countedCheck(m.head.borderBottomWidth === '1px' && m.head.borderBottomColor === DIVIDER, `${k}: bar hairline 1px ${DIVIDER} (${m.head.borderBottomWidth} ${m.head.borderBottomColor})`);
  countedCheck(m.head.backgroundColor === WHITE, `${k}: bar is the opaque App ground (${m.head.backgroundColor})`);
  countedCheck(m.head.flexWrap === 'nowrap', `${k}: bar does not wrap (${m.head.flexWrap})`);
  countedCheck(Number(m.head.zIndex) > Number(m.pageStatusZ ?? 10), `${k}: bar z-index ${m.head.zIndex} above the notice ${m.pageStatusZ ?? 10}`);
  countedCheck(near(m.s1, 0), `${k}: scrolled 1500, the bar's top is ${m.s1}`);
  countedCheck(m.blockedBy.length === 0, `${k}: no ancestor blocks sticky (${JSON.stringify(m.blockedBy)})`);
  countedCheck(m.scrollPadding === '57px', `${k}: html scroll-padding-top 57px (${m.scrollPadding})`);
  if (m.s2short !== null) countedCheck(near(m.s2short, 57), `${k}: #batch scrolls to ${m.s2short} in a 450-tall window, want 57`);
  if (m.s2 !== null && m.s2reachable) countedCheck(near(m.s2, 57), `${k}: #batch scrolls to ${m.s2} where 900 can reach it, want 57`);
  if (m.s3 !== null) countedCheck(m.s3.overlap && m.s3.hitInHead, `${k}: the notice never paints over the bar (${JSON.stringify(m.s3)})`);
  countedCheck(m.brand.hasLink && m.brand.href === '/' && m.brand.tabindex === '0' && !String(m.brand.classList).includes('shell__place'), `${k}: wordmark is a link to / with tabindex 0`);
  countedCheck(m.brand.color === INK && m.brand.textDecorationLine === 'none', `${k}: wordmark ink, no underline (${m.brand.color}, ${m.brand.textDecorationLine})`);
  // The boards were drawn in WebKit: 96.27 x 25.91 at y 9.04, sprinkles at y 41. Chrome sets the same text
  // 97.75 x 26, so there the box must equal the baseline's own text box and sit centred in the 44px row.
  const wy = 6 + (44 - (m.brand.box.h + 6 + 6)) / 2;
  countedCheck(near(m.brand.box.w, b.brand.box.w) && near(m.brand.box.h, b.brand.box.h) && near(m.brand.box.y, wy), `${k}: wordmark box equals baseline's text and sits centred in the bar (${JSON.stringify(m.brand.box)}, want y ${wy})`);
  if (c.engine === 'webkit') countedCheck(near(m.brand.box.w, 96.27) && near(m.brand.box.h, 25.91) && near(m.brand.box.y, 9.04) && near(m.sprinkles.y, 41), `${k}: WebKit wordmark 96.27 x 25.91 at y 9.04, sprinkles at y 41 (${JSON.stringify(m.brand.box)}, ${m.sprinkles.y})`);
  countedCheck(near(m.sprinkles.w, 114) && near(m.sprinkles.h, 6), `${k}: sprinkles 114 x 6 (${JSON.stringify(m.sprinkles)})`);
  // The tools sit 20 apart with Export's right edge at the window less 48; their widths are the engine's own
  // (WebKit 110.95, 108.41, 108.16 on the boards), read from the baseline's 1366 cell.
  const ref = toolRef(base, c);
  const widths = ref.tools.map((t) => t.box.w);
  let right = c.width - 48;
  const wantX = [];
  for (let i = 2; i >= 0; i -= 1) {
    wantX[i] = right - widths[i];
    right = wantX[i] - 20;
  }
  countedCheck(m.tools.length === 3 && m.tools.every((t, i) => near(t.box.y, 6) && near(t.box.h, 44) && near(t.box.w, widths[i]) && near(t.box.x, wantX[i])), `${k}: tools at y 6, 44 tall, 20 apart, Export's right edge at the window less 48 (${JSON.stringify(m.tools.map((t) => t.box))})`);
  countedCheck(near(m.main.box.y, 57), `${k}: main starts at 57 (${m.main.box.y})`);
  countedCheck(m.overflow === 0, `${k}: no horizontal overflow (${m.overflow})`);
}

// The tools' widths are the engine's own and do not move with the window: read them from the baseline's 1366 cell.
function toolRef(base, c) {
  return base[`${c.engine}-${c.coarse ? 'coarse' : 'fine'}-1366-batch`];
}

// From 724 to 1589, closed: the menu button stands left of the wordmark, no rail, no tab row, main is the window.
function flyoutClosedChecks(k, m, c) {
  countedCheck(m.menu !== null && near(m.menu.box.x, 42) && near(m.menu.box.y, 6) && near(m.menu.box.w, 44) && near(m.menu.box.h, 44), `${k}: menu button at x 42, y 6, 44 x 44 (${JSON.stringify(m.menu?.box)})`);
  countedCheck(m.menu !== null && near(m.menu.svgBox.x, 54) && near(m.menu.svgBox.y, 18) && near(m.menu.svgBox.w, 20) && near(m.menu.svgBox.h, 20) && m.menu.svgTransform === 'matrix(0, 1, -1, 0, 0, 0)', `${k}: menu icon 20 x 20 at 54,18 turned upright (${JSON.stringify(m.menu?.svgBox)}, ${m.menu?.svgTransform})`);
  countedCheck(m.menu !== null && m.menu.ariaLabel === 'Places' && m.menu.ariaExpanded === 'false' && m.menu.ariaControls === 'places' && m.menu.tabindex === '0', `${k}: menu button labelled Places, collapsed, controlling #places`);
  countedCheck(near(m.brand.box.x, 92), `${k}: wordmark at x 92 (${m.brand.box.x})`);
  countedCheck(near(m.sprinkles.x, 92), `${k}: sprinkles at x 92 (${m.sprinkles.x})`);
  countedCheck(m.rail.display === 'none' && m.rail.id === 'places' && !m.rail.open, `${k}: the nav is the closed panel (display ${m.rail.display})`);
  countedCheck(m.tabs.display === 'none', `${k}: no tab row (${m.tabs.display})`);
  countedCheck(near(m.main.box.x, 0) && near(m.main.box.w, c.width) && m.main.paddingBottom === '0px', `${k}: main is the whole window with no tab-row padding (${JSON.stringify(m.main.box)}, ${m.main.paddingBottom})`);
  if (m.sheet) {
    const want = FLYOUT_SHEET_W[c.width];
    countedCheck(near(m.sheet.w, want) && (c.width === 1589 || near(m.sheet.x, 32)), `${k}: Sheet ${want} wide${c.width === 1589 ? '' : ' at x 32'} (${m.sheet.x}/${m.sheet.w})`);
  }
}

// From 1590: no menu button, the wordmark at the gutter, the rail in the flex row beside main.
function railState(k, m, b) {
  countedCheck(m.menu === null, `${k}: no menu button`);
  countedCheck(near(m.brand.box.x, 48) && near(m.sprinkles.x, 48), `${k}: wordmark and sprinkles at x 48 (${m.brand.box.x}, ${m.sprinkles.x})`);
  countedCheck(m.rail.display === 'flex' && near(m.rail.box.x, 0) && near(m.rail.box.w, 224) && !m.rail.open, `${k}: rail flex at x 0, 224 wide (${JSON.stringify(m.rail.box)})`);
  countedCheck(m.tabs.display === 'none', `${k}: no tab row`);
  countedCheck(near(m.main.box.x, 224) && near(m.main.box.w, m.main.box.w) && near(m.main.box.x + m.main.box.w, m.head.box.w), `${k}: main beside the rail (${JSON.stringify(m.main.box)})`);
  if (m.sheet) countedCheck(near(m.sheet.x, b.sheet.x) && near(m.sheet.w, b.sheet.w), `${k}: Sheet x and width equal baseline (${m.sheet.x}/${m.sheet.w} vs ${b.sheet.x}/${b.sheet.w})`);
}

async function runHeader(servers) {
  const base = await loadBaseline();
  const list = cells();
  const readings = await readAllCells(servers, list);
  for (const c of list) {
    const m = readings[c.key];
    const b = base[c.key];
    const k = c.key;
    const state = stateOf(c.width);
    if (state === 'phone') {
      phoneEqualsBaseline(k, m, b);
    } else {
      barChecks(k, m, b, c, base);
      countedCheck(m.scrim === null && (m.main.inert === false), `${k}: no scrim, main not inert`);
      if (state === 'flyout') flyoutClosedChecks(k, m, c);
      else railState(k, m, b);
    }
    console.log(JSON.stringify({ cell: k, state: stateOf(c.width), headH: m.head.box.h, headTopScrolled: m.s1, wordmarkX: m.brand.box.x, rail: m.rail.display, tabs: m.tabs.display, mainX: m.main.box.x, mainW: m.main.box.w, sheetW: m.sheet?.w ?? null, s2: m.s2, s2reachable: m.s2reachable, s2short: m.s2short, overflow: m.overflow }));
  }

  // The wordmark goes Home: one WebKit 1366 cell clicks it.
  await withBrowsers(servers, async (browsers) => {
    const c = { engine: 'webkit', coarse: false, width: 1366, height: 900, route: APP_ROUTE, key: 'webkit-fine-1366-wordmark-click' };
    const { context, page } = await openCell(browsers.webkit, servers, c);
    try {
      await page.locator('.shell__brand a').click();
      await page.waitForFunction(() => location.pathname === '/');
      const mounted = await page.evaluate(() => Boolean(document.querySelector('.shell')));
      countedCheck(mounted, `${c.key}: the wordmark goes to / with the shell still mounted`);
    } finally {
      await context.close();
    }
  });
}


// ---------------------------------------------------------------------------
// flyout: the fly-out from 724 to 1589, closed and open, its keyboard and
// pointer behaviour, and the two cuts crossed while open.
const FLYOUT_PLACES_Y = [63, 120, 164, 208, 265, 309];

function flyoutCells() {
  const out = [];
  for (const w of [744, 834, 983, 984, 1024, 1366]) out.push({ engine: 'webkit', coarse: true, width: w });
  for (const w of [1366, 1589]) out.push({ engine: 'webkit', coarse: false, width: w });
  for (const w of [744, 984, 1366]) out.push({ engine: 'chrome', coarse: false, width: w });
  return out.map((c) => ({ ...c, route: APP_ROUTE, height: 900, key: cellKey({ ...c, route: APP_ROUTE, height: 900 }) }));
}

// A tap at the menu button's centre. Playwright's own click scrolls a sticky element "into view" by its
// static position (the page jumps to the top in Chrome and by 51 in WebKit), which a finger never does,
// so the probe taps at the button's coordinates instead.
async function clickMenu(page) {
  const b = await page.locator('.shell__menu').boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}

const focusInfo = (page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    return { tag: a.tagName, href: a.getAttribute('href'), cls: a.className, label: a.getAttribute('aria-label'), inNav: Boolean(a.closest('#places')) };
  });

// What an open panel must read, against the boards (nav-candidates.css GO), relative to the window.
function openChecks(k, o, c, scrollBefore) {
  const win = { w: c.width, h: c.height };
  countedCheck(o.menu.ariaExpanded === 'true', `${k}: open, aria-expanded true`);
  countedCheck(o.rail.position === 'fixed' && o.rail.open, `${k}: open panel is fixed with the open class (${o.rail.position})`);
  countedCheck(near(o.rail.box.x, 0) && near(o.rail.box.y, 57) && near(o.rail.box.w, 224) && near(o.rail.box.h, win.h - 57), `${k}: panel x 0, y 57, 224 wide, window less 57 tall (${JSON.stringify(o.rail.box)})`);
  countedCheck(o.rail.zIndex === '5' && o.rail.backgroundColor === WHITE, `${k}: panel z-index 5 on the App ground (${o.rail.zIndex}, ${o.rail.backgroundColor})`);
  countedCheck(o.rail.boxShadow === 'rgba(20, 20, 20, 0.18) 4px 0px 16px 0px', `${k}: panel shadow (${o.rail.boxShadow})`);
  countedCheck(o.rail.borderRight === `1px solid ${DIVIDER}` && o.rail.padding === '6px 20px 32px 20px', `${k}: panel hairline and padding (${o.rail.borderRight}, ${o.rail.padding})`);
  countedCheck(o.rail.places.length === 6 && o.rail.places.every((p, i) => near(p.x, 20) && near(p.w, 183) && near(p.h, 44) && near(p.y, FLYOUT_PLACES_Y[i])), `${k}: six places at x 20, 183 wide, y ${FLYOUT_PLACES_Y.join(', ')} (${JSON.stringify(o.rail.places.map((p) => [p.x, p.y, p.w]))})`);
  countedCheck(o.scrim !== null && near(o.scrim.box.x, 0) && near(o.scrim.box.y, 57) && near(o.scrim.box.w, win.w) && near(o.scrim.box.h, win.h - 57) && o.scrim.backgroundColor === 'rgba(20, 20, 20, 0.28)', `${k}: scrim x 0, y 57, window wide, window less 57 tall, 28% ink (${JSON.stringify(o.scrim)})`);
  countedCheck(o.scrim !== null && o.scrim.zIndex === '4', `${k}: scrim z-index 4`);
  countedCheck(o.main.inert === true, `${k}: main inert`);
  countedCheck(near(o.scrollY, scrollBefore), `${k}: the page did not move on opening (${scrollBefore} -> ${o.scrollY})`);
  countedCheck(o.hits.homeFocused, `${k}: focus is on Home in the panel (${JSON.stringify(o.hits.focus)})`);
  countedCheck(o.hits.atMenu, `${k}: the menu button is on top at its centre (the bar stays live)`);
  countedCheck(o.hits.atScrim, `${k}: the scrim is on top at the window's right edge`);
  countedCheck(o.hits.headerNotInert, `${k}: the bar is not inert`);
}

async function readOpen(page) {
  const o = await page.evaluate(readApp);
  o.hits = await page.evaluate(() => {
    const menu = document.querySelector('.shell__menu');
    const mb = menu.getBoundingClientRect();
    const atMenu = document.elementFromPoint(mb.x + mb.width / 2, mb.y + mb.height / 2);
    const atScrim = document.elementFromPoint(window.innerWidth - 40, window.innerHeight / 2);
    const a = document.activeElement;
    return {
      atMenu: Boolean(atMenu && menu.contains(atMenu)),
      atScrim: Boolean(atScrim && atScrim.classList.contains('shell__scrim')),
      homeFocused: a.getAttribute('href') === '/' && Boolean(a.closest('#places')),
      focus: { tag: a.tagName, href: a.getAttribute('href') },
      headerNotInert: !document.querySelector('.shell__head').hasAttribute('inert'),
    };
  });
  return o;
}

async function interactions(browsers, servers, engine, coarse, width) {
  const name = `${engine}-${coarse ? 'coarse' : 'fine'}-${width}`;
  const base = { engine, coarse, width, height: 900, route: APP_ROUTE };
  const fresh = async (extra = {}) => openCell(browsers[engine], servers, { ...base, ...extra, key: `${name}-interaction` });
  const open = async (page) => {
    await clickMenu(page);
    await page.waitForSelector('.shell__scrim');
  };
  const settle = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

  // Tab walks the six places, then wraps to the menu button; Shift+Tab wraps back.
  {
    const { context, page } = await fresh();
    try {
      await open(page);
      const hrefs = ['/notebook', '/recipe-book', '/idea-log', '/ingredients', '/kitchen'];
      for (const href of hrefs) {
        await page.keyboard.press('Tab');
        const f = await focusInfo(page);
        countedCheck(f.href === href && f.inNav, `${name}: Tab walks to ${href} (${JSON.stringify(f)})`);
      }
      await page.keyboard.press('Tab');
      const wrapped = await focusInfo(page);
      countedCheck(wrapped.tag === 'BUTTON' && wrapped.label === 'Places', `${name}: Tab from Kitchen wraps to the menu button (${JSON.stringify(wrapped)})`);
      await page.keyboard.press('Shift+Tab');
      const back = await focusInfo(page);
      countedCheck(back.href === '/kitchen', `${name}: Shift+Tab from the menu button returns to Kitchen (${JSON.stringify(back)})`);
    } finally {
      await context.close();
    }
  }
  // Escape.
  {
    const { context, page } = await fresh();
    try {
      await open(page);
      await page.keyboard.press('Escape');
      await settle(page);
      const f = await focusInfo(page);
      const o = await page.evaluate(readApp);
      countedCheck(o.scrim === null && o.rail.display === 'none' && !o.main.inert && f.label === 'Places', `${name}: Escape closes it, main is live, focus on the menu button (${JSON.stringify(f)})`);
    } finally {
      await context.close();
    }
  }
  // The scrim, a tap at the right edge.
  {
    const { context, page } = await fresh();
    try {
      await open(page);
      await page.mouse.click(width - 40, 450);
      await settle(page);
      const f = await focusInfo(page);
      const o = await page.evaluate(readApp);
      countedCheck(o.scrim === null && !o.main.inert && f.label === 'Places', `${name}: a scrim tap closes it, focus on the menu button (${JSON.stringify(f)})`);
    } finally {
      await context.close();
    }
  }
  // The menu button closes it.
  {
    const { context, page } = await fresh();
    try {
      await open(page);
      await clickMenu(page);
      await settle(page);
      const o = await page.evaluate(readApp);
      countedCheck(o.scrim === null && !o.main.inert && o.menu.ariaExpanded === 'false', `${name}: the menu button closes it`);
    } finally {
      await context.close();
    }
  }
  // A place chosen.
  {
    const { context, page } = await fresh();
    try {
      await open(page);
      await page.locator('#places a[href="/notebook"]').click();
      await page.waitForFunction(() => location.pathname === '/notebook');
      await settle(page);
      const f = await focusInfo(page);
      const o = await page.evaluate(readApp);
      countedCheck(o.pathname === '/notebook' && o.scrim === null && !o.main.inert && f.label === 'Places', `${name}: choosing Notebook goes there and closes it, focus on the menu button (${o.pathname}, ${JSON.stringify(f)})`);
    } finally {
      await context.close();
    }
  }
  // Escape does not discard an untouched Next version pen; the same Escape with the fly-out closed does.
  {
    const { context, page } = await fresh();
    try {
      await page.getByRole('button', { name: 'Next version' }).first().click();
      const field = page.getByLabel('Version name');
      await field.waitFor({ state: 'visible' });
      await open(page);
      await page.keyboard.press('Escape');
      await settle(page);
      const closed = (await page.evaluate(readApp)).scrim === null;
      const stillOpen = await field.isVisible();
      countedCheck(closed && stillOpen, `${name}: Escape closes the fly-out and leaves the untouched pen open (flyout closed ${closed}, pen visible ${stillOpen})`);
      await page.keyboard.press('Escape');
      await settle(page);
      const penGone = !(await field.isVisible().catch(() => false));
      countedCheck(penGone, `${name}: a second Escape, fly-out closed, does close the untouched pen (the pen's own listener is alive)`);
    } finally {
      await context.close();
    }
  }
}

async function crossings(browsers, servers, engine, coarse) {
  const name = `${engine}-${coarse ? 'coarse' : 'fine'}`;
  const settle = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  // 1589 -> 1590: the rail takes over.
  {
    const c = { engine, coarse, width: 1589, height: 900, route: APP_ROUTE, key: `${name}-1589-crossing` };
    const { context, page } = await openCell(browsers[engine], servers, c);
    try {
      await clickMenu(page);
      await page.waitForSelector('.shell__scrim');
      await page.setViewportSize({ width: 1590, height: 900 });
      await settle(page);
      const o = await page.evaluate(readApp);
      countedCheck(o.menu === null && o.scrim === null && !o.main.inert && !o.rail.open && o.rail.display === 'flex' && near(o.rail.box.x, 0) && near(o.rail.box.w, 224) && near(o.main.box.x, 224), `${name}: open at 1589, growing to 1590 hands over to the rail (menu ${o.menu}, scrim ${o.scrim}, inert ${o.main.inert}, rail ${o.rail.display} ${JSON.stringify(o.rail.box)}, main x ${o.main.box.x})`);
    } finally {
      await context.close();
    }
  }
  // 724 -> 723: the tab row takes over.
  {
    const c = { engine, coarse, width: 724, height: 900, route: APP_ROUTE, key: `${name}-724-crossing` };
    const { context, page } = await openCell(browsers[engine], servers, c);
    try {
      await clickMenu(page);
      await page.waitForSelector('.shell__scrim');
      await page.setViewportSize({ width: 723, height: 900 });
      await settle(page);
      const o = await page.evaluate(readApp);
      countedCheck(o.menu === null && o.scrim === null && !o.main.inert && !o.rail.open && o.tabs.display === 'flex' && o.rail.display === 'none', `${name}: open at 724, shrinking to 723 hands over to the tab row (menu ${o.menu}, scrim ${o.scrim}, inert ${o.main.inert}, tabs ${o.tabs.display})`);
    } finally {
      await context.close();
    }
  }
}

async function runFlyout(servers) {
  const base = await loadBaseline();
  await withBrowsers(servers, async (browsers) => {
    for (const c of flyoutCells()) {
      const k = c.key;
      const { context, page } = await openCell(browsers[c.engine], servers, c);
      try {
        const closed = { ...(await page.evaluate(readApp)), ...(await scrollChecks(page)) };
        barChecks(k, closed, base[k], c, base);
        flyoutClosedChecks(k, closed, c);
        countedCheck(closed.scrim === null && !closed.main.inert, `${k}: closed, no scrim and main live`);
        await page.evaluate(() => window.scrollTo(0, 300));
        const scrollBefore = await page.evaluate(() => window.scrollY);
        await clickMenu(page);
        await page.waitForSelector('.shell__scrim');
        const o = await readOpen(page);
        openChecks(k, o, c, scrollBefore);
        console.log(JSON.stringify({ cell: k, closedMenuX: closed.menu.box.x, wordmarkX: closed.brand.box.x, tabs: closed.tabs.display, rail: closed.rail.display, mainX: closed.main.box.x, mainW: closed.main.box.w, sheetW: closed.sheet?.w, s2short: closed.s2short, open: { panel: o.rail.box, scrim: o.scrim.box, shadow: o.rail.boxShadow, placesY: o.rail.places.map((p) => p.y) } }));
      } finally {
        await context.close();
      }
    }
    // The phone cells equal the baseline; Chrome's 723 has no baseline cell, so it is read structurally.
    for (const c of [
      { engine: 'webkit', coarse: true, width: 393 },
      { engine: 'webkit', coarse: true, width: 723 },
      { engine: 'chrome', coarse: false, width: 393 },
      { engine: 'chrome', coarse: false, width: 723 },
    ].map((x) => ({ ...x, route: APP_ROUTE, height: 900, key: cellKey({ ...x, route: APP_ROUTE, height: 900 }) }))) {
      const m = await readCell(browsers[c.engine], servers, c);
      if (base[c.key]) phoneEqualsBaseline(c.key, m, base[c.key]);
      else {
        countedCheck(m.head.position === 'static' && m.menu === null && m.scrim === null && m.tabs.display === 'flex' && m.rail.display === 'none' && m.tools.every((t) => t.display === 'none'), `${c.key}: phone arrangement (static header, tab row, no menu, folded tools; no baseline cell)`);
        countedCheck(near(m.s2short, 0), `${c.key}: #batch scrolls to 0 in a 450-tall window (${m.s2short})`);
      }
      console.log(JSON.stringify({ cell: c.key, headH: m.head.box.h, tabs: m.tabs.display, menu: m.menu, wordmarkX: m.brand.box.x }));
    }
    for (const [engine, coarse, width] of [['webkit', true, 1024], ['chrome', false, 1366]]) {
      await interactions(browsers, servers, engine, coarse, width);
    }
    for (const [engine, coarse] of [['webkit', true], ['chrome', false]]) {
      await crossings(browsers, servers, engine, coarse);
    }
  });
}


// ---------------------------------------------------------------------------
// rail: from 1590 the rail stands in the flex row, pinned under the bar.
async function runRail(servers) {
  const base = await loadBaseline();
  const settle = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await withBrowsers(servers, async (browsers) => {
    const SHEET = { 1590: [256, 920], 1600: [256, 930], 1920: [331, 1100] };
    for (const engine of ['webkit', 'chrome']) {
      for (const width of [1590, 1600, 1920]) {
        const c = { engine, coarse: false, width, height: 900, route: APP_ROUTE };
        c.key = cellKey(c);
        const { context, page } = await openCell(browsers[engine], servers, c);
        try {
          const m = await page.evaluate(readApp);
          const k = c.key;
          countedCheck(m.menu === null && m.scrim === null, `${k}: no menu button, no scrim`);
          countedCheck(near(m.brand.box.x, 48), `${k}: wordmark at x 48 (${m.brand.box.x})`);
          countedCheck(m.rail.display === 'flex' && m.rail.position === 'sticky' && near(m.rail.box.x, 0) && near(m.rail.box.w, 224), `${k}: rail flex, sticky, x 0, 224 wide (${m.rail.display} ${m.rail.position} ${JSON.stringify(m.rail.box)})`);
          countedCheck(near(m.main.box.x, 224) && near(m.main.box.x + m.main.box.w, width), `${k}: main at x 224 to the window's edge (${JSON.stringify(m.main.box)})`);
          countedCheck(near(m.sheet.x, SHEET[width][0]) && near(m.sheet.w, SHEET[width][1]), `${k}: Sheet x ${SHEET[width][0]}, ${SHEET[width][1]} wide (${m.sheet.x}/${m.sheet.w})`);
          countedCheck(m.overflow === 0, `${k}: no horizontal overflow (${m.overflow})`);
          if (width === 1600) {
            await page.evaluate(() => window.scrollTo(0, 640));
            const scrolled = await page.evaluate(readApp);
            countedCheck(near(scrolled.scrollY, 640) && near(scrolled.rail.box.y, 57) && near(scrolled.rail.box.h, 843), `${k}: scrolled 640, the rail's top stays 57 and its height 843 (${JSON.stringify(scrolled.rail.box)})`);
            countedCheck(scrolled.rail.places.every((p, i) => near(p.y, FLYOUT_PLACES_Y[i])), `${k}: places still at y ${FLYOUT_PLACES_Y.join(', ')} when scrolled (${scrolled.rail.places.map((p) => p.y)})`);
            await page.setViewportSize({ width, height: 360 });
            await settle(page);
            const short = await page.evaluate(readApp);
            countedCheck(short.rail.clientHeight === 303 && short.rail.scrollHeight > short.rail.clientHeight && short.rail.overflowY === 'auto', `${k}: at 360 tall the rail is 303 and scrolls itself (clientHeight ${short.rail.clientHeight}, scrollHeight ${short.rail.scrollHeight}, ${short.rail.overflowY})`);
          }
          console.log(JSON.stringify({ cell: k, rail: m.rail.box, railPosition: m.rail.position, mainX: m.main.box.x, sheet: m.sheet }));
        } finally {
          await context.close();
        }
      }
      // The pinned rail adds no page scroll on a short page.
      {
        const c = { engine, coarse: false, width: 1600, height: 900, route: '/kitchen', key: `${engine}-fine-1600-kitchen` };
        const { context, page } = await openCell(browsers[engine], servers, c);
        try {
          const m = await page.evaluate(readApp);
          countedCheck(m.docH <= m.innerHeight, `${c.key}: /kitchen is no taller than the window (${m.docH} <= ${m.innerHeight})`);
        } finally {
          await context.close();
        }
      }
    }
    // The open fly-out below 1590 is unchanged by the pin: still the window less the bar, at 1366 x 954.
    {
      const c = { engine: 'webkit', coarse: false, width: 1366, height: 954, route: APP_ROUTE, key: 'webkit-fine-1366x954-flyout' };
      const { context, page } = await openCell(browsers.webkit, servers, c);
      try {
        await page.evaluate(() => window.scrollTo(0, 300));
        const before = await page.evaluate(() => window.scrollY);
        await clickMenu(page);
        await page.waitForSelector('.shell__scrim');
        const o = await readOpen(page);
        openChecks(c.key, o, c, before);
      } finally {
        await context.close();
      }
    }
  });
  void base;
}

// ---------------------------------------------------------------------------
// board: the app beside the sketch 011 boards, number for number (the boards
// are the spec). Each board's panel is read in the page the board draws.
function readBoardPanel(sel) {
  const r = (n) => Math.round(n * 100) / 100;
  const wins = [...document.querySelectorAll('.fp-win')];
  const win = sel.by === 'index' ? wins[sel.index] : wins.find((w) => (w.querySelector('h1')?.textContent || '').includes('Olive Oil'));
  if (!win) return null;
  const wb = win.getBoundingClientRect();
  const rel = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: r(b.x - wb.x), y: r(b.y - wb.y), w: r(b.width), h: r(b.height) };
  };
  const last = (q) => {
    const list = win.querySelectorAll(q);
    return list[list.length - 1] ?? null;
  };
  const head = last('.shell__head');
  const hs = getComputedStyle(head);
  const menu = last('.shell__menu');
  const rail = last('nav.shell__rail');
  const rs = rail ? getComputedStyle(rail) : null;
  const scrimEl = [...win.querySelectorAll('div')].find((d) => getComputedStyle(d).backgroundColor === 'rgba(20, 20, 20, 0.28)');
  const main = last('.shell__main');
  return {
    win: { w: r(wb.width), h: r(wb.height) },
    head: {
      box: rel(head),
      position: hs.position,
      padding: `${hs.paddingTop} ${hs.paddingRight} ${hs.paddingBottom} ${hs.paddingLeft}`,
      borderBottomWidth: hs.borderBottomWidth,
      borderBottomColor: hs.borderBottomColor,
      backgroundColor: hs.backgroundColor,
    },
    brand: { box: rel(head.querySelector('.shell__brand a')) },
    sprinkles: rel(head.querySelector('.shell__sprinkles')),
    menu: menu ? { box: rel(menu), svgBox: rel(menu.querySelector('svg')), svgTransform: getComputedStyle(menu.querySelector('svg')).transform } : null,
    tools: [...head.querySelectorAll('.shell__tools > .shell__place')].map((el) => ({ box: rel(el) })),
    rail: rail
      ? {
          box: rel(rail),
          display: rs.display,
          boxShadow: rs.boxShadow,
          borderRight: `${rs.borderRightWidth} ${rs.borderRightStyle} ${rs.borderRightColor}`,
          padding: `${rs.paddingTop} ${rs.paddingRight} ${rs.paddingBottom} ${rs.paddingLeft}`,
          backgroundColor: rs.backgroundColor,
          places: [...rail.querySelectorAll('.shell__place')].map((el) => rel(el)),
        }
      : null,
    scrim: scrimEl ? { box: rel(scrimEl), backgroundColor: getComputedStyle(scrimEl).backgroundColor } : null,
    main: main ? { box: rel(main), paddingBottom: getComputedStyle(main).paddingBottom } : null,
    sheet: rel(win.querySelector('.recipe-page')),
  };
}

const boxEq = (a, b) => a !== null && b !== null && a !== undefined && b !== undefined && near(a.x, b.x) && near(a.y, b.y) && near(a.w, b.w) && near(a.h, b.h);
const boxStr = (a, b) => `app ${JSON.stringify(a)} vs board ${JSON.stringify(b)}`;
const xwEq = (a, b) => a && b && near(a.x, b.x) && near(a.w, b.w);

// The app (a reading from readApp) against a board panel (readBoardPanel). `fields` names what to compare.
function compareToBoard(label, app, board, fields) {
  if (fields.includes('head')) {
    countedCheck(boxEq(app.head.box, board.head.box), `${label}: bar box ${boxStr(app.head.box, board.head.box)}`);
    countedCheck(app.head.padding === board.head.padding && app.head.borderBottomWidth === board.head.borderBottomWidth && app.head.borderBottomColor === board.head.borderBottomColor && app.head.backgroundColor === board.head.backgroundColor, `${label}: bar padding, hairline and ground (${app.head.padding} ${app.head.borderBottomWidth} ${app.head.borderBottomColor} ${app.head.backgroundColor} vs ${board.head.padding} ${board.head.borderBottomWidth} ${board.head.borderBottomColor} ${board.head.backgroundColor})`);
  }
  if (fields.includes('menu')) {
    countedCheck(app.menu !== null && board.menu !== null && boxEq(app.menu.box, board.menu.box) && boxEq(app.menu.svgBox, board.menu.svgBox) && app.menu.svgTransform === board.menu.svgTransform, `${label}: menu button ${boxStr(app.menu?.box, board.menu?.box)}`);
  } else if (fields.includes('nomenu')) {
    countedCheck(app.menu === null && board.menu === null, `${label}: no menu button on either`);
  }
  if (fields.includes('brand')) {
    countedCheck(boxEq(app.brand.box, board.brand.box), `${label}: wordmark link ${boxStr(app.brand.box, board.brand.box)}`);
    countedCheck(boxEq(app.sprinkles, board.sprinkles), `${label}: sprinkles ${boxStr(app.sprinkles, board.sprinkles)}`);
  }
  if (fields.includes('tools')) {
    countedCheck(app.tools.length === 3 && board.tools.length === 3 && app.tools.every((t, i) => boxEq(t.box, board.tools[i].box)), `${label}: Search, Import, Export ${boxStr(app.tools.map((t) => t.box), board.tools.map((t) => t.box))}`);
  }
  if (fields.includes('main')) {
    countedCheck(xwEq(app.main.box, board.main.box) && near(app.main.box.y, board.main.box.y) && app.main.paddingBottom === board.main.paddingBottom, `${label}: main x, y, width and padding-bottom (${JSON.stringify(app.main.box)} ${app.main.paddingBottom} vs ${JSON.stringify(board.main.box)} ${board.main.paddingBottom})`);
  }
  if (fields.includes('sheet')) {
    countedCheck(xwEq(app.sheet, board.sheet), `${label}: Sheet x and width ${boxStr(app.sheet, board.sheet)}`);
  }
  if (fields.includes('rail') || fields.includes('railfull')) {
    // 1600-batch and 1920-batch draw the rail as a column the height of the page; the pinned height is drawn only
    // by 1600-sticky-rail, so those two boards compare the rail's x, y and width, the sticky board the whole box.
    const box = fields.includes('railfull') ? boxEq(app.rail.box, board.rail.box) : near(app.rail.box.x, board.rail.box.x) && near(app.rail.box.y, board.rail.box.y) && near(app.rail.box.w, board.rail.box.w);
    countedCheck(box, `${label}: rail ${boxStr(app.rail.box, board.rail.box)}`);
    countedCheck(app.rail.display === board.rail.display && app.rail.places.length === board.rail.places.length && app.rail.places.every((p, i) => boxEq(p, board.rail.places[i])), `${label}: rail places ${boxStr(app.rail.places, board.rail.places)}`);
    countedCheck(app.rail.boxShadow === board.rail.boxShadow && app.rail.borderRight === board.rail.borderRight && app.rail.padding === board.rail.padding, `${label}: rail shadow, hairline and padding (${app.rail.boxShadow} | ${app.rail.borderRight} | ${app.rail.padding} vs ${board.rail.boxShadow} | ${board.rail.borderRight} | ${board.rail.padding})`);
  }
  if (fields.includes('panel')) {
    countedCheck(boxEq(app.rail.box, board.rail.box), `${label}: nav ${boxStr(app.rail.box, board.rail.box)}`);
    countedCheck(app.rail.places.length === board.rail.places.length && app.rail.places.every((p, i) => boxEq(p, board.rail.places[i])), `${label}: places ${boxStr(app.rail.places, board.rail.places)}`);
    countedCheck(app.rail.boxShadow === board.rail.boxShadow && app.rail.backgroundColor === board.rail.backgroundColor && app.rail.borderRight === board.rail.borderRight && app.rail.padding === board.rail.padding, `${label}: nav shadow, ground, hairline and padding (${app.rail.boxShadow} | ${app.rail.backgroundColor} | ${app.rail.borderRight} | ${app.rail.padding} vs ${board.rail.boxShadow} | ${board.rail.backgroundColor} | ${board.rail.borderRight} | ${board.rail.padding})`);
    countedCheck(app.scrim !== null && board.scrim !== null && boxEq(app.scrim.box, board.scrim.box) && app.scrim.backgroundColor === board.scrim.backgroundColor, `${label}: scrim ${boxStr(app.scrim?.box, board.scrim?.box)}`);
  }
}

async function boardPanel(browser, servers, file, sel) {
  const { context, page } = await openBoard(browser, servers.repoUrl, file);
  try {
    const panel = await page.evaluate(readBoardPanel, sel);
    if (!panel) throw new Error(`${file}: no panel for ${JSON.stringify(sel)}`);
    return panel;
  } finally {
    await context.close();
  }
}

async function runBoard(servers) {
  await withBrowsers(servers, async (browsers) => {
    // -batch boards against the app closed at the same width (WebKit fine; Chrome fine at 984 and 1366).
    const batchCells = [];
    for (const w of [744, 834, 983, 984, 1024, 1366]) batchCells.push({ engine: 'webkit', width: w });
    for (const w of [984, 1366]) batchCells.push({ engine: 'chrome', width: w });
    for (const bc of batchCells) {
      const c = { engine: bc.engine, coarse: false, width: bc.width, height: 900, route: APP_ROUTE };
      c.key = cellKey(c);
      const file = `${bc.width}-batch.html`;
      const label = `${bc.engine} ${file}`;
      const app = await readCell(browsers[bc.engine], servers, c);
      const board = await boardPanel(browsers[bc.engine], servers, file, { by: 'h1' });
      compareToBoard(label, app, board, ['head', 'menu', 'brand', 'tools', 'main', 'sheet']);
      console.log(JSON.stringify({ board: label, bar: [app.head.box.h, board.head.box.h], menuX: [app.menu.box.x, board.menu.box.x], wordmark: [app.brand.box.x, app.brand.box.y, board.brand.box.x, board.brand.box.y], sheet: [app.sheet.x, app.sheet.w, board.sheet.x, board.sheet.w] }));
    }
    // 1600-batch and 1920-batch against the app, WebKit fine and Chrome fine.
    for (const engine of ['webkit', 'chrome']) {
      for (const width of [1600, 1920]) {
        const c = { engine, coarse: false, width, height: 900, route: APP_ROUTE };
        c.key = cellKey(c);
        const file = `${width}-batch.html`;
        const label = `${engine} ${file}`;
        const app = await readCell(browsers[engine], servers, c);
        const board = await boardPanel(browsers[engine], servers, file, { by: 'h1' });
        compareToBoard(label, app, board, ['head', 'nomenu', 'brand', 'tools', 'rail', 'main', 'sheet']);
        console.log(JSON.stringify({ board: label, bar: [app.head.box.h, board.head.box.h], wordmarkX: [app.brand.box.x, board.brand.box.x], rail: [app.rail.box, board.rail.box], main: [app.main.box.x, app.main.box.w, board.main.box.x, board.main.box.w], sheet: [app.sheet.x, app.sheet.w, board.sheet.x, board.sheet.w] }));
      }
    }
    // 1600-sticky-rail: 1600 x 900, the page scrolled 640; the rail is pinned at 57 and 843 tall.
    for (const engine of ['webkit', 'chrome']) {
      const board = await boardPanel(browsers[engine], servers, '1600-sticky-rail.html', { by: 'index', index: 0 });
      const c = { engine, coarse: false, width: board.win.w, height: board.win.h, route: APP_ROUTE };
      c.key = `${cellKey(c)}-stickyrail`;
      const { context, page } = await openCell(browsers[engine], servers, c);
      try {
        await page.evaluate(() => window.scrollTo(0, 640));
        const app = await page.evaluate(readApp);
        compareToBoard(`${engine} 1600-sticky-rail.html`, app, board, ['head', 'nomenu', 'brand', 'tools', 'railfull']);
        console.log(JSON.stringify({ board: `${engine} 1600-sticky-rail.html`, window: board.win, appScrollY: app.scrollY, rail: [app.rail.box, board.rail.box] }));
      } finally {
        await context.close();
      }
    }
    // The sticky-nav boards: panel 0 closed (its bar only), panel 1 open; the app at the board's window, scrolled to the board's offset.
    for (const [file, offset] of [['744-sticky-nav.html', 1400], ['984-sticky-nav.html', 2800], ['1366-sticky-nav.html', 640]]) {
      const open = await boardPanel(browsers.webkit, servers, file, { by: 'index', index: 1 });
      const closed = await boardPanel(browsers.webkit, servers, file, { by: 'index', index: 0 });
      const c = { engine: 'webkit', coarse: false, width: open.win.w, height: open.win.h, route: APP_ROUTE };
      c.key = `${cellKey(c)}-sticky`;
      const { context, page } = await openCell(browsers.webkit, servers, c);
      try {
        await page.evaluate((y) => window.scrollTo(0, y), offset);
        const appClosed = await page.evaluate(readApp);
        await clickMenu(page);
        await page.waitForSelector('.shell__scrim');
        const appOpen = await page.evaluate(readApp);
        compareToBoard(`${file} panel 0 (closed)`, appClosed, closed, ['head', 'menu', 'brand', 'tools']);
        compareToBoard(`${file} panel 1 (open)`, appOpen, open, ['head', 'menu', 'brand', 'tools', 'panel']);
        countedCheck(near(appClosed.head.box.y, 0) && appClosed.scrollY > 0, `${file}: the app's bar stays at 0 with the page scrolled (${appClosed.scrollY})`);
        console.log(JSON.stringify({ board: file, window: open.win, appScrollY: appClosed.scrollY, nav: [appOpen.rail.box, open.rail.box], scrim: [appOpen.scrim.box, open.scrim.box] }));
      } finally {
        await context.close();
      }
    }
  });
}

// ---------------------------------------------------------------------------
const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
const known = ['baseline', 'header', 'flyout', 'rail', 'board'];
if (groups.length === 0 || groups.some((g) => !known.includes(g))) {
  console.log('usage: node 261004-ly8-probe.mjs baseline|header|flyout|rail|board[,...]');
  process.exit(2);
}
const servers = await startServers();
try {
  for (const g of groups) {
    if (g === 'baseline') await runBaseline(servers);
    else if (g === 'header') await runHeader(servers);
    else if (g === 'flyout') await runFlyout(servers);
    else if (g === 'rail') await runRail(servers);
    else if (g === 'board') await runBoard(servers);
  }
} finally {
  await servers.close();
}
finish(failures, count, `261004-ly8 probe (${groups.join(',')})`);
