import type { ParityGateVerdict } from "../parity/parityGateTypes";

/**
 * 📖 PARITY GATE READER
 * =====================
 */

function parityGateKey(seasonId: string) {
  return `wizup:protocol:parity:gate:v1:${seasonId}`;
}

export function readParityGateVerdict(seasonId: string): ParityGateVerdict | null {
  try {
    const raw = window.localStorage.getItem(parityGateKey(seasonId));
    if (!raw) return null;
    const v = JSON.parse(raw) as ParityGateVerdict;
    if (!v || v.seasonId !== seasonId) return null;
    return v;
  } catch {
    return null;
  }
}
