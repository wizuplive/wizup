import { zapsSignalLogService } from "../../zapsSignals/zapsSignalLogService";
import { ZapsSignalEvent } from "../../zapsSignals/zapsSignals.types";

export const signalsSource = {
  /**
   * Reads signals from existing community-scoped logs without mutations.
   */
  async listSignals(communityId: string, sinceMs: number): Promise<ZapsSignalEvent[]> {
    try {
      const all = zapsSignalLogService.listByCommunity(communityId);
      return all.filter(s => s.ts >= sinceMs);
    } catch (e) {
      console.warn("[RecognitionSource] Failed to list signals", e);
      return [];
    }
  }
};
