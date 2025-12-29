
import { culturalMemoryService } from "./culturalMemoryService";
import { CulturalDriftSignal } from "../../types/culturalMemoryTypes";

const DRIFT_SIGNALS_KEY = "wizup_cultural_drift_v14";

/**
 * 🕵️ CULTURAL DRIFT SERVICE
 * =========================
 * "Drift is surfaced, not prevented."
 */

export const culturalDriftService = {

  async detectDrift(communityId: string): Promise<CulturalDriftSignal | null> {
    const snapshots = culturalMemoryService.getSnapshots(communityId);
    if (snapshots.length < 2) return null;

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];

    // Simple heuristic: If the Posture summary changed significantly without a Canon Moment
    const moments = culturalMemoryService.getCanonMoments(communityId);
    const recentMoment = moments.some(m => m.timestamp > previous.timestamp);

    if (current.normativeProfile.moderationPosture !== previous.normativeProfile.moderationPosture && !recentMoment) {
      const signal: CulturalDriftSignal = {
        communityId,
        driftType: "POSTURE_REVERSAL",
        intensity: "MEDIUM",
        observation: `Moderation posture shifted from ${previous.normativeProfile.moderationPosture} to ${current.normativeProfile.moderationPosture} without a corresponding Canon Decision.`,
        timestamp: Date.now()
      };
      this.logSignal(signal);
      return signal;
    }

    return null;
  },

  logSignal(signal: CulturalDriftSignal) {
    const all = JSON.parse(localStorage.getItem(DRIFT_SIGNALS_KEY) || "[]");
    all.push(signal);
    localStorage.setItem(DRIFT_SIGNALS_KEY, JSON.stringify(all));
    console.warn(`%c[DRIFT] Cultural Drift Detected in ${signal.communityId}: ${signal.driftType}`, "color: #ef4444;");
  },

  getSignals(communityId: string): CulturalDriftSignal[] {
    const all = JSON.parse(localStorage.getItem(DRIFT_SIGNALS_KEY) || "[]");
    return all.filter((s: CulturalDriftSignal) => s.communityId === communityId);
  }
};
