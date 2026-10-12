// Quick task 261011-x97's probe, extended from 261011-wqn's: on a recipe's version
// details, Print sheet must meet the touch floor (--touch-min) under a coarse pointer
// even when it wraps onto a line of its own (Mark's 04-09 tap-target rule).
// Measures Version 4 of Mexican Chocolate in Playwright's WebKit (393, 724, 1024 and
// 1366 at a coarse pointer, plus 1366 fine) and in system Chrome (393, 724, 1024 and
// 1366, fine).
//
//   node 261011-x97-probe.mjs before   (build of the UNCHANGED source: writes the
//                                       baseline JSON, then checks the plan's
//                                       predicted cause Q0-Q4; exits non-zero if it
//                                       departs)
//   node 261011-x97-probe.mjs after    (build of the fixed source: wqn's A1-A4 plus the
//                                       touch-floor checks B1-B3)
//
// Each run builds the current source ONCE into a fresh mkdtemp folder under
// os.tmpdir() (npm run build --outDir) and serves it through the 03.5 harness's own
// ephemeral 127.0.0.1 servers. It never writes app/dist (Mark's `vite preview` serves
// it), never requests :4173, :5173 or :8011, and starts no dev or preview server.
// Every browser context aborts any request whose host is not 127.0.0.1. A reading
// here is evidence about two engines on the Mac, not about Mark's iPad; the device is
// his to check.
import { readFile, writeFile, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, check, finish, REPO_ROOT } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BEFORE_PATH = path.join(HERE, '261011-x97-before.json');
const WQN_BEFORE_PATH = path.join(HERE, '..', '261011-wqn-align-the-action-row-on-a-recipe-s-versi', '261011-wqn-before.json'); // read only
const ROUTE = '/notebook/mexican-chocolate/mexican-chocolate-v4';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const CELLS = [
  { engine: 'webkit', width: 393, coarse: true },
  { engine: 'webkit', width: 724, coarse: true },
  { engine: 'webkit', width: 1024, coarse: true },
  { engine: 'webkit', width: 1366, coarse: true },
  { engine: 'webkit', width: 1366, coarse: false },
  { engine: 'chrome', width: 393, coarse: false },
  { engine: 'chrome', width: 724, coarse: false },
  { engine: 'chrome', width: 1024, coarse: false },
  { engine: 'chrome', width: 1366, coarse: false },
];
const cellKey = (c) => `${c.engine}|${c.width}|${c.coarse ? 'coarse' : 'fine'}`;

// ---------------------------------------------------------------------------
// The in-page reading. Everything comes from the real DOM.
function readInPage() {
  const sx = window.scrollX;
  const sy = window.scrollY;
  const box = (r) => ({ x: r.left + sx, y: r.top + sy, w: r.width, h: r.height });

  const px = (cssValue, property) => {
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;${property}:${cssValue}`;
    document.body.appendChild(probe);
    const value = parseFloat(getComputedStyle(probe)[property]);
    probe.remove();
    return value;
  };

  const row = document.querySelector('.notebook-version__acts');
  const section = row.closest('section.notebook-version');
  const rcs = getComputedStyle(row);

  const controls = [...row.children].map((el) => {
    const cs = getComputedStyle(el);
    const range = document.createRange();
    range.selectNodeContents(el);
    const t = range.getBoundingClientRect();
    return {
      tag: el.tagName,
      text: el.textContent.replace(/\s+/g, ' ').trim(),
      classes: [...el.classList],
      rect: box(el.getBoundingClientRect()),
      textTop: t.top + sy,
      textBottom: t.bottom + sy,
      display: cs.display,
      alignItems: cs.alignItems,
      lineHeight: cs.lineHeight,
      minHeight: cs.minHeight,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      textDecorationLine: cs.textDecorationLine,
    };
  });

  // Every visible a and button inside .notebook-band, keyed by name plus class list.
  const seen = {};
  const band = {};
  for (const el of document.querySelectorAll('.notebook-band a, .notebook-band button')) {
    const r = el.getBoundingClientRect();
    if (!(r.width > 0) || el.closest('[hidden]')) continue;
    const name = (el.getAttribute('aria-label') || el.textContent).replace(/\s+/g, ' ').trim();
    const base = `${name}|${[...el.classList].join('.')}`;
    seen[base] = (seen[base] ?? 0) + 1;
    band[seen[base] === 1 ? base : `${base}#${seen[base]}`] = box(r);
  }

  return {
    row: { rect: box(row.getBoundingClientRect()), alignItems: rcs.alignItems, flexWrap: rcs.flexWrap, columnGap: rcs.columnGap },
    section: box(section.getBoundingClientRect()),
    bandRect: box(document.querySelector('.notebook-band').getBoundingClientRect()),
    touchMin: px('var(--touch-min)', 'height'),
    actsGap: px('var(--app-notebook-acts-gap)', 'width'),
    controls,
    band,
  };
}

const raf = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

async function park(page) {
  await page.mouse.move(1, 1);
  await page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());
  await raf(page);
}

async function openPage(browser, appUrl, cell) {
  const context = await browser.newContext({ viewport: { width: cell.width, height: 1000 }, hasTouch: cell.coarse, isMobile: false, deviceScaleFactor: 1 });
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + ROUTE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook-version__acts');
  await page.evaluate(() => document.fonts.ready);
  await raf(page);
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== cell.coarse || state.innerWidth !== cell.width) {
    await context.close();
    throw new Error(`openPage: wanted coarse=${cell.coarse} width=${cell.width}, got ${JSON.stringify(state)}`);
  }
  return { context, page };
}

async function measureCell(browser, appUrl, cell, group, shotDir) {
  const { context, page } = await openPage(browser, appUrl, cell);
  try {
    await park(page);
    const reading = await page.evaluate(readInPage);
    const shot = path.join(shotDir, `${group}-${cellKey(cell).replace(/\|/g, '-')}.png`);
    await page.locator('.notebook-version__acts').screenshot({ path: shot });
    await park(page);
    reading.screenshot = shot;
    return reading;
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const near = (a, b, tol = 0.5) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol;
const round = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : n);
const rectEq = (a, b) => near(a.x, b.x) && near(a.y, b.y) && near(a.w, b.w) && near(a.h, b.h);
const fmt = (r) => `{x:${round(r.x)},y:${round(r.y)},w:${round(r.w)},h:${round(r.h)}}`;

// Controls grouped into lines by box top (within 1px), in DOM order.
function linesOf(controls) {
  const lines = [];
  for (const c of controls) {
    const line = lines.find((l) => Math.abs(l[0].rect.y - c.rect.y) <= 1);
    if (line) line.push(c);
    else lines.push([c]);
  }
  return lines;
}

// Per line: the gap between consecutive controls (next x minus previous right edge).
const gapsOf = (line) => line.slice(1).map((c, i) => round(c.rect.x - (line[i].rect.x + line[i].rect.w)));

// Room between Print sheet's right edge and the parent section's right edge.
function roomToEdge(reading) {
  const print = reading.controls.find((c) => c.text === 'Print sheet');
  return print ? round(reading.section.x + reading.section.w - (print.rect.x + print.rect.w)) : null;
}

function summaryLine(ck, reading) {
  return {
    cell: ck,
    lines: linesOf(reading.controls).map((line) => ({
      controls: line.map((c) => ({ t: c.text, tag: c.tag, y: round(c.rect.y), h: round(c.rect.h), textTop: round(c.textTop), textBottom: round(c.textBottom) })),
      gaps: gapsOf(line),
    })),
    roomToRightEdge: roomToEdge(reading),
  };
}

// This task's predicted cause (Q0-Q4), read from the unchanged build. Returns departures.
const WRAP_CELLS = ['webkit|724|coarse', 'chrome|724|fine'];
const hasFloor = (minHeight, touchMin) => {
  const v = parseFloat(minHeight);
  return Number.isFinite(v) && v >= touchMin - 0.5;
};
function predictionDepartures(ck, reading, state, wqnBase) {
  const dep = [];
  const { row, controls, touchMin, actsGap } = reading;
  const coarse = ck.endsWith('|coarse');
  const lines = linesOf(controls);
  const print = controls.find((c) => c.text === 'Print sheet');
  // Q0: nothing has moved since 261011-wqn measured.
  if (!wqnBase) dep.push(`${ck} Q0: no 261011-wqn baseline for this cell`);
  else {
    if (!rectEq(row.rect, wqnBase.row.rect)) dep.push(`${ck} Q0: row ${fmt(row.rect)} vs wqn ${fmt(wqnBase.row.rect)}`);
    if (controls.length !== wqnBase.controls.length) dep.push(`${ck} Q0: ${controls.length} controls vs wqn ${wqnBase.controls.length}`);
    controls.forEach((c, i) => {
      const b = wqnBase.controls[i];
      if (b && !(c.text === b.text && rectEq(c.rect, b.rect))) dep.push(`${ck} Q0: "${c.text}" ${fmt(c.rect)} vs wqn "${b.text}" ${fmt(b.rect)}`);
    });
  }
  // Q1: under a coarse pointer every button has app.css's floor; the Print sheet anchor has none.
  if (coarse) {
    for (const c of controls) {
      if (c.tag === 'BUTTON' && !near(parseFloat(c.minHeight), touchMin)) dep.push(`${ck} Q1: BUTTON "${c.text}" min-height ${c.minHeight} vs --touch-min ${touchMin}`);
    }
  }
  if (!print || print.tag !== 'A') dep.push(`${ck} Q1: Print sheet is ${print && print.tag} (want A)`);
  else if (hasFloor(print.minHeight, touchMin)) dep.push(`${ck} Q1: Print sheet already has min-height ${print.minHeight} (want no floor)`);
  // Q2 / Q3: where Print sheet sits.
  const printLine = print && lines.find((l) => l.includes(print));
  if (print && printLine) {
    if (WRAP_CELLS.includes(ck)) {
      const last = lines[lines.length - 1];
      if (!(printLine === last && printLine.length === 1)) dep.push(`${ck} Q2: Print sheet is not alone on the row's last line`);
      if (!(print.rect.h < touchMin - 0.5)) dep.push(`${ck} Q2: Print sheet height ${round(print.rect.h)} is not below --touch-min ${touchMin}`);
      const prevLine = lines[lines.length - 2];
      if (!prevLine) dep.push(`${ck} Q2: no line before Print sheet's`);
      else {
        const prevBottom = Math.max(...prevLine.map((c) => c.rect.y + c.rect.h));
        if (!near(print.rect.y, prevBottom + actsGap)) dep.push(`${ck} Q2: Print sheet y ${round(print.rect.y)} vs previous bottom ${round(prevBottom)} + gap ${actsGap}`);
      }
      const prevH = prevLine ? round(Math.max(...prevLine.map((c) => c.rect.h))) : null;
      state.q2 = `Print sheet h ${round(print.rect.h)} alone on its line; previous line's tallest ${prevH}; --touch-min ${touchMin}`;
      if (ck === 'webkit|724|coarse') state.growth = round(touchMin - print.rect.h);
    } else {
      const mates = printLine.filter((c) => c.tag === 'BUTTON');
      if (mates.length < 1) dep.push(`${ck} Q3: Print sheet shares its line with no BUTTON`);
      const tallest = Math.max(...printLine.map((c) => c.rect.h));
      if (!near(print.rect.h, tallest)) dep.push(`${ck} Q3: Print sheet height ${round(print.rect.h)} vs line tallest ${round(tallest)}`);
      if (!(print.rect.h >= touchMin - 0.5)) dep.push(`${ck} Q3: Print sheet height ${round(print.rect.h)} below --touch-min ${touchMin}`);
    }
  }
  // Q4: wqn's A1 still holds on every line.
  for (const line of lines) {
    const tops = line.map((c) => c.textTop);
    const bottoms = line.map((c) => c.textBottom);
    if (Math.max(...tops) - Math.min(...tops) > 0.5) dep.push(`${ck} Q4: text tops ${tops.map(round).join(', ')} on line of ${line.map((c) => c.text).join(' / ')}`);
    if (Math.max(...bottoms) - Math.min(...bottoms) > 0.5) dep.push(`${ck} Q4: text bottoms ${bottoms.map(round).join(', ')} on line of ${line.map((c) => c.text).join(' / ')}`);
  }
  return dep;
}

// The after group's touch-floor checks B1-B3 for one cell.
function touchFloorChecks(ck, reading, base) {
  const coarse = ck.endsWith('|coarse');
  const print = reading.controls.find((c) => c.text === 'Print sheet');
  const basePrint = base && base.controls.find((c) => c.text === 'Print sheet');
  const { touchMin } = reading;
  if (!print || !basePrint) {
    countedCheck(false, `${ck} B1: Print sheet missing (now ${!!print}, baseline ${!!basePrint})`);
    return;
  }
  // B1: coarse cells meet the floor; fine cells keep the baseline's computed min-height string.
  if (coarse) {
    countedCheck(print.rect.h >= touchMin - 0.5, `${ck} B1: Print sheet height ${round(print.rect.h)} vs --touch-min ${touchMin}`);
    countedCheck(near(parseFloat(print.minHeight), touchMin), `${ck} B1: Print sheet min-height ${print.minHeight} vs --touch-min ${touchMin}`);
    // B2: the text sits centred in its box.
    const above = print.textTop - print.rect.y;
    const below = print.rect.y + print.rect.h - print.textBottom;
    countedCheck(Math.abs(above - below) <= 1, `${ck} B2: Print sheet text above ${round(above)}, below ${round(below)}`);
  } else {
    countedCheck(print.minHeight === basePrint.minHeight, `${ck} B1: fine pointer Print sheet min-height ${print.minHeight} vs baseline ${basePrint.minHeight}`);
  }
  if (ck !== 'webkit|724|coarse') return;

  // B3: only the link's own line grows, by g.
  const g = touchMin - basePrint.rect.h;
  console.log(`B3 growth g = ${round(g)} (baseline Print sheet h ${round(basePrint.rect.h)}, --touch-min ${touchMin})`);
  countedCheck(near(print.rect.x, basePrint.rect.x) && near(print.rect.y, basePrint.rect.y) && near(print.rect.w, basePrint.rect.w), `${ck} B3: Print sheet x/y/w ${fmt(print.rect)} vs baseline ${fmt(basePrint.rect)}`);
  countedCheck(near(print.rect.h, touchMin), `${ck} B3: Print sheet height ${round(print.rect.h)} vs --touch-min ${touchMin}`);
  reading.controls.forEach((c, i) => {
    const b = base.controls[i];
    if (c === print || !b) return;
    countedCheck(c.text === b.text && rectEq(c.rect, b.rect), `${ck} B3: "${c.text}" ${fmt(c.rect)} vs baseline "${b.text}" ${fmt(b.rect)}`);
  });
  countedCheck(reading.controls.length === base.controls.length, `${ck} B3: ${reading.controls.length} controls vs baseline ${base.controls.length}`);
  const r = reading.row.rect;
  const br = base.row.rect;
  countedCheck(near(r.x, br.x) && near(r.y, br.y) && near(r.w, br.w), `${ck} B3: row x/y/w ${fmt(r)} vs baseline ${fmt(br)}`);
  countedCheck(near(r.h, br.h + g), `${ck} B3: row height ${round(r.h)} vs baseline ${round(br.h)} + g ${round(g)}`);
  const ownKey = Object.keys(base.band).find((k) => k.startsWith('Print sheet|') && rectEq(base.band[k], basePrint.rect));
  countedCheck(ownKey !== undefined, `${ck} B3: Print sheet's own band key found`);
  const rowBottom = br.y + br.h;
  const moved = [];
  const bad = [];
  for (const [key, b] of Object.entries(base.band)) {
    if (key === ownKey) continue;
    const now = reading.band[key];
    if (!now) {
      bad.push(`${key}: missing`);
      continue;
    }
    if (!(near(now.x, b.x) && near(now.w, b.w) && near(now.h, b.h))) bad.push(`${key}: ${fmt(now)} vs baseline ${fmt(b)} (x/w/h changed)`);
    const dy = now.y - b.y;
    if (Math.abs(dy) <= 0.5) continue;
    if (dy > 0.5 && dy <= g + 0.5 && b.y >= rowBottom - 0.5) moved.push(`${key}: +${round(dy)}`);
    else bad.push(`${key}: y moved ${round(dy)} (baseline y ${round(b.y)}, row bottom ${round(rowBottom)}, g ${round(g)})`);
  }
  countedCheck(bad.length === 0, `${ck} B3: ${bad.join(' | ')}`);
  console.log(`B3 band controls moved: ${moved.length ? moved.join(' | ') : 'none'}`);
  const bb = reading.bandRect;
  const bbb = base.bandRect;
  countedCheck(!!bb && !!bbb && near(bb.x, bbb.x) && near(bb.y, bbb.y) && near(bb.w, bbb.w), `${ck} B3: band x/y/w ${bb && fmt(bb)} vs baseline ${bbb && fmt(bbb)}`);
  countedCheck(!!bb && !!bbb && bb.h - bbb.h >= -0.5 && bb.h - bbb.h <= g + 0.5, `${ck} B3: band height ${bb && round(bb.h)} vs baseline ${bbb && round(bbb.h)} (g ${round(g)})`);
  if (bb && bbb) console.log(`B3 band height ${round(bbb.h)} -> ${round(bb.h)}`);
}

// ---------------------------------------------------------------------------
async function run(group) {
  const buildDir = await mkdtemp(path.join(os.tmpdir(), 'x97-build-'));
  const shotDir = await mkdtemp(path.join(os.tmpdir(), 'x97-shots-'));
  await mkdir(shotDir, { recursive: true });
  let servers;
  const results = {};
  const departures = [];
  const baseline = group === 'after' ? JSON.parse(await readFile(BEFORE_PATH, 'utf8')).cells : null;
  const wqnBaseline = group === 'before' ? JSON.parse(await readFile(WQN_BEFORE_PATH, 'utf8')).cells : null;
  let growth = null;
  try {
    try {
      execFileSync('npm', ['--prefix', path.join(REPO_ROOT, 'app'), 'run', 'build', '--', '--outDir', buildDir, '--emptyOutDir'], { stdio: 'pipe' });
    } catch (err) {
      console.log(String(err.stdout ?? ''), String(err.stderr ?? ''));
      throw err;
    }
    servers = await startServers({ appRoot: buildDir });
    const engines = { webkit: () => webkit.launch(), chrome: () => launch() };
    for (const engine of ['webkit', 'chrome']) {
      const browser = await engines[engine]();
      try {
        for (const cell of CELLS.filter((c) => c.engine === engine)) {
          const ck = cellKey(cell);
          const reading = await measureCell(browser, servers.appUrl, cell, group, shotDir);
          results[ck] = reading;
          const state = {};
          console.log(JSON.stringify(summaryLine(ck, reading)));
          console.log(`  screenshot ${reading.screenshot}`);
          const printNow = reading.controls.find((c) => c.text === 'Print sheet');
          console.log(`  Print sheet min-height ${printNow && printNow.minHeight}; buttons ${reading.controls.filter((c) => c.tag === 'BUTTON').map((c) => c.minHeight).join(', ')}; row h ${round(reading.row.rect.h)}; band h ${round(reading.bandRect.h)}`);

          if (group === 'before') {
            departures.push(...predictionDepartures(ck, reading, state, wqnBaseline[ck]));
            if (state.q2) {
              reading.q2 = state.q2;
              console.log(`Q2 ${ck}: ${state.q2}`);
            }
            if (state.growth !== undefined) growth = state.growth;
          } else {
            const base = baseline[ck];
            countedCheck(base !== undefined, `${ck}: baseline reading exists`);
            // A1: one baseline per line, same face, size and weight.
            for (const line of linesOf(reading.controls)) {
              const tops = line.map((c) => c.textTop);
              const bottoms = line.map((c) => c.textBottom);
              countedCheck(Math.max(...tops) - Math.min(...tops) <= 0.5, `${ck} A1: text tops ${tops.map(round).join(', ')} on line of ${line.map((c) => c.text).join(' / ')}`);
              countedCheck(Math.max(...bottoms) - Math.min(...bottoms) <= 0.5, `${ck} A1: text bottoms ${bottoms.map(round).join(', ')} on line of ${line.map((c) => c.text).join(' / ')}`);
              for (const prop of ['fontFamily', 'fontSize', 'fontWeight']) {
                countedCheck(new Set(line.map((c) => c[prop])).size === 1, `${ck} A1: ${prop} differs on line of ${line.map((c) => c.text).join(' / ')} (${line.map((c) => c[prop]).join(' | ')})`);
              }
            }
            // A2 and A3 hold in every cell except webkit|724|coarse, where B3 bounds the change.
            if (base && ck !== 'webkit|724|coarse') {
              // A2: the row and each control keep the baseline rect.
              countedCheck(rectEq(reading.row.rect, base.row.rect), `${ck} A2: row ${fmt(reading.row.rect)} vs baseline ${fmt(base.row.rect)}`);
              countedCheck(reading.controls.length === base.controls.length, `${ck} A2: ${reading.controls.length} controls vs baseline ${base.controls.length}`);
              reading.controls.forEach((c, i) => {
                const b = base.controls[i];
                if (b) countedCheck(c.text === b.text && rectEq(c.rect, b.rect), `${ck} A2: "${c.text}" ${fmt(c.rect)} vs baseline "${b.text}" ${fmt(b.rect)}`);
              });
              // A3: every keyed band control keeps its baseline rect.
              const bad = [];
              for (const [key, r] of Object.entries(base.band)) {
                const now = reading.band[key];
                if (!now) bad.push(`${key}: missing`);
                else if (!rectEq(now, r)) bad.push(`${key}: ${fmt(now)} vs baseline ${fmt(r)}`);
              }
              countedCheck(bad.length === 0, `${ck} A3: ${bad.join(' | ')}`);
            }
            // A4: Print sheet keeps its underline.
            const print = reading.controls.find((c) => c.text === 'Print sheet');
            countedCheck(!!print && print.textDecorationLine.includes('underline'), `${ck} A4: Print sheet text-decoration-line ${print && print.textDecorationLine}`);
            if (base) touchFloorChecks(ck, reading, base);
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    if (servers) await servers.close();
    await rm(buildDir, { recursive: true, force: true });
  }

  if (group === 'before') {
    const prediction = departures.length === 0;
    await writeFile(BEFORE_PATH, JSON.stringify({ prediction, predictedGrowth: growth, departures, cells: results }, null, 2) + '\n');
    for (const d of departures) console.log(`DEPARTS ${d}`);
    console.log(`predicted growth g at webkit|724|coarse = ${growth}`);
    countedCheck(prediction, `the plan's predicted cause held (${departures.length} departing readings)`);
  }
  console.log(`screenshots in ${shotDir}`);
}

const group = process.argv[2];
if (group !== 'before' && group !== 'after') {
  console.log('usage: node 261011-x97-probe.mjs before|after');
  process.exit(2);
}
await run(group);
finish(failures, count, `261011-x97 probe (${group})`);
