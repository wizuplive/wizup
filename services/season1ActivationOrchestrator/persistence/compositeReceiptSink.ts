/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { ActivationReceiptSink } from "./receiptSink";
import { ActivationReceipt } from "../types/activationReceipt";
import { LocalStorageReceiptSink } from "./localStorageReceiptSink";
import { FirestoreShadowReceiptSink } from "./firestoreShadowReceiptSink";

export class CompositeReceiptSink implements ActivationReceiptSink {
  private sinks: ActivationReceiptSink[];

  constructor() {
    this.sinks = [
      new LocalStorageReceiptSink(),
      new FirestoreShadowReceiptSink()
    ];
  }

  async write(receipt: ActivationReceipt): Promise<void> {
    await Promise.all(this.sinks.map(s => s.write(receipt)));
  }

  async read(seasonId: string): Promise<ActivationReceipt | null> {
    // Prefer localStorage for speed/availability, fallback to others if needed
    for (const sink of this.sinks) {
      const r = await sink.read(seasonId);
      if (r) return r;
    }
    return null;
  }
}

export const defaultReceiptSink = new CompositeReceiptSink();
