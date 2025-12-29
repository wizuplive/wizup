import { FeedPost } from "../../types/feedTypes";
import { Comment, Post } from "../../types";
import { zapsSignalEmitter } from "../zapsSignals/zapsSignalEmitter";

const STORAGE_KEY_VOTES = 'wizup_v1_votes';
const STORAGE_KEY_COMMENTS = 'wizup_v1_comments';

type VoteData = { likes: number; status: 'up' | 'down' | 'neutral' };
type CommentStore = Record<string, Comment[]>;

const loadVotes = (): Record<string, VoteData> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_VOTES) || '{}');
  } catch {
    return {};
  }
};

const loadComments = (): CommentStore => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_COMMENTS) || '{}');
  } catch {
    return {};
  }
};

let voteState = loadVotes();
let commentState = loadComments();

export const interactionService = {
  getPostStats(post: any): VoteData {
    if (!post) return { likes: 0, status: 'neutral' };
    
    const postId = String(post.id);
    if (!voteState[postId]) {
      // Handle both FeedPost (post.stats.likes) and standard Post (post.likes) structures
      const initialLikes = post.stats?.likes ?? post.likes ?? 0;
      voteState[postId] = { likes: initialLikes, status: 'neutral' };
      this.saveVotes();
    }
    return voteState[postId];
  },

  handleVote(postId: string | number, type: 'up' | 'down', userId?: string, postAuthorId?: string, communityId?: string): VoteData {
    const id = String(postId);
    const current = { ...(voteState[id] || { likes: 0, status: 'neutral' }) };
    
    if (current.status === type) {
      // Toggle off
      current.likes += (type === 'up' ? -1 : 1);
      current.status = 'neutral';
    } else {
      // Switch or toggle on
      if (current.status === 'up') current.likes -= 1;
      if (current.status === 'down') current.likes += 1;
      
      current.likes += (type === 'up' ? 1 : -1);
      current.status = type;

      // 7.1 Upvote Signal Emission
      if (type === 'up' && userId && communityId) {
        zapsSignalEmitter.emit({
          type: 'UPVOTE_RECEIVED',
          actorUserId: userId,
          targetUserId: postAuthorId,
          communityId: communityId,
          source: 'FEED',
          metadata: { postId: id }
        });
      }
    }
    
    voteState[id] = current;
    this.saveVotes();
    return current;
  },

  getComments(postId: string | number): Comment[] {
    return commentState[String(postId)] || [];
  },

  addComment(postId: string | number, text: string, author: any, communityId?: string): Comment {
    const id = String(postId);
    const commentId = `c-${Date.now()}`;
    const newComment: Comment = {
      id: commentId,
      author: {
        name: author.name,
        handle: author.handle,
        avatar: author.avatar
      },
      content: text,
      time: 'Just now',
      likes: 0
    };

    if (!commentState[id]) commentState[id] = [];
    commentState[id].unshift(newComment);
    this.saveComments();

    // 7.2 Comment Created Signal Emission
    if (author.id && communityId) {
      zapsSignalEmitter.emit({
        type: 'COMMENT_CREATED',
        actorUserId: author.id,
        communityId: communityId,
        source: 'COMMENTS',
        metadata: { postId: id, commentId: commentId }
      });
    }

    return newComment;
  },

  saveVotes() {
    localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(voteState));
  },

  saveComments() {
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(commentState));
  }
};
