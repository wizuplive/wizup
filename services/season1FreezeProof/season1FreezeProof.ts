import { isSeason1Activated } from "../season1Runtime/isSeason1Activated";
import { freezeEnforcer } from "./freezeEnforcer";
import { freezeBaselineSource } from "./freezeBaselineSource";
import { driftDetector } from "./driftDetector";
import { registrySource } from "./sources/registrySource";
import { season1ArtifactService } from "../season1Activation/season1Artifact";
import { defaultReceiptSink } from "../season1Activation/receiptSinks/compositeReceiptSink";
import { defaultConstraintSink } from "../seasonalGovernance/constraintCompiler/sinks/localStorageSink";
import { violationSink } from "../season1TemporalLock/sinks/violationSink";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

export const season1FreezeProof = {
  /**
   * Main guard for all Season 1 write paths.
   * Runs drift detection and sets irreversible freeze if compromised.
   */
  async assertSeason1NotFrozenOrNoop(seasonId: string): Promise<{ allowed: boolean }> {
    const isS1 = seasonId === "S1" || seasonId === "SEASON_1" || seasonId === "active-season";
    if (!isS1) return { allowed: true };

    // 1. Check if already frozen
    if (freezeEnforcer.isSeason1Frozen("S1")) {
      return { allowed: false };
    }

    // 2. Check activation
    const activated = await isSeason1Activated("S1");
    if (!activated) return { allowed: true };

    // 3. Compute Current State Fingerprint
    const contract = season1ArtifactService.read("CONTRACT");
    const receipt = await defaultReceiptSink.read("S1");
    const constraints = await defaultConstraintSink.read("S1");

    if (!contract || !receipt || !constraints) {
      // If critical artifacts missing after activation, something is wrong.
      return { allowed: true }; // Fail-open
    }

    const currentHash = await registrySource.computeImmutableFingerprint({
      seasonId: "S1",
      contractHash: contract.activationHash,
      receiptHash: receipt.sealHash,
      constraintsHash: constraints.hashes.compiledHash
    });

    // 4. Load Baseline
    const baseline = await freezeBaselineSource.getBaseline("S1");
    
    // 5. Detect Drift
    const result = driftDetector.detectCanonicalDrift("S1", currentHash, baseline, true);

    if (result.status === "DRIFT") {
      await this.emitFreezeViolation("CANONICAL_FREEZE_DRIFT", result.baselineHash, result.currentHash, receipt.sealHash);
      freezeEnforcer.setFrozen("S1");
      return { allowed: false };
    }

    if (result.status === "BASELINE_MISSING") {
      await this.emitFreezeViolation("FREEZE_BASELINE_MISSING", "MISSING", currentHash, receipt.sealHash);
      freezeEnforcer.setFrozen("S1");
      return { allowed: false };
    }

    return { allowed: true };
  },

  async emitFreezeViolation(code: any, baselineHash: string, currentHash: string, receiptHash: string) {
    const occurredAtMs = Date.now();
    const idInput = { code, baselineHash, currentHash, receiptHash, seasonId: "S1" };
    const id = await sha256Hex(canonicalJson(idInput));

    const artifact: any = {
      id,
      seasonId: "S1",
      code,
      severity: "CRITICAL",
      occurredAtMs,
      actor: "SYSTEM",
      attempted: {
        objectType: "protocolState",
        baselineHash,
        currentHash,
        activationReceiptHash: receiptHash
      },
      enforcement: "SEASON_FROZEN",
      signatures: {
        signatureType: "HASH_STAMP_V1",
        signature: await sha256Hex(canonicalJson({ ...idInput, salt: "FREEZE_FUSE" }))
      },
      hashes: {
        artifactHash: ""
      },
      schemaVersion: "v1"
    };

    const { hashes, ...stable } = artifact;
    artifact.hashes.artifactHash = await sha256Hex(canonicalJson(stable));
    
    await violationSink.write(artifact);
  }
};
