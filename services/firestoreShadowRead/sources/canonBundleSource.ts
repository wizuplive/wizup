import { shadowReadClient } from "../client";
import { SHADOW_COLLECTIONS } from "../types";
import { DEV_FIRESTORE_SHADOW_READ } from "../devFlags";
import { where } from "firebase/firestore";

export const canonBundleSource = {
  /**
   * Fetches bundles for a season. 
   * Strategy: Query by _seasonId field injected by shadow writer.
   */
  async listCanonBundlesForSeason(seasonId: string, max: number = 500): Promise<any[]> {
    if (!DEV_FIRESTORE_SHADOW_READ) return [];
    
    return await shadowReadClient.queryDocs(
      SHADOW_COLLECTIONS.CANON_BUNDLES,
      [where("seasonId", "==", seasonId)],
      max
    );
  }
};
