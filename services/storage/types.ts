/**
 * 🔌 STORAGE ROUTING TYPES
 * ========================
 */

export type ArtifactType =
  | "ACTIVATION_RECEIPT"
  | "SEALED_CONTRACT"
  | "COMPILED_CONSTRAINTS"
  | "CANON_BUNDLE"
  | "FREEZE_PROOF"
  | "RUNTIME_FINGERPRINT"
  | "SEASON_HEALTH"
  | "SEASON_END_RECEIPT"
  | "ARCHIVE_BUNDLE"
  | "IDENTITY_MAPPING";

export type ReadSourceLabel = "LOCAL_STORAGE" | "FIRESTORE_SHADOW";

export interface ReadRouterResult<T> {
  data: T | null;
  source: ReadSourceLabel;
  integrityVerified: boolean;
}

export interface CutoverState {
  phase: "A" | "B" | "C";
  preferFirestore: boolean;
  enforceParity: boolean;
  rollbackTriggered: boolean;
}
