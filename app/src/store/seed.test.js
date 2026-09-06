import { describe, it, expect } from 'vitest';
import { seedIfEmpty } from './seed.js';

// A plain in-memory object implementing the repository seam's contract —
// no store library, no browser. This is why seedIfEmpty takes its
// repository as a parameter.
function createInMemoryRepository(initial = []) {
  const versions = [...initial];
  return {
    versions,
    async listVersions() {
      return versions;
    },
    async saveVersion(version) {
      versions.push(version);
    },
  };
}

describe('seedIfEmpty — walking skeleton', () => {
  it('writes exactly one version record against an empty repository', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(1);
  });

  it('writes nothing against a repository that already holds a record', async () => {
    const repository = createInMemoryRepository([{ id: 'existing' }]);
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(1);
    expect(repository.versions[0].id).toBe('existing');
  });
});
