import { CommunityTreasuryLedger } from "../communityTreasury/types";

export type AllocationWeightLabel = "MICRO" | "LOW" | "MEDIUM" | "HIGH" | "TOP";

export type AllocationExplanation = {
  headline: string;
  highlights: string[];
  flags?: string[];
  lane: "NOMINAL" | "ELEVATED" | "DAMPENED";
};

export type CommunityAllocationExplanation = {
  summary: string;
  health: "NOMINAL" | "VOLATILE" | "CONCENTRATED";
  notes: string[];
};

export type CommunityAllocationPreview = {
  communityId: string;
  seasonId: string;
  participants: {
    userId: string;
    allocationWeight: AllocationWeightLabel;
    explanation: AllocationExplanation;
  }[];
  communityExplanation: CommunityAllocationExplanation;
  diagnostics: {
    totalSignals: number;
    activeParticipants: number;
    normalizationApplied: boolean;
    capsApplied: boolean;
  };
  hash: string;
};

export type SeasonAllocationPreview = {
  seasonId: string;
  generatedAt: string;
  scope: "SIMULATION";
  version: "v1.1";
  pool: {
    communityId: string;
    poolTag: "COMMUNITY_ACTIVITY_POOL";
  }[];
  resultsByCommunity: Record<string, CommunityAllocationPreview>;
  // Integration: Attach community-scoped simulation treasuries
  communityTreasuries?: Record<string, CommunityTreasuryLedger>;
  globalDiagnostics: {
    totalCommunities: number;
    totalActiveUsers: number;
    driftDetected?: boolean;
  };
  hash: string;
};
