
import { Season1AttestationBundle } from "../types";
import { canonicalize } from "../canonicalize";

/**
 * 📦 JSON EXPORT INTERFACE
 * ========================
 */
export const jsonExport = {
  /**
   * Produces a readable, canonical JSON string of the bundle.
   */
  toString(bundle: Season1AttestationBundle): string {
    return canonicalize(bundle);
  }
};
