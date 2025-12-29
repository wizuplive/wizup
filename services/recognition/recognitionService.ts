
import { RecognitionEvent, RecognitionType, RecognitionReason } from "../../types/recognitionTypes";
import { ZapsSignalEvent } from "../zapsSignals/types/zapsSignals.types";
import { RECOGNITION_FLAGS } from "../../config/featureFlagsRecognition";

const STORAGE_KEY = 'wizup_recognition_ledger_v1';
const LIMIT_KEY = 'wizup_recognition_limits_v1';

export const recognitionService = {
  getEvents(userId: string): RecognitionEvent[] {
    if (!RECOGNITION_FLAGS.ZAPS_INBOX) return [];
    try {
      const all: RecognitionEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return all.filter(e => e.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    } catch { return []; }
  },

  deriveFromSignal(signal: ZapsSignalEvent): RecognitionEvent | null {
    if (!RECOGNITION_FLAGS.ZAPS_RECOG_FROM_SIM) return null;

    // 1. Map Signal -> Recognition
    let type: RecognitionType | null = null;
    let reason: RecognitionReason | null = null;
    let label = "";

    switch (signal.type) {
      case 'UPVOTE_RECEIVED':
        type = 'APPRECIATION';
        reason = 'upvote_received';
        label = 'Noted';
        break;
      case 'COMMENT_CREATED':
        type = 'CONTRIBUTION';
        reason = 'helpful_contribution';
        label = 'Contribution';
        break;
      case 'MODERATION_ACTION':
        type = 'STEWARDSHIP';
        reason = 'moderation_action';
        label = 'Stewardship';
        break;
      case 'GOVERNANCE_PROPOSAL':
        type = 'CIVIC';
        reason = 'proposal_created';
        label = 'Civic participation';
        break;
      case 'GOVERNANCE_VOTE':
        type = 'CIVIC';
        reason = 'vote_cast';
        label = 'Civic participation';
        break;
      case 'COMMUNITY_JOIN':
        type = 'APPRECIATION';
        reason = 'community_joined';
        label = 'Noted';
        break;
    }

    if (!type || !reason) return null;

    // 2. Anti-Gaming: Rate Limits
    if (this.isRateLimited(signal.actorUserId, signal.communityId, type)) {
      return null;
    }

    const event: RecognitionEvent = {
      id: crypto.randomUUID(),
      userId: signal.actorUserId,
      communityId: signal.communityId,
      type,
      reason,
      label,
      sourceRef: signal.targetId,
      createdAt: Date.now(),
      surfaced: false
    };

    this.saveEvent(event);
    this.updateLimit(signal.actorUserId, signal.communityId, type);

    return event;
  },

  // Removed invalid 'private' modifier
  isRateLimited(userId: string, communityId: string, type: RecognitionType): boolean {
    try {
      const limits = JSON.parse(localStorage.getItem(LIMIT_KEY) || '{}');
      const key = `${userId}_${communityId}_${type}`;
      const lastTime = limits[key] || 0;
      const cooldown = type === 'APPRECIATION' ? 60000 : 600000; // 1m for apprec, 10m for contribution/steward
      return (Date.now() - lastTime) < cooldown;
    } catch { return false; }
  },

  // Removed invalid 'private' modifier
  updateLimit(userId: string, communityId: string, type: RecognitionType) {
    try {
      const limits = JSON.parse(localStorage.getItem(LIMIT_KEY) || '{}');
      limits[`${userId}_${communityId}_${type}`] = Date.now();
      localStorage.setItem(LIMIT_KEY, JSON.stringify(limits));
    } catch {}
  },

  // Removed invalid 'private' modifier
  saveEvent(event: RecognitionEvent) {
    try {
      const all: RecognitionEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      all.unshift(event);
      if (all.length > 500) all.pop();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }
};
