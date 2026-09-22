// Pure. No framework, no DOM, no store reference — see 03.4-CONTEXT.md
// D-05 (recency decides active work, with no stored flag) and D-07 (the
// standing that decides a row's next action). Reads sortedVersions,
// versionsForRecipe and latestVersionPerRecipe from ./lineage.js and
// sortedBatches from ./batch.js — the same ordering the version and
// batch lists already use, never re-derived here. Every comparison is a
// plain ISO-string comparison, mirroring batch.js's own precedent: never
// constructs a date object and never calls a locale- or timezone-
// dependent formatter.
import { sortedVersions, versionsForRecipe, latestVersionPerRecipe } from './lineage.js';
import { sortedBatches } from './batch.js';

/**
 * lastEventAt(versions, batches) -> the greatest ISO string among every
 * supplied version's createdAt and every supplied batch's recordedAt and
 * changed, comparing strings, never date objects (D-05). Returns null
 * when nothing supplied carries a timestamp. A field that is null is
 * ignored rather than treated as the earliest possible moment — a fold
 * that started from null and compared with `>` would let a real
 * timestamp lose to a stray null on the wrong side of the comparison.
 * churn.churnDate and tasting.tastedDate are never read here: they are
 * dates the maker enters about the kitchen, not about when something was
 * saved, and reading them would let a back-dated churn move a recipe's
 * place in the list (03.4-CONTEXT.md decision #1).
 */
export function lastEventAt(versions, batches) {
  let latest = null;
  for (const version of versions) {
    if (version.createdAt != null && (latest === null || version.createdAt > latest)) {
      latest = version.createdAt;
    }
  }
  for (const batch of batches) {
    if (batch.recordedAt != null && (latest === null || batch.recordedAt > latest)) {
      latest = batch.recordedAt;
    }
    if (batch.changed != null && (latest === null || batch.changed > latest)) {
      latest = batch.changed;
    }
  }
  return latest;
}

// The three standings a recipe developing in the Notebook can hold
// (D-07), exported as constants so no caller spells one by hand. Two
// more standings D-07 names — a Recipe Book version's own "ready to
// make" and a saved idea's own "saved idea" — need destinations this
// phase does not build (the Recipe Book, the Idea Log); this module
// returns only the three the Notebook can produce, per 03.4-CONTEXT.md
// decision #2.
export const NOT_YET_CHURNED = 'not-yet-churned';
export const AWAITING_TASTING = 'awaiting-tasting';
export const TASTED = 'tasted';

/**
 * standingFor(batches) -> NOT_YET_CHURNED when the recipe has no batch,
 * AWAITING_TASTING when the newest batch's tasting is null, TASTED when
 * it is an object — newest decided by sortedBatches, the same ordering
 * the batch history already reads (D-07).
 */
export function standingFor(batches) {
  if (batches.length === 0) return NOT_YET_CHURNED;
  const [newest] = sortedBatches(batches);
  return newest.tasting ? TASTED : AWAITING_TASTING;
}

// Deterministic tie-break for two recipes whose lastEventAt agree exactly
// (03.4-CONTEXT.md decision #4): the later of two null-safe ISO strings
// wins, a null sorts last, and an exact tie falls back to the latest
// version's own id so two recipes saved in the same millisecond always
// order the same way in every run.
function compareByRecency(a, b) {
  if (a.lastEventAt === b.lastEventAt) {
    if (a.latestVersion.id === b.latestVersion.id) return 0;
    return a.latestVersion.id < b.latestVersion.id ? -1 : 1;
  }
  if (a.lastEventAt === null) return 1;
  if (b.lastEventAt === null) return -1;
  return a.lastEventAt < b.lastEventAt ? 1 : -1;
}

/**
 * activeWork(versions, batches) -> one entry per recipe — id, name, its
 * latest version, its own versions newest-first, its own batches
 * newest-first, its lastEventAt and its standing — ordered by
 * lastEventAt descending, a null last event ordering last, ties broken
 * on the latest version's id (D-05, D-06, D-07). An empty versions array
 * returns an empty array. A batch whose churn is missing entirely (a
 * malformed stored record) is left out of a recipe's own batches rather
 * than reaching sortedBatches, which reads every batch's churn to order
 * it — the same guard the row renderer already applies.
 */
export function activeWork(versions, batches) {
  return latestVersionPerRecipe(versions)
    .map((latestVersion) => {
      const recipeId = latestVersion.recipeId;
      const orderedVersions = sortedVersions(versionsForRecipe(versions, recipeId));
      const orderedVersionIds = new Set(orderedVersions.map((version) => version.id));
      const recipeBatches = batches.filter(
        (batch) => orderedVersionIds.has(batch.versionId) && batch.churn != null,
      );
      const orderedBatches = sortedBatches(recipeBatches);
      return {
        id: recipeId,
        name: latestVersion.recipeName,
        latestVersion,
        versions: orderedVersions,
        batches: orderedBatches,
        lastEventAt: lastEventAt(orderedVersions, recipeBatches),
        standing: standingFor(recipeBatches),
      };
    })
    .sort(compareByRecency);
}
