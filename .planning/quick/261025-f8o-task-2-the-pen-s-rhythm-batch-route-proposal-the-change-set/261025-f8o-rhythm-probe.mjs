// Quick 261025-f8o probe: the batch route's record pen takes the rhythm change set
// (.impeccable/proposals/2026-10-22-batch-route-layout.md, items 1 to 9, with Mark's answers of
// 2026-10-24) and At draw / From freezer read cue, Why blank, options. Proves, in Playwright
// WebKit on a scratch build of the real app, with Olive Oil v1's record pen filled as
// .planning/canvas-generators/p-pen-capture.mjs path A fills it (Record another, the churn,
// Smooth ribbon and Medium standard, Add tasting, the tasting), at 1366 coarse, 1366 fine and
// 393 coarse:
//   - every axis head and segmented head in the pen is one cue line (marked, blank and off);
//     picking At draw and clearing it moves nothing above or below the control;
//   - every Clear is a box no taller than that line, its ::after hit area the touch floor under a
//     coarse pointer and the text-control minimum under a fine one;
//   - At draw and From freezer carry the Why blank caption, in the face of every other caption,
//     and each radiogroup is named by two ids that both exist;
//   - the intervals down the pen's left edge read the plan's table within 1px (the rows in GATED).
// Every design value is read through a temporary element from the app's own custom properties;
// the probe holds no px literal for one.
//
// Run (build to scratch first, never to app/dist):
//   SCR="${TMPDIR:-/tmp}/sprinkles-f8o/$(basename "$(pwd)")"
//   npm --prefix app run build -- --outDir "$SCR/dist" --emptyOutDir
//   PROBE_DIST="$SCR/dist" node <this file>
// It serves PROBE_DIST through 08-walk-server.mjs on ephemeral 127.0.0.1 ports, aborts every
// request to another host, and never contacts 4173 or 8077. Everything typed is English.
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
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
if (!process.env.PROBE_DIST || !existsSync(path.join(process.env.PROBE_DIST, 'index.html'))) {
  console.log('FAIL PROBE_DIST must name a directory holding index.html (a scratch build)');
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);
const DIST = path.resolve(process.env.PROBE_DIST);

const VERSION_ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const PEN = '.batch-margin--pen';
const CONFIGS = [
  { name: 'c1366', width: 1366, height: 1024, touch: true, mobile: false },
  { name: 'f1366', width: 1366, height: 1024, touch: false, mobile: false },
  { name: 'c393', width: 393, height: 852, touch: true, mobile: true },
];

// The rows of the plan's interval table that this run gates; the rest print as INFO.
const GATED = new Set(['R10', 'R11', 'R12', 'R30', 'R31', 'R32', 'R33', 'R34']);
// [id, name of the item above, name of the item below, expected px]. Names compare by startsWith.
const ROWS = [
  ['R1', 'Batch', 'Churn date', 18],
  ['R2', 'Churn date', '2026-10-18', 6],
  ['R3', '2026-10-18', 'Required', 2],
  ['R4', 'Required', 'Churn duration', 12],
  ['R5', 'Churn duration', '28', 6],
  ['R6', '28', 'At the machine', 12],
  ['R7', 'At the machine', 'Soft', 6],
  ['R8', 'Soft', 'Ingredient notes', 12],
  ['R9', 'Ingredient notes', 'Olive', 6],
  ['R10', 'Olive', 'At draw', 12],
  ['R11', 'At draw', 'Why blank', 12],
  ['R12', 'Why blank', 'Nothing to note', 6],
  ['R13', 'Nothing to note', 'Exit consistency', 15.8],
  ['R14', 'Exit consistency', 'Smooth ribbon', 6],
  ['R15', 'Smooth ribbon', 'Airiness', 15.8],
  ['R16', 'Airiness', 'Low, dense', 6],
  ['R17', 'Low, dense', 'Tasting', 32],
  ['R18', 'Tasting', 'Tasted', 18],
  ['R19', 'Tasted', '2026-10-19', 6],
  ['R20', '2026-10-19', 'Tasting temperature', 12],
  ['R21', 'Tasting temperature', '-12', 6],
  ['R22', '-12', 'How did it turn out?', 12],
  ['R23', 'How did it turn out?', 'Rich', 6],
  ['R24', 'Rich', 'Melt test', 15.3],
  ['R25', 'Melt test', '4', 6],
  ['R26', '4', 'Melt style', 15.8],
  ['R27', 'Melt style', 'Watery', 6],
  ['R28', 'Watery', 'Next time', 32],
  ['R29', 'Next time', 'Less cinnamon', 6],
  ['R30', 'Less cinnamon', 'From freezer', 12],
  ['R31', 'From freezer', 'Why blank', 12],
  ['R32', 'Why blank', 'Nothing to note', 6],
  ['R33', 'Nothing to note', 'Every recipe', 20],
  ['R34', 'Every recipe', 'Hardness', 17],
  ['R35a', 'Hardness', '12345', 6],
  ['R35b', '12345', 'softrighthard', 2],
  ['R36a', 'softrighthard', 'Scoopability', 25],
  ['R36b', 'crumblyrightgummy', 'Smoothness', 25],
  ['R36c', 'grainyrightsmooth', 'Sweetness', 25],
  ['R37', 'lessrightmore', 'This recipe only', 45],
  ['R38', 'This recipe only', 'Body', 17],
  ['R39', 'thinrightheavy', 'Oil', 25],
];

let pass = 0;
let fail = 0;
const gate = (ok, text) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${text}`);
  if (ok) pass += 1;
  else fail += 1;
};
const info = (text) => console.log(`INFO ${text}`);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

async function clickUntil(page, target, doneSelector, label) {
  for (let i = 0; i < 4; i += 1) {
    await target().click();
    try {
      await page.waitForSelector(doneSelector, { timeout: 1500 });
      return;
    } catch {
      // a first click after a navigation often misses; try again
    }
  }
  throw new Error(`${label}: ${doneSelector} never appeared`);
}

async function clickUntilGone(page, target, goneSelector, label) {
  for (let i = 0; i < 4; i += 1) {
    await target().click();
    try {
      await page.waitForSelector(goneSelector, { state: 'detached', timeout: 1500 });
      return;
    } catch {
      // try again
    }
  }
  throw new Error(`${label}: ${goneSelector} never went away`);
}

// Design values resolved through a temporary element inside the pen.
async function references(page) {
  return page.evaluate((penSel) => {
    const host = document.querySelector(penSel);
    const length = (value) => {
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;visibility:hidden;width:${value};height:${value}`;
      host.appendChild(el);
      const w = el.getBoundingClientRect().width;
      el.remove();
      return w;
    };
    const fontSize = (value) => {
      const el = document.createElement('span');
      el.style.cssText = `position:absolute;visibility:hidden;font-size:${value}`;
      host.appendChild(el);
      const s = getComputedStyle(el).fontSize;
      el.remove();
      return s;
    };
    return {
      cueLine: length('var(--app-notebook-pen-cue-line-h)'),
      touchMin: length('var(--touch-min)'),
      textControlMin: length('var(--sheet-text-control-min)'),
      stopH: length('var(--sheet-stop-h)'),
      touchStopW: length('var(--touch-stop-width)'),
      touchStopH: length('var(--sheet-touch-stop-height)'),
      meta: fontSize('var(--app-size-meta)'),
    };
  }, PEN);
}

// The pen's items down its left edge, as p-pen-measure.mjs measures them: a text element by the
// line box at the foot of its box, a control by its box; each gap runs from one item's bottom to
// the next item's top, an item that overlaps the one above is skipped.
function measureItems(penSel) {
  const ITEMS =
    '.region-name, .tasting-head, .pen-caption, .ink-field, .field-requirement, .prose-field, .segmented, .axis-mark__name, .axis-mark__stops, .axis-mark__anchors, .defects-row__chips, .save-ceremony button';
  const TEXT = new Set(['h2', 'h3', 'h4', 'p', 'span']);
  const log = document.querySelector('.notebook-log');
  const pen = log.querySelector(penSel);
  const lx = pen.getBoundingClientRect().left;
  const textRect = (e) => {
    const b = e.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(e).lineHeight);
    const h = Number.isFinite(lh) ? Math.min(lh, b.height) : b.height;
    return { top: b.bottom - h, bottom: b.bottom };
  };
  const items = [];
  for (const e of log.querySelectorAll(ITEMS)) {
    if (e.closest('.tasting-head') && !e.classList.contains('tasting-head')) continue;
    const box = e.getBoundingClientRect();
    if (box.height === 0 || (box.left - lx > 3 && !e.closest('.save-ceremony'))) continue;
    const tag = e.tagName.toLowerCase();
    const r = TEXT.has(tag) ? textRect(e) : box;
    const name = TEXT.has(tag)
      ? e.textContent.trim()
      : e.value || e.textContent.trim() || e.className.toString().split(' ')[0];
    items.push({ top: r.top, bottom: r.bottom, name: name.slice(0, 40), cls: e.className.toString().split(' ')[0] });
  }
  items.sort((a, c) => a.top - c.top);
  const gaps = [];
  for (let i = 0; i + 1 < items.length; i += 1) {
    const a = items[i];
    const c = items[i + 1];
    if (c.top < a.bottom - 0.5) continue;
    gaps.push({ gap: c.top - a.bottom, a: a.name, aCls: a.cls, b: c.name, bCls: c.cls });
  }
  return gaps;
}

async function fillChurn(page, log) {
  await log.locator('input[type="date"]').first().fill('2026-10-18');
  await log.getByLabel('Out of machine').fill('-7');
  await log.getByLabel('Churn duration').fill('28');
  await log.getByLabel('At the machine').fill('Soft, held its shape');
  await log.getByLabel('Ingredient notes').fill('Olive oil opened 1 Oct');
  await log.locator('.segmented__option', { hasText: 'Smooth ribbon' }).click();
  await log.locator('.segmented__option', { hasText: 'Medium, standard' }).click();
}

async function fillTasting(page, log) {
  await log.locator('input[type="date"]').nth(1).fill('2026-10-19');
  await log.getByLabel('Tempering').fill('10');
  await log.getByLabel('Tasting temperature').fill('-12');
  await log.getByLabel('How did it turn out?').fill('Rich, a chalky finish');
  await log.getByLabel('Melt test').fill('4');
  await log.locator('.segmented__option', { hasText: 'Creamy puddle' }).click();
  await log.getByLabel('Next time').fill('Less cinnamon');
  await log.locator('.axis-mark').nth(0).locator('.axis-mark__stop').nth(3).click();
  await log.locator('.axis-mark').nth(2).locator('.axis-mark__stop').nth(1).click();
  await log.locator('.chip-toggle').first().click();
  await page.waitForTimeout(350);
}

async function scenarioA(servers, browser, cfg) {
  const tag = cfg.name;
  const context = await browser.newContext({
    viewport: { width: cfg.width, height: cfg.height },
    hasTouch: cfg.touch,
    isMobile: cfg.mobile,
    deviceScaleFactor: 1,
  });
  await context.route('**/*', (route) => {
    if (new URL(route.request().url()).hostname === '127.0.0.1') route.continue();
    else route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(`${servers.appUrl}${VERSION_ROUTE}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook-log');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  gate(coarse === cfg.touch, `${tag} (pointer: coarse) matches ${coarse}, expected ${cfg.touch}`);

  const log = page.locator('.notebook-log');
  await clickUntil(
    page,
    () => log.getByRole('button', { name: /^Record (another|a batch)$/ }).first(),
    PEN,
    'open the record pen',
  );
  await page.waitForSelector('.ingredient-table__as-made-field');
  await page.waitForTimeout(350);
  const ref = await references(page);
  info(`${tag} references ${JSON.stringify(ref)}`);

  // The pick check, on the blank pen: a pick and its Clear move nothing.
  const atDraw = '.mo-group[data-mo="atdraw"]';
  const topOf = () => page.evaluate((sel) => document.querySelector(`${sel} .segmented`).getBoundingClientRect().top + window.scrollY, atDraw);
  const headH = () => page.evaluate((sel) => document.querySelector(`${sel} .segmented-field__head`).getBoundingClientRect().height, atDraw);
  const topBlank = await topOf();
  const blankHead = await headH();
  gate(near(blankHead, ref.cueLine, 0.5), `${tag} pick check: blank At draw head is the cue line (${blankHead} vs ${ref.cueLine})`);
  await clickUntil(
    page,
    () => page.locator(`${atDraw} .segmented__option`, { hasText: 'Nothing to note' }),
    `${atDraw} .segmented-field__clear`,
    'pick At draw',
  );
  const topPicked = await topOf();
  const pickedHead = await headH();
  gate(near(topPicked, topBlank, 0.5), `${tag} pick check: picking At draw leaves its options' top (${topBlank} -> ${topPicked})`);
  gate(near(pickedHead, ref.cueLine, 0.5), `${tag} pick check: picked At draw head is the cue line (${pickedHead})`);
  await clickUntilGone(page, () => page.locator(`${atDraw} .segmented-field__clear`), `${atDraw} .segmented-field__clear`, 'clear At draw');
  const topCleared = await topOf();
  const clearedHead = await headH();
  gate(near(topCleared, topBlank, 0.5), `${tag} pick check: clearing At draw leaves its options' top (${topBlank} -> ${topCleared})`);
  gate(near(clearedHead, ref.cueLine, 0.5), `${tag} pick check: cleared At draw head is the cue line (${clearedHead})`);

  await fillChurn(page, log);
  await log.getByRole('button', { name: /add tasting/i }).first().click();
  await page.waitForSelector('.tasting-head');
  await page.waitForTimeout(350);
  await fillTasting(page, log);
  await page.evaluate(() => document.fonts.ready);

  // Heads, Clear, the Why blank captions.
  const heads = await page.evaluate(
    (penSel) =>
      [...document.querySelectorAll(`${penSel} .axis-mark__head, ${penSel} .segmented-field__head`)].map((h) => ({
        name: h.querySelector('.axis-mark__name, .segmented-field__caption')?.textContent.trim().slice(0, 24) ?? '?',
        height: h.getBoundingClientRect().height,
      })),
    PEN,
  );
  const badHeads = heads.filter((h) => !near(h.height, ref.cueLine, 0.5));
  gate(
    heads.length > 0 && badHeads.length === 0,
    `${tag} all ${heads.length} pen heads are the ${ref.cueLine}px cue line${badHeads.length ? ` (off: ${JSON.stringify(badHeads)})` : ''}`,
  );

  const clears = await page.evaluate(
    (penSel) =>
      [...document.querySelectorAll(`${penSel} .axis-mark__clear, ${penSel} .segmented-field__clear`)].map((c) => ({
        label: c.getAttribute('aria-label'),
        height: c.getBoundingClientRect().height,
        after: parseFloat(getComputedStyle(c, '::after').height),
      })),
    PEN,
  );
  const wantAfter = cfg.touch ? ref.touchMin : ref.textControlMin;
  const badClear = clears.filter((c) => c.height > ref.cueLine + 0.5 || !near(c.after, wantAfter, 0.5));
  gate(
    clears.length >= 4 && badClear.length === 0,
    `${tag} ${clears.length} Clears: box at most ${ref.cueLine}, ::after ${wantAfter}${badClear.length ? ` (off: ${JSON.stringify(badClear)})` : ''}`,
  );

  const why = await page.evaluate((penSel) => {
    const face = (el) => {
      const s = getComputedStyle(el);
      return `${s.fontSize}/${s.fontWeight}/${s.textTransform}`;
    };
    const exit = [...document.querySelectorAll(`${penSel} .segmented-field__caption`)].find((e) =>
      e.textContent.trim().startsWith('Exit consistency'),
    );
    return {
      exitFace: exit ? face(exit) : null,
      captions: [...document.querySelectorAll(`${penSel} .mo-group > .segmented-field__caption`)].map((c) => {
        const rg = c.parentElement.querySelector('[role="radiogroup"]');
        const ids = (rg.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
        return {
          text: c.textContent,
          face: face(c),
          ids,
          idsExist: ids.length === 2 && ids.every((id) => document.getElementById(id)),
        };
      }),
    };
  }, PEN);
  gate(why.captions.length === 2, `${tag} exactly two Why blank captions (${why.captions.length})`);
  for (const c of why.captions) {
    gate(c.text === 'Why blank', `${tag} caption text is Why blank ("${c.text}")`);
    gate(why.exitFace !== null && c.face === why.exitFace, `${tag} Why blank face ${c.face} matches Exit consistency's ${why.exitFace}`);
    gate(c.idsExist, `${tag} the radiogroup is named by two ids that exist (${c.ids.join(' ')})`);
  }

  // The intervals.
  const gaps = await page.evaluate(measureItems, PEN);
  for (const g of gaps) info(`${tag} ${g.gap.toFixed(1).padStart(6)}  ${g.aCls}:${g.a}  ->  ${g.bCls}:${g.b}`);
  let from = 0;
  for (const [id, aName, bName, want] of ROWS) {
    const at = gaps.findIndex((g, i) => i >= from && g.a.startsWith(aName) && g.b.startsWith(bName));
    if (at < 0) {
      if (GATED.has(id)) gate(false, `${tag} ${id}: no gap ${aName} -> ${bName} found after position ${from}`);
      else info(`${tag} ${id}: no gap ${aName} -> ${bName} found`);
      continue;
    }
    from = at + 1;
    const got = gaps[at].gap;
    if (GATED.has(id)) gate(near(got, want, 1), `${tag} ${id} ${aName} -> ${bName}: ${got.toFixed(1)} (want ${want})`);
    else info(`${tag} ${id} ${aName} -> ${bName}: ${got.toFixed(1)} (want ${want})`);
  }
  await context.close();
}

async function run() {
  const servers = await startServers({ appRoot: DIST });
  const browser = await webkit.launch();
  try {
    for (const cfg of CONFIGS) await scenarioA(servers, browser, cfg);
  } finally {
    await browser.close();
    await servers.close();
  }
}

try {
  await run();
} catch (err) {
  console.log(`FAIL probe error: ${err.message}`);
  fail += 1;
}
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
