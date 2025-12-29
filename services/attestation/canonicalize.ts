
import { canonicalJson } from "../zaps/season0/hash";

/**
 * 🏺 CANONICALIZATION UTILITY
 * ===========================
 */
export function canonicalize(value: unknown): string {
  // Leverage the existing logic from Season 0 which handles key sorting and undefined values
  return canonicalJson(value);
}
