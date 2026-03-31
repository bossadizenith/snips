import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Language, LANGUAGES } from "@/utils/languages";
import { ShikiMagicMove } from "shiki-magic-move/react";

import styles from "./Editor.module.css";
import {
  animateSlideTransitionAtom,
  highlightedLinesAtom,
  highlighterAtom,
  loadingLanguageAtom,
} from "@/store";
import { useAtomValue, useSetAtom } from "jotai";
import {
  themeDarkModeAtom,
  themeAtom,
  Theme,
  // themeLineNumbersAtom,
} from "@/store/themes";
import { cn } from "@/lib/utils";

type PropTypes = {
  selectedLanguage: Language | null;
  code: string;
  theme?: Theme;
  darkMode?: boolean;
};

const BASE_MAGIC_MOVE_OPTIONS = {
  duration: 1000,
  stagger: 0,
} as const;

const HighlightedCode: React.FC<PropTypes> = ({
  selectedLanguage,
  code,
  theme: propTheme,
  darkMode: propDarkMode,
}) => {
  const [isLanguageReady, setIsLanguageReady] = useState(false);
  const [prevCode, setPrevCode] = useState(code);
  const highlighter = useAtomValue(highlighterAtom);
  const setIsLoadingLanguage = useSetAtom(loadingLanguageAtom);
  const highlightedLines = useAtomValue(highlightedLinesAtom);
  const storeDarkMode = useAtomValue(themeDarkModeAtom);
  const storeTheme = useAtomValue(themeAtom);
  const animateSlideTransition = useAtomValue(animateSlideTransitionAtom);
  const setAnimateSlideTransition = useSetAtom(animateSlideTransitionAtom);
  // const showLineNumbers = useAtomValue(themeLineNumbersAtom);

  const theme = propTheme ?? storeTheme;
  const darkMode = propDarkMode ?? storeDarkMode;

  const themeName =
    theme.id === "tailwind"
      ? darkMode
        ? "tailwind-dark"
        : "tailwind-light"
      : "css-variables";

  React.useEffect(() => {
    if (animateSlideTransition) {
      return;
    }
    setPrevCode(code);
  }, [code, animateSlideTransition]);

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

  let lang = selectedLanguage.name.toLowerCase();
  if (lang === "typescript") {
    lang = "tsx";
  }

  const sizingCode = animateSlideTransition
    ? code.split("\n").length < prevCode.split("\n").length
      ? code
      : prevCode
    : code;

  const magicMoveOptions = {
    delayContainer: 0.1,
    delayEnter: 0.1,
    delayLeave: 0.1,
    delayMove: 0.1,
    ...BASE_MAGIC_MOVE_OPTIONS,
    // lineNumbers: showLineNumbers && selectedLanguage !== LANGUAGES.plaintext,
  };

  return (
    <div
      className={classNames(
        styles.formatted,
        "select-none overflow-hidden",
        highlightedLines.length > 0 && styles.hasHighlightedLines,
      )}
      data-value={sizingCode}
    >
      <ShikiMagicMove
        highlighter={highlighter}
        lang={lang}
        theme={themeName}
        code={code}
        options={magicMoveOptions}
        className={cn(styles.magicMove, "min-w-150!")}
        onEnd={() => {
          setAnimateSlideTransition(false);
          setPrevCode(code);
        }}
      />
    </div>
  );
};

export default HighlightedCode;
