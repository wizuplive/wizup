import type { CommunityReputationLedger, CommunityZapsLedger } from "../../types/reputation";

const nowIso = () => new Date().toISOString();

const repByCommunity: Record<string, Omit<CommunityReputationLedger, "userId">> = {
  "Design Systems Mastery": {
    communityId: "Design Systems Mastery",
    tier: "T3",
    tierLabel: "Steward",
    tierProgress: 0.62,
    standingLabel: "Active • Trusted",
    decayState: "fresh",
    lastActiveAt: nowIso(),
    signals30d: { presence: 18, participation: 42, contribution: 9, stewardship: 2 },
  },
  "Web3 Builders Club": {
    communityId: "Web3 Builders Club",
    tier: "T2",
    tierLabel: "Builder",
    tierProgress: 0.18,
    standingLabel: "Active",
    decayState: "fresh",
    lastActiveAt: nowIso(),
    signals30d: { presence: 10, participation: 14, contribution: 2 },
  },
  "Minimalist Productivity": {
    communityId: "Minimalist Productivity",
    tier: "T1",
    tierLabel: "Participant",
    tierProgress: 0.44,
    standingLabel: "Learning",
    decayState: "fading",
    lastActiveAt: nowIso(),
    signals30d: { presence: 6, participation: 8 },
  },
};

const zapsByCommunity: Record<string, Omit<CommunityZapsLedger, "userId">> = {
  "Design Systems Mastery": {
    communityId: "Design Systems Mastery",
    earnedTotal: 15400,
    earnedSeason: 1200,
    earned30d: 600,
    lastEarnedAt: nowIso(),
  },
  "Web3 Builders Club": {
    communityId: "Web3 Builders Club",
    earnedTotal: 12200,
    earnedSeason: 900,
    earned30d: 320,
    lastEarnedAt: nowIso(),
  },
  "Minimalist Productivity": {
    communityId: "Minimalist Productivity",
    earnedTotal: 9800,
    earnedSeason: 420,
    earned30d: 110,
    lastEarnedAt: nowIso(),
  },
};

export function demoGetCommunityReputation(userId: string, communityId: string): CommunityReputationLedger {
  const base = repByCommunity[communityId] ?? {
    communityId,
    tier: "T0",
    tierLabel: "Observer",
    tierProgress: 0,
    standingLabel: "New",
    decayState: "fresh" as const,
    lastActiveAt: nowIso(),
    signals30d: {},
  };
  return { userId, ...base };
}

export function demoGetCommunityZaps(userId: string, communityId: string): CommunityZapsLedger {
  const base = zapsByCommunity[communityId] ?? {
    communityId,
    earnedTotal: 0,
    earnedSeason: 0,
    earned30d: 0,
    lastEarnedAt: nowIso(),
  };
  return { userId, ...base };
}