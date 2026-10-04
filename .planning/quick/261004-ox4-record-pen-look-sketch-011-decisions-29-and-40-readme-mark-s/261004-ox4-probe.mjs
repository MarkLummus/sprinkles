// Quick task 261004-ox4's probe: the record pen's App look (sketch 011 decision 29's skin
// on decision 38's one 10px radius, decision 40 option C's group cues, and decision 40
// finding 1, Clear level with its axis name at the phone). Measures the BUILT app
// (app/dist) against the boards record-pen-app.html and record-pen-cues.html, element by
// element, and against a pre-change baseline.
//
//   node 261004-ox4-probe.mjs baseline   (build of the unchanged source; writes 261004-ox4-baseline.json,
//                                          asserts the as-built state, records the board mismatches "before")
//   node 261004-ox4-probe.mjs skin       (the six record-pen-app.html panels and the two cues-built panels:
//                                          0 mismatches; heights equal the baseline; overflow 0; forced colours)
//   node 261004-ox4-probe.mjs cues       (the filled log vs the C panels of record-pen-cues.html; read and blank vs
//                                          record-pen-app.html; the cue gaps; the 1024 wide grid; forced colours)
//   node 261004-ox4-probe.mjs clear      (Clear's word level with its axis name at 393 as at 1366; nothing else moved)
//   groups combine with commas: cues,clear
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers; never requests
// Mark's :4173 preview, the dev server on :5173 or the sketch server on :8011, and starts no
// Vite process. The pen opens in a throwaway browser context and is never saved, so nothing
// reaches Mark's IndexedDB. A reading here is evidence about two engines (Playwright WebKit,
// system Chrome), not about Mark's iPhone or iPad.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261004-ox4-baseline.json');
const ROUTE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';

const groups = new Set((process.argv[2] ?? '').split(',').filter(Boolean));
for (const g of groups) if (!['baseline', 'skin', 'cues', 'clear'].includes(g)) throw new Error(`unknown group ${g}`);
if (groups.size === 0) throw new Error('usage: node 261004-ox4-probe.mjs baseline|skin|cues|clear[,..]');

const failures = [];
let count = 0;
const cc = (cond, label) => {
  count += 1;
  check(failures, cond, label);
};
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const rows = [];

// ---------------------------------------------------------------------------
// Driving the pen: recordpen-capture.mjs's steps, verbatim.
async function drive(p, state) {
  p.setDefaultTimeout(10000);
  if (state === 'read') return;
  const fill = async (label, v) => p.getByLabel(label).first().fill(v);
  await p.getByRole('button', { name: /record another/i }).first().click();
  await p.waitForTimeout(300);
  if (state === 'filled') {
    await p.getByRole('button', { name: /add tasting/i }).first().click();
    await p.waitForTimeout(300);
    await fill('Time to draw temp., minutes', '12');
    await fill('Out of machine, degrees Celsius', '-6');
    await fill('Churn duration, minutes', '30');
    await fill('At the machine', 'bowl frozen overnight');
    await fill('Ingredient notes', 'oil bottle opened 24 Jul');
    await fill('Tempering, minutes', '10');
    await fill('Tasting temperature, degrees Celsius', '-12');
    await fill('How did it turn out?', 'Soft, not greasy. The oil is strong.');
    await fill('Melt test, g lost at 20 min', '3');
    await fill('Next time', 'churn 2 min longer');
    const seg = p.locator('.segmented__option');
    await seg.nth(0).click();
    await seg.nth(4).click();
    await seg.nth(7).click();
    const stops = p.locator('.axis-mark__stop');
    await stops.nth(2).click();
    await stops.nth(8).click();
    await stops.nth(14).click();
    await stops.nth(18).click();
    await p.getByRole('button', { name: /coarse, icy/i }).click();
    await p.getByRole('button', { name: /bitter/i }).click();
  }
  const dates = p.locator('.notebook-log input[type=date]');
  await dates.nth(0).fill('2026-08-02');
  if (state === 'filled') await dates.nth(1).fill('2026-08-04');
  await p.waitForTimeout(300);
}

// ---------------------------------------------------------------------------
// In-page reader. Self-contained: runs in the browser. spec.sel selects the .notebook-log.
async function readLog(spec) {
  await document.fonts.ready;
  const log = document.querySelector(spec.sel);
  if (!log) throw new Error(`no log for ${spec.sel}`);
  const lr = log.getBoundingClientRect();
  const r1 = (n) => Math.round(n * 10) / 10;
  const active = document.activeElement;
  const all = [log, ...log.querySelectorAll('*')];
  const els = all.map((e, i) => {
    const b = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    const o = {
      i,
      tag: e.tagName.toLowerCase(),
      cls: e.getAttribute('class') || '',
      active: e === active,
      box: [r1(b.x - lr.x), r1(b.y - lr.y), r1(b.width), r1(b.height)],
      border: [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor],
      radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius],
      bg: cs.backgroundColor,
      color: cs.color,
    };
    if (e.classList.contains('chip-toggle')) {
      const bs = getComputedStyle(e, '::before');
      o.before = { border: bs.borderTopColor, radius: bs.borderTopLeftRadius, bg: bs.backgroundColor };
    }
    return o;
  });
  let maxR = -1e9;
  for (const e of log.querySelectorAll('*')) {
    const b = e.getBoundingClientRect();
    if (b.width && b.height) maxR = Math.max(maxR, b.right);
  }
  const out = { count: els.length - 1, h: r1(lr.height), w: r1(lr.width), over: r1(Math.max(0, maxR - lr.right)), els };
  const defectsHead = log.querySelector('.defects-head');
  out.defectsMargin = defectsHead ? getComputedStyle(defectsHead).marginBottom : null;
  const grid = log.querySelector('.axes-grid--stacked');
  if (grid && grid.children.length >= 5) {
    const top = (e) => e.getBoundingClientRect().top;
    const bot = (e) => e.getBoundingClientRect().bottom;
    const cues = [...log.querySelectorAll('.axes-cue')];
    const [g1, , head, dc, dd] = grid.children;
    const items1 = g1.querySelectorAll('.axis-mark');
    const cueD = dc.querySelector('.axes-cue');
    const chip = dc.querySelector('.chip-toggle');
    out.gaps = {
      cue_item: r1(top(g1.querySelector('.axis-mark__name')) - bot(cues[0])),
      group_cue: r1(top(cues[1]) - bot(items1[items1.length - 1])),
      head_cue: r1(top(cueD) - bot(head)),
      cue_chips: r1(top(chip) - bot(cueD)),
      region: r1(bot(dd) - top(cues[0])),
    };
  }
  out.clear = [...log.querySelectorAll('.axis-mark__head, .segmented-field__head')]
    .map((head) => {
      const btn = head.querySelector('.text-control');
      if (!btn) return null;
      const nameEl = head.querySelector('.axis-mark__name, .segmented-field__caption');
      const bottomOf = (node) => {
        const rg = document.createRange();
        rg.selectNodeContents(node);
        return rg.getBoundingClientRect().bottom;
      };
      return {
        name: nameEl.textContent.trim(),
        d_bottom: r1(bottomOf(btn) - bottomOf(nameEl)),
        head_h: r1(head.getBoundingClientRect().height),
        clear_h: r1(btn.getBoundingClientRect().height),
      };
    })
    .filter(Boolean);
  return out;
}

const lite = (reading) => ({ count: reading.count, h: reading.h, over: reading.over, gaps: reading.gaps ?? null, clear: reading.clear, defectsMargin: reading.defectsMargin });

// Compare an app reading with a board reading: counts equal, boxes within 0.5, style strings identical.
function compare(app, board) {
  const mism = [];
  if (app.count !== board.count) mism.push(`element count ${app.count} against ${board.count}`);
  const n = Math.min(app.els.length, board.els.length);
  for (let i = 0; i < n; i += 1) {
    const a = app.els[i];
    const b = board.els[i];
    const who = `#${i} <${a.tag}.${a.cls}>`;
    if (a.tag !== b.tag) mism.push(`${who} tag ${a.tag} against ${b.tag}`);
    a.box.forEach((v, k) => {
      if (!near(v, b.box[k])) mism.push(`${who} box[${'xywh'[k]}] ${v} against ${b.box[k]}`);
    });
    if (a.active) continue; // the focused field's own style is left out of the comparison; its box is compared above
    const sides = ['top', 'right', 'bottom', 'left'];
    a.border.forEach((v, k) => {
      if (v !== b.border[k]) mism.push(`${who} border-${sides[k]}-color ${v} against ${b.border[k]}`);
    });
    const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
    a.radii.forEach((v, k) => {
      if (v !== b.radii[k]) mism.push(`${who} ${corners[k]}-radius ${v} against ${b.radii[k]}`);
    });
    if (a.bg !== b.bg) mism.push(`${who} background-color ${a.bg} against ${b.bg}`);
    if (a.color !== b.color) mism.push(`${who} color ${a.color} against ${b.color}`);
    if (a.before || b.before) {
      for (const key of ['border', 'radius', 'bg']) {
        if (a.before?.[key] !== b.before?.[key]) mism.push(`${who} ::before ${key} ${a.before?.[key]} against ${b.before?.[key]}`);
      }
    }
  }
  return mism;
}

// ---------------------------------------------------------------------------
const servers = await startServers();
const wk = await webkit.launch();
let chrome = null;
const cache = new Map();

async function readApp(browser, engine, width, state) {
  const key = `${engine}|${width}|${state}`;
  if (cache.has(key)) return cache.get(key);
  const { context, page } = await openApp(browser, servers.appUrl, ROUTE, { width, height: 1100, coarse: true });
  await drive(page, state);
  await page.mouse.move(0, 0);
  const reading = await page.evaluate(readLog, { sel: '.notebook-log' });
  await context.close();
  cache.set(key, reading);
  return reading;
}

async function readBoard(browser, file, pids) {
  const { context, page } = await openBoard(browser, servers.repoUrl, file, { coarse: false });
  const out = {};
  for (const pid of pids) out[pid] = await page.evaluate(readLog, { sel: `.fp-win.fp-${pid} .notebook-log` });
  await context.close();
  return out;
}

const STATES = [
  ['read', 1366],
  ['blank', 1366],
  ['filled', 1366],
  ['read', 393],
  ['blank', 393],
  ['filled', 393],
];
const APP_PIDS = STATES.map(([s, w]) => `${s}-${w}`);
const CUE_BUILT = ['cues-built-1366', 'cues-built-393'];
const CUE_C = ['cues-C-1366', 'cues-C-393'];

// the app reading a board panel corresponds to: record-pen-app panels by their own name,
// cues-built and cues-C panels are the filled log
const appFor = (pid) => {
  const m = pid.match(/^(read|blank|filled)-(\d+)$/);
  if (m) return [m[1], Number(m[2])];
  const c = pid.match(/^cues-(?:built|C)-(\d+)$/);
  return ['filled', Number(c[1])];
};

async function boardMismatches(browser, engine, pids, boardReadings) {
  const res = {};
  for (const pid of pids) {
    const [state, width] = appFor(pid);
    const app = await readApp(browser, engine, width, state);
    res[pid] = compare(app, boardReadings[pid]);
  }
  return res;
}

async function boards(browser) {
  const appBoard = await readBoard(browser, 'record-pen-app.html', APP_PIDS);
  const cuesBoard = await readBoard(browser, 'record-pen-cues.html', [...CUE_BUILT, ...CUE_C]);
  return { ...appBoard, ...cuesBoard };
}

async function forcedColours() {
  chrome ??= await launch();
  const { context, page } = await openApp(chrome, servers.appUrl, ROUTE, { width: 1366, height: 1100, coarse: false });
  await drive(page, 'filled');
  await page.emulateMedia({ forcedColors: 'active' });
  const r = await page.evaluate(() => {
    const ref = document.createElement('div');
    ref.style.cssText = 'forced-color-adjust:none;background:Highlight;color:HighlightText';
    document.body.append(ref);
    const rs = getComputedStyle(ref);
    const stop = document.querySelector('.notebook-log .axis-mark__stop:has(input[type="radio"]:checked)');
    const seg = document.querySelector('.notebook-log .segmented__option:has(input[type="radio"]:checked)');
    const chip = document.querySelector('.notebook-log .chip-toggle[aria-pressed="true"]');
    const pick = (e) => ({ bg: getComputedStyle(e).backgroundColor, color: getComputedStyle(e).color });
    return { ref: { bg: rs.backgroundColor, color: rs.color }, stop: pick(stop), seg: pick(seg), chip: { bg: getComputedStyle(chip, '::before').backgroundColor } };
  });
  await context.close();
  return r;
}

function forcedChecks(label, r) {
  cc(r.stop.bg === r.ref.bg && r.stop.color === r.ref.color, `${label}: the picked stop is Highlight/HighlightText (${r.stop.bg}, ${r.stop.color} against ${r.ref.bg}, ${r.ref.color})`);
  cc(r.seg.bg === r.ref.bg && r.seg.color === r.ref.color, `${label}: the picked segment is Highlight/HighlightText (${r.seg.bg}, ${r.seg.color})`);
  cc(r.chip.bg === r.ref.bg, `${label}: the pressed defect square is Highlight (${r.chip.bg} against ${r.ref.bg})`);
}

async function loadBaseline() {
  return JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
}

const report = (group, width, state, now, base, mism, extra = {}) => {
  const g = now.gaps ? `${now.gaps.cue_item}/${now.gaps.group_cue}/${now.gaps.head_cue}/${now.gaps.cue_chips}` : '-';
  const d = now.clear.length ? now.clear.map((c) => c.d_bottom).join(',') : '-';
  rows.push(`| ${group} | ${width} | ${state} | ${base ?? '-'} -> ${now.h} | ${extra.before ?? '-'} -> ${mism ?? '-'} | ${g} | ${d} |`);
};

// ===========================================================================
let baselineWritten = null;
let boardReadings = null;
const wantBoards = groups.has('baseline') || groups.has('skin') || groups.has('cues');
if (wantBoards) boardReadings = await boards(wk);

if (groups.has('baseline')) {
  const b = { engine: 'webkit coarse', states: {}, boardMismatchesBefore: {}, forced: null };
  for (const [state, width] of [...STATES, ['filled', 1024]]) {
    const r = await readApp(wk, 'webkit', width, state);
    b.states[`${state}-${width}`] = lite(r);
  }
  const S = b.states;
  const H = [['read-1366', 898.7], ['blank-1366', 767.3], ['filled-1366', 2483.4], ['read-393', 556.2], ['blank-393', 789.7], ['filled-393', 2612.2], ['filled-1024', 1477.4]];
  for (const [k, h] of H) cc(near(S[k].h, h), `baseline: ${k} log height ${S[k].h} is the as-built ${h}`);
  cc(S['read-1366'].count === 76 && S['blank-1366'].count === 67 && S['filled-1366'].count === 277, `baseline: element counts at 1366 are 76, 67, 277 (got ${S['read-1366'].count}, ${S['blank-1366'].count}, ${S['filled-1366'].count})`);
  cc(S['filled-1024'].count === 276, `baseline: 1024 wide grid has 276 elements (got ${S['filled-1024'].count})`);
  const G = { 1366: [59.8, 33, 26, 6, 1177.7], 393: [75, 33, 26, 6, 1268.9] };
  for (const w of [1366, 393]) {
    const g = S[`filled-${w}`].gaps;
    ['cue_item', 'group_cue', 'head_cue', 'cue_chips', 'region'].forEach((k, i) => cc(g && near(g[k], G[w][i]), `baseline: ${w} built ${k} ${g?.[k]} is ${G[w][i]}`));
  }
  for (const c of S['filled-393'].clear) cc(c.d_bottom < -12, `baseline: 393 Clear (${c.name}) sits above its name, d_bottom ${c.d_bottom} below -12`);
  for (const w of [1366, 1024]) for (const c of S[`filled-${w}`].clear) cc(Math.abs(c.d_bottom) <= 1, `baseline: ${w} Clear (${c.name}) d_bottom ${c.d_bottom} within 1 of 0`);
  // the before column: the unskinned build against both boards
  const mm = await boardMismatches(wk, 'webkit', [...APP_PIDS, ...CUE_BUILT], boardReadings);
  for (const [pid, m] of Object.entries(mm)) b.boardMismatchesBefore[pid] = m.length;
  const fc = await forcedColours();
  b.forced = fc;
  forcedChecks('baseline forced colours (Chrome)', fc);
  baselineWritten = b;
  await writeFile(BASELINE_PATH, JSON.stringify(b, null, 1));
  for (const [state, width] of [...STATES, ['filled', 1024]]) {
    const k = `${state}-${width}`;
    report('baseline', width, state, S[k], S[k].h, null, { before: b.boardMismatchesBefore[k] ?? b.boardMismatchesBefore[`cues-built-${width}`] });
  }
  console.log('baseline board mismatches before:', JSON.stringify(b.boardMismatchesBefore));
}

const base = baselineWritten ?? (groups.size > 0 && !groups.has('baseline') ? await loadBaseline() : null);
const baseH = (k) => base.states[k].h;
const beforeOf = (pid) => base.boardMismatchesBefore[pid];

if (groups.has('skin')) {
  const pids = [...APP_PIDS, ...CUE_BUILT];
  const mm = await boardMismatches(wk, 'webkit', pids, boardReadings);
  for (const pid of pids) {
    cc(mm[pid].length === 0, `skin: ${pid} matches the board element by element (${mm[pid].length} mismatches${mm[pid].length ? '; first: ' + mm[pid].slice(0, 6).join(' | ') : ''})`);
    const [state, width] = appFor(pid);
    const now = await readApp(wk, 'webkit', width, state);
    cc(near(now.h, baseH(`${state}-${width}`)), `skin: ${pid} log height ${now.h} equals the baseline ${baseH(`${state}-${width}`)}`);
    cc(now.over === 0, `skin: ${pid} overflow ${now.over} is 0`);
    if (!pid.startsWith('cues')) report('skin', width, state, now, baseH(`${state}-${width}`), mm[pid].length, { before: beforeOf(pid) });
  }
  const w1024 = await readApp(wk, 'webkit', 1024, 'filled');
  cc(near(w1024.h, baseH('filled-1024')), `skin: 1024 height ${w1024.h} equals the baseline ${baseH('filled-1024')}`);
  cc(w1024.over === 0, `skin: 1024 overflow ${w1024.over} is 0`);
  forcedChecks('skin forced colours (Chrome)', await forcedColours());
  // the same comparison in system Chrome, app and board in one engine
  try {
    chrome ??= await launch();
    const cb = await boards(chrome);
    const cm = await boardMismatches(chrome, 'chrome', pids, cb);
    for (const pid of pids) {
      console.log(`skin (Chrome): ${pid} ${cm[pid].length} mismatches${cm[pid].length ? ' first: ' + cm[pid].slice(0, 4).join(' | ') : ''}`);
      cc(cm[pid].length === 0, `skin (Chrome): ${pid} matches the board (${cm[pid].length} mismatches)`);
    }
  } catch (e) {
    if (e.name === 'PointerModeMismatch') console.log(`skin (Chrome): coarse pointer cannot be emulated, WebKit stays the gate (${e.message})`);
    else throw e;
  }
}

if (groups.has('cues')) {
  const appPids = ['read-1366', 'blank-1366', 'read-393', 'blank-393'];
  const mmA = await boardMismatches(wk, 'webkit', appPids, boardReadings);
  for (const pid of appPids) cc(mmA[pid].length === 0, `cues: ${pid} still matches record-pen-app.html (${mmA[pid].length} mismatches${mmA[pid].length ? '; first: ' + mmA[pid].slice(0, 6).join(' | ') : ''})`);
  const mmC = await boardMismatches(wk, 'webkit', CUE_C, boardReadings);
  const WANT = { 1366: [2452.6, [25.8, 45, 12, 6, 1147]], 393: [2557.4, [25.8, 45, 12, 6, 1214.2]] };
  for (const pid of CUE_C) {
    cc(mmC[pid].length === 0, `cues: ${pid} matches the C panel element by element (${mmC[pid].length} mismatches${mmC[pid].length ? '; first: ' + mmC[pid].slice(0, 8).join(' | ') : ''})`);
  }
  for (const w of [1366, 393]) {
    const now = await readApp(wk, 'webkit', w, 'filled');
    cc(near(now.h, WANT[w][0]), `cues: filled ${w} height ${now.h} is ${WANT[w][0]}`);
    ['cue_item', 'group_cue', 'head_cue', 'cue_chips', 'region'].forEach((k, i) => cc(now.gaps && near(now.gaps[k], WANT[w][1][i]), `cues: ${w} ${k} ${now.gaps?.[k]} is ${WANT[w][1][i]}`));
    cc(now.over === 0, `cues: ${w} overflow ${now.over} is 0`);
    report('cues', w, 'filled', now, baseH(`filled-${w}`), mmC[`cues-C-${w}`].length, { before: '-' });
  }
  for (const [state, w] of [['read', 1366], ['blank', 1366], ['read', 393], ['blank', 393]]) {
    const now = await readApp(wk, 'webkit', w, state);
    cc(near(now.h, baseH(`${state}-${w}`)), `cues: ${state} ${w} height ${now.h} equals the baseline ${baseH(`${state}-${w}`)}`);
  }
  const w1024 = await readApp(wk, 'webkit', 1024, 'filled');
  cc(near(w1024.h, 1485.0), `cues: 1024 height ${w1024.h} is 1485.0`);
  cc(w1024.defectsMargin === base.states['filled-1024'].defectsMargin, `cues: 1024 defects head margin-bottom ${w1024.defectsMargin} equals the baseline ${base.states['filled-1024'].defectsMargin}`);
  cc(w1024.over === 0, `cues: 1024 overflow ${w1024.over} is 0`);
  report('cues', 1024, 'filled', w1024, baseH('filled-1024'), null);
  forcedChecks('cues forced colours (Chrome)', await forcedColours());
}

if (groups.has('clear')) {
  const r1366 = await readApp(wk, 'webkit', 1366, 'filled');
  const r393 = await readApp(wk, 'webkit', 393, 'filled');
  const r1024 = await readApp(wk, 'webkit', 1024, 'filled');
  cc(r393.clear.length > 0, `clear: 393 shows ${r393.clear.length} heads with Clear`);
  cc(JSON.stringify(r393.clear.map((c) => c.name)) === JSON.stringify(r1366.clear.map((c) => c.name)), `clear: the same heads show Clear at 393 and 1366 (${r393.clear.map((c) => c.name).join(', ')} against ${r1366.clear.map((c) => c.name).join(', ')})`);
  r393.clear.forEach((c, i) => {
    const ref = r1366.clear[i];
    cc(ref && near(c.d_bottom, ref.d_bottom), `clear: 393 ${c.name} d_bottom ${c.d_bottom} within 0.5 of 1366's ${ref?.d_bottom}`);
  });
  const baseClear = base.states['filled-393'].clear;
  r393.clear.forEach((c, i) => {
    cc(near(c.head_h, baseClear[i].head_h) && c.head_h === 44, `clear: 393 ${c.name} head height ${c.head_h} equals the baseline ${baseClear[i].head_h} (44)`);
    cc(near(c.clear_h, baseClear[i].clear_h) && c.clear_h === 44, `clear: 393 ${c.name} Clear box height ${c.clear_h} equals the baseline ${baseClear[i].clear_h} (44)`);
  });
  for (const [w, now] of [[1366, r1366], [1024, r1024]]) {
    const bc = base.states[`filled-${w}`].clear;
    cc(now.clear.length === bc.length, `clear: ${w} has ${now.clear.length} Clear heads like the baseline ${bc.length}`);
    now.clear.forEach((c, i) => {
      cc(bc[i] && near(c.d_bottom, bc[i].d_bottom), `clear: ${w} ${c.name} d_bottom ${c.d_bottom} equals the baseline ${bc[i]?.d_bottom}`);
      cc(bc[i] && near(c.head_h, bc[i].head_h) && near(c.clear_h, bc[i].clear_h), `clear: ${w} ${c.name} head ${c.head_h} and Clear box ${c.clear_h} equal the baseline`);
    });
  }
  const bd = await boards(wk);
  const mmC = await boardMismatches(wk, 'webkit', CUE_C, bd);
  for (const pid of CUE_C) cc(mmC[pid].length === 0, `clear: ${pid} still matches the C panel (${mmC[pid].length} mismatches${mmC[pid].length ? '; first: ' + mmC[pid].slice(0, 6).join(' | ') : ''})`);
  report('clear', 393, 'filled', r393, baseH('filled-393'), mmC['cues-C-393'].length, { before: '-' });
  report('clear', 1366, 'filled', r1366, baseH('filled-1366'), mmC['cues-C-1366'].length, { before: '-' });
  report('clear', 1024, 'filled', r1024, baseH('filled-1024'), null);
}

console.log('| Group | Width | State | Height (baseline -> now) | Board mismatches (before -> now) | Cue gaps (item/group/head/chips) | Clear d_bottom |');
console.log('|---|---|---|---|---|---|---|');
for (const row of rows) console.log(row);

await wk.close();
if (chrome) await chrome.close();
await servers.close();
finish(failures, count, `261004-ox4 probe (${[...groups].join(',')})`);
process.exit(process.exitCode ?? 0);
