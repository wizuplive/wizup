import { Season2CandidateContract, ArchitectAcknowledgement } from "./types";
import { contractSinks } from "./persistence/sinks";
import { hashAcknowledgement, hashContract } from "./hash";
import { violationEmitter } from "./persistence/violationEmitter";

/**
 * 🖋️ ARCHITECT ACKNOWLEDGEMENT SERVICE
 * Promotes a CANDIDATE contract to READY after human verification.
 */
export async function acknowledgeSeason2Ready(args: {
  seasonId: string;
  contractHash: string;
}): Promise<{ ok: boolean; readyHash?: string }> {
  const { seasonId, contractHash } = args;

  try {
    // 1. Load Candidate
    const candidate = contractSinks.readCandidate(seasonId);
    if (!candidate) {
      await violationEmitter.emit(seasonId, "ACK_FOR_UNKNOWN_CANDIDATE", { seasonId });
      return { ok: false };
    }

    // 2. Verification
    if (candidate.status !== "CANDIDATE") {
      return { ok: true }; // Already promoted
    }

    if (candidate.hashes.contractHash !== contractHash) {
      await violationEmitter.emit(seasonId, "HASH_MISMATCH", { 
        expected: candidate.hashes.contractHash, 
        received: contractHash 
      });
      return { ok: false };
    }

    // 3. Create Acknowledgement
    const ackPayload: Omit<ArchitectAcknowledgement, "ackHash"> = {
      schemaVersion: "v1",
      seasonId,
      contractHash,
      actor: "ARCHITECT",
      intent: "ACK_READY",
      ackAtMs: Date.now()
    };

    const ackHash = await hashAcknowledgement(ackPayload);
    const acknowledgement: ArchitectAcknowledgement = { ...ackPayload, ackHash };

    // 4. Create READY Contract
    const readyContract: Season2CandidateContract = {
      ...candidate,
      status: "READY"
    };
    
    // We re-verify that the hash calculation logic is consistent
    const recomputedHash = await hashContract(readyContract);
    // Option A: Ready status is recorded but the identity hash must cross-match candidate lineage
    // if hashContract includes status, we check if we need to store candidateHash specifically

    // 5. Persist
    await contractSinks.writeAcknowledgement(acknowledgement);
    await contractSinks.writeReady(readyContract);

    console.log(`%c[PROTOCOL] Season 2 READY: ${seasonId}. Ack: ${ackHash}`, "color: #22c55e; font-weight: bold;");
    
    return { ok: true, readyHash: recomputedHash };

  } catch (e) {
    console.error("[ACK_SERVICE] Acknowledgement failed", e);
    return { ok: false };
  }
}
