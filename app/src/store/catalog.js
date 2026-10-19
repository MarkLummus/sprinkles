// Reading the seed tables at boot and after an import (D-02, LIB-09). The store
// layer: it reaches IndexedDB only through the repository it is handed, and
// imports nothing from idb. The domain receives the lists this builds as
// arguments and never imports the store.

/**
 * readSeedTables(repository) -> { library, machines, styles, scales, problems },
 * each the rows of its table, read through the repository seam. IndexedDB
 * returns rows in key order (alphabetical by id), not in display order.
 */
export async function readSeedTables(repository) {
  const [library, machines, styles, scales, problems] = await Promise.all([
    repository.listLibrary(),
    repository.listMachines(),
    repository.listStyles(),
    repository.listScales(),
    repository.listProblems(),
  ]);
  return { library, machines, styles, scales, problems };
}

function byOrderThenId(a, b) {
  if (a.order !== b.order) return a.order - b.order;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * catalogFrom({ machines, styles, scales, problems }) -> { scales, problems,
 * machines, styles }, each a new array sorted by its order field and then its
 * id. This is the one sorting boundary: the domain's helpers keep the order
 * they are given and sort nothing.
 */
export function catalogFrom({ machines, styles, scales, problems }) {
  const sorted = (rows) => [...rows].sort(byOrderThenId);
  return { scales: sorted(scales), problems: sorted(problems), machines: sorted(machines), styles: sorted(styles) };
}

/** loadCatalog(repository) -> the catalog as the app holds it (D-02). */
export async function loadCatalog(repository) {
  return catalogFrom(await readSeedTables(repository));
}
