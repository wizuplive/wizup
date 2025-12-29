/**
 * 🩺 BOOT INTEGRITY TYPES
 */

export type FirestoreAvailability = {
  configured: boolean; // do we have a client/writer at all?
  available: boolean;  // do we believe it can be used?
  reason?: string;     // human-readable internal reason
};

export interface FirestoreAvailabilityProbe {
  probe(): Promise<FirestoreAvailability>; // never throws
}
