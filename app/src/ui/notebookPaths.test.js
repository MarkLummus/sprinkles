// Pure path builders for the Notebook route form (03.5-CONTEXT.md D-14 to
// D-17). No React, no store — see notebookPaths.js's own header comment.
import { describe, it, expect } from 'vitest';
import { notebookPath, legacyRecipePath, latestVersionPath } from './notebookPaths.js';
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
