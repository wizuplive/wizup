
import { CohortDefinition } from "../../types/executionProtocolTypes";
import { reputationService } from "../reputationService";

/**
 * 🛡️ COHORT ISOLATION SERVICE
 * ===========================
 * Ensures experiments never run globally.
 */

export const cohortService = {
  
  /**
   * Resolves whether a specific user/community pair belongs to a cohort.
   * This is a read-only snapshot check.
   */
  async isUserInCohort(userId: string, communityId: string, cohort: CohortDefinition): Promise<boolean> {
    // 1. Domain Check
    if (cohort.communityId !== communityId && cohort.scope !== "SHADOW") {
      return false;
    }

    // 2. Scope Resolution
    switch (cohort.scope) {
      case "SINGLE_COMMUNITY":
        return true; // Simple community match

      case "TOP_PERCENTILE":
        const standing = reputationService.getScopedStanding(userId, communityId);
        const threshold = cohort.parameters.percentileThreshold || 100;
        // Logic: if user is T2+, they are in top 30% (simulated)
        const isHighTier = standing.tier.id === 'T2_BUILDER' || standing.tier.id === 'T3_STEWARD' || standing.tier.id === 'T4_ANCHOR';
        return threshold === 30 ? isHighTier : true;

      case "ACTIVITY_BOUND":
        const lastActive = reputationService.getScopedStanding(userId, communityId).lastActiveAt;
        const windowMs = (cohort.parameters.activityWindowDays || 7) * 24 * 60 * 60 * 1000;
        return (Date.now() - lastActive) < windowMs;

      case "SHADOW":
        // Shadow cohorts are simulation-only, never include real users for live execution
        return false;

      default:
        return false;
    }
  },

  /**
   * Register a new cohort definition.
   */
  saveCohort(cohort: CohortDefinition) {
    const existing = this.listCohorts();
    existing.push(cohort);
    localStorage.setItem("wizup_cohorts_v6", JSON.stringify(existing));
  },

  listCohorts(): CohortDefinition[] {
    try {
      const raw = localStorage.getItem("wizup_cohorts_v6");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};
