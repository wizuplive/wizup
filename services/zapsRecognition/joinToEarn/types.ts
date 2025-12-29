export type JoinToEarnSignalType = 
  | "JOIN" 
  | "STAY" 
  | "PARTICIPATE" 
  | "POSITIVE_RECEIPT" 
  | "STEWARDSHIP";

export interface JoinToEarnProgram {
  communityId: string;
  isActive: boolean;
  maxSeasonExposure: number; // Max ZAPS (conceptual) from treasury
  weeklyJoinLimit: number;
  currentSeasonTotal: number;
  currentWeekCount: number;
  weekStartedAt: number;
  isPaused: boolean;
  autoPauseTriggered: boolean;
}

export interface JoinToEarnParticipant {
  userId: string;
  communityId: string;
  joinedAt: number;
  signalsClaimed: JoinToEarnSignalType[];
  lastSignalAt: number;
}