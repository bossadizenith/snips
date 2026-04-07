import { Language, LANGUAGES } from "@/utils/languages";
import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import "shiki-magic-move/dist/style.css";
import { MagicMove } from "./move";

import {
  animateSlideTransitionAtom,
  highlighterAtom,
  loadingLanguageAtom,
} from "@/store";
import { Theme, themeAtom, themeDarkModeAtom } from "@/store/themes";
import { useAtomValue, useSetAtom } from "jotai";
import styles from "./Editor.module.css";
import { fontMap } from "./Editor";
import { Font } from "@/store/font";

type PropTypes = {
  selectedLanguage: Language | null;
  code: string;
  theme?: Theme;
  darkMode?: boolean;
  font?: Font;
};

const BASE_MAGIC_MOVE_OPTIONS = {
  duration: 1000,
  stagger: 3,
} as const;

const HighlightedCode: React.FC<PropTypes> = ({
  selectedLanguage,
  code,
  theme: propTheme,
  darkMode: propDarkMode,
  font,
}) => {
  const [isLanguageReady, setIsLanguageReady] = useState(false);
  const highlighter = useAtomValue(highlighterAtom);
  const setIsLoadingLanguage = useSetAtom(loadingLanguageAtom);
  const storeDarkMode = useAtomValue(themeDarkModeAtom);
  const storeTheme = useAtomValue(themeAtom);
  const setAnimateSlideTransition = useSetAtom(animateSlideTransitionAtom);

  const containerRef = useRef<HTMLDivElement>(null);
  const magicMoveRef = useRef<MagicMove | null>(null);

  const theme = propTheme ?? storeTheme;
  const darkMode = propDarkMode ?? storeDarkMode;

  const themeName =
    theme.id === "tailwind"
      ? darkMode
        ? "tailwind-dark"
        : "tailwind-light"
      : "css-variables";

  let lang = selectedLanguage?.name.toLowerCase() || "";
  if (lang === "typescript") {
    lang = "tsx";
  }

  const magicMoveOptions = React.useMemo(
    () => ({
      delayContainer: 0.1,
      delayEnter: 0.1,
      delayLeave: 0.1,
      delayMove: 0.1,
      containerStyle: false,
      ...BASE_MAGIC_MOVE_OPTIONS,
      // lineNumbers: showLineNumbers && selectedLanguage !== LANGUAGES.plaintext,
    }),
    [],
  );

  useEffect(() => {
    let isCancelled = false;

    const ensureLanguageLoaded = async () => {
      if (
        !highlighter ||
        !selectedLanguage ||
        selectedLanguage === LANGUAGES.plaintext
      ) {
        setIsLanguageReady(false);
        return;
      }

      setIsLanguageReady(false);

      const loadedLanguages = highlighter.getLoadedLanguages() || [];
      const hasLoadedLanguage = loadedLanguages.includes(
        selectedLanguage.name.toLowerCase(),
      );

      if (!hasLoadedLanguage && selectedLanguage.src) {
        try {
          setIsLoadingLanguage(true);
          await highlighter.loadLanguage(selectedLanguage.src);
        } catch {
          if (!isCancelled) setIsLanguageReady(false);
          return;
        } finally {
          if (!isCancelled) setIsLoadingLanguage(false);
        }
      }

      if (!isCancelled) setIsLanguageReady(true);
    };

    ensureLanguageLoaded();

    return () => {
      isCancelled = true;
    };
  }, [selectedLanguage, highlighter, setIsLoadingLanguage]);

  useEffect(() => {
    if (!containerRef.current || !highlighter || !isLanguageReady) {
      return;
    }

    const onEnd = () => {
      setAnimateSlideTransition(false);
    };

    if (!magicMoveRef.current) {
      magicMoveRef.current = new MagicMove(
        containerRef.current,
        highlighter,
        code,
        {
          lang: lang as any,
          theme: themeName as any,
          ...magicMoveOptions,
          onEnd,
        },
      );
    } else {
      magicMoveRef.current.update(code).then(onEnd);
    }
  }, [
    code,
    highlighter,
    isLanguageReady,
    lang,
    themeName,
    magicMoveOptions,
    setAnimateSlideTransition,
  ]);

  useEffect(() => {
    return () => {
      if (magicMoveRef.current) {
        magicMoveRef.current.destroy();
        magicMoveRef.current = null;
      }
    };
  }, []);

  if (
    !highlighter ||
    !selectedLanguage ||
    selectedLanguage === LANGUAGES.plaintext ||
    !isLanguageReady
  ) {
    return (
      <div className={classNames(styles.formatted, styles.plainText)}>
        <pre>{code}</pre>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        styles.formatted,
        "select-none overflow-hidden",
        font && fontMap[font],
      )}
    >
      <div ref={containerRef} />
    </div>
  );
};

export default HighlightedCode;
