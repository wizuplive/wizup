
/**
 * 🏛️ SEASON 12 — FEDERALISM & COMMUNITY CHARTERS
 * ===============================================
 * Data types for shared platform law and local community sovereignty.
 */

export type CharterArchetype = 
  | "OPEN_DISCUSSION" 
  | "PROFESSIONAL_PRACTICE" 
  | "LEARNING_MENTORSHIP" 
  | "HIGH_SIGNAL_RESEARCH" 
  | "SOCIAL_CASUAL";

export interface CommunityCharter {
  communityId: string;
  archetype: CharterArchetype;
  localNorms: string[];     // Contextual rules, e.g., "No off-topic memes"
  posture: "RELAXED" | "BALANCED" | "STRICT";
  jurisdiction: {
    allowsCrossposts: boolean;
    requiresLocalStatus: boolean; // Must have rep in THIS community to act
  };
  version: string;
  updatedAt: number;
}

export interface FederalAppeal {
  id: string;
  communityId: string;
  caseId: string;
  reason: "CHARTER_MISALIGNMENT" | "SYSTEMIC_UNFAIRNESS" | "CANON_AMBIGUITY";
  memberRationale: string;
  status: "PENDING" | "REVIEWING" | "RESOLVED";
  verdict?: {
    outcome: "UPHELD" | "OVERTURNED";
    rationale: string;
    resolvedAt: number;
  };
}

export interface CharterDriftReport {
  communityId: string;
  detectedDrift: boolean;
  intensity: "LOW" | "MEDIUM" | "HIGH";
  observations: string[];
  lastCheckedAt: number;
}
