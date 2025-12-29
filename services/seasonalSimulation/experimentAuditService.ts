
import { ExperimentAuditEvent } from "../../types/experimentTypes";

const AUDIT_LOG_KEY = "wizup_experiment_audit_v2";

export const experimentAuditService = {
  
  logEvent(event: Omit<ExperimentAuditEvent, 'id' | 'timestamp'>) {
    try {
      const logs: ExperimentAuditEvent[] = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
      
      const newEvent: ExperimentAuditEvent = {
        ...event,
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: Date.now()
      };

      logs.push(newEvent);
      
      // Limit storage in demo mode for safety
      if (logs.length > 500) logs.shift();
      
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
    } catch {
      // Silent discard for storage failures
    }
  },

  getEvents(experimentId?: string): ExperimentAuditEvent[] {
    try {
      const logs: ExperimentAuditEvent[] = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
      if (experimentId) return logs.filter(l => l.experimentId === experimentId);
      return logs;
    } catch {
      return [];
    }
  }
};
