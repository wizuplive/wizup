import type { ProtocolViolationArtifact } from "./protocolViolationTypes";

/**
 * 💾 PROTOCOL VIOLATION SINK
 */

function violationDocKey(id: string) {
  return `wizup:protocol:violations:v1:${id}`;
}

function violationIndexKey() {
  return "wizup:protocol:violations:index:v1";
}

export class LocalStorageProtocolViolationSink {
  constructor(private readonly cfg: { maxIndexEntries: number } = { maxIndexEntries: 200 }) {}

  write(v: ProtocolViolationArtifact): void {
    try {
      window.localStorage.setItem(violationDocKey(v.id), JSON.stringify(v));

      const idxRaw = window.localStorage.getItem(violationIndexKey());
      const idx: string[] = idxRaw ? JSON.parse(idxRaw) : [];
      const next = [v.id, ...idx.filter((x) => x !== v.id)].slice(0, this.cfg.maxIndexEntries);
      window.localStorage.setItem(violationIndexKey(), JSON.stringify(next));
    } catch {
      // fail-open
    }
  }
}
