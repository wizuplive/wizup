
export type SystemPulseState = 'NOMINAL' | 'ELEVATED' | 'CALIBRATING' | 'PAUSED' | 'OFFLINE';

export type AgentIntent = 'HOLD' | 'WATCH' | 'PASS' | 'UNKNOWN';

export interface SimulationResult {
  id: string;
  contentSnippet: string;
  humanAction: 'APPROVED' | 'HELD' | 'RESTORED';
  agentHypothesis: AgentIntent;
  alignment: 'ALIGNED' | 'DIVERGED';
  timestamp: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  actor: 'HUMAN_ADMIN' | 'SOVEREIGN_AGENT' | 'AI_MOD'; // AI_MOD = Assist/Autopilot, SOVEREIGN = Sim/Future
  action: string;
  context: string;
  lane: 'PRODUCTION' | 'SIMULATION';
}
