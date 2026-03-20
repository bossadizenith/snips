import React from "react";
import { Composition } from "remotion";
import { CodeComposition } from "@/components/video/CodeComposition";
import type { CodeCompositionProps } from "@/components/video/types";

const SLIDE_DURATION = 90; // 3 seconds at 30fps
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

// Default props — overridden at render time via inputProps
const defaultProps: CodeCompositionProps = {
  slides: [{ id: "default", title: "Slide 1", code: 'console.log("hello world")' }],
  theme: {
    id: "candy",
    name: "Candy",
    background: { from: "#FF6369", to: "#FFA24B" },
    syntax: {
      dark: {
        "--ray-foreground": "#FFFFFF",
      } as React.CSSProperties,
    },
  },
  darkMode: true,
  language: null,
  padding: 64,
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CodeComposition"
      // Cast needed because Remotion's LooseComponentType uses Record<string,unknown>
      component={CodeComposition as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={SLIDE_DURATION * Math.max(defaultProps.slides.length, 1)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaultProps as unknown as Record<string, unknown>}
      calculateMetadata={({ props }) => {
        const typedProps = props as unknown as CodeCompositionProps;
        const slideCount = typedProps.slides?.length ?? 1;
        return {
          durationInFrames: SLIDE_DURATION * slideCount,
        };
      }}
    />
  );
};
