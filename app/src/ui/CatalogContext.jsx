import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { repository } from '../store/repository.js';
import { loadCatalog } from '../store/catalog.js';

// The catalog (the core scales, the core problems, the machines and the ice
// cream styles) held once for the app (D-02). It is read at boot, by main.jsx,
// and again only when the Shell reloads it after an import (D-03a); a table
// edit shows after a reload. Components read it at the route level (the Shell,
// the print route, the recipe page) and hand it down as a catalog prop, and to
// the pure functions as an argument.
export const CatalogContext = createContext(null);

export function CatalogProvider({ initialCatalog, children }) {
  const [catalog, setCatalog] = useState(initialCatalog);
  // Rejects when the read fails; the caller (the Shell's import handler) says so.
  const reloadCatalog = useCallback(async () => {
    setCatalog(await loadCatalog(repository));
  }, []);
  const value = useMemo(() => ({ catalog, reloadCatalog }), [catalog, reloadCatalog]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

// A caller bug when there is no provider above it, so it throws (not a message
// for the maker).
export function useCatalog() {
  const value = useContext(CatalogContext);
  if (value === null) throw new Error('useCatalog must be used inside a CatalogProvider');
  return value;
}
