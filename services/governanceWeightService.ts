
/**
 * ⚖️ GOVERNANCE WEIGHT ENGINE v1
 * ================================
 * Purpose: Turn Reputation into non-monetary authority.
 * 
 * CONTRACT COMPLIANCE:
 * 1. QUIET: No numeric weights in UI.
 * 2. CAPPED: Role-based limits prevent capture.
 * 3. REVERSIBLE: Decay factor for inactive users.
 * 4. LOCKED: Parameters frozen after S0 Calibration.
 */

import { reputationService, ReputationTierId } from "./reputationService";
import { UserRole } from "./reputationMappingService";
import { GovernanceProfile } from "../types/governanceTypes";
import { dataService } from "./dataService";
import { CALIBRATION_v1_1 } from "./seasonalSimulation/calibration";
import { seasonGatekeeper } from "./seasonalGovernance/seasonGatekeeper";

const TIER_GOV_WEIGHTS: Record<ReputationTierId, number> = {
  'T0_OBSERVER': 0,
  'T1_PARTICIPANT': 1,
  'T2_BUILDER': 3,
  'T3_STEWARD': 6,
  'T4_ANCHOR': 10
};

const ROLE_COEFFICIENTS: Record<UserRole, number> = {
  'MEMBER': 1.0,
  'CREATOR': 1.3,
  'INFLUENCER': 0.7
};

const ROLE_TIER_CAPS: Record<UserRole, ReputationTierId> = {
  'MEMBER': 'T3_STEWARD',
  'CREATOR': 'T4_ANCHOR',
  'INFLUENCER': 'T2_BUILDER'
};

export const governanceWeightService = {
  
  getDecayWindow(): number {
    return CALIBRATION_v1_1.govDecayDays * 24 * 60 * 60 * 1000;
  },

  getWhaleCap(): number {
    return CALIBRATION_v1_1.whaleClampPercent;
  },

  /**
   * Compute the governance profile for a user in a specific community.
   * Fail-open: returns weight 0 if signals are missing.
   * Honors STEWARD_LIMIT from moral gate constraints.
   */
  async computeProfile(communityId: string, userId: string): Promise<GovernanceProfile> {
    const now = Date.now();
    
    try {
      // Season Gate Check for Season 1 (Simulation context)
      // Note: In v1 simulation, we use "S1" constant.
      let stewardLimit: number | null = null;
      try {
        const result = await seasonGatekeeper.assertSeasonAllowed({ seasonId: "S1" });
        stewardLimit = result.constraints?.overrides.governance?.maxStewards || null;
      } catch {
        // Fallback for non-gate environments
      }

      const user = dataService.getCurrentUser(); 
      if (!user || user.id !== userId) throw new Error("Context mismatch");

      const role: UserRole = user.isInfluencer ? 'INFLUENCER' : 'MEMBER'; 
      const score = reputationService.getUserTotalScore(userId);
      const { tier } = reputationService.getUserTier(score);
      
      // 1. Resolve Tier & Role Cap
      const capId = ROLE_TIER_CAPS[role];
      const tierIndex = this.getTierRank(tier.id);
      const capIndex = this.getTierRank(capId);
      
      let effectiveTierId = tierIndex > capIndex ? capId : tier.id;

      // --- CONSTRAINT: STEWARD_LIMIT ---
      // If a steward limit is enforced, we clamp tier to T2 (Builder) if user is T3+
      if (stewardLimit !== null && this.getTierRank(effectiveTierId) >= 3) {
          // This is a simple implementation of a steward limit: 
          // degrade authority to Builder for everyone if limit is restrictive.
          // A real implementation would check community steward counts.
          effectiveTierId = 'T2_BUILDER';
      }

      const baseWeight = TIER_GOV_WEIGHTS[effectiveTierId];

      // 2. Decay Factor (Freshness)
      const signals = await this.getCommunitySignals(communityId, userId);
      const lastActive = signals.length > 0 ? signals[0].timestamp : 0;
      
      let decayFactor = 1.0;
      let decayState: "NOMINAL" | "DAMPENED" = "NOMINAL";
      
      if (now - lastActive > this.getDecayWindow() && tierIndex > 1) {
        decayFactor = 0.5; // Halve weight for inactive high-tier users
        decayState = "DAMPENED";
      }

      // 3. Raw Weighted Score
      const roleCoeff = ROLE_COEFFICIENTS[role];
      const weight = baseWeight * roleCoeff * decayFactor;

      return {
        communityId,
        userId,
        tierId: effectiveTierId,
        role,
        computedWeight: Number(weight.toFixed(2)),
        computedAt: now,
        decayState
      };

    } catch (e) {
      console.warn(`[GovWeight] Fail-open for user ${userId} in ${communityId}`);
      return {
        communityId,
        userId,
        tierId: 'T0_OBSERVER',
        role: 'MEMBER',
        computedWeight: 0,
        computedAt: now,
        decayState: "DAMPENED"
      };
    }
  },

  /**
   * Internal rank helper.
   */
  getTierRank(id: ReputationTierId): number {
    const ranks: ReputationTierId[] = ['T0_OBSERVER', 'T1_PARTICIPANT', 'T2_BUILDER', 'T3_STEWARD', 'T4_ANCHOR'];
    return ranks.indexOf(id);
  },

  async getCommunitySignals(communityId: string, userId: string) {
    const signals = JSON.parse(localStorage.getItem('wizup_reputation_signals_v1') || '[]');
    return signals.filter((s: any) => s.actorId === userId);
  },

  clampWhaleWeight(weight: number, communityTotalWeight: number): number {
    if (communityTotalWeight === 0) return weight;
    const maxAllowed = communityTotalWeight * this.getWhaleCap();
    return weight > maxAllowed ? maxAllowed : weight;
  }
};
