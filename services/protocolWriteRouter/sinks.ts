import type { ProtocolWriteKey } from "./types";

/**
 * Both sinks must be:
 * - write-only
 * - fail-open internally (never throw to callers) OR caller will swallow
 * - deterministic: they must not mutate the payload
 */
export interface ProtocolWriteSink {
  write<T>(key: ProtocolWriteKey, payload: T): Promise<void>;
}
