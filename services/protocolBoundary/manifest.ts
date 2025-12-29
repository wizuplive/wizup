import { ProtocolFreezeManifest } from "./types/boundaryTypes";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

/**
 * 📜 AUTHORITATIVE BOUNDARY MANIFEST (Season 0 -> Season 1 Transition)
 * ===================================================================
 */

const RAW_MANIFEST: Omit<ProtocolFreezeManifest, "contractHash" | "createdAtMs" | "buildTag"> = {
  version: "boundary@v1",
  frozen: {
    // Current fingerprints of protocol logic/schemas
    signalSchemaHash: "sig_v1_frozen_7f8a92",
    season0RunnerHash: "runner_v1_frozen_4d2c11",
    season1EngineHash: "engine_v1_frozen_b3e129",
    constraintCompilerHash: "compiler_v1_frozen_e5d4a1",
    canonBundleSchemaHash: "bundle_v1_frozen_92c3d4",
    verifierHash: "verifier_v1_frozen_1a2b3c",
    violationSchemaHash: "violation_v1_frozen_f8e7d6",
    
    canonicalizationHash: "canon_v1_frozen_6d5e4f",

    invariants: {
      noUiCoupling: true,
      noBalanceMutation: true,
      recognitionIsSeasonalOnly: true,
      recognitionNeverFlowsToEnergy: true,
      failOpenForSignals: true,
      writeOnlyShadowSinks: true,
    }
  },
  mutable: {
    storageAdapters: ["LocalStorage", "FirestoreShadow"],
    authAdapters: ["GoogleAuth", "DemoAuth"],
    transportAdapters: ["FirebaseFunctions"],
    observabilityAdapters: ["DriftLog", "ConsoleAudit"]
  }
};

/**
 * 🏗️ BUILD AUTHORITATIVE CONTRACT
 */
export async function getAuthoritativeManifest(): Promise<ProtocolFreezeManifest> {
  const contractHash = await sha256Hex(canonicalJson(RAW_MANIFEST));
  
  return {
    ...RAW_MANIFEST,
    createdAtMs: 1739983416000, // Fixed genesis timestamp
    buildTag: (window as any).WIZUP_BUILD_TAG || "v1.4-genesis",
    contractHash
  } as ProtocolFreezeManifest;
}
