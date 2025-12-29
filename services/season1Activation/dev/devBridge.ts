import { runSeason1ReadinessProof } from "../season1ReadinessEngine";
import { defaultReadinessSink } from "../persistence/localStorageReadinessSink";

/**
 * 🛠️ WIZUP DEV BRIDGE — READINESS EXTENSION
 * =========================================
 */
export function initReadinessDevBridge() {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  window.wizup = window.wizup || {};

  // @ts-ignore
  window.wizup.runSeason1Readiness = (id: string = "S1") => runSeason1ReadinessProof({ seasonId: id, mode: "DEV_MANUAL" });
  
  // @ts-ignore
  window.wizup.getSeason1Readiness = (id: string = "S1") => defaultReadinessSink.read(id);
  
  // @ts-ignore
  window.wizup.getSeason1ReadinessHash = async (id: string = "S1") => {
    const art = await defaultReadinessSink.read(id);
    return art?.hashes.outputHash;
  };
}
