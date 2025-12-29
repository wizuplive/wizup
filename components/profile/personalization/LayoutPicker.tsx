
import React from 'react';
import { LayoutVariant } from "./types";
import { Rows, LayoutDashboard, BarChart3, SplitSquareHorizontal } from "lucide-react";

const LAYOUT_OPTIONS: {
  id: LayoutVariant;
  label: string;
  icon: any;
  description: string;
}[] = [
  {
    id: "feed-first",
    label: "Feed First",
    icon: Rows,
    description: "Reddit-style stream. Best for daily updates.",
  },
  {
    id: "story-first",
    label: "Story First",
    icon: LayoutDashboard,
    description: "Focus on Conscious Thought & pinned work.",
  },
  {
    id: "stats-first",
    label: "Stats First",
    icon: BarChart3,
    description: "Signal widgets prominent at top.",
  },
  {
    id: "split-view",
    label: "Split View",
    icon: SplitSquareHorizontal,
    description: "Stream & Signal side-by-side.",
  },
];

interface LayoutPickerProps {
  value: LayoutVariant;
  onChange: (value: LayoutVariant) => void;
  disabled?: boolean;
}

export default function LayoutPicker({ value, onChange, disabled = false }: LayoutPickerProps) {
  return (
    <div className={`rounded-[24px] bg-white/5 p-5 backdrop-blur-xl border border-white/5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 flex justify-between items-center">
        Layout Engine
        {disabled && <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-zinc-400">Aura Only</span>}
      </h2>

      <div className="grid grid-cols-1 gap-2">
        {LAYOUT_OPTIONS.map((opt) => {
          const isActive = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-300
                ${
                  isActive
                    ? "bg-white text-black border-white shadow-lg transform scale-[1.02]"
                    : "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10 hover:text-white"
                }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? "bg-black/10 text-black" : "bg-white/10 text-zinc-400"}`}>
                 <opt.icon size={18} />
              </div>
              <div className="text-left">
                 <div className="text-sm font-bold">{opt.label}</div>
                 <div className={`text-[10px] ${isActive ? "text-zinc-600" : "text-zinc-600"}`}>{opt.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
