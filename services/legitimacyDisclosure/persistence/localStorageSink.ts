
import { DisclosureSink } from "./disclosureSink";
import { PublicLegitimacyDisclosure } from "../types";

const DISCLOSURE_KEY_PREFIX = "WIZUP::PROTOCOL::DISCLOSURE::v1::";

export class LocalStorageDisclosureSink implements DisclosureSink {
  async write(disclosure: PublicLegitimacyDisclosure): Promise<void> {
    const key = `${DISCLOSURE_KEY_PREFIX}${disclosure.seasonId}`;
    if (localStorage.getItem(key)) {
      console.warn(`[PROTOCOL] Disclosure for ${disclosure.seasonId} is already frozen.`);
      return;
    }
    localStorage.setItem(key, JSON.stringify(disclosure));
  }

  async read(seasonId: string): Promise<PublicLegitimacyDisclosure | null> {
    const key = `${DISCLOSURE_KEY_PREFIX}${seasonId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

export const defaultDisclosureSink = new LocalStorageDisclosureSink();
