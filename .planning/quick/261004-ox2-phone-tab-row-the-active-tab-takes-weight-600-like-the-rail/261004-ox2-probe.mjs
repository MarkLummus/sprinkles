// Quick task 261004-ox2's probe: sketch 011 decision 38, Mark's later answer (2026-10-04),
// the phone tab row's current tab takes weight 600, like the rail's current place.
// Measures the BUILT app (app/dist) in Playwright's WebKit and system Chrome, below 724
// (393 and 723), against a baseline read from a build of the unchanged source.
//
//   node 261004-ox2-probe.mjs baseline   (build of the unchanged source; writes 261004-ox2-baseline.json)
//   node 261004-ox2-probe.mjs after      (every cell vs the baseline: weight, surface, radius, boxes, lines, overflow)
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never
// requests Mark's :4173 preview, the dev server on :5173 or the sketch server on :8011,
// and starts no Vite process. Every route opens in a throwaway browser context and nothing
// is saved, so nothing reaches Mark's IndexedDB. A reading here is evidence about two
// engines, not about Mark's iPhone.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, APP_ROUTE, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-ox2-baseline.json');
const SURFACE = 'rgb(243, 244, 242)';

const group = process.argv[2];
if (group !== 'baseline' && group !== 'after') {
  console.error('usage: node 261004-ox2-probe.mjs baseline|after');
  process.exit(2);
}

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const rectNear = (a, b) => !!a && !!b && near(a.x, b.x) && near(a.y, b.y) && near(a.w, b.w) && near(a.h, b.h);
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);
const all = (radii, value) => Array.isArray(radii) && radii.length === 4 && radii.every((r) => r === value);

// WebKit is coarse (the iPhone is a touch device); Chrome's tab row depends on width alone.
const engines = [
  ['webkit', () => webkit.launch(), true],
  ['chrome', () => launch(), false],
];
const WIDTHS = [393, 723];
const ROUTES = {
  home: { path: '/', current: 'Home' },
  notebook: { path: APP_ROUTE, current: 'Notebook' },
  recipeBook: { path: '/recipe-book', current: 'Recipe book' },
  ideaLog: { path: '/idea-log', current: 'Idea log' },
  ingredients: { path: '/ingredients', current: null },
};

// In-page reader. Runs in the page; self-contained.
async function readTabs(openMore) {
  await document.fonts.ready;
  if (openMore) {
    document.querySelector('.shell__more').open = true;
  }
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const rr = (e) => {
    const b = e.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  };
  const labelNode = (e) => {
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    let last = null;
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) last = walker.currentNode;
    }
    return last;
  };
  const read = (e) => {
    const cs = getComputedStyle(e);
    const node = labelNode(e);
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    const box = rr(e);
    const bound = range.getBoundingClientRect();
    const tops = new Set(rects.map((r) => Math.round(r.top)));
    const inside =
      bound.left >= box.x - 0.5 && bound.right <= box.x + box.w + 0.5 && bound.top >= box.y - 0.5 && bound.bottom <= box.y + box.h + 0.5;
    return {
      label: node.textContent.trim(),
      ariaCurrent: e.getAttribute('aria-current'),
      fontWeight: cs.fontWeight,
      background: cs.backgroundColor,
      radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius],
      box,
      labelWidth: bound.width,
      lines: tops.size,
      inside,
    };
  };
  const tabs = [...document.querySelectorAll('.shell__tabs > .shell__place, .shell__tabs > .shell__more > summary')].map(read);
  const moreItems = [...document.querySelectorAll('.shell__tabs .shell__more li > .shell__place')].map(read);
  return { tabs, moreItems, overflow: document.documentElement.scrollWidth - window.innerWidth };
}

async function measure(servers) {
  const result = {};
  for (const [engine, start, coarse] of engines) {
    const browser = await start();
    result[engine] = {};
    for (const width of WIDTHS) {
      result[engine][width] = {};
      for (const [key, route] of Object.entries(ROUTES)) {
        const { context, page } = await openApp(browser, servers.appUrl, route.path, { width, coarse });
        result[engine][width][key] = await page.evaluate(readTabs, key === 'ingredients');
        await context.close();
      }
    }
    await browser.close();
  }
  return result;
}

function cells(data) {
  const out = [];
  for (const engine of Object.keys(data)) {
    for (const width of Object.keys(data[engine])) {
      for (const key of Object.keys(data[engine][width])) {
        out.push({ engine, width, key, cell: data[engine][width][key], tag: `${engine} ${width} ${key}` });
      }
    }
  }
  return out;
}

const servers = await startServers();
try {
  if (group === 'baseline') {
    const data = await measure(servers);
    await writeFile(BASELINE_PATH, JSON.stringify(data, null, 2) + '\n');
    for (const { engine, width, key, cell, tag } of cells(data)) {
      const route = ROUTES[key];
      const current = cell.tabs.filter((t) => t.ariaCurrent === 'page');
      countedCheck(cell.tabs.length === 5, `${tag}: five tab-row children, got ${cell.tabs.length}`);
      for (const t of cell.tabs) countedCheck(t.fontWeight === '400', `${tag}: ${t.label} reads 400, got ${t.fontWeight}`);
      if (route.current) {
        countedCheck(current.length === 1 && current[0].label === route.current, `${tag}: exactly ${route.current} is current`);
        const c = current[0];
        countedCheck(!!c && c.background === SURFACE, `${tag}: current tab surface ${SURFACE}, got ${c && c.background}`);
        countedCheck(!!c && all(c.radii, '10px'), `${tag}: current tab radius 10px on all four corners, got ${c && c.radii}`);
      } else {
        countedCheck(current.length === 0, `${tag}: no tab is current`);
        const ing = cell.moreItems.find((i) => i.label === 'Ingredients');
        countedCheck(!!ing && ing.ariaCurrent === 'page', `${tag}: Ingredients in More is current`);
        countedCheck(!!ing && ing.fontWeight === '400' && ing.background === SURFACE, `${tag}: Ingredients in More at 400 on ${SURFACE}, got ${ing && ing.fontWeight} ${ing && ing.background}`);
      }
      for (const t of cell.tabs) {
        countedCheck(t.lines === 1, `${tag}: ${t.label} is one line, got ${t.lines}`);
        countedCheck(t.inside, `${tag}: ${t.label} lies inside its tab`);
      }
      countedCheck(cell.overflow === 0, `${tag}: overflow 0, got ${cell.overflow}`);
    }
    console.log('engine  width route        tabs: label weight w x h label-width');
    for (const { engine, width, key, cell } of cells(data)) {
      console.log(
        `${engine.padEnd(7)} ${String(width).padEnd(5)} ${key.padEnd(12)} ` +
          cell.tabs.map((t) => `${t.label}${t.ariaCurrent ? '*' : ''} ${t.fontWeight} ${round(t.box.w)}x${round(t.box.h)} lw${round(t.labelWidth)}`).join(' | '),
      );
    }
  } else {
    let baseline;
    try {
      baseline = JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
    } catch (e) {
      console.error(`after: cannot read ${BASELINE_PATH}: ${e.message}`);
      process.exit(2);
    }
    const data = await measure(servers);
    const rows = [];
    for (const { engine, width, key, cell, tag } of cells(data)) {
      const route = ROUTES[key];
      const base = baseline[engine][width][key];
      countedCheck(cell.tabs.length === base.tabs.length, `${tag}: same number of tab-row children`);
      cell.tabs.forEach((t, i) => {
        const b = base.tabs[i];
        const isCurrent = route.current !== null && t.label === route.current;
        countedCheck(t.label === b.label, `${tag}: tab ${i} label ${t.label} equals baseline ${b.label}`);
        countedCheck(t.ariaCurrent === b.ariaCurrent, `${tag}: ${t.label} aria-current equals baseline`);
        countedCheck(t.fontWeight === (isCurrent ? '600' : '400'), `${tag}: ${t.label} reads ${isCurrent ? 600 : 400}, got ${t.fontWeight}`);
        countedCheck(t.background === b.background, `${tag}: ${t.label} background equals baseline, got ${t.background} vs ${b.background}`);
        countedCheck(JSON.stringify(t.radii) === JSON.stringify(b.radii), `${tag}: ${t.label} four radii equal baseline, got ${t.radii} vs ${b.radii}`);
        countedCheck(rectNear(t.box, b.box), `${tag}: ${t.label} box equals baseline within 0.5, got ${JSON.stringify(t.box)} vs ${JSON.stringify(b.box)}`);
        countedCheck(t.lines === 1, `${tag}: ${t.label} is one line, got ${t.lines}`);
        countedCheck(t.inside, `${tag}: ${t.label} lies inside its tab`);
      });
      countedCheck(cell.overflow === base.overflow, `${tag}: overflow equals baseline ${base.overflow}, got ${cell.overflow}`);
      if (!route.current) {
        countedCheck(cell.tabs.every((t) => t.ariaCurrent !== 'page'), `${tag}: no tab is current`);
        cell.moreItems.forEach((item, i) => {
          const b = base.moreItems[i];
          const isIngredients = item.label === 'Ingredients';
          countedCheck(item.label === b.label, `${tag}: More item ${i} label equals baseline`);
          countedCheck(item.fontWeight === (isIngredients ? '600' : '400'), `${tag}: More item ${item.label} reads ${isIngredients ? 600 : 400}, got ${item.fontWeight}`);
          countedCheck(item.background === b.background, `${tag}: More item ${item.label} background equals baseline, got ${item.background} vs ${b.background}`);
        });
      }
      const recipeBook = cell.tabs.find((t) => t.label === 'Recipe book');
      const baseRecipeBook = base.tabs.find((t) => t.label === 'Recipe book');
      const current = cell.tabs.find((t) => t.ariaCurrent === 'page');
      const baseCurrent = base.tabs.find((t) => t.ariaCurrent === 'page');
      rows.push(
        `${engine.padEnd(7)} ${String(width).padEnd(5)} ${key.padEnd(12)} ` +
          `${(current ? current.label : '(none; More item Ingredients ' + cell.moreItems.find((i) => i.label === 'Ingredients').fontWeight + ')').padEnd(12)} ` +
          `${baseCurrent ? baseCurrent.fontWeight : '-'}->${current ? current.fontWeight : '-'} ` +
          `${current ? current.background : '-'} ${current ? current.radii[0] : '-'} ` +
          `RB ${round(baseRecipeBook.labelWidth)}->${round(recipeBook.labelWidth)} ` +
          `lines ${cell.tabs.map((t) => t.lines).join('')} overflow ${cell.overflow}`,
      );
    }
    console.log('Engine  Width Route        Current tab  Weight  Surface  Radius  Recipe book label width  Lines  Overflow');
    for (const row of rows) console.log(row);
  }
} finally {
  await servers.close();
}
finish(failures, count, `261004-ox2 ${group}`);
