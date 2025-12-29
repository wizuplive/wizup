import { SeasonHealthSink } from "./seasonHealthSink";
import { SeasonHealthArtifactV1 } from "../types";
import { LocalStorageSeasonHealthSink } from "./localStorageSeasonHealthSink";
import { FirestoreShadowSeasonHealthSink } from "./firestoreShadowSeasonHealthSink";

export class CompositeSeasonHealthSink implements SeasonHealthSink {
  private local = new LocalStorageSeasonHealthSink();
  private cloud = new FirestoreShadowSeasonHealthSink();

  async write(artifact: SeasonHealthArtifactV1): Promise<boolean> {
    const localOk = await this.local.write(artifact);
    if (localOk) {
      await this.cloud.write(artifact);
    }
    return localOk;
  }

  async read(seasonId: string): Promise<SeasonHealthArtifactV1 | null> {
    const l = await this.local.read(seasonId);
    if (l) return l;
    return await this.cloud.read(seasonId);
  }
}

export const defaultHealthSink = new CompositeSeasonHealthSink();
