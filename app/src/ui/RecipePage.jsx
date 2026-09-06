import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { IngredientTable } from './IngredientTable.jsx';

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. Reserved regions (formulation note, method) render
// nothing visible until the plans that fill them land — no placeholder text.
export function RecipePage() {
  const { id } = useParams();
  const [version, setVersion] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    repository.getVersion(id).then((result) => {
      if (!cancelled) setVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (version === undefined) return null;
  if (version === null) return <p>No recipe found for this version.</p>;

  const hasRows = version.rows.length > 0;

  return (
    <article className="recipe-page">
      <header className="headnote">
        <h1>{version.recipeName}</h1>
        <p className="headnote__version">{version.versionLabel}</p>
        <p className="headnote__prose">{version.headnote}</p>
      </header>

      <section className="ingredient-table-region" aria-label="Ingredient table">
        {hasRows ? <IngredientTable rows={version.rows} /> : <p>This version has no ingredient rows.</p>}
      </section>

      <section className="formulation-note-region" aria-label="Formulation note" />

      <section className="method-region" aria-label="Method" />

      <aside className="margin-region" aria-label="Margin" />
    </article>
  );
}
