import React from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

export interface Stat {
  value: string;
  label: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface Community {
  id: number;
  name: string;
  creator: string;
  members: string;
  image: string;
  category: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export enum ImageSize {
  SIZE_1K = "1K",
  SIZE_2K = "2K",
  SIZE_4K = "4K"
}

// Dashboard Views
export type DashboardView = 'discover' | 'communities' | 'messages' | 'leaderboard' | 'influencers' | 'influencer-signup' | 'seller-hub' | 'profile' | 'studio' | 'activity' | 'premiere' | 'wallet' | 'community-profile' | 'trending-communities' | 'user-profile';

// Partner Hub v5.2 Types (Aura-First Discovery)
export interface PlatformStat {
  platform: 'instagram' | 'tiktok' | 'x' | 'youtube';
  followers: string;
  handle: string;
}

export type AuraReach = "Focused" | "Growing" | "Broad" | "Iconic";
export type AuraResonance = "Quiet" | "Steady" | "Strong" | "Vibrant";
export type AuraConsistency = "Stable" | "Rising" | "Foundation";

export interface Influencer {
  id: number;
  name: string;
  handle: string;
  category: 'Design' | 'Tech' | 'Wellness' | 'Culture' | 'Web3' | 'Education' | 'Lifestyle';
  oneLiner: string;
  img: string;
  platforms: PlatformStat[];
  followerCountCombined: string;
  collaboratedWith: string[];
  credibilitySignal?: string; // e.g. "Worked with Figma"
  insightChips: string[]; 
  momentum: {
    label: string; 
    trend: 'up' | 'down' | 'stable';
    value: string;
    description: string; // Human readable e.g. "Rapid growth this week"
  };
  audience: {
    location: string;
    ageRange: string;
    genderSplit: string;
    interests: string[];
  };
  // Aura Properties (Visual Only)
  aura: {
    reach: AuraReach;
    resonance: AuraResonance;
    consistency: AuraConsistency;
    sizeScalar: number; 
    glowIntensity: number; 
    pulseSpeed: number; // 1-5
  };
  badges?: string[];
  bio?: string;
  mediaLinks?: { title: string; type: string; thumbnail: string; url: string }[];
}

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
    badge?: string;
  };
  content: string;
  time: string;
  likes: number;
  replies?: Comment[];
}

export interface PostModerationState {
  hidden?: boolean;
  warning?: string;
  tags?: string[];
  flaggedAt?: number;
}

export interface Post {
  id: number;
  author: {
    id: string;
    name: string;
    avatar: string;
    handle: string;
    role?: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  zaps: number;
  time: string;
  isLiked?: boolean;
  community?: {
    name: string;
    image: string;
    members: string;
    activeNow: number;
    description?: string;
  };
  thread?: Comment[];
  category?: string;
  moderation?: PostModerationState; 
}

export interface TrendingCommunity {
  id: number;
  name: string;
  members: string;
  image: string;
  growth: number;
}

export interface Contributor {
  id: number;
  name: string;
  avatar: string;
  zaps: number;
  rank: number;
  trend: 'up' | 'down' | 'neutral';
}

export type ContentType = 'community' | 'course' | 'coaching' | 'product';

export interface DashboardCommunity {
  id: number;
  type?: ContentType; 
  title: string;
  creator: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  category: string;
  image: string;
  coverImage?: string;
  members: string;
  accessType: 'free' | 'paid' | 'zaps' | 'granted';
  cost?: string; 
  progress?: number;
  description: string;
  isFeatured?: boolean;
  tags?: string[];
  hasZapReward?: boolean; 
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  type: 'text' | 'image' | 'system';
  read?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline?: boolean;
  isVerified?: boolean;
  type: 'direct' | 'group' | 'community';
  zapReward?: boolean;
}

// v10 ZAP Arrival State
export type RitualState = 'idle' | 'anticipation' | 'settling' | 'snapped' | 'confirmed' | 'imprint' | 'afterstate';
