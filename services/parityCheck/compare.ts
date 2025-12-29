import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

/**
 * 🔍 CANONICAL COMPARISON ENGINE
 * ==============================
 */

/**
 * Removes volatile fields that are expected to diverge between storage layers.
 * (e.g., timestamps, storage-specific metadata, debug fields)
 */
export function normalizeForParity(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeForParity);
  }

  const normalized: any = {};
  const volatileKeys = [
    "_writtenAtMs",
    "_shadowMeta",
    "generatedAtMs",
    "createdAtMs",
    "sealedAtMs",
    "updatedAtMs",
    "lastCheckedAtMs",
    "checkedAtMs",
    "timestamp", // only if it's a creation timestamp
    "serverTimestamp",
  ];

  Object.keys(obj)
    .sort()
    .forEach((key) => {
      // Exclude keys starting with _ (shadow metadata) or explicitly volatile keys
      if (key.startsWith("_") || volatileKeys.includes(key)) {
        return;
      }
      normalized[key] = normalizeForParity(obj[key]);
    });

  return normalized;
}

/**
 * Computes a deterministic hash of an object after normalization.
 */
export async function computeParityHash(obj: any): Promise<string> {
  if (!obj) return "null_hash";
  const normalized = normalizeForParity(obj);
  return await sha256Hex(canonicalJson(normalized));
}

/**
 * Deep structural check for equality.
 */
export function areStructurallyEqual(local: any, remote: any): boolean {
  return canonicalJson(normalizeForParity(local)) === canonicalJson(normalizeForParity(remote));
}
