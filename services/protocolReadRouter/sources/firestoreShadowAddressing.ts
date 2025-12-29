import type { ProtocolArtifactKey } from "../types";

/**
 * Firestore docId conventions must be deterministic and match your sinks.
 * This file is the single canonical mapping.
 */
export type FirestoreAddress = { collection: string; docId: string };

export function firestoreAddressFor(k: ProtocolArtifactKey): FirestoreAddress | null {
  const s = k.seasonId;
  const c = k.communityId;

  switch (k.kind) {
    // Season 1
    case "S1_ACTIVATION_RECEIPT":
      return { collection: "activation_receipts_v1", docId: s };

    case "S1_SEALED_CONTRACT":
      return { collection: "zaps_season1_sealed_contracts", docId: s };

    case "S1_CONSTRAINTS":
      return { collection: "zaps_season1_constraints_v1", docId: s };

    case "S1_CANON_BUNDLE":
      if (!c) return null;
      return { collection: "zaps_season1_canon_bundles", docId: `${s}__${c}` };

    case "S1_CANON_BUNDLE_INDEX":
      return { collection: "zaps_season1_canon_bundle_indices_v1", docId: s };

    case "S1_VIOLATION_ARTIFACT":
      return null; // Usually ID-based, not addressable by season alone

    case "S1_SEASON_END_RECEIPT":
      return { collection: "zaps_season_end_receipts_v1", docId: s };

    case "S1_ARCHIVE_BUNDLE":
      return { collection: "zaps_season_archive_bundles_v1", docId: s };

    // Season 2
    case "S2_READINESS_SEED":
      return { collection: "zaps_season2_readiness_seeds_v1", docId: `from__${s}` };

    case "S2_CANDIDATE_CONTRACT":
      return { collection: "zaps_season2_candidate_contracts_v1", docId: s };

    case "S2_READY_ARTIFACT":
      return { collection: "zaps_season2_ready_artifacts_v1", docId: s };

    case "S2_SEALED_CONTRACT":
      return { collection: "zaps_season2_sealed_contracts_v1", docId: s };

    case "S2_ACTIVATION_RECEIPT":
      return { collection: "zaps_season2_activation_receipts_v1", docId: s };

    // Ops / audit
    case "SEASON_HEALTH":
      return { collection: "zaps_season_health_v1", docId: s };

    case "AUDIT_PACK":
      return null; // Keyed by packHash; not addressable from seasonId alone.

    case "PARITY_REPORT":
      return { collection: "wizup_parity_reports_v1", docId: s };

    case "PARITY_GATE_VERDICT":
      return { collection: "wizup_parity_gate_verdicts_v1", docId: s };

    default:
      return null;
  }
}
