import { SeasonHealthSink } from "./seasonHealthSink";
import { SeasonHealthArtifactV1 } from "../types";

const KEY_PREFIX = "WIZUP::SEASON_HEALTH::v1::";

export class LocalStorageSeasonHealthSink implements SeasonHealthSink {
  async write(artifact: SeasonHealthArtifactV1): Promise<boolean> {
    const key = `${KEY_PREFIX}${artifact.seasonId}`;
    const existingRaw = localStorage.getItem(key);
    
    if (existingRaw) {
      const existing = JSON.parse(existingRaw) as SeasonHealthArtifactV1;
      // Idempotency check
      if (existing.hashes.outputHash === artifact.hashes.outputHash) {
        return true; 
      }
      // Immutability Violation - handled by composite/service
      return false;
    }

    localStorage.setItem(key, JSON.stringify(artifact));
    return true;
  }

  async read(seasonId: string): Promise<SeasonHealthArtifactV1 | null> {
    const raw = localStorage.getItem(`${KEY_PREFIX}${seasonId}`);
    return raw ? JSON.parse(raw) : null;
  }
}
