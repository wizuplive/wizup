import React, { useEffect, useState } from 'react';
import { 
  Home, Compass, MessageCircle, Trophy, User, 
  LogOut, Plus, Shield, Zap, Globe, Database, ShoppingBag, ArrowLeft
} from 'lucide-react';
import { DashboardView } from '../../types';
import { communityServiceRouter } from '../../services/communities/communityService';
import { Community } from '../../types/communityTypes';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activeView: DashboardView | 'vault' | 'architect';
  onNavigate: (view: any) => void;
  onLogout: () => void;
  onCommunityClick?: (community: any) => void;
  isInfluencer?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onNavigate, 
  onLogout,
  onCommunityClick,
  isInfluencer 
}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const isAuraMap = activeView === 'influencers';

  useEffect(() => {
    communityServiceRouter.getCommunities().then(setCommunities);
  }, []);
  
  const menuItems: { icon: any, label: string, id: DashboardView | 'vault' | 'architect', badge?: number, activeColor?: string }[] = [
    { icon: Home, label: 'Discover', id: 'discover' },
    { icon: Compass, label: 'Spaces', id: 'communities' },
    { icon: ShoppingBag, label: 'Partners', id: 'influencers', activeColor: 'text-purple-400' },
    { icon: MessageCircle, label: 'Messages', id: 'messages', badge: 2 }, 
    { icon: Trophy, label: 'Leaderboard', id: 'leaderboard' },
    { icon: User, label: 'Profile', id: 'profile' },
    { icon: Database, label: 'Vault', id: 'vault' },
  ];

  return (
    <>
      {/* Floating Back Button for Cinematic Mode */}
      <AnimatePresence>
        {isAuraMap && (
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => onNavigate('discover')}
            className="fixed top-8 left-8 z-[60] p-4 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 text-white shadow-2xl hover:bg-white/10 transition-all flex items-center gap-3 group"
          >
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-widest pr-2">Return</span>
          </motion.button>
        )}
      </AnimatePresence>

      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen w-[280px] bg-black border-r border-white/[0.05] flex-col z-40 transition-transform duration-1000 ${isAuraMap ? '-translate-x-full' : 'translate-x-0'}`}>
        
        {/* Brand Section */}
        <div className="h-24 flex items-center px-10">
          <span 
            className="text-[11px] font-black tracking-[0.6em] text-white cursor-pointer hover:opacity-70 transition-opacity uppercase" 
            onClick={() => onNavigate('discover')}
          >
            WIZUP
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-white/[0.05] text-white border border-white/[0.05]' 
                    : 'text-white/40 hover:bg-white/[0.03] hover:text-white/70'}
                `}
              >
                <item.icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? (item.activeColor || "text-white") : "text-white/20 group-hover:text-white/40"} 
                />
                <span className={`text-[13px] font-semibold tracking-tight ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
                
                {item.badge && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-purple-600 text-[10px] font-black flex items-center justify-center text-white shadow-lg">
                     {item.badge}
                  </div>
                )}
                
                {isActive && (
                  <motion.div 
                    layoutId="sidebarActiveIndicator"
                    className={`absolute left-0 w-1 h-4 ${item.activeColor ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' : 'bg-white'} rounded-full`} 
                  />
                )}
              </button>
            );
          })}

          <div className="pt-10 px-6">
             <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-8">Your Spaces</h4>
             <div className="space-y-6">
                {communities.map(c => (
                  <div 
                    key={c.id} 
                    className="flex items-center gap-4 group cursor-pointer"
                    onClick={() => onCommunityClick?.(c)}
                  >
                     <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:border-white/20">
                        <img src={c.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100" alt="" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-white/30 group-hover:text-white transition-colors truncate">
                          {c.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                           <div className={`w-1 h-1 rounded-full ${c.activity === 'Active' ? 'bg-green-500/50' : 'bg-white/10'}`} />
                           <span className="text-[8px] font-black text-white/20 group-hover:text-white/40 uppercase tracking-tighter">
                            {c.activity}
                           </span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </nav>

        {/* Footer Tools */}
        <div className="p-6 space-y-4">
          {isInfluencer && (
            <button 
              onClick={() => onNavigate('seller-hub')}
              className="w-full flex items-center gap-4 px-6 py-3 rounded-2xl text-purple-400 hover:text-purple-300 transition-all group bg-purple-500/[0.03] border border-purple-500/10"
            >
              <Shield size={18} strokeWidth={2} />
              <span className="font-black text-[9px] uppercase tracking-[0.2em]">Seller Centre</span>
            </button>
          )}
          
          <button 
            onClick={() => onNavigate('studio')}
            className="w-full h-11 rounded-full relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-2xl"
          >
            <div className="absolute inset-0 bg-white text-black flex items-center justify-center gap-2.5 font-black text-[9px] uppercase tracking-[0.2em]">
              <Plus size={14} strokeWidth={3} />
              <span>Create Space</span>
            </div>
          </button>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-3 rounded-2xl text-white/10 hover:text-white transition-colors group"
          >
            <LogOut size={16} strokeWidth={2} />
            <span className="font-bold text-[10px] uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
