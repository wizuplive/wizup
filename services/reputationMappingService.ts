
/**
 * ⚖️ REPUTATION → ZAPS MULTIPLIER MAPPING v1.3 (SEASON 13)
 * ===========================================
 * Purpose: Enforce local authority boundaries.
 */

import { ReputationTierId } from "./reputationService";
import { citizenshipService } from "./seasonalSimulation/citizenshipService";

export type UserRole = 'MEMBER' | 'CREATOR' | 'INFLUENCER';
export type CommunityContext = 'HOME' | 'ADJACENT' | 'FOREIGN';

const TIER_WEIGHTS: Record<ReputationTierId, number> = {
  'T0_OBSERVER': 0.00,
  'T1_PARTICIPANT': 0.20,
  'T2_BUILDER': 1.00,
  'T3_STEWARD': 1.65,
  'T4_ANCHOR': 2.40
};

const ROLE_COEFFICIENTS: Record<UserRole, number> = {
  'MEMBER': 1.00,
  'CREATOR': 1.25,
  'INFLUENCER': 0.60
};

const TIER_ORDER: ReputationTierId[] = ['T0_OBSERVER', 'T1_PARTICIPANT', 'T2_BUILDER', 'T3_STEWARD', 'T4_ANCHOR'];

export const reputationMappingService = {
  /**
   * Enforces role caps and local authority resets.
   * Season 13: Creators/Influencers reset to MEMBER caps in foreign spaces.
   */
  getAllocationWeight(
    userId: string,
    communityId: string,
    tierId: ReputationTierId,
    role: UserRole = 'MEMBER'
  ): number {
    const artifact = citizenshipService.getArtifact(userId, communityId);
    const isForeign = !artifact || !artifact.isHomeCommunity;

    // Season 13 Rule 5.2: Role Caps Reset
    const effectiveRole: UserRole = isForeign ? 'MEMBER' : role;

    const ROLE_TIER_CAPS: Record<UserRole, ReputationTierId> = {
      'MEMBER': 'T3_STEWARD',
      'CREATOR': 'T4_ANCHOR',
      'INFLUENCER': 'T2_BUILDER'
    };

    const capId = ROLE_TIER_CAPS[effectiveRole];
    const tierIndex = TIER_ORDER.indexOf(tierId);
    const capIndex = TIER_ORDER.indexOf(capId);
    
    const effectiveTierId = tierIndex > capIndex ? capId : tierId;
    const baseWeight = TIER_WEIGHTS[effectiveTierId] ?? 0;
    const roleCoeff = ROLE_COEFFICIENTS[effectiveRole] ?? 1.00;

    return Number((baseWeight * roleCoeff).toFixed(4));
  },

  simulateDistribution(poolSize: number, weights: number[]): number[] {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight === 0) return weights.map(() => 0);
    return weights.map(w => (w / totalWeight) * poolSize);
  }
};
