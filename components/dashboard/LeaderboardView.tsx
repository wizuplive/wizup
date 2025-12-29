
import React, { useState } from 'react';
import { 
  Search, ChevronDown, Trophy, Sparkles, 
  TrendingUp, TrendingDown, Minus, UserPlus, Star
} from 'lucide-react';

// --- Types & Mock Data ---

interface LeaderboardUser {
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  xp: string;
  category: string;
  trend: 'up' | 'down' | 'neutral';
  movement?: number;
}

const TOP_THREE: LeaderboardUser[] = [
  {
    rank: 1,
    name: "AIGuru42",
    handle: "@ai_guru",
    avatar: "https://picsum.photos/seed/guru/200/200",
    xp: "125.0K",
    category: "AI & ML",
    trend: 'up',
    movement: 4
  },
  {
    rank: 2,
    name: "CodeMaster",
    handle: "@code_wiz",
    avatar: "https://picsum.photos/seed/code/200/200",
    xp: "98.0K",
    category: "Tech",
    trend: 'up',
    movement: 2
  },
  {
    rank: 3,
    name: "MoneyWizard",
    handle: "@finance_flow",
    avatar: "https://picsum.photos/seed/finance/200/200",
    xp: "87.0K",
    category: "Finance",
    trend: 'down',
    movement: 1
  }
];

const RISING_CREATORS: LeaderboardUser[] = Array.from({ length: 10 }).map((_, i) => ({
  rank: i + 4,
  name: [
    "DesignQueen", "CryptoKing", "ZenMaster", "ProductPro", "GrowthHacker", 
    "ArtisticSoul", "MusicMaker", "DataNerd", "CloudArchitect", "CyberSec"
  ][i],
  handle: `@user_${i + 4}`,
  avatar: `https://picsum.photos/seed/user${i + 4}/100/100`,
  xp: `${(75 - i * 2.5).toFixed(1)}K`,
  category: ["Design", "Web3", "Wellness", "Product", "Marketing", "Art", "Music", "Data", "Cloud", "Security"][i],
  trend: i % 3 === 0 ? 'up' : i % 2 === 0 ? 'down' : 'neutral',
  movement: Math.floor(Math.random() * 5)
}));

// --- Sub-Components ---

interface TabButtonProps { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-500 ${
      active ? 'text-white' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {active && (
      <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500" />
    )}
    <span className="relative z-10">{label}</span>
  </button>
);

const FilterPill: React.FC<{ label: string }> = ({ label }) => (
  <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 hover:text-white transition-all backdrop-blur-sm">
    {label}
  </button>
);

interface PodiumCardProps {
  user: LeaderboardUser;
  onClick?: () => void;
}

const PodiumCard: React.FC<PodiumCardProps> = ({ user, onClick }) => {
  const isFirst = user.rank === 1;
  
  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col items-center group transition-transform duration-700 cursor-pointer ${isFirst ? '-mt-12 z-10 scale-110' : 'mt-4 z-0 hover:-translate-y-2'}`}
    >
      
      {/* Crown / Rank Badge */}
      <div className={`absolute -top-6 w-12 h-12 flex items-center justify-center rounded-full border border-white/20 backdrop-blur-xl shadow-xl z-20 ${
        isFirst 
          ? 'bg-gradient-to-b from-yellow-300/20 to-yellow-500/20 text-yellow-300 scale-125 ring-1 ring-yellow-500/50' 
          : user.rank === 2 
          ? 'bg-white/10 text-gray-300' 
          : 'bg-white/10 text-amber-600'
      }`}>
        <span className="font-bold text-lg">{user.rank}</span>
      </div>

      {/* Avatar with Glow Ring */}
      <div className="relative mb-6">
        <div className={`absolute inset-0 rounded-full blur-xl opacity-40 transition-opacity duration-1000 ${
          isFirst ? 'bg-purple-500 group-hover:opacity-60' : 'bg-blue-500 group-hover:opacity-50'
        }`} />
        
        {/* Animated Ring SVG */}
        <div className="relative w-32 h-32 p-1.5">
           <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
             <circle 
               cx="50" cy="50" r="48" fill="none" 
               stroke={isFirst ? "url(#grad1)" : "rgba(255,255,255,0.5)"} 
               strokeWidth="2" 
               strokeDasharray="300" 
               strokeDashoffset="60" 
               strokeLinecap="round"
               className="drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]"
             />
             <defs>
               <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#c084fc" />
                 <stop offset="100%" stopColor="#e879f9" />
               </linearGradient>
             </defs>
           </svg>
           <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full rounded-full object-cover border-4 border-[#0a0a0a]"
           />
        </div>
      </div>

      {/* Details */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="text-lg font-medium text-white tracking-tight">{user.name}</h3>
          {isFirst && <Sparkles size={12} className="text-yellow-400 animate-pulse" />}
        </div>
        <p className="text-xs text-gray-500 font-light">{user.category}</p>
        
        <div className="mt-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md inline-flex items-center gap-2">
          <span className={`text-sm font-bold ${isFirst ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-gray-300'}`}>
            {user.xp} XP
          </span>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-0.5 text-[10px] font-medium text-green-400">
             <TrendingUp size={10} /> {user.movement}
          </div>
        </div>
      </div>

      {/* Holographic Base Effect for #1 */}
      {isFirst && (
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-48 h-12 bg-purple-500/20 blur-[40px] rounded-full pointer-events-none" />
      )}
    </div>
  );
};

interface ListItemProps {
  user: LeaderboardUser;
  onClick?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ user, onClick }) => (
  <div onClick={onClick} className="group flex items-center p-4 rounded-2xl bg-transparent hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 cursor-pointer">
    
    {/* Rank */}
    <div className="w-12 text-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors">
      #{user.rank}
    </div>

    {/* User Info */}
    <div className="flex items-center gap-4 flex-1">
      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-white/20 transition-all">
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{user.name}</h4>
        <div className="flex items-center gap-2">
           <span className="text-xs text-gray-500">{user.handle}</span>
           <span className="w-1 h-1 rounded-full bg-gray-700" />
           <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">{user.category}</span>
        </div>
      </div>
    </div>

    {/* Stats & Actions */}
    <div className="flex items-center gap-8">
      
      {/* XP */}
      <div className="text-right w-24">
        <span className="block text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{user.xp}</span>
        <span className="text-[10px] text-gray-600 uppercase tracking-wider">Total XP</span>
      </div>

      {/* Trend */}
      <div className="w-8 flex justify-center">
        {user.trend === 'up' && <TrendingUp size={16} className="text-green-500/80" />}
        {user.trend === 'down' && <TrendingDown size={16} className="text-red-500/80" />}
        {user.trend === 'neutral' && <Minus size={16} className="text-gray-600" />}
      </div>

      {/* Action */}
      <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95">
        <UserPlus size={14} />
      </button>

    </div>
  </div>
);

interface LeaderboardViewProps {
  onUserClick?: (user: any) => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onUserClick }) => {
  const [activeTab, setActiveTab] = useState('Creators');

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/20 via-black to-black pointer-events-none" />
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Confetti / Dust Particles */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Floating Navigation Panel */}
      <div className="sticky top-4 z-40 max-w-5xl mx-auto px-4">
        <div className="h-16 rounded-[24px] bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-between px-2 pl-6 shadow-2xl shadow-black/50 transition-all">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
                <Trophy size={14} className="text-white" />
             </div>
             <span className="text-lg font-light tracking-widest text-white hidden sm:block">LEADERBOARD</span>
          </div>

          {/* Centered Tabs */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5">
             {['Creators', 'Wizards', 'Communities', 'Influencers'].map(tab => (
               <TabButton 
                 key={tab} 
                 label={tab} 
                 active={activeTab === tab} 
                 onClick={() => setActiveTab(tab)} 
               />
             ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 pr-2">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-gray-400 hover:bg-white/10 transition-colors">
               <Search size={12} />
               <span>Search...</span>
             </div>
             
             {/* My XP Badge */}
             <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                <div className="flex flex-col items-end leading-none">
                   <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">My Rank</span>
                   <span className="text-sm font-bold text-white">#142</span>
                </div>
                <div className="w-8 h-8 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-400">
                   <Star size={12} fill="currentColor" />
                </div>
             </div>
          </div>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        
        {/* Filters Row */}
        <div className="flex justify-center items-center gap-3 mb-16 animate-fade-in-up">
           <button className="flex items-center gap-1 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition-transform">
             This Week <ChevronDown size={12} />
           </button>
           <FilterPill label="All Categories" />
           <FilterPill label="Rising Stars" />
        </div>

        {/* Podium Hero */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-12 md:gap-8 lg:gap-12 mb-20 min-h-[300px] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="order-2 md:order-1"><PodiumCard user={TOP_THREE[1]} onClick={() => onUserClick && onUserClick(TOP_THREE[1])} /></div> {/* Rank 2 */}
          <div className="order-1 md:order-2"><PodiumCard user={TOP_THREE[0]} onClick={() => onUserClick && onUserClick(TOP_THREE[0])} /></div> {/* Rank 1 */}
          <div className="order-3 md:order-3"><PodiumCard user={TOP_THREE[2]} onClick={() => onUserClick && onUserClick(TOP_THREE[2])} /></div> {/* Rank 3 */}
        </div>

        {/* Rising Creators List */}
        <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between px-6 pb-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest border-b border-white/5 mb-2">
             <span>Creator</span>
             <span className="pr-12">Performance</span>
          </div>
          
          {RISING_CREATORS.map((user) => (
            <ListItem key={user.rank} user={user} onClick={() => onUserClick && onUserClick(user)} />
          ))}
          
          <div className="pt-8 text-center">
            <button className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 hover:text-white transition-colors border border-white/5">
              Load More Creators
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LeaderboardView;