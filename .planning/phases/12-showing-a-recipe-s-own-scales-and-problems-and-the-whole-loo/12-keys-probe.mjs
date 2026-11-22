// 12-13: the keys that add and move a step or an ingredient row from where the maker types
// (STRUCT-05; sketch 016 CONTRACT section 6 and section 11, numbers 7, 8, 9, 10, 11), and the one
// line under each region's heading that teaches them. This drives the BUILT app in WebKit at 1366
// with a coarse pointer, pressing the real combinations (keyboard.press 'Meta+Enter',
// 'Control+Enter', 'Control+Meta+ArrowUp', 'Control+Meta+ArrowDown'), and reports PASS or FAIL
// lines; it exits 1 on any FAIL. Modes are arguments:
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-13" --emptyOutDir
//   PROBE_DIST="$S/dist-13" node .planning/phases/12-*/12-keys-probe.mjs move keys lines
//
//   move   the caret after a keyed move (research Pitfall 1, assumption A1): in Step 2's lead-in
//          Control+Meta+ArrowUp and ArrowDown swap the steps, the same field of the moved step holds
//          focus and its selection (collapsed and ranged), no Move button is focused, the structure
//          region reads 'Step 1 of 2' and 'Step 2 of 2'; at the ends the order, the value, the caret
//          and the region are as they were, and the region is not written to at all.
//   keys   every field of a step and a row's grams (the field-by-field matrix), the add keys, held
//          keys, the picker's landing and Cancel, fields outside a step.
//   lines  the one `p.mk-keys` line under each region's heading, its words, its places, its tokens.
//
// Every line is device-unverified: it is Playwright WebKit on a Mac, not Mark's iPad. The caret after a
// keyed move rests on React DOM's own post-commit selection restore; the iPad is PROOF-02's row 2
// (D-11). The probe reads the build from PROBE_DIST and NEVER builds or writes it (never app/dist, which
// Mark's own `vite preview --host` serves); it serves that folder on an ephemeral 127.0.0.1 port through
// 08-walk-server.mjs, and every request to another host is aborted. Everything typed is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { coffeeBase } from './12-board-rowcontrols.mjs';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

// No default: the probe must never fall back to app/dist.
if (!process.env.PROBE_DIST) {
  console.log('FAIL PROBE_DIST is not set: build to a scratch folder and pass it (the probe never serves app/dist)');
  process.exit(1);
}
const DIST = path.resolve(process.env.PROBE_DIST);
if (!existsSync(path.join(DIST, 'index.html'))) {
  console.log(`FAIL no index.html in PROBE_DIST ${DIST}`);
  process.exit(1);
}

const MODES = process.argv.slice(2);
const KNOWN = ['move', 'keys', 'lines'];
if (MODES.length === 0 || MODES.some((mode) => !KNOWN.includes(mode))) {
  console.log(`FAIL usage: node 12-keys-probe.mjs <${KNOWN.join('|')}>...`);
  process.exit(1);
}

let failures = 0;
let passes = 0;
let mode = '';
function report(ok, what, detail = '') {
  if (ok) passes += 1;
  else failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${mode} ${what}${detail ? ` (${detail})` : ''}`);
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------------------
// In-page readers.
// ---------------------------------------------------------------------------
// The focused control: its label, kind and, for a text field, its value and selection.
const FOCUS = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const text = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT';
  return {
    label: el.getAttribute('aria-label') ?? (el.textContent ?? '').trim(),
    tag: el.tagName,
    act: el.getAttribute('data-act'),
    value: text ? el.value : null,
    start: text ? el.selectionStart : null,
    end: text ? el.selectionEnd : null,
  };
};

const LEAD_INS = () => [...document.querySelectorAll('li.mk-step textarea[data-field="lead-in"]')].map((el) => el.value);
const STEP_COUNT = () => document.querySelectorAll('li.mk-step').length;
// A row's lines, in table order, by their grams field: `${name} | ${grams}`.
const ROW_ORDER = () =>
  [...document.querySelectorAll('.ingredient-table-region tr[data-line]')].map((tr) => ({
    line: tr.getAttribute('data-line'),
    name: tr.querySelector('textarea').getAttribute('aria-label').replace(/, grams.*$/, ''),
    grams: tr.querySelector('textarea').value,
  }));
// A step's uses, by names, in the step's own order (the sentence of its uses line).
const USES_LINES = () => [...document.querySelectorAll('li.mk-step p.method-step__uses-line')].map((p) => p.firstChild.textContent.trim());

// The structure region (the polite word for every structure change): a watcher counts every write to it,
// so "says nothing" is measured, not read off a text that might repeat.
const WATCH = () => {
  const el = document.querySelector('.mk-page > p.visually-hidden[role="status"]');
  window.__structure = { mutations: 0 };
  new MutationObserver(() => {
    window.__structure.mutations += 1;
  }).observe(el, { childList: true, characterData: true, subtree: true });
};
const RESET_WATCH = () => {
  window.__structure.mutations = 0;
};
const STRUCTURE = () => ({
  text: document.querySelector('.mk-page > p.visually-hidden[role="status"]').textContent,
  mutations: window.__structure.mutations,
});

const { appUrl, close } = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );

  const freshPage = async (flow) => {
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    await page.goto(`${appUrl}/notebook`, { waitUntil: 'load' });
    await page.waitForSelector('.nb__head');
    await page.waitForTimeout(700);
    await flow(page);
    await page.evaluate(WATCH);
    return page;
  };
  const byLabel = (page, text) => page.locator(`[aria-label="${text}"]`);
  // Focus a text field and put its caret or range where the case says.
  const place = async (page, label, start, end = start) => {
    await byLabel(page, label).focus();
    await page.evaluate(([text, from, to]) => document.querySelector(`[aria-label="${text}"]`).setSelectionRange(from, to), [label, start, end]);
  };
  // A press, then the frame the structure word is written on and the render after it.
  const press = async (page, combo) => {
    await page.keyboard.press(combo);
    await page.waitForTimeout(250);
  };
  const structure = (page) => page.evaluate(STRUCTURE);

  // ---------------------------------------------------------------------------------------------
  // move: the caret after a keyed move, in the lead-in (Task 1's tracer).
  // ---------------------------------------------------------------------------------------------
  if (MODES.includes('move')) {
    mode = 'move';
    const page = await freshPage(coffeeBase);
    const selections = [
      ['collapsed caret', 2, 2],
      ['ranged selection', 1, 4],
    ];
    for (const [kind, start, end] of selections) {
      // Step 2's lead-in reads 'Churn'; up makes it Step 1, down puts it back.
      await place(page, 'Step 2, lead-in', start, end);
      await page.evaluate(RESET_WATCH);
      await press(page, 'Control+Meta+ArrowUp');
      let focus = await page.evaluate(FOCUS);
      let said = await structure(page);
      report(same(await page.evaluate(LEAD_INS), ['Churn', 'Steep']), `ArrowUp from Step 2's lead-in (${kind}): the lead-ins read in the swapped order`, JSON.stringify(await page.evaluate(LEAD_INS)));
      report(
        focus?.label === 'Step 1, lead-in' && focus?.value === 'Churn' && focus?.tag === 'TEXTAREA' && focus?.act === null,
        `ArrowUp (${kind}): the textarea now labelled 'Step 1, lead-in' holds focus with the moved step's words, no Move button is focused`,
        JSON.stringify(focus),
      );
      report(focus?.start === start && focus?.end === end, `ArrowUp (${kind}): the selection is ${start}-${end} as before`, `${focus?.start}-${focus?.end}`);
      report(said.text === 'Step 1 of 2', `ArrowUp (${kind}): the structure region reads 'Step 1 of 2'`, JSON.stringify(said));

      await page.evaluate(RESET_WATCH);
      await press(page, 'Control+Meta+ArrowDown');
      focus = await page.evaluate(FOCUS);
      said = await structure(page);
      report(same(await page.evaluate(LEAD_INS), ['Steep', 'Churn']), `ArrowDown (${kind}): the lead-ins read in their first order again`, JSON.stringify(await page.evaluate(LEAD_INS)));
      report(
        focus?.label === 'Step 2, lead-in' && focus?.value === 'Churn' && focus?.act === null,
        `ArrowDown (${kind}): the textarea labelled 'Step 2, lead-in' holds focus with the moved step's words, no Move button is focused`,
        JSON.stringify(focus),
      );
      report(
        focus?.start === start && focus?.end === end && said.text === 'Step 2 of 2',
        `ArrowDown (${kind}): the selection is ${start}-${end} as before and the structure region reads 'Step 2 of 2'`,
        `${focus?.start}-${focus?.end}, ${JSON.stringify(said)}`,
      );
    }

    // The ends: nothing moves, nothing is said (a greyed Move does nothing today).
    for (const [where, label, combo] of [
      ['the last step, ArrowDown', 'Step 2, lead-in', 'Control+Meta+ArrowDown'],
      ['the first step, ArrowUp', 'Step 1, lead-in', 'Control+Meta+ArrowUp'],
    ]) {
      await place(page, label, 2, 4);
      const before = { leadIns: await page.evaluate(LEAD_INS), focus: await page.evaluate(FOCUS) };
      await page.evaluate(RESET_WATCH);
      await press(page, combo);
      const after = { leadIns: await page.evaluate(LEAD_INS), focus: await page.evaluate(FOCUS) };
      const said = await structure(page);
      report(
        same(before, after) && said.mutations === 0,
        `${where} at the end: the order, the value, the caret are as they were and the structure region is not written to`,
        `${JSON.stringify(after)}, ${said.mutations} writes`,
      );
    }
    await page.close();
  }

  await context.close();
} catch (err) {
  failures += 1;
  console.log(`FAIL ${mode || 'probe'} error: ${String(err.stack ?? err).split('\n').slice(0, 3).join(' | ')}`);
} finally {
  await browser.close();
  await close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 || passes === 0 ? 1 : 0);
