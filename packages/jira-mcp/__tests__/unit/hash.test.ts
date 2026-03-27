import { describe, it, expect } from 'vitest';

// Will import from src/hash.ts once implemented
// import { computeContentHash, hasContentChanged } from '../../src/hash.js';

describe('hash', () => {
  describe('computeContentHash', () => {
    it('should produce a consistent SHA-256 hash for same input', async () => {
      const { computeContentHash } = await import('../../src/hash.js');

      const hash1 = computeContentHash('Scaffold package', 'pending');
      const hash2 = computeContentHash('Scaffold package', 'pending');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different descriptions', async () => {
      const { computeContentHash } = await import('../../src/hash.js');

      const hash1 = computeContentHash('Scaffold package', 'pending');
      const hash2 = computeContentHash('Write tests', 'pending');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for different statuses', async () => {
      const { computeContentHash } = await import('../../src/hash.js');

      const hash1 = computeContentHash('Scaffold package', 'pending');
      const hash2 = computeContentHash('Scaffold package', 'completed');

      expect(hash1).not.toBe(hash2);
    });

    it('should return a 64-character hex string (SHA-256)', async () => {
      const { computeContentHash } = await import('../../src/hash.js');

      const hash = computeContentHash('test description', 'pending');

      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('hasContentChanged', () => {
    it('should return false when content matches stored hash', async () => {
      const { computeContentHash, hasContentChanged } = await import('../../src/hash.js');

      const hash = computeContentHash('Scaffold package', 'pending');
      const changed = hasContentChanged('Scaffold package', 'pending', hash);

      expect(changed).toBe(false);
    });

    it('should return true when description changed', async () => {
      const { computeContentHash, hasContentChanged } = await import('../../src/hash.js');

      const hash = computeContentHash('Scaffold package', 'pending');
      const changed = hasContentChanged('Updated description', 'pending', hash);

      expect(changed).toBe(true);
    });

    it('should return true when status changed', async () => {
      const { computeContentHash, hasContentChanged } = await import('../../src/hash.js');

      const hash = computeContentHash('Scaffold package', 'pending');
      const changed = hasContentChanged('Scaffold package', 'completed', hash);

      expect(changed).toBe(true);
    });
  });
});
