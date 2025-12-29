/**
 * 🔌 PROTOCOL READ ROUTER TYPES
 * =============================
 */

export type ReadSource = "FIRESTORE" | "LOCAL" | "NOOP";

export type ProtocolArtifactKind =
  | "S1_ACTIVATION_RECEIPT"
  | "S1_SEALED_CONTRACT"
  | "S1_CONSTRAINTS"
  | "S1_CANON_BUNDLE"
  | "S1_CANON_BUNDLE_INDEX"
  | "S1_VIOLATION_ARTIFACT"
  | "S1_SEASON_END_RECEIPT"
  | "S1_ARCHIVE_BUNDLE"
  | "S2_READINESS_SEED"
  | "S2_CANDIDATE_CONTRACT"
  | "S2_READY_ARTIFACT"
  | "S2_SEALED_CONTRACT"
  | "S2_ACTIVATION_RECEIPT"
  | "SEASON_HEALTH"
  | "AUDIT_PACK"
  | "PARITY_REPORT"
  | "PARITY_GATE_VERDICT"
  | "UNKNOWN";

export type ProtocolArtifactKey = {
  kind: ProtocolArtifactKind;
  seasonId: string;
  communityId?: string;
};

export type ReadResult<T> = {
  value: T | null;
  source: ReadSource;
  // used for parity comparisons
  fingerprint?: string; // e.g., outputHash/bundleHash/decisionHash
  // debug only
  meta?: Record<string, unknown>;
};

export interface ProtocolArtifactSource {
  read<T>(key: ProtocolArtifactKey): Promise<ReadResult<T>>;
}
