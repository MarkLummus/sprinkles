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
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
// No default: the probe must never fall back to app/dist.
if (!process.env.PROBE_DIST) {
  console.log('FAIL PROBE_DIST is not set: build to a scratch folder and pass it (the probe never serves app/dist)');
  process.exit(1);
}
const DIST = path.resolve(process.env.PROBE_DIST);
const realOf = (candidate) => {
  try {
    return realpathSync(candidate);
  } catch {
    return candidate;
  }
};
if (
  realOf(DIST) === realOf(path.join(REPO_ROOT, 'app', 'dist')) ||
  DIST.endsWith(`${path.sep}app${path.sep}dist`) ||
  realOf(DIST).endsWith(`${path.sep}app${path.sep}dist`)
) {
  console.log(`FAIL PROBE_DIST resolves to app/dist (${DIST}): build to a scratch folder instead`);
  process.exit(1);
}
if (!existsSync(path.join(DIST, 'index.html'))) {
  console.log(`FAIL no index.html in PROBE_DIST ${DIST}`);
  process.exit(1);
}

const BOARD = path.join(HERE, '..', '..', 'sketches/016-entry-points-pen-preview-row-controls/row-controls.html');

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
// The rows of one group (a step's number, 0 for no step), in table order.
const GROUP_ROWS = (group) =>
  [...document.querySelectorAll('.ingredient-table-region tr[data-line]')]
    .filter((tr) => tr.getAttribute('data-line').endsWith(`:${group}`))
    .map((tr) => tr.querySelector('textarea').getAttribute('aria-label').replace(/, grams.*$/, ''));
const GRAMS_LINE = (line) => {
  const el = document.querySelector(`tr[data-line="${line}"] textarea`);
  return el ? { label: el.getAttribute('aria-label'), value: el.value, start: el.selectionStart, end: el.selectionEnd, focused: document.activeElement === el } : null;
};
const PICKER = () => {
  const pick = document.querySelector('.ingredient-table-region .pick');
  const name = pick?.querySelector('.ing__filters textarea') ?? null;
  return { open: pick !== null, count: document.querySelectorAll('.ingredient-table-region .pick').length, nameFocused: name !== null && document.activeElement === name };
};
const SNAPSHOT = () => ({
  leadIns: [...document.querySelectorAll('li.mk-step textarea[data-field="lead-in"]')].map((el) => el.value),
  rows: [...document.querySelectorAll('.ingredient-table-region tr[data-line]')].map((tr) => tr.getAttribute('data-line')),
  uses: [...document.querySelectorAll('li.mk-step p.method-step__uses-line')].map((p) => p.firstChild.textContent.trim()),
});

// The structure region (the polite word for every structure change): a watcher counts every write to it,
// so "says nothing" is measured, not read off a text that might repeat.
const WATCH = () => {
  const el = document.querySelector('.mk-page > p.visually-hidden[role="status"]');
  window.__structure = { mutations: 0, log: [] };
  new MutationObserver(() => {
    window.__structure.mutations += 1;
    window.__structure.log.push(el.textContent);
  }).observe(el, { childList: true, characterData: true, subtree: true });
};
const RESET_WATCH = () => {
  window.__structure.mutations = 0;
  window.__structure.log = [];
};
// What was said since the last reset: every run of words between two empty states is one announcement.
const STRUCTURE = () => {
  const log = window.__structure.log;
  const said = log.filter((text, i) => text !== '' && (i === 0 || log[i - 1] === ''));
  return {
    text: document.querySelector('.mk-page > p.visually-hidden[role="status"]').textContent,
    mutations: window.__structure.mutations,
    said,
  };
};

const { appUrl, close } = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
try {
  // A mode starts in its own context, so its stored drafts are its own.
  const contexts = [];
  const freshPage = async (flow) => {
    const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
    contexts.push(context);
    await context.route('**/*', (request) =>
      new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
    );
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

  // ---------------------------------------------------------------------------------------------
  // keys: every field of a step, a row's grams, the add keys, held keys, fields outside a step.
  // ---------------------------------------------------------------------------------------------
  if (MODES.includes('keys')) {
    mode = 'keys';
    const escaped = (name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pickRow = (page, name) =>
      page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp(`^${escaped(name)}$`) }) });
    const uses = (page, n, name) =>
      page.locator(`.method-step[data-step="${n}"] .method-step__uses-item`, { hasText: name }).locator('input');
    const cancelPicker = (page) => page.locator('.ingredient-table-region .pick__head button').first().click();
    const GRAMS = (name) => `${name}, grams`;
    const HEAVY = 'Heavy cream, 36% fat';
    const BEANS = 'Coffee beans';
    const EGG = 'Egg yolk (fresh)';
    const MILK = 'Whole milk, 3.5% fat';

    const page = await freshPage(coffeeBase);
    const written = { label: 'Heat to', value: '82 °C', purpose: 'Pulls the coffee into the cream.', aside: 'Do not let it boil.' };
    await byLabel(page, 'Step 1, Add target').click();
    await page.fill('[aria-label="Step 1, target label"]', written.label);
    await page.fill('[aria-label="Step 1, target value"]', written.value);
    await byLabel(page, 'Step 1, add purpose').click();
    await page.fill('[aria-label="Step 1, purpose"]', written.purpose);
    await byLabel(page, 'Step 1, add aside').click();
    await page.fill('[aria-label="Step 1, aside"]', written.aside);
    await page.waitForTimeout(300);

    // -- a step's six fields: the add keys -------------------------------------------------------------
    const STEP_FIELDS = ['lead-in', 'instruction', 'purpose', 'aside', 'target label', 'target value'];
    const selectionsFor = (value) => [
      ['collapsed caret', 1, 1],
      ['ranged selection', 1, Math.min(4, value.length)],
    ];
    for (const suffix of STEP_FIELDS) {
      for (const combo of ['Meta+Enter', 'Control+Enter']) {
        const label = `Step 1, ${suffix}`;
        const before = await byLabel(page, label).inputValue();
        await place(page, label, 1, Math.min(3, before.length));
        await press(page, combo);
        const focus = await page.evaluate(FOCUS);
        const count = await page.evaluate(STEP_COUNT);
        const after = await byLabel(page, label).inputValue();
        report(
          count === 3 && focus?.label === 'Step 2, lead-in' && focus?.value === '' && after === before,
          `${combo} in ${label}: a step lands after it with focus in its lead-in, and the field's words are unchanged`,
          `${count} steps, ${JSON.stringify(focus)}`,
        );
        await byLabel(page, 'Step 2, remove').click();
        await page.waitForTimeout(150);
      }
    }
    // A held Cmd+Return (repeat true) adds nothing, in a prose field and a one-line field.
    for (const label of ['Step 1, instruction', 'Step 1, lead-in']) {
      await place(page, label, 1, 1);
      await page.evaluate(() => {
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, repeat: true, bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(200);
      report((await page.evaluate(STEP_COUNT)) === 2 && (await page.evaluate(FOCUS))?.label === label, `a held Meta+Enter (repeat) in ${label} adds nothing`, `${await page.evaluate(STEP_COUNT)} steps`);
    }

    // -- a step's other fields: the move keys, caret kept -----------------------------------------------
    for (const suffix of STEP_FIELDS.slice(1)) {
      const value = await byLabel(page, `Step 1, ${suffix}`).inputValue();
      for (const [kind, start, end] of selectionsFor(value)) {
        await place(page, `Step 1, ${suffix}`, start, end);
        await page.evaluate(RESET_WATCH);
        await press(page, 'Control+Meta+ArrowDown');
        let focus = await page.evaluate(FOCUS);
        let said = await structure(page);
        report(
          same(await page.evaluate(LEAD_INS), ['Churn', 'Steep']) && focus?.label === `Step 2, ${suffix}` && focus?.value === value && focus?.act === null,
          `ArrowDown in Step 1, ${suffix} (${kind}): the step moves down and the same field holds focus`,
          JSON.stringify(focus),
        );
        report(
          focus?.start === start && focus?.end === end && same(said.said, ['Step 2 of 2']),
          `ArrowDown in ${suffix} (${kind}): the selection is ${start}-${end} as before and 'Step 2 of 2' is said once`,
          `${focus?.start}-${focus?.end}, ${JSON.stringify(said.said)}`,
        );
        await page.evaluate(RESET_WATCH);
        await press(page, 'Control+Meta+ArrowUp');
        focus = await page.evaluate(FOCUS);
        said = await structure(page);
        report(
          same(await page.evaluate(LEAD_INS), ['Steep', 'Churn']) && focus?.label === `Step 1, ${suffix}` && focus?.start === start && focus?.end === end && same(said.said, ['Step 1 of 2']),
          `ArrowUp in Step 2, ${suffix} (${kind}): the step moves back, the same field holds focus and the selection ${start}-${end}, 'Step 1 of 2' said once`,
          `${JSON.stringify(focus)}, ${JSON.stringify(said.said)}`,
        );
      }
    }
    // Insurance: an empty purpose field is not closed by a blur from the move.
    await byLabel(page, 'Step 2, add purpose').click();
    await page.waitForSelector('[aria-label="Step 2, purpose"]');
    await place(page, 'Step 2, purpose', 0, 0);
    await press(page, 'Control+Meta+ArrowUp');
    let focus = await page.evaluate(FOCUS);
    report(
      same(await page.evaluate(LEAD_INS), ['Churn', 'Steep']) && focus?.label === 'Step 1, purpose' && focus?.value === '',
      'ArrowUp from an empty purpose field: the field is still open and holds focus (no blur closed it)',
      JSON.stringify(focus),
    );
    await press(page, 'Control+Meta+ArrowDown');
    focus = await page.evaluate(FOCUS);
    report(focus?.label === 'Step 2, purpose' && same(await page.evaluate(LEAD_INS), ['Steep', 'Churn']), 'ArrowDown puts the empty purpose field back, still open and focused', JSON.stringify(focus));
    await byLabel(page, 'Step 1, lead-in').focus();

    // -- a row's grams: the move keys on a group of two (the board's Heavy cream case) -------------------
    for (const [kind, start, end] of [['collapsed caret', 1, 1], ['ranged selection', 1, 2]]) {
      await place(page, GRAMS(HEAVY), start, end);
      await page.evaluate(RESET_WATCH);
      await press(page, 'Control+Meta+ArrowDown');
      let grams = await page.evaluate(FOCUS);
      let said = await structure(page);
      report(
        same(await page.evaluate(GROUP_ROWS, 1), [BEANS, HEAVY]) && grams?.label === GRAMS(HEAVY) && grams?.value === '400' && grams?.act === null && grams?.start === start && grams?.end === end,
        `ArrowDown in ${HEAVY}'s grams (${kind}): the row moves within step 1, the grams hold focus and the selection ${start}-${end}`,
        JSON.stringify(grams),
      );
      report(same(said.said, [`${HEAVY}, row 2 of 2 in step 1`]), `the announcement reads '${HEAVY}, row 2 of 2 in step 1' (${kind})`, JSON.stringify(said.said));
      await page.evaluate(RESET_WATCH);
      await press(page, 'Control+Meta+ArrowUp');
      grams = await page.evaluate(FOCUS);
      said = await structure(page);
      report(
        same(await page.evaluate(GROUP_ROWS, 1), [HEAVY, BEANS]) && grams?.label === GRAMS(HEAVY) && grams?.start === start && grams?.end === end && same(said.said, [`${HEAVY}, row 1 of 2 in step 1`]),
        `ArrowUp in ${HEAVY}'s grams (${kind}): back to row 1, the caret kept, '${HEAVY}, row 1 of 2 in step 1' said`,
        `${JSON.stringify(grams)}, ${JSON.stringify(said.said)}`,
      );
    }
    for (const [where, name, combo] of [['the first row, ArrowUp', HEAVY, 'Control+Meta+ArrowUp'], ['the last row, ArrowDown', BEANS, 'Control+Meta+ArrowDown']]) {
      await place(page, GRAMS(name), 1, 2);
      const before = { rows: await page.evaluate(GROUP_ROWS, 1), focus: await page.evaluate(FOCUS) };
      await page.evaluate(RESET_WATCH);
      await press(page, combo);
      const after = { rows: await page.evaluate(GROUP_ROWS, 1), focus: await page.evaluate(FOCUS) };
      const said = await structure(page);
      report(same(before, after) && said.mutations === 0, `${where} at a group's end: nothing moves and nothing is said`, `${said.mutations} writes`);
    }

    // -- a row's grams: Add ingredient by key, the picker, Cancel ------------------------------------------
    for (const [combo, kind, start, end] of [['Meta+Enter', 'collapsed caret', 1, 1], ['Control+Enter', 'ranged selection', 1, 2]]) {
      await place(page, GRAMS(HEAVY), start, end);
      await press(page, combo);
      const open = await page.evaluate(PICKER);
      report(open.open && open.count === 1 && open.nameFocused, `${combo} in ${HEAVY}'s grams (${kind}) opens the picker once with focus in its Name`, JSON.stringify(open));
      await cancelPicker(page);
      await page.waitForTimeout(200);
      const back = await page.evaluate(FOCUS);
      report(!(await page.evaluate(PICKER)).open && back?.label === GRAMS(HEAVY), `Cancel after ${combo} returns focus to ${HEAVY}'s grams`, JSON.stringify(back));
    }
    // A held Meta+Enter in the grams opens nothing.
    await place(page, GRAMS(HEAVY), 1, 1);
    await page.evaluate(() => {
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, repeat: true, bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(200);
    report(!(await page.evaluate(PICKER)).open, 'a held Meta+Enter (repeat) in the grams opens no picker');
    // Open from Heavy cream, then Meta+Enter in Coffee beans' grams: still one picker, Name focused, the pick lands after Coffee beans.
    await press(page, 'Meta+Enter');
    await byLabel(page, GRAMS(BEANS)).focus();
    await press(page, 'Meta+Enter');
    const moved = await page.evaluate(PICKER);
    report(moved.open && moved.count === 1 && moved.nameFocused, "with the picker open, Meta+Enter in another row's grams keeps it open and focuses Name", JSON.stringify(moved));
    await pickRow(page, EGG).click();
    await page.waitForSelector('.ingredient-table-region .pick', { state: 'detached' });
    await page.fill(`[aria-label="${GRAMS(EGG)}"]`, '60');
    let landed = await page.evaluate(FOCUS);
    report(same(await page.evaluate(GROUP_ROWS, 1), [HEAVY, BEANS, EGG]) && landed?.label === GRAMS(EGG), 'the pick lands after Coffee beans in step 1 with focus in its grams', `${JSON.stringify(await page.evaluate(GROUP_ROWS, 1))}, ${landed?.label}`);
    // Meta+Enter opens it from Heavy cream: the pick lands right after Heavy cream.
    await place(page, GRAMS(HEAVY), 0, 0);
    await press(page, 'Meta+Enter');
    await pickRow(page, MILK).click();
    await page.waitForSelector('.ingredient-table-region .pick', { state: 'detached' });
    await page.fill(`[aria-label="${GRAMS(MILK)}"]`, '90');
    landed = await page.evaluate(FOCUS);
    report(same(await page.evaluate(GROUP_ROWS, 1), [HEAVY, MILK, BEANS, EGG]) && landed?.label === GRAMS(MILK), 'Meta+Enter in Heavy cream, then a pick: it lands right after Heavy cream, focus in its grams', JSON.stringify(await page.evaluate(GROUP_ROWS, 1)));

    // -- held Control+Cmd+Down in the grams: one place per repeat, stops at the end ---------------------------
    await place(page, GRAMS(HEAVY), 1, 1);
    await page.evaluate(() => {
      window.__repeats = [];
      document.addEventListener('keydown', (event) => event.key === 'ArrowDown' && window.__repeats.push(event.repeat), true);
    });
    await page.evaluate(RESET_WATCH);
    await page.keyboard.down('Control');
    await page.keyboard.down('Meta');
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.down('ArrowDown');
      await page.waitForTimeout(220);
    }
    await page.keyboard.up('ArrowDown');
    await page.keyboard.up('Meta');
    await page.keyboard.up('Control');
    await page.waitForTimeout(200);
    const repeats = await page.evaluate(() => window.__repeats);
    const held = await structure(page);
    const finalFocus = await page.evaluate(FOCUS);
    report(repeats.length === 5 && repeats.slice(1).every(Boolean), 'the held key reached the page as one press and four repeats', JSON.stringify(repeats));
    report(
      same(await page.evaluate(GROUP_ROWS, 1), [MILK, BEANS, EGG, HEAVY]) && finalFocus?.label === GRAMS(HEAVY) && finalFocus?.start === 1,
      `held Control+Meta+ArrowDown moved ${HEAVY} one place per keydown to the end of its group, the caret kept`,
      JSON.stringify(await page.evaluate(GROUP_ROWS, 1)),
    );
    report(
      same(held.said, [`${HEAVY}, row 2 of 4 in step 1`, `${HEAVY}, row 3 of 4 in step 1`, `${HEAVY}, row 4 of 4 in step 1`]),
      'the held key said each place once and nothing more at the end',
      JSON.stringify(held.said),
    );

    // -- a row in no step (draft.rows order), a split row's line ---------------------------------------------
    await page.locator('.ingredient-table-region .mk-head-act').click();
    await pickRow(page, 'Cinnamon').click();
    await page.waitForSelector('.ingredient-table-region .pick', { state: 'detached' });
    await page.fill(`[aria-label="${GRAMS('Cinnamon')}"]`, '2');
    const salt = 'Fine sea salt';
    for (const [kind, start, end] of [['collapsed caret', 0, 0], ['ranged selection', 0, 1]]) {
      const order = await page.evaluate(GROUP_ROWS, 0);
      await place(page, GRAMS(salt), start, end);
      await page.evaluate(RESET_WATCH);
      await press(page, 'Control+Meta+ArrowDown');
      const down = await page.evaluate(FOCUS);
      const said = await structure(page);
      report(
        same(order, [salt, 'Cinnamon']) && same(await page.evaluate(GROUP_ROWS, 0), ['Cinnamon', salt]) && down?.label === GRAMS(salt) && down?.start === start && down?.end === end && same(said.said, [`${salt}, row 2 of 2, not in a step yet`]),
        `ArrowDown in the grams of a row in no step (${kind}): it moves in draft.rows order, the caret kept, '${salt}, row 2 of 2, not in a step yet'`,
        `${JSON.stringify(await page.evaluate(GROUP_ROWS, 0))}, ${JSON.stringify(said.said)}`,
      );
      await press(page, 'Control+Meta+ArrowUp');
      report(same(await page.evaluate(GROUP_ROWS, 0), [salt, 'Cinnamon']), `ArrowUp puts it back (${kind})`);
    }
    // Heavy cream also in step 2: two lines, and a move on its step-2 line moves that group only.
    await byLabel(page, 'Step 2, change ingredients').click();
    await uses(page, 2, 'Heavy cream').click();
    await byLabel(page, 'Step 2, done').click();
    await page.waitForTimeout(200);
    const step1Before = await page.evaluate(GROUP_ROWS, 1);
    const step2Before = await page.evaluate(GROUP_ROWS, 2);
    const splitLine = await page.evaluate(() =>
      [...document.querySelectorAll('tr[data-line$=":2"]')].find((tr) => tr.textContent.includes('Heavy cream'))?.getAttribute('data-line'),
    );
    await page.evaluate((line) => {
      const el = document.querySelector(`tr[data-line="${line}"] textarea`);
      el.focus();
      el.setSelectionRange(0, 0);
    }, splitLine);
    await page.evaluate(RESET_WATCH);
    await press(page, 'Control+Meta+ArrowUp');
    const split = await page.evaluate(GRAMS_LINE, splitLine);
    const splitSaid = await structure(page);
    report(
      step2Before.at(-1) === HEAVY && same(await page.evaluate(GROUP_ROWS, 2), [HEAVY, ...step2Before.slice(0, -1)]) && same(await page.evaluate(GROUP_ROWS, 1), step1Before) && split?.focused,
      "ArrowUp on one line of a split row moves only that line's group, the grams keep focus",
      `step 1 ${JSON.stringify(await page.evaluate(GROUP_ROWS, 1))}, step 2 ${JSON.stringify(await page.evaluate(GROUP_ROWS, 2))}`,
    );
    report(splitSaid.said.length === 1 && splitSaid.said[0].endsWith('in step 2'), 'the move on the split row names step 2', JSON.stringify(splitSaid.said));

    // -- an empty grams field: no blur closes anything or raises a message --------------------------------------
    await page.fill(`[aria-label="${GRAMS(EGG)}"]`, '');
    await place(page, GRAMS(EGG), 0, 0);
    const messagesBefore = await page.evaluate(() => document.querySelectorAll('.ingredient-table-region .field-error').length);
    await press(page, 'Control+Meta+ArrowUp');
    const empty = await page.evaluate(FOCUS);
    const messages = await page.evaluate(() => document.querySelectorAll('.ingredient-table-region .field-error').length);
    report(
      empty?.label === GRAMS(EGG) && empty?.value === '' && messages === messagesBefore,
      'ArrowUp from an empty grams field: it keeps focus and no message is raised by the move',
      `${JSON.stringify(empty)}, ${messagesBefore} messages before, ${messages} after`,
    );

    // -- fields outside a step get no key --------------------------------------------------------------------------------
    await page.fill(`[aria-label="${GRAMS(EGG)}"]`, '60');
    await page.locator('.ingredient-table-region .mk-head-act').click();
    await page.waitForSelector('.ingredient-table-region .pick');
    const outside = [
      ['Recipe name', () => byLabel(page, 'Recipe name')],
      ['Recipe description', () => byLabel(page, 'Recipe description')],
      ['Version name', () => byLabel(page, 'Version name')],
      ['Serving temperature (beside the Sheet)', () => byLabel(page, 'Serving temperature, degrees Celsius')],
      ["the picker's Name", () => page.locator('.ingredient-table-region .pick .ing__filters textarea')],
    ];
    for (const [name, find] of outside) {
      await find().focus();
      const before = await page.evaluate(SNAPSHOT);
      for (const combo of ['Meta+Enter', 'Control+Enter', 'Control+Meta+ArrowUp', 'Control+Meta+ArrowDown']) {
        await page.keyboard.press(combo);
        await page.waitForTimeout(120);
      }
      report(same(before, await page.evaluate(SNAPSHOT)), `the four combinations in ${name} change no step and no row`);
    }
    await cancelPicker(page);
    await page.close();
  }

  // ---------------------------------------------------------------------------------------------
  // lines: the one keys line under each region's heading row.
  // ---------------------------------------------------------------------------------------------
  if (MODES.includes('lines')) {
    mode = 'lines';
    // The words are the board's own, read from its markup (&#x27; is the plain apostrophe U+0027).
    const boardLines = [...readFileSync(BOARD, 'utf8').matchAll(/<p class="mk-keys">([^<]*)<\/p>/g)].map((match) => match[1].replaceAll('&#x27;', "'"));
    const [inStep, inRow] = [boardLines.find((line) => line.startsWith('In a step')), boardLines.find((line) => line.startsWith('In a row'))];
    report(Boolean(inStep && inRow), "the board's two lines are read from row-controls.html", JSON.stringify([inStep, inRow]));

    const escaped = (name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pickRow = (page, name) =>
      page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp(`^${escaped(name)}$`) }) });
    const clickUntil = async (page, target, selector) => {
      for (let i = 0; i < 6; i += 1) {
        await target().first().click();
        try {
          await page.waitForSelector(selector, { timeout: 1200 });
          return;
        } catch {
          // the first click after a navigation can miss: press again
        }
      }
      throw new Error(`never appeared: ${selector}`);
    };
    const page = await freshPage(async (p) => {
      await clickUntil(p, () => p.locator('.nb__head .notebook-action'), '.nb__new textarea');
      await p.fill('.nb__new textarea', 'Coffee');
      await p.locator('.nb__new-actions button', { hasText: /^Start$/ }).click();
      await p.waitForSelector('.ingredient-table-region');
    });
    const LINES = () => ({
      ing: [...document.querySelectorAll('.ingredient-table-region p.mk-keys')].map((p) => ({ text: p.textContent, after: p.previousElementSibling?.className ?? p.previousElementSibling?.tagName })),
      method: [...document.querySelectorAll('.method-region p.mk-keys')].map((p) => ({ text: p.textContent, after: p.previousElementSibling?.className ?? p.previousElementSibling?.tagName })),
      all: document.querySelectorAll('p.mk-keys').length,
    });

    let lines = await page.evaluate(LINES);
    report(lines.all === 0, 'a new recipe with no row and no step shows no keys line', JSON.stringify(lines));

    await page.locator('.ingredient-table-region .mk-head-act').click();
    await pickRow(page, 'Heavy cream, 36% fat').click();
    await page.waitForSelector('.pick', { state: 'detached' });
    lines = await page.evaluate(LINES);
    report(
      lines.ing.length === 1 && lines.ing[0].text === inRow && lines.ing[0].after === 'mk-head-row' && lines.method.length === 0,
      'after the first pick the Ingredients line stands under the heading row with the board\'s words, and Instructions has none',
      JSON.stringify(lines),
    );

    await page.locator('.ingredient-table-region .mk-head-act').click();
    await page.waitForSelector('.ingredient-table-region .pick');
    lines = await page.evaluate(LINES);
    report(
      lines.ing.length === 1 && lines.ing[0].text === inRow && lines.ing[0].after === 'region-name',
      'with the picker open the Ingredients line still stands, directly under h2.region-name',
      JSON.stringify(lines),
    );
    await page.locator('.ingredient-table-region .pick__head button').first().click();
    await page.waitForSelector('.ingredient-table-region .pick', { state: 'detached' });

    await page.locator('.method-region .mk-head-act').click();
    await page.waitForSelector('[aria-label="Step 1, lead-in"]');
    lines = await page.evaluate(LINES);
    report(
      lines.method.length === 1 && lines.method[0].text === inStep && lines.method[0].after === 'mk-head-row',
      "after the heading's Add step the Instructions line stands under the heading row with the board's words",
      JSON.stringify(lines),
    );
    await byLabel(page, 'Step 1, remove').click();
    await page.waitForSelector('li.mk-step', { state: 'detached' });
    lines = await page.evaluate(LINES);
    report(lines.method.length === 0 && lines.ing.length === 1, 'after the only step is removed the Instructions line is gone and the Ingredients line stays', JSON.stringify(lines));

    await page.locator('.method-region .mk-head-act').click();
    await page.waitForSelector('[aria-label="Step 1, lead-in"]');
    await page.locator('.ingredient-table-region tr[data-line] [data-act="remove"]').first().click();
    await page.waitForSelector('.ingredient-table-region tr[data-line]', { state: 'detached' });
    lines = await page.evaluate(LINES);
    report(lines.ing.length === 0 && lines.method.length === 1, 'after the only row is removed the Ingredients line is gone and the Instructions line stays', JSON.stringify(lines));

    // Its rule reads only --face-grotesk, --sheet-size-cross-flag and --gap-xs: the line's computed look equals a box styled by the three tokens.
    const look = await page.evaluate(() => {
      const line = document.querySelector('.method-region p.mk-keys');
      const twin = document.createElement('p');
      twin.style.cssText = 'font-family:var(--face-grotesk);font-size:var(--sheet-size-cross-flag);margin:var(--gap-xs) 0 var(--gap-xs)';
      line.after(twin);
      const read = (el) => {
        const style = getComputedStyle(el);
        return { family: style.fontFamily, size: style.fontSize, top: style.marginTop, bottom: style.marginBottom, left: style.marginLeft, right: style.marginRight };
      };
      const result = { line: read(line), twin: read(twin) };
      twin.remove();
      return result;
    });
    report(same(look.line, look.twin) && look.line.top === '6px', "the line's font face, size and margins are the three tokens' values", JSON.stringify(look.line));
    await page.close();
  }

  for (const context of contexts) await context.close();
} catch (err) {
  failures += 1;
  console.log(`FAIL ${mode || 'probe'} error: ${String(err.stack ?? err).split('\n').slice(0, 3).join(' | ')}`);
} finally {
  await browser.close();
  await close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 || passes === 0 ? 1 : 0);
