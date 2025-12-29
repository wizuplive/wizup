
import { Post } from "../types";
import { dataService } from "./dataService";
import { SuggestedAction, PostModerationState, ModerationStatus } from "../types/modTypes";

export const feedService = {
  getKey(communityId: string) {
    return `posts:${communityId}`;
  },

  async getPosts(communityId: string): Promise<Post[]> {
    const key = this.getKey(communityId);
    const stored = await dataService.get(key);
    return stored || []; 
  },

  async createPost(post: Post, communityId: string): Promise<Post> {
    const key = this.getKey(communityId);
    const existing = await dataService.get(key) || [];
    // Ensure ID is unique string for consistency
    const newPost = { ...post, id: Date.now(), time: 'Just now' };
    const updated = [newPost, ...existing];
    await dataService.set(key, updated);
    return newPost;
  },

  async updatePost(communityId: string, postId: number | string, updates: Partial<Post>) {
     const key = this.getKey(communityId);
     const posts = await dataService.get(key) || [];
     const idx = posts.findIndex((p: Post) => String(p.id) === String(postId));
     if (idx !== -1) {
         posts[idx] = { ...posts[idx], ...updates };
         await dataService.set(key, posts);
     }
  },

  async applyModeration(communityId: string, postId: string | number, action: SuggestedAction, rationale?: string) {
    const modUpdate: PostModerationState = {
        status: ModerationStatus.NONE,
        flaggedAt: Date.now()
    };

    if (action === SuggestedAction.HOLD) {
        modUpdate.status = ModerationStatus.HELD;
    } else if (action === SuggestedAction.NOTE) {
        modUpdate.status = ModerationStatus.NOTED;
        modUpdate.note = rationale;
    } else if (action === SuggestedAction.TAG) {
        modUpdate.status = ModerationStatus.TAGGED;
        modUpdate.tags = ["Review"]; // Default tag for Phase 1
    }

    await this.updatePost(communityId, postId, { moderation: modUpdate });
  }
};
