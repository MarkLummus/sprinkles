// Pure. No framework, DOM or store import. The Ingredients place's search
// (sketch 012 "The search the board assumes", D-11), kept as simple as the
// board draws it: a name matches when it contains the typed letters in any
// case, the category matches exactly ('All' matches every category), and the
// rows that match keep A to Z order. No accent folding, no word splitting, no
// ranking. Phase 10's picker reuses it.
//
// Records are { id, entry } as repository.listLibrary() returns them. The
// store's validator guarantees entry.name is a non-empty string and nothing
// about entry.category, so a category that is not a string never matches a
// named category and never becomes a category word.

const ALL = 'All';

// Code-unit comparison, not localeCompare: the order must not move with the
// device's locale ("Whole Milk 3.3%" before "Whole milk, 3.5% fat").
function compareRecords(a, b) {
  const nameA = a.entry.name.toLowerCase();
  const nameB = b.entry.name.toLowerCase();
  if (nameA !== nameB) return nameA < nameB ? -1 : 1;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

export function filterLibrary(records, query, category) {
  const needle = query.trim().toLowerCase();
  return records
    .filter(
      (record) =>
        record.entry.name.toLowerCase().includes(needle) &&
        (category === ALL || record.entry.category === category),
    )
    .sort(compareRecords);
}

export function libraryCategories(records) {
  const words = new Set();
  for (const { entry } of records) {
    if (typeof entry.category === 'string' && entry.category.trim() !== '') words.add(entry.category);
  }
  return [...words].sort();
}
