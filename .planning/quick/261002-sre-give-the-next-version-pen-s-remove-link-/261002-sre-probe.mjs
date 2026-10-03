// Quick task 261002-sre's probe: the Next version pen's remove and restore link
// stands 14px clear of the name or the estimated tag (sketch 011 decision 26).
// Reads the built app (the checkout's app/dist) beside the two pen boards, in
// Playwright's WebKit (iPhone 14 profile for the coarse contexts) and in system
// Chrome as the second engine.
//
//   node 261002-sre-probe.mjs [groups]
//
// `groups` is a comma list of: tracer, boards, states, sweep, sweep-fine, wide.
// No argument runs every group. Serves the build through the 03.5 harness's
// own ephemeral 127.0.0.1 servers; never touches Mark's :4173 preview or the
// dev server on :5173, starts no Vite process, and every state change (remove a
// row, step 1 removed) runs in a throwaway browser context and is never saved.
// A reading here is evidence about two engines, not about Mark's iPhone or
// iPad; the device is his to check.
//
// The "before" baseline is the same page with `.ingredient-table__remove-gap
// {display:none}` injected: nothing sits between the last mark and the button,
// which is today's markup exactly, without mutating React's DOM.
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const MOCHA3 = '/notebook/mocha/mocha-v3';
const STRAW21 = '/notebook/strawberry/strawberry-v2-1';

// ---------------------------------------------------------------------------
// In-page reader. Passed to page.evaluate, so it reads the app and a board
// alike. One record per tbody row whose name cell has a direct-child button
// reading exactly remove or restore.
async function readPen() {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelector('.ingredient-table');
  const rows = [];
  for (const tr of table.querySelectorAll('tbody > tr')) {
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    if (!nameTd) continue;
    const button = [...nameTd.children].find((e) => e.tagName === 'BUTTON' && /^(remove|restore)$/.test(e.textContent.trim()));
    if (!button) continue;
    const b = button.getBoundingClientRect();
    const cy = b.top + b.height / 2;
    const nc = nameTd.getBoundingClientRect();
    const isGap = (n) => n.nodeType === 1 && n.classList.contains('ingredient-table__remove-gap');
    const marks = [];
    const textRects = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      marks.push(...range.getClientRects());
    };
    for (const n of nameTd.childNodes) {
      if (n === button || isGap(n)) continue;
      if (n.nodeType === 3) {
        if (n.nodeValue.trim()) textRects(n);
      } else if (n.nodeType === 1) {
        marks.push(...n.getClientRects());
        if (n.tagName === 'SPAN' && !n.classList.contains('target-chip')) {
          for (const c of n.childNodes) if (c.nodeType === 3 && c.nodeValue.trim()) textRects(c);
        }
      }
    }
    const onLine = marks.filter((k) => k.width > 0 && k.top <= cy && k.bottom >= cy && k.right <= b.left + 0.5);
    const last = onLine.length ? Math.max(...onLine.map((k) => k.right)) : null;
    const amountTd = tr.querySelector(':scope > td.ingredient-table__col-grams');
    const numerics = [...tr.querySelectorAll(':scope > td.ingredient-table__col-numeric')];
    const shareTd = numerics[numerics.length - 1] ?? null;
    const cell = (td) => {
      if (!td) return null;
      const r = td.getBoundingClientRect();
      return { left: r.left, width: r.width };
    };
    const prev = button.previousSibling;
    const flag = nameTd.querySelector('p.ingredient-table__flag');
    const fr = flag ? flag.getBoundingClientRect() : null;
    rows.push({
      name: nameTd.textContent.trim().split('\n')[0].slice(0, 20),
      label: button.textContent.trim(),
      gap: last === null ? null : b.left - last,
      off: b.left - nc.left,
      top: b.top,
      btn: { width: b.width, height: b.height },
      nameCell: cell(nameTd),
      amountCell: cell(amountTd),
      shareCell: cell(shareTd),
      rowHeight: tr.getBoundingClientRect().height,
      gapSpan: prev !== null && prev.nodeType === 1 && prev.tagName === 'SPAN' && prev.classList.contains('ingredient-table__remove-gap') && prev.textContent === ' ',
      flag: fr ? { top: fr.top, bottom: fr.bottom } : null,
    });
  }
  return {
    innerWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    tableHeight: table.getBoundingClientRect().height,
    coarse: matchMedia('(pointer: coarse)').matches,
    rows,
  };
}

// Every tbody and tfoot row's boxes, relative to the table, rounded to 0.5,
// each y relative to its own row's top (sid/pen-conf-rm.mjs's reader).
async function readRects() {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelector('.ingredient-table');
  const tb = table.getBoundingClientRect();
  const R = (e, rowTop) => {
    const b = e.getBoundingClientRect();
    return [b.left - tb.left, b.top - rowTop, b.width, b.height].map((x) => Math.round(x * 2) / 2);
  };
  const rows = [];
  for (const tr of table.querySelectorAll('tbody > tr, tfoot > tr')) {
    if (tr.classList.contains('ingredient-table__step-head')) continue;
    const top = tr.getBoundingClientRect().top;
    const amountTd = tr.querySelector(':scope > td.ingredient-table__col-grams');
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    const numerics = [...tr.querySelectorAll(':scope > td.ingredient-table__col-numeric')];
    const shareTd = numerics[numerics.length - 1] ?? null;
    const input = tr.querySelector('input');
    const button = nameTd ? [...nameTd.children].find((e) => e.tagName === 'BUTTON') : null;
    const shown = (td) => (td && td.getBoundingClientRect().width > 0 ? R(td, top) : null);
    rows.push({
      name: (nameTd ? nameTd.textContent : tr.textContent).trim().slice(0, 20),
      row: R(tr, top),
      amount: shown(amountTd),
      nameCell: shown(nameTd),
      share: shown(shareTd),
      input: input ? R(input, top) : null,
      button: button ? R(button, top) : null,
    });
  }
  return { tableHeight: tb.height, rows };
}

// ---------------------------------------------------------------------------
// Node-side helpers.
async function openAppPage(browser, appUrl, route, { width, coarse }) {
  const options = coarse
    ? { ...devices['iPhone 14'], viewport: { width, height: 1100 }, screen: { width, height: 1100 } }
    : { viewport: { width, height: 1100 } };
  const context = await browser.newContext(options);
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ingredient-table');
  await page.waitForSelector('h2.notebook-version__identity');
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openAppPage: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

async function openPen(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.locator('td.ingredient-table__col-name > button.text-control').first().waitFor();
}

// The board's state on Mexican Chocolate v4: Whole Milk 600, Sucrose 36, Cocoa
// Powder 45, Cinnamon removed.
async function editPen(page) {
  await page.getByLabel('Whole Milk 3.3%, grams', { exact: true }).fill('600');
  await page.getByLabel('Sucrose, grams', { exact: true }).fill('36');
  await page.getByLabel('Cocoa Powder, grams', { exact: true }).fill('45');
  await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'remove' }).click();
  await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'restore' }).waitFor();
}

async function setBaseline(page, on) {
  await page.evaluate((flag) => {
    document.getElementById('sre-baseline')?.remove();
    if (flag) {
      const s = document.createElement('style');
      s.id = 'sre-baseline';
      s.textContent = '.ingredient-table__remove-gap{display:none}';
      document.head.appendChild(s);
    }
  }, on);
}

const gapFigure = (engine) => (engine === 'webkit' ? 14 : 14.2);
const near = (a, b, tol) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;
const round1 = (x) => Math.round(x * 10) / 10;

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

// ---------------------------------------------------------------------------
// Groups.
async function tracer(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width: 393, coarse: true });
  await openPen(page);
  const read = await page.evaluate(readPen);
  await context.close();
  const label = `${engine} 393 coarse mex4 pen`;
  const figure = gapFigure(engine);
  const onLine = read.rows.filter((r) => r.gap !== null);
  const wrapped = read.rows.filter((r) => r.gap === null);
  const sucrose = read.rows.find((r) => r.name.startsWith('Sucrose'));
  countedCheck(read.rows.length === 12, `${label}: ${read.rows.length} links, wanted 12`);
  countedCheck(read.rows.every((r) => r.gapSpan), `${label}: every link has its gap span (${read.rows.filter((r) => !r.gapSpan).map((r) => r.name)})`);
  countedCheck(onLine.every((r) => near(r.gap, figure, 0.5)), `${label}: every same-line gap within 0.5 of ${figure} (${onLine.map((r) => round1(r.gap))})`);
  countedCheck(sucrose !== undefined && sucrose.gap !== null && near(sucrose.gap, figure, 0.5), `${label}: Sucrose's link is on the line with gap ${sucrose && sucrose.gap}`);
  countedCheck(wrapped.every((r) => near(r.off, 0, 0.5)), `${label}: every wrapped link's offset within 0.5 of 0 (${wrapped.map((r) => round1(r.off))})`);
  countedCheck(read.overflow <= 0, `${label}: overflow ${read.overflow}`);
  console.log(JSON.stringify({ engine, group: 'tracer', gaps: onLine.map((r) => [r.name, round1(r.gap)]), wrapped: wrapped.map((r) => [r.name, round1(r.off)]), tableHeight: read.tableHeight }));
}

// A check whose label is only built when it fails, for the sweeps' tens of
// thousands of passing checks.
const lazyCheck = (condition, label) => countedCheck(condition, condition ? '' : label());

const BOARD_RECT_KEYS = ['row', 'amount', 'nameCell', 'share', 'input', 'button'];

async function boards(browser, servers, engine) {
  const figure = gapFigure(engine);
  for (const [width, coarse, file] of [[393, true, '393-pen-changes.html'], [723, false, '723-pen-changes.html']]) {
    const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width, coarse });
    await openPen(page);
    await editPen(page);
    const appRects = await page.evaluate(readRects);
    const app = await page.evaluate(readPen);
    await context.close();
    const b = await openBoard(browser, servers.repoUrl, file);
    const boardRects = await b.page.evaluate(readRects);
    const board = await b.page.evaluate(readPen);
    await b.context.close();

    const label = `${engine} ${file}`;
    countedCheck(appRects.rows.length === boardRects.rows.length, `${label}: row count ${appRects.rows.length} vs board ${boardRects.rows.length}`);
    let mismatches = 0;
    const examples = [];
    const n = Math.min(appRects.rows.length, boardRects.rows.length);
    for (let i = 0; i < n; i += 1) {
      for (const key of BOARD_RECT_KEYS) {
        const a = appRects.rows[i][key];
        const c = boardRects.rows[i][key];
        let bad = false;
        if (!a || !c) bad = !!a !== !!c;
        else bad = [0, 1, 2, 3].some((k) => Math.abs(a[k] - c[k]) > 0.5);
        if (bad) {
          mismatches += 1;
          if (examples.length < 4) examples.push([i, appRects.rows[i].name, key, a, c]);
        }
      }
    }
    countedCheck(mismatches === 0, `${label}: ${mismatches} rect mismatches ${JSON.stringify(examples)}`);
    countedCheck(near(appRects.tableHeight, boardRects.tableHeight, 1), `${label}: table height ${appRects.tableHeight} vs board ${boardRects.tableHeight}`);
    countedCheck(app.rows.length === board.rows.length, `${label}: link count ${app.rows.length} vs board ${board.rows.length}`);
    let gapMismatch = 0;
    app.rows.forEach((r, i) => {
      const c = board.rows[i];
      if (!c) return;
      const same = r.gap === null || c.gap === null ? r.gap === c.gap : near(r.gap, c.gap, 0.5);
      if (!same) gapMismatch += 1;
    });
    countedCheck(gapMismatch === 0, `${label}: ${gapMismatch} link gaps differ from the board's (app ${JSON.stringify(app.rows.map((r) => r.gap === null ? null : round1(r.gap)))} board ${JSON.stringify(board.rows.map((r) => r.gap === null ? null : round1(r.gap)))})`);
    countedCheck(app.rows.every((r) => r.gapSpan), `${label}: every link has its gap span`);
    const cin = app.rows.find((r) => r.name.startsWith('Cinnamon'));
    countedCheck(cin !== undefined && cin.label === 'restore', `${label}: Cinnamon's link reads restore`);
    if (width === 393) {
      countedCheck(cin !== undefined && cin.gap !== null && near(cin.gap, figure, 0.5), `${label}: Cinnamon's restore on the line with gap ${cin && cin.gap} (wanted ${figure})`);
    }
    countedCheck(app.overflow <= 0, `${label}: overflow ${app.overflow}`);
    console.log(JSON.stringify({ engine, group: 'boards', file, rows: appRects.rows.length, boardRows: boardRects.rows.length, mismatches, tableHeight: appRects.tableHeight, boardTableHeight: boardRects.tableHeight, links: app.rows.length, restoreGap: cin && cin.gap !== null ? round1(cin.gap) : null, restoreOff: cin ? round1(cin.off) : null, boardRestoreGap: (board.rows.find((r) => r.label === 'restore') || {}).gap ?? null, overflow: app.overflow }));
  }
}

async function states(browser, servers, engine) {
  const figure = gapFigure(engine);
  for (const coarse of [true, false]) {
    for (const width of [320, 393, 723]) {
      const pointer = coarse ? 'coarse' : 'fine';
      const tag = `${engine} ${pointer} @${width}`;

      // (1) Restore: Cinnamon's remove clicked.
      {
        const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width, coarse });
        await openPen(page);
        await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'remove' }).click();
        await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'restore' }).waitFor();
        const read = await page.evaluate(readPen);
        await context.close();
        const cin = read.rows.find((r) => r.name.startsWith('Cinnamon'));
        countedCheck(cin !== undefined && cin.label === 'restore', `${tag} restore: Cinnamon's link reads restore`);
        if (cin) {
          countedCheck(cin.gapSpan, `${tag} restore: previous sibling is the gap span`);
          if (cin.gap !== null) countedCheck(near(cin.gap, figure, 0.5), `${tag} restore: on the line, gap ${cin.gap} vs ${figure}`);
          else countedCheck(near(cin.off, 0, 0.5), `${tag} restore: wrapped, offset ${cin.off} vs 0`);
        }
        console.log(JSON.stringify({ engine, group: 'states', state: 'restore', pointer, width, onLine: cin ? cin.gap !== null : null, gap: cin && cin.gap !== null ? round1(cin.gap) : null, off: cin ? round1(cin.off) : null }));
      }

      // (2) Orphaned row: step 1 removed.
      {
        const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width, coarse });
        await openPen(page);
        await page.locator('.method-region button', { hasText: /^remove$/ }).first().click();
        await page.waitForSelector('.ingredient-table p.ingredient-table__flag');
        const read = await page.evaluate(readPen);
        await context.close();
        const flagged = read.rows.filter((r) => r.flag !== null);
        countedCheck(flagged.length >= 1, `${tag} orphan: ${flagged.length} rows carry the flag`);
        for (const r of flagged) {
          countedCheck(near(r.off, 0, 0.5), `${tag} orphan "${r.name}": link offset ${r.off} vs 0`);
          countedCheck(r.top >= r.flag.bottom - 0.5, `${tag} orphan "${r.name}": link top ${r.top} is below flag bottom ${r.flag.bottom}`);
          countedCheck(r.gap === null, `${tag} orphan "${r.name}": link is on its own line (gap ${r.gap})`);
        }
        console.log(JSON.stringify({ engine, group: 'states', state: 'orphan', pointer, width, flagged: flagged.map((r) => [r.name, round1(r.off), r.gap === null ? null : round1(r.gap)]), overflow: read.overflow }));
      }
    }
  }
}

const SWEEP_STATES = [
  { id: 'mex4', route: MEX4, links: 12, sid: { webkit: 130, chrome: 127 } },
  { id: 'mocha3', route: MOCHA3, links: 14, sid: { webkit: 130, chrome: 127 } },
  { id: 'straw21', route: STRAW21, links: 11, sid: { webkit: 102, chrome: 99 } },
];

// One cell-geometry comparison, fix against baseline, within 0.1.
const sameCell = (a, b) => a === null || b === null ? a === b : near(a.left, b.left, 0.1) && near(a.width, b.width, 0.1);

async function sweep(browser, servers, engine, coarse) {
  const pointer = coarse ? 'coarse' : 'fine';
  const figure = gapFigure(engine);
  for (const state of SWEEP_STATES) {
    const { context, page } = await openAppPage(browser, servers.appUrl, state.route, { width: 393, coarse });
    await openPen(page);
    const t = { engine, group: `sweep-${pointer}`, state: state.id, widths: 0, links: state.links, gapMin: Infinity, gapMax: -Infinity, wrappedOffMin: Infinity, wrappedOffMax: -Infinity, newlyWrappedRowWidths: 0, sid: state.sid[engine], maxTrackMove: 0, maxBtnDelta: 0, maxOverflow: -Infinity };
    let at393 = null;
    for (let width = 320; width <= 723; width += 1) {
      await page.setViewportSize({ width, height: 1100 });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      await setBaseline(page, true);
      const before = await page.evaluate(readPen);
      await setBaseline(page, false);
      const after = await page.evaluate(readPen);
      const tag = () => `${engine} ${pointer} ${state.id} @${width}`;
      t.widths += 1;
      lazyCheck(after.innerWidth === width && before.innerWidth === width, () => `${tag()}: innerWidth ${after.innerWidth}`);
      lazyCheck(after.rows.length === state.links && before.rows.length === state.links, () => `${tag()}: ${after.rows.length} links (baseline ${before.rows.length}), wanted ${state.links}`);
      lazyCheck(after.rows.every((r) => r.gapSpan), () => `${tag()}: a link lacks its gap span`);
      lazyCheck(after.overflow <= 0, () => `${tag()}: overflow ${after.overflow}`);
      t.maxOverflow = Math.max(t.maxOverflow, after.overflow);
      let newly = 0;
      after.rows.forEach((r, i) => {
        const was = before.rows[i];
        if (!was) return;
        const rowTag = () => `${tag()} "${r.name}"`;
        if (r.gap !== null) {
          lazyCheck(near(r.gap, figure, 0.5), () => `${rowTag()}: same-line gap ${r.gap} vs ${figure}`);
          t.gapMin = Math.min(t.gapMin, r.gap);
          t.gapMax = Math.max(t.gapMax, r.gap);
        } else {
          lazyCheck(near(r.off, 0, 0.5), () => `${rowTag()}: wrapped link offset ${r.off} vs 0`);
          t.wrappedOffMin = Math.min(t.wrappedOffMin, r.off);
          t.wrappedOffMax = Math.max(t.wrappedOffMax, r.off);
        }
        const dW = Math.abs(r.btn.width - was.btn.width);
        const dH = Math.abs(r.btn.height - was.btn.height);
        t.maxBtnDelta = Math.max(t.maxBtnDelta, dW, dH);
        lazyCheck(dW <= 0.1 && dH <= 0.1, () => `${rowTag()}: button ${r.btn.width}x${r.btn.height} vs baseline ${was.btn.width}x${was.btn.height}`);
        if (coarse) lazyCheck(near(r.btn.height, 44, 0.5), () => `${rowTag()}: coarse button height ${r.btn.height} vs 44`);
        lazyCheck(sameCell(r.nameCell, was.nameCell) && sameCell(r.amountCell, was.amountCell) && sameCell(r.shareCell, was.shareCell), () => `${rowTag()}: a track moved (name ${JSON.stringify(r.nameCell)}/${JSON.stringify(was.nameCell)} amount ${JSON.stringify(r.amountCell)}/${JSON.stringify(was.amountCell)} share ${JSON.stringify(r.shareCell)}/${JSON.stringify(was.shareCell)})`);
        for (const cell of ['nameCell', 'amountCell', 'shareCell']) {
          if (r[cell] && was[cell]) t.maxTrackMove = Math.max(t.maxTrackMove, Math.abs(r[cell].left - was[cell].left), Math.abs(r[cell].width - was[cell].width));
        }
        const wrappedNow = r.gap === null;
        const wrappedWas = was.gap === null;
        if (wrappedNow === wrappedWas) lazyCheck(near(r.rowHeight, was.rowHeight, 0.1), () => `${rowTag()}: row height ${r.rowHeight} vs baseline ${was.rowHeight}`);
        lazyCheck(!(wrappedWas && !wrappedNow), () => `${rowTag()}: wrapped in the baseline but on the line after the fix`);
        if (wrappedNow && !wrappedWas) newly += 1;
      });
      t.newlyWrappedRowWidths += newly;
      if (width === 393) at393 = { before, after };
    }
    if (engine === 'webkit' && coarse && state.id === 'mex4') {
      const { before, after } = at393;
      const wrapsBefore = before.rows.filter((r) => r.gap === null);
      const wrapsAfter = after.rows.filter((r) => r.gap === null);
      const newlyNames = after.rows.filter((r, i) => r.gap === null && before.rows[i].gap !== null).map((r) => r.name);
      countedCheck(wrapsBefore.length === 3 && wrapsAfter.length === 5, `${engine} 393 mex4: baseline wraps ${wrapsBefore.length} of 12, fix wraps ${wrapsAfter.length} (wanted 3 and 5)`);
      countedCheck(newlyNames.length === 2 && newlyNames.some((n) => n.startsWith('Cocoa Powder')) && newlyNames.some((n) => n.startsWith('Vanilla Extract')), `${engine} 393 mex4: newly wrapped ${JSON.stringify(newlyNames)}`);
      countedCheck(near(after.tableHeight - before.tableHeight, 36, 1), `${engine} 393 mex4: table grows ${after.tableHeight - before.tableHeight} (wanted 36)`);
      t.at393 = { baselineWraps: wrapsBefore.length, fixWraps: wrapsAfter.length, newlyWrapped: newlyNames, tableHeightBefore: round1(before.tableHeight), tableHeightAfter: round1(after.tableHeight), grows: round1(after.tableHeight - before.tableHeight) };
    }
    for (const k of ['gapMin', 'gapMax', 'wrappedOffMin', 'wrappedOffMax', 'maxTrackMove', 'maxBtnDelta']) t[k] = Math.round(t[k] * 100) / 100;
    console.log(JSON.stringify(t));
    await context.close();
  }
}

async function wide(browser, servers, engine) {
  const figure = gapFigure(engine);
  for (const width of [724, 1366]) {
    const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width, coarse: false });
    await openPen(page);
    await setBaseline(page, true);
    const before = await page.evaluate(readPen);
    await setBaseline(page, false);
    const after = await page.evaluate(readPen);
    await context.close();
    const tag = `${engine} @${width}`;
    countedCheck(after.rows.length === 12 && before.rows.length === 12, `${tag}: ${after.rows.length} links (baseline ${before.rows.length})`);
    countedCheck(after.rows.every((r) => r.gapSpan), `${tag}: every link has its gap span`);
    const onLine = after.rows.filter((r) => r.gap !== null);
    countedCheck(onLine.every((r) => near(r.gap, figure, 0.5)), `${tag}: every same-line gap within 0.5 of ${figure} (${onLine.map((r) => round1(r.gap))})`);
    const wrapped = after.rows.map((r, i) => [r, before.rows[i]]).filter(([r]) => r.gap === null);
    // A link wrapped before and after keeps its offset exactly. A link the gap
    // newly pushes to the next line (on the line in the baseline) has no
    // baseline offset to keep: it must stand at the offset the already-wrapped
    // links share, and is reported as a finding (the plan expected none from 724 up).
    const wrappedBoth = wrapped.filter(([, was]) => was.gap === null);
    const newlyWrapped = wrapped.filter(([, was]) => was.gap !== null);
    countedCheck(wrappedBoth.every(([r, was]) => near(r.off, was.off, 0.5)), `${tag}: links wrapped before and after keep their baseline offset (${wrappedBoth.map(([r, was]) => [round1(r.off), round1(was.off)])})`);
    const sharedOff = wrappedBoth.length ? wrappedBoth[0][0].off : null;
    countedCheck(newlyWrapped.every(([r]) => sharedOff !== null && near(r.off, sharedOff, 0.5)), `${tag}: newly wrapped links stand at the shared wrapped offset ${sharedOff} (${newlyWrapped.map(([r]) => [r.name, round1(r.off)])})`);
    const shareMove = Math.max(...after.rows.map((r, i) => Math.abs(r.shareCell.left - before.rows[i].shareCell.left)));
    countedCheck(shareMove <= 0.5, `${tag}: share column moved ${shareMove}`);
    countedCheck(after.overflow <= 0, `${tag}: overflow ${after.overflow}`);
    console.log(JSON.stringify({ engine, group: 'wide', width, links: after.rows.length, onLine: onLine.length, gaps: [...new Set(onLine.map((r) => round1(r.gap)))], wrapped: wrapped.length, wrappedBoth: wrappedBoth.length, newlyWrapped: newlyWrapped.map(([r, was]) => [r.name, round1(r.off), round1(was.off)]), wrappedOff: wrapped.map(([r, was]) => [r.name, round1(r.off), round1(was.off)]), shareMove: Math.round(shareMove * 100) / 100, overflow: after.overflow }));
  }
}

// ---------------------------------------------------------------------------
const requested = process.argv[2] ? process.argv[2].split(',') : ['tracer', 'boards', 'states', 'sweep', 'sweep-fine', 'wide'];
const servers = await startServers();
try {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      // The tracer proves one path in WebKit; the full run repeats it in Chrome.
      if (requested.includes('tracer') && (engine === 'webkit' || requested.length > 1)) await tracer(browser, servers, engine);
      if (requested.includes('boards')) await boards(browser, servers, engine);
      if (requested.includes('states')) await states(browser, servers, engine);
      if (requested.includes('sweep')) await sweep(browser, servers, engine, true);
      if (requested.includes('sweep-fine')) await sweep(browser, servers, engine, false);
      if (requested.includes('wide')) await wide(browser, servers, engine);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

finish(failures, count, '261002-sre probe');
