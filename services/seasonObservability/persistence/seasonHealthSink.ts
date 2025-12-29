import { SeasonHealthArtifactV1 } from "../types";

export interface SeasonHealthSink {
  write(artifact: SeasonHealthArtifactV1): Promise<boolean>;
  read(seasonId: string): Promise<SeasonHealthArtifactV1 | null>;
}
