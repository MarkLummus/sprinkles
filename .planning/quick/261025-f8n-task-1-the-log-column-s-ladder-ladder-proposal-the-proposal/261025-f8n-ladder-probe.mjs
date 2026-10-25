// Quick 261025-f8n: the log column's ladder (.impeccable/proposals/2026-10-21-log-column-ladder.md; decide-p10-log-ladder-r2
// revised-h3-r2, decide-p10-any-problems-level-r2, decide-p10-picked-option-face, decide-p10-card-head, decide-p10-ladder-reach,
// decide-p10-caption-level, decide-p10-log-figure-face) measured in Playwright WebKit on a scratch build, in aside.notebook-log.
//
// Faces are not literals: they are read from the approved boards' own measurements,
//   .planning/canvas-generators/p-pen-measure.json      key pen-p-A-1366: Region name, Group cue, Caption, Axis name
//   .planning/canvas-generators/p-ladder-measure.json   key creation-p: Core names; key reading-olive-p: Cell value, Picked problem
// The one literal is the hand at its floor (the computed --size-hand-min): 20px, Caveat, rgb(31, 61, 122).
//
// Usage (from the repo root), after building to a scratch directory:
//   S="${TMPDIR:-/tmp}/sprinkles-f8n-$(basename "$(pwd)")"
//   npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir
//   PROBE_DIST="$S/dist" node <this file> [--surfaces creation,pen,reading] [--dump <file>]
//
// Contexts: c1366 (1366x1024, touch), f1366 (1366x1024, fine pointer), c393 (393x852, touch, mobile). Each state gets a fresh
// context with a fresh seed. States: creation (/notebook/new with the seeded draft), reading-olive (Olive Oil v1), record-pen
// (Record another), tasting-pen (then Add tasting), reading-mex3 (Mexican Chocolate v3). --dump writes, in c1366 only, each
// visited state's .notebook innerText under a "=== <state> ===" line.
//
// It starts no Vite server and never contacts 4173 or 8077. The build is served on an ephemeral 127.0.0.1 port through
// 08-walk-server.mjs and every request to another host is aborted. Prints PASS or FAIL per check and ends "N PASS, M FAIL"
// (exit 1 when M is above 0).
import { startServers } from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { library } from '../../../app/src/data/library.js';
import { blankCreateDraft, buildDraftRecord } from '../../../app/src/domain/draft.js';
import { existsSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
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

const args = process.argv.slice(2);
const argOf = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const SURFACE_STATES = { creation: ['creation'], pen: ['record-pen', 'tasting-pen'], reading: ['reading-olive', 'reading-mex3'] };
const wantSurfaces = (argOf('--surfaces') ?? 'creation,pen,reading').split(',');
const STATES = wantSurfaces.flatMap((s) => SURFACE_STATES[s] ?? []);
const DUMP = argOf('--dump');

// ---- the boards' measured faces ----
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEN = path.join(HERE, '..', '..', 'canvas-generators');
const PEN = JSON.parse(readFileSync(path.join(GEN, 'p-pen-measure.json'), 'utf8'));
const LADDER = JSON.parse(readFileSync(path.join(GEN, 'p-ladder-measure.json'), 'utf8'));
const role = (doc, key, name) => {
  const r = doc[key].roles.find((x) => x.role === name);
  if (!r) throw new Error(`no role "${name}" in ${key}`);
  return r;
};
const REGION = role(PEN, 'pen-p-A-1366', 'Region name');
const CUE = role(PEN, 'pen-p-A-1366', 'Group cue');
const CAPTION = role(PEN, 'pen-p-A-1366', 'Caption');
const AXIS_NAME = role(PEN, 'pen-p-A-1366', 'Axis name');
const CORE = role(LADDER, 'creation-p', 'Core names');
const CELL = role(LADDER, 'reading-olive-p', 'Cell value');
const PICKED = role(LADDER, 'reading-olive-p', 'Picked problem');
const BOX = ['fontSize', 'fontWeight', 'textTransform', 'letterSpacing', 'color'];
const BOX_LH = [...BOX, 'lineHeight'];
// The hand at its floor in the log (the computed --size-hand-min, 1.25rem), Caveat, the Sheet's pen blue.
const HAND = { fontSize: '20px', color: 'rgb(31, 61, 122)' };

const CONTEXTS = [
  { name: 'c1366', viewport: { width: 1366, height: 1024 }, hasTouch: true, isMobile: false },
  { name: 'f1366', viewport: { width: 1366, height: 1024 }, hasTouch: false, isMobile: false },
  { name: 'c393', viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true },
];
const OLIVE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3';

let passes = 0;
let failures = 0;
const report = (ok, ctx, state, check, detail = '') => {
  if (ok) passes += 1;
  else failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${ctx} ${state} ${check}${detail ? `${ok ? ' ' : ': '}${detail}` : ''}`);
};

// ---- seeding, as 10-log-inventory.mjs does ----
const ORIGINAL = Object.entries(library).map(([id, entry]) => ({ id, entry }));
const draftRecord = () => {
  const payload = {
    ...blankCreateDraft({ recipeId: 'vanilla', versionId: 'vanilla-v1', name: 'Vanilla' }),
    name: 'Vanilla',
    description: 'Plain and cold.',
    rows: [
      { id: 'row-milk', libraryId: 'wholeMilk', portions: [{ step: 1, grams: '600' }] },
      { id: 'row-cream', libraryId: 'heavyCream', portions: [{ step: 1, grams: '250' }] },
    ],
    style: 'philadelphia',
    serveTempC: '-14',
    targets: { pod: ['14', '18'], fat: ['10', '18'], msnf: ['8', '12'], solids: ['36', '42'] },
    scales: [{ key: 'scale-crit-1', name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'declared' }],
    problems: ['Bitter'],
  };
  return buildDraftRecord({ versionId: 'vanilla-v1', kind: 'create', payload, now: '2026-10-21T12:00:00.000Z' });
};

async function seed(page, servers) {
  await page.goto(`${servers.appUrl}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.shell');
  await page.evaluate(async (records) => {
    const db = await new Promise((res, rej) => {
      const q = indexedDB.open('sprinkles');
      q.onsuccess = () => res(q.result);
      q.onerror = () => rej(q.error);
    });
    await new Promise((res, rej) => {
      const tx = db.transaction('library', 'readwrite');
      const st = tx.objectStore('library');
      st.clear();
      for (const r of records) st.put(r);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    db.close();
  }, ORIGINAL);
  await page.evaluate(async (row) => {
    const db = await new Promise((res, rej) => {
      const q = indexedDB.open('sprinkles');
      q.onsuccess = () => res(q.result);
      q.onerror = () => rej(q.error);
    });
    await new Promise((res, rej) => {
      const tx = db.transaction('drafts', 'readwrite');
      tx.objectStore('drafts').put(row);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    db.close();
  }, draftRecord());
}

const settle = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
};

async function go(page, servers, route, waitFor) {
  await page.goto(`${servers.appUrl}${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(waitFor, { timeout: 8000 });
  await settle(page);
}

// A first click after a navigation often misses; click again until the outcome selector shows.
async function clickUntil(page, name, doneSelector) {
  for (let i = 0; i < 4; i += 1) {
    await page.getByRole('button', { name }).first().click();
    try {
      await page.waitForSelector(doneSelector, { timeout: 1500 });
      await settle(page);
      return;
    } catch {
      // try again
    }
  }
  throw new Error(`${doneSelector} never appeared after ${name}`);
}

// Below 1366 the Tasting fold starts closed; open it so the reading's groups are in the page to be measured.
async function openTastingFold(page) {
  for (let i = 0; i < 4; i += 1) {
    const fold = page.locator('.tasting-reading button', { hasText: 'Show' }).first();
    if ((await fold.count()) === 0) return;
    await fold.click();
    await page.waitForTimeout(400);
  }
}

async function openState(page, servers, state) {
  if (state === 'creation') return go(page, servers, '/notebook/new', '.notebook .mk-region');
  if (state === 'reading-olive') {
    await go(page, servers, OLIVE, '.notebook-log');
    return openTastingFold(page);
  }
  if (state === 'reading-mex3') return go(page, servers, MEX3, '.notebook-log');
  await go(page, servers, OLIVE, '.notebook-log');
  await clickUntil(page, /record another/i, '.batch-margin--pen');
  if (state === 'tasting-pen') await clickUntil(page, /add tasting/i, '.tasting-head');
}

// ---- the in-page reader ----
function readInPage(selector) {
  const log = document.querySelector('aside.notebook-log');
  if (!log) return null;
  const visible = (e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  return [...log.querySelectorAll(selector)]
    .filter(visible)
    .map((e) => {
      const s = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return {
        tag: e.tagName,
        cls: typeof e.className === 'string' ? e.className : '',
        id: e.id,
        text: e.textContent.replace(/\s+/g, ' ').trim(),
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        textTransform: s.textTransform,
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
        color: s.color,
        numeric: s.fontVariantNumeric,
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
        width: r.width,
      };
    });
}

const diffFace = (el, want, keys) => keys.filter((k) => el[k] !== want[k]).map((k) => `${k} ${el[k]} want ${want[k]}`);
const short = (t) => (t.length > 26 ? `${t.slice(0, 25)}~` : t);

// Every element of the list must carry the face; the failure names the first three.
function faceCheck(ctx, state, check, els, want, keys, { min = 0, extra } = {}) {
  const bad = [];
  for (const el of els) {
    const d = diffFace(el, want, keys);
    if (extra) d.push(...extra(el));
    if (d.length) bad.push(`"${short(el.text)}" ${d.join(', ')}`);
  }
  if (els.length < min) bad.push(`${els.length} found, want at least ${min}`);
  report(bad.length === 0, ctx, state, check, bad.length ? bad.slice(0, 3).join(' | ') : `${els.length} element(s)`);
}

function countsOf(els) {
  const counts = {};
  for (const el of els) counts[el.text] = (counts[el.text] ?? 0) + 1;
  return counts;
}

// ---- the checks ----
const CUE_SELECTORS = {
  creation: '.mk-cue, .mk-cue-targets',
  'record-pen': '.axes-cue',
  'tasting-pen': '.axes-cue',
  'reading-olive': '.batch-row__group-label--cue',
  'reading-mex3': '.batch-row__group-label--cue',
};
const CUE_TEXTS = {
  creation: { exact: { Targets: 1, 'Every recipe': 2, 'This recipe only': 2 } },
  'record-pen': { exact: { 'At draw': 1 } },
  'tasting-pen': { exact: { 'At draw': 1, 'From freezer': 1, 'Every recipe': 1, 'This recipe only': 1, 'Any problems?': 1 } },
  'reading-olive': { exact: { 'Any problems?': 1 }, anyOf: ['Every recipe', 'This recipe only'] },
  'reading-mex3': {},
};
const CAPTION_SELECTOR =
  '.pen-caption:not(.axes-cue):not(.mk-cue), .notebook-caption:not(.mk-cue-targets), .batch-row__cell-label, .batch-row__group-label:not(.batch-row__group-label--cue), .axis-mark__name';
const LABELS_UNDER_PROBLEMS = '.defect-group > .pen-caption, .tasting-reading__subgroup > .batch-row__group-label';

async function runChecks(page, ctx, state) {
  const read = (sel) => page.evaluate(readInPage, sel);
  const regions = await read('.region-name');
  if (regions === null) {
    report(false, ctx, state, 'log', 'no aside.notebook-log');
    return;
  }
  const isCreation = state === 'creation';
  const isPen = state === 'record-pen' || state === 'tasting-pen';
  const isReading = state.startsWith('reading');

  // (a) region names
  faceCheck(ctx, state, 'region-names', regions, REGION, BOX, { min: 1 });

  // (b) cues: h3, the cue face, the expected words
  const cues = await read(CUE_SELECTORS[state]);
  faceCheck(ctx, state, 'cues-face', cues, CUE, BOX_LH, { min: state === 'reading-mex3' ? 0 : 1, extra: (el) => (el.tag === 'H3' ? [] : [`tag ${el.tag} want H3`]) });
  const want = CUE_TEXTS[state];
  if (want.exact) {
    const got = countsOf(cues);
    const bad = Object.entries(want.exact).filter(([t, n]) => (got[t] ?? 0) !== n).map(([t, n]) => `"${t}" ${got[t] ?? 0} want ${n}`);
    if (want.anyOf && !want.anyOf.some((t) => got[t])) bad.push(`none of ${want.anyOf.join(' / ')}`);
    report(bad.length === 0, ctx, state, 'cues-texts', bad.length ? bad.join(', ') : Object.keys(got).join(' / '));
  }

  // (c) the labels under Any problems? are h4 captions
  if (isPen || isReading) {
    const labels = await read(LABELS_UNDER_PROBLEMS);
    const needed = state === 'tasting-pen' || state === 'reading-olive' ? 1 : 0;
    faceCheck(ctx, state, 'problem-labels', labels, CAPTION, BOX, {
      min: needed,
      extra: (el) => [...(el.tag === 'H4' ? [] : [`tag ${el.tag} want H4`]), ...(['Every recipe', 'This recipe only'].includes(el.text) ? [] : [`text "${el.text}"`])],
    });
  }

  // (d) captions
  const captions = await read(CAPTION_SELECTOR);
  const axisNames = captions.filter((c) => c.cls.includes('axis-mark__name'));
  const plain = captions.filter((c) => !c.cls.includes('axis-mark__name'));
  faceCheck(ctx, state, 'captions', plain, CAPTION, BOX, { min: 1 });
  if (axisNames.length) faceCheck(ctx, state, 'axis-names', axisNames, AXIS_NAME, BOX);
  if (isCreation) {
    const got = new Set(plain.map((c) => c.text));
    const missing = ['Name', 'Low end', 'High end', 'Kind', 'Serving temperature'].filter((t) => !got.has(t));
    report(missing.length === 0, ctx, state, 'caption-set', missing.length ? `missing ${missing.join(', ')}` : [...got].join(' / '));
  }

  // (e) content
  if (isCreation) faceCheck(ctx, state, 'core-names', await read('.mk-core'), CORE, BOX_LH, { min: 2 });
  if (isReading) {
    faceCheck(ctx, state, 'cell-values', await read('.batch-row__cell-value'), CELL, BOX_LH, {
      min: state === 'reading-olive' ? 1 : 0,
      extra: (el) => (el.numeric.includes('tabular-nums') ? [] : [`numeric ${el.numeric} want tabular-nums`]),
    });
    faceCheck(ctx, state, 'picked-problems', await read('.tasting-reading__problems'), PICKED, BOX_LH, {
      min: state === 'reading-olive' ? 1 : 0,
      extra: (el) => [...(/Caveat/.test(el.fontFamily) ? [`family ${el.fontFamily} is the hand`] : []), ...(/(^| )app-hand( |$)/.test(el.cls) ? ['class app-hand'] : [])],
    });
  }

  // (f) the hand at its floor
  faceCheck(ctx, state, 'hand', await read('.app-hand'), HAND, ['fontSize', 'color'], {
    extra: (el) => (/Caveat/.test(el.fontFamily) ? [] : [`family ${el.fontFamily} want Caveat`]),
  });

  // (g) the creation card and (h) its spacing
  if (isCreation) await creationChecks(page, ctx, state);

  // (i) the outline and (j) containment
  const headings = await read('h1, h2, h3, h4, h5, h6');
  const outline = headings.map((h) => ({ level: Number(h.tag[1]), text: h.text }));
  const skips = [];
  if (outline.length && outline[0].level !== 2) skips.push(`first heading is h${outline[0].level} "${outline[0].text}", want h2`);
  for (let i = 1; i < outline.length; i += 1) {
    if (outline[i].level > outline[i - 1].level + 1) skips.push(`h${outline[i - 1].level} "${short(outline[i - 1].text)}" then h${outline[i].level} "${short(outline[i].text)}"`);
  }
  if (isCreation) {
    const exact = 'h2 Style, h3 Targets, h2 Scales, h3 Every recipe, h3 This recipe only, h2 Problems, h3 Every recipe, h3 This recipe only';
    const got = outline.map((h) => `h${h.level} ${h.text}`).join(', ');
    if (got !== exact) skips.push(`outline "${got}" want "${exact}"`);
  }
  report(skips.length === 0, ctx, state, 'outline', skips.length ? skips.join(' | ') : outline.map((h) => `h${h.level}`).join(' '));

  const over = await page.evaluate(() => {
    const log = document.querySelector('aside.notebook-log');
    const edge = log.getBoundingClientRect().right;
    const out = [];
    for (const e of log.querySelectorAll('*')) {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      const control = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(e.tagName);
      if (!own && !control) continue;
      if (r.right > edge + 0.5) out.push(`${e.tagName.toLowerCase()} "${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 20)}" right ${r.right.toFixed(1)} > ${edge.toFixed(1)}`);
    }
    return out;
  });
  report(over.length === 0, ctx, state, 'containment', over.slice(0, 3).join(' | '));
}

const near = (a, b) => Math.abs(a - b) <= 0.5;

async function creationChecks(page, ctx, state) {
  const info = await page.evaluate(() => {
    const log = document.querySelector('aside.notebook-log');
    const r = (e) => (e ? e.getBoundingClientRect() : null);
    const box = (e) => (e ? { top: r(e).top, bottom: r(e).bottom, left: r(e).left, right: r(e).right } : null);
    const cards = [...log.querySelectorAll('.mk-card')].map((card) => {
      const first = card.firstElementChild;
      const row = first && first.classList.contains('mk-caprow') ? first : null;
      const label = row ? row.querySelector('label.notebook-field') : null;
      const buttons = row ? [...row.querySelectorAll('button')] : [];
      return {
        aria: card.getAttribute('aria-label'),
        role: card.getAttribute('role'),
        head: !!card.querySelector('.mk-card__head'),
        firstClass: first ? first.className : null,
        labels: row ? row.querySelectorAll('label.notebook-field').length : 0,
        labelCaption: label ? label.querySelector('.notebook-caption')?.textContent.trim() : null,
        buttons: buttons.map((b) => b.textContent.trim()),
        label: box(label),
        button: box(buttons[0]),
        text: card.textContent,
      };
    });
    const section = (name) => log.querySelector(`section[aria-label="${name}"]`);
    const stack = (name) => {
      const s = section(name);
      if (!s) return null;
      const cues = [...s.querySelectorAll('.mk-cue')].map(box);
      return { head: box(s.querySelector('.batch-row__head')), cues, core: box(s.querySelector('.mk-core')), card: box(s.querySelector('.mk-card')) };
    };
    const style = section('Style');
    const temperature = style ? [...style.querySelectorAll('label.notebook-field')].find((l) => l.textContent.includes('Serving temperature')) : null;
    return {
      cards,
      scales: stack('Scales'),
      problems: stack('Problems'),
      style: style ? { label: box(temperature), targets: box(style.querySelector('.mk-cue-targets')), band: box(style.querySelector('.mk-band')) } : null,
    };
  });

  // (g) the card
  const bad = [];
  if (info.cards.length !== 2) bad.push(`${info.cards.length} cards, want 2`);
  info.cards.forEach((c, i) => {
    const name = c.aria ?? `card ${i + 1}`;
    if (c.head) bad.push(`${name} still has .mk-card__head`);
    if (c.firstClass !== 'mk-caprow') bad.push(`${name} first child is "${c.firstClass}", want mk-caprow`);
    if (c.labels !== 1 || c.labelCaption !== 'Name') bad.push(`${name} caprow holds ${c.labels} label(s) captioned "${c.labelCaption}", want one Name`);
    if (c.buttons.length !== 1 || c.buttons[0] !== 'remove') bad.push(`${name} caprow buttons [${c.buttons.join(',')}], want [remove]`);
    if (c.label && c.button) {
      const gap = c.button.left - c.label.right;
      if (!near(gap, 12)) bad.push(`${name} remove ${gap.toFixed(1)} right of Name, want 12`);
      if (!near(c.button.bottom, c.label.bottom)) bad.push(`${name} remove bottom ${c.button.bottom.toFixed(1)} vs Name bottom ${c.label.bottom.toFixed(1)}`);
    }
    if (/(Scale|Problem) \d/.test(c.text)) bad.push(`${name} text holds a numbered head`);
    if (c.role !== 'group') bad.push(`${name} role ${c.role}, want group`);
  });
  const names = info.cards.map((c) => c.aria).join(',');
  if (names !== 'Scale 1,Problem 1') bad.push(`aria-labels "${names}", want "Scale 1,Problem 1"`);
  report(bad.length === 0, ctx, state, 'card', bad.length ? bad.slice(0, 4).join(' | ') : 'Name + remove, 12 apart, no head');

  // (h) spacing
  const gaps = [];
  const stackGaps = (label, s) => {
    if (!s || !s.head || s.cues.length < 2 || !s.core || !s.card) {
      gaps.push(`${label}: missing head/cues/core/card`);
      return;
    }
    const got = [s.cues[0].top - s.head.bottom, s.core.top - s.cues[0].bottom, s.cues[1].top - s.core.bottom, s.card.top - s.cues[1].bottom];
    const want = [18, 6, 32, 12];
    const names = ['head-to-cue', 'cue-to-core', 'core-to-cue', 'cue-to-card'];
    got.forEach((g, i) => {
      if (!near(g, want[i])) gaps.push(`${label} ${names[i]} ${g.toFixed(1)} want ${want[i]}`);
    });
  };
  stackGaps('Scales', info.scales);
  stackGaps('Problems', info.problems);
  if (!info.style || !info.style.label || !info.style.targets || !info.style.band) gaps.push('Style: missing Serving temperature/Targets/band');
  else {
    const above = info.style.targets.top - info.style.label.bottom;
    const below = info.style.band.top - info.style.targets.bottom;
    if (!near(above, 12)) gaps.push(`Style label-to-Targets ${above.toFixed(1)} want 12`);
    if (!near(below, 12)) gaps.push(`Style Targets-to-band ${below.toFixed(1)} want 12`);
  }
  report(gaps.length === 0, ctx, state, 'spacing', gaps.length ? gaps.join(' | ') : '18 / 6 / 32 / 12, Targets 12 / 12');
}

// ---- the run ----
const servers = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
const dumps = [];
try {
  for (const c of CONTEXTS) {
    for (const state of STATES) {
      const context = await browser.newContext({
        viewport: c.viewport,
        hasTouch: c.hasTouch,
        isMobile: c.isMobile,
        deviceScaleFactor: 1,
      });
      await context.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
      const page = await context.newPage();
      try {
        await seed(page, servers);
        await openState(page, servers, state);
        if (DUMP && c.name === 'c1366') {
          const text = await page.evaluate(() => document.querySelector('.notebook')?.innerText ?? '(no .notebook)');
          dumps.push(`=== ${state} ===\n${text}\n`);
        }
        await runChecks(page, c.name, state);
      } catch (error) {
        report(false, c.name, state, 'state', String(error.message ?? error).split('\n')[0]);
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await servers.close();
}
if (DUMP) await writeFile(DUMP, dumps.join('\n'));
console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 ? 1 : 0);
