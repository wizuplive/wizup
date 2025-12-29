
import React from 'react';
import { Users, Lock, Zap, CheckCircle2, ArrowRight, BookOpen, Mic, Package, MonitorPlay } from 'lucide-react';
import { DashboardCommunity } from '../../types';

interface CommunityCardProps {
  community: DashboardCommunity;
  onClick?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onClick }) => {
  // Determine Type Icon and Label
  const getTypeBadge = () => {
    switch (community.type) {
      case 'course': return { icon: MonitorPlay, label: 'Course', color: 'bg-blue-500/20 text-blue-200 border-blue-500/30' };
      case 'coaching': return { icon: Mic, label: 'Coaching', color: 'bg-pink-500/20 text-pink-200 border-pink-500/30' };
      case 'product': return { icon: Package, label: 'Product', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' };
      default: return null; // Communities don't need a specific type badge usually, or category covers it
    }
  };

  const typeBadge = getTypeBadge();

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white/5 rounded-[32px] overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10 cursor-pointer flex flex-col h-full"
    >
      
      {/* Hero Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        <img 
          src={community.image} 
          alt={community.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap pr-12">
           {community.isFeatured && (
             <span className="px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-500/30 text-[10px] font-bold tracking-wider text-purple-200 uppercase">
               Featured
             </span>
           )}
           <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-medium tracking-wide text-white uppercase">
             {community.category}
           </span>
           {typeBadge && (
             <span className={`px-3 py-1 rounded-full backdrop-blur-md border text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 ${typeBadge.color}`}>
                <typeBadge.icon size={10} /> {typeBadge.label}
             </span>
           )}
        </div>

        {/* Price/Access Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full backdrop-blur-md border text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
            community.accessType === 'free' 
              ? 'bg-green-500/20 border-green-500/30 text-green-200'
              : community.accessType === 'granted'
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
              : community.accessType === 'zaps'
              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200'
              : 'bg-white/10 border-white/20 text-white'
          }`}>
            {community.accessType === 'paid' && <Lock size={10} />}
            {community.accessType === 'zaps' && <Zap size={10} fill="currentColor" />}
            {community.accessType === 'granted' && <CheckCircle2 size={10} />}
            {community.cost || (community.accessType === 'granted' ? 'Joined' : 'Free')}
          </span>
        </div>
      </div>

      {/* Content Block */}
      <div className="p-6 relative flex flex-col flex-1">
        {/* Creator Info - Floating Overlap */}
        <div className="absolute -top-6 left-6 flex items-center gap-2">
          <div className="relative">
            <img 
              src={community.creator.avatar} 
              alt={community.creator.name} 
              className="w-10 h-10 rounded-full border-2 border-[#1a1a1a]" 
            />
            {community.creator.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-[#1a1a1a]">
                <CheckCircle2 size={8} />
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-gray-300 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/5">
            {community.creator.name}
          </span>
        </div>

        <h3 className="text-xl font-medium text-white mb-2 mt-4 leading-tight group-hover:text-purple-200 transition-colors">
          {community.title}
        </h3>
        
        <p className="text-sm text-gray-400 font-light line-clamp-2 mb-6 h-10">
          {community.description}
        </p>

        {/* Footer info (flexible spacer) */}
        <div className="mt-auto">
          {/* Progress Bar (if joined/progress exists) */}
          {community.progress !== undefined && (
            <div className="mb-6">
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                <span>Progress</span>
                <span>{community.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                  style={{ width: `${community.progress}%` }} 
                />
              </div>
            </div>
          )}

          {/* Metadata Row */}
          {!community.progress && (
            <div className="flex items-center gap-4 mb-6 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-gray-600" /> {community.members}
              </span>
              {community.type === 'course' && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>Modules</span>
                </>
              )}
              {community.type === 'community' && (
                 <>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>Live Events</span>
                 </>
              )}
              {community.hasZapReward && (
                 <span className="ml-auto flex items-center gap-1 text-yellow-500/80">
                    <Zap size={12} fill="currentColor" /> Earns ZAPs
                 </span>
              )}
            </div>
          )}

          {/* Action Button */}
          <button className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white transition-all hover:text-black flex items-center justify-center gap-2 group/btn relative overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              {community.accessType === 'granted' ? 'Enter' : community.accessType === 'free' ? 'Join for Free' : 'Unlock Access'} 
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </span>
            {community.accessType !== 'granted' && (
               <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CommunityCard;