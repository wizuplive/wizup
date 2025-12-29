
import type {
  ReadinessDecisionArtifact,
  ReadinessReasonCode,
  ReadinessVerdictInputSnapshot,
  ReadinessDecision,
} from "./types";
import { canonicalJson, sha256Hex } from "./hash";
import type { ActivationContractSource } from "./sources/activationContractSource";
import type { MoralVerdictSource } from "./sources/moralVerdictSource";
import type { BatchAuditSummarySource } from "./sources/batchAuditSummarySource";

const RUNNER_VERSION = "readinessGateAggregator@v1";

export async function computeSeason1ReadinessDecision(args: {
  seasonId: string;
  activationContractSource: ActivationContractSource;
  moralVerdictSource: MoralVerdictSource;
  auditSummarySource: BatchAuditSummarySource;
  requireConditionalAcceptance?: boolean;
  conditionalAcceptanceHash?: string | null;
}): Promise<ReadinessDecisionArtifact> {
  const seasonId = args.seasonId;

  const contract = await args.activationContractSource.read(seasonId);
  const moral = await args.moralVerdictSource.read(seasonId);
  const audit = await args.auditSummarySource.read(seasonId);

  const reasons: ReadinessReasonCode[] = [];

  const snapshot: ReadinessVerdictInputSnapshot = {
    seasonId,
    activationContract: {
      present: Boolean(contract),
      sealed: Boolean(contract?.sealed),
      contractHash: contract?.activationHash ?? null,
      version: contract?.version ?? null,
    },
    moralGate: {
      present: Boolean(moral),
      verdict: moral?.verdict ?? null,
      moralHash: moral?.moralHash ?? null,
      conditionsHash: moral?.conditionsHash ?? null,
    },
    auditSummary: {
      present: Boolean(audit),
      verdict: audit?.verdict ?? null,
      summaryHash: audit?.hashes?.summaryHash ?? null,
      totals: audit?.totals
        ? {
            communitiesIndexed: audit.totals.communitiesIndexed,
            ok: audit.totals.ok,
            fail: audit.totals.fail,
            skipped: audit.totals.skipped,
          }
        : null,
    },
  };

  if (!contract) reasons.push("MISSING_ACTIVATION_CONTRACT");
  if (contract?.sealed) reasons.push("CONTRACT_ALREADY_SEALED");

  if (!moral) reasons.push("MISSING_MORAL_VERDICT");
  if (moral?.verdict === "BLOCK") reasons.push("MORAL_BLOCK");

  const requireCondAcceptance = args.requireConditionalAcceptance !== false;
  if (moral?.verdict === "CONDITIONAL" && requireCondAcceptance) {
    if (!args.conditionalAcceptanceHash) reasons.push("MORAL_CONDITIONAL_REQUIRES_ACCEPTANCE");
  }

  if (!audit) reasons.push("MISSING_AUDIT_SUMMARY");
  if (audit?.verdict === "FAIL") reasons.push("AUDIT_FAIL");
  if (audit?.verdict === "PASS_WITH_WARNINGS") reasons.push("AUDIT_WARNINGS_PRESENT");

  const missingCriticalHash =
    (contract && !contract.activationHash) ||
    (moral && !moral.moralHash) ||
    (audit && !audit.hashes?.summaryHash);

  if (missingCriticalHash) reasons.push("HASH_INPUT_INCOMPLETE");

  const decision: ReadinessDecision = reasons.length === 0 ? "PROCEED" : "ABORT";

  const inputHash = await sha256Hex(canonicalJson(snapshot));

  const decisionPayload = {
    snapshot,
    decision,
    reasons: reasons.slice().sort(),
    runnerVersion: RUNNER_VERSION,
    conditionalAcceptanceHash: args.conditionalAcceptanceHash ?? null,
  };

  const decisionHash = await sha256Hex(canonicalJson(decisionPayload));

  return {
    // Fix: Explicitly typed literal to satisfy interface constraint
    schemaVersion: "v1" as const,
    seasonId,
    generatedAtMs: Date.now(),
    decision,
    reasons: reasons.slice().sort(),
    hashes: {
      inputHash,
      decisionHash,
      runnerVersion: RUNNER_VERSION,
    },
    notes: decision === "PROCEED"
      ? ["Readiness gate passed: contract + morality + audit are aligned."]
      : ["Readiness gate ABORT: one or more non-negotiable checks failed."],
  };
}
