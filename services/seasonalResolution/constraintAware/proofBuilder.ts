
import { 
  ConstraintAwareResolutionArtifact, 
  AllocationEntry, 
  ConstraintCheckResult, 
  ResolutionInputs 
} from "./types";
import { CompiledSeasonConstraints } from "../../seasonalGovernance/constraintCompiler/types";
import { hashResolutionInputs, hashResolutionOutputs } from "./hash";

/**
 * 🏺 PROOF-OF-COMPLIANCE BUILDER
 * ==============================
 */

export async function buildProofArtifact(args: {
  seasonId: string;
  allocations: AllocationEntry[];
  constraints: CompiledSeasonConstraints;
  checks: ConstraintCheckResult[];
  inputs: ResolutionInputs;
}): Promise<ConstraintAwareResolutionArtifact> {
  
  const inputHash = await hashResolutionInputs(args.inputs);
  const constraintHash = args.constraints.hashes.compiledHash;
  const outputHash = await hashResolutionOutputs(args.allocations);

  return {
    seasonId: args.seasonId,
    allocations: args.allocations,
    constraintProofs: {
      constraintHash,
      checks: args.checks,
    },
    hashes: {
      inputHash,
      constraintHash,
      outputHash,
      engineVersion: "constraintAwareResolver@v1",
    },
    verdict: "COMPLIANT",
  };
}
