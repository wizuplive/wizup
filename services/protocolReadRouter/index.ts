import { ProtocolReadRouter } from "./protocolReadRouter";
import { LocalStorageProtocolSource } from "./sources/localStorageSource";
import { FirestoreShadowProtocolSource } from "./sources/firestoreShadowSource";
import { firestoreReader } from "../../lib/firestoreReader";

/**
 * 🏭 PROTOCOL READ ROUTER FACTORY
 */
export function createProtocolReadRouter() {
  const local = new LocalStorageProtocolSource();
  const firestore = new FirestoreShadowProtocolSource({ reader: firestoreReader });
  return new ProtocolReadRouter({ local, firestore });
}

// Single instance for service-wide use
export const globalReadRouter = createProtocolReadRouter();
