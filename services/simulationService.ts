
/**
 * 🧪 SEASON 0 SIMULATION ENGINE
 * =============================
 * Generates 30 days of synthetic community state in seconds.
 */

import { UserProfile, DEFAULT_USER, dataService } from "./dataService";
import { UserRole } from "./reputationMappingService";
import { reputationService, ReputationTierId } from "./reputationService";
import { voteService } from "./voteService";
import { proposalService } from "./proposalService";
import { seasonLoggerService } from "./seasonLoggerService";

export const simulationService = {
  
  /**
   * Run a full 30-day simulation cycle.
   */
  async runSeasonZero(communityId: string = 'S0_REHEARSAL') {
    console.group("🧪 [SIMULATION] Season 0 Starting...");
    seasonLoggerService.clearAll();

    // 1. Generate Synthetic Population (100 Users)
    const users = this.generateUsers(100);
    
    // 2. Create Rehearsal Proposal
    const proposal = await proposalService.createProposal({
      communityId,
      type: 'POLICY_INTENT_PRESET',
      title: 'Season 0 Constitution Rehearsal',
      description: 'Validation of the inevitability model.',
      createdBy: 'system_architect',
      parameters: { rehearsal: true }
    });

    // 3. Simulate 30 Days of Activity
    for (let day = 0; day < 30; day++) {
      const dayTs = Date.now() - ((30 - day) * 24 * 60 * 60 * 1000);
      
      for (const user of users) {
        // Presence (Everyone)
        if (Math.random() > 0.3) {
           // Fixed: Added communityId and removed extra properties not allowed by type
           reputationService.emit({
             actorId: user.id,
             communityId: communityId,
             signalType: 'PARTICIPATION'
           });
        }

        // Votes (Weighted by role)
        const voteChance = user.role === 'CREATOR' ? 0.8 : user.role === 'MEMBER' ? 0.4 : 0.2;
        if (Math.random() < voteChance) {
          // Internal call to vote logic
          await voteService.castVote(proposal, user.id, Math.random() > 0.2 ? 'YES' : 'NO');
          
          seasonLoggerService.logInfluence({
            userId: user.id,
            communityId,
            role: user.role,
            governanceWeight: user.role === 'CREATOR' ? 1.3 : 1.0, 
            action: 'VOTE',
            timestamp: dayTs
          });
        }

        // Contributions (Rare high-value events)
        if (Math.random() < 0.05) {
          // Fixed: Added communityId and removed extra properties not allowed by type
          reputationService.emit({
            actorId: user.id,
            communityId: communityId,
            signalType: 'CONTRIBUTION'
          });
        }
      }
    }

    console.log("🧪 Simulation Phase Complete. Logs stabilized.");
    console.groupEnd();
    
    return users;
  },

  generateUsers(count: number): UserProfile[] {
    const users: UserProfile[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let role: UserRole = 'MEMBER';
      if (rand > 0.95) role = 'INFLUENCER';
      else if (rand > 0.80) role = 'CREATOR';

      users.push({
        id: `sim_user_${i}`,
        name: `Synthetic ${role} ${i}`,
        handle: `@sim_${i}`,
        avatar: `https://picsum.photos/seed/sim_${i}/100/100`,
        isInfluencer: role === 'INFLUENCER',
        walletBalance: 0,
        usdBalance: 0,
        cryptoBalance: 0
      });
    }
    // Inject into dataService so distribution finds them
    // This is a simulation trick for local-only dry runs
    (dataService as any).syntheticUsers = users;
    return users;
  }
};
