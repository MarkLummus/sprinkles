// RecipeSheet is the Sheet Phase 10's creation editor will mount (Phase 8, cut 4,
// D-09): it takes the derived view, a version and a mode, and nothing else is
// needed. These cases mount it with no stored version, no store mock and no
// baseline, through renderToStaticMarkup in the node environment.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

// Steps and no rows: the shape that reaches RecipeSheet's own read of the draft's step changes without reaching IngredientTable.
const stepsOnly = { ...empty, id: 'v-steps-only', method: structuredClone(oliveOilVersion.method) };

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

// Source-text pin (WR-01): Test I in RecipePage.test.jsx counts the shell's two
// handleToggleShowChanges sites (VersionRow and RecipeSheet) but cannot see the
// third hop, RecipeSheet handing the prop on to IngredientsHead. D-11 keeps
// RecipePage.test.jsx to read-target edits, so the pin sits here, in the
// comment-stripped idiom of that file's describes.
describe('RecipeSheet hands Show changes on to IngredientsHead (WR-01, 261002-wn1)', () => {
  const sheetSource = readFileSync(fileURLToPath(new URL('./RecipeSheet.jsx', import.meta.url)), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  it('passes onToggleShowChanges to its one IngredientsHead tag, the third hop after VersionRow and RecipeSheet in the shell (Test I)', () => {
    expect(sheetSource.match(/<IngredientsHead\b/g)).toHaveLength(1);
    const tag = sheetSource.match(/<IngredientsHead\b[\s\S]*?\/>/)?.[0] ?? '';
    expect(tag).toContain('onToggleShowChanges={onToggleShowChanges}');
  });
});

// IngredientTable's as-made cells still read the draft in recording mode, so a
// recording Sheet with rows still needs a draft. The record pen always passes
// one, and creation never records (D-01). This case therefore has no rows and
// proves RecipeSheet's own guard only.
describe('RecipeSheet in recording mode with no draft (WR-02)', () => {
  it('steps and no rows: the Instructions draw the recording controls with no step changes', () => {
    const markup = render(stepsOnly, { baseline: null, mode: 'recording', penDraft: null });
    expect(markup).toContain('aria-label="Instructions"');
    expect(markup).toContain('Tare, pour, check.');
    expect(markup).toContain('aria-label="Step 1, skipped"');
    expect(markup).toContain('This version has no ingredient rows.');
    expect(markup).not.toContain('method-step__skipped-label');
  });
});
