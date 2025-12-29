import { featureFlags } from "../../config/featureFlags";
import { recognitionDeriver } from "./recognitionDeriver";
import { recognitionStore } from "./recognitionStore";
import { recognitionNotifier } from "./recognitionNotifier";

export const zapsRecognitionService = {
  /**
   * Single entry point to run a recognition pass.
   * COMPLIANCE: Safe defaults, fail-open, no mutations if flags off.
   */
  async runRecognitionPass(args: {
    communityId: string;
    nowMs?: number;
  }): Promise<{ derived: number; notified: number; persisted: number }> {
    const results = { derived: 0, notified: 0, persisted: 0 };

    if (!featureFlags.ZAPS_RECOGNITION_V1) return results;

    try {
      const now = args.nowMs || Date.now();
      
      // 1. Derive
      const derivedEvents = await recognitionDeriver.deriveRecognitionEvents({
        communityId: args.communityId,
        nowMs: now,
        lookbackMs: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      results.derived = derivedEvents.length;

      // 2. Persist
      if (featureFlags.ZAPS_RECOGNITION_PERSIST) {
        recognitionStore.appendRecognitionEvents(args.communityId, derivedEvents);
        results.persisted = derivedEvents.length;
      }

      // 3. Notify
      if (featureFlags.ZAPS_RECOGNITION_NOTIFY) {
        await recognitionNotifier.emitRecognitionNotifications(derivedEvents);
        results.notified = derivedEvents.length; // Approximate for v1
      }

      return results;
    } catch (e) {
      console.error("[ZapsRecognition] Critical failure in pass", e);
      return results;
    }
  }
};
