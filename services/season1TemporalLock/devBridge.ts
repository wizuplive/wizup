import { season1TemporalLock } from "./season1TemporalLock";

/**
 * 🛠️ WIZUP LOCK DEV BRIDGE
 */
export const installLockDevBridge = () => {
  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.verifySeason1TemporalLock = async (seasonId: string) => {
    console.group(`%c[AUDIT] Verifying Season 1 Lock Enforcement: ${seasonId}`, "color: #a855f7; font-weight: bold;");
    
    // Simulate a write with a different hash for an existing object
    const res = await season1TemporalLock.enforceSeason1WritePolicy({
      seasonId,
      objectType: "canonBundle",
      proposedHash: "MUTATION_ATTEMPT_HASH",
      existingHashLoader: async () => "EXISTING_STABLE_HASH"
    });

    if (!res.allowed) {
      console.log("%c✅ MUTATION BLOCKED", "color: #22c55e; font-weight: bold;");
      console.log("Violation ID:", res.violationId);
    } else {
      console.warn("❌ MUTATION NOT BLOCKED. Verify activation status.");
    }

    console.groupEnd();
  };
};
