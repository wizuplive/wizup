export type ZapsSignalType =
  | 'UPVOTE'
  | 'DOWNVOTE'
  | 'COMMENT'
  | 'UPVOTE_RECEIVED'
  | 'COMMENT_CREATED'
  | 'COMMENT_UPVOTED'
  | 'MODERATION_ACTION'
  | 'GOVERNANCE_VOTE'
  | 'GOVERNANCE_PROPOSAL'
  | 'COMMUNITY_JOIN';

export interface ZapsSignalEvent {
  id: string;
  type: ZapsSignalType;
  actorUserId: string;        // who performed the action
  targetUserId?: string;     // who benefited (if applicable)
  communityId: string;
  source:
    | 'FEED'
    | 'COMMENTS'
    | 'MODERATION'
    | 'GOVERNANCE'
    | 'COMMUNITY';
  // Added missing properties to satisfy signal emission requirements in Feed, PostDetail, and CivicAgency
  targetType?: "POST" | "COMMENT" | "PROPOSAL" | "USER";
  targetId?: string;
  meta?: Record<string, any>;
  metadata?: {
    postId?: string;
    commentId?: string;
    proposalId?: string;
    moderationCaseId?: string;
  };
  timestamp: number;
  season: 'SIMULATION_ONLY';
}