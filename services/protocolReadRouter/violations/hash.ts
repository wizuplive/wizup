/**
 * 🔒 DETERMINISTIC HASHING
 */

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value), (_k, v) => (v === undefined ? null : v));
}

function sortKeys(value: any): any {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value).sort()) out[k] = sortKeys(value[k]);
    return out;
  }
  return value;
}

export async function sha256Hex(input: string): Promise<string> {
  const g: any = globalThis as any;
  const cryptoObj = g.crypto;

  if (cryptoObj?.subtle) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const digest = await cryptoObj.subtle.digest("SHA-256", data);
    return bufToHex(new Uint8Array(digest));
  }

  // fallback to non-crypto deterministic hash if subtle not available
  return fnv1aHex(input);
}

function bufToHex(buf: Uint8Array): string {
  let s = "";
  for (const b of buf) s += b.toString(16).padStart(2, "0");
  return s;
}

function fnv1aHex(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
