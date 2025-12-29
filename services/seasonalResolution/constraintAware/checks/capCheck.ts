
import { AllocationEntry, ConstraintCheckResult } from "../types";
import { CompiledSeasonConstraints } from "../../../seasonalGovernance/constraintCompiler/types";

export function runCapCheck(
  allocations: AllocationEntry[], 
  constraints: CompiledSeasonConstraints
): ConstraintCheckResult {
  const maxShare = constraints.overrides.caps?.maxShare;
  if (maxShare === undefined) return { kind: "CAP", status: "PASS" };

  const violations = allocations.filter(a => a.finalShare > maxShare + 0.000001); // Float tolerance

  return {
    kind: "CAP",
    status: violations.length === 0 ? "PASS" : "FAIL",
    details: violations.length > 0 ? `${violations.length} users exceeded maxShare ${maxShare}` : undefined
  };
}
