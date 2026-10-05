// Quick task 261004-ubg's probe: sketch 011 decision 48 A (the one-line ingredient head
// from 724) and decision 49 A (the Sheet's rows from 984, the surplus under the
// Instructions). Measures the EXISTING build (app/dist, read only) in Playwright's WebKit
// and system Chrome, plus exactly the rules read from the edited app/src/styles/app.css,
// added to the page with addStyleTag. No build, no Vite, never :4173, :5173 or :8011;
// the harness serves app/dist on ephemeral 127.0.0.1 ports. Nothing is saved anywhere.
//
//   node 261004-ubg-probe.mjs tracer   (WebKit, olive1 at 1366: base and +48; gates G0 head row and G48)
//   node 261004-ubg-probe.mjs all      (WebKit and Chrome, every recipe and width, four states, all gates)
//
// A reading here is evidence about two engines, not Mark's iPad.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import { readAllRules, stripCssComments } from '../../../app/src/styles/css-source.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STYLES = path.resolve(HERE, '..', '..', '..', 'app', 'src', 'styles');
const MODE = process.argv[2];
if (!['tracer', 'all'].includes(MODE)) {
  console.error('usage: node 261004-ubg-probe.mjs tracer|all');
  process.exit(2);
}

const failures = [];
let count = 0;
const ck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;

// ---------------------------------------------------------------------------
// The CSS the probe adds, read from the edited source's own text.
const appCss = await readFile(path.join(STYLES, 'app.css'), 'utf8');
const rules = readAllRules(appCss);
const wrap = (media, list) => `@media ${media} {\n${list.map((r) => `${r.selector} { ${r.declarations.trim()} }`).join('\n')}\n}`;

const D3 = 'screen and (min-width: 724px)';
const ONEHEAD_SELECTORS = [
  '.ingredient-table thead th',
  '.ingredient-table--as-made thead th.ingredient-table__col-numeric:not(:last-child)',
];
const onehead = ONEHEAD_SELECTORS.map((selector) => {
  const found = rules.find((r) => r.media === D3 && r.selector === selector);
  if (!found) throw new Error(`261004-ubg probe: decision 48 rule missing from app.css: ${selector}`);
  return found;
});
const ONEHEAD = wrap(D3, onehead);

let EMPTY = '';
if (MODE === 'all') {
  const R984 = 'screen and (min-width: 984px)';
  const empty = rules.filter((r) => r.media === R984);
  if (empty.length === 0) throw new Error('261004-ubg probe: no rule with media screen and (min-width: 984px) in app.css');
  EMPTY = wrap(R984, empty);

  // Adding the CSS after the bundle only cascades like its place in app.css when no other
  // stylesheet carries a thead rule or a .recipe-page grid-template-rows rule.
  let clean = true;
  for (const file of ['notebook.css', 'shell.css', 'home.css']) {
    const text = stripCssComments(await readFile(path.join(STYLES, file), 'utf8'));
    for (const r of readAllRules(text)) {
      if (/\bthead\b/.test(r.selector)) clean = false;
      if (/\.recipe-page\b/.test(r.selector) && /grid-template-rows/.test(r.declarations)) clean = false;
    }
  }
  console.log(`cascade assertion (notebook.css, shell.css, home.css carry no thead rule and no .recipe-page grid-template-rows): ${clean ? 'TRUE' : 'FALSE'}`);
  ck(clean, 'cascade assertion: no other stylesheet carries a thead rule or a .recipe-page grid-template-rows rule');
}

// ---------------------------------------------------------------------------
const ROUTES = {
  olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89',
  mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01',
  base2: '/notebook/standard-base/standard-base-v2',
};
const WIDTHS = MODE === 'tracer' ? [1366] : [724, 744, 983, 984, 1024, 1366, 1600, 1920];
const RECIPES = MODE === 'tracer' ? ['olive1'] : ['olive1', 'mex3', 'base2'];

// In-page reader: rounded boxes (0.01), document coordinates.
function readPage(tableSel) {
  const r = (n) => Math.round(n * 100) / 100;
  const box = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: r(b.left + scrollX), y: r(b.top + scrollY), w: r(b.width), h: r(b.height), right: r(b.right + scrollX), bottom: r(b.bottom + scrollY) };
  };
  const table = document.querySelector(tableSel);
  const figure = table
    ? [...table.querySelectorAll('tbody td.ingredient-table__col-numeric:nth-last-child(2)')].find((td) => td.textContent.trim() !== '')
    : null;
  const out = {
    table: box(table),
    headRow: box(table && table.querySelector('thead tr')),
    ths: table ? [...table.querySelectorAll('thead th')].map(box) : [],
    figure: box(figure),
    ingredients: box(document.querySelector('.ingredient-table-region')),
    side: box(document.querySelector('.side-region')),
    method: box(document.querySelector('.method-region')),
    scrollHeight: document.documentElement.scrollHeight,
  };
  out.gap = out.method && out.table ? r(out.method.y - out.table.bottom) : null;
  // .method-region is a grid item and stretches to its row, so its own bottom is the row's
  // bottom. The Instructions' content ends at the bottom of its last child.
  const kids = document.querySelectorAll('.method-region > *');
  out.methodContentBottom = kids.length ? r(Math.max(...[...kids].map((k) => k.getBoundingClientRect().bottom + scrollY))) : null;
  out.foot = out.methodContentBottom !== null && out.side ? r(out.side.bottom - out.methodContentBottom) : null;
  return out;
}

const raf2 = (page) => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
async function addTag(page, css) {
  const handle = await page.addStyleTag({ content: css });
  await raf2(page);
  return handle;
}
async function dropTag(page, handle) {
  await handle.evaluate((el) => el.remove());
  await raf2(page);
}

// Reads one page in the four states, in order: base, +48, +49, both.
async function readStates(browser, servers, recipe, width, { pen = false } = {}) {
  const { context, page } = await openApp(browser, servers.appUrl, ROUTES[recipe], { width, height: 1000, coarse: true });
  try {
    await page.waitForSelector('.fold-row');
    await page.waitForTimeout(150);
    let tableSel = '.ingredient-table';
    if (pen) {
      await page.getByRole('button', { name: 'Next version' }).first().click();
      await page.waitForSelector('.ingredient-table.is-developing');
      await page.waitForTimeout(150);
      tableSel = '.ingredient-table.is-developing';
    }
    const read = () => page.evaluate(readPage, tableSel);
    const states = { base: await read() };
    let tag = await addTag(page, ONEHEAD);
    states['+48'] = await read();
    if (MODE === 'all') {
      await dropTag(page, tag);
      tag = await addTag(page, EMPTY);
      states['+49'] = await read();
      await dropTag(page, tag);
      tag = await addTag(page, ONEHEAD);
      const tag2 = await addTag(page, EMPTY);
      states.both = await read();
      await dropTag(page, tag2);
    }
    await dropTag(page, tag);
    return states;
  } finally {
    await context.close();
  }
}

const f = (n) => (n === null || n === undefined ? '-' : String(n));
function printReading(engine, key, states) {
  for (const [name, s] of Object.entries(states)) {
    const asm = s.ths.length === 3 ? s.ths[1] : null;
    console.log(
      `  ${engine} ${key} ${name.padEnd(4)} head=${f(s.headRow && s.headRow.h)} ths=${s.ths.map((t) => `${t.y}/${t.h}/${t.w}`).join(' ')} asm.w=${f(asm && asm.w)} asm.right=${f(asm && asm.right)} fig.right=${f(s.figure && s.figure.right)} gap=${f(s.gap)} scrollH=${s.scrollHeight} sideH=${f(s.side && s.side.h)} foot=${f(s.foot)}`,
    );
  }
}

// ---------------------------------------------------------------------------
async function readEngine(engineName, browser, servers) {
  const data = {};
  for (const recipe of RECIPES) {
    for (const width of WIDTHS) {
      const key = `${recipe}@${width}`;
      data[key] = await readStates(browser, servers, recipe, width);
      printReading(engineName, key, data[key]);
    }
  }
  if (MODE === 'all') {
    data['olive1pen@1600'] = await readStates(browser, servers, 'olive1', 1600, { pen: true });
    printReading(engineName, 'olive1pen@1600', data['olive1pen@1600']);
  }
  return data;
}

function gateEngine(engine, data) {
  const E = engine;
  const wk = engine === 'webkit';
  const get = (recipe, width) => data[`${recipe}@${width}`];

  if (wk) {
    // G0: is the served build the one the README measured, and is gap its measure?
    const o1366 = get('olive1', 1366);
    ck(near(o1366.base.headRow.h, 52.17, 0.5), `G0 ${E} olive1@1366 base head row 52.17 (read ${o1366.base.headRow.h})`);
    if (MODE === 'all') {
      for (const w of [984, 1024, 1366, 1600]) {
        ck(near(get('olive1', w).base.gap, 49, 1), `G0 ${E} olive1@${w} base gap 49 (read ${get('olive1', w).base.gap})`);
      }
      for (const [w, want] of [[984, 399], [1024, 352], [1366, 399], [1600, 360]]) {
        ck(near(get('mex3', w).base.gap, want, 2), `G0 ${E} mex3@${w} base gap ${want} (read ${get('mex3', w).base.gap})`);
      }
    }
  }

  // G48: the one-line head, olive1 and mex3 with a batch, +48 and both.
  const stateNames = MODE === 'all' ? ['+48', 'both'] : ['+48'];
  for (const recipe of RECIPES.filter((x) => x !== 'base2')) {
    for (const width of WIDTHS) {
      const d = get(recipe, width);
      for (const st of stateNames) {
        const s = d[st];
        const tag = `G48 ${E} ${recipe}@${width} ${st}`;
        ck(s.ths.length === 3, `${tag} three head cells (read ${s.ths.length})`);
        if (s.ths.length !== 3) continue;
        ck(near(s.headRow.h, 21.39, 0.5), `${tag} head row 21.39 (read ${s.headRow.h})`);
        const tops = s.ths.map((t) => t.y);
        ck(Math.max(...tops) - Math.min(...tops) <= 0.5, `${tag} three th tops equal (read ${tops.join(', ')})`);
        s.ths.forEach((t, i) => ck(near(t.h, 14.39, 0.5), `${tag} th ${i} 14.39 tall (read ${t.h})`));
        ck(near(s.ths[0].x, d.base.ths[0].x, 0.5), `${tag} Ingredient left unchanged (base ${d.base.ths[0].x}, read ${s.ths[0].x})`);
        if (s.figure) {
          ck(near(s.ths[1].w, 59.45, 0.5), `${tag} As made th 59.45 wide (read ${s.ths[1].w})`);
          ck(near(s.ths[1].right, s.figure.right, 0.5), `${tag} As made th right edge on the figure's (th ${s.ths[1].right}, figure ${s.figure.right})`);
        } else {
          console.log(`  note ${tag}: no non-empty As made figure, As made width and edge not gated`);
        }
      }
    }
  }

  if (MODE !== 'all') return;

  // G48 no batch and the pen.
  const noBatch = [...WIDTHS.map((w) => [`base2@${w}`, get('base2', w)]), ['olive1pen@1600', data['olive1pen@1600']]];
  for (const [key, d] of noBatch) {
    for (const st of ['base', '+48', '+49', 'both']) {
      ck(near(d[st].headRow.h, 21.39, 0.5), `G48 no batch/pen ${E} ${key} ${st} head row 21.39 (read ${d[st].headRow.h})`);
      ck(near(d[st].headRow.h, d.base.headRow.h, 0.1), `G48 no batch/pen ${E} ${key} ${st} head row equals base (base ${d.base.headRow.h}, read ${d[st].headRow.h})`);
    }
  }

  // G48 height.
  for (const w of WIDTHS) {
    const o = get('olive1', w);
    ck(near(o.base.scrollHeight - o['+48'].scrollHeight, 30.78, 1), `G48 height ${E} olive1@${w} page 30.78 shorter (read ${o.base.scrollHeight - o['+48'].scrollHeight})`);
    const m = get('mex3', w);
    const delta = m.base.scrollHeight - m['+48'].scrollHeight;
    if (w >= 984) ck(near(delta, 0, 1), `G48 height ${E} mex3@${w} page unchanged (read ${delta})`);
    else ck(near(delta, 30.78, 1), `G48 height ${E} mex3@${w} page 30.78 shorter (read ${delta})`);
  }

  // G49: mex3's gap, and the page and side heights.
  for (const w of [984, 1024, 1366, 1600]) {
    const m = get('mex3', w);
    for (const st of ['+49', 'both']) {
      ck(near(m[st].gap, 49, 1), `G49 ${E} mex3@${w} ${st} gap 49 (read ${m[st].gap})`);
    }
  }
  for (const w of WIDTHS) {
    const m = get('mex3', w);
    for (const [st, ref] of [['+49', 'base'], ['both', '+48']]) {
      ck(near(m[st].scrollHeight, m[ref].scrollHeight, 1), `G49 ${E} mex3@${w} ${st} page height equals ${ref} (${ref} ${m[ref].scrollHeight}, read ${m[st].scrollHeight})`);
      ck(near(m[st].side.h, m[ref].side.h, 1), `G49 ${E} mex3@${w} ${st} side column height equals ${ref} (${ref} ${m[ref].side.h}, read ${m[st].side.h})`);
    }
  }

  // G49 unchanged: olive1 and base2 at every width, mex3 below 984.
  const unchanged = [];
  for (const w of WIDTHS) {
    unchanged.push([`olive1@${w}`, get('olive1', w)], [`base2@${w}`, get('base2', w)]);
    if (w < 984) unchanged.push([`mex3@${w}`, get('mex3', w)]);
  }
  for (const [key, d] of unchanged) {
    ck(near(d['+49'].scrollHeight, d.base.scrollHeight, 0.5), `G49 unchanged ${E} ${key} page height (base ${d.base.scrollHeight}, +49 ${d['+49'].scrollHeight})`);
    for (const part of ['ingredients', 'side', 'method']) {
      const a = d.base[part];
      const b = d['+49'][part];
      if (a === null && b === null) continue;
      ck(a !== null && b !== null && ['x', 'y', 'w', 'h'].every((k) => near(a[k], b[k], 0.5)), `G49 unchanged ${E} ${key} ${part} box (base ${JSON.stringify(a)}, +49 ${JSON.stringify(b)})`);
    }
  }

  // Ungated readings.
  console.log(`ungated ${E}: base gaps olive1 / mex3 at 984, 1024, 1366, 1600:`);
  for (const w of [984, 1024, 1366, 1600]) console.log(`    @${w} olive1 ${get('olive1', w).base.gap}, mex3 ${get('mex3', w).base.gap}`);
  console.log(`ungated ${E}: mex3 foot space under +49 (side bottom minus the bottom of the Instructions' last child; README: 732 at 984 and 1366, 702 at 1024):`);
  for (const w of [984, 1024, 1366, 1600]) console.log(`    @${w} ${get('mex3', w)['+49'].foot}`);
  console.log(`ungated ${E}: base mex3 empty space, gap minus the 32px row gap (README's 352 at 1024 and 360 at 1600 WebKit; 313 at 1024 and 334 at 1366 Chrome; 367 at 984 and 1366 WebKit):`);
  for (const w of [984, 1024, 1366, 1600]) console.log(`    @${w} ${Math.round((get('mex3', w).base.gap - 32) * 100) / 100}`);
  console.log(`ungated ${E}: mex3 +48 gap at 984 (README 383 is the empty space): gap ${get('mex3', 984)['+48'].gap}, minus 32 = ${Math.round((get('mex3', 984)['+48'].gap - 32) * 100) / 100}`);
  console.log(`ungated ${E}: mex3 both-state foot space:`);
  for (const w of [984, 1024, 1366, 1600]) console.log(`    @${w} ${get('mex3', w).both.foot}`);
  console.log(`ungated ${E}: olive1 +48 minus base page heights:`);
  for (const w of WIDTHS) console.log(`    @${w} ${get('olive1', w)['+48'].scrollHeight - get('olive1', w).base.scrollHeight}`);
}

// ---------------------------------------------------------------------------
const servers = await startServers();
try {
  const wk = await webkit.launch();
  try {
    console.log('--- WebKit (coarse) ---');
    gateEngine('webkit', await readEngine('webkit', wk, servers));
  } finally {
    await wk.close();
  }
  if (MODE === 'all') {
    const ch = await launch();
    try {
      console.log('--- Chrome (coarse) ---');
      gateEngine('chrome', await readEngine('chrome', ch, servers));
    } finally {
      await ch.close();
    }
  }
} finally {
  await servers.close();
}
finish(failures, count, `261004-ubg probe (${MODE})`);
