import { isSeason2Activated } from "../season2Activation/isSeason2Activated";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";

export type GateResult<T> =
  | { allowed: true }
  | { allowed: false; noop: T; reason: string };

const SESSION_VIOLATION_CACHE = new Set<string>();

/**
 * 🛡️ SEASON 2 AUTHORITATIVE GATE
 * Ensures no Season 2 logic computes or persists without formal activation.
 */
export async function requireSeason2ActivatedOrNoop<T>(args: {
  seasonId: string;
  noop: T;
  reasonCode?: string;
}): Promise<GateResult<T>> {
  const isS2 = args.seasonId === "S2" || args.seasonId.startsWith("S2_");
  if (!isS2) return { allowed: true };

  const activated = await isSeason2Activated(args.seasonId);
  if (activated) return { allowed: true };

  // Safety: Emit dev violation once per session per community
  const cacheKey = `${args.seasonId}_${args.reasonCode || 'default'}`;
  if (!SESSION_VIOLATION_CACHE.has(cacheKey)) {
    SESSION_VIOLATION_CACHE.add(cacheKey);
    await violationEmitter.emit(args.seasonId, "S2_GATE_BLOCKED_NO_ACTIVATION", { 
        context: args.reasonCode || "unspecified" 
    });
  }

  return {
    allowed: false,
    noop: args.noop,
    reason: "S2_NOT_ACTIVATED"
  };
}
