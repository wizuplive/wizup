
import React, { useState } from "react";
import { UserProfile } from "./types";
import { generateImageWithGemini } from "../../../services/geminiService";
import { ImageSize } from "../../../types";
import { Loader2, Sparkles, X, Palette, Video, Ghost, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

interface BannerAIProps {
  profile: UserProfile;
  bannerURL: string | null;
  onBannerChange: (url: string | null) => void;
}

type PresetMode = 'art' | 'cartoon' | 'anime';

export default function BannerAI({ profile, bannerURL, onBannerChange }: BannerAIProps) {
  const [preset, setPreset] = useState<PresetMode>("art");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const presets = [
    { id: 'art', label: 'Art', icon: Palette, desc: 'Cinematic & Photoreal' },
    { id: 'cartoon', label: 'Cartoon', icon: Video, desc: 'Soft & Editorial' },
    { id: 'anime', label: 'Anime', icon: Ghost, desc: 'Vibrant & Stylized' },
  ];

  const handleGenerate = async () => {
    setLoading(true);

    const stylePrefix =
      preset === "art"
        ? "cinematic, premium, photoreal gradient hybrid, abstract art, 8k resolution, high contrast, elegant,"
        : preset === "cartoon"
        ? "editorial cartoon style, clean outlines, soft color fields, vector art style, flat design, minimal shading,"
        : "anime style, vibrant, cel-shading, luminous characters, studio ghibli inspired, high detail, atmospheric lighting,";

    const context = `Context: A profile banner for ${profile.displayName}. Bio: ${profile.bio || "Creator"}.`;
    const finalPrompt = `${stylePrefix} ${prompt || "Abstract creative scene with flowing shapes"}. ${context} Aspect ratio 16:4 or wide landscape. No text.`;

    try {
      const generated = await generateImageWithGemini(finalPrompt, ImageSize.SIZE_1K);
      if (generated) {
        onBannerChange(generated);
      }
    } catch (error) {
      console.error("Banner generation failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-1 rounded-[24px] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-2xl">
      <div className="bg-[#0A0A0A]/80 backdrop-blur-xl rounded-[22px] p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
             <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                <Sparkles size={12} className="text-white" />
             </div>
             <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                AI Banner 3.0
             </h2>
          </div>
          {bannerURL && (
              <button 
                  onClick={() => onBannerChange(null)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                  <X size={10} /> Remove
              </button>
          )}
        </div>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-1 rounded-2xl bg-black/40 border border-white/5">
          {presets.map((p) => {
            const isActive = preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPreset(p.id as PresetMode)}
                className={`relative flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-sm border border-white/10' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                <p.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-purple-400' : 'text-current group-hover:text-zinc-300'} />
                <span className="text-[10px] font-bold tracking-wide">{p.label}</span>
                {isActive && (
                   <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                   />
                )}
              </button>
            )
          })}
        </div>

        {/* Input */}
        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <textarea
              className="relative w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder-zinc-600 outline-none focus:border-purple-500/50 transition-colors resize-none h-24 leading-relaxed"
              placeholder={`Describe your ${preset} banner vibe...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="absolute bottom-3 right-3 pointer-events-none">
              <span className="text-[9px] text-white/20 font-bold bg-white/5 px-2 py-1 rounded border border-white/5 uppercase tracking-wider">
                  Gemini 2.5
              </span>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group
            ${
              loading
                ? "bg-white/10 text-zinc-500 cursor-not-allowed border border-white/5"
                : "bg-white text-black hover:scale-[1.02]"
            }`}
        >
          {loading ? (
              <>
                  <Loader2 size={14} className="animate-spin" /> Dreaming...
              </>
          ) : (
              <>
                  <Wand2 size={14} className="text-purple-600" /> Generate Banner
              </>
          )}
        </button>

      </div>
    </div>
  );
}
