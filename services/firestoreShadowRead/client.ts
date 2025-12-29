import { db } from "../../lib/firebase";
import { 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit, 
  collection,
  QueryConstraint
} from "firebase/firestore";

/**
 * 🔍 READ-ONLY SHADOW CLIENT
 * ==========================
 */

export const shadowReadClient = {
  /**
   * Fetches a single document by ID.
   */
  async getDocJson(collectionPath: string, docId: string): Promise<any | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, collectionPath, docId));
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.debug(`[SHADOW_READ] getDoc failed: ${collectionPath}/${docId}`, e);
      return null;
    }
  },

  /**
   * Executes a query against a collection.
   */
  async queryDocs(
    collectionPath: string, 
    constraints: QueryConstraint[], 
    maxResults: number = 100
  ): Promise<any[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, collectionPath), ...constraints, limit(maxResults));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.debug(`[SHADOW_READ] query failed: ${collectionPath}`, e);
      return [];
    }
  }
};
