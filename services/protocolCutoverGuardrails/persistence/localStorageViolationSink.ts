import { PROTOCOL_CUTOVER_VIOLATION_INDEX_KEY, PROTOCOL_CUTOVER_VIOLATION_KEY_PREFIX } from "../keys";
import type { ProtocolCutoverViolationArtifactV1 } from "../types";
import type { ProtocolCutoverViolationSink } from "./violationSink";

export class LocalStorageProtocolCutoverViolationSink implements ProtocolCutoverViolationSink {
  async emit(v: ProtocolCutoverViolationArtifactV1): Promise<void> {
    try {
      const storage = window.localStorage;
      if (!storage) return;

      const itemKey = `${PROTOCOL_CUTOVER_VIOLATION_KEY_PREFIX}${v.id}`;
      storage.setItem(itemKey, JSON.stringify(v));

      const rawIndex = storage.getItem(PROTOCOL_CUTOVER_VIOLATION_INDEX_KEY);
      const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      
      if (!index.includes(v.id)) {
        index.unshift(v.id);
        const capped = index.slice(0, 100);
        storage.setItem(PROTOCOL_CUTOVER_VIOLATION_INDEX_KEY, JSON.stringify(capped));
      }
    } catch {
      // fail-open
    }
  }
}
