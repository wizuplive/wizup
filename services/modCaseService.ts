import { dataService } from "./dataService";
import type { ModCase, ModAction } from "../types/modTypes";
import { autopilotEligibilityService } from "./autopilotEligibilityService";
import { reasoningQualityService } from "./reasoningQualityService";
import { zapsSignalEmitter } from "./zapsSignals/zapsSignalEmitter";
import { seasonalAllocationSimulation } from "./seasonalSimulation/seasonalAllocationSimulation";

/* 
 * 🔒 PHASE 1 CONTRACT: MODCASE LIFECYCLE (ASSIST MODE)
 * ====================================================
 */

const casesKey = (communityId: string) => `modCases:${communityId}`;
const actionsKey = (communityId: string) => `modActions:${communityId}`;

export const modCaseService = {
  async listCases(communityId: string): Promise<ModCase[]> {
    const cases = await dataService.getModCases(communityId);
    dataService.verifyModCases(communityId, cases);
    return cases;
  },
  
  async upsertCase(communityId: string, c: ModCase) {
    const existing = await dataService.get(casesKey(communityId)) || [];
    const all = existing as ModCase[];
    
    const idx = all.findIndex(x => x.id === c.id);
    if (idx >= 0) all[idx] = c; else all.unshift(c);
    await dataService.set(casesKey(communityId), all);

    dataService.shadowWriteCase(communityId, c);

    if (c.status === 'RESOLVED' || c.status === 'DISMISSED') {
      this.triggerEligibilityCheck(communityId);
      reasoningQualityService.recordOutcome(communityId, c);
    }
  },
  
  async listActions(communityId: string): Promise<ModAction[]> {
    const actions = await dataService.getModActions(communityId);
    dataService.verifyModActions(communityId, actions);
    return actions;
  },
  
  async addAction(communityId: string, a: ModAction) {
    const existing = await dataService.get(actionsKey(communityId)) || [];
    const all = existing as ModAction[];
    
    all.unshift(a);
    await dataService.set(actionsKey(communityId), all);

    dataService.shadowWriteAction(communityId, a);

    // 7.4 Moderation Action Signal Emission
    zapsSignalEmitter.emit({
      type: 'MODERATION_ACTION',
      actorUserId: a.actor === 'CREATOR' ? (dataService.getCurrentUser()?.id || 'system') : 'system',
      communityId: communityId,
      source: 'MODERATION',
      metadata: { moderationCaseId: a.caseId }
    });

    seasonalAllocationSimulation.recomputeCommunity(communityId);

    this.triggerEligibilityCheck(communityId);
  },

  async triggerEligibilityCheck(communityId: string) {
    try {
      setTimeout(() => {
        autopilotEligibilityService.evaluate(communityId).catch(err => {
          console.warn("[ModCaseService] Eligibility check failed silently:", err);
        });
      }, 100);
    } catch (e) {}
  }
};
