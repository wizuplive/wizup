
import React, { useEffect, useState } from 'react';
import { 
  X, Users, Radio, MessageSquare, Settings, Bell, 
  ArrowRight, Shield, Zap, Hash, ChevronRight, MoreHorizontal,
  LogOut, Star, Clock, LayoutGrid, BookOpen, Calendar as CalendarIcon,
  Megaphone, HelpCircle, MonitorPlay, ExternalLink
} from 'lucide-react';
import NotificationBadge from '../ui/NotificationBadge';

interface CommunityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter: (tab?: string) => void;
  community: {
    name: string;
    img: string;
    progress?: number;
    members?: string;
    online?: number;
    description?: string;
    notifications?: number;
  };
}

// Updated Channel Data with Badges mapped to v6 variants
const CHANNELS = [
  { name: 'Announcements', icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-400/10', notifs: 2, variant: 'active' as const },
  { name: 'General', icon: MessageSquare, color: 'text-white', bg: 'bg-white/10', notifs: 14, variant: 'active' as const },
  { name: 'Showcase', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10', notifs: 0, variant: 'passive' as const },
  { name: 'Resources', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10', notifs: 1, variant: 'active' as const },
  { name: 'Q&A', icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-400/10', notifs: 0, variant: 'passive' as const },
  { name: 'Calendar', icon: CalendarIcon, color: 'text-green-400', bg: 'bg-green-400/10', notifs: 3, variant: 'personal' as const }, // Assuming personal involvement
];

const FEATURED_COURSES = [
  { id: 1, title: 'Figma Mastery', progress: 45, type: 'Course', image: 'https://picsum.photos/seed/figma/100/100', notifs: 1 },
  { id: 2, title: 'Design Tokens', progress: 12, type: 'Module', image: 'https://picsum.photos/seed/tokens/100/100', notifs: 0 },
];

const MOCK_MEMBERS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  avatar: `https://picsum.photos/seed/member_${i}/100/100`,
  online: i < 3
}));

const RECENT_ACTIVITY = [
  { id: 1, title: 'New Figma Variables Guide', author: 'Sarah J.', time: '2h ago', image: 'https://picsum.photos/seed/figma/100/100' },
  { id: 2, title: 'Weekly Challenge Winners', author: 'Mod Team', time: '5h ago', image: 'https://picsum.photos/seed/win/100/100' },
];

const CommunityDrawer: React.FC<CommunityDrawerProps> = ({ isOpen, onClose, onEnter, community }) => {
  const [isJoined, setIsJoined] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  // Calculate Aggregated Counts for Tabs
  const feedCount = 16; 
  const courseCount = 1;
  const eventCount = 3;

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  const handleNavigation = (destination: string = 'feed') => {
    onClose();
    onEnter(destination);
  };

  if (!isOpen && !animateIn) return null;

  return (
    <>
      {/* Backdrop (Click outside to close) */}
      <div 
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside 
        className={`fixed top-0 bottom-0 z-50 w-full max-w-[480px] bg-[#0A0A0A]/95 backdrop-blur-3xl border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.7)] flex flex-col transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${
          isOpen ? 'translate-x-0 ml-20 lg:ml-64' : '-translate-x-full ml-20 lg:ml-64'
        }`}
      >
        
        {/* --- 1. HERO HEADER --- */}
        <div className="relative h-44 w-full overflow-hidden shrink-0 group">
          {/* Blurred Background Image */}
          <div className="absolute inset-0 z-0">
             <img 
               src={community.img} 
               alt="Banner" 
               className="w-full h-full object-cover blur-md scale-110 opacity-50 group-hover:scale-125 transition-transform duration-[3s]" 
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#0A0A0A]" />
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <X size={16} />
          </button>

          {/* Identity Content */}
          <div className="absolute bottom-0 w-full p-6 z-10 flex items-end gap-5">
              {/* Floating Avatar */}
              <div className="relative -mb-4 group/avatar">
                 <div className="w-20 h-20 rounded-[22px] overflow-hidden border-2 border-white/10 shadow-2xl bg-[#121212] relative z-10">
                    <img src={community.img} alt={community.name} className="w-full h-full object-cover" />
                 </div>
              </div>
              
              <div className="flex-1 pb-1">
                 <h2 className="text-2xl font-bold text-white tracking-tight leading-tight mb-0.5">{community.name}</h2>
                 <p className="text-sm text-gray-400 font-medium tracking-wide">@community_handle</p>
              </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-8 space-y-8">
           
           {/* Tagline */}
           <p className="text-sm text-gray-300 leading-relaxed font-light">
             {community.description || "The ultimate hub for mastering design systems, tokens, and scalability. Connect, learn, and grow together."}
           </p>

           {/* --- 2. NAVIGATION TABS (Segmented Control + Badges) --- */}
           <div className="p-1 rounded-xl bg-white/5 border border-white/5 flex gap-1">
              {[
                  { label: 'Overview', count: 0 },
                  { label: 'Feed', count: feedCount, variant: 'active' as const },
                  { label: 'Courses', count: courseCount, variant: 'active' as const },
                  { label: 'Events', count: eventCount, variant: 'personal' as const }
              ].map(tab => (
                 <button
                   key={tab.label}
                   onClick={() => tab.label === 'Overview' ? setActiveTab('Overview') : handleNavigation(tab.label.toLowerCase())}
                   className={`flex-1 relative py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                     activeTab === tab.label 
                       ? 'bg-white/10 text-white shadow-sm' 
                       : 'text-gray-500 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   {tab.label}
                   {tab.count > 0 && <NotificationBadge count={tab.count} variant={tab.variant} />}
                 </button>
              ))}
           </div>

           {/* --- 3. STATS ROW --- */}
           <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Members', val: community.members || '12.4k', icon: Users, col: 'text-blue-400' },
                { label: 'Online', val: '432', icon: Radio, col: 'text-green-400' },
                { label: 'Posts Today', val: '28', icon: MessageSquare, col: 'text-purple-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1 hover:bg-white/10 transition-colors cursor-default">
                   <stat.icon size={16} className={`${stat.col} mb-1`} />
                   <span className="text-sm font-bold text-white">{stat.val}</span>
                   <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{stat.label}</span>
                </div>
              ))}
           </div>

           {/* --- 4. QUICK ACTIONS (Control Center) --- */}
           <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsJoined(!isJoined)}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all border ${
                      isJoined 
                        ? 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10' 
                        : 'bg-purple-600 border-purple-500 text-white hover:bg-purple-500'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join'}
                  </button>
                  <button className="relative p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 font-medium text-sm">
                    <Bell size={16} /> Alerts
                    <div className="absolute top-2 right-2">
                         <NotificationBadge count={2} variant="active" />
                    </div>
                  </button>
                  <button 
                    onClick={() => handleNavigation('feed')}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 font-medium text-sm group"
                  >
                    <LayoutGrid size={16} className="text-blue-400 group-hover:scale-110 transition-transform" /> Open Feed
                  </button>
                  <button 
                    onClick={() => handleNavigation('courses')}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 font-medium text-sm group"
                  >
                    <MonitorPlay size={16} className="text-pink-400 group-hover:scale-110 transition-transform" /> Courses
                  </button>
              </div>
           </div>

           {/* --- 5. SPACES & CHANNELS --- */}
           <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Spaces & Channels</h3>
              <div className="grid grid-cols-2 gap-2">
                 {CHANNELS.map(channel => (
                   <button 
                     key={channel.name}
                     onClick={() => handleNavigation(channel.name.toLowerCase())}
                     className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                   >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${channel.bg} flex items-center justify-center`}>
                            <channel.icon size={14} className={channel.color} />
                        </div>
                        <span className="text-sm text-gray-300 font-medium group-hover:text-white">{channel.name}</span>
                      </div>
                      
                      {/* v6 Presence Bubble */}
                      {channel.notifs > 0 && (
                         <NotificationBadge count={channel.notifs} variant={channel.variant} />
                      )}
                   </button>
                 ))}
              </div>
           </div>

           {/* --- 6. FEATURED COURSES --- */}
           <div>
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Featured Courses</h3>
                 <button onClick={() => handleNavigation('courses')} className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1">
                   View All <ArrowRight size={10} />
                 </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                 {FEATURED_COURSES.map(course => (
                   <div key={course.id} onClick={() => handleNavigation('courses')} className="relative flex-shrink-0 w-48 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer group">
                      <div className="flex items-center gap-3 mb-3">
                         <img src={course.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                         <div className="min-w-0">
                           <div className="text-xs font-bold text-white truncate">{course.title}</div>
                           <div className="text-[10px] text-gray-500">{course.type}</div>
                         </div>
                      </div>
                      <div className="w-full bg-black/50 h-1 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${course.progress}%` }} />
                      </div>

                      {/* v6 Course Update */}
                      {course.notifs > 0 && (
                          <div className="absolute top-2 right-2">
                              <NotificationBadge count={course.notifs} variant="active" />
                          </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>

           {/* --- 7. ACTIVE MEMBERS & ACTIVITY --- */}
           <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Active Now</h3>
              <div className="flex -space-x-2 mb-6">
                 {MOCK_MEMBERS.map((m) => (
                   <div key={m.id} className="relative w-8 h-8 rounded-full border border-[#0A0A0A] overflow-hidden hover:scale-110 hover:z-10 transition-transform cursor-pointer">
                      <img src={m.avatar} alt="Member" className="w-full h-full object-cover" />
                      {m.online && <div className="absolute inset-0 border-2 border-green-500/50 rounded-full" />}
                   </div>
                 ))}
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-[#0A0A0A]">
                    +42
                 </div>
              </div>

              <div className="space-y-2">
                 {RECENT_ACTIVITY.map(item => (
                   <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer items-center">
                      <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover opacity-80" />
                      <div className="flex-1 min-w-0">
                         <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                         <div className="text-[10px] text-gray-500">{item.author} • {item.time}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

        </div>

        {/* --- 8. FOOTER & CTA --- */}
        <div className="p-6 pt-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
           <button 
             onClick={() => handleNavigation('feed')}
             className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm mb-4 hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
           >
             Enter Community Space <ArrowRight size={16} />
           </button>
           
           <div className="flex justify-between items-center px-1">
              <div className="flex gap-4">
                 <button className="text-[10px] font-medium text-gray-500 hover:text-white transition-colors">Rules</button>
                 <button className="text-[10px] font-medium text-gray-500 hover:text-white transition-colors">Mods</button>
                 <button className="text-[10px] font-medium text-gray-500 hover:text-white transition-colors">About</button>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                 <LogOut size={14} />
              </button>
           </div>
        </div>

      </aside>
    </>
  );
};

export default CommunityDrawer;
