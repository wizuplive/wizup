import { localStorageSinks as s2ActivationSinks } from "../../season2Activation/persistence/localStorageSinks";
import { defaultReceiptSink as s1ActivationSinks } from "../../season1Activation/receiptSinks/compositeReceiptSink";
import { season1ArtifactService } from "../../season1Activation/season1Artifact";
import { defaultConstraintSink } from "../../seasonalGovernance/constraintCompiler/sinks/localStorageSink";
import { proofSinks as s2TemporalSinks } from "../../season2TemporalLock/persistence/proofSinks";
import { runtimeFingerprintSink } from "../../season2Integrity/persistence/runtimeFingerprintSink";
import { defaultHealthSink } from "../../seasonObservability/persistence/compositeSeasonHealthSink";
import { archivalPersistence } from "../../seasonEnd/persistence";

/**
 * 📖 UNIFIED ARTIFACT SOURCE
 * Safe, read-only access to already-sealed artifacts.
 */
export const artifactSources = {
  async getActivationReceipt(seasonId: string) {
    // Check S2 then S1
    const s2 = s2ActivationSinks.readReceipt(seasonId);
    if (s2) return { artifact: s2, hash: s2.activationHash };
    
    const s1 = await s1ActivationSinks.read(seasonId);
    if (s1) return { artifact: s1, hash: s1.sealHash };
    
    return null;
  },

  async getSealedContract(seasonId: string) {
    const s2 = s2ActivationSinks.readSealedContract(seasonId);
    if (s2) return { artifact: s2, hash: s2.hashes.sealHash };
    
    const s1 = season1ArtifactService.read("SEALED_CONTRACT");
    if (s1 && s1.seasonId === seasonId) return { artifact: s1, hash: s1.sealHash };
    
    return null;
  },

  async getCompiledConstraints(seasonId: string) {
    const constraints = await defaultConstraintSink.read(seasonId);
    if (constraints) return { artifact: constraints, hash: constraints.hashes.compiledHash };
    return null;
  },

  async getFreezeProof(seasonId: string) {
    const s2 = s2TemporalSinks.readFreezeProof(seasonId);
    if (s2) return { artifact: s2, hash: s2.registryHash };
    
    // S1 uses a different naming convention in some sinks; fallback check
    const raw = localStorage.getItem(`WIZUP::S1::FREEZE_BASELINE::${seasonId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { artifact: parsed, hash: parsed.immutableFingerprintHash };
    }
    
    return null;
  },

  async getRuntimeFingerprint(seasonId: string) {
    const finger = runtimeFingerprintSink.read(seasonId);
    if (finger) return { artifact: finger, hash: finger.hashes.fingerprintHash };
    return null;
  },

  async getSeasonHealth(seasonId: string) {
    const health = await defaultHealthSink.read(seasonId);
    if (health) return { artifact: health, hash: health.hashes.outputHash };
    return null;
  },

  async getSeasonEndReceipt(seasonId: string) {
    // Added await for async archivalPersistence.getReceipt call to fix property access on Promise
    const receipt = await archivalPersistence.getReceipt(seasonId);
    if (receipt) return { artifact: receipt, hash: receipt.receiptHash };
    return null;
  }
};