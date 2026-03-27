import { createHash } from 'node:crypto';

export function computeContentHash(description: string, status: string): string {
  const content = `${description}::${status}`;
  return createHash('sha256').update(content).digest('hex');
}

export function hasContentChanged(
  description: string,
  status: string,
  storedHash: string
): boolean {
  return computeContentHash(description, status) !== storedHash;
}
