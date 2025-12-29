import { seasonalAllocationResolutionService } from "./seasonalAllocationResolutionService";

/**
 * 🕵️ SEASON PREVIEW INSPECTOR (Dev-Only)
 * =====================================
 * Provides deep visibility into the resolution engine without UI exposure.
 */

export const previewInspector = {
  /**
   * Dumps a formatted preview of the season allocation to the console.
   */
  async inspect(seasonId: string) {
    console.log(`%c[WIZUP ARCHITECT] Inspecting Season: ${seasonId}`, "color: #a855f7; font-weight: bold; font-size: 14px;");

    // Standard 30-day lookback for simulation context
    const windowRange = {
      startAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
      endAt: Date.now()
    };

    try {
      const preview = await seasonalAllocationResolutionService.resolveSeasonPreview(seasonId, windowRange);

      console.log(`%cGenerated At: ${preview.generatedAt} | Version: ${preview.version}`, "color: #666;");
      console.log(`%cGlobal Hash: ${preview.hash}`, "color: #666; font-family: monospace;");

      Object.values(preview.resultsByCommunity).forEach((comm) => {
        const healthColor = comm.communityExplanation.health === 'NOMINAL' ? '#22c55e' : '#f59e0b';
        
        console.group(`%cCommunity: ${comm.communityId}`, `color: ${healthColor}; font-weight: bold;`);
        console.log(`%cHealth: ${comm.communityExplanation.health} | Summary: ${comm.communityExplanation.summary}`, "color: #888;");
        console.log(`%cNotes: ${comm.communityExplanation.notes.join('; ')}`, "color: #888; font-style: italic;");
        
        // Tabular data for participants
        const tableData = comm.participants.map(p => ({
          "User ID": p.userId,
          "Weight Tier": p.allocationWeight,
          "Narrative": p.explanation.headline,
          "Highlights": p.explanation.highlights.join(", "),
          "Anomaly Flags": p.explanation.flags?.join(", ") || "None",
          "Lane": p.explanation.lane
        }));

        if (tableData.length > 0) {
          console.table(tableData);
        } else {
          console.log("%cNo participants recorded in this shard.", "color: #666;");
        }
        
        console.groupEnd();
      });

      console.log(`%c--- End of Inspection Report ---`, "color: #666; font-weight: bold;");
    } catch (err) {
      console.error("[Architect] Inspection failed:", err);
    }
  }
};
