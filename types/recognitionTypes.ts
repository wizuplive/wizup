export type RecognitionType = 'APPRECIATION' | 'CONTRIBUTION' | 'STEWARDSHIP' | 'CIVIC';

export type RecognitionReason = 
  | 'upvote_received' 
  | 'first_comment' 
  | 'helpful_contribution' 
  | 'moderation_action' 
  | 'proposal_created' 
  | 'vote_cast' 
  | 'community_joined';

export interface RecognitionEvent {
  id: string;
  userId: string;
  communityId: string;
  type: RecognitionType;
  reason: RecognitionReason;
  label: string; // "Noted", "Contribution", etc.
  sourceRef?: string; // postId, commentId, etc.
  createdAt: number;
  surfaced: boolean;
}