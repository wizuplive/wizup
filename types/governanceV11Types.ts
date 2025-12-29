
/**
 * 🏛️ SEASON 11 — PUBLIC GOVERNANCE & CIVIC AGENCY
 * ===============================================
 * Data types for consultative, anti-populist participation.
 */

export type PreferenceGradient = 
  | "STRONGLY_PREFER" 
  | "NEUTRAL" 
  | "CONCERNED" 
  | "ALIGNS" 
  | "UNSURE" 
  | "CONFLICTS";

export interface ConsultationPrompt {
  id: string;
  communityId: string;
  title: string;
  context: string;
  options: {
    id: string;
    label: string;
    description: string;
  }[];
  windowOpen: number;
  windowClose: number;
  status: "DRAFT" | "ACTIVE" | "CONCLUDED";
}

export interface CommunitySentimentSignal {
  userId: string;
  promptId: string;
  preference: PreferenceGradient;
  optionId?: string;
  rationaleSnippet?: string; // Short qualitative input
  timestamp: number;
}

export interface TradeoffMap {
  promptId: string;
  consensusClusters: string[];
  unresolvedTensions: string[];
  observedTradeoffs: {
    gain: string;
    sacrifice: string;
    sentimentWeight: "LOW" | "MEDIUM" | "HIGH";
  }[];
  librarianSummary: string; // Non-persuasive machine summary
  confidence: "CLEAR" | "FRAGMENTED";
}

export interface DecisionRationaleArtifact {
  decisionId: string;
  inputsConsidered: string[];
  tradeoffsAcknowledged: string[];
  reasoning: string; // Calm, non-defensive explanation
  legacyImpact: string;
}
