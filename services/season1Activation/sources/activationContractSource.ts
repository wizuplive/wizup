/**
 * 📖 READ-ONLY CONTRACT SOURCE
 */

export type ActivationContractLite = {
  schemaVersion?: string;
  seasonId: string;
  sealed?: boolean;
  activationHash: string; // base hash for unsealed contract
  payload?: unknown;
};

export interface ActivationContractSource {
  readUnsealed(seasonId: string): Promise<ActivationContractLite | null>;
}

export class LocalStorageActivationContractSource implements ActivationContractSource {
  constructor(private readonly storage: Storage = window.localStorage) {}

  private key(seasonId: string) {
    return `WIZUP::S1::ARTIFACT::CONTRACT`;
  }

  async readUnsealed(seasonId: string): Promise<ActivationContractLite | null> {
    try {
      const raw = this.storage.getItem(this.key(seasonId));
      return raw ? (JSON.parse(raw) as ActivationContractLite) : null;
    } catch {
      return null;
    }
  }
}
