import { buildSeasonAuditPack } from "./buildAuditPack";
import { compositeAuditPackSink } from "./persistence/compositeAuditPackSink";
import { DEV_AUDIT_EXPORT } from "../../config/devFlags";
import { ENABLE_AUDIT_EXPORT } from "../../config/featureFlagsSeasons";

/**
 * 🛠️ AUDIT EXPORT DEV BRIDGE
 */
export function installSeasonAuditExportDevBridge() {
  if (typeof window === 'undefined') return;
  if (!DEV_AUDIT_EXPORT || !ENABLE_AUDIT_EXPORT) return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.exportSeasonAuditPack = async (seasonId: string) => {
    console.log(`%c[AUDIT_PACK] Initiating export for ${seasonId}...`, "color: #8b5cf6; font-weight: bold;");
    const result = await buildSeasonAuditPack(seasonId);
    
    if (!result) {
      console.error("🚨 EXPORT ABORTED: Missing required artifacts or integrity mismatch.");
      return null;
    }

    const ok = await compositeAuditPackSink.write(result);
    if (ok) {
       console.log(`%c[AUDIT_PACK] Successfully Exported: ${result.fileName}`, "color: #22c55e; font-weight: bold;");
    }
    return result.manifest;
  };

  g.wizup.previewSeasonAuditPack = async (seasonId: string) => {
    const result = await buildSeasonAuditPack(seasonId);
    if (result) {
      console.group(`%c[AUDIT_PACK] Preview: ${seasonId}`, "color: #3b82f6; font-weight: bold;");
      console.log("Pack Hash:", result.manifest.packHash);
      console.log("Artifacts:", result.manifest.artifactOrder.length);
      console.table(result.manifest.artifactHashes);
      console.groupEnd();
    }
    return result;
  };

  console.log("%c[OBSERVABILITY] Season Audit Export Pipeline Loaded.", "color: #a855f7; font-weight: bold;");
}
