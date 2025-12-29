
import { Season1AttestationBundle } from "../types";
import { jsonExport } from "./jsonExport";

/**
 * 💾 FILE EXPORT INTERFACE
 * ========================
 */
export const fileExport = {
  /**
   * Triggers a browser download of the attestation JSON.
   */
  download(bundle: Season1AttestationBundle): void {
    const content = jsonExport.toString(bundle);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `wizup-attestation-${bundle.seasonId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`%c[ATTESTATION] File exported for season ${bundle.seasonId}`, "color: #22c55e; font-weight: bold;");
  }
};
