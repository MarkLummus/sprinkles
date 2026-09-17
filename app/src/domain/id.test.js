import { describe, expect, it } from 'vitest';
import { freshId } from './id.js';

describe('freshId', () => {
  it('uses randomUUID when the browser provides it', () => {
    expect(freshId({ randomUUID: () => 'browser-id' })).toBe('browser-id');
  });

  it('creates a version-4 UUID from random bytes when randomUUID is unavailable', () => {
    const cryptoSource = {
      getRandomValues(bytes) {
        bytes.fill(0);
        return bytes;
      },
    };

    expect(freshId(cryptoSource)).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('uses random bytes when an exposed randomUUID is refused', () => {
    const cryptoSource = {
      randomUUID() {
        throw new DOMException('The operation is insecure.');
      },
      getRandomValues(bytes) {
        bytes.fill(0);
        return bytes;
      },
    };

    expect(freshId(cryptoSource)).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('falls back without Web Crypto and keeps the UUID shape', () => {
    expect(freshId(null, () => 0)).toBe('00000000-0000-4000-8000-000000000000');
  });
});
