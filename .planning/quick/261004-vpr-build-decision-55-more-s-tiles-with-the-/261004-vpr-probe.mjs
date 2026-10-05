// Quick task 261004-vpr's probe: sketch 011 decision 55, More's tiles with the hairline between the
// places and the actions. Measures the EXISTING build (app/dist, read only) in Playwright's WebKit and
// system Chrome. The dist predates this quick, so the fix state is made in each page in three steps:
//   1. delete the dist's top-level CSSOM rule `.shell__tools button` (the tools row's old reset);
//   2. insert the separator li after Search's li (the markup Shell.test.jsx pins);
//   3. add the edited shell.css's own rules with addStyleTag (read with readAllRules).
// No build, no Vite, never :4173, :5173 or :8011; the harness serves app/dist on ephemeral 127.0.0.1
// ports. Import's file chooser is never answered. A reading here is evidence about two engines, not
// Mark's iPhone or iPad.
//
//   node 261004-vpr-probe.mjs
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readAllRules } from '../../../app/src/styles/css-source.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHELL_CSS = path.resolve(HERE, '..', '..', '..', 'app', 'src', 'styles', 'shell.css');

const failures = [];
let count = 0;
const ck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const f = (n) => (typeof n === 'number' ? Math.round(n * 1000) / 1000 : n);

// ---------------------------------------------------------------------------
// The CSS the probe adds, read from the edited source's own text.
const PHONE_MEDIA = '(max-width: 723.98px)';
const OLD_RESET = '.shell__tools button';
const TOP_SELECTOR = 'button.shell__place';
const PHONE_SELECTORS = [
  '.shell__more li > button',
  '.shell__tabs .shell__more li .shell__place',
  '.shell__more li.shell__more-sep',
  '.shell__more li.shell__more-sep .shell__divider',
];
const shellRules = readAllRules(await readFile(SHELL_CSS, 'utf8'));
if (shellRules.some((r) => r.selector.includes(OLD_RESET))) throw new Error(`261004-vpr probe: shell.css still has the old reset ${OLD_RESET}`);
const topRule = shellRules.find((r) => r.selector === TOP_SELECTOR && r.media === undefined);
if (!topRule) throw new Error(`261004-vpr probe: top-level rule missing from shell.css: ${TOP_SELECTOR}`);
const phoneRules = PHONE_SELECTORS.map((sel) => {
  const found = shellRules.find((r) => r.selector === sel && r.media === PHONE_MEDIA);
  if (!found) throw new Error(`261004-vpr probe: phone-block rule missing from shell.css: ${sel}`);
  return found;
});
const FIX_CSS =
  `${topRule.selector} { ${topRule.declarations.trim()} }\n` +
  `@media ${PHONE_MEDIA} {\n${phoneRules.map((r) => `${r.selector} { ${r.declarations.trim()} }`).join('\n')}\n}`;
const SEP_HTML = '<li class="shell__more-sep" aria-hidden="true"><hr class="shell__divider"></li>';

const raf2 = (page) => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));

async function countPre(page) {
  return page.evaluate(
    ([top, old]) => {
      let topN = 0;
      let oldN = 0;
      for (const sh of document.styleSheets) {
        let rs;
        try {
          rs = sh.cssRules;
        } catch {
          continue;
        }
        for (const r of rs) {
          if (r.selectorText === top) topN += 1;
          if (r.selectorText === old) oldN += 1;
        }
      }
      return { topN, oldN, sep: document.querySelectorAll('.shell__more-sep').length };
    },
    [TOP_SELECTOR, OLD_RESET],
  );
}

// Step 1: delete the old reset. Returns how many rules were deleted.
async function deleteOldReset(page) {
  const n = await page.evaluate((old) => {
    let deleted = 0;
    for (const sh of document.styleSheets) {
      let rs;
      try {
        rs = sh.cssRules;
      } catch {
        continue;
      }
      for (let i = rs.length - 1; i >= 0; i -= 1) {
        if (rs[i].selectorText === old) {
          sh.deleteRule(i);
          deleted += 1;
        }
      }
    }
    return deleted;
  }, OLD_RESET);
  await raf2(page);
  return n;
}

// Steps 2 and 3: the separator, and the edited rules. Returns the separator count afterwards.
async function addSepAndRules(page) {
  await page.evaluate((html) => {
    const li = document.querySelector('.shell__more > ul a[href="/search"]').closest('li');
    li.insertAdjacentHTML('afterend', html);
  }, SEP_HTML);
  await page.addStyleTag({ content: FIX_CSS });
  await raf2(page);
  return page.evaluate(() => document.querySelectorAll('.shell__more-sep').length);
}

// ---------------------------------------------------------------------------
// In-page readers.
function readMore(rootSel) {
  const root = rootSel ? document.querySelector(rootSel) : document;
  const R = (b) => ({ left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height });
  const len = (name) => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:0;top:0;width:var(${name})`;
    document.body.appendChild(d);
    const v = parseFloat(getComputedStyle(d).width);
    d.remove();
    return v;
  };
  const colour = (name) => {
    const d = document.createElement('div');
    d.style.color = `var(${name})`;
    document.body.appendChild(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  };
  const ul = root.querySelector('.shell__more > ul');
  const ub = ul.getBoundingClientRect();
  const cu = getComputedStyle(ul);
  const tabs = root.querySelector('.shell__tabs');
  const edge = rootSel ? root.getBoundingClientRect().right : innerWidth;
  const items = [...ul.querySelectorAll('li > a, li > button')].map((e) => {
    const c = getComputedStyle(e);
    return {
      text: e.textContent.trim(),
      tag: e.tagName.toLowerCase(),
      box: R(e.getBoundingClientRect()),
      bt: parseFloat(c.borderTopWidth),
      bst: c.borderTopStyle,
      pl: parseFloat(c.paddingLeft),
      pr: parseFloat(c.paddingRight),
      bg: c.backgroundColor,
      fw: c.fontWeight,
      current: e.getAttribute('aria-current') === 'page',
    };
  });
  const sepLi = ul.querySelector('li.shell__more-sep');
  const hr = sepLi && sepLi.querySelector('hr');
  const ch = hr && getComputedStyle(hr);
  const cur = ul.querySelector('[aria-current="page"]');
  let ink = null;
  if (cur) {
    const b = cur.getBoundingClientRect();
    const rg = document.createRange();
    rg.selectNodeContents(cur);
    const lines = [...rg.getClientRects()].filter((q) => q.width > 20 && q.height < 30);
    ink = { left: Math.min(...lines.map((q) => q.left)) - b.left, right: b.right - Math.max(...lines.map((q) => q.right)) };
  }
  return {
    ul: {
      box: R(ub),
      bw: parseFloat(cu.borderTopWidth),
      bs: cu.borderTopStyle,
      bc: cu.borderTopColor,
      pad: [cu.paddingTop, cu.paddingRight, cu.paddingBottom, cu.paddingLeft].map(parseFloat),
      rightGap: edge - ub.right,
      bottomGap: tabs.getBoundingClientRect().top - ub.bottom,
    },
    items,
    sep: sepLi
      ? {
          li: R(sepLi.getBoundingClientRect()),
          hidden: sepLi.getAttribute('aria-hidden'),
          control: !!sepLi.querySelector('a, button, input, [tabindex]'),
          hr: R(hr.getBoundingClientRect()),
          hbw: parseFloat(ch.borderTopWidth),
          hbs: ch.borderTopStyle,
          hbc: ch.borderTopColor,
          m: [ch.marginTop, ch.marginRight, ch.marginBottom, ch.marginLeft].map(parseFloat),
        }
      : null,
    tok: { gapXs: len('--gap-xs'), divider: colour('--app-divider'), subtle: colour('--app-surface-subtle'), focusW: len('--focus-outline-width'), focusO: len('--focus-outline-offset') },
    ink,
  };
}

function readTabs() {
  const R = (b) => ({ left: b.left, top: b.top, right: b.right, bottom: b.bottom });
  return [...document.querySelectorAll('.shell__tabs > .shell__place, .shell__tabs > .shell__more > summary')].map((e) => R(e.getBoundingClientRect()));
}

function readFocus() {
  const e = document.activeElement;
  const c = getComputedStyle(e);
  const b = e.getBoundingClientRect();
  const w = parseFloat(c.outlineWidth);
  const o = parseFloat(c.outlineOffset);
  const ul = document.querySelector('.shell__more > ul').getBoundingClientRect();
  const hr = document.querySelector('.shell__more-sep hr');
  const hb = hr && hr.getBoundingClientRect();
  return {
    text: e.textContent.trim(),
    style: c.outlineStyle,
    w,
    o,
    ring: { left: b.left - w - o, top: b.top - w - o, right: b.right + w + o, bottom: b.bottom + w + o },
    ul: { left: ul.left, right: ul.right, bottom: ul.bottom },
    hrBottom: hb ? hb.bottom : null,
  };
}

function readBtn(e) {
  const b = e.getBoundingClientRect();
  const c = getComputedStyle(e);
  return { left: b.left, top: b.top, width: b.width, height: b.height, bt: parseFloat(c.borderTopWidth), bs: c.borderTopStyle, hover: e.matches(':hover') };
}

// ---------------------------------------------------------------------------
const ROUTE_NB = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const ROUTE_ING = '/ingredients';
const SIZES = [
  [393, 852],
  [723, 852],
];

// Sid's readings (moretiles-measure.json / moretiles-measure-chromium.json).
const SID = {
  webkit: {
    base: { panel: [89.5, 275], link: [63.5, 49], imp: [39.1, 51], exp: [38.9, 51] },
    fix: { nb: { panel: [101.5, 284], tile: 75.5, h: [49, 49, 49, 49, 49] }, ing: { panel: [105.2, 284], tile: 79.2, h: [49, 49, 49, 49, 49] } },
    header: 'Import 108.4 x 44, 80.4 x 32 under hover',
  },
  chrome: {
    base: { panel: [85.6, 270], link: [59.6, 48], imp: [37.1, 50], exp: [37.3, 50] },
    fix: { nb: { panel: [97.6, 279], tile: 71.6, h: [48, 48, 48, 48, 48] }, ing: { panel: [102.4, 280], tile: 76.4, h: [49, 48, 48, 48, 48] } },
    header: 'Import 107.0 x 44, 79.0 x 32 under hover',
  },
};

const sz = (b) => `${f(b.width)}x${f(b.height)}`;

async function tapOpen(page) {
  await page.locator('.shell__more > summary').tap();
  await page.waitForSelector('.shell__more[open]');
  await page.waitForTimeout(200);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
}
async function tapClose(page) {
  await page.locator('.shell__more > summary').tap();
  await page.waitForFunction(() => !document.querySelector('.shell__more').open);
  await page.waitForTimeout(100);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
}
async function clickOpen(page) {
  await page.locator('.shell__more > summary').click();
  await page.waitForSelector('.shell__more[open]');
  await page.waitForTimeout(200);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
}
async function clickClose(page) {
  await page.locator('.shell__more > summary').click();
  await page.waitForFunction(() => !document.querySelector('.shell__more').open);
  await page.waitForTimeout(100);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
}

async function settle(page) {
  await page.waitForSelector('.shell__tabs .shell__more');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

async function crop(page, engine, width, state) {
  const file = path.join(os.tmpdir(), `vpr-${engine}-${width}-${state}.png`);
  const h = page.viewportSize().height;
  await page.screenshot({ path: file, clip: { x: 0, y: h - 360, width: page.viewportSize().width, height: 360 } });
  return file;
}

// ---------------------------------------------------------------------------
// L: layout, coarse. Returns the fix readings for the board comparison.
async function pageL(browser, servers, engine, width, height, route) {
  const E = engine;
  const key = route === ROUTE_ING ? 'ing' : 'nb';
  const tag = `${E}@${width} ${key}`;
  const { context, page } = await openApp(browser, servers.appUrl, route, { width, height, coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await settle(page);
    const pre = await countPre(page);
    ck(pre.topN === 0, `G-pre ${tag} no button.shell__place rule before the fix (read ${pre.topN})`);
    ck(pre.sep === 0, `G-pre ${tag} no .shell__more-sep before the insert (read ${pre.sep})`);
    ck(pre.oldN === 1, `G-pre ${tag} exactly one old-reset rule in the dist (read ${pre.oldN})`);

    const tabsBase = await page.evaluate(readTabs);
    await tapOpen(page);
    const base = await page.evaluate(readMore, null);
    await tapClose(page);

    const deleted = await deleteOldReset(page);
    ck(deleted === 1, `G-pre ${tag} exactly one old-reset rule deleted (read ${deleted})`);
    const seps = await addSepAndRules(page);
    ck(seps === 1, `G-pre ${tag} exactly one .shell__more-sep after the insert (read ${seps})`);

    const tabsFix = await page.evaluate(readTabs);
    await tapOpen(page);
    const fix = await page.evaluate(readMore, null);

    // ---- print
    console.log(`  ${tag} BASE panel ${sz(base.ul.box)} border ${base.ul.bw}px ${base.ul.bs} pad ${base.ul.pad.join('/')} rightGap ${f(base.ul.rightGap)} bottomGap ${f(base.ul.bottomGap)}`);
    for (const i of base.items) console.log(`    base ${i.text.padEnd(12)} ${i.tag.padEnd(6)} ${sz(i.box)} border ${i.bt}px ${i.bst} pad-x ${i.pl}/${i.pr}`);
    console.log(`  ${tag} FIX  panel ${sz(fix.ul.box)} border ${fix.ul.bw}px ${fix.ul.bs} ${fix.ul.bc} pad ${fix.ul.pad.join('/')} rightGap ${f(fix.ul.rightGap)} bottomGap ${f(fix.ul.bottomGap)} (tokens: gap-xs ${fix.tok.gapXs}, divider ${fix.tok.divider}, subtle ${fix.tok.subtle}, focus ${fix.tok.focusW}/${fix.tok.focusO})`);
    for (const i of fix.items) console.log(`    fix  ${i.text.padEnd(12)} ${i.tag.padEnd(6)} ${sz(i.box)} border ${i.bt}px ${i.bst} pad-x ${i.pl}/${i.pr} weight ${i.fw} bg ${i.bg}`);
    const s = fix.sep;
    console.log(`    fix  separator li ${sz(s.li)} aria-hidden=${s.hidden} control=${s.control}; hr ${sz(s.hr)} @${f(s.hr.left)},${f(s.hr.top)} border ${s.hbw}px ${s.hbs} ${s.hbc} margins ${s.m.join('/')}`);
    if (fix.ink) console.log(`    fix  current tile ink insets L ${f(fix.ink.left)} R ${f(fix.ink.right)}`);

    // ---- G0 (393, Notebook page, base)
    if (width === 393 && key === 'nb') {
      const S = SID[E].base;
      ck(near(base.ul.box.width, S.panel[0], 0.1) && near(base.ul.box.height, S.panel[1], 0.1), `G0 ${tag} base panel is Sid's as-built (read ${sz(base.ul.box)}, Sid ${S.panel.join('x')})`);
      const links = base.items.filter((i) => i.tag === 'a');
      ck(links.length === 3 && links.every((i) => near(i.box.width, S.link[0], 0.1) && near(i.box.height, S.link[1], 0.1)), `G0 ${tag} base three links are Sid's as-built (read ${links.map((i) => sz(i.box)).join(', ')}, Sid ${S.link.join('x')})`);
      const imp = base.items.find((i) => i.text === 'Import');
      const exp = base.items.find((i) => i.text === 'Export');
      ck(near(imp.box.width, S.imp[0], 0.1) && near(imp.box.height, S.imp[1], 0.1) && imp.bt === 1 && imp.bst === 'solid', `G0 ${tag} base Import is Sid's as-built with a 1px solid border (read ${sz(imp.box)} ${imp.bt}px ${imp.bst}, Sid ${S.imp.join('x')})`);
      ck(near(exp.box.width, S.exp[0], 0.1) && near(exp.box.height, S.exp[1], 0.1) && exp.bt === 1 && exp.bst === 'solid', `G0 ${tag} base Export is Sid's as-built with a 1px solid border (read ${sz(exp.box)} ${exp.bt}px ${exp.bst}, Sid ${S.exp.join('x')})`);
    }

    // ---- G1 panel
    const S = SID[E].fix[key];
    ck(near(fix.ul.box.width, S.panel[0], 0.1) && near(fix.ul.box.height, S.panel[1], 0.1), `G1 ${tag} panel size per Sid (read ${sz(fix.ul.box)}, Sid ${S.panel.join('x')})`);
    ck(near(fix.ul.rightGap, 0, 0.01), `G1 ${tag} panel's right edge is the window's (gap ${f(fix.ul.rightGap)})`);
    // Diagnostic, added by the probe's author: the plan's gate above is 0 within 0.01. WebKit's five-way
    // flex split leaves More's right edge 0.031 short of the window in the dist as it is, so this checks
    // the fix did not move the edge from where the build already had it.
    ck(near(fix.ul.rightGap, base.ul.rightGap, 0.01), `G1b ${tag} panel's right gap equals base (base ${f(base.ul.rightGap)}, fix ${f(fix.ul.rightGap)})`);
    ck(near(fix.ul.bottomGap, base.ul.bottomGap, 0.01), `G1 ${tag} tab row top minus panel bottom equals base (base ${f(base.ul.bottomGap)}, fix ${f(fix.ul.bottomGap)})`);
    ck(fix.ul.bw === 1 && fix.ul.bs === 'solid' && fix.ul.bc === fix.tok.divider, `G1 ${tag} panel border 1px solid in --app-divider (read ${fix.ul.bw}px ${fix.ul.bs} ${fix.ul.bc}; token ${fix.tok.divider})`);
    ck(fix.ul.pad.every((p) => p === 12), `G1 ${tag} panel padding 12px (read ${fix.ul.pad.join('/')})`);

    // ---- G2 tiles
    const tileW = fix.ul.box.width - 26;
    ck(fix.items.length === 5, `G2 ${tag} five items (read ${fix.items.length})`);
    ck(fix.items.every((i) => near(i.box.width, fix.items[0].box.width, 0.01)), `G2 ${tag} all five items one width (read ${fix.items.map((i) => f(i.box.width)).join(', ')})`);
    ck(fix.items.every((i) => near(i.box.width, tileW, 0.02)), `G2 ${tag} each item is the panel's width minus 26 (tile ${f(fix.items[0].box.width)}, panel ${f(fix.ul.box.width)} minus 26 = ${f(tileW)})`);
    ck(fix.items.every((i) => near(i.box.width, S.tile, 0.1)), `G2 ${tag} tile width per Sid (read ${f(fix.items[0].box.width)}, Sid ${S.tile})`);
    ck(fix.items.every((i, n) => near(i.box.height, S.h[n], 0.1)), `G2 ${tag} tile heights per Sid (read ${fix.items.map((i) => f(i.box.height)).join(', ')}, Sid ${S.h.join(', ')})`);
    ck(fix.items.every((i) => i.bt === 0), `G2 ${tag} every item's border-top-width is 0 (read ${fix.items.map((i) => i.bt).join(', ')})`);
    ck(fix.items.every((i) => i.pl === fix.tok.gapXs && i.pr === fix.tok.gapXs), `G2 ${tag} padding-left and right equal --gap-xs ${fix.tok.gapXs} (read ${fix.items.map((i) => `${i.pl}/${i.pr}`).join(', ')})`);
    const search = fix.items.find((i) => i.text === 'Search');
    ck(['Import', 'Export'].every((t) => {
      const i = fix.items.find((x) => x.text === t);
      return i.tag === 'button' && near(i.box.width, search.box.width, 0.01);
    }), `G2 ${tag} Import and Export are buttons with Search's width`);

    // ---- G3 current place (/ingredients)
    if (key === 'ing') {
      const cur = fix.items.find((i) => i.text === 'Ingredients');
      ck(cur.current, `G3 ${tag} Ingredients has aria-current=page`);
      ck(cur.bg === fix.tok.subtle, `G3 ${tag} its background is --app-surface-subtle (read ${cur.bg}, token ${fix.tok.subtle})`);
      ck(cur.fw === '600', `G3 ${tag} its weight is 600 (read ${cur.fw})`);
      ck(fix.ink && near(fix.ink.left, 6, 0.1) && near(fix.ink.right, 6, 0.1), `G3 ${tag} ink insets 6 and 6 (read ${fix.ink ? `${f(fix.ink.left)} and ${f(fix.ink.right)}` : 'none'})`);
    }

    // ---- G4 the rule
    ck(s.hidden === 'true' && near(s.li.height, 1, 0.01) && !s.control, `G4 ${tag} li is aria-hidden=true, 1px tall, holds no control (aria-hidden ${s.hidden}, ${f(s.li.height)} tall, control ${s.control})`);
    ck(near(s.hr.width, fix.items[0].box.width, 0.01) && near(s.hr.height, 1, 0.01), `G4 ${tag} hr as wide as the tiles and 1px tall (hr ${sz(s.hr)}, tiles ${f(fix.items[0].box.width)})`);
    ck(s.hbw === 1 && s.hbs === 'solid' && s.hbc === fix.tok.divider, `G4 ${tag} hr border-top 1px solid in --app-divider (read ${s.hbw}px ${s.hbs} ${s.hbc}; token ${fix.tok.divider})`);
    ck(s.m[0] === fix.tok.gapXs && s.m[2] === fix.tok.gapXs && s.m[1] === 0 && s.m[3] === 0, `G4 ${tag} hr margins top/bottom --gap-xs, left/right 0 (read ${s.m.join('/')}, gap-xs ${fix.tok.gapXs})`);
    const imp = fix.items.find((i) => i.text === 'Import');
    ck(near(s.hr.top - search.box.bottom, 6, 0.01), `G4 ${tag} Search's bottom to the hr's top is 6 (read ${f(s.hr.top - search.box.bottom)})`);
    ck(near(imp.box.top - s.hr.bottom, 6, 0.01), `G4 ${tag} the hr's bottom to Import's top is 6 (read ${f(imp.box.top - s.hr.bottom)})`);

    // ---- G5 the ring (Import focused), notebook page only
    let focus = null;
    if (key === 'nb') {
      await page.evaluate(() => document.querySelector('.shell__more li > button').focus());
      await raf2(page);
      focus = await page.evaluate(readFocus);
      console.log(`    fix  focus ${focus.text}: outline ${focus.style} w ${focus.w} offset ${focus.o}; ring [${f(focus.ring.left)},${f(focus.ring.top)} - ${f(focus.ring.right)},${f(focus.ring.bottom)}]; hr bottom ${f(focus.hrBottom)}; panel L ${f(focus.ul.left)} R ${f(focus.ul.right)} B ${f(focus.ul.bottom)}`);
      ck(focus.text === 'Import', `G5 ${tag} Import is focused (read ${focus.text})`);
      ck(focus.style === 'solid' && near(focus.w, fix.tok.focusW, 0.01) && near(focus.o, fix.tok.focusO, 0.01), `G5 ${tag} outline solid, width and offset equal the focus tokens (read ${focus.style} ${focus.w}/${focus.o}; tokens ${fix.tok.focusW}/${fix.tok.focusO})`);
      ck(near(focus.ring.top - focus.hrBottom, 2, 0.01), `G5 ${tag} ring top minus hr bottom is 2 (read ${f(focus.ring.top - focus.hrBottom)})`);
      ck(near(focus.ul.right - 1 - focus.ring.right, 8, 0.1), `G5 ${tag} panel right minus 1 minus ring right is 8 (read ${f(focus.ul.right - 1 - focus.ring.right)})`);
      ck(near(focus.ring.left - (focus.ul.left + 1), 8, 0.1), `G5 ${tag} ring left minus panel left plus 1 is 8 (read ${f(focus.ring.left - (focus.ul.left + 1))})`);
      ck(focus.ring.bottom <= focus.ul.bottom - 1 + 0.01, `G5 ${tag} ring bottom is at or above panel bottom minus 1 (ring ${f(focus.ring.bottom)}, limit ${f(focus.ul.bottom - 1)})`);
    }

    // ---- G-tabs
    const same = tabsBase.length === tabsFix.length && tabsBase.every((b, n) => ['left', 'top', 'right', 'bottom'].every((k) => near(b[k], tabsFix[n][k], 0.01)));
    ck(tabsBase.length === 5 && same, `G-tabs ${tag} the five tab row stops equal base (base ${tabsBase.map((b) => `${f(b.left)},${f(b.top)}`).join(' | ')}; fix ${tabsFix.map((b) => `${f(b.left)},${f(b.top)}`).join(' | ')})`);

    // ---- crops
    const shots = [];
    if (key === 'nb') {
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      shots.push(await crop(page, E, width, 'rest'));
      await page.evaluate(() => document.querySelector('.shell__more li > button').focus());
      await raf2(page);
      shots.push(await crop(page, E, width, 'ring'));
    } else {
      shots.push(await crop(page, E, width, 'cur'));
    }
    console.log(`    crops: ${shots.join(' | ')}`);
    return { fix, focus, innerWidth: width };
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// H: More's hover (fine pointer), and T: the header (fine pointer).
async function hoverRead(page, loc) {
  const rest = await loc.evaluate(readBtn);
  await loc.hover();
  await page.waitForTimeout(200);
  const hov = await loc.evaluate(readBtn);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(100);
  return { rest, hov };
}

async function pageH(browser, servers, engine, width, height) {
  const tag = `${engine}@${width} hover`;
  const { context, page } = await openApp(browser, servers.appUrl, ROUTE_NB, { width, height, coarse: false });
  try {
    page.setDefaultTimeout(10000);
    await settle(page);
    const names = ['Import', 'Export'];
    const loc = (n) => page.locator('.shell__more li > button').nth(n);
    await clickOpen(page);
    const base = [];
    for (let n = 0; n < 2; n += 1) base.push(await hoverRead(page, loc(n)));
    await clickClose(page);
    const deleted = await deleteOldReset(page);
    ck(deleted === 1, `G-pre ${tag} exactly one old-reset rule deleted (read ${deleted})`);
    const seps = await addSepAndRules(page);
    ck(seps === 1, `G-pre ${tag} exactly one .shell__more-sep after the insert (read ${seps})`);
    await clickOpen(page);
    const fix = [];
    for (let n = 0; n < 2; n += 1) fix.push(await hoverRead(page, loc(n)));
    names.forEach((name, n) => {
      const b = base[n];
      const x = fix[n];
      console.log(`  ${tag} ${name}: base rest ${f(b.rest.width)}x${f(b.rest.height)} border ${b.rest.bt}px, hover ${b.hov.bt}px ${f(b.hov.width)}x${f(b.hov.height)} (:hover ${b.hov.hover}); fix rest ${f(x.rest.width)}x${f(x.rest.height)} border ${x.rest.bt}px, hover ${x.hov.bt}px ${f(x.hov.width)}x${f(x.hov.height)} (:hover ${x.hov.hover})`);
      ck(b.hov.hover && b.rest.bt === 1 && b.hov.bt === 2, `G6 ${tag} base ${name}: hover entered and border goes 1px to 2px (:hover ${b.hov.hover}, ${b.rest.bt}px to ${b.hov.bt}px)`);
      ck(x.hov.hover, `G6 ${tag} fix ${name}: hover entered`);
      ck(x.rest.bt === 0 && x.hov.bt === 0, `G6 ${tag} fix ${name}: border 0 at rest and under hover (read ${x.rest.bt}px and ${x.hov.bt}px)`);
      ck(['left', 'top', 'width', 'height'].every((k) => near(x.hov[k], x.rest[k], 0.01)), `G6 ${tag} fix ${name}: the box under hover equals the box at rest (rest ${f(x.rest.left)},${f(x.rest.top)} ${f(x.rest.width)}x${f(x.rest.height)}; hover ${f(x.hov.left)},${f(x.hov.top)} ${f(x.hov.width)}x${f(x.hov.height)})`);
    });
  } finally {
    await context.close();
  }
}

async function pageT(browser, servers, engine, width) {
  const tag = `${engine}@${width} header`;
  const { context, page } = await openApp(browser, servers.appUrl, ROUTE_NB, { width, height: 900, coarse: false });
  try {
    page.setDefaultTimeout(10000);
    await page.waitForSelector('.shell__tools button');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const loc = (n) => page.locator('.shell__tools button').nth(n);
    const names = ['Import', 'Export'];
    const base = [];
    for (let n = 0; n < 2; n += 1) base.push(await hoverRead(page, loc(n)));
    const deleted = await deleteOldReset(page);
    ck(deleted === 1, `G-pre ${tag} exactly one old-reset rule deleted (read ${deleted})`);
    const control = await loc(0).evaluate(readBtn);
    const seps = await addSepAndRules(page);
    ck(seps === 1, `G-pre ${tag} exactly one .shell__more-sep after the insert (read ${seps})`);
    const fix = [];
    for (let n = 0; n < 2; n += 1) fix.push(await hoverRead(page, loc(n)));
    console.log(`  ${tag} control (old reset deleted, no new rule): Import border ${control.bt}px ${control.bs}`);
    names.forEach((name, n) => {
      const b = base[n];
      const x = fix[n];
      console.log(`  ${tag} ${name}: base rest ${f(b.rest.width)}x${f(b.rest.height)} border ${b.rest.bt}px, hover ${f(b.hov.width)}x${f(b.hov.height)} border ${b.hov.bt}px (:hover ${b.hov.hover}); fix rest ${f(x.rest.width)}x${f(x.rest.height)} border ${x.rest.bt}px, hover ${f(x.hov.width)}x${f(x.hov.height)} border ${x.hov.bt}px (:hover ${x.hov.hover})`);
      ck(b.rest.bt === 0 && b.hov.bt === 0, `G7 ${tag} base ${name}: border 0 at rest and under hover (read ${b.rest.bt}px and ${b.hov.bt}px)`);
      ck(x.rest.bt === 0 && x.hov.bt === 0 && x.hov.hover, `G7 ${tag} fix ${name}: border 0 at rest and under hover, hover entered (read ${x.rest.bt}px and ${x.hov.bt}px, :hover ${x.hov.hover})`);
      ck(['left', 'top', 'width', 'height'].every((k) => near(x.rest[k], b.rest[k], 0.01)), `G7 ${tag} fix ${name}: rest box equals base (base ${f(b.rest.width)}x${f(b.rest.height)}, fix ${f(x.rest.width)}x${f(x.rest.height)})`);
      ck(['left', 'top', 'width', 'height'].every((k) => near(x.hov[k], b.hov[k], 0.01)), `G7 ${tag} fix ${name}: hover box equals base (base ${f(b.hov.width)}x${f(b.hov.height)}, fix ${f(x.hov.width)}x${f(x.hov.height)})`);
    });
    ck(control.bt > 0, `G7 ${tag} control: with the old rule deleted and none added, Import's border-top is above 0 (read ${control.bt}px)`);
    if (width === 1366) console.log(`  ${tag} Sid at 1366: ${SID[engine].header}; probe fix: Import ${f(fix[0].rest.width)}x${f(fix[0].rest.height)}, ${f(fix[0].hov.width)}x${f(fix[0].hov.height)} under hover`);
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// G8: taps (coarse, Notebook page, fix).
async function pageTap(browser, servers, engine, width, height) {
  const tag = `${engine}@${width} taps`;
  const { context, page } = await openApp(browser, servers.appUrl, ROUTE_NB, { width, height, coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await settle(page);
    await deleteOldReset(page);
    const seps = await addSepAndRules(page);
    ck(seps === 1, `G-pre ${tag} exactly one .shell__more-sep after the insert (read ${seps})`);
    const closed = async () => {
      try {
        await page.waitForFunction(() => !document.querySelector('.shell__more').open, null, { timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    };
    const item = (text) => page.locator('.shell__more > ul').getByText(text, { exact: true }).locator('xpath=ancestor-or-self::*[self::a or self::button][1]');

    // the rule
    await tapOpen(page);
    const hr = await page.evaluate(() => {
      const b = document.querySelector('.shell__more-sep hr').getBoundingClientRect();
      const x = b.left + b.width / 2;
      const y = b.top + b.height / 2;
      const hit = document.elementFromPoint(x, y);
      return { x, y, hit: hit ? `${hit.tagName.toLowerCase()}${hit.className ? '.' + hit.className : ''}` : 'none', onRule: !!hit && (hit.matches('hr.shell__divider') || hit.matches('li.shell__more-sep')) };
    });
    ck(hr.onRule, `G8 ${tag} the tap point lands on the rule or its item (hit ${hr.hit} at ${f(hr.x)},${f(hr.y)})`);
    await page.touchscreen.tap(hr.x, hr.y);
    ck(await closed(), `G8 ${tag} a tap at the hr's centre closes More`);

    // Import: a file chooser, More closes, one file input
    await tapOpen(page);
    const chooser = page.waitForEvent('filechooser', { timeout: 3000 }).then(() => true, () => false);
    await item('Import').tap();
    ck(await chooser, `G8 ${tag} Import: a filechooser event fires`);
    ck(await closed(), `G8 ${tag} Import: More closes`);
    const inputs = await page.locator('input[type=file]').count();
    ck(inputs === 1, `G8 ${tag} Import: exactly one input[type=file] (read ${inputs})`);

    // Export: a download, More closes
    await tapOpen(page);
    const download = page.waitForEvent('download', { timeout: 5000 }).then(() => true, () => false);
    await item('Export').tap();
    ck(await download, `G8 ${tag} Export: a download event fires`);
    ck(await closed(), `G8 ${tag} Export: More closes`);

    // Kitchen, Ingredients, Search last
    for (const name of ['Kitchen', 'Ingredients', 'Search']) {
      await tapOpen(page);
      await item(name).tap();
      ck(await closed(), `G8 ${tag} ${name}: More closes`);
    }
    console.log(`  ${tag} tap on the rule hit ${hr.hit}`);
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// G9: the board beside the build, same engine.
async function board(browser, servers, engine, appData) {
  const { context, page } = await openBoard(browser, servers.repoUrl, 'more-tiles-hairline.html', { height: 1708 });
  try {
    page.setDefaultTimeout(15000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    for (const width of [393, 723]) {
      for (const kind of ['rest', 'cur', 'ring']) {
        const sel = `.fp-win.fp-mt-${width}-${kind}`;
        const tag = `${engine}@${width} board ${kind}`;
        const b = await page.evaluate(readMore, sel);
        // the app's reading it must equal: rest and ring against the Notebook page, cur against /ingredients
        const a = appData[width][kind === 'cur' ? 'ing' : 'nb'].fix;
        const rel = (d) => ({
          panel: [d.ul.box.width, d.ul.box.height, d.ul.rightGap, d.ul.bottomGap],
          items: d.items.map((i) => [i.box.left - d.ul.box.left, i.box.top - d.ul.box.top, i.box.width, i.box.height]),
          hr: [d.sep.hr.left - d.ul.box.left, d.sep.hr.top - d.ul.box.top, d.sep.hr.width, d.sep.hr.height],
          gaps: [d.sep.hr.top - d.items.find((i) => i.text === 'Search').box.bottom, d.items.find((i) => i.text === 'Import').box.top - d.sep.hr.bottom],
        });
        const ra = rel(a);
        const rb = rel(b);
        const flat = (r) => [...r.panel, ...r.items.flat(), ...r.hr, ...r.gaps];
        const fa = flat(ra);
        const fb = flat(rb);
        const bad = fa.map((v, n) => [n, v, fb[n]]).filter(([, v, w]) => !near(v, w, 0.1));
        console.log(`  ${tag}: panel ${f(b.ul.box.width)}x${f(b.ul.box.height)} rightGap ${f(b.ul.rightGap)} bottomGap ${f(b.ul.bottomGap)}; items ${b.items.map((i) => sz(i.box)).join(' ')}; hr ${sz(b.sep.hr)}; gaps ${rb.gaps.map(f).join('/')}`);
        ck(b.items.length === 5 && b.sep !== null, `G9 ${tag} five items and the separator are present`);
        ck(bad.length === 0, `G9 ${tag} the board equals the build (${bad.length} readings differ: ${bad.map(([n, v, w]) => `#${n} build ${f(v)} board ${f(w)}`).join('; ')})`);
        // crop
        const file = path.join(os.tmpdir(), `vpr-board-${engine}-${width}-${kind}.png`);
        const r = await page.evaluate((s) => {
          const e = document.querySelector(s).getBoundingClientRect();
          return { x: e.left + scrollX, y: e.bottom + scrollY - 360, w: e.width };
        }, sel);
        await page.screenshot({ path: file, fullPage: true, clip: { x: r.x, y: r.y, width: r.w, height: 360 } });
        console.log(`    crop: ${file}`);
      }
    }
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
async function runEngine(engine, browser, servers) {
  const appData = {};
  for (const [w, h] of SIZES) {
    appData[w] = {};
    for (const route of [ROUTE_NB, ROUTE_ING]) {
      const d = await pageL(browser, servers, engine, w, h, route);
      appData[w][route === ROUTE_ING ? 'ing' : 'nb'] = d;
    }
  }
  for (const [w, h] of SIZES) await pageH(browser, servers, engine, w, h);
  for (const w of [724, 1366]) await pageT(browser, servers, engine, w);
  for (const [w, h] of SIZES) await pageTap(browser, servers, engine, w, h);
  await board(browser, servers, engine, appData);
}

const servers = await startServers();
try {
  const wk = await webkit.launch();
  try {
    console.log('--- WebKit ---');
    await runEngine('webkit', wk, servers);
  } finally {
    await wk.close();
  }
  const ch = await launch();
  try {
    console.log('--- Chrome ---');
    await runEngine('chrome', ch, servers);
  } finally {
    await ch.close();
  }
} finally {
  await servers.close();
}
finish(failures, count, '261004-vpr probe');
