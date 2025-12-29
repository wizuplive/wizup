/**
 * 🔌 PROTOCOL ADAPTER INTERFACES
 * ==============================
 * Goal: make it structurally impossible for backend wiring to change protocol outcomes.
 */

export interface IdentityAdapter {
  // Returns stable protocol-scoped user id
  getProtocolUserId(): Promise<string | null>;
  getProtocolSessionId?(): Promise<string | null>; 
}

export interface SignalStoreAdapter {
  // Write-only for application path
  appendSignal(event: unknown): Promise<void>; 
  // Read for simulation/audit path
  listSignals?(args: { communityId: string; startMs: number; endMs: number }): Promise<unknown[]>;
}

export interface ArtifactStoreAdapter {
  // Write-once immutability for sealed artifacts
  writeArtifact(args: { key: string; artifact: unknown; writeOnce: boolean }): Promise<void>;
  readArtifact?(args: { key: string }): Promise<unknown | null>;
  listKeysByPrefix?(args: { prefix: string }): Promise<string[]>;
}

/**
 * HARD RULES for Adapters:
 * 1. Adapters must not compute weights, apply caps, or interpret results.
 * 2. Adapters must not change payloads beyond serialization requirements.
 * 3. Adapters must be idempotent via protocol-provided keys.
 */
