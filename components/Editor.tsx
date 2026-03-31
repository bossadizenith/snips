import useHotkeys from "@/hooks/useHotkeys";
import {
  animateSlideTransitionAtom,
  highlightedLinesAtom,
  presentationModeAtom,
} from "@/store";
import {
  codeAtom,
  isCodeExampleAtom,
  selectedLanguageAtom,
} from "@/store/code";
import { derivedFlashMessageAtom } from "@/store/flash";
import {
  Theme,
  themeAtom,
  themeCSSAtom,
  themeDarkModeAtom,
  themeFontAtom,
  themeLineNumbersAtom,
  THEMES,
  unlockedThemesAtom,
} from "@/store/themes";
import { Language, LANGUAGES } from "@/utils/languages";
import classNames from "classnames";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./Editor.module.css";
import HighlightedCode from "./HighlightedCode";
import { RawHighlightedCode } from "./raw-highlight";

function indentText(text: string) {
  return text
    .split("\n")
    .map((str) => `  ${str}`)
    .join("\n");
}

function dedentText(text: string) {
  return text
    .split("\n")
    .map((str) => str.replace(/^\s\s/, ""))
    .join("\n");
}

function getCurrentlySelectedLine(textarea: HTMLTextAreaElement) {
  const original = textarea.value;

  const selectionStart = textarea.selectionStart;
  const beforeStart = original.slice(0, selectionStart);

  return original
    .slice(
      beforeStart.lastIndexOf("\n") != -1
        ? beforeStart.lastIndexOf("\n") + 1
        : 0,
    )
    .split("\n")[0];
}

function handleTab(textarea: HTMLTextAreaElement, shiftKey: boolean) {
  const original = textarea.value;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const beforeStart = original.slice(0, start);

  const currentLine = getCurrentlySelectedLine(textarea);

  if (start === end) {
    // No text selected
    if (shiftKey) {
      // dedent
      const newStart = beforeStart.lastIndexOf("\n") + 1;
      textarea.setSelectionRange(newStart, end);
      document.execCommand(
        "insertText",
        false,
        dedentText(original.slice(newStart, end)),
      );
    } else {
      // indent
      document.execCommand("insertText", false, "  ");
    }
  } else {
    // Text selected
    const newStart = beforeStart.lastIndexOf("\n") + 1 || 0;
    textarea.setSelectionRange(newStart, end);

    if (shiftKey) {
      // dedent
      const newText = dedentText(original.slice(newStart, end));
      document.execCommand("insertText", false, newText);

      if (currentLine.startsWith("  ")) {
        textarea.setSelectionRange(start - 2, start - 2 + newText.length);
      } else {
        textarea.setSelectionRange(start, start + newText.length);
      }
    } else {
      // indent
      const newText = indentText(original.slice(newStart, end));
      document.execCommand("insertText", false, newText);
      textarea.setSelectionRange(start + 2, start + 2 + newText.length);
    }
  }
}

function handleEnter(textarea: HTMLTextAreaElement) {
  const currentLine = getCurrentlySelectedLine(textarea);

  const currentIndentationMatch = currentLine.match(/^(\s+)/);
  let wantedIndentation = currentIndentationMatch
    ? currentIndentationMatch[0]
    : "";

  if (currentLine.match(/([{\[:>])$/)) {
    wantedIndentation += "  ";
  }

  document.execCommand("insertText", false, `\n${wantedIndentation}`);
}

function handleBracketClose(textarea: HTMLTextAreaElement) {
  const currentLine = getCurrentlySelectedLine(textarea);
  const { selectionStart, selectionEnd } = textarea;

  if (selectionStart === selectionEnd && currentLine.match(/^\s{2,}$/)) {
    textarea.setSelectionRange(selectionStart - 2, selectionEnd);
  }

  document.execCommand("insertText", false, "}");
}

const fontMap = {
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
} as const;

function Editor({
  code: propCode,
  selectedLanguage: propLanguage,
  theme: propTheme,
  darkMode: propDarkMode,
}: {
  code?: string;
  selectedLanguage?: Language | null;
  theme?: Theme;
  darkMode?: boolean;
} = {}) {
  const MAX_LINES = 20;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [storeCode, setCode] = useAtom(codeAtom);
  const [storeLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [themeCSS] = useAtom(themeCSSAtom);
  const [isCodeExample] = useAtom(isCodeExampleAtom);
  const [themeFont] = useAtom(themeFontAtom);
  const [storeTheme, setTheme] = useAtom(themeAtom);
  const [unlockedThemes, setUnlockedThemes] = useAtom(unlockedThemesAtom);
  const setFlashMessage = useSetAtom(derivedFlashMessageAtom);
  const setHighlightedLines = useSetAtom(highlightedLinesAtom);
  const [isHighlightingLines, setIsHighlightingLines] = useState(false);
  const [showLineNumbers] = useAtom(themeLineNumbersAtom);
  const animateSlideTransition = useAtomValue(animateSlideTransitionAtom);
  const storeDarkMode = useAtomValue(themeDarkModeAtom);
  const isPresentationMode = useAtomValue(presentationModeAtom);

  const code = propCode ?? storeCode;
  const selectedLanguage = propLanguage ?? storeLanguage;
  const theme = propTheme ?? storeTheme;
  const darkMode = propDarkMode ?? storeDarkMode;

  const [prevCode, setPrevCode] = useState(code);
  const numberOfLines = (code.match(/\n/g) || []).length;

  useEffect(() => {
    if (!animateSlideTransition) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrevCode(code);
    }
  }, [code, animateSlideTransition]);

  const sizingCode = animateSlideTransition
    ? code.split("\n").length < prevCode.split("\n").length
      ? code
      : prevCode
    : code;

  useHotkeys("f", (event) => {
    event.preventDefault();
    if (isPresentationMode) return;
    textareaRef.current?.focus();
  });

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    (event) => {
      const textarea = textareaRef.current!;
      switch (event.key) {
        case "Tab":
          event.preventDefault();
          handleTab(textarea, event.shiftKey);
          break;
        case "}":
          event?.preventDefault();
          handleBracketClose(textarea);
          break;
        case "Escape":
          event.preventDefault();
          textarea.blur();
          break;
        case "Enter":
          event.preventDefault();
          if (code.split("\n").length >= MAX_LINES) {
            setFlashMessage({
              message: `Maximum ${MAX_LINES} lines allowed`,
              variant: "info",
              timeout: 2000,
            });
            return;
          }
          handleEnter(textarea);
          break;
      }
    },
    [],
  );

  const handleChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
    (event) => {
      const newValue = event.target.value;
      if (newValue.split("\n").length > MAX_LINES) {
        setFlashMessage({
          message: `Maximum ${MAX_LINES} lines allowed`,
          variant: "info",
          timeout: 2000,
        });
        return;
      }

      if (event.target.value.includes("🐰") && theme.id !== THEMES.rabbit.id) {
        if (!unlockedThemes.includes(THEMES.rabbit.id)) {
          setUnlockedThemes([...unlockedThemes, THEMES.rabbit.id]);
        }
        setTheme(THEMES.rabbit);
        try {
          localStorage.setItem("codeTheme", THEMES.rabbit.id);
        } catch (error) {
          console.log("Could not set theme in localStorage", error);
        }
        setFlashMessage({
          message: "Evil Rabbit Theme Unlocked",
          variant: "unlock",
          timeout: 2000,
          icon: React.createElement(THEMES.rabbit.icon || "", {
            style: { color: "black" },
          }),
        });
      }
      setCode(event.target.value);
    },
    [
      setCode,
      setTheme,
      setFlashMessage,
      setUnlockedThemes,
      unlockedThemes,
      theme.id,
    ],
  );

  const handleFocus = useCallback<FocusEventHandler>(() => {
    if (isCodeExample && textareaRef.current) {
      // Safari needs a timeout otherwise the selection flickers
      const textarea = textareaRef.current;
      setTimeout(() => {
        textarea.select();
      }, 1);
    }
  }, [isCodeExample]);

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const lineNumber = (target.closest("[data-line]") as HTMLElement)?.dataset
        ?.line;
      if (lineNumber && isHighlightingLines) {
        setHighlightedLines((prev) => {
          const line = Number(lineNumber);
          if (prev.includes(line)) {
            return prev.filter((l) => l !== line);
          } else {
            return [...prev, line];
          }
        });
      }
    };

    document.addEventListener("click", listener);

    return () => {
      document.removeEventListener("click", listener);
    };
  }, [setHighlightedLines, isHighlightingLines]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        setIsHighlightingLines(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        setIsHighlightingLines(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      className={classNames(
        styles.editor,
        themeFont ? fontMap[themeFont] : styles.jetBrainsMono,
        isHighlightingLines && styles.isHighlightingLines,
        animateSlideTransition && styles.isAnimating,
        showLineNumbers &&
          selectedLanguage !== LANGUAGES.plaintext && [
            styles.showLineNumbers,
            numberOfLines > 8 && styles.showLineNumbersLarge,
          ],
      )}
      style={{ "--editor-padding": "16px", ...themeCSS } as React.CSSProperties}
      data-value={sizingCode}
    >
      {!isPresentationMode && (
        <textarea
          rows={1}
          tabIndex={-1}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          autoCapitalize="off"
          ref={textareaRef}
          className={styles.textarea}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          data-enable-grammarly="false"
        />
      )}
      {isPresentationMode ? (
        <HighlightedCode
          code={code}
          selectedLanguage={selectedLanguage}
          theme={theme}
          darkMode={darkMode}
        />
      ) : (
        <RawHighlightedCode
          code={code}
          selectedLanguage={selectedLanguage}
          // theme={theme}
          // darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default Editor;
