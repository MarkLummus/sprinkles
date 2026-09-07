// The one-pen interlock's own unit tests (D-10, D-UAT-1): derivePenState is
// the single derivation every opener in BatchMargin and Headnote now reads,
// replacing the two unrelated states (`mode`, `tastingDraft`) each control
// used to hand-roll its own subset of. This file renders nothing of the
// page itself — RecipePage reads the repository at module load (D-06), so
// it is stubbed here at the one seam it imports through, exactly as
// RecipeList.test.jsx already does — and the disabled markup the
// derivation feeds is asserted in BatchMargin.test.jsx and Headnote.test.jsx,
// not here.
import { describe, it, expect, vi } from 'vitest';
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { derivePenState } from './RecipePage.jsx';

describe('derivePenState — the one derivation of "a pen is open"', () => {
  it('reports the plan pen while developing', () => {
    const { openPen } = derivePenState({ mode: 'developing', amendingBatchId: null, tastingDraft: null });
    expect(openPen).toBe('plan');
  });

  it('reports the record pen while recording with no amend target', () => {
    const { openPen } = derivePenState({ mode: 'recording', amendingBatchId: null, tastingDraft: null });
    expect(openPen).toBe('record');
  });

  it('reports the amend pen while recording with an amend target', () => {
    const { openPen } = derivePenState({ mode: 'recording', amendingBatchId: 'batch-1', tastingDraft: null });
    expect(openPen).toBe('amend');
  });

  it('reports the tasting pen while reading with a tasting draft', () => {
    const { openPen } = derivePenState({ mode: 'reading', amendingBatchId: null, tastingDraft: {} });
    expect(openPen).toBe('tasting');
  });

  it('reports no pen open while reading with nothing in progress', () => {
    const { openPen, reason } = derivePenState({ mode: 'reading', amendingBatchId: null, tastingDraft: null });
    expect(openPen).toBe(null);
    expect(reason).toBe(null);
  });

  it('gives each of the four open states its own distinct, non-empty reason', () => {
    const reasons = [
      derivePenState({ mode: 'developing', amendingBatchId: null, tastingDraft: null }).reason,
      derivePenState({ mode: 'recording', amendingBatchId: null, tastingDraft: null }).reason,
      derivePenState({ mode: 'recording', amendingBatchId: 'batch-1', tastingDraft: null }).reason,
      derivePenState({ mode: 'reading', amendingBatchId: null, tastingDraft: {} }).reason,
    ];
    for (const reason of reasons) {
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    }
    expect(new Set(reasons).size).toBe(reasons.length);
  });
});
