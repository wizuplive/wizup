import { GoogleGenAI, Type } from "@google/genai";
import { ExperimentCandidate, ExperimentLane, RiskClass, CandidateStatus } from "../../types/experimentCandidateTypes";
import { parameterAnalysisService } from "./parameterAnalysisService";
import { seasonStateService } from "./seasonStateService";

const CANDIDATES_KEY = "wizup_experiment_candidates_v5";
const COOLDOWN_KEY = "wizup_candidate_cooldowns_v5";

/**
 * 🎯 SEASON 5 — CANDIDATE SELECTION SERVICE
 * =========================================
 * Funnels Agent Observations into Human-signed Experiments.
 * 
 * INVARIANTS:
 * 1. Clustering: Groups related S4 proposals.
 * 2. Neutrality: No persuasive language allowed.
 * 3. Scope: Limited to Safe Lanes (Weights/Thresholds/Decay).
 */

export const candidateSelectionService = {

  async generateCandidatesFromProposals(): Promise<ExperimentCandidate[]> {
    const proposals = parameterAnalysisService.getProposals();
    const state = seasonStateService.get();

    // 1. Guard: Check Cooldowns & Rate Limits
    if (!this.canGenerate(state.activeSeasonId)) {
      console.warn("[AGENT] Candidate generation rate limited or on cooldown.");
      return [];
    }

    // 2. Machine Synthesis (Gemini 3 Pro)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      You are a Protocol Analyst summarizing Season 4 observations into Season 5 Experiment Candidates.
      
      Observations to cluster: ${JSON.stringify(proposals)}
      
      Requirements:
      - Neutral, documentary tone.
      - Use phrases like "Signals suggest...", "Observation indicates...".
      - FORBIDDEN: "must", "critical", "guaranteed", "unlock", "maximize", "best".
      - Lanes allowed: WEIGHT_TWEAK, THRESHOLD_NUDGE, DECAY_TUNING, GOV_BOOST.
      - Delta must be bounded and subtle (max 15%).
      
      Structure the output as a list of ExperimentCandidate objects.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                domain: { type: Type.STRING, enum: ["reputation", "multiplier", "decay", "governance"] },
                lane: { type: Type.STRING, enum: ["WEIGHT_TWEAK", "THRESHOLD_NUDGE", "DECAY_TUNING", "GOV_BOOST"] },
                title: { type: Type.STRING },
                hypothesis: { type: Type.STRING },
                proposedDelta: {
                  type: Type.OBJECT,
                  properties: {
                    parameter: { type: Type.STRING },
                    deltaPercent: { type: Type.NUMBER },
                    absoluteChange: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["parameter", "deltaPercent", "absoluteChange"]
                },
                guardrails: { type: Type.ARRAY, items: { type: Type.STRING } },
                metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                successSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                abortSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                blastRadius: { type: Type.STRING, enum: ["single community", "cohort", "global shadow"] },
                confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
                uncertaintyNotes: { type: Type.STRING },
                riskClass: { type: Type.STRING, enum: ["R0", "R1", "R2", "R3"] },
                humanDecisionPrompt: { type: Type.STRING },
                trace: {
                  type: Type.OBJECT,
                  properties: {
                    proposalIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              required: ["domain", "lane", "title", "hypothesis", "proposedDelta", "riskClass"]
            }
          }
        },
        contents: prompt
      });

      const results = JSON.parse(response.text || "[]");
      const candidates: ExperimentCandidate[] = results.map((r: any) => ({
        ...r,
        id: `cand_v5_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
        seasonObservedRange: state.activeSeasonId,
        status: 'DRAFT'
      }));

      this.saveCandidates(candidates);
      return candidates;

    } catch (error) {
      console.error("[AGENT] Candidate synthesis failed", error);
      return [];
    }
  },

  canGenerate(seasonId: string): boolean {
    const candidates = this.getCandidates();
    const domainCounts: Record<string, number> = {};
    
    candidates.forEach(c => {
      if (c.seasonObservedRange === seasonId) {
        domainCounts[c.domain] = (domainCounts[c.domain] || 0) + 1;
      }
    });

    // Max 3 candidates per domain per season
    const tooManyGlobal = Object.values(domainCounts).some(v => v >= 3);
    if (tooManyGlobal) return false;

    // Cooldown check
    const cooldowns = JSON.parse(localStorage.getItem(COOLDOWN_KEY) || '{}');
    const now = Date.now();
    for (const domain in cooldowns) {
      if (now < cooldowns[domain]) return false;
    }

    return true;
  },

  getCandidates(): ExperimentCandidate[] {
    try {
      const raw = localStorage.getItem(CANDIDATES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCandidates(newOnes: ExperimentCandidate[]) {
    const existing = this.getCandidates();
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify([...existing, ...newOnes]));
  },

  // Added missing CandidateStatus type to fix compilation error
  updateCandidateStatus(id: string, status: CandidateStatus, rejectionIncrement = false) {
    const all = this.getCandidates();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return;

    all[idx].status = status;
    if (rejectionIncrement) {
      all[idx].rejectionCount = (all[idx].rejectionCount || 0) + 1;
      
      // Spam Guard: 2x rejection -> 14 day cooldown
      if (all[idx].rejectionCount! >= 2) {
        const cooldowns = JSON.parse(localStorage.getItem(COOLDOWN_KEY) || '{}');
        cooldowns[all[idx].domain] = Date.now() + (14 * 24 * 60 * 60 * 1000);
        localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
      }
    }

    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(all));
  }
};