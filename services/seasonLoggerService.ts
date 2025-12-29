
/**
 * 🕵️ SEASON LOGGER SERVICE
 * =========================
 * Purpose: Capture internal-only telemetry for Season 0 simulation.
 * No user-facing side effects.
 */

import { AllocationEvent, ReputationDriftEvent, GovernanceInfluenceEvent, SeasonObserverNote } from "../types/simulationTypes";

const STORAGE_KEYS = {
  ALLOCATION: 'wizup_sim_allocation',
  DRIFT: 'wizup_sim_drift',
  INFLUENCE: 'wizup_sim_influence',
  NOTES: 'wizup_sim_notes'
};

export const seasonLoggerService = {
  
  logAllocation(event: AllocationEvent) {
    this.persist(STORAGE_KEYS.ALLOCATION, event);
  },

  logDrift(event: ReputationDriftEvent) {
    this.persist(STORAGE_KEYS.DRIFT, event);
  },

  logInfluence(event: GovernanceInfluenceEvent) {
    this.persist(STORAGE_KEYS.INFLUENCE, event);
  },

  logObserverNote(note: SeasonObserverNote) {
    this.persist(STORAGE_KEYS.NOTES, note);
  },

  // Removed invalid 'private' modifier
  persist(key: string, data: any) {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(data);
    localStorage.setItem(key, JSON.stringify(existing));
    
    // Architect Console Output
    console.debug(`[SEASON_0_LOG] ${key.replace('wizup_sim_', '').toUpperCase()}`, data);
  },

  getReport() {
    return {
      allocations: JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATION) || '[]') as AllocationEvent[],
      drifts: JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIFT) || '[]') as ReputationDriftEvent[],
      influence: JSON.parse(localStorage.getItem(STORAGE_KEYS.INFLUENCE) || '[]') as GovernanceInfluenceEvent[],
      notes: JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]') as SeasonObserverNote[]
    };
  },

  clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }
};