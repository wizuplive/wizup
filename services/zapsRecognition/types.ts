export type RecognitionType =
  | "APPRECIATION"
  | "CONTRIBUTION"
  | "STEWARDSHIP"
  | "CIVIC";

export type RecognitionReason =
  | "UPVOTE_RECEIVED"
  | "COMMENT_CONTRIBUTION"
  | "POST_CONTRIBUTION"
  | "MODERATION_ACTION"
  | "GOVERNANCE_PARTICIPATION"
  | "JOIN_COMMUNITY";

export interface RecognitionEvent {
  id: string;                 // deterministic ID based on signal inputs
  userId: string;
  communityId: string;

  type: RecognitionType;
  reason: RecognitionReason;

  sourceRef?: {
    kind: "post" | "comment" | "modCase" | "proposal" | "community";
    id: string;
  };

  occurredAt: number;         // unix ms (when signal happened)
  derivedAt: number;          // unix ms (when derived)
  seasonId: string;           // e.g. "S0"
  version: "v1";

  // Internal metadata (NEVER surfaced by UI in v1)
  meta?: {
    lane?: "NORMAL" | "PRIORITY" | "SENSITIVE" | "LEGAL";
    actor?: "MEMBER" | "CREATOR" | "INFLUENCER" | "AI_MOD";
  };
}
