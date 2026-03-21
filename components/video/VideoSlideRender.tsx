import { Theme, shikiTheme } from "@/store/themes";
import React, { useEffect } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, delayRender, continueRender } from "remotion";
import ThemeFrame from "./ThemeFrame";
import { CodeCompositionProps, Slide } from "./types";
import { Provider, useAtom } from "jotai";
import { highlighterAtom, slidesAtom } from "@/store";
import { Language, LANGUAGES } from "@/utils/languages";
import { getHighlighterCore } from "shiki";
import getWasm from "shiki/wasm";
import tailwindLight from "@/public/assets/tailwind/light.json";
import tailwindDark from "@/public/assets/tailwind/dark.json";
import { StaticCode } from "./StaticCode";

interface VideoSlideRenderProps extends CodeCompositionProps {
  slideIndex: number;
}

/** Returns true if the theme has a dark variant */
function getIsDark(theme: Theme, darkMode: boolean): boolean {
  const hasDark = !!theme.syntax?.dark;
  const hasLight = !!theme.syntax?.light;
  if (hasDark && !hasLight) return true;
  if (hasLight && !hasDark) return false;
  return darkMode;
}


const HighlighterLoader = ({ 
  children,
  language
}: { 
  children: React.ReactNode,
  language: Language | null
}) => {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const [handle] = React.useState(() => delayRender("Loading highlighter"));
  const [initialized, setInitialized] = React.useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        let currentHighlighter = highlighter;
        if (!currentHighlighter) {
          const h = await getHighlighterCore({
            themes: [shikiTheme, tailwindLight as any, tailwindDark as any],
            langs: [
              LANGUAGES.javascript.src(),
              LANGUAGES.tsx.src(),
              LANGUAGES.swift.src(),
              LANGUAGES.python.src(),
            ],
            loadWasm: getWasm,
          });
          setHighlighter(h as any);
          currentHighlighter = h as any;
        }

        if (language && currentHighlighter) {
          const loadedLangs = currentHighlighter.getLoadedLanguages();
          if (!loadedLangs.includes(language.name)) {
            await currentHighlighter.loadLanguage(language.src());
          }
        }
        setInitialized(true);
      } catch (err) {
        console.error("Failed to load highlighter or language:", err);
      } finally {
        continueRender(handle);
      }
    };

    load();
  }, [highlighter, setHighlighter, language, handle]);

  if (!initialized) return null;
  return <>{children}</>;
};

/**
 * A self-contained slide renderer for Remotion video rendering.
 * Uses tokens if provided (highly recommended for performance and stability)
 */
export const VideoSlideRender: React.FC<VideoSlideRenderProps> = (props) => {
  const { slides, slideIndex, theme, darkMode, padding, language, windowWidth } = props;
  const frame = useCurrentFrame();
  const slide = slides[slideIndex] as Slide;

  if (!slide || !theme) return null;

  const isDark = getIsDark(theme, darkMode);
  const bgFrom = theme.background?.from || "#333";
  const bgTo = theme.background?.to || "#111";
  const themeBackground = `linear-gradient(140deg, ${bgFrom}, ${bgTo})`;

  // Overall slide fade-in
  const slideOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const renderContent = () => {
    if (slide.tokens) {
      return (
        <ThemeFrame
          theme={theme}
          darkMode={isDark}
          padding={padding || 64}
          showBackground={true}
          themeBackground={themeBackground}
          fileName={slide.title || ""}
          code={slide.code}
          language={language}
        >
          <StaticCode tokens={slide.tokens as any} />
        </ThemeFrame>
      );
    }

    return (
      <HighlighterLoader language={language}>
        <ThemeFrame
          theme={theme}
          darkMode={isDark}
          padding={padding || 64}
          showBackground={true}
          themeBackground={themeBackground}
          fileName={slide.title || ""}
          code={slide.code}
          language={language}
        />
      </HighlighterLoader>
    );
  };

  return (
    <Provider>
      <AbsoluteFill style={{ 
        opacity: slideOpacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}>
        <div style={{ 
          width: windowWidth || 950, 
          maxWidth: "95%",
          transform: "scale(1.25)",
          transformOrigin: "center center",
          boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5)",
          borderRadius: "16px",
          overflow: "hidden"
        }}>
          {renderContent()}
        </div>
      </AbsoluteFill>
    </Provider>
  );
};
