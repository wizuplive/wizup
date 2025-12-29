import { firestoreProbe } from "../protocolCutoverGuardrails/bootIntegrity/firestoreProbe";
import { getCutoverReceipt } from "./cutoverReceiptSource";

/**
 * 🩺 MANUAL BOOT INTEGRITY CHECK
 * ==============================
 */

export type BootIntegrityResult = 
  | { status: "PASS"; firestoreAvailable: boolean }
  | { status: "FAIL"; reason: string };

export async function checkBootIntegrity(): Promise<BootIntegrityResult> {
  try {
    const receipt = getCutoverReceipt();
    const probe = await firestoreProbe.probe();

    // If cutover is active, Firestore availability is MANDATORY
    if (receipt && !probe.available) {
      return { 
        status: "FAIL", 
        reason: `CRITICAL: Protocol cutover is active but Firestore is unreachable: ${probe.reason || "Unknown"}` 
      };
    }

    if (!probe.configured) {
        return { status: "FAIL", reason: "Firestore is not configured in this environment." };
    }

    return { 
      status: "PASS", 
      firestoreAvailable: probe.available 
    };
  } catch (e: any) {
    return { status: "FAIL", reason: `Integrity check error: ${e.message}` };
  }
}
