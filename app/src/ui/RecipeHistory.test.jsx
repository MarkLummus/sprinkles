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
      <RecipeHistory
        versions={[]}
        recipeId="recipe-1"
        currentVersionId="v1"
        allBatches={[]}
        belowDesktop={false}
        {...props}
      />
    </MemoryRouter>,
  );
}

const root = makeVersion();
const successor = makeVersion({
  id: 'v2',
  versionLabel: 'less oil',
  createdAt: '2026-09-20T00:00:00.000Z',
  parentVersionId: 'v1',
  parentVersionLabel: root.versionLabel,
});

// 03.5-18 Task 1 (decision 19): History folds like every other section from
// two entries. From 1366 (belowDesktop=false) it is the horizontal rail,
// wrapped in a FoldRow whose count reads the bare count. Below 1366
// (belowDesktop=true) it is UprightRail (plan 17), latest first, wrapped in
// the same FoldRow reading the bare count. RecipeHistory takes
// belowDesktop as a prop now (decisions_recorded 3) rather than calling
// useBelowDesktop itself, so these tests can render both arrangements.
describe('RecipeHistory — two or more versions fold (03.5-18 Task 1, decision 19)', () => {
  it('belowDesktop false: FoldRow reads open/Hide and the bare count; the rail carries id fold-history; exactly 1 link with tabindex 0', () => {
    const batch = makeBatch();
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [batch],
      belowDesktop: false,
    });
    expect(markup).toContain('aria-label="History"');
    expect(markup).toContain('aria-controls="fold-history"');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('>Hide<');
    const foldButton = markup.match(/<button[^>]*aria-controls="fold-history"[^>]*>[\s\S]*?<\/button>/)[0];
    expect(foldButton).toMatch(/<span class="fold-row__count">2 versions<\/span>/);
    expect(foldButton).not.toContain('·');
    expect(markup).toContain('id="fold-history"');
    const tags = markup.match(/<a\b[^>]*>/g) ?? [];
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain('href="/notebook/recipe-1/v1"');
    expect(tags[0]).toContain('tabindex="0"');
  });

  // 03.5-24 (G-03.5-5): the track and the node list sit in one strip as wide
  // as its content, so the track can run from the first mark's centre to the
  // last one's instead of across the whole rail.
  it('belowDesktop false: the rail holds one strip, the track first and then the node list, and no fade at rest', () => {
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [makeBatch()],
      belowDesktop: false,
    });
    expect(markup).toMatch(
      /<div class="notebook-history__rail" id="fold-history"><div class="notebook-history__strip" style="--app-notebook-history-count:2"><div class="notebook-history__track" aria-hidden="true"><\/div><ol class="notebook-history__nodes">/,
    );
    expect(markup).toMatch(/<\/ol><\/div><\/div>/);
    expect(markup).not.toContain('notebook-history__fade');
    expect((markup.match(/notebook-history__strip/g) ?? []).length).toBe(1);
  });

  it('belowDesktop true: FoldRow reads closed/Show and the bare count; the upright list is hidden, latest first; exactly 1 link with tabindex 0', () => {
    const batch = makeBatch();
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [batch],
      belowDesktop: true,
    });
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('>Show<');
    expect(markup).toMatch(/>2 versions<\/span>/);
    expect(markup).toContain('<ol id="fold-history"');
    expect(markup).toContain('class="notebook-upright"');
    expect(markup).toMatch(/\shidden(=""|\s|>)/);
    const secondIdx = markup.indexOf('Version 2');
    const firstIdx = markup.indexOf('Version 1');
    expect(secondIdx).toBeGreaterThan(-1);
    expect(firstIdx).toBeGreaterThan(secondIdx);
    const tags = markup.match(/<a\b[^>]*>/g) ?? [];
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain('tabindex="0"');
  });

  it('renders no links at all while a pen is open, in either arrangement', () => {
    const batch = makeBatch();
    for (const belowDesktop of [false, true]) {
      const markup = renderHistory({
        versions: [root, successor],
        currentVersionId: 'v2',
        allBatches: [batch],
        belowDesktop,
        openPen: 'plan',
      });
      expect(markup).not.toContain('<a ');
    }
  });

  it('filters out a version belonging to a different recipeId, keeping the fold at two own-recipe entries', () => {
    const other = makeVersion({ id: 'other', recipeId: 'recipe-2', versionLabel: 'Elsewhere' });
    const markup = renderHistory({
      versions: [root, successor, other],
      currentVersionId: 'v1',
      allBatches: [],
    });
    expect(markup).not.toContain('Elsewhere');
    expect(markup).toContain('2 versions');
  });

  // D-13: the draft node shows only while the pen is open, from memory —
  // 03.5-05 Task 2, unchanged by this plan's own rework.
  it('appends a draft node reading "draft" while the pen is open, with no link and a count that includes it', () => {
    const draft = { label: 'less oil', createdAt: '2026-09-20T10:00:00.000Z' };
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [],
      openPen: 'plan',
      draft,
    });
    expect(markup).not.toContain('<a ');
    expect(markup).toContain('3 versions');
    expect(markup).toContain('draft');
  });

  it('renders no draft node when openPen is null, even with a draft object passed', () => {
    const draft = { label: 'less oil', createdAt: '2026-09-20T10:00:00.000Z' };
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      allBatches: [],
      openPen: null,
      draft,
    });
    expect(markup).not.toContain('draft');
    expect(markup).toContain('2 versions');
  });
});

// 03.5-18 Task 2 (decisions_recorded 1): one entry — a lone saved version,
// no draft — reads as one plain line: no fold, no rail, no link
// (versions-1-vs-many.html's picked panel).
describe('RecipeHistory — exactly one entry reads one plain line (03.5-18 Task 2, decision 19)', () => {
  it('renders the History caption over "Only this version so far", with no fold-history, no link and no rail class', () => {
    const markup = renderHistory({
      versions: [root],
      currentVersionId: 'v1',
      allBatches: [],
    });
    expect(markup).toContain('class="notebook-caption">History<');
    expect(markup).toContain('Only this version so far');
    expect(markup).not.toContain('fold-history');
    expect(markup).not.toContain('<a ');
    expect(markup).not.toContain('notebook-history__rail');
    expect(markup).not.toContain('notebook-upright');
  });

  it('with the pen open and a draft, one saved version becomes two entries and the fold appears (decisions_recorded 1)', () => {
    const draft = { label: 'less oil', createdAt: '2026-09-20T10:00:00.000Z' };
    const markup = renderHistory({
      versions: [root],
      currentVersionId: 'v1',
      allBatches: [],
      openPen: 'plan',
      draft,
    });
    expect(markup).not.toContain('Only this version so far');
    expect(markup).toContain('fold-history');
    expect(markup).toContain('2 versions');
  });
});

describe('RecipeHistory — exact link counts at three versions (03.5-18 Task 2)', () => {
  const third = makeVersion({
    id: 'v3',
    versionLabel: 'more salt',
    createdAt: '2026-09-25T00:00:00.000Z',
    parentVersionId: 'v2',
    parentVersionLabel: successor.versionLabel,
  });

  it('upright gives exactly 2 links, each with tabindex 0', () => {
    const markup = renderHistory({
      versions: [root, successor, third],
      currentVersionId: 'v3',
      allBatches: [],
      belowDesktop: true,
    });
    const tags = markup.match(/<a\b[^>]*>/g) ?? [];
    expect(tags).toHaveLength(2);
    expect(tags.every((tag) => tag.includes('tabindex="0"'))).toBe(true);
  });

  it('horizontal gives exactly 2 links, each with tabindex 0', () => {
    const markup = renderHistory({
      versions: [root, successor, third],
      currentVersionId: 'v3',
      allBatches: [],
      belowDesktop: false,
    });
    const tags = markup.match(/<a\b[^>]*>/g) ?? [];
    expect(tags).toHaveLength(2);
    expect(tags.every((tag) => tag.includes('tabindex="0"'))).toBe(true);
  });

  it('renders no links at all while any pen is open, in either arrangement', () => {
    for (const belowDesktop of [false, true]) {
      const markup = renderHistory({
        versions: [root, successor, third],
        currentVersionId: 'v3',
        allBatches: [],
        belowDesktop,
        openPen: 'amend',
      });
      expect(markup).not.toContain('<a ');
    }
  });
});

// 261001-den: the track's length is arithmetic from the entry count
// (notebook.css), so the strip carries the count, the draft node included, as
// an inline custom property. Pinned exactly on the strip's own opening tag.
describe("RecipeHistory: the rail's entry count (261001-den)", () => {
  const third = makeVersion({
    id: 'v3',
    versionLabel: 'more salt',
    createdAt: '2026-09-25T00:00:00.000Z',
    parentVersionId: 'v2',
    parentVersionLabel: successor.versionLabel,
  });
  const stripTag = (markup) => markup.match(/<div class="notebook-history__strip"[^>]*>/)?.[0];

  it('two entries put the count 2 on the strip', () => {
    const markup = renderHistory({ versions: [root, successor], currentVersionId: 'v2' });
    expect(stripTag(markup)).toBe('<div class="notebook-history__strip" style="--app-notebook-history-count:2">');
  });

  it('three saved versions put the count 3 on the strip', () => {
    const markup = renderHistory({ versions: [root, successor, third], currentVersionId: 'v3' });
    expect(stripTag(markup)).toBe('<div class="notebook-history__strip" style="--app-notebook-history-count:3">');
  });

  it('two saved versions and a draft put the count 3 on the strip: the draft node is an entry', () => {
    const draft = { label: 'less oil', createdAt: '2026-09-20T10:00:00.000Z' };
    const markup = renderHistory({
      versions: [root, successor],
      currentVersionId: 'v2',
      openPen: 'plan',
      draft,
    });
    expect(stripTag(markup)).toBe('<div class="notebook-history__strip" style="--app-notebook-history-count:3">');
  });

  it('the upright arrangement and the lone-version line carry no count', () => {
    const upright = renderHistory({ versions: [root, successor], currentVersionId: 'v2', belowDesktop: true });
    expect(upright).not.toContain('--app-notebook-history-count');
    const lone = renderHistory({ versions: [root], currentVersionId: 'v1' });
    expect(lone).not.toContain('--app-notebook-history-count');
  });
});
