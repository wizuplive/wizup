/**
 * 🔒 PROTOCOL BOUNDARY CONTRACT — TYPES
 * =====================================
 */

export type BoundaryContractVersion = "boundary@v1";

export type ProtocolFreezeManifest = {
  version: BoundaryContractVersion;

  // Frozen allowlists: define what “counts” as protocol truth
  frozen: {
    signalSchemaHash: string;
    season0RunnerHash: string;
    season1EngineHash?: string;
    constraintCompilerHash?: string;
    canonBundleSchemaHash: string;
    verifierHash: string;
    violationSchemaHash: string;

    // Hashing canonicalization code fingerprint
    canonicalizationHash: string;

    // Hard invariants (Must never change during infra integration)
    invariants: {
      noUiCoupling: true;
      noBalanceMutation: true;
      recognitionIsSeasonalOnly: true;
      recognitionNeverFlowsToEnergy: true;
      failOpenForSignals: true;
      writeOnlyShadowSinks: true;
    };
  };

  // Allowed-to-change list (infrastructure plumbing only)
  mutable: {
    storageAdapters: string[]; // e.g. ["LocalStorage", "FirestoreShadow"]
    authAdapters: string[];    // e.g. ["GoogleAuth", "DemoAuth"]
    transportAdapters: string[];
    observabilityAdapters: string[];
  };

  // For audit lineage
  createdAtMs: number; // excluded from contractHash input
  buildTag?: string;   // excluded from contractHash input

  // Deterministic contract hash (authoritative)
  contractHash: string;
};

export type ProtocolIntegrityDecision =
  | { ok: true; fingerprintHash: string }
  | { ok: false; fingerprintHash: string; reason: "DRIFT_DETECTED"; latchKey: string };
