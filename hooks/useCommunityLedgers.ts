import { useQuery } from "@tanstack/react-query";
import { communityReputationService } from "../services/communityReputationService";
import { communityZapsService } from "../services/communityZapsService";

export function useCommunityReputationLedger(userId: string, communityId: string | null) {
  return useQuery({
    queryKey: ["communityReputationLedger", userId, communityId],
    enabled: Boolean(userId && communityId),
    queryFn: async () => communityReputationService.get(userId, communityId!),
    staleTime: 60_000,
  });
}

export function useCommunityZapsLedger(userId: string, communityId: string | null) {
  return useQuery({
    queryKey: ["communityZapsLedger", userId, communityId],
    enabled: Boolean(userId && communityId),
    queryFn: async () => communityZapsService.get(userId, communityId!),
    staleTime: 60_000,
  });
}