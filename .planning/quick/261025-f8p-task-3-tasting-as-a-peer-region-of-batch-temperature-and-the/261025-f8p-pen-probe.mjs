// Quick 261025-f8p probe: Tasting a peer region of Batch in the record pen (decide-p10-tasting-gate),
// and the churn trio and the tasting row on one line (decide-p10-churn-trio; "Temperature",
// "Duration", "Churned"; the date field at 120). Proves, in Playwright WebKit on a scratch build of the
// real app, at 1366x1024 coarse, 1366x1024 fine and 393x852 coarse, on path A (Olive Oil v1: Record
// another, then Add tasting) and path B (Home's Record a tasting, Mexican Chocolate v3):
//   head gates  - one section[aria-label="Tasting"] whose first child is the Batch head's grammar,
//                 both heads 44, 18 under each, the 20 / 1 px / 20 seam, one face for both names,
//                 the outline, no retired class, the focus on path B, a churn-only pen with no region;
//   base gates  - every pen interval the change does not own equals the base build's;
//   row gates   - (--part all) Churned / Out of machine / Duration and Tasted / Tempering /
//                 Temperature each on one line, both date inputs 120, the reading and the print words.
// Board deltas against .planning/canvas-generators/p-pen-measure.json are INFO only.
//
// Usage (from the worktree root; build to scratch first, never to app/dist):
//   S="${TMPDIR:-/tmp}/sprinkles-f8p"
//   npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir
//   PROBE_DIST="$S/dist" node <this file> record <out.json>
//   PROBE_DIST="$S/dist" node <this file> check <out.json> --base <base.json> --part head|all
// It starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST
// through 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host.
// Screenshots go to "${TMPDIR:-/tmp}/sprinkles-f8p/shots/", never into the repo. Everything typed is
// English. Prints PASS/FAIL/INFO lines and ends "N PASS, M FAIL" (exit 1 on any FAIL).
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
if (!process.env.PROBE_DIST || !existsSync(path.join(process.env.PROBE_DIST, 'index.html'))) {
  console.log('FAIL PROBE_DIST must name a directory holding index.html (a scratch build)');
  process.exit(1);
}
const { webkit } = await import(PLAYWRIGHT_CORE);
const DIST = path.resolve(process.env.PROBE_DIST);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BOARD = JSON.parse(readFileSync(path.join(HERE, '..', '..', 'canvas-generators', 'p-pen-measure.json'), 'utf8'));
const SHOTS = path.join(process.env.TMPDIR ?? '/tmp', 'sprinkles-f8p', 'shots');
mkdirSync(SHOTS, { recursive: true });

const args = process.argv.slice(2);
const MODE = args[0];
const OUT = args[1];
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const BASE_FILE = flag('--base');
const PART = flag('--part') ?? 'head';
if (!['record', 'check'].includes(MODE) || !OUT || (MODE === 'check' && !BASE_FILE) || !['head', 'all'].includes(PART)) {
  console.log('FAIL usage: record <out.json> | check <out.json> --base <base.json> --part head|all');
  process.exit(1);
}

const VERSION_ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const PEN = '.batch-margin--pen';
const CONFIGS = [
  { name: 'c1366', width: 1366, height: 1024, touch: true, mobile: false },
  { name: 'f1366', width: 1366, height: 1024, touch: false, mobile: false },
  { name: 'c393', width: 393, height: 852, touch: true, mobile: true },
];
const BOARD_KEYS = { 'c1366/A': 'pen-p-A-1366', 'c1366/B': 'pen-p-B-1366', 'c393/A': 'pen-p-A-393', 'c393/B': 'pen-p-B-393' };

let pass = 0;
let fail = 0;
const gate = (ok, text) => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${text}`);
  if (ok) pass += 1;
  else fail += 1;
};
const info = (text) => console.log(`INFO ${text}`);
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;

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

// The labels are matched by substring so one fill serves the base build (Churn duration, Tasting
// temperature) and this one (Duration, Temperature).
async function fillChurn(log) {
  await log.locator('input[type="date"]').first().fill('2026-10-18');
  await log.getByLabel('Out of machine').fill('-7');
  await log.getByLabel('duration').fill('28');
  await log.getByLabel('At the machine').fill('Soft, held its shape');
  await log.getByLabel('Ingredient notes').fill('Olive oil opened 1 Oct');
  await log.locator('.segmented__option', { hasText: 'Smooth ribbon' }).click();
  await log.locator('.segmented__option', { hasText: 'Medium, standard' }).click();
}

async function fillTasting(page, log) {
  await log.locator('input[type="date"]').nth(1).fill('2026-10-19');
  await log.getByLabel('Tempering').fill('10');
  await log.getByLabel('temperature').fill('-12');
  await log.getByLabel('How did it turn out?').fill('Rich, a chalky finish');
  await log.getByLabel('Melt test').fill('4');
  await log.locator('.segmented__option', { hasText: 'Creamy puddle' }).click();
  await log.getByLabel('Next time').fill('Less cinnamon');
  await log.locator('.axis-mark').nth(0).locator('.axis-mark__stop').nth(3).click();
  await log.locator('.axis-mark').nth(2).locator('.axis-mark__stop').nth(1).click();
  await log.locator('.chip-toggle').first().click();
  await page.waitForTimeout(350);
}

async function newContext(browser, cfg) {
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
  return { context, page };
}

async function settle(page) {
  await page.waitForSelector('.notebook-log');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

// Everything measured in one page.evaluate. The interval method is p-pen-measure.mjs's: a text
// element by the line box at the foot of its box, a control by its box; a gap runs from one item's
// bottom to the next item's top, an item overlapping the one above is skipped.
function measurePen(penSel) {
  const ITEMS =
    '.region-name, .pen-caption, .ink-field, .field-requirement, .prose-field, .segmented, .axis-mark__name, .axis-mark__stops, .axis-mark__anchors, .defects-row__chips, .save-ceremony button';
  const TEXT = new Set(['h2', 'h3', 'p', 'span']);
  const log = document.querySelector('.notebook-log');
  const pen = log.querySelector(penSel);
  const penBox = pen.getBoundingClientRect();
  const lx = penBox.left;
  const R = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, width: r.width, height: r.height };
  };
  const textRect = (e) => {
    const b = e.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(e).lineHeight);
    const h = Number.isFinite(lh) ? Math.min(lh, b.height) : b.height;
    return { top: b.bottom - h, bottom: b.bottom };
  };
  const batchSection = log.querySelector('section.batch-row[aria-label="Batch"]');
  const batchHead = batchSection ? [...batchSection.children].find((c) => c.classList.contains('batch-row__head')) : null;
  const start = batchHead.getBoundingClientRect().top;
  const ends = log.querySelectorAll('.save-ceremony button');
  const end = ends[ends.length - 1].getBoundingClientRect().bottom;
  const items = [];
  for (const e of log.querySelectorAll(ITEMS)) {
    const box = e.getBoundingClientRect();
    if (box.height === 0 || box.top < start - 1 || box.bottom > end + 1 || (box.left - lx > 3 && !e.closest('.save-ceremony'))) continue;
    const tag = e.tagName.toLowerCase();
    const r = TEXT.has(tag) ? textRect(e) : box;
    const name = (TEXT.has(tag) ? e.textContent.trim() : e.value || e.textContent.trim() || e.className.toString().split(' ')[0]).slice(0, 20);
    items.push({ top: r.top, bottom: r.bottom, name, cls: e.className.toString().split(' ')[0] });
  }
  items.sort((a, c) => a.top - c.top);
  const seen = {};
  const gaps = [];
  for (let i = 0; i + 1 < items.length; i += 1) {
    const a = items[i];
    const c = items[i + 1];
    if (c.top < a.bottom - 0.5) continue;
    const key = `${a.cls}:${a.name} -> ${c.cls}:${c.name}`;
    seen[key] = (seen[key] ?? 0) + 1;
    gaps.push([`${key}#${seen[key]}`, c.top - a.bottom]);
  }

  const face = (e) => {
    if (!e) return null;
    const s = getComputedStyle(e);
    return [s.fontFamily, s.fontSize, s.fontWeight, s.textTransform, s.letterSpacing, s.lineHeight, s.color].join(' | ');
  };
  const colour = (value) => {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;visibility:hidden;color:${value}`;
    document.body.appendChild(el);
    const c = getComputedStyle(el).color;
    el.remove();
    return c;
  };
  const sections = [...pen.querySelectorAll('section[aria-label="Tasting"]')];
  const section = sections[0] ?? null;
  const tHead = section ? section.firstElementChild : null;
  const tName = tHead ? tHead.querySelector('.region-name') : null;
  const lead = tHead ? tHead.querySelector(':scope > .batch-row__head-lead') : null;
  const acts = tHead ? tHead.querySelector(':scope > .batch-row__head-acts') : null;
  const remove = acts ? [...acts.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Remove tasting') : null;
  const firstLabelAfter = (head, scope) =>
    [...scope.querySelectorAll('.field-row__label')].find((l) => l.getBoundingClientRect().top >= head.getBoundingClientRect().bottom - 0.5);
  const tastedLabel = [...pen.querySelectorAll('.field-row__label')].find((l) => l.querySelector('.pen-caption')?.textContent.trim() === 'Tasted');
  const churnRow = pen.querySelector('.field-row');
  const churnLabel = churnRow ? churnRow.querySelector('.field-row__label') : null;
  const tStyle = tHead ? getComputedStyle(tHead) : null;
  const prev = section ? section.previousElementSibling : null;
  const outline = [...(batchSection ?? log).querySelectorAll('h2, h3')].map((h) => `${h.tagName.toLowerCase()} ${h.textContent.trim().replace(/\s+/g, ' ')}`);
  const rowOf = (row) =>
    row
      ? [...row.children]
          .filter((c) => c.classList.contains('field-row__label'))
          .map((l) => ({ caption: l.querySelector('.pen-caption')?.textContent.trim(), ...R(l) }))
      : null;
  const tastingRow = tastedLabel ? tastedLabel.parentElement : null;
  const dateInputs = [...pen.querySelectorAll('input[type="date"]')].map((input) => {
    const clone = input.cloneNode(false);
    clone.removeAttribute('value');
    clone.style.cssText = 'position:absolute;visibility:hidden;width:auto;max-width:none';
    input.parentElement.appendChild(clone);
    const intrinsic = clone.getBoundingClientRect().width;
    clone.remove();
    const label = input.closest('label');
    const req = label ? label.querySelector('.field-requirement') : null;
    return { width: input.getBoundingClientRect().width, intrinsic, caption: label?.querySelector('.pen-caption')?.textContent.trim(), reqInside: req ? R(req) : null, inputBox: R(input) };
  });
  const active = document.activeElement;
  return {
    pen: R(pen),
    penHeight: penBox.height,
    gaps,
    outline,
    sectionCount: sections.length,
    tastingSectionsAnywhere: document.querySelectorAll('section[aria-label="Tasting"]').length,
    retired: document.querySelectorAll('.tasting-head, .tasting-head__remove, .mo-end').length,
    addTastingButtons: [...document.querySelectorAll('.save-ceremony button')].filter((b) => b.textContent.trim() === 'Add tasting').length,
    removeButtons: [...document.querySelectorAll(`${penSel} button`)].filter((b) => b.textContent.trim() === 'Remove tasting').length,
    batchHead: { box: R(batchHead), name: face(batchHead.querySelector('.region-name')), nameText: batchHead.querySelector('.region-name')?.textContent.trim() },
    batchFirstRow: churnLabel ? R(churnLabel) : null,
    tasting: section
      ? {
          firstChildIsHead: !!tHead && tHead.matches('div.batch-row__head.batch-row__head--tasting'),
          leadChildren: lead ? [...lead.children].map((c) => `${c.tagName.toLowerCase()}${c.className ? '.' + c.className.split(' ').join('.') : ''}`) : null,
          nameText: tName ? tName.textContent.trim() : null,
          nameTag: tName ? tName.tagName.toLowerCase() : null,
          nameFace: face(tName),
          actsButtons: acts ? [...acts.querySelectorAll('button')].map((b) => `${b.textContent.trim()}|${b.className}`) : null,
          removeBox: R(remove),
          head: R(tHead),
          headStyle: { paddingTop: tStyle.paddingTop, borderTopWidth: tStyle.borderTopWidth, borderTopColor: tStyle.borderTopColor, marginTop: tStyle.marginTop, marginBottom: tStyle.marginBottom },
          contentHeight: tHead.getBoundingClientRect().height - parseFloat(tStyle.paddingTop) - parseFloat(tStyle.borderTopWidth),
          dividerColour: colour('var(--app-divider)'),
          paddingToken: (() => {
            const el = document.createElement('div');
            el.style.cssText = 'position:absolute;visibility:hidden;width:var(--gap-m)';
            document.body.appendChild(el);
            const w = el.getBoundingClientRect().width;
            el.remove();
            return w;
          })(),
          prevBottom: prev ? R(prev).bottom : null,
          prevName: prev ? `${prev.tagName.toLowerCase()}.${(prev.className || '').toString().split(' ')[0]}` : null,
          toFirstRow: tastedLabel ? R(tastedLabel).top - R(tHead).bottom : null,
          tastedLabelTop: tastedLabel ? R(tastedLabel).top : null,
        }
      : null,
    batchToFirstRow: churnLabel ? R(churnLabel).top - R(batchHead).bottom : null,
    focus: active ? { tag: active.tagName.toLowerCase(), type: active.getAttribute('type'), inTasting: !!(section && section.contains(active)) } : null,
    churnRow: rowOf(churnRow),
    tastingRow: rowOf(tastingRow),
    dateInputs,
    url: location.pathname,
  };
}

async function measure(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(measurePen, PEN);
}

async function shot(page, name, focusSel) {
  if (focusSel) {
    await page.locator(focusSel).first().scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -200));
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
}

// Scenario P (path A): Record another, the churn filled, measured churn-only; Add tasting, the
// tasting filled, measured again.
async function pathA(servers, browser, cfg) {
  const { context, page } = await newContext(browser, cfg);
  await page.goto(`${servers.appUrl}${VERSION_ROUTE}`, { waitUntil: 'networkidle' });
  await settle(page);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  const log = page.locator('.notebook-log');
  await clickUntil(page, () => log.getByRole('button', { name: /^Record (another|a batch)$/ }).first(), PEN, 'open the record pen');
  await page.waitForSelector('.ingredient-table__as-made-field');
  await page.waitForTimeout(350);
  await fillChurn(log);
  await page.waitForTimeout(250);
  const churnOnly = await measure(page);
  await shot(page, `${cfg.name}-A-churn-only`, null);
  await log.getByRole('button', { name: 'Add tasting' }).first().click();
  await page.waitForSelector('.tasting-head, .batch-row__head--tasting');
  await page.waitForTimeout(350);
  await fillTasting(page, log);
  const added = await measure(page);
  await shot(page, `${cfg.name}-A-added`, '.tasting-head, .batch-row__head--tasting');
  await context.close();
  return { coarse, churnOnly, after: added };
}

// Scenario B (path B): Home's Record a tasting on an untasted batch (Mexican Chocolate v3).
async function pathB(servers, browser, cfg) {
  const { context, page } = await newContext(browser, cfg);
  await page.goto(`${servers.appUrl}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.getByRole('link', { name: 'Record a tasting' }).first().click();
  await page.waitForSelector('.tasting-head, .batch-row__head--tasting');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.fonts.ready);
  const after = await measure(page);
  await shot(page, `${cfg.name}-B`, '.tasting-head, .batch-row__head--tasting');
  await context.close();
  return { after };
}

// The reading state of Olive Oil v1's tasted batch, fresh route, before any pen: the Tasting fold
// open if it is closed.
async function reading(servers, browser, cfg) {
  const { context, page } = await newContext(browser, cfg);
  await page.goto(`${servers.appUrl}${VERSION_ROUTE}`, { waitUntil: 'networkidle' });
  await settle(page);
  const tf = page.locator('.tasting-reading .fold-row');
  if ((await tf.count()) && (await tf.getAttribute('aria-expanded')) === 'false') {
    await tf.click();
    await page.waitForTimeout(300);
  }
  const out = await page.evaluate(() => ({
    labels: [...document.querySelectorAll('.notebook-log .batch-row__cell-label')].map((l) => l.textContent.trim()),
    text: document.querySelector('.notebook-log').innerText,
  }));
  await context.close();
  return out;
}

function sameLine(row, expected) {
  if (!row || row.length !== expected.length) return false;
  if (!row.every((c, i) => c.caption === expected[i])) return false;
  const tops = row.map((c) => c.top);
  return Math.max(...tops) - Math.min(...tops) <= 0.5;
}

function headGates(tag, m, cfg, which) {
  const t = m.tasting;
  gate(m.sectionCount === 1 && m.tastingSectionsAnywhere === 1, `${tag} one section[aria-label="Tasting"] in the pen (${m.sectionCount}, ${m.tastingSectionsAnywhere} in the document)`);
  if (!t) return;
  gate(t.firstChildIsHead, `${tag} the section's first child is div.batch-row__head.batch-row__head--tasting`);
  gate(
    JSON.stringify(t.leadChildren) === JSON.stringify(['h2.region-name', 'p.tasting-status.pen-helper']) && t.nameText === 'Tasting',
    `${tag} the lead holds h2.region-name "Tasting" then p.tasting-status (${JSON.stringify(t.leadChildren)})`,
  );
  gate(
    t.actsButtons && t.actsButtons.length >= 1 && t.actsButtons[t.actsButtons.length - 1] === 'Remove tasting|text-control' && m.removeButtons === 1,
    `${tag} the acts hold Remove tasting (class text-control) (${JSON.stringify(t.actsButtons)})`,
  );
  gate(t.removeBox && near(t.removeBox.right, m.pen.right), `${tag} Remove tasting's right edge is the pen's (${t.removeBox && t.removeBox.right.toFixed(2)} vs ${m.pen.right.toFixed(2)})`);
  gate(near(m.batchHead.box.height, 44), `${tag} the Batch head is 44 tall (${m.batchHead.box.height.toFixed(2)})`);
  gate(near(t.contentHeight, 44), `${tag} the Tasting head's content box is 44 tall (${t.contentHeight.toFixed(2)})`);
  gate(near(m.batchToFirstRow, 18), `${tag} 18 from the Batch head to the first field row (${m.batchToFirstRow && m.batchToFirstRow.toFixed(2)})`);
  gate(near(t.toFirstRow, 18), `${tag} 18 from the Tasting head to the Tasted row (${t.toFirstRow && t.toFirstRow.toFixed(2)})`);
  const above = t.head.top - t.prevBottom;
  gate(
    near(above, t.paddingToken) && t.headStyle.borderTopWidth === '1px' && t.headStyle.borderTopColor === t.dividerColour && near(parseFloat(t.headStyle.paddingTop), t.paddingToken),
    `${tag} the seam: ${above.toFixed(2)} above (after ${t.prevName}), border ${t.headStyle.borderTopWidth} ${t.headStyle.borderTopColor} (divider ${t.dividerColour}), ${t.headStyle.paddingTop} under it; want ${t.paddingToken}`,
  );
  gate(m.batchHead.name === t.nameFace && !!t.nameFace, `${tag} the two h2 names compute one face (${t.nameFace})`);
  const o = m.outline;
  const iTasting = o.indexOf('h2 Tasting');
  const iBatch = o.indexOf('h2 Batch');
  gate(
    iBatch === 0 && iTasting > iBatch && !o.includes('h3 Tasting') && o.slice(0, iTasting).includes('h3 At draw') && ['h3 From freezer', 'h3 Every recipe', 'h3 Any problems?'].every((h) => o.indexOf(h) > iTasting),
    `${tag} outline: ${o.join(' > ')}`,
  );
  gate(m.retired === 0, `${tag} no element of the retired head or seam classes (${m.retired})`);
  if (which === 'B') {
    gate(!!m.focus && m.focus.tag === 'input' && m.focus.type === 'date' && m.focus.inTasting, `${tag} focus is the Tasted date input (${JSON.stringify(m.focus)})`);
  }
}

function rowGates(tag, m) {
  gate(sameLine(m.churnRow, ['Churned', 'Out of machine', 'Duration']), `${tag} Churned, Out of machine, Duration on one line (${JSON.stringify((m.churnRow ?? []).map((c) => [c.caption, +c.top.toFixed(1)]))})`);
  gate(sameLine(m.tastingRow, ['Tasted', 'Tempering', 'Temperature']), `${tag} Tasted, Tempering, Temperature on one line (${JSON.stringify((m.tastingRow ?? []).map((c) => [c.caption, +c.top.toFixed(1)]))})`);
  for (const [name, row] of [['churn', m.churnRow], ['tasting', m.tastingRow]]) {
    if (!row) continue;
    const inside = row[row.length - 1].right <= m.pen.right + 0.5;
    info(`${tag} ${name} row sum ${(row[row.length - 1].right - row[0].left).toFixed(1)} of ${m.pen.width.toFixed(1)}; label widths ${row.map((c) => c.width.toFixed(1)).join(' + ')}`);
    gate(inside, `${tag} the ${name} row's last right edge is inside the pen (${row[row.length - 1].right.toFixed(1)} vs ${m.pen.right.toFixed(1)})`);
  }
  info(`${tag} pen height ${m.penHeight.toFixed(1)}`);
  for (const d of m.dateInputs) {
    gate(near(d.width, 120), `${tag} the ${d.caption} date input is 120 wide (${d.width.toFixed(1)})`);
    gate(d.intrinsic <= 120.5, `${tag} the ${d.caption} date input's own width with width auto is ${d.intrinsic.toFixed(1)}, no wider than 120`);
    if (d.caption === 'Churned') gate(!!d.reqInside && d.reqInside.top >= d.inputBox.bottom - 0.5, `${tag} Required stands inside the Churned label, under the input`);
  }
  gate(m.dateInputs.length === 2, `${tag} the pen holds ${m.dateInputs.length} date inputs`);
}

const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
const result = {};
try {
  for (const cfg of CONFIGS) {
    const A = await pathA(servers, browser, cfg);
    const B = await pathB(servers, browser, cfg);
    const R = PART === 'all' ? await reading(servers, browser, cfg) : null;
    result[cfg.name] = { coarse: A.coarse, A, B, reading: R };
    info(`${cfg.name} (pointer: coarse) ${A.coarse}`);
  }
} finally {
  await browser.close();
  await servers.close();
}

const flat = (m) => Object.fromEntries(m.gaps);
const summary = {};
for (const cfg of CONFIGS) {
  const r = result[cfg.name];
  summary[cfg.name] = {
    coarse: r.coarse,
    A: { churnOnly: { gaps: flat(r.A.churnOnly), outline: r.A.churnOnly.outline, sectionCount: r.A.churnOnly.sectionCount, addTastingButtons: r.A.churnOnly.addTastingButtons }, after: { gaps: flat(r.A.after), outline: r.A.after.outline, penHeight: r.A.after.penHeight } },
    B: { after: { gaps: flat(r.B.after), outline: r.B.after.outline, penHeight: r.B.after.penHeight, url: r.B.after.url } },
  };
}

if (MODE === 'record') {
  writeFileSync(OUT, JSON.stringify(summary, null, 1));
  info(`recorded ${OUT}`);
  console.log(`${pass} PASS, ${fail} FAIL`);
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASE_FILE, 'utf8'));
const OWNED = ['region-name:Batch', 'region-name:Tasting', 'Churn date', 'Churned', 'Churn duration', 'Duration', 'Tasting temperature', 'Temperature'];
const boardDeltas = {};
for (const cfg of CONFIGS) {
  const r = result[cfg.name];
  gate(r.coarse === cfg.touch, `${cfg.name} (pointer: coarse) is ${r.coarse}, expected ${cfg.touch}`);
  for (const which of ['A', 'B']) {
    const tag = `${cfg.name}/${which}`;
    const m = r[which].after;
    headGates(tag, m, cfg, which);
    if (which === 'B') gate(/mexican-chocolate-v3$/.test(m.url) || /mexican-chocolate\/mexican-chocolate-v3/.test(m.url), `${tag} the pen is Mexican Chocolate v3's (${m.url})`);
    if (which === 'A') {
      const c = r.A.churnOnly;
      gate(c.sectionCount === 0 && c.tastingSectionsAnywhere === 0 && c.retired === 0, `${tag} the churn-only pen has no Tasting section`);
      gate(c.addTastingButtons === 2, `${tag} the churn-only pen offers Add tasting in both ceremonies (${c.addTastingButtons})`);
      gate(m.addTastingButtons === 0, `${tag} with the region open no Add tasting remains (${m.addTastingButtons})`);
    }
    if (PART === 'all') rowGates(tag, m);

    // The base: every gap present in both and owned by neither head nor trio words must be equal.
    const baseGaps = base[cfg.name][which].after ? base[cfg.name][which].after.gaps : null;
    const after = flat(m);
    let compared = 0;
    const off = [];
    const left = [];
    for (const [key, value] of Object.entries(after)) {
      if (!(key in baseGaps)) {
        left.push(`after-only ${key}=${value.toFixed(1)}`);
        continue;
      }
      if (OWNED.some((w) => key.includes(w))) {
        left.push(`owned ${key}: base ${baseGaps[key].toFixed(1)} -> ${value.toFixed(1)}`);
        continue;
      }
      compared += 1;
      if (!near(value, baseGaps[key])) off.push(`${key}: base ${baseGaps[key].toFixed(1)} -> ${value.toFixed(1)}`);
    }
    for (const key of Object.keys(baseGaps)) if (!(key in after)) left.push(`base-only ${key}=${baseGaps[key].toFixed(1)}`);
    gate(off.length === 0 && compared > 20, `${tag} ${compared} unowned pen intervals equal the base within 0.5${off.length ? ` (moved: ${off.join('; ')})` : ''}`);
    for (const line of left) info(`${tag} ${line}`);
    info(`${tag} pen height base ${base[cfg.name][which].after.penHeight.toFixed(1)} -> ${m.penHeight.toFixed(1)}`);

    // The board, INFO only.
    const boardKey = BOARD_KEYS[`${cfg.name}/${which}`];
    if (boardKey) {
      const board = {};
      const seen = {};
      for (const g of BOARD[boardKey].gaps) {
        const key = `${g.a} -> ${g.b}`;
        seen[key] = (seen[key] ?? 0) + 1;
        board[`${key}#${seen[key]}`] = g.to - g.from;
      }
      const deltas = {};
      for (const [key, value] of Object.entries(after)) if (key in board) deltas[key] = +(value - board[key]).toFixed(2);
      boardDeltas[`${tag} vs ${boardKey}`] = deltas;
      const diff = Object.entries(deltas).filter(([, d]) => Math.abs(d) > 0.5);
      info(`${tag} vs ${boardKey}: ${Object.keys(deltas).length} shared keys, ${diff.length} off the board by more than 0.5`);
      for (const [key, d] of diff) info(`${tag}   board delta ${d > 0 ? '+' : ''}${d}  ${key}`);
    }
  }
  if (PART === 'all') {
    const rd = r.reading;
    gate(rd.labels.includes('Duration') && rd.labels.includes('Temperature'), `${cfg.name} reading cell labels include Duration and Temperature (${JSON.stringify(rd.labels)})`);
    gate(!/Churn duration|Tasting temperature/.test(rd.text), `${cfg.name} the reading holds neither old word`);
  }
}

writeFileSync(OUT, JSON.stringify({ base, after: summary, boardDeltas }, null, 1));
info(`wrote ${OUT}`);
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
