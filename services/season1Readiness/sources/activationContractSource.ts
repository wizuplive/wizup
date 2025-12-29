export type ActivationContractLite = {
  seasonId: string;
  sealed?: boolean;
  activationHash?: string;
  version?: string;
};

export interface ActivationContractSource {
  read(seasonId: string): Promise<ActivationContractLite | null>;
}

export class LocalStorageActivationContractSource implements ActivationContractSource {
  constructor(private readonly storage: Storage = window.localStorage) {}

  private key(seasonId: string) {
    // Mapping to the authoritative contract key used in season1Artifact.ts
    return `WIZUP::S1::ARTIFACT::CONTRACT`;
  }

  async read(seasonId: string): Promise<ActivationContractLite | null> {
    try {
      const raw = this.storage.getItem(this.key(seasonId));
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        seasonId: data.seasonId,
        sealed: data.sealed || false,
        activationHash: data.activationHash,
        version: "v1"
      };
    } catch {
      return null;
    }
  }
}