
import { AllocationEntry, ConstraintCheckResult } from "../types";
import { CompiledSeasonConstraints } from "../../../seasonalGovernance/constraintCompiler/types";

export function runExclusionCheck(
  allocations: AllocationEntry[], 
  constraints: CompiledSeasonConstraints
): ConstraintCheckResult {
  const excluded = constraints.overrides.exclusions?.communities || [];
  if (excluded.length === 0) return { kind: "EXCLUSION", status: "PASS" };

  const violations = allocations.filter(a => excluded.includes(a.communityId));

  return {
    kind: "EXCLUSION",
    status: violations.length === 0 ? "PASS" : "FAIL",
    details: violations.length > 0 ? `Detected allocations for excluded communities: ${Array.from(new Set(violations.map(v => v.communityId))).join(", ")}` : undefined
  };
}
