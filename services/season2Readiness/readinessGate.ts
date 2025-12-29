import { ReadinessGateResult } from "./types";
import { candidateSink } from "./persistence";
import { sha256Hex, canonicalJson } from "../zaps/season0/hash";

/**
 * 🛡️ SEASON 2 READINESS GATE
 * Enforcement primitive for the S2 activation orchestrator.
 */
export async function isSeason2Ready(season2Id: string): Promise<ReadinessGateResult> {
  try {
    const candidate = candidateSink.read(season2Id);
    if (!candidate) return { ready: false, error: "CANDIDATE_MISSING" };

    if (candidate.status !== "READY") return { ready: false, error: "NOT_ACKNOWLEDGED" };

    if (!candidate.acknowledgement?.acknowledgementHash) return { ready: false, error: "AUTH_LINK_MISSING" };

    // Integrity Audit
    const identityPayload = {
      schemaVersion: candidate.schemaVersion,
      seasonId: candidate.seasonId,
      derivedFrom: candidate.derivedFrom,
      proposed: candidate.proposed,
      status: "CANDIDATE"
    };
    const recomputedHash = await sha256Hex(canonicalJson(identityPayload));
    
    if (recomputedHash !== candidate.hashes.contractHash) {
      return { ready: false, error: "INTEGRITY_DIVERGENCE" };
    }

    return {
      ready: true,
      contractHash: candidate.hashes.contractHash,
      proposalHash: candidate.hashes.proposalHash,
      inputHash: candidate.hashes.inputHash
    };

  } catch (e: any) {
    return { ready: false, error: e.message || "GATE_RUNTIME_ERROR" };
  }
}
