import type { ProtocolArtifactKey, ProtocolArtifactSource, ReadResult } from "../types";

/**
 * 💾 LOCAL STORAGE PROTOCOL SOURCE
 * ================================
 */

function lsKeyFor(k: ProtocolArtifactKey): string | null {
  const s = k.seasonId;
  const c = k.communityId;

  switch (k.kind) {
    case "S1_ACTIVATION_RECEIPT":
      return `WIZUP::S1::ACTIVATION_RECEIPT::v1::${s}`;
    case "S1_SEALED_CONTRACT":
      return `WIZUP::S1::ARTIFACT::SEALED_CONTRACT`;
    case "S1_CANON_BUNDLE":
      if (!c) return null;
      return `WIZUP::ZAPS::S1::CANON_BUNDLE::${s}::${c}`;
    case "S1_CONSTRAINTS":
      return `WIZUP::GOV::CONSTRAINTS::v1::${s}`;
    case "S1_SEASON_END_RECEIPT":
      return `WIZUP::S1::SEASON_END_RECEIPT::v1::${s}`;
    case "S1_ARCHIVE_BUNDLE":
      return `WIZUP::S1::ARCHIVE_BUNDLE::v1::${s}`;
    case "S2_READINESS_SEED":
      return `WIZUP::S2::READINESS_SEED::v1::from::${s}`;
    case "SEASON_HEALTH":
      return `WIZUP::SEASON_HEALTH::v1::${s}`;
    default:
      return null;
  }
}

function safeJsonParse<T>(raw: string): T | null {
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function inferFingerprint(obj: any): string | undefined {
  return (
    obj?.bundleHash ||
    obj?.decisionHash ||
    obj?.sealHash ||
    obj?.hashes?.outputHash ||
    obj?.hashes?.packHash ||
    obj?.hash ||
    obj?.receiptHash ||
    obj?.archiveHash ||
    obj?.seedHash ||
    undefined
  );
}

export class LocalStorageProtocolSource implements ProtocolArtifactSource {
  async read<T>(key: ProtocolArtifactKey): Promise<ReadResult<T>> {
    try {
      const k = lsKeyFor(key);
      if (!k) return { value: null, source: "NOOP" };

      const raw = localStorage.getItem(k);
      if (!raw) return { value: null, source: "NOOP" };

      const value = safeJsonParse<T>(raw);
      if (!value) return { value: null, source: "NOOP" };

      return { value, source: "LOCAL", fingerprint: inferFingerprint(value) };
    } catch {
      return { value: null, source: "NOOP" };
    }
  }
}
