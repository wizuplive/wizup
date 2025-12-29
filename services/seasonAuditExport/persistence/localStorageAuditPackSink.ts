import { AuditPackResult } from "../types";

/**
 * 💾 LOCAL JSONL EXPORT SINK
 * Triggers a browser download to provide a portable file.
 */
export const localStorageAuditPackSink = {
  async write(result: AuditPackResult): Promise<boolean> {
    try {
      const blob = new Blob([result.lines.join("\n")], { type: "application/x-jsonlines" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (e) {
      console.error("[SINK_ERROR] Local export failed", e);
      return false;
    }
  }
};
