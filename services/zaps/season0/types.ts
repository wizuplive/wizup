import type { ZapsSignalEvent } from "../../zapsSignals/zapsSignals.types";

export type SeasonId = string; // e.g. "S0_2025Q4"

export type SeasonalSimulationArtifact = {
  seasonId: SeasonId;
  communityId: string;
  window: { startMs: number; endMs: number };
  schemaVersion: "v1";
  resolvedWeights: Record<string, number>; // userId -> normalized recognition weight (0..1)
  capsApplied: Record<string, { raw: number; capped: number; capReason?: string }>;
  hashes: {
    inputHash: string;
    configHash: string;
    outputHash: string;
    runnerVersion: string;
  };
  notes?: string[];
};

export type Season0Result = {
  artifact: SeasonalSimulationArtifact;
  debug?: {
    totalsByType: Record<string, number>;
    usersConsidered: number;
    eventsConsidered: number;
  };
};

export type Season0Config = {
  runnerVersion: string;
  typeWeights: Partial<Record<ZapsSignalEvent["type"], number>>;
  saturation: { k: number };
  caps: {
    maxShare: number;
    minEvents: number;
  };
  decay: {
    halfLifeMs: number;
  };
  safety: {
    dropUnknownTypes: boolean;
  };
};
