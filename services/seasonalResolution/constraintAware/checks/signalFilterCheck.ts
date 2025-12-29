
import { ConstraintCheckResult } from "../types";
import { CompiledSeasonConstraints } from "../../../seasonalGovernance/constraintCompiler/types";
import { ZapsSignalEvent } from "../../../zapsSignals/types/zapsSignals.types";

export function runSignalFilterCheck(
  inputSignals: ZapsSignalEvent[],
  constraints: CompiledSeasonConstraints
): ConstraintCheckResult {
  const disabled = constraints.overrides.signalFilters?.disabledSignalTypes || [];
  if (disabled.length === 0) return { kind: "SIGNAL_FILTER", status: "PASS" };

  const violations = inputSignals.filter(s => disabled.includes(s.type));

  return {
    kind: "SIGNAL_FILTER",
    status: violations.length === 0 ? "PASS" : "FAIL",
    details: violations.length > 0 ? `Input set contained ${violations.length} disabled signal events.` : undefined
  };
}
