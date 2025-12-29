/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { isSeason1Activated } from "./isSeason1Activated";

export type SeasonMode = "S0_REHEARSAL" | "S1_ACTIVATED";

/**
 * Decide which season pipeline to run.
 * - No UI use. Services only.
 */
export async function getSeasonMode(seasonId: string): Promise<SeasonMode> {
  try {
    const normalizedId = (seasonId === "SEASON_1" || seasonId === "active-season") ? "S1" : seasonId;
    const ok = await isSeason1Activated(normalizedId);
    return ok ? "S1_ACTIVATED" : "S0_REHEARSAL";
  } catch {
    return "S0_REHEARSAL";
  }
}
