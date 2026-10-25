// 10-09: the Scales and Problems regions held to sketch 013's scales-and-problems.html, side by side
// in Playwright WebKit with a coarse pointer, at 1366 (sA1 to sD1) and at 393 (sA2 to sD2).
//
//   S="${TMPDIR:-/tmp}/sprinkles-10"
//   npm --prefix app run build -- --outDir "$S/dist-09" --emptyOutDir
//   PROBE_DIST="$S/dist-09" node .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs \
//     .planning/phases/10-the-creation-editor-without-save/10-board-scales.mjs
//
// Every panel on this board is a log_only crop: no shell, no band, no Style region and an empty
// Sheet slot, where Scales is `.mk-region:first-child` and loses its top rule and 16 px of top
// padding. In the app Style comes first and, at 393, the Sheet and band sit above. So absolute
// boxes, broad selectors and the first-child styling all differ between the two; every panel
// therefore names the anchor `.mk-region[aria-label="Scales"] .batch-row__head`, below that
// padding, and the scope `.notebook-log`, so `.mk-add`, `.mk-cue` and the cards are matched in the
// log column only and never meet Add note or Add ingredient on the Sheet (Style draws none of
// them). Plan 10-01's sB1~eB1 self-test proves this anchor and scope equal on the boards.
//
// Measurement scope and evidence framing are separate. The board's log column holds Scales and
// Problems; the app's holds Style as well. Each panel therefore also names the frame from the
// Scales heading to the bottom of Problems: its evidence pair pictures that band on both sides,
// and the engine compares the two bands within 1 px in every run.
//
// Each panel names the same twelve selectors, every one either in `elements` with its checks or in
// `absent`, by what the panel's state draws (counted on the committed board, 2026-10-20):
//   sA nothing defined      no card, no field, no Required, no Kind cell, no checked radio, no stops
//   sB one scale, one problem   both cards complete: no Required line
//   sC two and two          complete cards, and no add control at the limit
//   sD just added           nothing picked and no ends typed: no checked radio, no stops line
//
// Each panel's draft holds the scales and problems the panel draws; the scale keys are minted here
// as 'scale-board-1' and 'scale-board-2'. The Sheet and the style stay blank, since nothing above
// the anchor is compared.
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in the build. A FAIL that traces to a fixture or engine
// difference is reported with both values and is never patched into app CSS; nothing is dropped
// from this spec and the tolerance stays 1 px.
const BOARD = '.planning/sketches/013-creation-editor/scales-and-problems.html';

const SCALES_HEAD = '.mk-region[aria-label="Scales"] .batch-row__head';
const PROBLEMS = '.mk-region[aria-label="Problems"]';
const READY = '.notebook.mk-page';

const SCALE_ONE = { key: 'scale-board-1', name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'declared' };
const SCALE_TWO = { key: 'scale-board-2', name: 'Cinnamon', low: 'faint', high: 'strong', kind: 'magnitude', group: 'declared' };
const SCALE_BLANK = { key: 'scale-board-1', name: '', low: '', high: '', kind: '', group: 'declared' };

const REGION_NAME = { selector: '.mk-region[aria-label="Scales"] .region-name', checks: ['box', 'text'] };
const CUE = { selector: '.mk-cue', checks: ['count', 'text'] };
const CORE = { selector: '.mk-core', checks: ['count', 'box', 'font', 'color', 'text'] };
const CARD = { selector: '.mk-card', checks: ['count', 'box'] };
const CARD_CAPTION = { selector: '.mk-caprow .notebook-caption', checks: ['count', 'text'] };
const CARD_REMOVE = { selector: '.mk-caprow .text-control', checks: ['count', 'box', 'text'] };
const CARD_FIELD = { selector: '.mk-card .ink-field', checks: ['count', 'box', 'value'] };
const REQUIRED = { selector: '.mk-card .field-requirement', checks: ['count', 'text'] };
const OPTION = { selector: '.segmented__option', checks: ['count', 'box', 'font'] };
const CHECKED = { selector: '.segmented__option input:checked', checks: ['count'] };
const STOPS = { selector: '.mk-stops', checks: ['count', 'font', 'color', 'text'] };
const ADD = { selector: '.mk-add', checks: ['count', 'box', 'text'] };

const ALL = [REGION_NAME, CUE, CORE, CARD, CARD_CAPTION, CARD_REMOVE, CARD_FIELD, REQUIRED, OPTION, CHECKED, STOPS, ADD];

// A panel: the twelve selectors split into those the state draws and those it does not.
function panel(id, width, draft, absentSet) {
  return {
    id,
    width,
    route: '/notebook/new',
    ready: READY,
    library: 'current',
    draft: { name: 'Vanilla', ...draft },
    anchor: SCALES_HEAD,
    scope: '.notebook-log',
    frame: { from: SCALES_HEAD, to: PROBLEMS },
    elements: ALL.filter((entry) => !absentSet.includes(entry)),
    absent: absentSet.map((entry) => entry.selector),
  };
}

const NOTHING = { scales: [], problems: [] };
const ONE_AND_ONE = { scales: [SCALE_ONE], problems: ['Bitter'] };
const TWO_AND_TWO = { scales: [SCALE_ONE, SCALE_TWO], problems: ['Bitter', 'Salty'] };
const JUST_ADDED = { scales: [SCALE_BLANK], problems: [''] };

const NO_CARDS = [CARD, CARD_CAPTION, CARD_REMOVE, CARD_FIELD, REQUIRED, OPTION, CHECKED, STOPS];
const COMPLETE = [REQUIRED];
const AT_THE_LIMIT = [REQUIRED, ADD];
const NOTHING_PICKED = [CHECKED, STOPS];

export default {
  board: BOARD,
  panels: [
    panel('sA1', 1366, NOTHING, NO_CARDS),
    panel('sB1', 1366, ONE_AND_ONE, COMPLETE),
    panel('sC1', 1366, TWO_AND_TWO, AT_THE_LIMIT),
    panel('sD1', 1366, JUST_ADDED, NOTHING_PICKED),
    panel('sA2', 393, NOTHING, NO_CARDS),
    panel('sB2', 393, ONE_AND_ONE, COMPLETE),
    panel('sC2', 393, TWO_AND_TWO, AT_THE_LIMIT),
    panel('sD2', 393, JUST_ADDED, NOTHING_PICKED),
  ],
};
