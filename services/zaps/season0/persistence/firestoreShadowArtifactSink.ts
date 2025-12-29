import type { SeasonalArtifactSink } from "./artifactSink";
import type { SeasonalSimulationArtifact } from "../types";

/**
 * 🔥 FIRESTORE SHADOW ARTIFACT SINK
 * =================================
 * Writes simulation artifacts to a centralized cloud store.
 */
export class FirestoreShadowArtifactSink implements SeasonalArtifactSink {
  constructor(
    private readonly deps: {
      firestore: any;
      collectionPath?: string; // default "zaps_seasonal_simulation_artifacts"
      writer?: {
        set: (collectionPath: string, docId: string, data: any, opts?: { merge?: boolean }) => Promise<void>;
      };
    }
  ) {}

  async write(artifact: SeasonalSimulationArtifact): Promise<void> {
    const path = this.deps.collectionPath ?? "zaps_seasonal_simulation_artifacts";

    try {
      const docId = `${artifact.communityId}__${artifact.seasonId}`;

      const payload = {
        ...artifact,
        // Add index fields for audit queryability
        _communityId: artifact.communityId,
        _seasonId: artifact.seasonId,
        _outputHash: artifact.hashes.outputHash,
        _inputHash: artifact.hashes.inputHash,
        _configHash: artifact.hashes.configHash,
        _runnerVersion: artifact.hashes.runnerVersion,
        _writtenAtMs: Date.now(),
      };

      if (this.deps.writer?.set) {
        await this.deps.writer.set(path, docId, payload, { merge: true });
        return;
      }

      if (!this.deps.firestore) return;
      // Note: Assuming firestore has a setDoc-like capability
      await this.deps.firestore.set(path, docId, payload, { merge: true });
    } catch {
      // swallow (fail-open)
    }
  }
}
