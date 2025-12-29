import { IdentityResolutionResult } from "./types";

/**
 * 🛡️ PROTOCOL IDENTITY GUARD
 * Forces a NOOP state if identity cannot be resolved, ensuring fail-open behavior.
 */
export function requireProtocolUserIdOrNoop(
  res: IdentityResolutionResult
): { ok: true; protocolUserId: string } | { ok: false; noop: true } {
  if (!res.ok) return { ok: false, noop: true };
  return { ok: true, protocolUserId: res.protocolUserId };
}
