import { sha256Hex as baseSha256, canonicalJson as baseCanonicalJson } from "../zaps/season0/hash";

/**
 * Ensures stable key ordering for cryptographic pinning.
 */
export function canonicalJson(value: unknown): string {
  return baseCanonicalJson(value);
}

/**
 * Standard SHA-256 hex digest.
 */
export async function sha256Hex(input: string): Promise<string> {
  return baseSha256(input);
}
