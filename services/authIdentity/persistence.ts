import { IdentityMapping } from "./types";
import { db } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { assertMigrationAllowed } from "./migration";

/**
 * 🏺 IDENTITY STORE INTERFACE
 */
export interface IdentityStore {
  get(provider: string, providerUserId: string): Promise<IdentityMapping | null>;
  writeOnce(mapping: IdentityMapping): Promise<void>;
}

const LS_KEY_PREFIX = "WIZUP::IDENTITY::MAP::v1::";
const FS_COLLECTION = "zaps_identity_mappings_v1";

export class LocalStorageIdentityStore implements IdentityStore {
  async get(provider: string, providerUserId: string): Promise<IdentityMapping | null> {
    const raw = localStorage.getItem(`${LS_KEY_PREFIX}${provider}::${providerUserId}`);
    return raw ? JSON.parse(raw) : null;
  }

  async writeOnce(mapping: IdentityMapping): Promise<void> {
    const key = `${LS_KEY_PREFIX}${mapping.external.provider}::${mapping.external.providerUserId}`;
    const existing = await this.get(mapping.external.provider, mapping.external.providerUserId);
    
    assertMigrationAllowed({
      existing,
      incoming: mapping.external,
      proposedProtocolUserId: mapping.protocolUserId
    });

    if (!existing) {
      localStorage.setItem(key, JSON.stringify(mapping));
    }
  }
}

export class FirestoreIdentityStore implements IdentityStore {
  async get(provider: string, providerUserId: string): Promise<IdentityMapping | null> {
    if (!db) return null;
    const docId = `${provider}__${providerUserId}`;
    const snap = await getDoc(doc(db, FS_COLLECTION, docId));
    return snap.exists() ? (snap.data() as IdentityMapping) : null;
  }

  async writeOnce(mapping: IdentityMapping): Promise<void> {
    if (!db) return;
    const docId = `${mapping.external.provider}__${mapping.external.providerUserId}`;
    const ref = doc(db, FS_COLLECTION, docId);
    
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data() as IdentityMapping) : null;

    assertMigrationAllowed({
      existing,
      incoming: mapping.external,
      proposedProtocolUserId: mapping.protocolUserId
    });

    if (!existing) {
      await setDoc(ref, mapping);
    }
  }
}

export class CompositeIdentityStore implements IdentityStore {
  private stores: IdentityStore[];

  constructor() {
    this.stores = [new LocalStorageIdentityStore(), new FirestoreIdentityStore()];
  }

  async get(provider: string, providerUserId: string): Promise<IdentityMapping | null> {
    for (const store of this.stores) {
      const found = await store.get(provider, providerUserId);
      if (found) return found;
    }
    return null;
  }

  async writeOnce(mapping: IdentityMapping): Promise<void> {
    await Promise.all(this.stores.map(s => s.writeOnce(mapping).catch(() => {})));
  }
}

export const defaultIdentityStore = new CompositeIdentityStore();
