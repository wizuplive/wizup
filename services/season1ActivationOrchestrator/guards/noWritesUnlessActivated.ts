/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { isSeason1Activated } from "../isSeason1Activated";

export async function assertSeason1ActivatedOrThrow(seasonId: string): Promise<void> {
  const normalizedId = (seasonId === "SEASON_1" || seasonId === "active-season") ? "S1" : seasonId;
  const ok = await isSeason1Activated(normalizedId);
  if (!ok) throw new Error("Season 1 not activated");
}
