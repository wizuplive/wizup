import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Feed from './Feed';
import RightPanel from './RightPanel';
import CommunitiesView from './CommunitiesView';
import CommunityDetailView from './CommunityDetailView';
import CommunitySalesView from './CommunitySalesView';
import MessagesView from './MessagesView';
import LeaderboardView from './LeaderboardView';
import ProfileView from './ProfileView';
import CreatorStudioView from './CreatorStudioView';
import ActivityView from './ActivityView';
import WizPremiereView from './WizPremiereView';
import WalletView from './WalletView';
import InfluencerPartnerHubView from './InfluencerPartnerHubView';
import InfluencerSignupView from './InfluencerSignupView';
import { InfluencerSellerDashboard } from './InfluencerSellerDashboard';
import PostDetailOverlay from './PostDetailOverlay';
import CommunityDrawer from './CommunityDrawer';
import CommunityProfilePage from './CommunityProfilePage'; 
import TrendingCommunitiesView from './TrendingCommunitiesView';
import UserProfilePage from './UserProfilePage';
import ArchitectSimulationHub from './ArchitectSimulationHub';
import VaultView from './VaultView';
import { DashboardView, DashboardCommunity, Post, RitualState } from '../../types';
import { dataService } from '../../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  onLogout: () => void;
  initialView?: DashboardView | 'vault' | 'architect';
  initialPreviewId?: number | null;
}

const MOCK_COMMUNITIES: DashboardCommunity[] = [
  {
    id: 1,
    type: 'community',
    title: "Design Systems Mastery",
    creator: { name: "Sarah J.", avatar: "https://picsum.photos/seed/design/100/100", verified: true },
    category: "Design",
    image: "https://picsum.photos/seed/ds-mastery/800/600",
    members: "12.4k",
    accessType: 'paid',
    cost: "500 ZAPs",
    description: "The ultimate guide to scaling design in large organizations.",
    isFeatured: true
  },
  {
    id: 2,
    type: 'community',
    title: "Web3 Builders Club",
    creator: { name: "Alex Chain", avatar: "https://picsum.photos/seed/web3/100/100" },
    category: "Development",
    image: "https://picsum.photos/seed/web3-club/800/600",
    members: "8.1k",
    accessType: 'granted',
    progress: 42,
    description: "Connect with smart contract developers."
  },
  {
    id: 3,
    type: 'community',
    title: "Writing Circles",
    creator: { name: "Marcus L.", avatar: "https://picsum.photos/seed/writer/100/100" },
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2574&auto=format&fit=crop",
    members: "4.2k",
    accessType: 'free',
    description: "Reflection, feedback, and shared growth through the written word."
  },
  {
    id: 4,
    type: 'community',
    title: "Founder Rooms",
    creator: { name: "Elena R.", avatar: "https://picsum.photos/seed/founder/100/100" },
    category: "Business",
    image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=2673&auto=format&fit=crop",
    members: "1.8k",
    accessType: 'paid',
    cost: "1000 ZAPs",
    description: "High-intent environments for builders navigating real decisions."
  }
];

const Dashboard: React.FC<DashboardProps> = ({ onLogout, initialView = 'discover', initialPreviewId }) => {
  const [currentView, setCurrentView] = useState<DashboardView | 'vault' | 'architect'>(initialView);
  const [selectedCommunity, setSelectedCommunity] = useState<DashboardCommunity | null>(null);
  const [viewingCommunity, setViewingCommunity] = useState<DashboardCommunity | null>(null);
  const [viewingCommunityProfile, setViewingCommunityProfile] = useState<any | null>(null);
  const [viewingUserProfile, setViewingUserProfile] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [isInfluencer, setIsInfluencer] = useState(false);
  
  const [joinedCommunities, setJoinedCommunities] = useState<Set<number>>(new Set([2]));
  const [activeCommunityDrawer, setActiveCommunityDrawer] = useState<any | null>(null);
  const [ritualState, setRitualState] = useState<RitualState>('idle');
  const [balance, setBalance] = useState(2450);

  useEffect(() => {
    const user = dataService.getCurrentUser();
    if (user) setIsInfluencer(user.isInfluencer);

    if (initialPreviewId) {
        const comm = MOCK_COMMUNITIES.find(c => c.id === initialPreviewId);
        if (comm) {
            setViewingCommunity(comm);
            setCurrentView('communities');
        }
    }
  }, [initialPreviewId]);

  const handleNavigate = (view: any) => {
    setCurrentView(view);
    if (view !== 'communities' && view !== 'community-profile' && view !== 'user-profile' && view !== 'trending-communities' && view !== 'influencers') {
      setSelectedCommunity(null);
      setViewingCommunity(null);
      setViewingCommunityProfile(null);
      setViewingUserProfile(null);
    }
  };

  const handleCommunitySelect = (community: DashboardCommunity) => {
    if (joinedCommunities.has(community.id) || community.accessType === 'granted') {
      setSelectedCommunity(community);
    } else {
      setViewingCommunity(community);
    }
    setCurrentView('communities');
  };

  const handleCommunityClick = (comm: any) => {
    setActiveCommunityDrawer({
        id: comm.id, 
        name: comm.name,
        img: comm.image || comm.img,
        members: comm.members,
        description: comm.description,
        notifications: 3
    });
  };

  const handleUserSelect = (user: any) => {
    setViewingUserProfile(user);
    setCurrentView('user-profile');
  };

  const handleCommunityProfileSelect = (comm: any) => {
    setViewingCommunityProfile(comm);
    setCurrentView('community-profile');
  };

  // V5 Specification: No sidebar or topbar padding for Partner Hub
  const isAuraMap = currentView === 'influencers';

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 overflow-hidden flex">
      
      <Sidebar 
        activeView={currentView} 
        onNavigate={handleNavigate} 
        onLogout={onLogout} 
        isInfluencer={isInfluencer}
        onCommunityClick={handleCommunityClick}
      />

      <CommunityDrawer 
        isOpen={!!activeCommunityDrawer}
        onClose={() => setActiveCommunityDrawer(null)}
        community={activeCommunityDrawer || { name: '', img: '' }}
        onEnter={(tab) => {
            const fullComm = MOCK_COMMUNITIES.find(c => c.id === activeCommunityDrawer?.id) || MOCK_COMMUNITIES[0];
            setActiveCommunityDrawer(null);
            handleCommunitySelect(fullComm);
        }}
      />

      <div className={`flex-1 h-screen overflow-hidden flex flex-col ${isAuraMap ? 'lg:pl-0 pl-0' : 'lg:pl-[280px]'}`}>
        
        {!isAuraMap && currentView !== 'vault' && currentView !== 'architect' && !selectedCommunity && !viewingCommunity && !viewingCommunityProfile && !viewingUserProfile && currentView !== 'trending-communities' && (
          <TopBar 
            currentView={currentView as any} 
            onNavigate={handleNavigate} 
            ritualState={ritualState} 
            balance={balance} 
          />
        )}

        <main className={`flex-1 overflow-y-auto no-scrollbar relative ${isAuraMap ? 'h-full' : ''}`}>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (selectedCommunity?.id || '') + (viewingCommunity?.id || '')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {currentView === 'discover' && (
                <div className="max-w-7xl mx-auto flex items-start gap-12 px-8">
                  <div className="flex-1 min-w-0">
                     <Feed 
                        onPostClick={setSelectedPost} 
                        onCommunityClick={handleCommunityProfileSelect}
                        onUserClick={handleUserSelect}
                     />
                  </div>
                  <RightPanel 
                     onCommunityClick={handleCommunityProfileSelect}
                     onUserClick={handleUserSelect}
                     onLeaderboardClick={() => handleNavigate('leaderboard')}
                     onViewAllTrending={() => handleNavigate('trending-communities')}
                  />
                </div>
              )}

              {currentView === 'vault' && <VaultView onBack={() => handleNavigate('discover')} />}
              {currentView === 'architect' && <ArchitectSimulationHub />}

              {currentView === 'trending-communities' && (
                 <TrendingCommunitiesView 
                    onBack={() => handleNavigate('discover')} 
                    onCommunityClick={handleCommunityProfileSelect} 
                 />
              )}

              {currentView === 'community-profile' && viewingCommunityProfile && (
                 <CommunityProfilePage 
                    community={viewingCommunityProfile} 
                    onBack={() => handleNavigate('discover')} 
                 />
              )}

              {currentView === 'user-profile' && viewingUserProfile && (
                 <UserProfilePage 
                    user={viewingUserProfile} 
                    onBack={() => handleNavigate('discover')} 
                 />
              )}

              {currentView === 'communities' && (
                <div className="w-full">
                   {selectedCommunity ? (
                    <CommunityDetailView 
                      community={selectedCommunity} 
                      onBack={() => setSelectedCommunity(null)} 
                    />
                  ) : viewingCommunity ? (
                    <CommunitySalesView 
                      community={viewingCommunity} 
                      isPreview={true}
                      onJoin={() => {
                        setJoinedCommunities(prev => new Set(prev).add(viewingCommunity.id));
                        setSelectedCommunity(viewingCommunity);
                        setViewingCommunity(null);
                      }}
                      onBack={() => setViewingCommunity(null)}
                    />
                  ) : (
                    <CommunitiesView 
                      communities={MOCK_COMMUNITIES} 
                      onSelectCommunity={handleCommunitySelect} 
                      joinedIds={joinedCommunities}
                    />
                  )}
                </div>
              )}

              {currentView === 'profile' && <ProfileView />}
              {currentView === 'wallet' && <WalletView />}
              {currentView === 'messages' && <MessagesView />}
              {currentView === 'leaderboard' && <LeaderboardView onUserClick={handleUserSelect} />}
              {currentView === 'studio' && <CreatorStudioView onPublish={() => handleNavigate('communities')} />}
              {currentView === 'influencers' && <InfluencerPartnerHubView onNavigate={handleNavigate} isInfluencer={isInfluencer} />}
              {currentView === 'influencer-signup' && <InfluencerSignupView onComplete={() => handleNavigate('seller-hub')} onBack={() => handleNavigate('influencers')} />}
              {currentView === 'seller-hub' && <InfluencerSellerDashboard onNavigate={handleNavigate} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <PostDetailOverlay 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
            onCommunityClick={handleCommunityProfileSelect}
            onUserClick={handleUserSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
