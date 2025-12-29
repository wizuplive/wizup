import { CUTOVER_RECEIPT_KEY, PRIMARY_READ_MODE_KEY } from "./keys";

export type CutoverGuardState = {
  isProduction: boolean;
  cutoverIsActive: boolean; 
  cutoverReceiptHash?: string;
  primaryReadMode?: string | null;
};

export function getCutoverGuardState(args?: {
  storage?: Storage;
  mode?: string; 
}): CutoverGuardState {
  const storage = args?.storage ?? window.localStorage;
  const mode = args?.mode ?? (import.meta as any).env?.MODE;

  const isProduction = mode === "production";

  try {
    const raw = storage.getItem(CUTOVER_RECEIPT_KEY);
    const receipt = raw ? JSON.parse(raw) : null;
    const cutoverIsActive = receipt?.state?.mode === "FIRESTORE_PRIMARY";

    const primaryReadMode = storage.getItem(PRIMARY_READ_MODE_KEY);

    return {
      isProduction,
      cutoverIsActive,
      cutoverReceiptHash: receipt?.hashes?.receiptHash,
      primaryReadMode,
    };
  } catch {
    return { isProduction, cutoverIsActive: false };
  }
}
