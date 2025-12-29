/**
 * 🏺 COMMUNITY TREASURY v1 — SIMULATION TYPES
 * ===========================================
 * Principle: Units represent "Potential Recognition Energy", not ZAPS.
 */

export interface TreasuryUnits {
  joinToEarn: number;
  participation: number;
  moderation: number;
  governance: number;
}

export interface CommunityTreasuryLedger {
  communityId: string;
  seasonId: string;
  sources: TreasuryUnits;
  totalUnits: number;
  userContributionCount: number;
  constraints: {
    perUserCapApplied: boolean;
    whaleClampApplied: boolean;
    rateLimitApplied: boolean;
  };
  createdAt: number;
  sealedAt?: number; // Only present if resolved during Season Close
}
