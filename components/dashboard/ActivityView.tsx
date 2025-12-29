
import React, { useState } from 'react';
import { 
  ArrowLeft, Search, Settings, Zap, Heart, MessageCircle, 
  ShieldCheck, Star, Bell, CheckCircle2, Filter, ChevronRight,
  TrendingUp, Calendar
} from 'lucide-react';

interface ActivityViewProps {
  onBack: () => void;
}

// Mock Data
const ACTIVITIES = [
  {
    group: 'Today',
    items: [
      { id: 1, type: 'zap', title: 'Alex Rivera sent you 50 ZAPs', desc: 'For helping with the Figma file.', time: '2 min ago', read: false, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      { id: 2, type: 'like', title: 'Sarah Jenkins liked your post', desc: 'In Design Systems Mastery', time: '1 hour ago', read: false, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
      { id: 3, type: 'system', title: 'Creator Application Approved', desc: 'You can now create paid communities.', time: '3 hours ago', read: true, icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
    ]
  },
  {
    group: 'Yesterday',
    items: [
      { id: 4, type: 'mention', title: 'Mentioned by @crypto_king', desc: '"Check out this analysis by @designsarah"', time: 'Yesterday, 4:20 PM', read: true, icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { id: 5, type: 'event', title: 'Live Event Started', desc: 'Design Systems Weekly Sync', time: 'Yesterday, 10:00 AM', read: true, icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ]
  },
  {
    group: 'This Week',
    items: [
      { id: 6, type: 'zap', title: 'Weekly Leaderboard Reward', desc: 'You ranked #42 this week! +500 ZAPs', time: 'Mon, 9:00 AM', read: true, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      { id: 7, type: 'system', title: 'New Feature Unlocked', desc: 'Creator Studio Beta Access Granted', time: 'Sun, 2:15 PM', read: true, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    ]
  },
  {
    group: 'Earlier',
    items: [
       { id: 8, type: 'join', title: 'Joined "Web3 Builders"', desc: 'Community Access Granted', time: 'Last Month', read: true, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    ]
  }
];

const FilterPill: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`relative px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 flex-shrink-0 ${
      active 
        ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
    }`}
  >
    {label}
  </button>
);

const ActivityCard: React.FC<{ item: any }> = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-start gap-4 p-5 rounded-[24px] bg-white/5 border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/5 cursor-default"
    >
      {/* Icon Bubble */}
      <div className={`relative flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} border border-white/5 shadow-inner`}>
         <item.icon size={20} className={item.color} strokeWidth={2} />
         {item.type === 'zap' && <div className="absolute inset-0 bg-yellow-400/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
         <div className="flex justify-between items-start mb-1">
            <h4 className="text-sm font-medium text-white group-hover:text-purple-100 transition-colors leading-snug">{item.title}</h4>
            <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap ml-4">{item.time}</span>
         </div>
         <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-2">{item.desc}</p>
         
         {/* Expansion / Actions (Visible on Hover) */}
         <div className={`h-0 overflow-hidden transition-all duration-300 ${isHovered ? 'h-8 opacity-100 mt-3' : 'opacity-0'}`}>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
               <button className="hover:text-white transition-colors">View Details</button>
               <button className="hover:text-white transition-colors">Mark as Read</button>
            </div>
         </div>
      </div>

      {/* Unread Indicator */}
      {!item.read && (
        <div className="absolute top-6 right-5 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
      )}
    </div>
  );
};

const ActivityView: React.FC<ActivityViewProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState('All Activity');

  return (
    <div className="min-h-screen bg-black text-white relative animate-fade-in-up">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Sticky Header (macOS Control Center Style) */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-8 py-4 flex items-center justify-between transition-all">
         <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all border border-white/5 hover:border-white/10 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Home</span>
            </button>
            <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />
            <h1 className="text-lg font-medium tracking-tight text-white hidden sm:block">Activity</h1>
         </div>

         <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
               <Search size={18} />
            </button>
            <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
               <Settings size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-[1px] ml-2">
               <img src="https://picsum.photos/seed/p1/100/100" className="w-full h-full rounded-full border border-black" alt="Profile" />
            </div>
         </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 pb-32">
         
         {/* Filters Segmented Control */}
         <div className="flex justify-center mb-12">
            <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-xl overflow-x-auto scrollbar-hide max-w-full">
               {['All Activity', 'Mentions', 'ZAP Transfers', 'Community Events', 'Approvals', 'System'].map(f => (
                  <FilterPill key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
               ))}
            </div>
         </div>

         {/* Stream */}
         <div className="space-y-10">
            {ACTIVITIES.map((group, groupIdx) => (
               <div key={groupIdx} className="animate-fade-in-up" style={{ animationDelay: `${groupIdx * 0.1}s` }}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-4 mb-4 sticky top-24 z-10 mix-blend-difference">{group.group}</h3>
                  <div className="space-y-3">
                     {group.items.map((item) => (
                        <ActivityCard key={item.id} item={item} />
                     ))}
                  </div>
               </div>
            ))}

            {/* End of Feed */}
            <div className="pt-12 text-center pb-12">
               <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <Bell size={32} className="text-gray-600" />
               </div>
               <h3 className="text-lg font-medium text-white mb-2">You're all caught up ✨</h3>
               <p className="text-gray-500 font-light mb-8">No new activity to show.</p>
               <button 
                 onClick={onBack}
                 className="px-8 py-3 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform shadow-xl"
               >
                 Back to Home
               </button>
            </div>
         </div>

      </div>

    </div>
  );
};

export default ActivityView;
