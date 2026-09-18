// A recipe's colour, dealt not stored (route.md § 3, § 5). Framework-free
// — no React import, no DOM access, no store import — so it runs under
// Vitest's `node` environment (app/vitest.config.js's default). It lives
// beside its only consumer in ui/ rather than in domain/ because a CSS
// custom property name is a presentation fact, not recipe mathematics.
//
// The rule: take each recipe's earliest createdAt across its own
// versions, order the recipes by that date ascending with a null date
// last (the same tie-break shape domain/lineage.js's sortedVersions
// already applies, mirrored here for ascending order), break ties by
// comparing recipeId as a string so the result can never depend on input
// order, and deal the nth recipe in that order hue n % RECIPE_HUE_COUNT.
//
// An ordered deal is used instead of a hash of recipeId for one reason:
// route.md § 3 binds "two recipes may not share a colour while both are
// on the shelf", and a hash collides where a deal does not. Because
// createdAt is never retaken (see saveOverVersion in domain/lineage.js)
// and a new recipe's date is always later than every stored one, the
// order is append-only: an arriving recipe takes the next hue and moves
// nobody.
//
// The colour is computed and stored NOWHERE — no field on a recipe or a
// version, no migration, nothing to import or export. route.md § 5
// leaves how a colour is assigned and changed open, so this is the
// deterministic default, not the settled answer. Past RECIPE_HUE_COUNT
// recipes the deal repeats a hue, which is the point at which that open
// decision has to be taken.

export const RECIPE_HUE_COUNT = 12;

// null sorts last — the same shape sortedVersions already applies to a
// descending sort, mirrored here for the ascending order this module
// needs.
function compareCreatedAtAscending(a, b) {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

/**
 * recipeHueByRecipeId(versions) -> a Map from recipeId to a hue token
 * NAME string, e.g. "--recipe-hue-03" — never a colour value.
 */
export function recipeHueByRecipeId(versions) {
  const earliestByRecipe = new Map();
  for (const version of versions) {
    const current = earliestByRecipe.get(version.recipeId);
    if (current === undefined || compareCreatedAtAscending(version.createdAt, current) < 0) {
      earliestByRecipe.set(version.recipeId, version.createdAt);
    }
  }

  const ordered = [...earliestByRecipe.entries()].sort(([recipeIdA, dateA], [recipeIdB, dateB]) => {
    const dateCompare = compareCreatedAtAscending(dateA, dateB);
    if (dateCompare !== 0) return dateCompare;
    if (recipeIdA === recipeIdB) return 0;
    return recipeIdA < recipeIdB ? -1 : 1;
  });

  const hueByRecipeId = new Map();
  ordered.forEach(([recipeId], index) => {
    const hueNumber = String((index % RECIPE_HUE_COUNT) + 1).padStart(2, '0');
    hueByRecipeId.set(recipeId, `--recipe-hue-${hueNumber}`);
  });
  return hueByRecipeId;
}
