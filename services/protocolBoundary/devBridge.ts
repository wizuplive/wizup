import { getAuthoritativeManifest } from "./manifest";
import { protocolIntegrityGuard } from "./guards/protocolIntegrityGuard";
import { freezeMatrix } from "./checklists/freezeMatrix";
import { backendIntegrationChecklist } from "./checklists/backendIntegrationChecklist";

/**
 * 🛠️ PROTOCOL BOUNDARY DEV BRIDGE
 * Console-only visibility.
 */
export function installProtocolBoundaryDevBridge() {
  if (typeof window === 'undefined') return;

  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.protocol = {
    inspectBoundary: async () => await getAuthoritativeManifest(),
    computeFingerprint: async () => await protocolIntegrityGuard.computeRuntimeFingerprint(),
    getFreezeMatrix: () => freezeMatrix,
    getIntegrationChecklist: () => backendIntegrationChecklist,
    
    help: () => {
      console.log("%c--- Protocol Boundary Contract Tools ---", "color: #a855f7; font-weight: bold;");
      console.log("wizup.protocol.inspectBoundary()");
      console.log("wizup.protocol.computeFingerprint()");
      console.log("wizup.protocol.getFreezeMatrix()");
    }
  };

  console.log("%c[BOUNDARY] Protocol Boundary Contract Active.", "color: #8b5cf6; font-weight: bold;");
}
