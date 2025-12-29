import type { ParityGateVerdict } from "./parityGateTypes";

/**
 * 🏺 PARITY GATE STORE
 */

function lsKey(seasonId: string) {
  return `wizup:protocol:parity:gate:v1:${seasonId}`;
}

export class ParityGateStore {
  write(v: ParityGateVerdict): void {
    try {
      window.localStorage.setItem(lsKey(v.seasonId), JSON.stringify(v));
    } catch {
      // fail-open
    }
  }
}
