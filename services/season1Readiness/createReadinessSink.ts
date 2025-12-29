import { LocalStorageReadinessSink } from "./sinks/localStorageReadinessSink";
import { FirestoreShadowReadinessSink } from "./sinks/firestoreShadowReadinessSink";
import { CompositeReadinessSink } from "./sinks/compositeReadinessSink";

export type Season1ReadinessSinkFlags = {
  WRITE_S1_READINESS_LOCAL: boolean;
  WRITE_S1_READINESS_FIRESTORE: boolean;
};

export function createSeason1ReadinessSink(flags: () => Season1ReadinessSinkFlags) {
  const f = flags();
  const local = new LocalStorageReadinessSink();

  return new CompositeReadinessSink({
    local,
    firestore: f.WRITE_S1_READINESS_FIRESTORE ? new FirestoreShadowReadinessSink() : undefined,
    enableFirestoreShadow: Boolean(f.WRITE_S1_READINESS_FIRESTORE),
  });
}