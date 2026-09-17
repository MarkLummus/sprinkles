// Local development is often opened from another device over plain HTTP.
// randomUUID() is not exposed consistently outside a secure context, while
// getRandomValues() remains available in the browsers we support. Keep the
// stored id shape stable and retain a final local-only fallback so creating
// a record never depends on how the page was reached.
export function freshId(cryptoSource = globalThis.crypto, fallbackRandom = Math.random) {
  if (typeof cryptoSource?.randomUUID === 'function') {
    try {
      return cryptoSource.randomUUID();
    } catch {
      // Continue with the byte-based path when the browser exposes the
      // method but refuses it in the current context.
    }
  }

  const bytes = new Uint8Array(16);
  let filled = false;
  if (typeof cryptoSource?.getRandomValues === 'function') {
    try {
      cryptoSource.getRandomValues(bytes);
      filled = true;
    } catch {
      // The local fallback below is sufficient for client-side record ids.
    }
  }
  if (!filled) {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(fallbackRandom() * 256);
    }
  }

  // RFC 4122 version 4 and variant bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
}
