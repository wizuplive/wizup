
import { ReputationTierId, SignalCategory } from "../services/reputationService";

export type Role = "MEMBER" | "CREATOR" | "INFLUENCER";

export type RepTier = "T0" | "T1" | "T2" | "T3" | "T4";

export type TierLabel =
  | "Observer"
  | "Participant"
  | "Builder"
  | "Steward"
  | "Anchor";

export type DecayState = "fresh" | "fading" | "dormant";

export interface CommunityReputationLedger {
  userId: string;
  communityId: string;
  score: number;
  tierId: ReputationTierId;
  tierLabel: TierLabel;
  tierProgress: number; // 0-100
  standingLabel: string; // e.g., "Active • Trusted"
  decayState: DecayState;
  lastActiveAt: number;
  signals30d: Record<SignalCategory, number>;
}

export interface CommunityZapsLedger {
  userId: string;
  communityId: string;
  earnedTotal: number;
  earnedSeason: number;
  earned30d: number;
  lastEarnedAt: number;
}

export interface UserZapsWallet {
  userId: string;
  available: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  attribution: Record<string, number>; // communityId -> amount
}
