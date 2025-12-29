
import { PublicLegitimacyDisclosure } from "../types";

/**
 * 🏺 DISCLOSURE SINK
 * ==================
 */
export interface DisclosureSink {
  /**
   * Persists a disclosure statement. Implementation must prevent updates.
   */
  write(disclosure: PublicLegitimacyDisclosure): Promise<void>;
  
  /**
   * Retrieves a disclosure statement.
   */
  read(seasonId: string): Promise<PublicLegitimacyDisclosure | null>;
}
