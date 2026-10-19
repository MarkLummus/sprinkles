// Pure. No framework, no DOM, no store import. The Sheet code is the printed
// sheet's match-back handle (PRINT-04; D-08 to D-13): a maker holding paper
// types the code and lands on the version it came from.
//
// From Phase 9 the code is STORED on the version (version.sheetCode; decision
// 19, amending Phase 4 D-08 and D-09): print and search read the stored field,
// and no edit changes it. sheetCode(version) below remains only to compute the
// seeded versions' codes once (data/seed-sheet-codes.js) and to keep the golden
// vector; nothing recomputes a code from content at run time.
//
// A new version's code is derived once from its id at creation and stored
// (D-04; codeFromVersionId): the same id gives the same code on any device, and
// a change to that derivation is a new tag, never an edit.
//
// The legacy derivation hashes the version id plus the recipe content both
// print formats share, so an unchanged version always yields the same code.
// There is no nonce: the same input is the same code on every device and every
// day.
//
// ONE-WAY. Once a sheet is in the binder, its code is on paper. Changing the
// canonical form below, the hash, or the encoding strands every printed code,
// so sheetCode.test.js pins Olive Oil v1's code as a golden vector. A change
// to any of it is a NEW derivation tag (SHEET_CODE_DERIVATION), never an edit.
//
// WHAT COUNTS (the recipe content the Sheet and the later Recipe book format
// both print, D-22a):
//   - version.id
//   - sheetTitle, sheetDescription, versionLabel
//   - the Before you start note texts, in order
//   - each active ingredient line, in stored order: ingredientName, and for
//     each active portion its printed step number and stored grams
//   - each active step, in method order: leadIn, instruction, purpose, aside,
//     and its targets as label/value pairs
//
// WHAT DOES NOT (paper-neutral, so the code survives it): reason, citedBatchId,
// createdAt, parentVersionId, parentVersionLabel, declaredAxes, declaredFlaws
// and any declared problems, Balance figures and the embedded coefficients
// (an import can change those without the paper changing), the targets bands,
// equipment, process, and every removed row, line or step. Layout and log
// pages are never read.
//
// Hash: 64-bit FNV-1a over the canonical text's UTF-8 bytes, top 40 bits kept,
// written as eight Crockford base32 symbols grouped XXXX-XXXX. Synchronous
// and pure JavaScript on purpose: the browser's Web Crypto digest exists only
// in secure contexts and device UAT is plain HTTP over the LAN (see id.js).
import { activeRows, activeSteps } from './rows.js';
import { displayNumbers, displayNumberOf } from './stepNumbers.js';

export const SHEET_CODE_DERIVATION = 'sprinkles-sheet-code:1';

// The tag of the id derivation below. Like SHEET_CODE_DERIVATION, a change to it
// is a NEW tag, never an edit.
export const SHEET_CODE_ID_DERIVATION = 'sprinkles-sheet-code-id:1';

// Crockford base32: no I, L, O or U. crockford.com/base32.html
export const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const FNV_OFFSET_BASIS = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const MASK_64 = 0xffffffffffffffffn;
const CODE_SYMBOLS = 8;

/**
 * printedContent(version) -> the recipe content the printed sheet carries, as
 * plain data built from explicit field lists (never a spread, never dependent
 * on key order). Absent text reads ''.
 */
export function printedContent(version) {
  const method = version.method ?? [];
  const numbers = displayNumbers(method);
  const notes = (version.authored?.beforeYouStart ?? []).map((note) => note.text ?? '');
  const rows = activeRows({ rows: version.rows ?? [], method }).map((row) => ({
    name: row.ingredientName ?? '',
    portions: (row.portions ?? []).map((portion) => ({
      step: displayNumberOf(numbers, portion.step),
      grams: String(portion.grams),
    })),
  }));
  const steps = activeSteps({ method }).map((step) => ({
    leadIn: step.leadIn ?? '',
    instruction: step.instruction ?? '',
    purpose: step.purpose ?? '',
    aside: step.aside ?? '',
    targets: (step.targets ?? []).map((target) => ({ label: target.label ?? '', value: target.value ?? '' })),
  }));
  return {
    id: version.id,
    title: version.sheetTitle ?? '',
    description: version.sheetDescription ?? '',
    versionLabel: version.versionLabel ?? '',
    notes,
    rows,
    steps,
  };
}

/**
 * canonicalPrintedContent(version) -> the exact text that is hashed: a JSON
 * array of arrays in a fixed order, the derivation tag first, NFC-normalised
 * so a composed and a decomposed accent give one code.
 */
export function canonicalPrintedContent(version) {
  const content = printedContent(version);
  const canonical = [
    SHEET_CODE_DERIVATION,
    content.id,
    content.title,
    content.description,
    content.versionLabel,
    content.notes,
    content.rows.map((row) => [row.name, row.portions.map((portion) => [portion.step, portion.grams])]),
    content.steps.map((step) => [
      step.leadIn,
      step.instruction,
      step.purpose,
      step.aside,
      step.targets.map((target) => [target.label, target.value]),
    ]),
  ];
  return JSON.stringify(canonical).normalize('NFC');
}

function fnv1a64(bytes) {
  let hash = FNV_OFFSET_BASIS;
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * FNV_PRIME) & MASK_64;
  }
  return hash;
}

// The shared last step of both derivations: FNV-1a 64 over the bytes, the top
// 40 bits written as eight Crockford symbols grouped XXXX-XXXX.
function codeFromBytes(bytes) {
  let bits = fnv1a64(bytes) >> 24n; // top 40 of 64 bits
  let symbols = '';
  for (let i = 0; i < CODE_SYMBOLS; i += 1) {
    symbols = CROCKFORD_ALPHABET[Number(bits & 31n)] + symbols;
    bits >>= 5n;
  }
  return `${symbols.slice(0, 4)}-${symbols.slice(4)}`;
}

/**
 * sheetCode(version) -> 'XXXX-XXXX', the version's code derived from its
 * printed content (the legacy derivation). It computes the seeded versions'
 * codes once and keeps the golden vector; no run-time reader calls it.
 */
export function sheetCode(version) {
  return codeFromBytes(new TextEncoder().encode(canonicalPrintedContent(version)));
}

/**
 * codeFromVersionId(id) -> 'XXXX-XXXX', the code a new version stores, derived
 * once from its id (D-04): the UTF-8 bytes of SHEET_CODE_ID_DERIVATION, a colon
 * and the id, through the same hash and encoding as sheetCode. The same id gives
 * the same code on any device. Throws a TypeError for anything but a non-empty
 * string (a caller bug).
 */
export function codeFromVersionId(id) {
  if (typeof id !== 'string' || id === '') {
    throw new TypeError('version id must be a non-empty string');
  }
  return codeFromBytes(new TextEncoder().encode(`${SHEET_CODE_ID_DERIVATION}:${id}`));
}

/**
 * normaliseCode(input) -> 'XXXX-XXXX' when exactly eight Crockford symbols
 * remain after trimming, upper-casing, dropping hyphens and spaces, and
 * reading I and L as 1 and O as 0; otherwise null (U, anything outside the
 * alphabet, and any other length).
 */
export function normaliseCode(input) {
  if (typeof input !== 'string') return null;
  const symbols = codeSymbols(input);
  if (symbols.length !== CODE_SYMBOLS) return null;
  for (const symbol of symbols) {
    if (!CROCKFORD_ALPHABET.includes(symbol)) return null;
  }
  return `${symbols.slice(0, 4)}-${symbols.slice(4)}`;
}

// The symbols a typed code is read as: upper-cased, spaces and hyphens
// dropped, I and L read as 1 and O as 0. normaliseCode and codeProblem both
// read through it, so a count of symbols means the same in each.
function codeSymbols(input) {
  return input
    .toUpperCase()
    .replace(/[\s-]+/g, '')
    .replace(/[IL]/g, '1')
    .replace(/O/g, '0');
}

/**
 * codeProblem(input) -> null when normaliseCode would accept `input`; otherwise
 * why it would not, as { reason }:
 *   'length'          not eight symbols; { reason, count } with the number of
 *                     symbols normaliseCode reads, counted by code point so an
 *                     emoji is one. Empty, whitespace-only, hyphens-only and
 *                     non-string input read as count 0
 *   'other-character' eight symbols, one outside the alphabet and not U
 *   'letter-u'        eight symbols, a U, and nothing else outside the alphabet
 * Checked in that order: length beats another character, and another
 * character beats U.
 */
export function codeProblem(input) {
  const symbols = typeof input === 'string' ? [...codeSymbols(input)] : [];
  if (symbols.length !== CODE_SYMBOLS) return { reason: 'length', count: symbols.length };
  let hasU = false;
  for (const symbol of symbols) {
    if (symbol === 'U') hasU = true;
    else if (!CROCKFORD_ALPHABET.includes(symbol)) return { reason: 'other-character' };
  }
  if (hasU) return { reason: 'letter-u' };
  return null;
}

/**
 * sheetCodeProblems(storedVersions, incomingVersions) -> the ways the store would
 * break the Sheet code's two rules (D-04a, D-04b) once `incomingVersions` replace
 * the stored versions of the same ids:
 *   { kind: 'clash', code, versionId, otherVersionId }   two different ids share
 *       a code in the resulting store; each pair once, in code then id order
 *   { kind: 'changed', versionId, storedCode, incomingCode }   an incoming
 *       version's stored record of the same id carries a different code
 * A version is never a clash with its own stored record, and a version with no
 * string sheetCode takes part in no clash. Pure: the repository reads the
 * stored versions and calls this inside its write transaction.
 */
export function sheetCodeProblems(storedVersions, incomingVersions) {
  const incomingIds = new Set(incomingVersions.map((version) => version.id));
  const resulting = [
    ...storedVersions.filter((version) => !incomingIds.has(version.id)),
    ...incomingVersions,
  ];

  const problems = [];
  const idsByCode = new Map();
  for (const version of resulting) {
    if (typeof version.sheetCode !== 'string') continue;
    if (!idsByCode.has(version.sheetCode)) idsByCode.set(version.sheetCode, []);
    idsByCode.get(version.sheetCode).push(version.id);
  }
  for (const code of [...idsByCode.keys()].sort()) {
    const ids = [...new Set(idsByCode.get(code))].sort();
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        problems.push({ kind: 'clash', code, versionId: ids[i], otherVersionId: ids[j] });
      }
    }
  }

  const storedById = new Map(storedVersions.map((version) => [version.id, version]));
  for (const incoming of incomingVersions) {
    const stored = storedById.get(incoming.id);
    if (stored && typeof stored.sheetCode === 'string' && stored.sheetCode !== incoming.sheetCode) {
      problems.push({
        kind: 'changed',
        versionId: incoming.id,
        storedCode: stored.sheetCode,
        incomingCode: incoming.sheetCode,
      });
    }
  }
  return problems;
}

/**
 * SheetCodeError -> what the repository throws when a write would store a
 * clashing or changed Sheet code (CODE-01). `problems` is the list
 * sheetCodeProblems returned. Nothing is written and no code is re-drawn.
 */
export class SheetCodeError extends Error {
  constructor(problems) {
    super('The Sheet code rule would be broken, so the version was not stored.');
    this.name = 'SheetCodeError';
    this.problems = problems;
  }
}

/**
 * findVersionsByCode(versions, code) -> every version whose STORED sheetCode
 * equals the normalised `code`, newest createdAt first and then by id, so a
 * 40-bit collision never depends on store order. An unnormalisable code
 * returns []; a version with no stored code is never found.
 */
export function findVersionsByCode(versions, code) {
  const wanted = normaliseCode(code);
  if (wanted === null) return [];
  return versions
    .filter((version) => version.sheetCode === wanted)
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
      if (a.id === b.id) return 0;
      return a.id < b.id ? -1 : 1;
    });
}
