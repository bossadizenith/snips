"use client";

import React from "react";
import { Player } from "@remotion/player";
import { useAtomValue } from "jotai";
import { slidesAtom } from "@/store/slide";
import { themeAtom, darkModeAtom } from "@/store/themes";
import { selectedLanguageAtom } from "@/store/code";
import { paddingAtom } from "@/store/padding";
import { CodeComposition } from "@/components/video/CodeComposition";
import type { CodeCompositionProps } from "@/components/video/types";

const SLIDE_DURATION = 90; // 3 seconds at 30fps
const FPS = 30;

export function VideoPreview() {
  const slides = useAtomValue(slidesAtom);
  const theme = useAtomValue(themeAtom);
  const darkMode = useAtomValue(darkModeAtom);
  const language = useAtomValue(selectedLanguageAtom);
  const padding = useAtomValue(paddingAtom);

  const totalFrames = SLIDE_DURATION * Math.max(slides.length, 1);

  const inputProps: CodeCompositionProps = {
    slides,
    theme,
    darkMode,
    language,
    padding,
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ width: "100%", maxWidth: 960 }}>
        <Player
          component={CodeComposition as unknown as React.ComponentType<Record<string, unknown>>}
          inputProps={inputProps as unknown as Record<string, unknown>}
          durationInFrames={totalFrames}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={FPS}
          style={{ width: "100%", aspectRatio: "16/9" }}
          controls
          loop
          autoPlay
        />
      </div>
    </div>
  );
}
