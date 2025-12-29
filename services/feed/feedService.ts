
import { isDemo } from "../../config/appMode";
import { getDemoFeed } from "./feedService.demo";
import { FeedPost } from "../../types/feedTypes";

export const feedServiceRouter = {
  async getFeed(): Promise<FeedPost[]> {
    if (isDemo()) {
      return getDemoFeed();
    }
    // Fallback for live
    return [];
  }
};
