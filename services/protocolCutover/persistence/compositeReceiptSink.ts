
import type { CutoverReceiptSink } from "./receiptSink";
import type { CutoverReceiptV1 } from "../types";

export class CompositeCutoverReceiptSink implements CutoverReceiptSink {
  constructor(private readonly sinks: CutoverReceiptSink[]) {}

  async read(): Promise<CutoverReceiptV1 | null> {
    for (const s of this.sinks) {
      const r = await s.read();
      if (r) return r;
    }
    return null;
  }

  // Corrected type name from ProtocolCutoverReceiptV1 to CutoverReceiptV1
  async writeOnce(receipt: CutoverReceiptV1): Promise<{ wrote: boolean; reason?: string }> {
    const results = await Promise.all(this.sinks.map((s) => s.writeOnce(receipt)));
    const already = results.find((r) => r.reason === "ALREADY_CUTOVER_IRREVERSIBLE");
    if (already) return { wrote: false, reason: "ALREADY_CUTOVER_IRREVERSIBLE" };

    const wroteAny = results.some((r) => r.wrote);
    return wroteAny ? { wrote: true } : { wrote: false, reason: results.map((r) => r.reason).join("|") };
  }
}