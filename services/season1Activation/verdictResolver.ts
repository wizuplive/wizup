import { ReadinessCheckResult, ReadinessVerdict, ReadinessFailureCode } from "./types";

/**
 * ⚖️ READINESS VERDICT RESOLVER
 * ============================
 */
export function resolveReadinessVerdict(
  checks: ReadinessCheckResult[],
  moralVerdict: string // "ALLOW" | "CONDITIONAL" | "BLOCK"
): { decision: ReadinessVerdict; reason: string; blockingCodes: ReadinessFailureCode[] } {
  
  const blockingCodes = checks.filter(c => !c.pass).map(c => c.code).filter(Boolean) as ReadinessFailureCode[];

  // 1. Terminal Block: ABORT_FOREVER
  if (
    moralVerdict === "BLOCK" ||
    checks.some(c => !c.pass && c.severity === "FATAL") ||
    blockingCodes.includes("HASH_MISMATCH") ||
    blockingCodes.includes("ESCAPE_HATCH_DETECTED")
  ) {
    return {
      decision: "ABORT_FOREVER",
      reason: moralVerdict === "BLOCK" ? "Moral verdict is BLOCK. Activation prohibited." : "Integrity or safety failure detected. Irreversible abort.",
      blockingCodes
    };
  }

  // 2. Transitory Block: DELAY
  if (
    checks.some(c => !c.pass && c.severity === "FAIL") ||
    moralVerdict === "CONDITIONAL" && blockingCodes.includes("CONSTRAINTS_NOT_COMPILED")
  ) {
    return {
      decision: "DELAY",
      reason: "Prerequisites missing or pre-activation state unstable. Awaiting corrections.",
      blockingCodes
    };
  }

  // 3. Green Light: PROCEED
  return {
    decision: "PROCEED",
    reason: "All legitimacy requirements and integrity checks satisfied.",
    blockingCodes: []
  };
}
