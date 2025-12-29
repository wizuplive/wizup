import { ParameterAdoptionRecord, AdoptionCandidate, AdoptionDomain } from "../../types/adoptionTypes";
import { experimentRegistryService } from "./experimentRegistryService";
import { experimentAuditService } from "./experimentAuditService";
import { councilService } from "./councilService";
import { CALIBRATION_v1_1 } from "./calibration";
import { driftLogService } from "../driftLogService";
import { seasonStateService } from "./seasonStateService";

const ADOPTION_LEDGER_KEY = "wizup_parameter_adoption_v3";

/**
 * ⚖️ SEASON 3 ADOPTION ENGINE
 * ============================
 * Implements the Canon Formation protocol.
 * 
 * INVARIANTS:
 * 1. Evidence-Locked: Requires Registry, Summary, Council Decision, and Audit Log.
 * 2. Domain-Restricted: Only Reputation, ZAPS, and Governance allowed.
 * 3. Immutable: Records cannot be revised once sealed.
 */

export const parameterAdoptionService = {

  /**
   * Step 1 & 2: Draft and Validate a Parameter Adoption
   */
  async draftAdoption(candidate: AdoptionCandidate): Promise<Omit<ParameterAdoptionRecord, 'id' | 'sealedAt'>> {
    // 1. Artifact Check (Required Evidence)
    const registry = experimentRegistryService.getRegistry();
    const exp = registry.find(e => e.experimentId === candidate.experimentId);
    const decision = councilService.getDecisions().find(d => d.experimentId === candidate.experimentId);
    const auditLogs = experimentAuditService.getEvents(candidate.experimentId);

    if (!exp) throw new Error(`Missing ExperimentRegistryEntry for ${candidate.experimentId}`);
    if (!decision || decision.verdict !== 'ACCEPT') throw new Error(`Experiment ${candidate.experimentId} lacks Council ACCEPT verdict.`);
    if (auditLogs.length === 0) throw new Error(`Audit Log incomplete for ${candidate.experimentId}`);

    // 2. Domain Scope Validation
    const allowedDomains: AdoptionDomain[] = ['reputation', 'zaps', 'governance'];
    if (!allowedDomains.includes(candidate.domain)) {
      throw new Error(`Domain ${candidate.domain} is ineligible for adoption.`);
    }

    // 3. Diff Generation & Mechanical Validation
    const before = this.getSnapshotForDomain(candidate.domain);
    const after = { ...before, ...candidate.proposedChanges };

    // 4. Invariant Protection: No new top-level keys allowed (refinement, not invention)
    const beforeKeys = Object.keys(before);
    const afterKeys = Object.keys(after);
    const hasNewKeys = afterKeys.some(k => !beforeKeys.includes(k));
    if (hasNewKeys) {
      throw new Error("Adoption Aborted: New parameters detected. Only refinement of existing canon is permitted.");
    }

    return {
      season: 3,
      sourceExperimentId: candidate.experimentId,
      parameterDomain: candidate.domain,
      before,
      after,
      justification: candidate.justification,
      councilSignoff: decision,
      metadata: {
        diffHash: driftLogService.hash({ before, after }),
        architectSignature: "SYSTEM_ARCHITECT_v3"
      }
    };
  },

  /**
   * Step 4: Final Canon Seal
   */
  async sealAdoption(record: Omit<ParameterAdoptionRecord, 'id' | 'sealedAt'>) {
    const currentState = seasonStateService.get();
    if (currentState.mode !== 'PLANNED' && currentState.activeSeasonId !== 'SEASON_2') {
       throw new Error("Adoption Prohibited: Canon formation can only occur between seasons.");
    }

    const sealedRecord: ParameterAdoptionRecord = {
      ...record,
      id: `adopt_${Date.now()}_${record.sourceExperimentId}`,
      sealedAt: Date.now()
    };

    const ledger = this.getLedger();
    ledger.push(sealedRecord);
    localStorage.setItem(ADOPTION_LEDGER_KEY, JSON.stringify(ledger));

    console.log(`%c[CANON] Parameter Adopted: ${sealedRecord.sourceExperimentId} -> S3 Law.`, "color: #22c55e; font-weight: bold;");
    
    return sealedRecord;
  },

  getLedger(): ParameterAdoptionRecord[] {
    try {
      const raw = localStorage.getItem(ADOPTION_LEDGER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Fixed: Removed invalid 'private' modifier from object literal method
  getSnapshotForDomain(domain: AdoptionDomain): any {
    switch (domain) {
      case 'reputation': return CALIBRATION_v1_1.repWeights;
      case 'governance': return { govDecayDays: CALIBRATION_v1_1.govDecayDays };
      case 'zaps': return { whaleClampPercent: CALIBRATION_v1_1.whaleClampPercent };
      default: return {};
    }
  }
};