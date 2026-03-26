"use client";

import { highlighterAtom } from "@/store";
import { useAtom } from "jotai";
import { useEffect } from "react";
import getWasm from "shiki/wasm";

import { shikiTheme } from "@/store/themes";

import Controls from "@/components/Controls";
import Frame from "@/components/Frame";
import FrameContextStore from "@/store/FrameContextStore";

import NoSSR from "@/components/NoSSR";
import styles from "./code.module.css";

import { LANGUAGES } from "@/utils/languages";
import { Highlighter, getHighlighterCore } from "shiki";

import ExportButton from "@/components/ExportButton";
import FormatButton from "@/components/FormatCodeButton";
import { NavigationActions } from "@/components/navigation";
import { Slides } from "@/components/slides";
import tailwindDark from "@/public/assets/tailwind/dark.json";
import tailwindLight from "@/public/assets/tailwind/light.json";

export function Code() {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);

  useEffect(() => {
    getHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [
        LANGUAGES.javascript.src(),
        LANGUAGES.tsx.src(),
        LANGUAGES.swift.src(),
        LANGUAGES.python.src(),
      ],
      loadWasm: getWasm,
    }).then((highlighter) => {
      setHighlighter(highlighter as Highlighter);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen w-screen overflow-hidden translate-z-0">
      <FrameContextStore>
        <main className="flex-1 flex flex-col min-w-0 relative">
          <NavigationActions>
            <FormatButton />
            <ExportButton />
          </NavigationActions>
          <div className="flex-1 overflow-auto relative flex justify-center items-center">
            <div className={styles.app}>
              <NoSSR>
                {highlighter && <Frame />}
                <Controls />
              </NoSSR>
            </div>
          </div>
        </main>
        <Slides />
      </FrameContextStore>
    </div>
  );
}
