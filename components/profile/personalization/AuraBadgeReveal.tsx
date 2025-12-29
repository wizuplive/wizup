
import React from 'react';
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function AuraBadgeReveal() {
  return (
    <motion.div
      className="relative w-[72px] h-[72px] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
      animate={{
        opacity: [0, 0.2, 1],
        scale: [0.8, 1.05, 1],
        filter: ["blur(10px)", "blur(4px)", "blur(0px)"],
      }}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Materialized Badge */}
      <motion.div
        initial={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: [0.8, 1.15, 1],
          opacity: 1,
        }}
        transition={{
          duration: 0.7,
          delay: 0.35,
          type: "spring",
          stiffness: 120,
          damping: 18,
        }}
        className="
          relative
          w-[56px] h-[56px]
          rounded-[14px]
          backdrop-blur-[12px]
          bg-gradient-to-br
          from-[#A8C7FFDD] via-[#C6A9FFDD] to-[#FFFFFFEE]
          shadow-[0_0_20px_rgba(155,125,255,0.4)]
          border border-[#ffffff40]
          flex items-center justify-center
        "
      >
        {/* Aura Sweep */}
        <motion.div
          className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-[#9A8BFF55] to-[#5FFFFF40] blur-[10px]"
          animate={{
            opacity: [0, 0.3, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            delay: 0.9,
            ease: "easeInOut",
          }}
        />

        {/* StarCheck */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.3, 1],
            opacity: 1,
          }}
          transition={{
            duration: 0.45,
            delay: 1.3,
            ease: "easeOut",
          }}
        >
          <Check
            className="w-[28px] h-[28px] text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
            strokeWidth={3}
          />
        </motion.div>
      </motion.div>

      {/* Halo Bloom */}
      <motion.div
        className="absolute w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#9A8BFF33] to-[#5FFFFF22] blur-[30px]"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: [0, 0.5, 0.2] }}
        transition={{
          duration: 0.65,
          delay: 1.6,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </motion.div>
  );
}
