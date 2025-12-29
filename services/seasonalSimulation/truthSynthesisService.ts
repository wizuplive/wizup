
import { GoogleGenAI, Type } from "@google/genai";
import { TruthSynthesisReport, SynthesisConfidence } from "../../types/truthSynthesisTypes";
import { experimentExecutionService } from "./experimentExecutionService";
import { experimentAuditService } from "./experimentAuditService";
import { driftLogService } from "../driftLogService";

const SYNTHESIS_STORAGE_KEY = "wizup_truth_synthesis_v7";

/**
 * 🤖 SEASON 7 — TRUTH SYNTHESIS SERVICE
 * =====================================
 * Aggregates reality. Describes observations. Defers value.
 */

export const truthSynthesisService = {
  
  /**
   * Synthesize data from a completed or aborted experiment.
   */
  async synthesize(experimentId: string): Promise<TruthSynthesisReport | null> {
    // 1. Gather Inputs (Season 6 Audit Logs + Execution State)
    const auditLogs = experimentAuditService.getEvents(experimentId);
    const executionLedger = experimentExecutionService.getFEULedger();
    const feu = executionLedger.find(f => f.experimentId === experimentId);

    if (!feu || auditLogs.length === 0) {
      console.error(`[SYNTHESIZER] Incomplete data for experiment ${experimentId}`);
      return null;
    }

    // 2. Build Analysis Context
    const context = {
      experimentId,
      parameters: feu.parametersApplied,
      auditEventsCount: auditLogs.length,
      averageDeviation: auditLogs.reduce((acc, log) => acc + log.deviationMagnitude, 0) / auditLogs.length,
      maxDeviation: Math.max(...auditLogs.map(l => l.deviationMagnitude)),
      riskFlags: Array.from(new Set(auditLogs.flatMap(l => l.riskFlags))),
      cohortId: feu.cohortId
    };

    // 3. Machine Understanding (Gemini 3 Pro)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are a Protocol Reality Synthesizer for WIZUP. 
      Analyze this experimental data and produce a Truth Synthesis Report.
      
      Experimental Context: ${JSON.stringify(context)}
      Sample Audit Logs: ${JSON.stringify(auditLogs.slice(0, 10))}

      STRICT LANGUAGE CONTRACT:
      - Use neutral, descriptive terms: "Observed", "Correlated with", "Appears stable".
      - FORBIDDEN words: "Should", "Recommend", "Better", "Optimal", "Successful", "Green-light".
      - Describe tradeoffs without prioritizing them.
      - Classify confidence as: CLEARLY STABLE, CONDITIONALLY STABLE, AMBIGUOUS, or UNSTABLE.

      Required dimensions to synthesize:
      - Stability: System calm, oscillation, feedback loops.
      - Fairness: Disproportionate advantage, unintentional anchors, penalty skew.
      - Governance Integrity: Authority concentration, participation breadth, capture signs.
      - Human Comfort: "Feels off", hesitation signals.
      - Uncertainty: What could not be measured, scale risks.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cohortSummary: { type: Type.STRING },
              deltasObserved: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    parameter: { type: Type.STRING },
                    intendedDelta: { type: Type.NUMBER },
                    actualVarianceObserved: { type: Type.NUMBER }
                  },
                  required: ["parameter", "intendedDelta", "actualVarianceObserved"]
                }
              },
              stabilityAssessment: { type: Type.STRING },
              fairnessAssessment: { type: Type.STRING },
              governanceImpact: { type: Type.STRING },
              humanComfortSignals: { type: Type.STRING },
              unintendedEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
              confidenceLevel: { type: Type.STRING, enum: ["CLEARLY STABLE", "CONDITIONALLY STABLE", "AMBIGUOUS", "UNSTABLE"] },
              uncertaintyNotes: { type: Type.STRING },
              reproductionRisk: { type: Type.STRING },
              agentObservations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: [
              "cohortSummary", "deltasObserved", "stabilityAssessment", 
              "fairnessAssessment", "governanceImpact", "humanComfortSignals",
              "confidenceLevel", "uncertaintyNotes", "reproductionRisk", "agentObservations"
            ]
          }
        },
        contents: prompt
      });

      const result = JSON.parse(response.text || "{}");
      
      const report: TruthSynthesisReport = {
        id: `truth_s7_${Date.now()}_${experimentId}`,
        experimentId,
        generatedAt: Date.now(),
        protocolVersion: "7.0-SYNTHESIS",
        ...result
      };

      this.saveReport(report);
      console.log(`%c[SYNTHESIZER] Truth Synthesis Complete for ${experimentId}: ${report.confidenceLevel}`, "color: #3b82f6; font-weight: bold;");
      return report;

    } catch (error) {
      console.error("[SYNTHESIZER] Synthesis cycle failed", error);
      return null;
    }
  },

  saveReport(report: TruthSynthesisReport) {
    const existing = this.getReports();
    existing.push(report);
    localStorage.setItem(SYNTHESIS_STORAGE_KEY, JSON.stringify(existing));
  },

  getReports(): TruthSynthesisReport[] {
    try {
      const raw = localStorage.getItem(SYNTHESIS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getReportForExperiment(experimentId: string): TruthSynthesisReport | undefined {
    return this.getReports().find(r => r.experimentId === experimentId);
  }
};
