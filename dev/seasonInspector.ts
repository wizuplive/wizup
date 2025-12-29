import { previewInspector } from "../services/seasonalSimulation/previewInspector";
import { reportExporter } from "../services/seasonalSimulation/reportExporter";
import { freezeProtocol } from "../services/zapsTreasury/freezeProtocol";
import { SCENARIOS } from "../services/zapsTreasury/simulation/scenarios";
import { simulationEngine } from "../services/zapsTreasury/simulation/simulationEngine";
import { reportService } from "../services/zapsTreasury/simulation/reportService";
import { communityTreasuryAggregationService } from "../services/communityTreasury/aggregationService";
import { seasonalAllocationResolutionService } from "../services/seasonalSimulation/seasonalAllocationResolutionService";
import { defaultGateSink } from "../services/seasonalGovernance/persistence/localStorageGateSink";
import { buildSeason1AttestationBundle } from "../services/attestation/bundleBuilder";
import { signAttestationBundle, generateAuditKeyPair } from "../services/attestation/signer";
import { verifySeason1Bundle } from "../services/attestation/verifier";
import { fileExport } from "../services/attestation/export/fileExport";
import { defaultConstraintSink } from "../services/seasonalGovernance/constraintCompiler/sinks/localStorageSink";
import { buildPublicDisclosure } from "../services/legitimacyDisclosure/disclosureBuilder";
import { defaultDisclosureSink } from "../services/legitimacyDisclosure/persistence/localStorageSink";

// --- S1 ACTIVATION IMPORTS ---
import { season1ContractService } from "../services/season1Activation/season1Contract";
import { season1StateMachine } from "../services/season1Activation/season1StateMachine";
import { season1Finalizer } from "../services/season1Activation/season1Finalizer";
import { season1ArtifactService } from "../services/season1Activation/season1Artifact";
import { initReadinessDevBridge } from "../services/season1Activation/dev/devBridge";
import { initOrchestratorDevBridge } from "../services/season1ActivationOrchestrator/dev/devBridge";

/**
 * 🛠️ WIZUP DEV BRIDGE — ARCHITECT EDITION
 * =====================================
 */

declare global {
  interface Window {
    wizup: any;
  }
}

export function initDevTools() {
  if (typeof window !== 'undefined') {
    // Initialize Readiness Tooling
    initReadinessDevBridge();
    // Initialize Orchestrator Tooling
    initOrchestratorDevBridge();

    window.wizup = window.wizup || {};
    Object.assign(window.wizup, {
      inspectSeason: async (id: string) => {
        await previewInspector.inspect(id);
      },
      downloadSeasonReport: async (id: string) => {
        console.log(`%c[Architect] Preparing Deterministic Report for ${id}...`, "color: #a855f7;");
        await reportExporter.export(id);
      },
      
      // --- GOVERNANCE TOOLS ---
      inspectSeasonGate: async (id: string) => {
        const gate = await defaultGateSink.read(id);
        if (gate) {
          console.group(`%c⚖️ Season Gate: ${id}`, "color: #8b5cf6; font-weight: bold;");
          console.log("Verdict:", gate.verdict);
          console.log("Issued At:", new Date(gate.issuedAtMs).toLocaleString());
          console.log("Conditions:", gate.conditions || "None");
          console.log("Conscience Hash:", gate.hashes.conscienceHash);
          console.groupEnd();
        } else {
          console.log(`%c[Architect] No gate found for ${id}`, "color: #666;");
        }
      },

      // --- SEASON 1 ACTIVATION TOOLS ---
      s1: {
        arm: async (days: number = 30) => {
           console.log(`%c[Architect] Sealing parameters for Season 1...`, "color: #8b5cf6; font-weight: bold;");
           const contract = await season1ContractService.armSeason1(days);
           console.log("Season 1 Armed. Activation Hash:", contract.activationHash);
           console.log("Start Window:", new Date(contract.timeWindow.startMs).toLocaleString());
           return contract;
        },
        finalize: async () => {
           console.log(`%c[Architect] Finalizing Season 1 Outcomes...`, "color: #22c55e; font-weight: bold;");
           await season1Finalizer.finalize();
        },
        getStatus: () => {
           const state = season1StateMachine.getState();
           const contract = season1ArtifactService.read("CONTRACT");
           return { state, contract };
        }
      },

      // --- ATTESTATION & AUDIT TOOLS ---
      generateSeason1Attestation: async () => {
        console.log(`%c[Audit] Generating Season 1 Attestation Bundle...`, "color: #22c55e; font-weight: bold;");
        
        try {
            const gate = await defaultGateSink.read("S1");
            const constraints = await defaultConstraintSink.read("S1");
            
            if (!gate || !constraints) throw new Error("Missing S1 artifacts. Ensure S1 has been resolved.");
            
            const mockAllocation: any = {
                seasonId: "S1",
                allocations: [],
                verdict: "COMPLIANT",
                hashes: {
                    inputHash: "input_sim_hash",
                    constraintHash: constraints.hashes.compiledHash,
                    outputHash: "output_sim_hash",
                    engineVersion: "v1"
                }
            };

            const bundle = await buildSeason1AttestationBundle({
                allocationArtifact: mockAllocation,
                compiledConstraints: constraints,
                moralVerdict: { 
                  verdict: gate.verdict,
                  hashes: { verdictHash: gate.hashes.conscienceHash } 
                } as any
            });

            const keys = await generateAuditKeyPair();
            const signed = await signAttestationBundle(bundle, keys.privateKey, "dev-test-key-01");
            
            console.log("%c[Audit] Bundle Generated & Signed.", "color: #22c55e;");
            
            // --- DISCLOSURE HOOK ---
            const disclosure = buildPublicDisclosure({ attestationBundle: signed });
            await defaultDisclosureSink.write(disclosure);
            console.log("%c[Audit] Public disclosure statement initialized.", "color: #22c55e;");

            fileExport.download(signed);
        } catch (e: any) {
            console.error("[Audit] Attestation failed:", e.message);
        }
      },

      inspectLegitimacyDisclosure: async (id: string) => {
        const disclosure = await defaultDisclosureSink.read(id);
        if (disclosure) {
          console.group(`%c🕊️ Legitimacy Disclosure: ${id}`, "color: #3b82f6; font-weight: bold;");
          console.log("Status:", disclosure.status);
          console.log("Proof Hash:", disclosure.proof.attestationHash);
          console.log("Instructions:", disclosure.proof.verificationInstructionsURI);
          console.log("Issued:", new Date(disclosure.issuedAtMs).toLocaleString());
          console.groupEnd();
        } else {
          console.log(`%c[Architect] No disclosure found for ${id}`, "color: #666;");
        }
      },

      help: () => {
        console.log("%cWIZUP Architect Tools:", "font-weight: bold; color: #a855f7;");
        console.log("- wizup.s1.arm(days): Seal Season 1 parameters and set time window.");
        console.log("- wizup.attemptSeason1Activation(): Irreversibly activate Season 1.");
        console.log("- wizup.runSeason1Readiness(): Run readiness proof for S1 activation.");
        console.log("- wizup.inspectSeasonGate('S1'): View the moral gate for Season 1.");
        console.log("- wizup.generateSeason1Attestation(): Build & Verify a cryptographic audit bundle.");
        console.log("- wizup.simulation.runAll(): Run all 7 spend fail-safe scenarios.");
      }
    });

    window.wizup.help();
  }
}
