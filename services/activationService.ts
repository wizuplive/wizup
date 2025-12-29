
import { dataService } from './dataService';
import { zapsWalletService } from './zapsWalletService';

// --- TYPES ---

export interface IdentityMetrics {
  resonanceScore: number;
  resonanceTrend: "rising" | "stable" | "cooling";
  presencePulseHistory: { ts: number; score: number }[];
  connectionStrength: {
    sharedCommunities: number;
    mutualConnections: number;
    zapsExchanged: number;
  };
  // v13.2 Signal Data
  signalTimeline?: { day: string; score: number }[];
  contributionMap?: number[][];
  networkNodes?: { id: string; strength: number }[];
}

// --- MOCK DATABASE STATE (Simulation) ---

const MOCK_METRICS_DB: Record<string, IdentityMetrics> = {
  "1": { // Sarah Jenkins
    resonanceScore: 92,
    resonanceTrend: "rising",
    presencePulseHistory: Array.from({ length: 12 }, (_, i) => ({ ts: Date.now() - i * 86400000, score: 80 + Math.random() * 20 })),
    connectionStrength: {
      sharedCommunities: 4,
      mutualConnections: 128,
      zapsExchanged: 450
    },
    // Signal Tab Mock Data
    signalTimeline: [
      { day: "Mon", score: 65 },
      { day: "Tue", score: 78 },
      { day: "Wed", score: 85 },
      { day: "Thu", score: 90 },
      { day: "Fri", score: 82 },
      { day: "Sat", score: 95 },
      { day: "Sun", score: 98 },
    ],
    contributionMap: Array.from({ length: 7 }, () => Array.from({ length: 7 }, () => Math.random())),
    networkNodes: Array.from({ length: 12 }, (_, i) => ({ id: `node-${i}`, strength: 0.2 + Math.random() * 0.8 })),
  }
};

const FOLLOW_GRAPH: Record<string, boolean> = {}; // "userId_targetId": true

// --- CLOUD FUNCTION SIMULATIONS ---

export const activationService = {
  
  // GET /identity/metrics/:userId
  getIdentityMetrics: async (userId: string): Promise<IdentityMetrics> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return MOCK_METRICS_DB[userId] || {
      resonanceScore: 50,
      resonanceTrend: "stable",
      presencePulseHistory: [],
      connectionStrength: { sharedCommunities: 0, mutualConnections: 0, zapsExchanged: 0 }
    };
  },

  // POST /social/follow
  followUser: async (targetId: string): Promise<{ status: string }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const currentUser = dataService.getCurrentUser();
    const key = `${currentUser.id}_${targetId}`;
    
    FOLLOW_GRAPH[key] = true;
    
    // Side Effect: Increase Resonance slightly
    if (MOCK_METRICS_DB[targetId]) {
      MOCK_METRICS_DB[targetId].resonanceScore = Math.min(100, MOCK_METRICS_DB[targetId].resonanceScore + 1);
    }

    return { status: "following" };
  },

  // POST /social/unfollow
  unfollowUser: async (targetId: string): Promise<{ status: string }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const currentUser = dataService.getCurrentUser();
    const key = `${currentUser.id}_${targetId}`;
    
    delete FOLLOW_GRAPH[key];
    return { status: "unfollowed" };
  },

  // GET /social/relationship
  checkFollowStatus: async (targetId: string): Promise<boolean> => {
    // Instant check for demo
    const currentUser = dataService.getCurrentUser();
    return !!FOLLOW_GRAPH[`${currentUser.id}_${targetId}`];
  },

  // POST /zaps/send
  // Now routed through the Wallet Service for ledger consistency
  sendZaps: async (targetId: string, amount: number, note?: string): Promise<{ success: boolean, newBalance: number }> => {
    const currentUser = dataService.getCurrentUser();
    if (!currentUser) throw new Error("No user");

    await zapsWalletService.sendZaps(currentUser.id, targetId, amount, note);
    
    // Update Target Metrics (Energetic Reality Layer)
    if (MOCK_METRICS_DB[targetId]) {
      const metrics = MOCK_METRICS_DB[targetId];
      metrics.connectionStrength.zapsExchanged += amount;
      metrics.resonanceScore = Math.min(100, metrics.resonanceScore + (amount > 50 ? 2 : 1));
      metrics.resonanceTrend = "rising";
    }

    // Refresh user to get new balance
    const updatedUser = dataService.getCurrentUser();
    return { success: true, newBalance: updatedUser?.walletBalance || 0 };
  }
};
