import type { ProtocolCutoverViolationArtifactV1 } from "../types";

/**
 * 🏺 PROTOCOL CUTOVER VIOLATION SINK INTERFACE
 */
export interface ProtocolCutoverViolationSink {
  emit(v: ProtocolCutoverViolationArtifactV1): Promise<void>; 
}
