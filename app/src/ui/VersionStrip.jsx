import { Link } from 'react-router';
import { sortedVersions, versionsForRecipe } from '../domain/lineage.js';

// Every version of the recipe, in creation order, one link away
// (route-recipe-version.md § 3, "Lineage, the strip, and what changed").
// Modelled on RecipeList.jsx's list-of-links-over-an-array shape. The
// order is always sortedVersions(versionsForRecipe(...)) — creation
// order, most recently created first — never the store's own key order
// and never a sort of its own.
export function VersionStrip({ versions, recipeId, currentId, versionIdsWithBatches }) {
  const ordered = sortedVersions(versionsForRecipe(versions, recipeId));

  // A strip of one is not a strip (route-recipe-version.md § 3).
  if (ordered.length <= 1) return null;

  return (
    <nav className="version-strip" aria-label="Version strip">
      <p className="region-name">Version strip</p>
      <ul className="version-strip__list">
        {ordered.map((version) => {
          const isCurrent = version.id === currentId;
          const churned = versionIdsWithBatches.has(version.id);
          return (
            <li
              key={version.id}
              className={isCurrent ? 'version-strip__item is-current' : 'version-strip__item'}
            >
              <Link to={`/recipe/${version.id}`}>{version.versionLabel}</Link>
              {/* D-21: the word only, no count. */}
              {churned && <span className="version-strip__churned">churned</span>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
