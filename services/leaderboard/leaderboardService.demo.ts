
import { LeaderboardEntry } from "../../types/leaderboardTypes";

export const getDemoLeaderboard = (): LeaderboardEntry[] => [
  { rank: 1, name: "Elena R.", tier: "Anchor", zaps: 15400, avatar: "https://picsum.photos/seed/elena/100/100" },
  { rank: 2, name: "David K.", tier: "Steward", zaps: 12200, avatar: "https://picsum.photos/seed/david/100/100" },
  { rank: 3, name: "Sarah M.", tier: "Builder", zaps: 9800, avatar: "https://picsum.photos/seed/sarah/100/100" },
];
