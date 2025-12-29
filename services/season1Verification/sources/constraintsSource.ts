import { CompiledConstraintsSnapshot } from "../types/constraintsTypes";
import { LS_KEYS } from "../keys";

export interface ConstraintsSource {
  getConstraints(seasonId: string): Promise<CompiledConstraintsSnapshot | null>;
}

export class LocalStorageConstraintsSource implements ConstraintsSource {
  async getConstraints(seasonId: string): Promise<CompiledConstraintsSnapshot | null> {
    try {
      const raw = localStorage.getItem(LS_KEYS.compiledConstraints(seasonId));
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Adaptation for v1 verifier schema
      return {
        seasonId: data.seasonId,
        constraintsHash: data.hashes?.compiledHash || "",
        overrides: data.overrides || {},
        schemaVersion: "v1",
        sealed: true
      };
    } catch { return null; }
  }
}
