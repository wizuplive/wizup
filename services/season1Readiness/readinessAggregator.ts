
import { ReadinessDecisionArtifact, ReadinessDecision, ReadinessFlags } from "./types";
import { SeasonAuditSummaryArtifact } from "../season1Verification/audit/types";
import { season1ArtifactService } from "../season1Activation/season1Artifact";
import { defaultGateSink } from "../seasonalGovernance/persistence/localStorageGateSink";
import { defaultConstraintSink } from "../seasonalGovernance/constraintCompiler/sinks/localStorageSink";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { readinessPersistence } from "./persistence";

/**
 * ⚖️ READINESS AGGREGATOR
 */

export async function aggregateReadiness(
  seasonId: string, 
  auditSummary: SeasonAuditSummaryArtifact,
  flags: ReadinessFlags
): Promise<ReadinessDecisionArtifact> {
  const reasons: string[] = [];
  
  // 1. Fetch Inputs
  const contract = season1ArtifactService.read("CONTRACT");
  const gate = await defaultGateSink.read(seasonId);
  const constraints = await defaultConstraintSink.read(seasonId);

  // 2. Validate Presence
  if (!contract) reasons.push("MISSING_ACTIVATION_CONTRACT");
  if (!gate) reasons.push("MISSING_MORAL_VERDICT");
  if (gate?.verdict === "CONDITIONAL" && !constraints) reasons.push("MISSING_CONSTRAINTS");
  
  // 3. Logic Validation
  if (gate?.verdict === "BLOCK") reasons.push("MORAL_BLOCK");
  if (auditSummary.verdict === "FAIL") reasons.push("AUDIT_FAIL");
  
  const hasViolation = auditSummary.items.some(item => item.result === "FAIL");
  if (hasViolation) reasons.push("VERIFICATION_VIOLATION_PRESENT");

  const decision: ReadinessDecision = reasons.length === 0 ? "PROCEED" : "ABORT";

  // 4. Decision Payload for Hashing
  const decisionPayload = {
    // Fix: Explicitly type schemaVersion to match ReadinessDecisionArtifact "v1" constraint
    schemaVersion: "v1" as const,
    seasonId,
    decision,
    reasons: [...reasons].sort(),
    inputs: {
      contractHash: contract?.activationHash || "NONE",
      moralVerdictHash: gate?.hashes?.conscienceHash || "NONE",
      constraintsHash: constraints?.hashes?.compiledHash || "NONE",
      auditSummaryHash: auditSummary.hashes.summaryHash
    }
  };

  const decisionHash = await sha256Hex(canonicalJson(decisionPayload));

  const artifact: ReadinessDecisionArtifact = {
    ...decisionPayload,
    decisionHash,
    createdAtMs: Date.now()
  };

  await readinessPersistence.writeReadinessDecision(artifact, flags);
  return artifact;
}
