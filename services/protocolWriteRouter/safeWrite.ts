import type { ProtocolWriteKey, ProtocolWriteResult } from "./types";
import type { ProtocolWriteRouter } from "./protocolWriteRouter";

/**
 * 🛡️ SAFE PROTOCOL WRITE
 * Wraps router calls to ensure they never throw.
 */
export async function safeProtocolWrite<T>(
  router: ProtocolWriteRouter,
  key: ProtocolWriteKey,
  payload: T
): Promise<ProtocolWriteResult> {
  try {
    return await router.write(key, payload);
  } catch {
    // Extreme fail-open fallback
    return {
      seasonId: key.seasonId,
      kind: key.kind,
      communityId: key.communityId,
      local: { ok: false, mode: "NOOP" },
      firestore: { ok: false, mode: "NOOP_DISABLED" },
    };
  }
}
