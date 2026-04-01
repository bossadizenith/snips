import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";

import { fileNameAtom, showBackgroundAtom } from "@/store";
import { paddingAtom } from "@/store/padding";
import {
  themeAtom,
  themeBackgroundAtom,
  themeDarkModeAtom,
} from "@/store/themes";
import useIsSafari from "@/hooks/useIsSafari";
import Editor from "../Editor";
import styles from "./DefaultFrame.module.css";
import { FrameProps } from "./types";

const DefaultFrame = ({
  children,
  padding: propPadding,
  showBackground: propShowBackground,
  fileName: propFileName,
  themeBackground: propThemeBackground,
  theme: propTheme,
  darkMode: propDarkMode,
  code: propCode,
  language: propLanguage,
}: FrameProps) => {
  const [atomPadding] = useAtom(paddingAtom);
  const isSafari = useIsSafari();
  const [atomShowBackground] = useAtom(showBackgroundAtom);
  const [atomFileName, setFileName] = useAtom(fileNameAtom);
  const [atomThemeBackground] = useAtom(themeBackgroundAtom);
  const [atomTheme] = useAtom(themeAtom);
  const atomDarkMode = useAtomValue(themeDarkModeAtom);

  const padding = propPadding ?? atomPadding;
  const showBackground = propShowBackground ?? atomShowBackground;
  const fileName = propFileName ?? atomFileName;
  const themeBackground = propThemeBackground ?? atomThemeBackground;
  const theme = propTheme ?? atomTheme;
  const darkMode = propDarkMode ?? atomDarkMode;

  return (
    <div
      className={classNames(
        styles.frame,
        styles[theme.id],
        darkMode && styles.darkMode,
        showBackground && styles.withBackground,
      )}
      style={{
        padding,
        backgroundImage: showBackground ? themeBackground : "",
      }}
    >
      {!showBackground && (
        <div data-ignore-in-export className={styles.transparentPattern}></div>
      )}
      <div
        className={classNames(styles.window, {
          [styles.withBorder]: !isSafari,
          [styles.withShadow]: !isSafari && showBackground,
        })}
      >
        <div className={styles.header}>
          <div className={styles.controls}>
            <div className={styles.control}></div>
            <div className={styles.control}></div>
            <div className={styles.control}></div>
          </div>
          <div className={styles.fileName}>
            <input
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              spellCheck={false}
              tabIndex={-1}
            />
            {fileName.length === 0 ? (
              <span data-ignore-in-export>Untitled-1</span>
            ) : null}
          </div>
        </div>
        {children || (
          <Editor
            code={propCode}
            selectedLanguage={propLanguage}
            theme={theme}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

export default DefaultFrame;
