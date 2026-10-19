// The problems table's seed (LIB-09, D-01, D-12): the battery's four core
// problems as literal rows, in the battery's order. A problem stays a word
// (09-RESEARCH A1): a tasting names it by its name, so the name is what a batch
// copies. Each row is { id, name, order }.
//
// These rows are the only place the four words live: the domain's DEFECTS list
// was retired in plan 09-15, and store/seedTables.test.js pins the words as
// literals.
export const CORE_PROBLEM_ROWS = [
  { id: 'coarse-icy', name: 'Coarse, icy', order: 1 },
  { id: 'sandy-gritty', name: 'Sandy, gritty', order: 2 },
  { id: 'gummy-elastic', name: 'Gummy, elastic', order: 3 },
  { id: 'greasy-film', name: 'Greasy film', order: 4 },
];
