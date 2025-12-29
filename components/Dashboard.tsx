import React, { useState, useEffect } from 'react';
import Sidebar from './dashboard/Sidebar';
import TopBar from './dashboard/TopBar';
import Feed from './dashboard/Feed';
import RightPanel from './dashboard/RightPanel';
import CommunitiesView from './dashboard/CommunitiesView';
import CommunityDetailView from './dashboard/CommunityDetailView';
import CommunitySalesView from './dashboard/CommunitySalesView';
import MessagesView from './dashboard/MessagesView';
import LeaderboardView from './dashboard/LeaderboardView';
import ProfileView from './dashboard/ProfileView';
import CreatorStudioView from './dashboard/CreatorStudioView';
import ActivityView from './dashboard/ActivityView';
import WizPremiereView from './dashboard/WizPremiereView';
import WalletView from './dashboard/WalletView';
import InfluencerPartnerHubView from './dashboard/InfluencerPartnerHubView';
import InfluencerSignupView from './dashboard/InfluencerSignupView';
import { InfluencerSellerDashboard } from './dashboard/InfluencerSellerDashboard';
import PostDetailOverlay from './dashboard/PostDetailOverlay';
import CommunityDrawer from './dashboard/CommunityDrawer';
import CommunityProfilePage from './dashboard/CommunityProfilePage'; 
import TrendingCommunitiesView from './dashboard/TrendingCommunitiesView';
import UserProfilePage from './dashboard/UserProfilePage';
import ArchitectSimulationHub from './dashboard/ArchitectSimulationHub';
import { DashboardView, DashboardCommunity, Post, RitualState } from '../types';
import { dataService } from '../services/dataService';

interface DashboardProps {
  onLogout: () => void;
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
  }
];

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<DashboardView | 'architect'>('discover');
  const [selectedCommunity, setSelectedCommunity] = useState<DashboardCommunity | null>(null);
  const [viewingCommunity, setViewingCommunity] = useState<DashboardCommunity | null>(null);
  const [viewingCommunityProfile, setViewingCommunityProfile] = useState<any | null>(null);
  const [viewingUserProfile, setViewingUserProfile] = useState<any | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isInfluencer, setIsInfluencer] = useState(false);
  
  const [joinedCommunities, setJoinedCommunities] = useState<Set<number>>(new Set([2]));
  const [activeCommunityDrawer, setActiveCommunityDrawer] = useState<any>(null);
  const [ritualState, setRitualState] = useState<RitualState>('idle');
  const [balance, setBalance] = useState(2450);

  useEffect(() => {
    const user = dataService.getCurrentUser();
    if (user) setIsInfluencer(user.isInfluencer);
  }, []);

  const handleNavigate = (view: any) => {
    setCurrentView(view);
    if (view !== 'communities' && view !== 'community-profile' && view !== 'user-profile') {
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

  return (
    <div className={`min-h-screen text-white font-sans selection:bg-purple-500/30 bg-black`}>
      <Sidebar 
        activeView={currentView as any} 
        onNavigate={handleNavigate} 
        onLogout={onLogout} 
      />

      <div className="lg:pl-64 min-h-screen flex flex-col transition-all duration-300 pb-24 lg:pb-0">
        {currentView !== 'architect' && !selectedCommunity && !viewingCommunity && !viewingCommunityProfile && !viewingUserProfile && (
          <TopBar 
            currentView={currentView as any} 
            onNavigate={handleNavigate} 
            ritualState={ritualState} 
            balance={balance} 
          />
        )}

        <main className="flex-1 w-full">
          {currentView === 'discover' && (
            <div className="max-w-7xl mx-auto flex items-start gap-8 px-0 lg:px-8">
              <div className="flex-1 w-full min-w-0">
                 <Feed 
                    onPostClick={setSelectedPost} 
                    onCommunityClick={setViewingCommunityProfile}
                    onUserClick={setViewingUserProfile}
                 />
              </div>
              <RightPanel 
                 onCommunityClick={setViewingCommunityProfile}
                 onUserClick={setViewingUserProfile}
                 onLeaderboardClick={() => handleNavigate('leaderboard')}
              />
            </div>
          )}

          {currentView === 'architect' && <ArchitectSimulationHub />}

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
          {currentView === 'studio' && <CreatorStudioView />}
          {currentView === 'wallet' && <WalletView />}
          {currentView === 'messages' && <MessagesView />}
          {currentView === 'leaderboard' && <LeaderboardView onUserClick={setViewingUserProfile} />}
          {currentView === 'premiere' && <WizPremiereView />}
          {currentView === 'influencers' && <InfluencerPartnerHubView onNavigate={handleNavigate} isInfluencer={isInfluencer} />}
          {currentView === 'influencer-signup' && <InfluencerSignupView onComplete={() => handleNavigate('seller-hub')} onBack={() => handleNavigate('influencers')} />}
          {currentView === 'seller-hub' && <InfluencerSellerDashboard onNavigate={handleNavigate} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;