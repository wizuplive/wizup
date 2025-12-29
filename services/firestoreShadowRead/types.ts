/**
 * 📦 SHADOW AUDIT TYPES
 * =====================
 */

export const SHADOW_COLLECTIONS = {
  ACTIVATION_RECEIPTS: "activation_receipts_v1",
  SEALED_CONTRACTS: "zaps_sealed_contracts_v1",
  COMPILED_CONSTRAINTS: "zaps_compiled_constraints_v1",
  CANON_BUNDLES: "zaps_season1_canon_bundles",
  VIOLATIONS: "zaps_season_violation_artifacts_v1",
  SEASON_END_RECEIPTS: "zaps_season_end_receipts_v1",
  ARCHIVE_BUNDLES: "zaps_season_archive_bundles_v1",
  READINESS_SEEDS: "zaps_season2_readiness_seeds_v1",
  SEASON_HEALTH: "zaps_season_health_artifacts_v1",
  RUNTIME_FINGERPRINTS: "zaps_season2_runtime_fingerprints_v1",
  FREEZE_PROOFS: "zaps_season2_freeze_proofs_v1"
} as const;

export type AuditArtifactKind =
  | "activation_receipt"
  | "sealed_contract"
  | "compiled_constraints"
  | "canon_bundle"
  | "season_health"
  | "runtime_fingerprint"
  | "freeze_proof"
  | "violation"
  | "season_end_receipt";

export interface AuditPack {
  meta: {
    seasonId: string;
    generatedAtMs: number;
    source: "firestoreShadow";
    schema: "auditPack@v1";
    counts: {
      canonBundles: number;
      violations: number;
      healthArtifacts: number;
    };
  };
  lines: string[]; // JSONL lines
  packHash: string;
  componentHashes: {
    receiptsHash?: string;
    bundlesHash?: string;
    violationsHash?: string;
    healthHash?: string;
  };
}
