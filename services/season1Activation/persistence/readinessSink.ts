import { ActivationReadinessArtifact } from "../types";

export interface ReadinessSink {
  write(artifact: ActivationReadinessArtifact): Promise<void>;
  read(seasonId: string): Promise<ActivationReadinessArtifact | null>;
}
