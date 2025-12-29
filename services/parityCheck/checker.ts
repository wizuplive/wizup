import { ParityReport, ParityMismatch, ParityStatus } from "./types";
import { computeParityHash, areStructurallyEqual } from "./compare";
import { shadowReadClient } from "../firestoreShadowRead/client";
import { SHADOW_COLLECTIONS } from "../firestoreShadowRead/types";
import { listCanonIndexBySeason } from "../season1Verification/index/canonBundleIndex";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

/**
 * 🕵️ SHADOW PARITY CHECKER
 * ========================
 */

export async function runShadowParityCheck(args: {
  seasonId: string;
  maxCommunities?: number;
}): Promise<ParityReport> {
  const { seasonId } = args;
  const mismatches: ParityMismatch[] = [];
  const artifactCounts = { local: 0, firestore: 0, compared: 0 };
  const localHashes: string[] = [];
  const firestoreHashes: string[] = [];

  // --- 1. DEFINE GLOBAL ARTIFACTS ---
  const globalChecklist = [
    { type: "ACTIVATION_RECEIPT", lsKey: `WIZUP::S1::ACTIVATION_RECEIPT::v1::${seasonId}`, fsCol: SHADOW_COLLECTIONS.ACTIVATION_RECEIPTS, fsId: seasonId },
    { type: "SEALED_CONTRACT", lsKey: `WIZUP::S1::ARTIFACT::SEALED_CONTRACT`, fsCol: SHADOW_COLLECTIONS.SEALED_CONTRACTS, fsId: seasonId }, // Standard S1 mapping
    { type: "COMPILED_CONSTRAINTS", lsKey: `WIZUP::GOV::CONSTRAINTS::v1::${seasonId}`, fsCol: SHADOW_COLLECTIONS.COMPILED_CONSTRAINTS, fsId: seasonId },
    { type: "FREEZE_PROOF", lsKey: `WIZUP::S1::FREEZE_BASELINE::${seasonId}`, fsCol: SHADOW_COLLECTIONS.FREEZE_PROOFS, fsId: seasonId },
    { type: "RUNTIME_FINGERPRINT", lsKey: `WIZUP::S2::RUNTIME_FINGERPRINT::v1::${seasonId}`, fsCol: SHADOW_COLLECTIONS.RUNTIME_FINGERPRINTS, fsId: seasonId },
    { type: "SEASON_HEALTH", lsKey: `WIZUP::SEASON_HEALTH::v1::${seasonId}`, fsCol: SHADOW_COLLECTIONS.SEASON_HEALTH, fsId: seasonId },
    { type: "SEASON_END_RECEIPT", lsKey: `WIZUP::S1::SEASON_END_RECEIPT::v1::${seasonId}`, fsCol: SHADOW_COLLECTIONS.SEASON_END_RECEIPTS, fsId: seasonId },
    { type: "ARCHIVE_BUNDLE", lsKey: `WIZUP::S1::ARCHIVE_BUNDLE::v1::${seasonId}`, fsCol: SHADOW_COLLECTIONS.ARCHIVE_BUNDLES, fsId: seasonId },
  ];

  for (const item of globalChecklist) {
    const local = safeReadLocal(item.lsKey);
    const remote = await shadowReadClient.getDocJson(item.fsCol, item.fsId);

    await recordComparison(item.type, "GLOBAL", seasonId, local, remote, mismatches, artifactCounts, localHashes, firestoreHashes);
  }

  // --- 2. DEFINE COMMUNITY ARTIFACTS ---
  const communityIndex = listCanonIndexBySeason(seasonId).slice(0, args.maxCommunities || 500);
  for (const entry of communityIndex) {
    const communityId = entry.communityId;
    const bundleId = `${seasonId}__${communityId}`;
    const lsKey = `WIZUP::ZAPS::S1::CANON_BUNDLE::${seasonId}::${communityId}`;
    
    const local = safeReadLocal(lsKey);
    const remote = await shadowReadClient.getDocJson(SHADOW_COLLECTIONS.CANON_BUNDLES, bundleId);

    await recordComparison("CANON_BUNDLE", "COMMUNITY", `${seasonId}::${communityId}`, local, remote, mismatches, artifactCounts, localHashes, firestoreHashes);
  }

  // --- 3. COMPUTE FINAL STATUS ---
  let status: ParityStatus = "PASS";
  if (mismatches.some((m) => m.reason === "HASH_MISMATCH" || m.reason === "STRUCTURE_MISMATCH" || m.reason === "MISSING_LOCAL" || m.reason === "MISSING_FIRESTORE")) {
    status = "FAIL";
  } else if (mismatches.length > 0) {
    status = "WARN";
  }

  // --- 4. AGGREGATE HASHES ---
  const localAggregateHash = await sha256Hex(localHashes.sort().join("|"));
  const firestoreAggregateHash = await sha256Hex(firestoreHashes.sort().join("|"));

  const report: Omit<ParityReport, "hashes"> = {
    schemaVersion: "v1",
    seasonId,
    status,
    checkedAtMs: Date.now(),
    artifactCounts,
    mismatches,
  };

  const reportHash = await sha256Hex(canonicalJson(report));

  return {
    ...report,
    hashes: {
      localAggregateHash,
      firestoreAggregateHash,
      reportHash,
    },
  } as ParityReport;
}

async function recordComparison(
  type: string,
  scope: "GLOBAL" | "COMMUNITY",
  key: string,
  local: any,
  remote: any,
  mismatches: ParityMismatch[],
  counts: any,
  localHashes: string[],
  firestoreHashes: string[]
) {
  if (local) counts.local++;
  if (remote) counts.firestore++;
  if (local || remote) counts.compared++;

  const lHash = local ? await computeParityHash(local) : undefined;
  const fHash = remote ? await computeParityHash(remote) : undefined;

  if (lHash) localHashes.push(lHash);
  if (fHash) firestoreHashes.push(fHash);

  if (!local && remote) {
    mismatches.push({ artifactType: type, scope, key, firestoreHash: fHash, reason: "MISSING_LOCAL" });
  } else if (local && !remote) {
    mismatches.push({ artifactType: type, scope, key, localHash: lHash, reason: "MISSING_FIRESTORE" });
  } else if (local && remote) {
    if (lHash !== fHash) {
      const struct = areStructurallyEqual(local, remote);
      mismatches.push({
        artifactType: type,
        scope,
        key,
        localHash: lHash,
        firestoreHash: fHash,
        reason: struct ? "HASH_MISMATCH" : "STRUCTURE_MISMATCH",
      });
    }
  }
}

function safeReadLocal(key: string): any | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
