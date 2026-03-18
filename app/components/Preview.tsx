"use client";

import { ShikiMagicMove } from "shiki-magic-move/react";
import { SHIKI_THEMES, useSnipsStore } from "@/app/store/useStore";
import "shiki-magic-move/dist/style.css";
import { useEffect, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";

export function Preview() {
  const {
    slides,
    currentSlideIndex,
    theme,
    duration,
    showLineNumbers,
    fontSize,
  } = useSnipsStore();
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const currentSlide = slides[currentSlideIndex];
  const previousSlide = slides[currentSlideIndex - 1];

  useEffect(() => {
    let mounted = true;
    let createdHighlighter: Highlighter | null = null;

    async function init() {
      const hl = await createHighlighter({
        themes: [...SHIKI_THEMES],
        langs: [
          "javascript",
          "typescript",
          "python",
          "rust",
          "go",
          "json",
          "cpp",
          "java",
          "csharp",
          "php",
          "ruby",
          "html",
          "css",
          "yaml",
          "bash",
        ],
      });
      createdHighlighter = hl;

      if (!mounted) {
        hl.dispose();
        return;
      }

      setHighlighter(hl);
    }

    init();

    return () => {
      mounted = false;
      createdHighlighter?.dispose();
    };
  }, []);

  if (!currentSlide || !highlighter) {
    return (
      <div className="flex-1 bg-zinc-900 border-l border-zinc-800 flex items-center justify-center">
        <span className="text-zinc-500 animate-pulse text-sm">
          Initializing preview...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-900 border-l border-zinc-800 flex flex-col p-6 overflow-hidden">
      <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
            Preview Pane
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 font-mono">
              Theme: {theme}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">/</span>
            <span className="text-[10px] text-zinc-600 font-mono">
              {duration}s
            </span>
          </div>
        </div>

        <div className="flex-1 bg-black rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden min-h-0 flex flex-col relative group/preview">
          {/* Background Gradient/Glass Effect */}
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-rose-500/5 pointer-events-none" />

          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-900 bg-zinc-950/50 relative z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
          </div>

          <div
            className="flex-1 overflow-auto p-8 font-mono leading-relaxed relative z-10 scrollbar-hide"
            style={{ fontSize: `${fontSize}px` }}
          >
            <ShikiMagicMove
              key={theme}
              highlighter={highlighter}
              theme={theme}
              lang="typescript"
              code={currentSlide.code}
              options={{
                duration: duration * 1000,
                stagger: 3,
                lineNumbers: showLineNumbers,
              }}
            />

            {/* Watermark */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 opacity-20 group-hover/preview:opacity-50 transition-opacity pointer-events-none">
              <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                <span className="text-black font-bold text-[10px] italic">
                  s
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-tighter text-white">
                snips.dev
              </span>
            </div>
          </div>
        </div>

        {previousSlide && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 flex gap-4 items-center overflow-hidden">
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter whitespace-nowrap">
              Morphing from
            </span>
            <span className="text-[10px] text-zinc-500 font-mono truncate italic opacity-50 underline decoration-zinc-700 decoration-wavy">
              {previousSlide.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
