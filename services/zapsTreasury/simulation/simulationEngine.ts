import { SpendScenario, SimulationResult, SimulatedActor, SimulatedTreasuryState } from "./types";

export const simulationEngine = {
  run(scenario: SpendScenario): SimulationResult {
    const auditTrail: string[] = [];
    const riskFlags: string[] = [];
    const state = { ...scenario.setup.treasury };
    const actors = scenario.setup.actors;
    let passed = true;
    let reason = "Protocol respected.";

    auditTrail.push(`Starting Simulation: ${scenario.name}`);
    auditTrail.push(`Initial Balance: ${state.balance}`);

    for (const intent of scenario.setup.intents) {
      // 1. Authorization Check
      const approverActors = actors.filter(a => intent.approvers.includes(a.id));
      const hasOwner = approverActors.some(a => a.role === "OWNER");
      const stewardCount = approverActors.filter(a => a.role === "STEWARD").length;

      // 2. Class-based Quorum Rules
      let authorized = false;
      if (intent.spendClass === "MICRO" || intent.spendClass === "ROUTINE") {
        authorized = hasOwner || stewardCount >= 1;
      } else if (intent.spendClass === "SIGNIFICANT") {
        authorized = hasOwner && stewardCount >= 1;
      } else if (intent.spendClass === "STRUCTURAL") {
        authorized = hasOwner && stewardCount >= 2;
      }

      // Check for Influencer capture (Constraint)
      if (approverActors.every(a => a.role === "INFLUENCER")) {
        auditTrail.push("Blocked: Influencers lack direct authority.");
        authorized = false;
      }

      if (!authorized) {
        auditTrail.push(`Intent ${intent.spendClass} Blocked: Insufficient Quorum.`);
        continue;
      }

      // 3. Velocity / Cap Checks
      if (state.recentSpendVelocity > state.balance * 0.4) {
        auditTrail.push("Critical: Rapid depletion detected. System cooling initiated.");
        state.isFrozen = true;
        riskFlags.push("Velocity spike");
      }

      // 4. Collusion Detection
      approverActors.forEach(a1 => {
        if (a1.role === "OWNER") {
          approverActors.forEach(a2 => {
            if (a2.role === "STEWARD") {
              const pair = `${a1.id}:${a2.id}`;
              state.stewardRepetitionMap[pair] = (state.stewardRepetitionMap[pair] || 0) + 1;
              if (state.stewardRepetitionMap[pair] > 3) {
                auditTrail.push(`Warning: Repetitive actor pair detected (${pair}). Extended cooling applied.`);
                riskFlags.push("Collusion Risk");
                authorized = false;
              }
            }
          });
        }
      });

      // 5. Trust Decay
      approverActors.forEach(a => {
        if (a.trustScore < 0.3) {
          auditTrail.push(`Caution: Low-trust actor ${a.id} involved. Escalating for silent review.`);
          riskFlags.push("Low-trust interaction");
        }
      });

      if (state.isFrozen) {
        auditTrail.push("Action blocked: Treasury is in safety lock.");
        authorized = false;
      }

      if (authorized) {
        state.balance -= intent.amount;
        state.recentSpendVelocity += intent.amount;
        auditTrail.push(`Executed: -${intent.amount} (${intent.spendClass})`);
      }
    }

    // 6. Final Validation of Scenario Outcomes
    if (scenario.id === "SCENARIO_G" && state.balance < 50000) {
      passed = false;
      reason = "FAILED: Treasury allowed drain below safety buffer.";
    }

    if (scenario.id === "SCENARIO_A" && !state.isFrozen) {
      passed = false;
      reason = "FAILED: Velocity breaker did not trigger on repeated owner spend.";
    }

    if (state.balance < 0) {
      passed = false;
      reason = "CRITICAL FAILURE: Negative balance allowed.";
    }

    return {
      scenarioId: scenario.id,
      passed,
      reason,
      confidence: "HIGH",
      riskFlags,
      auditTrail
    };
  }
};