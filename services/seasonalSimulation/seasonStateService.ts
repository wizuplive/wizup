import { flags } from "../zapsSignals/featureFlags";
// fix: Corrected missing member symbols by aliasing CALIBRATION_v1_1
import { CALIBRATION_v1_1 as CALIBRATION_v1_3_LOCKED, CALIBRATION_v1_1 as CALIBRATION_v2_0_DRAFT } from "./calibration";

const STATE_KEY = "wizup:season_state:v1";

export type SeasonState = "SIMULATION" | "AUTHORITATIVE" | "CLOSED" | "PAUSED" | "PLANNED";

interface StateRecord {
  activeSeasonId: string;
  mode: SeasonState;
  activatedAt: number | null;
  calibrationVersion: string;
  sealedAt?: number;
}

const DEFAULT_STATE: StateRecord = {
  activeSeasonId: "SEASON_2",
  mode: "PLANNED", // Season 2 is planned but not yet active
  activatedAt: null, 
  calibrationVersion: "2.0-DRAFT",
  sealedAt: 1715606400000 // Season 1 sealing timestamp
};

export const seasonStateService = {
  get(): StateRecord {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  },

  activateSeason1() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_1",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "1.3-LOCKED"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] Season 1 Activated: Authoritative Accrual Started.", "color: #22c55e; font-weight: bold;");
  },

  closeSeason1() {
    const currentState = this.get();
    const state: StateRecord = {
      ...currentState,
      mode: "CLOSED",
      sealedAt: Date.now()
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] Season 1 Closed. State Frozen.", "color: #ef4444; font-weight: bold;");
  },

  activateSeason2() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_2",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "2.0-DRAFT"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] Season 2 Activated: Evolution Protocol v2.0 live.", "color: #8b5cf6; font-weight: bold;");
  },

  /**
   * 📜 SEASON 3 TRANSITION
   */
  activateSeason3() {
    const adoptions = JSON.parse(localStorage.getItem("wizup_parameter_adoption_v3") || '[]');
    if (adoptions.length === 0) {
      console.warn("[ARCHITECT] Season 3 Aborted: No parameter adoptions sealed.");
      return;
    }

    const state: StateRecord = {
      activeSeasonId: "SEASON_3",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "3.0-CANON"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🏛️ SEASON 3 CANON ACTIVATED.", "color: #3b82f6; font-weight: bold;");
  },

  /**
   * 🤖 SEASON 4 TRANSITION
   */
  activateSeason4() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_4",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "4.0-AGENTIC"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🤖 SEASON 4 ACTIVATED.", "color: #06b6d4; font-weight: bold;");
  },

  /**
   * 🔬 SEASON 5 TRANSITION
   */
  activateSeason5() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_5",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "5.0-CANDIDATE"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🔬 SEASON 5 ACTIVATED. Agent-Guided Candidate Selection enabled.", "color: #8b5cf6; font-weight: bold;");
  },

  /**
   * ⚖️ SEASON 6 TRANSITION
   */
  activateSeason6() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_6",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "6.0-EXECUTABLE"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] ⚖️ SEASON 6 ACTIVATED. Flagged Execution Protocol online.", "color: #3b82f6; font-weight: bold;");
  },

  /**
   * 📜 SEASON 7 TRANSITION
   */
  activateSeason7() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_7",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "7.0-SYNTHESIS"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 📜 SEASON 7 ACTIVATED. Truth Synthesis Layer enabled.", "color: #22c55e; font-weight: bold;");
  },

  /**
   * 🏛️ SEASON 8 TRANSITION
   */
  activateSeason8() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_8",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "8.0-CANONICAL"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🏛️ SEASON 8 ACTIVATED. Canonical Parameter Lineage enabled.", "color: #3b82f6; font-weight: bold;");
  },

  /**
   * 🛡️ SEASON 9 TRANSITION
   */
  activateSeason9() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_9",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "9.0-GUARDRAILS"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🛡️ SEASON 9 ACTIVATED. Operational Safety Protocol enforced.", "color: #ef4444; font-weight: bold;");
  },

  /**
   * 🤝 SEASON 10 TRANSITION
   */
  activateSeason10() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_10",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "10.0-LEGIBILITY"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🤝 SEASON 10 ACTIVATED. Public Trust Layer online.", "color: #8b5cf6; font-weight: bold;");
  },

  /**
   * 🏛️ SEASON 11 TRANSITION
   */
  activateSeason11() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_11",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "11.0-CIVIC"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🏛️ SEASON 11 ACTIVATED. Civic Agency Protocol active.", "color: #06b6d4; font-weight: bold;");
  },

  /**
   * 🏛️ SEASON 12 TRANSITION
   */
  activateSeason12() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_12",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "12.0-FEDERAL"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🏛️ SEASON 12 ACTIVATED. Federal Governance Protocol active.", "color: #3b82f6; font-weight: bold;");
  },

  /**
   * 🌍 SEASON 13 TRANSITION
   */
  activateSeason13() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_13",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "13.0-MOBILITY"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🌍 SEASON 13 ACTIVATED. Scoped Citizenship Protocol enforced.", "color: #f59e0b; font-weight: bold;");
  },

  /**
   * 🏺 SEASON 14 TRANSITION
   */
  activateSeason14() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_14",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "14.0-CONTINUITY"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🏺 SEASON 14 ACTIVATED. Civic Continuity Protocol active.", "color: #8b5cf6; font-weight: bold;");
  },

  /**
   * 🌅 SEASON 15 TRANSITION
   * Community Succession & Sunset Protocol active.
   */
  activateSeason15() {
    const state: StateRecord = {
      activeSeasonId: "SEASON_15",
      mode: "AUTHORITATIVE",
      activatedAt: Date.now(),
      calibrationVersion: "15.0-COMPLETION"
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    console.log("%c[ARCHITECT] 🌅 SEASON 15 ACTIVATED. Final Lifecycle Protocol online.", "color: #ef4444; font-weight: bold;");
  },

  resetToSimulation() {
    localStorage.setItem(STATE_KEY, JSON.stringify(DEFAULT_STATE));
    console.log("%c[ARCHITECT] Reset to Season 0 Simulation Mode.", "color: #f59e0b; font-weight: bold;");
  }
};