
import { CanonParameter } from "../../types/canonTypes";

const CANON_STORAGE_KEY = "wizup_canon_ledger_v8";

/**
 * 🏛️ CANON REGISTRY SERVICE
 * ==========================
 * "Nothing becomes law without a memory of how it earned legitimacy."
 * 
 * INVARIANTS:
 * 1. Immutable: Records are never deleted or edited.
 * 2. Deterministic: Runtime lookup returns the latest successor.
 * 3. Transparent: Every entry links to its predecessor.
 */

export const canonRegistryService = {

  saveEntry(entry: CanonParameter) {
    const ledger = this.getLedger();
    
    // Invariant: No overwrites
    if (ledger.some(e => e.canonId === entry.canonId)) {
      throw new Error(`Canon Violation: Entry ${entry.canonId} already exists.`);
    }

    ledger.push(entry);
    localStorage.setItem(CANON_STORAGE_KEY, JSON.stringify(ledger));
    
    console.log(`%c[CANON] Constitutional Rule Encoded: ${entry.parameterKey}`, "color: #22c55e; font-weight: bold;");
  },

  /**
   * Primary Engine Accessor. 
   * Returns the "Active Law" for a parameter key.
   */
  getActiveParameter(key: string): CanonParameter | undefined {
    const ledger = this.getLedger();
    const matches = ledger.filter(e => e.parameterKey === key);
    
    if (matches.length === 0) return undefined;

    // Return the latest one (the one that nothing else supersedes)
    return matches.sort((a, b) => b.effectiveDate - a.effectiveDate)[0];
  },

  getLedger(): CanonParameter[] {
    try {
      const raw = localStorage.getItem(CANON_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getLineage(key: string): CanonParameter[] {
    return this.getLedger()
      .filter(e => e.parameterKey === key)
      .sort((a, b) => a.effectiveDate - b.effectiveDate);
  }
};
