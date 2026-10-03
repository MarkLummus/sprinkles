import { useEffect, useState } from 'react';

// Every below-desktop fold's own query (sketch 011 decision 18, 03.5-15):
// the log's own cut, 1366 = 224 (side nav) + 3 x 32 (gutters) + 696 (the
// Sheet's two-column minimum) + 350 (the log) — the complement of
// LOG_BESIDE_SHEET_QUERY below. Node-guarded (BatchRow.jsx's
// useBelow724, the same critical note): RecipeHistory's own static-markup
// tests run under Vitest's node environment (renderToStaticMarkup, no
// jsdom), where `window` does not exist — an unguarded read here would
// crash them. With no window, or no window.matchMedia, this hook answers
// the desktop arrangement and builds no listener; the real subscription
// exists only in the browser.
export const BELOW_DESKTOP_QUERY = '(max-width: 1365.98px)';

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

// The ladder's 724 rung (sketch 011 decision 28, Mark 2026-10-02): the
// axes' per-arrangement render (BatchRow.jsx, contract "Keyboard and tab
// order") and, since sketch 011 decision 30, the recipe band's record act
// (VersionRow.jsx) both read this one cut. Moved here from BatchRow.jsx
// unchanged in behaviour. Node-guarded, the same critical note as
// useBelowDesktop above: BatchRow's and VersionRow's static-markup tests run
// under Vitest's node environment, where `window` does not exist. With no
// window, or no window.matchMedia, the hook answers the desktop arrangement
// and builds no listener; the real subscription exists only in the browser.
export const BELOW_724_QUERY = '(max-width: 723.98px)';

export function useBelow724() {
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const [below, setBelow] = useState(() => (hasMatchMedia ? window.matchMedia(BELOW_724_QUERY).matches : false));
  useEffect(() => {
    if (!hasMatchMedia) return undefined;
    const mediaQuery = window.matchMedia(BELOW_724_QUERY);
    const onChange = (event) => setBelow(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [hasMatchMedia]);
  return below;
}

// useFold(openByDefault): a fold's own open/closed state (decisions_recorded
// 2, 03.5-15) — starts at its width's default and returns to that default
// whenever the default changes, so an iPad rotation across 1366 resets the
// fold and a maker's own open/close never outlives the width it was made
// at. No storage of any kind (T-03.5-37) — this is component state only.
export function useFold(openByDefault) {
  const [open, setOpen] = useState(openByDefault);
  useEffect(() => {
    setOpen(openByDefault);
  }, [openByDefault]);
  const toggle = () => setOpen((current) => !current);
  return [open, toggle];
}

// Option A's own query (03.5-07 Task 3, decisions_recorded 4/Task 2
// answer), re-derived at sketch 011 decision 16's own cut (03.5-10 Task
// 2): the log sits beside the Sheet from 1366 up — 224 side nav + 3 x 32
// gutters + the Sheet's two-column minimum 696 + the log's own 350, the
// complement of notebook.css's own log-below block,
// (max-width: 1365.98px). The record pen's frame lives in that narrower
// column whenever this is true, so it takes the narrow arrangement there
// too, not only below 723.98px. Node-guarded, the same critical note as
// useBelowDesktop above.
export const LOG_BESIDE_SHEET_QUERY = '(min-width: 1366px)';

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
