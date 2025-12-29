import { SpendScenario } from "./types";

export const SCENARIOS: SpendScenario[] = [
  {
    id: "SCENARIO_A",
    name: "OWNER OVERREACH",
    setup: {
      treasury: { balance: 100000, isFrozen: false, recentSpendVelocity: 0, lastSpendAt: Date.now(), stewardRepetitionMap: {} },
      actors: [{ id: "owner_1", role: "OWNER", trustScore: 1.0 }],
      intents: Array(5).fill({
        category: "PERK",
        spendClass: "ROUTINE",
        amount: 5000,
        frequency: "REPEATED_BURST",
        approvers: ["owner_1"]
      })
    },
    expectedOutcome: "System throttles without confrontation; Treasury enters Review Hold."
  },
  {
    id: "SCENARIO_B",
    name: "STEWARD ABSENCE",
    setup: {
      treasury: { balance: 100000, isFrozen: false, recentSpendVelocity: 0, lastSpendAt: Date.now(), stewardRepetitionMap: {} },
      actors: [
        { id: "owner_1", role: "OWNER", trustScore: 1.0 },
        { id: "steward_1", role: "STEWARD", trustScore: 1.0 }
      ],
      intents: [{
        category: "COMMITMENT",
        spendClass: "STRUCTURAL",
        amount: 25000,
        frequency: "ONCE",
        approvers: ["owner_1"] // Only 1 steward responds (needs 2)
      }]
    },
    expectedOutcome: "Spend silently expires; nothing happens."
  },
  {
    id: "SCENARIO_C",
    name: "STEWARD COLLUSION",
    setup: {
      treasury: { balance: 100000, isFrozen: false, recentSpendVelocity: 0, lastSpendAt: Date.now(), stewardRepetitionMap: { "owner_1:steward_1": 4 } },
      actors: [
        { id: "owner_1", role: "OWNER", trustScore: 1.0 },
        { id: "steward_1", role: "STEWARD", trustScore: 1.0 }
      ],
      intents: [{
        category: "CONTRIBUTION",
        spendClass: "SIGNIFICANT",
        amount: 15000,
        frequency: "ONCE",
        approvers: ["owner_1", "steward_1"]
      }]
    },
    expectedOutcome: "Collusion neutralized structurally; requires different steward."
  },
  {
    id: "SCENARIO_D",
    name: "INFLUENCER CAPTURE ATTEMPT",
    setup: {
      treasury: { balance: 100000, isFrozen: false, recentSpendVelocity: 0, lastSpendAt: Date.now(), stewardRepetitionMap: {} },
      actors: [
        { id: "influencer_1", role: "INFLUENCER", trustScore: 0.8 }
      ],
      intents: [{
        category: "ACCESS",
        spendClass: "SIGNIFICANT",
        amount: 10000,
        frequency: "ONCE",
        approvers: ["influencer_1"]
      }]
    },
    expectedOutcome: "Influencer has zero authorization; no action proceeds."
  },
  {
    id: "SCENARIO_E",
    name: "EMOTIONAL EVENT SPIKE",
    setup: {
      treasury: { balance: 100000, isFrozen: false, recentSpendVelocity: 50000, lastSpendAt: Date.now(), stewardRepetitionMap: {} },
      actors: [
        { id: "owner_1", role: "OWNER", trustScore: 1.0 },
        { id: "steward_1", role: "STEWARD", trustScore: 1.0 },
        { id: "steward_2", role: "STEWARD", trustScore: 1.0 }
      ],
      intents: [{
        category: "COMMITMENT",
        spendClass: "STRUCTURAL",
        amount: 30000,
        frequency: "ONCE",
        approvers: ["owner_1", "steward_1", "steward_2"]
      }]
    },
    expectedOutcome: "Time-lock enforced; cooling window respected."
  },
  {
    id: "SCENARIO_F",
    name: "STEWARD FAILURE",
    setup: {
      treasury: { balance: 100000, isFrozen: false, recentSpendVelocity: 0, lastSpendAt: Date.now(), stewardRepetitionMap: {} },
      actors: [
        { id: "steward_bad", role: "STEWARD", trustScore: 0.2 }
      ],
      intents: [{
        category: "CONTRIBUTION",
        spendClass: "ROUTINE",
        amount: 2000,
        frequency: "ONCE",
        approvers: ["steward_bad"]
      }]
    },
    expectedOutcome: "Accountability is quiet; steward eligibility decays silently."
  },
  {
    id: "SCENARIO_G",
    name: "TREASURY DRAIN ATTEMPT",
    setup: {
      treasury: { balance: 100000, isFrozen: false, recentSpendVelocity: 0, lastSpendAt: Date.now(), stewardRepetitionMap: {} },
      actors: [{ id: "owner_1", role: "OWNER", trustScore: 1.0 }],
      intents: Array(20).fill({
        category: "ACCESS",
        spendClass: "MICRO",
        amount: 500,
        frequency: "REPEATED_BURST",
        approvers: ["owner_1"]
      })
    },
    expectedOutcome: "Aggregate cap triggers; further spends blocked; Treasury enters Freeze state."
  }
];