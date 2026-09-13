import { computeBalance, weakestBasis } from '../app/src/domain/composition.js';
import { oliveOilVersion } from '../app/src/data/olive-oil.js';
import { asMadeTotals } from '../app/src/domain/batch.js';
const row = (grams, composition) => ({ id: 'probe', portions: [{ grams }], ingredient: { composition } });
const seed = computeBalance(oliveOilVersion.rows);
console.log(JSON.stringify({
  seed,
  unknownFat: computeBalance([row(950, {fat: 0.1}), row(50, {fat: null})]),
  missingBasis: weakestBasis([row(50, {})], 'fat'),
  pureSucrose1000g: computeBalance([row(900, {}), row(100, {sugar: 1, pac: 100, pod: 100})]),
  missingActual: asMadeTotals([row(100, {})], {}),
  saltPacInLegacyUnits: 3.2 * 580 / seed.mass,
  seedScalingOnly: {pacPer1000g: seed.pac * 10, prsPer1000g: seed.pod * 10}
}, null, 2));
