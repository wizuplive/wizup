import React, { useEffect, useState } from 'react';
import { 
  X, MessageCircle, Share2, Zap, 
  ChevronUp, ChevronDown, 
  ShieldCheck, Send, Heart
} from 'lucide-react';
import { Comment } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { interactionService } from '../../services/interaction/interactionService';
import { dataService } from '../../services/dataService';
import { zapsSignalEmitter } from '../../services/zapsSignals/zapsSignalEmitter';
import { seasonalAllocationSimulation } from '../../services/seasonalSimulation/seasonalAllocationSimulation';

interface PostDetailOverlayProps {
  post: any; 
  onClose: () => void;
  onCommunityClick?: (community: any) => void;
  onUserClick?: (user: any) => void;
}

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-4 mb-8 group"
  >
    <div className="flex-shrink-0">
      <img src={comment.author.avatar} className="w-9 h-9 rounded-full border border-white/10" alt="" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-white">{comment.author.name}</span>
        <span className="text-[10px] text-gray-500">{comment.time}</span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed font-light">
        {comment.content}
      </p>
      <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Reply</button>
        <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
          <Heart size={10} /> {comment.likes}
        </button>
      </div>
    </div>
  </motion.div>
);

const PostDetailOverlay: React.FC<PostDetailOverlayProps> = ({ post, onClose, onCommunityClick, onUserClick }) => {
  const user = dataService.getCurrentUser();
  const [stats, setStats] = useState(interactionService.getPostStats(post));
  const [comments, setComments] = useState<Comment[]>(interactionService.getComments(post.id));
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleVote = (type: 'up' | 'down') => {
    const next = interactionService.handleVote(post.id, type);
    setStats(next);

    // Accrue ZAPS signal (simulation only)
    if (user) {
      const communityId = post.communityId || post.community?.name || 'Design Systems Mastery';
      // fix: Added missing 'source' property to satisfy ZapsSignalEvent type
      zapsSignalEmitter.emit({
        communityId,
        actorUserId: user.id,
        type: type === 'up' ? "UPVOTE" : "DOWNVOTE",
        targetType: "POST",
        targetId: String(post.id),
        source: 'FEED',
        meta: { source: "post_detail" }
      });
      seasonalAllocationSimulation.recomputeCommunity(communityId);
    }
  };

  const handlePostComment = () => {
    if (!commentInput.trim() || !user) return;
    const newComment = interactionService.addComment(post.id, commentInput, user);
    setComments([newComment, ...comments]);
    setCommentInput('');

    // Accrue ZAPS signal (simulation only)
    const communityId = post.communityId || post.community?.name || 'Design Systems Mastery';
    // fix: Added missing 'source' property to satisfy ZapsSignalEvent type
    zapsSignalEmitter.emit({
      communityId,
      actorUserId: user.id,
      type: "COMMENT",
      targetType: "POST",
      targetId: String(post.id),
      source: 'COMMENTS',
      meta: { commentId: newComment.id }
    });
    seasonalAllocationSimulation.recomputeCommunity(communityId);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        layoutId={`post-container-${post.id}`}
        className="relative w-full max-w-4xl h-full bg-[#050505] border-x border-white/10 flex flex-col pointer-events-auto shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 shrink-0 bg-black/40 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 cursor-pointer" onClick={() => onUserClick?.(post.author)}>
                <img src={post.author.avatar} className="w-full h-full object-cover" alt="" />
             </div>
             <div>
                <div className="flex items-center gap-2">
                   <h3 className="text-sm font-bold text-white hover:text-purple-300 transition-colors cursor-pointer" onClick={() => onUserClick?.(post.author)}>{post.author.name}</h3>
                   <ShieldCheck size={12} className="text-blue-500" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{post.author.handle}</span>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-12 lg:p-20">
           <div className="max-w-2xl mx-auto">
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl lg:text-4xl font-light text-white leading-tight mb-8"
              >
                {post.content.text || post.content}
              </motion.p>

              {(post.content.image || post.image) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-[40px] overflow-hidden border border-white/5 mb-12 shadow-2xl"
                >
                  <img src={post.content.image || post.image} className="w-full h-auto" alt="" />
                </motion.div>
              )}

              {/* Interaction Bar */}
              <div className="flex items-center justify-between py-8 border-y border-white/5 mb-12">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center bg-white/5 rounded-full p-1.5 border border-white/5">
                       <button 
                        onClick={() => handleVote('up')}
                        className={`p-2.5 rounded-full transition-all ${stats.status === 'up' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-white'}`}
                       >
                         <ChevronUp size={24} strokeWidth={2.5} />
                       </button>
                       <span className="text-base font-bold text-white min-w-[40px] text-center tabular-nums">{stats.likes.toLocaleString()}</span>
                       <button 
                        onClick={() => handleVote('down')}
                        className={`p-2.5 rounded-full transition-all ${stats.status === 'down' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-gray-500 hover:text-white'}`}
                       >
                         <ChevronDown size={24} strokeWidth={2.5} />
                       </button>
                    </div>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
                       <Share2 size={24} />
                       <span className="text-xs font-bold uppercase tracking-widest">Share</span>
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    <Zap size={18} fill="currentColor" />
                    <span className="text-xs font-bold uppercase tracking-widest">{post.stats?.zaps || post.zaps} Zaps</span>
                 </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-12 pb-32">
                 <div className="relative group">
                    <textarea 
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-white/5 border border-white/5 rounded-[24px] p-6 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none h-32 transition-all group-hover:bg-white/[0.08]"
                    />
                    <button 
                      onClick={handlePostComment}
                      disabled={!commentInput.trim()}
                      className="absolute bottom-6 right-6 p-3 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-0 disabled:scale-90"
                    >
                      <Send size={18} />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Discourse ({comments.length})</h4>
                    </div>
                    {comments.length > 0 ? (
                      comments.map(c => <CommentItem key={c.id} comment={c} />)
                    ) : (
                      <div className="py-20 text-center flex flex-col items-center">
                         <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-4">
                            <MessageCircle size={24} className="text-gray-700" />
                         </div>
                         <p className="text-sm text-gray-600 italic font-light">No responses yet. Start the conversation.</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostDetailOverlay;