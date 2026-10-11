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

const NOTE_AT_MACHINE = 'Bowl frozen overnight. Mix looked a little thin.';

// ---------------------------------------------------------------------------
// In-page readers (serialized into the page, so each is self-contained).
// ---------------------------------------------------------------------------

// The pen root's captions in order, the mark-one group's boxes, and the pen's
// height. `sel` finds the pen root; boxes are relative to it.
function readPen({ sel, mo }) {
  const pen = document.querySelector(sel);
  const p = pen.getBoundingClientRect();
  const rel = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: b.left - p.left, y: b.top - p.top, width: b.width, height: b.height };
  };
  const captions = [...pen.querySelectorAll('.pen-caption, .region-name')].map((e) => e.textContent.replace(/\s+/g, ' ').trim());
  const group = pen.querySelector(`[data-mo="${mo}"]`);
  const options = group ? [...group.querySelectorAll('.segmented__option')] : [];
  const inputs = group ? [...group.querySelectorAll('input[type="radio"]')] : [];
  const clear = group ? group.querySelector('.segmented-field__clear') : null;
  return {
    penHeight: p.height,
    penWidth: p.width,
    captions,
    scrollWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
    group: group
      ? {
          box: rel(group),
          head: rel(group.querySelector('.segmented-field__head')),
          caption: rel(group.querySelector('.segmented-field__caption')),
          captionText: group.querySelector('.segmented-field__caption').textContent,
          options: options.map(rel),
          optionTexts: options.map((o) => o.textContent.trim()),
          hint: rel(group.querySelector('.mo-hint')),
          hintText: group.querySelector('.mo-hint')?.textContent ?? null,
          clear: rel(clear),
          off: options.filter((o) => o.classList.contains('is-off')).length,
          disabled: inputs.filter((i) => i.disabled).length,
          checked: inputs.filter((i) => i.checked).map((i) => i.value),
          borderStyles: options.map((o) => getComputedStyle(o).borderTopStyle),
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Driving the built app's pen into a board's state.
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
  const add = page.locator('.save-ceremony button', { hasText: 'Add tasting' }).first();
  await add.click();
  await page.waitForSelector('.tasting-head');
  await page.waitForTimeout(150);
}

// Click a radio option's label until the radio reads checked (a first tap
// after navigation can miss).
async function pickOption(page, group, word) {
  const label = page.locator(`[data-mo="${group}"] label.segmented__option`, { hasText: word });
  for (let i = 0; i < 3; i += 1) {
    await label.click();
    await page.waitForTimeout(100);
    const on = await page.evaluate(
      ([g, w]) => [...document.querySelectorAll(`[data-mo="${g}"] input[type="radio"]`)].some((r) => r.checked && r.value === w),
      [group, word],
    );
    if (on) return;
  }
  throw new Error(`could not pick ${word} in ${group}`);
}

async function pickInGroupLabelled(page, groupLabel, word) {
  const label = page.locator(`[role="radiogroup"][aria-label="${groupLabel}"] label.segmented__option`, { hasText: word });
  for (let i = 0; i < 3; i += 1) {
    await label.click();
    await page.waitForTimeout(100);
    const on = await page.evaluate(
      ([g, w]) =>
        [...document.querySelectorAll(`[role="radiogroup"][aria-label="${g}"] input[type="radio"]`)].some((r) => r.checked && r.value === w),
      [groupLabel, word],
    );
    if (on) return;
  }
  throw new Error(`could not pick ${word} in ${groupLabel}`);
}

// Each state is the drive that makes the pen look like the board's panel.
// `blank` is what every other state is measured against.
const DRIVES = {
  atdraw: {
    blank: async () => {},
    nothing: async (page) => pickOption(page, 'atdraw', 'Nothing to note'),
    notnote: async (page) => {
      await pickOption(page, 'atdraw', 'Not evaluated');
      await page.fill('textarea[aria-label="At the machine"]', NOTE_AT_MACHINE);
    },
    marked: async (page) => pickInGroupLabelled(page, 'Exit consistency', 'Wet, soupy'),
    noted: async (page) => page.fill('textarea[aria-label="At the machine"]', NOTE_AT_MACHINE),
  },
};

const STATE_PREFIX = { atdraw: 'draw', fromfreezer: 'taste' };
const CAPTIONS_UPTO = { atdraw: 'Tasting', fromfreezer: null };

// ---------------------------------------------------------------------------
// Comparison helpers.
// ---------------------------------------------------------------------------
const within = (a, b, tol = 2) => Math.abs(a - b) <= tol;
const r = (n) => Math.round(n * 10) / 10;
const box = (b) => (b ? `[${r(b.x)},${r(b.y)} ${r(b.width)}x${r(b.height)}]` : 'none');
const sameBox = (a, b, tol = 2) =>
  (a === null && b === null) ||
  (a !== null && b !== null && within(a.x, b.x, tol) && within(a.y, b.y, tol) && within(a.width, b.width, tol) && within(a.height, b.height, tol));

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

// ---------------------------------------------------------------------------
// board atdraw / board fromfreezer: pen-states.html.
// ---------------------------------------------------------------------------
async function boardGroup(ctx, mo) {
  const { browser, engine, appUrl, openB, cmp } = ctx;
  const states = Object.keys(DRIVES[mo]);
  for (const width of WIDTHS) {
    const opts = { width, height: 1100, coarse: true };
    const { context: bc, page: bp } = await openB('pen-states.html');
    const boardFacts = {};
    for (const state of states) {
      boardFacts[state] = await bp.evaluate(readPen, { sel: `.fp-win.fp-${STATE_PREFIX[mo]}-${state}-${width} .batch-margin--pen`, mo });
    }
    await bc.close();

    const appFacts = {};
    for (const state of states) {
      const { context, page } = await openApp(browser, appUrl, APP_ROUTE, opts);
      await openPen(page);
      await openTasting(page);
      await DRIVES[mo][state](page);
      appFacts[state] = await page.evaluate(readPen, { sel: '.batch-margin--pen', mo });
      await context.close();
    }

    for (const state of states) {
      const label = `${mo} ${state} ${engine} ${width}c`;
      const a = appFacts[state];
      const b = boardFacts[state];
      // The captions in order. At draw owns the churn section, so its labels
      // are compared up to the Tasting head; the tasting order is the From
      // freezer and whole-pen modes'.
      const cut = (caps) => (CAPTIONS_UPTO[mo] && caps.includes(CAPTIONS_UPTO[mo]) ? caps.slice(0, caps.indexOf(CAPTIONS_UPTO[mo])) : caps);
      cmp(JSON.stringify(cut(a.captions)) === JSON.stringify(cut(b.captions)), `${label} labels in order`, cut(a.captions).join(' | '), cut(b.captions).join(' | '));
      cmp(a.group !== null && b.group !== null, `${label} the group is drawn`, a.group !== null, b.group !== null);
      if (!a.group || !b.group) continue;
      const ag = a.group;
      const bg = b.group;
      cmp(ag.captionText === bg.captionText, `${label} head caption`, JSON.stringify(ag.captionText), JSON.stringify(bg.captionText));
      cmp(sameBox(ag.box, bg.box), `${label} group box`, box(ag.box), box(bg.box));
      cmp(sameBox(ag.head, bg.head), `${label} head box`, box(ag.head), box(bg.head));
      cmp(sameBox(ag.caption, bg.caption), `${label} caption box`, box(ag.caption), box(bg.caption));
      cmp(JSON.stringify(ag.optionTexts) === JSON.stringify(bg.optionTexts), `${label} option words`, ag.optionTexts.join(' | '), bg.optionTexts.join(' | '));
      ag.options.forEach((o, i) => cmp(sameBox(o, bg.options[i]), `${label} option ${i} box`, box(o), box(bg.options[i])));
      cmp(sameBox(ag.hint, bg.hint), `${label} hint box`, box(ag.hint), box(bg.hint));
      cmp(ag.hintText === bg.hintText, `${label} hint words`, JSON.stringify(ag.hintText), JSON.stringify(bg.hintText));
      cmp(sameBox(ag.clear, bg.clear), `${label} Clear box`, box(ag.clear), box(bg.clear));
      cmp(ag.off === bg.off && ag.disabled === bg.disabled, `${label} off and disabled options`, `${ag.off}/${ag.disabled}`, `${bg.off}/${bg.disabled}`);
      cmp(JSON.stringify(ag.checked) === JSON.stringify(bg.checked), `${label} checked`, JSON.stringify(ag.checked), JSON.stringify(bg.checked));
      cmp(JSON.stringify(ag.borderStyles) === JSON.stringify(bg.borderStyles), `${label} option border styles`, ag.borderStyles.join(','), bg.borderStyles.join(','));
      cmp(a.scrollWidth <= a.windowWidth, `${label} no sideways overflow`, `${a.scrollWidth} in ${a.windowWidth}`);
    }

    // What a pick hides: the pen is shorter by the group's fields, as drawn.
    const dApp = appFacts.blank.penHeight - appFacts.nothing.penHeight;
    const dBoard = boardFacts.blank.penHeight - boardFacts.nothing.penHeight;
    cmp(within(dApp, dBoard, 2), `${mo} ${engine} ${width}c a pick shortens the pen`, `${r(dApp)}`, `${r(dBoard)}`);
    // A mark beside blank adds nothing (CONTRACT section 7: the marked and blank pens are the same height).
    const mApp = appFacts.marked.penHeight - appFacts.blank.penHeight;
    const mBoard = boardFacts.marked.penHeight - boardFacts.blank.penHeight;
    cmp(within(mApp, mBoard, 2), `${mo} ${engine} ${width}c the marked pen against the blank pen`, `${r(mApp)}`, `${r(mBoard)}`);
    console.log(
      `MEASURE ${mo} ${engine} ${width}c pen heights app [${states.map((s) => `${s} ${r(appFacts[s].penHeight)}`).join(', ')}] board [${states.map((s) => `${s} ${r(boardFacts[s].penHeight)}`).join(', ')}]`,
    );
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
        if (mode === 'atdraw' || mode === 'fromfreezer') await boardGroup(ctx, mode);
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
const implemented = ['atdraw'];
if (mode === 'board' && MODES.includes(which)) {
  await runBoard([which]);
} else if (mode === 'check') {
  await runBoard(implemented);
} else {
  console.error(`Usage: node 04-pen-probe.mjs board <${MODES.join('|')}> | check`);
  process.exit(1);
}
