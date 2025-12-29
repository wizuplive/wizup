import { computeOrVerifySeason2FreezeProof } from "./season2FreezeProof";
import { proofSinks } from "../season2TemporalLock/persistence/proofSinks";
import { LS_VIOLATION_INDEX } from "../season2Activation/keys";

/**
 * 🛠️ S2 FREEZE DEV BRIDGE
 */
export function installSeason2FreezeDevBridge() {
  if (typeof window === 'undefined') return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.s2freeze = {
    verify: async (seasonId: string) => {
      const res = await computeOrVerifySeason2FreezeProof({ seasonId, nowMs: Date.now() });
      if (res.ok) {
        console.log(`%c✅ S2 FREEZE OK: ${res.registryHash}`, "color: #22c55e; font-weight: bold;");
      } else {
        console.error("🚨 S2 FREEZE DRIFT DETECTED OR PROTOCOL BLOCKED");
      }
      return res;
    },

    inspectLatch: (seasonId: string) => {
      return proofSinks.readNoopLatch(seasonId);
    },

    listViolations: (seasonId: string) => {
      const rawIndex = localStorage.getItem(LS_VIOLATION_INDEX);
      const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      return index.map(id => {
        const raw = localStorage.getItem(`wizup:season2:violations:v1:${id}`);
        return raw ? JSON.parse(raw) : null;
      }).filter(v => v && v.seasonId === seasonId);
    },

    help: () => {
      console.log("%c--- S2 Freeze & Lock Tools ---", "color: #06b6d4; font-weight: bold;");
      console.log("wizup.s2freeze.verify('S2_2026Q1')");
      console.log("wizup.s2freeze.inspectLatch('S2_2026Q1')");
      console.log("wizup.s2freeze.listViolations('S2_2026Q1')");
    }
  };
}
