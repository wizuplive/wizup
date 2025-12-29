import { Season2ReadinessSeed } from "../types";
import { LocalStorageSeedSink } from "./localStorageSeedSink";
import { FirestoreShadowSeedSink } from "./firestoreShadowSeedSink";

export class CompositeSeedSink {
  private local = new LocalStorageSeedSink();
  private cloud = new FirestoreShadowSeedSink();

  async write(seed: Season2ReadinessSeed): Promise<void> {
    await this.local.write(seed);
    await this.cloud.write(seed);
  }

  read(fromSeasonId: string): Season2ReadinessSeed | null {
    return this.local.read(fromSeasonId);
  }
}

export const defaultSeedSink = new CompositeSeedSink();