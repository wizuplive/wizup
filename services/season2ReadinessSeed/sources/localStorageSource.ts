import { LS_KEYS } from "../persistence/keys";
import { SeasonEndReceipt, SeasonArchiveBundle } from "../../seasonEnd/types";
import { CompiledSeasonConstraints } from "../../seasonalGovernance/constraintCompiler/types";

export const s1ArtifactSource = {
  async getReceipt(seasonId: string): Promise<SeasonEndReceipt | null> {
    const raw = localStorage.getItem(LS_KEYS.s1Receipt(seasonId));
    return raw ? JSON.parse(raw) : null;
  },

  async getArchive(seasonId: string): Promise<SeasonArchiveBundle | null> {
    const raw = localStorage.getItem(LS_KEYS.s1Archive(seasonId));
    return raw ? JSON.parse(raw) : null;
  },

  async getConstraints(seasonId: string): Promise<CompiledSeasonConstraints | null> {
    const raw = localStorage.getItem(LS_KEYS.s1Constraints(seasonId));
    return raw ? JSON.parse(raw) : null;
  }
};