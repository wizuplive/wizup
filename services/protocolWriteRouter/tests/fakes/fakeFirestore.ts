/**
 * 🔥 FAKE FIRESTORE ADAPTER
 * -----------------------
 * Minimal implementation for protocol write tests.
 */
export class FakeFirestore {
  private store = new Map<string, any>();

  async set(collection: string, docId: string, data: any, _opts?: { merge?: boolean }) {
    const k = `${collection}::${docId}`;
    this.store.set(k, data);
  }

  async exists(collection: string, docId: string): Promise<boolean> {
    const k = `${collection}::${docId}`;
    return this.store.has(k);
  }

  count(): number {
    return this.store.size;
  }
}
