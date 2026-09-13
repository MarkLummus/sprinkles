import { createBrowserRouter, useParams } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { RecipeList } from './ui/RecipeList.jsx';
import { RecipePage } from './ui/RecipePage.jsx';

// A different version, or a different batch of the same version, must be a
// different page instance (one-pen-rule-leaks.md Evidence 8-9). React
// Router's _renderMatches builds the rendered route element with no key of
// its own, so /recipe/A -> /recipe/B reused the same RecipePage instance
// and carried its mode, draft, amendingBatchId, tastingDraft and penDraft
// along with it. That silent carry is what turned two latent bugs into
// reachable failures: (a) amending version A's batch, landing on B, then
// pressing Save batch — amendingBatchId still names A's batch while
// `batches` has reloaded to B's, so `batches.find` returns undefined and
// recordAmendment throws reading `amendedAt` off it; (b) developing
// version A, landing on sibling B, then pressing Save as a new version —
// siblings share row ids because createChildVersion clones the parent's
// rows including their ids, so buildPenFields finds a draft row for every
// row of B and silently writes a child OF B carrying A's grams, method,
// headnote and authored notes, with no error at all. A key built from the
// route's own id and batchId makes both paths unreachable by any route,
// including the browser's own back and forward buttons, which no disabled
// link could ever guard — this is D-UAT-2's reset backstop, not its
// in-app navigation policy (that is 03-07's scope). The wrapper does
// nothing else: no state, no fetch, just the parameters and the key.
function RecipePageForRoute() {
  const { id, batchId } = useParams();
  return <RecipePage key={`${id}::${batchId ?? ''}`} />;
}

// D-14: URL-addressable routes for the list and the recipe page now, so
// Phase 2's batch route and Phase 4's print route are additions, not a
// retrofit.
export const router = createBrowserRouter([
  { path: '/', Component: RecipeList },
  { path: '/recipe/:id', Component: RecipePageForRoute },
  { path: '/recipe/:id/batch/:batchId', Component: RecipePageForRoute },
]);

export function App() {
  return <RouterProvider router={router} />;
}
