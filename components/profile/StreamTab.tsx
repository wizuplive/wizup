
import React from "react";
import { useUserStream } from "../../hooks/useUserStream";
import { useConsciousThoughts } from "../../hooks/useConsciousThoughts";
import PostCard from "../dashboard/PostCard";
import { Sparkles, Loader2, BrainCircuit } from "lucide-react";
import { Post } from "../../types";

interface Props {
  userId: string;
  onPostClick?: (post: Post) => void;
  onCommunityClick?: (community: any) => void;
  onUserClick?: (user: any) => void;
}

export const StreamTab: React.FC<Props> = ({ userId, onPostClick, onCommunityClick, onUserClick }) => {
  const { posts, loading, loadMore } = useUserStream(userId);
  const thought = useConsciousThoughts(userId);

  return (
    <div className="space-y-10 pb-24">
      
      {/* V5.0 MindFrame (Conscious Thought) */}
      {thought && (
        <div className="relative group perspective-1000">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-[32px] blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-[#080808] rounded-[30px] p-8 border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <BrainCircuit size={16} className="text-purple-300 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Conscious Thought</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-medium text-white mb-4 leading-tight tracking-tight drop-shadow-md">
                    {thought.content}
                </h3>
                
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    <span>Live Signal</span>
                    <span className="text-gray-700">•</span>
                    <span>{thought.createdAt?.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
      )}

      {/* Posts Stream */}
      {loading && (
        <div className="py-20 flex justify-center">
            <Loader2 size={32} className="animate-spin text-purple-500/50" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-white/30 py-20 text-center font-light tracking-wide text-sm border border-dashed border-white/5 rounded-3xl">
          Signal silence. No broadcasts yet.
        </div>
      )}

      <div className="space-y-8">
          {posts.map((p) => (
            <PostCard 
                key={p.id} 
                post={p} 
                onClick={(post) => onPostClick && onPostClick(post)} 
                onCommunityClick={onCommunityClick}
                onUserClick={onUserClick}
            />
          ))}
      </div>

      {/* Load more */}
      {posts.length > 5 && (
        <div className="flex justify-center pt-8">
          <button
            onClick={loadMore}
            className="px-8 py-3 rounded-full bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            Load Deep History
          </button>
        </div>
      )}
    </div>
  );
};
