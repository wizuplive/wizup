
import { CitizenshipArtifact, CitizenshipState, MobilityBonus } from "../../types/citizenshipTypes";
import { reputationService } from "../reputationService";

const CITIZENSHIP_KEY = "wizup_citizenship_ledger_v13";

/**
 * 🌍 CITIZENSHIP SERVICE
 * ======================
 * "Movement without domination."
 * 
 * Rules:
 * 1. Isolation: Local reputation starts at zero.
 * 2. Residency: Earned through time + contribution.
 * 3. Stewardship: Local endorsement only.
 */

export const citizenshipService = {

  async resolveStatus(userId: string, communityId: string): Promise<CitizenshipState> {
    const artifact = this.getArtifact(userId, communityId);
    if (!artifact) return "VISITOR";

    // Residents require 7 days tenure OR > 100 local rep
    if (artifact.status === "VISITOR") {
      const tenureDays = (Date.now() - artifact.joinedAt) / (1000 * 60 * 60 * 24);
      if (tenureDays >= 7 || artifact.earnedLocalScore >= 100) {
        return "RESIDENT";
      }
    }

    return artifact.status;
  },

  getMobilityBonus(userId: string): MobilityBonus {
    const all = this.getAllArtifacts(userId);
    const activeCount = all.filter(a => a.earnedLocalScore > 50).length;
    
    // Check for dominance (Is 80% of rep in one place?)
    const totalRep = all.reduce((sum, a) => sum + a.earnedLocalScore, 0);
    const topSpace = Math.max(...all.map(a => a.earnedLocalScore));
    const isDominant = totalRep > 0 && (topSpace / totalRep) > 0.8;

    // Small, capped multiplier for bridge builders
    const multiplier = (!isDominant && activeCount >= 3) ? 1.05 : 1.00;

    return {
      activeCommunitiesCount: activeCount,
      bridgeMultiplier: multiplier,
      isBridgeBuilder: multiplier > 1,
      reasoning: multiplier > 1 ? "Cross-community bridging detected" : "Standard residency"
    };
  },

  getArtifact(userId: string, communityId: string): CitizenshipArtifact | null {
    const all = this.getLedger();
    return all.find(a => a.userId === userId && a.communityId === communityId) || null;
  },

  getAllArtifacts(userId: string): CitizenshipArtifact[] {
    return this.getLedger().filter(a => a.userId === userId);
  },

  registerEntry(userId: string, communityId: string, isHome: boolean = false) {
    const ledger = this.getLedger();
    if (ledger.some(a => a.userId === userId && a.communityId === communityId)) return;

    const entry: CitizenshipArtifact = {
      userId,
      communityId,
      status: "VISITOR",
      joinedAt: Date.now(),
      isHomeCommunity: isHome,
      lastInteractionAt: Date.now(),
      earnedLocalScore: 0,
      tenureSignals: 0
    };

    ledger.push(entry);
    this.saveLedger(ledger);
  },

  updateLocalScore(userId: string, communityId: string, score: number) {
    const ledger = this.getLedger();
    const idx = ledger.findIndex(a => a.userId === userId && a.communityId === communityId);
    if (idx >= 0) {
      ledger[idx].earnedLocalScore = score;
      ledger[idx].lastInteractionAt = Date.now();
      this.saveLedger(ledger);
    }
  },

  getLedger(): CitizenshipArtifact[] {
    try {
      return JSON.parse(localStorage.getItem(CITIZENSHIP_KEY) || "[]");
    } catch { return []; }
  },

  saveLedger(ledger: CitizenshipArtifact[]) {
    localStorage.setItem(CITIZENSHIP_KEY, JSON.stringify(ledger));
  }
};
