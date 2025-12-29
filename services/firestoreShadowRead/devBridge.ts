import { DEV_FIRESTORE_SHADOW_READ, ENABLE_SHADOW_READ_TOOLS } from "./devFlags";
import { downloadAuditPackJsonl, buildAuditPackFromFirestore } from "./export/auditPackBuilder";
import { activationReceiptSource } from "./sources/activationReceiptSource";
import { shadowReadClient } from "./client";
import { SHADOW_COLLECTIONS } from "./types";

/**
 * 🛠️ SHADOW READ DEV BRIDGE
 */
export function installShadowReadDevBridge() {
  if (!DEV_FIRESTORE_SHADOW_READ || !ENABLE_SHADOW_READ_TOOLS) return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.shadow = {
    /**
     * Export a full portable audit pack from Firestore.
     */
    exportAuditPack: async (args: { seasonId: string; includeViolations?: boolean }) => {
      console.log(`%c[SHADOW] Building Audit Pack for ${args.seasonId}...`, "color: #8b5cf6; font-weight: bold;");
      await downloadAuditPackJsonl(args);
    },

    /**
     * Preview seasonal health and alignment directly from Firestore.
     */
    inspectSeason: async (seasonId: string) => {
      console.group(`%c[SHADOW] Inspecting ${seasonId}`, "color: #3b82f6; font-weight: bold;");
      
      const [receipt, contract, health] = await Promise.all([
        activationReceiptSource.getActivationReceipt(seasonId),
        shadowReadClient.getDocJson(SHADOW_COLLECTIONS.SEALED_CONTRACTS, seasonId),
        shadowReadClient.getDocJson(SHADOW_COLLECTIONS.SEASON_HEALTH, seasonId)
      ]);

      console.log("Receipt:", receipt);
      console.log("Contract:", contract);
      console.log("Health:", health);
      
      console.groupEnd();
      
      return { receipt, contract, health };
    },

    help: () => {
      console.log("%c--- Firestore Shadow Read Tools ---", "color: #a855f7; font-weight: bold;");
      console.log("wizup.shadow.exportAuditPack({ seasonId: 'S1' })");
      console.log("wizup.shadow.inspectSeason('S1')");
    }
  };

  console.log("%c[SHADOW] Firestore Read Tools Active.", "color: #8b5cf6; font-weight: bold;");
}
