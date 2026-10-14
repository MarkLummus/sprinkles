// 03.6-07: the conformance probe for decision 51's per-step shared ingredients.
//
// Drives the BUILD (app/dist, served by the plan-10 harness on an ephemeral
// 127.0.0.1 port; never Mark's `vite preview --host` on :4173) through the
// eight states of the board per-step-shared-ingredient.html with real clicks
// and fills, reads the facts off the LIVE page and compares them with the
// facts the board's generator measured (.planning/canvas-generators/
// perstep-capture.json), in Playwright WebKit and in system Chrome, both
// coarse, at 1366 and 393. Then, for each state the board draws a panel for,
// it reads the real DOM geometry of the app's ingredient table and of the
// board's panel (the board opened coarse at its own $preview width) and
// compares them within 1px. It also checks the pen's table for UX1-01 and
// UX1-03: an explicit tabindex of 0 on every button, and "removed" at the end
// of a struck line's accessible name.
//
// Usage: node 03.6-perstep-probe.mjs [states] [widths] [engines]
//   states:  comma list of rest,wm2,wm3,both,edit,step,showEdit,showRm (default all eight)
//   widths:  comma list of 1366,393 (default 1366,393)
//   engines: comma list of webkit,chrome (default webkit,chrome)
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, check, finish } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CAPTURE = path.resolve(HERE, '..', '..', 'canvas-generators', 'perstep-capture.json');
const BOARD = 'per-step-shared-ingredient.html';
const VERSION_ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';

// decisions_recorded 1: the state map. `key` is the capture file's key (suffixed
// _1366 or _393); `panel` is the board's panel class (suffixed -1366 or -393,
// null where the board draws none); `panelWidths` the widths it draws one at.
const STATES = {
  rest: { key: 'rest', panel: 'fp-rest', panelWidths: [1366, 393], acts: [] },
  wm2: { key: 'z_wm2', panel: 'fp-step-a', panelWidths: [1366, 393], acts: [['click', 'remove Whole milk, Step 2']] },
  wm3: { key: 'z_wm3', panel: 'fp-step-c', panelWidths: [1366, 393], acts: [['click', 'remove Whole milk, Step 3']] },
  both: {
    key: 'b_wm2',
    panel: 'fp-step-b',
    panelWidths: [1366],
    acts: [['click', 'remove Whole milk, Step 2'], ['click', 'remove Whole milk, Step 3']],
  },
  edit: { key: 'p_edit', panel: 'fp-amt-b', panelWidths: [1366], acts: [['fill', 'Whole milk, grams, portion 1', '100']] },
  step: { key: 'z_step2', panel: 'fp-rm-b', panelWidths: [1366, 393], acts: [['click', 'Step 2, remove']] },
  showEdit: {
    key: 'p_show_edit',
    panel: 'fp-sc-b',
    panelWidths: [1366],
    acts: [['fill', 'Whole milk, grams, portion 1', '100'], ['save']],
  },
  showRm: { key: 'p_show_rm', panel: 'fp-scr-b', panelWidths: [1366], acts: [['click', 'remove Whole milk, Step 2'], ['save']] },
};

const [, , statesArg, widthsArg, enginesArg] = process.argv;
const stateNames = statesArg ? statesArg.split(',') : Object.keys(STATES);
const widths = widthsArg ? widthsArg.split(',').map(Number) : [1366, 393];
const engines = enginesArg ? enginesArg.split(',') : ['webkit', 'chrome'];
for (const name of stateNames) {
  if (!STATES[name]) {
    console.error(`Usage: node 03.6-perstep-probe.mjs [states] [widths] [engines]; unknown state ${name}`);
    process.exit(1);
  }
}

// decision 2: the facts, read as perstep-capture.mjs's grab reads them, but
// off the live page and not a clone; an input's grams are its current .value.
function readFacts() {
  const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const tbody = document.querySelector('.ingredient-table tbody');
  const trs = [...tbody.querySelectorAll('tr')];
  const isHead = (t) => t.classList.contains('ingredient-table__step-head');
  const nameOf = (tr) => {
    const c = tr.querySelector('.ingredient-table__col-name');
    return c
      ? [...c.childNodes]
          .filter((n) => n.nodeType === 3 || (n.nodeType === 1 && n.classList.contains('struck-value')))
          .map((n) => n.textContent)
          .join('')
          .trim()
      : '';
  };
  const shareTd = (tr) => [...tr.querySelectorAll('.ingredient-table__col-numeric')].pop();
  const groupLabels = trs.filter(isHead).map((t) => T(t));
  return {
    total: T(document.querySelector('.ingredient-table tfoot .ingredient-table__plan-grams')),
    lines: trs
      .filter((t) => !isHead(t) && t.querySelector('.ingredient-table__portion-note'))
      .map((t) => ({
        name: nameOf(t),
        struck: !!t.querySelector('.ingredient-table__col-name .struck-value'),
        grams: t.querySelector('input') ? t.querySelector('input').value : T(t.querySelector('.ingredient-table__col-grams')),
        gramsStruck: T(t.querySelector('.ingredient-table__col-grams .struck-value')),
        note: T(t.querySelector('.ingredient-table__portion-note')),
        share: T(shareTd(t)),
        link: T(t.querySelector('.ingredient-table__col-name button')),
      })),
    heads: groupLabels,
    n: trs.filter((t) => !isHead(t)).length,
  };
}

// decision 3: the geometry of one ingredient table, read on the real DOM:
// each tbody row's height, each name-cell .text-control's box, and each
// .struck-value's computed decoration line and colour, in order.
function readGeometry(rootSelector) {
  const root = rootSelector ? document.querySelector(rootSelector) : document;
  const table = root.querySelector('.ingredient-table');
  const rows = [...table.querySelectorAll('tbody tr')];
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { w: r.width, h: r.height };
  };
  return {
    rowHeights: rows.map((tr) => tr.getBoundingClientRect().height),
    links: rows.flatMap((tr) => [...tr.querySelectorAll('.ingredient-table__col-name .text-control')].map(box)),
    struck: [...table.querySelectorAll('.struck-value')].map((el) => {
      const cs = getComputedStyle(el);
      return { line: cs.textDecorationLine, color: cs.color };
    }),
  };
}

// UX1-01, UX1-03: the pen's buttons carry tabindex "0"; a struck line's
// accessible name ends with "removed" and its link (when it has one) reads
// "restore", so a struck line is never colour or line alone.
function readAccess() {
  const table = document.querySelector('.ingredient-table');
  const buttons = [...table.querySelectorAll('button')].map((b) => ({
    label: b.getAttribute('aria-label') ?? b.textContent.trim(),
    tabindex: b.getAttribute('tabindex'),
  }));
  const struckRows = [...table.querySelectorAll('tbody tr')]
    .filter((tr) => tr.querySelector('.ingredient-table__col-name .struck-value'))
    .map((tr) => {
      const link = tr.querySelector('.ingredient-table__col-name button');
      return { aria: tr.getAttribute('aria-label') ?? '', link: link ? link.textContent.trim() : null };
    });
  return { buttons, struckRows };
}

// Save as 'v2' through the harness's saveNextVersion pattern (the pen is already open, so the
// opener is not pressed again), then press Show changes.
async function saveAndShowChanges(page) {
  const urlBeforeSave = page.url();
  await page.getByLabel('Version name').fill('v2');
  await page.getByRole('button', { name: 'Save as a new version', exact: true }).click();
  await page.waitForFunction((prev) => window.location.href !== prev, urlBeforeSave);
  await page.waitForSelector('h2.notebook-version__identity');
  await page.getByRole('button', { name: /^Show changes$/ }).first().click();
  await page.waitForSelector('.ingredient-table');
}

// Real clicks and fills on a fresh context (a fresh seeded store): Olive Oil
// v1's route, then Next version, then the state's own acts.
async function driveState(browser, appUrl, width, state) {
  const { context, page } = await openApp(browser, appUrl, VERSION_ROUTE, { width, coarse: true });
  page.setDefaultTimeout(10000);
  await page.waitForSelector('.notebook-log');
  await page.getByRole('button', { name: /next version/i }).first().click();
  await page.waitForSelector('.ingredient-table.is-developing');
  for (const act of state.acts) {
    if (act[0] === 'click') await page.getByRole('button', { name: act[1], exact: true }).click();
    else if (act[0] === 'fill') await page.getByLabel(act[1], { exact: true }).fill(act[2]);
    else if (act[0] === 'save') await saveAndShowChanges(page);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  return { context, page };
}

function compareFacts(countedCheck, label, actual, expected) {
  countedCheck(actual.total === expected.total, `${label}: total "${actual.total}" equals the board's "${expected.total}"`);
  countedCheck(
    JSON.stringify(actual.heads) === JSON.stringify(expected.heads),
    `${label}: step heads ${JSON.stringify(actual.heads)} equal the board's ${JSON.stringify(expected.heads)}`,
  );
  countedCheck(actual.n === expected.n, `${label}: line count ${actual.n} equals the board's ${expected.n}`);
  countedCheck(
    actual.lines.length === expected.lines.length,
    `${label}: ${actual.lines.length} split lines equal the board's ${expected.lines.length}`,
  );
  expected.lines.forEach((want, i) => {
    const got = actual.lines[i];
    if (!got) return;
    for (const field of ['name', 'struck', 'grams', 'gramsStruck', 'note', 'share', 'link']) {
      countedCheck(
        got[field] === want[field],
        `${label}: line ${i} (${want.name}) ${field} ${JSON.stringify(got[field])} equals the board's ${JSON.stringify(want[field])}`,
      );
    }
  });
}

function compareGeometry(countedCheck, label, app, board) {
  countedCheck(
    app.rowHeights.length === board.rowHeights.length,
    `${label}: ${app.rowHeights.length} table rows equal the board panel's ${board.rowHeights.length}`,
  );
  app.rowHeights.forEach((h, i) => {
    const b = board.rowHeights[i];
    if (b === undefined) return;
    countedCheck(Math.abs(h - b) <= 1, `${label}: row ${i} height ${h} within 1px of the board panel's ${b}`);
  });
  countedCheck(
    app.links.length === board.links.length,
    `${label}: ${app.links.length} remove or restore links equal the board panel's ${board.links.length}`,
  );
  app.links.forEach((l, i) => {
    const b = board.links[i];
    if (!b) return;
    countedCheck(Math.abs(l.w - b.w) <= 1, `${label}: link ${i} width ${l.w} within 1px of the board panel's ${b.w}`);
    countedCheck(Math.abs(l.h - b.h) <= 1, `${label}: link ${i} height ${l.h} within 1px of the board panel's ${b.h}`);
  });
  countedCheck(
    app.struck.length === board.struck.length,
    `${label}: ${app.struck.length} struck values equal the board panel's ${board.struck.length}`,
  );
  app.struck.forEach((s, i) => {
    const b = board.struck[i];
    if (!b) return;
    countedCheck(s.line === b.line, `${label}: struck value ${i} decoration "${s.line}" equals the board panel's "${b.line}"`);
    countedCheck(s.color === b.color, `${label}: struck value ${i} colour ${s.color} equals the board panel's ${b.color}`);
  });
}

function accessChecks(countedCheck, label, access) {
  access.buttons.forEach((b) => {
    countedCheck(b.tabindex === '0', `${label}: button "${b.label}" carries tabindex "0" (got ${JSON.stringify(b.tabindex)})`);
  });
  access.struckRows.forEach((r, i) => {
    countedCheck(r.aria.endsWith('removed'), `${label}: struck line ${i}'s accessible name "${r.aria}" ends with "removed"`);
    countedCheck(r.link === null || r.link === 'restore', `${label}: struck line ${i}'s link reads "restore" (got ${JSON.stringify(r.link)})`);
  });
}

async function main() {
  const failures = [];
  let checkCount = 0;
  const countedCheck = (condition, label) => {
    checkCount += 1;
    check(failures, condition, label);
  };

  const capture = JSON.parse(await readFile(CAPTURE, 'utf8'));
  const { appUrl, repoUrl, close } = await startServers();
  const browsers = { webkit: await webkit.launch(), chrome: await launch() };

  try {
    for (const engine of engines) {
      const browser = browsers[engine];
      for (const width of widths) {
        for (const name of stateNames) {
          const state = STATES[name];
          const label = `${engine} ${width} ${name}`;
          const { context, page } = await driveState(browser, appUrl, width, state);
          const facts = await page.evaluate(readFacts);
          const expected = capture[`${state.key}_${width}`];
          countedCheck(Boolean(expected), `${label}: the capture file holds ${state.key}_${width}`);
          if (expected) compareFacts(countedCheck, `${label} facts`, facts, expected.facts);
          const access = await page.evaluate(readAccess);
          accessChecks(countedCheck, `${label} access`, access);
          let geometryNote = 'no board panel';
          if (state.panel && state.panelWidths.includes(width)) {
            const app = await page.evaluate(readGeometry, null);
            const { context: boardContext, page: boardPage } = await openBoard(browser, repoUrl, BOARD, { coarse: true });
            const board = await boardPage.evaluate(readGeometry, `.${state.panel}-${width}`);
            await boardContext.close();
            compareGeometry(countedCheck, `${label} geometry`, app, board);
            geometryNote = `panel ${state.panel}-${width}: ${app.rowHeights.length} rows, ${app.links.length} links, ${app.struck.length} struck values`;
          }
          console.log(
            `${label}: total ${facts.total}; ${access.buttons.length} buttons, ${access.struckRows.length} struck lines; ${geometryNote}`,
          );
          await context.close();
        }
      }
    }
  } finally {
    await Promise.all(Object.values(browsers).map((b) => b.close()));
    await close();
  }

  finish(failures, checkCount, '03.6-perstep-probe');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
