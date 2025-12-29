
import { RecognitionSignal } from "./types";

const SIGNAL_KEY_PREFIX = 'wizup:recognition:signals:';

/**
 * 🏅 RECOGNITION LEDGER SERVICE
 * =============================
 * Purpose: Delayed legitimacy recording.
 * Rule: Non-interactive, non-spendable, system-resolved.
 */

export const recognitionLedger = {
  
  recordSignal(signal: Omit<RecognitionSignal, 'id' | 'timestamp'>) {
    const entry: RecognitionSignal = {
      ...signal,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    const key = `${SIGNAL_KEY_PREFIX}${entry.communityId}`;
    const signals = JSON.parse(localStorage.getItem(key) || '[]');
    signals.push(entry);
    localStorage.setItem(key, JSON.stringify(signals));
    
    // Architect Note: This happens silently. No UI toast for recognition recording.
    console.log(`%c[RECOGNITION] Signal Recorded: ${entry.category} from ${entry.userId}`, "color: #8b5cf6;");
  },

  getSignals(communityId: string, window: { start: number, end: number }): RecognitionSignal[] {
    const key = `${SIGNAL_KEY_PREFIX}${communityId}`;
    const all = JSON.parse(localStorage.getItem(key) || '[]');
    return all.filter((s: RecognitionSignal) => s.timestamp >= window.start && s.timestamp <= window.end);
  }
};
