import { Season2CandidateContract } from "./types";
import { candidateSink } from "./persistence";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

/**
 * 🖋️ ARCHITECT ACKNOWLEDGEMENT
 */
export const acknowledgementService = {
  async acknowledge(args: {
    season2Id: string;
    note?: string;
  }): Promise<Season2CandidateContract> {
    const candidate = candidateSink.read(args.season2Id);
    if (!candidate) throw new Error("CANDIDATE_NOT_FOUND");
    
    if (candidate.status === "READY") {
      return candidate; // Idempotent
    }

    // 1. Verify Integrity
    const identityPayload = {
      schemaVersion: candidate.schemaVersion,
      seasonId: candidate.seasonId,
      derivedFrom: candidate.derivedFrom,
      proposed: candidate.proposed,
      status: "CANDIDATE"
    };
    const recomputedHash = await sha256Hex(canonicalJson(identityPayload));
    if (recomputedHash !== candidate.hashes.contractHash) {
      throw new Error("INTEGRITY_FAILURE: Candidate hash mismatch.");
    }

    // 2. Compute Acknowledgement Hash
    const ackPayload = {
      seasonId: args.season2Id,
      contractHash: candidate.hashes.contractHash,
      inputHash: candidate.hashes.inputHash,
      proposalHash: candidate.hashes.proposalHash,
      acknowledgedBy: "ARCHITECT",
      note: args.note || ""
    };
    const acknowledgementHash = await sha256Hex(canonicalJson(ackPayload));

    // 3. Seal
    const readyContract: Season2CandidateContract = {
      ...candidate,
      status: "READY",
      acknowledgement: {
        acknowledgedBy: "ARCHITECT",
        acknowledgedAtMs: Date.now(),
        note: args.note,
        acknowledgementHash
      }
    };

    await candidateSink.write(readyContract);
    console.log(`%c[PROTOCOL] Season 2 READY: ${args.season2Id}. Acknowledgement Hash: ${acknowledgementHash}`, "color: #22c55e; font-weight: bold;");
    
    return readyContract;
  }
};
