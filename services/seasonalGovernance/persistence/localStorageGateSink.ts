
import { SeasonGateSink } from "./gateSink";
import { SeasonGateState } from "../types";

const GATE_KEY_PREFIX = "WIZUP::GOV::GATE::v1::";

export class LocalStorageGateSink implements SeasonGateSink {
  async write(state: SeasonGateState): Promise<void> {
    const key = `${GATE_KEY_PREFIX}${state.seasonId}`;
    if (localStorage.getItem(key)) {
      console.warn(`[GATEKEEPER] Refusing overwrite for season ${state.seasonId}`);
      return;
    }
    localStorage.setItem(key, JSON.stringify(state));
  }

  async read(seasonId: string): Promise<SeasonGateState | null> {
    const key = `${GATE_KEY_PREFIX}${seasonId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

export const defaultGateSink = new LocalStorageGateSink();
