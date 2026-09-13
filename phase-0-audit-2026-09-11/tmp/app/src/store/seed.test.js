import { describe, it, expect } from 'vitest';
import { seedIfEmpty } from './seed.js';

// A plain in-memory object implementing the repository seam's contract —
// no store library, no browser. This is why seedIfEmpty takes its
// repository as a parameter, and testing the seam contract rather than the
// storage engine is the point.
function createInMemoryRepository(initial = []) {
  const versions = [...initial];
  const batches = [];
  return {
    versions,
    batches,
    async listVersions() {
      return versions;
    },
    async saveVersion(version) {
      versions.push(version);
    },
    async saveBatch(batch) {
      batches.push(batch);
    },
  };
}

describe('seedIfEmpty', () => {
  it('writes exactly one version record with id olive-oil-ice-cream-v1 against an empty repository', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(1);
    expect(repository.versions[0].id).toBe('olive-oil-ice-cream-v1');
  });

  it('is idempotent: calling twice against the same repository leaves exactly one record', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(1);
  });

  it('writes nothing and leaves an existing unrelated record untouched', async () => {
    const repository = createInMemoryRepository([{ id: 'existing' }]);
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(1);
    expect(repository.versions[0].id).toBe('existing');
  });

  it('also writes exactly one batch record against an empty repository', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    expect(repository.batches.length).toBe(1);
    expect(repository.batches[0].versionId).toBe('olive-oil-ice-cream-v1');
  });

  it('writes no batch when a version already exists', async () => {
    const repository = createInMemoryRepository([{ id: 'existing' }]);
    await seedIfEmpty(repository);
    expect(repository.batches.length).toBe(0);
  });
});
