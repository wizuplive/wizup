
/**
 * 🔒 PROTOCOL CUTOVER TYPES
 * =========================
 */

export type CutoverMode = "FIRESTORE_PRIMARY";

// Added PrimaryReadMode to fix import errors in primaryReadModeStore.ts
export type PrimaryReadMode = "LOCAL_PRIMARY" | "FIRESTORE_PRIMARY";

export interface CutoverReceiptV1 {
  version: "v1";
  mode: CutoverMode;
  createdAtMs: number; 
  buildTag?: string;   

  // What was proven at the moment of cutover:
  prerequisites: {
    bootIntegrityOk: boolean;
    parityGateOk: boolean; 
    firestoreReachable: boolean;
  };

  // Protocol semantics anchor:
  protocolFingerprint: {
    routerVersion: string;
    writeRouterVersion: string;
    readRouterVersion: string;
  };

  // Deterministic anchors:
  hashes: {
    prereqHash: string;    // hash(canonical prerequisites)
    fingerprintHash: string;
    receiptHash: string;   // hash(canonical receipt minus createdAtMs/buildTag)
  };
}

export type CutoverDryRunKind =
  | "BOOT_INTEGRITY_DRYRUN_FIRESTORE_DOWN"
  | "BOOT_INTEGRITY_DRYRUN_FIRESTORE_UP";

export interface CutoverProofArtifactV1 {
  version: "v1";
  createdAtMs: number;
  receiptKey: string;
  safeNoopLatchKey: string;
  dryRuns: Array<{
    kind: CutoverDryRunKind;
    ok: boolean;
    reason?: string;
    latchedAfter: boolean;
  }>;
  proofHash: string;
}