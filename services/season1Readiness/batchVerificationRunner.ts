import { listCanonIndexBySeason } from "../season1Verification/index/canonBundleIndex";
import { verifySeason1CanonBundle } from "../season1Verification/season1CanonBundleVerifier";
import { SeasonAuditSummaryArtifact, SeasonAuditItem, SeasonAuditVerdict } from "../season1Verification/audit/types";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { readinessPersistence } from "./persistence";
import { ReadinessFlags } from "./types";

/**
 * 🔍 BATCH VERIFICATION RUNNER
 */

export async function runBatchVerification(seasonId: string, flags: ReadinessFlags): Promise<SeasonAuditSummaryArtifact> {
  const index = listCanonIndexBySeason(seasonId);
  const sortedIndex = [...index].sort((a, b) => a.communityId.localeCompare(b.communityId));
  
  const items: SeasonAuditItem[] = [];
  let ok = 0;
  let fail = 0;
  let skipped = 0;

  for (const entry of sortedIndex) {
    const res = await verifySeason1CanonBundle({ seasonId, communityId: entry.communityId });
    
    const resultType: "OK" | "FAIL" | "SKIP" = 
      res.verdict === "PASS" ? "OK" : 
      res.verdict === "FAIL" ? "FAIL" : "SKIP";

    if (resultType === "OK") ok++;
    else if (resultType === "FAIL") fail++;
    else skipped++;

    items.push({
      seasonId,
      communityId: entry.communityId,
      result: resultType,
      status: res.verdict,
      bundleHash: entry.bundleHash,
      notes: res.verdict !== "PASS" ? ["Verification divergence or missing prerequisites."] : []
    });
  }

  const totals = {
    communitiesIndexed: index.length,
    communitiesVerified: ok + fail,
    ok,
    fail,
    skipped
  };

  const verdict: SeasonAuditVerdict = fail > 0 ? "FAIL" : skipped > 0 ? "PASS_WITH_WARNINGS" : "PASS";

  const summaryPayload = {
    schemaVersion: "v1",
    seasonId,
    totals,
    verdict,
    items
  };

  const summaryHash = await sha256Hex(canonicalJson(summaryPayload));
  const indexHash = await sha256Hex(canonicalJson(sortedIndex));

  const artifact: SeasonAuditSummaryArtifact = {
    ...summaryPayload as any,
    generatedAtMs: Date.now(),
    hashes: {
      indexHash,
      summaryHash,
      runnerVersion: "readinessBatchRunner@v1"
    }
  };

  await readinessPersistence.writeAuditSummary(artifact, flags);
  return artifact;
}
