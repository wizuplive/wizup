/**
 * ⚖️ SEASONAL ALLOCATION ENGINE — CALIBRATION REGISTRY
 * v1.1 Tuning: Saturating curves and role-based ceilings.
 */

export const CALIBRATION_v1_1 = {
  version: "1.1-LOCKED",
  
  // Base Signal Weights
  weights: {
    UPVOTE: 1.0,
    COMMENT: 2.5,
    MODERATION_ACTION: 5.0,
    GOVERNANCE_VOTE: 3.0,
    GOVERNANCE_PROPOSAL: 10.0,
    DOWNVOTE: 0.1
  },

  // fix: Added missing repWeights property for reputationService and others
  repWeights: {
    UPVOTE: 1.0,
    COMMENT: 2.5,
    MODERATION_ACTION: 5.0,
    GOVERNANCE_VOTE: 3.0,
    GOVERNANCE_PROPOSAL: 10.0,
    DOWNVOTE: 0.1,
    PARTICIPATION: 5.0,
    CONTRIBUTION: 15.0,
    STEWARDSHIP: 60.0,
    INFLUENCE: 100.0
  },

  // fix: Added missing govDecayDays property for governanceWeightService
  govDecayDays: 14,
  // fix: Added missing whaleClampPercent property for governanceWeightService
  whaleClampPercent: 0.15,

  // Diminishing Returns Curve
  dampening: {
    windowMs: 3600000, // 1 hour window for burst detection
    threshold: 5,      // Actions after 5 in window are dampened
    decayFactor: 0.2   // Dampened actions carry 20% weight
  },

  // Per-Community Invariants
  constraints: {
    MAX_SHARE_PER_USER: 0.025, // 2.5% Cap
    WHALE_CEILING: 0.15,      // No user > 15% of community contribution
    MIN_SIGNALS_FOR_NORMALIZATION: 50
  },

  // Engine Scalars (Internal Only)
  scalars: {
    tier: {
      T0_OBSERVER: 0,
      T1_PARTICIPANT: 1,
      T2_BUILDER: 2,
      T3_STEWARD: 4,
      T4_ANCHOR: 7
    },
    role: {
      MEMBER: 1.0,
      CREATOR: 1.25,
      INFLUENCER: 0.6
    }
  },

  // Maturity Indicators
  maturityThreshold: 500 // Total capped units before "NOMINAL" health
};