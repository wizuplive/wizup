
import { isDemo } from "../../config/appMode";
import { getDemoCommunities } from "./communityService.demo";
import { Community } from "../../types/communityTypes";

export const communityServiceRouter = {
  async getCommunities(): Promise<Community[]> {
    if (isDemo()) return getDemoCommunities();
    return [];
  }
};
