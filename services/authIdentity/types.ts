/**
 * 🆔 AUTH IDENTITY TYPES
 * ======================
 */

export type ExternalAuthIdentity = {
  provider: string;        // e.g. "clerk" | "firebase" | "auth0"
  providerUserId: string;  // provider-specific stable id
  emailHash?: string;      // optional, SHA-256; never store raw email
};

export type ProtocolUserId = string; // opaque, stable identifier: puid_<hash>

export type IdentityMapping = {
  protocolUserId: ProtocolUserId;
  external: ExternalAuthIdentity;
  createdAtMs: number; // excluded from hash inputs
};

export type IdentityResolutionResult =
  | { ok: true; protocolUserId: ProtocolUserId }
  | { ok: false; reason: "NO_AUTH" | "AMBIGUOUS" | "MIGRATION_BLOCKED" };
