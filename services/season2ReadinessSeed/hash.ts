import { sha256Hex as baseSha, canonicalJson as baseCanonical } from "../zaps/season0/hash";

/**
 * Ensures deterministic string representation for cryptographic pinning.
 */
export function canonicalize(value: unknown): string {
  return baseCanonical(value);
}

/**
 * Standard SHA-256 hex digest.
 */
export async function sha256Hex(input: string): Promise<string> {
  return baseSha(input);
}