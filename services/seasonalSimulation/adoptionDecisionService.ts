
import { CouncilAdoptionRecord, AdoptionVerdict } from "../../types/truthSynthesisTypes";
import { truthSynthesisService } from "./truthSynthesisService";
import { driftLogService } from "../driftLogService";

const DECISION_STORAGE_KEY = "wizup_adoption_decisions_v7";

/**
 * ⚖️ SEASON 7 — COUNCIL ADOPTION SERVICE
 * =====================================
 * The Human decision authority.
 * Decision becomes Law only after verification of legitimacy requirements.
 */

export const adoptionDecisionService = {

  async recordVerdict(args: {
    experimentId: string,
    verdict: AdoptionVerdict,
    justification: string,
    moralTradeoffs: string,
    uncertaintyAcknowledgment: string,
    councilSignatories: string[]
  }): Promise<CouncilAdoptionRecord> {
    
    // 1. Verify Synthesis exists
    const report = truthSynthesisService.getReportForExperiment(args.experimentId);
    if (!report) {
      throw new Error(`Verdict Refused: No Truth Synthesis Report found for experiment ${args.experimentId}`);
    }

    // 2. Enforce Legitimacy Constraints (Spec 7)
    if (args.councilSignatories.length < 3) {
      throw new Error("Verdict Refused: Council Quorum not met (Minimum 3 signatories).");
    }

    if (args.justification.length < 50) {
      throw new Error("Verdict Refused: Written justification too brief. Reasoning is mandatory.");
    }

    // 3. Construct Record
    const record: CouncilAdoptionRecord = {
      id: `dec_s7_${Date.now()}_${args.experimentId}`,
      reportId: report.id,
      experimentId: args.experimentId,
      verdict: args.verdict,
      justification: args.justification,
      moralTradeoffs: args.moralTradeoffs,
      uncertaintyAcknowledgment: args.uncertaintyAcknowledgment,
      councilSignatories: args.councilSignatories,
      quorumMet: true,
      sealedAt: Date.now(),
      metadata: {
        sourceHash: driftLogService.hash(report)
      }
    };

    // 4. Persist (Immutable record of Human Intent)
    const all = this.getDecisions();
    all.push(record);
    localStorage.setItem(DECISION_STORAGE_KEY, JSON.stringify(all));

    console.log(`%c[AUTHORITY] Decision Sealed for ${args.experimentId}: ${args.verdict}`, "color: #22c55e; font-weight: bold;");

    // 5. If ADOPT, proceed to adoption protocol (Season 3 style)
    if (args.verdict === 'ADOPT') {
      console.log(`%c[AUTHORITY] Parameter promoting to Adoption Review Protocol...`, "color: #8b5cf6;");
    }

    return record;
  },

  getDecisions(): CouncilAdoptionRecord[] {
    try {
      const raw = localStorage.getItem(DECISION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};
