import { AuthorityRole, TreasurySteward } from "./types";
import { dataService } from "../dataService";
import { reputationService } from "../reputationService";

/**
 * 🏛️ AUTHORIZATION SERVICE
 * ========================
 * Distributes authority by design.
 */

export const authorizationService = {
  
  /**
   * Resolves the authority role for a user in a specific community.
   */
  async resolveRole(userId: string, communityId: string): Promise<AuthorityRole> {
    const user = dataService.getCurrentUser();
    if (!user || user.id !== userId) return 'OBSERVER';

    // Mock logic for demo purposes:
    // T3 (Steward) and T4 (Anchor) can act as Stewards.
    // The community creator/owner is usually an Anchor.
    const standing = reputationService.getScopedStanding(userId, communityId);
    
    if (standing.tier.id === 'T4_ANCHOR') return 'OWNER';
    if (standing.tier.id === 'T3_STEWARD') return 'STEWARD';
    
    return 'OBSERVER';
  },

  /**
   * Checks if an action is authorized based on role and quorum.
   */
  async isAuthorizedToPropose(userId: string, communityId: string): Promise<boolean> {
    const role = await this.resolveRole(userId, communityId);
    return role === 'OWNER' || role === 'STEWARD';
  },

  /**
   * Quorum check for approvals.
   */
  hasQuorum(approverIds: string[], quorumNeeded: number): boolean {
    return approverIds.length >= quorumNeeded;
  }
};