import { runShadowWriteParityMonitor } from "./shadowWriteParityMonitor";

export function installShadowWriteParityDevBridge() {
  try {
    const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
    if (!isDev) return;

    (window as any).wizup = (window as any).wizup || {};
    (window as any).wizup.runShadowWriteParity = runShadowWriteParityMonitor;
    
    console.log("%c[MONITOR] Shadow Write Parity Monitor Ready.", "color: #8b5cf6; font-weight: bold;");
  } catch {
    // noop
  }
}
