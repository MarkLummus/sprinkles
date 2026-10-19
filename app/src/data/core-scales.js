// The scales table's seed (LIB-09, D-01): the battery's six scales as literal
// rows, in the battery's order. The first four are the core group, which every
// recipe's tasting carries; Body and Oil are the declared pair a recipe may
// declare for itself. Each row is the scale definition { key, name, low, high,
// kind, group } plus id (equal to key) and order (domain/catalog.js).
//
// These rows are the only place the six scales live: the domain's AXES table was
// retired in plan 09-15, and store/seedTables.test.js pins the words as
// literals. All six are goldilocks scales (the middle is right).
export const CORE_SCALE_ROWS = [
  { id: 'hardness', key: 'hardness', name: 'Hardness', low: 'soft', high: 'hard', kind: 'goldilocks', group: 'core', order: 1 },
  { id: 'scoopability', key: 'scoopability', name: 'Scoopability', low: 'crumbly', high: 'gummy', kind: 'goldilocks', group: 'core', order: 2 },
  { id: 'smoothness', key: 'smoothness', name: 'Smoothness', low: 'grainy', high: 'smooth', kind: 'goldilocks', group: 'core', order: 3 },
  { id: 'sweetness', key: 'sweetness', name: 'Sweetness', low: 'less', high: 'more', kind: 'goldilocks', group: 'core', order: 4 },
  { id: 'body', key: 'body', name: 'Body', low: 'thin', high: 'heavy', kind: 'goldilocks', group: 'declared', order: 5 },
  { id: 'oil', key: 'oil', name: 'Oil', low: 'faint', high: 'strong', kind: 'goldilocks', group: 'declared', order: 6 },
];
