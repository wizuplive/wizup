import { sealSeason2Contract } from "../season2ContractSealer";
import { isSeason2Activated } from "../isSeason2Activated";
import { seasonalEngine } from "../../zapsLedger/seasonalEngine";

/**
 * 🛠️ S2 ACTIVATION DEV BRIDGE
 */
export function installSeason2ActivationDevBridge() {
  if (typeof window === 'undefined') return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.s2activation = {
    seal: sealSeason2Contract,
    isActivated: isSeason2Activated,
    
    verifyGate: async (seasonId: string = "S2_2026Q1") => {
      console.group(`%c[AUDIT] Verifying Season 2 Activation Gate: ${seasonId}`, "color: #8b5cf6; font-weight: bold;");
      
      const activated = await isSeason2Activated(seasonId);
      console.log(`Activation Status: ${activated ? "✅ ACTIVATED" : "⚠️ NOT ACTIVATED"}`);

      console.log("Testing Community Resolution Entry Point...");
      const results = await seasonalEngine.resolveCommunity("Design Systems Mastery", seasonId);
      
      const isBlocked = results.length === 1 && (results[0] as any).userId === "GATE_BLOCK_SENTINEL_S2";
      
      if (!activated) {
        if (isBlocked) {
          console.log("%c✅ PROPERLY BLOCKED: Service returned NOOP sentinel.", "color: #22c55e; font-weight: bold;");
        } else {
          console.error("❌ FAILURE: Service bypassed gate or returned real data while unactivated.");
        }
      } else {
        if (!isBlocked) {
          console.log("%c✅ PROPERLY OPEN: Service returned live data.", "color: #22c55e; font-weight: bold;");
        } else {
          console.error("❌ FAILURE: Service returned NOOP sentinel while formally activated.");
        }
      }

      console.groupEnd();
    },

    help: () => {
      console.log("%c--- S2 Activation Tools ---", "color: #06b6d4; font-weight: bold;");
      console.log("wizup.s2activation.seal({ seasonId: '...' })");
      console.log("wizup.s2activation.isActivated('...')");
      console.log("wizup.s2activation.verifyGate('...')");
    }
  };
}
