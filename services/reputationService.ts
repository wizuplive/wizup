
/**
 * 🧠 REPUTATION TIERS v1.3 — COMMUNITY SCOPED (LOCKED)
 * ===========================================
 * Status: Season 15 Enhanced (Lifecycle Aware)
 */

import { CALIBRATION_v1_1 } from "./seasonalSimulation/calibration";
import { experimentExecutionService } from "./seasonalSimulation/experimentExecutionService";
import { canonEnforcementService } from "./seasonalSimulation/canonEnforcementService";
import { citizenshipService } from "./seasonalSimulation/citizenshipService";
import { mobilityEngineService } from "./seasonalSimulation/mobilityEngineService";
import { sunsetProtocolService } from "./seasonalSimulation/sunsetProtocolService";

export type ReputationTierId = 'T0_OBSERVER' | 'T1_PARTICIPANT' | 'T2_BUILDER' | 'T3_STEWARD' | 'T4_ANCHOR';
export type SignalCategory = 'PARTICIPATION' | 'CONTRIBUTION' | 'STEWARDSHIP' | 'INFLUENCE';

export interface ReputationTierConfig {
  id: ReputationTierId;
  label: "Observer" | "Participant" | "Builder" | "Steward" | "Anchor";
  minScore: number;
  description: string;
  privileges: string[];
}

const STORAGE_KEY_LEDGER = 'wizup_rep_ledger_v1';

const TIER_THRESHOLDS: ReputationTierConfig[] = [
  { id: 'T0_OBSERVER', label: 'Observer', minScore: 0, description: 'Present but unproven', privileges: ['Browsing'] },
  { id: 'T1_PARTICIPANT', label: 'Participant', minScore: 100, description: 'Active contributor', privileges: ['Voting'] },
  { id: 'T2_BUILDER', label: 'Builder', minScore: 500, description: 'Value creator', privileges: ['Posting'] },
  { id: 'T3_STEWARD', label: 'Steward', minScore: 2500, description: 'Trusted leader', privileges: ['Steward tools'] },
  { id: 'T4_ANCHOR', label: 'Anchor', minScore: 7500, description: 'Ecosystem pillar', privileges: ['Governance'] },
];

export const reputationService = {
  /**
   * Weights now resolved through Season 13 Citizenship and Mobility filters.
   */
  async getEffectiveWeightForSignal(userId: string, communityId: string, signalType: SignalCategory): Promise<number> {
    const key = `repWeights.${signalType}`;
    
    // Season 15 Lifecycle Gate
    if (sunsetProtocolService.isFrozen(communityId)) {
      return 0; // Reputation is frozen in archived spaces
    }

    // 1. Season 13 Citizenship Gate
    const status = await citizenshipService.resolveStatus(userId, communityId);
    if (status === "VISITOR" && signalType === 'CONTRIBUTION') {
      return 0; // Visitors cannot earn contribution rep (Read-Only culture)
    }

    // 2. Season 13 Mobility & Dampening
    const mobilityMultiplier = mobilityEngineService.getSignalMultiplier(userId, communityId);
    const bridgeBonus = citizenshipService.getMobilityBonus(userId).bridgeMultiplier;

    // 3. Season 9 Enforcement Choke Point
    const canonValue = canonEnforcementService.resolveCanon(key, communityId, signalType);
    
    let baseWeight = 0;
    if (canonValue !== undefined && canonValue !== 0) {
      baseWeight = canonValue;
    } else {
      const defaultBase = CALIBRATION_v1_1.repWeights[signalType] || 0;
      baseWeight = await experimentExecutionService.getEffectiveParameter(
        userId, 
        communityId, 
        key, 
        defaultBase
      );
    }

    return baseWeight * mobilityMultiplier * bridgeBonus;
  },

  async emit(signal: { actorId: string; communityId: string; signalType: SignalCategory }) {
    // Season 15 Lifecycle Gate
    if (sunsetProtocolService.isFrozen(signal.communityId)) return;

    const timestamp = Date.now();
    const ledger = this.getLedger();
    const key = `${signal.actorId}_${signal.communityId}`;
    const current = ledger[key] || { score: 0, lastActiveAt: 0 };

    // Initialize citizenship if new
    citizenshipService.registerEntry(signal.actorId, signal.communityId);

    // Dynamic weight resolution
    const weight = await this.getEffectiveWeightForSignal(signal.actorId, signal.communityId, signal.signalType);
    const newScore = current.score + weight;

    ledger[key] = {
      ...current,
      score: newScore,
      lastActiveAt: timestamp
    };

    localStorage.setItem(STORAGE_KEY_LEDGER, JSON.stringify(ledger));

    // Update local citizenship tracking
    citizenshipService.updateLocalScore(signal.actorId, signal.communityId, newScore);
  },

  getLedger(): Record<string, { score: number; lastActiveAt: number }> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_LEDGER) || '{}');
    } catch {
      return {};
    }
  },

  getActiveDayCount(): number {
    return 10; 
  },

  getUserTotalScore(userId: string): number {
    const ledger = this.getLedger();
    return Object.keys(ledger)
      .filter(k => k.startsWith(`${userId}_`))
      .reduce((sum, k) => sum + ledger[k].score, 0);
  },

  trackPresence(userId: string, communityId: string) {
    this.emit({
      actorId: userId,
      communityId,
      signalType: 'PARTICIPATION'
    });
  },

  getUserTier(score: number = 0) {
    let activeIndex = 0;
    for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
      if (score >= TIER_THRESHOLDS[i].minScore) {
        activeIndex = i;
        break;
      }
    }

    const tier = TIER_THRESHOLDS[activeIndex];
    let progress = 100;
    if (activeIndex < TIER_THRESHOLDS.length - 1) {
      const nextTier = TIER_THRESHOLDS[activeIndex + 1];
      const range = nextTier.minScore - tier.minScore;
      const current = score - tier.minScore;
      progress = Math.min(99, Math.floor((current / range) * 100));
    }

    return { tier, progress };
  },

  getScopedStanding(userId: string, communityId: string) {
    const ledger = this.getLedger();
    const data = ledger[`${userId}_${communityId}`] || { score: 0, lastActiveAt: Date.now() };
    const { tier, progress } = this.getUserTier(data.score);

    const daysSinceActive = (Date.now() - data.lastActiveAt) / (1000 * 60 * 60 * 24);
    const decayState = daysSinceActive > 30 ? 'dormant' : daysSinceActive > 14 ? 'fading' : 'fresh';
    
    let standingLabel = "New";
    if (tier.id === 'T1_PARTICIPANT') standingLabel = "Learning";
    if (tier.id === 'T2_BUILDER') standingLabel = "Active";
    if (tier.id === 'T3_STEWARD') standingLabel = "Active • Trusted";
    if (tier.id === 'T4_ANCHOR') standingLabel = "Foundation";

    return { 
      tier, 
      progress, 
      score: data.score, 
      decayState, 
      standingLabel,
      lastActiveAt: data.lastActiveAt 
    };
  },

  getGlobalProfile(userId: string) {
    const ledger = this.getLedger();
    const userKeys = Object.keys(ledger).filter(k => k.startsWith(`${userId}_`));
    
    const spaces = userKeys.map(k => {
      const communityId = k.split('_')[1];
      const standing = this.getScopedStanding(userId, communityId);
      return { communityId, ...standing };
    }).sort((a, b) => b.score - a.score);

    const topTier = spaces.length > 0 ? spaces[0].tier : TIER_THRESHOLDS[0];

    return {
      topTier,
      spaces
    };
  }
};
