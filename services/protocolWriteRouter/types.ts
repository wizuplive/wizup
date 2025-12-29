/**
 * 🚥 PROTOCOL WRITE ROUTER TYPES
 * ==============================
 */

export type ProtocolWriteKind =
  | "ACTIVATION_RECEIPT"
  | "SEALED_CONTRACT"
  | "CONSTRAINTS"
  | "CANON_BUNDLE"
  | "SEASON_END_RECEIPT"
  | "ARCHIVE_BUNDLE"
  | "READINESS_SEED"
  | "RUNTIME_FINGERPRINT"
  | "SEASON_HEALTH"
  | "AUDIT_PACK"
  | "OTHER";

export type ProtocolWriteKey = {
  seasonId: string;
  kind: ProtocolWriteKind;
  communityId?: string;
  docId: string; // fully-determined doc key (or LS key suffix), stable
};

export type ProtocolWriteResult = {
  seasonId: string;
  kind: ProtocolWriteKind;
  communityId?: string;
  local: { ok: boolean; mode: "WROTE" | "NOOP" };
  firestore: { ok: boolean; mode: "WROTE" | "NOOP_DUE_TO_LATCH" | "NOOP_DISABLED" };
};
