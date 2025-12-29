
import { StewardEntry } from "../../types/culturalMemoryTypes";

const LINEAGE_KEY = "wizup_steward_lineage_v14";

/**
 * 📜 STEWARD LINEAGE SERVICE
 * ==========================
 * "Authority must be renewable. History must be legible."
 */

export const lineageService = {

  recordAscension(userId: string, communityId: string, role: "STEWARD" | "ANCHOR", predecessorId?: string) {
    const lineage = this.getLineage(communityId);
    const entry: StewardEntry = {
      userId,
      role,
      enteredAt: Date.now(),
      predecessorId
    };
    lineage.push(entry);
    this.saveLineage(communityId, lineage);
    console.log(`%c[LINEAGE] New ${role} seated: ${userId} in ${communityId}`, "color: #06b6d4;");
  },

  recordExit(userId: string, communityId: string, reason: StewardEntry['exitReason']) {
    const lineage = this.getLineage(communityId);
    const entry = lineage.find(e => e.userId === userId && !e.exitedAt);
    if (entry) {
      entry.exitedAt = Date.now();
      entry.exitReason = reason;
      this.saveLineage(communityId, lineage);
      console.log(`%c[LINEAGE] ${entry.role} exited: ${userId}. Reason: ${reason}`, "color: #f59e0b;");
    }
  },

  getLineage(communityId: string): StewardEntry[] {
    try {
      return JSON.parse(localStorage.getItem(`${LINEAGE_KEY}_${communityId}`) || "[]");
    } catch { return []; }
  },

  saveLineage(communityId: string, lineage: StewardEntry[]) {
    localStorage.setItem(`${LINEAGE_KEY}_${communityId}`, JSON.stringify(lineage));
  }
};
