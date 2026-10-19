import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { formatRecordDate } from '../domain/batch.js';
import { sortedVersions, versionIdentity, versionsForRecipe } from '../domain/lineage.js';
import { Button } from './Button.jsx';
import { BatchLogPage, TastingLogPage, logFootText } from './PrintLogPages.jsx';
import { SheetPage, useSheetPages } from './PrintSheetPages.jsx';
import { notebookPath } from './notebookPaths.js';
import { RecipeNotFound } from './RecipePage.jsx';
import { useCatalog } from './CatalogContext.jsx';

// Wording approved by Mark (2026-10-11): decide-new-lines-import-block-and-too-long
// (decide-print-oversized-text-policy = visible state). The one home of the sentence.
export const PRINT_TOO_LONG_LINE = 'This is too long to print on one page.';

// The print route, /notebook/:recipeId/:versionId/print (D-04; sketch 010
// screen-print-route-1280.html and -393.html). Keyed by both ids, the
// RecipePageForRoute pattern (router.jsx): a different version is a
// different page instance, so nothing carries over from the last one. The
// wrapper does nothing else: no state, no fetch. The key also carries the
// shell's storeRevision (Shell.jsx increments it after a successful import), so
// an import remounts the route: it re-reads the saved version, lays the
// replacement's pages again, and Print stays off until they are laid (WR-06),
// with nothing of the old version carried over.
export function PrintSheetForRoute() {
  const { recipeId, versionId } = useParams();
  const storeRevision = useOutletContext();
  return <PrintSheet key={`${recipeId}::${versionId}::${storeRevision}`} recipeId={recipeId} versionId={versionId} />;
}

// The route reads the SAVED version record only: getVersion, getRecipe and
// listVersions, never a stored draft or any pen state, and it calls no write
// method. So it prints a version and never creates a batch (PRINT-05, by
// construction), and unsaved work cannot reach paper (T-04-16).
export function PrintSheet({ recipeId, versionId }) {
  // The core scales and problems the Tasting log prints come from the catalog,
  // read once at boot and again after an import (D-02, D-03a).
  const { catalog } = useCatalog();
  const [version, setVersion] = useState(undefined);
  const [recipe, setRecipe] = useState(undefined);
  const [versions, setVersions] = useState(undefined);
  // The pictures' scale to the room there is (below 724 the pages are drawn
  // smaller as a whole, never reflowed): measured here, set as one inline
  // custom property, read by print.css. 1 while nothing is measured.
  const [scale, setScale] = useState(1);
  const pagesRef = useRef(null);
  const pageRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    repository.getVersion(versionId).then((result) => {
      if (!cancelled) setVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  useEffect(() => {
    let cancelled = false;
    if (!version) {
      setRecipe(undefined);
      return undefined;
    }
    repository.getRecipe(version.recipeId).then((result) => {
      if (!cancelled) setRecipe(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [version]);

  useEffect(() => {
    let cancelled = false;
    repository.listVersions().then((result) => {
      if (!cancelled) setVersions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  const loaded = Boolean(version) && Boolean(recipe) && versions !== undefined && version.recipeId === recipeId;
  const identity = loaded ? versionIdentity(sortedVersions(versionsForRecipe(versions, version.recipeId)), version) : '';

  // The Sheet's pages (the formula part, the Instructions and the closing foot),
  // laid by measurement in the printing engine's own content box (PRINT-01,
  // PRINT-02, sketch 010 D29): null until the blocks are measured. The closing
  // foot's version line is the route's own.
  const sheet = useSheetPages(loaded ? version : null, undefined, identity);

  // D-20: the tab title leads with the recipe name while the route is mounted.
  const recipeName = loaded ? recipe.name : null;
  useEffect(() => {
    if (recipeName === null) return undefined;
    document.title = `${recipeName} · Print sheet · Sprinkles`;
    return () => {
      document.title = 'Sprinkles';
    };
  }, [recipeName]);

  // The container's content width over the page's own measured width, never
  // above 1: no literal, and no sideways pan at 393. The container does not
  // depend on the pictures, so the observer cannot feed itself.
  useLayoutEffect(() => {
    if (!loaded || typeof ResizeObserver === 'undefined') return undefined;
    const pages = pagesRef.current;
    const page = pageRef.current;
    const measure = () => {
      const own = page.offsetWidth;
      const room = pages.clientWidth;
      setScale(own > 0 && room > 0 ? Math.round(Math.min(1, room / own) * 10000) / 10000 : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pages);
    return () => observer.disconnect();
  }, [loaded]);

  if (version === undefined) return null;
  // A mistyped id, or a version under another recipe's address, is the same
  // not-found page the recipe route shows (T-04-15).
  if (version === null || version.recipeId !== recipeId) return <RecipeNotFound />;
  if (recipe === undefined || versions === undefined) return null;
  if (recipe === null) return <RecipeNotFound />;

  const code = version.sheetCode;
  const saved = formatRecordDate(version.createdAt);
  const footFor = (side) => logFootText({ sheetTitle: version.sheetTitle, identity, code, side });

  return (
    <div
      className={sheet.engine === 'webkit' ? 'notebook print-route print-pages--webkit' : 'notebook print-route print-pages--other'}
      data-print-ready={sheet.pages ? 'true' : undefined}
    >
      <header className="print-route__head">
        <div className="print-route__id">
          <span className="notebook-caption">Print sheet</span>
          <h1 className="print-route__line">
            <Link className="print-route__name" to={notebookPath(version.recipeId, version.id)} tabIndex={0}>
              {version.sheetTitle}
            </Link>{' '}
            <span className="print-route__dot" aria-hidden="true">·</span>{' '}
            <span className="print-route__part">{identity}</span>{' '}
            <span className="print-route__dot" aria-hidden="true">·</span>{' '}
            <span className="print-route__part">
              Saved {saved} · Sheet code <span className="print-route__code">{code}</span>
            </span>
          </h1>
          {sheet.oversize && <p className="print-route__line">{PRINT_TOO_LONG_LINE}</p>}
        </div>
        {/* Until the Sheet's pages are laid (data-print-ready) a print would carry the two log pages only (WR-06).
            They are never laid for a block too tall for a page (sheet.oversize). */}
        <Button className="notebook-action" disabled={!sheet.pages} onClick={() => window.print()}>
          Print
        </Button>
      </header>
      <div className="print-route__pages" ref={pagesRef} style={{ '--sheet-print-picture-scale': scale }}>
        <div className="print-route__picture" role="img" aria-label="Batch log">
          <div className="print-page print-page--log" ref={pageRef}>
            <BatchLogPage footText={footFor(1)} />
          </div>
        </div>
        <div className="print-route__picture" role="img" aria-label="Tasting log">
          <div className="print-page print-page--log">
            <TastingLogPage version={version} catalog={catalog} footText={footFor(2)} />
          </div>
        </div>
        {sheet.pages &&
          sheet.pages.map((plan, i) => (
            <div key={i} className="print-route__picture" role="img" aria-label={`Sheet, page ${i + 1}`}>
              <div className="print-page print-page--sheet">
                <div className="ps-fit ps-frame" style={{ '--sheet-print-fit-scale': sheet.fit }}>
                  <SheetPage plan={plan} blocks={sheet.blocks} columns={sheet.columns} />
                </div>
              </div>
            </div>
          ))}
      </div>
      {sheet.measureElement}
    </div>
  );
}
