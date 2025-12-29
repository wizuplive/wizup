import { SeedVerificationResult } from "./types";
import { defaultSeedSink } from "./persistence/compositeSeedSink";
import { s1ArtifactSource } from "./sources/localStorageSource";
import { sha256Hex, canonicalize } from "./hash";

/**
 * 🔍 SEED VERIFIER
 */
export async function verifySeason2ReadinessSeed(fromSeasonId: string): Promise<SeedVerificationResult> {
  try {
    const seed = defaultSeedSink.read(fromSeasonId);
    if (!seed) return { ok: false, reason: "SEED_MISSING" };

    // 1. Recompute Seed Hash from Payload
    const { hashes, createdAtMs, ...payloadToVerify } = seed as any;
    const recomputedSeedHash = await sha256Hex(canonicalize(payloadToVerify));
    
    if (recomputedSeedHash !== seed.hashes.seedHash) {
      return { ok: false, reason: "SEED_HASH_DIVERGENCE", seedHash: seed.hashes.seedHash };
    }

    // 2. Recompute Input Hash from Current S1 Artifacts
    const receipt = await s1ArtifactSource.getReceipt(fromSeasonId);
    const archive = await s1ArtifactSource.getArchive(fromSeasonId);
    const constraints = await s1ArtifactSource.getConstraints(fromSeasonId);

    const inputPayload = {
      seasonEndReceiptHash: receipt?.receiptHash,
      archiveBundleHash: archive?.archiveHash,
      finalConstraintsHash: constraints?.hashes.compiledHash
    };
    const currentInputHash = await sha256Hex(canonicalize(inputPayload));

    if (currentInputHash !== seed.hashes.inputHash) {
      return { ok: false, reason: "SOURCE_ARTIFACT_DRIFT" };
    }

    return { ok: true, seedHash: seed.hashes.seedHash };

  } catch (e: any) {
    return { ok: false, reason: `VERIFICATION_ERROR: ${e.message}` };
  }
}