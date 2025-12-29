import { assertSeason2WindowOrViolation } from "./season2TemporalLock";
import { proofSinks } from "./persistence/proofSinks";

export type NoopResult<T> = { allowed: true } | { allowed: false; noop: T; reasonCode: string };

/**
 * 🔒 S2 IMMUTABILITY GATE
 * Defensive wrapper for all Season 2 persistence sinks.
 */
export async function requireS2WriteAllowedOrNoop<T>(args: {
  seasonId: string;
  nowMs: number;
  action: string;
  noop: T;
}): Promise<NoopResult<T>> {
  const { seasonId, nowMs, action, noop } = args;

  // 1. Check for drift lock
  const latch = proofSinks.readNoopLatch(seasonId);
  if (latch) {
    return { allowed: false, noop, reasonCode: "S2_NOOP_LATCHED" };
  }

  // 2. Check window and activation
  const res = await assertSeason2WindowOrViolation({ seasonId, nowMs, action });
  // fix: Use explicit comparison for narrowing
  if (res.ok === false) {
    return { allowed: false, noop, reasonCode: res.reason };
  }

  return { allowed: true };
}