import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { repository } from '../store/repository.js';
import { exportStore, importStore } from '../store/transfer.js';
import { useBelow724, useBelowRail } from './useBelowDesktop.js';
import { Button } from './Button.jsx';
import { useCatalog } from './CatalogContext.jsx';
import { draftMatchesCreate } from '../domain/draft.js';
import { NEW_RECIPE_PATH } from './notebookPaths.js';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { PageNotice, PageNoticeContext, usePageNotice } from './PageNotice.jsx';

// One source of truth for the App's five destinations (DESIGN.md "App
// marks", D-09, D-10, D-16): the rail, the bottom tab row, and router.jsx's
// placeholder routes all read this array, so a place can never exist in
// one of the three without existing in the other two.
export const PLACES = [
  { path: '/notebook', name: 'Notebook', slug: 'notebook' },
  { path: '/recipe-book', name: 'Recipe book', slug: 'recipe-book' },
  { path: '/idea-log', name: 'Idea log', slug: 'idea-log' },
  { path: '/ingredients', name: 'Ingredients', slug: 'ingredients' },
  { path: '/kitchen', name: 'Kitchen', slug: 'kitchen' },
];

// The page notice 'Close the open pen before importing.' (quick 261011-dz2,
// decide-import-refreshes-open-recipe-pens = refuse). The one home of the sentence.
// Wording approved by Mark (2026-10-11): decide-new-lines-import-block-and-too-long.
export const IMPORT_BLOCKED_STATUS = 'Close the open pen before importing.';

// The page notice for Import while a new recipe draft is kept (Phase 10 D-10,
// decide-import-refreshes-open-recipe-pens = refuse): an import replaces the
// library a kept creation's rows link to. The one home of the sentence. Claude's
// wording within the shape of IMPORT_BLOCKED_STATUS; it names the creation and
// points at Cancel, which Resume reaches.
export const CREATION_IMPORT_BLOCKED_STATUS = 'Cancel the new recipe draft before importing.';

// What the address and the route state alone say about a kept creation (D-10a):
// 'present' on the creation editor's address, and on Cancel's landing when
// another creation remains (createKept true); 'absent' when none remains
// (createKept false); 'unknown' when Cancel's own drafts read failed (createKept
// left out), never absent on `discarded` alone. null: the route says nothing.
function creationStateFromRoute(pathname, state) {
  if (pathname === NEW_RECIPE_PATH) return 'present';
  if (state?.discarded === true) {
    if (state.createKept === true) return 'present';
    if (state.createKept === false) return 'absent';
    return 'unknown';
  }
  return null;
}

// One drafts read for the Shell. Wrapped so a repository stub without
// listDrafts rejects instead of throwing.
function readDrafts() {
  return Promise.resolve().then(() => repository.listDrafts());
}

// The one line of the recovery page the Shell shows when the catalog could not be
// reloaded after an import had committed (D-03a): the file did land, so the
// Import panel's "Nothing was changed" would be false. Claude's wording, on
// plan 09-17's look row for Mark.
export const IMPORT_RELOAD_LINE = 'The file was imported. Reload the page to see it.';

// A routed page with a pen open registers its page-notice function here
// through guardImport(announce) and gets back a release function. The Shell
// consults the registration at the Import click. Default: a no-op registrar,
// so a page rendered outside a Shell registers nothing.
export const ImportGuardContext = createContext(() => undefined);

// Line icons, one per place — inline SVG with stroke="currentColor" and
// plain numeric geometry (the GraduatedRule.jsx precedent: SVG
// presentation attributes take user-space units, so geometry is numbers,
// but colour is never a literal — shell.css's shell__place--{slug}
// modifiers override the stroke with the destination's own accent token).
// Decorative: the link's own text is the accessible name.
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
    </svg>
  );
}

function NotebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function RecipeBookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 5c-2-1.5-5-2-8-1v14c3-1 6-.5 8 1 2-1.5 5-2 8-1V4c-3-1-6-.5-8 1Z" />
      <line x1="12" y1="5" x2="12" y2="19" />
    </svg>
  );
}

function IdeaLogIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3 11c.6.5 1 1.2 1 2h4c0-.8.4-1.5 1-2a6 6 0 0 0-3-11Z" />
    </svg>
  );
}

function IngredientsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20 4c-8 0-14 5-14 12 0 2 1.5 3.5 3.5 3.5 7 0 12-6 12-14 0-.5 0-1-.1-1.5Z" />
      <path d="M6 20 17 9" />
    </svg>
  );
}

function KitchenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 10a8 8 0 0 1 16 0Z" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="12" y1="2" x2="12" y2="5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="10" cy="10" r="6" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 15V3" />
      <path d="M7 8l5-5 5 5" />
      <path d="M4 19h16" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </svg>
  );
}

const ICONS = {
  notebook: NotebookIcon,
  'recipe-book': RecipeBookIcon,
  'idea-log': IdeaLogIcon,
  ingredients: IngredientsIcon,
  kitchen: KitchenIcon,
};

function RailPlace({ place }) {
  const Icon = ICONS[place.slug];
  return (
    <NavLink to={place.path} className={`shell__place shell__place--${place.slug}`} tabIndex={0}>
      <Icon />
      {place.name}
    </NavLink>
  );
}

// The shell every route renders inside (D-09): a header with the wordmark
// (a link to Home at every width), the brand's five sprinkles, and a tools
// row (Search, Import, Export); the six destinations — Home, a divider,
// Notebook / Recipe book / Idea log, a divider, Ingredients / Kitchen — beside
// the routed page in .shell__main. NavLink supplies aria-current from the
// router's own match, never from hand-written state.
//
// Three states (sketch 011 decision 33, shell.css): below 724 the bottom tab
// row and the scrolling header; from 724 to 1589 the sticky bar and the nav as
// a fly-out, opened from the bar's menu button; from 1590 the 224px rail in the
// flex row. The fly-out follows brief (a) items (1) to (6):
//  - it is the one <nav aria-label="Places">; shell__rail--open makes it the
//    panel, and a scrim sits under it;
//  - it closes on a place chosen and on the route changing, on Escape, on the
//    menu button, on a scrim tap, and when the window crosses 1590 or 724 —
//    `open` is derived from the width, so the panel, the scrim and inert vanish
//    in the same render the cut is crossed;
//  - opening moves focus to Home; Tab and Shift-Tab cycle the bar's controls
//    and the six places; .shell__main is inert while open (the bar is not, so
//    its controls work); closing by the user returns focus to the menu button
//    (closeMore's pattern below).
//
// Every stop also carries an explicit tabindex (G-03.4-r3-3,
// .planning/debug/ipad-tab-never-enters-app.md): WebKit makes an <a href>
// keyboard-focusable only under the embedder's TabsToLinks preference —
// off on Apple platforms, with no iPadOS switch, and untouched by Full
// Keyboard Access, which widens only the form-control gate — or when the
// element carries an explicit tabindex, which routes it straight to
// Element::isKeyboardFocusable. Search is therefore the document's first
// keyboard-focusable element for Safari's chrome-to-page hand-off.
export function Shell() {
  const [importErrors, setImportErrors] = useState([]);
  const [storeRevision, setStoreRevision] = useState(0);
  const { reloadCatalog } = useCatalog();
  // True once an import has committed but the catalog could not be reloaded. The
  // routed page is then withheld (see the main element) and nothing in the app
  // clears it: only a page reload does, because the next boot reads and
  // validates the imported tables.
  const [catalogStale, setCatalogStale] = useState(false);
  const fileInputRef = useRef(null);
  const importGuardRef = useRef(null);
  const importRef = useRef(null);
  const importErrorsRef = useRef(null);

  const [moreOpen, setMoreOpen] = useState(false);
  const moreSummaryRef = useRef(null);
  const location = useLocation();
  const { pathname } = location;

  // Whether a create draft is kept, known at the click without awaiting
  // (D-10a): 'unknown' (no read has settled since boot), 'absent' or 'present'.
  // Only the newest read counts; a rejected read leaves the state as it was.
  const creationStateRef = useRef('unknown');
  const creationReadRef = useRef(0);
  // The routed page's own notice announcer, when it has registered one; until
  // then the Shell shows the notice itself.
  const pageNoticeRef = useRef(null);
  const [routeOwnsNotice, setRouteOwnsNotice] = useState(false);
  const [shellNotice, announceShellNotice] = usePageNotice();

  const belowRail = useBelowRail();
  const below724 = useBelow724();
  const flyout = belowRail && !below724;
  const [placesOpen, setPlacesOpen] = useState(false);
  const open = flyout && placesOpen;
  const headRef = useRef(null);
  const navRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setMoreOpen(false);
    setPlacesOpen(false);
    setImportErrors([]);
  }, [pathname]);

  function readCreationState() {
    creationReadRef.current += 1;
    const mine = creationReadRef.current;
    readDrafts()
      .then((records) => {
        if (mine !== creationReadRef.current) return;
        creationStateRef.current = records.some(draftMatchesCreate) ? 'present' : 'absent';
      })
      .catch(() => {});
  }

  // Start and Cancel reach the Shell through the address and the route state they
  // land with: that word is written at the route's commit, bumping the counter so
  // no read started earlier can overwrite it, then a fresh read follows.
  useEffect(() => {
    const fromRoute = creationStateFromRoute(pathname, location.state);
    if (fromRoute) {
      creationReadRef.current += 1;
      creationStateRef.current = fromRoute;
    }
    readCreationState();
  }, [pathname, location.state]);

  useEffect(() => {
    if (!flyout) setPlacesOpen(false);
  }, [flyout]);

  function closePlaces() {
    setPlacesOpen(false);
    menuRef.current?.focus();
  }

  // While the fly-out is open: focus Home without scrolling the page, and
  // watch the keyboard in the capture phase. Escape closes the panel and stops
  // there, so RecipePage's bubble-phase pen listener never sees it and an
  // untouched pen stays open. Tab and Shift-Tab wrap between the bar's links
  // and buttons and the six places; no visibility filter, because from 724 to
  // 1589 every control in the bar shows.
  useEffect(() => {
    if (!open) return undefined;
    navRef.current?.querySelector('.shell__place')?.focus({ preventScroll: true });
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closePlaces();
        return;
      }
      if (event.key !== 'Tab') return;
      const stops = [
        ...headRef.current.querySelectorAll('a[href], button'),
        ...navRef.current.querySelectorAll('a[href]'),
      ];
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open]);

  function closeMore() {
    setMoreOpen(false);
    moreSummaryRef.current?.focus();
  }

  // Close on the Import error panel: when focus was inside the panel, it goes
  // back to the opener, More's summary below 724 or the bar's Import from there.
  function closeImportErrors() {
    const focusWasInside = importErrorsRef.current?.contains(document.activeElement);
    setImportErrors([]);
    if (focusWasInside) (below724 ? moreSummaryRef : importRef).current?.focus();
  }

  // Escape closes the panel and stops there. The listener exists only while
  // errors show and the fly-out is closed: the fly-out's own capture listener
  // is also on document, and stopPropagation would not stop a second one on the
  // same node, so one Escape would close both.
  const importErrorsShowing = importErrors.length > 0;
  useEffect(() => {
    if (!importErrorsShowing || open) return undefined;
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      closeImportErrors();
    }
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [importErrorsShowing, open, below724]);

  // More's open state follows the details' own toggle. Opening More also closes
  // the Import error panel (sketch 011 decision 52, Mark 2026-10-05), because at
  // the phone the panel would cover More's list. It uses Close's own path, so
  // focus moves only when it was inside the panel.
  function toggleMore(event) {
    const nowOpen = event.currentTarget.open;
    setMoreOpen(nowOpen);
    if (nowOpen && importErrorsShowing) closeImportErrors();
  }

  // Export hands the maker a file, using the browser's own object URL and
  // an anchor click — no upload, no network, no external service (D-15).
  // Moved from RecipeList.jsx unchanged in behaviour so it keeps working
  // from every route, not just Home.
  async function handleExport() {
    const exported = await exportStore(repository);
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sprinkles-store.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  // The routed page's registrar: while a pen is open it hands over its own
  // page-notice function; the release it gets back clears the registration
  // only if it still holds that same function.
  const guardImport = useCallback((announce) => {
    importGuardRef.current = announce;
    return () => {
      if (importGuardRef.current === announce) importGuardRef.current = null;
    };
  }, []);

  // The routed page's registrar for its own page notice (D-10a), the same
  // pattern: the release clears the registration only if it still holds that
  // same function.
  const registerPageNotice = useCallback((announce) => {
    pageNoticeRef.current = announce;
    setRouteOwnsNotice(true);
    return () => {
      if (pageNoticeRef.current === announce) {
        pageNoticeRef.current = null;
        setRouteOwnsNotice(false);
      }
    };
  }, []);

  function refuseImport(message) {
    (pageNoticeRef.current ?? announceShellNotice)(message);
  }

  // Both Import buttons open the one hidden file input through here. A pen
  // open on the routed page refuses the click (decide-import-refreshes-open-
  // recipe-pens = refuse): no chooser, no file read, a notice instead. So does a
  // kept new recipe draft (D-10): only the state 'absent' opens the chooser. The
  // route's own word for this render comes before the ref, so it is never a
  // commit late. 'unknown' says the store sentence and reads again. Nothing here
  // awaits.
  function chooseImportFile() {
    if (importGuardRef.current) {
      importGuardRef.current(IMPORT_BLOCKED_STATUS);
      return;
    }
    const creationState = creationStateFromRoute(pathname, location.state) ?? creationStateRef.current;
    if (creationState === 'present') {
      refuseImport(CREATION_IMPORT_BLOCKED_STATUS);
      return;
    }
    if (creationState === 'unknown') {
      refuseImport(PAGE_LOAD_ERROR);
      readCreationState();
      return;
    }
    fileInputRef.current?.click();
  }

  // Import reads a file the maker chose, using the browser's local file
  // reading. A pen open on the routed page refuses the click before it gets
  // here (decide-import-refreshes-open-recipe-pens = refuse). On rejection the errors render as text in the Import error panel; nothing is replaced
  // or cleared. On success storeRevision increments, which every routed
  // page reads through the Outlet context, so Home can reload its own
  // data without a page reload and without the shell reaching into any
  // route's state.
  async function handleImportChange(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;

    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setImportErrors(['$: the file is not valid JSON']);
      return;
    }

    // A creation may have started while the file was read (between Start's write
    // and its arrival at /notebook/new, or in another tab), and an older sight of
    // none cannot say none exists now: read the drafts again, and refuse when
    // one is kept or when the read fails.
    let records;
    try {
      records = await readDrafts();
    } catch {
      refuseImport(PAGE_LOAD_ERROR);
      return;
    }
    if (creationStateRef.current === 'present' || records.some(draftMatchesCreate)) {
      refuseImport(CREATION_IMPORT_BLOCKED_STATUS);
      return;
    }

    const result = await importStore(repository, parsed);
    if (!result.ok) {
      setImportErrors(result.errors);
      return;
    }
    // The catalog is reloaded before any routed page re-renders for the new
    // store revision, so no page renders a scale or problem from the old
    // catalog (D-03a).
    try {
      await reloadCatalog();
    } catch {
      // The import has committed, so the old catalog no longer matches the
      // store, and the rail, the tab row and the address bar all stay live: a
      // different version route would mount a new RecipePage that reads the
      // imported records against the old catalog. Holding storeRevision would
      // stop one refresh and no navigation, so the routed page itself is
      // withheld until a page reload. The Import panel's title says the file
      // can't be imported, which is no longer true, so its lines are cleared
      // and the line goes on the recovery page instead.
      setImportErrors([]);
      setCatalogStale(true);
      return;
    }
    setImportErrors([]);
    setStoreRevision((revision) => revision + 1);
  }

  return (
    <div className="shell">
      <header className="shell__head" ref={headRef}>
        <div className="shell__lead">
          {flyout && (
            <Button
              className="shell__menu"
              aria-label="Places"
              aria-expanded={open}
              aria-controls="places"
              ref={menuRef}
              onClick={() => (open ? closePlaces() : setPlacesOpen(true))}
            >
              <MoreIcon />
            </Button>
          )}
          <div>
            <p className="shell__brand">
              <Link to="/" tabIndex={0}>
                Sprinkles
              </Link>
            </p>
            <div className="shell__sprinkles" aria-hidden="true">
              {PLACES.map((place) => (
                <span key={place.slug} className={`shell__sprinkle shell__sprinkle--${place.slug}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="shell__tools">
          <NavLink to="/search" className="shell__place" tabIndex={0}>
            <SearchIcon />
            Search
          </NavLink>
          <Button
            className="shell__place"
            ref={importRef}
            onClick={chooseImportFile}
          >
            <ImportIcon />
            Import
          </Button>
          <Button className="shell__place" onClick={handleExport}>
            <ExportIcon />
            Export
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="shell__file-input"
            onChange={handleImportChange}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </header>
      {/* The Import error panel (sketch 011 decision 52 B, Mark 2026-10-05):
          fixed under Import from 724 and above the tab row below it, over the
          page, so the bar never grows. It stays until Close, Escape, a good
          import, a page change or More opening. Its place in the stack is in tokens.css. */}
      {importErrorsShowing && (
        <div className="shell__import-errors" role="alert" ref={importErrorsRef}>
          <div className="shell__import-errors-head">
            <div>
              <p className="shell__import-errors-title">This file can’t be imported</p>
              <p className="shell__import-errors-count">
                {importErrors.length === 1 ? '1 problem found' : `${importErrors.length} problems found`}
              </p>
            </div>
            <Button className="shell__place" onClick={closeImportErrors}>
              Close
            </Button>
          </div>
          <ul className="shell__import-errors-list">
            {importErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="shell__body">
        <nav
          id="places"
          ref={navRef}
          className={open ? 'shell__rail shell__rail--open' : 'shell__rail'}
          aria-label="Places"
          onClick={open ? closePlaces : undefined}
        >
          <NavLink to="/" end className="shell__place shell__place--home" tabIndex={0}>
            <HomeIcon />
            Home
          </NavLink>
          <hr className="shell__divider" aria-hidden="true" />
          {PLACES.slice(0, 3).map((place) => (
            <RailPlace key={place.slug} place={place} />
          ))}
          <hr className="shell__divider" aria-hidden="true" />
          {PLACES.slice(3).map((place) => (
            <RailPlace key={place.slug} place={place} />
          ))}
        </nav>
        {open && <div className="shell__scrim" aria-hidden="true" onClick={closePlaces} />}
        <main className="shell__main" inert={open}>
          {catalogStale ? (
            // The placeholder page's own pattern (Placeholder.jsx): the place's
            // name as its title and one sentence naming its status. The rail is
            // the way out, and every route it reaches shows this page too.
            <div className="list-page place">
              <h1 className="place__title">Import</h1>
              <p className="place__note">{IMPORT_RELOAD_LINE}</p>
            </div>
          ) : (
            <>
              {/* The Shell's own notice, drawn only while no routed page has
                  registered one, so each page holds exactly one .page-status. */}
              {!routeOwnsNotice && <PageNotice message={shellNotice} />}
              <ImportGuardContext value={guardImport}>
                <PageNoticeContext value={registerPageNotice}>
                  <Outlet context={storeRevision} />
                </PageNoticeContext>
              </ImportGuardContext>
            </>
          )}
        </main>
      </div>
      {/* D-16: below the phone step the rail becomes a bottom tab row of
          five coloured tabs, the fifth being More — Ingredients, Kitchen,
          Search, Import and Export. Rendered at every width; the
          phone cut (shell.css) decides which navigation is shown. Because the hidden one leaves the accessibility tree,
          both may share the rail's own label. More's Import opens the
          same single hidden file input the tools row's Import opens —
          one input, two buttons, never two inputs. More's open state is
          React's now (G-03.4-3): a native <details> toggles only via its
          own <summary>'s activation behaviour, so choosing one of the
          five items inside never closed it, and because the element sits
          outside the Outlet a route change used to reconcile it in place
          with `open` still set. The `<ul>`'s own click handler closes it
          on item activation and an effect keyed on the route closes it on
          navigation, in both cases returning focus to the summary. */}
      <nav className="shell__tabs" aria-label="Places">
        <NavLink to="/" end className="shell__place shell__place--home" tabIndex={0}>
          <HomeIcon />
          Home
        </NavLink>
        {PLACES.slice(0, 3).map((place) => (
          <RailPlace key={place.slug} place={place} />
        ))}
        <details className="shell__more" open={moreOpen} onToggle={toggleMore}>
          <summary className="shell__place" ref={moreSummaryRef} tabIndex={0}>
            <MoreIcon />
            More
          </summary>
          <ul onClick={closeMore}>
            <li>
              <RailPlace place={PLACES[3]} />
            </li>
            <li>
              <RailPlace place={PLACES[4]} />
            </li>
            {/* The hairline between the places (Ingredients, Kitchen) and Search,
                Import and Export, grouped as the header groups them (sketch 011
                decision 55; Mark 2026-10-05, Search below the hairline). It is
                the rail's own divider, hidden from assistive tech. A tap on it
                closes More like any tap in the list. */}
            <li className="shell__more-sep" aria-hidden="true">
              <hr className="shell__divider" />
            </li>
            <li>
              <NavLink to="/search" className="shell__place" tabIndex={0}>
                <SearchIcon />
                Search
              </NavLink>
            </li>
            <li>
              <Button className="shell__place" onClick={chooseImportFile}>
                <ImportIcon />
                Import
              </Button>
            </li>
            <li>
              <Button className="shell__place" onClick={handleExport}>
                <ExportIcon />
                Export
              </Button>
            </li>
          </ul>
        </details>
      </nav>
    </div>
  );
}
