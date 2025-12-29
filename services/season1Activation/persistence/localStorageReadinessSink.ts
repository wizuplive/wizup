import { ReadinessSink } from "./readinessSink";
import { ActivationReadinessArtifact } from "../types";

const KEY_PREFIX = "WIZUP::S1::READINESS::v1::";

export class LocalStorageReadinessSink implements ReadinessSink {
  async write(artifact: ActivationReadinessArtifact): Promise<void> {
    const key = `${KEY_PREFIX}${artifact.seasonId}`;
    const existing = await this.read(artifact.seasonId);

    if (existing) {
      if (existing.verdict.decision === "ABORT_FOREVER") {
        console.warn("[READINESS] Refusing update: ABORT_FOREVER is terminal.");
        return;
      }
      
      if (existing.verdict.decision === "PROCEED" && artifact.verdict.decision === "PROCEED") {
         if (existing.hashes.outputHash === artifact.hashes.outputHash) {
           return; // Idempotent
         }
      }
    }

    localStorage.setItem(key, JSON.stringify(artifact));
  }

  async read(seasonId: string): Promise<ActivationReadinessArtifact | null> {
    const raw = localStorage.getItem(`${KEY_PREFIX}${seasonId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

export const defaultReadinessSink = new LocalStorageReadinessSink();
