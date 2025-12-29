
import { Season0LegitimacyVerdict, VerdictState } from "./types";
import { Season0AuditArtifact } from "../audit/types";
import { Season0CounterfactualArtifact } from "../counterfactuals/types";
import { sha256Hex, canonicalJson } from "../hash";

/**
 * ⚖️ MORAL VERDICT RESOLVER
 * =========================
 * The "Conscience" of the migration.
 */

export const moralVerdictResolver = {
  async resolve(
    audit: Season0AuditArtifact,
    counterfactual: Season0CounterfactualArtifact
  ): Promise<Season0LegitimacyVerdict> {
    const concerns: string[] = [];
    const findings: string[] = [];
    let state: VerdictState = "ALLOW";

    // 1. Rule: Any HARD_FAIL -> BLOCK
    const hardFails = audit.findings.filter(f => f.verdict === "HARD_FAIL");
    if (hardFails.length > 0) {
      state = "BLOCK";
      hardFails.forEach(f => concerns.push(`Hard failure in ${f.dimension}: ${f.narrative}`));
    }

    // 2. Rule: Multiple SOFT_RISKS -> CONDITIONAL
    const softRisks = audit.findings.filter(f => f.verdict === "SOFT_RISK");
    if (state !== "BLOCK" && softRisks.length >= 2) {
      state = "CONDITIONAL";
      softRisks.forEach(f => concerns.push(`Soft risk in ${f.dimension}: ${f.narrative}`));
    }

    // 3. Counterfactual Safety Check
    counterfactual.results.forEach(res => {
      findings.push(`${res.scenarioId}: ${res.findings}`);
      if (res.protectionEfficacy === "CRITICAL" && state === "ALLOW") {
        // High reliance on a single protection indicates fragility
        state = "CONDITIONAL";
        concerns.push(`System integrity is critically dependent on ${res.scenarioId} protection.`);
      }
    });

    const verdictInput = {
      seasonId: audit.seasonId,
      communityId: audit.communityId,
      verdict: state,
      concerns
    };

    const verdictHash = await sha256Hex(canonicalJson(verdictInput));

    return {
      seasonId: audit.seasonId,
      communityId: audit.communityId,
      verdict: state,
      primaryConcerns: concerns,
      counterfactualFindings: findings,
      confidence: audit.findings.length > 3 ? "HIGH" : "MEDIUM",
      hashes: {
        season0ArtifactHash: audit.artifactHash,
        auditConfigHash: counterfactual.results[0]?.deltaHash || "none",
        verdictHash
      },
      signedAt: Date.now()
    };
  }
};
