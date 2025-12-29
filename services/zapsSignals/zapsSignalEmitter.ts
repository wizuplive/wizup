
import { ZapsSignalEvent } from "./types/zapsSignals.types";
import { zapsSignalLog } from "./logs/zapsSignalLog";
import { recognitionService } from "../recognition/recognitionService";
import { joinToEarnService } from "../zapsRecognition/joinToEarn/joinToEarnService";
import { recognitionLedger } from "../zapsLedger/recognitionLedger";
import { season1EnforcementGuards } from "../season1Activation/season1EnforcementGuards";

export const FEATURE_FLAGS = {
  ZAPS_SIGNALS_ENABLED: true 
};

// Global for toast orchestration in App.tsx
export type RecognitionToastCallback = (event: any) => void;
let toastCallback: RecognitionToastCallback | null = null;

export const registerRecognitionToast = (cb: RecognitionToastCallback) => {
  toastCallback = cb;
};

export const zapsSignalEmitter = {
  async emit(eventData: Omit<ZapsSignalEvent, 'id' | 'timestamp' | 'season'>): Promise<void> {
    if (!FEATURE_FLAGS.ZAPS_SIGNALS_ENABLED) return;

    try {
      // 🛡️ SEASON 1 GUARD
      // This is silent. If Season 1 is active, we check window and rules.
      // If Season 1 is finalized or frozen, this will throw and halt ingestion for those paths.
      await season1EnforcementGuards.assertOperationAllowed();

      const event: ZapsSignalEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        season: 'SIMULATION_ONLY'
      };

      if (!event.actorUserId || !event.communityId || !event.type) {
        return;
      }

      zapsSignalLog.append(event);

      // --- CANON DUAL-LEDGER HOOK ---
      const massMap: Record<string, number> = {
        'UPVOTE': 1,
        'COMMENT': 5,
        'GOVERNANCE_VOTE': 10,
        'MODERATION_ACTION': 20
      };
      
      recognitionLedger.recordSignal({
        userId: event.actorUserId,
        communityId: event.communityId,
        category: 'CONSISTENCY',
        energyMass: massMap[event.type] || 1,
        metadata: { signalId: event.id, signalType: event.type }
      });

      // --- JOIN-TO-EARN v1 HOOK ---
      joinToEarnService.processSignal(event);

      // Derive recognition (UI Layer - Optional)
      const recognition = recognitionService.deriveFromSignal(event);
      if (recognition && toastCallback) {
        toastCallback(recognition);
      }

    } catch (error: any) {
      // Fail silently for product paths, but log for architect audit
      if (error.message?.startsWith('ENFORCEMENT')) {
         console.warn(`[PROTOCOL_GUARD] ${error.message}`);
      }
    }
  }
};
