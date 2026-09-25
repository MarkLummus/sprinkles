// 03.5-conformance-probe.js
//
// Plain browser JS (no ES module syntax) — pasted whole into one
// evaluate call per page (a sketch 011 board, or the built app) and
// width (1600, 1366, 1024, 393; decisions_recorded 4). After pasting,
// call `JSON.stringify(readPage())` to get the width's whole reading in
// one object. The same readPage() runs on both kinds of page — the
// precedent both 03.3.1.1-conformance-probe.js and
// 03.4-gaps-conformance-probe.js set, one reader for every tab, so a
// difference is the board's versus the app's, never the reader's own.
//
// Locating elements (03.5-08-PLAN.md Task 2's own instruction): app
// elements are read by class — RecipeBand.jsx/VersionRow.jsx/
// RecipeHistory.jsx/Headnote.jsx/IngredientTable.jsx/Method.jsx/
// BatchRow.jsx's own classes, all under notebook.css/app.css. Board
// elements are read by structure instead, because the boards carry the
// App-context band/version column/History rail/batch log as inline
// styles with no class of their own — only the Sheet-grammar portion
// (headnote, ingredient-table, method-step, formulation-note,
// target-chip, derived-advisories …) ships the app's real CSS classes
// onto the canvas verbatim (sketch 011 README "How the boards are
// made"), so THOSE selectors are shared, unbranched, between board and
// app. isAppPage() below picks the branch once per call; every reader
// function takes that branch itself, so the one readPage() entry point
// never needs to know which kind of page it is running on.
//
// Sources: .planning/sketches/011-recipe-route-c/README.md ("How to
// view"; "What is authority here"); every board this probe was written
// against — 1600-batch.html, 1600-no-batch.html, 1600-pen.html,
// 1600-long-history.html, 1366-batch.html, 1024-batch.html,
// 393-batch.html — read structurally, including each board's own
// second <style> block; app/src/ui/RecipeBand.jsx, VersionRow.jsx,
// RecipeHistory.jsx, Headnote.jsx, IngredientTable.jsx, Method.jsx,
// BatchRow.jsx (the app's own class names); app/src/ui/useBelowDesktop.js
// (the folds' own rung); 03.5-08-PLAN.md Task 2 (the element list this
// probe returns) and its decisions_recorded 1-4.

// ---------------------------------------------------------------------------
// box(el) — one element's geometry and the computed properties this
// record needs, on either page. Returns null if el is null/undefined,
// so a missing element is a visible null field in the JSON, never a
// thrown error that stops the rest of the page's reading.
// ---------------------------------------------------------------------------
function box(el) {
  if (!el) return null;
  var cs = getComputedStyle(el);
  var r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    w: r.width,
    h: r.height,
    bg: cs.backgroundColor,
    color: cs.color,
    bw: cs.borderTopWidth,
    bc: cs.borderTopColor,
    br: cs.borderRadius,
    fw: cs.fontWeight,
    fs: cs.fontSize,
    ff: cs.fontFamily,
    lh: cs.lineHeight,
    gap: cs.gap,
    gtc: cs.gridTemplateColumns,
    display: cs.display,
    text: el.textContent.trim(),
  };
}

// ---------------------------------------------------------------------------
// firstByText(tag, text) — the board's own locator for a control that
// carries no class: the first element of `tag` (searched document-wide,
// in DOM order) whose OWN direct text (not a descendant's) trims to
// exactly `text`. Used for both pages' bare buttons/spans that share no
// class name but do share a known, drawn word (Rename, Next version,
// Details, Show balance and things to check, Show, Hide, Batches (n),
// Correct, Record another, Version, History, Tasting, Batch).
// ---------------------------------------------------------------------------
function firstByText(tag, text) {
  var els = document.querySelectorAll(tag);
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var own = '';
    for (var j = 0; j < el.childNodes.length; j++) {
      var node = el.childNodes[j];
      if (node.nodeType === 3) own += node.textContent;
    }
    if (own.trim() === text) return el;
  }
  return null;
}

// ---------------------------------------------------------------------------
// isAppPage() — the app's own root wrapper (RecipePage.jsx: <div
// className="notebook">) carries a class no board ever draws (checked
// against every board this probe was written against: zero matches).
// ---------------------------------------------------------------------------
function isAppPage() {
  return !!document.querySelector('.notebook');
}

// ---------------------------------------------------------------------------
// The band (RecipeBand.jsx's own recipe column; on the board, the
// header's left grid column, drawn as bare divs/spans with no class).
// ---------------------------------------------------------------------------
function readBand() {
  if (isAppPage()) {
    return {
      railMarkBox: box(document.querySelector('.notebook-recipe__rail')),
      h1: box(document.querySelector('.notebook-recipe__name')),
      description: box(document.querySelector('.notebook-recipe__description')),
      rename: box(firstByText('button', 'Rename')),
    };
  }
  // Board: the recipe column's own rail mark is the FIRST
  // span[aria-hidden="true"] in document order inside the band's own
  // <header> (the shell__head above it carries no such span; the
  // History rail's own marks, later in the same <header>, sort after
  // it) — see 1600-batch.html lines ~120-134.
  var railMark = document.querySelector('header span[aria-hidden="true"]');
  var h1 = document.querySelector('header h1');
  // The description is the first <p> in the band with no button child
  // (the second <p> wraps Rename); h1 has no class either side, so this
  // stays scoped to the SAME <header> h1 sits in.
  var description = null;
  if (h1) {
    var host = h1.closest('header');
    var ps = host ? host.querySelectorAll('p') : [];
    for (var i = 0; i < ps.length; i++) {
      if (!ps[i].querySelector('button')) {
        description = ps[i];
        break;
      }
    }
  }
  return {
    railMarkBox: box(railMark),
    h1: box(h1),
    description: box(description),
    rename: box(firstByText('button', 'Rename')),
  };
}

// ---------------------------------------------------------------------------
// The version column (VersionRow.jsx's own reading section; on the
// board, the header's right grid column).
// ---------------------------------------------------------------------------
function readVersionColumn() {
  if (isAppPage()) {
    var section = document.querySelector('.notebook-version');
    return {
      caption: box(section ? section.querySelector('.notebook-caption') : null),
      identity: box(document.querySelector('.notebook-version__identity')),
      dl: box(document.querySelector('.notebook-version__details')),
      nextVersion: box(document.querySelector('.notebook-version__acts .notebook-action')),
    };
  }
  // Board: the "Version" caption span (uppercase, no class) locates the
  // column; its own parent div is the column's wrapper (1600-batch.html
  // lines 136-158 / 1366-batch.html lines 136-159, the div(gap:12px)
  // holding the caption, the identity+dl pair, and the acts row).
  var caption = firstByText('span', 'Version');
  var column = caption ? caption.parentElement : null;
  return {
    caption: box(caption),
    identity: box(column ? column.querySelector('p') : null),
    dl: box(column ? column.querySelector('dl') : null),
    nextVersion: box(column ? firstByText('button', 'Next version') : null),
  };
}

// ---------------------------------------------------------------------------
// The History rail (RecipeHistory.jsx's own dated rail; on the board,
// the <a> nodes drawn beneath the band's two columns, inside the SAME
// <header> the band lives in).
// ---------------------------------------------------------------------------
function readRail() {
  if (isAppPage()) {
    var nodesList = document.querySelector('.notebook-history__nodes');
    var firstNode = document.querySelector('.notebook-history__node');
    var firstMark = document.querySelector('.notebook-history__mark');
    var firstState = document.querySelector('.notebook-history__state');
    return {
      nodeCount: document.querySelectorAll('.notebook-history__node').length,
      nodeBox: box(firstNode),
      nodeGap: nodesList ? getComputedStyle(nodesList).gap : null,
      markBox: box(firstMark),
      stateText: firstState ? firstState.textContent.trim() : null,
    };
  }
  // Board: each rail node is a bare <a> (flex: 0 0 168px), inside a
  // div(display:flex;gap:24px) that is the nodes' own container
  // (1600-batch.html lines 165-184). Each node's own mark is the
  // span[aria-hidden="true"] nested inside it — scoping the selector to
  // `a span[aria-hidden]` keeps this away from the band's OWN rail mark
  // (a span child of a div, never of an <a>). The state line is the
  // node's own last direct-child span (date, mark-wrapper, name, state
  // — in that order, no class on any of the four).
  var nodes = document.querySelectorAll('header a');
  var firstNodeB = nodes.length ? nodes[0] : null;
  var container = firstNodeB ? firstNodeB.parentElement : null;
  var firstMarkB = document.querySelector('header a span[aria-hidden="true"]');
  var stateSpan = null;
  if (firstNodeB) {
    var directSpans = [];
    for (var i = 0; i < firstNodeB.children.length; i++) {
      if (firstNodeB.children[i].tagName === 'SPAN') directSpans.push(firstNodeB.children[i]);
    }
    stateSpan = directSpans.length ? directSpans[directSpans.length - 1] : null;
  }
  return {
    nodeCount: nodes.length,
    nodeBox: box(firstNodeB),
    nodeGap: container ? getComputedStyle(container).gap : null,
    markBox: box(firstMarkB),
    stateText: stateSpan ? stateSpan.textContent.trim() : null,
  };
}

// ---------------------------------------------------------------------------
// The Sheet (Headnote.jsx/IngredientTable.jsx/Method.jsx): every
// selector here is SHARED, unbranched, between board and app, because
// this is the Sheet-grammar portion the boards ship with the app's own
// CSS classes verbatim (sketch 011 README).
// ---------------------------------------------------------------------------
function readSheet() {
  var ths = document.querySelectorAll('table.ingredient-table thead th');
  var widths = [];
  for (var i = 0; i < ths.length; i++) widths.push(box(ths[i]).w);
  // The plan-grams span (app: .ingredient-table__plan-grams; board: the
  // same span with no class of its own) is, on BOTH pages, the first
  // child <span> of a row's own name cell — this selector needs no
  // branch. The as-made cell's own span (app: .sheet-hand; board: an
  // inline-styled span, no class) is, on both pages, the As-made
  // column's own first <span> — .ingredient-table__col-numeric is a
  // shared class, so this selector needs no branch either.
  return {
    headnoteH1: box(document.querySelector('.headnote h1')),
    tableColumnCount: ths.length,
    tableColumnWidths: widths,
    planGrams: box(document.querySelector('table.ingredient-table tbody td.ingredient-table__col-name span:first-child')),
    chip: box(document.querySelector('.target-chip')),
    asMadeCell: box(document.querySelector('table.ingredient-table tbody td.ingredient-table__col-numeric span')),
    stepChanged: box(document.querySelector('.method-step__changed')),
  };
}

// ---------------------------------------------------------------------------
// The batch log (BatchRow.jsx's own reading log; on the board, the
// <aside aria-label="Batch"> beside the Sheet, drawn as bare divs/spans
// with no class of their own).
// ---------------------------------------------------------------------------
function readLog() {
  if (isAppPage()) {
    var log = document.querySelector('.notebook-log');
    var headButtons = log ? log.querySelectorAll('.batch-row__head button') : [];
    var headTexts = [];
    for (var i = 0; i < headButtons.length; i++) headTexts.push(headButtons[i].textContent.trim());
    return {
      columnBox: box(log),
      headControls: headTexts,
      cellLabel: box(log ? log.querySelector('.batch-row__cell-label') : null),
      cellValue: box(log ? log.querySelector('.batch-row__cell-value') : null),
      handNote: box(log ? log.querySelector('.app-hand') : null),
    };
  }
  // Board: aria-label="Batch" is drawn on BOTH the <aside> (the column)
  // and the <section> immediately inside it (1600-batch.html lines
  // 906-907) — the column is the OUTER match, so index 0 of the
  // aria-label query. The head's three openers (Batches (n), Correct,
  // Record another) are the only <button>s in this subtree while no pen
  // is open. Cell label/value are the first churn cell's own two spans
  // (uppercase label, then the value span — 1600-batch.html lines
  // 920-923); the hand note is the first span carrying the Caveat font
  // family inline (the at-the-machine words, 1600-batch.html line 946).
  var asides = document.querySelectorAll('[aria-label="Batch"]');
  var column = asides.length ? asides[0] : null;
  var buttons = column ? column.querySelectorAll('button') : [];
  var texts = [];
  for (var j = 0; j < buttons.length; j++) texts.push(buttons[j].textContent.trim());
  var firstCell = column ? column.querySelector('div[style*="grid-template-columns:repeat(2"] div') : null;
  var cellSpans = firstCell ? firstCell.querySelectorAll('span') : [];
  return {
    columnBox: box(column),
    headControls: texts,
    cellLabel: box(cellSpans.length ? cellSpans[0] : null),
    cellValue: box(cellSpans.length > 1 ? cellSpans[1] : null),
    handNote: box(column ? column.querySelector('span[style*="Caveat"]') : null),
  };
}

// ---------------------------------------------------------------------------
// overflow() — the 393px acceptance criterion (and every other width's
// own check): the route must never carry horizontal overflow.
// ---------------------------------------------------------------------------
function readOverflow() {
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
}

// ---------------------------------------------------------------------------
// readPage() — the one entry point. Call `JSON.stringify(readPage())`
// after pasting this whole file into the page (board or app) at the
// width under test, and record the result against that width's row in
// 03.5-CONFORMANCE.md.
// ---------------------------------------------------------------------------
function readPage() {
  return {
    page: isAppPage() ? 'app' : 'board',
    innerWidth: window.innerWidth,
    overflow: readOverflow(),
    band: readBand(),
    versionColumn: readVersionColumn(),
    rail: readRail(),
    sheet: readSheet(),
    log: readLog(),
  };
}

// ---------------------------------------------------------------------------
// row(...) — one markdown table row for 03.5-CONFORMANCE.md's per-width
// table (`| Element | Board value (board line) | App value | Verdict |`),
// kept here so the pass that fills in real readings writes the same row
// shape this file's own skeleton already uses (03.4-gaps-conformance-
// probe.js precedent).
// ---------------------------------------------------------------------------
function row(element, boardValue, boardLine, appValue, verdict) {
  return '| ' + element + ' | ' + boardValue + ' (' + boardLine + ') | ' + appValue + ' | ' + verdict + ' |';
}
