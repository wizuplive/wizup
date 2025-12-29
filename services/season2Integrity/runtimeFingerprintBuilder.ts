import { RuntimeFingerprintV1 } from "./types";
import { sha256Hex, canonicalize } from "../season2Activation/hash";
import { CALIBRATION_v1_1 } from "../seasonalSimulation/calibration";
import { contractSinks } from "../season2Contract/persistence/sinks";

/**
 * 🏗️ RUNTIME FINGERPRINT BUILDER
 * Captures the deterministic "Soul" of the running application code and config.
 */
export async function buildSeason2RuntimeFingerprint(args: {
  seasonId: string;
  sealedContractSealHash: string;
}): Promise<RuntimeFingerprintV1> {
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  
  // Versions sourced from code constants or schemas
  const versions = {
    constraintAwareEngineVersion: "constraintAwareResolver@v1",
    constraintCompilerVersion: "season2ConstraintCompiler@v1",
    moralGateVersion: "conscience@v1.4",
    canonBundleSchemaVersion: "v1",
    violationSchemaVersion: "v1",
    season2GateVersion: "noopLatch@v1",
    season2TemporalLockVersion: "v1",
    canonFreezeProofVersion: "v1"
  };

  // Resolve config and contract hashes
  // In a real S2 flow, these would come from the finalized artifacts
  const configHash = await sha256Hex(canonicalize(CALIBRATION_v1_1));
  
  // Try to load the sealed contract to verify seal hash linkage
  const sealedContract = contractSinks.readReady(args.seasonId); 
  const sealedContractHash = sealedContract ? sealedContract.hashes.contractHash : "unknown";

  // Engine Bundle Hash: all logic version strings + config identity
  const engineBundleHash = await sha256Hex(canonicalize({ versions, configHash }));

  const partial: Omit<RuntimeFingerprintV1, "hashes"> = {
    schemaVersion: "v1",
    seasonId: args.seasonId,
    sealedContractSealHash: args.sealedContractSealHash,
    createdAtMs: Date.now(),
    build: {
      buildTag: (window as any).WIZUP_BUILD_TAG || "dev-unknown",
      runtimeEnv: isDev ? "dev" : "prod"
    },
    versions
  };

  const hashes = {
    sealedContractHash,
    constraintsHash: "pending", // S2 constraints usually derived post-seal
    configHash,
    engineBundleHash,
    fingerprintHash: ""
  };

  // Final fingerprint hash: Canonical data minus volatile createdAtMs
  const hashInput = { ...partial, hashes, createdAtMs: undefined };
  hashes.fingerprintHash = await sha256Hex(canonicalize(hashInput));

  return {
    ...partial,
    hashes
  } as RuntimeFingerprintV1;
}
