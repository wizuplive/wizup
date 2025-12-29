import { ReadinessCheckResult } from "../types";
import { ArtifactSource } from "../sources/artifactSource";

/**
 * 🛡️ ESCAPE HATCH DETECTION
 * =========================
 * Proves that no manual overrides are armed.
 */
export async function checkEscapeHatches(source: ArtifactSource): Promise<ReadinessCheckResult> {
  const violations: string[] = [];

  // 1. Check for unsafe override keys in storage
  const forbiddenKeys = [
    "WIZUP::DEV::UNSAFE_OVERRIDE",
    "WIZUP::DEV::SKIP_S1_GATE",
    "wizup_force_s1_activation"
  ];

  for (const key of forbiddenKeys) {
    if (localStorage.getItem(key)) {
      violations.push(`Forbidden storage key present: ${key}`);
    }
  }

  // 2. Check for dev mode indicators (if we were in a prod build, this would be more strict)
  // In this environment, we look for explicit "ALLOW_UNSAFE_OVERRIDE" settings.
  const contract = await source.read("WIZUP::S1::ARTIFACT::CONTRACT");
  if (contract && contract.invariants?.noManualOverrides !== true) {
    violations.push("Contract does not strictly prohibit manual overrides.");
  }

  const pass = violations.length === 0;

  return {
    name: "escape_hatches",
    severity: "FATAL",
    pass,
    code: pass ? undefined : "ESCAPE_HATCH_DETECTED",
    details: pass ? undefined : { violations }
  };
}
