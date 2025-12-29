
/**
 * 🕊️ PUBLIC LEGITIMACY DISCLOSURE — TYPES
 * ========================================
 */

export type DisclosureStatus = "VERIFIED" | "CONDITIONALLY_VERIFIED";

export interface PublicLegitimacyDisclosure {
  seasonId: string; // "S1"

  status: DisclosureStatus;

  proof: {
    attestationHash: string; // SHA-256
    verificationInstructionsURI: string; // static, versioned
  };

  issuedAtMs: number;

  schemaVersion: "v1";
}
