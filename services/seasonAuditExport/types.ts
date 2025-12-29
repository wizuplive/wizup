/**
 * 📦 SEASON AUDIT PACK TYPES
 * ==========================
 */

export type AuditArtifactType =
  | "ACTIVATION_RECEIPT"
  | "SEALED_CONTRACT"
  | "COMPILED_CONSTRAINTS"
  | "FREEZE_PROOF"
  | "RUNTIME_FINGERPRINT"
  | "SEASON_HEALTH"
  | "SEASON_END_RECEIPT";

export interface SeasonAuditPackLine {
  type: AuditArtifactType;
  artifact: any;
  artifactHash: string;
}

export interface SeasonAuditPackManifest {
  type: "AUDIT_PACK_MANIFEST";
  schemaVersion: "v1";
  seasonId: string;
  artifactOrder: AuditArtifactType[];
  artifactHashes: Record<string, string>;
  packHash: string;
  engineVersion: string; // "seasonAuditExport@v1"
  createdAtMs: number;
}

export interface AuditPackResult {
  lines: string[]; // JSONL strings
  manifest: SeasonAuditPackManifest;
  fileName: string;
}
