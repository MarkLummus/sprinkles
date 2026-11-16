// 12-05: WebKit's own print and mobile Safari, on the BUILT round one.
//
//   PROBE_DIST=<scratch build> node 12-safari-check.mjs pdf|sim
//
//   pdf  prints the log pages to PDF through a WKWebView (12-wkprint.swift, letter paper, 0.5 in
//        above and below, 0.75 in at the sides), never Chrome's print. Case two (two own scales and
//        two own problems) is checked: page 1 holds "Batch log" and "Side 1 of 2", page 2 "Tasting
//        log" and "Side 2 of 2", no other page holds either side line, both log pages' ink starts
//        1.5 in down (100.8 to 115.2 pt) and the first page after them starts no more than 0.75 in
//        down. Case worst (12-cases.mjs: long maker words) is only REPORTed: nothing is fixed this
//        round (RESEARCH Open Question 2).
//   sim  opens case two's record pen and reading in mobile Safari in the iOS Simulator (an iPhone
//        whose Safari reports a width below 724), in the real app, and checks what the app drew:
//        Coffee flavour's anchors faint and strong only, its stop names, Body's anchors, the
//        reading's "2 of 5" and "heavy (4)", and no sideways scroll. A screenshot of each is kept.
//
// It reads PROBE_DIST, never builds, writes nothing into it, and refuses a PROBE_DIST that resolves
// to an app/dist folder (Mark's own `vite preview --host` serves that one). Every output goes under
// ${TMPDIR:-/tmp}/sprinkles-12/evidence-05. It runs its own node:http server bound to 127.0.0.1 on
// SAFARI_PORT (default 0: an ephemeral port; set SAFARI_PORT when the Simulator cannot reach it),
// which serves the build with the SPA fallback, a seed page from memory at
// /p12-seed?case=<key>&view=<print|pen|reading>, and POST /p12-report (JSON, kept in memory, 204).
//
// The seed page loads the case route in a hidden same-origin iframe so the app opens and seeds its
// own store, waits until that iframe's own document holds '.notebook-log' (the app has opened
// 'sprinkles' at its DB_VERSION and read the case's version), and only then runs inject from
// 12-cases.mjs. It opens no IndexedDB connection of its own: a versionless open before the app
// boots would create a storeless version 1 and block the app's open at the real version.
// For view=print it then replaces its own location with the case route plus /print; for pen and
// reading it removes the seeding frame and mounts a NEW full-window frame, so the app inside reads
// the injected records afresh.
//
// DEVICE-UNVERIFIED: a WKWebView on macOS and the Simulator are not the iPad. They are not proof of
// hardware Tab, touch or the iPad's paper print; round two's iPad rows carry those (D-13, D-14).
// Lines: PASS|FAIL pdf <check>, REPORT pdf <fact>, PASS|FAIL sim <check>, REPORT sim <fact>.
// Everything typed is English.
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, statSync, mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { CASES, inject } from './12-cases.mjs';

const run = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const EVIDENCE = path.join(process.env.TMPDIR || os.tmpdir() || '/tmp', 'sprinkles-12', 'evidence-05');

const mode = process.argv[2];
if (!['pdf', 'sim'].includes(mode)) {
  console.log('FAIL usage: PROBE_DIST=<scratch build> node 12-safari-check.mjs pdf|sim');
  process.exit(1);
}
if (!process.env.PROBE_DIST) {
  console.log('FAIL PROBE_DIST is not set: build to a scratch folder and pass it (this check never serves app/dist)');
  process.exit(1);
}
const DIST = path.resolve(process.env.PROBE_DIST);
if (!existsSync(path.join(DIST, 'index.html'))) {
  console.log(`FAIL no index.html in PROBE_DIST ${DIST}`);
  process.exit(1);
}
if (DIST === path.join(REPO, 'app', 'dist') || DIST.endsWith(`${path.sep}app${path.sep}dist`)) {
  console.log(`FAIL PROBE_DIST ${DIST} is an app/dist folder: build to a scratch folder instead`);
  process.exit(1);
}
mkdirSync(EVIDENCE, { recursive: true });

let failed = false;
const pass = (kind, text) => console.log(`PASS ${kind} ${text}`);
const fail = (kind, text) => {
  failed = true;
  console.log(`FAIL ${kind} ${text}`);
};
const report = (kind, text) => console.log(`REPORT ${kind} ${text}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// The loopback server: the build, the seed page and the report endpoint.
// ---------------------------------------------------------------------------
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
};

// What each page posted to /p12-report, in arrival order.
const reports = [];

// The seed page for one case. The case's data and inject's source are embedded; `<` is escaped so
// the JSON cannot close the script early.
function seedPage(caseKey, view) {
  const c = CASES[caseKey];
  const data = JSON.stringify({ c, view }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>p12 seed</title>
<style>html,body{margin:0;height:100%;background:#fff}iframe{border:0}</style></head>
<body><script>
const DATA = ${data};
const inject = ${inject.toString()};
const c = DATA.c, view = DATA.view;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (body) => fetch('/p12-report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ view, ...body }) });
const mount = (hidden) => {
  const f = document.createElement('iframe');
  f.src = c.route;
  if (hidden) f.style.cssText = 'position:fixed;left:-9999px;top:0;width:1024px;height:768px;visibility:hidden';
  else f.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0';
  document.body.append(f);
  return f;
};
const until = async (fn, ms) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await sleep(200); } return null; };
const logIn = (f) => until(() => f.contentDocument && f.contentDocument.querySelector('.notebook-log'), 30000);
const byText = (d, sel, re) => [...d.querySelectorAll(sel)].find((b) => re.test(b.textContent.trim()));
const shown = (el) => !!el && el.getClientRects().length > 0;
(async () => {
  try {
    let f = mount(true);
    if (!(await logIn(f))) { await post({ error: 'no .notebook-log in 30 s at ' + c.route }); return; }
    if (c.axes) await inject(c);
    if (view === 'print') { location.replace(c.route + '/print'); return; }
    f.remove();
    f = mount(false);
    if (!(await logIn(f))) { await post({ error: 'no .notebook-log after inject in 30 s at ' + c.route }); return; }
    const d = f.contentDocument, w = f.contentWindow;
    await sleep(600);
    let out = {};
    if (view === 'pen') {
      for (let i = 0; i < 4 && !byText(d, '.notebook-log button', /^Add tasting$/i); i++) {
        const b = byText(d, '.notebook-log button', /^Record (batch|another)$/);
        if (b) b.click();
        await until(() => byText(d, '.notebook-log button', /^Add tasting$/i), 1500);
      }
      for (let i = 0; i < 4 && !d.querySelector('.notebook-log .axis-mark'); i++) {
        const b = byText(d, '.notebook-log button', /^Add tasting$/i);
        if (b) b.click();
        await until(() => d.querySelector('.notebook-log .axis-mark'), 1500);
      }
      const coffee = [...d.querySelectorAll('.notebook-log .axis-mark')].find((a) => /Coffee flavour/.test(a.textContent));
      if (coffee) coffee.scrollIntoView({ block: 'start' });
      await sleep(400);
      out.scales = [...d.querySelectorAll('.notebook-log .axis-mark')].map((a) => ({
        name: a.querySelector('.axis-mark__name') ? a.querySelector('.axis-mark__name').textContent : '',
        anchors: [...a.querySelectorAll('.axis-mark__anchors span')].map((s) => s.textContent),
        names: [...a.querySelectorAll('input[type="radio"]')].map((i) => i.getAttribute('aria-label')),
      }));
    } else {
      for (let i = 0; i < 4 && !shown(d.querySelector('.tasting-reading .batch-row__cell')); i++) {
        const fold = [...d.querySelectorAll('.notebook-log [aria-expanded="false"]')].find((b) => /^Tasting/.test(b.textContent.trim()));
        if (fold) fold.click();
        await until(() => shown(d.querySelector('.tasting-reading .batch-row__cell')), 1500);
      }
      const first = d.querySelector('.tasting-reading .batch-row__cell');
      if (first) first.scrollIntoView({ block: 'center' });
      await sleep(400);
      out.cells = [...d.querySelectorAll('.tasting-reading .batch-row__cell')].map((x) => ({
        label: x.querySelector('.batch-row__cell-label') ? x.querySelector('.batch-row__cell-label').textContent : '',
        value: x.querySelector('.batch-row__cell-value') ? x.querySelector('.batch-row__cell-value').textContent : '',
      }));
    }
    out.innerWidth = w.innerWidth;
    out.topInnerWidth = window.innerWidth;
    out.scrollWidth = d.documentElement.scrollWidth;
    out.sideways = d.documentElement.scrollWidth > w.innerWidth;
    await post(out);
  } catch (e) {
    await post({ error: String(e && e.message || e) });
  }
})();
</script></body></html>`;
}

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname === '/p12-seed') {
        const key = url.searchParams.get('case');
        const view = url.searchParams.get('view') || 'print';
        if (!CASES[key] || !['print', 'pen', 'reading'].includes(view)) {
          res.writeHead(400);
          res.end('bad seed request');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(seedPage(key, view));
        return;
      }
      if (url.pathname === '/p12-report' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
          if (body.length > 1e6) req.destroy();
        });
        req.on('end', () => {
          try {
            reports.push(JSON.parse(body));
          } catch {
            reports.push({ error: 'unreadable report body' });
          }
          res.writeHead(204);
          res.end();
        });
        return;
      }
      let filePath = path.join(DIST, decodeURIComponent(url.pathname));
      const isFile = (p) => existsSync(p) && statSync(p).isFile();
      if (path.extname(url.pathname) === '' && !isFile(filePath)) filePath = path.join(DIST, 'index.html');
      if (!filePath.startsWith(DIST) || !isFile(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(await readFile(filePath));
    } catch (error) {
      res.writeHead(500);
      res.end(String(error));
    }
  });
  const port = Number(process.env.SAFARI_PORT ?? 0);
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function waitForReport(view, ms) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    const r = reports.find((x) => x.view === view);
    if (r) return r;
    await sleep(300);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mode pdf
// ---------------------------------------------------------------------------
const norm = (s) => s.replace(/\s*\|\s*/g, ' ').replace(/\s+/g, ' ');

async function printCase(base, caseKey) {
  const c = CASES[caseKey];
  const out = path.join(EVIDENCE, `${caseKey}.pdf`);
  const url = `${base}/p12-seed?case=${caseKey}&view=print`;
  const ready = `!!document.querySelector('.print-route[data-print-ready="true"]') && document.fonts.status === 'loaded'`;
  const before = reports.length;
  try {
    await run('swift', [path.join(HERE, '12-wkprint.swift'), url, out], {
      env: { ...process.env, WKP_MARGINS: '36,36,54,54', WKP_READY: ready },
      timeout: 240000,
      maxBuffer: 1e7,
    });
  } catch (error) {
    fail('pdf', `${caseKey} could not be printed at ${c.route}/print: ${String(error.message).split('\n')[0]}`);
    return null;
  }
  const seedError = reports.slice(before).find((x) => x.error);
  if (seedError) {
    fail('pdf', `${caseKey} seed page: ${seedError.error} (route ${c.route})`);
    return null;
  }
  if (!existsSync(out)) {
    fail('pdf', `${caseKey} wrote no PDF at ${out}`);
    return null;
  }
  const pdfPages = path.join(REPO, '.planning', 'canvas-generators', 'pdf-pages.swift');
  const text = (await run('swift', [pdfPages, out, 'all'], { maxBuffer: 1e7 })).stdout;
  const ink = (await run('swift', [pdfPages, out, 'ink'], { maxBuffer: 1e7 })).stdout;
  const pages = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^--- page (\d+) : ([\s\S]*)$/);
    if (m) pages[Number(m[1]) - 1] = { text: norm(m[2]) };
  }
  for (const line of ink.split('\n')) {
    const m = line.match(/^--- ink page (\d+) : (.*)$/);
    if (!m) continue;
    const p = pages[Number(m[1]) - 1] ?? (pages[Number(m[1]) - 1] = { text: '' });
    const n = m[2].trim().split(/\s+/).map(Number);
    p.ink = n.length === 4 && n.every(Number.isFinite) ? { x0: n[0], y0: n[1], x1: n[2], y1: n[3] } : null;
  }
  return { out, pages };
}

const inkTop = (p) => (p?.ink ? 792 - p.ink.y1 : null);
const inkBottom = (p) => (p?.ink ? 792 - p.ink.y0 : null);
const holders = (pages, re) => pages.map((p, i) => (re.test(p.text) ? i + 1 : 0)).filter(Boolean);

async function modePdf(base) {
  const two = await printCase(base, 'two');
  if (two) {
    const { pages } = two;
    report('pdf', `case two: ${pages.length} pages; PDF at ${two.out} (device-unverified)`);
    const batch = holders(pages, /Batch log/);
    const tasting = holders(pages, /Tasting log/);
    const side1 = holders(pages, /Side 1 of 2/);
    const side2 = holders(pages, /Side 2 of 2/);
    const eq = (a, want) => a.length === 1 && a[0] === want;
    const show = (a) => (a.length ? a.join(',') : 'none');
    if (eq(batch, 1) && eq(side1, 1)) pass('pdf', 'case two: page 1 alone holds Batch log and Side 1 of 2');
    else fail('pdf', `case two: Batch log on page ${show(batch)}, Side 1 of 2 on page ${show(side1)} (want page 1 only)`);
    if (eq(tasting, 2) && eq(side2, 2)) pass('pdf', 'case two: page 2 alone holds Tasting log and Side 2 of 2');
    else fail('pdf', `case two: Tasting log on page ${show(tasting)}, Side 2 of 2 on page ${show(side2)} (want page 2 only)`);
    for (const n of [1, 2]) {
      const top = inkTop(pages[n - 1]);
      if (top !== null && top >= 100.8 && top <= 115.2) pass('pdf', `case two: page ${n} ink starts ${top.toFixed(1)} pt down (1.5 in is 108)`);
      else fail('pdf', `case two: page ${n} ink starts ${top === null ? 'nowhere (blank page)' : `${top.toFixed(1)} pt down`}, want 100.8 to 115.2`);
    }
    const sheet = pages[2];
    const sheetTop = inkTop(sheet);
    if (sheetTop !== null && sheetTop <= 54) pass('pdf', `case two: first page after the logs ink starts ${sheetTop.toFixed(1)} pt down (at most 54)`);
    else fail('pdf', `case two: first page after the logs ${sheet ? `ink starts ${sheetTop === null ? 'nowhere' : `${sheetTop.toFixed(1)} pt down`}` : 'does not exist'}, want at most 54`);
  }
  const worst = await printCase(base, 'worst');
  if (worst) {
    const { pages } = worst;
    const t = holders(pages, /Tasting log/);
    const s2 = holders(pages, /Side 2 of 2/);
    const s1 = holders(pages, /Side 1 of 2/);
    report('pdf', `worst: ${pages.length} pages; PDF at ${worst.out} (device-unverified)`);
    report('pdf', `worst: Side 1 of 2 on page ${s1.join(',') || 'none'}; Side 2 of 2 on page ${s2.join(',') || 'none'}`);
    const tp = t.length ? pages[t[0] - 1] : null;
    const bottom = inkBottom(tp);
    report('pdf', `worst: Tasting log on page ${t.join(',') || 'none'}; its ink bottom ${bottom === null ? 'unknown' : `${bottom.toFixed(1)} pt down of 792 (bottom margin line at 756)`}`);
    const bl = holders(pages, /Batch log/);
    const bp = bl.length ? pages[bl[0] - 1] : null;
    report('pdf', `worst: Batch log on page ${bl.join(',') || 'none'}; its ink bottom ${inkBottom(bp) === null ? 'unknown' : `${inkBottom(bp).toFixed(1)} pt down`}`);
  }
}

// ---------------------------------------------------------------------------
// Mode sim
// ---------------------------------------------------------------------------
async function simctl(...args) {
  return (await run('xcrun', ['simctl', ...args], { maxBuffer: 1e8, timeout: 180000 })).stdout;
}

async function listIphones() {
  const all = JSON.parse(await simctl('list', 'devices', 'available', '-j')).devices;
  const phones = [];
  for (const devices of Object.values(all)) for (const d of devices) if (/^iPhone/.test(d.name)) phones.push(d);
  const first = phones.filter((d) => d.name === 'iPhone 17e');
  return [...first, ...phones.filter((d) => d.name !== 'iPhone 17e')];
}

const SIM_WANT = {
  'Coffee flavour': { anchors: ['faint', 'strong'], names: ['1: faint', '2', '3', '4', '5: strong'] },
  Body: { anchors: ['thin', 'right', 'heavy'] },
};
const same = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);

async function oneView(udid, base, view, shotName) {
  const url = `${base}/p12-seed?case=two&view=${view}`;
  // A cold Safari can swallow the first openurl, so the address is sent again once.
  await simctl('openurl', udid, url);
  let r = await waitForReport(view, 45000);
  if (!r) {
    await simctl('openurl', udid, url);
    r = await waitForReport(view, 45000);
  }
  if (!r) {
    fail('sim', `${view}: no report from ${url} (the Simulator could not reach the address; rerun with SAFARI_PORT set)`);
    return null;
  }
  await sleep(1200);
  await simctl('io', udid, 'screenshot', path.join(EVIDENCE, shotName));
  return r;
}

async function modeSim(base) {
  const phones = await listIphones();
  if (phones.length === 0) {
    fail('sim', 'no iPhone simulator is available (xcrun simctl list devices available)');
    return;
  }
  const booted = [];
  const stop = async () => {
    for (const udid of booted.splice(0)) await simctl('shutdown', udid).catch(() => {});
  };
  process.on('SIGINT', async () => {
    await stop();
    process.exit(130);
  });
  try {
    let chosen = null;
    let readingReport = null;
    for (const d of phones) {
      let ours = false;
      if (d.state !== 'Booted') {
        try {
          await simctl('boot', d.udid);
          await simctl('bootstatus', d.udid, '-b');
          booted.push(d.udid);
          ours = true;
        } catch (error) {
          report('sim', `could not boot ${d.name}: ${String(error.message).split('\n')[0]}`);
          continue;
        }
      }
      reports.length = 0;
      // The reading goes first: the record pen autosaves a draft, and an app that loads with a
      // draft open shows the pen, not the reading.
      const r = await oneView(d.udid, base, 'reading', 'sim-reading.png');
      if (r && !r.error && r.innerWidth < 724) {
        chosen = d;
        readingReport = r;
        break;
      }
      if (!r) break;
      report('sim', `${d.name} reports width ${r?.innerWidth ?? 'none'}${r?.error ? ` (${r.error})` : ''}; trying the next iPhone`);
      if (ours) {
        await simctl('shutdown', d.udid).catch(() => {});
        booted.splice(booted.indexOf(d.udid), 1);
      }
    }
    if (!chosen) {
      if (!failed) fail('sim', 'no iPhone simulator reported a width below 724');
      return;
    }
    report('sim', `width ${readingReport.innerWidth} ${chosen.name}`);
    report('sim', `evidence under ${EVIDENCE}: sim-pen.png, sim-reading.png (device-unverified: mobile Safari in the Simulator, not the iPad)`);
    const penReport = await oneView(chosen.udid, base, 'pen', 'sim-pen.png');

    const checkPen = (r) => {
      if (r.error) return fail('sim', `pen: the page reported ${r.error}`);
      for (const [name, want] of Object.entries(SIM_WANT)) {
        const s = (r.scales ?? []).find((x) => x.name === name);
        if (!s) {
          fail('sim', `pen: no scale named ${name} (scales: ${(r.scales ?? []).map((x) => x.name).join(', ')})`);
          continue;
        }
        if (same(s.anchors, want.anchors)) pass('sim', `pen: ${name} anchors ${JSON.stringify(s.anchors)}`);
        else fail('sim', `pen: ${name} anchors ${JSON.stringify(s.anchors)}, want ${JSON.stringify(want.anchors)}`);
        if (want.names) {
          if (same(s.names, want.names)) pass('sim', `pen: ${name} stop names ${JSON.stringify(s.names)}`);
          else fail('sim', `pen: ${name} stop names ${JSON.stringify(s.names)}, want ${JSON.stringify(want.names)}`);
        }
      }
      if (r.sideways === false) pass('sim', `pen: no sideways scroll (scrollWidth ${r.scrollWidth}, innerWidth ${r.innerWidth})`);
      else fail('sim', `pen: sideways scroll (scrollWidth ${r.scrollWidth}, innerWidth ${r.innerWidth})`);
    };
    if (penReport) checkPen(penReport);
    if (readingReport) {
      if (readingReport.error) fail('sim', `reading: the page reported ${readingReport.error}`);
      else {
        const cells = readingReport.cells ?? [];
        for (const [label, value] of [['Coffee flavour', '2 of 5'], ['Body', 'heavy (4)']]) {
          const cell = cells.find((x) => x.label === label);
          if (cell?.value === value) pass('sim', `reading: ${label} reads ${value}`);
          else fail('sim', `reading: ${label} reads ${cell ? JSON.stringify(cell.value) : `no cell (cells: ${cells.map((x) => x.label).join(', ')})`}, want ${value}`);
        }
        if (readingReport.sideways === false) pass('sim', `reading: no sideways scroll (scrollWidth ${readingReport.scrollWidth}, innerWidth ${readingReport.innerWidth})`);
        else fail('sim', `reading: sideways scroll (scrollWidth ${readingReport.scrollWidth}, innerWidth ${readingReport.innerWidth})`);
      }
    }
  } finally {
    await stop();
  }
}

// ---------------------------------------------------------------------------
const { server, base } = await startServer();
try {
  if (mode === 'pdf') await modePdf(base);
  else await modeSim(base);
} catch (error) {
  fail(mode, `check stopped: ${String(error.stack || error.message).split('\n').slice(0, 3).join(' | ')}`);
} finally {
  server.close();
}
process.exit(failed ? 1 : 0);
