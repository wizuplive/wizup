
import { Season1State } from "./types";

const STATE_KEY = "WIZUP::S1::STATE_v1";

export const season1StateMachine = {
  getState(): Season1State {
    const raw = localStorage.getItem(STATE_KEY);
    return (raw as Season1State) || "DORMANT";
  },

  transitionTo(next: Season1State): void {
    const current = this.getState();

    // 🛡️ NON-NEGOTIABLE TRANSITION RULES
    const allowed: Record<Season1State, Season1State[]> = {
      DORMANT: ["ARMED", "FROZEN"],
      ARMED: ["ACTIVE", "FROZEN"],
      ACTIVE: ["SEALED", "FROZEN"],
      SEALED: ["FINALIZED", "FROZEN"],
      FINALIZED: [], // Terminal
      FROZEN: []     // Terminal
    };

    if (next !== "FROZEN" && !allowed[current].includes(next)) {
      throw new Error(`ILLEGAL_STATE_TRANSITION: Cannot move from ${current} to ${next}`);
    }

    localStorage.setItem(STATE_KEY, next);
    console.log(`%c[S1_STATE] Transition: ${current} -> ${next}`, "color: #8b5cf6; font-weight: bold;");
  },

  isTerminal(): boolean {
    const state = this.getState();
    return state === "FINALIZED" || state === "FROZEN";
  }
};
