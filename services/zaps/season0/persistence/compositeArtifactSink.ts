import type { SeasonalArtifactSink } from "./artifactSink";
import type { SeasonalSimulationArtifact } from "../types";
import { shadowSinks } from "../../../firestoreShadow/sinks/shadowSinks";

/**
 * 📦 COMPOSITE ARTIFACT SINK
 * ==========================
 * Orchestrates multi-destination shadow writes.
 */
export class CompositeArtifactSink implements SeasonalArtifactSink {
  constructor(private readonly sinks: SeasonalArtifactSink[]) {}

  async write(artifact: SeasonalSimulationArtifact): Promise<void> {
    // 1. Attempt standard sinks (localStorage/memory)
    await Promise.all(
      this.sinks.map((s) =>
        s.write(artifact).catch(() => {
          /* swallow (fail-open) */
        })
      )
    );

    // 2. Deterministic Firestore Shadow (Fire and Forget)
    shadowSinks.writeSeason0Artifact(artifact);
  }
}
