
import { SeasonGateState } from "../types";

/**
 * 🏺 SEASON GATE SINK
 * ===================
 */
export interface SeasonGateSink {
  /**
   * Persists a gate state. Implementation must prevent overwrites.
   */
  write(state: SeasonGateState): Promise<void>;
  
  /**
   * Retrieves a gate state for a specific season.
   */
  read(seasonId: string): Promise<SeasonGateState | null>;
}
