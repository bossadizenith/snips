import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";

import { fileNameAtom, showBackgroundAtom } from "@/store";
import { flashShownAtom } from "@/store/flash";
import { paddingAtom } from "@/store/padding";
import { themeDarkModeAtom } from "@/store/themes";
import useIsSafari from "@/hooks/useIsSafari";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./GeminiFrame.module.css";
import { FrameProps } from "./types";

const GeminiFrame = ({
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
  const isSafari = useIsSafari();
  const flashShown = useAtomValue(flashShownAtom);

  const darkMode = propDarkMode ?? atomDarkMode;
  const padding = propPadding ?? atomPadding;
  const showBackground = propShowBackground ?? atomShowBackground;
  const fileName = propFileName ?? atomFileName;

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        styles.frame,
        !darkMode && styles.frameLightMode,
        !showBackground && sharedStyles.noBackground,
        !showBackground && styles.noBackground,
        isSafari && styles.isSafari,
      )}
      style={{ padding }}
    >
      {!showBackground && (
        <div
          data-ignore-in-export
          className={sharedStyles.transparentPattern}
        ></div>
      )}
      {showBackground && (
        <img src="/stars.svg" alt="stars" className={styles.stars} />
      )}
      <div className={styles.window}>
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
          </div>
        )}

        <div>{children || <Editor />}</div>
      </div>
    </div>
  );
};

export default GeminiFrame;
