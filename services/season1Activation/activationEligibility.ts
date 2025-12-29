import { defaultReadinessSink } from "./persistence/localStorageReadinessSink";

/**
 * 🔒 ACTIVATION ELIGIBILITY HOOK
 * ==============================
 */
export async function isSeason1ActivationAllowed(seasonId: string): Promise<boolean> {
  try {
    const artifact = await defaultReadinessSink.read(seasonId);
    if (!artifact) return false;

    // Strict Authorization Rule
    return artifact.verdict.decision === "PROCEED";

  } catch (error) {
    console.error("[ELIGIBILITY] Failed to verify readiness artifact. Activation denied.");
    return false;
  }
}
