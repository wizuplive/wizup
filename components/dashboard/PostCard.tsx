import React, { useState, useEffect } from 'react';
import { MessageCircle, Zap, ArrowUp, ArrowDown, Shield } from 'lucide-react';
import { Post } from '../../types';
import { useCommunityReputationLedger } from '../../hooks/useCommunityLedgers';
import { TierBadge } from '../reputation/TierBadge';
import { zapsSignalEmitter } from '../../services/zapsSignals/zapsSignalEmitter';
import { seasonalAllocationSimulation } from '../../services/seasonalSimulation/seasonalAllocationSimulation';
import { dataService } from '../../services/dataService';
import { recognitionService } from '../../services/recognition/recognitionService';
import { RECOGNITION_FLAGS } from '../../config/featureFlagsRecognition';
import RecognitionPill from '../recognition/RecognitionPill';

interface PostCardProps {
  post: any;
  onClick: (post: any) => void;
  onCommunityClick?: (community: any) => void;
  onUserClick?: (user: any) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick, onCommunityClick, onUserClick }) => {
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [recognitionLabel, setRecognitionLabel] = useState<string | null>(null);
  
  // Resilient data extraction
  const initialLikes = post?.stats?.likes ?? post?.likes ?? 0;
  const initialZaps = post?.stats?.zaps ?? post?.zaps ?? 0;
  const initialComments = post?.stats?.comments ?? post?.comments ?? 0;
  
  const [score, setScore] = useState(initialLikes);
  
  // Authoritative Scoped Reputation Badge Logic
  const communityId = post?.community?.name || 'Design Systems Mastery';
  const authorId = post?.author?.id || '';
  const rep = useCommunityReputationLedger(authorId, communityId);

  // Check for existing recognition for this post (simulation only)
  useEffect(() => {
    if (RECOGNITION_FLAGS.ZAPS_RECOGNITION_SURFACES) {
      const user = dataService.getCurrentUser();
      if (user) {
        const events = recognitionService.getEvents(user.id);
        const postEvent = events.find(e => e.sourceRef === String(post.id) && e.communityId === communityId);
        if (postEvent) setRecognitionLabel(postEvent.label);
      }
    }
  }, [post.id, communityId]);

  const handleVote = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    if (!post) return;

    if (voteStatus === type) {
      setVoteStatus('neutral');
      setScore(type === 'up' ? score - 1 : score + 1);
    } else {
      let baseScore = score;
      if (voteStatus === 'up') baseScore -= 1;
      if (voteStatus === 'down') baseScore += 1;
      setScore(type === 'up' ? baseScore + 1 : baseScore - 1);
      setVoteStatus(type);
    }

    // Accrue ZAPS signal (simulation only)
    const user = dataService.getCurrentUser();
    if (user) {
      zapsSignalEmitter.emit({
        communityId: communityId,
        actorUserId: user.id,
        type: type === 'up' ? "UPVOTE" : "DOWNVOTE",
        targetType: "POST",
        targetId: String(post.id),
        source: 'FEED',
        meta: { source: "standalone_card" },
      });
      seasonalAllocationSimulation.recomputeCommunity(communityId);
      
      // Local immediate feedback
      if (type === 'up' && !recognitionLabel) {
        setRecognitionLabel('Noted');
      }
    }
  };

  if (!post) return null;

  return (
    <article 
      onClick={() => onClick(post)}
      className="group relative bg-[#0F0F0F] rounded-[28px] border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] cursor-pointer"
    >
      <div className="p-6 pb-2 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); onUserClick?.(post.author); }}>
            <img src={post.author?.avatar} alt="User" className="w-10 h-10 rounded-full border border-white/10" />
            {rep.data?.tier && rep.data.tier !== 'T0' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full border border-white/10 flex items-center justify-center shadow-lg">
                 <Shield size={10} className="text-purple-400" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h3 className="text-sm font-bold text-white hover:text-purple-300 transition-colors" onClick={(e) => { e.stopPropagation(); onUserClick?.(post.author); }}>{post.author?.name}</h3>
               {rep.data?.tier && <TierBadge tier={rep.data.tier} />}
            </div>
            <p className="text-[11px] text-gray-500">
               {post.author?.handle} • {post.time || post.createdAt}
               {post.community && (
                 <span className="ml-1 text-gray-400 hover:text-purple-400" onClick={(e) => { e.stopPropagation(); onCommunityClick?.(post.community); }}>
                   in c/{post.community.name}
                 </span>
               )}
            </p>
          </div>
        </div>
        <button className="text-gray-600 hover:text-white transition-colors p-2 text-xs font-bold uppercase tracking-widest">
           {rep.data?.standingLabel || "Participant"}
        </button>
      </div>

      <div className="px-6 pb-4">
        <p className="text-base font-medium text-gray-100 leading-relaxed">{post.content?.text || post.content}</p>
      </div>

      {(post.image || post.content?.image) && (
        <div className="px-2 pb-2">
            <div className="relative aspect-video w-full rounded-[20px] overflow-hidden bg-black">
                <img src={post.image || post.content?.image} className="w-full h-full object-cover opacity-90" alt="" />
            </div>
        </div>
      )}

      <div className="px-6 py-4 flex items-center justify-between border-t border-white/5">
         <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5" onClick={e => e.stopPropagation()}>
              <button onClick={(e) => handleVote(e, 'up')} className={`p-1.5 rounded-full transition-colors ${voteStatus === 'up' ? 'text-purple-400' : 'text-gray-500 hover:text-white'}`}><ArrowUp size={16} /></button>
              <span className="text-xs font-bold text-white px-1 tabular-nums">{score}</span>
              <button onClick={(e) => handleVote(e, 'down')} className={`p-1.5 rounded-full transition-colors ${voteStatus === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-white'}`}><ArrowDown size={16} /></button>
            </div>
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs font-bold"><MessageCircle size={16} /> {initialComments}</button>
            
            {/* Micro Recognition Pill */}
            {recognitionLabel && RECOGNITION_FLAGS.ZAPS_RECOGNITION_SURFACES && (
              <RecognitionPill label={recognitionLabel} />
            )}
         </div>
         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] font-bold text-yellow-400 uppercase">
            <Zap size={12} fill="currentColor" /> {initialZaps}
         </div>
      </div>
    </article>
  );
};

export default PostCard;