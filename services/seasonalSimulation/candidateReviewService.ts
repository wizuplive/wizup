
import { ExperimentCandidate, CandidateAuth } from "../../types/experimentCandidateTypes";
import { candidateSelectionService } from "./candidateSelectionService";
import { experimentRegistryService } from "./experimentRegistryService";

/**
 * ⚖️ SEASON 5 — CANDIDATE REVIEW SERVICE
 * =====================================
 * The Human Gate. Promotes candidates to the authoritative registry.
 */

export const candidateReviewService = {

  /**
   * Promotes a candidate to an active experiment.
   * COMPLIANCE: Requires Human Authorization Artifact.
   */
  async promote(candidateId: string, auth: CandidateAuth) {
    const candidates = candidateSelectionService.getCandidates();
    const candidate = candidates.find(c => c.id === candidateId);

    if (!candidate || candidate.status !== 'DRAFT') {
      throw new Error("Candidate not eligible for promotion.");
    }

    // 1. Convert to ExperimentRegistryEntry (Season 2 schema style)
    const registryEntry = {
      experimentId: `EXP_${candidate.id.toUpperCase()}`,
      domain: candidate.domain.toUpperCase() as any,
      signalType: "REPUTATION" as any, // Default to domain-level for S5
      hypothesis: candidate.hypothesis,
      parameterVariant: candidate.proposedDelta.parameter,
      variantDescription: candidate.uncertaintyNotes,
      createdBy: "SYSTEM" as any,
      constraints: {
        maxDeviationPct: candidate.proposedDelta.deltaPercent,
        roleCapsEnforced: true as const,
        communityScoped: true as const,
        writeOnly: true as const
      },
      metadata: {
        authorizedBy: auth.approvedBy,
        cohort: auth.scopeCohort,
        signedAt: Date.now(),
        candidateId: candidate.id
      }
    };

    // 2. Push to Registry
    experimentRegistryService.register(registryEntry);

    // 3. Mark as Promoted
    candidateSelectionService.updateCandidateStatus(candidateId, 'PROMOTED');

    console.log(`%c[AUTHORITY] Candidate ${candidateId} promoted to Experiment Registry.`, "color: #22c55e; font-weight: bold;");
  },

  /**
   * Rejects a candidate. 
   * COMPLIANCE: Triggers anti-spam cooldown if repeated.
   */
  async reject(candidateId: string, rationale: string) {
    candidateSelectionService.updateCandidateStatus(candidateId, 'REJECTED', true);
    console.log(`%c[AUTHORITY] Candidate ${candidateId} rejected. Rationale: ${rationale}`, "color: #ef4444; font-weight: bold;");
  }
};
