export interface CompiledConstraintsSnapshot {
  seasonId: string;
  constraintsHash: string;
  overrides: Record<string, unknown>; // parameter overrides, no UI
  schemaVersion: "v1";
  sealed: true;
}