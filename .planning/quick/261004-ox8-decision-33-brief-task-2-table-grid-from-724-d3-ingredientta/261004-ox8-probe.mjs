// Quick task 261004-ox8's probe: the ingredient table's D3 grid from 724 up (sketch 011
// decisions 31, 32 answers 2, 4 and 5, and decision 33 brief (c)), measured on the BUILT
// app (app/dist) in Playwright WebKit and system Chrome, deviceScaleFactor 1, against the
// sketch 011 boards (final-design boards, .fp-win.fp-{state}-{W}).
//
//   node 261004-ox8-probe.mjs baseline    (build of the unchanged source; asserts the column-form precondition; writes the JSON)
//   node 261004-ox8-probe.mjs tracer      (webkit, coarse, 744, mex3 vs 744-batch)
//   node 261004-ox8-probe.mjs boards      (both engines, coarse, every board case vs the app)
//   node 261004-ox8-probe.mjs behaviour   (toggle static, pen edit static, recording fields; webkit/chrome coarse, chrome fine)
//   node 261004-ox8-probe.mjs invariants  (393, 723 and print equal the baseline; DOM order struck first)
//   groups combine with commas: boards,behaviour,invariants
//
// Serves the build and the repo through the 03.5 harness's ephemeral 127.0.0.1 servers;
// never requests :4173, :5173 or :8011, and starts no Vite process. Everything runs in
// throwaway contexts and nothing is saved. A reading here is Playwright WebKit and system
// Chrome on a Mac, not Mark's iPad or iPhone. The board font routing and the As made
// constructor are copied from Sid's final-calibrate.mjs and final-capture.mjs (never imported).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, APP_ROUTE, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-ox8-baseline.json');
const BOARD_DIR = '/.planning/sketches/011-recipe-route-c';

const failures = [];
let count = 0;
const ck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol) => a !== null && b !== null && Math.abs(a - b) <= tol;

const R = {
  mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01',
  olive1: APP_ROUTE,
  under2: '/notebook/underbelly-light-base/underbelly-light-base-v2',
  base2: '/notebook/standard-base/standard-base-v2',
  mex4: '/notebook/mexican-chocolate/mexican-chocolate-v4',
};
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };

// Board cases: [state, width, board file]. Boards are read at their own $preview width.
const WIDTHS = [744, 834, 983, 984, 1024, 1366, 1600, 1920];
const CASES = [];
for (const W of WIDTHS) {
  CASES.push(['mex3', W, `${W}-batch`]);
  CASES.push(['olive1', W, `${W}-batch`]);
}
CASES.push(['under2', 1600, '1600-no-batch'], ['base2', 1600, '1600-no-batch'], ['olive1pen', 1600, '1600-pen'], ['mex3pen', 1600, '1600-pen']);
// WebKit name column after D3 (the plan's readings).
const NAME_MIN = { 744: 376.5, 834: 466.5, 983: 615.5, 984: 320.5, 1024: 347.1, 1366: 320.5, 1600: 327.1, 1920: 440.5 };
const expectedName = (state, W) => (['under2', 'base2', 'olive1pen', 'mex3pen'].includes(state) ? 393.1 : NAME_MIN[W]);

// ---------------------------------------------------------------------------
// In-page reader. `sel` picks the table.
async function readTable(sel) {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelector(sel);
  if (!table) throw new Error(`no table for ${sel}`);
  const t = table.getBoundingClientRect();
  const r1 = (n) => Math.round(n * 100) / 100;
  const cs = getComputedStyle(table);
  const lines = (cell) => {
    const tn = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!tn) return 0;
    const r = document.createRange();
    r.selectNodeContents(tn);
    const tops = [];
    for (const q of r.getClientRects()) if (!tops.some((x) => Math.abs(x - q.top) < 3)) tops.push(q.top);
    return tops.length;
  };
  const names = [...table.querySelectorAll('tbody td.ingredient-table__col-name')];
  const nameMin = names.length ? Math.min(...names.map((n) => n.getBoundingClientRect().width)) : 0;
  const maxLines = names.length ? Math.max(...names.map(lines)) : 0;
  const ths = [...table.querySelectorAll('thead th')];
  const ingTh = ths.find((th) => th.textContent.trim().toLowerCase() === 'ingredient');
  const asTh = ths.find((th) => th.textContent.trim().toLowerCase() === 'as made');
  const struck = table.querySelector('td.ingredient-table__col-grams .struck-value');
  const rows = [...table.querySelectorAll(':scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr')].map((tr) => {
    const rr = tr.getBoundingClientRect();
    const parent = tr.parentElement.tagName;
    const kind = parent === 'THEAD' ? 'head' : parent === 'TFOOT' ? 'total' : tr.classList.contains('ingredient-table__step-head') ? 'step' : 'body';
    const nameCell = tr.querySelector(':scope > td.ingredient-table__col-name');
    const links = nameCell ? [...nameCell.children].filter((c) => c.tagName === 'BUTTON' && c.classList.contains('text-control')).length : 0;
    const cells = [...tr.children].map((c) => {
      if (getComputedStyle(c).display === 'none') return null;
      const q = c.getBoundingClientRect();
      return [r1(q.left - t.left), r1(q.top - rr.top), r1(q.width), r1(q.height)];
    });
    let amt = null;
    const input = tr.querySelector(':scope > td.ingredient-table__col-grams input');
    if (input) {
      const q = input.getBoundingClientRect();
      amt = [r1(q.right - t.left), r1(q.top - rr.top)];
    } else {
      const pg = tr.querySelector('.ingredient-table__plan-grams');
      if (pg) {
        const w = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT);
        let last = null;
        while (w.nextNode()) if (w.currentNode.textContent.trim()) last = w.currentNode;
        if (last) {
          const rg = document.createRange();
          rg.selectNodeContents(last);
          const q = rg.getBoundingClientRect();
          amt = [r1(q.right - t.left), r1(q.top - rr.top)];
        }
      }
    }
    const nt = nameCell ? [...nameCell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()) : null;
    return { kind, h: r1(rr.height), links, cells, amt, name: nt ? nt.textContent.trim() : '' };
  });
  return {
    className: table.className,
    display: cs.display,
    w: r1(t.width),
    h: r1(t.height),
    nameMin: r1(nameMin),
    maxLines,
    asMadeHead: Boolean(asTh),
    asMadeRightOfIngredient: Boolean(asTh && ingTh && asTh.getBoundingClientRect().left > ingTh.getBoundingClientRect().left),
    firstStruckDisplay: struck ? getComputedStyle(struck).display : null,
    overflow: document.documentElement.scrollWidth - innerWidth,
    rows,
  };
}

function compare(app, board) {
  const out = { diffRows: 0, exempt: [], rowCountDiffers: app.rows.length !== board.rows.length, details: [] };
  const n = Math.min(app.rows.length, board.rows.length);
  let delta = 0;
  for (let i = 0; i < n; i += 1) {
    const a = app.rows[i];
    const b = board.rows[i];
    const exempt = a.links > b.links;
    let bad = a.kind !== b.kind;
    if (exempt) {
      out.exempt.push({ i, dh: Math.round((a.h - b.h) * 100) / 100 });
      delta += a.h - b.h;
    } else if (!near(a.h, b.h, 0.5)) bad = true;
    if (a.cells.length !== b.cells.length) bad = true;
    else {
      for (let c = 0; c < a.cells.length; c += 1) {
        const ca = a.cells[c];
        const cb = b.cells[c];
        if (ca === null || cb === null) {
          if (ca !== cb) bad = true;
        } else if (exempt) {
          if (!near(ca[0], cb[0], 0.5) || !near(ca[2], cb[2], 0.5)) bad = true;
        } else if (!ca.every((v, k) => near(v, cb[k], 0.5))) bad = true;
      }
    }
    if (!exempt) {
      if ((a.amt === null) !== (b.amt === null)) bad = true;
      else if (a.amt && !a.amt.every((v, k) => near(v, b.amt[k], 0.5))) bad = true;
    }
    if (bad) {
      out.diffRows += 1;
      if (out.details.length < 4) out.details.push({ i, kind: a.kind, app: [a.h, a.cells, a.amt], board: [b.h, b.cells, b.amt] });
    }
  }
  out.diffRows += Math.abs(app.rows.length - board.rows.length);
  out.widthOk = near(app.w, board.w, 0.5);
  out.heightDelta = Math.round((app.h - board.h - delta) * 100) / 100;
  out.heightOk = Math.abs(app.h - board.h - delta) <= 1;
  out.ok = out.diffRows === 0 && out.widthOk && out.heightOk;
  return out;
}

// Row-by-row equality of two readings of the same state (the baseline checks).
function sameRows(a, b) {
  if (a.rows.length !== b.rows.length) return { ok: false, bad: 'rowcount' };
  let bad = 0;
  for (let i = 0; i < a.rows.length; i += 1) {
    const x = a.rows[i];
    const y = b.rows[i];
    let r = !near(x.h, y.h, 0.5) || x.cells.length !== y.cells.length;
    if (!r) {
      for (let c = 0; c < x.cells.length; c += 1) {
        if (x.cells[c] === null || y.cells[c] === null) {
          if (x.cells[c] !== y.cells[c]) r = true;
        } else if (!x.cells[c].every((v, k) => near(v, y.cells[c][k], 0.5))) r = true;
      }
    }
    if (r) bad += 1;
  }
  return { ok: bad === 0 && near(a.w, b.w, 0.5) && near(a.h, b.h, 0.5), bad };
}

// ---------------------------------------------------------------------------
function blockForApp(ctx) {
  return ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
}
function routeForBoard(ctx, repoUrl) {
  return ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === '127.0.0.1') route.continue();
    else if (u.hostname === 'fonts.googleapis.com') {
      route.fulfill({ contentType: 'text/css', body: `@font-face{font-family:Caveat;src:url(${repoUrl}/app/public/fonts/caveat-regular.woff2) format("woff2");font-weight:400}` });
    } else route.abort();
  });
}

async function openApp(browser, servers, state, W, { coarse = true, print = false, route = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 });
  await blockForApp(ctx);
  const page = await ctx.newPage();
  const base = state.replace(/pen$/, '');
  await page.goto(servers.appUrl + (route || R[base]), { waitUntil: 'networkidle' });
  await page.waitForSelector('.ingredient-table');
  const got = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, w: innerWidth }));
  if (got.coarse !== coarse || got.w !== W) throw new Error(`context mismatch ${JSON.stringify(got)} wanted coarse=${coarse} W=${W}`);
  if (!route) {
    if (base === 'mex3' || base === 'under2') {
      await page.getByRole('button', { name: 'Show changes' }).first().click();
      await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
    }
    if (base === 'mex3') await page.evaluate(construct, AS);
    if (state.endsWith('pen')) {
      await page.getByRole('button', { name: 'Next version' }).first().click();
      await page.waitForSelector('.ingredient-table.is-developing');
      if (state === 'mex3pen') {
        for (const [l, v] of [['Whole Milk 3.3%', '540'], ['Sucrose', '44'], ['Cocoa Powder', '18']]) await page.getByLabel(`${l}, grams`, { exact: true }).fill(v);
      }
      await page.waitForTimeout(150);
    }
  }
  if (print) await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(120);
  return { ctx, page };
}

async function readApp(browser, servers, state, W, opts) {
  const { ctx, page } = await openApp(browser, servers, state, W, opts);
  try {
    return await page.evaluate(readTable, '.ingredient-table');
  } finally {
    await ctx.close();
  }
}

async function readBoard(browser, servers, file, state, W, coarse = true) {
  const html = await readFile(path.join('/Users/mark/Documents/projects/sprinkles', BOARD_DIR, `${file}.html`), 'utf8');
  const pw = Number(html.match(/"\$preview"\s*:\s*\{\s*"width"\s*:\s*(\d+)/)[1]);
  const ctx = await browser.newContext({ viewport: { width: pw, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 });
  await routeForBoard(ctx, servers.repoUrl);
  const page = await ctx.newPage();
  try {
    await page.goto(`${servers.repoUrl}${BOARD_DIR}/${file}.html`);
    const sel = `.fp-win.fp-${state}-${W} .ingredient-table`;
    await page.waitForSelector(sel);
    await page.waitForTimeout(500);
    return await page.evaluate(readTable, sel);
  } finally {
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------
const groups = new Set((process.argv[2] || 'tracer').split(','));
const servers = await startServers();
const engines = { webkit: await webkit.launch(), chrome: await launch() };
const j = (o) => console.log(JSON.stringify(o));

try {
  if (groups.has('baseline')) {
    const baseline = { cases: {}, invariants: {} };
    for (const [ename, browser] of Object.entries(engines)) {
      for (const [state, W, file] of CASES) {
        const app = await readApp(browser, servers, state, W);
        const board = await readBoard(browser, servers, file, state, W);
        // Precondition: the column form, before the change.
        ck(app.display === 'table', `baseline ${ename} ${state}@${W}: table display is table (got ${app.display})`);
        if (app.asMadeHead) ck(app.asMadeRightOfIngredient, `baseline ${ename} ${state}@${W}: As made head right of Ingredient`);
        if (state === 'mex3') ck(app.firstStruckDisplay === 'inline', `baseline ${ename} ${state}@${W}: struck figure inline (got ${app.firstStruckDisplay})`);
        const cmp = compare(app, board);
        baseline.cases[`${ename}:${state}@${W}`] = { app, boardNameMin: board.nameMin, boardH: board.h, cmp: { diffRows: cmp.diffRows, exempt: cmp.exempt, widthOk: cmp.widthOk, heightDelta: cmp.heightDelta, rowCountDiffers: cmp.rowCountDiffers } };
        j({ group: 'baseline', engine: ename, state, W, nameMinApp: app.nameMin, nameMinBoard: board.nameMin, hApp: app.h, hBoard: board.h, diffRows: cmp.diffRows, rows: app.rows.length });
      }
    }
    const wk = engines.webkit;
    for (const state of ['mex3', 'olive1']) {
      for (const W of [393, 723]) baseline.invariants[`${state}@${W}`] = await readApp(wk, servers, state, W);
      for (const W of [1024, 1600]) baseline.invariants[`${state}@${W}:print`] = await readApp(wk, servers, state, W, { print: true });
    }
    if (failures.length === 0) await writeFile(BASELINE_PATH, JSON.stringify(baseline));
    else console.log('baseline precondition failed; JSON not written');
  }

  if (groups.has('tracer')) {
    const app = await readApp(engines.webkit, servers, 'mex3', 744);
    const board = await readBoard(engines.webkit, servers, '744-batch', 'mex3', 744);
    const c = compare(app, board);
    j({ group: 'tracer', nameMin: app.nameMin, boardNameMin: board.nameMin, hApp: app.h, hBoard: board.h, diffRows: c.diffRows, details: c.details, maxLines: app.maxLines, className: app.className });
    ck(c.ok, `tracer: mex3@744 matches 744-batch (diffRows ${c.diffRows}, heightDelta ${c.heightDelta})`);
    ck(near(app.nameMin, 376.5, 0.5), `tracer: nameMin ${app.nameMin} is 376.5`);
    ck(app.maxLines === 1, `tracer: maxLines ${app.maxLines} is 1`);
    ck(app.className.includes('ingredient-table--as-made'), `tracer: className ${app.className}`);
  }

  if (groups.has('boards')) {
    for (const [ename, browser] of Object.entries(engines)) {
      for (const [state, W, file] of CASES) {
        const app = await readApp(browser, servers, state, W);
        const board = await readBoard(browser, servers, file, state, W);
        const c = compare(app, board);
        const want = expectedName(state, W);
        j({ group: 'boards', engine: ename, state, W, nameMin: app.nameMin, boardNameMin: board.nameMin, expected: want, hApp: app.h, hBoard: board.h, diffRows: c.diffRows, exempt: c.exempt, heightDelta: c.heightDelta, maxLines: app.maxLines, overflow: app.overflow, asMadeHead: app.asMadeHead, details: c.ok ? undefined : c.details });
        const tag = `boards ${ename} ${state}@${W}`;
        ck(c.ok, `${tag}: matches ${file} (diffRows ${c.diffRows}, widthOk ${c.widthOk}, heightDelta ${c.heightDelta})`);
        ck(near(app.nameMin, want, ename === 'webkit' ? 0.5 : 2), `${tag}: nameMin ${app.nameMin} vs ${want}`);
        ck(app.maxLines === 1, `${tag}: no name wraps (maxLines ${app.maxLines})`);
        ck(app.overflow <= 0, `${tag}: overflow ${app.overflow}`);
        if (file === '1600-no-batch') {
          ck(!app.asMadeHead, `${tag}: no As made head`);
          ck(!app.className.includes('ingredient-table--as-made'), `${tag}: class lacks the modifier`);
        }
      }
    }
  }

  if (groups.has('behaviour')) {
    const matrix = [['webkit', true], ['chrome', true], ['chrome', false]];
    for (const [ename, coarse] of matrix) {
      const browser = engines[ename];
      for (const W of [744, 1024, 1600]) {
        const tag = `behaviour ${ename}/${coarse ? 'coarse' : 'fine'}@${W}`;
        // (a) Show changes toggle: plan amounts static.
        for (const [lbl, route] of [['mex3', R.mex3], ['v4', R.mex4]]) {
          const { ctx, page } = await openApp(browser, servers, 'mex3', W, { coarse, route });
          try {
            const before = await page.evaluate(readTable, '.ingredient-table');
            await page.getByRole('button', { name: 'Show changes' }).first().click();
            await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
            await page.waitForTimeout(120);
            const after = await page.evaluate(readTable, '.ingredient-table');
            const key = (r) => r.name;
            const bm = new Map(before.rows.filter((r) => r.kind === 'body' && r.amt && r.name).map((r) => [key(r), r.amt]));
            let max = 0;
            let compared = 0;
            for (const r of after.rows.filter((x) => x.kind === 'body' && x.amt && x.name)) {
              const b = bm.get(key(r));
              if (!b) continue;
              compared += 1;
              max = Math.max(max, Math.abs(r.amt[0] - b[0]), Math.abs(r.amt[1] - b[1]));
            }
            j({ group: 'behaviour', tag, test: `toggle-${lbl}`, compared, maxMove: Math.round(max * 100) / 100 });
            ck(compared > 0 && max <= 0.5, `${tag}: toggle ${lbl} moves a plan amount ${max} (compared ${compared})`);
          } finally {
            await ctx.close();
          }
        }
        // (b) Pen edit: grams fields static.
        {
          const { ctx, page } = await openApp(browser, servers, 'mex3', W, { coarse, route: R.mex4 });
          try {
            await page.getByRole('button', { name: 'Next version' }).first().click();
            await page.waitForSelector('.ingredient-table.is-developing');
            await page.waitForTimeout(150);
            const read = () => page.evaluate(readTable, '.ingredient-table');
            const before = await read();
            await page.locator('.ingredient-table td.ingredient-table__col-grams input').first().fill('999');
            await page.waitForTimeout(120);
            const after = await read();
            const bi = before.rows.filter((r) => r.kind === 'body' && r.amt);
            const ai = after.rows.filter((r) => r.kind === 'body' && r.amt);
            let mr = 0;
            let mt = 0;
            for (let i = 0; i < Math.min(bi.length, ai.length); i += 1) {
              mr = Math.max(mr, Math.abs(ai[i].amt[0] - bi[i].amt[0]));
              mt = Math.max(mt, Math.abs(ai[i].amt[1] - bi[i].amt[1]));
            }
            j({ group: 'behaviour', tag, test: 'pen-edit', fields: bi.length, maxRight: Math.round(mr * 100) / 100, maxTop: Math.round(mt * 100) / 100 });
            ck(bi.length > 0 && bi.length === ai.length && mr <= 1.0 && mt <= 0.5, `${tag}: pen edit moves a field ${mr} across, ${mt} down`);
          } finally {
            await ctx.close();
          }
        }
        // (c) Recording: As made fields.
        {
          const { ctx, page } = await openApp(browser, servers, 'olive1', W, { coarse });
          try {
            await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click();
            await page.waitForSelector('.ingredient-table__as-made-field');
            await page.locator('.ingredient-table__as-made-field').first().click();
            await page.keyboard.type('121.5');
            await page.waitForTimeout(120);
            const f = await page.evaluate(() => {
              const table = document.querySelector('.ingredient-table');
              const res = [];
              for (const tr of table.querySelectorAll('tbody > tr')) {
                const field = tr.querySelector('.ingredient-table__as-made-field');
                if (!field) continue;
                const cell = tr.querySelector(':scope > td.ingredient-table__col-numeric:nth-last-child(2)');
                const grams = tr.querySelector(':scope > td.ingredient-table__col-grams');
                const q = field.getBoundingClientRect();
                const c = cell.getBoundingClientRect();
                const g = grams.getBoundingClientRect();
                res.push({ w: q.width, dl: q.left - c.left, gap: g.left - q.right });
              }
              return { res, overflow: document.documentElement.scrollWidth - innerWidth };
            });
            const okAll = f.res.length > 0 && f.res.every((x) => near(x.w, 56, 0.5) && Math.abs(x.dl) <= 0.5 && x.gap >= 9.5);
            j({ group: 'behaviour', tag, test: 'recording', fields: f.res.length, minGap: Math.round(Math.min(...f.res.map((x) => x.gap)) * 100) / 100, overflow: f.overflow, sample: f.res[0] });
            ck(okAll, `${tag}: recording fields 56 wide, at the As made track's left, 9.5+ left of the amount`);
            ck(f.overflow <= 0, `${tag}: recording overflow ${f.overflow}`);
          } finally {
            await ctx.close();
          }
        }
      }
    }
  }

  if (groups.has('invariants')) {
    const base = JSON.parse(await readFile(BASELINE_PATH, 'utf8')).invariants;
    const wk = engines.webkit;
    for (const state of ['mex3', 'olive1']) {
      for (const W of [393, 723]) {
        const now = await readApp(wk, servers, state, W);
        const s = sameRows(now, base[`${state}@${W}`]);
        j({ group: 'invariants', state, W, same: s.ok, bad: s.bad });
        ck(s.ok, `invariants ${state}@${W}: equals baseline (bad ${s.bad})`);
      }
      for (const W of [1024, 1600]) {
        const now = await readApp(wk, servers, state, W, { print: true });
        const s = sameRows(now, base[`${state}@${W}:print`]);
        j({ group: 'invariants', state, W, print: true, same: s.ok, bad: s.bad });
        ck(s.ok, `invariants ${state}@${W} print: equals baseline (bad ${s.bad})`);
      }
    }
    const { ctx, page } = await openApp(wk, servers, 'mex3', 1600);
    try {
      const firstIsStruck = await page.evaluate(() => {
        const pg = [...document.querySelectorAll('td.ingredient-table__col-grams')].find((c) => c.querySelector('.struck-value'));
        const span = pg && pg.querySelector('.ingredient-table__plan-grams');
        return Boolean(span && span.firstElementChild && span.firstElementChild.classList.contains('struck-value'));
      });
      ck(firstIsStruck, 'invariants mex3@1600: struck figure is the first child of the plan-grams span');
      j({ group: 'invariants', domOrderStruckFirst: firstIsStruck });
    } finally {
      await ctx.close();
    }
  }
} finally {
  await engines.webkit.close();
  await engines.chrome.close();
  await servers.close();
}
finish(failures, count, '261004-ox8');
