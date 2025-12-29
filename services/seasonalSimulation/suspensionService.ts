
import { CanonSuspension, SuspensionScope } from "../../types/suspensionTypes";
import { driftLogService } from "../driftLogService";

const SUSPENSION_KEY = "wizup_canon_suspensions_v9";
const DEFAULT_DURATION = 72 * 60 * 60 * 1000; // 72 Hours

/**
 * 🛡️ EMERGENCY SUSPENSION SERVICE
 * ================================
 * "Law must be enforceable — but survivable."
 * 
 * INVARIANTS:
 * 1. Dual-Key: Requires two distinct authority signatures.
 * 2. Scoped: GLOBAL, COMMUNITY, or SIGNAL_CLASS only.
 * 3. Time-Bound: Hard expiry at 72 hours.
 */

export const suspensionService = {

  async initiate(args: {
    parameterKey: string;
    canonId: string;
    scope: SuspensionScope;
    reason: string;
    systemAuth: string;
    institutionalAuth: string;
  }): Promise<CanonSuspension> {
    
    // Invariant: Dual-Key Check
    if (!args.systemAuth || !args.institutionalAuth || args.systemAuth === args.institutionalAuth) {
      throw new Error("Suspension Denied: Requires two independent authority signatures.");
    }

    const now = Date.now();
    const suspension: CanonSuspension = {
      suspensionId: `susp_${now}_${args.parameterKey}`,
      canonId: args.canonId,
      parameterKey: args.parameterKey,
      scope: args.scope,
      reason: args.reason,
      initiatedBy: {
        systemAuthority: args.systemAuth,
        institutionalAuthority: args.institutionalAuth
      },
      initiatedAt: now,
      maxDurationMs: DEFAULT_DURATION,
      reviewDeadline: now + DEFAULT_DURATION,
      status: "ACTIVE"
    };

    const all = this.getLedger();
    all.push(suspension);
    this.saveLedger(all);

    console.warn(`%c[EMERGENCY] CANON SUSPENDED: ${args.parameterKey}. Scope: ${JSON.stringify(args.scope)}`, "color: #ef4444; font-weight: bold;");
    
    return suspension;
  },

  getActive(key: string, communityId?: string, signalType?: string): CanonSuspension | undefined {
    const now = Date.now();
    const all = this.getLedger();

    return all.find(s => {
      if (s.status !== "ACTIVE" || now > s.reviewDeadline) return false;
      if (s.parameterKey !== key) return false;

      // Scope Matching
      if (s.scope.type === "GLOBAL") return true;
      if (s.scope.type === "COMMUNITY" && s.scope.communityId === communityId) return true;
      if (s.scope.type === "SIGNAL_CLASS" && s.scope.signalClass === signalType) return true;

      return false;
    });
  },

  getLedger(): CanonSuspension[] {
    try {
      const raw = localStorage.getItem(SUSPENSION_KEY);
      const data: CanonSuspension[] = raw ? JSON.parse(raw) : [];
      
      // Auto-expire check
      const now = Date.now();
      let changed = false;
      data.forEach(s => {
        if (s.status === "ACTIVE" && now > s.reviewDeadline) {
          s.status = "EXPIRED";
          changed = true;
          console.error(`%c[SYSTEM] Suspension Expired: ${s.suspensionId}. Review required.`, "color: #ef4444;");
        }
      });
      
      if (changed) this.saveLedger(data);
      return data;
    } catch {
      return [];
    }
  },

  saveLedger(ledger: CanonSuspension[]) {
    localStorage.setItem(SUSPENSION_KEY, JSON.stringify(ledger));
  }
};
