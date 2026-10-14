// 03.7-03: the side-by-side probe for sketch 011 decision 36 (Before you start as its own Sheet
// section, placement B, heading H1, pen E2; Mark's answers 2026-10-04, boards redrawn 2026-10-06).
//
// It drives the BUILD through real clicks, reads the real DOM of the app and the real DOM of the
// board panels, and compares them number for number. The expectation is always read live from the
// board's own panel (never from prose, never from bysb-measure.json, which is only a cross-check).
//
// The case map (the plan's decisions_recorded 1). A panel is `.fp-<pid>-<W>`, W = 1366 or 393:
//   reading   olive    Olive Oil v1        top bs-olive-top-b      ins bs-olive-ins-b     (+ bh-h1, the heading)
//   reading   mex      Mexican Choc. v3    top bs-mex-top-b        ins bs-mex-ins-b
//   reading   base     Standard Base v2    top bs-neither-top-b    ins bs-neither-ins-b
//   pen       olive    Next version        top bp-olive-top-b      ins bp-olive-ins-b
//   pen       mex      Next version        top bp-mex-top-b        ins bp-mex-ins-b       (E2: the heading alone)
//   pen       base     Next version        top bp-base-top-b       ins bp-base-ins-b
//   constructed (no seeded version; a copy of Olive Oil v1 written into the page's own store, as
//   plan 01's jsdom file constructs them): nosteps (steps removed), marker (first note inherited),
//   markerpen (the same, Next version).
// Compared on a 'top' panel: the section's place (decisions_recorded 2 and 4), its insides (3), the
// pen's fields, and the positions below the Ingredients head. On an 'ins' panel: the Instructions
// and the positions below. Positions are read from the article's own top (the page), never as an
// absolute y: the boards' page sits at 403 at 1366, 8px below the old boards' 411.
// Numbers are equal within 1px; computed strings are exact. A line is MATCH, DIFF (a difference the
// record must dispose of; the exit code is 1) or OPEN (a known difference whose cause is measured and
// recorded in 03.7-CONFORMANCE.md for Mark: the 'nosteps' panels' table and what sits below it).
//
// Also, on the app alone: the document order of the band, the section and the Ingredients; the
// pen's focus order and the tabindex of every button in the section (UX1-01); the 393
// scrollWidth; a 1024 reading of Olive Oil v1 (no board).
//
// Usage: node 03.7-bys-probe.mjs [cases] [widths] [engines]
//   cases:   comma list of olive,mex,base,nosteps,marker,olivepen,mexpen,basepen,markerpen,w1024
//            (default all)
//   widths:  comma list of 1366,393 (default 1366,393)
//   engines: comma list of webkit,chrome (default webkit,chrome)
// Env: PROBE_DIST = the build to serve (default app/dist; pass a scratch --outDir build so Mark's
//      `vite preview --host` on :4173, which serves app/dist, is never disturbed);
//      PROBE_VERBOSE=1 prints every MATCH line (a run of a single case prints them by default).
//
// Isolation (T-03.7-05): the app and the boards are served on ephemeral 127.0.0.1 ports by the 03.5
// harness, every request to another host is aborted in every context this file opens, and nothing
// here contacts :4173 or the sketch server on :8077, or touches a browser profile of Mark's.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import path from 'node:path';

const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');

const STATES_B = 'before-you-start-states-b.html';
const PEN_B = 'before-you-start-pen-b.html';
const HEADING_B = 'before-you-start-heading-b.html';

const OLIVE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const OLIVE_NOSTEPS_ID = 'olive-oil-ice-cream-v1-nosteps';
const OLIVE_MARKER_ID = 'olive-oil-ice-cream-v1-marker';
const CASES = {
  olive: { route: OLIVE, board: STATES_B, top: 'bs-olive-top-b', ins: 'bs-olive-ins-b', heading: 'bh-h1' },
  mex: { route: '/notebook/mexican-chocolate/mexican-chocolate-v3', board: STATES_B, top: 'bs-mex-top-b', ins: 'bs-mex-ins-b' },
  base: { route: '/notebook/standard-base/standard-base-v2', board: STATES_B, top: 'bs-neither-top-b', ins: 'bs-neither-ins-b' },
  nosteps: { route: `/notebook/olive-oil-ice-cream/${OLIVE_NOSTEPS_ID}`, board: STATES_B, top: 'bs-nosteps-top-b', ins: 'bs-nosteps-ins-b', construct: true },
  marker: { route: `/notebook/olive-oil-ice-cream/${OLIVE_MARKER_ID}`, board: STATES_B, top: 'bs-marker-top-b', construct: true },
  olivepen: { route: OLIVE, pen: true, board: PEN_B, top: 'bp-olive-top-b', ins: 'bp-olive-ins-b' },
  mexpen: { route: '/notebook/mexican-chocolate/mexican-chocolate-v3', pen: true, board: PEN_B, top: 'bp-mex-top-b', ins: 'bp-mex-ins-b' },
  basepen: { route: '/notebook/standard-base/standard-base-v2', pen: true, board: PEN_B, top: 'bp-base-top-b', ins: 'bp-base-ins-b' },
  markerpen: { route: `/notebook/olive-oil-ice-cream/${OLIVE_MARKER_ID}`, pen: true, board: PEN_B, top: 'bp-marker-top-b', construct: true },
};

const [, , casesArg, widthsArg, enginesArg] = process.argv;
const caseNames = casesArg ? casesArg.split(',') : [...Object.keys(CASES), 'w1024'];
const widths = widthsArg ? widthsArg.split(',').map(Number) : [1366, 393];
const engines = enginesArg ? enginesArg.split(',') : ['webkit', 'chrome'];
for (const name of caseNames) {
  if (!CASES[name] && name !== 'w1024') {
    console.error(`Usage: node 03.7-bys-probe.mjs [cases] [widths] [engines]; unknown case ${name}`);
    process.exit(1);
  }
}
const VERBOSE = process.env.PROBE_VERBOSE === '1' || caseNames.length === 1;

// ---- the reader: one function, run on the app's page and on each board panel --------------------
// rootSel is a panel's selector, or null for the app's own document. Every position is relative to
// the article's own top-left; the section's insides and fields are relative to the section.
function readSheet(rootSel) {
  const root = rootSel ? document.querySelector(rootSel) : document;
  if (!root) return null;
  const art = root.querySelector('article.recipe-page');
  if (!art) return null;
  const A = art.getBoundingClientRect();
  const rel = (e, ref = A) => {
    const r = e.getBoundingClientRect();
    return { x: r.left - ref.left, y: r.top - ref.top, w: r.width, h: r.height, b: r.bottom - ref.top };
  };
  const kid = (sel) => art.querySelector(`:scope > ${sel}`);
  const type = (e) => {
    const c = getComputedStyle(e);
    return {
      family: c.fontFamily, size: c.fontSize, weight: c.fontWeight, lineHeight: c.lineHeight, transform: c.textTransform,
      spacing: c.letterSpacing, marginTop: c.marginTop, marginBottom: c.marginBottom, color: c.color,
    };
  };
  const band = kid('.recipe-band');
  const before = kid('.before-region');
  const ingr = kid('.ingredient-table-region');
  const method = kid('.method-region');
  const side = kid('.side-region');
  const table = ingr ? ingr.querySelector('table.ingredient-table') : null;
  const first = before ?? ingr;
  const b = band ? rel(band) : null;
  const out = {
    present: { before: before ? 'yes' : 'no', ingr: ingr ? 'yes' : 'no', method: method ? 'yes' : 'no', side: side ? 'yes' : 'no' },
    order: [...art.children].map((c) => c.className.split(' ')[0]),
    placement: {},
    below: {},
  };
  if (b && first) {
    out.placement.bandBottom = b.b;
    out.placement.gapBandToFirst = rel(first).y - b.b;
  }
  if (before && ingr) out.placement.gapBeforeToIngredients = rel(ingr).y - rel(before).b;
  if (before) out.placement.beforeX = rel(before).x;
  if (ingr) out.placement.ingredientsX = rel(ingr).x;
  if (side && first) out.placement.sideTopMinusFirst = rel(side).y - rel(first).y;
  if (ingr) out.below.ingredientsH = rel(ingr).h;
  if (table) out.below.tableH = rel(table).h;
  if (method) out.below.instructionsTop = rel(method).y;
  if (side) out.below.sideTop = rel(side).y;
  out.below.sheetH = A.height;
  if (table) {
    out.tableShape = { stepHeads: table.querySelectorAll('.ingredient-table__step-head').length, rows: table.querySelectorAll('tr').length };
  }
  const ingH2 = ingr ? ingr.querySelector('h2.region-name') : null;
  if (ingH2) out.ingredientsHeading = { ...type(ingH2), h: rel(ingH2).h };
  if (before) {
    const S = before.getBoundingClientRect();
    const cs = getComputedStyle(before);
    const h2 = before.querySelector('h2.region-name');
    const ul = before.querySelector('ul.authored__notes');
    out.before = {
      w: S.width, h: S.height,
      borderTop: cs.borderTopWidth, borderRight: cs.borderRightWidth, borderBottom: cs.borderBottomWidth, borderLeft: cs.borderLeftWidth,
      paddingBottom: cs.paddingBottom,
      h2: h2 ? { ...type(h2), h: rel(h2, S).h, y: rel(h2, S).y } : 'none',
      ul: ul ? { y: rel(ul, S).y, h: rel(ul, S).h } : 'none',
      lis: ul ? [...ul.children].map((li) => rel(li, S).h) : [],
      inherited: [...before.querySelectorAll('.authored__inherited')].map((e) => e.textContent),
      fields: [...before.querySelectorAll('textarea, button')].map((e) => {
        const r = rel(e, S);
        return { kind: e.tagName.toLowerCase(), x: r.x, y: r.y, w: r.w, h: r.h };
      }),
    };
  }
  if (method) {
    const M = method.getBoundingClientRect();
    const h2 = method.querySelector('h2.region-name');
    const steps = [...method.querySelectorAll('li.method-step')];
    out.instructions = {
      h: M.height,
      h2: h2 ? { ...type(h2), h: rel(h2, M).h, y: rel(h2, M).y } : 'none',
      steps: steps.length,
      stepHeights: steps.map((s) => rel(s, M).h),
      firstStepY: steps[0] ? rel(steps[0], M).y : 'none',
      beforeBlock: method.querySelector('.method__before') ? 'yes' : 'no',
    };
  }
  return out;
}

// The pen's focusable elements in the article, in document order (the Tab order the page gives
// when every tabindex is 0), and every button in the section.
function readFocus() {
  const art = document.querySelector('article.recipe-page');
  const region = (e) =>
    e.closest('.recipe-band') ? 'band'
      : e.closest('.before-region') ? 'before'
        : e.closest('.ingredient-table-region') ? 'ingredients'
          : e.closest('.method-region') ? 'method'
            : e.closest('.side-region') ? 'side'
              : 'other';
  const items = [...art.querySelectorAll('input, textarea, select, button, a[href]')]
    .filter((e) => !e.disabled && e.getAttribute('tabindex') !== '-1' && e.type !== 'hidden')
    .map((e) => ({
      tag: e.tagName.toLowerCase(),
      name: e.getAttribute('aria-label') ?? e.labels?.[0]?.textContent?.trim() ?? e.textContent.trim().slice(0, 40),
      region: region(e),
      tabindex: e.getAttribute('tabindex'),
    }));
  const sectionButtons = [...art.querySelectorAll('.before-region button')].map((e) => ({ name: e.textContent.trim(), tabindex: e.getAttribute('tabindex') }));
  return { items, sectionButtons };
}

// ---- comparison ----------------------------------------------------------------------------------
function flatten(value, prefix, out) {
  if (value === null || value === undefined) return out;
  if (typeof value === 'object') {
    for (const key of Array.isArray(value) ? value.keys() : Object.keys(value)) flatten(value[key], prefix ? `${prefix}.${key}` : String(key), out);
  } else {
    out.set(prefix, value);
  }
  return out;
}

const tally = { match: 0, diff: 0, open: 0 };
const diffLines = [];
function compareGroups(label, app, board, groups, isOpen = () => false) {
  let match = 0;
  let diff = 0;
  let open = 0;
  const lines = [];
  for (const group of groups) {
    const a = flatten(app?.[group], group, new Map());
    const e = flatten(board?.[group], group, new Map());
    for (const key of new Set([...a.keys(), ...e.keys()])) {
      const av = a.get(key);
      const ev = e.get(key);
      const same =
        typeof av === 'number' && typeof ev === 'number' ? Math.abs(av - ev) <= 1 : av === ev;
      const shown = (v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : JSON.stringify(v));
      if (same) {
        match += 1;
        if (VERBOSE) lines.push(`MATCH ${label} ${key}: app ${shown(av)}, board ${shown(ev)}`);
      } else if (isOpen(key)) {
        open += 1;
        lines.push(`OPEN ${label} ${key}: app ${shown(av)}, board ${shown(ev)}`);
      } else {
        diff += 1;
        lines.push(`DIFF ${label} ${key}: app ${shown(av)}, board ${shown(ev)}`);
      }
    }
  }
  tally.match += match;
  tally.diff += diff;
  tally.open += open;
  for (const l of lines) {
    console.log(l);
    if (l.startsWith('DIFF')) diffLines.push(l);
  }
  return { match, diff, open };
}

function appCheck(condition, label) {
  if (condition) {
    tally.match += 1;
    if (VERBOSE) console.log(`MATCH ${label}`);
  } else {
    tally.diff += 1;
    const l = `DIFF ${label}`;
    console.log(l);
    diffLines.push(l);
  }
}

// ---- driving the app -------------------------------------------------------------------------------
// A constructed version: Olive Oil v1 copied into the page's own store (the seed has already run).
async function constructVersions(page) {
  await page.evaluate(
    async ({ nostepsId, markerId }) => {
      const db = await new Promise((res, rej) => {
        const r = indexedDB.open('sprinkles');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const get = (id) =>
        new Promise((res, rej) => {
          const r = db.transaction('versions').objectStore('versions').get(id);
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        });
      const put = (rec) =>
        new Promise((res, rej) => {
          const t = db.transaction('versions', 'readwrite');
          t.objectStore('versions').put(rec);
          t.oncomplete = () => res();
          t.onerror = () => rej(t.error);
        });
      const base = await get('olive-oil-ice-cream-v1');
      const nosteps = structuredClone(base);
      nosteps.id = nostepsId;
      nosteps.method = [];
      const marker = structuredClone(base);
      marker.id = markerId;
      marker.authored.beforeYouStart[0].inheritedFrom = '50 g oil · 800 g';
      await put(nosteps);
      await put(marker);
      // The boards' constructed panels are the built Olive Oil v1 page, batch layer included (the
      // As made column), so each copy carries a copy of the version's batches.
      const batches = await new Promise((res, rej) => {
        const r = db.transaction('batches').objectStore('batches').index('by-version').getAll('olive-oil-ice-cream-v1');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      for (const [id, suffix] of [[nostepsId, 'nosteps'], [markerId, 'marker']]) {
        for (const batch of batches) {
          await new Promise((res, rej) => {
            const t = db.transaction('batches', 'readwrite');
            t.objectStore('batches').put({ ...structuredClone(batch), id: `${batch.id}-${suffix}`, versionId: id });
            t.oncomplete = () => res();
            t.onerror = () => rej(t.error);
          });
        }
      }
      db.close();
    },
    { nostepsId: OLIVE_NOSTEPS_ID, markerId: OLIVE_MARKER_ID },
  );
}

async function openCase(browser, appUrl, def, width) {
  const first = def.construct ? OLIVE : def.route;
  const { context, page } = await openApp(browser, appUrl, first, { width, coarse: true });
  page.setDefaultTimeout(10000);
  if (def.construct) {
    await page.waitForSelector('.notebook-log');
    await constructVersions(page);
    await page.goto(`${appUrl}${def.route}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.shell');
    await page.waitForSelector('.notebook');
  }
  await page.waitForSelector('article.recipe-page');
  if (def.pen) {
    await page.getByRole('button', { name: /next version/i }).first().click();
    await page.waitForSelector('.ingredient-table.is-developing');
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return { context, page };
}

function appOnlyChecks(label, app, def, width) {
  const drawn = app.present.before === 'yes';
  const order = app.order;
  const iBand = order.indexOf('recipe-band');
  const iBefore = order.indexOf('before-region');
  const iIngr = order.indexOf('ingredient-table-region');
  appCheck(iBand === 0 && iIngr > iBand, `${label} order: band first, Ingredients after it (${order.join(' > ')})`);
  if (drawn) appCheck(iBand < iBefore && iBefore < iIngr, `${label} order: band before section before Ingredients (${order.join(' > ')})`);
  else appCheck(iBefore === -1, `${label} order: no section drawn (${order.join(' > ')})`);
  if (width === 1366 && app.placement.sideTopMinusFirst !== undefined) {
    appCheck(Math.abs(app.placement.sideTopMinusFirst) <= 1, `${label} side column's top level with the section's (diff ${Math.round(app.placement.sideTopMinusFirst * 100) / 100})`);
  }
}

function focusChecks(label, focus, def, app) {
  const { items, sectionButtons } = focus;
  const regions = items.map((i) => i.region);
  const lastBand = regions.lastIndexOf('band');
  const firstBefore = regions.indexOf('before');
  const lastBefore = regions.lastIndexOf('before');
  const firstIngr = regions.indexOf('ingredients');
  const firstAmount = items.findIndex((i) => i.region === 'ingredients' && i.tag === 'input');
  appCheck(regions[0] === 'band' && lastBand >= 1, `${label} focus: the Sheet's own fields come first (${items.slice(0, lastBand + 1).map((i) => `"${i.name}"`).join(', ')})`);
  if (app.present.before === 'yes' && firstBefore !== -1) {
    appCheck(lastBand < firstBefore, `${label} focus: the note fields come after the Sheet's fields`);
    appCheck(lastBefore < firstAmount, `${label} focus: the first ingredient amount comes after the section (amount at ${firstAmount}, section ends ${lastBefore})`);
    const section = items.filter((i) => i.region === 'before');
    const pairs = section.every((it, i) => (i % 2 === 0 ? it.tag === 'textarea' : it.tag === 'button'));
    appCheck(pairs && section.length % 2 === 0, `${label} focus: each note field is followed by its remove control (${section.map((i) => i.tag).join(', ')})`);
  } else {
    appCheck(firstBefore === -1, `${label} focus: the heading alone has nothing to focus (E2)`);
    appCheck(lastBand < firstAmount, `${label} focus: the first ingredient amount comes after the Sheet's fields`);
  }
  appCheck(firstIngr === -1 || firstAmount !== -1, `${label} focus: the Ingredients carry an amount field`);
  for (const b of sectionButtons) appCheck(b.tabindex === '0', `${label} button "${b.name}" in the section carries tabindex "0" (got ${JSON.stringify(b.tabindex)})`);
  console.log(`${label} focus order: ${items.map((i) => `${i.region}:${i.tag}`).slice(0, 12).join(' ')} ...`);
}

async function main() {
  const { appUrl, repoUrl, close } = await startServers({ appRoot: DIST });
  const browsers = {};
  for (const e of engines) browsers[e] = e === 'webkit' ? await webkit.launch() : await launch();
  const summary = [];

  try {
    for (const engine of engines) {
      const browser = browsers[engine];
      // One board page per file and engine, opened coarse at its own $preview width and read live.
      const boards = {};
      const boardPage = async (file) => {
        if (!boards[file]) {
          boards[file] = await openBoard(browser, repoUrl, file, { coarse: true });
          // The boards fetch Caveat from Google Fonts, which the harness aborts (T-03.5-70), so the
          // hand would fall back to Georgia and stand 22.7px tall against the app's 25.2px (a 0.3px
          // difference on every row that carries a hand value). Give the board the same Caveat 400
          // file the app serves, from this repo on the harness's own port: the board's own face,
          // not a change to the board.
          await boards[file].page.addStyleTag({
            content: `@font-face{font-family:'Caveat';font-style:normal;font-weight:400;src:url(${repoUrl}/app/public/fonts/caveat-regular.woff2) format('woff2');}`,
          });
          await boards[file].page.evaluate(() => document.fonts.load("20px Caveat"));
        }
        await boards[file].page.evaluate(() => document.fonts.ready);
        return boards[file].page;
      };
      for (const width of widths) {
        for (const name of caseNames) {
          if (name === 'w1024') continue;
          const def = CASES[name];
          const label = `${engine} ${width} ${name}`;
          const { context, page } = await openCase(browser, appUrl, def, width);
          const app = await page.evaluate(readSheet, null);
          appCheck(app !== null, `${label}: the app draws the article`);
          if (!app) {
            await context.close();
            continue;
          }
          const bp = await boardPage(def.board);
          const sel = (pid) => `.fp-${pid}-${width}`;
          const row = { engine, width, name, groups: {} };
          const top = await bp.evaluate(readSheet, sel(def.top));
          appCheck(top !== null, `${label}: board panel ${sel(def.top)} exists`);
          // The 'nosteps' board panel was cut from the Olive Oil v1 capture with only the step list
          // emptied, so its table still draws the four step heads; the app, given a version with no
          // steps, draws a flat table. Everything below the section's own box differs by that (the
          // table, the Ingredients region, the side column at 393, the Sheet): OPEN, cause measured.
          const nostepsOpen = name === 'nosteps' ? (key) => key.startsWith('below.') || (width === 393 && key === 'placement.sideTopMinusFirst') : undefined;
          if (name === 'nosteps' && top) {
            console.log(`NOTE ${label}: the table draws ${app.tableShape.stepHeads} step heads over ${app.tableShape.rows} rows in the app and ${top.tableShape.stepHeads} over ${top.tableShape.rows} on the board panel`);
          }
          if (top) row.groups.top = compareGroups(`${label} top`, app, top, ['present', 'placement', 'before', 'ingredientsHeading', 'below'], nostepsOpen);
          if (def.ins) {
            const ins = await bp.evaluate(readSheet, sel(def.ins));
            appCheck(ins !== null, `${label}: board panel ${sel(def.ins)} exists`);
            if (ins) row.groups.ins = compareGroups(`${label} ins`, app, ins, ['present', 'instructions', 'below'], nostepsOpen);
          }
          if (def.heading) {
            const hp = await boardPage(HEADING_B);
            const h = await hp.evaluate(readSheet, sel(def.heading));
            appCheck(h !== null, `${label}: board panel ${sel(def.heading)} exists`);
            if (h) row.groups.heading = compareGroups(`${label} heading`, app, h, ['placement', 'before', 'ingredientsHeading']);
          }
          // The section's heading is drawn like the Ingredients' (H1): same type in the app itself.
          if (app.before && app.ingredientsHeading) {
            const { h: _a, y: _b, ...bh } = app.before.h2;
            const { h: _c, ...ih } = app.ingredientsHeading;
            appCheck(JSON.stringify(bh) === JSON.stringify(ih), `${label} the section's heading reads in the Ingredients' type`);
          }
          // The Instructions' heading carries no before block, and the section leaves no rule.
          appOnlyChecks(label, app, def, width);
          if (def.pen) focusChecks(label, await page.evaluate(readFocus), def, app);
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          if (width === 393) appCheck(scrollWidth <= 393, `${label} scrollWidth ${scrollWidth} does not exceed the window (393)`);
          row.scrollWidth = scrollWidth;
          summary.push(row);
          await context.close();
        }
      }
      if (caseNames.includes('w1024')) {
        const label = `${engine} 1024 olive`;
        const { context, page } = await openCase(browser, appUrl, CASES.olive, 1024);
        const app = await page.evaluate(readSheet, null);
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const vw = await page.evaluate(() => window.innerWidth);
        appCheck(app.present.before === 'yes' && app.placement.gapBandToFirst >= 0, `${label}: the section sits below the band (gap ${Math.round(app.placement.gapBandToFirst * 100) / 100})`);
        appCheck(Math.abs(app.placement.sideTopMinusFirst) <= 1, `${label}: the side column's top is level with the section's (diff ${Math.round(app.placement.sideTopMinusFirst * 100) / 100})`);
        appCheck(scrollWidth <= vw, `${label}: scrollWidth ${scrollWidth} does not exceed the window ${vw}`);
        appOnlyChecks(label, app, CASES.olive, 1024);
        console.log(`${label}: section x ${Math.round(app.placement.beforeX)} gap-from-band ${Math.round(app.placement.gapBandToFirst * 100) / 100} to-Ingredients ${Math.round(app.placement.gapBeforeToIngredients * 100) / 100}, side top ${Math.round(app.below.sideTop * 100) / 100}, Instructions top ${Math.round(app.below.instructionsTop * 100) / 100}, sheet ${Math.round(app.below.sheetH * 100) / 100} tall, scrollWidth ${scrollWidth} in ${vw}`);
        summary.push({ engine, width: 1024, name: 'w1024', scrollWidth });
        await context.close();
      }
      for (const b of Object.values(boards)) await b.context.close();
    }
  } finally {
    await Promise.all(Object.values(browsers).map((b) => b.close()));
    await close();
  }

  for (const row of summary) {
    const g = Object.entries(row.groups ?? {})
      .map(([k, v]) => `${k} ${v.match}/${v.match + v.diff + v.open}${v.open ? ` (${v.open} open)` : ''}`)
      .join(', ');
    console.log(`${row.engine} ${row.width} ${row.name}: ${g || 'app only'}; scrollWidth ${row.scrollWidth}`);
  }
  console.log(`03.7-bys-probe: ${tally.match} MATCH, ${tally.diff} DIFF, ${tally.open} OPEN`);
  if (tally.diff > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
