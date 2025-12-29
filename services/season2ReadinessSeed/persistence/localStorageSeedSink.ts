import { Season2ReadinessSeed } from "../types";
import { LS_KEYS } from "./keys";
import { season1TemporalLock } from "../../season1TemporalLock/season1TemporalLock";

export class LocalStorageSeedSink {
  read(fromSeasonId: string): Season2ReadinessSeed | null {
    const raw = localStorage.getItem(LS_KEYS.seed(fromSeasonId));
    return raw ? JSON.parse(raw) : null;
  }

  async write(seed: Season2ReadinessSeed): Promise<void> {
    const key = LS_KEYS.seed(seed.fromSeasonId);
    const existing = this.read(seed.fromSeasonId);

    if (existing) {
      if (existing.hashes.seedHash === seed.hashes.seedHash) {
        return; // Idempotent
      }

      // 🛡️ IMMUTABILITY VIOLATION: Attempting to overwrite a seed with different lineage
      await season1TemporalLock.emitViolation(
        "ARCHIVE_IMMUTABILITY_BREACH",
        "CRITICAL",
        { 
          seasonId: seed.fromSeasonId, 
          objectType: "unknown", 
          proposedHash: seed.hashes.seedHash 
        },
        { existingHash: existing.hashes.seedHash }
      );
      return;
    }

    localStorage.setItem(key, JSON.stringify(seed));
  }
}