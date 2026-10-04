// Quick task 261004-ly5's probe: the recipe band's buttons keep their resting box
// on :hover, :active and :focus-visible (Mark, 2026-09-27: "Rename, Next version
// and the buttons beside them get narrower when hovered or clicked").
// Measures the BUILT app (app/dist) in Playwright's WebKit (fine and coarse) and
// system Chrome (mouse).
//
//   node 261004-ly5-probe.mjs before   (build of the UNCHANGED source: writes the
//                                       baseline JSON, then checks the plan's
//                                       predicted cause; exits non-zero if it departs)
//   node 261004-ly5-probe.mjs after    (build of the fixed source: every state keeps
//                                       the resting box, rests equal the baseline)
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers;
// never requests Mark's :4173 preview, the dev server on :5173 or the sketch
// server on :8011, and starts no Vite process. Every reading runs in a throwaway
// browser context and nothing is saved. A reading here is evidence about two
// engines on the Mac, not about Mark's iPad or iPhone; the device is his to check.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BEFORE_PATH = path.join(HERE, '261004-ly5-before.json');
const ROUTE = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const CELLS = [
  { engine: 'webkit', width: 1366, coarse: false },
  { engine: 'webkit', width: 1366, coarse: true },
  { engine: 'webkit', width: 723, coarse: false },
  { engine: 'webkit', width: 393, coarse: true },
  { engine: 'chrome', width: 1366, coarse: false },
  { engine: 'chrome', width: 723, coarse: false },
];
const VIEWS = ['reading', 'rename', 'pen'];
const cellKey = (c) => `${c.engine}|${c.width}|${c.coarse ? 'coarse' : 'fine'}`;

// ---------------------------------------------------------------------------
// In-page enumerator, installed before the app's own scripts. A subject is every
// visible button inside .notebook-band, keyed by its name plus its class list
// (a duplicate key gets a #n suffix, in document order).
const installEnumerator = () => {
  window.__probeEnum = () => {
    const seen = {};
    return [...document.querySelectorAll('.notebook-band button')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && !el.closest('[hidden]');
      })
      .map((el) => {
        const name = (el.getAttribute('aria-label') || el.textContent).replace(/\s+/g, ' ').trim();
        const base = `${name}|${[...el.classList].join('.')}`;
        seen[base] = (seen[base] ?? 0) + 1;
        return { key: seen[base] === 1 ? base : `${base}#${seen[base]}`, el, classes: [...el.classList] };
      });
  };
};

function readInPage(subjKey) {
  const list = window.__probeEnum();
  const sx = window.scrollX;
  const sy = window.scrollY;
  const rects = {};
  for (const { key, el } of list) {
    const r = el.getBoundingClientRect();
    rects[key] = { x: r.left + sx, y: r.top + sy, w: r.width, h: r.height };
  }
  const found = list.find((s) => s.key === subjKey);
  const out = {
    rects,
    band: document.querySelector('.notebook-band').getBoundingClientRect().height,
    anyHover: list.filter((s) => s.el.matches(':hover')).map((s) => s.key),
    scrollY: sy,
  };
  if (found) {
    const cs = getComputedStyle(found.el);
    out.pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat);
    out.bt = parseFloat(cs.borderTopWidth);
    out.matchesHover = found.el.matches(':hover');
    out.matchesActive = found.el.matches(':active');
    out.matchesFocusVisible = found.el.matches(':focus-visible');
    out.isActiveElement = document.activeElement === found.el;
  }
  return out;
}

// ---------------------------------------------------------------------------
async function openPage(browser, appUrl, cell) {
  const context = await browser.newContext({ viewport: { width: cell.width, height: 1000 }, hasTouch: cell.coarse, isMobile: false, deviceScaleFactor: 1 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  await context.addInitScript(installEnumerator);
  const page = await context.newPage();
  await page.goto(appUrl + ROUTE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook-band');
  await page.evaluate(() => document.fonts.ready);
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== cell.coarse || state.innerWidth !== cell.width) {
    await context.close();
    throw new Error(`openPage: wanted coarse=${cell.coarse} width=${cell.width}, got ${JSON.stringify(state)}`);
  }
  return { context, page };
}

async function prepare(page, view) {
  if (view === 'rename') {
    await page.locator('.notebook-recipe > button', { hasText: /^Rename$/ }).click();
    await page.waitForSelector('.notebook-recipe__form-actions');
  } else if (view === 'pen') {
    await page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }).click();
    await page.waitForSelector('.notebook-ceremony__actions');
  }
  await page.evaluate(() => document.fonts.ready);
  await raf(page);
}

const raf = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

async function park(page) {
  await page.mouse.move(1, 1);
  await page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());
  await raf(page);
}

async function subjectKeys(browser, appUrl, cell, view) {
  const { context, page } = await openPage(browser, appUrl, cell);
  try {
    await prepare(page, view);
    return await page.evaluate(() => window.__probeEnum().map((s) => ({ key: s.key, classes: s.classes })));
  } finally {
    await context.close();
  }
}

// Reads one subject's four states in a fresh page, with the mouse parked off every
// subject and nothing focused before each reading.
async function measureSubject(browser, appUrl, cell, view, subject) {
  const { context, page } = await openPage(browser, appUrl, cell);
  const result = { classes: subject.classes };
  try {
    await prepare(page, view);
    await page.evaluate((key) => {
      const s = window.__probeEnum().find((x) => x.key === key);
      s.el.setAttribute('data-probe-subject', '');
      s.el.scrollIntoView({ block: 'center' });
    }, subject.key);
    const loc = page.locator('[data-probe-subject]');
    const read = () => page.evaluate(readInPage, subject.key);

    await park(page);
    result.rest = await read();

    await park(page);
    await loc.hover();
    await raf(page);
    result.hover = await read();

    await page.mouse.down();
    await raf(page);
    result.active = await read();
    await page.mouse.move(1, 1);
    await page.mouse.up();
    await park(page);

    // Keyboard focus: focus the subject, Tab away and Shift+Tab back.
    await page.mouse.move(1, 1);
    await loc.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    let landed = await page.evaluate(() => document.activeElement === document.querySelector('[data-probe-subject]'));
    if (!landed) {
      await loc.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      landed = await page.evaluate(() => document.activeElement === document.querySelector('[data-probe-subject]'));
    }
    await raf(page);
    result.focus = await read();
    result.focusLanded = landed;
  } finally {
    await context.close();
  }
  return result;
}

// Coarse cells: tap Rename then Cancel, and Next version then Cancel; read the whole
// reading view before and after each round trip.
async function tapRoundTrips(browser, appUrl, cell) {
  const out = {};
  {
    const { context, page } = await openPage(browser, appUrl, cell);
    try {
      await page.evaluate(() => window.scrollTo(0, 0));
      out.renameBefore = await page.evaluate(readInPage, null);
      await page.locator('.notebook-recipe > button', { hasText: /^Rename$/ }).tap();
      await page.waitForSelector('.notebook-recipe__form-actions');
      await page.locator('.notebook-recipe__form-actions button', { hasText: /^Cancel$/ }).tap();
      await page.waitForSelector('.notebook-recipe__form-actions', { state: 'detached' });
      await raf(page);
      out.renameAfter = await page.evaluate(readInPage, null);
    } finally {
      await context.close();
    }
  }
  {
    const { context, page } = await openPage(browser, appUrl, cell);
    try {
      out.penBefore = await page.evaluate(readInPage, null);
      await page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }).tap();
      await page.waitForSelector('.notebook-ceremony__actions');
      await page.locator('.notebook-ceremony__actions button', { hasText: /^Cancel$/ }).tap();
      await page.waitForSelector('.notebook-ceremony__actions', { state: 'detached' });
      await raf(page);
      out.penAfter = await page.evaluate(readInPage, null);
    } finally {
      await context.close();
    }
  }
  return out;
}

// Informational: Show changes / Hide changes width, before and after one click.
async function showChangesWidths(browser, appUrl, cell) {
  const { context, page } = await openPage(browser, appUrl, cell);
  try {
    const btn = page.locator('.notebook-version__acts button', { hasText: /^(Show|Hide) changes$/ });
    if ((await btn.count()) === 0) return null;
    const read = async () => ({ label: (await btn.textContent()).trim(), width: (await btn.boundingBox()).width });
    const first = await read();
    await btn.click();
    await raf(page);
    return { first, second: await read() };
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);
const isAction = (s) => s.classes.includes('notebook-action') || s.classes.includes('notebook-action--outline');
const isLink = (s) => s.classes.includes('notebook-link');
const isFold = (s) => s.classes.some((c) => c.startsWith('fold-row'));

const rectDiffs = (label, reading, rest) => {
  const diffs = [];
  for (const key of Object.keys(rest.rects)) {
    const a = reading.rects[key];
    const b = rest.rects[key];
    if (!a) diffs.push(`${key}: missing`);
    else if (!(near(a.x, b.x) && near(a.y, b.y) && near(a.w, b.w) && near(a.h, b.h))) diffs.push(`${key}: ${JSON.stringify(round2(a))} vs rest ${JSON.stringify(round2(b))}`);
  }
  if (!near(reading.band, rest.band)) diffs.push(`band height ${reading.band} vs rest ${rest.band}`);
  return diffs.map((d) => `${label} ${d}`);
};
const round2 = (r) => ({ x: round(r.x), y: round(r.y), w: round(r.w), h: round(r.h) });

const delta = (reading, rest, key) => ({ dw: round(reading.rects[key].w - rest.rects[key].w), dh: round(reading.rects[key].h - rest.rects[key].h) });

// The plan's predicted cause, read from the unchanged build. Returns departing readings.
function predictionDepartures(label, key, subject, m, { hoverEntered }) {
  const dep = [];
  const rest = m.rest;
  const r = (s) => rest.rects[key] && m[s].rects[key];
  const same = (s) => near(m[s].rects[key].w, rest.rects[key].w) && near(m[s].rects[key].h, rest.rects[key].h);
  if (isFold(subject)) {
    for (const s of ['hover', 'active', 'focus']) if (!same(s)) dep.push(`${label}: fold row changed on ${s}`);
    return dep;
  }
  if (isAction(subject)) {
    if (!(rest.pad[3] === 20 && rest.bt === 1)) dep.push(`${label}: rest padding-left ${rest.pad[3]} border-top ${rest.bt} (want 20, 1)`);
    if (hoverEntered) {
      for (const s of ['hover', 'active']) {
        const x = m[s];
        if (s === 'active' && !x.matchesActive) {
          dep.push(`${label}: :active never matched`);
          continue;
        }
        if (!(x.pad[3] === 6 && x.bt === 2)) dep.push(`${label}: ${s} padding-left ${x.pad[3]} border-top ${x.bt} (want 6, 2)`);
        if (!near(x.rects[key].w, rest.rects[key].w - 26)) dep.push(`${label}: ${s} width ${x.rects[key].w} (want rest ${rest.rects[key].w} - 26)`);
        if (!near(x.rects[key].h, rest.rects[key].h)) dep.push(`${label}: ${s} height ${x.rects[key].h} vs rest ${rest.rects[key].h}`);
      }
    }
  } else if (isLink(subject)) {
    if (hoverEntered) {
      if (!(rest.pad[3] === 0 && m.hover.pad[3] === 6)) dep.push(`${label}: link padding-left rest ${rest.pad[3]} hover ${m.hover.pad[3]} (want 0, 6)`);
      if (!near(m.hover.rects[key].w, rest.rects[key].w + 12)) dep.push(`${label}: link hover width ${m.hover.rects[key].w} (want rest ${rest.rects[key].w} + 12)`);
    }
  } else {
    return dep;
  }
  if (!same('focus')) dep.push(`${label}: focus-visible changed the box ${JSON.stringify(round2(m.focus.rects[key]))} vs rest ${JSON.stringify(round2(rest.rects[key]))}`);
  return dep;
}

// ---------------------------------------------------------------------------
async function run(group) {
  const servers = await startServers();
  const results = {};
  const departures = [];
  const before = group === 'after' ? JSON.parse(await readFile(BEFORE_PATH, 'utf8')).cells : null;
  const engines = { webkit: () => webkit.launch(), chrome: () => launch() };
  try {
    for (const engine of ['webkit', 'chrome']) {
      const browser = await engines[engine]();
      try {
        for (const cell of CELLS.filter((c) => c.engine === engine)) {
          const ck = cellKey(cell);
          results[ck] = { views: {} };
          for (const view of VIEWS) {
            const subjects = await subjectKeys(browser, servers.appUrl, cell, view);
            results[ck].views[view] = {};
            const summary = [];
            for (const subject of subjects) {
              const m = await measureSubject(browser, servers.appUrl, cell, view, subject);
              results[ck].views[view][subject.key] = m;
              const label = `${ck} ${view} "${subject.key}"`;
              const hoverEntered = m.hover.matchesHover === true;
              m.hoverEntered = hoverEntered;
              countedCheck(m.rest.anyHover.length === 0, `${label}: a subject was hovered at rest (${m.rest.anyHover.join(', ')})`);
              if (!cell.coarse) countedCheck(hoverEntered, `${label}: :hover was not entered on a fine pointer`);
              countedCheck(m.focusLanded === true && m.focus.matchesFocusVisible === true, `${label}: keyboard focus did not land with :focus-visible (landed ${m.focusLanded}, fv ${m.focus.matchesFocusVisible})`);
              if (group === 'before') {
                departures.push(...predictionDepartures(label, subject.key, subject, m, { hoverEntered }));
              } else {
                const states = [['focus', true]];
                if (hoverEntered) states.push(['hover', true]);
                else countedCheck(cell.coarse, `${label}: hover not entered`);
                if (hoverEntered) {
                  if (m.active.matchesActive) states.push(['active', true]);
                  else countedCheck(cell.coarse, `${label}: :active did not match under the mouse`);
                }
                for (const [s] of states) {
                  const diffs = rectDiffs(`${label} ${s}:`, m[s], m.rest);
                  countedCheck(diffs.length === 0, diffs.join(' | '));
                }
                if (hoverEntered && isAction(subject)) {
                  countedCheck(m.hover.bt === 2 && m.rest.bt === 1, `${label}: border-top rest ${m.rest.bt} hover ${m.hover.bt} (want 1, 2)`);
                  countedCheck(near(m.hover.pad[3], m.rest.pad[3] - 1, 0.01), `${label}: padding-left rest ${m.rest.pad[3]} hover ${m.hover.pad[3]} (want hover = rest - 1)`);
                  countedCheck(m.active.bt === 2 && near(m.active.pad[3], m.rest.pad[3] - 1, 0.01), `${label}: active border ${m.active.bt} padding-left ${m.active.pad[3]}`);
                }
                if (hoverEntered && isLink(subject)) {
                  countedCheck(m.hover.pad[3] === 0 && m.rest.pad[3] === 0, `${label}: link padding-left rest ${m.rest.pad[3]} hover ${m.hover.pad[3]} (want 0, 0)`);
                }
                const b = before[ck]?.views?.[view]?.[subject.key];
                countedCheck(b !== undefined, `${label}: baseline reading exists`);
                if (b) {
                  const diffs = rectDiffs(`${label} rest vs baseline:`, m.rest, b.rest);
                  countedCheck(diffs.length === 0, diffs.join(' | '));
                }
              }
              summary.push({
                k: subject.key,
                hoverEntered,
                hover: delta(m.hover, m.rest, subject.key),
                active: delta(m.active, m.rest, subject.key),
                focus: delta(m.focus, m.rest, subject.key),
              });
            }
            console.log(JSON.stringify({ cell: ck, view, subjects: summary }));
          }

          if (cell.coarse) {
            const t = await tapRoundTrips(browser, servers.appUrl, cell);
            results[ck].tap = t;
            for (const [name, a, b] of [['rename', t.renameAfter, t.renameBefore], ['pen', t.penAfter, t.penBefore]]) {
              const diffs = rectDiffs(`${ck} tap ${name}:`, a, b);
              if (group === 'before') {
                // Informational on the baseline: a tap leaves WebKit's emulated pointer
                // parked where the finger came down, so the button that then sits under
                // that point shows the same :hover box change. The plan predicts no
                // tap reading, so this is a finding, not a departure.
                if (diffs.length > 0) console.log(`BASELINE tap round trip moved boxes (the same :hover rule on the button now under the tap point): ${diffs.join(' | ')}`);
              } else {
                countedCheck(diffs.length === 0, diffs.join(' | '));
              }
            }
            console.log(JSON.stringify({ cell: ck, tapRoundTrips: Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Object.fromEntries(Object.entries(v.rects).map(([kk, r]) => [kk, round(r.w)]))])) }));
          }

          if (cell.width === 1366 && !cell.coarse) {
            const w = await showChangesWidths(browser, servers.appUrl, cell);
            results[ck].showChanges = w;
            console.log(JSON.stringify({ cell: ck, showChangesInfo: w }));
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }

  if (group === 'before') {
    const prediction = departures.length === 0;
    await writeFile(BEFORE_PATH, JSON.stringify({ prediction, departures, cells: results }, null, 2) + '\n');
    for (const d of departures) console.log(`DEPARTS ${d}`);
    countedCheck(prediction, `the plan's predicted cause held (${departures.length} departing readings)`);
  }
}

const group = process.argv[2];
if (group !== 'before' && group !== 'after') {
  console.log('usage: node 261004-ly5-probe.mjs before|after');
  process.exit(2);
}
await run(group);
finish(failures, count, `261004-ly5 probe (${group})`);
