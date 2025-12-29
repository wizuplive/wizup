
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Shield, Zap, Star, MessageCircle, 
  TrendingUp, Activity, Image as ImageIcon, Smile,
  ShieldCheck, Filter, ChevronDown, ChevronUp, Share2
} from 'lucide-react';
import PostCard from './PostCard';
import { Post, DashboardView } from '../../types';

// --- MOCK DATA ---

const MOCK_PROFILE_DATA = {
  id: 1,
  name: "Design Systems Mastery",
  handle: "@design_systems",
  avatar: "https://picsum.photos/seed/design/200/200",
  cover: "https://picsum.photos/seed/ds-mastery/1600/600",
  tagline: "The ultimate hub for scaling design.",
  description: "A community for product designers, engineers, and PMs to master the art of design systems. We focus on Figma, tokens, accessibility, and governance.",
  members: "12.4k",
  online: 432,
  category: "Design",
  tags: ["UI/UX", "Figma", "Systems"],
  created: "Jan 2023",
  location: "Global",
  owner: {
    name: "Sarah Jenkins",
    avatar: "https://picsum.photos/seed/p1/100/100",
    role: "Founder"
  },
  stats: {
    postsThisWeek: 142,
    growth: "+12%",
    engagement: "High",
    healthScore: 98
  },
  rules: [
    "Be respectful and constructive.",
    "No self-promotion without permission.",
    "Use search before posting.",
    "Keep discussions on topic.",
    "No low-effort posts or spam.",
    "Respect privacy of all members."
  ],
  mods: [
    { name: "Sarah J.", avatar: "https://picsum.photos/seed/p1/100/100", role: "Admin" },
    { name: "Alex R.", avatar: "https://picsum.photos/seed/u4/100/100", role: "Mod" },
    { name: "Davide", avatar: "https://picsum.photos/seed/p2/100/100", role: "Mod" }
  ]
};

const MOCK_COMMUNITY_POSTS: Post[] = [
  {
    id: 201,
    // Added missing 'id' to author object
    author: { id: "u1", name: "Sarah Jenkins", handle: "@designsarah", avatar: "https://picsum.photos/seed/p1/100/100", role: "Admin" },
    time: "2h ago",
    content: "Welcome to the new module on **Variable Modes** in Figma! 🎨 We've just uploaded the source files. Let me know what you think about the new token structure.",
    image: "https://picsum.photos/seed/figma-post/800/500",
    likes: 128,
    comments: 42,
    shares: 12,
    zaps: 50,
    community: {
       name: "Design Systems Mastery",
       image: "https://picsum.photos/seed/design/100/100",
       members: "12.4k",
       activeNow: 432,
       description: "The ultimate resource for scaling design."
    }
  },
  {
    id: 202,
    // Added missing 'id' to author object
    author: { id: "u2", name: "David Chen", handle: "@dchen_ui", avatar: "https://picsum.photos/seed/p2/100/100", role: "Member" },
    time: "5h ago",
    content: "Just finished the accessibility audit challenge. Here is my breakdown of color contrast ratios using the new APCA guidelines. 📊",
    likes: 85,
    comments: 12,
    shares: 5,
    zaps: 20,
    community: {
       name: "Design Systems Mastery",
       image: "https://picsum.photos/seed/design/100/100",
       members: "12.4k",
       activeNow: 432,
       description: "The ultimate resource for scaling design."
    }
  },
  {
    id: 203,
    // Added missing 'id' to author object
    author: { id: "u4", name: "Alex Rivera", handle: "@arivera", avatar: "https://picsum.photos/seed/u4/100/100" },
    time: "1d ago",
    content: "Does anyone have a good template for documenting component props? I'm trying to standardize our documentation for the dev team.",
    likes: 42,
    comments: 18,
    shares: 2,
    zaps: 10,
    community: {
       name: "Design Systems Mastery",
       image: "https://picsum.photos/seed/design/100/100",
       members: "12.4k",
       activeNow: 432,
       description: "The ultimate resource for scaling design."
    }
  }
];

const TABS = ['Discussions', 'Resources', 'Members', 'Events', 'Insights', 'About'];

interface CommunityProfilePageProps {
  community: any; 
  onBack: () => void;
  onNavigate?: (view: DashboardView) => void;
}

const CommunityProfilePage: React.FC<CommunityProfilePageProps> = ({ community: initialCommunity, onBack, onNavigate }) => {
  const community = { 
    ...MOCK_PROFILE_DATA, 
    ...initialCommunity, 
    name: initialCommunity?.name || MOCK_PROFILE_DATA.name, 
    image: initialCommunity?.image || MOCK_PROFILE_DATA.avatar,
    members: initialCommunity?.members || MOCK_PROFILE_DATA.members 
  };
  
  const [activeTab, setActiveTab] = useState('Discussions');
  const [isJoined, setIsJoined] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedRules, setExpandedRules] = useState(false);
  const [memberCount, setMemberCount] = useState(community.members); // To simulate update

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleJoinToggle = () => {
    if (isJoined) {
        setIsJoined(false);
        // Simulate removing member
    } else {
        setIsJoined(true);
        // Simulate adding member
    }
  };

  const handleMessageMods = () => {
    // Logic to open DM
    console.log("Opening Mod Mail for", community.name);
    if (onNavigate) {
        onNavigate('messages');
    }
  };

  // --- Sub-Components for Right Sidebar ---

  const CommunitySnapshot = () => (
    <div className="bg-[#121212] border border-white/5 rounded-[24px] p-6 mb-6">
       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Community Stats</h4>
       <div className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Users size={16} /></div>
                <span className="text-sm font-medium">Members</span>
             </div>
             <span className="text-white font-bold">{memberCount}</span>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400"><Activity size={16} /></div>
                <span className="text-sm font-medium">Online</span>
             </div>
             <span className="text-green-400 font-bold">{community.online}</span>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><TrendingUp size={16} /></div>
                <span className="text-sm font-medium">Growth</span>
             </div>
             <span className="text-white font-bold">{community.stats.growth}</span>
          </div>
          
          <div className="pt-4 mt-2 border-t border-white/5">
             <div className="text-xs text-gray-500 mb-2 flex justify-between">
                <span>Health Score</span>
                <span className="text-white">98/100</span>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[98%]" />
             </div>
          </div>
       </div>
    </div>
  );

  const RulesCard = () => (
    <div className="bg-[#121212] border border-white/5 rounded-[24px] p-6 mb-6 transition-all duration-300">
       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Rules</h4>
       <ul className="space-y-3">
          {community.rules.slice(0, expandedRules ? undefined : 3).map((rule: string, i: number) => (
             <li key={i} className="flex gap-3 text-sm text-gray-300 leading-snug animate-fade-in-up">
                <span className="text-gray-600 font-bold">{i+1}.</span>
                {rule}
             </li>
          ))}
       </ul>
       <button 
         onClick={() => setExpandedRules(!expandedRules)}
         className="w-full mt-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors border border-transparent hover:border-white/5 rounded-lg flex items-center justify-center gap-1"
       >
          {expandedRules ? 'Show Less' : 'View All Rules'}
          {expandedRules ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
       </button>
    </div>
  );

  const ModsCard = () => (
    <div className="bg-[#121212] border border-white/5 rounded-[24px] p-6 mb-6">
       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Moderators</h4>
       <div className="flex flex-col gap-3">
          {community.mods.map((mod: any, i: number) => (
             <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                   <img src={mod.avatar} className="w-8 h-8 rounded-lg object-cover border border-white/5" alt={mod.name} />
                   <div>
                      <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{mod.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{mod.role}</div>
                   </div>
                </div>
                <button className="p-1.5 rounded-full hover:bg-white/10 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                   <MessageCircle size={14} />
                </button>
             </div>
          ))}
       </div>
       <button 
         onClick={handleMessageMods}
         className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
       >
          <ShieldCheck size={14} /> Message Mods
       </button>
    </div>
  );

  // --- Main Renderers ---

  const renderDiscussions = () => (
    <div className="animate-slide-up-fade">
       {/* COMPOSER (Gated) */}
       <div className="mb-8 bg-[#121212] border border-white/5 rounded-[24px] p-4 flex items-center gap-4 hover:border-white/10 transition-colors shadow-lg relative group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-[1px]">
             <img src="https://picsum.photos/seed/user-avatar/100/100" className="w-full h-full rounded-full object-cover border border-black" alt="Me" />
          </div>
          
          <div className="flex-1 relative">
             <input 
               type="text" 
               disabled={!isJoined}
               placeholder={isJoined ? "Create a post..." : "Join the community to create posts."}
               className={`w-full bg-transparent text-sm placeholder-gray-500 focus:outline-none h-10 transition-colors ${!isJoined ? 'text-gray-600 cursor-not-allowed' : 'text-white'}`}
             />
          </div>

          <div className="flex gap-2 text-gray-500 pr-2 items-center">
             {isJoined ? (
               <>
                 <button className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"><ImageIcon size={18} /></button>
                 <button className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"><Smile size={18} /></button>
               </>
             ) : (
                <button 
                  onClick={handleJoinToggle}
                  className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition-transform"
                >
                   Join Community
                </button>
             )}
          </div>
       </div>

       {/* Post List */}
       <div className="space-y-6 pb-20">
          {MOCK_COMMUNITY_POSTS.map(post => (
             <PostCard 
               key={post.id} 
               post={post} 
               onClick={() => {}} 
               onCommunityClick={() => {}}
               onUserClick={() => {}}
             />
          ))}
          <div className="py-8 text-center">
             <div className="inline-block w-6 h-6 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white relative animate-fade-in-up selection:bg-purple-500/30">
        
        {/* --- 1. HERO HEADER (Minimal V2.0) --- */}
        <div className="relative w-full h-72 overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#050505] border-b border-white/5">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <img src={community.cover} alt="Cover" className="w-full h-full object-cover blur-2xl scale-110" />
                <div className="absolute inset-0 bg-[#050505]/60" />
            </div>

            {/* Back Nav */}
            <div className="absolute top-6 left-6 z-30">
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wide group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
            </div>

            {/* Identity Container */}
            <div className="absolute bottom-0 w-full z-20 px-0 pb-0">
                <div className="max-w-7xl mx-auto px-6 pb-8 flex flex-col md:flex-row items-end gap-6 md:gap-8">
                    {/* Avatar */}
                    <div className="relative shrink-0 -mb-4 group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] p-1 bg-[#050505] shadow-2xl relative z-10">
                            <img src={community.image} alt={community.name} className="w-full h-full rounded-[20px] object-cover border border-white/10" />
                        </div>
                        <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 pb-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
                            {community.name}
                            <ShieldCheck size={20} className="text-blue-400" />
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base font-light max-w-2xl leading-relaxed mb-3">
                            {community.tagline}
                        </p>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                            <span className="text-white">{memberCount} Members</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span className="text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {community.online} Online</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pb-2 w-full md:w-auto">
                        <button 
                            onClick={handleJoinToggle}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:scale-105 active:scale-95 ${isJoined ? 'bg-white/10 border border-white/10 text-white' : 'bg-white text-black'}`}
                        >
                            {isJoined ? 'Joined' : 'Join Community'}
                        </button>
                        <button className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- 2. STICKY TABS --- */}
        <div className={`sticky top-0 z-40 w-full border-b border-white/5 transition-all duration-300 ${scrolled ? 'bg-[#050505]/90 backdrop-blur-xl shadow-2xl' : 'bg-[#050505]'}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                relative py-4 text-sm font-bold transition-colors whitespace-nowrap
                                ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                            `}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* --- 3. MAIN GRID CONTENT --- */}
        <div className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Center Feed (8 Cols) */}
            <div className="lg:col-span-8 min-h-[600px]">
                {activeTab === 'Discussions' && renderDiscussions()}
                {activeTab !== 'Discussions' && (
                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
                        <Activity size={48} className="text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">{activeTab} View</h3>
                        <p className="text-sm text-gray-500">This section is coming in the next update.</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar (4 Cols) */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
                <div className="sticky top-24">
                    <CommunitySnapshot />
                    <RulesCard />
                    <ModsCard />
                    
                    <div className="mt-8 text-[10px] text-gray-600 text-center">
                        &copy; 2024 WIZUP Inc. • <span className="hover:underline cursor-pointer">Privacy</span> • <span className="hover:underline cursor-pointer">Terms</span>
                    </div>
                </div>
            </div>

        </div>

    </div>
  );
};

export default CommunityProfilePage;
