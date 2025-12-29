
/**
 * 🤖 SEASON 4 — AGENTIC SUGGESTION LAYER
 * =======================================
 * Data types for machine insight without authority.
 */

export type ProposalDomain = 'REPUTATION_WEIGHTS' | 'ZAPS_CURVES' | 'DECAY_WINDOWS' | 'GOV_FRESHNESS';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ParameterProposal {
  id: string;
  seasonObserved: string;
  parameterDomain: ProposalDomain;
  currentStateSummary: string;
  proposedAdjustment: {
    parameter: string;
    fromValue: any;
    toValue: any;
    deltaPercent: number;
  };
  confidenceLevel: ConfidenceLevel;
  uncertaintyNotes: string;
  evidenceSignals: string[];
  humanReviewPrompt: string; // Non-coercive narrative
  generatedAt: number;
}

export interface AnalysisContext {
  seasonId: string;
  distributionSkew: number; // 0-1
  stagnationIndex: number; // 0-1
  participationGini: number; // 0-1
  activeExperiments: string[];
}
