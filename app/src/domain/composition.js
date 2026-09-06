// Pure. No framework, no DOM, no store import. Reimplemented (not imported)
// from the old-sprinkles slice's composition.js — verified against the
// printed sheet: Olive Oil Ice Cream, 800 g, churned 2 Aug 2026.

export const LACTOSE_FRACTION_OF_MSNF = 0.545;

// Relative to sucrose = 100.
export const PAC_LACTOSE = 100;
export const POD_LACTOSE = 16;

export const COEFFICIENT_SET = {
  id: '2026.1-slice-transcription',
  name: 'coefficient set 2026.1 (slice transcription)',
  pacReference: 'PAC relative to sucrose = 100',
  lactoseRule: 'lactose taken as 54.5% of MSNF',
};

const sumBy = (rows, get) => rows.reduce((total, row) => total + get(row), 0);

/** rows: [{ ingredient, grams }] where ingredient carries a `composition` block. */
export function computeBalance(rows) {
  const mass = sumBy(rows, (r) => r.grams);
  if (mass === 0) return null;

  const part = (key) => sumBy(rows, (r) => r.grams * (r.ingredient.composition[key] ?? 0));

  const fat = part('fat');
  const msnf = part('msnf');
  const sugar = part('sugar');
  const other = part('other');
  const emulsifier = part('emulsifier');
  const stabilizer = part('stabilizer');

  const lactose = msnf * LACTOSE_FRACTION_OF_MSNF;
  const solids = fat + msnf + sugar + other + emulsifier + stabilizer;

  const milkfat = sumBy(rows, (r) =>
    r.ingredient.dairy ? r.grams * (r.ingredient.composition.fat ?? 0) : 0,
  );
  const addedFat = fat - milkfat;

  const pac = (part('pac') + lactose * PAC_LACTOSE) / mass;
  const pod = (part('pod') + lactose * POD_LACTOSE) / mass;

  const pct = (grams) => (100 * grams) / mass;

  return {
    mass,
    water: mass - solids,
    grams: { fat, milkfat, addedFat, msnf, sugar, solids, lactose },
    percent: {
      fat: pct(fat),
      milkfat: pct(milkfat),
      addedFat: pct(addedFat),
      msnf: pct(msnf),
      sugar: pct(sugar),
      solids: pct(solids),
    },
    addedFatShareOfFat: fat === 0 ? 0 : (100 * addedFat) / fat,
    pac,
    pod,
  };
}

/** The weakest basis present wins, so a figure never claims more than its worst input. */
const BASIS_RANK = { stated: 0, derived: 1, estimated: 2, inherited: 3 };

export function weakestBasis(rows, field) {
  let worst = 'stated';
  for (const row of rows) {
    if (!(row.ingredient.composition[field] > 0)) continue;
    const basis = row.ingredient.basis?.[field] ?? 'inherited';
    if (BASIS_RANK[basis] > BASIS_RANK[worst]) worst = basis;
  }
  return worst;
}
