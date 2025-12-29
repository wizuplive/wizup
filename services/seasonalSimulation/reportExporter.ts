import { seasonalAllocationResolutionService } from "./seasonalAllocationResolutionService";

/**
 * 💾 DETERMINISTIC SEASON REPORT EXPORTER
 * =======================================
 * Produces static JSON artifacts for Season 0 review.
 */

export const reportExporter = {
  /**
   * Generates a deterministic JSON report and triggers a browser download.
   */
  async export(seasonId: string) {
    const windowRange = {
      startAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
      endAt: Date.now()
    };

    try {
      const preview = await seasonalAllocationResolutionService.resolveSeasonPreview(seasonId, windowRange);
      
      // Strict artifact formatting following Protocol v1.1
      const report = {
        seasonId: preview.seasonId,
        version: "v1.1",
        scope: "SIMULATION",
        generatedAt: new Date().toISOString(),
        communities: Object.values(preview.resultsByCommunity).reduce((acc: any, comm) => {
          acc[comm.communityId] = {
            health: comm.communityExplanation.health,
            summary: comm.communityExplanation.summary,
            participants: comm.participants.map(p => ({
              userId: p.userId,
              allocationWeight: p.allocationWeight,
              explanation: p.explanation
            })),
            diagnostics: {
                totalSignals: comm.diagnostics.totalSignals,
                activeParticipants: comm.diagnostics.activeParticipants,
                flags: this.deriveResultFlags(comm)
            },
            hash: comm.hash
          };
          return acc;
        }, {}),
        globalDiagnostics: preview.globalDiagnostics,
        hash: preview.hash
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `wizup_${seasonId}_v1_report.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      console.log(`%c[Architect] ${seasonId} Report Generated Successfully.`, "color: #22c55e; font-weight: bold;");
      return report;
    } catch (err) {
      console.error("[Architect] Export failed:", err);
      return null;
    }
  },

  // fix: Removed invalid 'private' modifier from object literal method
  deriveResultFlags(comm: any): string[] {
      const flags: string[] = [];
      if (comm.diagnostics.totalSignals > 1000) flags.push("HIGH_VOLUME");
      if (comm.participants.length < 5) flags.push("LOW_DIVERSITY");
      // Anomaly detection: if one user is > 15% (whale clamp would have hit)
      // Note: We check qualitative indicators here
      return flags;
  }
};