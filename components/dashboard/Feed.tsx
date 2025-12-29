import React, { useState, useEffect } from 'react';
import { feedServiceRouter } from '../../services/feed/feedService';
import { FeedPost } from '../../types/feedTypes';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, MessageCircle, Zap, ShieldCheck, ChevronUp, ChevronDown, Share2 } from 'lucide-react';
import { interactionService } from '../../services/interaction/interactionService';
import PostDetailOverlay from './PostDetailOverlay';
import { zapsSignalEmitter } from '../../services/zapsSignals/zapsSignalEmitter';
import { seasonalAllocationSimulation } from '../../services/seasonalSimulation/seasonalAllocationSimulation';
import { dataService } from '../../services/dataService';

// Added missing props to support Dashboard calls
interface FeedProps {
  onPostClick?: (post: any) => void;
  onCommunityClick?: (community: any) => void;
  onUserClick?: (user: any) => void;
}

const PostCard: React.FC<{ 
  post: FeedPost; 
  onExpand: () => void;
  onUserClick?: (user: any) => void;
}> = ({ post, onExpand, onUserClick }) => {
  const [stats, setStats] = useState(interactionService.getPostStats(post));

  const handleVote = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    const next = interactionService.handleVote(post.id, type);
    setStats(next);

    // Accrue ZAPS signal (simulation only)
    const user = dataService.getCurrentUser();
    if (user) {
      // fix: Added missing 'source' property to satisfy ZapsSignalEvent type
      zapsSignalEmitter.emit({
        communityId: post.communityId,
        actorUserId: user.id,
        type: type === 'up' ? "UPVOTE" : "DOWNVOTE",
        targetType: "POST",
        targetId: post.id,
        source: 'FEED',
        meta: { source: "feed" },
      });
      seasonalAllocationSimulation.recomputeCommunity(post.communityId);
    }
  };

  return (
    <motion.div 
      layoutId={`post-container-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      onClick={onExpand}
      className="group relative bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden transition-all duration-700 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] mb-8 cursor-pointer"
    >
      <div className="p-8 pb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="relative group/avatar cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onUserClick?.(post.author); }}
          >
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover/avatar:scale-105 transition-transform duration-500">
               <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full border-2 border-[#0A0A0A] flex items-center justify-center">
               <ShieldCheck size={10} className="text-blue-500" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-none mb-1.5">{post.author.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{post.author.handle}</span>
              <span className="w-1 h-1 rounded-full bg-gray-800" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{post.author.tier}</span>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-full text-gray-600 hover:text-white hover:bg-white/5 transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="px-8 pb-6">
        <p className="text-lg text-gray-200 font-light leading-relaxed mb-6">
          {post.content.text}
        </p>
        
        {post.content.image && (
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-black group-hover:border-white/10 transition-colors">
            <img src={post.content.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s]" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="px-8 py-6 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1" onClick={e => e.stopPropagation()}>
               <button 
                onClick={(e) => handleVote(e, 'up')}
                className={`p-1.5 rounded-full transition-all ${stats.status === 'up' ? 'text-purple-400 bg-purple-500/10' : 'text-gray-500 hover:text-white'}`}
               >
                 <ChevronUp size={18} strokeWidth={2.5} />
               </button>
               <span className={`text-xs font-bold tabular-nums w-8 text-center ${stats.status !== 'neutral' ? 'text-white' : 'text-gray-400'}`}>{stats.likes.toLocaleString()}</span>
               <button 
                onClick={(e) => handleVote(e, 'down')}
                className={`p-1.5 rounded-full transition-all ${stats.status === 'down' ? 'text-red-400 bg-red-500/10' : 'text-gray-500 hover:text-white'}`}
               >
                 <ChevronDown size={18} strokeWidth={2.5} />
               </button>
            </div>
            <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group/stat">
               <MessageCircle size={18} className="group-hover:text-blue-400" />
               <span className="text-xs font-bold tabular-nums">{post.stats.comments.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group/stat">
               <Share2 size={18} />
            </button>
         </div>
         
         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.1)] group/zap cursor-default">
            <Zap size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{post.stats.zaps.toLocaleString()} Zaps</span>
         </div>
      </div>
    </motion.div>
  );
};

const Feed: React.FC<FeedProps> = ({ onPostClick, onCommunityClick, onUserClick }) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [activeFilter, setActiveFilter] = useState('New');

  useEffect(() => {
    const load = async () => {
      const data = await feedServiceRouter.getFeed();
      setPosts(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="py-20 text-center animate-pulse text-gray-600 font-mono text-xs uppercase tracking-widest">Hydrating Stream...</div>;

  if (posts.length === 0) return (
     <div className="py-40 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
           <Zap size={32} className="text-gray-700" />
        </div>
        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Activity is forming here.</p>
     </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-[0.3em]">Protocol Stream</h2>
        <div className="flex gap-1 p-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-xl">
           {['New', 'Top', 'Rising'].map((f) => (
             <button 
                key={f} 
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onExpand={() => {
              setSelectedPost(post);
              onPostClick?.(post);
            }} 
            onUserClick={onUserClick}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedPost && (
          <PostDetailOverlay 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
            onCommunityClick={onCommunityClick}
            onUserClick={onUserClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feed;