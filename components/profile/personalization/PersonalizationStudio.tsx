
import React, { useEffect, useState } from "react";
import { AccentMood, LayoutVariant, ThemeVariant, PersonalizationSettings, UserProfile } from "./types";
import StylePicker from "./StylePicker";
import LayoutPicker from "./LayoutPicker";
import AccentPicker from "./AccentPicker";
import BannerAI from "./BannerAI";
import LivePreview from "./LivePreview";
import PublicProfilePreviewPanel from "./PublicProfilePreviewPanel";
import { dataService } from "../../../services/dataService";
import { Sparkles, CheckCircle2, RotateCcw } from "lucide-react";

interface PersonalizationStudioProps {
  userId: string;
}

export default function PersonalizationStudio({ userId }: PersonalizationStudioProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);
  
  // State
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>("standard-classic");
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("feed-first");
  const [accentMood, setAccentMood] = useState<AccentMood>("calm");
  const [bannerURL, setBannerURL] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Derived State
  const isAura = themeVariant.startsWith('aura');

  // Load profile on mount
  useEffect(() => {
    const currentUser = dataService.getCurrentUser();
    
    if (!currentUser) return; // Guard clause

    // Check if user is premium in Firestore (Mock for now, assumes 'standard' if new)
    const currentSettings = currentUser.personalization || {
        themeVariant: 'standard-classic',
        layoutVariant: 'feed-first',
        accentMood: 'calm',
        bannerURL: null
    };

    const studioProfile: UserProfile = {
      id: currentUser.id,
      displayName: currentUser.name,
      handle: currentUser.handle,
      avatarUrl: currentUser.avatar,
      bio: "Architecting the next generation of digital interfaces.",
      quantumBadge: "QUANTUM",
      isPremium: true, 
      personalization: currentSettings as PersonalizationSettings
    };

    setProfile(studioProfile);
    setInitialProfile(JSON.parse(JSON.stringify(studioProfile)));

    setThemeVariant(currentSettings.themeVariant);
    setLayoutVariant(currentSettings.layoutVariant);
    setAccentMood(currentSettings.accentMood);
    setBannerURL(currentSettings.bannerURL || null);
  }, [userId]);

  // Change Detection
  useEffect(() => {
    if (!initialProfile) return;
    const p = initialProfile.personalization;
    if (!p) return;

    const changed = 
        themeVariant !== p.themeVariant ||
        layoutVariant !== p.layoutVariant ||
        accentMood !== p.accentMood ||
        bannerURL !== p.bannerURL;
    
    setHasChanges(changed);
  }, [themeVariant, layoutVariant, accentMood, bannerURL, initialProfile]);

  const handleResetToDefault = () => {
    if (isAura) {
       // Reset to Aura Default
       setThemeVariant('aura-v13');
       setLayoutVariant('feed-first');
       setAccentMood('calm');
       setBannerURL(null);
    } else {
       // Reset to Standard Default
       setThemeVariant('standard-classic');
       setLayoutVariant('feed-first');
       setAccentMood('calm');
       setBannerURL(null);
    }
  };

  const handleUpgrade = () => {
    setThemeVariant('aura-v13');
    setLayoutVariant('feed-first');
    setAccentMood('calm');
    setHasChanges(true);
    alert("✨ Welcome to Aura. Premium features unlocked.");
  };

  const handleSave = async () => {
    if (!profile || !hasChanges) return;
    setIsSaving(true);
    const settings: PersonalizationSettings = {
      themeVariant,
      layoutVariant,
      accentMood,
      bannerURL,
      updatedAt: new Date().toISOString(),
    };

    try {
      await dataService.savePersonalization(settings);
      setHasChanges(false);
      setInitialProfile(prev => prev ? ({...prev, personalization: settings}) : null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewLive = () => {
    if (!profile) return;
    const url = new URL(window.location.href);
    url.search = ''; 
    url.hash = ''; 
    url.searchParams.set('u', profile.handle);
    window.open(url.toString(), "_blank");
  };

  if (!profile) return <div className="flex h-full items-center justify-center text-zinc-500">Loading Studio...</div>;

  // Render Props
  const currentProfileState = {
    ...profile,
    personalization: { themeVariant, layoutVariant, accentMood, bannerURL }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-8 px-6 py-8 relative">
      
      {/* Toast */}
      {showToast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in-up border border-white/20">
           <CheckCircle2 size={16} className="text-green-500" />
           <span className="text-sm font-bold">Profile updated successfully.</span>
        </div>
      )}

      {/* LEFT: Controls */}
      <div className="w-full lg:w-[380px] space-y-6 overflow-y-auto no-scrollbar pb-20">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <h1 className="text-2xl font-bold text-white tracking-tight">Personalization</h1>
             <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">v3.0</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Customize your public identity. Upgrade to Aura to unlock the full dimensional expression engine.
          </p>
        </div>

        <StylePicker 
          value={themeVariant} 
          onChange={setThemeVariant} 
          isPremium={true} 
          onUpgradeClick={handleUpgrade}
        />

        <div className={`space-y-6 transition-all duration-500 ${isAura ? 'opacity-100' : 'opacity-60 grayscale pointer-events-none'}`}>
            <LayoutPicker 
              value={layoutVariant} 
              onChange={setLayoutVariant} 
              disabled={!isAura}
            />
            <AccentPicker 
              value={accentMood} 
              onChange={setAccentMood} 
            />
            <BannerAI
              profile={profile}
              bannerURL={bannerURL}
              onBannerChange={setBannerURL}
            />
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-[#050505] to-transparent pb-4 flex items-center gap-3">
          <button
            onClick={handleResetToDefault}
            disabled={!hasChanges}
            className="px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
            title="Restore Default"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`flex-1 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl
              ${
                isSaving || !hasChanges
                  ? "bg-white/10 text-zinc-500 cursor-not-allowed border border-white/5"
                  : "bg-white text-black hover:scale-[1.02]"
              }`}
          >
            {isSaving ? "Saving..." : hasChanges ? "Apply Changes" : "Saved"}
            {!isSaving && hasChanges && <Sparkles size={14} />}
          </button>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="flex-1 flex flex-col min-h-[600px] gap-6">
        <div className="flex-1 relative">
           <div className="absolute inset-0">
              <LivePreview
                profile={profile}
                themeVariant={themeVariant}
                layoutVariant={layoutVariant}
                accentMood={accentMood}
                bannerURL={bannerURL ?? undefined}
              />
           </div>
        </div>
        
        <PublicProfilePreviewPanel 
          username={profile.handle}
          currentProfile={currentProfileState}
          originalProfile={initialProfile || profile}
          onViewLive={handleViewLive}
        />
      </div>
    </div>
  );
}
