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
import { library } from '../data/library.js';
import { blankCreateDraft } from '../domain/draft.js';
import { creationSheetVersion } from '../domain/creation.js';

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

// The creation Sheet (Phase 10, T-01, D-08a): the shared Sheet in mode creating
// over a version-shaped create draft, no baseline, no stored version.
describe('RecipeSheet in creating mode (T-01, D-08a)', () => {
  const records = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));
  const draftOf = (extra = {}) => ({ ...blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' }), ...extra });
  const rowDraft = (grams) =>
    draftOf({ rows: [{ id: 'row-a', libraryId: 'wholeMilk', portions: [{ step: 1, grams }] }] });

  function renderCreating(draft, beforeAct = <button type="button" className="test-before-act">add here</button>, extra = {}) {
    const version = creationSheetVersion(draft, records);
    const view = sheetView({
      version,
      baseline: null,
      mode: 'creating',
      penDraft: null,
      parentVersion: null,
      showingChanges: false,
      batches: [],
      batchId: undefined,
    });
    return renderToStaticMarkup(
      <MemoryRouter>
        <RecipeSheet view={view} version={version} mode="creating" penDraft={null} beforeAct={beforeAct} {...extra} />
      </MemoryRouter>,
    );
  }

  it('draws the article with its Instructions region, and Before you start with its heading row holding the act it is given', () => {
    const markup = renderCreating(draftOf());
    expect(markup).toContain('<article class="recipe-page">');
    const section = markup.slice(markup.indexOf('<section class="before-region"'), markup.indexOf('</section>', markup.indexOf('<section class="before-region"')));
    expect(section).toContain('<div class="mk-head-row"><h2 class="region-name">Before you start</h2><button type="button" class="test-before-act">add here</button></div>');
    expect(section).not.toContain('authored__notes');
  });

  it('draws the Instructions region and no step head or Sheet code', () => {
    const markup = renderCreating(draftOf());
    expect(markup).toContain('<section class="method-region" aria-label="Instructions">');
    expect(markup).not.toContain('ingredient-table__step-head');
    expect(markup).not.toContain('Sheet code');
  });

  it('gives the Ingredients and Instructions regions the heading rows it is given, and the Instructions slot in place of Method', () => {
    const markup = renderCreating(draftOf(), undefined, {
      ingredientsAct: <button type="button" className="test-ingredients-act">add</button>,
      creationMethod: <p className="test-creation-method">steps here</p>,
    });
    const ingredients = markup.slice(markup.indexOf('<section class="ingredient-table-region"'));
    expect(ingredients).toContain('<div class="mk-head-row"><h2 class="region-name">Ingredients</h2><button type="button" class="test-ingredients-act">add</button></div>');
    const method = markup.slice(markup.indexOf('<section class="method-region"'));
    expect(method).toContain('<p class="test-creation-method">steps here</p>');
    expect(method).not.toContain('method-steps');
  });

  it('reads the name as the h1 and draws no headnote prose for an empty or blank description', () => {
    const markup = renderCreating(draftOf());
    expect(markup).toContain('<h1>Vanilla</h1>');
    expect(markup).not.toContain('headnote__prose');
    expect(renderCreating(draftOf({ description: '   ' }))).not.toContain('headnote__prose');
  });

  it('draws a written description as prose', () => {
    expect(renderCreating(draftOf({ description: 'Plain and cold.' }))).toContain('<p class="headnote__prose">Plain and cold.</p>');
  });

  it('draws no Balance region with no rows, nor with one row at no grams', () => {
    expect(renderCreating(draftOf())).not.toContain('side-region');
    expect(renderCreating(rowDraft(''))).not.toContain('side-region');
  });

  it('draws the Balance region once a row has grams, with every graduated rule off the tab order', () => {
    const markup = renderCreating(rowDraft('600'));
    expect(markup).toContain('class="side-region"');
    const rules = markup.match(/<button[^>]*class="graduated-rule"[^>]*>/g) ?? [];
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) expect(rule).toContain('tabindex="-1"');
  });

  const creationRowsOf = (grams) => ({
    gramsByLine: new Map([['row-a:0', grams]]),
    focusLine: null,
    onChangeGrams() {},
    onBlurGrams() {},
    onRemoveRow() {},
  });

  it('draws ingredientsFoot as the last child of the ingredient-table-region', () => {
    const markup = renderCreating(rowDraft('600'), null, {
      creationRows: creationRowsOf('600'),
      ingredientsFoot: <p className="test-ingredients-foot">add ingredient here</p>,
    });
    const start = markup.indexOf('<section class="ingredient-table-region"');
    const section = markup.slice(start, markup.indexOf('</section>', start));
    expect(section.endsWith('<p class="test-ingredients-foot">add ingredient here</p>')).toBe(true);
    expect(section.indexOf('</table>')).toBeLessThan(section.indexOf('test-ingredients-foot'));
  });

  it('draws a creating row from creationRows: the raw grams in one field, one remove, no struck value', () => {
    const markup = renderCreating(rowDraft('60'), null, { creationRows: creationRowsOf('60') });
    expect(markup.match(/<input[^>]*aria-label="Whole milk, 3.5% fat, grams"[^>]*>/g)).toHaveLength(1);
    expect(markup).toMatch(/<input[^>]*aria-label="Whole milk, 3.5% fat, grams"[^>]*value="60"/);
    expect(markup.match(/>remove<\/button>/g)).toHaveLength(1);
    expect(markup).not.toContain('restore');
    expect(markup).not.toContain('struck-value');
    expect(markup).not.toContain('ingredient-table__step-head');
    expect(markup.match(/<tbody/g)).toHaveLength(1);
  });

  it('draws a creating row with an empty field when the maker has typed nothing', () => {
    const markup = renderCreating(rowDraft(''), null, { creationRows: creationRowsOf('') });
    expect(markup).toMatch(/<input[^>]*aria-label="Whole milk, 3.5% fat, grams"[^>]*value=""/);
    expect(markup).toContain('aria-label="Whole milk, 3.5% fat, 0 g, estimated"');
  });

  it('shows a note holding angle brackets escaped, in a field and in a reading Sheet', () => {
    const draft = draftOf({ beforeYouStart: [{ text: '<b>Bold</b>' }] });
    const creating = renderCreating(draft);
    expect(creating).toContain('&lt;b&gt;Bold&lt;/b&gt;');
    expect(creating).not.toContain('<b>Bold</b>');
    const version = creationSheetVersion(draft, records);
    const view = sheetView({ version, baseline: null, mode: 'reading', penDraft: null, parentVersion: null, showingChanges: false, batches: [], batchId: undefined });
    const reading = renderToStaticMarkup(
      <MemoryRouter>
        <RecipeSheet view={view} version={version} mode="reading" penDraft={null} />
      </MemoryRouter>,
    );
    expect(reading).toContain('&lt;b&gt;Bold&lt;/b&gt;');
    expect(reading).not.toContain('<b>Bold</b>');
  });
});
