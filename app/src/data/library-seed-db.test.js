// The reviewed library seed's gates (Phase 9, plan 09-07; LIB-04, LIB-05, LIB-07).
//
// Task 2: every same-ingredient pair the approved mapping names has one recorded
// decision, and the gate fails when a record is missing, names a field that no
// longer differs, or omits one that does.
//
// Task 3: the dataset invariants run on the converted candidates (lactose counted
// once, the four D-10a exceptions), never on the merged library; the kept app
// values are a separate assertion; and no new key or name clashes with the 26.
//
// The test reads the dataset's own figures from app/scripts/ingredient-seed-checks.json
// and the approved calls from app/scripts/ingredient-mapping.json, both with
// node:fs, so nothing here is typed from memory.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { library } from './library.js';
import { librarySeedDb } from './library-seed-db.js';
import { libraryDecisions } from './library-decisions.js';
import { computeBalance } from '../domain/composition.js';
import { STAGE_IDS } from '../domain/stages.js';
import { CULTURED_DAIRY_IDS } from '../../scripts/convert-ingredient-seed.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const readJson = (relative) => JSON.parse(readFileSync(path.resolve(here, relative), 'utf8'));
const checks = readJson('../../scripts/ingredient-seed-checks.json');
const mapping = readJson('../../scripts/ingredient-mapping.json');

const FRACTION_TOLERANCE = 0.0005;
const POINT_TOLERANCE = 0.05;
const KEPT = 'app value kept';
const DIFFERENT_PRODUCT = 'different product: the app entry is kept and the dataset row is added under its own key';
const NO_FIGURE_DIFFERS = 'No figure differs beyond the tolerance; recorded as decided.';

// The seven conflicts decision 1 names, by dataset id.
const NAMED_CONFLICTS = [
  'dextrose',
  'salt',
  'fructose',
  'strawberries',
  'skim-milk-powder',
  'coconut-milk',
  'heavy-cream-36',
];

// The sorted names of the fields whose converted value differs from the app's
// beyond the tolerance. An absent field counts as 0, as the converter's rule has it.
function recomputeDiffers(appEntry, converted) {
  const fields = new Set([
    ...Object.keys(appEntry.composition ?? {}),
    ...Object.keys(converted.composition ?? {}),
  ]);
  const names = [];
  for (const field of fields) {
    const app = appEntry.composition?.[field] ?? 0;
    const value = converted.composition?.[field] ?? 0;
    const tolerance = field === 'pac' || field === 'pod' ? POINT_TOLERANCE : FRACTION_TOLERANCE;
    if (Math.abs(app - value) > tolerance) names.push(field);
  }
  if ((appEntry.dairy === true) !== (converted.dairy === true)) names.push('dairy');
  return names.sort();
}

const sortedNames = (list) => [...list].sort();

// Every way a list of decisions can fall short of the approved mapping, each
// naming the pair and the field. An empty list is a passing gate.
function gateProblems(records) {
  const problems = [];
  const knownIds = new Set([...Object.keys(mapping.same), ...Object.keys(mapping.different)]);

  for (const record of records) {
    if (!knownIds.has(record.datasetId)) problems.push(`${record.datasetId}: not in the approved mapping`);
  }

  for (const [datasetId, pair] of Object.entries(checks.samePairs)) {
    const found = records.filter((record) => record.datasetId === datasetId && record.relation === 'same');
    if (found.length !== 1) {
      problems.push(`${datasetId}: expected one 'same' record, found ${found.length}`);
      continue;
    }
    const [record] = found;
    if (record.libraryId !== pair.libraryId) problems.push(`${datasetId}: libraryId ${record.libraryId}, expected ${pair.libraryId}`);
    if (record.decision !== KEPT) problems.push(`${datasetId}: decision "${record.decision}", expected "${KEPT}"`);

    const recomputed = recomputeDiffers(library[pair.libraryId], pair.converted);
    const fromChecks = sortedNames(pair.differs.map((d) => d.field));
    const recorded = sortedNames(record.differs);
    for (const field of recomputed) {
      if (!recorded.includes(field)) problems.push(`${datasetId}: record omits ${field}, which differs`);
    }
    for (const field of recorded) {
      if (!recomputed.includes(field)) problems.push(`${datasetId}: record names ${field}, which no longer differs`);
    }
    if (JSON.stringify(recomputed) !== JSON.stringify(fromChecks)) {
      problems.push(`${datasetId}: recomputed ${recomputed.join(',')} but the checks file says ${fromChecks.join(',')}`);
    }
  }

  for (const datasetId of NAMED_CONFLICTS) {
    const record = records.find((r) => r.datasetId === datasetId);
    if (!record) {
      problems.push(`${datasetId}: named conflict has no record`);
      continue;
    }
    if (typeof record.note !== 'string' || record.note.length === 0) {
      problems.push(`${datasetId}: named conflict has no note`);
      continue;
    }
    const pair = checks.samePairs[datasetId];
    if (!pair) continue;
    if (pair.differs.length === 0) {
      if (record.note !== NO_FIGURE_DIFFERS) problems.push(`${datasetId}: note should be "${NO_FIGURE_DIFFERS}"`);
      continue;
    }
    for (const { field, app, converted } of pair.differs) {
      if (!record.note.includes(String(app))) problems.push(`${datasetId}: note lacks ${field} app value ${app}`);
      if (!record.note.includes(String(converted))) problems.push(`${datasetId}: note lacks ${field} converted value ${converted}`);
    }
  }

  for (const [datasetId, libraryId] of Object.entries(mapping.different)) {
    if (!NAMED_CONFLICTS.includes(datasetId)) continue;
    const record = records.find((r) => r.datasetId === datasetId && r.relation === 'different');
    if (!record) {
      problems.push(`${datasetId}: named conflict the mapping marks different has no 'different' record`);
      continue;
    }
    if (record.decision !== DIFFERENT_PRODUCT) problems.push(`${datasetId}: decision "${record.decision}", expected the different-product decision`);
    if (!Object.hasOwn(library, record.libraryId)) problems.push(`${datasetId}: libraryId ${record.libraryId} is not an app entry`);
    if (!record.note?.includes(libraryId)) problems.push(`${datasetId}: note should name the new key ${libraryId}`);
  }

  return problems;
}

describe('the approved mapping gates the seed (LIB-05)', () => {
  it('is approved by Mark with an ISO approvedAt, so a resumed run that skipped the checkpoint cannot pass', () => {
    expect(mapping.approvedBy).toBe('Mark');
    expect(typeof mapping.approvedAt).toBe('string');
    expect(Number.isNaN(Date.parse(mapping.approvedAt))).toBe(false);
    expect(new Date(mapping.approvedAt).toISOString()).toBe(mapping.approvedAt);
  });
});

describe('the recorded decision gate (LIB-05, criterion 1)', () => {
  it('every same pair has exactly one record, its differs list equals the recomputed one and the checks file, and the named conflicts carry notes from the converter figures', () => {
    expect(gateProblems(libraryDecisions)).toEqual([]);
  });

  it('records all eighteen same pairs, heavy-cream-36 and lambda-carrageenan included', () => {
    const same = libraryDecisions.filter((record) => record.relation === 'same').map((record) => record.datasetId);
    expect(sortedNames(same)).toEqual(sortedNames(Object.keys(mapping.same)));
    expect(same).toContain('heavy-cream-36');
    expect(same).toContain('lambda-carrageenan');
  });

  it('a same pair whose figures all match still has a record, with differs []', () => {
    const matching = Object.entries(checks.samePairs).filter(([, pair]) => pair.differs.length === 0);
    expect(matching.length).toBeGreaterThan(0);
    for (const [datasetId] of matching) {
      const record = libraryDecisions.find((r) => r.datasetId === datasetId);
      expect(record, datasetId).toBeDefined();
      expect(record.differs, datasetId).toEqual([]);
    }
  });

  it('fails when a pair has no record', () => {
    const without = libraryDecisions.filter((record) => record.datasetId !== 'cinnamon');
    expect(gateProblems(without)).toContain("cinnamon: expected one 'same' record, found 0");
  });

  it('fails when a record omits a field that differs, and when it names one that does not', () => {
    const omitted = libraryDecisions.map((record) =>
      record.datasetId === 'dextrose' ? { ...record, differs: record.differs.filter((f) => f !== 'pod') } : record,
    );
    expect(gateProblems(omitted)).toContain('dextrose: record omits pod, which differs');

    const extra = libraryDecisions.map((record) =>
      record.datasetId === 'allulose' ? { ...record, differs: ['sugar'] } : record,
    );
    expect(gateProblems(extra)).toContain('allulose: record names sugar, which no longer differs');
  });

  it("a record's differs list is compared as a set, so its order never fails the gate", () => {
    const reversed = libraryDecisions.map((record) => ({ ...record, differs: [...record.differs].reverse() }));
    expect(gateProblems(reversed)).toEqual([]);
  });

  it('fails when a record names a dataset id that is not in the mapping', () => {
    const stray = [...libraryDecisions, { datasetId: 'unicorn-milk', libraryId: 'wholeMilk', relation: 'same', differs: [], decision: KEPT }];
    expect(gateProblems(stray)).toContain('unicorn-milk: not in the approved mapping');
  });

  it('fails when a quoted number in a named conflict note is changed', () => {
    const changed = libraryDecisions.map((record) =>
      record.datasetId === 'salt' ? { ...record, note: record.note.replace('586', '587') } : record,
    );
    expect(gateProblems(changed).some((problem) => problem.startsWith('salt: note lacks pac converted value'))).toBe(true);
  });

  it('counts a converted figure within 0.0005 of the app value (a fraction) or 0.05 (PAC, POD) as equal, and one beyond as differing', () => {
    const app = { composition: { sugar: 1, pac: 100, pod: 100 } };
    expect(recomputeDiffers(app, { composition: { sugar: 0.9996, pac: 100.04, pod: 99.96 } })).toEqual([]);
    expect(recomputeDiffers(app, { composition: { sugar: 0.9994, pac: 100.06, pod: 99.94 } })).toEqual(['pac', 'pod', 'sugar']);
  });

  it('counts an absent field as 0 on either side', () => {
    const app = { composition: { stabilizer: 0.5545, other: 0.361 } };
    expect(recomputeDiffers(app, { composition: { other: 0.9155 } })).toEqual(['other', 'stabilizer']);
  });
});

// The converted candidate of a dataset row: a same pair keeps only its converted
// figures in the checks file (plan 09-01 never writes it into the new-entry
// module), every other row is the new entry under its mapped key.
function candidate(datasetId) {
  if (Object.hasOwn(checks.samePairs, datasetId)) return checks.samePairs[datasetId].converted;
  const key = checks.entries[datasetId];
  if (key !== undefined && Object.hasOwn(librarySeedDb, key)) return librarySeedDb[key];
  return undefined;
}

const hundredGrams = (entry) => computeBalance([{ ingredient: entry, portions: [{ step: 1, grams: 100 }] }]);
const PAC_BOUND = 0.06;
const POD_BOUND = 0.08;
const SOLIDS_BOUND = 0.15;

describe('the converted candidates count lactose once (LIB-07, D-10a, criterion 1)', () => {
  it('every dataset row has a converted candidate, a same pair through the checks file and a new entry through the entries map', () => {
    const missing = Object.keys(checks.rows).filter((datasetId) => candidate(datasetId) === undefined);
    expect(missing, `rows with neither a same pair nor a new entry: ${missing.join(', ')}`).toEqual([]);
  });

  it('100 g of every converted candidate with milk solids computes the dataset PAC, POD and solids', () => {
    const milkSolids = Object.entries(checks.rows).filter(([, row]) => row.msnfPct > 0);
    expect(milkSolids.length).toBeGreaterThan(0);
    for (const [datasetId, row] of milkSolids) {
      const balance = hundredGrams(candidate(datasetId));
      expect(Math.abs(balance.pac - row.pac), `${datasetId} pac ${balance.pac} against ${row.pac}`).toBeLessThan(PAC_BOUND);
      expect(Math.abs(balance.pod - row.pod), `${datasetId} pod ${balance.pod} against ${row.pod}`).toBeLessThan(POD_BOUND);
      expect(
        Math.abs(balance.percent.solids - row.solidsPct),
        `${datasetId} solids ${balance.percent.solids} against ${row.solidsPct}`,
      ).toBeLessThan(SOLIDS_BOUND);
    }
  });

  it('skim milk powder, a same pair kept only in the checks file, passes through its converted figures', () => {
    expect(Object.hasOwn(checks.samePairs, 'skim-milk-powder')).toBe(true);
    const row = checks.rows['skim-milk-powder'];
    const balance = hundredGrams(candidate('skim-milk-powder'));
    expect(Math.abs(balance.pac - row.pac)).toBeLessThan(PAC_BOUND);
    expect(Math.abs(balance.pod - row.pod)).toBeLessThan(POD_BOUND);
  });

  it('milk chocolate takes the lactose out of its sugar and still computes PAC 13.5 and POD 53', () => {
    const balance = hundredGrams(librarySeedDb.milkChocolate);
    expect(checks.entries['milk-chocolate']).toBe('milkChocolate');
    expect(Math.abs(balance.pac - 13.5)).toBeLessThan(PAC_BOUND);
    expect(Math.abs(balance.pod - 53)).toBeLessThan(POD_BOUND);
    expect(Math.abs(balance.percent.solids - checks.rows['milk-chocolate'].solidsPct)).toBeLessThan(SOLIDS_BOUND);
  });

  it('sweetened condensed milk keeps its added sucrose: sugar 0.41965, PAC 54.5, POD 44 and solids 73', () => {
    const entry = librarySeedDb.sweetenedCondensedMilk;
    expect(checks.entries['sweetened-condensed-milk']).toBe('sweetenedCondensedMilk');
    // Number(((54.5 - 0.545 x 23) / 100).toFixed(6)): six places, as the rule writes it.
    expect(entry.composition.sugar).toBe(0.41965);
    const balance = hundredGrams(entry);
    expect(Math.abs(balance.pac - 54.5)).toBeLessThan(PAC_BOUND);
    expect(Math.abs(balance.pod - 44)).toBeLessThan(POD_BOUND);
    expect(Math.abs(balance.percent.solids - 73)).toBeLessThan(SOLIDS_BOUND);
  });

  it('yogurt trusts its solids: msnf 0.105, derived as solids minus fat', () => {
    expect(checks.entries['yogurt-3.5pct']).toBe('yogurt35pct');
    expect(librarySeedDb.yogurt35pct.composition.msnf).toBe(0.105);
  });

  it('ethanol is its PAC alone', () => {
    expect(checks.entries.ethanol).toBe('ethanol');
    expect(librarySeedDb.ethanol.composition).toEqual({ pac: 744 });
  });
});

describe('the kept app values are not the dataset figures (decision 1, LIB-05)', () => {
  const seeded = { ...librarySeedDb, ...library };

  it('for every same pair the seeded entry under its library id is data/library.js as it stands', () => {
    for (const [datasetId, pair] of Object.entries(checks.samePairs)) {
      expect(seeded[pair.libraryId], `${datasetId} -> ${pair.libraryId}`).toEqual(library[pair.libraryId]);
    }
  });
});

describe('the new entries beside the 26 (D-08, D-09, D-20)', () => {
  const normalised = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const newEntries = Object.entries(librarySeedDb);
  const SIX = ['titratableAcidity', 'fatStructural', 'ownEmulsifier', 'defaultStage', 'prepNote', 'requiresHeat'];

  it('no new key is one of the 26 keys', () => {
    const clashes = Object.keys(librarySeedDb).filter((key) => Object.hasOwn(library, key));
    expect(clashes).toEqual([]);
  });

  it("no new entry's name, lower-cased with only letters and digits kept, equals an existing entry's", () => {
    const existing = new Map(Object.entries(library).map(([key, entry]) => [normalised(entry.name), key]));
    const clashes = newEntries
      .filter(([, entry]) => existing.has(normalised(entry.name)))
      .map(([key, entry]) => `${key} (${entry.name}) matches ${existing.get(normalised(entry.name))}`);
    expect(clashes).toEqual([]);
  });

  it('every composition field of every new entry has basis inherited and a non-empty source string', () => {
    for (const [key, entry] of newEntries) {
      for (const field of Object.keys(entry.composition)) {
        expect(entry.basis[field], `${key}.${field} basis`).toBe('inherited');
        expect(typeof entry.source[field], `${key}.${field} source`).toBe('string');
        expect(entry.source[field].length, `${key}.${field} source`).toBeGreaterThan(0);
      }
    }
  });

  it('every new entry owns the six D-20 keys, and each stage is a known stage', () => {
    for (const [key, entry] of newEntries) {
      for (const field of SIX) expect(Object.hasOwn(entry, field), `${key}.${field}`).toBe(true);
      expect(entry.defaultStage === null || STAGE_IDS.includes(entry.defaultStage), `${key}.defaultStage`).toBe(true);
    }
  });

  it('acidity is MSNF x 0.017 on a dairy entry, derived and sourced, and null with no provenance on a cultured one', () => {
    const cultured = new Set(CULTURED_DAIRY_IDS.map((datasetId) => checks.entries[datasetId]));
    expect(cultured.size).toBe(CULTURED_DAIRY_IDS.length);
    for (const key of cultured) expect(Object.hasOwn(librarySeedDb, key), key).toBe(true);

    for (const [key, entry] of newEntries) {
      const derives = entry.category === 'dairy' && entry.composition.msnf > 0 && !cultured.has(key);
      if (derives) {
        expect(entry.titratableAcidity, key).toBe(Number((entry.composition.msnf * 0.017).toFixed(6)));
        expect(entry.basis.titratableAcidity, key).toBe('derived');
        expect(entry.source.titratableAcidity, key).toBe('MSNF × 0.017, Goff pp. 142, 407');
      } else {
        expect(entry.titratableAcidity, key).toBeNull();
        expect(Object.hasOwn(entry.basis, 'titratableAcidity'), `${key} basis`).toBe(false);
        expect(Object.hasOwn(entry.source, 'titratableAcidity'), `${key} source`).toBe(false);
      }
    }
  });

  it('dairy is true only where the category is dairy and there are milk solids', () => {
    for (const [key, entry] of newEntries) {
      if (entry.dairy === true) {
        expect(entry.category, key).toBe('dairy');
        expect(entry.composition.msnf, key).toBeGreaterThan(0);
      }
    }
  });

  it('every stabilizer or emulsifier entry holds its own fraction and no fat', () => {
    const own = newEntries.filter(([, entry]) => entry.category === 'stabilizer' || entry.category === 'emulsifier');
    expect(own.length).toBeGreaterThan(0);
    for (const [key, entry] of own) {
      const field = entry.category;
      expect(entry.composition[field], `${key}.${field}`).toBeGreaterThan(0);
      expect(entry.composition.fat ?? 0, `${key}.fat`).toBe(0);
    }
  });
});
