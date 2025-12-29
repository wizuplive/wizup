
import { CanonParameter } from "../../types/canonTypes";
import { CouncilAdoptionRecord, TruthSynthesisReport } from "../../types/truthSynthesisTypes";
import { canonRegistryService } from "./canonRegistryService";
import { seasonStateService } from "./seasonStateService";
import { driftLogService } from "../driftLogService";

/**
 * ⚖️ PARAMETER SUCCESSION SERVICE
 * ===============================
 * Governs the promotion of accepted experiments into Law.
 */

export const parameterSuccessionService = {

  async promoteToCanon(
    key: string, 
    value: any, 
    decision: CouncilAdoptionRecord, 
    report: TruthSynthesisReport
  ): Promise<CanonParameter> {
    
    const state = seasonStateService.get();
    const previous = canonRegistryService.getActiveParameter(key);

    const canonEntry: CanonParameter = {
      canonId: `canon_${Date.now()}_${key}`,
      parameterKey: key,
      parameterValue: value,
      activationSeason: state.activeSeasonId,
      adoptedFromExperimentId: decision.experimentId,
      councilDecisionId: decision.id,
      adoptionRationale: decision.justification,
      effectiveDate: Date.now(),
      supersedesCanonId: previous ? previous.canonId : null,
      metadata: {
        signature: driftLogService.hash({ key, value, decisionId: decision.id }),
        genesisSeason: previous ? previous.metadata.genesisSeason : state.activeSeasonId
      }
    };

    canonRegistryService.saveEntry(canonEntry);
    return canonEntry;
  }
};
