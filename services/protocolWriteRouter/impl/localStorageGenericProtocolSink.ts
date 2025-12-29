import type { ProtocolWriteSink } from "../sinks";
import type { ProtocolWriteKey } from "../types";

/**
 * Writes to localStorage using stable keys derived from ProtocolWriteKey.
 * This MUST match your canonical key formats.
 */
export class LocalStorageGenericProtocolSink implements ProtocolWriteSink {
  async write<T>(key: ProtocolWriteKey, payload: T): Promise<void> {
    try {
      const storage = window?.localStorage;
      if (!storage) return;

      const lsKey = mapToLocalStorageKey(key);
      storage.setItem(lsKey, JSON.stringify(payload));
    } catch {
      // swallow
    }
  }
}

function mapToLocalStorageKey(k: ProtocolWriteKey): string {
  switch (k.kind) {
    case "CANON_BUNDLE":
      return `WIZUP::ZAPS::S1::CANON_BUNDLE::${k.seasonId}::${k.communityId ?? "UNKNOWN"}`;
    case "ACTIVATION_RECEIPT":
      return `WIZUP::S1::ACTIVATION_RECEIPT::v1::${k.seasonId}`;
    case "SEALED_CONTRACT":
      return `WIZUP::S1::ARTIFACT::SEALED_CONTRACT`; // Legacy S1 contract key
    case "CONSTRAINTS":
      return `WIZUP::GOV::CONSTRAINTS::v1::${k.seasonId}`;
    case "ARCHIVE_BUNDLE":
      return `WIZUP::S1::ARCHIVE_BUNDLE::v1::${k.seasonId}`;
    case "SEASON_END_RECEIPT":
      return `WIZUP::S1::SEASON_END_RECEIPT::v1::${k.seasonId}`;
    case "READINESS_SEED":
      return `WIZUP::S2::READINESS_SEED::v1::from::${k.seasonId}`;
    case "RUNTIME_FINGERPRINT":
      return `WIZUP::S2::RUNTIME_FINGERPRINT::v1::${k.seasonId}`;
    case "SEASON_HEALTH":
      return `WIZUP::SEASON_HEALTH::v1::${k.seasonId}`;
    default:
      return `WIZUP::PROTO::WRITE::v1::${k.kind}::${k.seasonId}::${k.docId}`;
  }
}
