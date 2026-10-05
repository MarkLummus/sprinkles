// Quick task 261004-wib's probe: sketch 011 decisions 52 B (the Import error panel), 53 B (the page notice
// under the scrim) and 55 (Search below the hairline in More). Measures the EXISTING build (app/dist, read
// only) in Playwright's WebKit and system Chrome. The dist predates this quick, so the fix state is made
// in each page, from the edited source's own text:
//   A. delete the dist's `.shell__import-errors` CSSOM rule, hide the old list, insert the panel markup
//      Shell.jsx renders (createElement and textContent, never innerHTML), add the edited tokens and the
//      panel's rules with addStyleTag;
//   B. add the edited tokens only (--app-z-notice 3 and the rest);
//   C. move the separator li to just before Search's li.
// No build, no Vite, never :4173, :5173 or :8011; the harness serves app/dist on ephemeral 127.0.0.1 ports.
// A reading here is evidence about two engines, not Mark's iPhone or iPad. A DOM edit is not a build.
//
//   node 261004-wib-probe.mjs
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readAllRules, readCustomProperties } from '../../../app/src/styles/css-source.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '..', '..', '..', 'app', 'src');

const failures = [];
let count = 0;
const ck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const f = (n) => (typeof n === 'number' ? Math.round(n * 1000) / 1000 : n);
const sz = (b) => `${f(b.width)}x${f(b.height)}`;
const raf2 = (page) => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));

// ---------------------------------------------------------------------------
// Fix inputs, read from the edited source. Throw on anything missing.
const PHONE_MEDIA = '(max-width: 723.98px)';
const shellRules = readAllRules(await readFile(path.join(SRC, 'styles', 'shell.css'), 'utf8'));
const tokens = readCustomProperties(await readFile(path.join(SRC, 'styles', 'tokens.css'), 'utf8'));
const shellJsx = await readFile(path.join(SRC, 'ui', 'Shell.jsx'), 'utf8');

const TOKEN_NAMES = ['--app-z-notice', '--app-z-scrim', '--app-z-flyout', '--app-z-import-errors', '--app-z-header', '--app-size-import-errors-w', '--app-import-errors-title-leading', '--app-import-errors-leading'];
for (const name of TOKEN_NAMES) if (tokens[name] === undefined) throw new Error(`261004-wib probe: tokens.css lacks ${name}`);
const TOKENS_CSS = `:root { ${TOKEN_NAMES.map((n) => `${n}: ${tokens[n]};`).join(' ')} }`;

const panelRules = shellRules.filter((r) => r.selector.startsWith('.shell__import-errors'));
const topPanel = panelRules.filter((r) => r.media === undefined);
const phonePanel = panelRules.filter((r) => r.media === PHONE_MEDIA);
if (topPanel.length !== 5) throw new Error(`261004-wib probe: expected 5 top-level panel rules in shell.css, found ${topPanel.length}`);
if (phonePanel.length !== 1) throw new Error(`261004-wib probe: expected 1 phone panel rule in shell.css, found ${phonePanel.length}`);
const PANEL_CSS =
  topPanel.map((r) => `${r.selector} { ${r.declarations.trim()} }`).join('\n') +
  `\n@media ${PHONE_MEDIA} {\n${phonePanel.map((r) => `${r.selector} { ${r.declarations.trim()} }`).join('\n')}\n}`;
for (const cls of ['shell__import-errors', 'shell__import-errors-head', 'shell__import-errors-title', 'shell__import-errors-count', 'shell__import-errors-list']) {
  if (!shellJsx.includes(`className="${cls}"`)) throw new Error(`261004-wib probe: Shell.jsx no longer carries className="${cls}"`);
}

// ---------------------------------------------------------------------------
// Part A's files: Sid's import files (.planning/canvas-generators/imp-older.json and imp-many.json).
const FILES = {
  notjson: { name: 'not-json.json', text: 'this is not json', lines: 1 },
  older: { name: 'imp-older.json', text: '{"schemaVersion": 3, "recipes": [], "versions": [], "batches": []}', lines: 3 },
  many: {
    name: 'imp-many.json',
    text: '{"schemaVersion": 6, "recipes": [{}, {"id": "r1"}], "versions": [{"id": "v1", "rows": [{"id": "x", "ingredientName": 3, "portions": [], "ingredient": {}, "removed": "no"}], "method": [{"n": "a", "uses": 3, "targets": 1}]}, {}], "batches": [{}]}',
    lines: 49,
  },
};
const TITLE = 'This file can’t be imported';
const countText = (n) => (n === 1 ? '1 problem found' : `${n} problems found`);

// Sid's as-built readings (sketch 011 README, decision 52).
const SID_A0 = {
  webkit: { older: { 1366: 64, 1024: 79, 724: 169, 393: 128 }, many: { 1366: 754, 1024: 1024, 724: 1384, 393: 1133 } },
  chrome: { many: { 1366: 705, 724: 1321 } },
};
const SID_A_HEIGHT = {
  1366: { older: 130, many: 184 },
  1024: { older: 130, many: 184 },
  724: { older: 130, many: 184 },
  393: { older: 148, many: 184 },
};

// ---------------------------------------------------------------------------
// In-page readers.
function readBase() {
  const head = document.querySelector('header.shell__head');
  const heading = document.querySelector('main.shell__main h1, main.shell__main h2');
  return { bar: head.getBoundingClientRect().height, headingTop: heading.getBoundingClientRect().top + scrollY };
}

function readOldList() {
  const ul = document.querySelector('header.shell__head ul.shell__import-errors');
  return ul ? [...ul.querySelectorAll('li')].map((li) => li.textContent) : null;
}

function readPanel() {
  const R = (b) => ({ left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height });
  const lenOf = (name) => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:0;top:0;width:var(${name})`;
    document.body.appendChild(d);
    const v = parseFloat(getComputedStyle(d).width);
    d.remove();
    return v;
  };
  const panel = document.querySelector('.shell__import-errors');
  const list = panel.querySelector('.shell__import-errors-list');
  const close = panel.querySelector('button');
  const head = document.querySelector('header.shell__head');
  const tabs = document.querySelector('.shell__tabs');
  const cl = getComputedStyle(close);
  const cp = getComputedStyle(panel);
  const cs = getComputedStyle(list);
  const fly = document.querySelector('.shell__rail');
  return {
    box: R(panel.getBoundingClientRect()),
    z: cp.zIndex,
    role: panel.getAttribute('role'),
    pos: cp.position,
    title: panel.querySelector('.shell__import-errors-title').textContent,
    countText: panel.querySelector('.shell__import-errors-count').textContent,
    lis: [...list.querySelectorAll('li')].map((li) => li.textContent),
    list: { box: R(list.getBoundingClientRect()), clientHeight: list.clientHeight, scrollHeight: list.scrollHeight, overflowY: cs.overflowY, lineHeight: parseFloat(cs.lineHeight) },
    close: { box: R(close.getBoundingClientRect()), bt: parseFloat(cl.borderTopWidth), tabindex: close.getAttribute('tabindex'), type: close.getAttribute('type'), hover: close.matches(':hover') },
    barBottom: head.getBoundingClientRect().bottom,
    barHeight: head.getBoundingClientRect().height,
    tabsTop: tabs.getBoundingClientRect().top,
    clientWidth: document.documentElement.clientWidth,
    gapPage: lenOf('--gap-page'),
    gapXs: lenOf('--gap-xs'),
    flyZ: getComputedStyle(fly).zIndex,
    headZ: getComputedStyle(head).zIndex,
    scrollY,
  };
}

// ---------------------------------------------------------------------------
// Part A: the Import error panel (decision 52 B).
const ROUTE_NB = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const ROUTE_ING = '/ingredients';

async function deleteOldRule(page) {
  const n = await page.evaluate(() => {
    let deleted = 0;
    for (const sh of document.styleSheets) {
      let rs;
      try {
        rs = sh.cssRules;
      } catch {
        continue;
      }
      for (let i = rs.length - 1; i >= 0; i -= 1) {
        if (rs[i].selectorText === '.shell__import-errors') {
          sh.deleteRule(i);
          deleted += 1;
        }
      }
    }
    return deleted;
  });
  await raf2(page);
  return n;
}

async function preA(page) {
  return page.evaluate(() => {
    let oldRule = null;
    let newRules = 0;
    let notice = null;
    let sep = 0;
    let btn = 0;
    for (const sh of document.styleSheets) {
      let rs;
      try {
        rs = sh.cssRules;
      } catch {
        continue;
      }
      for (const r of rs) {
        if (r.selectorText === '.shell__import-errors') oldRule = r.cssText;
        if (r.selectorText && r.selectorText.startsWith('.shell__import-errors-list')) newRules += 1;
        if (r.selectorText === 'button.shell__place') btn += 1;
      }
    }
    notice = getComputedStyle(document.documentElement).getPropertyValue('--app-z-notice').trim();
    sep = document.querySelectorAll('.shell__more-sep').length;
    return { oldRule, newRules, notice, sep, btn };
  });
}

async function installPanel(page, lines) {
  await page.evaluate(
    ({ lines, title, countLabel }) => {
      const old = document.querySelector('header.shell__head ul.shell__import-errors');
      if (old) {
        old.removeAttribute('class');
        old.hidden = true;
      }
      const make = (tag, cls, text) => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text;
        return e;
      };
      const panel = make('div', 'shell__import-errors');
      panel.setAttribute('role', 'alert');
      const head = make('div', 'shell__import-errors-head');
      const wrap = make('div');
      wrap.append(make('p', 'shell__import-errors-title', title), make('p', 'shell__import-errors-count', countLabel));
      const close = make('button', 'shell__place', 'Close');
      close.type = 'button';
      close.setAttribute('tabindex', '0');
      head.append(wrap, close);
      const ul = make('ul', 'shell__import-errors-list');
      for (const line of lines) ul.append(make('li', undefined, line));
      panel.append(head, ul);
      document.querySelector('header.shell__head').after(panel);
    },
    { lines, title: TITLE, countLabel: countText(lines.length) },
  );
  await page.addStyleTag({ content: `${TOKENS_CSS}\n${PANEL_CSS}` });
  await raf2(page);
}

async function crop(page, name) {
  const file = path.join(os.tmpdir(), `wib-${name}.png`);
  await page.screenshot({ path: file });
  return file;
}

// One page: one width, one file. Returns the fix reading.
async function pageA(browser, servers, engine, width, height, fileKey, { coarse = true } = {}) {
  const file = FILES[fileKey];
  const tag = `${engine}@${width} ${fileKey}${coarse ? '' : ' fine'}`;
  const { context, page } = await openApp(browser, servers.appUrl, ROUTE_NB, { width, height, coarse });
  try {
    page.setDefaultTimeout(10000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const pre = await preA(page);
    ck(pre.oldRule !== null && pre.oldRule.includes('flex-basis'), `G-pre ${tag} the dist's old .shell__import-errors rule carries flex-basis`);
    ck(pre.newRules === 0, `G-pre ${tag} the dist has no shell__import-errors-list rule (read ${pre.newRules})`);
    ck(pre.notice === '10', `G-pre ${tag} the dist's --app-z-notice is 10 (read ${pre.notice})`);
    ck(pre.btn === 1, `G-pre ${tag} the dist carries one button.shell__place rule (read ${pre.btn})`);

    const base0 = await page.evaluate(readBase);
    await page.setInputFiles('.shell__file-input', { name: file.name, mimeType: 'application/json', buffer: Buffer.from(file.text) });
    await page.waitForSelector('header.shell__head ul.shell__import-errors li');
    await raf2(page);
    const baseErr = await page.evaluate(readBase);
    const oldLines = await page.evaluate(readOldList);
    console.log(`  ${tag} BASE no-errors bar ${f(base0.bar)}, heading top ${f(base0.headingTop)}; with errors bar ${f(baseErr.bar)}, heading top ${f(baseErr.headingTop)}; ${oldLines.length} lines`);

    // G-A0 calibration (base)
    ck(oldLines.length === file.lines, `G-A0 ${tag} the validator gives ${file.lines} line(s) (read ${oldLines.length})`);
    if (coarse) {
      const sid = SID_A0[engine] && SID_A0[engine][fileKey] && SID_A0[engine][fileKey][width];
      if (sid !== undefined) ck(near(baseErr.bar, sid, 1), `G-A0 ${tag} base bar height is Sid's as-built (read ${f(baseErr.bar)}, Sid ${sid})`);
    }

    const deleted = await deleteOldRule(page);
    ck(deleted === 1, `G-pre ${tag} exactly one old rule deleted (read ${deleted})`);
    await installPanel(page, oldLines);
    const fix = await page.evaluate(readPanel);
    const after = await page.evaluate(readBase);
    console.log(`  ${tag} FIX panel ${sz(fix.box)} @${f(fix.box.left)},${f(fix.box.top)} z ${fix.z} ${fix.pos}; bar ${f(after.bar)}, heading top ${f(after.headingTop)}; list client ${fix.list.clientHeight} scroll ${fix.list.scrollHeight} ${fix.list.overflowY} lh ${f(fix.list.lineHeight)}; Close ${sz(fix.close.box)} border ${fix.close.bt}px; gap-page ${fix.gapPage}; cw ${fix.clientWidth}`);

    // G-A1 the bar
    ck(near(after.bar, base0.bar, 0.01) && near(after.headingTop, base0.headingTop, 0.01), `G-A1 ${tag} bar and first heading equal the no-errors base (bar ${f(after.bar)} vs ${f(base0.bar)}; heading ${f(after.headingTop)} vs ${f(base0.headingTop)})`);
    if (width >= 724) ck(near(after.bar, 57, 0.01), `G-A1 ${tag} the bar is 57 (read ${f(after.bar)})`);
    else ck(near(after.bar, 62, 0.5), `G-A1 ${tag} the bar is 62 at 393 (read ${f(after.bar)})`);

    ck(fix.title === TITLE && fix.countText === countText(file.lines), `G-A3 ${tag} the title and count read as specified (read "${fix.title}" / "${fix.countText}")`);
    ck(fix.lis.length === oldLines.length && fix.lis.every((t, n) => t === oldLines[n]), `G-A3 ${tag} the li texts equal the base texts, in order`);
    ck(fix.role === 'alert' && fix.z === '6', `G-A2 ${tag} role=alert and computed z-index 6 (read ${fix.role}, ${fix.z})`);
    // The fly-out's own z-index applies only while it is open (.shell__rail--open); the comparison is made below, with it open.
    ck(Number(fix.z) < Number(fix.headZ), `G-A6 ${tag} the panel's z-index is below the bar's (panel ${fix.z}, bar ${fix.headZ})`);

    // G-A3 the list
    ck(near(fix.list.clientHeight, 6 * fix.list.lineHeight, 0.5) || fix.list.scrollHeight <= 6 * fix.list.lineHeight + 1, `G-A3 ${tag} the list's client height is six lines (client ${fix.list.clientHeight}, 6 x ${f(fix.list.lineHeight)} = ${f(6 * fix.list.lineHeight)})`);
    if (fileKey === 'many') ck(fix.list.scrollHeight > fix.list.clientHeight && fix.list.overflowY === 'auto', `G-A3 ${tag} 49 lines scroll inside the list (scroll ${fix.list.scrollHeight} > client ${fix.list.clientHeight}, overflow-y ${fix.list.overflowY})`);
    if (fileKey === 'older' && width === 1366) ck(fix.list.scrollHeight <= fix.list.clientHeight + 1, `G-A3 ${tag} 3 lines do not scroll at 1366 (scroll ${fix.list.scrollHeight}, client ${fix.list.clientHeight})`);
    ck(fix.list.clientHeight === 108 || fileKey !== 'many', `G-A3 ${tag} (many) client height is 108 (read ${fix.list.clientHeight})`);

    // G-A2 from 724
    if (width >= 724) {
      ck(near(fix.box.width, 480, 0.01), `G-A2 ${tag} width 480 (read ${f(fix.box.width)})`);
      ck(near(fix.box.top, fix.barBottom + 6, 0.01), `G-A2 ${tag} top is the bar's bottom plus 6 (top ${f(fix.box.top)}, bar bottom ${f(fix.barBottom)})`);
      ck(near(fix.box.right, fix.clientWidth - fix.gapPage, 0.01), `G-A2 ${tag} right is the window less the page gutter (right ${f(fix.box.right)}, ${fix.clientWidth} - ${fix.gapPage})`);
      if (engine === 'webkit' && coarse) ck(near(fix.box.height, SID_A_HEIGHT[width][fileKey] ?? -1, 0.5) || fileKey === 'notjson', `G-A2 ${tag} WebKit height is Sid's (read ${f(fix.box.height)}, Sid ${SID_A_HEIGHT[width][fileKey]})`);
    } else {
      // G-A5 at 393
      ck(near(fix.box.left, fix.gapPage, 0.01) && near(fix.box.right, fix.clientWidth - fix.gapPage, 0.01) && near(fix.box.width, 353, 0.01), `G-A5 ${tag} left ${f(fix.box.left)} (gutter ${fix.gapPage}), right ${f(fix.box.right)}, width ${f(fix.box.width)} (353)`);
      ck(near(fix.box.bottom, fix.tabsTop - 6, 0.01), `G-A5 ${tag} bottom is the tab row's top minus 6 (bottom ${f(fix.box.bottom)}, tabs top ${f(fix.tabsTop)})`);
      if (engine === 'webkit' && fileKey !== 'notjson') ck(near(fix.box.height, SID_A_HEIGHT[393][fileKey], 0.5), `G-A5 ${tag} WebKit height is Sid's (read ${f(fix.box.height)}, Sid ${SID_A_HEIGHT[393][fileKey]})`);
    }

    // G-A4 Close
    if (coarse) {
      ck(fix.close.bt === 0 && near(fix.close.box.height, 44, 0.01) && fix.close.tabindex === '0' && fix.close.type === 'button', `G-A4 ${tag} Close: border 0, height 44, tabindex 0, type button (read ${fix.close.bt}px, ${f(fix.close.box.height)}, ${fix.close.tabindex}, ${fix.close.type})`);
    } else {
      const loc = page.locator('.shell__import-errors button');
      const restBox = await loc.boundingBox();
      const restBt = await loc.evaluate((e) => parseFloat(getComputedStyle(e).borderTopWidth));
      await loc.hover();
      await page.waitForTimeout(200);
      const hovBox = await loc.boundingBox();
      const hov = await loc.evaluate((e) => ({ bt: parseFloat(getComputedStyle(e).borderTopWidth), hover: e.matches(':hover') }));
      console.log(`  ${tag} Close (fine pointer): rest ${f(restBox.width)}x${f(restBox.height)} border ${restBt}px; hover ${f(hovBox.width)}x${f(hovBox.height)} border ${hov.bt}px (:hover ${hov.hover}) -- a reading for the open hover-shrink todo, not a gate`);
      ck(restBt === 0 && hov.bt === 0 && hov.hover, `G-A4 ${tag} Close: border 0 at rest and under hover, hover entered (read ${restBt}px and ${hov.bt}px, :hover ${hov.hover})`);
      fix.fine = { restBox, hovBox };
    }

    // G-A5 scrolled at 393
    let scrolled = null;
    if (width < 724) {
      await page.evaluate(() => scrollTo(0, 400));
      await raf2(page);
      scrolled = await page.evaluate(readPanel);
      ck(scrolled.scrollY > 0, `G-A5 ${tag} the page did scroll (scrollY ${f(scrolled.scrollY)})`);
      ck(['left', 'top', 'width', 'height'].every((k) => near(scrolled.box[k], fix.box[k], 0.01)), `G-A5 ${tag} the panel's rect is unchanged after scrollTo(0,400) (${sz(fix.box)} @${f(fix.box.left)},${f(fix.box.top)} vs @${f(scrolled.box.left)},${f(scrolled.box.top)})`);
    }
    const shot = await crop(page, `${engine}-${width}-${fileKey}${coarse ? '' : '-fine'}`);
    console.log(`    crop: ${shot}`);

    // G-A6 the stack (fly-out), 724 to 1589 only
    if (width >= 724 && width <= 1589 && coarse && fileKey !== 'notjson') {
      await page.evaluate(() => document.querySelector('button.shell__menu').click());
      await page.waitForSelector('.shell__rail--open');
      await raf2(page);
      const hit = await page.evaluate(() => {
        const panel = document.querySelector('.shell__import-errors');
        const fly = document.querySelector('.shell__rail').getBoundingClientRect();
        const pb = panel.getBoundingClientRect();
        const pts = { nearEdge: [fly.right - 14, pb.top + pb.height / 2], centre: [pb.left + pb.width / 2, pb.top + pb.height / 2] };
        const out = { flyRight: fly.right, panelLeft: pb.left, flyZ: getComputedStyle(document.querySelector('.shell__rail')).zIndex, panelZ: getComputedStyle(panel).zIndex };
        for (const [k, [x, y]] of Object.entries(pts)) {
          const e = document.elementFromPoint(x, y);
          out[k] = { x, y, inPanel: !!e && panel.contains(e), what: e ? `${e.tagName.toLowerCase()}.${e.className}` : 'none' };
        }
        return out;
      });
      console.log(`  ${tag} stack: fly-out right ${f(hit.flyRight)}, panel left ${f(hit.panelLeft)}; near-edge point ${f(hit.nearEdge.x)},${f(hit.nearEdge.y)} hits ${hit.nearEdge.what}; centre hits ${hit.centre.what}`);
      ck(Number(hit.flyZ) < Number(hit.panelZ), `G-A6 ${tag} with the fly-out open the panel's z-index is above the fly-out's (fly-out ${hit.flyZ}, panel ${hit.panelZ})`);
      if (width === 724) ck(hit.nearEdge.inPanel, `G-A6 ${tag} the point 14 inside the fly-out's right edge, at the panel's mid-height, hits the panel (hit ${hit.nearEdge.what})`);
      if (width === 1366) ck(hit.centre.inPanel, `G-A6 ${tag} with the fly-out open the panel's centre hits the panel, not the scrim (hit ${hit.centre.what})`);
    }

    // R-A8 More over the panel at 393 (older file)
    if (width === 393 && fileKey === 'older') {
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('.shell__more > summary').tap();
      await page.waitForSelector('.shell__more[open]');
      await page.waitForTimeout(200);
      const hits = await page.evaluate(() => {
        const panel = document.querySelector('.shell__import-errors');
        const ul = document.querySelector('.shell__more > ul').getBoundingClientRect();
        const out = {};
        for (const t of ['Search', 'Import', 'Export']) {
          const el = [...document.querySelectorAll('.shell__more > ul a, .shell__more > ul button')].find((e) => e.textContent.trim() === t);
          const b = el.getBoundingClientRect();
          const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
          out[t] = { box: `${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}x${Math.round(b.height)}`, hit: hit ? `${hit.tagName.toLowerCase()}${hit.className ? '.' + hit.className : ''}` : 'none', inPanel: !!hit && panel.contains(hit) };
        }
        return { out, ul: { left: ul.left, top: ul.top, right: ul.right, bottom: ul.bottom }, panel: panel.getBoundingClientRect().toJSON() };
      });
      console.log(`  R-A8 ${tag} More open over the panel: More's list x ${f(hits.ul.left)}-${f(hits.ul.right)}, y ${f(hits.ul.top)}-${f(hits.ul.bottom)}; panel x ${f(hits.panel.left)}-${f(hits.panel.right)}, y ${f(hits.panel.top)}-${f(hits.panel.bottom)}`);
      for (const [t, v] of Object.entries(hits.out)) console.log(`    R-A8 ${t} centre (${v.box}) hits ${v.hit}; inside the panel: ${v.inPanel}`);
      const shot2 = await crop(page, `${engine}-393-more-over-panel`);
      console.log(`    crop: ${shot2}`);
    }
    return { fix, scrolled, baseErr, innerHeight: height };
  } finally {
    await context.close();
  }
}
// ---------------------------------------------------------------------------
// G-A7: the board beside the build, same engine.
async function boardA(browser, servers, engine, appA) {
  const { context, page } = await openBoard(browser, servers.repoUrl, 'import-errors-placement.html', { coarse: true, height: 3670 });
  try {
    page.setDefaultTimeout(15000);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const windows = [
      ['fp-B-older-1366', 1366, 'older'],
      ['fp-B-many-1366', 1366, 'many'],
      ['fp-B-older-724', 724, 'older'],
      ['fp-B-older-393', 393, 'older'],
      ['fp-B-many-393', 393, 'many'],
    ];
    for (const [cls, width, fileKey] of windows) {
      const tag = `${engine} board ${cls}`;
      const b = await page.evaluate((sel) => {
        const win = document.querySelector(sel);
        const wb = win.getBoundingClientRect();
        const panel = win.querySelector('.imp-panel');
        if (!panel) return null;
        const rel = (e) => {
          const r = e.getBoundingClientRect();
          return { left: r.left - wb.left, top: r.top - wb.top, width: r.width, height: r.height };
        };
        return { win: { width: wb.width, height: wb.height }, panel: rel(panel), list: rel(panel.querySelector('.imp-panel__list')), close: rel(panel.querySelector('.shell__place')) };
      }, `.fp-win.${cls}`);
      ck(b !== null, `G-A7 ${tag} the window carries an .imp-panel`);
      if (!b) continue;
      const app = appA[width][fileKey];
      const pick = (d) => ({ panel: d.fix.box, list: d.fix.list.box, close: d.fix.close.box });
      const a = pick(width === 393 && app.scrolled ? { fix: app.scrolled } : app);
      const bad = [];
      for (const part of ['panel', 'list', 'close']) {
        for (const k of ['left', 'top', 'width', 'height']) {
          if (!near(a[part][k], b[part][k], 0.1)) bad.push(`${part}.${k} build ${f(a[part][k])} board ${f(b[part][k])}`);
        }
      }
      console.log(`  ${tag} (window ${f(b.win.width)}x${f(b.win.height)}): panel ${sz(b.panel)} @${f(b.panel.left)},${f(b.panel.top)}; list ${sz(b.list)}; Close ${sz(b.close)}`);
      ck(bad.length === 0, `G-A7 ${tag} the board equals the build (${bad.length} readings differ: ${bad.join('; ')})`);
      const file = path.join(os.tmpdir(), `wib-board-${engine}-${cls}.png`);
      await page.locator(`.fp-win.${cls}`).screenshot({ path: file });
      console.log(`    crop: ${file}`);
    }
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Part B: the notice under the scrim (decision 53 B).
async function pageB(browser, servers, engine, width, state) {
  const tag = `${engine}@${width} notice ${state}`;
  const { context, page } = await openApp(browser, servers.appUrl, ROUTE_NB, { width, height: 900, coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await page.waitForSelector('.notebook-log');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    if (state === 'fix') {
      await page.addStyleTag({ content: TOKENS_CSS });
      await raf2(page);
    }
    // Sid's save-a-version flow (.planning/canvas-generators/notice-capture.mjs): raises "Version saved."
    await page.getByRole('button', { name: /next version/i }).first().click();
    await page.waitForTimeout(400);
    await page.getByLabel('Why').fill('test');
    await page.getByLabel('Version name').fill('v2');
    const t0 = Date.now();
    await page.getByRole('button', { name: 'Save as a new version', exact: true }).click();
    await page.waitForFunction(() => (document.querySelector('.page-status')?.textContent || '').length > 0);
    await page.waitForTimeout(700); // the save navigates to the new version; a route change would close the fly-out (as Sid's capture waits)
    await page.evaluate(() => document.querySelector('button.shell__menu').click());
    await page.waitForSelector('.shell__rail--open');
    await raf2(page);

    // Lift inert, hit-test, restore at once.
    const readHits = (longText) =>
      page.evaluate((longText) => {
        const main = document.querySelector('main.shell__main');
        const n = document.querySelector('.page-status');
        if (longText) n.textContent = longText;
        const nb = n.getBoundingClientRect();
        const fly = document.querySelector('.shell__rail').getBoundingClientRect();
        const was = main.inert;
        main.inert = false;
        const name = (e) => (e ? `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''}` : 'none');
        const centre = document.elementFromPoint(nb.x + nb.width / 2, nb.y + nb.height / 2);
        const beside = document.elementFromPoint(fly.right + 10, nb.y + nb.height / 2);
        main.inert = was;
        const home = document.querySelector('nav#places a[href="/"]');
        return {
          text: n.textContent,
          notice: { x: nb.x, y: nb.y, w: nb.width, h: nb.height },
          fly: { right: fly.right },
          z: { notice: getComputedStyle(n).zIndex, scrim: getComputedStyle(document.querySelector('.shell__scrim')).zIndex, fly: getComputedStyle(document.querySelector('.shell__rail')).zIndex },
          centre: { what: name(centre), notice: !!centre && (centre === n || n.contains(centre)), home: !!centre && !!centre.closest('nav#places a[href="/"]'), place: centre && centre.closest('nav#places a') ? centre.closest('nav#places a').textContent.trim() : null },
          beside: { what: name(beside), scrim: !!beside && beside.classList.contains('shell__scrim'), notice: !!beside && (beside === n || n.contains(beside)) },
          homeFocused: document.activeElement === home,
        };
      }, longText);
    const short = await readHits(null);
    const e1 = Date.now() - t0;
    const long = await readHits('Tasting removed. You can restore it.');
    const e2 = Date.now() - t0;
    console.log(`  ${tag} short "${short.text}" notice ${Math.round(short.notice.x)},${Math.round(short.notice.y)} ${Math.round(short.notice.w)}x${Math.round(short.notice.h)}; z notice ${short.z.notice} scrim ${short.z.scrim} fly-out ${short.z.fly}; centre hits ${short.centre.what} (${short.centre.place ?? '-'}); Home focused ${short.homeFocused}; ${e1}ms after save`);
    console.log(`  ${tag} long "${long.text}" ${Math.round(long.notice.w)}x${Math.round(long.notice.h)}; the point 10 right of the fly-out (${Math.round(long.fly.right)}) hits ${long.beside.what}; ${e2}ms after save`);
    const shot = await crop(page, `${engine}-${width}-notice-${state}`);
    console.log(`    crop: ${shot}`);
    const inTime = (ms, label) => {
      if (ms > 5000) {
        console.log(`  ${tag} ${label} NOT MEASURED: read ${ms}ms after the save, past the notice's 5 seconds`);
        return false;
      }
      return true;
    };
    ck(inTime(e1, 'G-B0/G-B1 reading'), `G-B ${tag} the reading was within 5 seconds (read ${e1}ms)`);
    if (state === 'base') {
      ck(short.z.notice === '10' && short.centre.notice, `G-B0 ${tag} the notice's z-index is 10 and its centre hits the notice (z ${short.z.notice}, hit ${short.centre.what})`);
      ck(long.beside.notice, `G-B2 ${tag} base: the point beside the fly-out hits the notice (hit ${long.beside.what})`);
    } else {
      ck(short.z.notice === '3' && short.z.scrim === '4' && short.z.fly === '5', `G-B1 ${tag} computed z-indexes are notice 3, scrim 4, fly-out 5 (read ${short.z.notice}, ${short.z.scrim}, ${short.z.fly})`);
      ck(short.centre.home, `G-B1 ${tag} the notice's centre hits the Home link inside nav#places (hit ${short.centre.what}, place ${short.centre.place})`);
      ck(short.homeFocused, `G-B1 ${tag} Home is document.activeElement`);
      ck(inTime(e2, 'G-B2 reading') && long.beside.scrim, `G-B2 ${tag} the long notice: the point beside the fly-out hits .shell__scrim (hit ${long.beside.what})`);
      // G-B3: close the fly-out; the notice is bright again.
      await page.evaluate(() => document.querySelector('button.shell__menu').click());
      await page.waitForFunction(() => !document.querySelector('.shell__rail--open'));
      await raf2(page);
      const back = await page.evaluate(() => {
        const n = document.querySelector('.page-status');
        const nb = n.getBoundingClientRect();
        const e = document.elementFromPoint(nb.x + nb.width / 2, nb.y + nb.height / 2);
        return { text: n.textContent, hit: !!e && (e === n || n.contains(e)), what: e ? `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}` : 'none' };
      });
      const e3 = Date.now() - t0;
      ck(inTime(e3, 'G-B3 reading') && back.hit && back.text.length > 0, `G-B3 ${tag} with the fly-out closed the notice's centre hits the notice and its text is still there (hit ${back.what}, text "${back.text}", ${e3}ms)`);
    }
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Part C: Search below the hairline (decision 55). Readers copied from the 261004-vpr probe.
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
          prev: sepLi.previousElementSibling ? sepLi.previousElementSibling.textContent.trim() : null,
          next: sepLi.nextElementSibling ? sepLi.nextElementSibling.textContent.trim() : null,
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
  const search = [...document.querySelectorAll('.shell__more > ul a')].find((a) => a.getAttribute('href') === '/search').getBoundingClientRect();
  return {
    text: e.textContent.trim(),
    style: c.outlineStyle,
    w,
    o,
    ring: { left: b.left - w - o, top: b.top - w - o, right: b.right + w + o, bottom: b.bottom + w + o },
    ul: { left: ul.left, right: ul.right, bottom: ul.bottom },
    hrBottom: hb ? hb.bottom : null,
    searchBottom: search.bottom,
  };
}

function readBtn(e) {
  const b = e.getBoundingClientRect();
  const c = getComputedStyle(e);
  return { left: b.left, top: b.top, width: b.width, height: b.height, bt: parseFloat(c.borderTopWidth), bs: c.borderTopStyle, hover: e.matches(':hover') };
}

async function countPreC(page) {
  return page.evaluate(() => {
    let btn = 0;
    let old = 0;
    for (const sh of document.styleSheets) {
      let rs;
      try {
        rs = sh.cssRules;
      } catch {
        continue;
      }
      for (const r of rs) {
        if (r.selectorText === 'button.shell__place') btn += 1;
        if (r.selectorText === '.shell__tools button') old += 1;
      }
    }
    const sep = document.querySelector('.shell__more-sep');
    return { btn, old, seps: document.querySelectorAll('.shell__more-sep').length, prev: sep && sep.previousElementSibling ? sep.previousElementSibling.textContent.trim() : null };
  });
}

// The fix: one DOM move, the existing separator li to just before Search's li.
async function moveSep(page) {
  await page.evaluate(() => {
    const ul = document.querySelector('.shell__more > ul');
    const sep = ul.querySelector('li.shell__more-sep');
    const searchLi = ul.querySelector('a[href="/search"]').closest('li');
    searchLi.before(sep);
  });
  await raf2(page);
  return page.evaluate(() => {
    const sep = document.querySelector('.shell__more-sep');
    return { seps: document.querySelectorAll('.shell__more-sep').length, prev: sep.previousElementSibling.textContent.trim(), next: sep.nextElementSibling.textContent.trim() };
  });
}

const SID = {
  webkit: {
    fix: { nb: { panel: [101.5, 284], tile: 75.5, h: [49, 49, 49, 49, 49] }, ing: { panel: [105.2, 284], tile: 79.2, h: [49, 49, 49, 49, 49] } },
  },
  chrome: {
    fix: { nb: { panel: [97.6, 279], tile: 71.6, h: [48, 48, 48, 48, 48] }, ing: { panel: [102.4, 280], tile: 76.4, h: [49, 48, 48, 48, 48] } },
  },
};
const SIZES = [
  [393, 852],
  [723, 852],
];

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
async function cropC(page, engine, width, state) {
  const file = path.join(os.tmpdir(), `wib-${engine}-${width}-more-${state}.png`);
  const h = page.viewportSize().height;
  await page.screenshot({ path: file, clip: { x: 0, y: h - 360, width: page.viewportSize().width, height: 360 } });
  return file;
}

async function pageL(browser, servers, engine, width, height, route) {
  const E = engine;
  const key = route === ROUTE_ING ? 'ing' : 'nb';
  const tag = `${E}@${width} ${key}`;
  const { context, page } = await openApp(browser, servers.appUrl, route, { width, height, coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await settle(page);
    const pre = await countPreC(page);
    ck(pre.btn === 1 && pre.old === 0, `G-C-pre ${tag} the dist carries one button.shell__place rule and no .shell__tools button rule (read ${pre.btn} and ${pre.old})`);
    ck(pre.seps === 1 && pre.prev === 'Search', `G-C-pre ${tag} one separator, its previous sibling holds Search (read ${pre.seps}, prev "${pre.prev}")`);

    const tabsBase = await page.evaluate(readTabs);
    await tapOpen(page);
    const base = await page.evaluate(readMore, null);
    await tapClose(page);

    const moved = await moveSep(page);
    ck(moved.seps === 1 && moved.prev === 'Kitchen' && moved.next === 'Search', `G-C-pre ${tag} after the move the separator's previous sibling holds Kitchen and its next holds Search (read "${moved.prev}" / "${moved.next}")`);
    const tabsFix = await page.evaluate(readTabs);
    await tapOpen(page);
    const fix = await page.evaluate(readMore, null);

    console.log(`  ${tag} BASE panel ${sz(base.ul.box)} rightGap ${f(base.ul.rightGap)} bottomGap ${f(base.ul.bottomGap)}; order ${base.items.map((i) => i.text).join(', ')}`);
    console.log(`  ${tag} FIX  panel ${sz(fix.ul.box)} border ${fix.ul.bw}px ${fix.ul.bs} pad ${fix.ul.pad.join('/')} rightGap ${f(fix.ul.rightGap)} bottomGap ${f(fix.ul.bottomGap)}; order ${fix.items.map((i) => i.text).join(', ')}`);
    for (const i of fix.items) console.log(`    fix  ${i.text.padEnd(12)} ${i.tag.padEnd(6)} ${sz(i.box)} border ${i.bt}px pad-x ${i.pl}/${i.pr} weight ${i.fw}`);
    const s = fix.sep;
    console.log(`    fix  separator li ${sz(s.li)} aria-hidden=${s.hidden} control=${s.control}; hr ${sz(s.hr)} @${f(s.hr.left)},${f(s.hr.top)} margins ${s.m.join('/')}`);

    // G-C1 the panel keeps its size (only the rule moved)
    const S = SID[E].fix[key];
    ck(near(fix.ul.box.width, base.ul.box.width, 0.01) && near(fix.ul.box.height, base.ul.box.height, 0.01), `G-C1 ${tag} the panel's size equals the base reading (base ${sz(base.ul.box)}, fix ${sz(fix.ul.box)})`);
    ck(near(fix.ul.box.width, S.panel[0], 0.1) && near(fix.ul.box.height, S.panel[1], 0.1), `G-C1 ${tag} the panel's size is Sid's (read ${sz(fix.ul.box)}, Sid ${S.panel.join('x')})`);
    ck(near(fix.ul.rightGap, base.ul.rightGap, 0.01), `G-C1 ${tag} the right edge equals the base right edge (base ${f(base.ul.rightGap)}, fix ${f(fix.ul.rightGap)}; vpr recorded the pre-existing 0.031px WebKit gap)`);
    ck(near(fix.ul.bottomGap, base.ul.bottomGap, 0.01), `G-C1 ${tag} tab row top minus panel bottom equals base (base ${f(base.ul.bottomGap)}, fix ${f(fix.ul.bottomGap)})`);
    ck(fix.items.map((i) => i.text).join() === 'Ingredients,Kitchen,Search,Import,Export', `G-C1 ${tag} More reads Ingredients, Kitchen, Search, Import, Export in DOM order (read ${fix.items.map((i) => i.text).join()})`);

    // G-C2 tiles
    ck(fix.items.length === 5 && fix.items.every((i) => near(i.box.width, S.tile, 0.1)), `G-C2 ${tag} five tiles at Sid's width (read ${fix.items.map((i) => f(i.box.width)).join(', ')}, Sid ${S.tile})`);
    ck(fix.items.every((i, n) => near(i.box.height, S.h[n], 0.1)), `G-C2 ${tag} tile heights per Sid (read ${fix.items.map((i) => f(i.box.height)).join(', ')}, Sid ${S.h.join(', ')})`);
    ck(fix.items.every((i) => i.bt === 0), `G-C2 ${tag} every item's border-top-width is 0 (read ${fix.items.map((i) => i.bt).join(', ')})`);

    // G-C3 the rule
    const kitchen = fix.items.find((i) => i.text === 'Kitchen');
    const search = fix.items.find((i) => i.text === 'Search');
    ck(s.hidden === 'true' && near(s.li.height, 1, 0.01) && !s.control, `G-C3 ${tag} li is aria-hidden=true, 1px tall, holds no control`);
    ck(near(s.hr.width, fix.items[0].box.width, 0.01) && near(s.hr.height, 1, 0.01), `G-C3 ${tag} the rule is as wide as the tiles and 1 tall (hr ${sz(s.hr)}, tiles ${f(fix.items[0].box.width)})`);
    ck(near(s.hr.top - kitchen.box.bottom, 6, 0.01), `G-C3 ${tag} Kitchen's bottom to the hr's top is 6 (read ${f(s.hr.top - kitchen.box.bottom)})`);
    ck(near(search.box.top - s.hr.bottom, 6, 0.01), `G-C3 ${tag} the hr's bottom to Search's top is 6 (read ${f(search.box.top - s.hr.bottom)})`);

    // G-C3b current place (/ingredients)
    if (key === 'ing') {
      const cur = fix.items.find((i) => i.text === 'Ingredients');
      ck(cur.current && cur.bg === fix.tok.subtle && cur.fw === '600', `G-C3 ${tag} Ingredients is current, on --app-surface-subtle, weight 600 (read ${cur.current}, ${cur.bg}, ${cur.fw})`);
      ck(fix.ink && near(fix.ink.left, 6, 0.1) && near(fix.ink.right, 6, 0.1), `G-C3 ${tag} ink insets 6 and 6 (read ${fix.ink ? `${f(fix.ink.left)} and ${f(fix.ink.right)}` : 'none'})`);
    }

    // G-C4 the ring, Notebook page only: Search focused, then Import
    let focus = null;
    if (key === 'nb') {
      await page.evaluate(() => [...document.querySelectorAll('.shell__more > ul a')].find((a) => a.getAttribute('href') === '/search').focus());
      await raf2(page);
      focus = await page.evaluate(readFocus);
      console.log(`    fix  focus ${focus.text}: outline ${focus.style} w ${focus.w} offset ${focus.o}; ring top ${f(focus.ring.top)} hr bottom ${f(focus.hrBottom)}; panel L ${f(focus.ul.left)} R ${f(focus.ul.right)}`);
      ck(focus.text === 'Search', `G-C4 ${tag} Search is focused (read ${focus.text})`);
      ck(near(focus.ring.top - focus.hrBottom, 2, 0.01), `G-C4 ${tag} Search ring top minus hr bottom is 2 (read ${f(focus.ring.top - focus.hrBottom)})`);
      ck(near(focus.ul.right - 1 - focus.ring.right, 8, 0.1), `G-C4 ${tag} panel right minus 1 minus ring right is 8 (read ${f(focus.ul.right - 1 - focus.ring.right)})`);
      ck(near(focus.ring.left - (focus.ul.left + 1), 8, 0.1), `G-C4 ${tag} ring left minus panel left plus 1 is 8 (read ${f(focus.ring.left - (focus.ul.left + 1))})`);
      await page.evaluate(() => document.querySelector('.shell__more li > button').focus());
      await raf2(page);
      const fImp = await page.evaluate(readFocus);
      console.log(`    fix  focus ${fImp.text}: ring top ${f(fImp.ring.top)}, Search's bottom ${f(fImp.searchBottom)}: the ring reaches ${f(fImp.searchBottom - fImp.ring.top)} into Search's tile (Sid: 4)`);
    }

    const same = tabsBase.length === tabsFix.length && tabsBase.every((b, n) => ['left', 'top', 'right', 'bottom'].every((k) => near(b[k], tabsFix[n][k], 0.01)));
    ck(tabsBase.length === 5 && same, `G-tabs ${tag} the five tab row stops equal base`);

    const shots = [];
    if (key === 'nb') {
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      shots.push(await cropC(page, E, width, 'rest'));
      await page.evaluate(() => [...document.querySelectorAll('.shell__more > ul a')].find((a) => a.getAttribute('href') === '/search').focus());
      await raf2(page);
      shots.push(await cropC(page, E, width, 'ring'));
    } else {
      shots.push(await cropC(page, E, width, 'cur'));
    }
    console.log(`    crops: ${shots.join(' | ')}`);
    return { fix };
  } finally {
    await context.close();
  }
}

// G-C5: More's hover (fine pointer).
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
    await moveSep(page);
    await clickOpen(page);
    const locs = { Search: page.locator('.shell__more > ul a[href="/search"]'), Import: page.locator('.shell__more li > button').nth(0) };
    for (const [name, loc] of Object.entries(locs)) {
      const r = await hoverRead(page, loc);
      console.log(`  ${tag} ${name}: rest ${sz(r.rest)} border ${r.rest.bt}px; hover ${sz(r.hov)} border ${r.hov.bt}px (:hover ${r.hov.hover})`);
      ck(r.hov.hover && r.rest.bt === 0 && r.hov.bt === 0, `G-C5 ${tag} ${name}: hover entered, border 0 at rest and under hover (read ${r.rest.bt}px and ${r.hov.bt}px)`);
      ck(['left', 'top', 'width', 'height'].every((k) => near(r.hov[k], r.rest[k], 0.01)), `G-C5 ${tag} ${name}: box unmoved under hover (rest ${f(r.rest.left)},${f(r.rest.top)} ${sz(r.rest)}; hover ${f(r.hov.left)},${f(r.hov.top)} ${sz(r.hov)})`);
    }
  } finally {
    await context.close();
  }
}

// G-C6: taps (coarse, Notebook page, fix).
async function pageTap(browser, servers, engine, width, height) {
  const tag = `${engine}@${width} taps`;
  const { context, page } = await openApp(browser, servers.appUrl, ROUTE_NB, { width, height, coarse: true });
  try {
    page.setDefaultTimeout(10000);
    await settle(page);
    const moved = await moveSep(page);
    ck(moved.prev === 'Kitchen' && moved.next === 'Search', `G-C-pre ${tag} separator moved`);
    const closed = async () => {
      try {
        await page.waitForFunction(() => !document.querySelector('.shell__more').open, null, { timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    };
    const item = (text) => page.locator('.shell__more > ul').getByText(text, { exact: true }).locator('xpath=ancestor-or-self::*[self::a or self::button][1]');

    await tapOpen(page);
    const hr = await page.evaluate(() => {
      const b = document.querySelector('.shell__more-sep hr').getBoundingClientRect();
      const x = b.left + b.width / 2;
      const y = b.top + b.height / 2;
      const hit = document.elementFromPoint(x, y);
      return { x, y, hit: hit ? `${hit.tagName.toLowerCase()}${hit.className ? '.' + hit.className : ''}` : 'none', onRule: !!hit && (hit.matches('hr.shell__divider') || hit.matches('li.shell__more-sep')) };
    });
    ck(hr.onRule, `G-C6 ${tag} the tap point lands on the rule or its item (hit ${hr.hit})`);
    await page.touchscreen.tap(hr.x, hr.y);
    ck(await closed(), `G-C6 ${tag} a tap on the rule closes More`);

    await tapOpen(page);
    const chooser = page.waitForEvent('filechooser', { timeout: 3000 }).then(() => true, () => false);
    await item('Import').tap();
    ck(await chooser, `G-C6 ${tag} Import: a filechooser event fires`);
    ck(await closed(), `G-C6 ${tag} Import: More closes`);

    await tapOpen(page);
    const download = page.waitForEvent('download', { timeout: 5000 }).then(() => true, () => false);
    await item('Export').tap();
    ck(await download, `G-C6 ${tag} Export: a download event fires`);
    ck(await closed(), `G-C6 ${tag} Export: More closes`);

    for (const name of ['Kitchen', 'Ingredients']) {
      await tapOpen(page);
      await item(name).tap();
      ck(await closed(), `G-C6 ${tag} ${name}: More closes`);
    }
    await tapOpen(page);
    await item('Search').tap();
    ck(await closed(), `G-C6 ${tag} Search: More closes`);
    await page.waitForFunction(() => location.pathname === '/search', null, { timeout: 3000 }).catch(() => {});
    ck(new URL(page.url()).pathname === '/search', `G-C6 ${tag} Search: the route is /search (read ${new URL(page.url()).pathname})`);
    console.log(`  ${tag} tap on the rule hit ${hr.hit}`);
  } finally {
    await context.close();
  }
}

// G-C7: the board beside the build.
async function boardC(browser, servers, engine, appData) {
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
        const a = appData[width][kind === 'cur' ? 'ing' : 'nb'].fix;
        const rel = (d) => ({
          panel: [d.ul.box.width, d.ul.box.height, d.ul.rightGap, d.ul.bottomGap],
          items: d.items.map((i) => [i.box.left - d.ul.box.left, i.box.top - d.ul.box.top, i.box.width, i.box.height]),
          hr: [d.sep.hr.left - d.ul.box.left, d.sep.hr.top - d.ul.box.top, d.sep.hr.width, d.sep.hr.height],
          gaps: [d.sep.hr.top - d.items.find((i) => i.text === 'Kitchen').box.bottom, d.items.find((i) => i.text === 'Search').box.top - d.sep.hr.bottom],
        });
        const ra = rel(a);
        const rb = rel(b);
        const flat = (r) => [...r.panel, ...r.items.flat(), ...r.hr, ...r.gaps];
        const fa = flat(ra);
        const fb = flat(rb);
        const bad = fa.map((v, n) => [n, v, fb[n]]).filter(([, v, w]) => !near(v, w, 0.1));
        console.log(`  ${tag}: order ${b.items.map((i) => i.text).join(', ')}; panel ${sz(b.ul.box)}; items ${b.items.map((i) => sz(i.box)).join(' ')}; hr ${sz(b.sep.hr)}; gaps ${rb.gaps.map(f).join('/')}`);
        ck(b.items.length === 5 && b.sep !== null, `G-C7 ${tag} five items and the separator are present`);
        ck(b.sep.prev === 'Kitchen' && b.sep.next === 'Search', `G-C7 ${tag} the board's separator sits between Kitchen and Search (read "${b.sep.prev}" / "${b.sep.next}")`);
        ck(bad.length === 0, `G-C7 ${tag} the board equals the build (${bad.length} readings differ: ${bad.map(([n, v, w]) => `#${n} build ${f(v)} board ${f(w)}`).join('; ')})`);
        const file = path.join(os.tmpdir(), `wib-board-${engine}-more-${width}-${kind}.png`);
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
  console.log(`== Part A: the Import error panel (${engine}) ==`);
  const WIDTHS = [
    [1366, 900],
    [1024, 900],
    [724, 900],
    [393, 852],
  ];
  const appA = {};
  for (const [w, h] of WIDTHS) {
    appA[w] = {};
    for (const fileKey of ['notjson', 'older', 'many']) appA[w][fileKey] = await pageA(browser, servers, engine, w, h, fileKey);
  }
  await pageA(browser, servers, engine, 1366, 900, 'older', { coarse: false });
  await boardA(browser, servers, engine, appA);

  console.log(`== Part B: the notice (${engine}) ==`);
  for (const w of [724, 1366]) for (const state of ['base', 'fix']) await pageB(browser, servers, engine, w, state);

  console.log(`== Part C: Search below the hairline (${engine}) ==`);
  const appC = {};
  for (const [w, h] of SIZES) {
    appC[w] = {};
    for (const route of [ROUTE_NB, ROUTE_ING]) appC[w][route === ROUTE_ING ? 'ing' : 'nb'] = await pageL(browser, servers, engine, w, h, route);
  }
  for (const [w, h] of SIZES) await pageH(browser, servers, engine, w, h);
  for (const [w, h] of SIZES) await pageTap(browser, servers, engine, w, h);
  await boardC(browser, servers, engine, appC);
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
finish(failures, count, '261004-wib probe');
