import { ReadinessCheckResult } from "../types";
import { ArtifactSource } from "../sources/artifactSource";
import { artifactIndexKey } from "../../zaps/season0/persistence/keys";

const GATE_KEY = "WIZUP::GOV::GATE::v1::S1";
const CONSTRAINTS_KEY = "WIZUP::GOV::CONSTRAINTS::v1::S1";
const CONTRACT_KEY = "WIZUP::S1::ARTIFACT::CONTRACT";

export async function checkPrerequisitesPresent(source: ArtifactSource): Promise<ReadinessCheckResult> {
  const required = [
    { name: "Season 0 Index", key: artifactIndexKey() },
    { name: "Season 1 Gate", key: GATE_KEY },
    { name: "Season 1 Constraints", key: CONSTRAINTS_KEY },
    { name: "Season 1 Contract", key: CONTRACT_KEY }
  ];

  const missing: string[] = [];
  for (const req of required) {
    const data = await source.read(req.key);
    if (!data) missing.push(req.name);
  }

  const pass = missing.length === 0;

  return {
    name: "prerequisites_present",
    severity: "FATAL",
    pass,
    code: pass ? undefined : "MISSING_PREREQUISITE_ARTIFACT",
    details: pass ? undefined : { missing }
  };
}
