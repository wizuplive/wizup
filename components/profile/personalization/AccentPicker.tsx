
import React from 'react';
import { AccentMood } from "./types";

const ACCENT_OPTIONS: {
  id: AccentMood;
  label: string;
  colors: string; // Tailwind gradient classes for preview
}[] = [
  { id: "calm", label: "Calm", colors: "from-blue-400 to-indigo-400" },
  { id: "energy", label: "Energy", colors: "from-orange-400 to-yellow-400" },
  { id: "focus", label: "Focus", colors: "from-gray-200 to-gray-400" },
  { id: "playful", label: "Playful", colors: "from-pink-400 to-purple-400" },
  { id: "mystic", label: "Mystic", colors: "from-teal-400 to-emerald-400" },
];

interface AccentPickerProps {
  value: AccentMood;
  onChange: (value: AccentMood) => void;
}

export default function AccentPicker({ value, onChange }: AccentPickerProps) {
  return (
    <div className="rounded-[24px] bg-white/5 p-5 backdrop-blur-xl border border-white/5">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">
        Accent Mood
      </h2>

      <div className="flex flex-wrap gap-3">
        {ACCENT_OPTIONS.map((opt) => {
          const isActive = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`group relative flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all duration-300
                ${
                  isActive
                    ? "bg-white/10 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "bg-transparent border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                }`}
            >
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${opt.colors} shadow-sm group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-bold">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
