
import { SunsetArtifact, SunsetType, SuccessionNotice } from "../../types/sunsetTypes";
import { culturalMemoryService } from "./culturalMemoryService";
import { lineageService } from "./lineageService";
import { reputationService } from "../reputationService";

const SUNSET_LEDGER_KEY = "wizup_sunset_ledger_v15";

/**
 * 🌅 SUNSET PROTOCOL SERVICE
 * ==========================
 * "Ending well is a form of leadership."
 * 
 * Rules:
 * 1. Intentional: No silent abandonments.
 * 2. Conservative: Reputation and ZAPS history are preserved.
 * 3. Human-Led: Agents cannot initiate sunsets.
 */

export const sunsetProtocolService = {

  async initiate(communityId: string, type: SunsetType, rationale: string, initiators: string[]): Promise<SunsetArtifact> {
    // 1. Quorum Check (Simulated)
    if (initiators.length < 2) {
      throw new Error("Sunset Denied: Requires quorum of at least 2 authorized stewards.");
    }

    // 2. Capture Final Cultural Soul
    const finalSnapshot = await culturalMemoryService.captureSeason(communityId, "FINAL_COMPLETION");

    const artifact: SunsetArtifact = {
      id: `sunset_${Date.now()}_${communityId}`,
      communityId,
      type,
      initiatedAt: Date.now(),
      initiatedBy: initiators,
      rationale,
      finalCultureSnapshotId: finalSnapshot.id,
      isReadonly: type !== 'SUCCESSION',
      isArchiveLocked: type === 'SUNSET' || type === 'MERGER'
    };

    this.saveArtifact(artifact);
    
    if (type === 'HIBERNATION' || type === 'SUNSET' || type === 'MERGER') {
      console.log(`%c[LIFECYCLE] Community ${communityId} entering ${type} state. Signals freezing.`, "color: #f59e0b; font-weight: bold;");
    }

    return artifact;
  },

  async finalizeSuccession(communityId: string, notice: SuccessionNotice) {
    const artifact = this.getArtifact(communityId);
    if (!artifact || artifact.type !== 'SUCCESSION') {
      throw new Error("No active succession found for this community.");
    }

    // Record ascension in the lineage (Season 14)
    lineageService.recordAscension(notice.nextStewardId, communityId, 'STEWARD', notice.previousStewardId);
    
    artifact.completedAt = Date.now();
    this.saveArtifact(artifact);
    
    console.log(`%c[SUCCESSION] Torch passed in ${communityId}: ${notice.previousStewardId} -> ${notice.nextStewardId}`, "color: #22c55e; font-weight: bold;");
  },

  isFrozen(communityId: string): boolean {
    const artifact = this.getArtifact(communityId);
    if (!artifact) return false;
    
    // Hibernation, Sunset, and Merged communities are frozen.
    // Succession communities remain active during the hand-off.
    return ['HIBERNATION', 'SUNSET', 'MERGER'].includes(artifact.type);
  },

  getArtifact(communityId: string): SunsetArtifact | undefined {
    return this.getLedger().find(a => a.communityId === communityId);
  },

  getLedger(): SunsetArtifact[] {
    try {
      return JSON.parse(localStorage.getItem(SUNSET_LEDGER_KEY) || "[]");
    } catch { return []; }
  },

  saveArtifact(artifact: SunsetArtifact) {
    const ledger = this.getLedger();
    const idx = ledger.findIndex(a => a.communityId === artifact.communityId);
    if (idx >= 0) ledger[idx] = artifact;
    else ledger.push(artifact);
    localStorage.setItem(SUNSET_LEDGER_KEY, JSON.stringify(ledger));
  }
};
