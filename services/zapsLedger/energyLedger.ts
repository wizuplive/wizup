
import { EnergyAction, EnergyIntent } from "./types";
import { dataService } from "../dataService";
import { recognitionLedger } from "./recognitionLedger";

/**
 * ⚡ ENERGY LEDGER SERVICE
 * ========================
 * Purpose: Immediate participation energy.
 * Rule: Community-scoped, consumable, no authority.
 */

export const energyLedger = {
  
  async executeAction(action: Omit<EnergyAction, 'id' | 'timestamp'>) {
    const user = dataService.getCurrentUser();
    if (!user || user.id !== action.userId) throw new Error("Auth context mismatch");

    const entry: EnergyAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    // 1. Numeric Ledger Mutation (Immediate)
    if (entry.type === 'SPEND') {
      if (user.walletBalance < entry.amount) throw new Error("Insufficient Energy");
      user.walletBalance -= entry.amount;
    } else {
      user.walletBalance += entry.amount;
    }

    // 2. Persist State
    await dataService.setUser(user);
    this.saveToHistory(entry);

    // 3. Emit Signal to Recognition Ledger (One-way flow)
    this.bridgeToRecognition(entry);

    console.log(`%c[ENERGY] ${entry.intent} processed: ${entry.amount} ZAPS`, "color: #fbbf24; font-weight: bold;");
    return entry;
  },

  bridgeToRecognition(action: EnergyAction) {
    const categoryMap: Record<EnergyIntent, any> = {
      'TIP': 'GENEROSITY',
      'UNLOCK': 'CONSISTENCY',
      'PERK': 'CONSISTENCY',
      'J2E_REWARD': 'CONSISTENCY'
    };

    recognitionLedger.recordSignal({
      userId: action.userId,
      communityId: action.communityId,
      category: categoryMap[action.intent] || 'CONSISTENCY',
      energyMass: action.amount,
      metadata: { sourceActionId: action.id }
    });
  },

  saveToHistory(action: EnergyAction) {
    const key = `wizup:energy:history:${action.userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.unshift(action);
    if (history.length > 100) history.pop();
    localStorage.setItem(key, JSON.stringify(history));
  }
};
