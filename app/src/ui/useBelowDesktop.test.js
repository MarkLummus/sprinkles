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

  // Option A (03.5-07 Task 2 answer, decisions_recorded 4): the record
  // pen's frame lives in the log column once the log sits beside the
  // Sheet — the notebook-body row's own 1100px rung (notebook.css's
  // 1099.98px step, expressed here as a min-width so a log-beside-Sheet
  // reading matches true, not the below-desktop sense the other query
  // takes).
  it('exports LOG_BESIDE_SHEET_QUERY at the 1100px rung and useLogBesideSheet as a function', () => {
    expect(LOG_BESIDE_SHEET_QUERY).toBe('(min-width: 1100px)');
    expect(typeof useLogBesideSheet).toBe('function');
  });
});
