// 03.3.1.1-conformance-probe.js
//
// Plain browser JS (no ES module syntax) — the orchestrator pastes this whole
// file into a browser_evaluate call once per tab, then calls the functions it
// defines. The same function reads both tabs, so a difference is the sketch's
// versus the app's, never the reader's (D-18, key link "the probe helper →
// both tabs").
//
// Sources: 03.3.1.1-RESEARCH.md § "Code Examples" → "Conformance probe" and
// "Setting the sketch's state"; § "Common Pitfalls" 9 (frame equalisation);
// § "D-03 Triage" and its "Re-citation" subsections (SELECTORS map).
// Colours per .planning/sketches/themes/default.css: --pen-blue #1f3d7a ->
// rgb(31, 61, 122); --ground #f7f7f4 -> rgb(247, 247, 244); --ink #141414 ->
// rgb(20, 20, 20); --bookcloth #33513b -> rgb(51, 81, 59).

// ---------------------------------------------------------------------------
// probe(sel) — read one element's box, computed style and mark, in either tab.
// ---------------------------------------------------------------------------
function probe(sel) {
  const el = document.querySelector(sel);
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    sel,
    top: r.top,
    left: r.left,
    w: r.width,
    h: r.height,
    bg: cs.backgroundColor,
    color: cs.color,
    bw: cs.borderTopWidth,
    bc: cs.borderTopColor,
    tt: cs.textTransform,
    ls: cs.letterSpacing,
    fw: cs.fontWeight,
    fs: cs.fontSize,
    lh: cs.lineHeight,
    td: cs.textDecorationLine,
    ow: cs.outlineWidth,
    os: cs.outlineStyle,
    mh: cs.minHeight,
    gap: cs.gap,
    z: cs.zIndex,
    fca: cs.forcedColorAdjust,
    mark: (() => {
      const b = getComputedStyle(el, '::before');
      return b.content === 'none'
        ? null
        : { w: b.width, h: b.height, bw: b.borderTopWidth, bg: b.backgroundColor };
    })(),
    lines: (() => {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      return rg.getClientRects().length;
    })(),
  };
}

// ---------------------------------------------------------------------------
// shareRow(a, b) — two probe() results "share a row" when |top_a - top_b| <= 1.
// ---------------------------------------------------------------------------
function shareRow(a, b) {
  return Math.abs(a.top - b.top) <= 1;
}

// ---------------------------------------------------------------------------
// follows(a, b) — DOM order: does element b follow element a?
// ---------------------------------------------------------------------------
function follows(a, b) {
  return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
}

// ---------------------------------------------------------------------------
// overflow() — the 393px acceptance criterion (D-15): scrollWidth vs innerWidth.
// ---------------------------------------------------------------------------
function overflow() {
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
}

// ---------------------------------------------------------------------------
// Setting the sketch's state (007 @ 109733d; functions at lines 341
// selectRadio, 375 clearGroup, 394 renderAxes, 428 toggleDefect, 436 setCols,
// 445 setVariant, 488 setTastingMode, 498 addTasting, 531 removeTasting,
// 568 undoTasting; init at 627-629).
//
// These are snippets the orchestrator runs in the SKETCH tab via
// browser_evaluate — not functions this file defines, since they call the
// sketch page's own globals (selectRadio, setVariant, etc., which exist only
// on that page). Kept here as documented strings/snippets so one file is the
// single source for every step of the pass.
// ---------------------------------------------------------------------------
const SKETCH_STATE_SNIPPETS = {
  // State 1 (blank, tasting opened): variant A, 3 columns, tasting shown via Add tasting.
  state1: "setVariant('A'); setCols(3); setTastingMode('hidden'); addTasting();",

  // State 2 (fully marked): click stop 2 in every axis, first option in every
  // segmented control, every defect, and fill every numeric/date field.
  state2: [
    "document.querySelectorAll('.stops5').forEach(g => g.querySelector('.stop5[data-i=\"2\"]').click());",
    "document.querySelectorAll('.seg').forEach(g => g.querySelector('.opt').click());",
    "document.querySelectorAll('.defect').forEach(b => b.click());",
    "document.querySelectorAll('input.num-field').forEach(i => { i.value = i.type === 'date' ? '2026-08-02' : '12'; i.dispatchEvent(new Event('input')); });",
  ].join('\n'),

  // State 2 hover/focus spot checks (interactive tools only — claude-in-chrome
  // for >= 500px, or the browser tool's own hover/keyboard primitives):
  //   hover .stop5[data-i="0"]   -> border 2px, z-index 2, width unchanged
  //   hover .seg .opt            -> border 2px, padding 4px 7px, box unchanged
  //   hover .defect              -> the ::before border 2px, button box unchanged
  //   Tab from the note textarea -> a 2px ring, offset 2px

  // State 2c (radio, not toggle): click the SAME picked stop/option again.
  state2c:
    "document.querySelector('.stops5 .stop5.on').click(); document.querySelector('.seg .opt.on').click(); // expect aria-checked unchanged, .clear still visible",

  // State 2d (Clear, keyboard vs mouse): measure each .head height before and
  // after the pick (24 desktop / 44 below 760, both times); keyboard-activate
  // Clear (Enter, event.detail === 0) -> focus on cell 1 with the ring;
  // mouse-click Clear -> focus NOT on cell 1.
  state2d:
    '// measure .axis .head / .category .head height before picking, pick, measure again (must be equal);\n// then: owner.querySelector(".clear").focus() + keyboard Enter vs a real mouse click on Clear',

  // State 2b (restore pending): remove a tasting with data, then restore it.
  state2b: [
    "document.querySelector('#tasting-toggle-btn').click(); // Remove tasting",
    "// expect: #record-status text, #undo-tasting (\"Restore tasting\") inside #undo-record-slot with focus, both .add-tasting hidden",
    "document.querySelector('#undo-tasting').click(); // Restore tasting",
    "// expect: section back, focus on #tasting-toggle-btn, tasting-status reads \"Tasting restored.\"",
  ].join('\n'),

  // State 3 (read view, sketch 003 @ 59f7948): served from
  // 003-front-matter-rows/index.html; init already calls setVariant('B');
  // setState('reading') (003:526). Never use setWidth(0) ("full") —
  // relayout() does parseInt('100%') === 100 (003:511), so the frame is
  // classed .narrow at every width regardless of the real viewport. Set a
  // real viewport, or one of the numeric presets (834 / 1024 / 1280 / 1440,
  // 003:316-319), and record .frame's measured width and whether it carries
  // the .narrow class beside every measurement.
  state3note:
    'Do NOT call setWidth(0). Set a real viewport width, or setWidth(834|1024|1280|1440), then read #frame.getBoundingClientRect().width and #frame.classList.contains("narrow") alongside every row.',

  // Ignore .recipe-placeholder (007 line 308) — sketch chrome between Next
  // time and the foot, with no app counterpart.
};

// ---------------------------------------------------------------------------
// Frame equalisation (Pitfall 9): below 784px the sketch's .frame padding
// makes its pen narrower than the app's .batch-margin--pen at the same
// viewport. Set the sketch frame's width by script so the sketch pen's
// measured width equals the app pen's measured width, then compare.
// ---------------------------------------------------------------------------
function equaliseSketchFrame(appPenWidthPx) {
  const frame = document.querySelector('.frame');
  const framePadding = parseFloat(getComputedStyle(frame).paddingLeft);
  frame.style.width = appPenWidthPx + 2 * framePadding + 'px';
  return { framePadding, frameWidthSet: frame.style.width };
}

// ---------------------------------------------------------------------------
// SELECTORS — app <-> sketch selector pairs for every contract element in
// the checklist. One row per element name; each maps to { app, sketch }.
// ---------------------------------------------------------------------------
const SELECTORS = {
  stop: { app: '.axis-mark__stop', sketch: '.axis .stop5' },
  option: { app: '.segmented__option', sketch: '.seg .opt' },
  defect: { app: '.chip-toggle', sketch: '.defect' },
  axisHead: { app: '.axis-mark__head', sketch: '.axis .head' },
  segHead: { app: '.segmented-field__head', sketch: '.category .head' },
  caption: { app: '.pen-caption', sketch: '.lbl' },
  regionName: { app: '.region-name', sketch: '.region-name' },
  tastingHead: { app: '.tasting-head', sketch: '.tasting .head' },
  ceremony: { app: '.save-ceremony', sketch: '.saves' },
  recordStatus: { app: '.save-ceremony__status', sketch: '#record-status' },
  formStatus: { app: '.form-status', sketch: '#form-status' },
  dateField: { app: '.field-row__label--date .ink-field', sketch: '.f-date .num-field' },
  figureField: { app: '.field-unit .ink-field', sketch: '.field-unit .num-field' },
  unit: { app: '.field-unit__unit', sketch: '.field-unit .u' },
  cue: { app: '.axes-cue', sketch: '.axes-cue' },
  defectsHead: { app: '.defects-head', sketch: '.defects-head' },
  // Page shell (003) pairs:
  page: { app: '.recipe-page', sketch: '.page' },
  rowVersion: { app: '.recipe-band__row-version', sketch: '.row-version' },
  batchHead: { app: '.batch-row__head', sketch: '.row-batch .head' },
  correct: { app: '.batch-row__correct', sketch: '.correct' },
  cellValue: { app: '.batch-row__cell-value', sketch: '.cell .v' },
  textControl: { app: '.text-control', sketch: '.text-control' },
};

// ---------------------------------------------------------------------------
// row(...) — one markdown table row for the CONFORMANCE.md "Measurements"
// table. Delta is computed for numeric sketch/app values; left as "—" for
// non-numeric (colour strings, keyword values) comparisons.
// ---------------------------------------------------------------------------
function row(n, width, state, element, section, prop, sketchValue, appValue, verdict, item) {
  const sketchNum = parseFloat(sketchValue);
  const appNum = parseFloat(appValue);
  const delta =
    !Number.isNaN(sketchNum) && !Number.isNaN(appNum)
      ? Math.abs(sketchNum - appNum).toFixed(2)
      : '—';
  return `| ${n} | ${width} | ${state} | ${element} | ${section} | ${prop} | ${sketchValue} | ${appValue} | ${delta} | ${verdict} | ${item || ''} |`;
}
