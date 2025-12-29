import { runtimeFingerprintSink } from "./persistence/runtimeFingerprintSink";
import { isSeason2NoopLatched, latchSeason2Noop } from "./noopLatch";
import { buildSeason2RuntimeFingerprint } from "./runtimeFingerprintBuilder";

/**
 * 🛠️ S2 INTEGRITY DEV BRIDGE
 */
export function installSeason2IntegrityDevBridge() {
  if (typeof window === 'undefined') return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.s2integrity = {
    inspect: (seasonId: string) => runtimeFingerprintSink.read(seasonId),
    isLatched: (seasonId: string) => isSeason2NoopLatched(seasonId),
    
    verifyLive: async (seasonId: string, sealHash: string) => {
      const stored = runtimeFingerprintSink.read(seasonId);
      const rebuilt = await buildSeason2RuntimeFingerprint({ seasonId, sealedContractSealHash: sealHash });
      
      console.group(`%c[INTEGRITY] Audit: ${seasonId}`, "color: #a855f7; font-weight: bold;");
      console.log("Stored Hash:", stored?.hashes.fingerprintHash);
      console.log("Rebuilt Hash:", rebuilt.hashes.fingerprintHash);
      const ok = stored?.hashes.fingerprintHash === rebuilt.hashes.fingerprintHash;
      console.log(`Status: ${ok ? "✅ VALID" : "❌ DRIFT DETECTED"}`);
      console.groupEnd();
      return ok;
    },

    forceLatch: (seasonId: string, sealHash: string) => 
      latchSeason2Noop({ seasonId, reason: "MANUAL_LATCH", sealedContractSealHash: sealHash }),

    help: () => {
      console.log("%c--- S2 Integrity Tools ---", "color: #06b6d4; font-weight: bold;");
      console.log("wizup.s2integrity.inspect('S2_2026Q1')");
      console.log("wizup.s2integrity.isLatched('S2_2026Q1')");
      console.log("wizup.s2integrity.verifyLive('S2_2026Q1', '0x_SEAL_HASH')");
    }
  };
}
