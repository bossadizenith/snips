import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeCompositionProps } from "./types";
import { Theme } from "@/store/themes";

interface VideoSlideRenderProps extends CodeCompositionProps {
  slideIndex: number;
  startFrame: number;
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
  startFrame,
  theme,
  darkMode,
  padding,
}) => {
  const frame = useCurrentFrame();
  const slide = slides[slideIndex];
  const isDark = getIsDark(theme, darkMode);

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const bg = `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})`;
  const syntax = (isDark ? theme.syntax.dark : theme.syntax.light) ?? theme.syntax.dark ?? theme.syntax.light ?? {};

  // Pull foreground from the CSS variable object
  const syntaxRecord = syntax as Record<string, string>;
  const foreground = syntaxRecord["--ray-foreground"] || (isDark ? "#fff" : "#111");
  const comment = syntaxRecord["--ray-token-comment"] || (isDark ? "#888" : "#666");

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Gradient background */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Card / window */}
        <div
          style={{
            padding,
            maxWidth: "80%",
            minWidth: 600,
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#fff",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Traffic light header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 16px",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              }}
            >
              {["#FF5F57", "#FEBC2E", "#28C840"].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: color,
                  }}
                />
              ))}
              <span
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  fontSize: 13,
                  color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)",
                  fontFamily: "monospace",
                }}
              >
                {slide.title}
              </span>
            </div>

            {/* Code area */}
            <div
              style={{
                padding: "24px 28px",
                overflowX: "hidden",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: foreground,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {slide.code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
