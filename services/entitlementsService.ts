
export const entitlementsService = {
  get(): { aiModsEnabled: boolean; plan: "FREE" | "PRO" | "STUDIO" | "ENTERPRISE" } {
    const raw = localStorage.getItem("entitlements");
    // Default to unlocked for demo purposes if not set, or set initial state
    return raw ? JSON.parse(raw) : { aiModsEnabled: false, plan: "FREE" };
  },
  set(next: { aiModsEnabled: boolean; plan: "FREE" | "PRO" | "STUDIO" | "ENTERPRISE" }) {
    localStorage.setItem("entitlements", JSON.stringify(next));
  },
  unlockDemo() {
    this.set({ aiModsEnabled: true, plan: "PRO" });
  },
  unlockEnterprise() {
    this.set({ aiModsEnabled: true, plan: "ENTERPRISE" });
  }
};
