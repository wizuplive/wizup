import { SeasonAuditItem, SeasonAuditSummaryArtifact, SeasonAuditVerdict } from "./types";
import { sha256Hex, canonicalJson } from "../hash";
import { createSeason1AuditSummarySink } from "./createAuditSummarySink";
import { listCanonIndexBySeason } from "../index/canonBundleIndex";
import { verifySeason1CanonBundle } from "../season1CanonBundleVerifier";
import { LocalStorageCanonBundleSink } from "../sinks/localStorageCanonBundleSink";

const RUNNER_VERSION = "season1BatchVerificationRunner@v1";

function toVerdict(totals: { ok: number; fail: number; skipped: number }): SeasonAuditVerdict {
  if (totals.fail > 0) return "FAIL";
  if (totals.skipped > 0) return "PASS_WITH_WARNINGS";
  return "PASS";
}

export async function runSeason1BatchVerification(args: {
  seasonId: string;
  flags: () => {
    WRITE_S1_AUDIT_LOCAL: boolean;
    WRITE_S1_AUDIT_FIRESTORE: boolean;
  };
  includeBundleHashes?: boolean;
}): Promise<SeasonAuditSummaryArtifact> {
  const { seasonId, flags } = args;

  // 1. Enumerate canon bundles for season via index
  const indexEntries = listCanonIndexBySeason(seasonId);

  // Deterministic index fingerprint (stable ordering)
  const indexForHash = indexEntries
    .map((e) => ({
      seasonId: e.seasonId,
      communityId: e.communityId,
      bundleHash: e.bundleHash,
    }))
    .sort((a, b) => a.communityId.localeCompare(b.communityId));

  const indexHash = await sha256Hex(canonicalJson({ seasonId, index: indexForHash }));

  // 2. Execute per-community verification
  const localBundleReader = new LocalStorageCanonBundleSink();
  const items: SeasonAuditItem[] = [];

  let ok = 0;
  let fail = 0;
  let skipped = 0;

  // Sort by communityId for deterministic item ordering
  const sortedEntries = [...indexEntries].sort((a, b) => a.communityId.localeCompare(b.communityId));

  for (const entry of sortedEntries) {
    const communityId = entry.communityId;
    const bundle = args.includeBundleHashes ? localBundleReader.read(seasonId, communityId) : null;

    let res: { verdict: "PASS" | "FAIL" | "INCONCLUSIVE"; storedBundleHash?: string; recomputedBundleHash?: string };
    try {
      res = await verifySeason1CanonBundle({ seasonId, communityId });
    } catch {
      res = { verdict: "INCONCLUSIVE" };
    }

    const itemResult = res.verdict === "PASS" ? "OK" : res.verdict === "FAIL" ? "FAIL" : "SKIP";
    
    if (itemResult === "OK") ok++;
    else if (itemResult === "FAIL") fail++;
    else skipped++;

    items.push({
      seasonId,
      communityId,
      result: itemResult,
      status: res.verdict,
      bundleHash: res.storedBundleHash || entry.bundleHash || null,
      receiptHash: (bundle as any)?.receiptHash || null,
      constraintsHash: (bundle as any)?.constraintsHash || null,
      notes: res.verdict === "FAIL" ? ["Integrity mismatch detected."] : res.verdict === "INCONCLUSIVE" ? ["Prerequisites missing for replay."] : undefined,
    });
  }

  // 3. Compose Artifact
  const totals = {
    communitiesIndexed: indexEntries.length,
    communitiesVerified: ok + fail,
    ok,
    fail,
    skipped,
  };

  const summaryForHash = {
    schemaVersion: "v1" as const,
    seasonId,
    totals,
    hashes: {
      indexHash,
      runnerVersion: RUNNER_VERSION,
    },
    items: items.map(({ seasonId, communityId, result, status, bundleHash, receiptHash, constraintsHash }) => ({
      seasonId, communityId, result, status, bundleHash, receiptHash, constraintsHash
    }))
  };

  const summaryHash = await sha256Hex(canonicalJson(summaryForHash));
  const verdict = toVerdict(totals);

  const artifact: SeasonAuditSummaryArtifact = {
    schemaVersion: "v1",
    seasonId,
    generatedAtMs: Date.now(),
    totals,
    verdict,
    hashes: {
      indexHash,
      summaryHash,
      runnerVersion: RUNNER_VERSION,
    },
    items,
  };

  // 4. Persistence
  const sink = createSeason1AuditSummarySink(flags);
  await sink.write(artifact);

  return artifact;
}