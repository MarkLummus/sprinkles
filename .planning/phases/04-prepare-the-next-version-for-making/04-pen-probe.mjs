// 04-05: the record pen and its reading, measured on the built app against
// sketch 010's approved boards (D6 to D14; CONTRACT section 7).
//
// Usage (from the repo root, after `npm --prefix app run build`):
//   node .planning/phases/04-.../04-pen-probe.mjs board atdraw       At draw's five states, pen-states.html
//   node .planning/phases/04-.../04-pen-probe.mjs board fromfreezer  From freezer's five states, pen-states.html
//   node .planning/phases/04-.../04-pen-probe.mjs board whole        the four whole-pen states, pen-whole.html
//   node .planning/phases/04-.../04-pen-probe.mjs board reading      the five readings, pen-reading.html
//   node .planning/phases/04-.../04-pen-probe.mjs check              every board mode
//
// Each board mode runs in WebKit and Chrome, at 1366 and 393 with a coarse
// pointer (the way the boards were drawn and measured), and prints one MATCH
// or DIFF line per comparison. A DIFF fails the exit status. Boxes are
// compared within 2 px; whole-pen and reading heights within 8 px, the
// boards' own Chromium tolerance (CONTRACT section 7). The iPad is not
// measured here: Mark's device check is the evidence for that.
//
// The build is read from PROBE_DIST (default app/dist).
//
// Isolation: the app is served on an ephemeral 127.0.0.1 port through the
// 03.5 harness, and every request to another host is aborted in every
// context this file opens. Nothing here contacts Mark's `vite preview
// --host` on :4173, the sketch server on :8077, his browser profile or any
// third-party host. The note text typed into the pen is English.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, check, finish, APP_ROUTE, REPO_ROOT } from '../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
import path from 'node:path';

const DIST = process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist');
const BOARD_DIR = '../010-bench-sheet/';
const MODES = ['atdraw', 'fromfreezer', 'whole', 'reading'];
const WIDTHS = [1366, 393];

// ---------------------------------------------------------------------------
// In-page readers (serialized into the page, so each is self-contained).
// ---------------------------------------------------------------------------

// The pen root's captions in order, each mark-one group's boxes, and the
// pen's height. `sel` finds the pen root; boxes are relative to it.
function readPen({ sel }) {
  const pen = document.querySelector(sel);
  const p = pen.getBoundingClientRect();
  const rel = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: b.left - p.left, y: b.top - p.top, width: b.width, height: b.height };
  };
  const captions = [...pen.querySelectorAll('.pen-caption, .region-name')].map((e) => e.textContent.replace(/\s+/g, ' ').trim());
  const groups = {};
  for (const group of pen.querySelectorAll('[data-mo]')) {
    const options = [...group.querySelectorAll('.segmented__option')];
    const inputs = [...group.querySelectorAll('input[type="radio"]')];
    groups[group.getAttribute('data-mo')] = {
      box: rel(group),
      head: rel(group.querySelector('.segmented-field__head')),
      caption: rel(group.querySelector('.segmented-field__caption')),
      captionText: group.querySelector('.segmented-field__caption').textContent,
      options: options.map(rel),
      optionTexts: options.map((o) => o.textContent.trim()),
      hint: rel(group.querySelector('.mo-hint')),
      hintText: group.querySelector('.mo-hint')?.textContent ?? null,
      clear: rel(group.querySelector('.segmented-field__clear')),
      off: options.filter((o) => o.classList.contains('is-off')).length,
      disabled: inputs.filter((i) => i.disabled).length,
      checked: inputs.filter((i) => i.checked).map((i) => i.value),
      borderStyles: options.map((o) => getComputedStyle(o).borderTopStyle),
    };
  }
  return {
    penHeight: p.height,
    penWidth: p.width,
    captions,
    groups,
    scrollWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
  };
}

// The reading: its labels and notes in the order it says them, each cell's
// box relative to the batch margin, and the margin's height. `sel` finds the
// .batch-margin that holds the reading.
function readReading({ sel }) {
  const root = document.querySelector(sel);
  const m = root.getBoundingClientRect();
  const tokens = [];
  const cells = [];
  for (const el of root.querySelectorAll(
    '.fold-row__head, .batch-row__cell-label, .batch-row__group-label, .batch-row__note, .tasting-reading__note, .tasting-reading__problems',
  )) {
    const text = el.classList.contains('fold-row__head') ? el.firstChild.textContent : el.textContent.replace(/\s+/g, ' ').trim();
    tokens.push(text);
    if (el.classList.contains('batch-row__cell-label')) {
      const b = el.closest('.batch-row__cell').getBoundingClientRect();
      cells.push({ label: text, x: b.left - m.left, y: b.top - m.top, width: b.width, height: b.height });
    }
  }
  const leads = [...root.querySelectorAll('.mo-lead')].map((el) => {
    const b = el.getBoundingClientRect();
    return { label: el.querySelector('.batch-row__cell-label').textContent, value: el.querySelector('.batch-row__cell-value').textContent, width: b.width, left: b.left - m.left };
  });
  return {
    tokens,
    cells,
    leads,
    height: m.height,
    width: m.width,
    scrollWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
  };
}

// ---------------------------------------------------------------------------
// Driving the built app into a board's state.
// ---------------------------------------------------------------------------
async function openPen(page) {
  const selector = '.batch-row__record';
  await page.waitForSelector('.batch-row');
  await page.waitForSelector(selector);
  await page.click(selector);
  try {
    await page.waitForSelector('.batch-margin--pen', { timeout: 3000 });
  } catch {
    // A first click after navigation can miss: click once more.
    await page.click(selector);
    await page.waitForSelector('.batch-margin--pen', { timeout: 5000 });
  }
  await page.waitForTimeout(150);
}

async function openTasting(page) {
  await page.locator('.save-ceremony button', { hasText: 'Add tasting' }).first().click();
  await page.waitForSelector('.tasting-head');
  await page.waitForTimeout(150);
}

// Click an option's label until its radio reads checked (a first tap after
// navigation can miss). `groupSel` finds the radiogroup's field.
async function pickIn(page, groupSel, word) {
  const label = page.locator(`${groupSel} label.segmented__option`, { hasText: word });
  for (let i = 0; i < 3; i += 1) {
    await label.click();
    await page.waitForTimeout(100);
    const on = await page.evaluate(
      ([g, w]) => [...document.querySelectorAll(`${g} input[type="radio"]`)].some((r) => r.checked && r.value === w),
      [groupSel, word],
    );
    if (on) return;
  }
  throw new Error(`could not pick ${word} in ${groupSel}`);
}

const pick = (page, mo, word) => pickIn(page, `[data-mo="${mo}"]`, word);
const pickLabelled = (page, groupLabel, word) => pickIn(page, `[role="radiogroup"][aria-label="${groupLabel}"]`, word);

async function markAxis(page, axisName, stop) {
  const axis = page.locator('.axis-mark', { has: page.locator('.axis-mark__name', { hasText: new RegExp(`^${axisName}$`) }) });
  const label = axis.locator('label.axis-mark__stop', { has: page.locator(`input[value="${stop}"]`) });
  for (let i = 0; i < 3; i += 1) {
    await label.click();
    await page.waitForTimeout(100);
    const on = await axis.locator(`input[value="${stop}"]`).isChecked();
    if (on) return;
  }
  throw new Error(`could not mark ${axisName} ${stop}`);
}

async function toggleChip(page, word) {
  const chip = page.locator('button.chip-toggle', { hasText: word });
  for (let i = 0; i < 3; i += 1) {
    await chip.click();
    await page.waitForTimeout(100);
    if ((await chip.getAttribute('aria-pressed')) === 'true') return;
  }
  throw new Error(`could not tick ${word}`);
}

const fill = (page, label, text) => page.fill(`textarea[aria-label="${label}"]`, text);

const AT_MACHINE = 'Bowl frozen overnight. Mix looked a little thin.';
const HOW = 'Soft, not greasy. The oil is strong.';

// Each state is the drive that makes the pen look like the board's panel.
const PEN_STATES = {
  atdraw: {
    boardFile: 'pen-states.html',
    panel: (state, width) => `fp-draw-${state}-${width}`,
    blank: async () => {},
    nothing: async (page) => pick(page, 'atdraw', 'Nothing to note'),
    notnote: async (page) => {
      await pick(page, 'atdraw', 'Not evaluated');
      await fill(page, 'At the machine', AT_MACHINE);
    },
    marked: async (page) => pickLabelled(page, 'Exit consistency', 'Wet, soupy'),
    noted: async (page) => fill(page, 'At the machine', AT_MACHINE),
  },
  fromfreezer: {
    boardFile: 'pen-states.html',
    panel: (state, width) => `fp-taste-${state}-${width}`,
    blank: async () => {},
    nothing: async (page) => pick(page, 'fromfreezer', 'Nothing to note'),
    notnote: async (page) => {
      await pick(page, 'fromfreezer', 'Not evaluated');
      await fill(page, 'How did it turn out?', HOW);
    },
    marked: async (page) => {
      await markAxis(page, 'Hardness', 4);
      await toggleChip(page, 'Greasy film');
    },
    noted: async (page) => fill(page, 'How did it turn out?', HOW),
  },
  whole: {
    boardFile: 'pen-whole.html',
    panel: (state, width) => `fp-${state}-${width}`,
    fullblank: async () => {},
    fullpick: async (page) => {
      await pick(page, 'atdraw', 'Nothing to note');
      await pick(page, 'fromfreezer', 'Not evaluated');
      await fill(page, 'At the machine', AT_MACHINE);
      await fill(page, 'How did it turn out?', HOW);
    },
    fullmix: async (page) => {
      await pick(page, 'atdraw', 'Nothing to note');
      await markAxis(page, 'Hardness', 4);
      await toggleChip(page, 'Greasy film');
    },
    full: async (page) => {
      await pickLabelled(page, 'Exit consistency', 'Wet, soupy');
      await markAxis(page, 'Hardness', 4);
      await toggleChip(page, 'Greasy film');
      await fill(page, 'At the machine', AT_MACHINE);
      await fill(page, 'How did it turn out?', HOW);
    },
  },
};
const DRIVE_KEYS = (mode) => Object.keys(PEN_STATES[mode]).filter((k) => typeof PEN_STATES[mode][k] === 'function' && k !== 'panel');

// The five readings of pen-reading.html, recorded through the real pen and
// the real save, then opened on the reading.
const READINGS = {
  r1: async (page) => {
    await pick(page, 'atdraw', 'Nothing to note');
    await pick(page, 'fromfreezer', 'Nothing to note');
  },
  r2: async (page) => {
    await pick(page, 'atdraw', 'Not evaluated');
    await pick(page, 'fromfreezer', 'Not evaluated');
  },
  r3: async (page) => {
    await fill(page, 'At the machine', 'Soft, not greasy');
    await fill(page, 'Ingredient notes', 'oil bottle opened 24 Jul');
    await pick(page, 'atdraw', 'Nothing to note');
    await fill(page, 'How did it turn out?', HOW);
    await pick(page, 'fromfreezer', 'Not evaluated');
  },
  r4: async (page) => {
    await fill(page, 'At the machine', 'Soft, not greasy');
    await fill(page, 'Ingredient notes', 'oil bottle opened 24 Jul');
    await fill(page, 'How did it turn out?', HOW);
    await markAxis(page, 'Sweetness', 4);
    await markAxis(page, 'Oil', 4);
    await toggleChip(page, 'Bitter');
  },
  r5: async (page) => {
    await pickLabelled(page, 'Exit consistency', 'Wet, soupy');
    await markAxis(page, 'Hardness', 4);
  },
};

async function recordReading(browser, appUrl, opts, drive) {
  const { context, page } = await openApp(browser, appUrl, APP_ROUTE, opts);
  await openPen(page);
  await page.fill('input[type="date"] >> nth=0', '2026-08-02');
  await page.fill('input[aria-label^="Out of machine"]', '-6');
  await page.fill('input[aria-label^="Churn duration"]', '30');
  await openTasting(page);
  await page.fill('input[aria-label^="Tasting temperature"]', '-12');
  await page.fill('input[aria-label^="Melt test"]', '3');
  await drive(page);
  await page.locator('.save-ceremony button', { hasText: 'Save batch' }).first().click();
  await page.waitForSelector('.batch-row__correct', { timeout: 8000 });
  await page.waitForTimeout(200);
  // The Batch and Tasting folds open below 1366: open both for the reading.
  for (const id of ['fold-batch', 'fold-tasting']) {
    const hidden = await page.evaluate((i) => document.getElementById(i)?.hidden === true, id);
    if (hidden) {
      await page.click(`button[aria-controls="${id}"]`);
      await page.waitForTimeout(150);
    }
  }
  await page.waitForSelector('#fold-tasting:not([hidden])');
  return { context, page };
}

// ---------------------------------------------------------------------------
// Comparison helpers.
// ---------------------------------------------------------------------------
const within = (a, b, tol = 2) => Math.abs(a - b) <= tol;
const r = (n) => Math.round(n * 10) / 10;
const box = (b) => (b ? `[${r(b.x)},${r(b.y)} ${r(b.width)}x${r(b.height)}]` : 'none');
const sameBox = (a, b, tol = 2) =>
  (a === null && b === null) ||
  (a !== null && b !== null && within(a.x, b.x, tol) && within(a.y, b.y, tol) && within(a.width, b.width, tol) && within(a.height, b.height, tol));
const json = JSON.stringify;
// Whole-pen and reading heights: the boards' own Chromium tolerance.
const HEIGHT_TOL = 8;

function makeCmp(failures, counters) {
  return (ok, label, app, board) => {
    counters.count += 1;
    const shown = board === undefined ? `${app}` : `app ${app}, board ${board}`;
    if (ok) {
      counters.matches += 1;
      console.log(`MATCH ${label}: ${shown}`);
    } else {
      counters.diffs += 1;
      console.log(`DIFF ${label}: ${shown}`);
      check(failures, false, label);
    }
  };
}

function compareGroup(cmp, label, ag, bg) {
  cmp(ag.captionText === bg.captionText, `${label} head caption`, json(ag.captionText), json(bg.captionText));
  cmp(sameBox(ag.box, bg.box), `${label} group box`, box(ag.box), box(bg.box));
  cmp(sameBox(ag.head, bg.head), `${label} head box`, box(ag.head), box(bg.head));
  cmp(sameBox(ag.caption, bg.caption), `${label} caption box`, box(ag.caption), box(bg.caption));
  cmp(json(ag.optionTexts) === json(bg.optionTexts), `${label} option words`, ag.optionTexts.join(' | '), bg.optionTexts.join(' | '));
  ag.options.forEach((o, i) => cmp(sameBox(o, bg.options[i]), `${label} option ${i} box`, box(o), box(bg.options[i])));
  cmp(sameBox(ag.hint, bg.hint), `${label} hint box`, box(ag.hint), box(bg.hint));
  cmp(ag.hintText === bg.hintText, `${label} hint words`, json(ag.hintText), json(bg.hintText));
  cmp(sameBox(ag.clear, bg.clear), `${label} Clear box`, box(ag.clear), box(bg.clear));
  cmp(ag.off === bg.off && ag.disabled === bg.disabled, `${label} off and disabled options`, `${ag.off}/${ag.disabled}`, `${bg.off}/${bg.disabled}`);
  cmp(json(ag.checked) === json(bg.checked), `${label} checked`, json(ag.checked), json(bg.checked));
  cmp(json(ag.borderStyles) === json(bg.borderStyles), `${label} option border styles`, ag.borderStyles.join(','), bg.borderStyles.join(','));
}

// ---------------------------------------------------------------------------
// board atdraw / fromfreezer / whole: pen-states.html and pen-whole.html.
// ---------------------------------------------------------------------------
async function boardPen(ctx, mode) {
  const { browser, engine, appUrl, openB, cmp } = ctx;
  const spec = PEN_STATES[mode];
  const states = DRIVE_KEYS(mode);
  for (const width of WIDTHS) {
    const opts = { width, height: 1100, coarse: true };
    const { context: bc, page: bp } = await openB(spec.boardFile);
    const boardFacts = {};
    for (const state of states) {
      boardFacts[state] = await bp.evaluate(readPen, { sel: `.fp-win.${spec.panel(state, width)} .batch-margin--pen` });
    }
    await bc.close();

    const appFacts = {};
    for (const state of states) {
      const { context, page } = await openApp(browser, appUrl, APP_ROUTE, opts);
      await openPen(page);
      await openTasting(page);
      await spec[state](page);
      appFacts[state] = await page.evaluate(readPen, { sel: '.batch-margin--pen' });
      await context.close();
    }

    for (const state of states) {
      const label = `${mode} ${state} ${engine} ${width}c`;
      const a = appFacts[state];
      const b = boardFacts[state];
      // The labels in order. At draw owns the churn section, so its labels are
      // compared up to the Tasting head; From freezer and the whole pen carry
      // the rest.
      const cut = (caps) => (mode === 'atdraw' && caps.includes('Tasting') ? caps.slice(0, caps.indexOf('Tasting')) : caps);
      cmp(json(cut(a.captions)) === json(cut(b.captions)), `${label} labels in order`, cut(a.captions).join(' | '), cut(b.captions).join(' | '));
      const wanted = mode === 'whole' ? ['atdraw', 'fromfreezer'] : [mode];
      cmp(json(Object.keys(a.groups).sort()) === json(Object.keys(b.groups).sort()), `${label} the same groups are drawn`, Object.keys(a.groups).join(','), Object.keys(b.groups).join(','));
      for (const mo of wanted) {
        if (a.groups[mo] && b.groups[mo]) compareGroup(cmp, `${label} ${mo}`, a.groups[mo], b.groups[mo]);
      }
      if (mode === 'whole') {
        cmp(within(a.penHeight, b.penHeight, HEIGHT_TOL), `${label} pen height`, r(a.penHeight), r(b.penHeight));
      }
      cmp(a.scrollWidth <= a.windowWidth, `${label} no sideways overflow`, `${a.scrollWidth} in ${a.windowWidth}`);
    }

    if (mode !== 'whole') {
      // What a pick hides: the pen is shorter by the group's fields, as drawn.
      const dApp = appFacts.blank.penHeight - appFacts.nothing.penHeight;
      const dBoard = boardFacts.blank.penHeight - boardFacts.nothing.penHeight;
      cmp(within(dApp, dBoard, 2), `${mode} ${engine} ${width}c a pick shortens the pen`, r(dApp), r(dBoard));
      // A mark leaves the pen as tall as blank (CONTRACT section 7).
      const mApp = appFacts.marked.penHeight - appFacts.blank.penHeight;
      const mBoard = boardFacts.marked.penHeight - boardFacts.blank.penHeight;
      cmp(within(mApp, mBoard, 2), `${mode} ${engine} ${width}c the marked pen against the blank pen`, r(mApp), r(mBoard));
      cmp(within(appFacts.blank.penHeight, boardFacts.blank.penHeight, HEIGHT_TOL), `${mode} ${engine} ${width}c blank pen height`, r(appFacts.blank.penHeight), r(boardFacts.blank.penHeight));
    }
    console.log(
      `MEASURE ${mode} ${engine} ${width}c pen heights app [${states.map((s) => `${s} ${r(appFacts[s].penHeight)}`).join(', ')}] board [${states.map((s) => `${s} ${r(boardFacts[s].penHeight)}`).join(', ')}]`,
    );
  }
}

// ---------------------------------------------------------------------------
// board reading: pen-reading.html.
// ---------------------------------------------------------------------------
async function boardReading(ctx) {
  const { browser, engine, appUrl, openB, cmp } = ctx;
  for (const width of WIDTHS) {
    const opts = { width, height: 1100, coarse: true };
    const { context: bc, page: bp } = await openB('pen-reading.html');
    const boardFacts = {};
    for (const name of Object.keys(READINGS)) {
      boardFacts[name] = await bp.evaluate(readReading, { sel: `.fp-win.fp-${name}-${width} .batch-margin` });
    }
    await bc.close();

    for (const [name, drive] of Object.entries(READINGS)) {
      const { context, page } = await recordReading(browser, appUrl, opts, drive);
      const a = await page.evaluate(readReading, { sel: '#fold-batch .batch-margin' });
      await context.close();
      const b = boardFacts[name];
      const label = `reading ${name} ${engine} ${width}c`;
      cmp(json(a.tokens) === json(b.tokens), `${label} labels in order`, a.tokens.join(' | '), b.tokens.join(' | '));
      cmp(json(a.leads.map((l) => [l.label, l.value])) === json(b.leads.map((l) => [l.label, l.value])), `${label} one-word cells`, json(a.leads.map((l) => [l.label, l.value])), json(b.leads.map((l) => [l.label, l.value])));
      a.leads.forEach((l, i) => cmp(b.leads[i] && within(l.width, b.leads[i].width) && within(l.left, b.leads[i].left), `${label} one-word cell ${i} spans the row`, `${r(l.left)} +${r(l.width)} of ${r(a.width)}`, b.leads[i] ? `${r(b.leads[i].left)} +${r(b.leads[i].width)} of ${r(b.width)}` : 'none'));
      cmp(a.cells.length === b.cells.length, `${label} cell count`, a.cells.length, b.cells.length);
      a.cells.forEach((c, i) => {
        const bc2 = b.cells[i];
        cmp(bc2 && c.label === bc2.label && within(c.x, bc2.x) && within(c.width, bc2.width) && within(c.y, bc2.y, HEIGHT_TOL), `${label} cell "${c.label}" box`, box(c), bc2 ? box(bc2) : 'none');
      });
      cmp(within(a.height, b.height, HEIGHT_TOL), `${label} reading height`, r(a.height), r(b.height));
      cmp(a.scrollWidth <= a.windowWidth, `${label} no sideways overflow`, `${a.scrollWidth} in ${a.windowWidth}`);
    }
  }
}

// ---------------------------------------------------------------------------
async function runBoard(modes) {
  const failures = [];
  const counters = { count: 0, matches: 0, diffs: 0 };
  const cmp = makeCmp(failures, counters);
  const { appUrl, repoUrl, close } = await startServers({ appRoot: DIST });
  const browsers = { webkit: await webkit.launch(), chrome: await launch() };
  try {
    for (const [engine, browser] of Object.entries(browsers)) {
      const openB = (file) => openBoard(browser, repoUrl, `${BOARD_DIR}${file}`, { coarse: true });
      const ctx = { browser, engine, appUrl, openB, cmp };
      for (const mode of modes) {
        if (mode === 'reading') await boardReading(ctx);
        else await boardPen(ctx, mode);
      }
    }
  } finally {
    await Promise.all(Object.values(browsers).map((b) => b.close()));
    await close();
  }
  console.log(`board: ${counters.matches} MATCH, ${counters.diffs} DIFF`);
  finish(failures, counters.count, `04 pen probe board ${modes.join(',')}`);
}

// ---------------------------------------------------------------------------
const [, , mode, which] = process.argv;
if (mode === 'board' && MODES.includes(which)) {
  await runBoard([which]);
} else if (mode === 'check') {
  await runBoard(MODES);
} else {
  console.error(`Usage: node 04-pen-probe.mjs board <${MODES.join('|')}> | check`);
  process.exit(1);
}
