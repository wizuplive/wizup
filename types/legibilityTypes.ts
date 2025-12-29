
/**
 * 📖 SEASON 10 — CANON LEGIBILITY & PUBLIC TRUST
 * ==============================================
 * Data types for controlled transparency and trust-building.
 */

export type LegibilityTier = 0 | 1 | 2 | 3;

export interface CommunityTrustState {
  communityId: string;
  currentSeasonLabel: string; // e.g. "Season 1: Active"
  governanceStatus: "Healthy" | "Paused" | "Reviewing";
  lastCanonUpdate: {
    date: number;
    intentSummary: string; // Plain language, no numbers
  };
  safetyStatus?: string; // "Normal operation" or "Safety pause active"
}

export interface SeasonCloseSummary {
  seasonId: string;
  communityId: string;
  observations: string[]; // Passive tone
  stableParameters: string[];
  plannedRefinements: string[];
  unchangedProtocol: string;
  publishedAt: number;
}

export interface LegibilityPayload {
  tier: LegibilityTier;
  visibleFields: string[];
  hiddenFields: string[];
  tone: "LIBRARIAN";
}
