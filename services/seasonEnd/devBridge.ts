import { seasonEndFinalizer } from "./seasonEndFinalizer";
import { archivalPersistence } from "./persistence";

export const installSeasonEndDevBridge = () => {
  const g = (window as any);
  g.wizup = g.wizup || {};

  g.wizup.finalizeSeason1 = async (id: string = "S1") => {
    return await seasonEndFinalizer.finalizeSeason1({ seasonId: id });
  };

  g.wizup.inspectArchive = (id: string = "S1") => {
    return {
      receipt: archivalPersistence.getReceipt(id),
      archive: archivalPersistence.getArchive(id)
    };
  };
};
