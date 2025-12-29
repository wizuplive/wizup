import { Season2SealedContract, Season2ActivationReceipt } from "../types";
    import { FS_S2_ACTIVATION_COLLECTIONS } from "../keys";
    import { db } from "../../../lib/firebase";
    import { doc, setDoc, getDoc } from "firebase/firestore";

export const firestoreShadowSinks = {
  async writeSealedContract(contract: Season2SealedContract): Promise<void> {
    if (!db) return;
    try {
      const ref = doc(db, FS_S2_ACTIVATION_COLLECTIONS.SEALED, contract.seasonId);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().hashes?.sealHash === contract.hashes.sealHash) return;
      await setDoc(ref, contract, { merge: true });
    } catch {}
  },

  async writeReceipt(receipt: Season2ActivationReceipt): Promise<void> {
    if (!db) return;
    try {
      const ref = doc(db, FS_S2_ACTIVATION_COLLECTIONS.RECEIPTS, receipt.seasonId);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().activationHash === receipt.activationHash) return;
      await setDoc(ref, receipt, { merge: true });
    } catch {}
  }
};
