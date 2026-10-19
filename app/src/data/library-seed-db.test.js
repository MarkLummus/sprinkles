// The reviewed library seed's gates (Phase 9, plan 09-07; LIB-04, LIB-05, LIB-07).
//
// Task 2: every same-ingredient pair the approved mapping names has one recorded
// decision, and the gate fails when a record is missing, names a field that no
// longer differs, or omits one that does.
//
// The test reads the dataset's own figures from app/scripts/ingredient-seed-checks.json
// and the approved calls from app/scripts/ingredient-mapping.json, both with
// node:fs, so nothing here is typed from memory.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { library } from './library.js';
import { libraryDecisions } from './library-decisions.js';

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
