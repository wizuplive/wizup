import { shadowReadClient } from "../client";
import { SHADOW_COLLECTIONS } from "../types";
import { DEV_FIRESTORE_SHADOW_READ } from "../devFlags";

export const activationReceiptSource = {
  async getActivationReceipt(seasonId: string): Promise<any | null> {
    if (!DEV_FIRESTORE_SHADOW_READ) return null;
    
    // Receipt docId is typically the seasonId
    return await shadowReadClient.getDocJson(SHADOW_COLLECTIONS.ACTIVATION_RECEIPTS, seasonId);
  }
};
