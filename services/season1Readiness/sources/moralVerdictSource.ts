export type MoralGateVerdictLite = {
  seasonId: string;
  verdict: "ALLOW" | "CONDITIONAL" | "BLOCK";
  moralHash?: string;
  conditionsHash?: string;
};

export interface MoralVerdictSource {
  read(seasonId: string): Promise<MoralGateVerdictLite | null>;
}

export class LocalStorageMoralVerdictSource implements MoralVerdictSource {
  constructor(private readonly storage: Storage = window.localStorage) {}

  private key(seasonId: string) {
    // Mapping to the key defined in localStorageGateSink.ts
    return `WIZUP::GOV::GATE::v1::${seasonId}`;
  }

  async read(seasonId: string): Promise<MoralGateVerdictLite | null> {
    try {
      const raw = this.storage.getItem(this.key(seasonId));
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        seasonId: data.seasonId,
        verdict: data.verdict,
        moralHash: data.hashes?.conscienceHash,
        conditionsHash: data.hashes?.gateStateHash
      };
    } catch {
      return null;
    }
  }
}