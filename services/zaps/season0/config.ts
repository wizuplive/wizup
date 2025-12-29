import type { Season0Config } from "./types";

export const defaultSeason0Config: Season0Config = {
  runnerVersion: "season0Runner@v1",
  typeWeights: {
    UPVOTE: 1.0,
    DOWNVOTE: 0.25,
    COMMENT: 2.0,
    MODERATION_ACTION: 2.5,
    GOVERNANCE_VOTE: 2.0,
    GOVERNANCE_PROPOSAL: 3.0,
    COMMUNITY_JOIN: 1.0
  },
  saturation: { k: 0.18 },
  caps: {
    maxShare: 0.15, // canonical whale clamp (≤ 15%)
    minEvents: 3,   // maturity floor
  },
  decay: {
    halfLifeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  safety: {
    dropUnknownTypes: true,
  },
};
