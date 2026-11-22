// 12-09: the Notebook, Home and the one-line desk page of sketch 016 held against the build, panel by
// panel, on 12-07's engine (12-board-check.mjs, used as it stands). Conformance is board against build
// in Playwright WebKit with a coarse pointer at 1 px, never prose or a test count (D-14; sketch 013's
// rule). CONTRACT sections 3 and 4 are what the panels hold:
//   - Notebook at 393: no New recipe beside the title (the head holds the title alone); the count and
//     the list as built;
//   - Notebook with a kept new-recipe draft: the draft's row (rail, name as text, "draft") first, above
//     the count, with no Resume;
//   - Home at 393: a tasted recipe's row has no actions span at all; rows whose action is Record
//     tasting or Record batch are as built;
//   - the one-line page: the built placeholder place inside the shell, titled "New recipe" or "Edit",
//     reading "Done at the desk or on the iPad.", with no control in the page.
// Panels are from notebook-home-more-393.html (nb, nb-draft, home) and one-line-page.html (desk-new,
// desk-edit, its "The page" row). The board's More panel is held by 12-15's 12-board-more.mjs, not here.
// Every panel names anchor `.shell__main`: the panels hold the whole shell, tab row included, and the
// engine measures from and scopes to an anchor on a full page, so the checks never read More's list or
// the tab row (review item 11). The words on the boards are Sid's or the seed's and are read from the
// panels by the engine, never retyped here.
//
// The desk-edit panel's address is a fixed one with ids that name no stored version: below 724 the
// route wrapper mounts nothing under it (DeskOnly), so a saved version behind the address would change
// no pixel. 12-phone-probe.mjs walks the real saved version's address.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-09" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-places.mjs --selftest
//
// Every result is Playwright WebKit on a Mac: device-unverified.

const WIN = (pid) => `.fp-win.g2w-393[data-pid="${pid}"]`;

// The parts every panel shares: the whole shell is in the panel, so everything is measured inside
// `.shell__main`; width 393, the board's own; no sideways overflow at 393 and at 723.
const base = (pid, route) => ({
  id: `places-${pid}`,
  label: `places-${pid}`,
  width: 393,
  panelSelector: WIN(pid),
  panelIndex: 0,
  route,
  library: 'current',
  anchor: '.shell__main',
  overflow: true,
  extraWidths: [723],
});

const NOTEBOOK_HEAD = [
  { selector: '.nb__head > *', checks: ['count', 'text', 'box'] },
  { selector: '.nb__head h1.place__title', checks: ['text', 'font', 'box'] },
  { selector: '.nb__count', checks: ['text', 'font', 'box'] },
  { selector: '.nb__row', checks: ['count', 'box'] },
  { selector: '.nb__row .nb__name', checks: ['count', 'text', 'font', 'box'] },
  { selector: '.nb__row .nb__meta', checks: ['count', 'text', 'box'] },
];

const HOME_ROWS = [
  { selector: '.home__title', checks: ['text', 'font', 'box'] },
  { selector: '.home__lead', checks: ['count', 'box'] },
  { selector: '.home__lead .home__actions', checks: ['count', 'text', 'box'] },
  { selector: '.home__row', checks: ['count', 'box'] },
  { selector: '.home__row .home__name', checks: ['count', 'text', 'font', 'box'] },
  { selector: '.home__row .home__standing', checks: ['count', 'text', 'box'] },
  { selector: '.home__row .home__actions', checks: ['count', 'text', 'box'] },
  { selector: '.home__row .home__action', checks: ['count', 'text', 'font'] },
  // A row's Keep developing is display: none at this width on both sides (home.css, Home's 760 cut),
  // so it has no box to compare: the boxes are the rows' filled actions.
  { selector: '.home__row .home__action:not(.home__action--secondary)', checks: ['count', 'box'] },
];

const DESK_PAGE = [
  { selector: '.list-page.place', checks: ['count', 'box'] },
  { selector: 'h1.place__title', checks: ['count', 'text', 'font', 'box'] },
  { selector: 'p.place__note', checks: ['count', 'text', 'font', 'box'] },
];
const DESK_ABSENT = ['.list-page.place button', '.list-page.place a', '.list-page.place textarea'];

export default [
  {
    board: '.planning/sketches/016-entry-points-pen-preview-row-controls/notebook-home-more-393.html',
    panels: [
      {
        ...base('nb', '/notebook'),
        ready: '.nb__count',
        elements: NOTEBOOK_HEAD,
        // No New recipe beside the title, no kept draft, no row with a kept edit.
        absent: ['.nb__head button', '.nb__draft', '.nb__draft-act', '.nb__row--resume', '.nb__row-act'],
      },
      {
        ...base('nb-draft', '/notebook'),
        ready: '.nb__draft',
        // The board's draft row is named Coffee: a create draft the Notebook reads at load.
        draft: { name: 'Coffee', recipeId: 'coffee', versionId: 'coffee-v1' },
        elements: [
          ...NOTEBOOK_HEAD,
          { selector: '.nb__drafts > .nb__draft', checks: ['count', 'box'] },
          { selector: '.nb__draft > *', checks: ['count', 'text', 'box'] },
          { selector: '.nb__draft .nb__name', checks: ['text', 'font', 'box'] },
          { selector: '.nb__draft .nb__meta', checks: ['text', 'box'] },
          { selector: '.nb__draft .nb__rail', checks: ['count', 'box'] },
        ],
        absent: ['.nb__head button', '.nb__draft-act', '.nb__draft button', '.nb__row--resume', '.nb__row-act'],
      },
      {
        ...base('home', '/'),
        ready: '.home__list',
        elements: HOME_ROWS,
        // A tasted row has no actions span at all. The board's rows 2, 3 and 8 are the tasted ones
        // (Olive Oil Ice Cream, circulator; Pineapple; Strawberry), read from the panel.
        absent: [
          '.home__row:nth-child(2) .home__actions',
          '.home__row:nth-child(3) .home__actions',
          '.home__row:nth-child(8) .home__actions',
        ],
      },
    ],
  },
  {
    board: '.planning/sketches/016-entry-points-pen-preview-row-controls/one-line-page.html',
    panels: [
      {
        ...base('desk-new', '/notebook/new'),
        ready: '.list-page.place',
        elements: DESK_PAGE,
        absent: DESK_ABSENT,
      },
      {
        ...base('desk-edit', '/notebook/coffee/coffee-v1/edit'),
        ready: '.list-page.place',
        elements: DESK_PAGE,
        absent: DESK_ABSENT,
      },
    ],
  },
];
