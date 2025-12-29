
/**
 * 🌅 SEASON 15 — SUCCESSION & SUNSET PROTOCOL
 * ===========================================
 * Data types for communities that end with dignity.
 */

export type SunsetType = 'SUCCESSION' | 'HIBERNATION' | 'MERGER' | 'SUNSET';

export interface SunsetArtifact {
  id: string;
  communityId: string;
  type: SunsetType;
  initiatedAt: number;
  completedAt?: number;
  initiatedBy: string[]; // Quorum of stewards/anchors
  rationale: string;
  finalCultureSnapshotId: string;
  isReadonly: boolean;
  isArchiveLocked: boolean;
  mergerTargetId?: string; // For MERGER type
}

export interface SuccessionNotice {
  previousStewardId: string;
  nextStewardId: string;
  oathAccepted: boolean;
  transferDate: number;
}

export interface CommunityLifecycleState {
  communityId: string;
  status: 'BIRTH' | 'GROWTH' | 'GOVERNANCE' | 'IDENTITY' | 'COMPLETION';
  sunsetType?: SunsetType;
  isFrozen: boolean;
  lastSignalAt: number;
}
