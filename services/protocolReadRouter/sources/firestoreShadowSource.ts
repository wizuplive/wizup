import type { ProtocolArtifactKey, ProtocolArtifactSource, ReadResult } from "../types";
import { firestoreAddressFor } from "./firestoreShadowAddressing";

/**
 * 🔥 FIRESTORE SHADOW PROTOCOL SOURCE
 * ===================================
 */

export type FirestoreReader = {
  getDoc: (collection: string, docId: string) => Promise<any | null>;
};

function inferFingerprint(obj: any): string | undefined {
  return (
    obj?.bundleHash ||
    obj?.decisionHash ||
    obj?.sealHash ||
    obj?.constraintsHash ||
    obj?.hashes?.outputHash ||
    obj?.hashes?.packHash ||
    obj?.hash ||
    obj?.receiptHash ||
    obj?.archiveHash ||
    obj?.seedHash ||
    undefined
  );
}

export class FirestoreShadowProtocolSource implements ProtocolArtifactSource {
  constructor(private readonly deps: { reader?: FirestoreReader }) {}

  async read<T>(key: ProtocolArtifactKey): Promise<ReadResult<T>> {
    try {
      if (!this.deps.reader) return { value: null, source: "NOOP" };

      const addr = firestoreAddressFor(key);
      if (!addr) return { value: null, source: "NOOP" };

      const doc = await this.deps.reader.getDoc(addr.collection, addr.docId);
      if (!doc) return { value: null, source: "NOOP" };

      return { value: doc as T, source: "FIRESTORE", fingerprint: inferFingerprint(doc) };
    } catch {
      return { value: null, source: "NOOP" };
    }
  }
}
