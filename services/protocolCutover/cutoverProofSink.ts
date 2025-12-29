import { CUTOVER_PROOF_KEY, CUTOVER_RECEIPT_KEY, SAFE_NOOP_LATCH_KEY } from "./keys";
import type { CutoverProofArtifactV1 } from "./types";

/**
 * 🏺 CUTOVER PROOF SINK
 */

function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value), (_k, v) => (v === undefined ? null : v));
}

function sortKeys(v: any): any {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    const out: any = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
    return out;
  }
  return v;
}

function fnv1aHex(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function writeCutoverProof(proof: Omit<CutoverProofArtifactV1, "createdAtMs" | "proofHash">): CutoverProofArtifactV1 {
  const payloadForHash = { ...proof };
  const proofHash = fnv1aHex(canonicalJson(payloadForHash));

  const artifact: CutoverProofArtifactV1 = {
    version: "v1",
    createdAtMs: Date.now(),
    proofHash,
    ...proof,
  };

  try {
    window.localStorage.setItem(CUTOVER_PROOF_KEY, JSON.stringify(artifact));
  } catch {
    // fail-open
  }
  return artifact;
}

export function readCutoverProof(): CutoverProofArtifactV1 | null {
  try {
    const raw = window.localStorage.getItem(CUTOVER_PROOF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CutoverProofArtifactV1;
    if (parsed?.version !== "v1") return null;
    return parsed;
  } catch {
    return null;
  }
}

export const CUTOVER_PROOF_META = {
  receiptKey: CUTOVER_RECEIPT_KEY,
  safeNoopLatchKey: SAFE_NOOP_LATCH_KEY,
};
