
import { ExperimentRegistryEntry, ExperimentStatus } from "../../types/experimentTypes";

const REGISTRY_KEY = "wizup_experiment_registry_v2";

export const experimentRegistryService = {
  
  register(entry: Omit<ExperimentRegistryEntry, 'status' | 'createdAt' | 'season'>) {
    const registry = this.getRegistry();
    if (registry.find(e => e.experimentId === entry.experimentId)) {
      console.warn(`[REGISTRY] Experiment ${entry.experimentId} already exists.`);
      return;
    }

    const newEntry: ExperimentRegistryEntry = {
      ...entry,
      season: 2,
      createdAt: Date.now(),
      status: 'REGISTERED'
    };

    registry.push(newEntry);
    this.saveRegistry(registry);
    console.log(`%c[REGISTRY] Experiment Registered: ${entry.experimentId}`, "color: #3b82f6; font-weight: bold;");
  },

  updateStatus(experimentId: string, newStatus: ExperimentStatus) {
    const registry = this.getRegistry();
    const entry = registry.find(e => e.experimentId === experimentId);
    
    if (!entry) return;
    
    // Invariant: No reactivation of terminals
    if (entry.status === 'ABORTED' || entry.status === 'COMPLETED') {
      console.error(`[REGISTRY] Cannot transition from terminal state: ${entry.status}`);
      return;
    }

    entry.status = newStatus;
    this.saveRegistry(registry);
    
    const color = newStatus === 'ABORTED' ? '#ef4444' : newStatus === 'ACTIVE' ? '#22c55e' : '#8b5cf6';
    console.log(`%c[REGISTRY] ${experimentId} -> ${newStatus}`, `color: ${color}; font-weight: bold;`);
  },

  getRegistry(): ExperimentRegistryEntry[] {
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getActiveExperiments(): ExperimentRegistryEntry[] {
    return this.getRegistry().filter(e => e.status === 'ACTIVE');
  },

  // Removed invalid 'private' modifier for object literal method
  saveRegistry(registry: ExperimentRegistryEntry[]) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  }
};
