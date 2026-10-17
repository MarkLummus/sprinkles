import { useEffect, useState } from 'react';
import { repository } from '../store/repository.js';

// The page's record loading (Phase 8, EDIT-05, cut 2, D-03).
//
// This hook owns the eight reads the recipe page makes behind the repository
// seam and the state they fill, and loadFailed, which any failed read sets. It
// is settled before the kept-draft restore, which waits on loadFailed. The hook
// never reads version outside an effect, so it is safe above the page's early
// returns. It owns no title, draft or pen: the setters it hands back
// (setVersion, setVersions, setBatches, setRecipe) are for the page's own
// save handlers, which keep calling them from where they are.
export function useRecipeData(versionId) {
  const [version, setVersion] = useState(undefined);
  const [versions, setVersions] = useState([]);
  const [batches, setBatches] = useState([]);
  // Whether this version's batches have been read: the draft restore waits for
  // them, since an amend draft is checked against its batch (04-09).
  const [batchesLoaded, setBatchesLoaded] = useState(false);
  // Every kept draft, read once: the band names a Next version draft waiting on
  // another version of this recipe (04-09).
  const [drafts, setDrafts] = useState([]);
  // Whether the drafts were read: the Home Next version request waits for it.
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  // Whether the versions were read: the Home Next version request waits for it.
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  // Set when any store read below fails (WR-05): the page then says so instead
  // of rendering without data, and the draft restore never starts, so a kept
  // draft is never judged against reads that did not happen.
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    repository
      .getVersion(versionId)
      .then((result) => {
        if (!cancelled) setVersion(result ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  useEffect(() => {
    let cancelled = false;
    repository
      .listBatchesForVersion(versionId)
      .then((result) => {
        if (!cancelled) {
          setBatches(result);
          setBatchesLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  useEffect(() => {
    let cancelled = false;
    repository
      .listDrafts()
      .then((result) => {
        if (!cancelled) {
          setDrafts(result);
          setDraftsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  // Every stored version, loaded once beside the two effects above — the
  // strip (03-03) and the version-line uniqueness check (D-04) both read
  // this list.
  useEffect(() => {
    let cancelled = false;
    repository
      .listVersions()
      .then((result) => {
        if (!cancelled) {
          setVersions(result);
          setVersionsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  // The recipe record (03.5-04 Task 1, D-11): the band's own RecipeBand
  // reads name/description from here, not from the version — Rename edits
  // only this record. Keyed on the loaded version's own recipeId (not the
  // route's, though the not-found guard above already proves the two
  // agree by the time this fires) — the same house cancelled-flag pattern
  // citedBatch/parentVersion below already use, so a stale response from
  // an abandoned fetch can never land on the wrong version.
  const [recipe, setRecipe] = useState(undefined);
  useEffect(() => {
    let cancelled = false;
    if (!version) {
      setRecipe(undefined);
      return undefined;
    }
    repository
      .getRecipe(version.recipeId)
      .then((result) => {
        if (!cancelled) setRecipe(result ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The cited batch this version's lineage line names (route-recipe-version.md
  // § 3): citedBatchId is an id only — the batch itself lives on the
  // parent, never copied onto the child — so its churn date is read once
  // per version here, purely to render the lineage line's date-linked
  // clause.
  const [citedBatch, setCitedBatch] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.citedBatchId) {
      setCitedBatch(null);
      return undefined;
    }
    repository
      .getBatch(version.citedBatchId)
      .then((result) => {
        if (!cancelled) setCitedBatch(result ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // The live parent read (T-03-23, T-03-24): show-changes reads the parent
  // record through the repository at render time, never a copy stored on
  // the child, so a parent saved over afterwards is reflected rather than
  // frozen. Held as null when the version has no parent, or when the read
  // comes back with nothing — either way the toggle is absent and the
  // lineage line still names the parent from the child's own
  // parentVersionLabel snapshot (D-10).
  const [parentVersion, setParentVersion] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!version || !version.parentVersionId) {
      setParentVersion(null);
      return undefined;
    }
    repository
      .getVersion(version.parentVersionId)
      .then((result) => {
        if (!cancelled) setParentVersion(result ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  // Every batch in the store, for the recipe History outline
  // (03.3-06 checkpoint feedback, G-03.3-4): each descendant's "churned"
  // date and its cited batch's date both come out of this one read — one
  // repository.getAllBatches() read, not a query per version, since the
  // realistic range is 1–6 versions per recipe this milestone.
  const [allBatches, setAllBatches] = useState([]);
  useEffect(() => {
    let cancelled = false;
    repository
      .getAllBatches()
      .then((result) => {
        if (!cancelled) setAllBatches(result);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  return {
    version,
    setVersion,
    versions,
    setVersions,
    batches,
    setBatches,
    batchesLoaded,
    drafts,
    draftsLoaded,
    versionsLoaded,
    loadFailed,
    recipe,
    setRecipe,
    citedBatch,
    parentVersion,
    allBatches,
  };
}
