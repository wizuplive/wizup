/**
 * Caps and Dominance Resistance (Sealed)
 * Enforces "Human-Centric" scaling over "Account-Centric" volume.
 */

export const caps = {
  /**
   * Per-user Soft Cap
   * Below cap: Linear
   * Above cap: Soft-log compression (v1.2 Sealed)
   */
  applySoftCap(units: number, cap: number = 100): number {
    if (units <= cap) return units;
    // Soft-log curve for extreme volume
    return cap + (cap * Math.log10(1 + (units - cap) / cap));
  },

  /**
   * Community Whale Clamp
   * No single user can represent more than 15% of community contribution.
   * INVARIANT: WHALE_CEILING <= 0.15
   */
  applyWhaleClamp(userUnits: number, communityTotal: number): number {
    if (communityTotal <= 0) return 0;
    const maxAllowed = communityTotal * 0.15;
    return Math.min(userUnits, maxAllowed);
  }
};
