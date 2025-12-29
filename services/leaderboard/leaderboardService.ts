
import { isDemo } from "../../config/appMode";
import { getDemoLeaderboard } from "./leaderboardService.demo";
import { LeaderboardEntry } from "../../types/leaderboardTypes";

export const leaderboardServiceRouter = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (isDemo()) return getDemoLeaderboard();
    return [];
  }
};
