// 09-03, 09-16: the WebKit measurement of the built Notebook and Ingredients places
// against sketch 012's recorded numbers (.planning/sketches/012-places/README.md,
// "Measured"), with a 1 px tolerance.
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-09"
//   npm --prefix app run build -- --outDir "$S/dist-places" --emptyOutDir
//   PROBE_DIST="$S/dist-places" node .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-places-check.mjs --library original|current [--evidence <dir>]
//
// --library is required, and the two modes are never mixed (the 26-entry numbers
// and the larger library's are measurements of different datasets, and holding
// both to one library makes valid rows fail):
//   original  rewrites the built page's library store to data/library.js's 26
//             entries before measuring, then checks the 26-entry numbers: closed
//             rows 69 at 1366 and 88 to 126 at 393 (see below), '26 ingredients',
//             "milk" gives 5 of 26, Sugar gives four rows. Sketch 012's
//             ingredients-place.html draws these 26.
//   current   measures the library the build seeds (the 26 plus every entry Mark
//             approved) against the 103-name board's row heights
//             (ingredients-place-103-entries.html: 69 at 1366, 71 to 109 at 393).
//             Every count is read from the stored library, never a literal.
// --evidence <dir> (original mode only, the boards draw 26 entries) also writes
// PNG pairs, <place>-<state>-<width>-app.png beside <place>-<state>-<width>-board.png,
// and a README.md listing them: the built place and the matching board panel at
// the same width, taken in a context that has first visited every route the
// places link to (so link colours are the visited ones).
//
// It drives the BUILT app in Playwright WebKit with a coarse pointer (hasTouch),
// a fresh context per width so IndexedDB starts from the reseed. It prints PASS
// or FAIL per check and exits 1 on any FAIL. Measure, then edit: when a number
// is off, read the real DOM rects before changing a rule.
//
// Two numbers differ from the README's "Measured" prose and follow the boards,
// which are the authority and which the built page matches row for row (26 rows
// at both widths, compared against ingredients-place.html in WebKit): at 393 a
// closed row runs 88 to 126, not 88 to 105 (the two longest names wrap: "Coconut,
// Shredded (unsweetened)" is 126, "Graza Drizzle extra virgin olive oil" 109), and
// a row head is "44 tall" as a floor, not a size (a two-line summary makes it 46
// at 1366, and a head at 393 stacks category, name and summary, 69 to 107).
//
// The build is read from PROBE_DIST (default app/dist); pass a scratch --outDir
// build so Mark's own `vite preview --host`, which serves app/dist, is never
// disturbed. playwright-core is loaded only through PLAYWRIGHT_CORE (default:
// the npx cache path below); when that file is missing the script prints a FAIL
// line and exits 1 before it does anything else. The app is served on an
// ephemeral 127.0.0.1 port through 08-walk-server.mjs, and every request to
// another host is aborted. Everything typed into the app is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { library } from '../../../app/src/data/library.js';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const USAGE =
  'Usage: node 09-places-check.mjs --library original|current [--evidence <dir>]  (--evidence needs --library original)';
const args = process.argv.slice(2);
const valueOf = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const LIBRARY_MODE = valueOf('--library');
const EVIDENCE_DIR = valueOf('--evidence');
if (
  !['original', 'current'].includes(LIBRARY_MODE) ||
  (args.includes('--evidence') && (!EVIDENCE_DIR || EVIDENCE_DIR.startsWith('--') || LIBRARY_MODE !== 'original'))
) {
  console.error(USAGE);
  process.exit(1);
}

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const DIST = path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'));
const BOARDS = path.join(REPO_ROOT, '.planning', 'sketches', '012-places');

const TOLERANCE = 1;
let failures = 0;
let passes = 0;

function report(ok, label, detail) {
  if (ok) passes += 1;
  else failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` (${detail})` : ''}`);
}
const near = (actual, expected, tolerance = TOLERANCE) => Math.abs(actual - expected) <= tolerance;
const within = (actual, low, high, tolerance = TOLERANCE) => actual >= low - tolerance && actual <= high + tolerance;
const fmt = (value) => (typeof value === 'number' ? Number(value.toFixed(1)) : value);

// The 26 entries as the store holds them: one { id, entry } record each.
const ORIGINAL_RECORDS = Object.entries(library).map(([id, entry]) => ({ id, entry }));
const ORIGINAL_NAMES = new Set(ORIGINAL_RECORDS.map((record) => record.entry.name));

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();

// Original mode: clear the library store and put the 26 entries in one
// transaction, then reload (seedLibraryIfEmpty leaves a non-empty library alone).
async function useOriginalLibrary(page) {
  await page.evaluate(async (records) => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('sprinkles');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('library', 'readwrite');
        const store = tx.objectStore('library');
        store.clear();
        for (const record of records) store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }, ORIGINAL_RECORDS);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.place__title');
  await page.evaluate(() => document.fonts.ready);
}

// The library as the page's store holds it, { id, entry } records.
const storedLibrary = (page) =>
  page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('sprinkles');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise((resolve, reject) => {
        const request = db.transaction('library', 'readonly').objectStore('library').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  });

// The tallest summary line (px) the 103-name board draws on its 393 first
// screen: read from the board file, never written as a number here.
let boardTallestSummary;
async function tallestBoardSummary() {
  if (boardTallestSummary === undefined) {
    const context = await browser.newContext({ viewport: { width: 2400, height: 1400 } });
    await context.route('**/*', (request) => (request.request().url().startsWith('file:') ? request.continue() : request.abort()));
    const page = await context.newPage();
    await page.goto(pathToFileURL(path.join(BOARDS, 'ingredients-place-103-entries.html')).href);
    boardTallestSummary = await page.evaluate(() =>
      Math.max(...[...document.querySelectorAll('.pm2 .ing__sum')].map((node) => node.getBoundingClientRect().height)),
    );
    await context.close();
  }
  return boardTallestSummary;
}

async function newContext(width) {
  const context = await browser.newContext({
    viewport: { width, height: width <= 760 ? 852 : 1024 },
    hasTouch: true,
  });
  // Nothing leaves the machine: abort every request to another host.
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  return context;
}

async function open(width, route) {
  const context = await newContext(width);
  const page = await context.newPage();
  await page.goto(servers.appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.place__title');
  await page.evaluate(() => document.fonts.ready);
  if (LIBRARY_MODE === 'original' && route === '/ingredients') await useOriginalLibrary(page);
  return { context, page };
}

// Each box's { w, h } for a selector, read from the live DOM.
const sizes = (page, selector) =>
  page.evaluate((sel) => [...document.querySelectorAll(sel)].map((node) => {
    const rect = node.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }), selector);

async function checkNotebook(width) {
  const tag = `Notebook ${width}`;
  const { context, page } = await open(width, '/notebook');
  await page.waitForSelector('.nb__row');
  const rows = await sizes(page, '.nb__row');
  report(rows.length === 8, `${tag}: eight recipe rows`, `${rows.length}`);
  const [low, high] = width === 1366 ? [97, 136] : [108, 159];
  const heights = rows.map((row) => row.h);
  report(
    heights.every((h) => within(h, low, high)),
    `${tag}: row heights inside ${low} to ${high}`,
    `${fmt(Math.min(...heights))} to ${fmt(Math.max(...heights))}`,
  );
  const links = await sizes(page, '.nb__name a');
  report(
    links.length > 0 && links.every((link) => near(link.h, 44)),
    `${tag}: name links 44 tall`,
    `${links.map((link) => fmt(link.h)).join(', ')}`,
  );
  await context.close();
}

// The closed-row heights, by library mode. The two ranges live in separate
// branches because they are measurements of different datasets.
async function checkClosedRows(page, tag, width, rowHeights) {
  const spread = `${fmt(Math.min(...rowHeights))} to ${fmt(Math.max(...rowHeights))}`;
  if (width === 1366) {
    report(rowHeights.every((h) => near(h, 69)), `${tag}: closed rows 69 tall`, spread);
    return;
  }
  if (LIBRARY_MODE === 'original') {
    // The 26-entry board (ingredients-place.html): 88 to 126 at 393.
    report(rowHeights.every((h) => within(h, 88, 126)), `${tag}: closed rows inside 88 to 126`, spread);
    return;
  }
  // The 103-name board (ingredients-place-103-entries.html): 71 to 109 at 393.
  // The seeded library also holds the 26, and the two names that wrap there run
  // to 126, so a row whose name is one of the original 26 is held to the 26-entry
  // range. A new entry whose summary line is longer than any the 103-name board
  // draws (its stand-in figures leave out "Other solids", which Milk Chocolate
  // holds) wraps to more lines than any summary there: the board's rules are the
  // same, the content is longer, so that row is held to the 26-entry ceiling and
  // named in the detail as a gap against the board, not passed silently.
  const rowsText = await page.evaluate(() =>
    [...document.querySelectorAll('.ing__row')].map((node) => [node.querySelector('.ing__name')?.textContent, node.querySelector('.ing__sum')?.getBoundingClientRect().height ?? 0]),
  );
  const boardTallest = await tallestBoardSummary();
  const fresh = [];
  const longer = [];
  const original = [];
  rowHeights.forEach((h, i) => {
    const [name, summaryHeight] = rowsText[i];
    if (ORIGINAL_NAMES.has(name)) original.push(h);
    else if (summaryHeight > boardTallest + TOLERANCE) longer.push([name, h]);
    else fresh.push(h);
  });
  report(
    fresh.length > 0 && fresh.every((h) => within(h, 71, 109)),
    `${tag}: closed rows of the new entries inside 71 to 109`,
    `${fresh.length} rows, ${fmt(Math.min(...fresh))} to ${fmt(Math.max(...fresh))}`,
  );
  report(
    longer.every(([, h]) => within(h, 71, 126)),
    `${tag}: new entries whose summary wraps to more lines than the board's tallest (${fmt(boardTallest)} px) stay under the 126 ceiling`,
    longer.length === 0 ? 'none' : longer.map(([name, h]) => `${name} ${fmt(h)}`).join(', '),
  );
  report(
    original.length > 0 && original.every((h) => within(h, 88, 126)),
    `${tag}: closed rows of the original 26 inside 88 to 126`,
    `${original.length} rows, ${fmt(Math.min(...original))} to ${fmt(Math.max(...original))}`,
  );
}

async function checkIngredients(width) {
  const tag = `Ingredients ${width} (${LIBRARY_MODE} library)`;
  const { context, page } = await open(width, '/ingredients');
  await page.waitForSelector('.ing__row');
  const stored = await storedLibrary(page);
  const total = stored.length;
  const rows = await sizes(page, '.ing__row');
  if (LIBRARY_MODE === 'original') {
    report(total === 26 && rows.length === 26, `${tag}: 26 library rows`, `store ${total}, page ${rows.length}`);
    const unfiltered = await page.textContent('p.ing__count');
    report(unfiltered === '26 ingredients', `${tag}: the count line reads 26 ingredients`, `${unfiltered}`);
  } else {
    report(total > 26 && rows.length === total, `${tag}: one row per stored entry, more than the original 26`, `store ${total}, page ${rows.length}`);
    const unfiltered = await page.textContent('p.ing__count');
    report(unfiltered === `${total} ingredients`, `${tag}: the count line reads the stored count`, `${unfiltered}, store ${total}`);
  }
  await checkClosedRows(page, tag, width, rows.map((row) => row.h));
  const heads = await sizes(page, '.ing__head');
  report(
    heads.length === rows.length && heads.every((head) => head.h >= 44 - TOLERANCE),
    `${tag}: every row head holds the 44 floor`,
    `${fmt(Math.min(...heads.map((head) => head.h)))} to ${fmt(Math.max(...heads.map((head) => head.h)))}`,
  );
  const [name] = await sizes(page, 'input.ink-field');
  const [category] = await sizes(page, 'select');
  report(near(name.h, 44), `${tag}: Name field 44 tall`, `${fmt(name.h)}`);
  report(near(category.h, 44), `${tag}: Category select 44 tall`, `${fmt(category.h)}`);
  if (width === 1366) {
    report(near(name.w, 598.9), `${tag}: Name 598.9 wide`, `${fmt(name.w)}`);
    report(near(category.w, 120), `${tag}: Category 120 wide`, `${fmt(category.w)}`);
  }

  // Tab from Name reaches the Category select (D-15).
  await page.focus('input.ink-field');
  await page.keyboard.press('Tab');
  const tabbedTo = await page.evaluate(() => document.activeElement?.tagName);
  report(tabbedTo === 'SELECT', `${tag}: Tab from Name reaches the Category select`, `${tabbedTo}`);

  // Typing milk narrows the list and shows Clear filters, 78.6 by 44. The
  // expected count is 5 of the 26; in current mode it is read from the store.
  const milkCount = LIBRARY_MODE === 'original' ? 5 : stored.filter((record) => record.entry.name.toLowerCase().includes('milk')).length;
  const milkWords = `${milkCount} of ${total} ingredients`;
  await page.fill('input.ink-field', 'milk');
  const countText = await page.textContent('p.ing__count');
  report(countText === milkWords, `${tag}: milk gives the filtered count`, `${countText}, expected ${milkWords}`);
  const [clear] = await sizes(page, '.ing__clear');
  report(
    clear !== undefined && near(clear.w, 78.6) && near(clear.h, 44),
    `${tag}: Clear filters 78.6 by 44`,
    clear ? `${fmt(clear.w)} by ${fmt(clear.h)}` : 'missing',
  );

  // Enter in Name submits nothing: the route, the field and the count stay.
  await page.focus('input.ink-field');
  await page.keyboard.press('Enter');
  const after = await page.evaluate(() => ({
    path: location.pathname,
    value: document.querySelector('input.ink-field')?.value,
    count: document.querySelector('p.ing__count')?.textContent,
  }));
  report(
    after.path === '/ingredients' && after.value === 'milk' && after.count === milkWords,
    `${tag}: Enter in Name keeps the route, the field and the count`,
    `${after.path} ${JSON.stringify(after.value)} ${after.count}`,
  );

  // A category choice shows exactly that category's entries: Sugar gives four
  // of the 26; in current mode Fruit gives the stored library's fruit entries.
  await page.fill('input.ink-field', '');
  const [choice, expectedRows] =
    LIBRARY_MODE === 'original' ? ['sugar', 4] : ['fruit', stored.filter((record) => record.entry.category === 'fruit').length];
  report(expectedRows > 0, `${tag}: the stored library holds ${choice} entries to choose`, `${expectedRows}`);
  await page.selectOption('select', choice);
  const chosen = await page.evaluate(() => ({
    rows: document.querySelectorAll('.ing__row').length,
    count: document.querySelector('p.ing__count')?.textContent,
  }));
  report(
    chosen.rows === expectedRows && chosen.count === `${expectedRows} of ${total} ingredients`,
    `${tag}: ${choice} shows ${expectedRows} of ${total}`,
    `${chosen.rows} rows, ${chosen.count}`,
  );
  await context.close();
}

async function checkOverflow(route, widths) {
  for (const width of widths) {
    const { context, page } = await open(width, route);
    await page.waitForSelector(route === '/notebook' ? '.nb__row' : '.ing__row');
    const { scrollW, innerW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    }));
    report(scrollW <= innerW, `${route} ${width}: no horizontal overflow`, `scrollWidth ${scrollW}, innerWidth ${innerW}`);
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// 09-17, current mode: the steps of Mark's List row check-p9-places-and-reset-on-ipad,
// walked at 1366 with a coarse pointer so each is proven reachable before Mark
// is handed it: Home's eight recipes, /notebook in Home's order, an entry's Basis
// and Source, a tap in Name then Tab reaching the Category select, and the olive
// oil 2 Aug batch reading Sweetness 4 and Oil 4.
// ---------------------------------------------------------------------------
const AUG_BATCH_ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';

async function checkDeviceSteps() {
  const tag = 'Device row 1366';
  const context = await newContext(1366);
  const page = await context.newPage();
  await page.goto(servers.appUrl + '/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.home__row');
  const homeNames = await page.evaluate(() => [...document.querySelectorAll('.home__row .home__name')].map((node) => node.textContent.trim()));
  report(homeNames.length === 8, `${tag}: Home lists eight recipes`, `${homeNames.length}`);

  await page.goto(servers.appUrl + '/notebook', { waitUntil: 'networkidle' });
  await page.waitForSelector('.nb__row');
  const notebookNames = await page.evaluate(() => [...document.querySelectorAll('.nb__row .nb__name')].map((node) => node.textContent.trim()));
  report(
    notebookNames.length === homeNames.length && notebookNames.every((name, i) => name === homeNames[i]),
    `${tag}: /notebook lists the same recipes in Home's order`,
    notebookNames.join(' | '),
  );

  await page.goto(servers.appUrl + '/ingredients', { waitUntil: 'networkidle' });
  await page.waitForSelector('.ing__row');
  // A tap in Name, then Tab, reaches the Category select.
  await page.tap('input.ink-field');
  await page.keyboard.press('Tab');
  const tabbedTo = await page.evaluate(() => document.activeElement?.tagName);
  report(tabbedTo === 'SELECT', `${tag}: Tab after a tap in Name reaches the Category select`, `${tabbedTo}`);

  // Typing milk and choosing a category filter, then an entry's Basis and Source.
  await page.fill('input.ink-field', 'milk');
  await page.selectOption('select', 'dairy');
  const filtered = await page.evaluate(() => document.querySelector('p.ing__count')?.textContent);
  report(/^\d+ of \d+ ingredients$/.test(filtered ?? ''), `${tag}: typing milk and choosing Dairy narrows the list`, `${filtered}`);
  await page.fill('input.ink-field', '');
  await page.selectOption('select', 'All');
  await openHeavyCream(page);
  const detail = await page.evaluate(() => ({
    heads: [...document.querySelectorAll('.ing__detail th[scope="col"]')].map((node) => node.textContent.trim()),
    basis: [...document.querySelectorAll('.ing__detail .ing__basis')].map((node) => node.textContent.trim()),
    source: [...document.querySelectorAll('.ing__detail .ing__source')].map((node) => node.textContent.trim()),
  }));
  report(
    detail.heads.includes('Basis') && detail.heads.includes('Source') && detail.basis.length > 0 && detail.basis.every((text) => text !== '') && detail.source.length === detail.basis.length && detail.source.every((text) => text !== ''),
    `${tag}: an open entry shows its Basis and Source`,
    `${detail.basis.length} figures, first basis "${detail.basis[0]}"`,
  );

  // The olive oil 2 Aug batch reads Sweetness 4 and Oil 4.
  await page.goto(servers.appUrl + AUG_BATCH_ROUTE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.tasting-reading__axes');
  const cells = await page.evaluate(() => [...document.querySelectorAll('.tasting-reading__axes .batch-row__cell')].map((node) => node.textContent.trim()));
  report(
    cells.includes('Sweetnessmore (4)') && cells.includes('Oilstrong (4)'),
    `${tag}: the olive oil 2 Aug batch reads Sweetness 4 and Oil 4`,
    cells.join(' | '),
  );
  await context.close();
}

// ---------------------------------------------------------------------------
// --evidence: the built place and the board panel, side by side, at one width.
// ---------------------------------------------------------------------------
const BOARD_FILE = { notebook: 'notebook-place.html', ingredients: 'ingredients-place.html' };

// [place, state, width, board panel class, what the pair shows]
const PAIRS = [
  ['notebook', 'list', 1366, 'pn1', 'the seeded recipes, full page'],
  ['notebook', 'list', 393, 'pn2', 'first screen'],
  ['ingredients', 'open', 1366, 'pi1', 'the 26 entries, Heavy cream open, full page'],
  ['ingredients', 'top', 393, 'pi2', 'first screen; Heavy cream is open, below the fold, as the board draws it'],
  ['ingredients', 'open', 393, 'pi3', 'scrolled so Heavy cream sits where the board draws it'],
  ['ingredients', 'milk', 1366, 'pi7', 'Name typed: milk'],
  ['ingredients', 'milk', 393, 'pi8', 'Name typed: milk, first screen'],
];

async function visitLinkedRoutes(page) {
  const hrefs = new Set();
  for (const route of ['/notebook', '/ingredients']) {
    await page.goto(servers.appUrl + route, { waitUntil: 'networkidle' });
    await page.waitForSelector('.place__title');
    const found = await page.evaluate(() =>
      [...document.querySelectorAll('a[href^="/"]')].map((anchor) => anchor.getAttribute('href')),
    );
    for (const href of found) hrefs.add(href);
  }
  for (const href of hrefs) {
    await page.goto(servers.appUrl + href, { waitUntil: 'networkidle' });
  }
  return [...hrefs];
}

async function openHeavyCream(page) {
  const row = page.locator('.ing__row', { hasText: 'Heavy cream' }).first();
  await row.locator('.ing__head').click();
  await page.waitForSelector('.ing__detail');
}

async function evidence(dir) {
  await mkdir(dir, { recursive: true });
  const boardContext = await browser.newContext({ viewport: { width: 2400, height: 1400 } });
  await boardContext.route('**/*', (request) => (request.request().url().startsWith('file:') ? request.continue() : request.abort()));
  const boards = {};
  for (const [place, file] of Object.entries(BOARD_FILE)) {
    boards[place] = await boardContext.newPage();
    await boards[place].goto(pathToFileURL(path.join(BOARDS, file)).href);
    await boards[place].evaluate(() => document.fonts.ready);
  }
  const lines = [];
  for (const width of [1366, 393]) {
    const context = await newContext(width);
    const page = await context.newPage();
    await page.goto(servers.appUrl + '/ingredients', { waitUntil: 'networkidle' });
    await page.waitForSelector('.place__title');
    await useOriginalLibrary(page);
    const visited = await visitLinkedRoutes(page);
    console.log(`evidence ${width}: visited ${visited.length} linked routes before the pictures`);

    // Per-name closed-row heights against the board: the 25 closed rows (Heavy
    // cream is open on both of its first panels), built and drawn.
    const boardPanel = width === 1366 ? 'pi1' : 'pi2';
    const boardRows = await boards.ingredients.evaluate((panelClass) =>
      [...document.querySelectorAll(`.${panelClass} .ing__row`)].map((row) => [
        row.querySelector('.ing__name')?.textContent,
        row.getBoundingClientRect().height,
        Boolean(row.querySelector('.ing__detail')),
      ]),
    boardPanel);
    await page.goto(servers.appUrl + '/ingredients', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ing__row');
    const appRows = await page.evaluate(() =>
      [...document.querySelectorAll('.ing__row')].map((row) => [row.querySelector('.ing__name')?.textContent, row.getBoundingClientRect().height]),
    );
    const appByName = new Map(appRows);
    const compared = boardRows.filter(([, , isOpen]) => !isOpen);
    const off = compared.filter(([name, h]) => !appByName.has(name) || !near(appByName.get(name), h));
    report(
      compared.length === 25 && off.length === 0,
      `Ingredients ${width}: every closed row has the board's height, by name`,
      off.length === 0 ? `${compared.length} rows` : off.map(([name, h]) => `${name} board ${fmt(h)} app ${fmt(appByName.get(name))}`).join('; '),
    );

    for (const [place, state, pairWidth, panel, shows] of PAIRS.filter((pair) => pair[2] === width)) {
      const boardPage = boards[place];
      const panelBox = boardPage.locator(`.p4-win.${panel}`);
      const boardSize = await panelBox.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return { w: rect.width, h: rect.height };
      });
      // A 1366 picture is the full page, in a window as tall as the board's
      // panel, so a short page is not padded to the default window's height.
      if (width === 1366) await page.setViewportSize({ width, height: Math.round(boardSize.h) });
      await page.goto(servers.appUrl + `/${place}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.place__title');
      await page.evaluate(() => document.fonts.ready);
      let scrollTo = 0;
      if (place === 'ingredients' && (state === 'open' || state === 'top')) {
        await openHeavyCream(page);
        if (width === 393 && state === 'open') {
          // Scroll the built page so Heavy cream's row sits where the board draws it.
          const boardTop = await boardPage.evaluate((panelClass) => {
            const win = document.querySelector(`.p4-win.${panelClass}`).getBoundingClientRect().top;
            const row = [...document.querySelectorAll(`.p4-win.${panelClass} .ing__row`)].find((r) => r.textContent.includes('Heavy cream'));
            return row.getBoundingClientRect().top - win;
          }, panel);
          const appTop = await page.evaluate(() => {
            const row = [...document.querySelectorAll('.ing__row')].find((r) => r.textContent.includes('Heavy cream'));
            return row.getBoundingClientRect().top + window.scrollY;
          });
          scrollTo = Math.max(0, Math.round(appTop - boardTop));
          await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
        }
      }
      if (state === 'top') await page.evaluate(() => window.scrollTo(0, 0));
      if (state === 'milk') {
        await page.fill('input.ink-field', 'milk');
        // The boards draw the field at rest, not with its focus ring.
        await page.evaluate(() => document.activeElement?.blur());
      }
      await page.waitForTimeout(150);
      const base = `${place}-${state}-${pairWidth}`;
      await page.screenshot({ path: path.join(dir, `${base}-app.png`), fullPage: width === 1366 });
      await panelBox.screenshot({ path: path.join(dir, `${base}-board.png`) });
      const appSize = await page.evaluate(() => ({ w: window.innerWidth, h: document.documentElement.scrollHeight }));
      lines.push(
        `| ${place} | ${state} | ${pairWidth} | ${shows} | \`${base}-app.png\` | \`${base}-board.png\` (${BOARD_FILE[place]}, panel \`${panel}\`) | app ${appSize.w} by ${width === 1366 ? appSize.h : 852}${scrollTo ? `, scrolled ${scrollTo}` : ''}; board ${fmt(boardSize.w)} by ${fmt(boardSize.h)} |`,
      );
      console.log(`evidence ${base}`);
    }
    await context.close();
  }
  await boardContext.close();
  const readme = [
    '# Phase 9 places: side-by-side evidence',
    '',
    'Written by `09-places-check.mjs --library original --evidence <this directory>` (plan 09-16).',
    'The built app (WebKit, coarse pointer, the library store rewritten to data/library.js\'s 26 entries,',
    'every route the places link to visited first in the same context) beside the matching panel of',
    'sketch 012\'s boards (.planning/sketches/012-places/), at the same width. A 1366 app picture is the',
    'full page; a 393 picture is the first screen (852 tall), as the board draws it.',
    '',
    '| Place | State | Width | Shows | App | Board | Sizes |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...lines,
    '',
    'A verdict per pair, from looking at both, is recorded in plan 09-16\'s SUMMARY.md.',
    '',
  ].join('\n');
  await writeFile(path.join(dir, 'README.md'), readme);
}

try {
  for (const width of [1366, 393]) {
    await checkNotebook(width);
    await checkIngredients(width);
  }
  const widths = [393, 724, 834, 1024, 1100, 1366, 1590];
  await checkOverflow('/notebook', widths);
  await checkOverflow('/ingredients', widths);
  if (LIBRARY_MODE === 'current') await checkDeviceSteps();
  if (EVIDENCE_DIR) await evidence(path.resolve(EVIDENCE_DIR));
} finally {
  await browser.close();
  await servers.close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 || passes === 0 ? 1 : 0);
