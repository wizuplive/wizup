
import { ExperimentStatus } from "./experimentTypes";

/**
 * 🏛️ SEASON 2 REVIEW COUNCIL — DATA TYPES
 * ========================================
 */

export type CouncilRole = 
  | 'FOUNDER_ARCHITECT' 
  | 'COMMUNITY_STEWARD' 
  | 'CREATOR_REPRESENTATIVE' 
  | 'NEUTRAL_MODERATOR' 
  | 'EXTERNAL_OBSERVER';

export type CouncilVerdict = 'ACCEPT' | 'REJECT' | 'DEFER';

export interface CouncilMember {
  id: string;
  name: string;
  role: CouncilRole;
  canVote: boolean;
  joinedAt: number;
}

export interface CouncilVote {
  memberId: string;
  verdict: CouncilVerdict;
  rationale: string;
  timestamp: number;
}

export interface CouncilDecisionRecord {
  experimentId: string;
  verdict: CouncilVerdict;
  rationale: string;
  dissentingNotes?: string;
  signatories: {
    memberId: string;
    role: CouncilRole;
    signature: string; // Deterministic hash of decision + member key
  }[];
  criteriaCheck: {
    perceivedFairnessMet: boolean;
    effortOutcomeAligned: boolean;
    noInvariantsViolated: boolean;
    explainabilityPreserved: boolean;
  };
  sealedAt: number;
}

export interface CouncilSession {
  experimentId: string;
  status: 'OPEN' | 'SEALED';
  votes: CouncilVote[];
  startedAt: number;
}
