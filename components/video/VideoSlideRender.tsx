import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeCompositionProps } from "./types";
import { Theme } from "@/store/themes";
import ThemeFrame from "./ThemeFrame";

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
        <div style={{ padding: "32px 36px", ...syntaxRecord }}>
          <pre
            style={{
              margin: 0,
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontSize: 20,
              lineHeight: 1.6,
              color: foreground,
              whiteSpace: "pre-wrap",
            }}
          >
            {(() => {
              const tokens = slide.tokens
                ? Array.isArray(slide.tokens)
                  ? slide.tokens
                  : (slide.tokens as any).tokens
                : null;

              if (!tokens || !Array.isArray(tokens)) {
                return <div style={{ color: foreground }}>{slide.code}</div>;
              }

              return tokens.map((line: any, i: number) => {
                const start = i * 1.5;
                const opacity = interpolate(
                  frame,
                  [start, start + 10],
                  [0, 1],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                );
                const translateY = interpolate(
                  frame,
                  [start, start + 10],
                  [10, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                );

                return (
                  <div
                    key={i}
                    style={{
                      opacity,
                      transform: `translateY(${translateY}px)`,
                      display: "flex",
                      flexWrap: "wrap",
                      minHeight: "1.6em",
                    }}
                  >
                    {line.length === 0
                      ? "\u00A0"
                      : line.map((token: any, j: number) => (
                          <span
                            key={j}
                            style={{
                              color: token.color,
                              fontStyle:
                                token.fontStyle === 1 ? "italic" : "normal",
                            }}
                          >
                            {token.content}
                          </span>
                        ))}
                  </div>
                );
              });
            })()}
          </pre>
        </div>
      </ThemeFrame>
    </AbsoluteFill>
  );
};
