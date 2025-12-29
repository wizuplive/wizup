export type FreezeProofVerdict = "OK" | "DRIFT";

export type Season2FreezeProof = {
  schemaVersion: "v1";
  seasonId: string;
  sealHash: string;
  registryHash: string; // the canonical “frozen registry”
  generatedAtMs: number; // excluded from registryHash input
  verdict: FreezeProofVerdict;
  inputs: {
    sealedContractHashRef: string; // equals sealHash
    constraintsHash?: string;      // optional, from constraint store if exists
    engineVersion: string;         // "season2FreezeProof@v1"
  };
};
