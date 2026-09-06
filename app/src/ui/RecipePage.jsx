import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { repository } from '../store/repository.js';
import { buildFigures } from '../domain/figures.js';
import { IngredientTable } from './IngredientTable.jsx';
import { Method } from './Method.jsx';
import { Authored } from './Authored.jsx';
import { FormulationNote } from './FormulationNote.jsx';
import { BasisNote } from './BasisNote.jsx';

// The brief's book spread, in semantic regions, each wearing its
// plain-language name. The advisory slot in the margin renders nothing
// visible until the plan that fills it lands — no placeholder text.
export function RecipePage() {
  const { id } = useParams();
  const [version, setVersion] = useState(undefined);
  // The signature trace (route-recipe.md § 3, § 5): focusing a balance
  // figure marks the ingredient rows it rests on. This page is the shared
  // parent of the figures and the table, so it is the one place the
  // focused figure's key can live.
  const [focusedFigureKey, setFocusedFigureKey] = useState(null);

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
  const figures = buildFigures(version);
  const focusedFigure = figures.find((figure) => figure.key === focusedFigureKey) ?? null;
  const markedRowIds = focusedFigure?.contributorRowIds ?? [];
  const markedFigureLabel = focusedFigure?.label ?? '';

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
        {hasRows ? (
          <IngredientTable rows={version.rows} markedRowIds={markedRowIds} markedFigureLabel={markedFigureLabel} />
        ) : (
          <p>This version has no ingredient rows.</p>
        )}
      </section>

      <section className="method-region" aria-label="Method">
        <Method steps={version.method} />
      </section>

      {/* Column two, what the sheet does not print: the formulation note
          beside the table, then the margin beneath it. One flow, so the
          method's height never separates the two. */}
      <div className="side-region">
        <section className="formulation-note-region" aria-label="Formulation note">
          <FormulationNote
            version={version}
            onFocusFigure={setFocusedFigureKey}
            onBlurFigure={() => setFocusedFigureKey(null)}
          />
          <BasisNote version={version} />
        </section>

        <aside className="margin-region" aria-label="Margin">
          <p className="region-name">Margin</p>
          <Authored carriedForward={version.authored.carriedForward} beforeYouStart={version.authored.beforeYouStart} />
          <div className="advisory-slot" aria-label="Advisories" />
        </aside>
      </div>
    </article>
  );
}
