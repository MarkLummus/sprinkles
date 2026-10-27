// Pure path builders for the Notebook route form (03.5-CONTEXT.md D-14 to
// D-17). No React, no store — see notebookPaths.js's own header comment.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  notebookPath,
  printPath,
  editPath,
  legacyRecipePath,
  latestVersionPath,
  NOTEBOOK_PLACE_PATH,
  NEW_RECIPE_PATH,
} from './notebookPaths.js';
import { oliveOilVersion } from '../data/olive-oil.js';

describe('notebookPath — the one address builder every recipe link uses (D-17)', () => {
  it('builds /notebook/:recipeId/:versionId with no batch argument', () => {
    expect(notebookPath('olive-oil-ice-cream', 'olive-oil-ice-cream-v1')).toBe(
      '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1',
    );
  });

  it('appends /batch/:batchId when a third argument is given', () => {
    expect(notebookPath('olive-oil-ice-cream', 'olive-oil-ice-cream-v1', 'b1')).toBe(
      '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b1',
    );
  });

  it('encodes each segment with encodeURIComponent, never trusting a stored id as a literal path segment (T-03.5-06)', () => {
    expect(notebookPath('a b/c', 'x')).toBe('/notebook/a%20b%2Fc/x');
  });
});

describe('printPath — the print route address (D-04; research C8)', () => {
  it('builds /notebook/:recipeId/:versionId/print', () => {
    expect(printPath('olive-oil-ice-cream', 'olive-oil-ice-cream-v1')).toBe(
      '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/print',
    );
  });

  it('encodes each segment, so a stored id holding / cannot change the path shape (T-04-15)', () => {
    expect(printPath('a b/c', 'x')).toBe('/notebook/a%20b%2Fc/x/print');
    expect(printPath('a/b', 'c/d').split('/')).toEqual(['', 'notebook', 'a%2Fb', 'c%2Fd', 'print']);
  });

  it('keeps a .. segment a single segment: it adds no separator of its own', () => {
    expect(printPath('..', 'v').split('/')).toEqual(['', 'notebook', '..', 'v', 'print']);
    expect(printPath('r', '../x').split('/')).toEqual(['', 'notebook', 'r', '..%2Fx', 'print']);
  });
});

describe('editPath — the edit route address (Phase 11 D-01)', () => {
  it('builds /notebook/:recipeId/:versionId/edit', () => {
    expect(editPath('olive-oil-ice-cream', 'olive-oil-ice-cream-v1')).toBe(
      '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/edit',
    );
  });

  it('encodes each segment, so a stored id holding / cannot change the path shape (T-11-12)', () => {
    expect(editPath('a b', 'c/d')).toBe('/notebook/a%20b/c%2Fd/edit');
    expect(editPath('a/b', 'c/d').split('/')).toEqual(['', 'notebook', 'a%2Fb', 'c%2Fd', 'edit']);
    expect(editPath('..', 'v').split('/')).toEqual(['', 'notebook', '..', 'v', 'edit']);
  });
});

describe('legacyRecipePath — the /recipe/:id redirect target (D-16)', () => {
  it('resolves a version to its own Notebook address with no batch', () => {
    expect(legacyRecipePath(oliveOilVersion, null)).toBe(
      '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1',
    );
  });

  it('appends the batch id when one is given', () => {
    expect(legacyRecipePath(oliveOilVersion, 'b1')).toBe(
      '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b1',
    );
  });

  it('returns null for a missing version — undefined or null — rather than throwing', () => {
    expect(legacyRecipePath(undefined, null)).toBeNull();
    expect(legacyRecipePath(null, 'b1')).toBeNull();
  });

  it('never returns a path starting with /recipe/ (T-03.5-08)', () => {
    expect(legacyRecipePath(oliveOilVersion, 'b1')).not.toMatch(/^\/recipe\//);
    expect(legacyRecipePath(undefined, null)).toBeNull();
  });
});

describe('latestVersionPath — the /notebook/:recipeId landing target (D-14)', () => {
  it('returns the Notebook address of the newest version for that recipeId', () => {
    const versions = [
      { ...oliveOilVersion, id: 'old', recipeId: 'olive-oil-ice-cream', createdAt: '2026-01-01T00:00:00.000Z' },
      { ...oliveOilVersion, id: 'new', recipeId: 'olive-oil-ice-cream', createdAt: '2026-02-01T00:00:00.000Z' },
    ];
    expect(latestVersionPath(versions, 'olive-oil-ice-cream')).toBe('/notebook/olive-oil-ice-cream/new');
  });

  it('returns null when the recipeId has no versions', () => {
    expect(latestVersionPath([], 'nothing-here')).toBeNull();
  });
});

// D-14 (03.5-02 Task 2): router.jsx cannot be rendered in the node harness
// (createBrowserRouter needs `document`) — pinned on source text, the same
// idiom RecipePage.test.jsx's own router-source describe uses.
describe('router.jsx routes /notebook/:recipeId to NotebookLatestRedirect (03.5-02 D-14)', () => {
  const routerPath = fileURLToPath(new URL('../router.jsx', import.meta.url));
  const routerSource = readFileSync(routerPath, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  it("routes '/notebook/:recipeId' to NotebookLatestRedirect", () => {
    expect(routerSource).toMatch(
      /\{\s*path:\s*'\/notebook\/:recipeId',\s*Component:\s*NotebookLatestRedirect\s*\}/,
    );
  });

  it("declares '/notebook/new' before '/notebook/:recipeId' so 'new' is never a recipe id (Phase 10 D-01)", () => {
    const newAt = routerSource.indexOf("{ path: '/notebook/new', Component: CreationRoute }");
    const recipeAt = routerSource.indexOf("'/notebook/:recipeId'");
    expect(newAt).toBeGreaterThan(-1);
    expect(recipeAt).toBeGreaterThan(-1);
    expect(newAt).toBeLessThan(recipeAt);
    expect(NEW_RECIPE_PATH).toBe('/notebook/new');
    expect(NOTEBOOK_PLACE_PATH).toBe('/notebook');
  });
});
