// Tests for the offline converter (plan 09-01). Every fixture is built inline from
// rows copied out of the dataset: the tests never read ~/Downloads.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { library } from '../src/data/library.js';
import { computeBalance } from '../src/domain/composition.js';
import {
  COEFFICIENT_READINGS,
  CULTURED_DAIRY_IDS,
  LIQUID_NOTE,
  buildSourceText,
  camelKey,
  convertEntry,
  nearNames,
  planMerge,
  reviewFlags,
  runConverter,
  sameDiffers,
} from './convert-ingredient-seed.mjs';

const META = {
  sources: {
    Goff: 'Goff & Hartel, Ice Cream, 7th ed. (2013), Tables 3.2 & 3.4 [textbook, tier 2]',
    Mullan: 'Mullan (2021), Food Science & Technology (IFST), Tables 2 & 6 [peer-reviewed, tier 2]',
  },
};

// A dataset row with the fields the converter reads; each test names only what it needs.
const row = (fields) => ({
  id: 'x',
  name: 'X',
  category: 'other',
  water_pct: 0,
  solids_pct: 100,
  fat_pct: 0,
  msnf_pct: 0,
  sugars_pct: 0,
  pac: 0,
  pac_provenance: 'calculated',
  pod: 0,
  sources: ['Goff 3.2'],
  notes: '',
  ...fields,
});

const WHOLE_MILK = row({
  id: 'whole-milk',
  name: 'Whole milk (3.25% fat)',
  category: 'dairy',
  water_pct: 88.3,
  solids_pct: 11.7,
  fat_pct: 3.25,
  msnf_pct: 8.45,
  sugars_pct: 4.6,
  pac: 4.6,
  pod: 0.7,
  pac_provenance: 'calculated (lactose 4.61% = MSNF x 0.545)',
  sources: ['Goff 3.2', 'USDA'],
  notes: 'US-standard 3.25% fat.',
});
const COCONUT_MILK = row({
  id: 'coconut-milk',
  name: 'Coconut Milk',
  category: 'dairy',
  water_pct: 94.57,
  solids_pct: 5.43,
  fat_pct: 2.08,
  sugars_pct: 2.5,
  pac: 4.6,
  pod: 2.9,
  notes: 'Non-dairy (coconut); grouped with dairy for mix-building. ',
});
const MILK_CHOCOLATE = row({
  id: 'milk-chocolate',
  name: 'Milk Chocolate',
  category: 'flavor',
  water_pct: 1.5,
  solids_pct: 98.5,
  fat_pct: 29.66,
  msnf_pct: 16,
  sugars_pct: 51.5,
  pac: 13.5,
  pod: 53,
});
const CONDENSED = row({
  id: 'sweetened-condensed-milk',
  name: 'Sweetened condensed milk',
  category: 'dairy',
  water_pct: 27,
  solids_pct: 73,
  fat_pct: 8,
  msnf_pct: 23,
  sugars_pct: 54.5,
  pac: 54.5,
  pod: 44,
});
const YOGURT = row({
  id: 'yogurt-3.5pct',
  name: 'Yogurt 3.5%',
  category: 'dairy',
  water_pct: 86,
  solids_pct: 14,
  fat_pct: 3.5,
  msnf_pct: 14.2,
  sugars_pct: 3.5,
  pac: 7.1,
  pod: 0.48,
});
const SOUR_CREAM = row({
  id: 'sour-cream',
  name: 'Sour Cream',
  category: 'dairy',
  water_pct: 73.07,
  solids_pct: 26.93,
  fat_pct: 19.35,
  msnf_pct: 7.5,
  sugars_pct: 3.41,
  pac: 3.2,
  pod: 0.51,
});
const ETHANOL = row({
  id: 'ethanol',
  name: 'Ethanol / spirits (as 100% ethanol)',
  water_pct: 0,
  solids_pct: 0,
  pac: 744,
  notes: 'Pure ethanol, already as-is. ',
});
const RUM = row({ id: 'rum-40pct', name: 'Rum 40%', water_pct: 66.6, solids_pct: 0, pac: 297, notes: 'Ready-diluted 40% ABV. ' });
const ALCOHOL = row({ id: 'alcohol-40pct', name: 'Alcohol 40%', water_pct: 60, solids_pct: 40, pac: 297, notes: '' });
const LECITHIN = row({
  id: 'lecithin',
  name: 'Lecithin (soy/sunflower, E322)',
  category: 'emulsifier',
  water_pct: 1,
  solids_pct: 99,
  fat_pct: 100,
});
const GUAR = row({ id: 'guar-gum', name: 'Guar gum (E412)', category: 'stabilizer', solids_pct: 89 });
const SALT = row({ id: 'salt', name: 'Salt (sodium chloride)', pac: 586, sources: ['Mullan 2', 'legacy .iei'] });
const EGG_YOLK = row({
  id: 'egg-yolk',
  name: 'Egg yolk (fresh)',
  category: 'egg',
  water_pct: 52.3,
  solids_pct: 47.7,
  fat_pct: 26.5,
  sugars_pct: 0.6,
});
const SKIM_MILK = row({
  id: 'skim-milk',
  name: 'Skim milk',
  category: 'dairy',
  water_pct: 91.4,
  solids_pct: 8.6,
  msnf_pct: 8.6,
  sugars_pct: 4.7,
  pac: 4.7,
  pod: 0.8,
});

const percent = (entry, grams = 100) =>
  computeBalance([{ ingredient: entry, portions: [{ step: 1, grams }] }]);

describe('camelKey', () => {
  it('camelCases the dataset id and drops characters outside letters and digits', () => {
    expect(camelKey('skim-milk-powder')).toBe('skimMilkPowder');
    expect(camelKey('heavy-cream-36')).toBe('heavyCream36');
    expect(camelKey('yogurt-3.5pct')).toBe('yogurt35pct');
  });
});

describe('convertEntry: composition rules', () => {
  it('converts whole milk to fat and msnf alone, with lactose counted once', () => {
    const entry = convertEntry(WHOLE_MILK, META, 'wholeMilk325');
    expect(entry.composition).toEqual({ fat: 0.0325, msnf: 0.0845 });
    expect(entry.dairy).toBe(true);
    const balance = percent(entry);
    expect(Math.abs(balance.pac - 4.6)).toBeLessThan(0.06);
    expect(Math.abs(balance.pod - 0.7)).toBeLessThan(0.08);
  });

  it('takes the lactose out of milk chocolate and still computes the dataset PAC and POD', () => {
    const entry = convertEntry(MILK_CHOCOLATE, META, 'milkChocolate');
    expect(entry.composition).toEqual({ fat: 0.2966, msnf: 0.16, sugar: 0.4278, other: 0.1006, pac: 4.78, pod: 51.6048 });
    expect(entry.dairy).toBeUndefined();
    const balance = percent(entry);
    expect(Math.abs(balance.pac - 13.5)).toBeLessThan(0.06);
    expect(Math.abs(balance.pod - 53)).toBeLessThan(0.08);
  });

  it('keeps the added sucrose in sweetened condensed milk', () => {
    const entry = convertEntry(CONDENSED, META, 'sweetenedCondensedMilk');
    // Number(((54.5 - 0.545 x 23) / 100).toFixed(6)): six places, as the rule writes it.
    expect(entry.composition.sugar).toBe(0.41965);
    expect(entry.composition.other).toBe(0.00035);
    expect(entry.composition.pac).toBe(41.965);
    expect(entry.composition.pod).toBe(41.9944);
    const balance = percent(entry);
    expect(Math.abs(balance.pac - 54.5)).toBeLessThan(0.06);
    expect(Math.abs(balance.pod - 44)).toBeLessThan(0.08);
    expect(Math.abs(balance.percent.solids - 73)).toBeLessThan(0.15);
  });

  it('trusts the solids on yogurt, derives msnf as solids minus fat and keeps a negative POD residual', () => {
    const entry = convertEntry(YOGURT, META, 'yogurt35pct');
    expect(entry.composition.msnf).toBe(0.105);
    expect(entry.composition.fat).toBe(0.035);
    expect(entry.composition.pac).toBe(1.3775);
    expect(entry.composition.pod).toBe(-0.4356);
    expect(reviewFlags(YOGURT, entry).join(' ')).toContain('solids inconsistent');
  });

  it('holds ethanol as its PAC alone', () => {
    const entry = convertEntry(ETHANOL, META, 'ethanol');
    expect(entry.composition).toEqual({ pac: 744 });
  });

  it('holds all three alcohol rows as exactly their PAC, with the liquid note last', () => {
    const rum = convertEntry(RUM, META, 'rum40pct');
    const alcohol = convertEntry(ALCOHOL, META, 'alcohol40pct');
    const ethanol = convertEntry(ETHANOL, META, 'ethanol');
    expect(rum.composition).toEqual({ pac: 297 });
    expect(alcohol.composition).toEqual({ pac: 297 });
    expect(ethanol.composition).toEqual({ pac: 744 });
    for (const entry of [rum, alcohol, ethanol]) {
      expect(entry.note.endsWith(LIQUID_NOTE)).toBe(true);
      expect(percent(entry).percent.solids).toBe(0);
    }
    expect(rum.note).toBe(`Ready-diluted 40% ABV. ${LIQUID_NOTE}`);
    expect(alcohol.note).toBe(LIQUID_NOTE);
  });

  it('writes an emulsifier fraction for lecithin and a stabilizer fraction for a gum, with no fat', () => {
    const lecithin = convertEntry(LECITHIN, META, 'lecithin');
    expect(lecithin.composition).toEqual({ emulsifier: 0.99 });
    expect(reviewFlags(LECITHIN, lecithin)).toEqual([]);
    expect(convertEntry(GUAR, META, 'guarGum').composition).toEqual({ stabilizer: 0.89 });
  });

  it('gives the coconut-milk row no dairy flag even though its category is dairy', () => {
    expect(convertEntry(COCONUT_MILK, META, 'coconutMilk208').dairy).toBeUndefined();
  });

  it('gives a row with no dataset note no note field', () => {
    expect(Object.hasOwn(convertEntry(SALT, META, 'x'), 'note')).toBe(false);
    expect(Object.hasOwn(convertEntry(COCONUT_MILK, META, 'x'), 'note')).toBe(true);
  });

  it('gives a row with no milk solids no lactose subtraction', () => {
    expect(convertEntry(SALT, META, 'salt').composition).toEqual({ other: 1, pac: 586 });
  });

  it('never writes a negative sugar for a row whose sugars are all lactose', () => {
    const entry = convertEntry(WHOLE_MILK, META, 'wholeMilk325');
    expect(entry.composition.sugar).toBeUndefined();
    for (const field of ['fat', 'msnf', 'sugar', 'other']) expect(entry.composition[field] ?? 0).toBeGreaterThanOrEqual(0);
  });
});

describe('convertEntry: basis and source text', () => {
  it('labels every composition figure inherited, with a source text for each', () => {
    const entry = convertEntry(WHOLE_MILK, META, 'wholeMilk325');
    expect(entry.basis.fat).toBe('inherited');
    expect(entry.basis.msnf).toBe('inherited');
    expect(entry.source.fat).toContain('Goff & Hartel');
    expect(entry.source.fat).toContain('3.2');
    expect(entry.source.fat).toContain('USDA');
  });

  it('puts the PAC provenance before the sources on the PAC figure', () => {
    const text = buildSourceText(WHOLE_MILK, META);
    expect(text.pac.startsWith('calculated (lactose 4.61%')).toBe(true);
    expect(text.pac).toContain('Goff & Hartel');
    expect(text.figure.startsWith('calculated')).toBe(false);
  });

  it('keeps a source tag it does not know as written', () => {
    expect(buildSourceText(row({ sources: ["Mark's ice cream editor (Ingredients.iei)"] }), META).figure).toBe(
      "Mark's ice cream editor (Ingredients.iei)",
    );
  });
});

describe('convertEntry: the six D-20 coefficients', () => {
  it('derives whole milk acidity from MSNF x 0.017 with its own basis and source', () => {
    const entry = convertEntry(WHOLE_MILK, META, 'wholeMilk325');
    expect(entry.titratableAcidity).toBe(0.001437);
    expect(entry.basis.titratableAcidity).toBe('derived');
    expect(entry.source.titratableAcidity).toBe('MSNF × 0.017, Goff pp. 142, 407');
  });

  it('leaves acidity null, with no basis or source entry, on cultured dairy and on milk chocolate', () => {
    for (const source of [YOGURT, SOUR_CREAM, MILK_CHOCOLATE]) {
      const entry = convertEntry(source, META, 'k');
      expect(entry.titratableAcidity).toBeNull();
      expect(Object.hasOwn(entry.basis, 'titratableAcidity')).toBe(false);
      expect(Object.hasOwn(entry.source, 'titratableAcidity')).toBe(false);
    }
    expect(CULTURED_DAIRY_IDS).toEqual(['buttermilk', 'buttermilk-light', 'sour-cream', 'yogurt-3.5pct']);
    expect(reviewFlags(YOGURT, convertEntry(YOGURT, META, 'k'))).toContain(
      'cultured dairy: acidity is measured or read from a label, not MSNF × 0.017; left null',
    );
    expect(reviewFlags(SOUR_CREAM, convertEntry(SOUR_CREAM, META, 'k'))).toContain(
      'cultured dairy: acidity is measured or read from a label, not MSNF × 0.017; left null',
    );
  });

  it('owns all six keys on a row with no coefficients entry, the five others null', () => {
    const entry = convertEntry(SALT, META, 'salt');
    for (const key of ['fatStructural', 'ownEmulsifier', 'titratableAcidity', 'defaultStage', 'prepNote', 'requiresHeat']) {
      expect(Object.hasOwn(entry, key)).toBe(true);
      expect(entry[key]).toBeNull();
    }
  });

  it('copies the coefficients an entry is given', () => {
    const entry = convertEntry(EGG_YOLK, META, 'eggYolk', {
      ownEmulsifier: true,
      fatStructural: false,
      defaultStage: 'combine',
      requiresHeat: true,
    });
    expect(entry.ownEmulsifier).toBe(true);
    expect(entry.fatStructural).toBe(false);
    expect(entry.defaultStage).toBe('combine');
    expect(entry.requiresHeat).toBe(true);
    expect(entry.prepNote).toBeNull();
    expect(entry.titratableAcidity).toBeNull();
  });

  it('throws a TypeError naming the id for a wrong key, a wrong type or a stage outside the twelve', () => {
    expect(() => convertEntry(EGG_YOLK, META, 'k', { defaultStage: 'simmer' })).toThrow(TypeError);
    expect(() => convertEntry(EGG_YOLK, META, 'k', { defaultStage: 'simmer' })).toThrow(/egg-yolk/);
    expect(() => convertEntry(EGG_YOLK, META, 'k', { fatStructural: 'yes' })).toThrow(TypeError);
    expect(() => convertEntry(EGG_YOLK, META, 'k', { titratableAcidity: 0.1 })).toThrow(TypeError);
    expect(() => convertEntry(EGG_YOLK, META, 'k', { prepNote: 3 })).toThrow(TypeError);
    expect(() => convertEntry(EGG_YOLK, META, 'k', { requiresHeat: 1 })).toThrow(TypeError);
    expect(() => convertEntry(EGG_YOLK, META, 'k', { prepNote: 'whisk first' })).not.toThrow();
  });

  it('flags the readings a note marks assumed and the ones read from a family name', () => {
    const yogurt = convertEntry(YOGURT, META, 'yogurt35pct', { defaultStage: 'cool' });
    expect(reviewFlags(YOGURT, yogurt)).toContain('coefficient assumed');
    expect(reviewFlags(ETHANOL, convertEntry(ETHANOL, META, 'ethanol'))).toContain('coefficient assumed');
  });
});

describe('sameDiffers', () => {
  it('reports a PAC figure that differs by more than the tolerance', () => {
    const app = { composition: { other: 1, pac: 580 } };
    const converted = { composition: { other: 1, pac: 586 } };
    expect(sameDiffers(app, converted)).toEqual([{ field: 'pac', app: 580, converted: 586 }]);
  });

  it('ignores fractions 0.0004 apart, counts an absent field as 0 and reports dairy', () => {
    expect(sameDiffers({ composition: { fat: 0.036 } }, { composition: { fat: 0.0364 } })).toEqual([]);
    expect(sameDiffers({ composition: {} }, { composition: { stabilizer: 0.89 } })).toEqual([
      { field: 'stabilizer', app: 0, converted: 0.89 },
    ]);
    expect(sameDiffers({ composition: {} }, { dairy: true, composition: {} })).toEqual([
      { field: 'dairy', app: false, converted: true },
    ]);
  });
});

describe('nearNames', () => {
  it('links whole milk to the three whole-milk entries and coconut milk to the coconut milk entry', () => {
    expect(nearNames(WHOLE_MILK, library)).toEqual(['wholeMilk', 'wholeMilk33', 'wholeMilk37']);
    expect(nearNames(COCONUT_MILK, library)).toEqual(['coconutMilk']);
    expect(nearNames(YOGURT, library)).toEqual([]);
  });
});

describe('planMerge', () => {
  const rows = [SALT, WHOLE_MILK, SKIM_MILK];
  const mapping = { same: { salt: 'salt' }, different: { 'whole-milk': 'wholeMilk325' }, renamed: {}, coefficients: {} };

  it('splits the rows into same pairs and new entries', () => {
    const plan = planMerge(rows, mapping, library, META);
    expect(Object.keys(plan.samePairs)).toEqual(['salt']);
    expect(plan.samePairs.salt.libraryId).toBe('salt');
    expect(plan.samePairs.salt.differs).toEqual([{ field: 'pac', app: 580, converted: 586 }]);
    expect(Object.keys(plan.newEntries).sort()).toEqual(['skimMilk', 'wholeMilk325']);
  });

  it('throws on a new key equal to an existing key', () => {
    expect(() => planMerge(rows, { ...mapping, different: { 'whole-milk': 'wholeMilk' } }, library, META)).toThrow(/wholeMilk/);
  });

  it('throws on a row whose key equals an existing key but is in neither same nor different', () => {
    expect(() => planMerge(rows, { same: { salt: 'salt' }, different: {} }, library, META)).toThrow(/whole-milk/);
  });

  it('throws on a row whose normalised name equals an existing entry name but is not mapped', () => {
    const lookalike = row({ id: 'graza-olive-oil', name: 'Graza Drizzle extra virgin olive oil' });
    expect(() => planMerge([lookalike], { same: {}, different: {} }, library, META)).toThrow(/oliveOil/);
  });

  it('throws on a dataset id found in two of same, different and renamed', () => {
    expect(() => planMerge(rows, { ...mapping, renamed: { 'whole-milk': 'wholeMilkTwo' } }, library, META)).toThrow(/whole-milk/);
    expect(() => planMerge(rows, { ...mapping, same: { salt: 'salt', 'whole-milk': 'wholeMilk' } }, library, META)).toThrow(/whole-milk/);
  });

  it('throws on ids and targets the dataset and the library do not hold', () => {
    expect(() => planMerge(rows, { ...mapping, same: { salt: 'salt', nope: 'salt' } }, library, META)).toThrow(/nope/);
    expect(() => planMerge(rows, { ...mapping, same: { salt: 'notAKey' } }, library, META)).toThrow(/notAKey/);
  });

  it('throws on a coefficients id that names a same pair or is not in the dataset', () => {
    expect(() => planMerge(rows, { ...mapping, coefficients: { salt: { defaultStage: 'dry_blend' } } }, library, META)).toThrow(/salt/);
    expect(() => planMerge(rows, { ...mapping, coefficients: { nope: {} } }, library, META)).toThrow(/nope/);
  });

  it('passes a new row its coefficients entry', () => {
    const plan = planMerge(rows, { ...mapping, coefficients: { 'skim-milk': { defaultStage: 'combine' } } }, library, META);
    expect(plan.newEntries.skimMilk.defaultStage).toBe('combine');
  });

  it('throws on two rows that would take the same new key', () => {
    const twin = row({ id: 'skim-milk-', name: 'Twin' });
    expect(() => planMerge([SKIM_MILK, twin], { same: {}, different: {} }, library, META)).toThrow(/skimMilk/);
  });
});

describe('the reading table', () => {
  it('names only rows the reviewed mapping gives coefficients', () => {
    const mapping = JSON.parse(fs.readFileSync(new URL('./ingredient-mapping.json', import.meta.url), 'utf8'));
    for (const id of Object.keys(COEFFICIENT_READINGS)) {
      expect(Object.hasOwn(mapping.coefficients, id), id).toBe(true);
    }
  });
});

describe('runConverter', () => {
  const tempDirs = [];
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });
  const tempDir = () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'convert-seed-'));
    tempDirs.push(dir);
    return dir;
  };

  const QUOTED = row({ id: 'quoted', name: 'Say "hi" \\ } done', category: 'other', solids_pct: 100, notes: 'a "quote", a \\ backslash and a } brace' });
  const fixtureDataset = { meta: { version: 'fixture-1', sources: META.sources }, ingredients: [SALT, SKIM_MILK, QUOTED] };

  const existingCoefficients = () => {
    const map = Object.fromEntries(Object.keys(library).map((key) => [key, {}]));
    map.wholeMilk = { fatStructural: true, defaultStage: 'combine' };
    return map;
  };
  const fixtureMapping = (extra = {}) => ({
    same: { salt: 'salt' },
    different: {},
    renamed: {},
    coefficients: {},
    existingCoefficients: existingCoefficients(),
    ...extra,
  });
  const writeInputs = (dir, dataset = fixtureDataset, mapping = fixtureMapping()) => {
    const datasetPath = path.join(dir, 'dataset.json');
    const mappingPath = path.join(dir, 'mapping.json');
    fs.writeFileSync(datasetPath, JSON.stringify(dataset));
    fs.writeFileSync(mappingPath, JSON.stringify(mapping));
    return { datasetPath, mappingPath };
  };
  const outputs = (outDir) => ['library-seed-db.js', 'ingredient-seed-checks.json', 'ingredient-review.md'].map((name) => path.join(outDir, name));

  it('writes the three files, byte-identical on a second run, with every non-same id in entries', () => {
    const dir = tempDir();
    const inputs = writeInputs(dir);
    const first = path.join(dir, 'out-a');
    const second = path.join(dir, 'out-b');
    expect(runConverter({ ...inputs, outDir: first }).exitCode).toBe(0);
    expect(runConverter({ ...inputs, outDir: second }).exitCode).toBe(0);
    for (const [a, b] of outputs(first).map((file, index) => [file, outputs(second)[index]])) {
      expect(fs.readFileSync(a, 'utf8')).toBe(fs.readFileSync(b, 'utf8'));
    }
    const checks = JSON.parse(fs.readFileSync(path.join(first, 'ingredient-seed-checks.json'), 'utf8'));
    expect(checks.dataset).toEqual({ version: 'fixture-1', count: 3 });
    expect(Object.keys(checks.entries).sort()).toEqual(['quoted', 'skim-milk']);
    expect(Object.keys(checks.samePairs)).toEqual(['salt']);
    expect(checks.samePairs.salt.differs).toEqual([{ field: 'pac', app: 580, converted: 586 }]);
    expect(checks.rows['skim-milk']).toEqual({ key: 'skimMilk', pac: 4.7, pod: 0.8, solidsPct: 8.6, msnfPct: 8.6 });
    expect(Object.keys(checks.existing)).toEqual(Object.keys(library).sort());
  });

  it('lists the generated entries sorted by key', () => {
    const dir = tempDir();
    const outDir = path.join(dir, 'out');
    runConverter({ ...writeInputs(dir), outDir });
    const text = fs.readFileSync(path.join(outDir, 'library-seed-db.js'), 'utf8');
    expect(text.indexOf('"quoted"')).toBeLessThan(text.indexOf('"skimMilk"'));
  });

  it('writes the dairy rule onto existing entries and null elsewhere', () => {
    const dir = tempDir();
    const outDir = path.join(dir, 'out');
    runConverter({ ...writeInputs(dir), outDir });
    const checks = JSON.parse(fs.readFileSync(path.join(outDir, 'ingredient-seed-checks.json'), 'utf8'));
    expect(checks.existing.wholeMilk.titratableAcidity).toBe(0.001496);
    expect(checks.existing.wholeMilk.fatStructural).toBe(true);
    expect(checks.existing.sucrose.titratableAcidity).toBeNull();
    expect(checks.existing.sucrose.defaultStage).toBeNull();
  });

  it('serialises a name holding a quote, a backslash and a closing brace as data', async () => {
    const dir = tempDir();
    const outDir = path.join(dir, 'out');
    runConverter({ ...writeInputs(dir), outDir });
    const moduleUrl = pathToFileURL(path.join(outDir, 'library-seed-db.js')).href;
    const { librarySeedDb } = await import(/* @vite-ignore */ moduleUrl);
    expect(librarySeedDb.quoted.name).toBe(QUOTED.name);
    expect(librarySeedDb.quoted.note).toBe(QUOTED.notes);
  });

  it('exits non-zero and writes nothing when the dataset is missing, unparseable or empty', () => {
    const dir = tempDir();
    const { mappingPath } = writeInputs(dir);
    const outDir = path.join(dir, 'out');
    expect(runConverter({ datasetPath: path.join(dir, 'missing.json'), mappingPath, outDir }).exitCode).not.toBe(0);
    const broken = path.join(dir, 'broken.json');
    fs.writeFileSync(broken, '{ not json');
    expect(runConverter({ datasetPath: broken, mappingPath, outDir }).exitCode).not.toBe(0);
    const empty = writeInputs(tempDir(), { meta: {}, ingredients: [] });
    expect(runConverter({ datasetPath: empty.datasetPath, mappingPath, outDir }).exitCode).not.toBe(0);
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it('exits non-zero and writes nothing when existingCoefficients lacks a library key or names an unknown one', () => {
    const dir = tempDir();
    const outDir = path.join(dir, 'out');
    const missing = existingCoefficients();
    delete missing.sucrose;
    const withoutKey = runConverter({ ...writeInputs(dir, fixtureDataset, fixtureMapping({ existingCoefficients: missing })), outDir });
    expect(withoutKey.exitCode).not.toBe(0);
    expect(withoutKey.message).toContain('sucrose');
    const unknown = { ...existingCoefficients(), notAKey: {} };
    const withUnknown = runConverter({ ...writeInputs(dir, fixtureDataset, fixtureMapping({ existingCoefficients: unknown })), outDir });
    expect(withUnknown.exitCode).not.toBe(0);
    expect(withUnknown.message).toContain('notAKey');
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it('refuses a bad value in existingCoefficients with the same rules as a new entry', () => {
    const dir = tempDir();
    const outDir = path.join(dir, 'out');
    const bad = existingCoefficients();
    bad.sucrose = { defaultStage: 'simmer' };
    expect(runConverter({ ...writeInputs(dir, fixtureDataset, fixtureMapping({ existingCoefficients: bad })), outDir }).exitCode).not.toBe(0);
    expect(fs.existsSync(outDir)).toBe(false);
  });

  it('refuses a mapping that leaves a collision unmapped, writing nothing', () => {
    const dir = tempDir();
    const outDir = path.join(dir, 'out');
    const dataset = { meta: {}, ingredients: [SALT, WHOLE_MILK] };
    const result = runConverter({ ...writeInputs(dir, dataset, fixtureMapping()), outDir });
    expect(result.exitCode).not.toBe(0);
    expect(fs.existsSync(outDir)).toBe(false);
  });
});
