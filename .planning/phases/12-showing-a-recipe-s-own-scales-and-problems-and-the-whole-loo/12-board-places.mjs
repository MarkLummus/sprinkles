// 12-09 (the one-line page repointed by quick 261123-brl): the Notebook, Home and the one-line desk page of sketch 016 held against the build, panel by
// panel, on 12-07's engine (12-board-check.mjs, used as it stands). Conformance is board against build
// in Playwright WebKit with a coarse pointer at 1 px, never prose or a test count (D-14; sketch 013's
// rule). CONTRACT sections 3 and 4 are what the panels hold:
//   - Notebook at 393: no New recipe beside the title (the head holds the title alone); the count and
//     the list as built;
//   - Notebook with a kept new-recipe draft: the draft's row (rail, name as text, "draft") first, above
//     the count, with no Resume;
//   - Home at 393: a tasted recipe's row has no actions span at all; rows whose action is Record
//     tasting or Record batch are as built; the lead's own check was narrowed on 2026-11-23 (Keep
//     developing is left out of Home's lead below 724; see HOME_LEAD_OLD_BOARD);
//   - Home at 393 with two Next version drafts kept (quick 261123-ghj, Mark's answer to
//     decide-p12-home-row-sentence): held against the decided panel hd-nokeep of home-held-draft-393.html.
//     The lead names the newest draft in plain text with no actions; a row whose record act is left out
//     holds the same sentence in its place; the other rows are as built;
//   - the one-line page (CONTRACT section 12, the decided words): the built placeholder place inside the
//     shell, titled "New recipe" or "Edit", reading "Done in a wider window.", or the kept work's own
//     sentence ("Draft: Coffee. Finish it in a wider window." and "Edit kept. Finish it in a wider
//     window."); the Edit page also holds one link line, "Coffee · Version 1", between the title and the
//     note; no button or field in the page, and no link on New recipe.
// Panels are from notebook-home-more-393.html (nb, nb-draft, home), home-held-draft-393.html (hd-nokeep) and, for the one-line page,
// desk-line-words.html (dl-new, dl-new-kept, dl-edit, dl-edit-kept at 393; dl-edit-723, dl-edit-kept-723
// at 723). The superseded board one-line-page.html (desk-new, desk-edit) drew the old words and an Edit
// page with no link line; it is no longer a target. The board's More panel is held by 12-15's 12-board-more.mjs, not here.
// Every panel names anchor `.shell__main`: the panels hold the whole shell, tab row included, and the
// engine measures from and scopes to an anchor on a full page, so the checks never read More's list or
// the tab row (review item 11). The words on the boards are Sid's or the seed's and are read from the
// panels by the engine, never retyped here.
//
// The Edit panels name a stored version: the page reads it to name the recipe it would edit, so each
// panel's steps make Coffee through the built editor at 1366 (12-board-band.mjs's makeCoffee), keep an
// edit on it where the board draws one, then load the version's page once at the panel's width (so its
// link counts as visited, the a:visited lesson) and then the Edit address.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-09" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-places.mjs --selftest
//
// Every result is Playwright WebKit on a Mac: device-unverified.

import { DESK, KEEP_MS, ROUTES, clickUntil, makeCoffee, visit } from './12-board-band.mjs';

const WIN = (pid, width = 393) => `.fp-win.g2w-${width}[data-pid="${pid}"]`;

// The parts every panel shares: the whole shell is in the panel, so everything is measured inside
// `.shell__main`; width 393, the board's own; no sideways overflow at 393 and at 723.
const base = (pid, route, width = 393) => ({
  id: `places-${pid}`,
  label: `places-${pid}`,
  width,
  panelSelector: WIN(pid, width),
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

const HOME_TITLE = { selector: '.home__title', checks: ['text', 'font', 'box'] };
const HOME_LEAD = { selector: '.home__lead', checks: ['count', 'box'] };

const HOME_ROWS = [
  { selector: '.home__row', checks: ['count', 'box'] },
  { selector: '.home__row .home__name', checks: ['count', 'text', 'font', 'box'] },
  { selector: '.home__row .home__standing', checks: ['count', 'text', 'box'] },
  { selector: '.home__row .home__actions', checks: ['count', 'text', 'box'] },
  { selector: '.home__row .home__action', checks: ['count', 'text', 'font'] },
  // A row's Keep developing is display: none at this width on both sides (home.css, Home's 760 cut),
  // so it has no box to compare: the boxes are the rows' filled actions.
  { selector: '.home__row .home__action:not(.home__action--secondary)', checks: ['count', 'box'] },
];

// Home's panel on notebook-home-more-393.html draws the seed's lead with Record tasting beside Keep
// developing (CONTRACT section 3, README decision 4, approved 2026-11-21). Mark's answer to
// decide-p12-home-row-sentence (2026-11-23) leaves Keep developing out of Home's lead below 724, so the
// lead's words and the filled action's width are no longer that board's. What is still that board's:
// the lead's actions span (its place and size) and the filled action's word, so the span keeps count
// and box and the words are read from the filled action alone. RecipeList.test.jsx pins the absence.
const HOME_LEAD_OLD_BOARD = [
  HOME_TITLE,
  HOME_LEAD,
  { selector: '.home__lead .home__actions', checks: ['count', 'box'] },
  { selector: '.home__lead .home__action:not(.home__action--secondary)', checks: ['count', 'text'] },
  ...HOME_ROWS,
];

// Home below 724 with two Next version drafts kept, against the decided panel hd-nokeep of
// home-held-draft-393.html (Mark's answer to decide-p12-home-row-sentence, 2026-11-23). The board's
// capture typed Underbelly's draft first and Mexican Chocolate's second, so Mexican Chocolate's is the
// newest and leads; the steps do the same on the real clock. Each draft is made at 1366 on the seed's own
// route (12-board-band.mjs's ROUTES), kept for KEEP_MS, then Home is loaded at the width the panel arrived at.
const heldDraftSteps = async (page) => {
  const origin = new URL(page.url()).origin;
  const arrived = page.viewportSize();
  await page.setViewportSize(DESK);
  for (const [route, words] of [
    [ROUTES.none, 'less cream'],
    [ROUTES.awaiting, 'more cinnamon'],
  ]) {
    await visit(page, origin, route, '.notebook-version');
    await clickUntil(page, () => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), 'form[aria-label="Next version"]');
    await page.fill('textarea[aria-label="Version name"]', words);
    await page.waitForTimeout(KEEP_MS);
  }
  await page.setViewportSize(arrived);
  await visit(page, origin, '/', '.home__list');
  await page.waitForTimeout(600);
};

// Rows 1 and 4 (Mexican Chocolate and Underbelly Light Base) hold the drafts; rows 2, 3 and 8 are the tasted ones.
const HELD_DRAFT_ABSENT = [
  '.home__lead .home__actions',
  '.home__lead-draft a',
  ...[1, 2, 3, 4, 8].map((n) => `.home__row:nth-child(${n}) .home__actions`),
];

const DESK_PAGE = [
  { selector: '.list-page.place', checks: ['count', 'box'] },
  { selector: 'h1.place__title', checks: ['count', 'text', 'font', 'box'] },
  { selector: 'p.place__note', checks: ['count', 'text', 'font', 'box'] },
];
// Edit also holds the one link line between the title and the note: the line and its one link, 44 high.
const DESK_EDIT_PAGE = [
  ...DESK_PAGE,
  { selector: 'p.place__for', checks: ['count', 'box'] },
  { selector: 'p.place__for a', checks: ['count', 'text', 'font', 'box', 'color'] },
];
// New recipe holds no link and no control; Edit holds no control (its one link is the link line's own).
const DESK_NEW_ABSENT = ['p.place__for', '.list-page.place button', '.list-page.place a', '.list-page.place textarea'];
const DESK_EDIT_ABSENT = ['.list-page.place button', '.list-page.place textarea'];

// The Edit panels' own steps: Coffee made at 1366, an edit kept on it where the board draws one, then the
// version's page and the Edit address loaded at the width the panel arrived at (the version's page once, so
// the link line's link counts as visited). The note shows only once the page's read has settled.
const deskEditSteps = (kept) => async (page) => {
  const origin = new URL(page.url()).origin;
  const arrived = page.viewportSize();
  await page.setViewportSize(DESK);
  const address = await makeCoffee(page, origin);
  if (kept) {
    await visit(page, origin, address, '.notebook-version');
    await clickUntil(page, () => page.locator('.notebook-version__acts button', { hasText: /^Edit$/ }), '.ingredient-table-region');
    await page.fill('textarea[aria-label="Recipe description"]', 'Strong, cold and a little bitter.');
    await page.waitForTimeout(KEEP_MS);
  }
  await page.setViewportSize(arrived);
  await visit(page, origin, address, '.notebook-version');
  await visit(page, origin, `${address}/edit`, 'p.place__note');
  await page.waitForTimeout(600);
};

const deskEditPanel = (pid, width, kept) => ({
  ...base(pid, '/', width),
  ready: '.shell',
  extraWidths: undefined,
  steps: deskEditSteps(kept),
  elements: DESK_EDIT_PAGE,
  absent: DESK_EDIT_ABSENT,
});

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
        elements: HOME_LEAD_OLD_BOARD,
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
    board: '.planning/sketches/016-entry-points-pen-preview-row-controls/home-held-draft-393.html',
    panels: [
      {
        ...base('hd-nokeep', '/'),
        ready: '.home__list',
        steps: heldDraftSteps,
        elements: [
          HOME_TITLE,
          HOME_LEAD,
          { selector: 'p.home__lead-draft', checks: ['count', 'text', 'font', 'box'] },
          ...HOME_ROWS,
          { selector: 'p.home__row-draft', checks: ['count', 'text', 'font', 'box'] },
        ],
        absent: HELD_DRAFT_ABSENT,
      },
    ],
  },
  {
    board: '.planning/sketches/016-entry-points-pen-preview-row-controls/desk-line-words.html',
    panels: [
      {
        ...base('dl-new', '/notebook/new'),
        ready: 'p.place__note',
        elements: DESK_PAGE,
        absent: DESK_NEW_ABSENT,
      },
      {
        ...base('dl-new-kept', '/notebook/new'),
        ready: 'p.place__note',
        // The board's kept creation is named Coffee: a create draft the page reads at load.
        draft: { name: 'Coffee', recipeId: 'coffee', versionId: 'coffee-v1' },
        elements: DESK_PAGE,
        absent: DESK_NEW_ABSENT,
      },
      deskEditPanel('dl-edit', 393, false),
      deskEditPanel('dl-edit-kept', 393, true),
      deskEditPanel('dl-edit-723', 723, false),
      deskEditPanel('dl-edit-kept-723', 723, true),
    ],
  },
];
