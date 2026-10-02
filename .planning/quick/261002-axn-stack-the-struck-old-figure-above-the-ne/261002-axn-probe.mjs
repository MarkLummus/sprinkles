// Quick task 261002-axn's probe: below 724, Show changes and the pen stack the
// struck old figure above the current one (sketch 011 decisions 24 and 25).
// Reads the built app (the checkout's app/dist) beside the five sketch boards,
// in Playwright's WebKit (iPhone 14 profile for the coarse contexts) and in
// system Chrome as the second engine.
//
//   node 261002-axn-probe.mjs [groups]
//
// `groups` is a comma list of: tracer, boards, sweep, sweep-fine, wide.
// No argument runs every group. Serves the build through the 03.5 harness's
// own ephemeral 127.0.0.1 servers; never touches Mark's :4173 preview or the
// dev server on :5173, starts no Vite process, and the removed-row save runs
// in a throwaway browser context. A reading here is evidence about two
// engines, not about Mark's iPhone or iPad; the device is his to check.
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
const STRAW_BATCH = '/notebook/strawberry/strawberry-v2-1/batch/strawberry-v2-1-batch-01';

// ---------------------------------------------------------------------------
// In-page reader. Passed to page.evaluate, so the same code reads the app and
// every board. x is relative to the table's left edge; y is relative to the
// row's top (table-level y for the table itself), so a row matched by name in
// another table compares directly.
async function readTable(tableIndex) {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelectorAll('.ingredient-table')[tableIndex ?? 0];
  const t = table.getBoundingClientRect();

  const union = (rects) => {
    const live = rects.filter((r) => r.width > 0 || r.height > 0);
    if (live.length === 0) return null;
    const left = Math.min(...live.map((r) => r.left));
    const top = Math.min(...live.map((r) => r.top));
    const right = Math.max(...live.map((r) => r.right));
    const bottom = Math.max(...live.map((r) => r.bottom));
    return { left, top, right, bottom };
  };
  // Content rect: text nodes and inputs and buttons only, so overflowing text
  // counts even when its block is no wider than the track.
  const content = (root, skipStruck) => {
    if (!root) return null;
    const rects = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      if (skipStruck && n.parentElement.closest('.struck-value')) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      rects.push(...range.getClientRects());
    }
    for (const el of root.querySelectorAll('input, button')) {
      if (skipStruck && el.closest('.struck-value')) continue;
      rects.push(el.getBoundingClientRect());
    }
    return union(rects);
  };

  const rows = [...table.querySelectorAll('tbody > tr, tfoot > tr')].filter(
    (tr) => !tr.classList.contains('ingredient-table__step-head'),
  );
  const records = rows.map((tr) => {
    const r = tr.getBoundingClientRect();
    const box = (b) => (b ? { x: b.left - t.left, right: b.right - t.left, y: b.top - r.top, bottom: b.bottom - r.top, width: b.right - b.left, height: b.bottom - b.top } : null);
    const cellBox = (td) => {
      if (!td) return null;
      const b = td.getBoundingClientRect();
      return b.width === 0 && b.height === 0 ? null : box(b);
    };
    const amountTd = tr.querySelector(':scope > td.ingredient-table__col-grams');
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    const numerics = [...tr.querySelectorAll(':scope > td.ingredient-table__col-numeric')];
    const shareTd = numerics[numerics.length - 1] ?? null;
    const asMadeTd = numerics.length === 2 ? numerics[0] : null;
    const struckOf = (td) =>
      td
        ? [...td.querySelectorAll('.struck-value')].map((el) => {
            const cs = getComputedStyle(el);
            return { content: box(content(el)), display: cs.display, marginRight: cs.marginRight };
          })
        : [];
    const input = amountTd ? amountTd.querySelector('input') : null;
    return {
      name: (nameTd ? nameTd.textContent : '').trim().slice(0, 40),
      height: r.height,
      removed: nameTd ? nameTd.querySelector('.struck-value') !== null : false,
      amount: { cell: cellBox(amountTd), content: box(content(amountTd)), struck: struckOf(amountTd), current: box(content(amountTd, true)), slotHtml: amountTd ? (amountTd.querySelector('.ingredient-table__plan-grams')?.innerHTML ?? null) : null },
      nameCell: { cell: cellBox(nameTd), content: box(content(nameTd)) },
      share: { cell: cellBox(shareTd), content: box(content(shareTd)), struck: struckOf(shareTd), current: box(content(shareTd, true)) },
      asMade: { cell: cellBox(asMadeTd), content: box(content(asMadeTd)) },
      field: input ? box(input.getBoundingClientRect()) : null,
      tfoot: tr.parentElement.tagName === 'TFOOT',
    };
  });
  return {
    innerWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    table: { width: t.width, height: t.height },
    rows: records,
  };
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

async function showChanges(page) {
  await page.getByRole('button', { name: 'Show changes' }).first().click();
  await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
}

// The pen on Mexican Chocolate v4 with the four edits decision 25 draws.
async function openPen(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.getByLabel('Whole Milk 3.3%, grams', { exact: true }).waitFor();
}
async function editPen(page) {
  await page.getByLabel('Whole Milk 3.3%, grams', { exact: true }).fill('600');
  await page.getByLabel('Sucrose, grams', { exact: true }).fill('36');
  await page.getByLabel('Cocoa Powder, grams', { exact: true }).fill('45');
  await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'remove' }).click();
  await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'restore' }).waitFor();
}

const near = (a, b, tol) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;

// Compares the app's rows with a board's, row for row (matched by index) or by
// name (`byName`). Every number within 1px.
// `dR` is how much wider the app's table is than the board's: the cases board
// draws its panels' tables 313 wide where the app's is 353 at 393, so a figure
// that hangs off the table's right edge is compared against the board's own
// right edge shifted by it.
function compareRows(label, appRows, boardRows, { byName = false, pen = false, dR = 0 } = {}) {
  const pairs = [];
  if (byName) {
    for (const b of boardRows) {
      const a = appRows.find((row) => row.name === b.name);
      countedCheck(a !== undefined, `${label}: app has a row named "${b.name}"`);
      if (a) pairs.push([a, b]);
    }
  } else {
    countedCheck(appRows.length === boardRows.length, `${label}: row count ${appRows.length} vs board ${boardRows.length}`);
    countedCheck(
      appRows.every((row, i) => boardRows[i] && row.name === boardRows[i].name),
      `${label}: names in the same order (app ${JSON.stringify(appRows.map((r) => r.name))} board ${JSON.stringify(boardRows.map((r) => r.name))})`,
    );
    appRows.forEach((a, i) => boardRows[i] && pairs.push([a, boardRows[i]]));
  }
  for (const [a, b] of pairs) {
    const tag = `${label} "${a.name}"`;
    countedCheck(near(a.height, b.height, 1), `${tag}: height ${a.height} vs board ${b.height}`);
    countedCheck(!!a.amount.cell === !!b.amount.cell && (!a.amount.cell || (near(a.amount.cell.x, b.amount.cell.x, 1) && near(a.amount.cell.width, b.amount.cell.width, 1))), `${tag}: amount cell x/width ${JSON.stringify(a.amount.cell)} vs ${JSON.stringify(b.amount.cell)}`);
    countedCheck(a.nameCell.cell && b.nameCell.cell && near(a.nameCell.cell.x, b.nameCell.cell.x, 1) && near(a.nameCell.cell.width, b.nameCell.cell.width + dR, 1), `${tag}: name cell x/width ${JSON.stringify(a.nameCell.cell)} vs ${JSON.stringify(b.nameCell.cell)}`);
    if (a.share.content || b.share.content) {
      countedCheck(a.share.content && b.share.content && near(a.share.content.right, b.share.content.right + dR, 1), `${tag}: share content right ${a.share.content?.right} vs ${b.share.content?.right} + ${dR}`);
    }
    for (const part of ['amount', 'share']) {
      countedCheck(a[part].struck.length === b[part].struck.length, `${tag}: ${part} struck count ${a[part].struck.length} vs ${b[part].struck.length}`);
      a[part].struck.forEach((s, i) => {
        const bs = b[part].struck[i];
        if (!bs) return;
        countedCheck(near(s.content.y, bs.content.y, 1) && near(s.content.right, bs.content.right + (part === 'share' ? dR : 0), 1), `${tag}: ${part} struck top/right ${s.content.y}/${s.content.right} vs ${bs.content.y}/${bs.content.right} + ${part === 'share' ? dR : 0}`);
      });
    }
    if (a.asMade.content || b.asMade.content) {
      countedCheck(a.asMade.content && b.asMade.content && near(a.asMade.content.y, b.asMade.content.y, 1) && near(a.asMade.content.right, b.asMade.content.right, 1), `${tag}: as-made hand top/right ${JSON.stringify(a.asMade.content)} vs ${JSON.stringify(b.asMade.content)}`);
    }
    if (pen && (a.field || b.field)) {
      countedCheck(a.field && b.field && near(a.field.width, b.field.width, 1) && near(a.field.height, b.field.height, 1) && near(a.field.x, b.field.x, 1) && near(a.field.y, b.field.y, 1), `${tag}: pen field ${JSON.stringify(a.field)} vs ${JSON.stringify(b.field)}`);
    }
  }
}

// The struck figure stands above the current one, right-aligned with it.
// A tfoot struck total has no unit, so only its stacking is checked.
function checkStacked(label, rows, rightTol = 0.5) {
  for (const row of rows) {
    for (const part of ['amount', 'share']) {
      const cell = row[part];
      if (cell.struck.length === 0 || !cell.current) continue;
      const struck = cell.struck[0].content;
      countedCheck(struck.bottom <= cell.current.y + 0.5, `${label} "${row.name}": ${part} struck bottom ${struck.bottom} is above current top ${cell.current.y}`);
      if (!row.tfoot) {
        countedCheck(near(struck.right, cell.current.right, rightTol), `${label} "${row.name}": ${part} struck right ${struck.right} is the current's right ${cell.current.right}`);
      }
    }
  }
}

const overlaps = (a, b) => a && b && Math.min(a.right, b.right) - Math.max(a.x, b.x) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 0.5;
function collisionsIn(rows) {
  let n = 0;
  for (const row of rows) {
    for (const part of [row.amount.content, row.share.content, row.asMade.content]) {
      if (overlaps(row.nameCell.content, part)) n += 1;
    }
  }
  return n;
}
const hasStruck = (row) => row.amount.struck.length > 0 || row.share.struck.length > 0 || row.removed;

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

// ---------------------------------------------------------------------------
// Groups.
async function openMex4Changes(browser, servers, { width, coarse }) {
  const opened = await openAppPage(browser, servers.appUrl, MEX4, { width, coarse });
  await showChanges(opened.page);
  return opened;
}

async function tracer(browser, servers, engine) {
  const { context: appContext, page: appPage } = await openAppPage(browser, servers.appUrl, MEX4, { width: 393, coarse: true });
  const off = await appPage.evaluate(readTable, 0);
  await showChanges(appPage);
  const app = await appPage.evaluate(readTable, 0);
  await appContext.close();
  const { context: boardContext, page: boardPage } = await openBoard(browser, servers.repoUrl, '393-show-changes.html');
  const board = await boardPage.evaluate(readTable, 0);
  await boardContext.close();

  const label = `${engine} 393 show-changes`;
  compareRows(label, app.rows, board.rows);
  countedCheck(near(app.table.height, board.table.height, 1), `${label}: table height ${app.table.height} vs board ${board.table.height}`);
  // The name track is a grid column per row, so a row's width follows its own
  // share track (max-content): a struck share wider than the current one (Salt,
  // 10.0% over 0.1%) narrows that row's name by the difference, in the app and
  // on the board alike. The floor holds: no row's name goes below the reading
  // view's narrowest (223 at 393). Rows that move are reported.
  const offFloor = Math.min(...off.rows.map((r) => r.nameCell.cell.width));
  countedCheck(app.rows.length === off.rows.length && app.rows.every((r) => r.nameCell.cell.width >= offFloor - 0.5), `${label}: no name cell narrower than the reading view's narrowest ${offFloor} (on ${app.rows.map((r) => r.nameCell.cell.width)})`);
  console.log(JSON.stringify({ engine, group: 'tracer', nameRowsNarrowerThanOff: app.rows.filter((r, i) => off.rows[i] && r.nameCell.cell.width < off.rows[i].nameCell.cell.width - 0.5).map((r) => [r.name, off.rows[app.rows.indexOf(r)].nameCell.cell.width, r.nameCell.cell.width]) }));
  if (engine === 'webkit') countedCheck(near(Math.min(...app.rows.map((r) => r.nameCell.cell.width)), 223, 0.5), `${label}: narrowest name cell 223 (read ${Math.min(...app.rows.map((r) => r.nameCell.cell.width))})`);
  checkStacked(label, app.rows);
  countedCheck(app.overflow <= 0, `${label}: overflow ${app.overflow}`);
  console.log(JSON.stringify({ engine, group: 'tracer', width: 393, tableHeight: app.table.height, boardTableHeight: board.table.height, nameTrack: [...new Set(app.rows.map((r) => r.nameCell.cell.width))], rowHeights: app.rows.map((r) => Math.round(r.height * 10) / 10), offRowHeights: off.rows.map((r) => Math.round(r.height * 10) / 10), overflow: app.overflow }));
}

async function boards(browser, servers, engine) {
  const log = (data) => console.log(JSON.stringify({ engine, group: 'boards', ...data }));

  // (1) Show changes, Mexican Chocolate v4.
  for (const [width, coarse, file] of [[393, true, '393-show-changes.html'], [723, false, '723-show-changes.html']]) {
    const { context, page } = await openMex4Changes(browser, servers, { width, coarse });
    const app = await page.evaluate(readTable, 0);
    await context.close();
    const b = await openBoard(browser, servers.repoUrl, file);
    const board = await b.page.evaluate(readTable, 0);
    await b.context.close();
    const label = `${engine} ${file}`;
    compareRows(label, app.rows, board.rows);
    countedCheck(near(app.table.height, board.table.height, 1), `${label}: table height ${app.table.height} vs board ${board.table.height}`);
    checkStacked(label, app.rows);
    countedCheck(app.overflow <= 0, `${label}: overflow ${app.overflow}`);
    const unchanged = app.rows.filter((r) => !hasStruck(r) && !r.tfoot).map((r) => r.height);
    const changed = app.rows.filter((r) => hasStruck(r) && !r.tfoot && !r.removed).map((r) => r.height);
    log({ file, tableHeight: app.table.height, boardTableHeight: board.table.height, nameTrack: [...new Set(app.rows.map((r) => r.nameCell.cell.width))], unchangedRowHeights: [...new Set(unchanged)], changedRowHeights: [...new Set(changed)], rows: app.rows.length });
  }

  // (2) The pen.
  for (const [width, coarse, file] of [[393, true, '393-pen-changes.html'], [723, false, '723-pen-changes.html']]) {
    const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width, coarse });
    await openPen(page);
    await editPen(page);
    const app = await page.evaluate(readTable, 0);
    await context.close();
    const b = await openBoard(browser, servers.repoUrl, file);
    const board = await b.page.evaluate(readTable, 0);
    await b.context.close();
    const label = `${engine} ${file}`;
    compareRows(label, app.rows, board.rows, { pen: true });
    countedCheck(near(app.table.height, board.table.height, 1), `${label}: table height ${app.table.height} vs board ${board.table.height}`);
    checkStacked(label, app.rows, 1);
    countedCheck(app.overflow <= 0, `${label}: overflow ${app.overflow}`);
    const byName = (name) => app.rows.find((r) => r.name.startsWith(name));
    const bBy = (name) => board.rows.find((r) => r.name.startsWith(name));
    const fieldRow = byName('Whole Milk');
    const result = { file, tableHeight: app.table.height, boardTableHeight: board.table.height, changedRow: fieldRow.height, boardChangedRow: bBy('Whole Milk').height, shareOnlyRow: byName('Cream').height, boardShareOnlyRow: bBy('Cream').height, total: byName('Total').height, boardTotal: bBy('Total').height, field: [fieldRow.field.width, fieldRow.field.height], nameTrack: [...new Set(app.rows.map((r) => r.nameCell.cell.width))] };
    log(result);
    if (width === 393) {
      countedCheck(near(result.changedRow, 81, 1) && near(result.boardChangedRow, 81, 1), `${label}: changed row ${result.changedRow} (board ${result.boardChangedRow}) vs drawn 81`);
      countedCheck(near(result.shareOnlyRow, 63, 1) && near(result.boardShareOnlyRow, 63, 1), `${label}: share-only row ${result.shareOnlyRow} (board ${result.boardShareOnlyRow}) vs drawn 63`);
      countedCheck(near(result.total, 56.3, 1) && near(result.boardTotal, 56.3, 1), `${label}: Total ${result.total} (board ${result.boardTotal}) vs drawn 56.3`);
      countedCheck(near(result.field[0], 52, 1) && near(result.field[1], 44, 1), `${label}: field ${result.field} vs drawn 52 x 44`);
    }
  }

  // (3) Strawberry v2.1 with its batch in view, Show changes on, 393 coarse.
  {
    const { context, page } = await openAppPage(browser, servers.appUrl, STRAW_BATCH, { width: 393, coarse: true });
    await showChanges(page);
    const app = await page.evaluate(readTable, 0);
    await context.close();
    const b = await openBoard(browser, servers.repoUrl, '393-show-changes-cases.html');
    const board = await b.page.evaluate(readTable, 0);
    await b.context.close();
    const label = `${engine} strawberry batch vs cases`;
    compareRows(label, app.rows, board.rows, { byName: true, dR: app.table.width - board.table.width });
    checkStacked(label, app.rows);
    countedCheck(app.overflow <= 0, `${label}: overflow ${app.overflow}`);
    const handRows = app.rows.filter((r) => r.asMade.content && r.amount.struck.length > 0 && !r.tfoot);
    countedCheck(handRows.length > 0, `${label}: a changed row with a hand exists`);
    for (const r of handRows) {
      const boardHand = board.rows.find((row) => row.name === r.name);
      countedCheck(near(r.height, boardHand.height, 1), `${label} "${r.name}": changed row with hand ${r.height} vs board's ${boardHand.height} (the plan's 78 is not what the board draws)`);
      countedCheck(r.asMade.content.y >= r.amount.current.bottom - 0.5, `${label} "${r.name}": hand top ${r.asMade.content.y} at or below current amount bottom ${r.amount.current.bottom}`);
      countedCheck(near(r.asMade.content.right, r.amount.current.right, 0.5), `${label} "${r.name}": hand right ${r.asMade.content.right} vs current right ${r.amount.current.right}`);
    }
    log({ case: 'strawberry batch', rows: app.rows.map((r) => [r.name, r.height]), handRows: handRows.map((r) => [r.name, r.height]), boardRows: board.rows.map((r) => [r.name, r.height]) });
  }

  // (4) The removed row, live: save the pen as a child, then Show changes.
  {
    const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width: 393, coarse: true });
    await openPen(page);
    await editPen(page);
    const urlBefore = page.url();
    await page.getByLabel('Version name').fill('stack check');
    await page.getByRole('button', { name: 'Save as a new version' }).click();
    await page.waitForFunction((prev) => window.location.href !== prev, urlBefore);
    await page.waitForSelector('h2.notebook-version__identity');
    await showChanges(page);
    const app = await page.evaluate(readTable, 0);
    await context.close();
    const b = await openBoard(browser, servers.repoUrl, '393-show-changes-cases.html');
    const board = await b.page.evaluate(readTable, 2);
    await b.context.close();
    const label = `${engine} removed row live`;
    const cin = app.rows.find((r) => r.name.startsWith('Cinnamon'));
    countedCheck(cin !== undefined, `${label}: Cinnamon row present`);
    const boardRemoved = board.rows.find((r) => r.removed);
    const oneLine = app.rows.find((r) => !hasStruck(r) && !r.tfoot);
    if (cin) {
      countedCheck(cin.amount.slotHtml === '<span class="struck-value">2.77 g</span>', `${label}: slot innerHTML ${JSON.stringify(cin.amount.slotHtml)}`);
      countedCheck(near(cin.height, boardRemoved.height, 1), `${label}: height ${cin.height} vs board removed row ${boardRemoved.height}`);
      countedCheck(near(cin.height, oneLine.height, 0.5), `${label}: height ${cin.height} vs one-line row ${oneLine.height}`);
      log({ case: 'removed row live', removedRow: cin.height, boardRemovedRow: boardRemoved.height, oneLineRow: oneLine.height, slotHtml: cin.amount.slotHtml });
    }
  }
}

const SWEEP_STATES = [
  { id: 'mex4-show', route: MEX4, prepare: async () => {}, turnOn: showChanges, nameTrackStable: true },
  { id: 'mocha3-show', route: MOCHA3, prepare: async () => {}, turnOn: showChanges },
  { id: 'strawberry-batch-show', route: STRAW_BATCH, prepare: async () => {}, turnOn: showChanges },
  { id: 'mex4-pen', route: MEX4, prepare: openPen, turnOn: editPen, penTrack: true },
];

async function sweep(browser, servers, engine, coarse) {
  const pointer = coarse ? 'coarse' : 'fine';
  for (const state of SWEEP_STATES) {
    const { context, page } = await openAppPage(browser, servers.appUrl, state.route, { width: 393, coarse });
    await state.prepare(page);
    const read = async (width) => {
      await page.setViewportSize({ width, height: 1100 });
      return page.evaluate(readTable, 0);
    };
    const off = new Map();
    for (let w = 320; w <= 723; w += 1) off.set(w, await read(w));
    await state.turnOn(page);
    const narrowerRows = new Set();
    const tally = { widths: 0, collisions: 0, maxOverflow: -Infinity, minNameTrack: Infinity, maxNameDiff: 0, maxNameDiffAt: null, unchangedMoved: 0, offCollisions: 0 };
    for (let w = 320; w <= 723; w += 1) {
      const on = await read(w);
      const before = off.get(w);
      const tag = `${engine} ${pointer} ${state.id} @${w}`;
      tally.widths += 1;
      countedCheck(on.innerWidth === w, `${tag}: innerWidth ${on.innerWidth}`);
      countedCheck(on.overflow <= 0, `${tag}: overflow ${on.overflow}`);
      tally.maxOverflow = Math.max(tally.maxOverflow, on.overflow);
      const collisions = collisionsIn(on.rows);
      tally.collisions += collisions;
      countedCheck(collisions === 0, `${tag}: ${collisions} collisions`);
      countedCheck(on.rows.length === before.rows.length, `${tag}: row count moved ${before.rows.length} -> ${on.rows.length}`);
      const offFloor = Math.min(...before.rows.map((r) => r.nameCell.cell.width));
      on.rows.forEach((row, i) => {
        const was = before.rows[i];
        if (!hasStruck(row) && was && !was.removed) {
          const same = near(row.height, was.height, 0.5);
          if (!same) tally.unchangedMoved += 1;
          countedCheck(same, `${tag} "${row.name}": unchanged row height ${row.height} vs off ${was.height}`);
        }
        const diff = Math.abs(row.nameCell.cell.width - was.nameCell.cell.width);
        if (diff > tally.maxNameDiff) {
          tally.maxNameDiff = diff;
          tally.maxNameDiffAt = w;
        }
        tally.minNameTrack = Math.min(tally.minNameTrack, row.nameCell.cell.width);
        if (state.nameTrackStable) {
          // Decision 24 says Show changes leaves the name track at its
          // reading-view width. A row whose struck share is wider than its
          // current one (Salt, 10.0% over 0.1%) is narrower by the difference,
          // on the board as well; the floor is what holds and is asserted:
          // no name cell narrower than the reading view's narrowest.
          countedCheck(row.nameCell.cell.width >= offFloor - 0.5, `${tag} "${row.name}": name track ${row.nameCell.cell.width} below the reading view's narrowest ${offFloor}`);
          if (diff > 0.5) narrowerRows.add(row.name);
        }
      });
      if (state.penTrack && w === 320) {
        const narrowest = Math.min(...on.rows.map((r) => r.nameCell.cell.width));
        countedCheck(narrowest >= 149.5, `${tag}: narrowest pen name track ${narrowest} at 320`);
      }
    }
    console.log(JSON.stringify({ engine, group: `sweep-${pointer}`, state: state.id, ...tally, nameNarrowerThanOffRows: [...narrowerRows], maxNameDiff: Math.round(tally.maxNameDiff * 100) / 100, minNameTrack: Math.round(tally.minNameTrack * 100) / 100 }));
    await context.close();
  }
}

async function wide(browser, servers, engine) {
  for (const width of [724, 1366]) {
    const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width, coarse: false });
    await showChanges(page);
    const read = await page.evaluate(() =>
      [...document.querySelectorAll('.ingredient-table td.ingredient-table__col-grams .struck-value, .ingredient-table td.ingredient-table__col-numeric .struck-value')].map((el) => {
        const cs = getComputedStyle(el);
        return { display: cs.display, marginRight: cs.marginRight };
      }),
    );
    countedCheck(read.length > 0, `${engine} @${width}: struck figures exist`);
    const bad = read.filter((s) => s.display !== 'inline' || s.marginRight !== '2px');
    countedCheck(bad.length === 0, `${engine} @${width}: ${bad.length} of ${read.length} struck figures not inline/2px (${JSON.stringify(bad[0])})`);
    console.log(JSON.stringify({ engine, group: 'wide', width, struck: read.length, notInline2px: bad.length }));
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const requested = process.argv[2] ? process.argv[2].split(',') : ['tracer', 'boards', 'sweep', 'sweep-fine', 'wide'];
const servers = await startServers();
try {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      // The tracer proves one path in WebKit; the full run repeats it in Chrome.
      if (requested.includes('tracer') && (engine === 'webkit' || requested.length > 1)) await tracer(browser, servers, engine);
      if (requested.includes('boards')) await boards(browser, servers, engine);
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

finish(failures, count, '261002-axn probe');
