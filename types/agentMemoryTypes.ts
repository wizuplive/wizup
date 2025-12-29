
export type AgentMemoryEventType = 'AI_HOLD' | 'HUMAN_RESTORE' | 'HUMAN_CONFIRM' | 'BURST_ACTIVITY';

export interface AgentMemoryEvent {
  id: string;
  type: AgentMemoryEventType;
  contentId?: string;
  timestamp: number;
}

export interface AgentMemoryState {
  communityId: string;
  events: AgentMemoryEvent[];
}
