import { Theme, themeAtom, darkModeAtom, shikiTheme } from "@/store/themes";
import React, { useEffect } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import ThemeFrame from "./ThemeFrame";
import { CodeCompositionProps } from "./types";
import { Provider, useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { userInputtedCodeAtom, userInputtedLanguageAtom } from "@/store/code";
import { paddingAtom } from "@/store/padding";
import { fileNameAtom, highlighterAtom, showBackgroundAtom, windowWidthAtom } from "@/store";
import { getHighlighterCore } from "shiki";
import getWasm from "shiki/wasm";
import { LANGUAGES } from "@/utils/languages";
import tailwindLight from "@/public/assets/tailwind/light.json";
import tailwindDark from "@/public/assets/tailwind/dark.json";

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

const HydrateAtoms = ({
  values,
  children,
}: {
  values: any;
  children: React.ReactNode;
}) => {
  useHydrateAtoms(values);
  return <>{children}</>;
};

const HighlighterLoader = ({ 
  children,
  language
}: { 
  children: React.ReactNode,
  language: Language | null
}) => {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const [handle] = React.useState(() => delayRender("Loading highlighter"));

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
      } catch (err) {
        console.error("Failed to load highlighter or language:", err);
      } finally {
        continueRender(handle);
      }
    };

    load();
  }, [highlighter, setHighlighter, language, handle]);

  return <>{children}</>;
};

/**
 * A self-contained slide renderer for Remotion video rendering.
 * Does NOT use any jotai atoms directly — it hydrates them for sub-components.
 */
export const VideoSlideRender: React.FC<VideoSlideRenderProps> = (props) => {
  const { slides, slideIndex, theme, darkMode, padding, language, windowWidth } = props;
  const frame = useCurrentFrame();
  const slide = slides[slideIndex];

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

  return (
    <Provider>
      <HydrateAtoms
        values={[
          [userInputtedCodeAtom, slide.code],
          [userInputtedLanguageAtom, language],
          [themeAtom, theme],
          [darkModeAtom, darkMode],
          [paddingAtom, padding || 64],
          [windowWidthAtom, windowWidth],
          [fileNameAtom, slide.title || ""],
          [showBackgroundAtom, true],
        ]}
      >
        <HighlighterLoader>
          <AbsoluteFill style={{ 
            opacity: slideOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
          }}>
            <div style={{ 
              width: windowWidth || 900, 
              maxWidth: "100%",
              transform: "scale(1.4)",
              transformOrigin: "center center"
            }}>
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
            </div>
          </AbsoluteFill>
        </HighlighterLoader>
      </HydrateAtoms>
    </Provider>
  );
};
