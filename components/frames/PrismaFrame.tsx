import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";

import { fileNameAtom, showBackgroundAtom } from "@/store";
import { flashShownAtom } from "@/store/flash";
import { paddingAtom } from "@/store/padding";
import { themeDarkModeAtom } from "@/store/themes";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./PrismaFrame.module.css";
import { FrameProps } from "./types";

const PrismaFrame = ({
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
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
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
        {children || <Editor />}
      </div>
    </div>
  );
};

export default PrismaFrame;
