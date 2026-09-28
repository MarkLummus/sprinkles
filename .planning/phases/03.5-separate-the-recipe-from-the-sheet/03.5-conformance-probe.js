// 03.5-conformance-probe.js
//
// Plain browser JS (no ES module syntax) — pasted whole into one
// evaluate call per page (a sketch 011 board, the count boards, or the
// built app) and width (1920, 1600-pen, 1600-long-history, 1366, 1024,
// 984, 983, 723, 393; plan 14's own ladder run, extending the widths
// 03.5-08's original run measured). After pasting, call
// `JSON.stringify(readPage())` to get the width's whole reading in one
// object. The same readPage() runs on both kinds of page — the
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
  // Board: since decision 18 (03.5-15+) the "Version" caption span sits
  // INSIDE the fold-version button's own baseline-gap wrapper
  // (`<button aria-controls="fold-version"><span><span>Version</span>
  // <span>Show details</span></span></button>`), not as a bare sibling of
  // the identity/dl pair the way 03.5-08's original boards drew it — so
  // `caption.parentElement` (that inner span) no longer reaches the
  // column; the column is the fold-version BUTTON's own parent instead.
  // Falls back to the pre-decision-18 shape (caption.parentElement) for a
  // board that predates the fold.
  var foldVersionBtn = document.querySelector('button[aria-controls="fold-version"]');
  var caption = firstByText('span', 'Version');
  var column = foldVersionBtn ? foldVersionBtn.parentElement : caption ? caption.parentElement : null;
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
// markHitFor(markEl) — the element document.elementFromPoint finds at a
// mark's own centre (03.5-12's own rail paint-order fix; this plan's own
// action text: "the class or tag of document.elementFromPoint at the
// first mark's centre"). Returns the class string when the hit element
// carries one (both pages' marks/track carry a class or inline styling
// only — no board mark has a class, so a board hit reports the tag),
// else the tag name, so a wrong paint order (the track winning again)
// shows up as a different string than the mark's own class/tag.
function markHitFor(markEl) {
  if (!markEl) return null;
  var r = markEl.getBoundingClientRect();
  var el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  if (!el) return null;
  return el.className && typeof el.className === 'string' && el.className.length ? el.className : el.tagName;
}

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
      markHit: markHitFor(firstMark),
    };
  }
  // Board: each rail node is a bare <a> (flex: 0 0 168px), inside a
  // div(display:flex;gap:24px) that is the nodes' own container. Since
  // decision 19 (03.5-15+), the whole rail lives inside `#fold-history`
  // (gen.py's own fold_row + hist-body pair) — scoping there is what
  // keeps this reader off every OTHER <a> in the recipe header, not just
  // the shell's chrome (03.5-08's own fix below): at a below-1366 width
  // with the fold closed, the board's own generator omits `#fold-history`
  // from the markup entirely (README: "a closed fold's content is left
  // out of the drawing"), so `nodes` correctly reads empty instead of
  // falling through to the version column's own "Draft: …" link — the
  // FIRST <a> in the header once the rail's own link is gone, and a false
  // positive this plan's own Task 1 run measured before this fix.
  //
  // Bug fix (03.5-08 Task 2 conformance run, superseded by the
  // `#fold-history` scope above but kept as the fallback for a board that
  // predates decision 19): a document-wide `header a` matches every <a>
  // under ANY <header>, including the shell's OWN top <header
  // class="shell__head"> (Search/Import/Export), which sits before the
  // recipe band's own bare <header> in document order.
  var recipeHeaderH1 = document.querySelector('header h1');
  var recipeHeader = recipeHeaderH1 ? recipeHeaderH1.closest('header') : null;
  var railBody = recipeHeader ? recipeHeader.querySelector('#fold-history') : document.querySelector('#fold-history');
  // A fold-history BUTTON with no matching #fold-history body means the
  // fold exists and is simply closed (this board's own convention for a
  // closed fold, README) — genuinely no rail markup to read, not a cue to
  // fall back to the whole header's <a> elements (which would pick up the
  // version column's own "Draft: …" link instead, a false positive this
  // plan's own Task 1 run measured before this guard). Only fall back to
  // the pre-decision-19 header-wide search when the fold mechanism itself
  // is entirely absent (a board that predates decision 19).
  var hasFoldHistoryButton = !!(recipeHeader
    ? recipeHeader.querySelector('button[aria-controls="fold-history"]')
    : document.querySelector('button[aria-controls="fold-history"]'));
  var nodes = railBody
    ? railBody.querySelectorAll('a')
    : hasFoldHistoryButton
      ? []
      : recipeHeader
        ? recipeHeader.querySelectorAll('a')
        : document.querySelectorAll('header a');
  var firstNodeB = nodes.length ? nodes[0] : null;
  var container = firstNodeB ? firstNodeB.parentElement : null;
  var firstMarkB = railBody
    ? railBody.querySelector('a span[aria-hidden="true"]')
    : hasFoldHistoryButton
      ? null
      : recipeHeader
        ? recipeHeader.querySelector('a span[aria-hidden="true"]')
        : document.querySelector('header a span[aria-hidden="true"]');
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
    markHit: markHitFor(firstMarkB),
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

  // The first ingredient row (not a step-head row) — both readFirstRowCells
  // and the plan-grams fix below key off it. Decision 15 gave the plan
  // amount its own <td class="ingredient-table__col-grams">, the FIRST td
  // in that row on both pages (03.5-11) — the old selector this plan's own
  // read_first flags (td.ingredient-table__col-name span:first-child)
  // assumed the pre-decision-15 shape, where the amount lived inside the
  // name cell; decision 15 moved it out, so that selector silently read
  // null on both pages after 03.5-11 landed.
  var rows = document.querySelectorAll('table.ingredient-table tbody tr');
  var firstRow = null;
  for (var r = 0; r < rows.length; r++) {
    if (!rows[r].classList.contains('ingredient-table__step-head')) {
      firstRow = rows[r];
      break;
    }
  }
  var firstRowCells = [];
  if (firstRow) {
    var fCells = firstRow.querySelectorAll('td');
    for (var fc = 0; fc < fCells.length; fc++) firstRowCells.push(box(fCells[fc]));
  }

  var totalRow = document.querySelector('table.ingredient-table tfoot tr');
  var totalRowCells = [];
  if (totalRow) {
    var tCells = totalRow.querySelectorAll('td');
    for (var tc = 0; tc < tCells.length; tc++) totalRowCells.push(box(tCells[tc]));
  }

  // listRow (Task 1's own action text): below 724 the table drops its
  // thead (app.css's list-form rules, 03.5-11) and each row becomes a CSS
  // grid — read the first row's own cells' boxes plus their computed grid
  // row, so a drift in the grid placement (not just the box geometry)
  // shows up as a difference.
  var theadEl = document.querySelector('table.ingredient-table thead');
  var theadHidden = theadEl ? getComputedStyle(theadEl).display === 'none' : false;
  var listRow = null;
  if (theadHidden && firstRow) {
    var lCells = firstRow.querySelectorAll('td');
    listRow = [];
    for (var lc = 0; lc < lCells.length; lc++) {
      var lBox = box(lCells[lc]);
      var lcs = getComputedStyle(lCells[lc]);
      lBox.gridRow = lcs.gridRowStart + ' / ' + lcs.gridRowEnd;
      listRow.push(lBox);
    }
  }

  // The as-made cell's own span (app: .sheet-hand; board: an inline-styled
  // span, no class) is, on both pages, the As-made column's own first
  // <span> — .ingredient-table__col-numeric is a shared class, so this
  // selector needs no branch either.
  return {
    headnoteH1: box(document.querySelector('.headnote h1')),
    tableColumnCount: ths.length,
    tableColumnWidths: widths,
    planGrams: box(document.querySelector('table.ingredient-table tbody td.ingredient-table__col-grams')),
    chip: box(document.querySelector('.target-chip')),
    asMadeCell: box(document.querySelector('table.ingredient-table tbody td.ingredient-table__col-numeric span')),
    stepChanged: box(document.querySelector('.method-step__changed')),
    firstRowCells: firstRowCells,
    totalRowCells: totalRowCells,
    listRow: listRow,
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
  // aria-label query. Cell label/value are the first churn cell's own two
  // spans (uppercase label, then the value span — 1600-batch.html lines
  // 920-923); the hand note is the first span carrying the Caveat font
  // family inline (the at-the-machine words, 1600-batch.html line 946).
  //
  // Bug fix (03.5-08 Task 2 conformance run): this file's own prior
  // comment claimed the head's three openers were the only <button>s in
  // the whole aside while no pen is open, but the Tasting fold's own
  // 'Show'/'Hide' control (below desktop, Task 1) is also a <button> in
  // this subtree, further down — an unscoped querySelectorAll('button')
  // picked it up too (measured: 4 texts at 1366/1024/393, the fourth
  // 'Show', against the app's own .batch-row__head-scoped 3). The head
  // row is the section's own first child div (1600-batch.html lines
  // 908-911); scoping there matches the app reader's own head-only scope.
  // 984-batch.html (this plan's own read_first) draws the log as ONE
  // <section aria-label="Batch"> below desktop — no outer <aside> at all,
  // since below 1366 the log is inline content in the stacked column, not
  // a sidebar. At 1366/1600/1920 (log beside the Sheet) the generator still
  // wraps that same <section> in an outer <aside aria-label="Batch">, the
  // 03.5-08 original two-element shape. Handle both: `column` is the
  // OUTER match (aside, when one exists); `section` is that match ITSELF
  // when it is already a <section>, else the nested one.
  var asides = document.querySelectorAll('[aria-label="Batch"]');
  var column = asides.length ? asides[0] : null;
  var section = column && column.tagName === 'SECTION' ? column : (column ? column.querySelector('section[aria-label="Batch"]') : null);
  var head = section ? section.firstElementChild : null;
  var buttons = head ? head.querySelectorAll('button') : [];
  var texts = [];
  for (var j = 0; j < buttons.length; j++) texts.push(buttons[j].textContent.trim());
  // The churn-cell grid's own column count varies by width (03.5-17
  // rewrote it from a fixed repeat(2) to repeat(5) at some widths) — match
  // any repeat(...) column count rather than hardcoding one.
  var firstCell = column ? column.querySelector('div[style*="grid-template-columns:repeat("] div') : null;
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
// readLadder() — plan 14 Task 1's own new reader: the width ladder's own
// nav/frame/band/log geometry (03.5-10's three derived cuts), every fold
// control at once (decisions 18/19), and the History head's own count
// text (or the one-line state). Every selector here is either shared
// (`button[aria-controls^="fold-"]`, drawn identically by both pages
// since decision 18/19) or branched exactly once via isAppPage(), the
// same discipline every other reader in this file already follows.
// ---------------------------------------------------------------------------
function readLadder() {
  var railEl = document.querySelector('.shell__rail');
  var tabsEl = document.querySelector('.shell__tabs');
  var toolsPlaceEl = document.querySelector('.shell__tools > .shell__place');

  var recipePage = document.querySelector('.recipe-page');
  var trackCount = recipePage
    ? getComputedStyle(recipePage).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length
    : null;

  // The frame (app: .notebook; board: the padded div directly under
  // main.shell__main — the board's own root has no class of its own).
  var frameEl = isAppPage() ? document.querySelector('.notebook') : document.querySelector('main.shell__main > div');
  var mainEl = document.querySelector('.shell__main');
  var frameBox = box(frameEl);
  var mainRect = mainEl ? mainEl.getBoundingClientRect() : null;
  var spaceLeft = frameBox && mainRect ? frameBox.left - mainRect.left : null;
  var spaceRight = frameBox && mainRect ? mainRect.right - (frameBox.left + frameBox.w) : null;

  // The band grid (app: .notebook-band__grid; board: main.shell__main
  // header's own first element child — the board's own div carries no
  // class, per readBand's own comment above).
  var bandGridEl = isAppPage()
    ? document.querySelector('.notebook-band__grid')
    : (function () {
        var h = document.querySelector('main.shell__main header');
        return h ? h.firstElementChild : null;
      })();
  var bandGrid = bandGridEl
    ? { display: getComputedStyle(bandGridEl).display, columnGap: getComputedStyle(bandGridEl).columnGap }
    : null;

  // The log (app: .notebook-log; board: the first [aria-label="Batch"],
  // the OUTER match per readLog's own comment above) and whether it sits
  // beside or below the Sheet.
  var logEl = isAppPage() ? document.querySelector('.notebook-log') : document.querySelector('[aria-label="Batch"]');
  var logBox = box(logEl);
  var sheetRect = recipePage ? recipePage.getBoundingClientRect() : null;
  var logPlacement = null;
  if (logBox && sheetRect) {
    logPlacement = logBox.left >= sheetRect.left + sheetRect.w - 1 ? 'beside' : 'below';
  }

  function paddingLeftOf(selector) {
    var el = document.querySelector(selector);
    return el ? parseFloat(getComputedStyle(el).paddingLeft) : null;
  }

  // Every fold control at once (`button[aria-controls^="fold-"]` — shared,
  // unbranched, since both pages draw the identical button structure from
  // decision 18/19 on): aria-controls, aria-expanded, its own text, box
  // height, and its width against its own parent's content width (the
  // "full-row" acceptance criterion every FoldRow/gen.py fold_row shares).
  var folds = [];
  var foldButtons = document.querySelectorAll('button[aria-controls^="fold-"]');
  for (var i = 0; i < foldButtons.length; i++) {
    var fb = foldButtons[i];
    var fBox = box(fb);
    var parentEl = fb.parentElement;
    var parentWidth = parentEl ? parentEl.getBoundingClientRect().width : null;
    folds.push({
      ariaControls: fb.getAttribute('aria-controls'),
      ariaExpanded: fb.getAttribute('aria-expanded'),
      text: fBox.text,
      height: fBox.h,
      widthRatio: parentWidth ? fBox.w / parentWidth : null,
    });
  }

  // The History head's own count text, or the one line when there is one
  // version (RecipeHistory.jsx's own `.notebook-history__only` branch).
  var historyText = null;
  if (isAppPage()) {
    var onlyEl = document.querySelector('.notebook-history__only');
    if (onlyEl) {
      historyText = onlyEl.textContent.trim();
    } else {
      var histBtn = document.querySelector('button[aria-controls="fold-history"]');
      var countEl = histBtn ? histBtn.querySelector('.fold-row__count') : null;
      historyText = countEl ? countEl.textContent.trim() : null;
    }
  } else {
    var histBtnB = document.querySelector('button[aria-controls="fold-history"]');
    if (histBtnB) {
      var directSpans = [];
      for (var j = 0; j < histBtnB.children.length; j++) {
        if (histBtnB.children[j].tagName === 'SPAN') directSpans.push(histBtnB.children[j]);
      }
      // The head's own two-span baseline wrapper is itself the FIRST
      // direct child span; a third, sibling span (the count) is the LAST
      // direct child when present.
      var countSpanB = directSpans.length > 1 ? directSpans[directSpans.length - 1] : null;
      historyText = countSpanB ? countSpanB.textContent.trim() : null;
    } else {
      var onlyElB = firstByText('p', 'Only this version so far');
      historyText = onlyElB ? onlyElB.textContent.trim() : null;
    }
  }

  return {
    railDisplay: railEl ? getComputedStyle(railEl).display : null,
    tabsDisplay: tabsEl ? getComputedStyle(tabsEl).display : null,
    toolsPlaceDisplay: toolsPlaceEl ? getComputedStyle(toolsPlaceEl).display : null,
    recipePageTrackCount: trackCount,
    frameBox: frameBox,
    spaceLeft: spaceLeft,
    spaceRight: spaceRight,
    bandGrid: bandGrid,
    logBox: logBox,
    logPlacement: logPlacement,
    recipePagePaddingLeft: paddingLeftOf('.recipe-page'),
    shellHeadPaddingLeft: paddingLeftOf('.shell__head'),
    folds: folds,
    historyText: historyText,
  };
}

// ---------------------------------------------------------------------------
// readTouch() — decision 16's "touch sizes follow the pointer only, no
// longer a width" (03.5-13): the page's own pointer mode and the log's
// 'Correct' control's rendered height and computed min-height, so a
// reading at 393 (coarse) can be compared against the same reading at a
// wider, fine-pointer width without re-deriving the touch floor from CSS
// source.
// ---------------------------------------------------------------------------
function readTouch() {
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var correctBtn = firstByText('button', 'Correct');
  var cs = correctBtn ? getComputedStyle(correctBtn) : null;
  return {
    coarse: coarse,
    correctHeight: correctBtn ? correctBtn.getBoundingClientRect().height : null,
    correctMinHeight: cs ? cs.minHeight : null,
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
    ladder: readLadder(),
    touch: readTouch(),
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
