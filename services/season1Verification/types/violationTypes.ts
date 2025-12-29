export type VerificationVerdict = "PASS" | "FAIL" | "INCONCLUSIVE";

export interface Season1ViolationArtifact {
  id: string; // deterministic id derived from (seasonId, communityId, storedHash, recomputedHash)
  seasonId: string;
  communityId: string;

  verdict: VerificationVerdict;

  stored: {
    bundleHash: string;
    receiptHash?: string;
    constraintsHash?: string;
    signalsSnapshotHash?: string;
    configHash?: string;
    resolutionArtifactHash?: string;
  };

  recomputed?: {
    bundleHash: string;
    receiptHash: string;
    constraintsHash: string;
    signalsSnapshotHash: string;
    configHash: string;
    resolutionArtifactHash: string;
  };

  failureMode?:
    | "MISSING_CANON_BUNDLE"
    | "MISSING_RECEIPT"
    | "MISSING_CONSTRAINTS"
    | "MISSING_SIGNALS"
    | "HASH_MISMATCH"
    | "NON_DETERMINISTIC_REPLAY"
    | "ERROR";

  notes?: string[]; // qualitative only
  hashes: {
    inputHash: string;  // hash of verifier inputs
    outputHash: string; // hash of this artifact excluding generatedAt
    verifierVersion: string;
  };

  generatedAtMs: number; // excluded from outputHash input
  schemaVersion: "v1";
}