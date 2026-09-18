import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { RecipeHistory, versionForest } from './RecipeHistory.jsx';

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'recipe-1',
    versionLabel: 'Original plan',
    createdAt: '2026-01-01T00:00:00.000Z',
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
    recordedAt: '2026-01-03T00:00:00.000Z',
    changed: null,
    tasting: null,
    ...overrides,
    churn: {
      churnDate: '2026-01-02',
      nextTimeNote: null,
      ...overrides.churn,
    },
  };
}

function renderHistory(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <RecipeHistory
        versions={[]}
        recipeId="recipe-1"
        currentVersionId="v1"
        allBatches={[]}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('versionForest', () => {
  it('keeps successors beneath their parent and preserves a branch', () => {
    const root = makeVersion();
    const firstChild = makeVersion({
      id: 'v2',
      versionLabel: 'First child',
      createdAt: '2026-02-01T00:00:00.000Z',
      parentVersionId: 'v1',
      parentVersionLabel: root.versionLabel,
    });
    const secondChild = makeVersion({
      id: 'v3',
      versionLabel: 'Second child',
      createdAt: '2026-03-01T00:00:00.000Z',
      parentVersionId: 'v1',
      parentVersionLabel: root.versionLabel,
    });
    const forest = versionForest([secondChild, root, firstChild]);
    expect(forest.roots.map((version) => version.id)).toEqual(['v1']);
    expect(forest.children.get('v1').map((version) => version.id)).toEqual(['v2', 'v3']);
  });

  it('keeps a version with a missing parent visible as a root', () => {
    const orphan = makeVersion({ id: 'orphan', parentVersionId: 'missing' });
    expect(versionForest([orphan]).roots).toEqual([orphan]);
  });

  it('promotes a cyclic pair to roots and drops the cycle from children, so a caller walking children terminates', () => {
    const a = makeVersion({ id: 'a', parentVersionId: 'b' });
    const b = makeVersion({ id: 'b', parentVersionId: 'a' });
    const forest = versionForest([a, b]);
    expect(forest.roots.map((version) => version.id).sort()).toEqual(['a', 'b']);
    expect(forest.children.get('a') ?? []).toEqual([]);
    expect(forest.children.get('b') ?? []).toEqual([]);
  });
});

describe('RecipeHistory', () => {
  const root = makeVersion();
  const successor = makeVersion({
    id: 'v2',
    versionLabel: 'Less oil',
    createdAt: '2026-02-01T00:00:00.000Z',
    parentVersionId: 'v1',
    parentVersionLabel: root.versionLabel,
    reason: 'Reduce the oily finish.',
    citedBatchId: 'b1',
  });

  it('presents versions as preserved plans with their batches nested beneath them', () => {
    const rootBatch = makeBatch({
      id: 'b1',
      versionId: 'v1',
      tasting: {
        tastedDate: '2026-01-03',
        note: 'Silky, but the oil lingers.',
        defects: null,
        bitterDeclared: null,
      },
      churn: { churnDate: '2026-01-02', nextTimeNote: 'Use less olive oil.' },
    });
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [rootBatch],
    });

    expect(markup.indexOf('Version 1 · Original plan')).toBeLessThan(markup.indexOf('Batch · 2 Jan 2026'));
    expect(markup.indexOf('Batch · 2 Jan 2026')).toBeLessThan(markup.indexOf('Version 2 · Less oil'));
    expect(markup).toContain('Silky, but the oil lingers.');
    expect(markup).toContain('<span>Next time</span> Use less olive oil.');
    expect(markup).toContain('Reduce the oily finish.');
    expect(markup).toContain('After batch · <a href="/recipe/v1/batch/b1"');
    expect(markup).toContain('aria-label="Versions made from Version 1 · Original plan"');
  });

  it('uses stable version and batch routes and marks the records in view', () => {
    const currentBatch = makeBatch({ id: 'b2', versionId: 'v2', churn: { churnDate: '2026-02-04' } });
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      currentBatchId: 'b2',
      allBatches: [currentBatch],
    });

    expect(markup).toContain('href="/recipe/v1"');
    expect(markup).not.toContain('href="/recipe/v2"');
    expect(markup).not.toContain('href="/recipe/v2/batch/b2"');
    expect(markup).toContain('Version 2 · Less oil<span class="history-register__marker"> · In view · Latest</span>');
    expect(markup).toContain('Batch · 4 Feb 2026<span class="history-register__marker"> · In view</span>');
  });

  it('links another batch directly and states when no tasting was recorded', () => {
    const batch = makeBatch({ id: 'b1', versionId: 'v1' });
    const markup = renderHistory({ versions: [root], currentVersionId: 'v1', allBatches: [batch] });
    expect(markup).toContain('href="/recipe/v1/batch/b1"');
    expect(markup).toContain('No tasting recorded');
  });

  it('uses recorded defects as the outcome when no tasting note exists', () => {
    const batch = makeBatch({
      tasting: {
        tastedDate: '2026-01-03',
        note: null,
        defects: ['Sandy, gritty'],
        bitterDeclared: true,
      },
    });
    const markup = renderHistory({ versions: [root], allBatches: [batch] });
    expect(markup).toContain('Sandy, gritty · Bitter');
  });

  it('suppresses navigation while a pen is open', () => {
    const batch = makeBatch();
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [batch],
      openPen: 'record',
    });
    expect(markup).not.toContain('<a ');
  });

  it('renders multiple attempts newest first and marks an older batch in view without calling it later', () => {
    const oldest = makeBatch({ id: 'oldest', churn: { churnDate: '2026-01-02' } });
    const middle = makeBatch({ id: 'middle', churn: { churnDate: '2026-01-09' } });
    const newest = makeBatch({ id: 'newest', churn: { churnDate: '2026-01-16' } });
    const markup = renderHistory({
      versions: [root],
      currentVersionId: 'v1',
      currentBatchId: 'oldest',
      allBatches: [middle, oldest, newest],
    });

    expect(markup.indexOf('Batch · 16 Jan 2026')).toBeLessThan(markup.indexOf('Batch · 9 Jan 2026'));
    expect(markup.indexOf('Batch · 9 Jan 2026')).toBeLessThan(markup.indexOf('Batch · 2 Jan 2026'));
    expect(markup.match(/<li class="recipe-history__batch/g)).toHaveLength(3);
    expect(markup).toContain('Batch · 2 Jan 2026<span class="history-register__marker"> · In view</span>');
    expect(markup).not.toMatch(/\blater\b/i);
  });

  it('uses readable unknowns for missing version, churn, tasting and cited-batch dates', () => {
    const undatedRoot = makeVersion({ createdAt: null });
    const undatedBatch = makeBatch({
      churn: { churnDate: null },
      tasting: {
        tastedDate: null,
        note: null,
        defects: null,
        bitterDeclared: null,
      },
    });
    const undatedChild = makeVersion({
      ...successor,
      createdAt: null,
      reason: '',
    });
    const markup = renderHistory({
      versions: [undatedRoot, undatedChild],
      currentVersionId: 'v1',
      allBatches: [undatedBatch],
    });

    expect((markup.match(/written date unknown/g) ?? []).length).toBe(2);
    expect(markup).toContain('Batch · date unknown');
    expect(markup).toContain('After batch · <a href="/recipe/v1/batch/b1"');
    expect(markup).toContain('Tasted date unknown');
    expect(markup).not.toContain('>Why<');
  });

  it('preserves a long multilingual authored name and exposes descriptive list names', () => {
    const longName = 'نسخة زيت الزيتون الطويلة جدًا · 冰淇淋配方 · 🍨 · '.repeat(5);
    const longVersion = makeVersion({ versionLabel: longName });
    const markup = renderHistory({ versions: [longVersion], currentVersionId: 'v1' });
    expect(markup).toContain(longName);
    expect(markup).toContain('aria-label="Recipe development history"');
    expect(markup).toContain('class="recipe-history__version-name"');
  });

  it('does not render a version belonging to a different recipeId', () => {
    const other = makeVersion({ id: 'other', recipeId: 'recipe-2', versionLabel: 'Elsewhere' });
    const markup = renderHistory({ versions: [root, other], currentVersionId: 'v1', allBatches: [] });
    expect(markup).not.toContain('Elsewhere');
    expect(markup.match(/<li class="recipe-history__version/g)).toHaveLength(1);
  });
});
