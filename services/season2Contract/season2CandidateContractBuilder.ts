import { Season2CandidateContract } from "./types";
import { getSeason2ReadinessSeed } from "../season2ReadinessSeed/buildSeed";
import { verifySeason2ReadinessSeed } from "../season2ReadinessSeed/verifySeed";
import { hashContract, sha256Hex, canonicalize } from "./hash";
import { contractSinks } from "./persistence/sinks";
import { violationEmitter } from "./persistence/violationEmitter";
import { CALIBRATION_v1_1 } from "../seasonalSimulation/calibration";

/**
 * 🏗️ SEASON 2 CANDIDATE CONTRACT BUILDER
 * Consumes the Readiness Seed as the authoritative lineage input.
 */
export async function buildSeason2CandidateContract(args: {
  prevSeasonId: string;
  desiredSeasonId?: string;
  window?: { startMs: number; endMs: number };
}): Promise<Season2CandidateContract | null> {
  const { prevSeasonId, desiredSeasonId, window: providedWindow } = args;

  try {
    // 1. Load Readiness Seed
    const seed = await getSeason2ReadinessSeed(prevSeasonId);
    if (!seed) {
      await violationEmitter.emit(prevSeasonId, "SEED_MISSING", { prevSeasonId });
      return null;
    }

    // 2. Verify Seed Integrity
    const verification = await verifySeason2ReadinessSeed(prevSeasonId);
    if (!verification.ok) {
      await violationEmitter.emit(prevSeasonId, "SEED_HASH_DRIFT", { reason: verification.reason });
      return null;
    }

    // 3. Resolve Season ID
    const seasonId = desiredSeasonId || `S2_FROM_${prevSeasonId.toUpperCase()}`;

    // 4. Resolve Parameters Snapshot
    // In v1, we carry forward locked calibration from S1 as the baseline for S2
    const parameters = {
      ...CALIBRATION_v1_1,
      lineage: {
        seedHash: seed.hashes.seedHash,
        prevSeasonId
      }
    };

    // 5. Resolve Time Window
    // Default: 90 days starting 7 days from now
    const startMs = providedWindow?.startMs || Date.now() + (7 * 24 * 3600 * 1000);
    const endMs = providedWindow?.endMs || startMs + (90 * 24 * 3600 * 1000);
    const window = { startMs, endMs };

    // 6. Build Contract Object
    const partialContract: Omit<Season2CandidateContract, "hashes"> = {
      schemaVersion: "v1",
      seasonId,
      prevSeasonId,
      status: "CANDIDATE",
      lineage: {
        readinessSeedHash: seed.hashes.seedHash,
        prevArchiveHash: seed.pointers.archiveBundleHash,
        prevEndReceiptHash: seed.pointers.seasonEndReceiptHash,
        finalConstraintsHash: seed.pointers.finalConstraintsHash
      },
      window,
      parameters,
      builder: {
        builderVersion: "season2ContractBuilder@v1",
        builtAtMs: Date.now()
      }
    };

    const contractHash = await hashContract(partialContract);

    const contract: Season2CandidateContract = {
      ...partialContract,
      hashes: {
        seedHash: seed.hashes.seedHash,
        contractHash
      }
    };

    // 7. Persist
    await contractSinks.writeCandidate(contract);

    console.log(`%c[PROTOCOL] Season 2 Candidate Contract Built: ${seasonId}`, "color: #06b6d4; font-weight: bold;");
    return contract;

  } catch (e: any) {
    console.error("[BUILDER_CRITICAL] Season 2 contract generation failed", e);
    return null;
  }
}
