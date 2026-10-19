// Offline converter: Mark's ingredient dataset to library entries (Phase 9, plan 09-01).
//
// Runs once on the developer machine, reads ~/Downloads/sprinkles-ingredient-seed-db.json
// and the reviewed mapping, and writes three files:
//   app/src/data/library-seed-db.js           the new entries, generated, not yet imported
//   app/scripts/ingredient-seed-checks.json   figures for plan 09-07's gate and invariant tests
//   app/scripts/ingredient-review.md          the list Mark reviews (D-16)
//
// Privacy (LIB-04): node built-ins only, no network module. The app never reads
// the dataset, the mapping or the review list at run time; this script is their
// only reader.
//
// Decisions: D-08, D-09 (keys and the mapping), D-10 (basis and source text),
// D-10a (the four reviewed exceptions), D-16 (Mark approves the mapping), D-20
// (the six per-ingredient coefficients), LIB-07 (lactose counted once).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { library as appLibrary } from '../src/data/library.js';
import {
  LACTOSE_FRACTION_OF_MSNF,
  PAC_LACTOSE,
  POD_LACTOSE,
} from '../src/domain/composition.js';
import { STAGE_IDS } from '../src/domain/stages.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

export const LIQUID_NOTE =
  'The balance cannot hold ethanol as its own part: it weighs it as water and counts only its PAC.';

/** The dataset's fermented dairy rows: their acidity is measured or read from a label, never MSNF x 0.017 (D-20, sourced-bands note 6a). */
export const CULTURED_DAIRY_IDS = ['buttermilk', 'buttermilk-light', 'sour-cream', 'yogurt-3.5pct'];

const CULTURED_FLAG =
  'cultured dairy: acidity is measured or read from a label, not MSNF × 0.017; left null';
const LIQUID_IDS = ['ethanol', 'rum-40pct', 'alcohol-40pct'];
const ACID_PER_MSNF = 0.017;
const ACID_SOURCE = 'MSNF × 0.017, Goff pp. 142, 407';
const COEFFICIENT_KEYS = ['fatStructural', 'ownEmulsifier', 'defaultStage', 'prepNote', 'requiresHeat'];
const FRACTION_FIELDS = ['fat', 'msnf', 'sugar', 'other', 'emulsifier', 'stabilizer'];
const FRACTION_TOLERANCE = 0.0005;
const POINT_TOLERANCE = 0.05;
const NEGLIGIBLE_RESIDUAL = 0.1;

const D10A_FLAGS = {
  'sweetened-condensed-milk':
    'D-10a exception: it carries about 42% added sucrose beyond its lactose, so only the lactose is taken out of the sugar figure (zeroing the sugar would lose the sucrose)',
  'yogurt-3.5pct':
    'D-10a exception: its 14% solids do not equal 14.2% MSNF plus 3.5% fat',
  'milk-chocolate':
    'D-10a exception: category flavor, yet it carries milk solids',
  ethanol: 'D-10a exception: zero water and zero solids',
};
const D10A_IDS = Object.keys(D10A_FLAGS);

// How a proposed coefficient value was reached, by dataset id. A value a note
// marks [assumed] or [verify] is 'assumed'; a value reached only by reading a
// family name onto a row the note does not list is 'inferred'. Both reach Mark
// as review flags. Rows with a coefficients entry and no reading here follow a
// note row directly.
export const COEFFICIENT_READINGS = {
  'egg-yolk': ['assumed'],
  'whole-egg': ['assumed', 'inferred'],
  'yogurt-3.5pct': ['assumed', 'inferred'],
  ethanol: ['assumed'],
  'rum-40pct': ['assumed'],
  'alcohol-40pct': ['assumed'],
  'invert-partial': ['inferred'],
  'trimoline-full': ['inferred'],
  honey: ['inferred'],
  'hfcs-42': ['inferred'],
  'hfcs-55': ['inferred'],
  'hfcs-90': ['inferred'],
  'corn-syrup-64de': ['inferred'],
  'corn-syrup-42de': ['inferred'],
  'corn-syrup-36de': ['inferred'],
  'corn-syrup-32de': ['inferred'],
  'corn-syrup-20de': ['inferred'],
  'high-maltose-cs-55de': ['inferred'],
  lactose: ['inferred'],
  maltose: ['inferred'],
  trehalose: ['inferred'],
  'atomized-glucose-40de': ['inferred'],
  'maltodextrin-18de': ['inferred'],
  'maltodextrin-15de': ['inferred'],
  'maltodextrin-10de': ['inferred'],
  'maltodextrin-5de': ['inferred'],
  sorbitol: ['inferred'],
  erythritol: ['inferred'],
  xylitol: ['inferred'],
  glycerol: ['inferred'],
  inulin: ['inferred'],
  polydextrose: ['inferred'],
  'evaporated-milk': ['inferred'],
  'sweetened-condensed-milk': ['inferred'],
  'butter-unsalted': ['inferred'],
  'whole-milk-powder': ['inferred'],
  'dried-buttermilk-powder-sweet': ['inferred'],
  buttermilk: ['inferred'],
  'buttermilk-light': ['inferred'],
  'sour-cream': ['inferred'],
  'coconut-milk': ['inferred'],
  cmc: ['inferred'],
  'sodium-alginate': ['inferred'],
  xanthan: ['inferred'],
  pectin: ['inferred'],
  'mono-diglycerides': ['inferred'],
  'polysorbate-80': ['inferred'],
  'almond-paste-pure': ['inferred'],
  'hazelnut-paste-pure': ['inferred'],
  'pistachio-paste-pure': ['inferred'],
  'chocolate-dark': ['inferred'],
  'milk-chocolate': ['inferred'],
};

// The same, for the 26 existing entries (library key). The planner's readings
// D-20 names are 'inferred'; allulose and vanilla extract after_heat are the
// process-stages note's [assumed] / [verify] rows.
export const EXISTING_READINGS = {
  stabilizerMix4421: ['inferred'],
  skimMilkPowder: ['inferred'],
  cocoaPowder: ['inferred'],
  coconutCream: ['inferred'],
  shreddedCoconut: ['inferred'],
  coconutMilk: ['inferred'],
  allulose: ['assumed'],
  vanillaExtract: ['assumed'],
};

// Calls the plan settles by rule rather than by the converter's judgement.
const NAMED_CALLS = {
  'whole-milk': "D-09 names it: 3.25% fat is not the app's 3.5% (a different product)",
  'heavy-cream-36': "RESEARCH Pitfall 5: it is the app's heavyCream",
  'lambda-carrageenan': "RESEARCH Pitfall 5: it is the app's carrageenan",
};

const round4 = (value) => Number(value.toFixed(4));
const round6 = (value) => Number(value.toFixed(6));
const fraction = (points) => round6(points / 100);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** 'skim-milk-powder' -> 'skimMilkPowder'; characters outside A-Z, a-z, 0-9 are dropped ('yogurt-3.5pct' -> 'yogurt35pct'). */
export function camelKey(datasetId) {
  const [first, ...rest] = String(datasetId).split('-');
  const joined = first.toLowerCase() + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return joined.replace(/[^A-Za-z0-9]/g, '');
}

const normalisedName = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');

/** Throws a TypeError naming the id when a coefficients object breaks the five-key rules (D-20, T-09-44). */
export function checkCoefficients(id, coefficients) {
  if (!isObject(coefficients)) throw new TypeError(`${id}: coefficients must be an object`);
  for (const [name, value] of Object.entries(coefficients)) {
    if (!COEFFICIENT_KEYS.includes(name)) {
      throw new TypeError(
        `${id}: "${name}" is not one of the five settable coefficients (${COEFFICIENT_KEYS.join(', ')}); titratableAcidity comes only from the dairy rule`,
      );
    }
    if (value === null) continue;
    if (name === 'prepNote' && typeof value !== 'string') {
      throw new TypeError(`${id}: prepNote must be a string or null`);
    }
    if (['fatStructural', 'ownEmulsifier', 'requiresHeat'].includes(name) && typeof value !== 'boolean') {
      throw new TypeError(`${id}: ${name} must be a boolean or null`);
    }
    if (name === 'defaultStage' && !STAGE_IDS.includes(value)) {
      throw new TypeError(`${id}: defaultStage "${value}" is not one of the twelve stage ids`);
    }
  }
}

/** The source text for each figure of a row: the dataset's sources expanded through meta.sources, and for pac the pac_provenance first. */
export function buildSourceText(row, meta = {}) {
  const known = isObject(meta.sources) ? meta.sources : {};
  const expand = (tag) => {
    const text = String(tag).trim();
    const space = text.indexOf(' ');
    const head = space === -1 ? text : text.slice(0, space);
    const tail = space === -1 ? '' : text.slice(space + 1).trim();
    if (!Object.hasOwn(known, head)) return text;
    return tail ? `${known[head]} — ${tail}` : known[head];
  };
  const figure = (Array.isArray(row.sources) ? row.sources : []).map(expand).join('; ');
  const provenance = typeof row.pac_provenance === 'string' ? row.pac_provenance.trim() : '';
  const pac = [provenance, figure].filter(Boolean).join('; ');
  return { figure, pac };
}

/**
 * One dataset row to one library entry (D-10, D-10a, D-20, LIB-07). Percentages are
 * divided by 100; PAC and POD keep their scale; the lactose the engine adds back for
 * a row with milk solids is taken out first, so 100 g computes the dataset's own PAC and POD.
 */
export function convertEntry(row, meta, key, coefficients = {}) {
  checkCoefficients(row.id, coefficients);

  const liquid = LIQUID_IDS.includes(row.id);
  const gum = row.category === 'stabilizer' || row.category === 'emulsifier';
  const composition = {};
  const put = (field, value) => {
    if (value !== 0) composition[field] = value;
  };
  let msnfFraction = 0;

  if (liquid) {
    // RESEARCH Pitfall 7: the app derives water as mass minus solids and cannot hold ethanol as a part,
    // so composition keeps only pac. alcohol-40pct's dataset solids are its ethanol, not solids.
    const pac = round4(row.pac);
    if (Math.abs(pac) >= NEGLIGIBLE_RESIDUAL) composition.pac = pac;
  } else {
    let lactose = 0;
    if (gum) {
      composition[row.category] = fraction(row.solids_pct);
    } else {
      const fat = row.fat_pct;
      let msnf = row.msnf_pct;
      if (fat + msnf > row.solids_pct + 0.15) msnf = round4(row.solids_pct - fat);
      lactose = msnf * LACTOSE_FRACTION_OF_MSNF;
      const sugar = msnf > 0 ? Math.max(0, row.sugars_pct - lactose) : row.sugars_pct;
      msnfFraction = fraction(msnf);
      const fatFraction = fraction(fat);
      const sugarFraction = fraction(sugar);
      put('fat', fatFraction);
      put('msnf', msnfFraction);
      put('sugar', sugarFraction);
      put('other', Math.max(0, round6(row.solids_pct / 100 - fatFraction - msnfFraction - sugarFraction)));
    }
    const hasMilkSolids = msnfFraction > 0;
    const pac = round4(hasMilkSolids ? row.pac - (lactose * PAC_LACTOSE) / 100 : row.pac);
    const pod = round4(hasMilkSolids ? row.pod - (lactose * POD_LACTOSE) / 100 : row.pod);
    if (Math.abs(pac) >= NEGLIGIBLE_RESIDUAL) composition.pac = pac;
    if (Math.abs(pod) >= NEGLIGIBLE_RESIDUAL) composition.pod = pod;
  }

  const text = buildSourceText(row, meta);
  const basis = {};
  const source = {};
  for (const field of Object.keys(composition)) {
    basis[field] = 'inherited';
    const sourceText = field === 'pac' ? text.pac : text.figure;
    if (sourceText) source[field] = sourceText;
  }

  const dairy = row.category === 'dairy' && row.msnf_pct > 0;
  const derivesAcidity = dairy && !CULTURED_DAIRY_IDS.includes(row.id);
  const titratableAcidity = derivesAcidity ? round6(msnfFraction * ACID_PER_MSNF) : null;
  if (derivesAcidity) {
    basis.titratableAcidity = 'derived';
    source.titratableAcidity = ACID_SOURCE;
  }

  const dataNote = typeof row.notes === 'string' ? row.notes.trim() : '';
  const note = liquid ? [dataNote, LIQUID_NOTE].filter(Boolean).join(' ') : dataNote;

  return {
    name: row.name,
    category: row.category,
    ...(dairy ? { dairy: true } : {}),
    composition,
    basis,
    source,
    ...(note ? { note } : {}),
    titratableAcidity,
    fatStructural: coefficients.fatStructural ?? null,
    ownEmulsifier: coefficients.ownEmulsifier ?? null,
    defaultStage: coefficients.defaultStage ?? null,
    prepNote: coefficients.prepNote ?? null,
    requiresHeat: coefficients.requiresHeat ?? null,
  };
}

const COEFFICIENT_FLAG_TEXT = {
  assumed: 'coefficient assumed',
  inferred: 'coefficient inferred',
};

/** The review reasons for one row, each with what the converter did. Coefficient flags start with "coefficient". */
export function reviewFlags(row, entry) {
  const flags = [];
  const composition = entry.composition;
  const liquid = LIQUID_IDS.includes(row.id);
  const gum = row.category === 'stabilizer' || row.category === 'emulsifier';

  if (liquid) {
    flags.push(
      `liquid the balance cannot hold: ${row.name} is neither water nor solids; composition keeps only pac (${composition.pac}) and the note says so`,
    );
  } else if (!gum) {
    if (row.fat_pct + row.msnf_pct > row.solids_pct + 0.15) {
      flags.push(
        `dataset solids inconsistent: fat ${row.fat_pct} + MSNF ${row.msnf_pct} exceeds solids ${row.solids_pct}; solids trusted, MSNF read as solids minus fat (${round4(row.solids_pct - row.fat_pct)})`,
      );
    }
    const written = FRACTION_FIELDS.reduce((sum, field) => sum + (composition[field] ?? 0), 0);
    const removed = written - row.solids_pct / 100;
    if (removed > FRACTION_TOLERANCE) {
      flags.push(`other floored at 0: the written parts exceed solids by ${round4(removed * 100)} points`);
    }
    if (row.msnf_pct > 0) {
      for (const field of ['pac', 'pod']) {
        const value = composition[field] ?? 0;
        if (value <= -NEGLIGIBLE_RESIDUAL) {
          flags.push(
            `negative ${field.toUpperCase()} residual kept (${value}): the dataset's ${field.toUpperCase()} is lower than its own lactose (RESEARCH A2)`,
          );
        }
      }
      const podResidual = composition.pod ?? 0;
      if (podResidual >= 1) {
        flags.push(
          `POD residual ${podResidual} after removing lactose is far above the 0.5 to 0.8 the other milks leave; kept as the dataset gives it`,
        );
      }
    }
    if (row.category === 'flavor' && row.msnf_pct > 0) {
      flags.push(
        `category flavor holds milk solids (MSNF ${row.msnf_pct}): not marked dairy, lactose still taken out so 100 g computes the dataset's PAC and POD`,
      );
    }
  }
  if (D10A_FLAGS[row.id]) flags.push(D10A_FLAGS[row.id]);
  if (CULTURED_DAIRY_IDS.includes(row.id)) flags.push(CULTURED_FLAG);
  for (const reading of COEFFICIENT_READINGS[row.id] ?? []) flags.push(COEFFICIENT_FLAG_TEXT[reading]);
  return flags;
}

/** The composition fields (and dairy) whose converted value differs from the app's beyond the gate's tolerance. */
export function sameDiffers(appEntry, converted) {
  const fields = new Set([...Object.keys(appEntry.composition ?? {}), ...Object.keys(converted.composition ?? {})]);
  const differs = [];
  for (const field of fields) {
    const app = appEntry.composition?.[field] ?? 0;
    const value = converted.composition?.[field] ?? 0;
    const tolerance = field === 'pac' || field === 'pod' ? POINT_TOLERANCE : FRACTION_TOLERANCE;
    if (Math.abs(app - value) > tolerance) differs.push({ field, app, converted: value });
  }
  const appDairy = appEntry.dairy === true;
  const convertedDairy = converted.dairy === true;
  if (appDairy !== convertedDairy) differs.push({ field: 'dairy', app: appDairy, converted: convertedDairy });
  return differs.sort((a, b) => (a.field < b.field ? -1 : a.field > b.field ? 1 : 0));
}

const headWords = (name) =>
  String(name)
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');

/** Existing keys whose entry name shares its first two words with the row's name. A review aid, never a refusal. */
export function nearNames(row, lib = appLibrary) {
  const head = headWords(row.name);
  if (!head) return [];
  return Object.keys(lib)
    .filter((key) => headWords(lib[key].name) === head)
    .sort();
}

/** Splits the dataset into new entries and same pairs under the reviewed mapping, refusing every ambiguity. */
export function planMerge(rows, mapping, lib = appLibrary, meta = {}) {
  const same = mapping.same ?? {};
  const different = mapping.different ?? {};
  const renamed = mapping.renamed ?? {};
  const coefficients = mapping.coefficients ?? {};
  const ids = new Set(rows.map((row) => row.id));
  const libraryKeys = Object.keys(lib);

  for (const [bucket, entries] of [['same', same], ['different', different], ['renamed', renamed], ['coefficients', coefficients]]) {
    for (const id of Object.keys(entries)) {
      if (!ids.has(id)) throw new Error(`mapping ${bucket}: "${id}" is not a dataset id`);
    }
  }
  for (const id of Object.keys(same)) {
    if (!libraryKeys.includes(same[id])) throw new Error(`mapping same: "${id}" maps to "${same[id]}", which is not a library key`);
  }
  for (const id of ids) {
    const buckets = [['same', same], ['different', different], ['renamed', renamed]].filter(([, entries]) => Object.hasOwn(entries, id));
    if (buckets.length > 1) {
      throw new Error(`mapping: "${id}" is in more than one of ${buckets.map(([name]) => name).join(', ')}`);
    }
  }
  for (const id of Object.keys(coefficients)) {
    if (Object.hasOwn(same, id)) {
      throw new Error(`mapping coefficients: "${id}" is a same pair; its six keys are written into data/library.js, not here`);
    }
  }

  const keyFor = (id) => {
    if (Object.hasOwn(different, id)) return different[id];
    if (Object.hasOwn(renamed, id)) return renamed[id];
    return camelKey(id);
  };
  const librarySet = new Set(libraryKeys);
  const libraryNames = new Map(libraryKeys.map((key) => [normalisedName(lib[key].name), key]));
  const newKeys = new Map();
  const newEntries = {};
  const samePairs = {};
  const review = [];

  for (const row of rows) {
    const decided = Object.hasOwn(same, row.id) || Object.hasOwn(different, row.id) || Object.hasOwn(renamed, row.id);
    if (Object.hasOwn(same, row.id)) {
      const libraryId = same[row.id];
      const converted = convertEntry(row, meta, libraryId, {});
      samePairs[row.id] = { libraryId, converted, differs: sameDiffers(lib[libraryId], converted) };
      review.push({ id: row.id, key: libraryId, flags: reviewFlags(row, converted) });
      continue;
    }
    if (!decided && librarySet.has(camelKey(row.id))) {
      throw new Error(`"${row.id}" has the key of an existing entry ("${camelKey(row.id)}") but is in neither same nor different`);
    }
    if (!decided && libraryNames.has(normalisedName(row.name))) {
      throw new Error(`"${row.id}" has the name of the existing entry "${libraryNames.get(normalisedName(row.name))}" but is in neither same nor different`);
    }
    const key = keyFor(row.id);
    if (librarySet.has(key)) throw new Error(`"${row.id}" would take the key "${key}" of an existing entry`);
    if (newKeys.has(key)) throw new Error(`"${row.id}" and "${newKeys.get(key)}" would both take the key "${key}"`);
    newKeys.set(key, row.id);
    const entry = convertEntry(row, meta, key, coefficients[row.id] ?? {});
    newEntries[key] = entry;
    review.push({ id: row.id, key, flags: reviewFlags(row, entry) });
  }
  return { newEntries, samePairs, review };
}

/** The call a same or different mapping makes, with the rule that settles it, or null when only the converter's judgement makes it. */
export function settledBy(call, row, converted, appEntry) {
  if (Object.hasOwn(NAMED_CALLS, row.id)) return NAMED_CALLS[row.id];
  if (call !== 'same') return null;
  const simple = (name) => normalisedName(String(name).replace(/\([^)]*\)/g, '').split(',')[0]);
  const a = simple(row.name);
  const b = simple(appEntry.name);
  const namesAlike = a !== '' && b !== '' && (a.includes(b) || b.includes(a));
  const fatGap = Math.abs((converted.composition.fat ?? 0) - (appEntry.composition.fat ?? 0)) * 100;
  if (namesAlike && fatGap <= 0.5) {
    return `names alike after normalising ("${row.name}" and "${appEntry.name}") and fat within 0.5 point (${round4(fatGap)})`;
  }
  return null;
}

const sortedObject = (object) =>
  Object.fromEntries(Object.entries(object).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

const fatPoints = (composition) => round4((composition.fat ?? 0) * 100);

function existingCoefficientValues(lib, existingCoefficients) {
  const existing = {};
  for (const key of Object.keys(lib)) {
    const entry = lib[key];
    const set = existingCoefficients[key] ?? {};
    const dairyRule = entry.dairy === true && (entry.composition.msnf ?? 0) > 0;
    existing[key] = {
      titratableAcidity: dairyRule ? round6(entry.composition.msnf * ACID_PER_MSNF) : null,
      fatStructural: set.fatStructural ?? null,
      ownEmulsifier: set.ownEmulsifier ?? null,
      defaultStage: set.defaultStage ?? null,
      prepNote: set.prepNote ?? null,
      requiresHeat: set.requiresHeat ?? null,
    };
  }
  return existing;
}

const sixValues = (entry) =>
  `titratableAcidity ${entry.titratableAcidity}, fatStructural ${entry.fatStructural}, ownEmulsifier ${entry.ownEmulsifier}, defaultStage ${entry.defaultStage}, prepNote ${entry.prepNote === null ? 'null' : JSON.stringify(entry.prepNote)}, requiresHeat ${entry.requiresHeat}`;

function renderReview({ dataset, mapping, rows, plan, existing, lib }) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const reviewById = new Map(plan.review.map((item) => [item.id, item]));
  const lines = [];
  const open = [];
  const same = mapping.same ?? {};
  const different = mapping.different ?? {};

  lines.push('# Ingredient library review', '');
  lines.push(
    `Generated by app/scripts/convert-ingredient-seed.mjs from the dataset (version ${dataset.version}, ${dataset.count} ingredients) and app/scripts/ingredient-mapping.json. Edit the mapping or the converter and run it again; do not edit this file.`,
    '',
  );
  lines.push(
    'Mark reviews this list on Mark\'s List (look-p9-library-mapping). Each call marked **open** also has its own decide row (decide-p9-library-<dataset id>).',
    '',
  );

  lines.push('## Counts', '');
  lines.push(`- Dataset ingredients: ${dataset.count}`);
  lines.push(`- Same ingredient as one of the ${Object.keys(lib).length} existing entries (the app's values stay): ${Object.keys(plan.samePairs).length}`);
  lines.push(`- New entries: ${Object.keys(plan.newEntries).length}`);
  lines.push(`- Different products given a distinct key: ${Object.keys(different).length}`);
  lines.push('');

  lines.push('## Same pairs', '');
  lines.push('The app keeps its own values for every pair. Each differing figure shows the app value against the converted dataset value.', '');
  for (const id of Object.keys(plan.samePairs).sort()) {
    const pair = plan.samePairs[id];
    const row = byId.get(id);
    const rule = settledBy('same', row, pair.converted, lib[pair.libraryId]);
    const call = rule ? `settled: ${rule}` : `**open**: only the converter's judgement makes this call (decide-p9-library-${id})`;
    if (!rule) open.push(id);
    lines.push(`- \`${id}\` ("${row.name}") is \`${pair.libraryId}\` ("${lib[pair.libraryId].name}"). ${call}.`);
    if (pair.differs.length === 0) {
      lines.push('  - No figure differs beyond the gate\'s tolerance.');
    } else {
      for (const diff of pair.differs) lines.push(`  - ${diff.field}: app ${diff.app}, converted ${diff.converted}`);
    }
  }
  lines.push('');

  lines.push('## Different products', '');
  lines.push('A dataset ingredient whose key equals an existing key but is a different product keeps the app\'s entry and gets a distinct key.', '');
  for (const id of Object.keys(different).sort()) {
    const row = byId.get(id);
    const appKey = camelKey(id);
    const appEntry = lib[appKey];
    const entry = plan.newEntries[different[id]];
    const rule = settledBy('different', row, entry, appEntry ?? { name: '', composition: {} });
    const call = rule ? `settled: ${rule}` : `**open**: only the converter's judgement makes this call (decide-p9-library-${id})`;
    if (!rule) open.push(id);
    lines.push(
      `- \`${id}\` ("${row.name}", fat ${fatPoints(entry.composition)}) becomes \`${different[id]}\`, not ${appKey ? `\`${appKey}\` ("${appEntry?.name}", fat ${fatPoints(appEntry?.composition ?? {})})` : 'an existing entry'}. ${call}.`,
    );
  }
  lines.push('');

  lines.push('## Near names', '');
  lines.push('Dataset rows that are not same pairs, set beside every existing entry whose name starts with the same two words. A review aid: the converter refuses nothing here.', '');
  let nearCount = 0;
  for (const row of rows) {
    if (Object.hasOwn(same, row.id)) continue;
    const near = nearNames(row, lib);
    if (near.length === 0) continue;
    nearCount += 1;
    const entry = reviewById.get(row.id);
    const mine = plan.newEntries[entry.key];
    const others = near.map((key) => `\`${key}\` ("${lib[key].name}", fat ${fatPoints(lib[key].composition)})`).join(', ');
    lines.push(`- \`${row.id}\` ("${row.name}", fat ${fatPoints(mine.composition)}), new key \`${entry.key}\`, against ${others}`);
  }
  if (nearCount === 0) lines.push('- None.');
  lines.push('');

  lines.push('## Flagged rows', '');
  lines.push('Each row the converter could not map cleanly, with the reason and what it did. Every flagged row stays in the library as converted.', '');
  let flaggedCount = 0;
  for (const item of plan.review) {
    const reasons = item.flags.filter((flag) => !flag.startsWith('coefficient'));
    if (reasons.length === 0) continue;
    flaggedCount += 1;
    lines.push(`- \`${item.id}\` (\`${item.key}\`): ${reasons.join('; ')}`);
  }
  if (flaggedCount === 0) lines.push('- None.');
  lines.push('');

  lines.push('## Keys changed', '');
  lines.push('Keys that are not the plain camelCase of the dataset id.', '');
  let changedCount = 0;
  for (const item of plan.review) {
    if (Object.hasOwn(same, item.id)) continue;
    if (item.key === camelKey(item.id) && /^[a-z0-9-]+$/.test(item.id)) continue;
    changedCount += 1;
    lines.push(`- \`${item.id}\` is keyed \`${item.key}\``);
  }
  if (changedCount === 0) lines.push('- None.');
  lines.push('');

  lines.push('## Coefficients', '');
  lines.push('The six D-20 values for each new entry that holds any non-null coefficient. titratableAcidity comes only from the dairy rule (MSNF × 0.017, basis derived); a value flagged assumed or inferred is the planner\'s reading of the two notes, for Mark to change.', '');
  let coefficientCount = 0;
  for (const item of plan.review) {
    const entry = plan.newEntries[item.key];
    if (!entry || Object.hasOwn(same, item.id)) continue;
    const values = [entry.titratableAcidity, entry.fatStructural, entry.ownEmulsifier, entry.defaultStage, entry.prepNote, entry.requiresHeat];
    if (values.every((value) => value === null)) continue;
    coefficientCount += 1;
    const flags = item.flags.filter((flag) => flag.startsWith('coefficient'));
    lines.push(`- \`${item.key}\` (\`${item.id}\`): ${sixValues(entry)}${flags.length ? ` — ${flags.join(', ')}` : ''}`);
  }
  if (coefficientCount === 0) lines.push('- None.');
  lines.push('');

  lines.push('## Existing entries', '');
  lines.push('The six D-20 values proposed for each of the existing entries, exactly the list plan 09-07 writes into data/library.js once Mark approves it.', '');
  for (const key of Object.keys(existing)) {
    const flags = (EXISTING_READINGS[key] ?? []).map((reading) => COEFFICIENT_FLAG_TEXT[reading]);
    lines.push(`- \`${key}\`: ${sixValues(existing[key])}${flags.length ? ` — ${flags.join(', ')}` : ''}`);
  }
  lines.push('');

  return { text: `${lines.join('\n')}`, open, flaggedCount };
}

const fail = (message) => ({ exitCode: 1, message });

const readJson = (file, label) => {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (error) {
    throw new Error(`${label} not readable at ${file}: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} at ${file} is not valid JSON: ${error.message}`);
  }
};

/**
 * Reads the dataset and the mapping, then writes the module, the checks file and the review list.
 * Returns { exitCode, message, counts }; exit code 1 means nothing was written.
 */
export function runConverter({ datasetPath, mappingPath, outDir } = {}) {
  try {
    const dataset = readJson(
      datasetPath ?? path.join(os.homedir(), 'Downloads', 'sprinkles-ingredient-seed-db.json'),
      'dataset',
    );
    if (!isObject(dataset) || !Array.isArray(dataset.ingredients) || dataset.ingredients.length === 0) {
      return fail('dataset holds no ingredients');
    }
    const mapping = readJson(mappingPath ?? path.join(SCRIPT_DIR, 'ingredient-mapping.json'), 'mapping');
    const rows = dataset.ingredients;
    const meta = isObject(dataset.meta) ? dataset.meta : {};
    const lib = appLibrary;

    const existingCoefficients = mapping.existingCoefficients;
    if (!isObject(existingCoefficients)) return fail('mapping has no existingCoefficients object');
    const libraryKeys = Object.keys(lib);
    const missing = libraryKeys.filter((key) => !Object.hasOwn(existingCoefficients, key));
    const unknown = Object.keys(existingCoefficients).filter((key) => !libraryKeys.includes(key));
    if (missing.length > 0) return fail(`existingCoefficients lacks library keys: ${missing.join(', ')}`);
    if (unknown.length > 0) return fail(`existingCoefficients names keys the library lacks: ${unknown.join(', ')}`);
    for (const key of libraryKeys) checkCoefficients(key, existingCoefficients[key]);

    const plan = planMerge(rows, mapping, lib, meta);

    const entries = {};
    for (const [key, entry] of Object.entries(plan.newEntries)) entries[key] = entry;
    const entriesById = {};
    for (const item of plan.review) {
      if (!Object.hasOwn(plan.samePairs, item.id)) entriesById[item.id] = item.key;
    }
    const sameIds = Object.keys(plan.samePairs);
    const newIds = Object.keys(entriesById);
    const allIds = rows.map((row) => row.id);
    const named = [...sameIds, ...newIds];
    const duplicated = named.filter((id, index) => named.indexOf(id) !== index);
    const dropped = allIds.filter((id) => !named.includes(id));
    if (duplicated.length > 0 || dropped.length > 0 || named.length !== allIds.length) {
      return fail(`samePairs and entries must name every dataset id exactly once (duplicated: ${duplicated.join(', ') || 'none'}; dropped: ${dropped.join(', ') || 'none'})`);
    }

    const existing = existingCoefficientValues(lib, existingCoefficients);
    const checks = {
      dataset: { version: meta.version ?? null, count: rows.length },
      rows: {},
      samePairs: {},
      entries: sortedObject(entriesById),
      existing: sortedObject(existing),
    };
    for (const row of rows) {
      if (!(row.msnf_pct > 0) && !D10A_IDS.includes(row.id)) continue;
      const key = Object.hasOwn(plan.samePairs, row.id) ? plan.samePairs[row.id].libraryId : entriesById[row.id];
      checks.rows[row.id] = { key, pac: row.pac, pod: row.pod, solidsPct: row.solids_pct, msnfPct: row.msnf_pct };
    }
    checks.rows = sortedObject(checks.rows);
    for (const id of sameIds) {
      const pair = plan.samePairs[id];
      checks.samePairs[id] = {
        libraryId: pair.libraryId,
        converted: { dairy: pair.converted.dairy === true, composition: pair.converted.composition },
        differs: pair.differs,
      };
    }
    checks.samePairs = sortedObject(checks.samePairs);

    const review = renderReview({
      dataset: { version: meta.version ?? 'unknown', count: rows.length },
      mapping,
      rows,
      plan,
      existing,
      lib,
    });

    const header = [
      '// GENERATED by app/scripts/convert-ingredient-seed.mjs. Do not edit by hand: change the reviewed',
      '// mapping (app/scripts/ingredient-mapping.json) or the converter and run it again.',
      `// Dataset version ${JSON.stringify(String(meta.version ?? 'unknown')).replace(/[\r\n]/g, ' ')}, ${rows.length} ingredients, read once offline from ~/Downloads/sprinkles-ingredient-seed-db.json.`,
      '// Reviewed through app/scripts/ingredient-review.md (D-16). Holds the new entries only; the app does not import it yet.',
      '',
    ].join('\n');
    const moduleText = `${header}export const librarySeedDb = ${JSON.stringify(sortedObject(entries), null, 2)};\n`;
    const checksText = `${JSON.stringify(checks, null, 2)}\n`;
    const reviewText = `${review.text}\n`;

    const moduleFile = outDir ? path.join(outDir, 'library-seed-db.js') : path.join(APP_DIR, 'src', 'data', 'library-seed-db.js');
    const checksFile = outDir ? path.join(outDir, 'ingredient-seed-checks.json') : path.join(APP_DIR, 'scripts', 'ingredient-seed-checks.json');
    const reviewFile = outDir ? path.join(outDir, 'ingredient-review.md') : path.join(APP_DIR, 'scripts', 'ingredient-review.md');
    if (outDir) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(moduleFile, moduleText);
    fs.writeFileSync(checksFile, checksText);
    fs.writeFileSync(reviewFile, reviewText);

    const counts = {
      dataset: rows.length,
      newEntries: newIds.length,
      samePairs: sameIds.length,
      different: Object.keys(mapping.different ?? {}).length,
      flagged: review.flaggedCount,
      open: review.open,
    };
    return {
      exitCode: 0,
      message: `${counts.dataset} dataset ingredients: ${counts.newEntries} new entries (${counts.different} different products), ${counts.samePairs} same pairs, ${counts.flagged} flagged rows, ${counts.open.length} open call${counts.open.length === 1 ? '' : 's'}${counts.open.length ? ` (${counts.open.join(', ')})` : ''}`,
      counts,
    };
  } catch (error) {
    return fail(error.message);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = runConverter({ datasetPath: process.argv[2] });
  if (result.exitCode === 0) console.log(result.message);
  else console.error(`convert-ingredient-seed: ${result.message}`);
  process.exit(result.exitCode);
}
