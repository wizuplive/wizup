import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function AuraBadgeLanding() {
  const [isLanded, setIsLanded] = useState(false);

  return (
    <div className="relative w-[28px] h-[28px]">
      {/* Aura Pulse Background */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ 
          scale: [0.6, 1.15, 1], 
          opacity: [0, 0.25, 0.1] 
        }}
        transition={{ 
          duration: 0.9,
          delay: 0.9,
          ease: "easeOut"
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#A88BFF55] to-[#4FF3FF44] blur-[10px]"
      />

      {/* Badge Container */}
      <motion.div
        className="
          absolute inset-0 rounded-[8px] 
          backdrop-blur-[8px] bg-gradient-to-br 
          from-[#D8CCFFDD] via-[#B0F0FFEE] to-[#FFFFFFEE] 
          border border-white/30
          shadow-[0_0_8px_rgba(200,150,255,0.4)]
          flex items-center justify-center
        "
        initial={{
          opacity: 0,
          scale: 0.85,
          y: -4,
          filter: "blur(6px)"
        }}
        animate={isLanded ? {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          scale: [1, 1.02, 1],
        } : {
          opacity: 1,
          scale: [0.85, 1.06, 1],
          y: 0,
          filter: "blur(0px)"
        }}
        transition={isLanded ? {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        } : {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }}
        onAnimationComplete={() => {
          if (!isLanded) {
            // Wait a bit before starting idle loop to match spec "after 2s" total time
            setTimeout(() => setIsLanded(true), 1400); 
          }
        }}
      >
        {/* Shine sweep */}
        <motion.div
          className="absolute inset-0 rounded-[8px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: "120%", opacity: [0, 0.15, 0] }}
          transition={{
            duration: 0.45,
            delay: 0.55,
            ease: "easeInOut"
          }}
        />

        {/* Check Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: [0.7, 1.15, 1], opacity: 1 }}
          transition={{
            duration: 0.35,
            delay: 0.45,
            ease: "easeOut"
          }}
        >
          <Check 
            className="w-[16px] h-[16px] text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]" 
            strokeWidth={3}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}