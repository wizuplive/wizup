import { AuditPackResult } from "../types";
import { localStorageAuditPackSink } from "./localStorageAuditPackSink";
import { firestoreShadowAuditPackSink } from "./firestoreShadowAuditPackSink";

export const compositeAuditPackSink = {
  async write(result: AuditPackResult): Promise<boolean> {
    // 1. Download Local
    const localOk = await localStorageAuditPackSink.write(result);
    
    // 2. Cloud Shadow
    if (localOk) {
      await firestoreShadowAuditPackSink.write(result);
    }
    
    return localOk;
  }
};
