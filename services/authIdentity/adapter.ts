import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { IdentityStore, defaultIdentityStore } from "./persistence";
import { IdentityResolutionResult, ProtocolUserId } from "./types";

/**
 * 🧬 DETERMINISTIC ID DERIVATION
 * Ensures same external identity -> same protocol ID, forever.
 */
export async function deriveProtocolUserId(input: {
  provider: string;
  providerUserId: string;
}): Promise<ProtocolUserId> {
  const payload = canonicalJson({
    v: "protocol-userid@v1",
    provider: input.provider,
    providerUserId: input.providerUserId,
  });
  return `puid_${await sha256Hex(payload)}`;
}

/**
 * 🔌 IDENTITY RESOLUTION ADAPTER
 * The primary entry point for mapping auth to protocol.
 */
export async function resolveProtocolUserId(args: {
  authIdentity: { provider: string; providerUserId: string } | null;
  store?: IdentityStore;
}): Promise<IdentityResolutionResult> {
  const store = args.store || defaultIdentityStore;
  
  if (!args.authIdentity) {
    return { ok: false, reason: "NO_AUTH" };
  }

  const { provider, providerUserId } = args.authIdentity;

  try {
    const existing = await store.get(provider, providerUserId);
    if (existing) {
      return { ok: true, protocolUserId: existing.protocolUserId };
    }

    const protocolUserId = await deriveProtocolUserId({ provider, providerUserId });

    await store.writeOnce({
      protocolUserId,
      external: { provider, providerUserId },
      createdAtMs: Date.now(),
    });

    return { ok: true, protocolUserId };
  } catch (e: any) {
    if (e.message === "MIGRATION_BLOCKED") {
      return { ok: false, reason: "MIGRATION_BLOCKED" };
    }
    return { ok: false, reason: "AMBIGUOUS" };
  }
}
