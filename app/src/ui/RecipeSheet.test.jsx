// RecipeSheet is the Sheet Phase 10's creation editor will mount (Phase 8, cut 4,
// D-09): it takes the derived view, a version and a mode, and nothing else is
// needed. These cases mount it with no stored version, no store mock and no
// baseline, through renderToStaticMarkup in the node environment.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { RecipeSheet } from './RecipeSheet.jsx';
import { sheetView } from './sheetView.js';
import { penDraftFromVersion } from '../domain/penDraft.js';
import { oliveOilVersion } from '../data/olive-oil.js';

const empty = { id: 'v-empty', recipeId: 'r-empty', rows: [], method: [], authored: { beforeYouStart: [] }, declaredAxes: [] };

// A populated version that was never stored: a clone of the olive oil version
// with a fresh id.
const inMemory = { ...structuredClone(oliveOilVersion), id: 'v-in-memory' };

function render(version, { baseline, mode, penDraft, foot }) {
  const view = sheetView({
    version,
    baseline,
    mode,
    penDraft,
    parentVersion: null,
    showingChanges: false,
    batches: [],
    batchId: undefined,
  });
  return renderToStaticMarkup(
    <MemoryRouter>
      <RecipeSheet view={view} version={version} mode={mode} penDraft={penDraft} foot={foot} />
    </MemoryRouter>,
  );
}

describe('RecipeSheet without a stored version or a baseline (D-09)', () => {
  it('reading: an empty Sheet with no sections to show, no foot and no Batch aside', () => {
    const markup = render(empty, { baseline: null, mode: 'reading', penDraft: null });
    expect(markup).toContain('class="recipe-page recipe-page--no-before recipe-page--no-method"');
    expect(markup).toContain('This version has no ingredient rows.');
    expect(markup).not.toContain('aria-label="Instructions"');
    expect(markup).not.toContain('aria-label="Before you start"');
    expect(markup).not.toContain('notebook-log');
    expect(markup).not.toContain('Save batch');
  });

  it('developing: Before you start and Instructions are drawn in the pen', () => {
    const markup = render(empty, { baseline: null, mode: 'developing', penDraft: penDraftFromVersion(empty) });
    expect(markup).toContain('aria-label="Before you start"');
    expect(markup).toContain('aria-label="Instructions"');
    expect(markup).toContain('<article class="recipe-page"');
  });

  it('renders the foot it is given, last in the article', () => {
    const markup = render(empty, {
      baseline: null,
      mode: 'reading',
      penDraft: null,
      foot: <p className="test-foot">foot here</p>,
    });
    expect(markup).toContain('foot here');
    expect(markup.indexOf('test-foot')).toBeGreaterThan(markup.indexOf('formulation-note-region'));
  });
});

describe('RecipeSheet over a populated version that was never stored, with no baseline (D-09)', () => {
  it('reading: the rows and the steps render', () => {
    const markup = render(inMemory, { baseline: null, mode: 'reading', penDraft: null });
    expect(markup).toContain('Whole milk');
    expect(markup).toContain('Tare, pour, check.');
    expect(markup).toContain('aria-label="Instructions"');
    expect(markup).not.toContain('This version has no ingredient rows.');
    expect(markup).not.toContain(', grams, portion 1"');
  });

  // Phase 10 limitation: Method's developing branch needs a baselineVersion
  // (Method.jsx 593), so with no baseline the steps cannot be edited. This pins
  // today's behaviour; Phase 10's creating mode owns the fix.
  it('developing with no baseline: the ingredient pen opens, the steps stay read-only (Phase 10 limitation)', () => {
    const markup = render(inMemory, { baseline: null, mode: 'developing', penDraft: penDraftFromVersion(inMemory) });
    expect(markup).toContain('aria-label="Whole milk, grams, portion 1"');
    expect(markup).toContain('Tare, pour, check.');
    expect(markup).not.toContain(', edit this step"');
  });

  it('developing with the version as baseline: the steps open for editing', () => {
    const markup = render(inMemory, { baseline: inMemory, mode: 'developing', penDraft: penDraftFromVersion(inMemory) });
    expect(markup).toContain(', edit this step"');
  });
});
