/**
 * 🔒 DETERMINISTIC HASHING UTILITIES
 */

function sortKeys(v: any): any {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    const out: any = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
    return out;
  }
  return v;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value), (_k, v) => (v === undefined ? null : v));
}

/**
 * Lightweight deterministic hash (stable; not crypto-strong)
 */
export function fnv1aHex(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
