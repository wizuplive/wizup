import { ExternalAuthIdentity, IdentityMapping } from "./types";
import { violationEmitter } from "../season2Activation/persistence/violationEmitter";

/**
 * ⚖️ IDENTITY MIGRATION RULES
 * ===========================
 * Prohibits merging identities or remapping protocol IDs.
 */
export function assertMigrationAllowed(args: {
  existing?: IdentityMapping | null;
  incoming: ExternalAuthIdentity;
  proposedProtocolUserId: string;
}): void {
  if (!args.existing) return;

  const sameExternal =
    args.existing.external.provider === args.incoming.provider &&
    args.existing.external.providerUserId === args.incoming.providerUserId;

  const sameProtocolId = args.existing.protocolUserId === args.proposedProtocolUserId;

  if (!sameExternal || !sameProtocolId) {
    // This is a critical protocol divergence attempt.
    violationEmitter.emit("IDENTITY_SYSTEM", "S2_IMMUTABILITY_VIOLATION" as any, {
      code: "IDENTITY_MIGRATION_BLOCKED",
      severity: "CRITICAL",
      existingMapping: args.existing,
      incomingExternal: args.incoming,
      proposedId: args.proposedProtocolUserId
    });
    throw new Error("MIGRATION_BLOCKED");
  }
}
