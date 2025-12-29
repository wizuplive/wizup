import { getCutoverGuardState } from "../protocolCutoverGuardrails/cutoverState";
import { emitCriticalProtocolViolation } from "../protocolReadRouter/violations/emitProtocolViolation";

/**
 * 🛡️ BACKEND CUTOVER GUARDRAIL
 * ===========================
 * Enforcement utility to ensure localStorage never acts as primary in production
 * once a Cutover Receipt has been issued.
 */

export type GuardrailResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export function enforceNoLocalPrimaryAfterCutover(args: {
  operation: "READ_PRIMARY" | "WRITE_PRIMARY";
  storage: "LOCAL" | "FIRESTORE";
  context: string; 
  seasonId?: string;
}): GuardrailResult {
  try {
    const state = getCutoverGuardState();

    // Guardrail only active in production
    // In dev, we allow local primary for testing/simulation
    if (!state.isProduction) return { allowed: true };

    // Guardrail only active if a Cutover has been formally applied
    if (!state.cutoverIsActive) return { allowed: true };

    if (args.storage === "LOCAL") {
      // 🚨 CRITICAL VIOLATION DETECTED
      // System attempt to use local storage as primary in post-cutover production
      void emitCriticalProtocolViolation({
        seasonId: args.seasonId || "GLOBAL",
        code: "LOCAL_PRIMARY_AFTER_CUTOVER" as any,
        kind: args.context,
        note: `CRITICAL: LocalStorage Primary Forbidden after Cutover. Op: ${args.operation}. Cutover Hash: ${state.cutoverReceiptHash}`
      });

      return {
        allowed: false,
        reason: "LOCAL_PRIMARY_FORBIDDEN_AFTER_CUTOVER",
      };
    }

    return { allowed: true };
  } catch (e) {
    // Fail-open to safety (NOOP) on uncertainty
    return { allowed: false, reason: "GUARDRAIL_ERROR_FAIL_SAFE_NOOP" };
  }
}
