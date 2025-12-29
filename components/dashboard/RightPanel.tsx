
import React from 'react';
import { ArrowUpRight, Award, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { TrendingCommunity, Contributor } from '../../types';

const MOCK_TRENDING: TrendingCommunity[] = [
  { id: 1, name: "AI Artists Collective", members: "12.4k", growth: 12, image: "https://picsum.photos/seed/ai-art/100/100" },
  { id: 2, name: "Web3 Builders", members: "8.1k", growth: 8, image: "https://picsum.photos/seed/web3/100/100" },
  { id: 3, name: "Minimalist Life", members: "25k", growth: 5, image: "https://picsum.photos/seed/minimal/100/100" },
];

const MOCK_CONTRIBUTORS: Contributor[] = [
  { id: 1, name: "Elena R.", avatar: "https://picsum.photos/seed/u1/100/100", zaps: 15400, rank: 1, trend: 'up' },
  { id: 2, name: "David K.", avatar: "https://picsum.photos/seed/u2/100/100", zaps: 12200, rank: 2, trend: 'neutral' },
  { id: 3, name: "Sarah M.", avatar: "https://picsum.photos/seed/u3/100/100", zaps: 9800, rank: 3, trend: 'up' },
];

interface RightPanelProps {
  onCommunityClick?: (community: any) => void;
  onViewAllTrending?: () => void;
  onUserClick?: (user: any) => void;
  onLeaderboardClick?: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ onCommunityClick, onViewAllTrending, onUserClick, onLeaderboardClick }) => {
  return (
    <div className="hidden xl:block w-80 p-8 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      
      {/* Trending Communities */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp size={14} className="text-purple-400" /> Trending
          </h3>
          <button 
            onClick={onViewAllTrending}
            className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors tracking-wider"
          >
            VIEW ALL
          </button>
        </div>

        <div className="space-y-4">
          {MOCK_TRENDING.map(comm => (
            <div 
              key={comm.id} 
              onClick={() => onCommunityClick && onCommunityClick(comm)}
              className="group p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-center gap-3 cursor-pointer hover:bg-white/10"
            >
              <img src={comm.image} alt={comm.name} className="w-10 h-10 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">{comm.name}</h4>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-0.5"><Users size={8} /> {comm.members}</span>
                  <span className="text-green-400">+{comm.growth}%</span>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award size={14} className="text-yellow-400" /> Top Earners
          </h3>
          <button 
            onClick={() => {
              if (onLeaderboardClick) {
                onLeaderboardClick();
              }
            }}
            className="text-[10px] font-bold text-gray-500 hover:text-purple-400 transition-colors tracking-wider flex items-center gap-1 group cursor-pointer"
          >
            LEADERBOARD
            <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm">
          {MOCK_CONTRIBUTORS.map((user, idx) => (
            <div 
              key={user.id} 
              onClick={() => onUserClick && onUserClick(user)}
              className="flex items-center p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className={`w-5 text-center text-xs font-bold mr-3 ${
                idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-amber-600'
              }`}>
                {user.rank}
              </span>
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-black mr-3" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">{user.name}</h4>
                <p className="text-xs text-gray-500">Weekly Top Contributor</p>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-white">{user.zaps.toLocaleString()}</span>
                <span className="text-[10px] text-gray-500 uppercase">Zaps</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Footer */}
      <div className="mt-12 text-[10px] text-gray-600 space-y-2">
        <div className="flex flex-wrap gap-3">
          <a href="#" className="hover:text-gray-400">Privacy</a>
          <a href="#" className="hover:text-gray-400">Terms</a>
          <a href="#" className="hover:text-gray-400">Advertising</a>
        </div>
        <p>&copy; 2024 WIZUP Inc.</p>
      </div>

    </div>
  );
};

export default RightPanel;
