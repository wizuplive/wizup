import { ProtocolWriteRouter } from "./protocolWriteRouter";
import { LocalStorageGenericProtocolSink } from "./impl/localStorageGenericProtocolSink";
import { FirestoreShadowGenericProtocolSink } from "./impl/firestoreShadowGenericProtocolSink";

export function createProtocolWriteRouter(): ProtocolWriteRouter {
  const local = new LocalStorageGenericProtocolSink();
  const firestore = new FirestoreShadowGenericProtocolSink();

  return new ProtocolWriteRouter({ local, firestore });
}
