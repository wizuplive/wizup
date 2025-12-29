import { activateSeason1 } from "./activateSeason1";
import { isSeason1Activated } from "../season1Runtime/isSeason1Activated";
import { defaultReceiptSink } from "./receiptSinks/compositeReceiptSink";
import { gateAuditHarness } from "../season1Runtime/gateAuditHarness";

/**
 * 🛠️ WIZUP DEV BRIDGE — ACTIVATION EXTENSION
 * =========================================
 */

// Added missing export to fix index.tsx error
export function installSeason1ActivationDevBridge(args: {
  enabled: boolean;
  enableFirestoreShadow: boolean;
}) {
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  if (!isDev || !args.enabled) return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.activateSeason1 = (args: { seasonId: string; decisionHash: string }) => {
    console.log(`%c[ORCHESTRATOR] Initiating S1 Activation: ${args.seasonId}`, "color: #8b5cf6;");
    return activateSeason1(args);
  };

  // 🧪 Harness Wiring
  g.wizup.verifyS1Gate = () => gateAuditHarness.runAudit();
}

export function installActivationDevBridge() {
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  if (!isDev) return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.getActivationStatus = (id: string) => isSeason1Activated(id);
  g.wizup.getActivationReceipt = (id: string) => defaultReceiptSink.read(id);
}
