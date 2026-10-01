// Quick task 261001-eds's probe: reads the ingredient table's total row on the
// built app, in Playwright's WebKit and in Chromium, against the checkout's
// app/dist. Takes no arguments: `node 261001-eds-total-probe.mjs`. Serves the
// build through the 03.5 harness's own ephemeral 127.0.0.1 servers and never
// touches Mark's :4173 preview or the dev server. A WebKit reading is evidence
// about the engine, not about Mark's iPad; the device is his to check.
//
// Counted per engine: Mocha version 3 (nothing written) with Show changes off
// and on: the As made total cell is empty, no child element, no ", as made"
// clause. Mocha version 2 (as made written): the total still reads 794.6 g in
// a hand-span. The recording pen on the Olive Oil batch route: blank on open,
// shown after a typed 45, blank again when cleared, shown for a typed value
// equal to the plan, and the As made and Ingredient heads do not move. The
// sketch boards 1366-batch and 1600-pen draw the total only over written
// values, and the app's Olive Oil batch reading shows the 1366 board's figure.
// Report-only: the same two Mocha readings at 393 wide.
//
// WebKit is created through contexts built here, not through openApp: openApp
// asserts a pointer mode and is written against Chromium.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish, APP_ROUTE } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const MOCHA_V3 = '/notebook/mocha/mocha-v3';
const MOCHA_V2 = '/notebook/mocha/mocha-v2';
const AS_MADE_CLAUSE = /, as made /;

// Runs in the page: the total row's aria-label and its four cells, the head's
// As made presence, and the tbody's hand-span count.
function readTotalRow() {
  const table = document.querySelector('.ingredient-table');
  const tr = table.querySelector('tfoot tr');
  const tds = [...tr.querySelectorAll('td')];
  const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
  return {
    aria: tr.getAttribute('aria-label'),
    cellCount: tds.length,
    cells: tds.map((td) => ({
      text: td.textContent.trim(),
      children: td.childElementCount,
      hand: td.querySelector('.sheet-hand') !== null,
      struck: td.querySelector('.struck-value') !== null,
      cls: td.className,
    })),
    headHasAsMade: heads.includes('As made'),
    bodyHands: table.querySelectorAll('tbody .sheet-hand').length,
  };
}

// Runs in the page: x and width of the As made and Ingredient heads.
function readHeads() {
  const ths = [...document.querySelectorAll('.ingredient-table thead th')];
  const box = (label) => {
    const th = ths.find((el) => el.textContent.trim() === label);
    if (!th) return null;
    const rect = th.getBoundingClientRect();
    return { x: rect.x, width: rect.width };
  };
  return { asMade: box('As made'), ingredient: box('Ingredient') };
}

async function newPage(browser, { width, height = 1024 }) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await context.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  const page = await context.newPage();
  return { context, page };
}

async function gotoTable(page, appUrl, route) {
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ingredient-table');
}

async function showChangesOn(page) {
  await page.getByRole('button', { name: 'Show changes' }).first().click();
  await page.waitForFunction(() => document.querySelector('.ingredient-table tfoot .struck-value') !== null);
}

const sameBox = (a, b) => a && b && Math.abs(a.x - b.x) <= 0.5 && Math.abs(a.width - b.width) <= 0.5;

async function probeEngine(engine, browser, servers) {
  const log = (reading, data) => console.log(JSON.stringify({ engine, reading, ...data }));

  // Mocha version 3: nothing written, Show changes off then on.
  {
    const { context, page } = await newPage(browser, { width: 1366 });
    await gotoTable(page, servers.appUrl, MOCHA_V3);
    const off = await page.evaluate(readTotalRow);
    log('mocha-v3 changes off', off);
    countedCheck(off.headHasAsMade, `${engine}: v3 head carries As made`);
    countedCheck(off.bodyHands === 0, `${engine}: v3 body holds no hand-span (read ${off.bodyHands})`);
    countedCheck(off.cellCount === 4, `${engine}: v3 total row has four cells (read ${off.cellCount})`);
    countedCheck(off.cells[2].text === '' && off.cells[2].children === 0, `${engine}: v3 As made total cell is empty with no child (read ${JSON.stringify(off.cells[2])})`);
    countedCheck(!AS_MADE_CLAUSE.test(off.aria), `${engine}: v3 aria-label has no as-made clause (read ${off.aria})`);
    countedCheck(off.cells[0].text === '793.9 g', `${engine}: v3 plan cell reads 793.9 g (read ${off.cells[0].text})`);

    await showChangesOn(page);
    const on = await page.evaluate(readTotalRow);
    log('mocha-v3 changes on', on);
    countedCheck(on.cells[0].struck, `${engine}: v3 plan cell is struck with Show changes on`);
    countedCheck(on.cells[2].text === '' && on.cells[2].children === 0, `${engine}: v3 As made total cell is still empty with Show changes on (read ${JSON.stringify(on.cells[2])})`);
    countedCheck(!AS_MADE_CLAUSE.test(on.aria), `${engine}: v3 aria-label still has no as-made clause with Show changes on (read ${on.aria})`);
    await context.close();
  }

  // Mocha version 2: values written, the total still shows.
  {
    const { context, page } = await newPage(browser, { width: 1366 });
    await gotoTable(page, servers.appUrl, MOCHA_V2);
    const off = await page.evaluate(readTotalRow);
    log('mocha-v2 changes off', off);
    countedCheck(off.cells[2].text === '794.6 g' && off.cells[2].hand, `${engine}: v2 As made total reads 794.6 g in a hand-span (read ${JSON.stringify(off.cells[2])})`);
    countedCheck(off.bodyHands > 0, `${engine}: v2 body holds hand-spans (read ${off.bodyHands})`);
    countedCheck(/as made 794\.6 grams/.test(off.aria), `${engine}: v2 aria-label carries as made 794.6 grams (read ${off.aria})`);

    await showChangesOn(page);
    const on = await page.evaluate(readTotalRow);
    log('mocha-v2 changes on', on);
    countedCheck(on.cells[2].text === '794.6 g' && on.cells[2].hand, `${engine}: v2 As made total still reads 794.6 g with Show changes on (read ${JSON.stringify(on.cells[2])})`);
    await context.close();
  }

  // The recording pen on the Olive Oil batch route.
  {
    const { context, page } = await newPage(browser, { width: 1366 });
    await page.goto(servers.appUrl + APP_ROUTE, { waitUntil: 'networkidle' });
    await page.waitForSelector('.ingredient-table');
    await page.getByRole('button', { name: 'Record another' }).first().click();
    await page.waitForSelector('.ingredient-table__as-made-field');

    const opened = await page.evaluate(readTotalRow);
    const headsOpen = await page.evaluate(readHeads);
    log('pen on open', { ...opened, heads: headsOpen });
    countedCheck(opened.cells[2].text === '' && opened.cells[2].children === 0, `${engine}: pen opens with an empty As made total (read ${JSON.stringify(opened.cells[2])})`);
    countedCheck(/live-total/.test(opened.cells[2].cls), `${engine}: pen's total cell carries the live-total class (read ${opened.cells[2].cls})`);
    countedCheck(!AS_MADE_CLAUSE.test(opened.aria), `${engine}: pen's aria-label has no as-made clause on open (read ${opened.aria})`);

    const field = page.locator('.ingredient-table__as-made-field').first();
    const planText = await field.evaluate((el) => el.closest('tr').querySelector('.ingredient-table__plan-grams').textContent.trim());
    const planNumber = planText.replace(/ g$/, '');

    await field.fill('45');
    await page.waitForTimeout(150);
    const typed = await page.evaluate(readTotalRow);
    const headsTyped = await page.evaluate(readHeads);
    log('pen typed 45', { ...typed, heads: headsTyped });
    countedCheck(/^\d+(\.\d+)? g$/.test(typed.cells[2].text) && typed.cells[2].hand, `${engine}: pen shows a figure in grams in a hand-span after 45 (read ${JSON.stringify(typed.cells[2])})`);
    countedCheck(AS_MADE_CLAUSE.test(typed.aria), `${engine}: pen's aria-label carries the clause after 45 (read ${typed.aria})`);
    countedCheck(sameBox(headsOpen.asMade, headsTyped.asMade) && sameBox(headsOpen.ingredient, headsTyped.ingredient), `${engine}: heads did not move after 45 (open ${JSON.stringify(headsOpen)}, typed ${JSON.stringify(headsTyped)})`);

    await field.fill('');
    await page.waitForTimeout(150);
    const cleared = await page.evaluate(readTotalRow);
    const headsCleared = await page.evaluate(readHeads);
    log('pen cleared', { ...cleared, heads: headsCleared });
    countedCheck(cleared.cells[2].text === '' && cleared.cells[2].children === 0, `${engine}: pen's total is empty again once cleared (read ${JSON.stringify(cleared.cells[2])})`);
    countedCheck(sameBox(headsOpen.asMade, headsCleared.asMade) && sameBox(headsOpen.ingredient, headsCleared.ingredient), `${engine}: heads did not move after clearing (open ${JSON.stringify(headsOpen)}, cleared ${JSON.stringify(headsCleared)})`);

    await field.fill(planNumber);
    await page.waitForTimeout(150);
    const equal = await page.evaluate(readTotalRow);
    const headsEqual = await page.evaluate(readHeads);
    log('pen typed plan value', { planNumber, ...equal, heads: headsEqual });
    countedCheck(equal.cells[2].hand && equal.cells[2].text === equal.cells[0].text, `${engine}: a value equal to the plan (${planNumber}) shows a total equal to the plan total (as made ${equal.cells[2].text}, plan ${equal.cells[0].text})`);
    countedCheck(sameBox(headsOpen.asMade, headsEqual.asMade) && sameBox(headsOpen.ingredient, headsEqual.ingredient), `${engine}: heads did not move after the plan-equal value`);
    await context.close();
  }

  // The app's Olive Oil batch reading, then the boards beside it.
  let appReadingText = null;
  {
    const { context, page } = await newPage(browser, { width: 1366 });
    await gotoTable(page, servers.appUrl, APP_ROUTE);
    const reading = await page.evaluate(readTotalRow);
    appReadingText = reading.cells[2].text;
    log('olive-oil batch reading', reading);
    await context.close();
  }
  const boardTexts = {};
  for (const file of ['1366-batch.html', '1600-pen.html']) {
    const { context, page } = await openBoard(browser, servers.repoUrl, file);
    const board = await page.evaluate(() => {
      const tr = document.querySelector('tfoot tr');
      const tds = [...tr.querySelectorAll('td')];
      const hands = [...document.querySelectorAll('tbody span')].filter((s) => getComputedStyle(s).fontFamily.includes('Caveat')).length;
      return { cellText: tds[2] ? tds[2].textContent.trim() : null, hands };
    });
    boardTexts[file] = board.cellText;
    log(`board ${file}`, board);
    countedCheck(board.hands > 0 && /^\d+(\.\d+)? g$/.test(board.cellText ?? ''), `${engine}: ${file} draws the total only over written hand values (hands ${board.hands}, total ${board.cellText})`);
    await context.close();
  }
  countedCheck(appReadingText === boardTexts['1366-batch.html'], `${engine}: the app's Olive Oil batch reading total (${appReadingText}) equals the 1366 board's (${boardTexts['1366-batch.html']})`);

  // Report-only: the 393 list form, Mocha version 3 and version 2.
  for (const [label, route] of [['mocha-v3', MOCHA_V3], ['mocha-v2', MOCHA_V2]]) {
    const { context, page } = await newPage(browser, { width: 393, height: 852 });
    await gotoTable(page, servers.appUrl, route);
    const narrow = await page.evaluate(() => {
      const tr = document.querySelector('.ingredient-table tfoot tr');
      const td = tr.querySelectorAll('td')[2];
      return {
        display: td ? getComputedStyle(td).display : null,
        text: td ? td.textContent.trim() : null,
        rowHeight: Math.round(tr.getBoundingClientRect().height),
      };
    });
    log(`393 ${label} (report only)`, narrow);
    await context.close();
  }
}

const servers = await startServers();
try {
  for (const engine of ['webkit', 'chromium']) {
    const browser = engine === 'webkit' ? await webkit.launch() : await launch();
    try {
      await probeEngine(engine, browser, servers);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

finish(failures, count, '261001-eds total probe');
