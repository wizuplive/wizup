export interface SeasonWindow {
  seasonId: string;
  startMs: number;
  endMs: number;
  contractHash: string;
}

export const seasonWindowSource = {
  /**
   * Reads the ARMED or SEALED contract to determine valid write window.
   */
  async getWindow(seasonId: string): Promise<SeasonWindow | null> {
    try {
      const isS1 = seasonId === "S1" || seasonId === "SEASON_1" || seasonId === "active-season";
      if (!isS1) return null;

      const raw = localStorage.getItem("WIZUP::S1::ARTIFACT::CONTRACT");
      if (!raw) return null;

      const contract = JSON.parse(raw);
      if (!contract.timeWindow || !contract.timeWindow.startMs || !contract.timeWindow.endMs) {
        return null;
      }

      return {
        seasonId: "S1",
        startMs: contract.timeWindow.startMs,
        endMs: contract.timeWindow.endMs,
        contractHash: contract.activationHash || "unknown"
      };
    } catch {
      return null;
    }
  }
};
