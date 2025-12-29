import type { ProtocolWriteSink } from "../sinks";
import type { ProtocolWriteKey } from "../types";
import { safeShadowSetDoc } from "../../firestoreShadow/writer";

export class FirestoreShadowGenericProtocolSink implements ProtocolWriteSink {
  async write<T>(key: ProtocolWriteKey, payload: T): Promise<void> {
    try {
      const { collection, docId } = mapToFirestoreDoc(key);
      await safeShadowSetDoc(collection, docId, key.kind, payload);
    } catch {
      // swallow
    }
  }
}

function mapToFirestoreDoc(k: ProtocolWriteKey): { collection: string; docId: string } {
  switch (k.kind) {
    case "CANON_BUNDLE":
      return { collection: "zaps_season1_canon_bundles", docId: `${k.seasonId}__${k.communityId}` };
    case "ACTIVATION_RECEIPT":
      return { collection: "activation_receipts_v1", docId: `${k.seasonId}` };
    case "SEALED_CONTRACT":
      return { collection: "zaps_season1_sealed_contracts", docId: `${k.seasonId}` };
    case "ARCHIVE_BUNDLE":
      return { collection: "zaps_season_archive_bundles_v1", docId: `${k.seasonId}` };
    case "SEASON_END_RECEIPT":
      return { collection: "zaps_season_end_receipts_v1", docId: `${k.seasonId}` };
    case "READINESS_SEED":
      return { collection: "zaps_season2_readiness_seeds_v1", docId: `from__${k.seasonId}` };
    case "CONSTRAINTS":
      return { collection: "gov_constraints_v1", docId: `${k.seasonId}` };
    case "SEASON_HEALTH":
      return { collection: "zaps_season_health_artifacts_v1", docId: `${k.seasonId}` };
    case "RUNTIME_FINGERPRINT":
      return { collection: "zaps_season2_runtime_fingerprints_v1", docId: `${k.seasonId}` };
    default:
      return { collection: "wizup_protocol_writes_v1", docId: `${k.kind}__${k.seasonId}__${k.docId}` };
  }
}
