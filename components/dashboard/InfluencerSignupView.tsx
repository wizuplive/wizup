
import React, { useState, useEffect } from 'react';
import { 
  Instagram, Youtube, Twitter, Linkedin, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, 
  Globe, ChevronRight, Camera, 
  Zap, Upload, Shield, Link
} from 'lucide-react';
import { hybridSync, SyncedCreatorData } from '../../services/hybridSyncService';
import { generateRateSuggestions } from '../../services/geminiService';
import { dataService } from '../../services/dataService';
import { functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';

interface InfluencerSignupViewProps {
  onComplete: () => void;
  onBack: () => void;
}

const InfluencerSignupView: React.FC<InfluencerSignupViewProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<'eligibility' | 'identity' | 'content' | 'offers' | 'messaging' | 'success'>('eligibility');
  const [platform, setPlatform] = useState('Instagram');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manual Verification State (Layer 5)
  const [manualVerification, setManualVerification] = useState(false);
  const [manualFollowers, setManualFollowers] = useState('');
  
  // Synced Data State
  const [syncedData, setSyncedData] = useState<SyncedCreatorData | null>(null);
  const [rates, setRates] = useState<{ sponsoredReel: number; storyPromo: number; dedicatedReview: number } | null>(null);

  // Handlers
  const handleEligibilityCheck = async () => {
    if (!handle) return;
    setLoading(true);
    setError(null);
    setManualVerification(false);

    // Call Hybrid Sync Engine (Cloud Function -> Simulation)
    const result = await hybridSync({
      platform,
      username: handle,
    });

    if (result.success && result.data) {
      if (result.data.followers >= 1000) {
        setSyncedData(result.data);
        setStep('identity');
      } else {
        setError("We require at least 1,000 followers to join the Partner Hub. Keep growing!");
      }
    } else if (result.verificationRequired) {
      // Layer 5 Triggered
      setManualVerification(true);
    } else {
      setError(result.error || "Unable to sync profile. Please check the handle and try again.");
    }
    setLoading(false);
  };

  const handleManualSubmit = async () => {
    const count = parseInt(manualFollowers.replace(/,/g, ''), 10);
    
    if (isNaN(count)) {
        setError("Please enter a valid number.");
        return;
    }

    if (count < 1000) {
        setError("We require at least 1,000 followers. Keep growing!");
        return;
    }

    setLoading(true);

    try {
      // Try to call the Layer 5 Backend Function if available
      if (functions) {
        const confirmFollowers = httpsCallable(functions, 'confirmInstagramFollowers');
        const instagramUrl = `https://www.instagram.com/${handle}/`;
        
        try {
           await confirmFollowers({ instagramUrl, followers: count });
           console.log("Verified via Layer 5 Backend");
        } catch (backendErr) {
           console.warn("Backend confirmation failed, falling back to local state.", backendErr);
        }
      }

      // Proceed with Manual Data
      const manualData: SyncedCreatorData = {
          followers: count,
          profilePicture: `https://picsum.photos/seed/${handle}/200/200`,
          nicheTags: ["General"],
          bio: "Verified via Manual Entry",
          engagementRate: "Unknown",
          topContent: [],
          verificationRequired: true,
          verifiedVia: 'manual'
      };

      setSyncedData(manualData);
      setStep('identity');
    } catch (err) {
      setError("Something went wrong verifying your count.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRates = async () => {
    if (syncedData) {
      setLoading(true);
      const suggestions = await generateRateSuggestions(
        syncedData.followers,
        syncedData.engagementRate || "2.0%",
        syncedData.nicheTags[0] || "General"
      );
      if (suggestions) setRates(suggestions);
      setLoading(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (syncedData) {
      await dataService.upgradeToCreator(syncedData);
      setStep('success');
    }
  };

  useEffect(() => {
    if (step === 'offers' && !rates) {
      handleFetchRates();
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-6 animate-fade-in-up">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-black to-blue-900/10 z-0" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Header */}
        <div className="p-8 pb-0 flex justify-between items-center">
           <button onClick={onBack} className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1">
              <ChevronRight size={16} className="rotate-180" /> Back
           </button>
           <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                    (step === 'eligibility' && i === 1) || 
                    (step === 'identity' && i <= 2) ||
                    (step === 'content' && i <= 3) ||
                    (step === 'offers' && i <= 4) ||
                    (step === 'messaging' && i <= 5) ||
                    (step === 'success' && i <= 6)
                    ? 'bg-purple-500' : 'bg-white/10'
                 }`} />
              ))}
           </div>
        </div>

        <div className="p-8 md:p-12">
           
           {/* STEP 1: ELIGIBILITY */}
           {step === 'eligibility' && (
              <div className="space-y-8 animate-slide-up-fade">
                 <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                       <Sparkles size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Connect Your Creator Profile</h2>
                    <p className="text-gray-400 font-light">Auto-sync your metrics, content, and rates instantly.</p>
                 </div>

                 {/* Platform Selector */}
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Select Platform</label>
                    <div className="flex gap-4 justify-center">
                       {[
                          { id: 'Instagram', icon: Instagram, color: 'hover:text-pink-500 hover:border-pink-500/50' },
                          { id: 'YouTube', icon: Youtube, color: 'hover:text-red-500 hover:border-red-500/50' },
                          { id: 'TikTok', icon: Globe, color: 'hover:text-cyan-400 hover:border-cyan-400/50' }, 
                       ].map(p => (
                          <button
                             key={p.id}
                             onClick={() => { setPlatform(p.id); setManualVerification(false); setError(null); }}
                             className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                                platform === p.id 
                                   ? 'bg-white text-black border-white scale-110 shadow-lg' 
                                   : `bg-white/5 border-white/10 text-gray-400 ${p.color} hover:bg-white/10`
                             }`}
                          >
                             <p.icon size={24} />
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Handle Input OR Manual Verification */}
                 <div className="space-y-4">
                    {manualVerification ? (
                        // LAYER 5: Manual Verification UI
                        <div className="animate-slide-up-fade p-6 rounded-2xl bg-white/5 border border-purple-500/30">
                            <div className="flex items-center gap-3 mb-4 text-purple-300">
                                <Shield size={20} />
                                <span className="text-sm font-bold uppercase tracking-wide">Manual Verification Required</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-6">
                                We couldn't automatically read your metrics due to privacy settings or bot protection. Please confirm your follower count manually.
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Follower Count</label>
                                    <input 
                                        type="text"
                                        value={manualFollowers}
                                        onChange={(e) => setManualFollowers(e.target.value)}
                                        placeholder="e.g. 12,500"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                                
                                <div className="p-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
                                    <Upload size={16} className="text-gray-500" />
                                    <span className="text-xs text-gray-400">Upload Screenshot (Optional)</span>
                                </div>

                                <button 
                                    onClick={handleManualSubmit}
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-500 transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify & Continue'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Standard Automated Flow
                        <div className="relative group">
                           <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                           <input 
                              type="text" 
                              value={handle}
                              onChange={(e) => setHandle(e.target.value)}
                              placeholder={`@username on ${platform}`}
                              className="relative w-full bg-[#121212] border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-all text-center font-medium"
                           />
                        </div>
                    )}
                    
                    {error && (
                       <div className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                          <AlertCircle size={16} /> {error}
                       </div>
                    )}

                    {!manualVerification && (
                        <button 
                           onClick={handleEligibilityCheck}
                           disabled={loading || !handle}
                           className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:hover:scale-100"
                        >
                           {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sync & Continue'}
                        </button>
                    )}
                 </div>
              </div>
           )}

           {/* STEP 2: IDENTITY SETUP */}
           {step === 'identity' && syncedData && (
              <div className="space-y-8 animate-slide-left-fade">
                 <div className="text-center mb-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-4 ${syncedData.verificationRequired ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                       <CheckCircle2 size={12} /> {syncedData.verificationRequired ? 'Manual Entry' : 'Sync Complete'}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Identity Verified</h2>
                    <p className="text-gray-400 text-sm mt-1">Found <span className="text-white font-bold">{syncedData.followers.toLocaleString()} followers</span>.</p>
                 </div>

                 <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-black p-1 border border-white/10 shadow-xl relative group cursor-pointer">
                       <img src={syncedData.profilePicture} className="w-full h-full rounded-full object-cover" alt="Profile" />
                    </div>
                    <div className="flex-1 space-y-3">
                       <input 
                          type="text" 
                          defaultValue={handle} 
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50" 
                          placeholder="Display Name"
                       />
                       <div className="flex gap-2">
                          {syncedData.nicheTags.map((tag, i) => (
                             <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-xs text-gray-300 border border-white/5">{tag}</span>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button 
                    onClick={() => setStep('content')}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2"
                 >
                    Next: Featured Content
                 </button>
              </div>
           )}

           {/* STEP 3: CONTENT IMPORT */}
           {step === 'content' && syncedData && (
              <div className="space-y-8 animate-slide-left-fade">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Featured Work</h2>
                    <p className="text-gray-400 text-sm">
                        {syncedData.verificationRequired ? "Upload your best work." : "We've auto-selected your top performing content."}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {syncedData.topContent.length > 0 ? syncedData.topContent.map((content) => (
                       <div key={content.id} className="relative aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer border border-white/10 hover:border-purple-500 transition-all">
                          <img src={content.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={content.title} />
                          <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black to-transparent">
                             <div className="text-xs font-bold text-white">{content.views} Views</div>
                          </div>
                       </div>
                    )) : (
                        <>
                            <div className="aspect-[4/5] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer hover:bg-white/5 transition-colors">
                                <Upload size={24} />
                                <span className="text-xs font-bold uppercase">Upload</span>
                            </div>
                            <div className="aspect-[4/5] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer hover:bg-white/5 transition-colors">
                                <Link size={24} />
                                <span className="text-xs font-bold uppercase">Paste Link</span>
                            </div>
                        </>
                    )}
                 </div>

                 <button 
                    onClick={() => setStep('offers')}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2"
                 >
                    Next: AI Pricing
                 </button>
              </div>
           )}

           {/* STEP 4: OFFERS SETUP */}
           {step === 'offers' && (
              <div className="space-y-8 animate-slide-left-fade">
                 <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1 mb-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-300">
                       <Sparkles size={10} /> AI Pricing
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Recommended Rates</h2>
                 </div>

                 {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                       <Loader2 size={32} className="text-purple-500 animate-spin mb-4" />
                       <p className="text-gray-500 text-sm">Analyzing market data...</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <span className="text-sm font-bold text-white">Sponsored Reel</span>
                          <input type="text" defaultValue={rates?.sponsoredReel || 0} className="w-20 bg-black border border-white/10 rounded-lg px-3 py-2 text-right text-sm text-white focus:outline-none" />
                       </div>
                       <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <span className="text-sm font-bold text-white">Story Promo</span>
                          <input type="text" defaultValue={rates?.storyPromo || 0} className="w-20 bg-black border border-white/10 rounded-lg px-3 py-2 text-right text-sm text-white focus:outline-none" />
                       </div>
                    </div>
                 )}

                 <button onClick={() => setStep('messaging')} className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg">Next: Preferences</button>
              </div>
           )}

           {/* STEP 5: MESSAGING */}
           {step === 'messaging' && (
              <div className="space-y-8 animate-slide-left-fade">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Communication</h2>
                 </div>
                 <div className="space-y-3">
                    {['Allow Direct Messages', 'Allow Collaboration Invites'].map((pref, i) => (
                       <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <span className="text-sm font-medium text-gray-200">{pref}</span>
                          <div className="w-12 h-6 bg-purple-600 rounded-full p-1 relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" /></div>
                       </div>
                    ))}
                 </div>
                 <button onClick={handleCompleteSetup} className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg mt-8">Complete Setup</button>
              </div>
           )}

           {/* STEP 6: SUCCESS */}
           {step === 'success' && (
              <div className="text-center py-10 animate-scale-in">
                 <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-bounce">
                    <CheckCircle2 size={48} className="text-black" />
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-4">Welcome to WIZUP!</h2>
                 <button onClick={onComplete} className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform shadow-xl">Go to Seller Centre</button>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default InfluencerSignupView;
