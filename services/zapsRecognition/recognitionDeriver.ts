import { RecognitionEvent, RecognitionReason, RecognitionType } from "./types";
import { ZapsSignalEvent } from "../zapsSignals/zapsSignals.types";
import { signalsSource } from "./sources/signalsSource";
import { simulationSource } from "./sources/simulationSource";
import { gates } from "./gates";
import { driftLogService } from "../driftLogService";

export const recognitionDeriver = {
  /**
   * Derives qualitative RecognitionEvents from signal logs.
   * Deterministic: same inputs -> same outputs.
   */
  async deriveRecognitionEvents(args: {
    communityId: string;
    nowMs: number;
    lookbackMs: number;
  }): Promise<RecognitionEvent[]> {
    const signals = await signalsSource.listSignals(args.communityId, args.nowMs - args.lookbackMs);
    const sim = await simulationSource.getSimulationState(args.communityId);
    const seasonId = sim?.seasonId || "S0";

    const events: RecognitionEvent[] = [];

    for (const signal of signals) {
      const derived = this.mapSignalToRecognition(signal, seasonId, args.nowMs);
      if (!derived) continue;

      // Anti-gaming gates
      if (gates.isWithinCooldown(derived.userId, derived.communityId, derived.reason, args.nowMs)) continue;
      if (gates.isBursting(derived.userId, args.nowMs)) continue;

      // Quality gate for comments
      if (signal.type === "COMMENT" && signal.meta?.text) {
        if (!gates.passesQualityGate(signal.meta.text)) continue;
      }

      events.push(derived);
    }

    return events;
  },

  mapSignalToRecognition(signal: ZapsSignalEvent, seasonId: string, now: number): RecognitionEvent | null {
    let type: RecognitionType;
    let reason: RecognitionReason;

    switch (signal.type) {
      case "UPVOTE_RECEIVED":
        type = "APPRECIATION";
        reason = "UPVOTE_RECEIVED";
        break;
      case "COMMENT":
        type = "CONTRIBUTION";
        reason = "COMMENT_CONTRIBUTION";
        break;
      case "MODERATION_ACTION":
        type = "STEWARDSHIP";
        reason = "MODERATION_ACTION";
        break;
      case "GOVERNANCE_VOTE":
      case "GOVERNANCE_PROPOSAL":
        type = "CIVIC";
        reason = "GOVERNANCE_PARTICIPATION";
        break;
      case "COMMUNITY_JOIN":
        type = "APPRECIATION";
        reason = "JOIN_COMMUNITY";
        break;
      default:
        return null;
    }

    const userId = signal.actorUserId; // beneficiary of recognition is the actor in these cases

    // Deterministic ID Hashing
    const idInput = `${signal.communityId}:${userId}:${reason}:${signal.targetId || "none"}:${signal.ts}`;
    const id = driftLogService.hash(idInput);

    return {
      id,
      userId,
      communityId: signal.communityId,
      type,
      reason,
      sourceRef: signal.targetId ? {
        kind: this.mapTargetKind(signal.targetType),
        id: signal.targetId
      } : undefined,
      occurredAt: signal.ts,
      derivedAt: now,
      seasonId,
      version: "v1"
    };
  },

  mapTargetKind(targetType?: string): any {
    switch (targetType) {
      case "POST": return "post";
      case "COMMENT": return "comment";
      case "PROPOSAL": return "proposal";
      default: return "community";
    }
  }
};
