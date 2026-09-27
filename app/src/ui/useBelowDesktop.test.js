// Contract test for useBelowDesktop.js's own exports. In the existing
// house style: no jsdom, no testing-library — this file's hooks are only
// otherwise exercised indirectly, through the components that call them
// (RecipeHistory.jsx for useBelowDesktop, BatchRow.jsx for
// useLogBesideSheet), since neither hook has a component of its own to
// render standalone under Vitest's node environment.
import { describe, it, expect } from 'vitest';
import { BELOW_DESKTOP_QUERY, useBelowDesktop, LOG_BESIDE_SHEET_QUERY, useLogBesideSheet } from './useBelowDesktop.js';

describe('useBelowDesktop.js — the two below-desktop queries (03.5-05 Task 2, 03.5-07 Task 3)', () => {
  it('exports BELOW_DESKTOP_QUERY and useBelowDesktop unchanged', () => {
    expect(BELOW_DESKTOP_QUERY).toBe('(max-width: 1499.98px)');
    expect(typeof useBelowDesktop).toBe('function');
  });

  // Sketch 011 decision 16: the log sits beside the Sheet from 1366 up —
  // 224 side nav + 3 x 32 gutters + the Sheet's two-column minimum 696 +
  // the log's own 350 — expressed here as a min-width so a
  // log-beside-Sheet reading matches true, not the below-desktop sense
  // the other query takes. The complement of notebook.css's own
  // log-below block, (max-width: 1365.98px).
  it('exports LOG_BESIDE_SHEET_QUERY at the 1366px rung and useLogBesideSheet as a function', () => {
    expect(LOG_BESIDE_SHEET_QUERY).toBe('(min-width: 1366px)');
    expect(typeof useLogBesideSheet).toBe('function');
  });
});
