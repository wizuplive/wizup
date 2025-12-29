
import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowUpRight, Search, Inbox, Filter } from 'lucide-react';
import CommunityCard from './CommunityCard';
import { DashboardCommunity } from '../../types';

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 overflow-hidden flex-shrink-0 ${
      active 
        ? 'text-black bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
        : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10'
    }`}
  >
    <span className="relative z-10">{label}</span>
  </button>
);

const NavTab: React.FC<FilterPillProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0 ${
      active
        ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/10'
        : 'text-gray-500 hover:text-white'
    }`}
  >
    {active && (
      <div className="absolute inset-0 bg-white/5 rounded-full blur-sm" />
    )}
    <span className="relative z-10">{label}</span>
  </button>
);

interface CommunitiesViewProps {
  communities: DashboardCommunity[];
  onSelectCommunity?: (community: DashboardCommunity) => void;
  joinedIds?: Set<number>;
}

const CommunitiesView: React.FC<CommunitiesViewProps> = ({ communities, onSelectCommunity, joinedIds }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCommunities = useMemo(() => {
    return communities.filter(c => {
      // 1. Tab Filter
      if (activeTab === 'Communities' && c.type !== 'community') return false;
      if (activeTab === 'Courses' && c.type !== 'course') return false;
      if (activeTab === 'Coaching' && c.type !== 'coaching') return false;
      if (activeTab === 'Digital Products' && c.type !== 'product') return false;

      // 2. Row Filter
      if (activeFilter === 'Free') {
        if (c.accessType !== 'free') return false;
      }
      if (activeFilter === 'Free-ZAPs') {
        // Must be free AND provide a Zap reward
        if (c.accessType !== 'free' || !c.hasZapReward) return false;
      }
      if (activeFilter === 'Paid') {
        // Includes Paid, Zaps, or any cost
        if (!['paid', 'zaps'].includes(c.accessType)) return false;
      }
      if (activeFilter === 'My Communities') {
        if (!joinedIds?.has(c.id) && c.accessType !== 'granted') return false;
      }

      return true;
    });
  }, [communities, activeTab, activeFilter, joinedIds]);

  const handleHeroClick = () => {
    if (onSelectCommunity && communities.length > 0) {
      const featured = communities.find(c => c.isFeatured) || communities[0];
      onSelectCommunity(featured);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      
      {/* --- Sticky Header & Navigation --- */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 space-y-4">
          
          {/* Top Tabs (Segmented Control) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide no-scrollbar -mx-2 px-2">
            {['All', 'Communities', 'Courses', 'Coaching', 'Digital Products'].map(tab => (
              <NavTab 
                key={tab} 
                label={tab} 
                active={activeTab === tab} 
                onClick={() => { setActiveTab(tab); setActiveFilter('All'); }} 
              />
            ))}
          </div>

          {/* Filter Row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-2 px-2">
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest mr-2 flex-shrink-0">
               <Filter size={10} /> Filter
             </div>
             {['All', 'Free', 'Free-ZAPs', 'Paid', 'My Communities'].map(sub => (
               <FilterPill 
                 key={sub}
                 label={sub}
                 active={activeFilter === sub}
                 onClick={() => setActiveFilter(sub)}
               />
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
        
        {/* Featured Hero (Only show on 'All' or 'Communities' tab when no filter is active) */}
        {activeTab === 'All' && activeFilter === 'All' && (
          <div 
            onClick={handleHeroClick}
            className="relative w-full rounded-[40px] overflow-hidden mb-16 group cursor-pointer border border-white/5 shadow-2xl shadow-black"
          >
            <div className="absolute inset-0 z-0">
               <img src="https://picsum.photos/seed/featured-hero/1600/900" alt="Featured" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 mix-blend-overlay" />
            </div>
            
            <div className="relative z-10 p-8 md:p-16 flex flex-col items-start justify-end h-[500px] md:h-[600px] max-w-4xl">
               <div className="mb-6 flex items-center gap-3 animate-fade-in-up">
                  <span className="px-3 py-1 bg-white text-black text-[10px] font-bold tracking-widest uppercase rounded-full">
                    Featured Premiere
                  </span>
                  <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1">
                    <Sparkles size={10} className="text-yellow-400" /> WIZUP Original
                  </span>
               </div>
               
               <h1 className="text-4xl md:text-7xl font-medium text-white mb-6 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                 The Future of Decentralized Intelligence
               </h1>
               
               <p className="text-lg md:text-xl text-gray-200 font-light mb-10 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                 Join the exclusive cohort led by industry visionaries. Master the art of AI integration, blockchain dynamics, and community governance.
               </p>
               
               <button 
                 onClick={(e) => { e.stopPropagation(); handleHeroClick(); }}
                 className="px-8 py-4 bg-white text-black rounded-full font-medium text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2 animate-fade-in-up" 
                 style={{ animationDelay: '0.3s' }}
               >
                 Start Learning Now <ArrowUpRight size={20} />
               </button>
            </div>
          </div>
        )}

        {/* Grid or Empty State */}
        {filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 animate-fade-in-up">
            {filteredCommunities.map(comm => (
              <CommunityCard 
                key={comm.id} 
                community={comm} 
                onClick={() => onSelectCommunity && onSelectCommunity(comm)}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center animate-fade-in-up">
             <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Inbox size={40} className="text-gray-600" />
             </div>
             <h3 className="text-xl font-medium text-white mb-2">No items found</h3>
             <p className="text-gray-500 font-light">Try adjusting your filters or search criteria.</p>
             <button 
               onClick={() => { setActiveTab('All'); setActiveFilter('All'); }}
               className="mt-8 px-6 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
             >
               Clear Filters
             </button>
          </div>
        )}

        {/* Minimal Footer */}
        {filteredCommunities.length > 0 && (
          <div className="border-t border-white/5 pt-12 text-center text-gray-600">
             <p className="text-sm font-light tracking-wide">Powered by WIZUP · Turn attention into access</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunitiesView;