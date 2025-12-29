import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, Bell, Zap, User, User as UserIcon, Sparkles, Wallet
} from 'lucide-react';
import { DashboardView, RitualState } from '../../types';
import { UserProfile } from '../../services/dataService';
import { reputationService, ReputationTierId } from '../../services/reputationService';
import { featureFlags } from '../../config/featureFlags';
import { getRecognitionNotifications } from '../../services/zapsRecognition/selectors';
import NotificationBadge from '../ui/NotificationBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  currentView?: DashboardView;
  onNavigate: (view: DashboardView) => void;
  ritualState?: RitualState;
  balance?: number; 
  user?: UserProfile | null;
}

const TopBar: React.FC<TopBarProps> = ({ currentView = 'discover', onNavigate, ritualState = 'idle', balance = 2450, user }) => {
  const [activeDropdown, setActiveDropdown] = useState<'none' | 'profile' | 'wallet' | 'notifs' | 'messages'>('none');
  
  const isAfterstate = ritualState === 'afterstate' || ritualState === 'imprint' || ritualState === 'confirmed';

  const { tier, progress } = useMemo(() => {
    const score = user ? reputationService.getUserTotalScore(user.id) : 0;
    return reputationService.getUserTier(score);
  }, [user]);

  const zapBalance = user ? user.walletBalance : balance;

  const recognitionNotifications = useMemo(() => {
    if (!user || !featureFlags.ZAPS_RECOGNITION_SURFACES) return [];
    return getRecognitionNotifications(user.id).map(r => ({
      id: r.id,
      type: 'recognition' as const,
      text: <span><strong className="text-white">Recognition</strong> received</span>,
      subtext: r.payload.reason.replace("_", " ").toLowerCase(),
      time: "Just now",
      read: false
    }));
  }, [user]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setActiveDropdown('none');
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <header className="sticky top-0 h-24 w-full bg-black/60 backdrop-blur-2xl border-b border-white/[0.03] z-40">
      <div className="w-full h-full max-w-[1400px] mx-auto flex items-center px-10 gap-10">
        
        {/* Mobile Logo Fallback */}
        <div className="lg:hidden flex items-center mr-2">
           <span className="text-[10px] font-black tracking-[0.4em] text-white uppercase" onClick={() => onNavigate('discover')}>WIZUP</span>
        </div>

        {/* Search Engine - Apple Style */}
        <div className="flex-1 max-w-[600px]">
           <div className="relative group">
              <div className="absolute inset-0 bg-white/[0.03] rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex items-center h-11 bg-white/[0.04] border border-white/5 rounded-full px-5 transition-all duration-500 focus-within:bg-white/[0.07] focus-within:border-white/10 group-hover:border-white/10">
                 <Search size={16} className="text-white/20 group-focus-within:text-white transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search the network..." 
                   className="flex-1 bg-transparent border-none text-[13px] text-white placeholder-white/20 focus:outline-none px-4 font-medium tracking-tight" 
                 />
                 <span className="text-[9px] font-black text-white/10 uppercase tracking-widest pointer-events-none px-2 py-1 rounded bg-white/[0.02] border border-white/[0.05]">⌘K</span>
              </div>
           </div>
        </div>

        {/* Action Clusters */}
        <div className="flex items-center gap-3">
          
          {/* Wallet Trigger */}
          <button 
            onClick={() => onNavigate('wallet')}
            className={`
              flex items-center gap-3 h-11 px-5 rounded-full border transition-all duration-700
              ${isAfterstate 
                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400' 
                : 'bg-white/[0.04] border-white/5 text-white/40 hover:text-white hover:border-white/20'}
            `}
          >
            <Zap size={14} fill={isAfterstate ? "currentColor" : "none"} strokeWidth={2.5} className={isAfterstate ? 'animate-pulse' : ''} />
            <span className="text-xs font-black tabular-nums tracking-wider uppercase">
              {zapBalance.toLocaleString()} <span className="opacity-30">ZAP</span>
            </span>
          </button>

          {/* Notifications */}
          <button className="relative w-11 h-11 rounded-full bg-white/[0.04] border border-white/5 text-white/40 hover:text-white transition-all flex items-center justify-center">
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
          </button>

          {/* Profile Ring - Apple Watch Style */}
          <button 
            onClick={() => onNavigate('profile')}
            className="relative w-11 h-11 rounded-full p-[2.5px] border border-white/10 hover:border-white/30 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/40 to-blue-500/40 opacity-40" />
            <img 
              src={user?.avatar || "https://picsum.photos/seed/user-avatar/200/200"} 
              className="w-full h-full rounded-full object-cover border border-black relative z-10" 
              alt="User" 
            />
          </button>

        </div>
      </div>
    </header>
  );
};

export default TopBar;