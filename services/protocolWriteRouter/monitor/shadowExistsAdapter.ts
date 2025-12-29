import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Dev-only, read-only Firestore shadow existence checks.
 */
export async function firestoreShadowExists(args: {
  kind: string;
  seasonId: string;
  communityId?: string;
  docId: string;
}): Promise<boolean> {
  try {
    const { collection, firestoreDocId } = mapKindToFirestore(args);

    // Test double injection check
    const fakeFs = (globalThis as any).__WIZUP_FIRESTORE__;
    if (fakeFs && typeof fakeFs.exists === 'function') {
      return await fakeFs.exists(collection, firestoreDocId);
    }

    if (!db) return true; // fail-open

    const snap = await getDoc(doc(db, collection, firestoreDocId));
    return snap.exists();
  } catch {
    return true; // fail-open
  }
}

function mapKindToFirestore(args: {
  kind: string;
  seasonId: string;
  communityId?: string;
  docId: string;
}) {
  switch (args.kind) {
    case "CANON_BUNDLE":
      return {
        collection: "zaps_season1_canon_bundles",
        firestoreDocId: `${args.seasonId}__${args.communityId}`,
      };
    case "ACTIVATION_RECEIPT":
      return { collection: "activation_receipts_v1", firestoreDocId: `${args.seasonId}` };
    case "SEALED_CONTRACT":
      return { collection: "zaps_season1_sealed_contracts", firestoreDocId: `${args.seasonId}` };
    case "ARCHIVE_BUNDLE":
      return { collection: "zaps_season_archive_bundles_v1", firestoreDocId: `${args.seasonId}` };
    case "SEASON_END_RECEIPT":
      return { collection: "zaps_season_end_receipts_v1", firestoreDocId: `${args.seasonId}` };
    case "READINESS_SEED":
      return { collection: "zaps_season2_readiness_seeds_v1", firestoreDocId: `from__${args.seasonId}` };
    default:
      return { collection: "wizup_protocol_writes_v1", firestoreDocId: `${args.kind}__${args.seasonId}__${args.docId}` };
  }
}
