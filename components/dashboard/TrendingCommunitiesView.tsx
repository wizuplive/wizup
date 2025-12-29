
import React, { useState } from 'react';
import { 
  ArrowLeft, Search, Filter, TrendingUp, Zap, Star, 
  Users, CheckCircle2, ChevronDown, Flame, Sparkles,
  ArrowUpRight
} from 'lucide-react';

// --- MOCK DATA ---

const TRENDING_COMMUNITIES = [
  { id: 1, name: "AI Artists Collective", members: "12.4k", growth: 12, category: "AI Tools", image: "https://picsum.photos/seed/ai-art/200/200", description: "The premier hub for generative art workflows.", color: "purple", badge: "Fastest Growing" },
  { id: 2, name: "Web3 Builders", members: "8.1k", growth: 8, category: "Crypto", image: "https://picsum.photos/seed/web3/200/200", description: "Smart contract dev & auditing discussions.", color: "blue", badge: "Top Ranked" },
  { id: 3, name: "Minimalist Life", members: "25k", growth: 5, category: "Lifestyle", image: "https://picsum.photos/seed/minimal/200/200", description: "Declutter your mind and digital workspace.", color: "green", badge: "Verified" },
  { id: 4, name: "SaaS Launchpad", members: "15.2k", growth: 18, category: "Business", image: "https://picsum.photos/seed/saas/200/200", description: "Zero to $10k MRR strategies and cohorts.", color: "orange", badge: "Highly Active" },
  { id: 5, name: "Figma Masters", members: "42k", growth: 4, category: "Design", image: "https://picsum.photos/seed/figma/200/200", description: "Advanced prototyping & token systems.", color: "pink", badge: "Verified" },
  { id: 6, name: "Indie Game Devs", members: "6.8k", growth: 22, category: "Tech", image: "https://picsum.photos/seed/game/200/200", description: "Unity & Unreal Engine support group.", color: "red", badge: "New" },
  { id: 7, name: "Biohacking 101", members: "9.5k", growth: 9, category: "Wellness", image: "https://picsum.photos/seed/health/200/200", description: "Optimize sleep, diet, and performance.", color: "cyan", badge: "Top Ranked" },
  { id: 8, name: "Prompt Engineering", members: "31k", growth: 15, category: "AI Tools", image: "https://picsum.photos/seed/prompt/200/200", description: "Advanced LLM prompting techniques.", color: "purple", badge: "Fastest Growing" },
  { id: 9, name: "DeFi Alpha", members: "18k", growth: 7, category: "Crypto", image: "https://picsum.photos/seed/defi/200/200", description: "Yield farming strategies & risk analysis.", color: "blue", badge: "Verified" },
];

interface TrendingCommunitiesViewProps {
  onBack: () => void;
  onCommunityClick: (community: any) => void;
}

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border ${
      active 
        ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
        : 'bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10'
    }`}
  >
    {label}
  </button>
);

const TrendingCommunitiesView: React.FC<TrendingCommunitiesViewProps> = ({ onBack, onCommunityClick }) => {
  const [activeSort, setActiveSort] = useState('Trending');
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="min-h-screen bg-[#050505] text-white relative animate-slide-left-fade pb-20 selection:bg-purple-500/30 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/10 blur-[150px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium text-gray-400 hover:text-white transition-all group mb-8"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Feed</span>
        </button>

        {/* Hero Section */}
        <div className="relative w-full rounded-[40px] overflow-hidden mb-12 p-10 md:p-16 border border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] group">
           {/* Gradient Background */}
           <div className="absolute inset-0 bg-gradient-to-br from-[#2e1065] to-[#0f172a] z-0" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0" />
           
           {/* Floating Bubbles Animation */}
           <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
              {[1, 2, 3, 4, 5].map((i) => (
                 <div 
                   key={i}
                   className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-md animate-pulse-slow"
                   style={{
                      top: `${Math.random() * 80}%`,
                      left: `${Math.random() * 90}%`,
                      animationDelay: `${i * 1.5}s`,
                      transform: `scale(${0.8 + Math.random() * 0.5})`
                   }}
                 />
              ))}
           </div>

           <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6 shadow-lg animate-fade-in-up">
                 <Flame size={14} className="text-orange-400" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Insights</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight leading-tight drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                 Trending Communities
              </h1>
              <p className="text-lg md:text-xl text-purple-200/80 font-light max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                 Discover the most active, fastest-growing spaces. Where the conversations happen before they hit the mainstream.
              </p>
           </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="sticky top-4 z-40 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-black/60 backdrop-blur-2xl border border-white/10 p-2 rounded-[24px] shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
           
           {/* Sort Toggle */}
           <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
              {['Trending', 'Most Active', 'Fastest Growing', 'New'].map(sort => (
                 <button
                   key={sort}
                   onClick={() => setActiveSort(sort)}
                   className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                      activeSort === sort 
                         ? 'bg-white text-black shadow-lg' 
                         : 'text-gray-400 hover:text-white'
                   }`}
                 >
                    {sort}
                 </button>
              ))}
           </div>

           {/* Category Filters */}
           <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto px-2">
              {['All', 'AI Tools', 'Crypto', 'Design', 'Tech', 'Wellness', 'Business'].map(cat => (
                 <FilterPill 
                   key={cat} 
                   label={cat} 
                   active={activeCategory === cat} 
                   onClick={() => setActiveCategory(cat)} 
                 />
              ))}
           </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
           {TRENDING_COMMUNITIES.filter(c => activeCategory === 'All' || c.category === activeCategory).map((comm, idx) => (
              <div 
                key={comm.id}
                onClick={() => onCommunityClick(comm)}
                className="group relative bg-[#121212] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.08] hover:border-white/10 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-500 cursor-pointer overflow-hidden"
              >
                 {/* Top Badge */}
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
                       <span className={`w-1.5 h-1.5 rounded-full ${
                          comm.badge === 'Top Ranked' ? 'bg-yellow-400' : 
                          comm.badge === 'Fastest Growing' ? 'bg-green-400' : 
                          comm.badge === 'Highly Active' ? 'bg-orange-400' : 'bg-blue-400'
                       }`} />
                       <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{comm.badge}</span>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black">
                       <ArrowUpRight size={16} />
                    </button>
                 </div>

                 {/* Avatar & Identity */}
                 <div className="flex items-center gap-5 mb-6">
                    <div className="relative">
                       <div className={`absolute inset-0 rounded-[20px] bg-${comm.color}-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                       <img src={comm.image} alt={comm.name} className="relative w-20 h-20 rounded-[20px] object-cover border-2 border-white/5 group-hover:scale-105 transition-transform duration-500 shadow-xl" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white leading-tight mb-1 group-hover:text-purple-200 transition-colors">{comm.name}</h3>
                       <p className="text-xs text-gray-400 font-medium bg-white/5 px-2 py-0.5 rounded-md inline-block border border-white/5">{comm.category}</p>
                    </div>
                 </div>

                 {/* Description */}
                 <p className="text-sm text-gray-400 font-light leading-relaxed mb-8 line-clamp-2">
                    {comm.description}
                 </p>

                 {/* Footer Stats & Action */}
                 <div className="flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex flex-col">
                       <span className="text-lg font-bold text-white">{comm.members}</span>
                       <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          Members <span className="text-green-400">+{comm.growth}%</span>
                       </div>
                    </div>
                    <button className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:scale-105 transition-transform shadow-lg">
                       Join
                    </button>
                 </div>
              </div>
           ))}
        </div>

        {/* Empty State */}
        {TRENDING_COMMUNITIES.filter(c => activeCategory === 'All' || c.category === activeCategory).length === 0 && (
           <div className="py-32 text-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
                 <Search size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No communities found</h3>
              <p className="text-gray-500 text-sm mb-8">Try adjusting your filters.</p>
              <button 
                onClick={() => setActiveCategory('All')}
                className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                 Reset Filters
              </button>
           </div>
        )}

      </div>
    </div>
  );
};

export default TrendingCommunitiesView;
