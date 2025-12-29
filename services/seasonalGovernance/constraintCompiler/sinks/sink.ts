
import { CompiledSeasonConstraints } from "../types";

/**
 * 🏺 COMPILED CONSTRAINT SINK
 * ===========================
 */
export interface CompiledConstraintSink {
  write(artifact: CompiledSeasonConstraints): Promise<void>;
  read(seasonId: string): Promise<CompiledSeasonConstraints | null>;
}
