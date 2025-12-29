
import { Season1AttestationBundle } from "./types";
import { canonicalize } from "./canonicalize";

/**
 * 🖋️ BUNDLE SIGNING SERVICE
 * =========================
 */

export async function signAttestationBundle(
  bundle: Season1AttestationBundle,
  privateKey: CryptoKey,
  keyId: string
): Promise<Season1AttestationBundle> {
  // 1. Strip existing signatures to prepare for fresh sign
  const { signatures, ...contentToSign } = bundle;
  
  // 2. Canonicalize
  const data = new TextEncoder().encode(canonicalize(contentToSign));

  // 3. Sign using ECDSA with P-256 (standard browser support)
  const signatureBuffer = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    privateKey,
    data
  );

  // 4. Encode Signature as Hex
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    ...bundle,
    signatures: {
      systemSignature: signatureHex,
      signedAtMs: Date.now(),
      keyId,
      algorithm: "ECDSA-P256-SHA256"
    },
  };
}

/**
 * Helper to generate an ephemeral keypair for demonstration/audit testing
 */
export async function generateAuditKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );
}
