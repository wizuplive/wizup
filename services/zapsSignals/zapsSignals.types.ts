export type ZapsSignalType =
  | "UPVOTE"
  | "DOWNVOTE"
  | "COMMENT"
  | "MODERATION_ACTION"
  | "GOVERNANCE_VOTE"
  | "GOVERNANCE_PROPOSAL"
  | "UPVOTE_RECEIVED"
  | "COMMENT_CREATED"
  | "COMMENT_UPVOTED"
  | "COMMUNITY_JOIN";

export type ZapsSignalEvent = {
  id: string;
  ts: number;

  communityId: string;     // REQUIRED - scoped
  actorUserId: string;     // REQUIRED

  type: ZapsSignalType;

  targetType?: "POST" | "COMMENT" | "PROPOSAL" | "USER";
  targetId?: string;

  meta?: Record<string, any>;

  // simulation hint only (never payout)
  weightHint?: number;
};