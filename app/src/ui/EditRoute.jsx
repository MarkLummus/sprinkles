import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { draftMatchesEdit } from '../domain/draft.js';
import { firstVersionRefusal } from '../domain/firstVersion.js';
import { draftFromVersion } from '../domain/creationSave.js';
import { normalizeCreateDraft } from '../domain/creation.js';
import { normalizeAllocation } from '../domain/creationSteps.js';
import { notebookPath } from './notebookPaths.js';
import { useCatalog } from './CatalogContext.jsx';
import { CreationPage } from './CreationPage.jsx';
import { RecipeNotFound } from './RecipePage.jsx';

// The /notebook/:recipeId/:versionId/edit wrapper (Phase 11, STRUCT-04, D-01,
// D-06): opens the creation editor over a saved first version that has no batch
// and no child. Like CreationRoute it reads in a component effect, not a route
// loader (the router is built before the store seeds), once per address.
//
// It decides from what it reads, and deletes nothing, ever (D-06: a kept edit
// is the maker's work and only its own Cancel, its own clean return and a
// successful Save-over end it):
//   - an unknown version, a version of another recipe or an unknown recipe
//     renders RecipeNotFound;
//   - a kept draft that is not an edit (a pen's) replaces the address with the
//     version's page, touching nothing;
//   - a kept edit draft opens the editor on it, with the version's refusal (if
//     any) already standing under Save: a version that gained a batch or a
//     later version stays reachable until Cancel;
//   - no kept edit and a version that can no longer be edited replaces the
//     address with the page;
//   - otherwise the editor opens on what the saved version means.
export function EditRoute() {
  const { recipeId, versionId } = useParams();
  const navigate = useNavigate();
  const { catalog } = useCatalog();
  const [found, setFound] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setFound(null);
    Promise.resolve()
      .then(() =>
        Promise.all([
          repository.getVersion(versionId),
          repository.getRecipe(recipeId),
          repository.listVersions(),
          repository.getAllBatches(),
          repository.getDraft(versionId),
        ]),
      )
      .then(([version, recipe, versions, batches, draft]) => {
        if (cancelled) return;
        if (!version || version.recipeId !== recipeId || !recipe) {
          setFound({ notFound: true });
          return;
        }
        const keptEdit = draft && draftMatchesEdit(draft) ? draft : null;
        if (draft && draft.kind !== 'edit') {
          navigate(notebookPath(recipeId, versionId), { replace: true });
          return;
        }
        const refusal = firstVersionRefusal({ version, versions, batches });
        if (!keptEdit && refusal !== null) {
          navigate(notebookPath(recipeId, versionId), { replace: true });
          return;
        }
        const seed = normalizeAllocation(normalizeCreateDraft(draftFromVersion(version, recipe, catalog.styles)));
        setFound({ version, recipe, seed, keptEdit, refusal: keptEdit ? refusal : null });
      })
      .catch(() => {
        if (!cancelled) navigate(notebookPath(recipeId, versionId), { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId, versionId]);

  if (found === null) return null;
  if (found.notFound) return <RecipeNotFound />;
  const { version, recipe, seed, keptEdit, refusal } = found;
  return (
    <CreationPage
      key={versionId}
      record={keptEdit ?? { versionId, kind: 'edit', payload: seed }}
      mode="edit"
      cleanPayload={seed}
      stored={{ version, recipe }}
      closedReason={refusal}
      justStarted={false}
    />
  );
}
