export type Role = "MEMBER" | "CREATOR" | "INFLUENCER";

export type RepTier = "T0" | "T1" | "T2" | "T3" | "T4";

export type TierLabel =
  | "Observer"
  | "Participant"
  | "Builder"
  | "Steward"
  | "Anchor";

export type DecayState = "fresh" | "fading" | "dormant";

export type CommunityReputationLedger = {
  userId: string;
  communityId: string;

  tier: RepTier;
  tierLabel: TierLabel;
  tierProgress: number; // 0..1 for ring

  standingLabel: string; // "Active • Trusted" etc (non-numeric)
  decayState: DecayState;

  lastActiveAt: string; // ISO
  signals30d: Partial<Record<
    "presence" | "participation" | "contribution" | "stewardship" | "influence",
    number
  >>;
};

export type CommunityZapsLedger = {
  userId: string;
  communityId: string;

  earnedTotal: number;   // lifetime earned in this community
  earnedSeason: number;  // current season earned in this community
  earned30d: number;

  receivedTotal?: number;
  sentTotal?: number;

  lastEarnedAt: string; // ISO
};