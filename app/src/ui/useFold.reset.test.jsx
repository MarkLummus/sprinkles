// @vitest-environment jsdom
//
// WR-02 (03.5 review): useFold's own reset effect (useBelowDesktop.js,
// decisions_recorded 2, 03.5-15) — "a fold's own open/closed state...
// returns to that default whenever the default changes, so an iPad
// rotation across 1366 resets the fold" — had no assertion in `npm test`;
// the effect was only exercised by 03.5-band-probe.mjs, a manual
// Playwright script nobody runs by default. This file is the one
// exception vitest.config.js's own comment already carves out ("A future
// component test opts into a DOM per-file with a @vitest-environment
// jsdom docblock, not here") — every other suite in this repo stays
// provably DOM-free under the default node environment; only this file
// opts in, and only because a `useEffect` cannot run at all under
// renderToStaticMarkup (this repo's house style everywhere else, which
// never executes effects) — mounting through React's real render cycle is
// the only way to observe it.
//
// This proves useFold's own state machine directly, by varying
// openByDefault the same way a width crossing does (RecipePage/VersionRow
// call it as `useFold(!belowDesktop)`, where belowDesktop flips on a
// matchMedia change) — not by re-deriving useBelowDesktop's own matchMedia
// plumbing, which useFold does not depend on and already has its own
// exports-only contract test in useBelowDesktop.test.js. Per the review's
// own fix note, this only needs to prove the state machine itself,
// independent of any specific component's markup.
import { describe, it, expect } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useFold } from './useBelowDesktop.js';

describe('useFold — resets to the new default when openByDefault changes (03.5 review WR-02)', () => {
  it('starts at its default, then follows every later default change, discarding a manual toggle each time', () => {
    const state = {};
    function Harness({ openByDefault }) {
      const [open, toggle] = useFold(openByDefault);
      state.open = open;
      state.toggle = toggle;
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      // Mounts at its default.
      act(() => {
        root.render(<Harness openByDefault={true} />);
      });
      expect(state.open).toBe(true);

      // A maker's own toggle, independent of the default — nothing else
      // in this harness can change `open`, so this is the only way it
      // moves without the effect firing.
      act(() => {
        state.toggle();
      });
      expect(state.open).toBe(false);

      // Re-rendering with the SAME default (no actual change to
      // openByDefault) must not clobber the manual toggle — the effect's
      // dependency array exists precisely so a re-render alone never
      // resets an open/closed fold.
      act(() => {
        root.render(<Harness openByDefault={true} />);
      });
      expect(state.open).toBe(false);

      // The width crosses 1366 (a rotation): openByDefault actually
      // changes, true -> false. useFold's effect must fire and return
      // open to this new default.
      act(() => {
        root.render(<Harness openByDefault={false} />);
      });
      expect(state.open).toBe(false);

      // Cross back the other way, false -> true, with no toggle in
      // between: if the effect only ran once at mount (e.g. a dependency
      // array edited to `[]` by mistake — the exact regression this
      // finding names), `open` would still read false here. It must read
      // true, proving the effect re-fires on every default change, not
      // just the first.
      act(() => {
        root.render(<Harness openByDefault={true} />);
      });
      expect(state.open).toBe(true);
    } finally {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  });
});
