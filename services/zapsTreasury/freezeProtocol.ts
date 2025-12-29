import { FreezeRecord, FreezeTriggerSource } from "./freezeTypes";
import { treasuryStore } from "./treasuryStore";
import { featureFlags } from "../../config/featureFlags";
import { driftLogService } from "../driftLogService";

const FREEZE_LEDGER_KEY = 'wizup:treasury:freeze_ledger:v1';
const MIN_FREEZE_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days

export const freezeProtocol = {
  
  async initiateFreeze(communityId: string, source: FreezeTriggerSource, reason: string): Promise<boolean> {
    if (!featureFlags.ZAPS_TREASURY_FREEZE_V1) return false;

    const summary = treasuryStore.getSummary(communityId);
    if (summary.isFrozen) return true; // Already frozen

    const record: FreezeRecord = {
      id: crypto.randomUUID(),
      communityId,
      source,
      reason,
      timestamp: Date.now(),
      treasurySnapshot: {
        balance: summary.balance,
        totalDistributed: summary.totalDistributed
      }
    };

    // 1. Mutate Treasury State
    summary.isFrozen = true;
    treasuryStore.saveSummary(summary);

    // 2. Persist Audit Record
    this.saveToLedger(record);

    console.warn(`%c[FREEZE] Treasury Locked in ${communityId}. Source: ${source}. Reason: ${reason}`, "color: #ef4444; font-weight: bold;");
    return true;
  },

  async requestUnfreeze(communityId: string, notes: string): Promise<{ success: boolean; error?: string }> {
    const summary = treasuryStore.getSummary(communityId);
    const ledger = this.getLedger(communityId);
    const activeFreeze = ledger.find(l => !l.unfrozenAt);

    if (!summary.isFrozen || !activeFreeze) return { success: false, error: "Treasury is not frozen." };

    // 1. Enforce Cooldown
    const elapsed = Date.now() - activeFreeze.timestamp;
    if (elapsed < MIN_FREEZE_DURATION_MS) {
      const remaining = Math.ceil((MIN_FREEZE_DURATION_MS - elapsed) / (1000 * 60 * 60 * 24));
      return { success: false, error: `Minimum cooldown active. Remaining: ${remaining} days.` };
    }

    // 2. Recovery Checklist (Institutional Logic)
    if (notes.length < 20) {
      return { success: false, error: "Recovery requires detailed resolution notes." };
    }

    // 3. Finalize
    summary.isFrozen = false;
    activeFreeze.unfrozenAt = Date.now();
    activeFreeze.resolutionNotes = notes;

    treasuryStore.saveSummary(summary);
    this.updateLedger(activeFreeze);

    console.log(`%c[FREEZE] Treasury Restored in ${communityId}. Recovery: ${notes}`, "color: #22c55e; font-weight: bold;");
    return { success: true };
  },

  getLedger(communityId?: string): FreezeRecord[] {
    try {
      const all: FreezeRecord[] = JSON.parse(localStorage.getItem(FREEZE_LEDGER_KEY) || '[]');
      return communityId ? all.filter(r => r.communityId === communityId) : all;
    } catch { return []; }
  },

  saveToLedger(record: FreezeRecord) {
    const all = this.getLedger();
    all.unshift(record);
    localStorage.setItem(FREEZE_LEDGER_KEY, JSON.stringify(all));
  },

  updateLedger(record: FreezeRecord) {
    const all = this.getLedger();
    const idx = all.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      all[idx] = record;
      localStorage.setItem(FREEZE_LEDGER_KEY, JSON.stringify(all));
    }
  }
};