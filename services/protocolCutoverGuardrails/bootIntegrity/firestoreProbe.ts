import type {
  FirestoreAvailability,
  FirestoreAvailabilityProbe,
} from "./types";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Conservative probe:
 * - "configured" means we have a writer/client object.
 * - "available" means a trivial no-op call doesn't immediately throw.
 */
export const firestoreProbe: FirestoreAvailabilityProbe = {
  async probe(): Promise<FirestoreAvailability> {
    try {
      const configured = Boolean(db);

      if (!configured) {
        return {
          configured: false,
          available: false,
          reason: "Firestore writer not configured",
        };
      }

      // Connectivity test: attempt to fetch a nonexistent or dummy doc with a timeout
      try {
        // We use a doc that is unlikely to exist but is a valid path
        const docRef = doc(db!, "wizup_protocol_meta", "health_check");
        // Simple getDoc acts as a connectivity ping
        await getDoc(docRef);
        return { configured: true, available: true };
      } catch (e: any) {
        return {
          configured: true,
          available: false,
          reason: `Firestore connectivity failed: ${String(e?.message ?? e)}`,
        };
      }
    } catch (e: any) {
      return {
        configured: false,
        available: false,
        reason: `Probe error: ${String(e?.message ?? e)}`,
      };
    }
  }
};
