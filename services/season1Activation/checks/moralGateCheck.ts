import { ReadinessCheckResult } from "../types";
import { ArtifactSource } from "../sources/artifactSource";

const GATE_KEY = "WIZUP::GOV::GATE::v1::S1";

export async function checkMoralGateAlignment(source: ArtifactSource): Promise<ReadinessCheckResult> {
  const gate = await source.read(GATE_KEY);

  if (!gate) {
    return {
      name: "moral_gate_alignment",
      severity: "FATAL",
      pass: false,
      code: "MISSING_PREREQUISITE_ARTIFACT"
    };
  }

  if (gate.verdict === "BLOCK") {
    return {
      name: "moral_gate_alignment",
      severity: "FATAL",
      pass: false,
      code: "UNKNOWN_ERROR" // BLOCK is handled in verdict resolver
    };
  }

  // If CONDITIONAL, ensure constraints exist (Prerequisite check already does this, but we reinforce)
  const constraints = await source.read("WIZUP::GOV::CONSTRAINTS::v1::S1");
  const pass = gate.verdict === "ALLOW" || (gate.verdict === "CONDITIONAL" && !!constraints);

  return {
    name: "moral_gate_alignment",
    severity: "FATAL",
    pass,
    code: pass ? undefined : "CONSTRAINTS_NOT_COMPILED"
  };
}
