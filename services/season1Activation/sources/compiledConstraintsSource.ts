/**
 * 📖 READ-ONLY CONSTRAINTS SOURCE
 */

export type CompiledConstraintsLite = {
  schemaVersion?: string;
  seasonId: string;
  hashes?: {
    constraintsHash?: string;
  };
  overrides?: unknown;
};

export interface CompiledConstraintsSource {
  read(seasonId: string): Promise<CompiledConstraintsLite | null>;
}

export class LocalStorageCompiledConstraintsSource implements CompiledConstraintsSource {
  constructor(private readonly storage: Storage = window.localStorage) {}

  private key(seasonId: string) {
    return `WIZUP::GOV::CONSTRAINTS::v1::${seasonId}`;
  }

  async read(seasonId: string): Promise<CompiledConstraintsLite | null> {
    try {
      const raw = this.storage.getItem(this.key(seasonId));
      return raw ? (JSON.parse(raw) as CompiledConstraintsLite) : null;
    } catch {
      return null;
    }
  }
}
