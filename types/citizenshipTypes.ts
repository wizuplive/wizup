
/**
 * 🌍 SEASON 13 — CROSS-COMMUNITY MOBILITY & CITIZENSHIP
 * =====================================================
 * Data types for movement without domination.
 */

export type CitizenshipState = "VISITOR" | "RESIDENT" | "STEWARD" | "ANCHOR";

export interface CitizenshipArtifact {
  userId: string;
  communityId: string;
  status: CitizenshipState;
  joinedAt: number;
  isHomeCommunity: boolean;
  lastInteractionAt: number;
  earnedLocalScore: number;
  tenureSignals: number; // Platform-wide qualitative consistency
}

export interface MobilityBonus {
  activeCommunitiesCount: number;
  bridgeMultiplier: number; // 1.00 -> 1.05
  isBridgeBuilder: boolean;
  reasoning: string;
}

export interface NewcomerThrottle {
  userId: string;
  communityId: string;
  currentRateLimit: number; // Max signals per window
  expiresAt: number;
}
