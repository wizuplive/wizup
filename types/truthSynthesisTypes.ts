
/**
 * 🏛️ SEASON 7 — TRUTH SYNTHESIS & ADOPTION
 * ========================================
 * Data types for extracting experimental truth and recording human authority.
 */

export type SynthesisConfidence = 
  | "CLEARLY STABLE" 
  | "CONDITIONALLY STABLE" 
  | "AMBIGUOUS" 
  | "UNSTABLE";

export type AdoptionVerdict = "ADOPT" | "HOLD" | "REJECT";

export interface TruthSynthesisReport {
  id: string;
  experimentId: string;
  generatedAt: number;
  cohortSummary: string;
  deltasObserved: {
    parameter: string;
    intendedDelta: number;
    actualVarianceObserved: number;
  }[];
  stabilityAssessment: string; // Dimensions from Spec 4.1
  fairnessAssessment: string;  // Dimensions from Spec 4.2
  governanceImpact: string;    // Dimensions from Spec 4.3
  humanComfortSignals: string; // Dimensions from Spec 4.4
  unintendedEffects: string[];
  confidenceLevel: SynthesisConfidence;
  uncertaintyNotes: string;
  reproductionRisk: string;
  agentObservations: string[];
  protocolVersion: string;
}

export interface CouncilAdoptionRecord {
  id: string;
  reportId: string;
  experimentId: string;
  verdict: AdoptionVerdict;
  justification: string;
  moralTradeoffs: string;
  uncertaintyAcknowledgment: string;
  councilSignatories: string[]; // User IDs
  quorumMet: boolean;
  sealedAt: number;
  metadata: {
    sourceHash: string; // Hash of the TruthSynthesisReport
  };
}
