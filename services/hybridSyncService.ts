
import { functions } from "../lib/firebase";
import { httpsCallable } from "firebase/functions";

export interface SyncedContent {
  id: string;
  thumbnail: string;
  title: string;
  views: string;
  likes: string;
  url: string;
  platform: string;
  format: 'reel' | 'post' | 'video' | 'story';
}

export interface SyncedCreatorData {
  followers: number;
  profilePicture: string;
  nicheTags: string[];
  bio: string;
  engagementRate: string;
  topContent: SyncedContent[];
  verificationRequired?: boolean; // Layer 5 Trigger
  sourceLayer?: number; // Debug info
  verifiedVia?: string;
  username?: string;
}

export interface HybridSyncResult {
  success: boolean;
  data?: SyncedCreatorData;
  error?: string;
  verificationRequired?: boolean;
}

// --- LOCAL SIMULATION (Fallback if Backend isn't deployed) ---
const simulateScrapingLayers = async (platform: string, handle: string): Promise<SyncedCreatorData | null> => {
  if (handle.toLowerCase().includes('manual')) {
    return null; // Force Layer 5 Test
  }

  // Deterministic Mock Data (Simulation of Layer 2/3)
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  return {
    followers: 12500,
    profilePicture: `https://picsum.photos/seed/${handle}/200/200`,
    nicheTags: ["Tech", "Lifestyle", "SaaS"],
    bio: "Building the future of digital communities. 🚀 | Tech Reviewer",
    engagementRate: "4.2%",
    verifiedVia: "simulation",
    topContent: [
      {
        id: "1",
        thumbnail: `https://picsum.photos/seed/${handle}_1/400/500`,
        title: "My Desk Setup 2024",
        views: "1.2M",
        likes: "84k",
        url: "#",
        platform: platform,
        format: "reel"
      },
      {
        id: "2",
        thumbnail: `https://picsum.photos/seed/${handle}_2/400/500`,
        title: "Top 5 AI Tools",
        views: "850k",
        likes: "62k",
        url: "#",
        platform: platform,
        format: "reel"
      }
    ],
    sourceLayer: 2
  };
};

export const hybridSync = async (input: {
  userId?: string;
  platform: string;
  username?: string;
  profileUrl?: string;
}): Promise<HybridSyncResult> => {
  const handle = input.username || "unknown";
  
  // 1. Try Cloud Function (The Real Backend)
  if (functions) {
    try {
      console.log(`[HybridSync] Attempting Cloud Function: verifyInstagramIdentity for ${handle}`);
      const verifyIdentity = httpsCallable(functions, 'verifyInstagramIdentity');
      
      // Construct URL if only username provided (Basic assumption for Instagram)
      const instagramUrl = input.profileUrl || `https://www.instagram.com/${handle}/`;
      
      const result: any = await verifyIdentity({ instagramUrl });
      const data = result.data;

      console.log("[HybridSync] Cloud Function Response:", data);

      if (data.status === 'ok') {
        return {
          success: true,
          data: {
            followers: data.followers,
            username: data.instagramUsername,
            verifiedVia: data.verifiedVia,
            profilePicture: `https://picsum.photos/seed/${data.instagramUsername}/200/200`, // Placeholder until graph API is hooked up
            nicheTags: ["General"], // Placeholder
            bio: "Synced from Instagram",
            engagementRate: "3.5%", // Placeholder
            topContent: [],
            sourceLayer: data.verifiedVia === 'playwright' ? 4 : 2
          }
        };
      } else if (data.status === 'manual_required') {
        return {
          success: false,
          verificationRequired: true,
          error: "Could not automatically verify follower count."
        };
      } else if (data.status === 'below_threshold') {
        return {
          success: false,
          error: `Follower count (${data.followers}) is below the minimum required (1000).`
        };
      }

    } catch (error: any) {
      console.warn("[HybridSync] Cloud Function failed or not deployed. Falling back to simulation.", error.message);
      // Fallthrough to simulation
    }
  }

  // 2. Fallback to Local Simulation (If backend is down/undeployed)
  console.log(`[HybridSync] Running Local Simulation for ${handle}...`);
  try {
    const scrapedData = await simulateScrapingLayers(input.platform, handle);
    if (scrapedData) {
      return { success: true, data: scrapedData };
    }
    // Force Manual if simulation returns null
    return { success: false, verificationRequired: true, error: "Manual verification required." };
  } catch (error) {
    return { success: false, error: "System error during sync." };
  }
};
