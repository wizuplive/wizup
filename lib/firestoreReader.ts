import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * 🔍 THIN FIRESTORE READER
 */
export const firestoreReader = {
  async getDoc(collection: string, docId: string): Promise<any | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, collection, docId));
      return snap.exists() ? snap.data() : null;
    } catch {
      return null;
    }
  }
};
