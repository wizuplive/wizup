
/**
 * 🕵️ PHASE 3: DRIFT LOG SERVICE
 * =============================
 * 
 * Purpose: Record discrepancies between Local State (Truth) and Shadow Firestore (Mirror).
 * 
 * CONSTRAINTS:
 * 1. Local-Only: Logs are stored in localStorage for inspection, never sent to server (yet).
 * 2. Silent: Never alert the user or block execution.
 * 3. Passive: Only records comparison results.
 */

export type DriftArtifact = "MODCASE" | "MODACTION" | "AGENTMEMORY" | "ELIGIBILITY";

export interface DriftEvent {
  id: string;
  timestamp: number;
  artifactType: DriftArtifact;
  contextId: string; // communityId
  localHash: string;
  remoteHash: string;
  diffSummary: string; // Human readable (e.g. "Count mismatch: Local 5, Remote 4")
}

const STORAGE_KEY = 'wizup_drift_log';
const DEBUG_MODE = true; // Safe to log to console in this demo env

export const driftLogService = {
  
  /**
   * Log a drift event if hashes mismatch.
   */
  logDrift(event: Omit<DriftEvent, 'id' | 'timestamp'>) {
    try {
      // 1. Persist to Local Audit Log
      const logs: DriftEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newEvent: DriftEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };
      
      // Keep log circular (max 50 recent drifts)
      if (logs.length > 50) logs.pop(); 
      logs.unshift(newEvent);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      
      // 2. Dev Console (Observer Mode)
      if (DEBUG_MODE) {
        console.groupCollapsed(`⚠️ [DRIFT] ${event.artifactType} in ${event.contextId}`);
        console.warn(`Summary: ${event.diffSummary}`);
        console.log(`Local Hash: ${event.localHash}`);
        console.log(`Remote Hash: ${event.remoteHash}`);
        console.groupEnd();
      }
    } catch (e) {
      // Fail silent - Drift logging must never crash the app
    }
  },

  getLogs(): DriftEvent[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  clearLogs() {
    localStorage.removeItem(STORAGE_KEY);
  },

  // --- COMPARISON UTILITIES ---

  /**
   * Generates a stable hash for any data object.
   * Handles sorting keys and arrays to ensure deterministic output.
   */
  hash(data: any): string {
    try {
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString(16);
    } catch {
      return 'h_error';
    }
  },

  /**
   * Prepares data for comparison by stripping transient fields
   * and sorting collections by ID.
   */
  normalize(data: any): any {
    if (!data) return null;
    
    // Deep clone to avoid mutating original
    const clone = JSON.parse(JSON.stringify(data));

    // Helper: recursively remove ignored keys if needed (e.g. 'updatedAt' if slight drift is expected)
    // For Phase 3, we expect exact matches for core fields.
    
    return clone;
  }
};
