
import { ExperimentDomain } from "./experimentTypes";
import { CouncilDecisionRecord } from "./councilTypes";

/**
 * 📜 SEASON 3 PARAMETER ADOPTION — DATA TYPES
 * ===========================================
 * Governs the transition from observation (S2) to enforcement (S3).
 */

export type AdoptionDomain = 'reputation' | 'zaps' | 'governance';

export interface ParameterAdoptionRecord {
  id: string;
  season: 3;
  sourceExperimentId: string;
  parameterDomain: AdoptionDomain;
  before: any; // Snapshot of S2 parameters
  after: any;  // The new S3 canonical values
  justification: string;
  councilSignoff: CouncilDecisionRecord;
  sealedAt: number;
  metadata: {
    diffHash: string;
    architectSignature: string;
  };
}

export interface AdoptionCandidate {
  experimentId: string;
  domain: AdoptionDomain;
  proposedChanges: any;
  justification: string;
}
