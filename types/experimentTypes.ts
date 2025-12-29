
import { SignalCategory } from "../services/reputationService";
import { ZapsSignalType } from "../services/zapsSignals/zapsSignals.types";

/**
 * 🔬 SEASON 2 EXPERIMENTATION ENGINE — DATA TYPES
 * ===============================================
 */

export type ExperimentDomain = 'REPUTATION' | 'ZAPS' | 'GOVERNANCE';
export type ExperimentStatus = 'REGISTERED' | 'ACTIVE' | 'ABORTED' | 'COMPLETED';

export interface OutcomeDeltas {
  reputationDelta?: number;
  zapsDelta?: number;
  governanceWeight?: number;
}

export interface ExperimentRegistryEntry {
  experimentId: string;
  season: 2; // Fixed for this phase
  domain: ExperimentDomain;
  signalType: ZapsSignalType | SignalCategory;
  hypothesis: string;
  parameterVariant: string;
  variantDescription: string;
  createdBy: 'SYSTEM' | 'FOUNDER';
  createdAt: number;
  constraints: {
    maxDeviationPct: number;
    roleCapsEnforced: true;
    communityScoped: true;
    writeOnly: true;
  };
  status: ExperimentStatus;
}

export interface ExperimentAuditEvent {
  id: string;
  experimentId: string;
  timestamp: number;
  communityId: string;
  signalObserved: ZapsSignalType | SignalCategory;
  canonicalOutcome: OutcomeDeltas;
  experimentalOutcome: OutcomeDeltas;
  deviationMagnitude: number; // Absolute %
  riskFlags: string[]; // e.g. "CAP_PRESSURE", "ROLE_DOMINANCE"
  invariantCheck: {
    roleCapHeld: boolean;
    whaleCapHeld: boolean;
    noBalanceMutation: boolean;
  };
}

export interface ExperimentSummaryReport {
  experimentId: string;
  observationWindow: {
    start: number;
    end: number;
  };
  totalSignalsObserved: number;
  deviationStats: {
    mean: number;
    median: number;
    max: number;
  };
  roleImpactSummary: {
    members: number;
    creators: number;
    influencers: number;
  };
  verdict: {
    status: 'ACCEPT' | 'REJECT' | 'DEFER';
    reasoning: string;
  };
  sealedAt: number;
}
