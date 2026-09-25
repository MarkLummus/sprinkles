// RecipeBand (D-12, 03.5-04 Task 1): the band's recipe column — the
// recipe record's name and description, and Rename edited inline, Cancel
// first then Save, saving only the recipe record through the seam. No
// version state, no penDraft, no Why. renderToStaticMarkup runs no
// effects and no interaction, so the open/blocked states are driven by
// the component's own initiallyRenaming/initialError test props, the same
// convention this file's own read_first names (VersionRow's
// versionLineBlockedAttempt/versionLineError precedent, applied here to
// state RecipeBand owns itself rather than state a parent threads down).
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RecipeBand } from './RecipeBand.jsx';
import { RECIPE_NAME_REQUIRED } from '../domain/recipe.js';

function makeRecipe(overrides = {}) {
  return { id: 'r1', name: 'Olive Oil Ice Cream, circulator', description: 'Scaled 0.8× from the 1 kg formula.', ...overrides };
}

describe('RecipeBand — closed', () => {
  it('renders an h1 with the recipe name, a paragraph with the description, one Rename button, an aria-hidden rail mark, and no "Notebook" text', () => {
    const markup = renderToStaticMarkup(<RecipeBand recipe={makeRecipe()} onSave={() => Promise.resolve()} />);
    expect(markup).toMatch(/<h1[^>]*>Olive Oil Ice Cream, circulator<\/h1>/);
    expect(markup).toContain('Scaled 0.8× from the 1 kg formula.');
    const renameButtons = markup.match(/>Rename</g) ?? [];
    expect(renameButtons).toHaveLength(1);
    expect(markup).toMatch(/aria-hidden="true"[^>]*notebook-recipe__rail/);
    expect(markup).not.toContain('Notebook');
  });

  it('omits the description paragraph when the recipe has none', () => {
    const markup = renderToStaticMarkup(<RecipeBand recipe={makeRecipe({ description: '' })} onSave={() => Promise.resolve()} />);
    expect(markup).not.toContain('notebook-recipe__description');
  });
});

describe('RecipeBand — open (Rename, D-12)', () => {
  it('renders a text field labelled Recipe name holding the name, a textarea labelled Recipe description holding the description, and Cancel then Save in DOM order', () => {
    const markup = renderToStaticMarkup(
      <RecipeBand recipe={makeRecipe()} onSave={() => Promise.resolve()} initiallyRenaming />,
    );
    expect(markup).toMatch(/aria-label="Recipe name"[^>]*value="Olive Oil Ice Cream, circulator"/);
    expect(markup).toMatch(/aria-label="Recipe description"[^>]*>Scaled 0\.8× from the 1 kg formula\.</);
    const cancelIndex = markup.indexOf('>Cancel<');
    const saveIndex = markup.indexOf('>Save<');
    expect(cancelIndex).toBeGreaterThan(-1);
    expect(saveIndex).toBeGreaterThan(cancelIndex);
  });
});

describe('RecipeBand — blocked (a blank name is refused, D-12)', () => {
  it('renders the refusal sentence and marks the name field invalid', () => {
    const markup = renderToStaticMarkup(
      <RecipeBand
        recipe={makeRecipe()}
        onSave={() => Promise.resolve()}
        initiallyRenaming
        initialError={RECIPE_NAME_REQUIRED}
      />,
    );
    expect(markup).toContain(RECIPE_NAME_REQUIRED);
    expect(markup).toMatch(/aria-label="Recipe name"[^>]*aria-invalid="true"/);
    expect(markup).toMatch(/aria-describedby="[^"]+"/);
  });
});
