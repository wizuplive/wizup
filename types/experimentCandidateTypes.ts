
/**
 * 🔬 SEASON 5 — AGENT-GUIDED EXPERIMENT CANDIDATES
 * ===============================================
 * Data types for the safe transition from machine observation to human-authorized testing.
 */

export type ExperimentLane = 'WEIGHT_TWEAK' | 'THRESHOLD_NUDGE' | 'DECAY_TUNING' | 'GOV_BOOST';
export type RiskClass = 'R0' | 'R1' | 'R2' | 'R3';
export type CandidateStatus = 'DRAFT' | 'REVIEW' | 'PROMOTED' | 'REJECTED' | 'ARCHIVED';

export interface ExperimentCandidate {
  id: string;
  createdAt: number;
  seasonObservedRange: string;
  domain: "reputation" | "multiplier" | "decay" | "governance";
  lane: ExperimentLane;
  title: string;
  hypothesis: string;
  proposedDelta: {
    parameter: string;
    deltaPercent: number;
    absoluteChange: [any, any]; // [from, to]
  };
  guardrails: string[];
  metrics: string[];
  successSignals: string[];
  abortSignals: string[];
  blastRadius: "single community" | "cohort" | "global shadow";
  confidence: "low" | "medium" | "high";
  uncertaintyNotes: string;
  riskClass: RiskClass;
  humanDecisionPrompt: string;
  trace: { 
    proposalIds: string[];
  };
  status: CandidateStatus;
  rejectionCount?: number; // Internal spam guard
}

export interface CandidateAuth {
  approvedBy: string;
  scopeCohort: string;
  parameterClamp: number;
  startWindow: number;
  endWindow: number;
  rollbackOwner: string;
}
