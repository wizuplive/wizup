export type FreezeTriggerSource = 'SYSTEM' | 'STEWARD' | 'GOVERNANCE';

export interface FreezeRecord {
  id: string;
  communityId: string;
  source: FreezeTriggerSource;
  reason: string;
  timestamp: number;
  treasurySnapshot: {
    balance: number;
    totalDistributed: number;
  };
  unfrozenAt?: number;
  resolutionNotes?: string;
}