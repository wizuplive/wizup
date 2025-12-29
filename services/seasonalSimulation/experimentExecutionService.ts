
import { FlaggedExecutionUnit, ExecutionStatus } from "../../types/executionProtocolTypes";
import { experimentRegistryService } from "./experimentRegistryService";
import { cohortService } from "./cohortService";

const FEU_STORAGE_KEY = "wizup_experiment_executions_v6";

/**
 * ⚙️ EXPERIMENT EXECUTION ENGINE (FEU)
 * ====================================
 * "Humans execute. Agents observe. Systems obey."
 * 
 * INVARIANTS:
 * 1. Max 2 concurrent experiments platform-wide.
 * 2. Max 1 experiment per domain.
 * 3. Fail-Open: Any error leads to original parameter usage.
 */

export const experimentExecutionService = {

  async scheduleExecution(feu: Omit<FlaggedExecutionUnit, 'status'>): Promise<FlaggedExecutionUnit> {
    const active = this.getActiveFEUs();
    
    // Invariant 1: Concurrent Limit
    if (active.length >= 2) {
      throw new Error("Execution Denied: Concurrent experiment limit reached (Max 2).");
    }

    // Invariant 2: Domain Isolation
    if (active.some(a => a.domain === feu.domain)) {
      throw new Error(`Execution Denied: Experiment already running in domain ${feu.domain}.`);
    }

    const newFEU: FlaggedExecutionUnit = {
      ...feu,
      status: "SCHEDULED"
    };

    const all = this.getFEULedger();
    all.push(newFEU);
    this.saveLedger(all);
    return newFEU;
  },

  async start(id: string) {
    const all = this.getFEULedger();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return;

    all[idx].status = "RUNNING";
    all[idx].metadata.executedAt = Date.now();
    this.saveLedger(all);
    console.log(`%c[SYSTEM] FEU Activated: ${id}. Parameters touching reality.`, "color: #22c55e; font-weight: bold;");
  },

  async rollback(id: string, key: string) {
    const all = this.getFEULedger();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return;

    if (all[idx].rollbackKey !== key) {
      throw new Error("Invalid Rollback Key.");
    }

    all[idx].status = "ROLLED_BACK";
    all[idx].metadata.abortedAt = Date.now();
    all[idx].metadata.reasonForAbort = "Manual Council Rollback";
    this.saveLedger(all);
    console.log(`%c[SYSTEM] EMERGENCY ROLLBACK: FEU ${id} terminated. Parameters restored.`, "color: #ef4444; font-weight: bold;");
  },

  /**
   * Resolve effective weight for a system action.
   * If user is in an active FEU cohort, returns the experimental value.
   */
  async getEffectiveParameter(userId: string, communityId: string, path: string, canonicalValue: number): Promise<number> {
    const active = this.getActiveFEUs();
    if (active.length === 0) return canonicalValue;

    for (const feu of active) {
      if (feu.parametersApplied.targetPath === path) {
        const cohorts = cohortService.listCohorts();
        const cohort = cohorts.find(c => c.id === feu.cohortId);
        if (cohort && await cohortService.isUserInCohort(userId, communityId, cohort)) {
          return feu.parametersApplied.deltaValue;
        }
      }
    }

    return canonicalValue;
  },

  getActiveFEUs(): FlaggedExecutionUnit[] {
    return this.getFEULedger().filter(f => f.status === "RUNNING");
  },

  getFEULedger(): FlaggedExecutionUnit[] {
    try {
      const raw = localStorage.getItem(FEU_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveLedger(ledger: FlaggedExecutionUnit[]) {
    localStorage.setItem(FEU_STORAGE_KEY, JSON.stringify(ledger));
  }
};
