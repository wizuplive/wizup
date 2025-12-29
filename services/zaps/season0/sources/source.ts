import type { ZapsSignalEvent } from "../../../zapsSignals/zapsSignals.types";

export interface ZapsSignalSource {
  listByCommunityAndWindow(args: {
    communityId: string;
    startMs: number;
    endMs: number;
  }): Promise<ZapsSignalEvent[]>;
}
