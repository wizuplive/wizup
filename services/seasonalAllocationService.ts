/**
 * 🏛️ SEASONAL ALLOCATION ENGINE v1
 * ==================================
 * Recognition system mirroring Hyperliquid's Points model.
 */

import { dataService, UserProfile } from "./dataService";
import { reputationService } from "./reputationService";
import { reputationMappingService, UserRole } from "./reputationMappingService";
import { governanceTrustService } from "./governanceTrustService";
import { seasonLoggerService } from "./seasonLoggerService";
import { PoolType } from "../types/seasonalTypes";
import { flags } from "./zapsSignals/featureFlags";
import { zapsTreasuryService } from "./zapsTreasury/zapsTreasuryService";

export type SeasonStatus = 'PLANNED' | 'LOCKED' | 'DISTRIBUTED';

export interface Season {
  id: string;
  name: string;
  startAt: number;
  endAt: number;
  totalPool: number; 
  status: SeasonStatus;
  allocationHash?: string;
  distributedAt?: number;
}

const STORAGE_KEY_SEASONS = 'wizup_seasons_v1';
// Protocol 1: Duration set to 90 days
const SEASON_DURATION_MS = 90 * 24 * 60 * 60 * 1000;
const TOTAL_SUPPLY = 10000000000; 
const SEASONAL_EMISSION_RATE = 0.005;

export const seasonalAllocationService = {
  
  createSeason(name: string): Season {
    const poolSize = TOTAL_SUPPLY * SEASONAL_EMISSION_RATE;
    const now = Date.now();
    const season: Season = {
      id: `season_${now}`,
      name,
      startAt: now,
      endAt: now + SEASON_DURATION_MS,
      totalPool: poolSize,
      status: 'PLANNED'
    };

    const existing: Season[] = JSON.parse(localStorage.getItem(STORAGE_KEY_SEASONS) || '[]');
    existing.push(season);
    localStorage.setItem(STORAGE_KEY_SEASONS, JSON.stringify(existing));
    
    return season;
  },

  async executeDistribution(seasonId: string) {
    // Protocol 5: Distribution Kill-Switch
    if (!flags.ZAPS_DISTRIBUTION_ENABLED) {
      console.warn("🏛️ [SEASONAL] Distribution blocked by protocol: ZAPS_DISTRIBUTION_ENABLED is false.");
      return;
    }

    const season = this.getSeason(seasonId);
    if (!season || season.status !== 'PLANNED') return;

    console.group(`🏛️ [SEASONAL] Executing: ${season.name}`);
    
    const participants = await dataService.getAllUsers();
    const eligibleParticipants: { user: UserProfile; weight: number; role: UserRole; tierId: any }[] = [];

    for (const user of participants) {
      const activeDays = reputationService.getActiveDayCount();
      if (activeDays < 7 && !user.id.startsWith('sim_user')) continue; 

      const role: UserRole = user.isInfluencer ? 'INFLUENCER' : 'MEMBER'; 
      const score = reputationService.getUserTotalScore(user.id);
      const { tier } = reputationService.getUserTier(score);
      
      if (tier.id === 'T0_OBSERVER') continue;

      const baseWeight = reputationMappingService.getAllocationWeight(user.id, 'PLATFORM', tier.id, role);
      const trustBias = await governanceTrustService.computeUserTrustBias('ALL_CONTEXT', user.id);
      
      eligibleParticipants.push({
        user,
        weight: baseWeight * trustBias,
        role,
        tierId: tier.id
      });
    }

    if (eligibleParticipants.length === 0) {
      console.warn("No eligible participants for this season.");
      console.groupEnd();
      return;
    }

    const pools: Record<PoolType, number> = {
      MEMBER_CONTRIBUTION: season.totalPool * 0.45,
      CREATOR_STEWARDSHIP: season.totalPool * 0.30,
      INFLUENCER_IMPACT: season.totalPool * 0.15,
      PROTOCOL_RESERVE: season.totalPool * 0.10
    };

    this.distributeToPool(eligibleParticipants.filter(p => p.role === 'MEMBER'), pools.MEMBER_CONTRIBUTION, season.id, 'Contribution Reward');
    this.distributeToPool(eligibleParticipants.filter(p => p.role === 'CREATOR'), pools.CREATOR_STEWARDSHIP, season.id, 'Stewardship Reward');
    this.distributeToPool(eligibleParticipants.filter(p => p.role === 'INFLUENCER'), pools.INFLUENCER_IMPACT, season.id, 'Impact Reward');

    // --- TREASURY FUNDING (S8 PROTOCOL) ---
    // A portion of the protocol reserve is allocated back to community treasuries
    const communities = ['Design Systems Mastery', 'Web3 Builders Club', 'Minimalist Productivity'];
    const communityPool = pools.PROTOCOL_RESERVE / communities.length;
    for (const cid of communities) {
        await zapsTreasuryService.fundTreasury(
            cid, 
            Math.floor(communityPool), 
            'FUNDING_SEASONAL', 
            `Seasonal Allocation: ${season.name}`
        );
    }

    season.status = 'DISTRIBUTED';
    season.distributedAt = Date.now();
    season.allocationHash = crypto.randomUUID();
    this.updateSeason(season);

    console.log(`Success. Distributed ${eligibleParticipants.length} shares.`);
    console.groupEnd();
  },

  distributeToPool(participants: any[], poolSize: number, seasonId: string, desc: string) {
    if (participants.length === 0) return;

    const weights = participants.map(p => p.weight);
    const shares = reputationMappingService.simulateDistribution(poolSize, weights);

    participants.forEach((p, i) => {
      const amount = Math.floor(shares[i]);
      if (amount <= 0) return;

      // PROTOCOL 3.1: Silent Allocation Logging
      seasonLoggerService.logAllocation({
        userId: p.user.id,
        communityId: seasonId,
        role: p.role,
        reputationTier: p.tierId,
        reputationSignals: [desc, p.weight > 1 ? 'High Impact' : 'Stable Presence'],
        seasonalWeight: p.weight,
        zapsAllocated: amount,
        timestamp: Date.now()
      });

      // Update actual ledger (Silent shadow write)
      dataService.addZapsEntry({
        id: `seasonal_${seasonId}_${p.user.id}`,
        userId: p.user.id,
        type: 'SEASONAL_REWARD',
        amount: amount,
        referenceId: seasonId,
        description: `Seasonal Recognition: ${desc}`,
        createdAt: Date.now()
      });
    });
  },

  getSeason(id: string): Season | undefined {
    const existing: Season[] = JSON.parse(localStorage.getItem(STORAGE_KEY_SEASONS) || '[]');
    return existing.find(s => s.id === id);
  },

  updateSeason(season: Season) {
    const existing: Season[] = JSON.parse(localStorage.getItem(STORAGE_KEY_SEASONS) || '[]');
    const idx = existing.findIndex(s => s.id === season.id);
    if (idx >= 0) {
      existing[idx] = season;
      localStorage.setItem(STORAGE_KEY_SEASONS, JSON.stringify(existing));
    }
  }
};