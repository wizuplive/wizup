import { protocolRead } from "../protocolReadRouter/protocolReadRouter";
import { LS_KEYS } from "../season1Verification/keys";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * 🔒 ACTIVATION ENFORCEMENT GATE
 * Returns true if and only if an irreversible ACTIVATED receipt exists.
 */
export async function isSeason1Activated(seasonId: string): Promise<boolean> {
  const id = seasonId === "SEASON_1" || seasonId === "active-season" ? "S1" : seasonId;
  const lsKey = LS_KEYS.activationReceipt(id);
  
  try {
    const res = await protocolRead<any>({
      seasonId: id,
      readKey: lsKey,
      localRead: () => {
        const raw = localStorage.getItem(lsKey);
        return raw ? JSON.parse(raw) : null;
      },
      firestoreRead: async () => {
        if (!db) return null;
        const snap = await getDoc(doc(db, "activation_receipts_v1", id));
        return snap.exists() ? snap.data() : null;
      }
    });

    // Support multiple schema variants during cutover
    const val = res.value;
    return val?.status === "ACTIVATED" || val?.decision === "ACTIVATED";
  } catch {
    return false; // Fail-closed
  }
}
