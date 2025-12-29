
/**
 * 🏺 SEASON 1 ARTIFACTS
 * =====================
 */

export interface Season1FinalArtifact {
  seasonId: "S1";
  contractHash: string;
  allocationHash: string;
  finalizedAtMs: number;
  status: "FINALIZED";
}

export const season1ArtifactService = {
  save(key: string, data: any): void {
    const storageKey = `WIZUP::S1::ARTIFACT::${key}`;
    if (localStorage.getItem(storageKey)) {
      console.warn(`[ARTIFACT] Refusing overwrite for ${key}`);
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(data));
  },

  read(key: string): any | null {
    const raw = localStorage.getItem(`WIZUP::S1::ARTIFACT::${key}`);
    return raw ? JSON.parse(raw) : null;
  }
};
