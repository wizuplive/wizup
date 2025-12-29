
/**
 * ⚖️ SEASON 8 — CANON PARAMETERS & LINEAGE
 * ========================================
 * Data types for constitutional rules and their historical trace.
 */

export interface CanonParameter {
  canonId: string;
  parameterKey: string;      // e.g., "repWeights.CONTRIBUTION"
  parameterValue: any;
  activationSeason: string;  // e.g., "SEASON_8"
  adoptedFromExperimentId: string;
  councilDecisionId: string;
  adoptionRationale: string;
  effectiveDate: number;
  supersedesCanonId: string | null; // The link forming the Lineage Graph
  metadata: {
    signature: string;       // Verification of authenticity
    genesisSeason: string;   // Where the lineage started
  };
}

export interface LineageTrace {
  key: string;
  currentValue: any;
  history: CanonParameter[];
  isLocked: boolean;
}
