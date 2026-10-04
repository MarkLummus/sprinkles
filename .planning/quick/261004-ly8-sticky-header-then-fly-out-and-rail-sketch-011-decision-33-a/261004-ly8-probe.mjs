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
// The three shell states by width. STATE_OF is the one place that says which
// arrangement a width is in; Task 1 shipped a bar from 984 only.
function stateOf(width) {
  return width >= 984 ? 'bar' : 'phone';
}

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
function barChecks(k, m, b, c) {
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
  countedCheck(m.tools.length === 3 && m.tools.every((t, i) => near(t.box.y, 6) && near(t.box.h, 44) && near(t.box.x, b.tools[i].box.x) && near(t.box.w, b.tools[i].box.w)), `${k}: tools at y 6, 44 tall, x and width equal baseline`);
  countedCheck(near(m.tools[2].box.x + m.tools[2].box.w, c.width - 48), `${k}: Export's right edge at the window less 48`);
  countedCheck(near(m.main.box.y, 57), `${k}: main starts at 57 (${m.main.box.y})`);
  countedCheck(m.overflow === b.overflow, `${k}: horizontal overflow equals baseline (${m.overflow}/${b.overflow})`);
}

async function runHeader(servers) {
  const base = await loadBaseline();
  const list = cells();
  const readings = await readAllCells(servers, list);
  for (const c of list) {
    const m = readings[c.key];
    const b = base[c.key];
    const k = c.key;
    if (stateOf(c.width) === 'phone') {
      phoneEqualsBaseline(k, m, b);
    } else {
      barChecks(k, m, b, c);
      countedCheck(m.rail.display === b.rail.display && near(m.rail.box.x, b.rail.box.x) && near(m.rail.box.w, b.rail.box.w), `${k}: rail x and width equal baseline`);
      countedCheck(m.tabs.display === b.tabs.display, `${k}: tab row equals baseline`);
      if (m.sheet) countedCheck(near(m.sheet.x, b.sheet.x) && near(m.sheet.w, b.sheet.w), `${k}: Sheet x and width equal baseline (${m.sheet.x}/${m.sheet.w} vs ${b.sheet.x}/${b.sheet.w})`);
      countedCheck(m.menu === null || c.width < 984, `${k}: no menu button yet`);
      countedCheck(near(m.brand.box.x, 48), `${k}: wordmark at x 48 (${m.brand.box.x})`);
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
  }
} finally {
  await servers.close();
}
finish(failures, count, `261004-ly8 probe (${groups.join(',')})`);
