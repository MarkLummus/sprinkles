// Quick task 261004-ly4's probe: is the Version section's "Show details" / "Hide details"
// control where sketch 011 draws it (one 14px head gap after the VERSION caption, on its
// baseline, at the section's left edge), and not centred in its row? Measures the BUILT app
// (app/dist) in Playwright WebKit (coarse up to 1366) and system Chrome (fine), at 1366, 1024,
// 983, 723 and 393, on Mexican Chocolate v3 and Olive Oil v1, at the default fold state and
// after one activation, against the five width boards and details-fold.html.
//
//   node 261004-ly4-probe.mjs        (no arguments; writes 261004-ly4-measure.json; exits non-zero on any failed check)
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never requests
// Mark's :4173 preview, the dev server on :5173 or the sketch server on :8011, and starts no
// Vite process. Each cell is a fresh browser context; the fold toggle stores nothing. A reading
// here is evidence about two engines on the Mac, not about Mark's iPad or iPhone.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, APP_ROUTE, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '261004-ly4-measure.json');

const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const WIDTHS = [1366, 1024, 983, 723, 393];
const ROUTES = [
  ['mex3', MEX3],
  ['olive1', APP_ROUTE],
];
const BOARDS = [
  ['1366', '1366-batch.html'],
  ['1024', '1024-batch.html'],
  ['983', '983-batch.html'],
  ['723', '723-batch.html'],
  ['393', '393-batch.html'],
  ['fold', 'details-fold.html'],
];
const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];
// Sid's convention: WebKit is coarse up to 1366 and fine above; Chrome is always fine.
const coarseFor = (engine, width) => engine === 'webkit' && width <= 1366;

const TOL = 0.5;
const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};
const near = (a, b, tol = TOL) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);

// In-page reader, the same for the app and the boards. One entry per Version fold row.
async function readVersionFolds() {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const textRect = (e) => {
    const g = document.createRange();
    g.selectNodeContents(e);
    const rs = [...g.getClientRects()].filter((k) => k.width > 0);
    return { left: Math.min(...rs.map((k) => k.left)), right: Math.max(...rs.map((k) => k.right)) };
  };
  const baselineOf = (e) => {
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    e.appendChild(probe);
    const top = probe.getBoundingClientRect().top;
    probe.remove();
    return top;
  };
  const panels = [...document.querySelectorAll('button[aria-controls^="fold-version"]')].map((row) => {
    const section = row.parentElement;
    const head = row.firstElementChild;
    const caption = head.children[0];
    const control = head.children[1];
    const rr = row.getBoundingClientRect();
    const sr = section.getBoundingClientRect();
    const ct = textRect(caption);
    const wt = textRect(control);
    return {
      word: control.textContent.trim(),
      captionText: caption.textContent.trim(),
      expanded: row.getAttribute('aria-expanded'),
      rowLeftInSection: rr.left - sr.left,
      rowWidthMinusSection: rr.width - sr.width,
      rowWidth: rr.width,
      rowHeight: rr.height,
      captionLeftInRow: ct.left - rr.left,
      headGap: parseFloat(getComputedStyle(head).columnGap),
      gap: wt.left - ct.right,
      controlLeftInRow: wt.left - rr.left,
      baselineDelta: baselineOf(control) - baselineOf(caption),
      controlCentreMinusRowCentre: (wt.left + wt.right) / 2 - (rr.left + rr.width / 2),
      justifyContent: getComputedStyle(row).justifyContent,
    };
  });
  return { innerWidth: window.innerWidth, coarse: matchMedia('(pointer: coarse)').matches, panels };
}

async function readApp(page) {
  return page.evaluate(readVersionFolds);
}

const results = {};
const lines = [];
function record(key, read) {
  results[key] = read;
  for (const p of read.panels) {
    lines.push(`${key}\t${p.word}\tcaption ${round(p.captionLeftInRow)}\tgap ${round(p.gap)}\tcontrol ${round(p.controlLeftInRow)}\tbaseline ${round(p.baselineDelta)}\trow ${round(p.rowHeight)}`);
  }
}

async function measureApp(browser, servers, engine, width, routeId, route) {
  const coarse = coarseFor(engine, width);
  const { context, page } = await openApp(browser, servers.appUrl, route, { width, coarse });
  try {
    const def = await readApp(page);
    const button = page.locator('button[aria-controls="fold-version"]');
    const before = await button.getAttribute('aria-expanded');
    await button.click();
    await page.waitForFunction((was) => document.querySelector('button[aria-controls="fold-version"]').getAttribute('aria-expanded') !== was, before);
    const toggled = await readApp(page);
    return { def, toggled };
  } finally {
    await context.close();
  }
}

function appChecks(key, width, def, toggled) {
  for (const [state, read] of [['default', def], ['toggled', toggled]]) {
    const k = `${key}|${state}`;
    countedCheck(read.innerWidth === width, `${k}: innerWidth ${read.innerWidth} is ${width}`);
    countedCheck(read.panels.length === 1, `${k}: exactly one Version fold row (read ${read.panels.length})`);
    const p = read.panels[0];
    if (!p) continue;
    countedCheck(p.captionText.toLowerCase() === 'version', `${k}: caption reads Version (read "${p.captionText}")`);
    countedCheck(near(p.rowLeftInSection, 0), `${k}: row left in section ${round(p.rowLeftInSection)} is 0`);
    countedCheck(near(p.rowWidthMinusSection, 0), `${k}: row as wide as section (diff ${round(p.rowWidthMinusSection)})`);
    countedCheck(near(p.captionLeftInRow, 0), `${k}: caption left in row ${round(p.captionLeftInRow)} is 0`);
    countedCheck(near(p.headGap, 14), `${k}: head gap ${p.headGap} is 14`);
    countedCheck(near(p.gap, p.headGap), `${k}: caption-to-word gap ${round(p.gap)} equals head gap ${p.headGap}`);
    countedCheck(near(p.baselineDelta, 0), `${k}: baseline delta ${round(p.baselineDelta)} is 0`);
    countedCheck(p.rowHeight >= 44 - TOL, `${k}: row height ${round(p.rowHeight)} is at least 44`);
    // The todo's "near the centre" claim, inverted: a centred word would sit within a few px of the row's centre.
    countedCheck(Math.abs(p.controlCentreMinusRowCentre) > 0.1 * p.rowWidth, `${k}: word centre is ${round(p.controlCentreMinusRowCentre)} from the row centre (row ${round(p.rowWidth)} wide), not centred`);
  }
  const expectedDefault = width === 1366 ? 'Hide details' : 'Show details';
  const expectedToggled = width === 1366 ? 'Show details' : 'Hide details';
  const pd = def.panels[0];
  const pt = toggled.panels[0];
  if (pd) countedCheck(pd.word === expectedDefault, `${key}|default: word "${pd.word}" is "${expectedDefault}"`);
  if (pt) countedCheck(pt.word === expectedToggled, `${key}|toggled: word "${pt.word}" is "${expectedToggled}"`);
  if (pd && pt) countedCheck(near(pd.controlLeftInRow, pt.controlLeftInRow), `${key}: control left moves ${round(pd.controlLeftInRow)} to ${round(pt.controlLeftInRow)} on activation (word ${pd.word} to ${pt.word})`);
}

// Control-word left is compared by word: "Show details" and "Hide details" have different caption
// gaps only through the same 14px head gap, so one app reading matches the board's same-word reading.
function boardChecks(engine, boardId, read) {
  const k = `${engine}|${boardId}`;
  countedCheck(read.panels.length >= 1, `${k}: at least one Version fold panel (read ${read.panels.length})`);
  for (const [i, p] of read.panels.entries()) {
    const pk = `${k}#${i}`;
    countedCheck(near(p.rowLeftInSection, 0), `${pk}: row left in section ${round(p.rowLeftInSection)} is 0`);
    countedCheck(near(p.captionLeftInRow, 0), `${pk}: caption left in row ${round(p.captionLeftInRow)} is 0`);
    countedCheck(near(p.gap, p.headGap), `${pk}: gap ${round(p.gap)} equals head gap ${p.headGap}`);
    countedCheck(near(p.baselineDelta, 0), `${pk}: baseline delta ${round(p.baselineDelta)} is 0`);
    for (const q of read.panels.slice(0, i)) {
      if (q.word === p.word) countedCheck(near(p.controlLeftInRow, q.controlLeftInRow), `${pk}: control left ${round(p.controlLeftInRow)} agrees with an earlier "${p.word}" panel's ${round(q.controlLeftInRow)}`);
    }
  }
}

function appVsBoard(engine, width, appDef, board, boardName) {
  const a = appDef.panels[0];
  const b = board.panels[0];
  const k = `${engine}|${width}|app vs ${boardName}`;
  if (!a || !b) {
    countedCheck(false, `${k}: both have a panel`);
    return;
  }
  countedCheck(a.word === b.word, `${k}: word app "${a.word}" vs board "${b.word}"`);
  countedCheck(near(a.captionLeftInRow, b.captionLeftInRow), `${k}: caption left ${round(a.captionLeftInRow)} vs ${round(b.captionLeftInRow)}`);
  countedCheck(near(a.gap, b.gap), `${k}: gap ${round(a.gap)} vs ${round(b.gap)}`);
  countedCheck(near(a.controlLeftInRow, b.controlLeftInRow), `${k}: control left ${round(a.controlLeftInRow)} vs ${round(b.controlLeftInRow)}`);
  countedCheck(near(a.baselineDelta, b.baselineDelta), `${k}: baseline delta ${round(a.baselineDelta)} vs ${round(b.baselineDelta)}`);
}

function appVsFold(engine, appReads, fold) {
  const show = fold.panels.find((p) => p.word === 'Show details');
  const hide = fold.panels.find((p) => p.word === 'Hide details');
  countedCheck(!!show && !!hide, `${engine}|fold: details-fold.html draws a Show and a Hide panel`);
  if (!show || !hide) return;
  for (const [key, read] of appReads) {
    const p = read.panels[0];
    if (!p) continue;
    const ref = p.word === 'Show details' ? show : hide;
    const k = `${key} vs details-fold "${p.word}"`;
    countedCheck(near(p.controlLeftInRow, ref.controlLeftInRow), `${k}: control left ${round(p.controlLeftInRow)} vs ${round(ref.controlLeftInRow)}`);
    countedCheck(near(p.gap, ref.gap), `${k}: gap ${round(p.gap)} vs ${round(ref.gap)}`);
  }
}

const servers = await startServers();
try {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      // Boards first, then the app, so the board panels are on hand for the comparisons.
      const boards = {};
      for (const [boardId, file] of BOARDS) {
        const { context, page } = await openBoard(browser, servers.repoUrl, file);
        try {
          const read = await page.evaluate(readVersionFolds);
          boards[boardId] = read;
          record(`${engine}|${boardId}|board`, read);
          boardChecks(engine, boardId, read);
        } finally {
          await context.close();
        }
      }
      const appReads = [];
      for (const width of WIDTHS) {
        for (const [routeId, route] of ROUTES) {
          const key = `${engine}|${width}|${routeId}`;
          const { def, toggled } = await measureApp(browser, servers, engine, width, routeId, route);
          record(`${key}|default`, def);
          record(`${key}|toggled`, toggled);
          appChecks(key, width, def, toggled);
          appVsBoard(engine, width, def, boards[String(width)], `${width}-batch`);
          appReads.push([`${key}|default`, def], [`${key}|toggled`, toggled]);
        }
      }
      appVsFold(engine, appReads, boards.fold);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

for (const line of lines) console.log(line);
await writeFile(OUT, JSON.stringify(results, null, 2) + '\n');
finish(failures, count, '261004-ly4 probe');
