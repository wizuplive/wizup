
import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ThemeVariant } from "./types";

interface AuraVerifiedBadgeProps {
  theme?: ThemeVariant;
  className?: string;
}

export default function AuraVerifiedBadge({ theme = "aura-v13", className = "" }: AuraVerifiedBadgeProps) {
  // 1. Standard / Free Tier Badge (Fallback if used in standard context)
  if (theme?.startsWith("standard")) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-blue-500 text-white shadow-sm ${className || "w-[18px] h-[18px]"}`}
        title="Verified"
      >
        <Check strokeWidth={3} className="w-[60%] h-[60%]" />
      </div>
    );
  }

  // 2. Master Edition Aura Badge (Dimensional Disk)
  // "Liquid Helium Glass" Surface
  const surfaceGradient = "from-[#A8C7FFDD] via-[#C6A9FFDD] to-[#FFFFFFEE]";
  
  // "Halo Channel" Edge Lighting
  const haloGradient = "from-[#9A8BFF55] to-[#5FFFFF40]";
  
  // "Dimensional Disk" Structure
  const border = "border-[#ffffff40]";
  const shadow = "shadow-[0_0_6px_-1px_rgba(156,115,255,0.35)]";

  // Use default size if not overridden by className
  const sizeClasses = className.includes("w-") && className.includes("h-") 
    ? className 
    : `w-[18px] h-[18px] ${className}`;

  return (
    <motion.div
      whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
      // Stage 6: The Living Badge Idle Loop
      animate={{ 
        scale: [1, 1.02, 1],
        filter: ["brightness(1)", "brightness(1.05)", "brightness(1)"]
      }}
      transition={{ 
        duration: 6, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`
        relative
        rounded-[6px]
        backdrop-blur-[6px]
        bg-gradient-to-br ${surfaceGradient}
        border ${border}
        ${shadow}
        flex items-center justify-center
        shrink-0
        cursor-help
        z-10
        ${sizeClasses}
      `}
      style={{
        WebkitMaskImage: "radial-gradient(circle at center, white 60%, transparent 100%)",
        maskImage: "radial-gradient(circle at center, white 60%, transparent 100%)"
      }}
      title="Aura Verified: Quantum Tier"
    >
      {/* Halo Glow (Inner Edge Lighting) */}
      <div className={`absolute inset-0 rounded-[6px] bg-gradient-to-br ${haloGradient} blur-[2px]`} />

      {/* The Quantum StarCheck Mark */}
      <Check
        className="relative z-10 w-[60%] h-[60%] text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
        strokeWidth={2.25}
      />
      
      {/* Micro-Glint Overlay (Optional Subtle Shine) */}
      <div className="absolute inset-0 rounded-[6px] bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
