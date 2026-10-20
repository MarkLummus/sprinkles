import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// A page notice for the routes other than the recipe route (Phase 10, D-10a).
// The recipe route keeps its own anchor in router.jsx (RecipePageForRoute); the
// Notebook and the creation editor use this one, with the same classes
// (.page-status-anchor, .page-status), so the same rules draw it.

// A registrar: given a page's announce function it returns a release function
// or nothing. The default does nothing; the Shell provides a real one so it
// can say something through whichever page is on screen.
export const PageNoticeContext = createContext(() => undefined);

// [message, announce]. announce(text, { persist }) sets the message and, unless
// persist, clears it after 5 s only if it is still the same message (the rule
// RecipePageForRoute's announcePageStatus follows). The timer is cleared on
// unmount, and announce is registered with the context's registrar for as long
// as the page is mounted.
export function usePageNotice() {
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);
  const register = useContext(PageNoticeContext);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const announce = useCallback((text, { persist = false } = {}) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(text);
    if (text && !persist) {
      timerRef.current = setTimeout(() => {
        setMessage((current) => (current === text ? '' : current));
      }, 5000);
    }
  }, []);

  useEffect(() => {
    const release = register(announce);
    return typeof release === 'function' ? release : undefined;
  }, [register, announce]);

  return [message, announce];
}

// Rendered before the page's own root, never inside it, so the notice sits in
// the same place on every branch of the page.
export function PageNotice({ message }) {
  return (
    <div className="page-status-anchor">
      <p className="page-status" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
