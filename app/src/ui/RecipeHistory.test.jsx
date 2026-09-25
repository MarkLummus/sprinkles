import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { RecipeHistory } from './RecipeHistory.jsx';

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'recipe-1',
    versionLabel: 'Original plan',
    createdAt: '2026-07-01T00:00:00.000Z',
    parentVersionId: null,
    parentVersionLabel: null,
    reason: null,
    citedBatchId: null,
    ...overrides,
  };
}

function makeBatch(overrides = {}) {
  return {
    id: 'b1',
    versionId: 'v1',
    churn: { churnDate: '2026-08-02', nextTimeNote: null, ...overrides.churn },
    ...overrides,
  };
}

function renderHistory(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <RecipeHistory versions={[]} recipeId="recipe-1" currentVersionId="v1" allBatches={[]} {...props} />
    </MemoryRouter>,
  );
}

describe('RecipeHistory — the dated rail (03.5-05, sketch 011 decision 4)', () => {
  const root = makeVersion();
  const successor = makeVersion({
    id: 'v2',
    versionLabel: 'less oil',
    createdAt: '2026-09-20T00:00:00.000Z',
    parentVersionId: 'v1',
    parentVersionLabel: root.versionLabel,
  });

  it('renders a labelled section, a caption, a hint, and an ordered list of nodes', () => {
    const batch = makeBatch();
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [batch],
    });
    expect(markup).toContain('aria-label="History"');
    expect(markup).toContain('class="notebook-caption">History<');
    expect(markup).toContain('notebook-history__hint');
    expect(markup.match(/<li class="notebook-history__node/g)).toHaveLength(2);
  });

  it('renders exactly one link — the version not in view — with an explicit tabindex and the Notebook address', () => {
    const batch = makeBatch();
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [batch],
    });
    const tags = markup.match(/<a\b[^>]*>/g) ?? [];
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain('href="/notebook/recipe-1/v1"');
    expect(tags[0]).toContain('tabindex="0"');
  });

  it('marks the in-view node with aria-current and the in-view mark class, and leaves the other node unmarked', () => {
    const batch = makeBatch();
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [batch],
    });
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('notebook-history__mark--in-view');
  });

  it('renders no links at all while a pen is open', () => {
    const batch = makeBatch();
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [batch],
      openPen: 'plan',
    });
    expect(markup).not.toContain('<a ');
  });

  it('renders no version belonging to a different recipeId', () => {
    const other = makeVersion({ id: 'other', recipeId: 'recipe-2', versionLabel: 'Elsewhere' });
    const markup = renderHistory({ versions: [root, other], currentVersionId: 'v1', allBatches: [] });
    expect(markup).not.toContain('Elsewhere');
    expect(markup.match(/<li class="notebook-history__node/g)).toHaveLength(1);
  });
});
