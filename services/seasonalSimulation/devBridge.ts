import { seasonReportService } from "./seasonReportService";
import { seasonalAllocationSimulation } from "./seasonalAllocationSimulation";

/**
 * 🛠️ WIZUP DEV BRIDGE — SEASON CLOSE EXTENSION
 * ===========================================
 */

declare global {
  interface Window {
    wizup: any;
  }
}

export function initSeasonDevBridge() {
  if (typeof window === 'undefined') return;

  window.wizup = window.wizup || {};

  window.wizup.openSeasonClosePreview = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('dev', 'seasonClose');
    window.location.href = url.toString();
  };

  window.wizup.buildSeason0Report = async () => {
    return await seasonReportService.buildSeason0Report();
  };

  window.wizup.downloadSeason0Report = async () => {
    await seasonReportService.downloadSeason0Report();
  };

  window.wizup.getSeason0ReportHash = async () => {
    const report = await seasonReportService.buildSeason0Report();
    return report.globalSummary.reportHash;
  };
}
