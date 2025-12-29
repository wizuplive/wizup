import type { CommunityZapsLedger } from "../types/reputation";
import { demoGetCommunityZaps } from "./demo/demoCommunityLedgers";

export const communityZapsService = {
  async get(userId: string, communityId: string): Promise<CommunityZapsLedger> {
    return demoGetCommunityZaps(userId, communityId);
  },
};