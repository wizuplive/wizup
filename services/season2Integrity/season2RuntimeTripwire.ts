import { TripwireResult } from "./types";
import { isSeason2NoopLatched, latchSeason2Noop } from "./noopLatch";
import { runtimeFingerprintSink } from "./persistence/runtimeFingerprintSink";
import { buildSeason2RuntimeFingerprint } from "./runtimeFingerprintBuilder";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";

/**
 * ⚡ SEASON 2 RUNTIME TRIPWIRE
 * Authoritative guard for write/resolution paths.
 */
export async function verifySeason2RuntimeOrLatch(args: {
  seasonId: string;
  sealedContractSealHash: string;
  context: { entryPoint: string; communityId?: string };
}): Promise<TripwireResult> {
  if (!args.seasonId) return { ok: false, code: "NO_SEASON_ID" };

  // 1. Check existing latch
  if (await isSeason2NoopLatched(args.seasonId)) {
    return { ok: false, code: "NOOP_LATCHED" };
  }

  try {
    // 2. Load stored Fingerprint (The "Law")
    const stored = runtimeFingerprintSink.read(args.seasonId);
    if (!stored) {
      // Missing fingerprint is a failure of activation protocol
      await latchSeason2Noop({
        seasonId: args.seasonId,
        reason: "CRITICAL_RUNTIME_DRIFT",
        sealedContractSealHash: args.sealedContractSealHash
      });
      return { ok: false, code: "FINGERPRINT_MISSING" };
    }

    // 3. Rebuild Live Fingerprint (The "Reality")
    const rebuilt = await buildSeason2RuntimeFingerprint({
      seasonId: args.seasonId,
      sealedContractSealHash: args.sealedContractSealHash
    });

    // 4. Comparison
    if (stored.sealedContractSealHash !== args.sealedContractSealHash) {
       await emitViolationAndLatch(args, stored.hashes.fingerprintHash, rebuilt.hashes.fingerprintHash);
       return { ok: false, code: "CONTRACT_SEAL_MISMATCH" };
    }

    if (stored.hashes.fingerprintHash !== rebuilt.hashes.fingerprintHash) {
       await emitViolationAndLatch(args, stored.hashes.fingerprintHash, rebuilt.hashes.fingerprintHash);
       return { ok: false, code: "HASH_MISMATCH" };
    }

    return { ok: true, fingerprintHash: stored.hashes.fingerprintHash };

  } catch (e) {
    console.error("[TRIPWIRE_ERROR] Verification failed", e);
    return { ok: false, code: "VERIFIER_ERROR" };
  }
}

async function emitViolationAndLatch(args: any, storedHash: string, liveHash: string) {
  // Emit critical violation (using existing violation infra)
  await violationEmitter.emit(args.seasonId, "S2_CANON_REGISTRY_HASH_MISMATCH" as any, {
    reason: "CRITICAL_RUNTIME_DRIFT",
    entryPoint: args.context.entryPoint,
    communityId: args.context.communityId,
    storedFingerprintHash: storedHash,
    liveFingerprintHash: liveHash,
    sealedContractSealHash: args.sealedContractSealHash
  });

  // Trip the latch
  await latchSeason2Noop({
    seasonId: args.seasonId,
    reason: "CRITICAL_RUNTIME_DRIFT",
    sealedContractSealHash: args.sealedContractSealHash,
    fingerprintHashAtTrigger: liveHash
  });
}
