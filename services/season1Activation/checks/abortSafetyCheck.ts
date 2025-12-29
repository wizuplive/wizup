import { ReadinessCheckResult } from "../types";
import { season1StateMachine } from "../season1StateMachine";

/**
 * 🕊️ ABORT DIGNITY CHECK
 * ======================
 */
export async function checkAbortSafety(): Promise<ReadinessCheckResult> {
  const currentState = season1StateMachine.getState();
  
  // Rule: It is safe to abort as long as we haven't mutated balances or finalized.
  const isSafe = currentState === "DORMANT" || currentState === "ARMED" || currentState === "FROZEN";

  return {
    name: "abort_safety",
    severity: "FAIL",
    pass: isSafe,
    code: isSafe ? undefined : "ABORT_UNSAFE",
    details: { currentState }
  };
}
