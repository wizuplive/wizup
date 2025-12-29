import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

/**
 * 🖋️ SAFE SHADOW WRITER
 * =====================
 */

export async function safeShadowSetDoc(
  collectionPath: string,
  docId: string,
  artifactType: string,
  data: any
): Promise<void> {
  if (!db) return;

  try {
    const docRef = doc(db, collectionPath, docId);
    
    // Standardized Shadow Metadata
    const payload = {
      ...data,
      _shadowMeta: {
        writtenAtMs: Date.now(),
        schema: "shadow@v1",
        artifactType: artifactType,
        docId: docId
      }
    };

    // Use merge: true but rely on hash-bound docId for logical immutability
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    // Fail-open: Never block the protocol due to persistence errors
    console.debug(`[SHADOW_SINK] Write skipped for ${artifactType}:`, error);
  }
}
