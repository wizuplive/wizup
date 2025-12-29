
import { 
  ResolutionInputs, 
  ConstraintAwareResolutionArtifact, 
  AllocationEntry, 
  ConstraintCheckResult 
} from "./types";
import { CompiledSeasonConstraints } from "../../seasonalGovernance/constraintCompiler/types";
import { runCapCheck } from "./checks/capCheck";
import { runExclusionCheck } from "./checks/exclusionCheck";
import { runSignalFilterCheck } from "./checks/signalFilterCheck";
import { runGovernanceLimitCheck } from "./checks/governanceLimitCheck";
import { runDelayCheck } from "./checks/delayCheck";
import { buildProofArtifact } from "./proofBuilder";
import { CALIBRATION_v1_1 } from "../../seasonalSimulation/calibration";
import { requireSeason1ActivatedOrNoop } from "../../season1Runtime/season1Gate";

/**
 * 🧠 CONSTRAINT-AWARE RESOLUTION ENGINE
 */

export async function resolveSeasonWithConstraints(args: {
  seasonId: string;
  constraints: CompiledSeasonConstraints;
  inputs: ResolutionInputs;
}): Promise<ConstraintAwareResolutionArtifact> {
  const { seasonId, constraints, inputs } = args;

  // --- 🔒 RUNTIME ACTIVATION GATE ---
  const gate = await requireSeason1ActivatedOrNoop<ConstraintAwareResolutionArtifact>({ 
    seasonId, 
    context: "resolveSeasonWithConstraints" 
  });
  // fix: Use explicit comparison to ensure type narrowing on discriminated union
  if (gate.ok === false) {
    console.log(`%c[RESOLVER] Season 1 not activated. Returning NOOP artifact.`, "color: #999;");
    return gate.noop;
  }

  // 0. Initial Assertions
  if (constraints.seasonId !== seasonId) {
    throw new Error(`SEASON_MISMATCH: Constraints for ${constraints.seasonId} cannot resolve ${seasonId}`);
  }
  if (!constraints.irreversible) {
    throw new Error("UNSEALED_CONSTRAINTS: Cannot resolve with mutable constraints.");
  }

  // 1. Enforce Constraints
  const filteredSignals = inputs.signals.filter(s => {
    const disabledTypes = constraints.overrides.signalFilters?.disabledSignalTypes || [];
    const communityExclusions = constraints.overrides.exclusions?.communities || [];
    if (disabledTypes.includes(s.type)) return false;
    if (communityExclusions.includes(s.communityId)) return false;
    return true;
  });

  // 2. Run Math
  const rawAllocations: AllocationEntry[] = [];
  const communities = Array.from(new Set(filteredSignals.map(s => s.communityId)));

  for (const cid of communities) {
    const commSignals = filteredSignals.filter(s => s.communityId === cid);
    const userMass: Record<string, number> = {};
    
    commSignals.forEach(s => {
      const weight = (CALIBRATION_v1_1.weights as any)[s.type] || 1.0;
      userMass[s.actorUserId] = (userMass[s.actorUserId] || 0) + weight;
    });

    const totalMass = Object.values(userMass).reduce((a, b) => a + b, 0);
    const maxShare = constraints.overrides.caps?.maxShare || CALIBRATION_v1_1.constraints.WHALE_CEILING;

    Object.entries(userMass).forEach(([userId, mass]) => {
      const share = mass / (totalMass || 1);
      const finalShare = Math.min(share, maxShare);
      rawAllocations.push({ communityId: cid, userId, finalShare });
    });
  }

  // 3. Post-Resolution Verification
  const checks: ConstraintCheckResult[] = [
    runCapCheck(rawAllocations, constraints),
    runExclusionCheck(rawAllocations, constraints),
    runSignalFilterCheck(filteredSignals, constraints),
    runGovernanceLimitCheck(constraints),
    runDelayCheck(inputs.timestamp, constraints)
  ];

  if (checks.some(c => c.status === "FAIL")) {
    throw new Error(`CONSTRAINT_VIOLATION_ABORT`);
  }

  // 4. Build Artifact
  return await buildProofArtifact({
    seasonId,
    allocations: rawAllocations,
    constraints,
    checks,
    inputs
  });
}
