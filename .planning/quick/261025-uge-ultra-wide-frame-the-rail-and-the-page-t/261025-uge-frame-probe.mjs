// Quick 261025-uge: the ultra-wide frame, measured in Playwright WebKit and Google Chrome on scratch builds
// (sketch 011 decision 59; decide-ultrawide-frame centred, decide-ultrawide-lists fill, Mark 2026-10-26).
// Two modes. "record" measures the shell, the list pages, the notebook routes and the Import error panel of one
// build at 393, 1366, 1600, 1770, 1920, 2560 and 3440. "compare" gates an after record against a before record:
// nothing moves at 1770 and below, everything shifts by (W - 1770) / 2 above it, decision 59's 2560 numbers
// hold, the Import error panel stays under Import, and nothing overflows horizontally.
//
// Usage (from the repo root), after building the base and the change to scratch directories:
//   S="${TMPDIR:-/tmp}/sprinkles-uge"
//   npm --prefix app run build -- --outDir "$S/before" --emptyOutDir        # on the unmodified tree
//   npm --prefix app run build -- --outDir "$S/after" --emptyOutDir         # on the changed tree
//   P=.planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs
//   PROBE_DIST="$S/before" node $P record "$S/before.json"
//   PROBE_DIST="$S/after" node $P record "$S/after.json"
//   node $P compare "$S/before.json" "$S/after.json"
// Optional filters for record: PROBE_ENGINES (webkit,chrome), PROBE_WIDTHS, PROBE_ROUTES (all comma lists).
//
// It starts no Vite server, never contacts 4173 or 8077, and never reads or writes app/dist unless PROBE_DIST
// points there. The build is served on an ephemeral 127.0.0.1 port through 08-walk-server.mjs, and every
// request to a host other than 127.0.0.1 is aborted. playwright-core is loaded only through PLAYWRIGHT_CORE
// (default: the npx cache path below). Each width gets a fresh context { deviceScaleFactor 1, fine pointer,
// 1000 tall }. Prints PASS or FAIL per gate, INFO lines (not counted), and ends "N PASS, M FAIL" (exit 1 when
// M is above 0) in compare mode.
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const mode = process.argv[2];
const info = (line) => console.log(`INFO ${line}`);

const R1 = (n) => Math.round(n * 10) / 10;

const OO = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const ALL_ENGINES = ['webkit', 'chrome'];
const ALL_WIDTHS = [393, 1366, 1600, 1770, 1920, 2560, 3440];
const ALL_ROUTES = ['home', 'notebook', 'ingredients', 'recipe', 'print', 'creation'];

const SHELL_BOXES = {
  head: '.shell__head',
  brand: '.shell__brand',
  tools: '.shell__tools',
  body: '.shell__body',
  rail: '.shell__rail',
  nav: '.shell__rail a',
  main: '.shell__main',
  tabs: '.shell__tabs',
};
const ROUTES = {
  home: {
    path: '/',
    ready: '.home__row',
    boxes: { listPage: '.list-page', lead: '.home__lead', row: '.home__row', tally: '.home__tally' },
  },
  notebook: { path: '/notebook', ready: '.nb__row', boxes: { listPage: '.list-page', row: '.nb__row' } },
  ingredients: { path: '/ingredients', ready: '.ing__row', boxes: { listPage: '.list-page', row: '.ing__row' } },
  recipe: {
    path: OO,
    ready: '.recipe-page',
    boxes: { notebook: '.notebook', band: '.notebook-band', sheet: '.recipe-page', log: '.notebook-log' },
  },
  print: {
    path: `${OO}/print`,
    ready: '.print-page',
    boxes: { notebook: '.notebook', printHead: '.print-route__head', printPage: '.print-page' },
  },
  creation: {
    path: null,
    ready: '.notebook.mk-page',
    boxes: { notebook: '.notebook', band: '.notebook-band', sheet: '.recipe-page', log: '.notebook-log' },
  },
};
const SHELL_SHIFT = ['body', 'rail', 'nav', 'main', 'brand', 'tools'];
const LIST_ROUTES = ['home', 'notebook', 'ingredients'];
const NOTEBOOK_ROUTES = ['recipe', 'print', 'creation'];

const list = (name, fallback) => (process.env[name] ? process.env[name].split(',').map((s) => s.trim()) : fallback);

// Runs in the page: the first match's box for every selector, rounded to 0.1, null when absent.
function measureInPage(selectors) {
  const out = {};
  for (const [name, sel] of Object.entries(selectors)) {
    const e = document.querySelector(sel);
    if (!e) {
      out[name] = null;
      continue;
    }
    const r = e.getBoundingClientRect();
    out[name] = {
      l: Math.round(r.left * 10) / 10,
      r: Math.round(r.right * 10) / 10,
      w: Math.round(r.width * 10) / 10,
    };
  }
  return {
    boxes: out,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

async function settle(page, readySelector) {
  await page.waitForSelector(readySelector, { timeout: 10000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
}

async function clickUntil(page, target, doneTest, label) {
  for (let i = 0; i < 5; i += 1) {
    await target().click({ timeout: 5000 });
    try {
      await doneTest();
      return;
    } catch {
      // a first click after a navigation often misses; try again
    }
  }
  throw new Error(`${label}: never completed`);
}

async function openCreation(page, appUrl) {
  await page.goto(`${appUrl}/notebook`);
  await page.waitForSelector('.nb__row', { timeout: 10000 });
  await page.evaluate(() => document.fonts.ready);
  const entry = page.getByRole('button', { name: 'New recipe' });
  try {
    await entry.first().waitFor({ state: 'visible', timeout: 3000 });
  } catch {
    return false;
  }
  await clickUntil(page, () => entry.first(), () => page.waitForSelector('input[aria-label="Name"]', { timeout: 1500 }), 'New recipe');
  await page.fill('input[aria-label="Name"]', 'Vanilla');
  await clickUntil(
    page,
    () => page.getByRole('button', { name: 'Start' }).first(),
    () => page.waitForURL((u) => u.pathname === '/notebook/new', { timeout: 1500 }),
    'Start',
  );
  return true;
}

async function record(outFile) {
  const dist = process.env.PROBE_DIST;
  if (!dist || !existsSync(path.join(dist, 'index.html'))) {
    console.log('FAIL PROBE_DIST must name a directory holding index.html (a scratch build)');
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
  const { webkit, chromium } = await import(PLAYWRIGHT_CORE);
  const engines = list('PROBE_ENGINES', ALL_ENGINES);
  const widths = list('PROBE_WIDTHS', ALL_WIDTHS).map(Number);
  const routes = list('PROBE_ROUTES', ALL_ROUTES);
  const servers = await startServers({ appRoot: path.resolve(dist) });
  const records = {};
  const recorded = [];
  try {
    for (const engine of engines) {
      let browser;
      if (engine === 'webkit') browser = await webkit.launch();
      else {
        try {
          browser = await chromium.launch({ channel: 'chrome' });
        } catch (e) {
          info(`chrome unavailable: ${e.message.split('\n')[0]}`);
          continue;
        }
      }
      recorded.push(engine);
      for (const W of widths) {
        const context = await browser.newContext({ viewport: { width: W, height: 1000 }, deviceScaleFactor: 1 });
        await context.route('**/*', (route) => {
          const host = new URL(route.request().url()).hostname;
          return host === '127.0.0.1' ? route.continue() : route.abort();
        });
        const page = await context.newPage();
        try {
          for (const route of routes) {
            const spec = ROUTES[route];
            let present = true;
            if (route === 'creation') present = await openCreation(page, servers.appUrl);
            else await page.goto(`${servers.appUrl}${spec.path}`);
            if (present) await settle(page, spec.ready);
            const selectors = { ...SHELL_BOXES, ...spec.boxes };
            const rec = await page.evaluate(measureInPage, selectors);
            if (!present) info(`${engine}|${W}|${route}: no New recipe entry at this width, recorded as measured`);
            records[`${engine}|${W}|${route}`] = rec;
            info(
              `${engine}|${W}|${route} body ${rec.boxes.body?.l}-${rec.boxes.body?.r} main ${rec.boxes.main?.l}-${rec.boxes.main?.r} overflow ${rec.overflow}`,
            );
            if (route === 'home') {
              await page.goto(`${servers.appUrl}/`);
              await settle(page, '.home__row');
              await page.setInputFiles('.shell__file-input', {
                name: 'bad.json',
                mimeType: 'application/json',
                buffer: Buffer.from('not json'),
              });
              try {
                await page.waitForSelector('.shell__import-errors', { timeout: 3000 });
                await page.waitForTimeout(200);
                const p = await page.evaluate(measureInPage, { panel: '.shell__import-errors', tools: '.shell__tools' });
                records[`panel|${engine}|${W}`] = p.boxes;
                info(`panel|${engine}|${W} panel r ${p.boxes.panel?.r} tools r ${p.boxes.tools?.r}`);
              } catch {
                records[`panel|${engine}|${W}`] = null;
                info(`panel|${engine}|${W} did not appear`);
              }
            }
          }
        } finally {
          await context.close();
        }
      }
      await browser.close();
    }
  } finally {
    await servers.close();
  }
  writeFileSync(
    outFile,
    JSON.stringify({ meta: { dist, engines: recorded, widths, routes, recordedAt: new Date().toISOString() }, records }, null, 1),
  );
  info(`wrote ${outFile} with ${Object.keys(records).length} records`);
}

// ---------------------------------------------------------------- compare

let passes = 0;
let failures = 0;
const gate = (ok, line) => {
  if (ok) passes += 1;
  else failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${line}`);
};

const near = (a, b, tol) => a != null && b != null && Math.abs(a - b) <= tol;

// First difference between two box maps, shifted by dx; null when equal within tol.
function firstDiff(afterBoxes, beforeBoxes, names, dx, tol) {
  for (const n of names) {
    const a = afterBoxes[n];
    const b = beforeBoxes[n];
    if (a == null && b == null) continue;
    if (a == null || b == null) return `${n}: after ${JSON.stringify(a)} vs before ${JSON.stringify(b)}`;
    if (!near(a.l, b.l + dx, tol) || !near(a.r, b.r + dx, tol) || !near(a.w, b.w, tol)) {
      return `${n}: after ${a.l}-${a.r} (w ${a.w}) vs before ${b.l}-${b.r} (w ${b.w}) shifted by ${dx}`;
    }
  }
  return null;
}

function compare(beforeFile, afterFile) {
  const before = JSON.parse(readFileSync(beforeFile, 'utf8')).records;
  const after = JSON.parse(readFileSync(afterFile, 'utf8')).records;
  const keys = Object.keys(after);

  for (const key of keys) {
    if (!(key in before)) {
      gate(false, `present ${key}: missing from the before record`);
      continue;
    }
    const parts = key.split('|');
    const isPanel = parts[0] === 'panel';
    const engine = isPanel ? parts[1] : parts[0];
    const W = Number(isPanel ? parts[2] : parts[1]);
    const route = isPanel ? 'panel' : parts[2];
    const a = after[key];
    const b = before[key];
    const label = `${engine}|${W}|${route}`;

    // same: at 1770 and below nothing moves
    if (W <= 1770) {
      const ok = JSON.stringify(a) === JSON.stringify(b);
      let detail = '';
      if (!ok && a && b) {
        const aBoxes = a.boxes ?? a;
        const bBoxes = b.boxes ?? b;
        detail = ` ${firstDiff(aBoxes, bBoxes, Object.keys({ ...aBoxes, ...bBoxes }), 0, 0) ?? `overflow ${a.overflow} vs ${b.overflow}`}`;
      }
      gate(ok, `same ${label} equals the base build${detail}`);
    }

    // shift: above 1770 everything moves right by L
    if (!isPanel && W > 1770) {
      const L = (W - 1770) / 2;
      const base1770 = before[`${engine}|1770|${route}`];
      if (!base1770) {
        gate(false, `shift ${label}: before has no ${engine}|1770|${route}`);
      } else {
        const names = [...SHELL_SHIFT];
        if (LIST_ROUTES.includes(route)) names.push(...Object.keys(ROUTES[route].boxes));
        let diff = firstDiff(a.boxes, base1770.boxes, names, L, 0.15);
        if (!diff && NOTEBOOK_ROUTES.includes(route)) {
          diff = firstDiff(a.boxes, b.boxes, Object.keys(ROUTES[route].boxes), 0, 0.15);
        }
        if (!diff) {
          const h = a.boxes.head;
          if (!h || h.l !== 0 || h.r !== W) diff = `head: ${JSON.stringify(h)} should run 0 to ${W}`;
        }
        gate(!diff, `shift ${label} is the 1770 box moved right by ${L}${diff ? ` ${diff}` : ''}`);
      }
    }

    // target2560: decision 59's numbers
    if (!isPanel && W === 2560) {
      const bx = a.boxes;
      const want = {
        home: {
          body: [395, 2165],
          rail: [395, 619],
          nav: [415, 598],
          main: [619, 2165],
          brand: [443, 557],
          // decision 59's 1749.5 is WebKit's text width (367.5); Chrome's tools are 364 wide at the base too, so
          // its left edge is 2117 - 364 and only the right edge is the frame's
          tools: [engine === 'webkit' ? 1749.5 : null, 2117],
          head: [0, 2560],
          lead: [667, 2117],
          row: [667, 2117],
          tally: [1647.3, null],
        },
        recipe: { band: [651, 2133], sheet: [651, 1751], log: [1783, 2133], head: [0, 2560] },
      }[route];
      if (want) {
        let diff = null;
        for (const [n, [l, r]] of Object.entries(want)) {
          const box = bx[n];
          if (!box || (l != null && !near(box.l, l, 0.5)) || (r != null && !near(box.r, r, 0.5))) {
            diff = `${n}: ${JSON.stringify(box)} wanted ${l}-${r}`;
            break;
          }
        }
        gate(!diff, `target2560 ${label} meets decision 59's numbers${diff ? ` ${diff}` : ''}`);
      }
    }

    // panel: under Import from 1366
    if (isPanel && W >= 1366) {
      const ok = a && a.panel && a.tools && near(a.panel.r, a.tools.r, 0.5);
      gate(!!ok, `panel ${label} right edge ${a?.panel?.r} vs tools right edge ${a?.tools?.r}`);
    }

    // overflow
    if (!isPanel) {
      if (a.overflow <= 0) gate(true, `overflow ${label} ${a.overflow}`);
      else if (b.overflow === a.overflow) info(`pre-existing overflow ${label} ${a.overflow}`);
      else gate(false, `overflow ${label} ${a.overflow} (before ${b.overflow})`);
    }
  }
  console.log(`${passes} PASS, ${failures} FAIL`);
  process.exit(failures > 0 ? 1 : 0);
}

if (mode === 'record' && process.argv[3]) await record(process.argv[3]);
else if (mode === 'compare' && process.argv[4]) compare(process.argv[3], process.argv[4]);
else {
  console.log('usage: record <out.json> | compare <before.json> <after.json>');
  process.exit(2);
}
