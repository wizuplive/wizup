import type { ZapsSignalSource } from "./source";
import type { ZapsSignalEvent } from "../../../zapsSignals/zapsSignals.types";

export class LocalMemorySource implements ZapsSignalSource {
  constructor(private readonly deps: { getAllEvents: () => readonly ZapsSignalEvent[] }) {}

  async listByCommunityAndWindow(args: {
    communityId: string;
    startMs: number;
    endMs: number;
  }): Promise<ZapsSignalEvent[]> {
    const all = this.deps.getAllEvents() ?? [];
    return all.filter(
      (e) =>
        e.communityId === args.communityId &&
        e.ts >= args.startMs &&
        e.ts < args.endMs
    );
  }
}
