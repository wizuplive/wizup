import { ReputationTierId, SignalCategory } from "../services/reputationService";
import { UserRole } from "../services/reputationMappingService";

export interface AllocationEvent {
  userId: string;
  communityId: string;
  role: UserRole;
  reputationTier: ReputationTierId;
  reputationSignals: string[];
  seasonalWeight: number;
  zapsAllocated: number;
  timestamp: number;
}

export interface ReputationDriftEvent {
  userId: string;
  communityId: string;
  fromTier: ReputationTierId;
  toTier: ReputationTierId;
  signalCategory: SignalCategory;
  timestamp: number;
}

export interface GovernanceInfluenceEvent {
  userId: string;
  communityId: string;
  role: UserRole;
  governanceWeight: number;
  action: 'VIEW' | 'VOTE' | 'PROPOSE';
  timestamp: number;
}

export interface SeasonObserverNote {
  observationType: 'FAIRNESS' | 'SURPRISE' | 'DISCOMFORT' | 'DELIGHT';
  description: string;
  relatedUserIds?: string[];
  timestamp: number;
}