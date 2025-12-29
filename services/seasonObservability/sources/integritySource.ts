import { runtimeFingerprintSink } from "../../season2Integrity/persistence/runtimeFingerprintSink";
import { buildSeason2RuntimeFingerprint } from "../../season2Integrity/runtimeFingerprintBuilder";

export const integritySource = {
  // Fix: Updated return type to include sealedContractSealHash and corrected property names for consistency with SeasonHealthArtifactV1
  async checkIntegrity(seasonId: string): Promise<{ 
    supported: boolean; 
    ok?: boolean; 
    storedFingerprintHash?: string; 
    liveFingerprintHash?: string; 
    sealedContractSealHash?: string; 
    driftCode?: string; 
  }> {
    const stored = runtimeFingerprintSink.read(seasonId);
    if (!stored) return { supported: false };

    const live = await buildSeason2RuntimeFingerprint({ 
      seasonId, 
      sealedContractSealHash: stored.sealedContractSealHash 
    });

    const ok = stored.hashes.fingerprintHash === live.hashes.fingerprintHash;

    return {
      supported: true,
      ok,
      // Fix: Updated property names to match expected artifact schema
      storedFingerprintHash: stored.hashes.fingerprintHash,
      liveFingerprintHash: live.hashes.fingerprintHash,
      sealedContractSealHash: stored.sealedContractSealHash,
      driftCode: !ok ? "CRITICAL_RUNTIME_DRIFT" : undefined
    };
  }
};