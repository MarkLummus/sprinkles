// Quick task 261004-uyd's probe: the Batch head as a fold row (sketch 011 decision 50 A, C1).
// Measures the EXISTING build (app/dist, read only; it predates this quick) in Playwright's WebKit and
// system Chrome. In each page it sets the new markup with a DOM edit (the exact string BatchRow.test.jsx
// pins; Sid's `edit` in batchhead-probe.mjs) and adds the nine rules read from the edited
// app/src/styles/notebook.css (three top-level, three in each of the two narrow media blocks).
// No build, no Vite, never :4173, :5173 or :8011: the harness serves app/dist on ephemeral 127.0.0.1
// ports. The Correct pen (G8) is opened in a throwaway context and never saved.
//
//   node 261004-uyd-probe.mjs
//
// A reading here is evidence about two engines, not Mark's iPhone or iPad.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { APP_ROUTE, startServers, launch, openApp, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readAllRules } from '../../../app/src/styles/css-source.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const NOTEBOOK_CSS = path.resolve(HERE, '..', '..', '..', 'app', 'src', 'styles', 'notebook.css');

const failures = [];
let count = 0;
const ck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;

// ---------------------------------------------------------------------------
// The CSS the probe adds, read from the edited source's own text.
const HEAD = '.notebook-log .batch-row__head:has(.fold-row)';
const TOP = [HEAD, `${HEAD} .region-name`, `${HEAD} .fold-row`];
const NARROW = [`${HEAD} .batch-row__head-lead`, `${HEAD} .region-name`, `${HEAD} .fold-row`];
const MEDIAS = ['(min-width: 1366px)', '(max-width: 723.98px)'];
const allRules = readAllRules(await readFile(NOTEBOOK_CSS, 'utf8'));
const pick = (selector, media) => {
  const found = allRules.find((r) => r.selector === selector && r.media === media);
  if (!found) throw new Error(`261004-uyd probe: rule missing from notebook.css: ${media ?? '(top level)'} ${selector}`);
  return `${found.selector} { ${found.declarations.trim()} }`;
};
const RULES = [
  ...TOP.map((s) => pick(s, undefined)),
  ...MEDIAS.map((m) => `@media ${m} {\n${NARROW.map((s) => pick(s, m)).join('\n')}\n}`),
].join('\n');

const raf2 = (page) => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
async function addTag(page, css) {
  await page.addStyleTag({ content: css });
  await raf2(page);
}

// ---------------------------------------------------------------------------
// In-page: the DOM edit (Sid's), run in the page.
function editPage(open) {
  const head = document.querySelector('.batch-row__head');
  const h2 = head.querySelector('h2');
  const date = head.querySelector('.batch-row__date');
  const text = date.textContent;
  const word = open ? 'Hide' : 'Show';
  h2.textContent = '';
  h2.insertAdjacentHTML(
    'afterbegin',
    `<button type="button" class="fold-row" aria-expanded="${open}" aria-controls="fold-batch" aria-label="Batch, ${word}, ${text}" tabindex="0"><span class="fold-row__head">Batch<span class="fold-row__control">${word}</span></span><span class="fold-row__count">${text}</span></button>`,
  );
  date.remove();
  const body = document.querySelector('.batch-margin');
  const wrap = document.createElement('div');
  wrap.id = 'fold-batch';
  if (!open) wrap.hidden = true;
  body.replaceWith(wrap);
  wrap.appendChild(body);
}

// In-page: every reading. x is from .notebook-log's left edge, as Sid's was.
function readHead() {
  const log = document.querySelector('.notebook-log');
  const lb = log.getBoundingClientRect();
  const round = (n) => Math.round(n * 100) / 100;
  const box = (e) => {
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: round(b.x - lb.x), y: round(b.y), w: round(b.width), h: round(b.height), bottom: round(b.bottom), cy: round(b.y + b.height / 2) };
  };
  const ink = (el) => {
    if (!el) return null;
    const g = document.createRange();
    g.selectNodeContents(el);
    const rs = [...g.getClientRects()];
    return rs.length ? [round(Math.min(...rs.map((q) => q.left)) - lb.x), round(Math.max(...rs.map((q) => q.right)) - lb.x)] : null;
  };
  const css = (e) => {
    if (!e) return null;
    const c = getComputedStyle(e);
    return { fs: c.fontSize, fw: c.fontWeight, color: c.color, tt: c.textTransform, before: getComputedStyle(e, '::before').content };
  };
  const head = document.querySelector('.batch-row__head');
  const fr = head.querySelector('.fold-row');
  const dateEl = head.querySelector('.fold-row__count, .batch-row__date');
  const tast = document.querySelector('.tasting-reading .fold-row');
  const tastCount = tast && tast.querySelector('.fold-row__count');
  const margin = document.querySelector('.batch-margin');
  const correct = head.querySelector('.batch-row__correct');
  const record = head.querySelector('.batch-row__record');
  return {
    head: box(head),
    lead: box(head.querySelector('.batch-row__head-lead')),
    fold: box(fr),
    acts: box(head.querySelector('.batch-row__head-acts')),
    correct: box(correct),
    correctRendered: !!correct && correct.getClientRects().length > 0,
    recordRendered: !!record && record.getClientRects().length > 0,
    section: box(document.querySelector('.batch-row')),
    dateInk: ink(dateEl),
    correctInk: ink(correct),
    recordInk: ink(record),
    dateCss: css(dateEl),
    tastCss: css(tastCount),
    h2Css: css(document.querySelector('h2#batch')),
    tastH2Css: css(document.querySelector('.tasting-reading h2')),
    marginShown: !!margin && margin.getClientRects().length > 0,
    label: fr ? fr.getAttribute('aria-label') : null,
    doc: document.documentElement.scrollHeight,
  };
}

// ---------------------------------------------------------------------------
// Sid's numbers (batchhead-probe.json, WebKit with touch; batchhead-probe-chromium.json, fine pointer).
const SID_WK = {
  393: { built: 80.13, open: 139.66, closed: 144.82 },
  723: { built: 80.13, open: 139.66, closed: 144.82 },
  724: { built: 68.13, open: 127.66, closed: 132.82 },
  1024: { built: 68.13, open: 127.66, closed: 132.82 },
  1366: { built: 60.13, open: 119.66, closed: 124.82 },
};
const SID_CH = {
  393: { open: 137.8, closed: 143.8 },
  723: { open: 137.8, closed: 143.8 },
  724: { open: 125.8, closed: 131.8 },
  1024: { open: 125.8, closed: 131.8 },
  1366: { open: 117.8, closed: 123.8 },
};
const BUILT_HEAD_WK = { 393: 78.22, 723: 44, 724: 44, 1024: 44, 1366: 78.22 };
const OPEN_HEAD_COARSE = { 393: 88, 723: 88, 724: 44, 1024: 44, 1366: 88 };
const OPEN_HEAD_FINE = { 393: 68, 1024: 44, 1366: 68 };
const FULL_ROW = new Set([393, 723, 1366]);

const CASES = [
  { name: 'webkit coarse', engine: 'webkit', coarse: true, widths: [393, 723, 724, 1024, 1366] },
  { name: 'chrome coarse', engine: 'chrome', coarse: true, widths: [393, 723, 724, 1024, 1366] },
  { name: 'chrome fine', engine: 'chrome', coarse: false, widths: [393, 1024, 1366] },
];
const heightFor = (w) => (w === 393 ? 852 : 1000);

async function readState(browser, appUrl, width, coarse, state) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, height: heightFor(width), coarse });
  try {
    page.setDefaultTimeout(10000);
    await page.waitForSelector('.batch-row__head');
    await page.evaluate(() => document.fonts.ready);
    if (state !== 'built') {
      await page.evaluate(editPage, state === 'open');
      await addTag(page, RULES);
    }
    await page.waitForTimeout(150);
    return await page.evaluate(readHead);
  } finally {
    await context.close();
  }
}

const f = (n) => (n == null ? '-' : String(n));
function printRow(tag, v) {
  const box = (b) => (b ? `${b.x},${b.w}x${b.h}` : '-');
  console.log(
    `  ${tag.padEnd(26)} head ${f(v.head.h).padStart(6)} lead ${box(v.lead).padEnd(12)} fold ${box(v.fold).padEnd(12)} date ink ${JSON.stringify(v.dateInk)} ${v.dateCss.fs} ${v.dateCss.color} before=${v.dateCss.before} | acts ${v.acts ? `${v.acts.x},${round1(v.acts.y - v.head.y)} ${v.acts.w}` : '-'} correct ink ${JSON.stringify(v.correctInk)} | section ${v.section.h} margin ${v.marginShown} doc ${v.doc}`,
  );
}
const round1 = (n) => Math.round(n * 100) / 100;

function gateCase(c, width, data) {
  const E = `${c.name}@${width}`;
  const { built, open, closed } = data;
  const wk = c.engine === 'webkit';

  // G0: the build is the one the brief measured (WebKit gates, Chrome prints).
  if (c.coarse) {
    console.log(`  G0 ${E} built: head ${built.head.h}, date ink left ${built.dateInk?.[0]}, ${built.dateCss.fs}, before=${built.dateCss.before}`);
    if (wk) {
      ck(near(built.head.h, BUILT_HEAD_WK[width]), `G0 ${E} built head ${BUILT_HEAD_WK[width]} (read ${built.head.h})`);
      ck(near(built.dateInk[0], SID_WK[width].built), `G0 ${E} built date ink left ${SID_WK[width].built} (read ${built.dateInk[0]})`);
      ck(built.dateCss.fs === '15px' && !/"/.test(built.dateCss.before), `G0 ${E} built date is 15px with no ::before (read ${built.dateCss.fs}, ${built.dateCss.before})`);
    }
  }

  // G1: open head height, the fold row.
  const wantHead = c.coarse ? OPEN_HEAD_COARSE[width] : OPEN_HEAD_FINE[width];
  ck(near(open.head.h, wantHead), `G1 ${E} open head ${wantHead} (read ${open.head.h})`);
  if (c.coarse && width === 723) console.log(`  G1 ${E} read ${open.head.h}; brief (container form): 44`);
  ck(near(open.fold.h, 44), `G1 ${E} fold row 44 tall (read ${open.fold.h})`);
  if (FULL_ROW.has(width)) ck(near(open.fold.w, open.lead.w), `G1 ${E} fold row as wide as the lead (fold ${open.fold.w}, lead ${open.lead.w})`);
  else ck(near(open.fold.x + open.fold.w, open.dateInk[1]), `G1 ${E} fold row's right edge = date ink right (edge ${round1(open.fold.x + open.fold.w)}, ink ${open.dateInk[1]})`);

  // G2: the date like Tasting's.
  ck(open.tastCss && open.dateCss.fs === open.tastCss.fs && open.dateCss.color === open.tastCss.color, `G2 ${E} date ${open.dateCss.fs} ${open.dateCss.color} equals Tasting's ${open.tastCss?.fs} ${open.tastCss?.color}`);
  ck(open.tastCss && open.dateCss.before === open.tastCss.before && /00b7|·/i.test(open.dateCss.before), `G2 ${E} same dot ::before (batch ${open.dateCss.before}, tasting ${open.tastCss?.before})`);
  const a = open.h2Css;
  const b = open.tastH2Css;
  ck(b && a.fs === b.fs && a.fw === b.fw && a.color === b.color && a.tt === b.tt, `G2 ${E} h2 ${a.fs}/${a.fw}/${a.color}/${a.tt} equals Tasting h2 ${b && `${b.fs}/${b.fw}/${b.color}/${b.tt}`}`);
  ck(open.label === 'Batch, Hide, churned 2 Aug 2026', `G2 ${E} accessible name (read "${open.label}")`);

  // G3: the actions.
  if (FULL_ROW.has(width)) {
    ck(near(open.correctInk[0], open.fold.x), `G3 ${E} Correct ink left = fold row's left (Correct ${open.correctInk[0]}, fold ${open.fold.x})`);
    ck(near(open.acts.y, open.fold.bottom), `G3 ${E} acts top = fold row's bottom (acts ${open.acts.y}, fold bottom ${open.fold.bottom})`);
  } else {
    ck(near(open.correctInk[0] - open.dateInk[1], 32), `G3 ${E} Correct ink left - date ink right = 32 (read ${round1(open.correctInk[0] - open.dateInk[1])})`);
    ck(open.correct.cy >= open.fold.y && open.correct.cy <= open.fold.bottom, `G3 ${E} Correct's centre (${open.correct.cy}) lies within the fold row (${open.fold.y} to ${open.fold.bottom})`);
  }

  // G4: closed.
  ck(near(closed.section.h, closed.head.h, 0.01), `G4 ${E} closed section = head (section ${closed.section.h}, head ${closed.head.h})`);
  ck(!closed.marginShown, `G4 ${E} closed: .batch-margin has no client rects`);
  ck(near(closed.head.h, open.head.h, 0.01), `G4 ${E} closed head = open head (closed ${closed.head.h}, open ${open.head.h})`);
  ck(closed.correctRendered && closed.recordRendered, `G4 ${E} closed: Correct and Record another rendered`);

  // G5: the wrap leaves the body alone.
  if (built) {
    const delta = open.section.h - built.section.h - (open.head.h - built.head.h);
    ck(near(delta, 0, 0.01), `G5 ${E} body unchanged by the wrap (read ${round1(delta)})`);
  }

  // G6: the date's position, against Sid.
  const sid = wk ? SID_WK[width] : SID_CH[width];
  if (wk || sid) {
    ck(near(open.dateInk[0], sid.open), `G6 ${E} open date ink left ${sid.open} (read ${open.dateInk[0]})`);
    ck(near(closed.dateInk[0], sid.closed), `G6 ${E} closed date ink left ${sid.closed} (read ${closed.dateInk[0]})`);
  }
}

// ---------------------------------------------------------------------------
// G7: landing.
async function readLanding(browser, appUrl, width) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, height: heightFor(width), coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await page.waitForSelector('.notebook-jump');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => document.querySelector('.notebook-jump').click());
    await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'batch');
    await page.evaluate(editPage, true);
    await addTag(page, RULES);
    await page.waitForTimeout(200);
    return await page.evaluate(() => {
      const round = (n) => Math.round(n * 100) / 100;
      const h2 = document.querySelector('h2#batch');
      const fr = h2.querySelector('.fold-row');
      const cs = getComputedStyle(h2);
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;left:0;top:0;border-style:solid;border-width:var(--focus-outline-width)';
      document.body.appendChild(probe);
      const tokenWidth = parseFloat(getComputedStyle(probe).borderTopWidth);
      probe.remove();
      const hb = h2.getBoundingClientRect();
      const fb = fr.getBoundingClientRect();
      const grow = parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth);
      const ring = { left: hb.left - grow, right: hb.right + grow, top: hb.top - grow, bottom: hb.bottom + grow };
      const clips = [];
      for (let el = h2.parentElement; el && el !== document.documentElement; el = el.parentElement) {
        const c = getComputedStyle(el);
        if (c.overflowX !== 'visible' || c.overflowY !== 'visible') {
          const b = el.getBoundingClientRect();
          const left = b.left + el.clientLeft;
          clips.push({ el: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`, left: round(left), right: round(left + el.clientWidth), ox: c.overflowX, oy: c.overflowY });
        }
      }
      let bar = null;
      for (const el of document.querySelectorAll('*')) {
        const c = getComputedStyle(el);
        if ((c.position === 'sticky' || c.position === 'fixed') && el.getClientRects().length > 0) {
          const b = el.getBoundingClientRect();
          if (b.top <= 1 && b.height > 0 && b.height < 200) bar = Math.max(bar ?? 0, b.bottom);
        }
      }
      return {
        active: document.activeElement === h2,
        cls: [...h2.classList],
        outlineStyle: cs.outlineStyle,
        outlineWidth: parseFloat(cs.outlineWidth),
        tokenWidth,
        h2Box: { x: round(hb.x), y: round(hb.y), w: round(hb.width), h: round(hb.height) },
        foldBox: { x: round(fb.x), y: round(fb.y), w: round(fb.width), h: round(fb.height) },
        ring: { left: round(ring.left), right: round(ring.right), top: round(ring.top), bottom: round(ring.bottom) },
        innerWidth,
        innerHeight,
        clips,
        bar: bar == null ? null : round(bar),
        fold: fr.getAttribute('aria-expanded'),
      };
    });
  } finally {
    await context.close();
  }
}

function gateLanding(E, v) {
  ck(v.active && v.cls.includes('is-landing-focus'), `G7 ${E} h2#batch is focused with is-landing-focus (active ${v.active}, ${v.cls.join(' ')})`);
  ck(v.outlineStyle === 'solid' && near(v.outlineWidth, v.tokenWidth, 0.01), `G7 ${E} outline solid, ${v.tokenWidth}px (read ${v.outlineStyle} ${v.outlineWidth}px)`);
  const same = ['x', 'y', 'w', 'h'].every((k) => near(v.h2Box[k], v.foldBox[k], 0.5));
  ck(same, `G7 ${E} h2's box = fold row's box (h2 ${JSON.stringify(v.h2Box)}, fold ${JSON.stringify(v.foldBox)})`);
  ck(v.ring.left >= 0 && v.ring.right <= v.innerWidth, `G7 ${E} ring inside the window across (${v.ring.left} to ${v.ring.right} of ${v.innerWidth})`);
  const bad = v.clips.filter((c) => v.ring.left < c.left || v.ring.right > c.right);
  ck(bad.length === 0, `G7 ${E} no clipping ancestor cuts the ring horizontally (${v.clips.length} non-visible ancestors; cut by: ${bad.map((c) => `${c.el} ${c.left}-${c.right}`).join('; ') || 'none'})`);
  console.log(`  G7 ${E} ring top ${v.ring.top}, bottom ${v.ring.bottom}, window 0..${v.innerHeight}, sticky bar bottom ${v.bar}; clipping ancestors: ${v.clips.map((c) => `${c.el}[${c.ox}/${c.oy}] ${c.left}-${c.right}`).join('; ') || 'none'}`);
}

// ---------------------------------------------------------------------------
// G8: the pen wrap is neutral.
async function readPenWrap(browser, appUrl, width) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, { width, height: heightFor(width), coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await page.waitForSelector('.batch-row__correct');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.batch-row__correct').first().click();
    await page.waitForSelector('.batch-margin--pen');
    await page.waitForTimeout(300);
    const read = () =>
      page.evaluate(() => ({
        section: document.querySelector('.batch-row').getBoundingClientRect().height,
        head: document.querySelector('.batch-row__head').getBoundingClientRect().height,
        foldInHead: !!document.querySelector('.batch-row__head .fold-row'),
      }));
    const before = await read();
    await page.evaluate(() => {
      const body = document.querySelector('.batch-margin');
      const wrap = document.createElement('div');
      wrap.id = 'fold-batch';
      body.replaceWith(wrap);
      wrap.appendChild(body);
    });
    await addTag(page, RULES);
    await page.waitForTimeout(150);
    const after = await read();
    return { before, after };
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const servers = await startServers();
const wk = await webkit.launch();
const ch = await launch();
try {
  console.log('Rules added to each page (read from the edited notebook.css):');
  console.log(RULES.split('\n').map((l) => `  ${l}`).join('\n'));
  for (const c of CASES) {
    const browser = c.engine === 'webkit' ? wk : ch;
    for (const width of c.widths) {
      console.log(`\n${c.name} @ ${width}`);
      const built = await readState(browser, servers.appUrl, width, c.coarse, 'built');
      const open = await readState(browser, servers.appUrl, width, c.coarse, 'open');
      const closed = await readState(browser, servers.appUrl, width, c.coarse, 'closed');
      printRow('built', built);
      printRow('open', open);
      printRow('closed', closed);
      gateCase(c, width, { built, open, closed });
    }
  }
  for (const [name, browser] of [['webkit', wk], ['chrome', ch]]) {
    for (const width of [393, 1024]) {
      console.log(`\nlanding ${name} coarse @ ${width}`);
      gateLanding(`${name}@${width}`, await readLanding(browser, servers.appUrl, width));
    }
  }
  for (const width of [393, 1366]) {
    console.log(`\npen wrap webkit coarse @ ${width}`);
    const { before, after } = await readPenWrap(wk, servers.appUrl, width);
    console.log(`  .batch-row ${before.section} -> ${after.section}; head ${before.head} -> ${after.head}`);
    ck(near(before.section, after.section, 0.01) && near(before.head, after.head, 0.01), `G8 webkit@${width} pen wrap neutral (section ${before.section} -> ${after.section}, head ${before.head} -> ${after.head})`);
    ck(!before.foldInHead && !after.foldInHead, `G8 webkit@${width} the pen head holds no .fold-row`);
  }
} finally {
  await wk.close();
  await ch.close();
  await servers.close();
}
finish(failures, count, '261004-uyd probe');
