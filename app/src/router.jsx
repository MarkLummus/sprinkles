import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { RecipeList } from './ui/RecipeList.jsx';
import { RecipePage } from './ui/RecipePage.jsx';

// D-14: URL-addressable routes for the list and the recipe page now, so
// Phase 2's batch route and Phase 4's print route are additions, not a
// retrofit.
export const router = createBrowserRouter([
  { path: '/', Component: RecipeList },
  { path: '/recipe/:id', Component: RecipePage },
  { path: '/recipe/:id/batch/:batchId', Component: RecipePage },
]);

export function App() {
  return <RouterProvider router={router} />;
}
