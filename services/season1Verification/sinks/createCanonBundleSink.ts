import { CompositeCanonBundleSink } from "./compositeCanonBundleSink";

export type Season1CanonSinkFlags = {
  WRITE_CANON_BUNDLE_LOCAL: boolean;
  WRITE_CANON_BUNDLE_FIRESTORE: boolean;
  WRITE_CANON_BUNDLE_INDEX: boolean;
};

export function createSeason1CanonBundleSink(flags: () => Season1CanonSinkFlags) {
  const f = flags();

  // Fix: CompositeCanonBundleSink constructor only expects enableFirestoreShadow and enableIndexing.
  // The specific sink implementations (Local/Firestore) are now abstracted behind the protocolWriteRouter 
  // which is called inside CompositeCanonBundleSink.write().
  return new CompositeCanonBundleSink({
    enableFirestoreShadow: Boolean(f.WRITE_CANON_BUNDLE_FIRESTORE),
    enableIndexing: Boolean(f.WRITE_CANON_BUNDLE_INDEX),
  });
}