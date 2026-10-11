import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { formatRecordDate } from '../domain/batch.js';
import { sortedVersions, versionIdentity, versionsForRecipe } from '../domain/lineage.js';
import { sheetCode } from '../domain/sheetCode.js';
import { Button } from './Button.jsx';
import { BatchLogPage, TastingLogPage, logFootText } from './PrintLogPages.jsx';
import { notebookPath } from './notebookPaths.js';
import { RecipeNotFound } from './RecipePage.jsx';

// The print route, /notebook/:recipeId/:versionId/print (D-04; sketch 010
// screen-print-route-1280.html and -393.html). Keyed by both ids, the
// RecipePageForRoute pattern (router.jsx): a different version is a
// different page instance, so nothing carries over from the last one. The
// wrapper does nothing else: no state, no fetch.
export function PrintSheetForRoute() {
  const { recipeId, versionId } = useParams();
  return <PrintSheet key={`${recipeId}::${versionId}`} recipeId={recipeId} versionId={versionId} />;
}

// The route reads the SAVED version record only: getVersion, getRecipe and
// listVersions, never a stored draft or any pen state, and it calls no write
// method. So it prints a version and never creates a batch (PRINT-05, by
// construction), and unsaved work cannot reach paper (T-04-16).
export function PrintSheet({ recipeId, versionId }) {
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

  const code = sheetCode(version);
  const identity = versionIdentity(sortedVersions(versionsForRecipe(versions, version.recipeId)), version);
  const saved = formatRecordDate(version.createdAt);
  const footFor = (side) => logFootText({ sheetTitle: version.sheetTitle, identity, code, side });

  return (
    <div className="notebook print-route" data-print-ready="true">
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
        </div>
        <Button className="notebook-action" onClick={() => window.print()}>
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
            <TastingLogPage version={version} footText={footFor(2)} />
          </div>
        </div>
      </div>
    </div>
  );
}
