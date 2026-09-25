import { useCallback, useEffect, useRef, useState } from 'react';
import { createBrowserRouter, Link, useParams } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { RecipeList } from './ui/RecipeList.jsx';
import { RecipePage } from './ui/RecipePage.jsx';
import { Shell } from './ui/Shell.jsx';
import { Placeholder } from './ui/Placeholder.jsx';
import { LegacyRecipeRedirect } from './ui/NotebookRedirects.jsx';

// A different version, or a different batch of the same version, must be a
// different page instance (one-pen-rule-leaks.md Evidence 8-9). React
// Router's _renderMatches builds the rendered route element with no key of
// its own, so /notebook/r/A -> /notebook/r/B reused the same RecipePage
// instance and carried its mode, draft, amendingBatchId, tastingDraft and
// penDraft along with it. That silent carry is what turned two latent bugs
// into reachable failures: (a) amending version A's batch, landing on B,
// then pressing Save batch — amendingBatchId still names A's batch while
// `batches` has reloaded to B's, so `batches.find` returns undefined and
// recordAmendment throws reading `amendedAt` off it; (b) developing
// version A, landing on sibling B, then pressing Save as a new version —
// siblings share row ids because createChildVersion clones the parent's
// rows including their ids, so buildPenFields finds a draft row for every
// row of B and silently writes a child OF B carrying A's grams, method,
// headnote and authored notes, with no error at all. A key built from the
// route's own recipeId, versionId and batchId makes both paths
// unreachable by any route, including the browser's own back and forward
// buttons, which no disabled link could ever guard — this is D-UAT-2's
// reset backstop, not its in-app navigation policy (that is 03-07's
// scope). The wrapper does nothing else: no state, no fetch, just the
// parameters and the key.
function RecipePageForRoute() {
  const { recipeId, versionId, batchId } = useParams();
  const [pageStatus, setPageStatus] = useState('');
  const pageStatusTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (pageStatusTimerRef.current) clearTimeout(pageStatusTimerRef.current);
    },
    [],
  );

  // This region belongs to the routed page shell, outside the keyed
  // RecipePage. It therefore survives /recipe/parent -> /recipe/child and
  // can announce the save that caused that navigation.
  const announcePageStatus = useCallback((message, { persist = false } = {}) => {
    if (pageStatusTimerRef.current) clearTimeout(pageStatusTimerRef.current);
    setPageStatus(message);
    if (message && !persist) {
      pageStatusTimerRef.current = setTimeout(() => {
        setPageStatus((current) => (current === message ? '' : current));
      }, 5000);
    }
  }, []);

  return (
    <>
      {/* The running head lives here, in the routed shell, above the
          keyed page, so the notice has a fixed band to anchor beneath
          instead of a magic offset. RecipePage stays a sibling AFTER
          this div, never inside it, so the band's height stays exactly
          the head's height. */}
      <div className="page-head">
        <p className="running-head">
          <Link to="/" tabIndex={0}>Sprinkles</Link>
        </p>
        <PageStatus message={pageStatus} />
      </div>
      <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={announcePageStatus} />
    </>
  );
}

export function PageStatus({ message }) {
  return (
    <p className="page-status" role="status" aria-live="polite">
      {message}
    </p>
  );
}

// D-14: URL-addressable routes for the list and the recipe page now, so
// Phase 2's batch route and Phase 4's print route are additions, not a
// retrofit. D-09: every route now nests under the Shell layout route, so
// the rail and tools row render once and persist across navigation
// (RESEARCH.md Pattern 1). Task 1 adds the one placeholder route this
// task's rail reaches (Notebook); Task 2 adds the remaining destinations
// and the Search placeholder.
//
// 03.5-02: a version lives at /notebook/:recipeId/:versionId (and its
// batch sibling); /notebook/:recipeId replace-redirects to that recipe's
// latest version (D-14, added by Task 2). The old /recipe/:id and
// /recipe/:id/batch/:batchId addresses are kept indefinitely (D-16) —
// never deleted — and now resolve through LegacyRecipeRedirect, which
// reads the old id as a version id and replaces the address with the
// Notebook form.
export const router = createBrowserRouter([
  {
    Component: Shell,
    children: [
      { path: '/', Component: RecipeList },
      { path: '/notebook/:recipeId/:versionId', Component: RecipePageForRoute },
      { path: '/notebook/:recipeId/:versionId/batch/:batchId', Component: RecipePageForRoute },
      // D-16: kept indefinitely, not deleted — the old id is a version id.
      { path: '/recipe/:id', Component: LegacyRecipeRedirect },
      { path: '/recipe/:id/batch/:batchId', Component: LegacyRecipeRedirect },
      { path: '/notebook', element: <Placeholder name="Notebook" /> },
      { path: '/recipe-book', element: <Placeholder name="Recipe book" /> },
      { path: '/idea-log', element: <Placeholder name="Idea log" /> },
      { path: '/ingredients', element: <Placeholder name="Ingredients" /> },
      { path: '/kitchen', element: <Placeholder name="Kitchen" /> },
      { path: '/search', element: <Placeholder name="Search" /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
