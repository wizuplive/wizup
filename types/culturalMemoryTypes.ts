
/**
 * 🏺 SEASON 14 — CULTURAL MEMORY & CONTINUITY
 * ===========================================
 * Data types for communities that outlive their founders.
 */

export type MemoryLayer = 'NORMATIVE' | 'NARRATIVE' | 'RITUAL' | 'GUARDIAN';

export interface CultureSnapshot {
  id: string;
  communityId: string;
  seasonId: string;
  normativeProfile: {
    toleratedBehaviors: string[];
    rejectedBehaviors: string[];
    moderationPosture: string; // Qualitative summary
  };
  governanceTendencies: string[];
  reputationShape: "PYRAMID" | "DIAMOND" | "FLAT";
  timestamp: number;
  hash: string;
}

export interface CanonMoment {
  id: string;
  communityId: string;
  title: string;
  description: string;
  outcome: string;
  justification: string;
  supersedesId?: string;
  timestamp: number;
  signatories: string[];
}

export interface StewardEntry {
  userId: string;
  role: "STEWARD" | "ANCHOR";
  enteredAt: number;
  exitedAt?: number;
  exitReason?: "DECAY" | "RESIGNATION" | "REMOVAL";
  predecessorId?: string;
}

export interface CulturalDriftSignal {
  communityId: string;
  driftType: "POSTURE_REVERSAL" | "GOV_CONTRADICTION" | "REP_CONCENTRATION" | "DISENGAGEMENT";
  intensity: "LOW" | "MEDIUM" | "HIGH";
  observation: string;
  timestamp: number;
}
