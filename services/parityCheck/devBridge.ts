import { runShadowParityCheck } from "./checker";
import { parityPersistence } from "./persistence";
import { DEV_FIRESTORE_SHADOW_READ, ENABLE_SHADOW_READ_TOOLS } from "../firestoreShadowRead/devFlags";

/**
 * 🛠️ PARITY CHECK DEV BRIDGE
 */
export function installParityCheckDevBridge() {
  if (!DEV_FIRESTORE_SHADOW_READ || !ENABLE_SHADOW_READ_TOOLS) return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.parity = {
    /**
     * Executes the full cross-storage comparison.
     */
    run: async (seasonId: string) => {
      console.log(`%c[PARITY] Starting check for ${seasonId}...`, "color: #8b5cf6; font-weight: bold;");
      const report = await runShadowParityCheck({ seasonId });
      
      const color = report.status === "PASS" ? "#22c55e" : report.status === "WARN" ? "#f59e0b" : "#ef4444";
      console.log(`%c[PARITY] Status: ${report.status}`, `color: ${color}; font-weight: bold; font-size: 14px;`);
      
      if (report.mismatches.length > 0) {
        console.table(report.mismatches);
      }

      await parityPersistence.writeOnce(report);
      return report;
    },

    /**
     * Inspect a previously written report.
     */
    inspect: (seasonId: string) => parityPersistence.read(seasonId),

    help: () => {
      console.log("%c--- Parity Checker Tools ---", "color: #a855f7; font-weight: bold;");
      console.log("wizup.parity.run('S1')");
      console.log("wizup.parity.inspect('S1')");
    }
  };

  console.log("%c[PARITY] Parity Checker Active.", "color: #8b5cf6; font-weight: bold;");
}
