import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";

import { fileNameAtom, showBackgroundAtom } from "@/store";
import { paddingAtom } from "@/store/padding";
import { themeDarkModeAtom } from "@/store/themes";
import mintlifyPatternDark from "@/public/assets/mintlify-pattern-dark.svg?url";
import mintlifyPatternLight from "@/public/assets/mintlify-pattern-light.svg?url";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./MintlifyFrame.module.css";
import { FrameProps } from "./types";

const MintlifyFrame = ({
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
      {showBackground && (
        <span className={styles.patternWrapper}>
          <img
            src={darkMode ? mintlifyPatternDark : mintlifyPatternLight}
            alt=""
            className={styles.pattern}
          />
        </span>
      )}
      <div className={styles.window}>
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
            {fileName.length === 0 ? <span>Untitled-1</span> : null}
          </div>
        </div>
        {children || <Editor />}
      </div>
    </div>
  );
};

export default MintlifyFrame;
