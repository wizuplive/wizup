import { archivalPersistence } from "../../seasonEnd/persistence";
import { seasonWindowSource } from "../../season1TemporalLock/seasonWindowSource";
import { isSeason1Activated } from "../../season1Runtime/isSeason1Activated";
import { isSeason2Activated } from "../../season2Activation/isSeason2Activated";

export const activationSource = {
  async getStatus(seasonId: string) {
    const s1Active = await isSeason1Activated(seasonId);
    const s2Active = await isSeason2Activated(seasonId);
    
    const finalized = !!archivalPersistence.getReceipt(seasonId);
    const window = await seasonWindowSource.getWindow(seasonId);
    
    let withinWindow: boolean | undefined;
    if (window) {
      const now = Date.now();
      withinWindow = now >= window.startMs && now < window.endMs;
    }

    return {
      activated: s1Active || s2Active,
      finalized,
      withinWindow
    };
  }
};