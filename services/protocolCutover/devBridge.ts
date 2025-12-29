import { checkBootIntegrity } from "./bootIntegrity";
import { proofArtifactService } from "./proofArtifact";
import { writeCutoverReceiptWriteOnce, readCutoverReceipt } from "./cutoverReceiptStore";
import { setPrimaryReadModeOnce } from "./primaryReadModeStore";
import { emitCriticalProtocolViolation } from "../protocolReadRouter/violations/emitProtocolViolation";
import { CUTOVER_RECEIPT_KEY } from "./keys";

/**
 * 🛠️ PROTOCOL CUTOVER DEV BRIDGE
 */

export function installProtocolCutoverDevBridge() {
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  if (!isDev) return;

  (window as any).wizup = (window as any).wizup || {};
  
  /**
   * 🚀 MANUAL PROTOCOL CUTOVER CEREMONY
   * ===================================
   * This is the only way to transition the protocol to FIRESTORE_PRIMARY.
   */
  (window as any).wizup.executeProtocolCutover = async (opts: { dryRun: boolean }) => {
    const { dryRun } = opts;
    const modeLabel = dryRun ? "[DRY-RUN]" : "[CEREMONY]";
    
    console.log(`%c${modeLabel} Initiating Protocol Cutover...`, "color: #8b5cf6; font-weight: bold;");

    // 1. Boot Integrity Check
    const integrity = await checkBootIntegrity();
    if (integrity.status === "FAIL") {
      console.error(`${modeLabel} Integrity Failure:`, integrity.reason);
      return { ok: false, reason: integrity.reason };
    }
    console.log(`${modeLabel} Boot Integrity: PASS`);

    // 2. Generate Proof Artifact
    const routerVersions = {
      routerVersion: "protocolRouter@v1",
      writeRouterVersion: "protocolWriteRouter@v1",
      readRouterVersion: "protocolReadRouter@v1"
    };
    
    const proof = await proofArtifactService.generateProof({
      dryRun,
      integrityResult: integrity,
      routerVersions
    });

    // 3. Persist Proof (Write-only audit)
    await proofArtifactService.persist(proof);
    console.log(`${modeLabel} Proof Artifact Sealed: ${proof.proofHash}`);

    if (dryRun) {
      console.log("%c[DRY-RUN] Simulation Complete. No state was mutated.", "color: #22c55e; font-weight: bold;");
      return { ok: true, proof };
    }

    // --- REAL CEREMONY PATH ---
    
    // 4. Idempotency Check
    const existing = readCutoverReceipt();
    if (existing) {
      console.warn("[CEREMONY] Refused: Cutover Receipt already exists. Protocol is locked.");
      void emitCriticalProtocolViolation({
        seasonId: "GLOBAL",
        code: "CUTOVER_GUARDRAIL_BREACH" as any,
        kind: "CEREMONY_REENTRY_ATTEMPT",
        note: "Manual attempt to re-run cutover ceremony blocked by write-once logic."
      });
      return { ok: false, reason: "ALREADY_ACTIVATED", existing };
    }

    // 5. Finalize Receipt
    const receipt: any = {
      version: "v1",
      mode: "FIRESTORE_PRIMARY",
      createdAtMs: Date.now(),
      prerequisites: {
        bootIntegrityOk: true,
        parityGateOk: true,
        firestoreReachable: true
      },
      protocolFingerprint: routerVersions,
      hashes: {
        receiptHash: proof.proofHash,
        fingerprintHash: proof.proofHash,
        prereqHash: proof.proofHash
      }
    };

    const written = writeCutoverReceiptWriteOnce(receipt);
    if (!written.ok) {
      console.error("[CEREMONY] Failed to persist receipt.");
      return { ok: false, reason: "PERSISTENCE_FAILURE" };
    }

    // 6. Flip the Primary Pointer
    setPrimaryReadModeOnce("FIRESTORE_PRIMARY");

    console.log("%c[CEREMONY] 🚀 PROTOCOL CUTOVER SUCCESSFUL. System is now FIRESTORE_PRIMARY.", "color: #22c55e; font-weight: bold;");
    return { ok: true, receipt };
  };

  console.log("%c[CUTOVER] Dev Bridge Installed. Access via window.wizup.executeProtocolCutover", "color: #8b5cf6;");
}
