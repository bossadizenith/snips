"use client";

import { useEffect } from "react";
import getWasm from "shiki/wasm";
import { highlighterAtom } from "@/store";
import { useAtom, useAtomValue } from "jotai";

import { shikiTheme } from "@/store/themes";

import Frame from "@/components/Frame";
import Controls from "@/components/Controls";
import FrameContextStore from "@/store/FrameContextStore";

import styles from "./code.module.css";
import NoSSR from "@/components/NoSSR";

import { Highlighter, getHighlighterCore } from "shiki";
import { LANGUAGES } from "@/utils/languages";

import tailwindLight from "@/public/assets/tailwind/light.json";
import tailwindDark from "@/public/assets/tailwind/dark.json";
import ExportButton from "@/components/ExportButton";
import { NavigationActions } from "@/components/navigation";
import { InfoDialog } from "@/components/InfoDialog";
import FormatButton from "@/components/FormatCodeButton";
import { Slides } from "@/components/slides";
import { VideoPreview } from "@/components/VideoPreview";
import { showVideoPreviewAtom } from "@/store";

export function Code() {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const showVideo = useAtomValue(showVideoPreviewAtom);

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
            <InfoDialog />
            <FormatButton />
            <ExportButton />
          </NavigationActions>
          <div className="flex-1 overflow-auto relative flex justify-center items-center">
            {highlighter && showVideo ? (
              <VideoPreview />
            ) : (
              <div className={styles.app}>
                <NoSSR>
                  {highlighter && <Frame />}
                  <Controls />
                </NoSSR>
              </div>
            )}
          </div>
        </main>
        <Slides />
      </FrameContextStore>
    </div>
  );
}
