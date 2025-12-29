
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import { reputationService } from './services/reputationService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Cinematic Landing Flow V5
import Hero from './components/Hero';
import LiveSignals from './components/landing/LiveSignals';
import SpacesSection from './components/landing/SpacesSection';
import PresenceExperience from './components/landing/PresenceExperience';
import EnduranceSection from './components/landing/EnduranceSection';
import PricingPage from './components/landing/PricingPage';
import Invitation from './components/landing/Invitation';
import ManifestoPage from './components/landing/ManifestoPage';
import PrivacyPage from './components/landing/PrivacyPage';
import TermsPage from './components/landing/TermsPage';
import SafetyPage from './components/landing/SafetyPage';

// App Core
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Presence from './components/Presence';
import Dashboard from './components/dashboard/Dashboard';
import UserProfilePage from './components/dashboard/UserProfilePage';
import { LedgerDebugPanel } from './components/dev/LedgerDebugPanel';

// Dev Tools
import { DEV_SEASON_CLOSE_PREVIEW } from './config/devFlags';
import { ENABLE_SEASON_CLOSE_PREVIEW } from './config/featureFlagsSeasons';
import SeasonClosePreviewPanel from './components/dev/SeasonClosePreviewPanel';
import { initSeasonDevBridge } from './services/seasonalSimulation/devBridge';

// Recognition
import { registerRecognitionToast } from './services/zapsSignals/zapsSignalEmitter';
import WhisperToast from './components/recognition/WhisperToast';
import { RecognitionEvent } from './types/recognitionTypes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

type ViewState = 'landing' | 'dashboard' | 'public_profile' | 'pricing' | 'manifesto' | 'privacy' | 'terms' | 'safety';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [initialDashboardView, setInitialDashboardView] = useState<any>('discover');
  const [initialCommunityToPreview, setInitialCommunityToPreview] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [publicProfileHandle, setPublicProfileHandle] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showSeasonCloseDev, setShowSeasonCloseDev] = useState(false);
  
  const [activeRecognition, setActiveRecognition] = useState<RecognitionEvent | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const handle = params.get('u');
    if (handle) {
      setPublicProfileHandle(handle);
      setCurrentView('public_profile');
    }

    if (DEV_SEASON_CLOSE_PREVIEW && ENABLE_SEASON_CLOSE_PREVIEW) {
      initSeasonDevBridge();
      if (params.get('dev') === 'seasonClose') {
        setShowSeasonCloseDev(true);
      }
    }

    registerRecognitionToast((ev: RecognitionEvent) => {
      setActiveRecognition(ev);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const localUser = dataService.getCurrentUser();
      const params = new URLSearchParams(window.location.search);
      const isPublicView = !!params.get('u');

      if (localUser && !isPublicView) {
        if (isMounted) {
            setCurrentView('dashboard');
            setCurrentUserId(localUser.id);
        }
        reputationService.trackPresence(localUser.id, 'PLATFORM');
      }

      if (auth) {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            await dataService.loadUserProfile(user.uid);
            if (isMounted && !isPublicView) {
              setCurrentView('dashboard');
              setCurrentUserId(user.uid);
            }
          }
          if (isMounted) setIsAuthChecking(false);
        });
      } else {
        if (isMounted) setIsAuthChecking(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignIn = () => {
    setCurrentView('dashboard');
    const user = dataService.getCurrentUser();
    if (user) {
        setCurrentUserId(user.id);
        reputationService.trackPresence(user.id, 'PLATFORM');
    }
  };

  const handleLogout = () => {
    setCurrentView('landing');
    setCurrentUserId(null);
    setInitialDashboardView('discover');
    setInitialCommunityToPreview(null);
  };

  const handleEnter = () => {
    const user = dataService.getCurrentUser();
    if (user) {
      setCurrentView('dashboard');
      setCurrentUserId(user.id);
    } else {
      authService.loginWithGoogle().then((res) => {
        if (res) handleSignIn();
      });
    }
  };

  const handleLogoClick = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSpacesClick = () => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const spacesSection = document.getElementById('spaces-marketing');
        if (spacesSection) spacesSection.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const spacesSection = document.getElementById('spaces-marketing');
      if (spacesSection) spacesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePricingClick = () => {
    setCurrentView('pricing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManifestoClick = () => {
    setCurrentView('manifesto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrivacyClick = () => {
    setCurrentView('privacy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTermsClick = () => {
    setCurrentView('terms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSafetyClick = () => {
    setCurrentView('safety');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateClick = () => {
    setInitialDashboardView('studio');
    setCurrentView('dashboard');
    const user = dataService.getCurrentUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const handleEnterSpace = (communityId: number) => {
    setInitialDashboardView('communities');
    setInitialCommunityToPreview(communityId);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const isLegalView = currentView === 'privacy' || currentView === 'terms' || currentView === 'safety';
  const showNav = currentView === 'landing' || currentView === 'pricing' || currentView === 'manifesto' || isLegalView;

  return (
    <div className="bg-black min-h-screen selection:bg-purple-500/30">
      <WhisperToast event={activeRecognition} onClose={() => setActiveRecognition(null)} />
      {showSeasonCloseDev && <SeasonClosePreviewPanel />}

      {showNav && (
        <Navbar 
          onSignIn={handleSignIn} 
          onLogoClick={handleLogoClick}
          onSpacesClick={handleSpacesClick} 
          onPricingClick={handlePricingClick}
          onManifestoClick={handleManifestoClick}
          onCreateClick={handleCreateClick} 
        />
      )}

      {currentView === 'landing' && (
        <>
          <main>
            <Hero onEnter={handleEnter} onReadManifesto={handleManifestoClick} />
            <LiveSignals />
            <SpacesSection onEnterSpace={handleEnterSpace} />
            <PresenceExperience />
            <EnduranceSection />
            <Invitation onEnter={handleEnter} />
          </main>
          <Footer 
            onLogoClick={handleLogoClick}
            onManifestoClick={handleManifestoClick}
            onSpacesClick={handleSpacesClick}
            onPricingClick={handlePricingClick}
            onPrivacyClick={handlePrivacyClick}
            onTermsClick={handleTermsClick}
            onSafetyClick={handleSafetyClick}
          />
        </>
      )}

      {currentView === 'pricing' && (
        <>
          <PricingPage onEnter={handleEnter} />
          <Footer 
            onLogoClick={handleLogoClick}
            onManifestoClick={handleManifestoClick}
            onSpacesClick={handleSpacesClick}
            onPricingClick={handlePricingClick}
            onPrivacyClick={handlePrivacyClick}
            onTermsClick={handleTermsClick}
            onSafetyClick={handleSafetyClick}
          />
        </>
      )}

      {currentView === 'manifesto' && (
        <>
          <ManifestoPage onEnter={handleEnter} onExplore={handleSpacesClick} />
          <Footer 
            onLogoClick={handleLogoClick}
            onManifestoClick={handleManifestoClick}
            onSpacesClick={handleSpacesClick}
            onPricingClick={handlePricingClick}
            onPrivacyClick={handlePrivacyClick}
            onTermsClick={handleTermsClick}
            onSafetyClick={handleSafetyClick}
          />
        </>
      )}

      {currentView === 'privacy' && (
        <>
          <PrivacyPage onBack={handleLogoClick} />
          <Footer 
            onLogoClick={handleLogoClick}
            onManifestoClick={handleManifestoClick}
            onSpacesClick={handleSpacesClick}
            onPricingClick={handlePricingClick}
            onPrivacyClick={handlePrivacyClick}
            onTermsClick={handleTermsClick}
            onSafetyClick={handleSafetyClick}
          />
        </>
      )}

      {currentView === 'terms' && (
        <>
          <TermsPage onBack={handleLogoClick} />
          <Footer 
            onLogoClick={handleLogoClick}
            onManifestoClick={handleManifestoClick}
            onSpacesClick={handleSpacesClick}
            onPricingClick={handlePricingClick}
            onPrivacyClick={handlePrivacyClick}
            onTermsClick={handleTermsClick}
            onSafetyClick={handleSafetyClick}
          />
        </>
      )}

      {currentView === 'safety' && (
        <>
          <SafetyPage onBack={handleLogoClick} />
          <Footer 
            onLogoClick={handleLogoClick}
            onManifestoClick={handleManifestoClick}
            onSpacesClick={handleSpacesClick}
            onPricingClick={handlePricingClick}
            onPrivacyClick={handlePrivacyClick}
            onTermsClick={handleTermsClick}
            onSafetyClick={handleSafetyClick}
          />
        </>
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout} 
          initialView={initialDashboardView} 
          initialPreviewId={initialCommunityToPreview}
        />
      )}

      {currentView === 'public_profile' && publicProfileHandle && (
         <UserProfilePage 
            user={{ handle: publicProfileHandle }} 
            onBack={() => {
              window.history.replaceState({}, '', window.location.pathname);
              setCurrentView('landing');
            }} 
         />
      )}

      {currentUserId && <LedgerDebugPanel userId={currentUserId} />}

      {/* Global Presence Hub - Site-wide access */}
      <Presence currentView={currentView} subView={initialDashboardView} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
