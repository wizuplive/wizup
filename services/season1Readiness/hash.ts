import { sha256Hex as baseSha256, canonicalJson as baseCanonicalJson } from "../zaps/season0/hash";

export function canonicalJson(value: unknown): string {
  return baseCanonicalJson(value);
}

export async function sha256Hex(input: string): Promise<string> {
  return baseSha256(input);
}