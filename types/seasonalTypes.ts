export type SeasonId = string;

export type PoolType = 
  | 'MEMBER_CONTRIBUTION' // 45%
  | 'CREATOR_STEWARDSHIP' // 30%
  | 'INFLUENCER_IMPACT'    // 15%
  | 'PROTOCOL_RESERVE';    // 10%

export interface SeasonalEligibility {
  activeDays: number;       // Must be >= 7
  hasPenalty: boolean;      // Must be false
  contributionCount: number; // Must be >= 1
}

export interface SeasonalWeightSnapshot {
  userId: string;
  baseWeight: number;
  governanceBoost: number;
  freshnessFactor: number;
  gamingDampener: number;
  finalWeight: number;
}

export interface SeasonalAllocationResult {
  userId: string;
  poolType: PoolType;
  amount: number;
  weightAtSnapshot: number;
}