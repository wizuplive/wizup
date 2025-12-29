import React from 'react';

export function TierProgressRing({
  progress,
  size = 28,
}: {
  progress: number; // 0..1
  size?: number;
}) {
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <svg width={size} height={size} className="block drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#aura-gradient)"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="aura-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}