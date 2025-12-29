export interface Season1ActivationReceipt {
  seasonId: string;
  decision: "ACTIVATED" | "BLOCKED" | "CONDITIONAL";
  receiptHash: string;     // authoritative
  readinessHash: string;
  activationHash: string;  // sealed contract hash
  constraintsHash: string; // must match canon bundle
  issuedAtMs: number;
  schemaVersion: "v1";
  sealed: true;
}