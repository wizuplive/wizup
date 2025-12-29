import { ConsultationPrompt, CommunitySentimentSignal, PreferenceGradient } from "../../types/governanceV11Types";
import { zapsSignalEmitter } from "../zapsSignals/zapsSignalEmitter";

const PROMPTS_KEY = "wizup_civic_prompts_v11";
const SIGNALS_KEY = "wizup_civic_signals_v11";

/**
 * 🏛️ CIVIC AGENCY SERVICE
 * =======================
 * "Voice without volatility."
 * 
 * Rules:
 * 1. Bounded: No free-form proposals. Only Council prompts.
 * 2. Gradients: No up/down voting.
 * 3. Seasonal: Hard windows for participation.
 */

export const civicAgencyService = {

  async emitPreference(userId: string, promptId: string, preference: PreferenceGradient, optionId?: string) {
    const prompt = this.getPrompt(promptId);
    if (!prompt || prompt.status !== 'ACTIVE' || Date.now() > prompt.windowClose) {
      throw new Error("Consultation window is closed.");
    }

    const signal: CommunitySentimentSignal = {
      userId,
      promptId,
      preference,
      optionId,
      timestamp: Date.now()
    };

    // 1. Persist to internal Civic Ledger
    const signals = this.getSignalsForPrompt(promptId);
    const existingIdx = signals.findIndex(s => s.userId === userId);
    if (existingIdx >= 0) signals[existingIdx] = signal;
    else signals.push(signal);
    
    this.saveSignals(promptId, signals);

    // 2. Emit ZAPS signal for reputation accrual (Stewardship)
    // fix: Added missing 'source' property to satisfy ZapsSignalEvent type
    zapsSignalEmitter.emit({
      communityId: prompt.communityId,
      actorUserId: userId,
      type: "GOVERNANCE_VOTE", // Map to existing signal for weight sim
      targetType: "PROPOSAL",
      targetId: promptId,
      source: 'GOVERNANCE',
      meta: { preference, optionId, protocol: "S11-Consultation" }
    });

    console.log(`%c[CIVIC] Preference Endorsed: ${preference} on ${promptId}`, "color: #06b6d4;");
  },

  getPrompt(id: string): ConsultationPrompt | undefined {
    return this.listPrompts().find(p => p.id === id);
  },

  listPrompts(): ConsultationPrompt[] {
    try {
      return JSON.parse(localStorage.getItem(PROMPTS_KEY) || "[]");
    } catch { return []; }
  },

  getSignalsForPrompt(promptId: string): CommunitySentimentSignal[] {
    try {
      const all = JSON.parse(localStorage.getItem(`${SIGNALS_KEY}_${promptId}`) || "[]");
      return all;
    } catch { return []; }
  },

  saveSignals(promptId: string, signals: CommunitySentimentSignal[]) {
    localStorage.setItem(`${SIGNALS_KEY}_${promptId}`, JSON.stringify(signals));
  },

  registerPrompt(prompt: ConsultationPrompt) {
    const all = this.listPrompts();
    all.push(prompt);
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(all));
  }
};