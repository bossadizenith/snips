import { Theme, shikiTheme } from "@/store/themes";
import React, { useEffect } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  delayRender,
  continueRender,
} from "remotion";
import ThemeFrame from "./ThemeFrame";
import { CodeCompositionProps, Slide } from "./types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { animateSlideTransitionAtom, highlighterAtom } from "@/store";
import { Language, LANGUAGES } from "@/utils/languages";
import { getHighlighterCore } from "shiki";
import getWasm from "shiki/wasm";
import tailwindLight from "@/public/assets/tailwind/light.json";
import tailwindDark from "@/public/assets/tailwind/dark.json";
import classNames from "classnames";
import styles from "../Editor.module.css";
import { ShikiMagicMove } from "shiki-magic-move/react";
import { StaticCode } from "./StaticCode";

interface VideoSlideRenderProps extends CodeCompositionProps {}

const SLIDE_DURATION = 90;

const FONT_CLASS_MAP: Record<string, string> = {
  "jetbrains-mono": styles.jetBrainsMono,
  "geist-mono": styles.geistMono,
  "ibm-plex-mono": styles.ibmPlexMono,
  "fira-code": styles.firaCode,
  "soehne-mono": styles.soehneMono,
  "roboto-mono": styles.robotoMono,
  "commit-mono": styles.commitMono,
  "space-mono": styles.spaceMono,
  "source-code-pro": styles.sourceCodePro,
  "google-sans-code": styles.googleSansCode,
};

const MAGIC_MOVE_OPTIONS = {
  duration: 1000,
  stagger: 0,
  lineNumbers: false,
  delayContainer: 0,
  delayEnter: 0,
  delayLeave: 0,
  delayMove: 0,
} as const;

const isPlainTextLanguage = (language: Language | null): boolean => {
  if (!language?.name) {
    return true;
  }

  return language.name.toLowerCase() === LANGUAGES.plaintext.name.toLowerCase();
};

const resolveLanguageLoader = (language: Language | null): Language | null => {
  if (!language?.name) {
    return null;
  }

  const targetName = language.name.toLowerCase();
  return (
    Object.values(LANGUAGES).find(
      (entry) => entry.name.toLowerCase() === targetName,
    ) ?? null
  );
};

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
  language,
}: {
  children: React.ReactNode;
  language: Language | null;
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

        if (language && currentHighlighter && !isPlainTextLanguage(language)) {
          const loadedLangs = currentHighlighter.getLoadedLanguages();
          const languageName =
            language.name.toLowerCase() === "typescript"
              ? "tsx"
              : language.name.toLowerCase();

          if (!loadedLangs.includes(languageName)) {
            const languageLoader = resolveLanguageLoader(language);
            if (languageLoader?.src) {
              await currentHighlighter.loadLanguage(await languageLoader.src());
            }
          }
        }
        setInitialized(true);
      } catch (err) {
        console.error("Failed to load highlighter or language:", err);
        // Render plain text fallback instead of showing a blank editor.
        setInitialized(true);
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
  const { slides, theme, darkMode, padding, language } = props;
  const [highlighter] = useAtom(highlighterAtom);
  const animateSlideTransition = useAtomValue(animateSlideTransitionAtom);
  const setAnimateSlideTransition = useSetAtom(animateSlideTransitionAtom);
  const frame = useCurrentFrame();
  const slideIndex = Math.min(
    Math.floor(frame / SLIDE_DURATION),
    Math.max(slides.length - 1, 0),
  );
  const slide = slides[slideIndex] as Slide;
  const [prevCode, setPrevCode] = React.useState(slide?.code || "");

  useEffect(() => {
    if (animateSlideTransition) {
      return;
    }
    setPrevCode(slide?.code || "");
  }, [slide?.code, animateSlideTransition]);

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

  const themeName =
    theme.id === "tailwind"
      ? isDark
        ? "tailwind-dark"
        : "tailwind-light"
      : "css-variables";

  let languageName = language?.name?.toLowerCase() ?? "plaintext";
  if (languageName === "typescript") {
    languageName = "tsx";
  }

  const usePlainText =
    !highlighter ||
    !language ||
    isPlainTextLanguage(language) ||
    languageName === "plaintext";

  const themeSyntax =
    (isDark ? theme.syntax?.dark : theme.syntax?.light) ||
    theme.syntax?.light ||
    theme.syntax?.dark ||
    {};
  const themeFont = theme.font || "jetbrains-mono";
  const fontClass = FONT_CLASS_MAP[themeFont] || styles.jetBrainsMono;
  const showLineNumbers = !!theme.lineNumbers;

  const renderCodeBlock = (currentSlide: Slide) => {
    const code = currentSlide.code || "";
    const sizingCode =
      animateSlideTransition &&
      code.split("\n").length < prevCode.split("\n").length
        ? prevCode
        : code;

    return (
      <div
        className={classNames(
          styles.editor,
          fontClass,
          showLineNumbers && styles.showLineNumbers,
          showLineNumbers &&
            code.split("\n").length > 8 &&
            styles.showLineNumbersLarge,
        )}
        style={
          {
            "--editor-padding": "30px",
            "--editor-font-size": "32px",
            "--editor-line-height": "50px",
          } as React.CSSProperties
        }
        data-value={sizingCode}
      >
        {usePlainText ? (
          <div
            className={classNames(styles.formatted, styles.plainText)}
            style={themeSyntax as React.CSSProperties}
          >
            {Array.isArray(currentSlide.tokens) ? (
              <StaticCode tokens={currentSlide.tokens} />
            ) : (
              <pre>{code}</pre>
            )}
          </div>
        ) : (
          <div
            className={styles.formatted}
            style={themeSyntax as React.CSSProperties}
          >
            <ShikiMagicMove
              highlighter={highlighter}
              lang={languageName}
              theme={themeName}
              code={code}
              options={MAGIC_MOVE_OPTIONS}
              onEnd={() => {
                setAnimateSlideTransition(false);
                setPrevCode(code);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderThemeFrame = (currentSlide: Slide) => (
    <ThemeFrame
      theme={theme}
      darkMode={isDark}
      padding={padding || 64}
      showBackground={true}
      themeBackground={themeBackground}
      fileName={currentSlide.title || ""}
      code={currentSlide.code}
      language={language}
    >
      {renderCodeBlock(currentSlide)}
    </ThemeFrame>
  );

  const renderContent = () => {
    return (
      <HighlighterLoader language={language}>
        {renderThemeFrame(slide)}
      </HighlighterLoader>
    );
  };

  return (
    <AbsoluteFill
      style={{
        opacity: slideOpacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          padding: 20,
          height: "100%",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {renderContent()}
      </div>
    </AbsoluteFill>
  );
};
