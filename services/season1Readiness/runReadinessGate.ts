import { computeSeason1ReadinessDecision } from "./readinessGateAggregator";
import { createSeason1ReadinessSink } from "./createReadinessSink";
import { LocalStorageActivationContractSource } from "./sources/activationContractSource";
import { LocalStorageMoralVerdictSource } from "./sources/moralVerdictSource";
import { LocalStorageBatchAuditSummarySource } from "./sources/batchAuditSummarySource";

export async function runSeason1ReadinessGate(args: {
  seasonId: string;
  flags: () => {
    WRITE_S1_READINESS_LOCAL: boolean;
    WRITE_S1_READINESS_FIRESTORE: boolean;
  };
  conditionalAcceptanceHash?: string | null;
  requireConditionalAcceptance?: boolean;
}) {
  const artifact = await computeSeason1ReadinessDecision({
    seasonId: args.seasonId,
    activationContractSource: new LocalStorageActivationContractSource(),
    moralVerdictSource: new LocalStorageMoralVerdictSource(),
    auditSummarySource: new LocalStorageBatchAuditSummarySource(),
    conditionalAcceptanceHash: args.conditionalAcceptanceHash ?? null,
    requireConditionalAcceptance: args.requireConditionalAcceptance,
  });

  const sink = createSeason1ReadinessSink(args.flags);
  await sink.write(artifact);

  return artifact;
}