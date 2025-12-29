import type { SeasonalArtifactSink } from "./artifactSink";
import type { SeasonalSimulationArtifact } from "../types";

/**
 * 🧠 MEMORY ARTIFACT SINK
 * =======================
 * Fast, ephemeral storage for simulation results.
 */
export class MemoryArtifactSink implements SeasonalArtifactSink {
  private artifacts: SeasonalSimulationArtifact[] = [];

  async write(artifact: SeasonalSimulationArtifact): Promise<void> {
    try {
      this.artifacts.push(artifact);
    } catch {
      // fail-open
    }
  }

  /**
   * Debug-only getter. 
   * NEVER wire this to production UI components.
   */
  getAll(): readonly SeasonalSimulationArtifact[] {
    return this.artifacts;
  }
}
