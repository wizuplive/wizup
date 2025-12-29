
export interface FeedPost {
  id: string;
  communityId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    tier: "Observer" | "Builder" | "Steward" | "Anchor";
  };
  content: {
    text: string;
    image?: string;
  };
  stats: {
    likes: number;
    comments: number;
    zaps: number;
  };
  createdAt: string;
}
