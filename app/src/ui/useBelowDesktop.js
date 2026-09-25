import { useEffect, useState } from 'react';

// The History rail's own below-desktop query (03.5-05 Task 2): the same
// 1499.98px rung notebook.css's own @media step already uses for the
// band/rail composition. Node-guarded (BatchRow.jsx's useBelow760, the
// same critical note): RecipeHistory's own static-markup tests run under
// Vitest's node environment (renderToStaticMarkup, no jsdom), where
// `window` does not exist — an unguarded read here would crash them.
// With no window, or no window.matchMedia, this hook answers the
// desktop arrangement and builds no listener; the real subscription
// exists only in the browser.
export const BELOW_DESKTOP_QUERY = '(max-width: 1499.98px)';

export function useBelowDesktop() {
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const [below, setBelow] = useState(() => (hasMatchMedia ? window.matchMedia(BELOW_DESKTOP_QUERY).matches : false));
  useEffect(() => {
    if (!hasMatchMedia) return undefined;
    const mediaQuery = window.matchMedia(BELOW_DESKTOP_QUERY);
    const onChange = (event) => setBelow(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [hasMatchMedia]);
  return below;
}

// Option A's own query (03.5-07 Task 3, decisions_recorded 4/Task 2
// answer): the log sits beside the Sheet at the notebook-body row's own
// 1099.98px rung and above — the record pen's frame lives in that
// narrower column whenever this is true, so it takes the narrow
// arrangement there too, not only below 759.98px. Node-guarded, the same
// critical note as useBelowDesktop above.
export const LOG_BESIDE_SHEET_QUERY = '(min-width: 1100px)';

export function useLogBesideSheet() {
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const [besideSheet, setBesideSheet] = useState(() =>
    hasMatchMedia ? window.matchMedia(LOG_BESIDE_SHEET_QUERY).matches : false,
  );
  useEffect(() => {
    if (!hasMatchMedia) return undefined;
    const mediaQuery = window.matchMedia(LOG_BESIDE_SHEET_QUERY);
    const onChange = (event) => setBesideSheet(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [hasMatchMedia]);
  return besideSheet;
}
