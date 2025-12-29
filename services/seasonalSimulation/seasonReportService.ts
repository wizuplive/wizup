import { seasonalAllocationResolutionService } from "./seasonalAllocationResolutionService";
import { zapsSignalLogService } from "../zapsSignals/zapsSignalLogService";
import { CALIBRATION_v1_1 } from "./calibration";
import { hashing } from "./hashing";
import { SeasonAllocationPreview } from "./types";

export interface Season0ReportArtifact {
  reportMeta: {
    seasonId: string;
    generatedAt: string;
    protocolVersion: string;
  };
  parametersSnapshot: {
    hash: string;
    data: any;
  };
  simulationScope: {
    communities: string[];
    window: { startAt: number; endAt: number };
    totalSignals: number;
  };
  perCommunity: Record<string, {
    poolSize: number;
    eligibleCount: number;
    whaleClampHits: number;
    capHits: number;
    stewardshipNarrative: string;
    topContributors: Array<{ userId: string; tier: string; band: string }>;
    hash: string;
    internalMetrics?: any;
  }>;
  globalSummary: {
    totalEligibleUsers: number;
    concentrationWarning: boolean;
    reportHash: string;
  };
}

export const seasonReportService = {
  /**
   * Builds a deterministic report artifact for Season 0.
   */
  async buildSeason0Report(): Promise<Season0ReportArtifact> {
    const window = {
      startAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
      endAt: Date.now()
    };

    const preview = await seasonalAllocationResolutionService.resolveSeasonPreview("season0", window);
    const allSignals = zapsSignalLogService.listAll().filter(s => s.ts >= window.startAt && s.ts <= window.endAt);

    // 1. Snapshot Parameters
    const paramsHash = await hashing.generateHash(CALIBRATION_v1_1);

    // 2. Build Per-Community Data
    const communityData: Season0ReportArtifact['perCommunity'] = {};
    const sortedCommunityIds = Object.keys(preview.resultsByCommunity).sort();

    for (const cid of sortedCommunityIds) {
      const comm = preview.resultsByCommunity[cid];
      
      // Calculate hits (simulated detection)
      const capHits = comm.participants.filter(p => p.explanation.lane === 'DAMPENED').length;
      const whaleHits = comm.diagnostics.capsApplied ? 1 : 0; // Simplified for v1

      communityData[cid] = {
        poolSize: 1000000, // Simulation unit
        eligibleCount: comm.participants.length,
        whaleClampHits: whaleHits,
        capHits: capHits,
        stewardshipNarrative: comm.communityExplanation.summary,
        topContributors: comm.participants.slice(0, 5).map(p => ({
          userId: p.userId,
          tier: p.allocationWeight,
          band: p.explanation.headline
        })),
        hash: comm.hash,
        internalMetrics: comm.diagnostics // Details included in export
      };
    }

    const activeUsers = new Set(allSignals.map(s => s.actorUserId));

    const report: Omit<Season0ReportArtifact, 'globalSummary'> = {
      reportMeta: {
        seasonId: "season0",
        generatedAt: new Date().toISOString(),
        protocolVersion: preview.version
      },
      parametersSnapshot: {
        hash: paramsHash,
        data: CALIBRATION_v1_1
      },
      simulationScope: {
        communities: sortedCommunityIds,
        window,
        totalSignals: allSignals.length
      },
      perCommunity: communityData
    };

    const reportHash = await hashing.generateHash(report);

    return {
      ...report,
      globalSummary: {
        totalEligibleUsers: activeUsers.size,
        concentrationWarning: sortedCommunityIds.some(cid => communityData[cid].whaleClampHits > 0),
        reportHash
      }
    };
  },

  /**
   * Triggers a browser download of the JSON report.
   */
  async downloadSeason0Report() {
    const report = await this.buildSeason0Report();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `wizup_season0_sim_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
};
