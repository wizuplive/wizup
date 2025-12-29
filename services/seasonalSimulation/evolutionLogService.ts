
/**
 * 📜 EVOLUTION LOG SERVICE
 * =========================
 * Internal audit trail for parameter adjustments.
 */

export interface EvolutionEntry {
  id: string;
  seasonId: string;
  domain: 'REPUTATION' | 'ZAPS' | 'GOVERNANCE';
  parameter: string;
  previousValue: any;
  newValue: any;
  rationale: string;
  impactScope: string;
  timestamp: number;
}

const STORAGE_KEY = 'wizup_evolution_ledger_v1';

export const evolutionLogService = {
  logChange(entry: Omit<EvolutionEntry, 'id' | 'timestamp'>) {
    const logs: EvolutionEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newEntry: EvolutionEntry = {
      ...entry,
      id: `ev_${Date.now()}_${entry.domain}`,
      timestamp: Date.now()
    };
    logs.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    console.log(`%c[EVOLUTION] Parameter Shift Logged: ${entry.parameter}`, "color: #8b5cf6; font-weight: bold;");
  },

  getHistory(seasonId?: string): EvolutionEntry[] {
    const logs: EvolutionEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (seasonId) return logs.filter(l => l.seasonId === seasonId);
    return logs;
  }
};

// Seed Season 2 Initial Evolution Log
if (!localStorage.getItem(STORAGE_KEY)) {
  evolutionLogService.logChange({
    seasonId: 'SEASON_2',
    domain: 'REPUTATION',
    parameter: 'repWeights.CONTRIBUTION',
    previousValue: 15,
    newValue: 14,
    rationale: 'Observed high-volume comment skew in S1. Dampening slightly to favor stewardship signals.',
    impactScope: 'Affects T2+ users emitting high comment volume.'
  });
  evolutionLogService.logChange({
    seasonId: 'SEASON_2',
    domain: 'GOVERNANCE',
    parameter: 'govDecayDays',
    previousValue: 14,
    newValue: 21,
    rationale: 'Gentler slope for returning members based on community feedback regarding strictness of recency weighting.',
    impactScope: 'Reduces weight decay speed for semi-active stewards.'
  });
}
