import { describe, it, expect } from 'vitest';
import { BATTERY_FIELDS } from './battery.js';
import { CHURN_DATE_BLOCKED_MESSAGE, validateRecordDraft } from './recordDraft.js';

// A draft holding only what the save gate reads: the churn date and the
// battery's measured fields, all blank.
function gateDraft(overrides = {}) {
  const draft = { churnDate: '' };
  for (const field of BATTERY_FIELDS) draft[field.key] = '';
  return { ...draft, ...overrides };
}

describe('validateRecordDraft — the record pen\'s save gate', () => {
  it('blocks a blank churn date once every measurement is clean', () => {
    const result = validateRecordDraft(gateDraft());
    expect(result.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);
    expect(result.invalidFieldKey).toBe(null);
    expect(result.fieldErrors).toEqual({});
  });

  it('reports the measurements first: two malformed fields block, the date does not', () => {
    const result = validateRecordDraft(gateDraft({ churnDurationMinutes: '-3', temperingMinutes: '-2' }));
    expect(result.invalidFieldKey).toBe('churnDurationMinutes');
    expect(Object.keys(result.fieldErrors)).toEqual(['churnDurationMinutes', 'temperingMinutes']);
    expect(result.blockedDateMessage).toBe(null);
  });

  it('lets a churn date with clean fields through', () => {
    const result = validateRecordDraft(gateDraft({ churnDate: '2026-08-09' }));
    expect(result.blockedDateMessage).toBe(null);
    expect(result.invalidFieldKey).toBe(null);
    expect(result.fieldErrors).toEqual({});
  });

  it('leaves its argument unchanged, and answers the same twice', () => {
    for (const draft of [
      gateDraft(),
      gateDraft({ churnDurationMinutes: '-3', temperingMinutes: '-2' }),
      gateDraft({ churnDate: '2026-08-09' }),
    ]) {
      const before = structuredClone(draft);
      const first = validateRecordDraft(draft);
      expect(draft).toEqual(before);
      expect(validateRecordDraft(draft)).toEqual(first);
    }
  });
});
