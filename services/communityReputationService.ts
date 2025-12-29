import type { CommunityReputationLedger } from "../types/reputation";
import { demoGetCommunityReputation } from "./demo/demoCommunityLedgers";

export const communityReputationService = {
  async get(userId: string, communityId: string): Promise<CommunityReputationLedger> {
    // v1 demo: synchronous mock, still async contract for future backend
    return demoGetCommunityReputation(userId, communityId);
  },
};