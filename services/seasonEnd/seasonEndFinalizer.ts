import { isSeason1Activated } from "../season1Runtime/isSeason1Activated";
import { season1ArtifactService } from "../season1Activation/season1Artifact";
import { listCanonIndexBySeason } from "../season1Verification/index/canonBundleIndex";
import { LocalStorageCanonBundleSink } from "../season1Verification/sinks/localStorageCanonBundleSink";
import { defaultReceiptSink } from "../season1Activation/receiptSinks/compositeReceiptSink";
import { defaultConstraintSink } from "../seasonalGovernance/constraintCompiler/sinks/localStorageSink";
import { defaultReadinessSink } from "../season1Activation/persistence/localStorageReadinessSink";
import { freezeEnforcer } from "../season1FreezeProof/freezeEnforcer";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { archivalPersistence } from "./persistence";
import { season1TemporalLock } from "../season1TemporalLock/season1TemporalLock";
import { SeasonArchiveBundle, SeasonEndReceipt, Season2ReadinessSeed, SeasonArchiveCommunityEntry } from "./types";

/**
 * 🏁 SEASON END FINALIZER
 * Orchestrates the irreversible sealing of Season 1 history.
 */
export const seasonEndFinalizer = {
  async finalizeSeason1(args: { seasonId: string; nowMs?: number }): Promise<{ status: "FINALIZED" | "NOOP" | "FAILED_SAFE"; endReceiptHash?: string }> {
    const seasonId = args.seasonId === "SEASON_1" ? "S1" : args.seasonId;
    const nowMs = args.nowMs || Date.now();

    // 1. Authorization & Window Checks
    const activated = await isSeason1Activated(seasonId);
    const contract = season1ArtifactService.read("CONTRACT");
    if (!activated || !contract) {
      return { status: "FAILED_SAFE" };
    }

    if (nowMs < contract.timeWindow.endMs) {
      await season1TemporalLock.emitViolation("SEASON_FINALIZATION_PREMATURE", "CRITICAL", 
        { seasonId, objectType: "unknown" }, 
        { nowMs, endMs: contract.timeWindow.endMs }
      );
      return { status: "FAILED_SAFE" };
    }

    // 2. Idempotency Check
    // Added await for getReceipt promise
    const existingReceipt = await archivalPersistence.getReceipt(seasonId);
    if (existingReceipt) return { status: "NOOP", endReceiptHash: existingReceipt.receiptHash };

    // 3. Artifact Synthesis
    const indexEntries = listCanonIndexBySeason(seasonId);
    const sortedEntries = [...indexEntries].sort((a, b) => a.communityId.localeCompare(b.communityId));
    const bundleReader = new LocalStorageCanonBundleSink();
    const batchAudit = await defaultReadinessSink.read(seasonId); // Readiness sink doubles as summary storage

    if (!batchAudit) {
        await season1TemporalLock.emitViolation("SEASON_FINALIZATION_MISSING_AUDIT", "CRITICAL", { seasonId, objectType: "unknown" }, {});
        return { status: "FAILED_SAFE" };
    }

    const communities: SeasonArchiveCommunityEntry[] = [];
    for (const entry of sortedEntries) {
      const bundle = bundleReader.read(seasonId, entry.communityId);
      const constraints = await defaultConstraintSink.read(seasonId);
      const receipt = await defaultReceiptSink.read(seasonId);
      
      communities.push({
        communityId: entry.communityId,
        canonBundleHash: bundle?.bundleHash || "MISSING",
        constraintsHash: constraints?.hashes.compiledHash || "MISSING",
        activationReceiptHash: receipt?.sealHash || "MISSING",
      });
    }

    // 4. Build Archive Bundle
    const archivePayload = {
      schemaVersion: "v1" as const,
      seasonId,
      window: contract.timeWindow,
      communities,
      global: {
        totalCommunities: indexEntries.length,
        totalBundles: communities.filter(c => c.canonBundleHash !== "MISSING").length,
        anomaliesDetected: communities.some(c => c.canonBundleHash === "MISSING"),
        criticalViolationsDuringSeason: false, // Qualitative scan
        lastBatchAuditHash: batchAudit.hashes.outputHash
      }
    };
    const archiveHash = await sha256Hex(canonicalJson(archivePayload));
    
    // 🔒 ATOMIC RECOVERY CHECK: If archive exists, re-verify hash
    // Added await for getArchive promise
    const existingArchive = await archivalPersistence.getArchive(seasonId);
    // Added check for archiveHash property access after await
    if (existingArchive && existingArchive.archiveHash !== archiveHash) {
       await season1TemporalLock.emitViolation("SEASON_FINALIZATION_HASH_MISMATCH", "CRITICAL", 
         { seasonId, objectType: "archiveBundle", proposedHash: archiveHash }, 
         { existingHash: existingArchive.archiveHash }
       );
       return { status: "FAILED_SAFE" };
    }

    const archive: SeasonArchiveBundle = { ...archivePayload, archiveHash, archivedAtMs: nowMs };

    // 5. Build Season End Receipt
    const receiptPayload = {
      schemaVersion: "v1" as const,
      seasonId,
      status: "FINALIZED" as const,
      window: contract.timeWindow,
      canonIndexHash: await sha256Hex(canonicalJson(sortedEntries)),
      globalArchiveHash: archiveHash,
      batchAuditSummaryHash: batchAudit.hashes.outputHash,
      freezeProofStatus: (freezeEnforcer.isSeason1Frozen(seasonId) ? "FROZEN" : "OK") as any
    };
    const receiptHash = await sha256Hex(canonicalJson(receiptPayload));
    const receipt: SeasonEndReceipt = { ...receiptPayload, receiptHash, finalizedAtMs: nowMs };

    // 6. Build Season 2 Readiness Seed
    const seedPayload = {
      schemaVersion: "v1" as const,
      prevSeasonId: seasonId,
      pointers: {
        activationContractHash: contract.activationHash,
        constraintsHash: receiptPayload.batchAuditSummaryHash,
        archiveHash,
        endReceiptHash: receiptHash
      }
    };
    const seedHash = await sha256Hex(canonicalJson(seedPayload));
    const seed: Season2ReadinessSeed = { ...seedPayload, seedHash, generatedAtMs: nowMs };

    // 7. Atomic Writes (Ordered)
    await archivalPersistence.writeArchive(archive);
    await archivalPersistence.writeReceipt(receipt);
    await archivalPersistence.writeSeed(seed);

    console.log(`%c[PROTOCOL] Season ${seasonId} Finalized. Receipt Hash: ${receiptHash}`, "color: #22c55e; font-weight: bold;");
    return { status: "FINALIZED", endReceiptHash: receiptHash };
  }
};