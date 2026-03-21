import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeCompositionProps } from "./types";
import { Theme } from "@/store/themes";

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
  
  // Diagnostic log for the browser/Remotion worker
  if (frame === 0) {
    console.log(`[VideoSlideRender] Rendering slide ${slideIndex}`, {
      hasTokens: !!slide?.tokens,
      themeId: theme?.id,
      padding
    });
  }

  if (!slide || !theme) {
    return <AbsoluteFill className="bg-red-500 flex items-center justify-center text-white">Missing slide or theme</AbsoluteFill>;
  }

  const isDark = getIsDark(theme, darkMode);
  const bg = theme.background ? `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})` : "#333";
  const syntax = (isDark ? theme.syntax.dark : theme.syntax.light) ?? theme.syntax.dark ?? theme.syntax.light ?? {};

  const syntaxRecord = syntax as Record<string, string>;
  const foreground = syntaxRecord["--ray-foreground"] || (isDark ? "#fff" : "#111");

  // Overall slide fade-in
  const slideOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: slideOpacity }}>
      {/* Gradient background */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...syntaxRecord,
        }}
      >
        {/* Card / window */}
        <div
          style={{
            padding: padding || 64,
            maxWidth: "90%",
            minWidth: 600,
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? "#0D0D0D" : "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
            }}
          >
            {/* Traffic light header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 20px",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              }}
            >
              {["#FF5F57", "#FEBC2E", "#28C840"].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    backgroundColor: color,
                  }}
                />
              ))}
              <span
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  fontSize: 14,
                  fontWeight: 500,
                  color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)",
                  fontFamily: "monospace",
                }}
              >
                {slide.title || "Untitled"}
              </span>
            </div>

            {/* Code area */}
            <div
              style={{
                padding: "32px 36px",
                overflowX: "hidden",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: foreground,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {(() => {
                  const tokens = slide.tokens 
                    ? (Array.isArray(slide.tokens) ? slide.tokens : (slide.tokens as any).tokens)
                    : null;

                  if (!tokens || !Array.isArray(tokens)) {
                    return <div style={{ color: foreground }}>{slide.code}</div>;
                  }

                  return tokens.map((line: any, i: number) => {
                    const start = i * 1.5;
                    const opacity = interpolate(frame, [start, start + 10], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });
                    const translateY = interpolate(frame, [start, start + 10], [10, 0], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    });

                    return (
                      <div 
                        key={i} 
                        style={{ 
                          opacity, 
                          transform: `translateY(${translateY}px)`,
                          display: "flex",
                          flexWrap: "wrap",
                          minHeight: "1.6em"
                        }}
                      >
                        {line.length === 0 ? "\u00A0" : line.map((token: any, j: number) => (
                          <span 
                            key={j} 
                            style={{ 
                              color: token.color, 
                              fontStyle: token.fontStyle === 1 ? "italic" : "normal" 
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
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
