import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";

import { fileNameAtom, showBackgroundAtom } from "@/store";
import { selectedLanguageAtom } from "@/store/code";
import { flashShownAtom } from "@/store/flash";
import { paddingAtom } from "@/store/padding";
import { themeDarkModeAtom } from "@/store/themes";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./CloudflareFrame.module.css";
import { FrameProps } from "./types";

const CloudflareFrame = ({
  children,
  padding: propPadding,
  showBackground: propShowBackground,
  fileName: propFileName,
  darkMode: propDarkMode,
}: FrameProps) => {
  const atomDarkMode = useAtomValue(themeDarkModeAtom);
  const [atomPadding] = useAtom(paddingAtom);
  const [atomShowBackground] = useAtom(showBackgroundAtom);
  const [atomFileName, setFileName] = useAtom(fileNameAtom);
  const [selectedLanguage] = useAtom(selectedLanguageAtom);
  const flashShown = useAtomValue(flashShownAtom);

  const darkMode = propDarkMode ?? atomDarkMode;
  const padding = propPadding ?? atomPadding;
  const showBackground = propShowBackground ?? atomShowBackground;
  const fileName = propFileName ?? atomFileName;

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        showBackground && styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
      )}
      style={{ padding }}
    >
      {!showBackground && (
        <div
          data-ignore-in-export
          className={sharedStyles.transparentPattern}
        ></div>
      )}
      <div className={styles.window}>
        <span className={styles.gridlinesHorizontal} data-grid></span>
        <span className={styles.gridlinesVertical} data-grid></span>
        {fileName.length > 0 ? (
          <div className={styles.header}>
            <div
              className={classNames(sharedStyles.fileName, styles.fileName)}
              data-value={fileName}
            >
              <input
                type="text"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                spellCheck={false}
                tabIndex={-1}
                size={1}
              />
            </div>
            <span className={styles.language}>{selectedLanguage?.name}</span>
          </div>
        ) : flashShown ? null : (
          <div className={styles.header} data-ignore-in-export>
            <div
              className={classNames(sharedStyles.fileName, styles.fileName)}
              data-value={fileName}
            >
              <input
                type="text"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                spellCheck={false}
                tabIndex={-1}
                size={1}
              />
              <span>Untitled-1</span>
            </div>
            <span className={styles.language}>{selectedLanguage?.name}</span>
          </div>
        )}
        {children || <Editor />}
      </div>
    </div>
  );
};

export default CloudflareFrame;
