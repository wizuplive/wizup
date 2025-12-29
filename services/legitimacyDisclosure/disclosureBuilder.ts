
import { PublicLegitimacyDisclosure } from "./types";
import { Season1AttestationBundle } from "../attestation/types";

/**
 * 🕊️ DISCLOSURE BUILDER
 * =====================
 */

export function buildPublicDisclosure(args: {
  attestationBundle: Season1AttestationBundle;
}): PublicLegitimacyDisclosure {
  const verdict = args.attestationBundle.artifacts.moralVerdict.verdict;

  if (verdict === "BLOCK") {
    throw new Error("ATTESTATION_VIOLATION: Blocked seasons may not disclose legitimacy.");
  }

  return {
    seasonId: args.attestationBundle.seasonId,
    status:
      verdict === "ALLOW"
        ? "VERIFIED"
        : "CONDITIONALLY_VERIFIED",
    proof: {
      attestationHash: args.attestationBundle.hashes.allocationOutputHash,
      verificationInstructionsURI:
        "https://docs.wizup.protocol/legitimacy/verify/v1",
    },
    issuedAtMs: Date.now(),
    schemaVersion: "v1",
  };
}
