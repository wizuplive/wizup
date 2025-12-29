/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { ReadSource } from "./sourceTypes";
import { defaultReadinessSink } from "../../season1Activation/persistence/localStorageReadinessSink";
import { season1ArtifactService } from "../../season1Activation/season1Artifact";
import { defaultConstraintSink } from "../../seasonalGovernance/constraintCompiler/sinks/localStorageSink";
import { ActivationReadinessArtifact, Season1ActivationContract } from "../../season1Activation/types";
import { CompiledSeasonConstraints } from "../../seasonalGovernance/constraintCompiler/types";

export const readinessSource: ReadSource<ActivationReadinessArtifact> = {
  async read(seasonId: string) {
    return defaultReadinessSink.read(seasonId);
  }
};

export const contractSource: ReadSource<Season1ActivationContract> = {
  async read() {
    return season1ArtifactService.read("CONTRACT");
  }
};

export const constraintsSource: ReadSource<CompiledSeasonConstraints> = {
  async read(seasonId: string) {
    return defaultConstraintSink.read(seasonId);
  }
};
