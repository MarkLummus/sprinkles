// 12-14: the numbered steps of the three iPad check rows in 12-ipad-rows.md (D-13), walked in Playwright
// WebKit at 1366 by 1024 with a coarse pointer (hasTouch) on the final build, so each is proven reachable
// on its first activation before Mark is handed them (verify-device-check-steps-before-handing-over).
// Every line is device-unverified: Playwright WebKit on a Mac is not Mark's iPad. A step only paper or the
// device can show (the PDF, printing to paper, the clip) is walked to its last on-screen state, and its
// PASS line ends "paper is the device's" (or "the PDF is the device's").
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-14" --emptyOutDir
//   PROBE_DIST="$S/dist-14" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-device-steps.mjs
//
// One browser context holds the whole walk (rows 1, 2 and 3 are one recipe), so IndexedDB lives across
// routes. Each step waits for its ready state (the control attached, visible and enabled,
// document.fonts.ready, no load pending), activates it ONCE, then waits up to 5 s for the step's expected
// outcome. An outcome that does not come after that one activation prints "FAIL row <r> step <s>: first
// activation missed" and ends the walk: there is no retry helper, because retrying until the outcome
// appears would prove only that the control is eventually reachable, and a lost first tap is the defect
// this walk finds. Typing is `fill` after the ready state; it is not an activation. A keyboard step
// focuses a field once, then presses Tab (at most 40 presses, 400 for row 2 step 6, the whole page) until
// focus stands on the named control. Selectors are taken from the current build (the components and
// 12-roundtrip.mjs), not from 11-device-steps.mjs.
//
// It prints "PASS row <r> step <s>: <what it saw>" for each numbered step, then compares, per row, its PASS
// count with the numbered lines of 12-ipad-rows.md and prints "PASS rows match the walk" or a FAIL.
//
// The build is read from PROBE_DIST (required) and never written; a PROBE_DIST that resolves to an
// app/dist folder is refused first (Mark's own `vite preview --host` serves that one). playwright-core is
// loaded only through PLAYWRIGHT_CORE (default: the npx cache path below); a missing file prints a FAIL and
// exits 1. The app is served on an ephemeral 127.0.0.1 port through 08-walk-server.mjs and every request to
// another host is aborted. No Vite process is started. Everything typed is English stand-in words that are
// not Mark's recipe.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
if (!process.env.PROBE_DIST) {
  console.log('FAIL PROBE_DIST is not set: build to a scratch folder and pass it (this walk never serves app/dist)');
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
const PLAYWRIGHT_CORE =
  process.env.PLAYWRIGHT_CORE ?? '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
if (!existsSync(PLAYWRIGHT_CORE)) {
  console.log(
    `FAIL playwright-core not found at ${PLAYWRIGHT_CORE}: refill the npx cache with \`npx -y playwright-core@1.63.0 --version\` or set PLAYWRIGHT_CORE to its index.mjs`,
  );
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);

console.log('NOTE device-unverified: Playwright WebKit with a coarse pointer on a Mac; no line here is an iPad result');

// Stand-in words, not Mark's recipe.
const NAME = 'Walk recipe';
const A = 'Heavy cream, 36% fat';
const B = 'Dextrose';
const C = 'Fine sea salt';
const SAVE_BUTTON = '.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)';
const SCALE_MIDDLE = { name: 'Body', low: 'thin', high: 'heavy', kind: 'Right in the middle' };
const SCALE_MAGNITUDE = { name: 'Fruit flavour', low: 'faint', high: 'strong', kind: 'Low to high' };
const PROBLEM = 'Too icy';

// ---------------------------------------------------------------------------
// Reading helpers.
// ---------------------------------------------------------------------------
async function until(page, predicate, ms = 5000) {
  const stop = Date.now() + ms;
  for (;;) {
    if (await predicate()) return true;
    if (Date.now() > stop) return false;
    await page.waitForTimeout(50);
  }
}

// The step's ready state: attached (one element, strict), visible, enabled, fonts loaded, no load pending.
async function readyFor(page, locator) {
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
  if (!(await until(page, () => locator.isEnabled()))) throw new Error('the control never became enabled');
}

// One activation (a touch tap), then the outcome. A tap that does not bring the outcome is a miss.
async function press(page, locator, outcome) {
  await readyFor(page, locator);
  await locator.tap({ timeout: 5000 });
  if (!(await until(page, outcome))) throw new Error('first activation missed');
}

// Type into a field once it is ready, then confirm the field holds what was typed.
async function type(page, locator, text) {
  await readyFor(page, locator);
  await locator.fill(text);
  if (!(await until(page, async () => (await locator.inputValue()) === text))) throw new Error(`the field did not keep "${text}"`);
}

const ACTIVE = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const isField = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT';
  return {
    label: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim(),
    tag: el.tagName,
    start: isField ? el.selectionStart : null,
    end: isField ? el.selectionEnd : null,
    value: isField ? el.value : null,
  };
};
const active = (page) => page.evaluate(ACTIVE);
const activeLabel = async (page) => (await active(page))?.label ?? '';

// A tap that must put focus in the field: the activation is the tap, the outcome is the focus.
async function tapFocus(page, locator, label) {
  await press(page, locator, async () => (await activeLabel(page)) === label);
}

// Tab (at most `max` presses) until the active element's label is `wanted`; returns the presses.
async function tabTo(page, wanted, max = 40) {
  for (let presses = 1; presses <= max; presses += 1) {
    await page.keyboard.press('Tab');
    if ((await activeLabel(page)) === wanted) return presses;
  }
  throw new Error(`Tab did not reach "${wanted}" in ${max} presses (focus is on "${await activeLabel(page)}")`);
}

// Tab `count` times, returning the label after each press.
async function tabLabels(page, count) {
  const labels = [];
  for (let i = 0; i < count; i += 1) {
    await page.keyboard.press('Tab');
    labels.push(await activeLabel(page));
  }
  return labels;
}

async function keyOutcome(page, combo, outcome) {
  await page.keyboard.press(combo);
  if (!(await until(page, outcome))) throw new Error('first activation missed');
}

const pathOf = (page) => new URL(page.url()).pathname;
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------------------
// The walk.
// ---------------------------------------------------------------------------
const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
let exitCode = 1;
const passes = { 1: 0, 2: 0, 3: 0 };
let failed = false;
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  // Nothing leaves the machine: abort every request to another host.
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  const page = await context.newPage();
  page.setDefaultTimeout(8000);

  const labelled = (label) => page.locator(`[aria-label="${label}"]`);
  const pickRow = (name) =>
    page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp(`^${escapeRe(name)}$`) }) });
  const gramsField = (name) => labelled(`${name}, grams`);
  const pickerOpen = () => page.locator('.pick').isVisible();
  const leadIns = () => page.evaluate(() => [...document.querySelectorAll('textarea[aria-label$=", lead-in"]')].map((el) => el.value));
  // The ingredient table's groups: each tbody's head text and its rows' names, from the Remove controls.
  const tableGroups = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('.ingredient-table tbody')].map((body) => ({
        head: body.querySelector('.ingredient-table__step-head')?.textContent.trim() ?? '',
        rows: [...body.querySelectorAll('[data-act="remove"]')].map((node) => (node.getAttribute('aria-label') ?? '').replace(/^remove /, '')),
      })),
    );
  const rowOrder = () => page.evaluate(() => [...document.querySelectorAll('.ingredient-table [data-act="remove"]')].map((node) => (node.getAttribute('aria-label') ?? '').replace(/^remove /, '')));
  const emptyGrams = () => page.evaluate(() => [...document.querySelectorAll('[aria-label$=", grams"], [aria-label*=", grams, portion"]')].filter((el) => el.value === '').length);
  const addIngredientFromHeading = async (name, grams) => {
    await press(page, page.locator('.ingredient-table-region .mk-head-act'), pickerOpen);
    await press(page, pickRow(name), async () => (await activeLabel(page)) === `${name}, grams`);
    await type(page, gramsField(name), grams);
  };
  const addStepFromHeading = (leadIn, instruction) => async () => {
    await press(page, page.locator('.method-region .mk-head-act'), () => labelled('Step 1, lead-in').isVisible());
    await type(page, labelled('Step 1, lead-in'), leadIn);
    await type(page, labelled('Step 1, instruction'), instruction);
  };
  const scales = page.locator('section[aria-label="Scales"]');
  const addScale = async (index, scale) => {
    await press(page, scales.getByRole('button', { name: 'Add scale' }), () => scales.locator(`[aria-label="Scale ${index}"]`).isVisible());
    const card = scales.locator(`[aria-label="Scale ${index}"]`);
    await type(page, card.getByLabel('Name', { exact: true }), scale.name);
    await type(page, card.getByLabel('Low end', { exact: true }), scale.low);
    await type(page, card.getByLabel('High end', { exact: true }), scale.high);
    const kind = card.getByRole('radio', { name: scale.kind });
    await press(page, card.locator('.segmented__option', { hasText: new RegExp(`^${escapeRe(scale.kind)}$`) }), () => kind.isChecked());
    return (await card.locator('.mk-stops').textContent()).trim();
  };

  const step = (row, n) => `row ${row} step ${n}`;
  const rows = [];
  const add = (row, n, run) => rows.push({ row, n, run });

  // ---- Row 1 -----------------------------------------------------------------------------------
  add(1, 1, async () => {
    await page.goto(`${servers.appUrl}/notebook`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.nb__head .notebook-action');
    await page.evaluate(() => document.fonts.ready);
    await press(page, page.locator('.nb__head .notebook-action'), () => page.locator('.nb__new textarea').isVisible());
    await type(page, page.locator('.nb__new textarea'), NAME);
    await press(page, page.locator('.nb__new-actions button', { hasText: /^Start$/ }), async () => pathOf(page) === '/notebook/new');
    await page.waitForSelector('.notebook.mk-page');
    const shown = await labelled('Recipe name').inputValue();
    if (shown !== NAME) throw new Error(`Recipe name holds "${shown}"`);
    return 'New recipe, a name, Start: the editor opens with the name in Recipe name';
  });
  add(1, 2, async () => {
    await addIngredientFromHeading(A, '400');
    return `Add ingredient on the heading, ${A}: the caret was in its grams right after the pick`;
  });
  add(1, 3, async () => {
    await press(page, gramsField(A), async () => (await activeLabel(page)) === `${A}, grams`);
    await keyOutcome(page, 'Meta+Enter', pickerOpen);
    await press(page, pickRow(B), async () => (await activeLabel(page)) === `${B}, grams`);
    await type(page, gramsField(B), '120');
    const order = await rowOrder();
    if (order.join('|') !== [A, B].join('|')) throw new Error(`the rows read ${order.join(' | ')}`);
    return `Cmd+Return in the grams opened the picker; ${B} stands after ${A}, the caret was in its grams`;
  });
  add(1, 4, async () => {
    await press(page, labelled(`Add ingredient after ${A}`), pickerOpen);
    await press(page, pickRow(C), async () => (await activeLabel(page)) === `${C}, grams`);
    await type(page, gramsField(C), '1');
    const order = await rowOrder();
    if (order.join('|') !== [A, C, B].join('|')) throw new Error(`the rows read ${order.join(' | ')}`);
    return `Add ingredient on the first row: ${C} landed right after it (${order.join(', ')})`;
  });
  add(1, 5, async () => {
    await tapFocus(page, gramsField(B), `${B}, grams`);
    const presses = await tabTo(page, `Add ingredient after ${B}`, 1);
    const addToStep = await labelled(`Add to step, ${B}`).count();
    if (addToStep !== 0) throw new Error('the row has an Add to step with no step yet');
    return `the last row's grams, ${presses} Tab: its Add ingredient is outlined, no Add to step`;
  });
  let bandEnd = '';
  add(1, 6, async () => {
    const select = page.locator('select[aria-label="Style"]');
    await readyFor(page, select);
    const value = await select.evaluate((el) => [...el.options].find((option) => option.value !== '')?.value);
    await select.selectOption(value);
    const filled = await until(page, () => page.evaluate(() => [...document.querySelectorAll('textarea[aria-label$=", target high"]')].some((el) => el.value !== '')));
    if (!filled) throw new Error('no target band filled in after the style was chosen');
    const target = await page.evaluate(() => {
      const el = [...document.querySelectorAll('textarea[aria-label$=", target high"]')].find((candidate) => candidate.value !== '');
      return { label: el.getAttribute('aria-label'), value: el.value };
    });
    bandEnd = String(Number(target.value) + 1);
    await type(page, labelled(target.label), bandEnd);
    return `a style chosen, the bands filled in, "${target.label}" changed from ${target.value} to ${bandEnd}`;
  });
  add(1, 7, async () => {
    await type(page, labelled('Serving temperature, degrees Celsius'), '-12');
    return 'serving temperature typed';
  });
  add(1, 8, async () => {
    const line = await addScale(1, SCALE_MIDDLE);
    const words = line.split(' · ');
    if (words.length !== 5) throw new Error(`the stops line reads "${line}"`);
    return `Add scale, Right in the middle: the stops line reads ${words.length} words`;
  });
  add(1, 9, async () => {
    const line = await addScale(2, SCALE_MAGNITUDE);
    if (line !== `${SCALE_MAGNITUDE.low} to ${SCALE_MAGNITUDE.high}`) throw new Error(`the stops line reads "${line}"`);
    return `Add scale, Low to high: the stops line reads "${line}"`;
  });
  add(1, 10, async () => {
    const problems = page.locator('section[aria-label="Problems"]');
    await press(page, problems.getByRole('button', { name: 'Add problem' }), () => problems.locator('[aria-label="Problem 1"]').isVisible());
    await type(page, problems.locator('[aria-label="Problem 1"]').getByLabel('Name', { exact: true }), PROBLEM);
    return 'Add problem, typed';
  });

  // ---- Row 2 -----------------------------------------------------------------------------------
  add(2, 1, async () => {
    await addStepFromHeading('Warm', 'Heat the base gently.')();
    return 'Add step on the Instructions heading, a lead-in and an instruction typed';
  });
  add(2, 2, async () => {
    await press(page, labelled('Step 1, instruction'), async () => (await activeLabel(page)) === 'Step 1, instruction');
    await keyOutcome(page, 'Meta+Enter', async () => (await activeLabel(page)) === 'Step 2, lead-in');
    const first = await labelled('Step 1, instruction').inputValue();
    if (first !== 'Heat the base gently.') throw new Error(`step 1's instruction reads ${JSON.stringify(first)}`);
    await type(page, labelled('Step 2, lead-in'), 'Churn');
    await type(page, labelled('Step 2, instruction'), 'Churn the base, then harden.');
    return 'Cmd+Return in the instruction: step 2 stands after it, the caret in its lead-in, step 1 gained no new line';
  });
  add(2, 3, async () => {
    const uses = (n, name) => page.locator(`.method-step[data-step="${n}"] .method-step__uses-item`, { hasText: name }).locator('input');
    const tick = async (n, name) => {
      const box = uses(n, name);
      await readyFor(page, box);
      await box.tap({ timeout: 5000 });
      if (!(await until(page, () => box.isChecked()))) throw new Error('first activation missed');
    };
    await press(page, labelled('Step 1, change ingredients'), () => labelled('Step 1, uses').isVisible());
    await tick(1, A);
    await tick(1, C);
    await press(page, labelled('Step 1, done'), async () => (await labelled('Step 1, uses').count()) === 0);
    await press(page, labelled('Step 2, change ingredients'), () => labelled('Step 2, uses').isVisible());
    await tick(2, B);
    await press(page, labelled('Step 2, done'), async () => (await labelled('Step 2, uses').count()) === 0);
    const groups = await tableGroups();
    const g1 = groups.find((group) => group.head.startsWith('Step 1'));
    const g2 = groups.find((group) => group.head.startsWith('Step 2'));
    if (g1?.rows.join('|') !== [A, C].join('|') || g2?.rows.join('|') !== B) throw new Error(`the groups read ${JSON.stringify(groups)}`);
    const empty = await emptyGrams();
    if (empty !== 0) throw new Error(`${empty} grams field(s) empty`);
    return `step 1 holds ${A} and ${C}, step 2 holds ${B}, no grams field empty`;
  });
  add(2, 4, async () => {
    await press(page, labelled('Step 1, Add target'), () => labelled('Step 1, target label').isVisible());
    await type(page, labelled('Step 1, target label'), 'Heat to');
    await type(page, labelled('Step 1, target value'), '82 °C');
    await press(page, labelled('Step 1, add purpose'), () => labelled('Step 1, purpose').isVisible());
    await type(page, labelled('Step 1, purpose'), 'Dissolves the sugar.');
    await press(page, labelled('Step 1, add aside'), () => labelled('Step 1, aside').isVisible());
    await type(page, labelled('Step 1, aside'), 'Do not let it boil.');
    return 'Add target (both sides), Add purpose and Add aside typed in step 1';
  });
  add(2, 5, async () => {
    await tapFocus(page, labelled('Step 1, instruction'), 'Step 1, instruction');
    const labels = await tabLabels(page, 12);
    const want = { 8: 'Step 1, Preview step', 9: 'Step 1, Add step after it', 12: 'Step 1, remove' };
    for (const [count, label] of Object.entries(want)) {
      if (labels[Number(count) - 1] !== label) throw new Error(`Tab ${count} stands on "${labels[Number(count) - 1]}", not "${label}" (${labels.join(' > ')})`);
    }
    return `Tab 8 Preview step, 9 Add step, 12 Remove (${labels.join(' > ')})`;
  });
  add(2, 6, async () => {
    await tapFocus(page, labelled('Recipe name'), 'Recipe name');
    // The page's tabbable controls from Recipe name on, in DOM order, each radio group once (its
    // checked radio, else its first); each is tagged so the walk reads which one holds focus.
    const expected = await page.evaluate(() => {
      const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
      const all = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter(
        (el) => !el.disabled && el.tabIndex >= 0 && visible(el),
      );
      const start = all.findIndex((el) => el.getAttribute('aria-label') === 'Recipe name');
      const seenGroups = new Set();
      const list = [];
      for (const el of all.slice(start)) {
        if (el.type === 'radio') {
          if (seenGroups.has(el.name)) continue;
          seenGroups.add(el.name);
          const group = [...document.querySelectorAll(`input[type="radio"][name="${el.name}"]`)];
          list.push(group.find((radio) => radio.checked) ?? group[0]);
        } else list.push(el);
      }
      list.forEach((el, index) => el.setAttribute('data-walk-stop', String(index)));
      const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.id || el.tagName).replace(/\s+/g, ' ').trim();
      const setup = document.querySelector('aside[aria-label="Setup"]');
      const inSetup = list.filter((el) => setup?.contains(el));
      return { names: list.map(name), last: list.indexOf(inSetup[inSetup.length - 1]) };
    });
    if (expected.last < 0) throw new Error('no tabbable control inside the Setup region');
    const reached = [0];
    let lastStop = 0;
    for (let presses = 1; presses <= 400 && lastStop !== expected.last; presses += 1) {
      await page.keyboard.press('Tab');
      const index = await page.evaluate(() => {
        const raw = document.activeElement?.getAttribute?.('data-walk-stop');
        return raw === null || raw === undefined ? -1 : Number(raw);
      });
      if (index === -1) throw new Error(`Tab ${presses} left the controls the walk expected (focus is on "${await activeLabel(page)}"; the last stop was "${expected.names[lastStop]}")`);
      reached.push(index);
      lastStop = index;
    }
    const missing = expected.names.filter((_, index) => index <= expected.last && !reached.includes(index));
    if (missing.length > 0) throw new Error(`Tab never reached: ${missing.join('; ')}`);
    for (let i = 1; i < reached.length; i += 1) {
      if (reached[i] !== reached[i - 1] + 1) throw new Error(`Tab went from "${expected.names[reached[i - 1]]}" to "${expected.names[reached[i]]}", not to "${expected.names[reached[i - 1] + 1]}"`);
    }
    if (reached.length <= 45) throw new Error(`only ${reached.length} stops`);
    return `${reached.length} stops from Recipe name to "${expected.names[expected.last]}", every control reached in order, the Move buttons (grey ones too) included`;
  });
  add(2, 7, async () => {
    await readyFor(page, labelled('Step 2, lead-in'));
    await labelled('Step 2, lead-in').focus();
    await page.evaluate(() => document.querySelector('textarea[aria-label="Step 2, lead-in"]').setSelectionRange(2, 2));
    const order = async () => (await leadIns()).join('|');
    if ((await order()) !== 'Warm|Churn') throw new Error(`the steps read ${await order()}`);
    await keyOutcome(page, 'Control+Meta+ArrowUp', async () => (await order()) === 'Churn|Warm');
    let at = await active(page);
    if (at?.label !== 'Step 1, lead-in' || at.value !== 'Churn' || at.start !== 2) throw new Error(`after Up: ${JSON.stringify(at)}`);
    await keyOutcome(page, 'Control+Meta+ArrowDown', async () => (await order()) === 'Warm|Churn');
    at = await active(page);
    if (at?.label !== 'Step 2, lead-in' || at.value !== 'Churn' || at.start !== 2) throw new Error(`after Down: ${JSON.stringify(at)}`);
    await page.keyboard.press('Control+Meta+ArrowDown');
    await page.waitForTimeout(400);
    at = await active(page);
    if ((await order()) !== 'Warm|Churn' || at?.label !== 'Step 2, lead-in' || at.start !== 2) throw new Error(`on the last step Down moved something: ${await order()} ${JSON.stringify(at)}`);
    return 'Ctrl+Cmd+Up made it step 1, Ctrl+Cmd+Down step 2 again, the caret kept each time; on the last step Down did nothing';
  });
  add(2, 8, async () => {
    await tapFocus(page, labelled('Step 1, instruction'), 'Step 1, instruction');
    const presses = await tabTo(page, 'Step 1, move down', 12);
    if (presses !== 11) throw new Error(`Move down is Tab ${presses}, not 11`);
    await keyOutcome(page, 'Enter', async () => (await leadIns()).join('|') === 'Churn|Warm');
    if (!(await until(page, async () => (await activeLabel(page)) === 'Step 2, move up'))) throw new Error(`after the swap focus is on "${await activeLabel(page)}", not "Step 2, move up"`);
    await keyOutcome(page, 'Enter', async () => (await leadIns()).join('|') === 'Warm|Churn');
    if (!(await until(page, async () => (await activeLabel(page)) === 'Step 1, move down'))) throw new Error(`after the swap back focus is on "${await activeLabel(page)}", not "Step 1, move down"`);
    return 'Tab 11 reached Move down; Return swapped the steps with focus on the moved step\'s Move up, Return again swapped back with focus on Move down';
  });
  add(2, 9, async () => {
    await press(page, labelled('Step 1, move down'), async () => (await leadIns()).join('|') === 'Churn|Warm');
    await press(page, labelled('Step 2, move up'), async () => (await leadIns()).join('|') === 'Warm|Churn');
    return 'touch Move down on step 1 swapped the steps, touch Move up on the step that moved swapped them back';
  });
  add(2, 10, async () => {
    await press(page, gramsField(C), async () => (await activeLabel(page)) === `${C}, grams`);
    await page.evaluate((label) => document.querySelector(`[aria-label="${label}"]`).setSelectionRange(0, 0), `${C}, grams`);
    const step1Rows = async () => (await tableGroups()).find((group) => group.head.startsWith('Step 1'))?.rows.join('|');
    await keyOutcome(page, 'Control+Meta+ArrowUp', async () => (await step1Rows()) === [C, A].join('|'));
    const at = await active(page);
    if (at?.label !== `${C}, grams`) throw new Error(`after the keyed move focus is on "${at?.label}"`);
    const seen = [];
    let presses = 0;
    for (; presses < 6; presses += 1) {
      await page.keyboard.press('Tab');
      seen.push(await activeLabel(page));
      if (seen[presses].startsWith(`Move down, ${C}`)) break;
    }
    presses += 1;
    if (presses !== 3) throw new Error(`its Move down is Tab ${presses}, not 3 (${seen.join(' > ')})`);
    await keyOutcome(page, 'Enter', async () => (await step1Rows()) === [A, C].join('|'));
    if (!(await until(page, async () => (await activeLabel(page)).startsWith(`Move up, ${C}`)))) throw new Error(`after the move back focus is on "${await activeLabel(page)}"`);
    return 'Ctrl+Cmd+Up made the second row the first with the caret in its grams; Tab 3 reached its Move down, Return moved it back with focus on its Move up';
  });

  // ---- Row 3 -----------------------------------------------------------------------------------
  let sheetCode = '';
  add(3, 1, async () => {
    await tapFocus(page, labelled('Step 1, instruction'), 'Step 1, instruction');
    const presses = await tabTo(page, 'Step 1, Preview step', 9);
    if (presses !== 8) throw new Error(`Preview step is Tab ${presses}, not 8`);
    await keyOutcome(page, 'Enter', () => page.locator('.mk-preview').isVisible());
    const text = (await page.locator('.mk-preview').innerText()).replace(/\s+/g, ' ');
    for (const word of ['Heat to', '82', 'Dissolves the sugar.', 'Do not let it boil.']) {
      if (!text.toLowerCase().includes(word.toLowerCase())) throw new Error(`the preview reads "${text}", with no "${word}"`);
    }
    await keyOutcome(page, 'Enter', async () => (await page.locator('.mk-preview').count()) === 0);
    return 'Tab 8 reached Preview step; Return showed the step with its target, purpose and aside, Return again hid it';
  });
  add(3, 2, async () => {
    await press(page, page.locator(SAVE_BUTTON), async () => pathOf(page) !== '/notebook/new' && pathOf(page).split('/').length === 4);
    await page.waitForSelector('.notebook-version__identity');
    const noticeOk = await until(page, async () => (await page.evaluate(() => document.querySelector('.page-status')?.textContent.trim() ?? '')) === 'Recipe saved.');
    if (!noticeOk) throw new Error('the notice never read "Recipe saved."');
    return 'Save opened the recipe page, the notice reads "Recipe saved."';
  });
  add(3, 3, async () => {
    await press(page, page.getByRole('link', { name: 'Print sheet' }), async () => pathOf(page).endsWith('/print'));
    await page.waitForSelector('.print-route[data-print-ready="true"]', { timeout: 15000 });
    sheetCode = await page.evaluate(() => document.querySelector('.print-route__code')?.textContent.trim() ?? '');
    const last = await page.evaluate(() => {
      const feet = [...document.querySelectorAll('.print-page--sheet .mp-foot')].map((el) => el.textContent.replace(/\s+/g, ' ').trim());
      return feet[feet.length - 1] ?? '';
    });
    if (sheetCode === '' || !last.endsWith(sheetCode)) throw new Error(`the last Sheet page's foot reads "${last}", the code is "${sheetCode}"`);
    return `Print sheet opened the print page; the last Sheet page's foot ends with the Sheet code ${sheetCode}; the PDF is the device's`;
  });
  add(3, 4, async () => {
    const laid = await page.evaluate(() => {
      const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
      const logs = [...document.querySelectorAll('.print-page--log')];
      const rowsOf = [...(logs[1]?.querySelectorAll('.lf-srow') ?? [])].map((row) => ({
        name: text(row.querySelector('.axis-mark__name')),
        numbers: row.querySelectorAll('.lf-num').length,
        anchors: [...row.querySelectorAll('.lf-anchor')].map(text),
      }));
      return {
        logCount: logs.length,
        scales: rowsOf,
        problems: [...(logs[1]?.querySelectorAll('.lf-mrow--plain .lf-opt, .lf-mrow--plain .lf-mark > *') ?? [])].map(text),
        problemRow: text(logs[1]?.querySelector('.lf-mrow--plain')),
        batchTitle: text(logs[0]?.querySelector('.lf-title, h1, h2')),
      };
    });
    if (laid.logCount !== 2) throw new Error(`${laid.logCount} log pages`);
    if (laid.scales.length !== 6) throw new Error(`${laid.scales.length} scale rows: ${laid.scales.map((s) => s.name).join(', ')}`);
    const [middle, magnitude] = laid.scales.slice(-2);
    if (middle.name !== SCALE_MIDDLE.name || magnitude.name !== SCALE_MAGNITUDE.name) throw new Error(`the last two scales read ${middle.name}, ${magnitude.name}`);
    if (magnitude.numbers !== 0 || !magnitude.anchors.includes(SCALE_MAGNITUDE.low) || !magnitude.anchors.includes(SCALE_MAGNITUDE.high)) {
      throw new Error(`the Low to high row shows ${JSON.stringify(magnitude)}`);
    }
    if (!laid.problemRow.endsWith(PROBLEM)) throw new Error(`Any problems ends: "${laid.problemRow}"`);
    return `the Tasting log lists the four core scales then ${middle.name} and ${magnitude.name} (two end words, no numbers); Any problems ends with the recipe's problem`;
  });
  add(3, 5, async () => {
    await page.evaluate(() => {
      window.__printCalls = 0;
      window.print = () => {
        window.__printCalls += 1;
      };
    });
    await press(page, page.locator('.print-route__head .notebook-action'), async () => (await page.evaluate(() => window.__printCalls)) === 1);
    return 'Print was pressed once and asked the browser to print (pages 1 to 2 are the Batch log and the Tasting log); paper is the device\'s';
  });
  add(3, 6, async () => {
    const pages = await page.evaluate(() => [...document.querySelectorAll('.print-page--log')].length);
    if (pages !== 2) throw new Error(`${pages} log pages`);
    return 'the two logs are the first two pages, one sheet front and back; the clip and the paper are the device\'s: paper is the device\'s';
  });

  for (const { row, n, run } of rows) {
    try {
      const saw = await run();
      passes[row] += 1;
      console.log(`PASS ${step(row, n)}: ${saw}`);
    } catch (error) {
      failed = true;
      console.log(`FAIL ${step(row, n)}: ${String(error.message ?? error).split('\n')[0]}`);
      break;
    }
  }

  if (!failed) {
    const text = readFileSync(path.join(HERE, '12-ipad-rows.md'), 'utf8');
    const counts = { 1: 0, 2: 0, 3: 0 };
    let current = 0;
    let fenced = false;
    for (const line of text.split('\n')) {
      const heading = line.match(/^## Row ([123])$/);
      if (heading) current = Number(heading[1]);
      if (line.startsWith('```')) fenced = !fenced;
      if (fenced && current > 0 && /^[0-9]+\. /.test(line)) counts[current] += 1;
    }
    const same = [1, 2, 3].every((row) => counts[row] === passes[row]);
    if (same) {
      console.log('PASS rows match the walk');
    } else {
      failed = true;
      console.log(`FAIL rows differ from the walk: the file numbers ${counts[1]}, ${counts[2]}, ${counts[3]}; the walk passed ${passes[1]}, ${passes[2]}, ${passes[3]}`);
    }
  }
  exitCode = failed ? 1 : 0;
} finally {
  await browser.close();
  await servers.close?.();
}
process.exit(exitCode);
