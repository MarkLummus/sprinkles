// 12-12: the Tab walk through the creation editor's two regions, held against the order sketch 016
// numbers on its board (row-controls.html, panel rc-drawn; CONTRACT section 5, section 9 bullet 3).
// It drives the BUILT app in WebKit at 1366 with a coarse pointer and reports PASS or FAIL lines;
// it exits 1 on any FAIL.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-12" --emptyOutDir
//   PROBE_DIST="$S/dist-12" node .planning/phases/12-*/12-tab-probe.mjs
//
// What it checks, each as a line:
//   - the walk: the Coffee example is made through the editor's own controls (12-board-rowcontrols.mjs's
//     coffeeBase, the p12g2-capture.mjs desk flow), focus goes to the Ingredients heading's Add
//     ingredient (stop 1, as the board numbers it) and Tab is pressed until focus leaves the
//     Instructions region. Each stop is recorded by its aria-label, or its words when it has none.
//     The expected sequence is NEVER typed here: it is read from the board's rc-drawn panel by the
//     order of its `i.dl-tab` numbers, each note's control read the same way. The two must be equal
//     and 45 stops long (the build as it was: 41);
//   - the counts from a new step's instruction to its first target control, its aside control,
//     Preview step, Add step and Remove: 1, 4, 5, 6, 9;
//   - the same from a step with a target, a purpose and an aside written (made through the editor
//     with the words of the board's rc-full panel, read from it): 1, 7, 8, 9, 12;
//   - from a row's grams to its Add ingredient: 1 Tab on a row in a step, 2 on a row in no step;
//   - with a step's Uses checklist open, Tab from Change ingredients (reading Done) reaches each
//     checkbox in table order and then the aside control.
// Every line is device-unverified: it is Playwright WebKit on a Mac, not Mark's iPad (D-11; the
// iPad Tab walk is PROOF-02's device check, run once on this order).
//
// The probe reads the build from PROBE_DIST and NEVER builds or writes it (never app/dist, which
// Mark's own `vite preview --host` serves); it serves that folder on an ephemeral 127.0.0.1 port
// through 08-walk-server.mjs, and every request to another host is aborted (the board page: file:
// only). Everything typed into the app is English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { coffeeBase } from './12-board-rowcontrols.mjs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const BOARD = path.join(REPO_ROOT, '.planning/sketches/016-entry-points-pen-preview-row-controls/row-controls.html');

let failures = 0;
let passes = 0;
function report(ok, what, detail = '') {
  if (ok) passes += 1;
  else failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} tab-probe ${what}${detail ? ` (${detail})` : ''}`);
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------------------
// In-page readers.
// ---------------------------------------------------------------------------
// A stop's name: its aria-label, or its words.
const stopName = (el) => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();

// The board's order: every `i.dl-tab` of the panel, by its number, each note's control read the
// same way a stop is (a button holds its note; a textarea stands right after it).
const BOARD_ORDER = ({ pid }) => {
  const root = document.querySelector(`.fp-win[data-pid="${pid}"]`);
  const name = (el) => (el.getAttribute('aria-label') || [...el.childNodes].filter((n) => !(n.classList && n.classList.contains('dl-tab'))).map((n) => n.textContent).join('') || '').replace(/\s+/g, ' ').trim();
  return [...root.querySelectorAll('i.dl-tab')]
    .map((note) => ({ n: Number(note.textContent), control: note.parentElement.tagName === 'BUTTON' ? note.parentElement : note.nextElementSibling }))
    .sort((a, b) => a.n - b.n)
    .map(({ n, control }) => ({ n, name: name(control) }));
};

// The board's words for the written step (rc-full): the first target's label and value, the purpose and the aside.
const BOARD_WORDS = () => {
  const root = document.querySelector('.fp-win[data-pid="rc-full"]');
  const text = (label) => root.querySelector(`textarea[aria-label="${label}"]`)?.value ?? null;
  return {
    label: text('Step 1, target label'),
    value: text('Step 1, target value'),
    purpose: text('Step 1, purpose'),
    aside: text('Step 1, aside'),
  };
};

const ACTIVE = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  return {
    name: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim(),
    region: el.closest('.ingredient-table-region') ? 'ing' : el.closest('.method-region') ? 'method' : 'other',
  };
};

const { appUrl, close } = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
try {
  // The board: file: only.
  const boardContext = await browser.newContext({ viewport: { width: 2400, height: 1400 }, hasTouch: true });
  await boardContext.route('**/*', (request) => (request.request().url().startsWith('file:') ? request.continue() : request.abort()));
  const boardPage = await boardContext.newPage();
  await boardPage.goto(pathToFileURL(BOARD).href);
  await boardPage.evaluate(() => document.fonts.ready);
  const expected = await boardPage.evaluate(BOARD_ORDER, { pid: 'rc-drawn' });
  const words = await boardPage.evaluate(BOARD_WORDS);
  await boardContext.close();

  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 }, hasTouch: true });
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(`${appUrl}/notebook`, { waitUntil: 'load' });
  await page.waitForSelector('.nb__head');
  await page.waitForTimeout(700);
  await coffeeBase(page);

  // ---- the walk ------------------------------------------------------------------------------------
  await page.locator('.ingredient-table-region .mk-head-act').focus();
  const walk = [await page.evaluate(ACTIVE)];
  for (let i = 0; i < 140; i += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(ACTIVE);
    if (!stop || stop.region === 'other') break;
    walk.push(stop);
  }
  const got = walk.map((stop) => stop?.name ?? null);
  const want = expected.map((stop) => stop.name);
  report(expected.length === 45, 'the board numbers 45 stops', `board ${expected.length}`);
  report(got.length === 45, 'the build walks 45 stops', `build ${got.length}`);
  const at = got.findIndex((name, i) => name !== want[i]);
  report(same(got, want), `Tab through the two regions lands on the board's order, ${got.length} stops`, at < 0 ? '' : `first difference at stop ${at + 1}: board "${want[at]}", build "${got[at]}"`);

  // ---- counts from a step's instruction -------------------------------------------------------------
  // The five controls, found by what they are, not by a typed order: the first control of the first
  // targets line, the aside control (the field when written, else Add aside), Preview step (the last
  // control of the second targets line), Add step and Remove of the acts line.
  const CONTROLS = (n) => {
    const step = document.querySelector(`li.mk-step[data-step="${n}"]`);
    const body = step.querySelector(':scope > .method-step__body');
    const lines = [...body.querySelectorAll(':scope > .method-step__targets')];
    const first = lines[0].querySelector('.target-chip__label-field, .text-control');
    const aside = body.querySelector('textarea[aria-label$=", aside"]') ?? lines[1].querySelector('.text-control');
    const preview = [...lines[1].querySelectorAll(':scope > .text-control')].pop();
    const addStep = body.querySelector(':scope > .method-step__acts [data-act="add-after"]');
    const remove = body.querySelector(':scope > .method-step__acts [data-act="remove"]');
    for (const [k, el] of Object.entries({ target: first, aside, preview, addStep, remove })) el.setAttribute('data-probe-stop', k);
  };
  const countFrom = async (focus, kinds, limit = 30) => {
    await focus();
    const found = {};
    for (let i = 1; i <= limit && Object.keys(found).length < kinds.length; i += 1) {
      await page.keyboard.press('Tab');
      const kind = await page.evaluate(() => document.activeElement?.getAttribute('data-probe-stop') ?? null);
      if (kind && kinds.includes(kind) && !(kind in found)) found[kind] = i;
    }
    return found;
  };
  const KINDS = ['target', 'aside', 'preview', 'addStep', 'remove'];
  const instruction = (n) => () => page.locator(`[aria-label="Step ${n}, instruction"]`).focus();

  await page.evaluate(CONTROLS, 1);
  const fresh = await countFrom(instruction(1), KINDS);
  report(
    same(KINDS.map((k) => fresh[k]), [1, 4, 5, 6, 9]),
    'from a new step\'s instruction: target 1, aside 4, Preview step 5, Add step 6, Remove 9',
    JSON.stringify(fresh),
  );

  // ---- a written step ---------------------------------------------------------------------------------
  report(Object.values(words).every((word) => typeof word === 'string' && word !== ''), "the board's rc-full words are read from the board", JSON.stringify(words));
  await page.locator('[aria-label="Step 1, Add target"]').click();
  await page.fill('[aria-label="Step 1, target label"]', words.label);
  await page.fill('[aria-label="Step 1, target value"]', words.value);
  await page.locator('[aria-label="Step 1, add purpose"]').click();
  await page.fill('[aria-label="Step 1, purpose"]', words.purpose);
  await page.locator('[aria-label="Step 1, add aside"]').click();
  await page.fill('[aria-label="Step 1, aside"]', words.aside);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelectorAll('[data-probe-stop]').forEach((el) => el.removeAttribute('data-probe-stop')));
  await page.evaluate(CONTROLS, 1);
  const written = await countFrom(instruction(1), KINDS);
  report(
    same(KINDS.map((k) => written[k]), [1, 7, 8, 9, 12]),
    'from a step with a target, a purpose and an aside written: target 1, aside 7, Preview step 8, Add step 9, Remove 12',
    JSON.stringify(written),
  );

  // ---- from a row's grams -----------------------------------------------------------------------------
  const tabsToAddIngredient = async (rowName) => {
    await page.locator(`[aria-label="${rowName}, grams"]`).focus();
    for (let i = 1; i <= 6; i += 1) {
      await page.keyboard.press('Tab');
      const hit = await page.evaluate(() => document.activeElement?.getAttribute('data-act') === 'add-ingredient');
      if (hit) return i;
    }
    return null;
  };
  const inStep = await tabsToAddIngredient('Heavy cream, 36% fat');
  const noStep = await tabsToAddIngredient('Fine sea salt');
  report(inStep === 1, "from a row's grams to Add ingredient: 1 Tab on a row in a step", `${inStep}`);
  report(noStep === 2, "from a row's grams to Add ingredient: 2 Tabs on a row in no step", `${noStep}`);

  // ---- the open Uses checklist -------------------------------------------------------------------------
  await page.locator('[aria-label="Step 1, change ingredients"]').click();
  await page.waitForSelector('fieldset[aria-label="Step 1, uses"]');
  const boxes = await page.evaluate(() => [...document.querySelectorAll('fieldset[aria-label="Step 1, uses"] label.method-step__uses-item')].map((label) => label.textContent.trim()));
  await page.locator('[aria-label="Step 1, done"]').focus();
  const stops = [];
  for (let i = 0; i < boxes.length + 1; i += 1) {
    await page.keyboard.press('Tab');
    stops.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        if (el?.matches('input[type="checkbox"]')) return `box:${el.closest('label').textContent.trim()}`;
        return `${el?.getAttribute('aria-label') ?? el?.textContent?.trim() ?? null}`;
      }),
    );
  }
  report(
    same(stops, [...boxes.map((name) => `box:${name}`), 'Step 1, aside']),
    'with the Uses checklist open, Tab from Change ingredients (reading Done) reaches each checkbox in table order, then the aside',
    JSON.stringify(stops),
  );
  await context.close();
} catch (err) {
  failures += 1;
  console.log(`FAIL tab-probe error: ${String(err.stack ?? err).split('\n').slice(0, 3).join(' | ')}`);
} finally {
  await browser.close();
  await close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 || passes === 0 ? 1 : 0);
