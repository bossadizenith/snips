"use client";

import {
  SHIKI_THEMES,
  useSnipsStore,
  type ShikiTheme,
} from "@/app/store/useStore";
import { Plus, Play, Download } from "lucide-react";

const THEME_LABELS: Record<ShikiTheme, string> = {
  "one-dark-pro": "One Dark Pro",
  "github-dark": "GitHub Dark",
  dracula: "Dracula",
  "min-dark": "Min Dark",
  "vitesse-dark": "Vitesse Dark",
};

export function Navbar() {
  const { addSlide, theme, setTheme, duration, setDuration } = useSnipsStore();

  return (
    <nav className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
          <span className="text-white dark:text-black font-bold text-lg italic">
            s
          </span>
        </div>
        <h1 className="font-semibold text-lg tracking-tight">snips</h1>
        <span className="text-zinc-400 text-sm">/</span>
        <div className="flex items-center gap-2">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ShikiTheme)}
            className="text-xs bg-zinc-100 dark:bg-zinc-900 border-none rounded px-2 py-1 outline-none font-medium"
          >
            {SHIKI_THEMES.map((themeOption) => (
              <option key={themeOption} value={themeOption}>
                {THEME_LABELS[themeOption]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => addSlide()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors"
        >
          <Plus size={16} />
          Add Slide
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">
            Speed
          </span>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-16 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-zinc-500 w-8">
            {duration}s
          </span>
        </div>
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <Play size={16} />
          Preview
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all shadow-sm"
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </nav>
  );
}
