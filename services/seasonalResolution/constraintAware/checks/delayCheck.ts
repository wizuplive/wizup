
import { ConstraintCheckResult } from "../types";
import { CompiledSeasonConstraints } from "../../../seasonalGovernance/constraintCompiler/types";

export function runDelayCheck(
  resolutionTime: number,
  constraints: CompiledSeasonConstraints
): ConstraintCheckResult {
  const delay = constraints.overrides.delays?.distributionDelayMs || 0;
  if (delay === 0) return { kind: "DELAY", status: "PASS" };

  // Verifies that the resolution timestamp respects the delay from the issued time
  const minAllowedTime = constraints.appliedAtMs + delay;
  const isOk = resolutionTime >= minAllowedTime;

  return {
    kind: "DELAY",
    status: isOk ? "PASS" : "FAIL",
    details: !isOk ? `Resolution time ${resolutionTime} is before delayed threshold ${minAllowedTime}` : undefined
  };
}
