
export type ThemeVariant =
  // Standard (Free)
  | "standard-classic"
  | "standard-compact"
  | "standard-creator"
  // Aura (Premium)
  | "aura-v13"
  | "aura-minimal"
  | "aura-neon"
  | "aura-nature"
  | "aura-creator"
  | "aura-pro"
  // Aura V4 (Dynamic)
  | "aura-quantum"
  | "aura-luma"
  | "aura-solar"
  | "aura-zero"
  | "aura-prisma";

export type LayoutVariant =
  | "feed-first"   // Reddit-style vertical feed (Default)
  | "story-first"  // Conscious thought larger, hero post
  | "stats-first"  // Signal elements higher
  | "split-view";  // Side-by-side stream/signal

export type AccentMood = "calm" | "energy" | "focus" | "playful" | "mystic";

export interface PersonalizationSettings {
  themeVariant: ThemeVariant;
  layoutVariant: LayoutVariant;
  accentMood: AccentMood;
  bannerURL?: string | null;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  bio?: string;
  quantumBadge?: string; // e.g. "QUANTUM", "ASCENDANT"
  stats?: {
    zapsReceived?: number;
    zapsGiven?: number;
    communitiesCount?: number;
  };
  personalization?: PersonalizationSettings;
  isPremium?: boolean;
}
