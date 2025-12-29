/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 * Services-only / invisible / fail-open.
 * NO wallet mutations. NO balances. NO notifications.
 * If uncertain → do nothing.
 */

import { isSeason1Activated } from "./isSeason1Activated";

export type RuntimeGateDecision =
  | { allowed: true }
  | { allowed: false; reason: "NOT_ACTIVATED" | "NO_SEASON_ID" | "UNKNOWN" };

/**
 * Fail-open philosophy, but activation gating is fail-closed:
 * - If we cannot prove activated => DO NOT RUN season1 live paths.
 */
export async function requireSeason1Activated(seasonId: string): Promise<RuntimeGateDecision> {
  try {
    if (!seasonId) return { allowed: false, reason: "NO_SEASON_ID" };
    // Normalizing "SEASON_1" to "S1" for activation checks if needed
    const normalizedId = (seasonId === "SEASON_1" || seasonId === "active-season") ? "S1" : seasonId;
    const ok = await isSeason1Activated(normalizedId);
    return ok ? { allowed: true } : { allowed: false, reason: "NOT_ACTIVATED" };
  } catch {
    return { allowed: false, reason: "UNKNOWN" };
  }
}

/**
 * Helper wrapper so call sites stay tiny.
 * - If not activated => no-op (returns fallback)
 * - Never throws.
 */
export async function withSeason1Gate<T>(args: {
  seasonId: string;
  run: () => Promise<T>;
  fallback: T;
}): Promise<T> {
  try {
    const gate = await requireSeason1Activated(args.seasonId);
    if (!gate.allowed) return args.fallback;
    return await args.run();
  } catch {
    return args.fallback;
  }
}
