// 03.4-gaps-conformance-probe.js
//
// Plain browser JS (no ES module syntax) — pasted whole into one
// browser_evaluate call per width (1280, then 393), against the running
// app. Precedent: 03.3.1.1-conformance-probe.js (same file shape, same
// discipline — one reader for both the board and the app, so a difference
// is never the reader's own). This probe reads only the app; the board
// files (boards/project/AltResumeSideNav.dc.html, board 170, and
// boards/project/Phone390Tabs.dc.html, board 171) are read as markup by
// the record this probe accompanies, not rendered — the board is a static
// HTML file at a fixed 1280x940 / 390x844 canvas, not a served page, so
// there is nothing here to point a second probe call at.
//
// Sources: 03.4-GAPS-CONFORMANCE.md (this probe's companion record, which
// cites every board line by number); this phase's own VERIFICATION.md
// `gaps:` block (all six); 03.4-06-SUMMARY.md and 03.4-07-SUMMARY.md (the
// shipped rules and decisions the record's "App shows" column reports).
//
// Token values this record's cells are read against (app/src/styles/
// tokens.css lines 347-428, resolved here so a cell can be judged without a
// second lookup):
//   --app-notebook #fd5b57        --app-notebook-text #ee0803
//   --app-recipe-book #f18a36     --app-recipe-book-text #bc5b0d
//   --app-idea-log #fdc632        --app-idea-log-text #976f01
//   --app-pantry #76bd78
//   --app-ingredients #388b57     --app-ingredients-text #358452
//   --app-kitchen #505db5
//   --app-blue #2081ea            --app-blue-text #1576de
//   --app-background #ffffff (the App ground)      --app-surface-subtle #f3f4f2
//   --app-text #141414             --app-text-secondary #595959
//   --app-divider #d6dad7
//   --app-size-label 0.75rem (12px)      --app-size-meta 0.875rem (14px)
//   --app-size-recipe-name 1.5rem (24px)  --app-size-lead-name 1.75rem (28px)
//   --app-size-title 2.125rem (34px)      --app-size-brand 1.375rem (22px)
//   --app-size-rail-w 8px   --app-size-rail-h 56px   --app-radius-rail 4px
//   --app-col-standing 120px   --app-col-tally 132px
//   --app-radius-lead 10px   --app-radius-action 10px
//   --app-size-tab-h 56px   --app-size-nav-w 224px   --app-size-icon 20px
//   --gap-hair 2px  --gap-xs 6px  --gap-s 12px  --gap-m 20px  --gap-l 32px
//   --gap-xl 48px (--gap-page steps to --gap-m, 20px, below 600px, app.css)
//   --touch-min 44px   --rule-graduation 1px (the App's own hairline weight)
//   --size-hand 1.375rem (22px), --size-hand-min 1.25rem (20px, the hand's floor)
//   (the Sheet ground, --sheet-ground, plays no part in this record — every
//   element read here lives inside .shell/.home, the App world only)

// ---------------------------------------------------------------------------
// probe(sel) — read one element's box and the computed properties this
// record needs. Returns null if the selector matches nothing so a missing
// element is a visible null cell, never a thrown error that stops the rest
// of the width's reading.
// ---------------------------------------------------------------------------
function probe(sel) {
  const el = document.querySelector(sel);
  if (!el) return null;
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
    br: cs.borderRadius,
    tt: cs.textTransform,
    ls: cs.letterSpacing,
    fw: cs.fontWeight,
    fs: cs.fontSize,
    ff: cs.fontFamily,
    flexBasis: cs.flexBasis,
    flexDirection: cs.flexDirection,
    gridTemplateColumns: cs.gridTemplateColumns,
    gridTemplateAreas: cs.gridTemplateAreas,
    display: cs.display,
    gap: cs.gap,
    padding: cs.padding,
    text: el.textContent.trim(),
  };
}

// ---------------------------------------------------------------------------
// readWidth(selectors) — selectors is a { key: cssSelector } object; returns
// the same keys, each mapped to probe()'s result, so a whole width is read
// in one call: readWidth(SELECTORS_1280) or readWidth(SELECTORS_393).
// ---------------------------------------------------------------------------
function readWidth(selectors) {
  const out = {};
  for (const key of Object.keys(selectors)) {
    out[key] = probe(selectors[key]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// SELECTORS_1280 — board 170's own element order (AltResumeSideNav.dc.html):
// the header, the tools row, the rail and its six places (Home plus the
// five destinations), the lead block and its five children, and the first
// recipe row and its five children.
// ---------------------------------------------------------------------------
const SELECTORS_1280 = {
  header: '.shell__head',
  toolsRow: '.shell__tools',
  rail: '.shell__rail',
  railHome: '.shell__place--home',
  railNotebook: '.shell__place--notebook',
  railRecipeBook: '.shell__place--recipe-book',
  railIdeaLog: '.shell__place--idea-log',
  railIngredients: '.shell__place--ingredients',
  railKitchen: '.shell__place--kitchen',
  lead: '.home__lead',
  leadRod: '.home__lead .home__rail',
  leadIdentity: '.home__lead-identity',
  leadCaption: '.home__lead-caption',
  leadNextTime: '.home__lead-next-time',
  leadActions: '.home__lead .home__actions',
  row: '.home__row',
  rowRod: '.home__row .home__rail',
  rowName: '.home__row .home__name',
  rowStanding: '.home__row .home__standing',
  rowTally: '.home__row .home__meta',
  rowActions: '.home__row .home__actions',
};

// ---------------------------------------------------------------------------
// SELECTORS_393 — board 171's own element order (Phone390Tabs.dc.html): the
// header, the lead block and its visible children (no rod at this width),
// the first row and its children (rod and tally kept per the recorded
// decision, though board 171 draws neither), and the bottom nav with each
// of its five items.
// ---------------------------------------------------------------------------
const SELECTORS_393 = {
  header: '.shell__head',
  lead: '.home__lead',
  leadIdentity: '.home__lead-identity',
  leadCaption: '.home__lead-caption',
  leadNextTime: '.home__lead-next-time',
  leadActions: '.home__lead .home__actions',
  row: '.home__row',
  rowRod: '.home__row .home__rail',
  rowName: '.home__row .home__name',
  rowStanding: '.home__row .home__standing',
  rowTally: '.home__row .home__meta',
  rowActions: '.home__row .home__actions',
  tabs: '.shell__tabs',
  tabHome: '.shell__tabs .shell__place--home',
  tabNotebook: '.shell__tabs .shell__place--notebook',
  tabRecipeBook: '.shell__tabs .shell__place--recipe-book',
  tabIdeaLog: '.shell__tabs .shell__place--idea-log',
  tabMore: '.shell__tabs .shell__more',
};

// ---------------------------------------------------------------------------
// row(...) — one markdown table row for 03.4-GAPS-CONFORMANCE.md's
// conformance table (`| # | Width | Element | Board says | App shows |
// Verdict |`). Kept here so a UAT pass filling in real numbers reads and
// writes the same row shape this record's skeleton already uses.
// ---------------------------------------------------------------------------
function row(n, width, element, boardSays, appShows, verdict) {
  return `| ${n} | ${width} | ${element} | ${boardSays} | ${appShows} | ${verdict} |`;
}
