import { CatalogContext } from './CatalogContext.jsx';
import { SEED_CATALOG } from '../data/seed-catalog.js';

// Test-only: a CatalogContext.Provider over the seed catalog, so a component
// under test reads its scales and problems without a store (the
// sheetPages.fixtures.js precedent). Nothing in the app imports this file.
export function CatalogFixture({ children, catalog = SEED_CATALOG, reloadCatalog = async () => {} }) {
  return <CatalogContext.Provider value={{ catalog, reloadCatalog }}>{children}</CatalogContext.Provider>;
}
