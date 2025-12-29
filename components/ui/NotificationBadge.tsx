
import React from 'react';
import { Zap } from 'lucide-react';

export interface NotificationBadgeProps {
  count?: number;
  /**
   * v6 Variants:
   * - 'message': Soft purple pill for DM counts.
   * - 'active': Purple dot/pill for general activity.
   * - 'personal': Gold ring for mentions/replies.
   * - 'passive': Grey dot for low-priority updates.
   */
  variant?: 'message' | 'active' | 'personal' | 'passive' | 'dot' | 'standard' | 'pill'; 
  /**
   * Legacy Type Mapping (kept for backward compatibility, mapped internally where possible)
   */
  type?: 'primary' | 'announcement' | 'chat' | 'course' | 'event' | 'reward';
  className?: string;
  showZero?: boolean;
  hasZap?: boolean; // New v6 prop: Adds lightning hint on hover
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count = 0, 
  variant = 'active', 
  type = 'primary', 
  className = '',
  showZero = false,
  hasZap = false
}) => {
  // If count is 0 and not passive/showZero, return null
  if (count === 0 && !showZero && variant !== 'passive' && variant !== 'dot') return null;

  // --- v6 Message Bubble (Conversation Presence) ---
  // "3 active conversations", not "3 unread messages".
  if (variant === 'message') {
    return (
      <div 
        className={`
          group relative flex items-center justify-center 
          bg-gradient-to-b from-indigo-600/90 to-purple-700/90 backdrop-blur-sm
          text-white/95 font-medium tracking-wide text-[10px]
          px-2.5 py-[2px] rounded-full
          shadow-sm border border-white/5
          transition-all duration-300 ease-out
          hover:brightness-110 hover:shadow-[0_0_12px_rgba(124,58,237,0.3)]
          cursor-default
          ${className}
        `}
      >
        <span className="relative z-10">{count}</span>
        {/* Soft breathing glow */}
        <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  // --- v6 Type 1: Active Presence (The "Alive" Signal) ---
  // Used for new posts, events. Soft purple glow.
  if (variant === 'active') {
    // If count > 3, show as pill, otherwise just a dot
    const showNumber = count > 3;
    
    if (showNumber) {
        return (
            <div className={`
                group relative flex items-center justify-center
                bg-purple-600/20 border border-purple-500/30
                text-purple-200 font-bold text-[9px]
                px-1.5 h-4 min-w-[16px] rounded-full
                shadow-[0_0_8px_rgba(168,85,247,0.2)]
                transition-all duration-500
                cursor-default
                ${className}
            `}>
                <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-200">{count}</span>
                {/* Zap Hint on Hover */}
                {hasZap && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Zap size={8} className="text-yellow-400 fill-yellow-400" />
                    </div>
                )}
            </div>
        );
    }

    // Just a dot for low counts (Active Presence)
    return (
      <div className={`group relative flex items-center justify-center p-1 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse-slow transition-all duration-300 group-hover:bg-purple-400" />
        {hasZap && (
             <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/80 rounded-full p-[1px] border border-yellow-500/30">
                 <Zap size={8} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
             </div>
        )}
      </div>
    );
  }

  // --- v6 Type 2: Your Involvement (The "You Matter" Signal) ---
  // Used for mentions, replies. Gold accent.
  if (variant === 'personal') {
    return (
      <div className={`
        group relative flex items-center justify-center
        bg-[#0A0A0A] border border-amber-500/60
        text-amber-400 font-bold text-[9px]
        h-4 min-w-[16px] px-1 rounded-full
        shadow-[0_0_10px_rgba(245,158,11,0.2)]
        transition-all duration-300
        cursor-pointer
        ${className}
      `}>
        <span className="relative z-10">{count || '!'}</span>
        <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-pulse-slow" />
      </div>
    );
  }

  // --- v6 Type 3: Passive Update (The "Quiet" Signal) ---
  // General activity, no urgency.
  if (variant === 'passive') {
    return (
      <div className={`
        w-1.5 h-1.5 rounded-full bg-zinc-700
        transition-opacity duration-500
        group-hover:bg-zinc-500
        ${className}
      `} />
    );
  }

  // --- Legacy Compatibility Wrappers ---
  
  if (variant === 'dot') {
      // Map 'dot' to 'active' dot style but simpler
      return <div className={`w-2 h-2 rounded-full bg-purple-500 shadow-sm ${className}`} />;
  }

  // Fallback for standard/pill
  return (
    <div className={`
      px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full
      bg-zinc-800 text-zinc-300 text-[9px] font-bold border border-white/5
      ${className}
    `}>
      {count}
    </div>
  );
};

export default NotificationBadge;
