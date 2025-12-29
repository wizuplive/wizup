import { Season2CandidateContract } from "./types";
import { s1Sources } from "./sources";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";
import { CALIBRATION_v1_1 } from "../seasonalSimulation/calibration";
import { candidateSink } from "./persistence";

/**
 * 🏗️ SEASON 2 CANDIDATE BUILDER
 */
export const candidateBuilder = {
  async buildCandidate(season2Id: string, season1Id: string): Promise<Season2CandidateContract> {
    const s1 = await s1Sources.getS1State(season1Id);

    // 1. Compute Input Hash (Stable fields only)
    const inputPayload = {
      archiveHash: s1.archive.archiveHash,
      receiptHash: s1.receipt.receiptHash,
      constraintsHash: s1.constraints.hashes.compiledHash
    };
    const inputHash = await sha256Hex(canonicalJson(inputPayload));

    // 2. Build Proposed Snapshots (Deterministic Carry-Forward)
    const proposed = {
      parametersSnapshot: CALIBRATION_v1_1, // Current baseline law
      constraintsSnapshot: s1.constraints.overrides, // Inheritance
      rationale: ["Baseline protocol continuity.", "Carrying forward Season 1 stable parameters."]
    };
    const proposalHash = await sha256Hex(canonicalJson(proposed));

    // 3. Construct Contract
    const partialContract: Omit<Season2CandidateContract, "hashes"> = {
      schemaVersion: "s2-candidate-v1",
      seasonId: season2Id,
      derivedFrom: {
        season1Id,
        archiveBundleHash: s1.archive.archiveHash,
        endReceiptHash: s1.receipt.receiptHash,
        finalConstraintsHash: s1.constraints.hashes.compiledHash
      },
      proposed,
      status: "CANDIDATE",
      createdAtMs: Date.now()
    };

    // 4. Compute Identity Hash (contractHash)
    // Exclude volatile createdAtMs and future acknowledgement
    const identityPayload = {
      schemaVersion: partialContract.schemaVersion,
      seasonId: partialContract.seasonId,
      derivedFrom: partialContract.derivedFrom,
      proposed: partialContract.proposed,
      status: "CANDIDATE"
    };
    const contractHash = await sha256Hex(canonicalJson(identityPayload));

    const contract: Season2CandidateContract = {
      ...partialContract,
      hashes: {
        inputHash,
        proposalHash,
        contractHash,
        runnerVersion: "season2Readiness@v1"
      }
    };

    // 5. Persist
    await candidateSink.write(contract);

    return contract;
  }
};
