// Counts in words, shared by Home and the two places (sketch 012: counts in
// words only, no tally marks on a list whose job is finding). The marks beside
// a count are decorative, so the count is never carried by marks alone
// (UX1-03).

// batchCountWords(n) -> the batch tally's count in words (D-11, D-19, UX1-03).
export function batchCountWords(count) {
  if (count === 0) return 'not yet made';
  return `${count} batch${count === 1 ? '' : 'es'}`;
}

export function versionCountWords(count) {
  return `${count} version${count === 1 ? '' : 's'}`;
}

export function recipeCountWords(count) {
  return `${count} recipe${count === 1 ? '' : 's'}`;
}

// 'N ingredients' unfiltered ('1 ingredient' for exactly one), 'N of M
// ingredients' while a filter is on.
export function ingredientCountWords(shown, total, filtered) {
  if (filtered) return `${shown} of ${total} ingredients`;
  return `${shown} ingredient${shown === 1 ? '' : 's'}`;
}
