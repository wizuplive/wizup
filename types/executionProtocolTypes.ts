
import { ExperimentDomain } from "./experimentTypes";
import { ExperimentLane } from "./experimentCandidateTypes";

/**
 * ⚙️ SEASON 6 — EXPERIMENT EXECUTION PROTOCOL
 * ===========================================
 * Data types for the active execution of approved changes.
 */

export type ExecutionStatus = "SCHEDULED" | "RUNNING" | "PAUSED" | "ROLLED_BACK" | "COMPLETED";

export interface FlaggedExecutionUnit {
  id: string;
  experimentId: string;
  domain: ExperimentDomain;
  cohortId: string;
  parametersApplied: {
    targetPath: string; // e.g., "repWeights.CONTRIBUTION"
    deltaValue: number;
    originalValue: number;
  };
  startAt: number;
  endAt: number;
  flagsEnabled: string[];
  clamps: {
    maxShiftPct: number;
    whaleCeiling: number;
  };
  rollbackKey: string;
  councilSigner: string;
  status: ExecutionStatus;
  metadata: {
    executedAt?: number;
    abortedAt?: number;
    reasonForAbort?: string;
  };
}

export interface CohortDefinition {
  id: string;
  communityId: string;
  scope: "SINGLE_COMMUNITY" | "TOP_PERCENTILE" | "ACTIVITY_BOUND" | "SHADOW";
  parameters: {
    percentileThreshold?: number;
    activityWindowDays?: number;
  };
}
