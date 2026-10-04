// Contract test for useBelowDesktop.js's own exports. In the existing
// house style: no jsdom, no testing-library — this file's hooks are only
// otherwise exercised indirectly, through the components that call them
// (RecipeHistory.jsx for useBelowDesktop, BatchRow.jsx for
// useLogBesideSheet, VersionRow.jsx for useFold), since neither hook has
// a component of its own to render standalone under Vitest's node
// environment.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  BELOW_DESKTOP_QUERY,
  BELOW_724_QUERY,
  BELOW_RAIL_QUERY,
  useBelow724,
  useBelowRail,
  useBelowDesktop,
  useFold,
  LOG_BESIDE_SHEET_QUERY,
  useLogBesideSheet,
} from './useBelowDesktop.js';

describe('useBelowDesktop.js — the two below-desktop queries (03.5-05 Task 2, 03.5-07 Task 3, 03.5-15 Task 1)', () => {
  // Sketch 011 decision 18 (03.5-15): the folds' cut is 1366 — the log's
  // own cut — the complement of LOG_BESIDE_SHEET_QUERY below.
  it('exports BELOW_DESKTOP_QUERY at the 1365.98px rung and useBelowDesktop as a function', () => {
    expect(BELOW_DESKTOP_QUERY).toBe('(max-width: 1365.98px)');
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

  // decisions_recorded 2 (03.5-15): a fold's default follows the width
  // it is in — no assertion of the effect itself (no jsdom here), just
  // the contract that this hook exists and is exported.
  it('exports useFold as a function', () => {
    expect(typeof useFold).toBe('function');
  });
});

// Quick task 261002-wmz: the 724 cut had one reader (BatchRow.jsx's local
// hook); the band now reads it too, so it lives here and BatchRow imports it.
describe('useBelowDesktop.js — the 724 rung (sketch 011 decisions 28 and 30, 261002-wmz)', () => {
  it('exports BELOW_724_QUERY at the 723.98px rung and useBelow724 as a function (Test M)', () => {
    expect(BELOW_724_QUERY).toBe('(max-width: 723.98px)');
    expect(typeof useBelow724).toBe('function');
  });

  it('BatchRow.jsx imports the hook instead of declaring its own (Test M)', () => {
    const batchRowSource = readFileSync(fileURLToPath(new URL('./BatchRow.jsx', import.meta.url)), 'utf8');
    expect(batchRowSource).not.toMatch(/function useBelow724\b/);
    expect(batchRowSource).toMatch(/import\s*\{[^}]*\buseBelow724\b[^}]*\}\s*from\s*'\.\/useBelowDesktop\.js'/);
  });
});

// The rail's own cut (sketch 011 decision 33, quick 261004-ly8): 224 + 3 x 32
// + 350 + 920 = 1590, so below it the nav is the fly-out from 724.
describe('useBelowDesktop.js — the rail\'s cut (decision 33)', () => {
  it('exports BELOW_RAIL_QUERY at the 1589.98px rung and useBelowRail as a function', () => {
    expect(BELOW_RAIL_QUERY).toBe('(max-width: 1589.98px)');
    expect(typeof useBelowRail).toBe('function');
  });
});
