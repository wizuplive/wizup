import type { ProtocolCutoverViolationArtifactV1 } from "../types";
import type { ProtocolCutoverViolationSink } from "./violationSink";
import { LocalStorageProtocolCutoverViolationSink } from "./localStorageViolationSink";
import { FirestoreShadowProtocolCutoverViolationSink } from "./firestoreShadowViolationSink";

export class CompositeProtocolCutoverViolationSink implements ProtocolCutoverViolationSink {
  private sinks: ProtocolCutoverViolationSink[];

  constructor() {
    this.sinks = [
      new LocalStorageProtocolCutoverViolationSink(),
      new FirestoreShadowProtocolCutoverViolationSink()
    ];
  }

  async emit(v: ProtocolCutoverViolationArtifactV1): Promise<void> {
    await Promise.all(this.sinks.map(s => s.emit(v).catch(() => {})));
  }
}

export const defaultCutoverViolationSink = new CompositeProtocolCutoverViolationSink();
