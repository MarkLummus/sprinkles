// Quick task 261002-wmy's probe: the "Go to batch" row in the recipe band below
// 724 (sketch 011 decision 30; 393-phone-log.html and 723-phone-log.html).
// Measures the BUILT app (app/dist) in Playwright's WebKit and system Chrome,
// before and after the change, and against both boards.
//
//   node 261002-wmy-probe.mjs baseline        (build of the unchanged source; writes the JSON)
//   node 261002-wmy-probe.mjs tracer          (webkit, 393 coarse, Coconut v2: the row, the jump, board panel p1)
//   node 261002-wmy-probe.mjs tracer,matrix   (every cell, both engines, keyboard, boards, guards)
//
// Serves the build and the repo through the 03.5 harness's own ephemeral
// 127.0.0.1 servers; never requests Mark's :4173 preview, the dev server or the
// sketch server on :8011, and starts no Vite process. Every non-127.0.0.1
// request is aborted. Nothing is saved. A reading here is evidence about two
// engines, not about Mark's iPhone or iPad; the device is his to check.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261002-wmy-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const near = (a, b, tol) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;
const round = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);

const RECIPES = [
  { id: 'olive', route: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', status: 'Tasted', board: 0 },
  { id: 'coconut-v2', route: '/notebook/coconut/coconut-v2', status: 'Awaiting tasting', board: 1 },
  { id: 'underbelly-v2', route: '/notebook/underbelly-light-base/underbelly-light-base-v2', status: 'Not yet churned', board: 2 },
];
const NO_BATCH_PROSE = 'Not yet churned. Print the sheet, make it, then record what happened.';

const PHONE = [
  { width: 320, height: 568, coarse: true },
  { width: 375, height: 667, coarse: true },
  { width: 393, height: 852, coarse: true },
  { width: 428, height: 926, coarse: true },
  { width: 723, height: 1024, coarse: true },
  { width: 723, height: 1024, coarse: false },
];
const GUARD = [
  { width: 724, height: 1024, coarse: false },
  { width: 744, height: 1024, coarse: true },
  { width: 1366, height: 1024, coarse: false },
];
const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

const cellKey = (engine, w, recipe) => `${engine}|${w.width}|${w.coarse ? 'coarse' : 'fine'}|${recipe.id}`;

// ---------------------------------------------------------------------------
async function openAppPage(browser, appUrl, route, { width, height, coarse }) {
  const options = coarse
    ? { ...devices['iPhone 14'], viewport: { width, height }, screen: { width, height } }
    : { viewport: { width, height } };
  const context = await browser.newContext(options);
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook-band');
  await page.waitForSelector('h2.notebook-version__identity');
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openAppPage: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  await settle(page);
  return { context, page };
}

// Fonts, two frames, and the store read: the status and the band's Version
// block read the batches after mount.
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.waitForTimeout(300);
}

// ---------------------------------------------------------------------------
// In-page readers (passed to page.evaluate).
function readBand() {
  const band = document.querySelector('.notebook-band');
  const history = document.querySelector('section.notebook-history');
  const grid = document.querySelector('.notebook-band__grid');
  return {
    bandHeight: band.getBoundingClientRect().height,
    historyTop: history.getBoundingClientRect().top + window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    gridShown: [...grid.children].filter((el) => getComputedStyle(el).display !== 'none').length,
    jumpCount: document.querySelectorAll('a.notebook-jump').length,
  };
}

// The row, read the same way on the app and on a board. x is measured from the
// row's own .shell; gaps from its previous sibling and its parent's next
// sibling (the Version block and History on both).
function readRow({ kind, href }) {
  const row = kind === 'app' ? document.querySelector('a.notebook-jump') : document.querySelector(`a[href="${href}"]`);
  if (!row) return null;
  const shell = row.closest('.shell');
  const r = row.getBoundingClientRect();
  const s = shell.getBoundingClientRect();
  const prev = row.previousElementSibling.getBoundingClientRect();
  const next = row.parentElement.nextElementSibling.getBoundingClientRect();
  const parent = row.parentElement.getBoundingClientRect();
  const [control, status] = [...row.children];
  const spanRead = (el) => {
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      left: b.left - r.left,
      right: r.right - b.right,
      width: b.width,
      height: b.height,
      centre: b.top + b.height / 2 - r.top,
      text: el.textContent,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      color: cs.color,
      decoration: cs.textDecorationLine,
      underlineOffset: cs.textUnderlineOffset,
      lineHeight: cs.lineHeight,
    };
  };
  return {
    x: r.left - s.left,
    xInParent: r.left - parent.left,
    width: r.width,
    parentWidth: parent.width,
    height: r.height,
    gapAbove: r.top - prev.bottom,
    gapBelow: next.top - r.bottom,
    display: getComputedStyle(row).display,
    rect: { width: r.width, height: r.height },
    prevIsVersion: row.previousElementSibling.matches('section.notebook-version'),
    parentIsGrid: row.parentElement.matches('.notebook-band__grid'),
    ariaLabel: row.getAttribute('aria-label'),
    href: row.getAttribute('href'),
    tabindex: row.getAttribute('tabindex'),
    children: row.children.length,
    control: spanRead(control),
    status: spanRead(status),
  };
}

function readHits() {
  const row = document.querySelector('a.notebook-jump');
  row.scrollIntoView({ block: 'center' });
  const r = row.getBoundingClientRect();
  const pts = [
    [r.left + 2, r.top + 2],
    [r.right - 2, r.top + 2],
    [r.left + 2, r.bottom - 2],
    [r.right - 2, r.bottom - 2],
    [r.left + r.width / 2, r.top + r.height / 2],
  ];
  return pts.map(([x, y]) => document.elementFromPoint(x, y)?.closest('a.notebook-jump') === row);
}

function readLanding(proseText) {
  const h = document.getElementById('batch');
  if (!h) return null;
  const b = h.getBoundingClientRect();
  const tabs = document.querySelector('.shell__tabs');
  const tabsShown = tabs && getComputedStyle(tabs).display !== 'none';
  const floor = tabsShown ? tabs.getBoundingClientRect().top : window.innerHeight;
  const within = (el) => {
    if (!el) return null;
    const e = el.getBoundingClientRect();
    return { top: e.top, bottom: e.bottom, ok: e.top >= 0 && e.bottom <= floor, w: e.width, h: e.height };
  };
  const log = document.querySelector('.notebook-log');
  const prose = log && [...log.querySelectorAll('p')].find((p) => p.textContent.trim() === proseText);
  const record = log && [...log.querySelectorAll('button')].find((el) => el.textContent.trim() === 'Record a batch');
  return {
    activeId: document.activeElement?.id,
    text: h.textContent.trim(),
    landing: h.classList.contains('is-landing-focus'),
    heading: within(h),
    floor,
    tabsShown: !!tabsShown,
    prose: within(prose),
    record: within(record),
  };
}

// ---------------------------------------------------------------------------
async function waitForStatus(page, expected) {
  await page.waitForFunction(
    (want) => document.querySelector('a.notebook-jump .notebook-jump__status')?.textContent === want,
    expected,
    { timeout: 5000 },
  );
}

async function waitStable(page) {
  // A focus() scroll can animate; wait until scrollY holds for four frames.
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = -1;
        let same = 0;
        const tick = () => {
          const y = window.scrollY;
          same = y === last ? same + 1 : 0;
          last = y;
          if (same >= 4) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );
}

// Everything a phone cell must show on the app, then the jump.
async function phoneCellChecks(page, label, recipe, base, coarse) {
  await waitForStatus(page, recipe.status);
  const row = await page.evaluate(readRow, { kind: 'app', href: null });
  countedCheck(row !== null, `${label}: the row exists`);
  if (!row) return null;
  countedCheck(row.display === 'flex', `${label}: row display ${row.display} (want flex)`);
  countedCheck(row.prevIsVersion && row.parentIsGrid, `${label}: row follows section.notebook-version inside .notebook-band__grid`);
  countedCheck(row.children === 2 && row.control.text === 'Go to batch', `${label}: control word "${row.control.text}"`);
  countedCheck(row.status.text === recipe.status, `${label}: status "${row.status.text}" (want ${recipe.status})`);
  countedCheck(row.ariaLabel === `Go to batch, ${recipe.status}`, `${label}: aria-label "${row.ariaLabel}"`);
  countedCheck(row.href === '#batch' && row.tabindex === '0', `${label}: href ${row.href}, tabindex ${row.tabindex}`);
  countedCheck(near(row.height, 44, 0.5), `${label}: height ${row.height} (want 44)`);
  countedCheck(near(row.xInParent, 0, 0.5) && near(row.width, row.parentWidth, 0.5), `${label}: x ${row.xInParent} width ${row.width} against the grid ${row.parentWidth}`);
  countedCheck(near(row.gapAbove, 20, 0.5), `${label}: gap above ${row.gapAbove} (want 20)`);
  countedCheck(near(row.gapBelow, 20, 0.5), `${label}: gap below ${row.gapBelow} (want 20)`);
  for (const [name, span] of [['control', row.control], ['status', row.status]]) {
    const lh = parseFloat(span.lineHeight) || parseFloat(span.fontSize) * 1.3;
    countedCheck(span.height < 1.5 * lh, `${label}: ${name} height ${span.height} on one line (line-height ${lh})`);
    countedCheck(near(span.centre, row.height / 2, 1), `${label}: ${name} centre ${span.centre} against the row's ${row.height / 2}`);
  }
  countedCheck(near(row.status.right, 0, 0.5), `${label}: status right offset ${row.status.right} (want 0)`);
  const hits = await page.evaluate(readHits);
  countedCheck(hits.every(Boolean), `${label}: five hit points resolve to the row (${hits})`);
  await page.evaluate(() => window.scrollTo(0, 0));
  const band = await page.evaluate(readBand);
  const dBand = band.bandHeight - base.bandHeight;
  const dHist = band.historyTop - base.historyTop;
  const dPage = band.scrollHeight - base.scrollHeight;
  countedCheck(near(dBand, 64, 0.5), `${label}: band height +${round(dBand)} (want +64)`);
  countedCheck(near(dHist, 64, 0.5), `${label}: History top +${round(dHist)} (want +64)`);
  countedCheck(near(dPage, 64, 0.5), `${label}: page height +${round(dPage)} (want +64)`);
  countedCheck(band.overflow === base.overflow && band.overflow <= 0, `${label}: overflow ${band.overflow} vs baseline ${base.overflow}`);
  countedCheck(band.gridShown === base.gridShown + 1, `${label}: displayed grid children ${band.gridShown} vs baseline ${base.gridShown} + 1`);

  // The jump.
  const urlBefore = await page.evaluate(() => ({ href: location.href, length: history.length }));
  const locator = page.locator('a.notebook-jump');
  if (coarse) await locator.tap();
  else await locator.click();
  await page.waitForFunction(() => document.activeElement?.id === 'batch', null, { timeout: 5000 });
  await waitStable(page);
  const land = await page.evaluate(readLanding, NO_BATCH_PROSE);
  countedCheck(land && land.text === 'Batch' && land.activeId === 'batch', `${label}: focus on the Batch heading (${land?.activeId})`);
  countedCheck(land?.landing === true, `${label}: the heading carries is-landing-focus`);
  countedCheck(land?.heading?.ok, `${label}: heading fully visible above the floor ${land?.floor}: ${JSON.stringify(land?.heading)}`);
  const urlAfter = await page.evaluate(() => ({ href: location.href, length: history.length }));
  countedCheck(urlAfter.href === urlBefore.href && urlAfter.length === urlBefore.length, `${label}: URL and history unchanged (${urlBefore.href} ${urlBefore.length} -> ${urlAfter.href} ${urlAfter.length})`);
  if (recipe.id === 'underbelly-v2') {
    countedCheck(land?.prose?.ok, `${label}: no-batch prose fully visible after the jump: ${JSON.stringify(land?.prose)} floor ${land?.floor}`);
    countedCheck(land?.record?.ok, `${label}: Record a batch fully visible after the jump: ${JSON.stringify(land?.record)} floor ${land?.floor}`);
  }
  return { row, band, land };
}

const BOARD_SPANS = ['left', 'width', 'centre'];
function compareRowToBoard(label, app, board) {
  countedCheck(board !== null && app !== null, `${label}: both rows read`);
  if (!app || !board) return;
  countedCheck(near(app.x, board.x, 0.5), `${label}: x from the shell ${round(app.x)} vs ${round(board.x)}`);
  countedCheck(near(app.width, board.width, 0.5), `${label}: width ${round(app.width)} vs ${round(board.width)}`);
  countedCheck(near(app.height, board.height, 0.5), `${label}: height ${round(app.height)} vs ${round(board.height)}`);
  countedCheck(near(app.gapAbove, board.gapAbove, 0.5), `${label}: gap above ${round(app.gapAbove)} vs ${round(board.gapAbove)}`);
  countedCheck(near(app.gapBelow, board.gapBelow, 0.5), `${label}: gap below ${round(app.gapBelow)} vs ${round(board.gapBelow)}`);
  for (const key of BOARD_SPANS) {
    countedCheck(near(app.control[key], board.control[key], 0.5), `${label}: control ${key} ${round(app.control[key])} vs ${round(board.control[key])}`);
  }
  for (const key of ['right', 'width', 'centre']) {
    countedCheck(near(app.status[key], board.status[key], 0.5), `${label}: status ${key} ${round(app.status[key])} vs ${round(board.status[key])}`);
  }
  for (const [name] of [['control'], ['status']]) {
    for (const key of ['fontSize', 'fontWeight', 'color', 'decoration', 'underlineOffset', 'text']) {
      countedCheck(app[name][key] === board[name][key], `${label}: ${name} ${key} "${app[name][key]}" vs "${board[name][key]}"`);
    }
  }
}

async function readBoardRow(page, panel) {
  return page.evaluate(readRow, { kind: 'board', href: `#batch-p${panel}` });
}

// ---------------------------------------------------------------------------
async function runBaseline(servers) {
  const results = {};
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      for (const w of [...PHONE, ...GUARD]) {
        for (const recipe of RECIPES) {
          const { context, page } = await openAppPage(browser, servers.appUrl, recipe.route, w);
          try {
            const read = await page.evaluate(readBand);
            const key = cellKey(engine, w, recipe);
            countedCheck(read.jumpCount === 0, `${key}: precondition, no a.notebook-jump yet (found ${read.jumpCount})`);
            results[key] = read;
            console.log(JSON.stringify({ cell: key, band: round(read.bandHeight), historyTop: round(read.historyTop), scrollHeight: read.scrollHeight, overflow: read.overflow, gridShown: read.gridShown }));
          } finally {
            await context.close();
          }
        }
      }
    } finally {
      await browser.close();
    }
  }
  if (failures.length === 0) await writeFile(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
}

async function boardCompare(browser, servers, engine, file, w, appByRecipe) {
  const { context, page } = await openBoard(browser, servers.repoUrl, file);
  try {
    await page.evaluate(async () => document.fonts.ready);
    await page.waitForTimeout(300);
    for (const recipe of RECIPES) {
      const board = await readBoardRow(page, recipe.board);
      compareRowToBoard(`${engine} ${file} p${recipe.board} (${recipe.id})`, appByRecipe[recipe.id], board);
    }
    const p3 = await readBoardRow(page, 3);
    countedCheck(p3 && p3.status.text === 'Not yet churned', `${engine} ${file} p3: status "${p3?.status.text}"`);
  } finally {
    await context.close();
  }
}

async function runTracerAndMatrix(servers, groups) {
  const baseline = JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
  const matrix = groups.has('matrix');
  for (const [engine, make] of engines) {
    if (!matrix && engine !== 'webkit') continue;
    const browser = await make();
    try {
      // Phone cells (and the tracer: webkit, 393 coarse, Coconut v2).
      const appRows = {}; // `${width}|${coarse}` -> recipeId -> row
      for (const w of PHONE) {
        for (const recipe of RECIPES) {
          const isTracer = engine === 'webkit' && w.width === 393 && recipe.id === 'coconut-v2';
          if (!matrix && !isTracer) continue;
          const key = cellKey(engine, w, recipe);
          const base = baseline[key];
          countedCheck(base !== undefined, `${key}: baseline cell exists`);
          if (!base) continue;
          const { context, page } = await openAppPage(browser, servers.appUrl, recipe.route, w);
          try {
            const out = await phoneCellChecks(page, key, recipe, base, w.coarse);
            if (out) {
              (appRows[`${w.width}|${w.coarse}`] ??= {})[recipe.id] = out.row;
              console.log(JSON.stringify({ cell: key, status: out.row.status.text, height: round(out.row.height), gaps: [round(out.row.gapAbove), round(out.row.gapBelow)], delta: [round(out.band.bandHeight - base.bandHeight), round(out.band.historyTop - base.historyTop), round(out.band.scrollHeight - base.scrollHeight)], heading: out.land.heading && [round(out.land.heading.top), round(out.land.heading.bottom)], floor: out.land.floor }));
            }
          } finally {
            await context.close();
          }
        }
      }

      if (!matrix) {
        // Tracer board: panel p1 of 393-phone-log.html against Coconut v2 at 393 coarse.
        const { context, page } = await openBoard(browser, servers.repoUrl, '393-phone-log.html');
        try {
          await page.evaluate(async () => document.fonts.ready);
          await page.waitForTimeout(300);
          const board = await readBoardRow(page, 1);
          compareRowToBoard(`${engine} 393-phone-log.html p1 (coconut-v2)`, appRows['393|true']?.['coconut-v2'], board);
        } finally {
          await context.close();
        }
        continue;
      }

      // Keyboard.
      for (const w of [PHONE[2], PHONE[5]]) {
        for (const recipe of RECIPES) {
          const label = `${engine} keyboard ${w.width}${w.coarse ? 'c' : 'f'} ${recipe.id}`;
          const { context, page } = await openAppPage(browser, servers.appUrl, recipe.route, w);
          try {
            await page.evaluate(() => [...document.querySelectorAll('.notebook-version__acts button')].pop().focus());
            await page.keyboard.press('Tab');
            const first = await page.evaluate(() => document.activeElement?.matches('a.notebook-jump'));
            countedCheck(first === true, `${label}: Tab from the last act lands on the row`);
            await page.keyboard.press('Tab');
            const second = await page.evaluate(() => {
              const hist = document.querySelector('section.notebook-history');
              const a = document.activeElement;
              const histFocusable = hist.querySelector('button, a[href], [tabindex="0"]');
              if (histFocusable) return { inside: hist.contains(a), tag: a.tagName };
              return { inside: false, follows: !!(hist.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING) && !hist.contains(a), tag: a.tagName };
            });
            countedCheck(second.inside || second.follows, `${label}: second Tab leaves the row for History or past it (${JSON.stringify(second)})`);
          } finally {
            await context.close();
          }
          const again = await openAppPage(browser, servers.appUrl, recipe.route, w);
          try {
            await waitForStatus(again.page, recipe.status);
            await again.page.evaluate(() => document.querySelector('a.notebook-jump').focus());
            await again.page.keyboard.press('Enter');
            await again.page.waitForFunction(() => document.activeElement?.id === 'batch', null, { timeout: 5000 });
            countedCheck(true, `${label}: Enter on the row lands on #batch`);
          } catch (error) {
            countedCheck(false, `${label}: Enter on the row did not land on #batch (${error.message.split('\n')[0]})`);
          } finally {
            await again.context.close();
          }
        }
      }

      // Boards (rows read before any jump; the boards' own panels).
      const read393 = {};
      const read723 = {};
      for (const recipe of RECIPES) {
        for (const [store, w] of [[read393, PHONE[2]], [read723, PHONE[5]]]) {
          const { context, page } = await openAppPage(browser, servers.appUrl, recipe.route, w);
          try {
            await waitForStatus(page, recipe.status);
            store[recipe.id] = await page.evaluate(readRow, { kind: 'app', href: null });
          } finally {
            await context.close();
          }
        }
      }
      await boardCompare(browser, servers, engine, '393-phone-log.html', PHONE[2], read393);
      await boardCompare(browser, servers, engine, '723-phone-log.html', PHONE[5], read723);

      // Guards.
      for (const w of GUARD) {
        for (const recipe of RECIPES) {
          const key = cellKey(engine, w, recipe);
          const base = baseline[key];
          countedCheck(base !== undefined, `${key}: baseline cell exists`);
          if (!base) continue;
          const { context, page } = await openAppPage(browser, servers.appUrl, recipe.route, w);
          try {
            const row = await page.evaluate(readRow, { kind: 'app', href: null });
            countedCheck(row !== null && row.display === 'none' && row.rect.width === 0 && row.rect.height === 0, `${key}: row is display none with a 0x0 rect (${JSON.stringify(row && { d: row.display, r: row.rect })})`);
            await page.evaluate(() => [...document.querySelectorAll('.notebook-version__acts button')].pop().focus());
            await page.keyboard.press('Tab');
            const onRow = await page.evaluate(() => document.activeElement?.matches('a.notebook-jump'));
            countedCheck(onRow === false, `${key}: Tab from the last act does not land on the row`);
            await page.evaluate(() => window.scrollTo(0, 0));
            const band = await page.evaluate(readBand);
            countedCheck(near(band.bandHeight, base.bandHeight, 0.5), `${key}: band height ${band.bandHeight} vs ${base.bandHeight}`);
            countedCheck(near(band.historyTop, base.historyTop, 0.5), `${key}: History top ${band.historyTop} vs ${base.historyTop}`);
            countedCheck(near(band.scrollHeight, base.scrollHeight, 0.5), `${key}: page height ${band.scrollHeight} vs ${base.scrollHeight}`);
            countedCheck(band.overflow === base.overflow, `${key}: overflow ${band.overflow} vs ${base.overflow}`);
            countedCheck(band.gridShown === base.gridShown, `${key}: displayed grid children ${band.gridShown} vs ${base.gridShown}`);
            console.log(JSON.stringify({ guard: key, display: row?.display, band: [round(base.bandHeight), round(band.bandHeight)], historyTop: [round(base.historyTop), round(band.historyTop)], scrollHeight: [base.scrollHeight, band.scrollHeight] }));
          } finally {
            await context.close();
          }
        }
      }
    } finally {
      await browser.close();
    }
  }
}

// ---------------------------------------------------------------------------
const groups = new Set((process.argv[2] ?? '').split(',').filter(Boolean));
if (groups.size === 0 || [...groups].some((g) => !['baseline', 'tracer', 'matrix'].includes(g))) {
  console.log('usage: node 261002-wmy-probe.mjs baseline | tracer | tracer,matrix');
  process.exit(2);
}
const servers = await startServers();
try {
  if (groups.has('baseline')) await runBaseline(servers);
  else await runTracerAndMatrix(servers, groups);
} finally {
  await servers.close();
}
finish(failures, count, `261002-wmy probe (${[...groups].join(',')})`);
