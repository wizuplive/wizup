import { ZapsSignalEvent } from "../types/zapsSignals.types";

const LOG_STORAGE_KEY = 'wizup_zaps_signals_v1';
const MAX_LOG_SIZE = 10000;

export const zapsSignalLog = {
  append(event: ZapsSignalEvent): void {
    try {
      const raw = localStorage.getItem(LOG_STORAGE_KEY);
      const logs: ZapsSignalEvent[] = raw ? JSON.parse(raw) : [];
      
      logs.push(event);
      
      // Enforce max size cap (FIFO)
      if (logs.length > MAX_LOG_SIZE) {
        logs.shift();
      }
      
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      // Fail silently
    }
  },

  // No public read methods exposed yet as per spec
};
