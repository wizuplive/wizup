import { TreasuryRulesetConfig, TreasuryActionType } from "./types";
import { SpendIntentCategory } from "../zapsSpend/types";

/**
 * 🔒 TREASURY RULESET v1 — FROZEN CONFIGURATION
 * ============================================
 * Authority: System Architect
 */
export const TREASURY_RULESET_V1: TreasuryRulesetConfig = {
  version: "v1",
  maxSpendCapPercent: 0.15,      // No single spend > 15% of balance
  minStewardQuorum: 2,          // Requires at least 2 stewards for significant/structural
  velocityWindowMs: 3600000,    // 1 Hour
  maxVelocityPercent: 0.40,     // Max 40% outflow per hour
  proposalExpiryMs: 86400000 * 3 // 3 Days
};

export const ALLOWED_FUNDING_SOURCES: TreasuryActionType[] = [
  'FUNDING_SEASONAL',
  'FUNDING_CONTRIBUTION',
  'FUNDING_J2E'
];

export const ALLOWED_SPEND_INTENTS: SpendIntentCategory[] = [
  'ACCESS',
  'PERK',
  'CONTRIBUTION',
  'COMMITMENT'
];

export const treasuryRuleset = {
  isValidFunding(type: TreasuryActionType): boolean {
    return ALLOWED_FUNDING_SOURCES.includes(type);
  },

  isValidSpend(category: SpendIntentCategory): boolean {
    return ALLOWED_SPEND_INTENTS.includes(category);
  },

  /**
   * Enforces structural safety rails.
   * Fails quietly (returns false) if any constraint is violated.
   */
  passesSafetyRails(
    amount: number, 
    currentBalance: number, 
    recentOutflow: number
  ): boolean {
    // 1. Per-spend cap
    if (amount > currentBalance * TREASURY_RULESET_V1.maxSpendCapPercent) {
      return false;
    }

    // 2. Velocity limit
    if ((recentOutflow + amount) > currentBalance * TREASURY_RULESET_V1.maxVelocityPercent) {
      return false;
    }

    // 3. Absolute minimum floor (Invariant: Never allow negative)
    if (currentBalance - amount < 0) {
      return false;
    }

    return true;
  }
};