import { GateCondition } from "../types";

/**
 * 🛡️ CONSTRAINT VALIDATORS
 * ========================
 */

export function validateConditions(conditions: GateCondition[]): void {
  const seenKinds = new Set<string>();

  for (const cond of conditions) {
    // 1. Sane Bounds Check
    if (cond.kind === "CAP_LOWERING") {
      if (cond.value <= 0 || cond.value > 0.15) {
        throw new Error(`INVALID_CONDITION_VALUE: MAX_SHARE must be between 0 and 0.15. Got ${cond.value}`);
      }
    }

    if (cond.kind === "STEWARD_LIMIT") {
      // fix: Corrected property name from 'value' to 'maxStewards' for STEWARD_LIMIT condition
      if (cond.maxStewards < 1) {
        throw new Error("INVALID_CONDITION_VALUE: maxStewards must be at least 1.");
      }
    }

    if (cond.kind === "DISTRIBUTION_DELAY") {
      if (cond.delayMs < 0) {
        throw new Error("INVALID_CONDITION_VALUE: delayMs cannot be negative.");
      }
    }

    // 2. Conflict Detection (Duplicate kinds with different values)
    // For simplicity, we allow one override per kind per season
    if (seenKinds.has(cond.kind) && (cond.kind === "CAP_LOWERING" || cond.kind === "STEWARD_LIMIT" || cond.kind === "DISTRIBUTION_DELAY")) {
      throw new Error(`CONFLICTING_CONSTRAINTS: Multiple definitions for ${cond.kind}`);
    }
    seenKinds.add(cond.kind);
  }
}
