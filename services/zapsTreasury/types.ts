import { SpendIntentCategory } from "../zapsSpend/types";

export type TreasuryActionType = 'FUNDING_SEASONAL' | 'FUNDING_CONTRIBUTION' | 'FUNDING_J2E' | 'DISTRIBUTION';

export type AuthorityRole = 'OWNER' | 'STEWARD' | 'OBSERVER';

export interface TreasurySteward {
  userId: string;
  role: AuthorityRole;
  appointedAt: number;
}

export interface TreasuryProposal {
  id: string;
  communityId: string;
  proposerId: string;
  category: SpendIntentCategory;
  amount: number;
  description: string;
  approvals: string[]; // List of steward userIds
  status: 'PENDING' | 'EXECUTED' | 'EXPIRED' | 'BLOCKED';
  createdAt: number;
  expiresAt: number;
}

export interface TreasuryAction {
  id: string;
  communityId: string;
  type: TreasuryActionType;
  category?: SpendIntentCategory; // For distributions
  amount: number;
  description: string;
  actorId: string; // The authorized decider or 'SYSTEM'
  timestamp: number;
  hash: string;
}

export interface TreasurySummary {
  communityId: string;
  balance: number;
  isFrozen: boolean;
  totalDistributed: number;
  lastActionAt: number;
}

export interface TreasuryRulesetConfig {
  version: "v1";
  maxSpendCapPercent: number; // e.g. 0.10 (10%)
  minStewardQuorum: number;   // e.g. 2
  velocityWindowMs: number;   // e.g. 1 hour
  maxVelocityPercent: number; // e.g. 0.50 (50%)
  proposalExpiryMs: number;
}