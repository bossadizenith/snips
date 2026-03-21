import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";

import { showBackgroundAtom } from "@/store";
import { paddingAtom } from "@/store/padding";
import { themeDarkModeAtom } from "@/store/themes";

import Editor from "../Editor";
import sharedStyles from "./DefaultFrame.module.css";
import styles from "./NuxtFrame.module.css";
import { FrameProps } from "./types";

const NuxtFrame = ({
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
      <img src="/stars.svg" alt="stars" className={styles.stars} />
      <div className={styles.window}>
        <span data-frameborder />
        <span data-frameborder />
        <span data-frameborder />
        {children || <Editor />}
      </div>
    </div>
  );
};

export default NuxtFrame;
