import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { formatRecordDate } from '../domain/batch.js';
import { sortedVersions, versionIdentity, versionsForRecipe } from '../domain/lineage.js';
import { sheetCode } from '../domain/sheetCode.js';
import { Button } from './Button.jsx';
import { BatchLogPage, logFootText } from './PrintLogPages.jsx';
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
      <div className="print-route__pages">
        <div className="print-route__picture" role="img" aria-label="Batch log">
          <div className="print-page print-page--log">
            <BatchLogPage footText={footFor(1)} />
          </div>
        </div>
      </div>
    </div>
  );
}
