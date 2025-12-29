
import { LegibilityTier, LegibilityPayload } from "../../types/legibilityTypes";
import { reputationService } from "../reputationService";
import { dataService } from "../dataService";

/**
 * 📖 LEGIBILITY SERVICE
 * =====================
 * "Trust is made legible, not demanded."
 * 
 * Rules:
 * - Tier 0: Public/Members (Outcomes only)
 * - Tier 1: Active Contributors (Tier Meaning)
 * - Tier 2: Moderators (Escalation Rationale)
 * - Tier 3: Council (Full Lineage)
 */

export const legibilityService = {
  
  resolveTier(userId: string, communityId: string): LegibilityTier {
    const standing = reputationService.getScopedStanding(userId, communityId);
    const user = dataService.getCurrentUser();
    
    // 1. Council Check (Architect/Council Role)
    if (user?.id === 'system_architect' || userId === 'c_01') return 3;

    // 2. Moderator Check
    if (standing.tier.id === 'T4_ANCHOR' || standing.tier.id === 'T3_STEWARD') return 2;

    // 3. Active Contributor Check
    if (standing.tier.id === 'T2_BUILDER' || standing.tier.id === 'T1_PARTICIPANT') return 1;

    // 4. Default Member
    return 0;
  },

  getPayload(userId: string, communityId: string): LegibilityPayload {
    const tier = this.resolveTier(userId, communityId);
    
    const visibilityMap: Record<LegibilityTier, { visible: string[], hidden: string[] }> = {
      0: {
        visible: ["outcomes", "explanations", "norms"],
        hidden: ["scores", "thresholds", "weights", "canon_mechanics"]
      },
      1: {
        visible: ["outcomes", "explanations", "norms", "tier_meaning", "gov_impact", "season_status"],
        hidden: ["multipliers", "calibration_math", "experiment_internals"]
      },
      2: {
        visible: ["outcomes", "explanations", "norms", "tier_meaning", "gov_impact", "season_status", "escalation_rationale", "canon_history", "suspension_notices"],
        hidden: ["raw_formulas", "agent_telemetry"]
      },
      3: {
        visible: ["*"], // Full audit access
        hidden: []
      }
    };

    return {
      tier,
      ...visibilityMap[tier],
      tone: "LIBRARIAN"
    };
  }
};
