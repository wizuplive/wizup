import { RecognitionReason } from "./types";

const COOLDOWNS: Record<string, number> = {
  "UPVOTE_RECEIVED": 90 * 1000,
  "COMMENT_CONTRIBUTION": 60 * 1000,
  "POST_CONTRIBUTION": 300 * 1000,
  "JOIN_COMMUNITY": 0, // No cooldown for first join
};

const BURST_LIMIT = 5; // Max 5 recognitions
const BURST_WINDOW = 5 * 60 * 1000; // per 5 minutes

// In-memory state for runtime gates (Reset on reload)
const state = {
  lastReasonAt: new Map<string, number>(), // key: userId_communityId_reason
  burstCount: new Map<string, number[]>(), // key: userId, val: timestamp[]
};

export const gates = {
  /**
   * Enforces per-user cooldown per reason per community.
   */
  isWithinCooldown(userId: string, communityId: string, reason: RecognitionReason, now: number): boolean {
    const key = `${userId}_${communityId}_${reason}`;
    const last = state.lastReasonAt.get(key) || 0;
    const cooldown = COOLDOWNS[reason] || 0;
    
    if (now - last < cooldown) return true;
    
    state.lastReasonAt.set(key, now);
    return false;
  },

  /**
   * Prevents automated burst farming.
   */
  isBursting(userId: string, now: number): boolean {
    const history = state.burstCount.get(userId) || [];
    const validHistory = history.filter(ts => now - ts < BURST_WINDOW);
    
    if (validHistory.length >= BURST_LIMIT) return true;
    
    validHistory.push(now);
    state.burstCount.set(userId, validHistory);
    return false;
  },

  /**
   * Minimal quality check for text content.
   */
  passesQualityGate(text: string): boolean {
    if (!text) return false;
    const trimmed = text.trim();
    
    // Heuristic: Minimal length and entropy
    if (trimmed.length < 10) return false;
    
    const uniqueChars = new Set(trimmed.toLowerCase().split("")).size;
    if (uniqueChars < 4) return false;

    return true;
  }
};
