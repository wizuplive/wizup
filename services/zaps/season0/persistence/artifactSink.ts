import type { SeasonalSimulationArtifact } from "../types";

/**
 * 🏺 SEASONAL ARTIFACT SINK
 * =========================
 * Interface for shadow-writing simulation outcomes.
 */
export interface SeasonalArtifactSink {
  /**
   * Shadow write only. Must never throw to callers.
   * Must not be read by UI paths.
   */
  write(artifact: SeasonalSimulationArtifact): Promise<void>;
}
