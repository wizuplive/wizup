import { IdentityStore, defaultIdentityStore } from "./persistence";

/**
 * 🛠️ AUTH IDENTITY DEV TOOLS
 */
export function installAuthIdentityDevTools(store: IdentityStore = defaultIdentityStore) {
  if (typeof window === "undefined") return;

  const g = (window as any);
  g.wizup = g.wizup || {};
  
  g.wizup.identity = {
    inspectMappings: async () => {
      console.log("%c[IDENTITY] Listing local mapping keys...", "color: #3b82f6; font-weight: bold;");
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("WIZUP::IDENTITY::MAP::v1::")) {
          keys.push(k);
        }
      }
      return keys;
    },
    
    help: () => {
      console.log("%c--- Identity Adapter Tools ---", "color: #a855f7; font-weight: bold;");
      console.log("wizup.identity.inspectMappings()");
    }
  };

  console.log("%c[ADAPTER] Auth Identity Layer Active.", "color: #8b5cf6; font-weight: bold;");
}
