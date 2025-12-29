import { globalReadRouter } from "./index";
import { protocolReadFlags } from "../../config/protocolReadFlags";
import { LocalStorageProtocolSource } from "./sources/localStorageSource";
import { FirestoreShadowProtocolSource } from "./sources/firestoreShadowSource";
import { runParitySummaryAggregator } from "./parity/parityAggregator";
import { firestoreReader } from "../../lib/firestoreReader";
import { runShadowWriteParityMonitor } from "../protocolWriteRouter/monitor/shadowWriteParityMonitor";
import { runReadParityCoverage } from "./tests/readParity.coverage";

/**
 * 🛠️ READ ROUTER DEV BRIDGE
 */
export function installProtocolReadRouterDevBridge() {
  if (!protocolReadFlags.DEV_PROTOCOL_READ_ROUTER) return;

  const w: any = (window as any);
  w.wizup = w.wizup || {};

  w.wizup.router = {
    read: async (kind: any, seasonId: string, communityId?: string) => {
      console.log(`%c[ROUTER] Routing read for ${kind}...`, "color: #8b5cf6;");
      return await globalReadRouter.read({ kind, seasonId, communityId });
    },
    
    runParitySummary: async (seasonId: string) => {
      if (!protocolReadFlags.DEV_PROTOCOL_READ_ROUTER) return { error: "not_dev" };
      if (!protocolReadFlags.PARITY_SUMMARY_AGGREGATOR) return { error: "flag_off" };

      const local = new LocalStorageProtocolSource();
      const fire = new FirestoreShadowProtocolSource({ reader: firestoreReader });

      console.log(`%c[PARITY] Starting per-season summary for ${seasonId}...`, "color: #8b5cf6; font-weight: bold;");

      const { report, gate } = await runParitySummaryAggregator({
        seasonId,
        routerForIndex: globalReadRouter,
        readLocal: (k) => local.read(k),
        readFire: (k) => fire.read(k),
      });

      const color = gate.decision === "ALLOW" ? "#22c55e" : "#ef4444";
      console.log(`%c[PARITY] Gate Decision: ${gate.decision}`, `color: ${color}; font-weight: bold; font-size: 14px;`);
      
      return { report, gate };
    },

    runWriteParityMonitor: async (seasonId: string) => {
       console.log(`%c[MONITOR] Checking shadow write parity for ${seasonId}...`, "color: #8b5cf6; font-weight: bold;");
       const report = await runShadowWriteParityMonitor({ seasonId });
       const color = report.verdict === "PASS" ? "#22c55e" : "#ef4444";
       console.log(`%c[MONITOR] Verdict: ${report.verdict}`, `color: ${color}; font-weight: bold;`);
       return report;
    },

    runReadParityCoverage: async () => {
       console.log(`%c[TEST] Running Protocol Read Router Coverage...`, "color: #8b5cf6; font-weight: bold;");
       return await runReadParityCoverage();
    },

    flags: () => protocolReadFlags,
    help: () => {
      console.log("%c--- Protocol Read Router Tools ---", "color: #a855f7; font-weight: bold;");
      console.log("wizup.router.read('S1_ACTIVATION_RECEIPT', 'S1')");
      console.log("wizup.router.runParitySummary('S1')");
      console.log("wizup.router.runWriteParityMonitor('S1')");
      console.log("wizup.router.runReadParityCoverage()");
    }
  };

  console.log("%c[ROUTER] Protocol Read Router Dev Tools Active.", "color: #8b5cf6; font-weight: bold;");
}
