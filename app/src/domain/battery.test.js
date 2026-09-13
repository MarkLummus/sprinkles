// The battery's measured-field table, segmented options, defects, the
// declared flaw, and the numeric draft parser (03.3.1-CONTEXT.md D-07,
// D-09; the structural contract's "Controls spec"). Runs under Vitest's
// default node environment — battery.js imports nothing at all.
import { describe, it, expect } from 'vitest';
import { BATTERY_FIELDS, SEGMENT_OPTIONS, DEFECTS, DECLARED_FLAW, parseMeasuredDraft } from './battery.js';

describe('BATTERY_FIELDS', () => {
  it('has exactly six entries', () => {
    expect(BATTERY_FIELDS).toHaveLength(6);
  });

  it('every entry carries key, label, unit, signed and error', () => {
    for (const field of BATTERY_FIELDS) {
      expect(field).toHaveProperty('key');
      expect(field).toHaveProperty('label');
      expect(field).toHaveProperty('unit');
      expect(field).toHaveProperty('signed');
      expect(field).toHaveProperty('error');
    }
  });

  it('signed is true on exactly the two °C fields: Out of machine and Tasting temperature', () => {
    const signedLabels = BATTERY_FIELDS.filter((field) => field.signed).map((field) => field.label);
    expect(signedLabels.sort()).toEqual(['Out of machine', 'Tasting temperature']);
  });

  it('the two error strings match the contract\'s "Controls spec" character-for-character', () => {
    const signedField = BATTERY_FIELDS.find((field) => field.signed);
    const unsignedField = BATTERY_FIELDS.find((field) => !field.signed);
    expect(signedField.error).toBe('Enter a temperature, such as −6, or leave blank.');
    expect(unsignedField.error).toBe('Enter zero or a positive number, or leave blank.');
  });

  it('carries the six fields the churn and tasting sections need, each with its stated unit', () => {
    const byKey = Object.fromEntries(BATTERY_FIELDS.map((field) => [field.key, field]));
    expect(byKey.timeToDrawTempMinutes.unit).toBe('min');
    expect(byKey.outOfMachineTempC.unit).toBe('°C');
    expect(byKey.churnDurationMinutes.unit).toBe('min');
    expect(byKey.temperingMinutes.unit).toBe('min');
    expect(byKey.tastingTempC.unit).toBe('°C');
    expect(byKey.meltTestG.unit).toBe('g lost at 20 min');
  });
});

describe('SEGMENT_OPTIONS', () => {
  it('carries the three groups with their option strings verbatim from the contract', () => {
    expect(SEGMENT_OPTIONS.exitConsistency).toEqual(['Smooth ribbon', 'Wet, soupy', 'Chunky, separated']);
    expect(SEGMENT_OPTIONS.airiness).toEqual(['Low, dense', 'Medium, standard', 'High, airy']);
    expect(SEGMENT_OPTIONS.meltStyle).toEqual(['Watery, weeping', 'Creamy puddle', 'Stable foam']);
  });
});

describe('DEFECTS', () => {
  it('is the four comma-worded chips verbatim', () => {
    expect(DEFECTS).toEqual(['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film']);
  });
});

describe('DECLARED_FLAW', () => {
  it('is Bitter', () => {
    expect(DECLARED_FLAW).toBe('Bitter');
  });
});

describe('parseMeasuredDraft', () => {
  it('blank is always allowed, on both signed and unsigned fields', () => {
    expect(parseMeasuredDraft('')).toEqual({ ok: true, value: null });
    expect(parseMeasuredDraft(null)).toEqual({ ok: true, value: null });
    expect(parseMeasuredDraft('', { signed: true })).toEqual({ ok: true, value: null });
  });

  it('accepts plain digits', () => {
    expect(parseMeasuredDraft('20')).toEqual({ ok: true, value: 20 });
  });

  it('accepts a decimal point', () => {
    expect(parseMeasuredDraft('3.5')).toEqual({ ok: true, value: 3.5 });
  });

  it('accepts a decimal comma', () => {
    expect(parseMeasuredDraft('3,5')).toEqual({ ok: true, value: 3.5 });
  });

  it('normalizes a Unicode minus to ASCII on a signed field', () => {
    expect(parseMeasuredDraft('−6', { signed: true })).toEqual({ ok: true, value: -6 });
  });

  it('rejects a stray letter', () => {
    expect(parseMeasuredDraft('4o')).toEqual({ ok: false, value: null });
  });

  it('rejects a negative on an unsigned field', () => {
    expect(parseMeasuredDraft('-6')).toEqual({ ok: false, value: null });
  });

  it('accepts a negative on a signed field', () => {
    expect(parseMeasuredDraft('-6', { signed: true })).toEqual({ ok: true, value: -6 });
  });

  it('accepts a leading-dot value, ".5"', () => {
    expect(parseMeasuredDraft('.5')).toEqual({ ok: true, value: 0.5 });
  });

  it('accepts a trailing-dot value, "45."', () => {
    expect(parseMeasuredDraft('45.')).toEqual({ ok: true, value: 45 });
  });

  it('rejects whitespace-only input rather than silently reading it as zero', () => {
    expect(parseMeasuredDraft('   ')).toEqual({ ok: false, value: null });
  });

  it('rejects a bare minus sign', () => {
    expect(parseMeasuredDraft('-')).toEqual({ ok: false, value: null });
    expect(parseMeasuredDraft('-', { signed: true })).toEqual({ ok: false, value: null });
  });
});
