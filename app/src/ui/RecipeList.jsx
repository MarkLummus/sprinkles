import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { repository } from '../store/repository.js';
import { computeBalance } from '../domain/composition.js';

// The arrival the brief calls "departing from the list" (D-13). One item
// per stored version: recipe name, version line, and batch mass.
export function RecipeList() {
  const [versions, setVersions] = useState(null);

  useEffect(() => {
    let cancelled = false;
    repository.listVersions().then((result) => {
      if (!cancelled) setVersions(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (versions === null) return null;

  return (
    <ul className="recipe-list">
      {versions.map((version) => {
        const balance = computeBalance(version.rows);
        return (
          <li key={version.id}>
            <Link to={`/recipe/${version.id}`}>
              <span className="recipe-list__name">{version.recipeName}</span>
              <span className="recipe-list__version">{version.versionLabel}</span>
              <span className="recipe-list__mass">{balance ? `${balance.mass.toFixed(1)} g` : 'no ingredient rows'}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
