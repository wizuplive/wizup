/**
 * 0) GLOBAL NON-NEGOTIABLES
 * NO UI CHANGES. NO UX CHANGES. NO ROUTE CHANGES. NO COPY CHANGES.
 */

import { attemptSeason1Activation } from "../season1ActivationOrchestrator";
import { isSeason1Activated } from "../isSeason1Activated";
import { defaultReceiptSink } from "../persistence/compositeReceiptSink";
import { contractSealSink } from "../persistence/contractSealSink";

export function initOrchestratorDevBridge() {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  window.wizup = window.wizup || {};

  Object.assign(window.wizup, {
    attemptSeason1Activation: (id: string = "S1") => 
      attemptSeason1Activation({ seasonId: id, mode: "DEV_MANUAL" }),
    
    checkSeason1Status: (id: string = "S1") => 
      isSeason1Activated(id),
    
    getSeason1Receipt: (id: string = "S1") => 
      defaultReceiptSink.read(id),
      
    getSealedContract: (id: string = "S1") => 
      contractSealSink.read(id)
  });
}
