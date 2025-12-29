
import React, { useState } from "react";
import { ExternalLink, Eye, X, ArrowRight } from "lucide-react";
import { UserProfile } from "./types";
import LivePreview from "./LivePreview";

interface Props {
  username: string;
  currentProfile: UserProfile;
  originalProfile: UserProfile;
  onViewLive: () => void;
}

export default function PublicProfilePreviewPanel({ username, currentProfile, originalProfile, onViewLive }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  // Helper to extract settings from a profile object for LivePreview
  const getPreviewProps = (p: UserProfile) => ({
    profile: p,
    themeVariant: p.personalization?.themeVariant || "standard-classic",
    layoutVariant: p.personalization?.layoutVariant || "feed-first",
    accentMood: p.personalization?.accentMood || "calm",
    bannerURL: p.personalization?.bannerURL || undefined
  });

  return (
    <>
      <div className="w-full mt-6 bg-[#0f0f11]/60 border border-white/5 rounded-[24px] p-5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white/80 tracking-wide text-xs font-bold uppercase">
            Public Preview
          </h3>
          <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-red-500/20" />
             <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
             <div className="w-2 h-2 rounded-full bg-green-500/20" />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setFullscreen(true)}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 hover:text-white transition-all rounded-xl flex flex-col items-center justify-center gap-1 text-white/60 text-xs font-bold uppercase tracking-wide border border-white/5 group"
          >
            <Eye size={20} className="group-hover:scale-110 transition-transform mb-1" />
            Fullscreen
          </button>

          <button
            onClick={onViewLive}
            className="flex-1 px-4 py-3 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-bold uppercase tracking-wide border border-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
          >
            <ExternalLink size={20} className="group-hover:scale-110 transition-transform mb-1" />
            View Live
          </button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in-up p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={() => setFullscreen(false)}
          />

          {/* Controls */}
          <div className="absolute top-6 right-6 z-50">
            <button
              onClick={() => setFullscreen(false)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 backdrop-blur-md"
            >
              <X size={24} />
            </button>
          </div>

          <div className="absolute top-6 left-6 z-50 flex gap-2">
            <div className="bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10 flex">
                <button
                onClick={() => setShowCompare(false)}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    !showCompare
                    ? "bg-white text-black shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
                >
                Styled (New)
                </button>
                <button
                onClick={() => setShowCompare(true)}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    showCompare
                    ? "bg-white text-black shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
                >
                Original
                </button>
            </div>
          </div>

          {/* Content Container (Phone Aspect Ratio Logic) */}
          <div className="relative w-full h-full max-w-[420px] max-h-[850px] overflow-hidden rounded-[40px] border-[8px] border-[#1f1f1f] shadow-2xl bg-black">
             {/* Notch */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1f1f1f] rounded-b-2xl z-50" />
             
             {/* Render */}
             <div className="w-full h-full bg-black">
                {showCompare ? (
                   <LivePreview {...getPreviewProps(originalProfile)} />
                ) : (
                   <LivePreview {...getPreviewProps(currentProfile)} />
                )}
             </div>
          </div>
        </div>
      )}
    </>
  );
}
