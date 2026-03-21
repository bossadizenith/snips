import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";

import { showBackgroundAtom } from "@/store";
import { paddingAtom } from "@/store/padding";
import { themeDarkModeAtom } from "@/store/themes";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./VercelFrame.module.css";
import { FrameProps } from "./types";

const VercelFrame = ({
  children,
  padding: propPadding,
  showBackground: propShowBackground,
  darkMode: propDarkMode,
}: FrameProps) => {
  const atomDarkMode = useAtomValue(themeDarkModeAtom);
  const [atomPadding] = useAtom(paddingAtom);
  const [atomShowBackground] = useAtom(showBackgroundAtom);

  const darkMode = propDarkMode ?? atomDarkMode;
  const padding = propPadding ?? atomPadding;
  const showBackground = propShowBackground ?? atomShowBackground;

  return (
    <div
      className={classNames(
        sharedStyles.frame,
        showBackground && styles.frame,
        showBackground && !darkMode && styles.frameLightMode,
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
        <span className={styles.bracketLeft} data-grid></span>
        <span className={styles.bracketRight} data-grid></span>
        {children || <Editor />}
      </div>
    </div>
  );
};

export default VercelFrame;
