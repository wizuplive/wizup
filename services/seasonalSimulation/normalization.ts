import { ZapsSignalEvent } from "../zapsSignals/zapsSignals.types";

/**
 * Normalization Layer
 * Prevents volume-based farming and ensures cross-community fairness.
 */

export const normalization = {
  /**
   * Community Size Normalization (Saturating Curve)
   * Uses log1p to ensure small communities have weight while limiting large ones.
   */
  getCommunityFactor(rawContributionMass: number): number {
    if (rawContributionMass <= 0) return 0;
    // log10 based saturation
    return Math.log10(rawContributionMass + 1);
  },

  /**
   * Signal Weighting & Diminishing Returns
   * Applies base weights and decays repeat actions in a season.
   */
  getSignalUnit(event: ZapsSignalEvent, userHistory: ZapsSignalEvent[]): number {
    const baseWeights = {
      UPVOTE: 1.0,
      COMMENT: 2.5,
      MODERATION_ACTION: 5.0,
      GOVERNANCE_VOTE: 3.0,
      GOVERNANCE_PROPOSAL: 10.0,
      DOWNVOTE: 0.1, // Minimal signal
    };

    const base = baseWeights[event.type] || 0;
    
    // Diminishing returns for same-type activity
    const sameTypeCount = userHistory.filter(h => h.type === event.type).length;
    // Decay: 1.0 for first 10, then diminishing
    const multiplier = sameTypeCount < 10 ? 1.0 : Math.max(0.1, 1 / Math.log2(sameTypeCount - 8));

    return base * multiplier;
  }
};
