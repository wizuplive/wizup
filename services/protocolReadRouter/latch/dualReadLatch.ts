import { readParityGateVerdict } from "./parityGateReader";

/**
 * 🔒 DUAL-READ RUNTIME LATCH
 * ==========================
 */

export type DualReadLatchState =
  | { latched: false }
  | { latched: true; seasonId: string; latchedAtMs: number; reason: "PARITY_BLOCK" };

function latchKey(seasonId: string) {
  return `wizup:protocol:dualread:latch:v1:${seasonId}`;
}

export function getDualReadLatchState(seasonId: string): DualReadLatchState {
  try {
    const raw = window.localStorage.getItem(latchKey(seasonId));
    if (!raw) return { latched: false };
    const v = JSON.parse(raw) as DualReadLatchState;
    if (v && (v as any).latched === true && (v as any).seasonId === seasonId) return v;
    return { latched: false };
  } catch {
    return { latched: false };
  }
}

/**
 * Sticky latch enforcement:
 * - If a parity verdict is BLOCK, we latch the season forever.
 * - This prevents Firestore-first reads even if the system is configured for them.
 */
export function ensureDualReadLatch(seasonId: string): DualReadLatchState {
  const existing = getDualReadLatchState(seasonId);
  if (existing.latched) return existing;

  const gate = readParityGateVerdict(seasonId);
  if (gate?.decision !== "BLOCK") return { latched: false };

  const latched: DualReadLatchState = {
    latched: true,
    seasonId,
    latchedAtMs: Date.now(),
    reason: "PARITY_BLOCK",
  };

  try {
    window.localStorage.setItem(latchKey(seasonId), JSON.stringify(latched));
  } catch {
    // fail-open
  }

  return latched;
}

/**
 * 🛠️ DEV-ONLY LATCH SETTER
 * Allows manual state transition during tests or simulations.
 */
export function setDualReadLatch(seasonId: string, next: { latched: boolean; reason?: string }) {
  try {
    const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
    if (!isDev) return;

    if (!next.latched) {
      window.localStorage.removeItem(latchKey(seasonId));
      return;
    }

    const state: DualReadLatchState = {
      latched: true,
      seasonId,
      latchedAtMs: Date.now(),
      reason: (next.reason as any) || "PARITY_BLOCK"
    };
    window.localStorage.setItem(latchKey(seasonId), JSON.stringify(state));
  } catch {
    // fail-open
  }
}
