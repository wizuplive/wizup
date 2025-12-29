/**
 * ❄️ FREEZE ENFORCER
 * Manages the Irreversible Season Freeze State.
 */
const MEMORY_FREEZE_CACHE: Record<string, boolean> = {};

export const freezeEnforcer = {
  isSeason1Frozen(seasonId: string): boolean {
    const isS1 = seasonId === "S1" || seasonId === "SEASON_1" || seasonId === "active-season";
    if (!isS1) return false;

    // 1. Check memory cache (fast path)
    if (MEMORY_FREEZE_CACHE[seasonId]) return true;

    // 2. Check persistence
    try {
      const state = localStorage.getItem(`WIZUP::S1::FREEZE_STATE::${seasonId}`);
      if (state === "FROZEN") {
        MEMORY_FREEZE_CACHE[seasonId] = true;
        return true;
      }
    } catch {
      // Fail-open: assume not frozen
    }
    return false;
  },

  setFrozen(seasonId: string): void {
    MEMORY_FREEZE_CACHE[seasonId] = true;
    try {
      localStorage.setItem(`WIZUP::S1::FREEZE_STATE::${seasonId}`, "FROZEN");
      console.error(`%c[PROTOCOL_CRITICAL] Season ${seasonId} has been IRREVERSIBLY FROZEN due to detected drift.`, "color: white; background: red; font-weight: bold; padding: 4px;");
    } catch {
      // Still treat as frozen in memory even if write fails
    }
  }
};
