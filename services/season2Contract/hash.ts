import { sha256Hex as baseSha256, canonicalJson as baseCanonicalJson } from "../zaps/season0/hash";

/**
 * Ensures stable key ordering for cryptographic pinning.
 */
export function canonicalize(value: unknown): string {
  return baseCanonicalJson(value);
}

/**
 * Standard SHA-256 hex digest.
 */
export async function sha256Hex(input: string): Promise<string> {
  return baseSha256(input);
}

/**
 * Compute hash of a candidate contract, excluding volatile builtAtMs.
 */
export async function hashContract(contract: any): Promise<string> {
  const { builder, ...stable } = contract;
  const hashable = {
    ...stable,
    builder: { builderVersion: builder.builderVersion }
  };
  return await sha256Hex(canonicalize(hashable));
}

/**
 * Compute hash of an acknowledgement, excluding volatile ackAtMs.
 */
export async function hashAcknowledgement(ack: any): Promise<string> {
  const { ackAtMs, ...stable } = ack;
  return await sha256Hex(canonicalize(stable));
}
