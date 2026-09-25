import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { legacyRecipePath } from './notebookPaths.js';
import { RecipeNotFound } from './RecipePage.jsx';

// Component redirects, not route loaders (decisions_recorded 1, 03.5-02
// Task 1). router.jsx's createBrowserRouter runs at import time, before
// main.jsx's `await seedIfEmpty(repository)` resolves — a loader reading
// the store on a first visit after the D-10 reset could read an empty
// store and report not-found for a real recipe. A component only renders
// (and only fetches, in its effect) after seeding has already resolved and
// the app has mounted. Both redirects call navigate(path, { replace: true
// }), satisfying D-14's/D-16's replace-redirect.

// The /recipe/:id and /recipe/:id/batch/:batchId redirect target (D-16,
// kept indefinitely — the old id is a version id). Reads the version once
// to resolve its recipeId, then replaces the address with the Notebook
// form, keeping the URL's own search string.
export function LegacyRecipeRedirect() {
  const { id, batchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    repository.getVersion(id).then((version) => {
      if (cancelled) return;
      const path = legacyRecipePath(version, batchId ?? null);
      if (path) {
        navigate(path + location.search, { replace: true });
      } else {
        setNotFound(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, batchId]);

  if (notFound) return <RecipeNotFound />;
  return null;
}
