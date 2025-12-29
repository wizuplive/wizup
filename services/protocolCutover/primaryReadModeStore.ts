import { PRIMARY_READ_MODE_KEY } from "./keys";
import type { PrimaryReadMode } from "./types";
import { emitCriticalProtocolViolation } from "../protocolReadRouter/violations/emitProtocolViolation";
import { forbidLocalStoragePrimaryOrEmit } from "../protocolCutoverGuardrails/guardrails";

export function getPrimaryReadMode(storage: Storage = window.localStorage): PrimaryReadMode | null {
  try {
    const v = storage.getItem(PRIMARY_READ_MODE_KEY);
    if (v === "LOCAL_PRIMARY" || v === "FIRESTORE_PRIMARY") return v as PrimaryReadMode;
    return null;
  } catch {
    return null;
  }
}

export function setPrimaryReadModeOnce(mode: PrimaryReadMode, storage: Storage = window.localStorage): { wrote: boolean; reason?: string } {
  try {
    const existing = getPrimaryReadMode(storage);
    
    // 🛡️ IRREVERSIBLE: Once Firestore primary, never revert.
    if (existing === "FIRESTORE_PRIMARY" && mode !== "FIRESTORE_PRIMARY") {
      void emitCriticalProtocolViolation({
        seasonId: "GLOBAL",
        code: "DUAL_READ_LATCH_BLOCKED_FIRESTORE_FALLBACK_ATTEMPT", 
        kind: "CUTOVER_DOWNGRADE_ATTEMPT",
        note: "Attempted to revert primary read mode from FIRESTORE to LOCAL. Action blocked by protocol boundary."
      });

      // Explicit Guardrail Check (will emit another specific violation in prod)
      void forbidLocalStoragePrimaryOrEmit({
        operation: "MODE_SET",
        violationCode: "LOCALSTORAGE_MODE_DOWNGRADE_ATTEMPT",
        details: { attemptedMode: mode }
      });

      return { wrote: false, reason: "IRREVERSIBLE_DOWNGRADE_REFUSED" };
    }
    
    storage.setItem(PRIMARY_READ_MODE_KEY, mode);
    return { wrote: true };
  } catch {
    return { wrote: false, reason: "STORE_ERROR_FAIL_OPEN" };
  }
}