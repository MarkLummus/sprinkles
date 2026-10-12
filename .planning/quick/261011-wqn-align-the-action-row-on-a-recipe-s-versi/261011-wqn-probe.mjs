// Quick task 261011-wqn's probe: on a recipe's version details, Print sheet must sit
// on the same line of text as Next version and Show changes (Mark, 2026-10-11, iPad:
// "Print sheet floats above the baseline of the other two").
// Measures Version 4 of Mexican Chocolate in Playwright's WebKit (393, 724, 1024 and
// 1366 at a coarse pointer, plus 1366 fine) and in system Chrome (393, 724, 1024 and
// 1366, fine).
//
//   node 261011-wqn-probe.mjs before   (build of the UNCHANGED source: writes the
//                                       baseline JSON, then checks the plan's
//                                       predicted cause; exits non-zero if it departs)
//   node 261011-wqn-probe.mjs after    (build of the fixed source: one baseline per
//                                       line, no box moved, underline kept)
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
const BEFORE_PATH = path.join(HERE, '261011-wqn-before.json');
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

// The plan's predicted cause, read from the unchanged build. Returns departures.
function predictionDepartures(ck, reading, state) {
  const dep = [];
  const { row, controls, touchMin, actsGap } = reading;
  // P1: the row keeps flex's default stretch.
  if (!(row.alignItems === 'normal' || row.alignItems === 'stretch')) dep.push(`${ck} P1: row align-items ${row.alignItems} (want normal or stretch)`);
  const lines = linesOf(controls);
  // P2: every control is as tall as its line's tallest box, and at least --touch-min.
  // A line holding only the anchor (a wrapped lone Print sheet) is an informational
  // finding, not a departure: an <a> has no 44px floor, so nothing stretches it
  // (orchestrator decision, 2026-10-11). Every other P2 condition stays strict.
  for (const line of lines) {
    if (line.length === 1 && line[0].tag === 'A') {
      state.info = `${ck} P2 info: wrapped lone "${line[0].text}" is ${round(line[0].rect.h)}px tall (--touch-min ${touchMin}); an anchor has no 44px floor`;
      continue;
    }
    const tallest = Math.max(...line.map((c) => c.rect.h));
    for (const c of line) {
      if (!near(c.rect.h, tallest)) dep.push(`${ck} P2: "${c.text}" height ${round(c.rect.h)} vs line tallest ${round(tallest)}`);
      if (!(c.rect.h >= touchMin - 0.5)) dep.push(`${ck} P2: "${c.text}" height ${round(c.rect.h)} below --touch-min ${touchMin}`);
    }
  }
  // P3: Print sheet is a block <a> whose text sits at least 5px above the text of the
  // control before it, which is a <button> with its text centred in its box.
  const print = controls.find((c) => c.text === 'Print sheet');
  const line = lines.find((l) => l.includes(print));
  const before = line.slice(0, line.indexOf(print));
  if (before.length === 0) {
    state.p3 = 'not applicable (Print sheet starts its own line)';
  } else {
    state.p3 = 'applies';
    if (!(print.tag === 'A' && print.display === 'block')) dep.push(`${ck} P3: Print sheet is ${print.tag} display ${print.display} (want A, block)`);
    for (const b of before) {
      if (b.tag !== 'BUTTON') continue;
      const above = b.textTop - b.rect.y;
      const below = b.rect.y + b.rect.h - b.textBottom;
      if (Math.abs(above - below) > 1) dep.push(`${ck} P3: BUTTON "${b.text}" text not centred (above ${round(above)}, below ${round(below)})`);
    }
    const prev = before[before.length - 1];
    if (!(prev.textTop - print.textTop >= 5)) dep.push(`${ck} P3: Print sheet text top ${round(print.textTop)} is ${round(prev.textTop - print.textTop)}px above "${prev.text}" text top ${round(prev.textTop)} (want >= 5)`);
  }
  // P4: every gap is the token, and the first control starts at the row's left edge.
  for (const l of lines) {
    for (const g of gapsOf(l)) if (!near(g, actsGap)) dep.push(`${ck} P4: gap ${g} vs --app-notebook-acts-gap ${actsGap}`);
  }
  if (!near(controls[0].rect.x, row.rect.x)) dep.push(`${ck} P4: first control x ${round(controls[0].rect.x)} vs row x ${round(row.rect.x)}`);
  return dep;
}

// ---------------------------------------------------------------------------
async function run(group) {
  const buildDir = await mkdtemp(path.join(os.tmpdir(), 'wqn-build-'));
  const shotDir = await mkdtemp(path.join(os.tmpdir(), 'wqn-shots-'));
  await mkdir(shotDir, { recursive: true });
  let servers;
  const results = {};
  const departures = [];
  const baseline = group === 'after' ? JSON.parse(await readFile(BEFORE_PATH, 'utf8')).cells : null;
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

          if (group === 'before') {
            departures.push(...predictionDepartures(ck, reading, state));
            reading.p3 = state.p3;
            if (state.info) {
              reading.info = state.info;
              console.log(`INFO ${state.info}`);
            }
            if (ck === 'webkit|1366|coarse' && state.p3 !== 'applies') departures.push(`${ck} P3: not applicable in the WebKit 1366 coarse cell (${state.p3})`);
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
            if (base) {
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
    await writeFile(BEFORE_PATH, JSON.stringify({ prediction, departures, cells: results }, null, 2) + '\n');
    for (const d of departures) console.log(`DEPARTS ${d}`);
    countedCheck(prediction, `the plan's predicted cause held (${departures.length} departing readings)`);
  }
  console.log(`screenshots in ${shotDir}`);
}

const group = process.argv[2];
if (group !== 'before' && group !== 'after') {
  console.log('usage: node 261011-wqn-probe.mjs before|after');
  process.exit(2);
}
await run(group);
finish(failures, count, `261011-wqn probe (${group})`);
