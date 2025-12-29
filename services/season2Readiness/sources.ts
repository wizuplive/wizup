import { archivalPersistence } from "../seasonEnd/persistence";
import { defaultConstraintSink } from "../seasonalGovernance/constraintCompiler/sinks/localStorageSink";

/**
 * 📖 SEASON 1 ARTIFACT SOURCES
 */
export const s1Sources = {
  async getS1State(season1Id: string) {
    // Added await for async archivalPersistence methods to fix property access on Promises
    const archive = await archivalPersistence.getArchive(season1Id);
    const receipt = await archivalPersistence.getReceipt(season1Id);
    const constraints = await defaultConstraintSink.read(season1Id);

    // 🛡️ LINEAGE GUARD: Season 2 must only be derivable from a properly finalized Season 1.
    if (!receipt) {
      throw new Error(`S1_RECEIPT_MISSING: Cannot build lineage for ${season1Id}. Season End Receipt not found.`);
    }

    if (receipt.status !== "FINALIZED") {
      throw new Error(`S1_NOT_FINALIZED: Lineage blocked. Season ${season1Id} end receipt status is ${receipt.status}, expected FINALIZED.`);
    }

    if (!archive || !constraints) {
      throw new Error(`S1_STATE_INCOMPLETE: Required archival artifacts missing for ${season1Id}`);
    }

    return {
      archive,
      receipt,
      constraints
    };
  }
};