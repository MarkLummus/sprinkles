import { Link } from 'react-router';
import { sortedVersions, versionsForRecipe } from '../domain/lineage.js';

// The version list (route-recipe.md § 3 "The imprint", D-04, D-07): every
// version of the recipe, in creation order, one link away, rendered
// inside Versions.jsx rather than as its own grid row — Versions' own h2
// is the head now, and the block carries one hint sentence for
// everything (D-06), so this component prints neither. Modelled on
// RecipeList.jsx's list-of-links-over-an-array shape. The order is always
// sortedVersions(versionsForRecipe(...)) — creation order, most recently
// created first — never the store's own key order and never a sort of
// its own. A list of one version is still a list (D-09's always-a-list
// discipline, applied here too) — no early return.
export function VersionStrip({ versions, recipeId, currentId, versionIdsWithBatches, openPen = null, penReason = null }) {
  const ordered = sortedVersions(versionsForRecipe(versions, recipeId));

  return (
    <nav className="version-strip" aria-label="Version strip">
      <ul className="version-strip__list">
        {ordered.map((version) => {
          const isCurrent = version.id === currentId;
          const churned = versionIdsWithBatches.has(version.id);
          return (
            <li
              key={version.id}
              className={isCurrent ? 'version-strip__item is-current' : 'version-strip__item'}
            >
              {/* D-UAT-2: while a pen is open, the strip is not a way off
                  the page — every version's label renders as plain text
                  and the current-version class stays; Versions' own hint
                  sentence (D-06) names the pen holding it. */}
              {openPen ? version.versionLabel : <Link to={`/recipe/${version.id}`}>{version.versionLabel}</Link>}
              {/* D-21: the word only, no count. */}
              {churned && <span className="version-strip__churned">churned</span>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
