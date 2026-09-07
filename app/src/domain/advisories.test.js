// Domain suite for the four FORM2-02 structural advisories (D-05). Runs
// under Vitest's default node environment — imports no store, no
// component, and no framework. Every fixture is a structuredClone of the
// seeded olive oil version, edited per test.
import { describe, it, expect } from 'vitest';
import * as Advisories from './advisories.js';
import { oliveOilVersion } from '../data/olive-oil.js';

const { buildAdvisories } = Advisories;

function clone() {
  return structuredClone(oliveOilVersion);
}

function findRow(version, id) {
  return version.rows.find((row) => row.id === id);
}

function findStep(version, n) {
  return version.method.find((step) => step.n === n);
}

function removeRow(version, id) {
  findRow(version, id).removed = true;
}

function stateEveryBasisAsStated(version) {
  for (const row of version.rows) {
    if (!row.ingredient.basis) continue;
    for (const field of Object.keys(row.ingredient.basis)) {
      row.ingredient.basis[field] = 'stated';
    }
  }
}

describe('buildAdvisories — module shape', () => {
  it('exports exactly one function, buildAdvisories', () => {
    expect(Object.keys(Advisories)).toEqual(['buildAdvisories']);
  });
});

describe('buildAdvisories — the churned version', () => {
  it('returns four advisories, in the fixed order sub-scale, ultra-pasteurised, hydration, estimated', () => {
    const advisories = buildAdvisories(clone());
    expect(advisories.map((advisory) => advisory.key)).toEqual([
      'sub-scale',
      'ultra-pasteurised',
      'hydration',
      'estimated',
    ]);
  });

  it('gives every advisory a non-empty words string and a non-empty basis string', () => {
    const advisories = buildAdvisories(clone());
    expect(advisories.length).toBeGreaterThan(0);
    for (const advisory of advisories) {
      expect(typeof advisory.words).toBe('string');
      expect(advisory.words.length).toBeGreaterThan(0);
      expect(typeof advisory.basis).toBe('string');
      expect(advisory.basis.length).toBeGreaterThan(0);
    }
  });
});

describe('buildAdvisories — sub-scale amounts', () => {
  it('names the under-resolution rows, the blend parts and total, and the take for this batch', () => {
    const advisory = buildAdvisories(clone()).find((a) => a.key === 'sub-scale');
    expect(advisory.words).toContain('Guar gum');
    expect(advisory.words).toContain('Lambda carrageenan');
    expect(advisory.words).toContain('0.48 g');
    expect(advisory.words).toContain('0.16 g');
    expect(advisory.words).toContain('4.16 g');
    expect(advisory.words).toContain('1.92 g');
    expect(advisory.words).toContain('0.64 g');
    expect(advisory.words).toContain('6.72 g');
    expect(advisory.words).toContain('1.68 g');
    expect(advisory.basis).toContain('1 g');
    expect(advisory.basis).toContain('4');
  });

  it('is absent when the scale resolution is finer than every row', () => {
    const version = clone();
    version.equipment = { ...version.equipment, scaleResolutionG: 0.01 };
    const advisory = buildAdvisories(version).find((a) => a.key === 'sub-scale');
    expect(advisory).toBeUndefined();
  });

  it('never names a removed row, and goes entirely once both under-resolution rows are removed', () => {
    const version = clone();
    removeRow(version, 'row-11'); // guar gum
    removeRow(version, 'row-12'); // lambda carrageenan
    const advisories = buildAdvisories(version);
    const advisory = advisories.find((a) => a.key === 'sub-scale');
    expect(advisory).toBeUndefined();
    for (const a of advisories) {
      expect(a.words).not.toContain('Guar gum');
      expect(a.words).not.toContain('Lambda carrageenan');
    }
  });
});

describe('buildAdvisories — ultra-pasteurised mass', () => {
  it("names whole milk and heavy cream against the batch's own computed mass", () => {
    const advisory = buildAdvisories(clone()).find((a) => a.key === 'ultra-pasteurised');
    expect(advisory.words).toContain('Whole milk');
    expect(advisory.words).toContain('370.4 g');
    expect(advisory.words).toContain('Heavy cream');
    expect(advisory.words).toContain('252.8 g');
    expect(advisory.words).toContain('623.2 g');
    expect(advisory.words).toContain('799.7 g');
    expect(advisory.basis).toContain('heat treatment');
  });

  it('is absent when no active row carries an ultra-pasteurised treatment', () => {
    const version = clone();
    removeRow(version, 'row-01');
    removeRow(version, 'row-02');
    const advisory = buildAdvisories(version).find((a) => a.key === 'ultra-pasteurised');
    expect(advisory).toBeUndefined();
  });
});

describe('buildAdvisories — gum hydration against the hold', () => {
  it('names locust bean gum against the hold, and step 2 by its typed target', () => {
    const advisory = buildAdvisories(clone()).find((a) => a.key === 'hydration');
    expect(advisory.words).toContain('Locust bean gum');
    expect(advisory.words).toContain('82 °C');
    expect(advisory.words).toContain('69 °C');
    expect(advisory.words).toContain('Step 2');
    expect(advisory.words).toContain('85 °C');
    expect(advisory.basis).toContain('hydration');
  });

  it('names no step, and does not throw, when no step target reaches the hydration temperature', () => {
    const version = clone();
    findStep(version, 2).targets.find((target) => target.label === 'temp').value = '65 °C';
    const advisory = buildAdvisories(version).find((a) => a.key === 'hydration');
    expect(advisory).toBeDefined();
    expect(advisory.words).toContain('82 °C');
    expect(advisory.words).toContain('69 °C');
    expect(advisory.words).not.toContain('Step');
  });

  it('names no step, and does not throw, when a target is a range the parser cannot read', () => {
    const version = clone();
    findStep(version, 2).targets.find((target) => target.label === 'temp').value = '80–85 °C';
    expect(() => buildAdvisories(version)).not.toThrow();
    const advisory = buildAdvisories(version).find((a) => a.key === 'hydration');
    expect(advisory.words).not.toContain('Step');
  });

  it('is absent when the pasteurisation hold meets or exceeds every hydration temperature', () => {
    const version = clone();
    version.process = { ...version.process, pasteuriseC: 85 };
    const advisory = buildAdvisories(version).find((a) => a.key === 'hydration');
    expect(advisory).toBeUndefined();
  });
});

describe('buildAdvisories — estimated-data exposure', () => {
  it('names PAC, POD, MSNF and Total solids, and never Total fat or Sugar solids', () => {
    const advisory = buildAdvisories(clone()).find((a) => a.key === 'estimated');
    expect(advisory.words).toContain('PAC');
    expect(advisory.words).toContain('POD');
    expect(advisory.words).toContain('MSNF');
    expect(advisory.words).toContain('Total solids');
    expect(advisory.words).not.toContain('Total fat');
    expect(advisory.words).not.toContain('Sugar solids');
    expect(advisory.basis).toContain('per-field basis');
  });

  it('is absent when every row states every field rather than estimating it', () => {
    const version = clone();
    stateEveryBasisAsStated(version);
    const advisory = buildAdvisories(version).find((a) => a.key === 'estimated');
    expect(advisory).toBeUndefined();
  });
});

describe('buildAdvisories — removed rows never contribute', () => {
  it('drops whole milk from both the ultra-pasteurised mass and the estimated-exposure list', () => {
    const version = clone();
    removeRow(version, 'row-01');
    const advisories = buildAdvisories(version);
    const ultra = advisories.find((a) => a.key === 'ultra-pasteurised');
    const estimated = advisories.find((a) => a.key === 'estimated');
    expect(ultra.words).not.toContain('Whole milk');
    expect(ultra.words).toContain('252.8 g');
    expect(estimated.words).not.toContain('Whole milk');
  });
});

describe('buildAdvisories — empty', () => {
  it('returns [] for a version with no rows', () => {
    const version = { ...clone(), rows: [], method: [] };
    expect(buildAdvisories(version)).toEqual([]);
  });
});

describe('buildAdvisories — no verdict', () => {
  it('never says an advisory is correct, safe, guaranteed, or a sensory outcome', () => {
    const forbidden = [
      'correct',
      'fixed',
      'guaranteed',
      'safe',
      'better',
      'worse',
      'too much',
      'too little',
      'problem',
      'should',
      'must',
      'taste',
      'flavour',
      'texture',
      'icy',
      'grainy',
    ];
    const text = buildAdvisories(clone())
      .map((advisory) => `${advisory.words} ${advisory.basis}`)
      .join(' ')
      .toLowerCase();
    for (const word of forbidden) {
      expect(text).not.toContain(word);
    }
  });
});

describe('buildAdvisories — the minimum fill is not built', () => {
  it('never names the machine minimum fill', () => {
    const text = buildAdvisories(clone())
      .map((advisory) => `${advisory.words} ${advisory.basis}`)
      .join(' ');
    expect(text).not.toContain('700');
    expect(text.toLowerCase()).not.toContain('minimum fill');
  });
});

describe('buildAdvisories — never mutates', () => {
  it('leaves the version deep-equal a structuredClone taken before the call', () => {
    const version = clone();
    const before = structuredClone(version);
    buildAdvisories(version);
    expect(version).toEqual(before);
  });
});
