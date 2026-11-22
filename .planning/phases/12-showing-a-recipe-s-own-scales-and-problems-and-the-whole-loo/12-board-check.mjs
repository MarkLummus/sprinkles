// 12-07: the side-by-side board engine for Phase 12 (D-14). It is 11-board-check.mjs copied, not
// imported or patched (11-board-check.mjs is Phase 11's regression engine and is not touched), with
// everything the Phase 11 engine does kept: the 1 px tolerance, anchor and scope, absent, the
// empty-board-match FAIL of kind 'undeclared', overflow, extraWidths, --selftest with
// selftest-blind, --evidence, 127.0.0.1 only, WebKit with a coarse pointer. The Phase 11 list of
// additions (seed, draftKind, anchored full pages, the type check, selftest-blind, notice and
// anchored-page evidence) stands as 11-board-check.mjs recorded it. Sketch 015's boards do not use
// the Phase 11 class `.p4-win.<id>`, so the Phase 12 engine changes five things, and only these:
//   1. One panel reference. A panel may name `panelSelector` (a CSS selector) and `panelIndex`
//      (which of its matches, from 0). A panel naming neither keeps the Phase 11 lookup
//      `.p4-win.<id>` at index 0, so a Phase 11 spec still runs unchanged. One helper (panelRef)
//      turns a panel, or a panel's `against`, into { selector, index }, and that pair, never an id,
//      is what every stage receives: the in-page reader GATHER, the kind test and the not-found
//      check of processPanel, the against side, the evidence lift and the self-test's 1 px style.
//      A selector with fewer matches than its index is a FAIL of kind 'anchor' ("panel ... not
//      found"), never a fallback to the document.
//   2. The against side reads from its own Page. openBoard keeps a second cache for against sides,
//      so a stand-in held against a panel of its own board file reads its two sides from two Pages,
//      and the self-test's 1 px style (`*{font-size:1px !important}`) lands in the against side's
//      Page alone. With one shared Page, as in Phase 11, both sides shrank together and the run
//      could produce no FAIL.
//   3. A check kind `attr`: an entry { attr: '<name>' } in a selector's checks (next to the plain
//      names) compares that attribute's value on the matched elements, in order, on both sides
//      (used for aria-label). Its FAIL kind is 'value', as text's is, and it is a text-class check
//      for the selftest-blind rule: the 1 px run cannot move an attribute.
//   4. A panel option `appStyle`: CSS text injected into the app page after its route and steps and
//      before measuring (12-board-logs.mjs in plan 12-04 uses it to set the print pictures' scale
//      to 1). It needs a built app, so it is not exercised by this engine's own proofs; 12-04's log
//      panels exercise it first, and their pageHeight check fails when it does not take.
//   5. The board's own notes are left out of the board side. Before any board-side reading, every
//      element matching `.dl-tab, .dl-flag` inside the panel's root is removed from the board's Page.
//      They are the purple numbered tabs and flag tags of sketch 016's row-controls.html, notes
//      the CONTRACT says are not in the app, absolutely positioned (removing them moves no box) and
//      adding digits and words to a board element's text. No other Phase 12 board carries them, so
//      every other board is untouched. The against side of a stand-in is a board too and is left as
//      it is: the stand-ins this engine's proofs use draw none.
// The evidence lift for an anchored full page is rewritten to the one reference (it tags the
// resolved root and its ancestors by data attribute and hides every other match of the selector by
// data attribute), but it is not exercised in Phase 12: every sketch 015 panel is cropped (no
// `.shell` in any panel root), so no stand-in or spec here reaches it.
//
// It holds a built route to a sketch board panel, element by element, in Playwright WebKit with
// a coarse pointer, and prints PASS or FAIL for every comparison. Sketch 013's conformance rule
// is "side by side in a browser, never prose"; every later plan's board spec runs through this
// file.
//
// Usage (from the repo root), after building to a scratch directory (a stand-in run needs no
// build: point PROBE_DIST at an empty folder):
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-board" --emptyOutDir
//   PROBE_DIST="$S/dist-board" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs <spec.mjs> [<spec.mjs> ...] [--selftest] [--evidence <dir>]
//
// A spec module's default export is one spec or an array of specs. A spec is
//   { board: '<repo-relative path of a board file>', panels: [panel, ...] }
// and a panel is
//   { id, panelSelector?, panelIndex?, label?, width, route, library: 'current' | 'original', seed?,
//     draft?, draftKind?, ready?, visitLinks?, steps?, appStyle?, anchor?, scope?,
//     against?: { board, panelSelector?, panelIndex?, id? }, refuses?,
//     elements: [{ selector, checks }], absent?, frame?: { from, to }, overflow?, pageHeight?,
//     extraWidths? }
// checks is a list drawn from: count, box, size, font, type, color, border, outline, text, value, focus,
// and { attr: '<name>' } entries.
//
// Two kinds of panel. The engine reads the kind from the board: a full-page panel's root holds
// `.shell`; a cropped panel's (the sheet_only and log_only frames of canvas-generators/p10.py)
// does not.
//   full page  boxes are measured from the panel's page origin (the root's first child) on the
//              board and from the document in the app; pageHeight compares the page's height.
//              A full page that names an anchor is measured like a crop: boxes from the anchor's
//              top-left on both sides, elements inside the scope element (the scope selector, else
//              the anchor), pageHeight the anchor's own height. The anchor must match exactly once
//              in the board panel root and once in the app document.
//   cropped    the panel must name an anchor: a selector matching exactly one element inside the
//              board panel root and exactly one inside the app's `.shell`. Every box on both sides
//              is measured from the anchor's top-left, elements match only inside the scope
//              element (the panel's scope selector, else the anchor), and pageHeight is the
//              anchor's own height. A cropped panel with no valid anchor is a FAIL, never a
//              document-relative comparison.
//
// No comparison is empty and an absence is declared, never inferred:
//   - an `elements` selector matching nothing on the board is a FAIL ("matches nothing on the
//     board"), unless the panel lists it in `absent` instead;
//   - a selector in `absent` is an expected-zero count on both sides, inside the panel's scope,
//     and prints its own PASS line;
//   - an element on the board and none in the app is a FAIL per check ("missing in app").
//
// Measurement scope and evidence framing are separate. A cropped panel whose scope holds more in
// the app than on the board names a frame { from, to }: the band from the `from` element's top
// edge to the `to` element's bottom edge, across the scope's width, is compared on both sides
// within 1 px in every run, and the evidence pair pictures that band.
//
// seed (plan 11-01) is { recipes?, versions?, batches?, drafts? }: arrays of plain store records. The
// engine writes them in one readwrite transaction over the stores named, after the library and
// before any create draft and before the panel's route; the drafts store is keyed by versionId.
// A spec builds its records in node (it may import app/src/domain modules).
//
// extraWidths (plan 10-10) is a list of widths the boards do not draw: for each, the panel's app state
// is loaded at that width (coarse pointer, height 1024) and the only check is that the document does
// not scroll sideways (documentElement.scrollWidth not above innerWidth), one PASS or FAIL per width.
//
// Self-test stand-ins: a panel with `against: { board, id }` takes that board's panel root as its
// app side, so it needs no build and no route. A panel with `refuses` is a negative check: its
// FAIL lines are not printed, and "PASS selftest <label> refused: <kind>" prints when a FAIL of
// that kind occurred (count, box, missing, anchor, undeclared, present, frame, selftest-blind, value).
// --selftest re-runs every other panel with an injected style that sets every font size to 1 px and
// prints "PASS selftest <label>" only when that run produced at least one FAIL. Only a box, size or
// font check can move under that run, so a panel under --selftest whose elements hold none of the
// three records the kind selftest-blind ("FAIL <board> <label> selftest-blind: ..."); a panel that
// declares refuses: 'selftest-blind' passes when it is recorded.
//
// The build is read from PROBE_DIST (default app/dist) and never written: pass a scratch
// --outDir build so Mark's own `vite preview --host`, which serves app/dist, is never disturbed.
// The script starts no Vite server. playwright-core is loaded only through PLAYWRIGHT_CORE
// (default: the npx cache path below); when that file is missing it prints a FAIL line and exits
// 1 first. The app is served on an ephemeral 127.0.0.1 port through 08-walk-server.mjs; every
// request to another host is aborted (board pages: file: only). Everything typed into the app is
// English.
import { startServers } from '../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs';
import { library } from '../../../app/src/data/library.js';
import { blankCreateDraft, buildDraftRecord } from '../../../app/src/domain/draft.js';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
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

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
// path.resolve drops the doubled slash a TMPDIR with a trailing slash leaves in the build path.
const DIST = path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'));

const USAGE =
  'Usage: PROBE_DIST=<dist> node 12-board-check.mjs <spec.mjs> [<spec.mjs> ...] [--selftest] [--evidence <dir>]';
const argv = process.argv.slice(2);
const SELFTEST = argv.includes('--selftest');
const evidenceAt = argv.indexOf('--evidence');
const EVIDENCE_DIR = evidenceAt >= 0 ? argv[evidenceAt + 1] : undefined;
if (evidenceAt >= 0 && (!EVIDENCE_DIR || EVIDENCE_DIR.startsWith('--'))) {
  console.error(USAGE);
  process.exit(1);
}
const SPEC_FILES = argv.filter((arg, i) => !arg.startsWith('--') && !(evidenceAt >= 0 && i === evidenceAt + 1));
if (SPEC_FILES.length === 0) {
  console.error(USAGE);
  process.exit(1);
}

const TOLERANCE = 1;
const FIXED_ISO = '2026-10-20T12:00:00.000Z';
const ORIGINAL_RECORDS = Object.entries(library).map(([id, entry]) => ({ id, entry }));

let passes = 0;
let failures = 0;

const near = (a, b) => Math.abs(a - b) <= TOLERANCE;
const fmt = (v) => (typeof v === 'number' ? Number(v.toFixed(1)) : v);
const boxText = (b) => `${fmt(b.x)},${fmt(b.y)} ${fmt(b.w)}x${fmt(b.h)}`;

// The one panel reference (12-07): a panel, or a panel's `against`, names panelSelector and
// panelIndex, or neither and keeps the Phase 11 lookup at index 0. Every stage takes this pair.
const panelRef = (p) =>
  p.panelSelector ? { selector: p.panelSelector, index: p.panelIndex ?? 0 } : { selector: `.p4-win.${p.id}`, index: 0 };
const refText = (ref) => `${ref.selector} [${ref.index}]`;
const againstName = (against) => against.id ?? refText(panelRef(against));

// ---------------------------------------------------------------------------
// The one in-page reader, run on the board panel and on the app (or the stand-in's
// panel) alike, so both sides are measured by the same code.
// ---------------------------------------------------------------------------
const GATHER = (cfg) => {
  const out = { errors: [], frameError: null, items: {}, counts: {}, rects: {} };
  const panelEl = cfg.mode === 'panel' ? (document.querySelectorAll(cfg.panel.selector)[cfg.panel.index] ?? null) : null;
  if (cfg.mode === 'panel' && !panelEl) {
    out.errors.push(`panel ${cfg.panel.selector} [${cfg.panel.index}] not found`);
    return out;
  }
  const sx = window.scrollX;
  const sy = window.scrollY;
  const abs = (r) => ({ x: r.left + sx, y: r.top + sy, w: r.width, h: r.height });
  let origin;
  let queryRoot;
  let scopeEl = null;
  if (cfg.kind === 'full' && cfg.anchor) {
    // An anchored full page: measured like a crop, from the anchor, inside the scope element.
    const root = panelEl ?? document;
    const anchors = root.querySelectorAll(cfg.anchor);
    if (anchors.length !== 1) {
      out.errors.push(`anchor ${cfg.anchor} matches ${anchors.length}, not one`);
      return out;
    }
    scopeEl = anchors[0];
    if (cfg.scope) {
      const scopes = root.querySelectorAll(cfg.scope);
      if (scopes.length !== 1) {
        out.errors.push(`scope ${cfg.scope} matches ${scopes.length}, not one`);
        return out;
      }
      scopeEl = scopes[0];
    }
    const ar = anchors[0].getBoundingClientRect();
    origin = { left: ar.left, top: ar.top };
    out.pageHeight = ar.height;
    queryRoot = scopeEl;
    out.rects.scope = abs(scopeEl.getBoundingClientRect());
  } else if (cfg.kind === 'full') {
    queryRoot = panelEl ?? document;
    if (panelEl) {
      const r = panelEl.firstElementChild.getBoundingClientRect();
      origin = { left: r.left, top: r.top };
      out.pageHeight = r.height;
    } else {
      origin = { left: -sx, top: -sy };
      out.pageHeight = document.documentElement.scrollHeight;
    }
  } else {
    const root = panelEl ?? document.querySelector('.shell');
    if (!root) {
      out.errors.push('no .shell in the app');
      return out;
    }
    if (!cfg.anchor) {
      out.errors.push('a cropped panel names no anchor');
      return out;
    }
    const anchors = root.querySelectorAll(cfg.anchor);
    if (anchors.length !== 1) {
      out.errors.push(`anchor ${cfg.anchor} matches ${anchors.length}, not one`);
      return out;
    }
    scopeEl = anchors[0];
    if (cfg.scope) {
      const scopes = root.querySelectorAll(cfg.scope);
      if (scopes.length !== 1) {
        out.errors.push(`scope ${cfg.scope} matches ${scopes.length}, not one`);
        return out;
      }
      scopeEl = scopes[0];
    }
    const ar = anchors[0].getBoundingClientRect();
    origin = { left: ar.left, top: ar.top };
    out.pageHeight = ar.height;
    queryRoot = scopeEl;
    out.rects.scope = abs(scopeEl.getBoundingClientRect());
  }
  if (panelEl) out.rects.root = abs(panelEl.getBoundingClientRect());

  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const info = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const tag = el.tagName;
    let value = '';
    if (tag === 'SELECT') value = el.selectedOptions[0] ? norm(el.selectedOptions[0].textContent) : '';
    else if (tag === 'INPUT' || tag === 'TEXTAREA') value = el.value;
    return {
      box: { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height },
      font: [cs.fontFamily, cs.fontSize, cs.fontWeight].join(' | '),
      type: [
        cs.fontStyle,
        cs.textTransform,
        cs.letterSpacing,
        cs.lineHeight,
        cs.textDecorationLine,
        cs.textDecorationThickness,
        cs.textUnderlineOffset,
      ].join(' | '),
      color: [cs.color, cs.backgroundColor].join(' | '),
      border: [cs.borderTopWidth, cs.borderTopStyle, cs.borderTopColor].join(' | '),
      outline: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor].join(' | '),
      text: norm(el.textContent ?? ''),
      value,
      attrs: Object.fromEntries(cfg.attrs.map((name) => [name, el.getAttribute(name)])),
      focused: el === document.activeElement,
    };
  };
  for (const selector of cfg.elements) out.items[selector] = [...queryRoot.querySelectorAll(selector)].map(info);
  for (const selector of cfg.absent) out.counts[selector] = queryRoot.querySelectorAll(selector).length;

  if (cfg.frame && cfg.kind === 'crop') {
    const from = queryRoot.querySelectorAll(cfg.frame.from);
    const to = queryRoot.querySelectorAll(cfg.frame.to);
    if (from.length !== 1) out.frameError = `from ${cfg.frame.from} matches ${from.length}, not one`;
    else if (to.length !== 1) out.frameError = `to ${cfg.frame.to} matches ${to.length}, not one`;
    else {
      const fr = from[0].getBoundingClientRect();
      const tr = to[0].getBoundingClientRect();
      const sr = scopeEl.getBoundingClientRect();
      out.frame = { w: sr.width, h: tr.bottom - fr.top };
      out.rects.frame = abs({ left: sr.left, top: fr.top, width: sr.width, height: tr.bottom - fr.top });
    }
  }
  out.overflow = document.documentElement.scrollWidth > window.innerWidth;
  return out;
};

// ---------------------------------------------------------------------------
// Reporting. A negative panel (refuses) and an injected re-run are quiet: their
// comparisons run, their lines are not printed or counted, and only the kinds of
// FAIL that occurred are kept.
// ---------------------------------------------------------------------------
function makeReporter(boardFile, label, quiet) {
  const kinds = new Set();
  let failed = 0;
  return {
    kinds,
    get failed() {
      return failed;
    },
    check(ok, what, detail, kind) {
      if (!ok) {
        failed += 1;
        kinds.add(kind);
      }
      if (quiet) return;
      if (ok) passes += 1;
      else failures += 1;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${boardFile} ${label} ${what}${detail ? ` (${detail})` : ''}`);
    },
  };
}

const COMPARE = {
  box: (b, a) => (near(b.box.x, a.box.x) && near(b.box.y, a.box.y) && near(b.box.w, a.box.w) && near(b.box.h, a.box.h) ? null : `board ${boxText(b.box)}, app ${boxText(a.box)}`),
  size: (b, a) => (near(b.box.w, a.box.w) && near(b.box.h, a.box.h) ? null : `board ${fmt(b.box.w)}x${fmt(b.box.h)}, app ${fmt(a.box.w)}x${fmt(a.box.h)}`),
  font: (b, a) => (b.font === a.font ? null : `board ${b.font}, app ${a.font}`),
  type: (b, a) => (b.type === a.type ? null : `board ${b.type}, app ${a.type}`),
  color: (b, a) => (b.color === a.color ? null : `board ${b.color}, app ${a.color}`),
  border: (b, a) => (b.border === a.border ? null : `board ${b.border}, app ${a.border}`),
  outline: (b, a) => (b.outline === a.outline ? null : `board ${b.outline}, app ${a.outline}`),
  text: (b, a) => (b.text === a.text ? null : `board "${b.text}", app "${a.text}"`),
  value: (b, a) => (b.value === a.value ? null : `board "${b.value}", app "${a.value}"`),
  focus: (b, a) => (a.focused ? null : 'the app element is not document.activeElement'),
  attr: (b, a, name) => (b.attrs[name] === a.attrs[name] ? null : `board ${JSON.stringify(b.attrs[name])}, app ${JSON.stringify(a.attrs[name])}`),
};
const KIND_OF = { box: 'box', size: 'box' };

// Everything one panel compares, once both sides are read.
function compareData(rep, panel, kind, b, a) {
  const sideErrors = [...b.errors.map((e) => `board: ${e}`), ...a.errors.map((e) => `app: ${e}`)];
  if (sideErrors.length > 0) {
    rep.check(false, `anchor: ${sideErrors.join('; ')}`, '', 'anchor');
    return false;
  }
  const measured = new Set((panel.elements ?? []).map((e) => e.selector));

  if (panel.overflow && !panel.against) {
    rep.check(!a.overflow, 'overflow', a.overflow ? 'scrollWidth is above innerWidth' : '', 'box');
  }
  if (panel.pageHeight) {
    rep.check(near(b.pageHeight, a.pageHeight), 'pageHeight', `board ${fmt(b.pageHeight)}, app ${fmt(a.pageHeight)}`, 'box');
  }
  if (panel.frame) {
    if (kind === 'full') rep.check(false, 'frame: a full page pictures the page', '', 'frame');
    else if (b.frameError || a.frameError) {
      rep.check(false, `frame: ${[b.frameError && `board ${b.frameError}`, a.frameError && `app ${a.frameError}`].filter(Boolean).join('; ')}`, '', 'frame');
    } else {
      const ok = near(b.frame.w, a.frame.w) && near(b.frame.h, a.frame.h);
      rep.check(ok, 'frame', ok ? '' : `board ${fmt(b.frame.w)}x${fmt(b.frame.h)}, app ${fmt(a.frame.w)}x${fmt(a.frame.h)}`, 'frame');
    }
  }

  for (const selector of panel.absent ?? []) {
    if (measured.has(selector)) {
      rep.check(false, `${selector} both measured and declared absent`, '', 'undeclared');
      continue;
    }
    const onBoard = b.counts[selector];
    const inApp = a.counts[selector];
    if (onBoard !== 0) rep.check(false, `${selector} absent: the board draws ${onBoard}`, '', 'present');
    else if (inApp !== 0) rep.check(false, `${selector} absent: present in app (${inApp})`, '', 'present');
    else rep.check(true, `${selector} absent`, '', 'present');
  }

  for (const { selector, checks } of panel.elements ?? []) {
    const onBoard = b.items[selector] ?? [];
    const inApp = a.items[selector] ?? [];
    if (onBoard.length === 0) {
      rep.check(false, `${selector} matches nothing on the board (declare it in absent if this panel draws none)`, '', 'undeclared');
      continue;
    }
    if (checks.includes('count')) {
      rep.check(onBoard.length === inApp.length, `${selector} count`, `board ${onBoard.length}, app ${inApp.length}`, 'count');
    }
    onBoard.forEach((boardItem, i) => {
      for (const entry of checks) {
        if (entry === 'count') continue;
        // A check is a plain name, or { attr: '<name>' } (the attribute's value, kind 'value').
        const check = typeof entry === 'string' ? entry : 'attr';
        const what = typeof entry === 'string' ? entry : `attr ${entry.attr}`;
        const appItem = inApp[i];
        if (!appItem) {
          rep.check(false, `${selector}[${i}] ${what} missing in app`, '', 'missing');
          continue;
        }
        const why = COMPARE[check](boardItem, appItem, entry.attr);
        rep.check(why === null, `${selector}[${i}] ${what}`, why ?? '', KIND_OF[check] ?? 'value');
      }
    });
  }
  return true;
}

// ---------------------------------------------------------------------------
// Browser plumbing.
// ---------------------------------------------------------------------------
let browser;
let servers;
const boardPages = new Map();
const againstPages = new Map();
let boardContext;

// One Page per board file for the board side and a second cache for against sides (12-07), so a
// stand-in held against a panel of its own board file reads its two sides from two Pages and the
// 1 px style lands in the against side's Page alone.
async function openBoard(boardPath, side = 'board') {
  const file = path.resolve(REPO_ROOT, boardPath);
  const cache = side === 'against' ? againstPages : boardPages;
  if (!cache.has(file)) {
    if (!boardContext) {
      boardContext = await browser.newContext({ viewport: { width: 2400, height: 1400 }, hasTouch: true });
      // Board pages: file: only.
      await boardContext.route('**/*', (request) => (request.request().url().startsWith('file:') ? request.continue() : request.abort()));
    }
    const page = await boardContext.newPage();
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => document.fonts.ready);
    cache.set(file, page);
  }
  return cache.get(file);
}

async function newAppContext(width, height = width <= 760 ? 852 : 1024) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: true,
  });
  // Nothing leaves the machine: abort every request to another host.
  await context.route('**/*', (request) =>
    new URL(request.request().url()).hostname === '127.0.0.1' ? request.continue() : request.abort(),
  );
  return context;
}

// The built app opens and seeds its store first; only then are the library and any draft
// written, and only then does the page go to the panel's route, so /notebook/new finds its
// draft and the creation route does not redirect.
async function arrive(panel, rep) {
  const context = await newAppContext(panel.width, panel.height);
  const page = await context.newPage();
  await page.goto(`${servers.appUrl}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.shell');
  await page.evaluate(() => document.fonts.ready);

  if (panel.library === 'original') {
    await page.evaluate(async (records) => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('sprinkles');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction('library', 'readwrite');
          const store = tx.objectStore('library');
          store.clear();
          for (const record of records) store.put(record);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      } finally {
        db.close();
      }
    }, ORIGINAL_RECORDS);
  }
  if (panel.seed) {
    // One readwrite transaction over the stores the panel names (put each record; drafts are
    // keyed by versionId). The app has seeded its own store first; these are added to it.
    const named = ['recipes', 'versions', 'batches', 'drafts'].filter((store) => Array.isArray(panel.seed[store]) && panel.seed[store].length > 0);
    if (named.length > 0) {
      await page.evaluate(
        async ([stores, seed]) => {
          const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('sprinkles');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          try {
            await new Promise((resolve, reject) => {
              const tx = db.transaction(stores, 'readwrite');
              for (const store of stores) for (const record of seed[store]) tx.objectStore(store).put(record);
              tx.oncomplete = () => resolve();
              tx.onerror = () => reject(tx.error);
              tx.onabort = () => reject(tx.error);
            });
          } finally {
            db.close();
          }
        },
        [named, panel.seed],
      );
    }
  }
  if (panel.draft) {
    const fields = panel.draft;
    const versionId = fields.versionId ?? 'vanilla-v1';
    const payload = {
      ...blankCreateDraft({ recipeId: fields.recipeId ?? 'vanilla', versionId, name: fields.name ?? 'Vanilla' }),
      ...fields,
    };
    const record = buildDraftRecord({ versionId, kind: panel.draftKind ?? 'create', payload, now: FIXED_ISO });
    await page.evaluate(async (row) => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('sprinkles');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction('drafts', 'readwrite');
          tx.objectStore('drafts').put(row);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      } finally {
        db.close();
      }
    }, record);
  }

  const ready = panel.ready ?? '.shell';
  const goToRoute = async () => {
    await page.goto(`${servers.appUrl}${panel.route}`, { waitUntil: 'networkidle' });
    await page.waitForSelector(ready, { timeout: 10000 });
    await page.evaluate(() => document.fonts.ready);
  };
  try {
    await goToRoute();
    if (panel.visitLinks) {
      const hrefs = await page.evaluate(
        (selector) => [...new Set([...document.querySelectorAll(selector)].map((a) => a.getAttribute('href')))].filter(Boolean),
        panel.visitLinks,
      );
      for (const href of hrefs) await page.goto(`${servers.appUrl}${href}`, { waitUntil: 'networkidle' });
      await goToRoute();
    }
  } catch (err) {
    rep.check(false, `ready: ${ready} never appeared on ${panel.route}`, String(err.message).split('\n')[0], 'route');
    await context.close();
    return null;
  }
  const landed = new URL(page.url()).pathname;
  if (landed !== panel.route) {
    rep.check(false, `route: landed on ${landed}`, `wanted ${panel.route}`, 'route');
    await context.close();
    return null;
  }
  if (panel.steps) await panel.steps(page);
  // appStyle (12-07): CSS text injected after the route and steps, before measuring.
  if (panel.appStyle) {
    await page.addStyleTag({ content: panel.appStyle });
    await page.evaluate(() => document.fonts.ready);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return { page, context };
}

// The panel's app state at each width the boards do not draw: only sideways overflow is checked.
async function checkExtraWidths(panel, rep) {
  for (const width of panel.extraWidths ?? []) {
    const arrived = await arrive({ ...panel, width, height: 1024 }, rep);
    if (!arrived) continue;
    try {
      const { scroll, inner } = await arrived.page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
      }));
      rep.check(scroll <= inner, `overflow at ${width}`, scroll <= inner ? '' : `scrollWidth ${scroll} is above innerWidth ${inner}`, 'box');
    } finally {
      await arrived.context.close();
    }
  }
}

// ---------------------------------------------------------------------------
// One panel: arrive, read both sides, compare, take pictures, then (with
// --selftest) re-run with every font size at 1 px and expect a FAIL.
// ---------------------------------------------------------------------------
const evidenceRows = [];
const evidenceBases = new Set();

const intersect = (r, box) => {
  if (!r || !box) return r;
  const x = Math.max(r.x, box.x);
  const y = Math.max(r.y, box.y);
  return { x, y, w: Math.max(0, Math.min(r.x + r.w, box.x + box.w) - x), h: Math.max(0, Math.min(r.y + r.h, box.y + box.h) - y) };
};

async function pictures(spec, panel, label, kind, boardPage, other, b, a, rep, measureBoard) {
  const dir = path.resolve(EVIDENCE_DIR);
  await mkdir(dir, { recursive: true });
  const base = `${path.basename(spec.board, '.html')}-${label}`;
  // Two panels writing one file would leave the later picture standing for both, so a repeated
  // name is a FAIL (plan 11-13): give the panel a distinct `label` in its spec.
  if (evidenceBases.has(base)) {
    rep.check(false, `evidence: ${base} is written by two panels; give one a distinct label`, '', 'evidence');
    return;
  }
  evidenceBases.add(base);
  if (!panel.against) {
    // A notice (plan 10-11's kept-draft line) clears itself after 5 s and is absolutely placed, so
    // the picture waits for it to clear. A panel that measures the notice itself (an element
    // selector naming .page-status) is pictured while it still shows (plan 11-01).
    const picturesNotice = (panel.elements ?? []).some((e) => e.selector.includes('page-status'));
    if (!picturesNotice) {
      try {
        await other.page.waitForFunction(() => {
          const node = document.querySelector('.page-status');
          return !node || node.textContent.trim() === '';
        }, null, { timeout: 6000 });
      } catch {
        rep.check(false, 'evidence: a .page-status notice still shows', '', 'notice');
      }
    }
    if (!(panel.elements ?? []).some((e) => e.checks.includes('focus'))) {
      await other.page.evaluate(() => document.activeElement?.blur());
    }
  }
  let boardClip;
  let appClip;
  // An anchored full page is pictured by its scope on both sides, never cut to the window root
  // (its reading steps can begin below the board window's fold): the board window's clip is lifted
  // and its sibling windows hidden for the board picture only.
  const anchoredFull = kind === 'full' && Boolean(panel.anchor);
  if (anchoredFull) {
    boardClip = b.rects.scope;
    appClip = a.rects.scope;
  } else if (kind === 'full') {
    boardClip = b.rects.root;
    appClip = panel.against ? a.rects.root : { x: 0, y: 0, w: panel.width, h: b.rects.root.h };
  } else if (panel.frame && b.rects.frame && a.rects.frame) {
    boardClip = intersect(b.rects.frame, b.rects.root);
    appClip = panel.against ? intersect(a.rects.frame, a.rects.root) : a.rects.frame;
  } else {
    boardClip = intersect(b.rects.scope, b.rects.root);
    appClip = panel.against ? intersect(a.rects.scope, a.rects.root) : a.rects.scope;
  }
  const shoot = (page, clip, file) =>
    page.screenshot({ path: path.join(dir, file), fullPage: true, clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h } });
  if (anchoredFull) {
    // A board window sits in a canvas of fixed height that clips what runs past it, so every
    // ancestor's clip is lifted too, or a page whose reading steps begin below the canvas's end
    // cannot be pictured at all (save.html's vC1: plan 11-13).
    // 12-07: the resolved root and its ancestors are tagged, and every other match of the
    // reference's selector is hidden, by data attribute (no class is named here).
    await boardPage.evaluate(({ selector, index }) => {
      [...document.querySelectorAll(selector)].forEach((match, i) => {
        if (i !== index) {
          match.setAttribute('data-evidence-hide', '');
          return;
        }
        for (let node = match; node; node = node.parentElement) node.setAttribute('data-evidence-lift', '');
      });
    }, panelRef(panel));
    const lift = await boardPage.addStyleTag({
      content: '[data-evidence-lift]{overflow:visible !important}[data-evidence-hide]{display:none !important}',
    });
    try {
      // The lift moves the window (its siblings no longer take room above it), so the scope is
      // measured again inside the lifted layout: the clip taken before it can fall outside the
      // page, or silently picture another region of it (plan 11-13).
      const lifted = await measureBoard();
      if (lifted.errors.length > 0 || !lifted.rects.scope) throw new Error(`the lifted board window could not be measured: ${lifted.errors.join('; ')}`);
      boardClip = lifted.rects.scope;
      await shoot(boardPage, boardClip, `${base}-board.png`);
    } finally {
      await lift.evaluate((node) => node.remove());
      await boardPage.evaluate(() => {
        for (const node of document.querySelectorAll('[data-evidence-lift]')) node.removeAttribute('data-evidence-lift');
        for (const node of document.querySelectorAll('[data-evidence-hide]')) node.removeAttribute('data-evidence-hide');
      });
    }
  } else {
    await shoot(boardPage, boardClip, `${base}-board.png`);
  }
  await shoot(other.page, appClip, `${base}-app.png`);
  evidenceRows.push(
    `| ${path.basename(spec.board)} | ${label} | ${panel.width} | ${panel.against ? `${againstName(panel.against)} (stand-in)` : panel.route} | \`${base}-app.png\` | \`${base}-board.png\` | board ${boxText({ x: 0, y: 0, w: boardClip.w, h: boardClip.h })}; app ${boxText({ x: 0, y: 0, w: appClip.w, h: appClip.h })} |`,
  );
  console.log(`evidence ${base}`);
}

async function processPanel(spec, panel) {
  const boardFile = path.basename(spec.board);
  const label = panel.label ?? (panel.against ? `${panel.id ?? refText(panelRef(panel))}~${againstName(panel.against)}` : (panel.id ?? refText(panelRef(panel))));
  const rep = makeReporter(boardFile, label, Boolean(panel.refuses));
  const boardPage = await openBoard(spec.board);
  const ref = panelRef(panel);
  const kind = await boardPage.evaluate(({ selector, index }) => {
    const root = document.querySelectorAll(selector)[index];
    if (!root) return 'missing';
    return root.querySelector('.shell') ? 'full' : 'crop';
  }, ref);
  if (kind === 'missing') {
    rep.check(false, `panel ${refText(ref)} not found in the board`, '', 'anchor');
    return finish(rep, panel, label, false);
  }

  // Change 5 (12-12): the board's own purple notes are not in the app; take them out of this panel's
  // root before either side is read.
  await boardPage.evaluate(({ selector, index }) => {
    document.querySelectorAll(selector)[index]?.querySelectorAll('.dl-tab, .dl-flag').forEach((note) => note.remove());
  }, ref);

  let other;
  if (panel.against) {
    other = { page: await openBoard(panel.against.board, 'against'), mode: 'panel', panelRef: panelRef(panel.against) };
  } else {
    servers ??= await startServers({ appRoot: DIST });
    const arrived = await arrive(panel, rep);
    if (!arrived) return finish(rep, panel, label, false);
    other = { page: arrived.page, mode: 'app', panelRef: null, context: arrived.context };
  }

  try {
    const attrs = [...new Set((panel.elements ?? []).flatMap((e) => e.checks.filter((c) => typeof c !== 'string').map((c) => c.attr)))];
    const cfg = (mode, panelReference) => ({
      mode,
      panel: panelReference,
      attrs,
      kind,
      anchor: panel.anchor ?? null,
      scope: panel.scope ?? null,
      elements: (panel.elements ?? []).map((e) => e.selector),
      absent: panel.absent ?? [],
      frame: panel.frame ?? null,
    });
    const read = async () => [await boardPage.evaluate(GATHER, cfg('panel', ref)), await other.page.evaluate(GATHER, cfg(other.mode, other.panelRef))];
    const [b, a] = await read();
    const ok = compareData(rep, panel, kind, b, a);
    if (!panel.against) await checkExtraWidths(panel, rep);

    if (ok && EVIDENCE_DIR && !panel.refuses && !(panel.frame && (b.frameError || a.frameError || kind === 'full'))) {
      await pictures(spec, panel, label, kind, boardPage, other, b, a, rep, () => boardPage.evaluate(GATHER, cfg('panel', ref)));
    }

    if (SELFTEST && !(panel.elements ?? []).some((e) => e.checks.some((check) => check === 'box' || check === 'size' || check === 'font'))) {
      // Only a box, size or font check can move under the 1 px run below: a panel made of text,
      // value, count, absent and focus checks would pass its self-test vacuously.
      rep.check(false, 'selftest-blind: no box, size or font check for the 1 px run to move', '', 'selftest-blind');
    }

    if (SELFTEST && !panel.refuses) {
      // The same comparisons with every font size at 1 px: a pass is never an empty comparison.
      // The against side has its own Page (12-07), so the style goes in that Page alone.
      const css = '*{font-size:1px !important}';
      const style = await other.page.addStyleTag({ content: css });
      await other.page.waitForTimeout(100);
      const quiet = makeReporter(boardFile, label, true);
      const [b2, a2] = await read();
      compareData(quiet, panel, kind, b2, a2);
      await style.evaluate((node) => node.remove());
      const refused = quiet.failed > 0;
      if (refused) passes += 1;
      else failures += 1;
      console.log(`${refused ? 'PASS' : 'FAIL'} selftest ${label}${refused ? '' : ': the 1 px font run produced no FAIL'}`);
    }
  } finally {
    if (other.context) await other.context.close();
  }
  return finish(rep, panel, label, true);
}

function finish(rep, panel, label) {
  if (!panel.refuses) return;
  const refused = rep.kinds.has(panel.refuses);
  if (refused) passes += 1;
  else failures += 1;
  console.log(`${refused ? 'PASS' : 'FAIL'} selftest ${label} ${refused ? `refused: ${panel.refuses}` : 'not refused'}`);
}

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------
const specs = [];
for (const file of SPEC_FILES) {
  const loaded = (await import(pathToFileURL(path.resolve(file)).href)).default;
  specs.push(...(Array.isArray(loaded) ? loaded : [loaded]));
}

browser = await webkit.launch();
try {
  for (const spec of specs) {
    for (const panel of spec.panels) {
      try {
        await processPanel(spec, panel);
      } catch (err) {
        failures += 1;
        console.log(`FAIL ${path.basename(spec.board)} ${panel.label ?? panel.id} error: ${String(err.stack ?? err).split('\n').slice(0, 3).join(' | ')}`);
      }
    }
  }
  if (EVIDENCE_DIR) {
    const readme = [
      '# Board and app, side by side',
      '',
      'Written by `12-board-check.mjs --evidence <this directory>`. Each pair pictures equivalent regions: a full-page panel',
      'is the panel root beside the app page at the same width clipped to the board page height (an anchored full page, like a',
      'cropped panel, is its scope element on each side); a cropped panel is its scope',
      'element on each side, or, where it names a frame, the band from the frame\'s first element to its last across the scope.',
      '',
      '| Board | Panel | Width | Route | App | Board picture | Sizes |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...evidenceRows,
      '',
    ].join('\n');
    await mkdir(path.resolve(EVIDENCE_DIR), { recursive: true });
    await writeFile(path.join(path.resolve(EVIDENCE_DIR), 'README.md'), readme);
  }
} finally {
  await browser.close();
  if (servers) await servers.close();
}

console.log(`${passes} PASS, ${failures} FAIL`);
process.exit(failures > 0 || passes === 0 ? 1 : 0);
