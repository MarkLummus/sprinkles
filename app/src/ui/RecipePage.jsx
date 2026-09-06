import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { IngredientTable } from './IngredientTable.jsx';
import { Method } from './Method.jsx';
import { Authored } from './Authored.jsx';

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. The formulation note and the advisory slot in the
// margin render nothing visible until the plans that fill them land — no
// placeholder text.
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
        <p className="region-name">Headnote</p>
        <h1>{version.recipeName}</h1>
        <p className="headnote__version">{version.versionLabel}</p>
        <p className="headnote__prose">{version.headnote}</p>
      </header>

      <section className="ingredient-table-region" aria-label="Ingredient table">
        <h2 className="region-name">Ingredient table</h2>
        {hasRows ? <IngredientTable rows={version.rows} /> : <p>This version has no ingredient rows.</p>}
      </section>

      <section className="formulation-note-region" aria-label="Formulation note" />

      <section className="method-region" aria-label="Method">
        <Method steps={version.method} />
      </section>

      <aside className="margin-region" aria-label="Margin">
        <p className="region-name">Margin</p>
        <Authored carriedForward={version.authored.carriedForward} beforeYouStart={version.authored.beforeYouStart} />
        <div className="advisory-slot" aria-label="Advisories" />
      </aside>
    </article>
  );
}
