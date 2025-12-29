import { runProtocolWriteRouterCoverage } from "./protocolWriteRouter.coverage";

/**
 * 🛠️ WRITE ROUTER COVERAGE DEV BRIDGE
 */
export function installProtocolWriteRouterCoverageDevBridge() {
  try {
    const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
    if (!isDev) return;

    (window as any).wizup = (window as any).wizup || {};
    (window as any).wizup.runProtocolWriteRouterCoverage = runProtocolWriteRouterCoverage;
    
    console.log("%c[TEST] Protocol Write Router Coverage Tools Ready.", "color: #8b5cf6; font-weight: bold;");
  } catch {
    // noop
  }
}
