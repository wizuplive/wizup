import { Season1ViolationArtifact } from "../../season1Verification/types/violationTypes";
import { Season2ViolationArtifact } from "../../../services/season2Activation/types";

export const violationsSource = {
  async listAll(seasonId: string): Promise<any[]> {
    const s1IndexKey = "wizup:season1:violations:index:v1";
    const s2IndexKey = "wizup:season2:violations:index:v1";
    
    const results: any[] = [];
    
    const s1Raw = localStorage.getItem(s1IndexKey);
    if (s1Raw) {
      const keys: string[] = JSON.parse(s1Raw);
      keys.forEach(k => {
        const v = localStorage.getItem(k);
        if (v) {
          const parsed = JSON.parse(v);
          if (parsed.seasonId === seasonId) results.push(parsed);
        }
      });
    }

    const s2Raw = localStorage.getItem(s2IndexKey);
    if (s2Raw) {
      const keys: string[] = JSON.parse(s2Raw);
      // S2 violations are stored with simple IDs, need to iterate the index
      keys.forEach(id => {
        const v = localStorage.getItem(`wizup:season2:violations:v1:${id}`);
        if (v) {
          const parsed = JSON.parse(v);
          if (parsed.seasonId === seasonId) results.push(parsed);
        }
      });
    }

    return results.sort((a, b) => (b.occurredAtMs || b.generatedAtMs) - (a.occurredAtMs || a.generatedAtMs));
  },

  async getSummary(seasonId: string) {
    const all = await this.listAll(seasonId);
    const totals = { INFO: 0, WARN: 0, CRITICAL: 0 };
    
    all.forEach(v => {
      // Map severity strings if they differ between versions
      const sev = v.severity || (v.verdict === 'FAIL' ? 'CRITICAL' : 'WARN');
      if (sev === 'CRITICAL' || sev === 'HIGH') totals.CRITICAL++;
      else if (sev === 'WARN' || sev === 'MEDIUM') totals.WARN++;
      else totals.INFO++;
    });

    const last = all[0];
    const lastViolation = last ? {
      id: last.id,
      code: last.code || last.failureMode,
      severity: (last.severity === 'HIGH' || last.severity === 'CRITICAL' || last.verdict === 'FAIL') ? "CRITICAL" : (last.severity === 'LOW' ? "INFO" : "WARN") as any,
      createdAtMs: last.occurredAtMs || last.generatedAtMs,
      communityId: last.communityId,
      fingerprint: last.hashes?.outputHash || last.activationHash
    } : undefined;

    return { totals, lastViolation, indexSize: all.length };
  }
};
