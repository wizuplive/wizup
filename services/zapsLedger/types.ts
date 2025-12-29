/**
 * ⚡ ZAPS DUAL-LEDGER CANON
 * =========================
 * Implementation of Energy vs Recognition asymmetry.
 */

export type EnergyIntent = 'TIP' | 'UNLOCK' | 'PERK' | 'J2E_REWARD';

export interface EnergyAction {
  id: string;
  userId: string;
  communityId: string;
  type: 'SPEND' | 'RECEIVE';
  intent: EnergyIntent;
  amount: number;
  counterpartyId?: string;
  timestamp: number;
}

export type RecognitionCategory = 'GENEROSITY' | 'CONSISTENCY' | 'STEWARDSHIP' | 'CIVIC';

export interface RecognitionSignal {
  id: string;
  userId: string;
  communityId: string;
  category: RecognitionCategory;
  energyMass: number; // The amount of energy that triggered this signal
  timestamp: number;
  metadata: Record<string, any>;
}

export interface RecognitionArtifact {
  userId: string;
  communityId: string;
  seasonId: string;
  units: number; // Normalized, capped legitimacy units
  rank: number;
  percentile: number;
  sealedAt: number;
  isNoop?: boolean; // 🔒 NOOP Invariant for gate-blocked results
}