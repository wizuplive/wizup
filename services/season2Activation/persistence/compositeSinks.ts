import { Season2SealedContract, Season2ActivationReceipt } from "../types";
import { localStorageSinks } from "./localStorageSinks";
import { firestoreShadowSinks } from "./firestoreShadowSinks";

export const compositeSinks = {
  async writeSealedContract(contract: Season2SealedContract): Promise<boolean> {
    const ok = await localStorageSinks.writeSealedContract(contract);
    if (ok) {
      await firestoreShadowSinks.writeSealedContract(contract);
    }
    return ok;
  },

  async writeReceipt(receipt: Season2ActivationReceipt): Promise<boolean> {
    const ok = await localStorageSinks.writeReceipt(receipt);
    if (ok) {
      await firestoreShadowSinks.writeReceipt(receipt);
    }
    return ok;
  }
};
