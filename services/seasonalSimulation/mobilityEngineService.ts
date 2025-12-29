
import { NewcomerThrottle } from "../../types/citizenshipTypes";

const THROTTLE_KEY = "wizup_mobility_throttles_v13";

/**
 * 🚀 MOBILITY ENGINE
 * ==================
 * Prevents "Main Character Syndrome" in new spaces.
 */

export const mobilityEngineService = {

  shouldDampenSignal(userId: string, communityId: string): boolean {
    const throttle = this.getThrottle(userId, communityId);
    if (!throttle) return false;
    
    const now = Date.now();
    if (now > throttle.expiresAt) {
      this.clearThrottle(userId, communityId);
      return false;
    }

    return true; // Active throttle dampens signal weight
  },

  getSignalMultiplier(userId: string, communityId: string): number {
    if (this.shouldDampenSignal(userId, communityId)) {
      return 0.25; // 75% dampening for newcomers
    }
    return 1.0;
  },

  applyThrottle(userId: string, communityId: string) {
    const throttles = this.getAllThrottles();
    const entry: NewcomerThrottle = {
      userId,
      communityId,
      currentRateLimit: 5,
      expiresAt: Date.now() + (48 * 60 * 60 * 1000) // 48-hour cooling period
    };
    throttles.push(entry);
    localStorage.setItem(THROTTLE_KEY, JSON.stringify(throttles));
    console.log(`%c[MOBILITY] Influence dampener applied: ${userId} in ${communityId}`, "color: #f59e0b;");
  },

  getThrottle(userId: string, communityId: string): NewcomerThrottle | undefined {
    return this.getAllThrottles().find(t => t.userId === userId && t.communityId === communityId);
  },

  getAllThrottles(): NewcomerThrottle[] {
    try {
      return JSON.parse(localStorage.getItem(THROTTLE_KEY) || "[]");
    } catch { return []; }
  },

  clearThrottle(userId: string, communityId: string) {
    const remaining = this.getAllThrottles().filter(t => t.userId !== userId || t.communityId !== communityId);
    localStorage.setItem(THROTTLE_KEY, JSON.stringify(remaining));
  }
};
