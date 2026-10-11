// Domain suite for the Sheet code (PRINT-04; D-08 to D-13, D-22a). Runs under
// Vitest's default node environment: it imports no store, no component and no
// framework, which is what keeps the derivation provable as pure.
import { describe, it, expect } from 'vitest';
import {
  SHEET_CODE_DERIVATION,
  CROCKFORD_ALPHABET,
  printedContent,
  canonicalPrintedContent,
  sheetCode,
  normaliseCode,
  findVersionsByCode,
} from './sheetCode.js';
import { oliveOilVersion } from '../data/olive-oil.js';

const CODE_SHAPE = /^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;

// Two minimal versions that really do share a 40-bit code. Found once by a
// birthday search over versionLabel; pinned here so the collision rule is
// tested against the real derivation, not a stub. If the derivation ever
// changes, this pair stops colliding and the golden vector fails first.
const COLLIDING_CODE = 'XJ9K-948V';
function collider(label, extra = {}) {
  return { id: 'c', versionLabel: label, rows: [], method: [], ...extra };
}
// A second pinned pair, differing in id alone, for the id tie-break.
const ID_COLLIDING_CODE = 'FMR5-FBR9';
function idCollider(id, extra = {}) {
  return { id, versionLabel: 'x', rows: [], method: [], ...extra };
}

describe('sheetCode — the pinned derivation (D-08, one-way)', () => {
  it('names the canonical form with a tag that a change must bump', () => {
    expect(SHEET_CODE_DERIVATION).toBe('sprinkles-sheet-code:1');
    expect(JSON.parse(canonicalPrintedContent(oliveOilVersion))[0]).toBe(SHEET_CODE_DERIVATION);
  });

  it("gives Olive Oil v1 its pinned code — THIS VALUE IS ON PAPER AND MUST NEVER CHANGE", () => {
    // A failure here means the canonical form, the hash or the encoding moved,
    // which would strand every printed sheet. Make a new derivation tag
    // instead of editing this literal.
    expect(sheetCode(oliveOilVersion)).toBe('64JH-G408');
  });

  it('is deterministic: two calls and a structured clone give one code', () => {
    const first = sheetCode(oliveOilVersion);
    expect(sheetCode(oliveOilVersion)).toBe(first);
    expect(sheetCode(structuredClone(oliveOilVersion))).toBe(first);
  });

  it('has the format XXXX-XXXX over the Crockford alphabet', () => {
    expect(sheetCode(oliveOilVersion)).toMatch(CODE_SHAPE);
    expect(CROCKFORD_ALPHABET).toBe('0123456789ABCDEFGHJKMNPQRSTVWXYZ');
  });

  it('hashes NFC text, so a composed and a decomposed accent give one code', () => {
    const composed = { ...structuredClone(oliveOilVersion), sheetTitle: 'Café ice cream' };
    const decomposed = { ...structuredClone(oliveOilVersion), sheetTitle: 'Café ice cream' };
    expect(sheetCode(composed)).toBe(sheetCode(decomposed));
  });
});

describe('sheetCode — paper-neutral changes leave the code alone (D-22a)', () => {
  const base = sheetCode(oliveOilVersion);

  it.each([
    ['reason', (v) => { v.reason = 'Less salt'; }],
    ['citedBatchId', (v) => { v.citedBatchId = 'some-batch'; }],
    ['createdAt', (v) => { v.createdAt = '2030-01-01T00:00:00.000Z'; }],
    ['parentVersionId', (v) => { v.parentVersionId = 'older'; v.parentVersionLabel = 'older line'; }],
    ['declaredAxes', (v) => { v.declaredAxes = ['Sweetness', 'Salt']; }],
    ['an embedded coefficient', (v) => { v.rows[0].ingredient.fat = 99; }],
  ])('%s', (_name, change) => {
    const version = structuredClone(oliveOilVersion);
    change(version);
    expect(sheetCode(version)).toBe(base);
  });

  it("a removed row's grams cannot move the code once the row is out", () => {
    const out = structuredClone(oliveOilVersion);
    out.rows[5].removed = true;
    const outAndChanged = structuredClone(out);
    outAndChanged.rows[5].portions[0].grams = 999;
    expect(sheetCode(outAndChanged)).toBe(sheetCode(out));
  });
});

describe('sheetCode — printed changes move the code', () => {
  const base = sheetCode(oliveOilVersion);

  it.each([
    ['a portion’s grams', (v) => { v.rows[0].portions[0].grams = 121; }],
    ['a step’s instruction', (v) => { v.method[0].instruction += ' Twice.'; }],
    ['the sheet title', (v) => { v.sheetTitle = 'Olive Oil Gelato'; }],
    ['the version id', (v) => { v.id = 'olive-oil-ice-cream-v2'; }],
    ['a Before you start note', (v) => { v.authored.beforeYouStart[0].text = 'Taste it.'; }],
    ['a step target', (v) => { v.method[1].targets[0].value = '86 °C'; }],
    ['a removed step', (v) => { v.method[3].removed = true; }],
    ['a removed ingredient line', (v) => { v.rows[5].removed = true; }],
  ])('%s', (_name, change) => {
    const version = structuredClone(oliveOilVersion);
    change(version);
    expect(sheetCode(version)).not.toBe(base);
  });
});

describe('printedContent', () => {
  it('reads only the shared recipe content, with printed step numbers', () => {
    const content = printedContent(oliveOilVersion);
    expect(Object.keys(content).sort()).toEqual(
      ['description', 'id', 'notes', 'rows', 'steps', 'title', 'versionLabel'],
    );
    expect(content.rows[0]).toEqual({
      name: 'Whole milk',
      portions: [{ step: 2, grams: '120' }, { step: 3, grams: '250.4' }],
    });
    expect(content.notes).toHaveLength(2);
    expect(content.steps).toHaveLength(10);
    expect(content.steps[3].purpose).toContain('Mismatched jars');
    expect(content.steps[2].purpose).toBe('');
  });

  it('prints the step number after a removal, not the stored key', () => {
    const version = structuredClone(oliveOilVersion);
    version.method[0].removed = true;
    const milk = printedContent(version).rows[0];
    expect(milk.portions.map((portion) => portion.step)).toEqual([1, 2]);
  });
});

describe('normaliseCode', () => {
  it('reads k7qm2x9d, K7QM-2X9D and a padded lower-case code as one code', () => {
    expect(normaliseCode('k7qm2x9d')).toBe('K7QM-2X9D');
    expect(normaliseCode('K7QM-2X9D')).toBe('K7QM-2X9D');
    expect(normaliseCode(' k7qm-2x9d ')).toBe('K7QM-2X9D');
  });

  it('round-trips every alphabet symbol', () => {
    for (const symbol of CROCKFORD_ALPHABET) {
      expect(normaliseCode(symbol.repeat(8))).toBe(`${symbol.repeat(4)}-${symbol.repeat(4)}`);
      expect(normaliseCode(symbol.toLowerCase().repeat(8))).toBe(`${symbol.repeat(4)}-${symbol.repeat(4)}`);
    }
  });

  it('reads I and L as 1 and O as 0', () => {
    expect(normaliseCode('IIII-LLLL')).toBe('1111-1111');
    expect(normaliseCode('oooo-0000')).toBe('0000-0000');
    expect(normaliseCode('1l1l-0O0o')).toBe('1111-0000');
  });

  it('rejects U, other lengths, stray characters and non-strings', () => {
    expect(normaliseCode('UUUU-UUUU')).toBeNull();
    expect(normaliseCode('1234567')).toBeNull();
    expect(normaliseCode('123456789')).toBeNull();
    expect(normaliseCode('1234-567!')).toBeNull();
    expect(normaliseCode('')).toBeNull();
    expect(normaliseCode('   ')).toBeNull();
    expect(normaliseCode(null)).toBeNull();
    expect(normaliseCode(undefined)).toBeNull();
  });
});

describe('findVersionsByCode', () => {
  const other = { ...structuredClone(oliveOilVersion), id: 'other', sheetTitle: 'Other' };

  it('finds a version by its own code, in any case, with or without the hyphen', () => {
    const code = sheetCode(oliveOilVersion);
    expect(findVersionsByCode([other, oliveOilVersion], code)).toEqual([oliveOilVersion]);
    expect(findVersionsByCode([other, oliveOilVersion], code.toLowerCase().replace('-', ''))).toEqual([
      oliveOilVersion,
    ]);
  });

  it('returns [] for a code that matches nothing or cannot be read as a code', () => {
    expect(findVersionsByCode([oliveOilVersion], '0000-0000')).toEqual([]);
    expect(findVersionsByCode([oliveOilVersion], '')).toEqual([]);
    expect(findVersionsByCode([oliveOilVersion], 'UUUU-UUUU')).toEqual([]);
  });

  it('confirms the pinned colliding pair really collides', () => {
    expect(sheetCode(collider('x259595'))).toBe(COLLIDING_CODE);
    expect(sheetCode(collider('x1558660'))).toBe(COLLIDING_CODE);
  });

  it('orders a collision newest createdAt first, then by id, whatever the store order', () => {
    const older = collider('x259595', { id: 'c', createdAt: '2026-01-01T00:00:00.000Z' });
    const newer = collider('x1558660', { id: 'c', createdAt: '2026-02-01T00:00:00.000Z' });
    expect(findVersionsByCode([older, newer], COLLIDING_CODE)).toEqual([newer, older]);
    expect(findVersionsByCode([newer, older], COLLIDING_CODE)).toEqual([newer, older]);

  });

  it('breaks a createdAt tie by id, whatever the store order', () => {
    const at = '2026-01-01T00:00:00.000Z';
    const a = idCollider('k1037770', { createdAt: at });
    const b = idCollider('k2436248', { createdAt: at });
    expect(sheetCode(a)).toBe(ID_COLLIDING_CODE);
    expect(sheetCode(b)).toBe(ID_COLLIDING_CODE);
    expect(findVersionsByCode([a, b], ID_COLLIDING_CODE)).toEqual([a, b]);
    expect(findVersionsByCode([b, a], ID_COLLIDING_CODE)).toEqual([a, b]);
  });
});
