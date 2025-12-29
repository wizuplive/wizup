export type Season1ViolationCode =
  | "OUT_OF_WINDOW_WRITE"
  | "POST_ACTIVATION_MUTATION_ATTEMPT"
  | "RECEIPT_CONFLICT"
  | "CONSTRAINTS_DRIFT"
  | "CONFIG_DRIFT"
  | "WINDOW_UNKNOWN"
  | "CANONICAL_FREEZE_DRIFT"
  | "FREEZE_BASELINE_MISSING"
  | "FREEZE_BASELINE_CONFLICT"
  /* Season End / Archival Codes */
  | "SEASON_FINALIZATION_PREMATURE"
  | "SEASON_FINALIZATION_MISSING_AUDIT"
  | "SEASON_FINALIZATION_HASH_MISMATCH"
  | "POST_SEASON_MUTATION_ATTEMPT"
  | "ARCHIVE_IMMUTABILITY_BREACH"
  | "UNKNOWN";

export type Season1ObjectType =
  | "activationContract"
  | "activationReceipt"
  | "compiledConstraints"
  | "configSnapshot"
  | "canonBundle"
  | "canonIndex"
  | "protocolState"
  | "seasonEndReceipt"
  | "archiveBundle"
  | "unknown";

export interface Season1ViolationArtifact {
  id: string;
  seasonId: string;
  communityId?: string;
  code: Season1ViolationCode;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  occurredAtMs: number;
  actor: "SYSTEM" | "DEV" | "SERVICE";
  attempted: {
    objectType: Season1ObjectType;
    proposedHash?: string;
    existingHash?: string;
    window?: { startMs?: number; endMs?: number; nowMs: number };
    details?: Record<string, unknown>;
  };
  signatures: {
    signatureType: "HASH_STAMP_V1";
    signature: string;
  };
  hashes: {
    artifactHash: string;
  };
  schemaVersion: "v1";
}
