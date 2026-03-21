import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeCompositionProps } from "./types";
import { Theme } from "@/store/themes";
import ThemeFrame from "./ThemeFrame";
import HighlightedCode from "../HighlightedCode";
import { LANGUAGES } from "@/utils/languages";

interface VideoSlideRenderProps extends CodeCompositionProps {
  slideIndex: number;
}

/** Returns true if the theme has a dark variant */
function getIsDark(theme: Theme, darkMode: boolean): boolean {
  const hasDark = !!theme.syntax.dark;
  const hasLight = !!theme.syntax.light;
  if (hasDark && !hasLight) return true;
  if (hasLight && !hasDark) return false;
  return darkMode;
}

/**
 * A self-contained slide renderer for Remotion video rendering.
 * Does NOT use any jotai atoms — all values come directly from props.
 */
export const VideoSlideRender: React.FC<VideoSlideRenderProps> = ({
  slides,
  slideIndex,
  theme,
  darkMode,
  padding,
}) => {
  const frame = useCurrentFrame();
  const slide = slides[slideIndex];

  if (!slide || !theme) return null;

  const isDark = getIsDark(theme, darkMode);
  const bgFrom = theme.background?.from || "#333";
  const bgTo = theme.background?.to || "#111";
  const themeBackground = `linear-gradient(140deg, ${bgFrom}, ${bgTo})`;

  const syntax =
    (isDark ? theme.syntax.dark : theme.syntax.light) ??
    theme.syntax.dark ??
    theme.syntax.light ??
    {};
  const syntaxRecord = syntax as Record<string, string>;
  const foreground =
    syntaxRecord["--ray-foreground"] || (isDark ? "#fff" : "#111");

  // Overall slide fade-in
  const slideOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: slideOpacity }}>
      <ThemeFrame
        theme={theme}
        darkMode={isDark}
        padding={padding || 64}
        showBackground={true}
        themeBackground={themeBackground}
        fileName={slide.title || ""}
        code={slide.code}
      >
        <HighlightedCode
          selectedLanguage={LANGUAGES.typescript}
          code={slide.code}
        />
      </ThemeFrame>
    </AbsoluteFill>
  );
};
