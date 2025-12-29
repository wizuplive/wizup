/**
 * ⚖️ SHADOW READ PARITY TYPES
 * ===========================
 */

export type ParityStatus = "PASS" | "WARN" | "FAIL";

export type ParityMismatch = {
  artifactType: string;
  scope: "GLOBAL" | "COMMUNITY";
  key: string; // seasonId or seasonId::communityId
  localHash?: string;
  firestoreHash?: string;
  reason:
    | "MISSING_LOCAL"
    | "MISSING_FIRESTORE"
    | "HASH_MISMATCH"
    | "STRUCTURE_MISMATCH";
};

export type ParityReport = {
  schemaVersion: "v1";
  seasonId: string;
  status: ParityStatus;
  checkedAtMs: number;
  artifactCounts: {
    local: number;
    firestore: number;
    compared: number;
  };
  mismatches: ParityMismatch[];
  hashes: {
    localAggregateHash: string;
    firestoreAggregateHash: string;
    reportHash: string;
  };
};
